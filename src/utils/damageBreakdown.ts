/**
 * Damage Breakdown Utility
 * Calculates and displays detailed damage information including base damage, runes, buffs, and conditional damage
 */

import { Character, EquippedItem, WeaponRunes, WeaponCustomization, Buff } from '../types';
import { LoadedWeapon } from '../data/pf2e-loader';
import { getAbilityModifier, ProficiencyRank, calculateProficiencyBonusWithVariant } from './pf2e-math';
import { calculateActiveModifiers, ModifierBreakdown } from './conditionModifiers';
import { PROPERTY_RUNES } from '../data/weaponRunes';

export interface DamageComponent {
    label: string;
    labelIt?: string;
    value: string;  // e.g., "1d8", "+3", "2d6 fire"
    type: 'base' | 'rune-striking' | 'rune-property' | 'ability' | 'buff' | 'conditional';
    damageType?: string;  // physical, fire, cold, etc.
    conditionalId?: string;  // ID for conditional damage (for toggle state)
    isActive?: boolean;  // For conditional damage
    source?: string;  // Source of the damage (e.g., "Rage", "Flaming Rune")
}

export interface DamageBreakdown {
    base: DamageComponent[];  // Base weapon damage
    runes: DamageComponent[];  // Extra damage from runes (striking, property)
    modifier: DamageComponent[];  // Static modifiers (STR, custom bonuses)
    buffs: DamageComponent[];  // Active buffs (rage, etc.)
    conditional: DamageComponent[];  // Conditional damage (vs specific creatures)
    total: string;  // Total damage formula
}

/**
 * Parse damage dice formula (e.g., "2d6+3" -> {count: 2, size: 6, modifier: 3})
 */
export function parseDamageFormula(formula: string): { count: number; size: number; modifier: number } | null {
    // Match patterns like "2d6+3", "1d8", "3d10-2"
    const match = formula.match(/^(\d+)d(\d+)([+-]\d+)?$/);
    if (!match) return null;

    return {
        count: parseInt(match[1]),
        size: parseInt(match[2]),
        modifier: match[3] ? parseInt(match[3]) : 0,
    };
}

/**
 * Calculate detailed damage breakdown for a weapon
 */
