/**
 * Condition Modifiers & Buffs Utility
 * Calculates penalties from active conditions and bonuses from buffs
 * Implements PF2e stacking rules: same-type bonuses don't stack (only highest applies)
 */

import { getConditions } from '../data/pf2e-loader';
import { AbilityName, BonusType, BonusSelector } from '../types';

export interface ConditionPenalties {
    all: number;           // Frightened, Sickened - applies to everything
    dexBased: number;      // Clumsy - AC, Reflex, DEX skills
    strBased: number;      // Enfeebled - STR skills, melee damage
    conBased: number;      // Constitution-based
    intBased: number;      // Stupefied - INT skills, spell DC
    wisBased: number;      // Wisdom-based
    chaBased: number;      // Charisma-based
    attack: number;        // Attack rolls only
    ac: number;            // AC only
    savingThrow: number;   // Saves only
    perception: number;    // Perception only
    speed: number;         // Speed only
}

const EMPTY_PENALTIES: ConditionPenalties = {
    all: 0,
    dexBased: 0,
    strBased: 0,
    conBased: 0,
    intBased: 0,
    wisBased: 0,
    chaBased: 0,
    attack: 0,
    ac: 0,
    savingThrow: 0,
    perception: 0,
    speed: 0,
};

export interface ModifierBreakdown {
    total: number;
    status: number;
    circumstance: number;
    item: number;
    penalty: number;      // From buffs with type 'penalty'
    condition: number;    // From actual conditions
}

export interface ActiveModifiers {
    ac: ModifierBreakdown;
    fortitude: ModifierBreakdown;
    reflex: ModifierBreakdown;
    will: ModifierBreakdown;
    perception: ModifierBreakdown;
    attack: ModifierBreakdown;
    damage: ModifierBreakdown;
    speed: ModifierBreakdown;
    skills: { [skillName: string]: ModifierBreakdown };
    abilities: { [ability in AbilityName]: ModifierBreakdown };
}

/**
 * Create an empty modifier breakdown
 */
function _emptyModifier(): ModifierBreakdown {
    return { total: 0, status: 0, circumstance: 0, item: 0, penalty: 0, condition: 0 };
}

/**
 * Calculate all penalties from active conditions
 */
export function calculateConditionPenalties(
    activeConditions: { id: string; value?: number }[]
): ConditionPenalties {
    if (!activeConditions || activeConditions.length === 0) {
        return { ...EMPTY_PENALTIES };
    }

    const allConditions = getConditions();
    const penalties = { ...EMPTY_PENALTIES };

    for (const active of activeConditions) {
        const conditionData = allConditions.find(c => c.id === active.id);
        if (!conditionData) continue;

        // Get the effective value for this condition
        const conditionValue = active.value ?? conditionData.value ?? 1;

        for (const rule of conditionData.rules) {
            // Calculate the actual penalty value
            // If rule.value is -1, it's a formula using the condition value
            const penaltyValue = rule.value === -1 ? -conditionValue : rule.value;

            // Apply to the appropriate category
            switch (rule.selector) {
                case 'all':
                    penalties.all = Math.min(penalties.all, penaltyValue);
                    break;
                case 'dex-based':
                    penalties.dexBased = Math.min(penalties.dexBased, penaltyValue);
                    break;
                case 'str-based':
                    penalties.strBased = Math.min(penalties.strBased, penaltyValue);
                    break;
                case 'con-based':
                    penalties.conBased = Math.min(penalties.conBased, penaltyValue);
                    break;
                case 'int-based':
                    penalties.intBased = Math.min(penalties.intBased, penaltyValue);
                    break;
                case 'wis-based':
                    penalties.wisBased = Math.min(penalties.wisBased, penaltyValue);
                    break;
                case 'cha-based':
                    penalties.chaBased = Math.min(penalties.chaBased, penaltyValue);
                    break;
                case 'attack':
                    penalties.attack = Math.min(penalties.attack, penaltyValue);
                    break;
                case 'ac':
                    penalties.ac = Math.min(penalties.ac, penaltyValue);
                    break;
                case 'saving-throw':
                    penalties.savingThrow = Math.min(penalties.savingThrow, penaltyValue);
                    break;
                case 'perception':
                    penalties.perception = Math.min(penalties.perception, penaltyValue);
                    break;
                case 'speed':
                    penalties.speed = Math.min(penalties.speed, penaltyValue);
                    break;
            }
        }
    }

    return penalties;
}

/**
 * Apply PF2e stacking rules:
 * - Bonuses of the same type don't stack (only the highest applies)
 * - Penalties always stack (add together)
 * - Different bonus types stack with each other
 */
function _applyStackingRules(modifiers: { bonus: number; type: BonusType }[]): number {
    // Separate bonuses by type
    const statusBonuses = modifiers.filter(m => m.type === 'status' && m.bonus > 0).map(m => m.bonus);
    const circumstanceBonuses = modifiers.filter(m => m.type === 'circumstance' && m.bonus > 0).map(m => m.bonus);
    const itemBonuses = modifiers.filter(m => m.type === 'item' && m.bonus > 0).map(m => m.bonus);

    // For bonuses, only the highest of each type applies
    const totalBonus = Math.max(0, ...statusBonuses, 0) +
        Math.max(0, ...circumstanceBonuses, 0) +
        Math.max(0, ...itemBonuses, 0);

    // Penalties always stack
    const totalPenalty = modifiers
        .filter(m => m.bonus < 0 || m.type === 'penalty')
        .reduce((sum, m) => sum + m.bonus, 0);

    return totalBonus + totalPenalty;
}

/**
 * Filter buffs by selector
 */