export function calculateDamageBreakdown(
    character: Character,
    weapon: LoadedWeapon,
    isTwoHanded: boolean = false,
    equippedItem?: EquippedItem,
    activeConditionalDamage: string[] = []
): DamageBreakdown {
    const strMod = getAbilityModifier(character.abilityScores.str);
    const dexMod = getAbilityModifier(character.abilityScores.dex);

    // Parse base damage
    const baseDamageMatch = weapon.damage.match(/^(\d+)d(\d+)$/);
    if (!baseDamageMatch) {
        return {
            base: [],
            runes: [],
            modifier: [],
            buffs: [],
            conditional: [],
            total: weapon.damage,
        };
    }

    let baseDiceCount = parseInt(baseDamageMatch[1]);
    let baseDieSize = parseInt(baseDamageMatch[2]);
    const weaponDamageType = weapon.damageType;

    // Handle Two-Hand trait
    let actualDieSize = baseDieSize;
    const twoHandTrait = weapon.traits.find(t => t.startsWith('two-hand-d'));
    if (isTwoHanded && twoHandTrait) {
        const twoHandDieMatch = twoHandTrait.match(/two-hand-d(\d+)/);
        if (twoHandDieMatch) {
            actualDieSize = parseInt(twoHandDieMatch[1]);
        }
    }

    const base: DamageComponent[] = [];
    const runes: DamageComponent[] = [];
    const modifier: DamageComponent[] = [];
    const buffs: DamageComponent[] = [];
    const conditional: DamageComponent[] = [];

    // ===== BASE DAMAGE =====
    base.push({
        label: 'Base Weapon',
        labelIt: 'Danno Base',
        value: `${baseDiceCount}d${actualDieSize}`,
        type: 'base',
        damageType: weaponDamageType,
    });

    // ===== STRIKING RUNE =====
    const weaponRunes = equippedItem?.runes as WeaponRunes | undefined;
    let strikingBonus = 0;

    if (character.variantRules?.automaticBonusProgression) {
        // ABP: Use striking bonus from level
        const abpStriking = Math.floor((character.level || 1) / 6); // Rough approximation
        strikingBonus = Math.min(abpStriking, 3);
    } else {
        const strikingRune = weaponRunes?.strikingRune;
        if (strikingRune === 'striking') strikingBonus = 1;
        else if (strikingRune === 'greaterStriking') strikingBonus = 2;
        else if (strikingRune === 'majorStriking') strikingBonus = 3;
    }

    if (strikingBonus > 0) {
        runes.push({
            label: 'Striking Rune',
            labelIt: 'Runa Colpitore',
            value: `+${strikingBonus}d${actualDieSize}`,
            type: 'rune-striking',
            damageType: weaponDamageType,
            source: strikingBonus === 1 ? 'Striking' : strikingBonus === 2 ? 'Greater Striking' : 'Major Striking',
        });
        baseDiceCount += strikingBonus;
    }

    // ===== PROPERTY RUNES (elemental damage) =====
    const propertyRuneIds = weaponRunes?.propertyRunes || [];
    for (const runeId of propertyRuneIds) {
        const runeData = PROPERTY_RUNES[runeId];
        if (runeData?.damage) {
            const isActive = activeConditionalDamage.includes(runeId);
            runes.push({
                label: runeData.name,
                labelIt: runeData.nameIt,
                value: runeData.damage.dice,
                type: 'rune-property',
                damageType: runeData.damage.type,
                conditionalId: runeId,
                isActive,
                source: runeData.name,
            });
        }
    }

    // ===== ABILITY MODIFIER =====
    const isRanged = weapon.range !== null && weapon.range > 0;
    const hasThrown = weapon.traits.includes('Thrown');
    const hasPropulsive = weapon.traits.includes('Propulsive');

    let abilityMod = 0;
    if (isRanged && !hasThrown) {
        abilityMod = 0;
        if (hasPropulsive) {
            abilityMod = Math.floor(strMod / 2);
            if (abilityMod !== 0) {
                modifier.push({
                    label: 'Propulsive (Half STR)',
                    labelIt: 'Propulsivo (Mezza FOR)',
                    value: abilityMod > 0 ? `+${abilityMod}` : `${abilityMod}`,
                    type: 'ability',
                    damageType: weaponDamageType,
                });
            }
        }
    } else {
        abilityMod = strMod;
        if (abilityMod !== 0) {
            modifier.push({
                label: 'Strength',
                labelIt: 'Forza',
                value: abilityMod > 0 ? `+${abilityMod}` : `${abilityMod}`,
                type: 'ability',
                damageType: weaponDamageType,
            });
        }
    }

    // ===== CUSTOM DAMAGE BONUS =====
    const weaponCustomization = equippedItem?.customization as WeaponCustomization | undefined;
    const customDamageBonus = weaponCustomization?.bonusDamage || 0;
    if (customDamageBonus !== 0) {
        modifier.push({
            label: 'Custom Bonus',
            labelIt: 'Bonus Personalizzato',
            value: customDamageBonus > 0 ? `+${customDamageBonus}` : `${customDamageBonus}`,
            type: 'buff',
            damageType: weaponCustomization?.customDamageType || weaponDamageType,
        });
    }

    // ===== BUFFS (e.g., Rage) =====
    const activeModifiers = calculateActiveModifiers(
        character.conditions || [],
        character.buffs || [],
        character.skills || []
    );

    const damageBuffs = activeModifiers.damage;
    if (damageBuffs.total !== 0) {
        // Break down by type
        if (damageBuffs.status !== 0) {
            buffs.push({
                label: 'Status Bonus',
                labelIt: 'Bonus di Stato',
                value: damageBuffs.status > 0 ? `+${damageBuffs.status}` : `${damageBuffs.status}`,
                type: 'buff',
                damageType: weaponDamageType,
            });
        }
        if (damageBuffs.circumstance !== 0) {
            buffs.push({
                label: 'Circumstance Bonus',
                labelIt: 'Bonus di Circostanza',
                value: damageBuffs.circumstance > 0 ? `+${damageBuffs.circumstance}` : `${damageBuffs.circumstance}`,
                type: 'buff',
                damageType: weaponDamageType,
            });
        }
        if (damageBuffs.item !== 0) {
            buffs.push({
                label: 'Item Bonus',
                labelIt: 'Bonus di Oggetto',
                value: damageBuffs.item > 0 ? `+${damageBuffs.item}` : `${damageBuffs.item}`,
                type: 'buff',
                damageType: weaponDamageType,
            });
        }
    }

    // ===== CONDITIONAL DAMAGE (vs specific creatures) =====
    // Add property runes that are conditional (holy vs unholy, etc.)
    for (const runeId of propertyRuneIds) {
        const runeData = PROPERTY_RUNES[runeId];
        if (runeData?.damage && isConditionalDamage(runeData.damage.type)) {
            const isActive = activeConditionalDamage.includes(runeId);
            conditional.push({
                label: `${runeData.name} (${getConditionLabel(runeData.damage.type)})`,
                labelIt: `${runeData.nameIt || runeData.name} (${getConditionLabelIt(runeData.damage.type)})`,
                value: runeData.damage.dice,
                type: 'conditional',
                damageType: runeData.damage.type,
                conditionalId: runeId,
                isActive,
                source: runeData.name,
            });
        }
    }

    // Calculate total damage formula
    const totalModifier = abilityMod + customDamageBonus + damageBuffs.total;
    const totalDice = `${baseDiceCount}d${actualDieSize}`;
    const total = totalModifier > 0
        ? `${totalDice} + ${totalModifier}`
        : totalModifier < 0
        ? `${totalDice} - ${Math.abs(totalModifier)}`
        : totalDice;

    return {
        base,
        runes,
        modifier,
        buffs,
        conditional,
        total,
    };
}

/**
 * Check if damage type is conditional (vs specific creatures)
 */
function isConditionalDamage(damageType: string): boolean {
    return ['holy', 'unholy', 'chaotic', 'lawful', 'good', 'evil', 'axiomatic', 'anarchic'].includes(
        damageType.toLowerCase()
    );
}

/**
 * Get condition label for conditional damage
 */
function getConditionLabel(damageType: string): string {
    const labels: Record<string, string> = {
        'holy': 'vs unholy',
        'unholy': 'vs holy',
        'chaotic': 'vs lawful',
        'lawful': 'vs chaotic',
        'axiomatic': 'vs chaotic',
        'anarchic': 'vs lawful',
    };
    return labels[damageType.toLowerCase()] || 'conditional';
}

/**
 * Get Italian condition label for conditional damage
 */
function getConditionLabelIt(damageType: string): string {
    const labels: Record<string, string> = {
        'holy': 'vs non santo',
        'unholy': 'vs santo',
        'chaotic': 'vs legale',
        'lawful': 'vs caotico',
        'axiomatic': 'vs caotico',
        'anarchic': 'vs legale',
    };
    return labels[damageType.toLowerCase()] || 'condizionale';
}

/**
 * Calculate total damage including active conditional damage
 */
export function calculateTotalDamageWithConditional(
    breakdown: DamageBreakdown
): string {
    const parts: string[] = [];

    // Collect all active damage components
    const allComponents = [
        ...breakdown.base,
        ...breakdown.runes.filter(r => r.isActive !== false),
        ...breakdown.modifier,
        ...breakdown.buffs,
        ...breakdown.conditional.filter(c => c.isActive),
    ];

    // Group by damage type
    const byType: Record<string, { dice: string[]; modifier: number }> = {};

    for (const comp of allComponents) {
        const type = comp.damageType || 'physical';
        if (!byType[type]) {
            byType[type] = { dice: [], modifier: 0 };
        }

        const parsed = parseDamageFormula(comp.value);
        if (parsed) {
            byType[type].dice.push(`${parsed.count}d${parsed.size}`);
            byType[type].modifier += parsed.modifier;
        } else if (comp.value.startsWith('+') || comp.value.startsWith('-')) {
            byType[type].modifier += parseInt(comp.value);
        }
    }

    // Build formula strings
    for (const [type, data] of Object.entries(byType)) {
        if (data.dice.length > 0) {
            const totalDice = data.dice.join(' + ');
            const formula = data.modifier > 0
                ? `${totalDice} + ${data.modifier}`
                : data.modifier < 0
                ? `${totalDice} - ${Math.abs(data.modifier)}`
                : totalDice;
            parts.push(type !== 'physical' ? `${formula} ${type}` : formula);
        }
    }

    return parts.length > 0 ? parts.join(' + ') : breakdown.total;
}

/**
 * Check if weapon has property runes with elemental damage
 */
export function hasElementalRunes(runes?: WeaponRunes): boolean {
    if (!runes?.propertyRunes) return false;
    return runes.propertyRunes.some(runeId => {
        const rune = PROPERTY_RUNES[runeId];
        return rune?.damage && ['fire', 'cold', 'acid', 'electricity', 'sonic', 'force', 'positive', 'negative'].includes(rune.damage.type);
    });
}

/**
 * Check if weapon has conditional damage (vs specific creatures)
 */
export function hasConditionalDamage(runes?: WeaponRunes): boolean {
    if (!runes?.propertyRunes) return false;
    return runes.propertyRunes.some(runeId => {
        const rune = PROPERTY_RUNES[runeId];
        return rune?.damage && isConditionalDamage(rune.damage.type);
    });
}