function filterBuffsBySelector(
    buffs: Array<{ type: BonusType; selector: BonusSelector; bonus: number }>,
    targetSelector: BonusSelector
): Array<{ type: BonusType; bonus: number }> {
    return buffs
        .filter(buff => {
            if (buff.selector === targetSelector) return true;

            // Handle wildcard selectors
            if (buff.selector === 'all-saves' &&
                (targetSelector === 'fortitude' || targetSelector === 'reflex' || targetSelector === 'will')) {
                return true;
            }

            if (buff.selector === 'skill-*' && targetSelector.startsWith('skill-')) {
                return true;
            }

            if (buff.selector === 'ability-*' && targetSelector.startsWith('ability-')) {
                return true;
            }

            return false;
        })
        .map(buff => ({ type: buff.type, bonus: buff.bonus }));
}

/**
 * Calculate active modifiers combining conditions and buffs
 */
export function calculateActiveModifiers(
    activeConditions: { id: string; value?: number }[],
    buffs: Array<{ type: BonusType; selector: BonusSelector; bonus: number }>,
    skills: Array<{ name: string; ability: AbilityName }>
): ActiveModifiers {
    const penalties = calculateConditionPenalties(activeConditions);

    // Helper to calculate a modifier breakdown
    const calcModifier = (
        selector: BonusSelector,
        conditionPenalty: number
    ): ModifierBreakdown => {
        const matchingBuffs = filterBuffsBySelector(buffs, selector);

        const statusBonus = Math.max(0, ...matchingBuffs.filter(b => b.type === 'status' && b.bonus > 0).map(b => b.bonus), 0);
        const circumstanceBonus = Math.max(0, ...matchingBuffs.filter(b => b.type === 'circumstance' && b.bonus > 0).map(b => b.bonus), 0);
        const itemBonus = Math.max(0, ...matchingBuffs.filter(b => b.type === 'item' && b.bonus > 0).map(b => b.bonus), 0);

        // Penalty from buffs (type='penalty' or negative bonuses)
        const buffPenalty = matchingBuffs
            .filter(b => b.bonus < 0 || b.type === 'penalty')
            .reduce((sum, b) => sum + b.bonus, 0);

        const totalBonus = statusBonus + circumstanceBonus + itemBonus + buffPenalty + conditionPenalty;

        return {
            total: totalBonus,
            status: statusBonus,
            circumstance: circumstanceBonus,
            item: itemBonus,
            penalty: buffPenalty,
            condition: conditionPenalty
        };
    };

    // Calculate modifiers for each category
    return {
        ac: calcModifier('ac', penalties.all + penalties.dexBased + penalties.ac),
        fortitude: calcModifier('fortitude', penalties.all + penalties.savingThrow + penalties.conBased),
        reflex: calcModifier('reflex', penalties.all + penalties.savingThrow + penalties.dexBased),
        will: calcModifier('will', penalties.all + penalties.savingThrow + penalties.wisBased),
        perception: calcModifier('perception', penalties.all + penalties.perception + penalties.wisBased),
        attack: calcModifier('attack', penalties.all + penalties.attack),
        damage: calcModifier('damage', penalties.all + penalties.strBased),
        speed: calcModifier('speed', penalties.speed),
        skills: Object.fromEntries(
            skills.map(skill => [
                skill.name,
                calcModifier(`skill-${skill.name}` as BonusSelector, getSkillPenalty(skill.ability, penalties))
            ])
        ) as { [skillName: string]: ModifierBreakdown },
        abilities: {
            str: calcModifier('ability-str', penalties.all + penalties.strBased),
            dex: calcModifier('ability-dex', penalties.all + penalties.dexBased),
            con: calcModifier('ability-con', penalties.all + penalties.conBased),
            int: calcModifier('ability-int', penalties.all + penalties.intBased),
            wis: calcModifier('ability-wis', penalties.all + penalties.wisBased),
            cha: calcModifier('ability-cha', penalties.all + penalties.chaBased),
        }
    };
}

// ===== Legacy helper functions (for backward compatibility) =====

/**
 * Get penalty for a specific skill based on its key ability
 */
export function getSkillPenalty(
    skillAbility: AbilityName,
    penalties: ConditionPenalties
): number {
    let total = penalties.all;

    switch (skillAbility) {
        case 'dex':
            total += penalties.dexBased;
            break;
        case 'str':
            total += penalties.strBased;
            break;
        case 'con':
            total += penalties.conBased;
            break;
        case 'int':
            total += penalties.intBased;
            break;
        case 'wis':
            total += penalties.wisBased;
            break;
        case 'cha':
            total += penalties.chaBased;
            break;
    }

    return total;
}

/**
 * Get total AC penalty (includes all + dex-based + ac-specific)
 */
export function getACPenalty(penalties: ConditionPenalties): number {
    return penalties.all + penalties.dexBased + penalties.ac;
}

/**
 * Get perception penalty
 */
export function getPerceptionPenalty(penalties: ConditionPenalties): number {
    return penalties.all + penalties.wisBased + penalties.perception;
}

/**
 * Get save penalty (for a specific save type)
 */
export function getSavePenalty(
    saveAbility: 'con' | 'dex' | 'wis',
    penalties: ConditionPenalties
): number {
    let total = penalties.all + penalties.savingThrow;

    switch (saveAbility) {
        case 'dex': // Reflex
            total += penalties.dexBased;
            break;
        case 'con': // Fortitude
            total += penalties.conBased;
            break;
        case 'wis': // Will
            total += penalties.wisBased;
            break;
    }

    return total;
}

/**
 * Get attack roll penalty
 */
export function getAttackPenalty(penalties: ConditionPenalties): number {
    return penalties.all + penalties.attack;
}

/**
 * Check if any penalty is active
 */
export function hasAnyPenalty(penalties: ConditionPenalties): boolean {
    return Object.values(penalties).some(v => v < 0);
}
