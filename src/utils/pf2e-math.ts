/**
 * Pathfinder 2e Core Mathematical Utilities
 * Powers the Leveling System and Stat Calculation
 */

import { Character } from '../types';
import { ancestries, classes } from '../data';
import { LoadedWeapon } from '../data/pf2e-loader';

export enum ProficiencyRank {
    Untrained = 0,
    Trained = 2,
    Expert = 4,
    Master = 6,
    Legendary = 8,
}

export interface CharacterStats {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
    level: number; // 1-20
}

export function getAbilityModifier(score: number): number {
    return Math.floor((score - 10) / 2);
}

export function applyAbilityBoost(currentScore: number): number {
    if (currentScore < 18) {
        return currentScore + 2;
    }
    return currentScore + 1;
}

export function calculateProficiencyBonus(level: number, rank: ProficiencyRank): number {
    if (rank === ProficiencyRank.Untrained) {
        return 0;
    }
    return level + rank;
}

/**
 * Calculate proficiency bonus with Variant Rules support
 * @param level Character level
 * @param rank Proficiency rank
 * @param proficiencyWithoutLevel If true, use Proficiency Without Level variant (0/2/4/6/8)
 */
export function calculateProficiencyBonusWithVariant(
    level: number,
    rank: ProficiencyRank,
    proficiencyWithoutLevel: boolean = false
): number {
    if (rank === ProficiencyRank.Untrained) {
        return 0;
    }

    if (proficiencyWithoutLevel) {
        // Proficiency Without Level: Just the rank value
        return rank;
    }

    // Standard: Level + Rank
    return level + rank;
}

/**
 * Get Automatic Bonus Progression (ABP) values
 * @param level Character level
 * @returns Object with potency, striking, and resilient bonuses
 */
export function getABPBonuses(level: number) {
    // ABP Table from GMG
    const potencyTable: Record<number, number> = {
        1: 0, 2: 0, 3: 0, 4: 1,
        5: 1, 6: 1, 7: 1, 8: 2,
        9: 2, 10: 2, 11: 2, 12: 3,
        13: 3, 14: 3, 15: 3, 16: 4,
        17: 4, 18: 4, 19: 4, 20: 5,
    };

    const strikingTable: Record<number, number> = {
        1: 0, 2: 0, 3: 0, 4: 0,
        5: 0, 6: 0, 7: 1, 8: 1,
        9: 1, 10: 1, 11: 1, 12: 2,
        13: 2, 14: 2, 15: 2, 16: 2,
        17: 3, 18: 3, 19: 3, 20: 3,
    };

    const resilientTable: Record<number, number> = {
        1: 0, 2: 0, 3: 0, 4: 0,
        5: 0, 6: 0, 7: 0, 8: 1,
        9: 1, 10: 1, 11: 1, 12: 2,
        13: 2, 14: 2, 15: 2, 16: 3,
        17: 3, 18: 3, 19: 3, 20: 4,
    };

    return {
        potency: potencyTable[level] || 0,
        striking: strikingTable[level] || 0,
        resilient: resilientTable[level] || 0,
    };
}

/**
 * Calculate Armor Class with ABP support
 * @param character Character data
 * AC = 10 + Dex Mod (capped) + Armor Bonus + Proficiency Bonus + Item Bonus
 */
export function calculateACWithABP(character: Character): number {
    const baseAC = 10;
    const dexMod = getAbilityModifier(character.abilityScores.dex);

    // Apply dex cap from armor (default to 99 for no cap)
    const dexCap = character.armorClass.dexCap ?? 99;
    const effectiveDex = Math.min(dexMod, dexCap);

    // Armor bonus from equipped armor (e.g., Studded Leather gives +2)
    let armorBonus = character.armorClass.acBonus || 0;

    // Fallback: if acBonus is not set but itemBonus has a value, it might be the old format
    // where itemBonus was incorrectly storing acBonus. Don't double-count.
    if (armorBonus === 0 && character.armorClass.itemBonus && character.armorClass.itemBonus > 0) {
        // Check if this looks like an armor bonus (typically 1-6 for light/medium/heavy armor)
        // rather than an item bonus (potency rune, typically 1, 2, or 3)
        if (character.armorClass.itemBonus <= 6) {
            armorBonus = character.armorClass.itemBonus;
        }
    }

    // Calculate proficiency bonus
    const profBonus = calculateProficiencyBonusWithVariant(
        character.level || 1,
        character.armorClass.proficiency === 'trained' ? ProficiencyRank.Trained :
            character.armorClass.proficiency === 'expert' ? ProficiencyRank.Expert :
                character.armorClass.proficiency === 'master' ? ProficiencyRank.Master :
                    character.armorClass.proficiency === 'legendary' ? ProficiencyRank.Legendary :
                        ProficiencyRank.Untrained,
        character.variantRules?.proficiencyWithoutLevel
    );

    let itemBonus = 0;
    if (character.variantRules?.automaticBonusProgression) {
        // ABP: Use built-in bonuses
        const abp = getABPBonuses(character.level);
        itemBonus = abp.potency + abp.resilient;
    } else {
        // Standard: Use item bonus from equipment (potency runes)
        // If we used itemBonus as armorBonus above, set itemBonus to 0
        itemBonus = (armorBonus === character.armorClass.itemBonus) ? 0 : (character.armorClass.itemBonus || 0);
    }

    // AC = 10 + Dex (capped) + Armor Bonus + Proficiency Bonus + Item Bonus
    return baseAC + effectiveDex + armorBonus + profBonus + itemBonus;
}

/**
 * Calculate Attack Bonus with ABP support
 * @param character Character data
 * @param weaponProficiency Weapon proficiency rank
 */
export function calculateAttackBonusWithABP(
    character: Character,
    weaponProficiency: ProficiencyRank
): number {
    const keyAbility = 'str'; // Would be determined by weapon type
    const abilityMod = getAbilityModifier(character.abilityScores[keyAbility as keyof typeof character.abilityScores]);
    const profBonus = calculateProficiencyBonusWithVariant(
        character.level,
        weaponProficiency,
        character.variantRules?.proficiencyWithoutLevel
    );

    let itemBonus = 0;
    if (character.variantRules?.automaticBonusProgression) {
        // ABP: Use potency bonus
        const abp = getABPBonuses(character.level);
        itemBonus = abp.potency;
    }

    return abilityMod + profBonus + itemBonus;
}

/**
 * Calculate maximum Hit Points for a character
 * Formula: Ancestry HP + Class HP + Constitution modifier
 * With Dual Class: Use the higher HP of the two classes
 */
export function calculateMaxHP(character: Character): number {
    const ancestry = ancestries.find(a => a.id === character.ancestryId);
    const cls = classes.find(c => c.id === character.classId);

    const ancestryHP = ancestry?.hitPoints || 0;
    let classHP = cls?.hitPoints || 0;

    // Dual Class: Take the higher HP value
    if (character.secondaryClassId) {
        const secondaryCls = classes.find(c => c.id === character.secondaryClassId);
        const secondaryHP = secondaryCls?.hitPoints || 0;
        classHP = Math.max(classHP, secondaryHP);
    }

    const conMod = getAbilityModifier(character.abilityScores.con);

    return ancestryHP + classHP + conMod;
}

/**
 * Ensure character has valid HP values, calculating them if needed
 * This is useful when loading characters or when HP might be 0
 */
export function ensureValidHP(character: Character): Character {
    const maxHP = calculateMaxHP(character);

    // If HP is 0 or current > max, recalculate
    if (character.hitPoints.max === 0 || character.hitPoints.current > character.hitPoints.max) {
        return {
            ...character,
            hitPoints: {
                max: maxHP,
                current: character.hitPoints.current === 0 || character.hitPoints.current > character.hitPoints.max
                    ? maxHP
                    : character.hitPoints.current,
                temporary: character.hitPoints.temporary || 0,
            },
        };
    }

    return character;
}

/**
 * Get the proficiency rank for a specific weapon category
 */
export function getWeaponProficiencyRank(character: Character, weaponCategory: string): ProficiencyRank {
    const profEntry = character.weaponProficiencies?.find(
        p => p.category === weaponCategory || p.category === 'all'
    );

    if (!profEntry) return ProficiencyRank.Untrained;

    switch (profEntry.proficiency) {
        case 'trained': return ProficiencyRank.Trained;
        case 'expert': return ProficiencyRank.Expert;
        case 'master': return ProficiencyRank.Master;
        case 'legendary': return ProficiencyRank.Legendary;
        default: return ProficiencyRank.Untrained;
    }
}

/**
 * Calculates the attack bonuses for a specific weapon with MAP (Multiple Attack Penalty)
 * Returns array of 3 numbers: [first attack, second attack, third attack]
 *
 * @param character Character data
 * @param weapon Weapon to calculate attack bonus for
 * @param equippedWeapon Optional equipped weapon data with runes and customization
 * @returns Array of 3 attack bonuses accounting for MAP
 */
export function calculateWeaponAttack(
    character: Character,
    weapon: LoadedWeapon,
    equippedWeapon?: { runes?: { potencyRune?: number }; customization?: { bonusAttack?: number; attackAbilityOverride?: string } }
): [number, number, number] {
    const strMod = getAbilityModifier(character.abilityScores.str);
    const dexMod = getAbilityModifier(character.abilityScores.dex);

    // Determine key ability modifier based on weapon traits, range, and customization
    let abilityMod: number;
    const isRanged = weapon.range !== null && weapon.range > 0;
    const hasFinesse = weapon.traits.includes('Finesse');
    const hasThrown = weapon.traits.includes('Thrown');

    // Check for attack ability override from customization
    const abilityOverride = equippedWeapon?.customization?.attackAbilityOverride;

    if (abilityOverride && abilityOverride !== 'auto') {
        // Use the overridden ability
        abilityMod = getAbilityModifier(character.abilityScores[abilityOverride as keyof typeof character.abilityScores]);
    } else if (isRanged && !hasThrown) {
        // Ranged weapons use DEX (except thrown, which are melee that can be thrown)
        abilityMod = dexMod;
    } else if (hasFinesse) {
        // Finesse weapons can use STR or DEX, whichever is higher
        abilityMod = Math.max(strMod, dexMod);
    } else {
        // Default melee uses STR
        abilityMod = strMod;
    }

    // Get proficiency bonus
    const profRank = getWeaponProficiencyRank(character, weapon.category);
    const profBonus = calculateProficiencyBonusWithVariant(
        character.level || 1,
        profRank,
        character.variantRules?.proficiencyWithoutLevel
    );

    // Calculate item bonus (for weapon potency runes)
    let itemBonus = 0;
    if (character.variantRules?.automaticBonusProgression) {
        const abp = getABPBonuses(character.level || 1);
        itemBonus = abp.potency;
    } else {
        // Add potency rune bonus from equipped weapon
        itemBonus = equippedWeapon?.runes?.potencyRune || 0;
    }

    // Add manual attack bonus override from customization
    const manualBonus = equippedWeapon?.customization?.bonusAttack || 0;

    const baseAttackBonus = abilityMod + profBonus + itemBonus + manualBonus;

    // Calculate MAP (Multiple Attack Penalty)
    // Agile weapons: 0, -4, -8
    // Other weapons: 0, -5, -10
    const hasAgile = weapon.traits.includes('Agile');
    const map1 = 0;
    const map2 = hasAgile ? -4 : -5;
    const map3 = hasAgile ? -8 : -10;

    return [
        baseAttackBonus + map1,
        baseAttackBonus + map2,
        baseAttackBonus + map3,
    ];
}

/**
 * Calculates the damage string for a specific weapon
 * Handles: STR bonus, Propulsive, Thrown, Two-Hand toggle, Striking runes, Customization
 *
 * @param character Character data
 * @param weapon Weapon to calculate damage for
 * @param isTwoHanded Whether two-hand-d* trait is active
 * @param equippedWeapon Optional equipped weapon data with runes and customization
 * @returns Damage string (e.g., "1d8 + 3" or "2d6 + 1")
 */
export function calculateWeaponDamage(
    character: Character,
    weapon: LoadedWeapon,
    isTwoHanded: boolean = false,
    equippedWeapon?: { runes?: { strikingRune?: string }; customization?: { bonusDamage?: number; customDamageType?: string } }
): string {
    const strMod = getAbilityModifier(character.abilityScores.str);
    const _dexMod = getAbilityModifier(character.abilityScores.dex);

    // Parse base damage dice
    const damageMatch = weapon.damage.match(/^(\d+)d(\d+)$/);
    if (!damageMatch) return weapon.damage;

    let diceCount = parseInt(damageMatch[1]);
    const dieSize = parseInt(damageMatch[2]);

    // Handle Two-Hand trait (e.g., two-hand-d8: changes damage die to d8)
    let actualDieSize = dieSize;
    const twoHandTrait = weapon.traits.find(t => t.startsWith('two-hand-d'));
    if (isTwoHanded && twoHandTrait) {
        const twoHandDieMatch = twoHandTrait.match(/two-hand-d(\d+)/);
        if (twoHandDieMatch) {
            actualDieSize = parseInt(twoHandDieMatch[1]);
        }
    }

    // Handle Striking runes (extra weapon dice)
    let strikingBonus = 0;
    if (character.variantRules?.automaticBonusProgression) {
        const abp = getABPBonuses(character.level || 1);
        strikingBonus = abp.striking;
    } else {
        // Add striking rune bonus from equipped weapon
        const strikingRune = equippedWeapon?.runes?.strikingRune;
        if (strikingRune === 'striking') {
            strikingBonus = 1;  // +1 weapon die
        } else if (strikingRune === 'greaterStriking') {
            strikingBonus = 2;  // +2 weapon dice
        } else if (strikingRune === 'majorStriking') {
            strikingBonus = 3;  // +3 weapon dice
        }
    }
    diceCount += strikingBonus;

    // Build damage dice string
    const damageDice = `${diceCount}d${actualDieSize}`;

    // Calculate damage modifier
    let damageMod = 0;
    const isRanged = weapon.range !== null && weapon.range > 0;
    const hasThrown = weapon.traits.includes('Thrown');
    const hasPropulsive = weapon.traits.includes('Propulsive');

    if (isRanged && !hasThrown) {
        // Ranged weapons (except thrown) usually don't add stat to damage
        damageMod = 0;

        // Propulsive adds half STR modifier to damage
        if (hasPropulsive) {
            damageMod = Math.floor(strMod / 2);
        }
    } else {
        // Melee and thrown weapons add full STR modifier
        damageMod = strMod;
    }

    // Add manual damage bonus override from customization
    const manualDamageBonus = equippedWeapon?.customization?.bonusDamage || 0;
    damageMod += manualDamageBonus;

    // Build final damage string
    if (damageMod > 0) {
        return `${damageDice} + ${damageMod}`;
    } else if (damageMod < 0) {
        return `${damageDice} - ${Math.abs(damageMod)}`;
    } else {
        return damageDice;
    }
}

/**
 * Get the key ability for a spellcasting tradition
 */
function getSpellcastingKeyAbility(tradition: string): 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha' {
    // Bard, Sorcerer -> Cha
    if (['arcane', 'occult'].includes(tradition)) return 'cha';
    // Cleric, Druid -> Wis
    if (['divine', 'primal'].includes(tradition)) return 'wis';
    // Wizard -> Int
    return 'int';
}

/**
 * Get spell attack roll and DC for a character
 * Returns the spell attack modifier and class DC for spell DC
 *
 * @param character Character data
 * @param tradition Spellcasting tradition (arcane, divine, occult, primal)
 * @returns Object with attack (modifier) and dc (class DC value)
 */
export function calculateSpellDC(
    character: Character,
    tradition: string
): { attack: number; dc: number } {
    // Get key ability for tradition
    const keyAbility = getSpellcastingKeyAbility(tradition);
    const abilityMod = getAbilityModifier(character.abilityScores[keyAbility]);

    // Determine proficiency based on class and level
    // Most casters are Trained at level 1, Expert at level 7
    let profRank = ProficiencyRank.Trained;
    if (character.level >= 7) profRank = ProficiencyRank.Expert;
    if (character.level >= 15) profRank = ProficiencyRank.Master;
    if (character.level >= 19) profRank = ProficiencyRank.Legendary;

    // Check for specific class features that boost proficiency
    const cls = classes.find(c => c.id === character.classId);
    if (cls) {
        // Wizards get Expert spell DC at level 1
        if (cls.id === 'wizard' && character.level >= 1) {
            profRank = ProficiencyRank.Expert;
        }
        // Clerics with Divine Mastery get Master at level 17
        if (cls.id === 'cleric' && character.level >= 17) {
            profRank = ProficiencyRank.Master;
        }
    }

    const profBonus = calculateProficiencyBonusWithVariant(
        character.level || 1,
        profRank,
        character.variantRules?.proficiencyWithoutLevel
    );

    // Spell Attack = Key Ability Mod + Proficiency Bonus
    const attack = abilityMod + profBonus;

    // Spell DC = 10 + Key Ability Mod + Proficiency Bonus
    const dc = 10 + abilityMod + profBonus;

    return { attack, dc };
}

/**
 * Calculate Saving Throw modifier
 * @param character Character data
 * @param saveType 'fortitude' | 'reflex' | 'will'
 * @returns Saving throw modifier
 */
export function calculateSavingThrow(
    character: Character,
    saveType: 'fortitude' | 'reflex' | 'will'
): number {
    const proficiency = character.saves?.[saveType] || 'untrained';
    const profBonus = calculateProficiencyBonusWithVariant(
        character.level || 1,
        proficiency === 'untrained' ? ProficiencyRank.Untrained :
            proficiency === 'trained' ? ProficiencyRank.Trained :
                proficiency === 'expert' ? ProficiencyRank.Expert :
                    proficiency === 'master' ? ProficiencyRank.Master :
                        ProficiencyRank.Legendary,
        character.variantRules?.proficiencyWithoutLevel
    );

    let abilityMod = 0;
    if (saveType === 'fortitude') {
        abilityMod = getAbilityModifier(character.abilityScores.con || 10);
    } else if (saveType === 'reflex') {
        abilityMod = getAbilityModifier(character.abilityScores.dex || 10);
    } else if (saveType === 'will') {
        abilityMod = getAbilityModifier(character.abilityScores.wis || 10);
    }

    return profBonus + abilityMod;
}

/**
 * Extract damage formula from FoundryVTT-style description with @Damage tags
 * @param description The HTML description containing @Damage[...] tags
 * @returns Array of damage formulas or null if not found
 */
export function extractDamageFromDescription(description: string): string[] | null {
    // Match @Damage[...] tags
    const damageRegex = /@Damage\[([^\]]+)\]/g;
    const matches = [...description.matchAll(damageRegex)];

    if (matches.length === 0) return null;

    // Extract damage formulas from matches
    const damageFormulas: string[] = [];

    for (const match of matches) {
        const damageContent = match[1];

        // First, remove any trailing options like |options:area-damage
        const withoutOptions = damageContent.split('|')[0];

        // Split by comma for multiple damage types (e.g., "2d4[slashing],2d4[piercing]")
        // But handle the case where comma is inside brackets
        const damageParts: string[] = [];
        let currentPart = '';
        let bracketDepth = 0;

        for (let i = 0; i < withoutOptions.length; i++) {
            const char = withoutOptions[i];

            if (char === '[') {
                bracketDepth++;
                currentPart += char;
            } else if (char === ']') {
                bracketDepth--;
                currentPart += char;
            } else if (char === ',' && bracketDepth === 0) {
                // Comma at top level = separator
                if (currentPart.trim()) {
                    damageParts.push(currentPart.trim());
                }
                currentPart = '';
            } else {
                currentPart += char;
            }
        }

        // Add the last part
        if (currentPart.trim()) {
            damageParts.push(currentPart.trim());
        }

        // Clean each part: remove damage type brackets
        for (const part of damageParts) {
            const cleaned = part
                .replace(/\[.*$/, '') // Remove damage type in brackets and everything after
                .trim();

            if (cleaned && !damageFormulas.includes(cleaned)) {
                damageFormulas.push(cleaned);
            }
        }
    }

    return damageFormulas.length > 0 ? damageFormulas : null;
}

/**
 * Simplify a FoundryVTT formula by replacing actor references with actual values
 * @param formula The formula (e.g., "(floor((@actor.level -1)/2)+1)d4")
 * @param character The character data
 * @returns Simplified formula (e.g., "3d4")
 */
export function simplifyFoundryFormula(formula: string, character: Character): string {
    const level = character.level || 1;

    let result = formula;

    // Handle floor expressions with addition/subtraction: floor((@actor.level - 1)/2) + 2
    // Pattern 1: (floor((@actor.level X Y)/Z) ± W) - handles parenthesized expressions
    // Pattern 2: floor((@actor.level X Y)/Z) ± W - handles non-parenthesized expressions
    // Both patterns capture: floor((@actor.level ± num1) / div) ± num2

    // First handle the parenthesized version: (floor((@actor.level X Y)/Z) ± W)
    const floorWithMathParensRegex = /\(\s*floor\s*\(\s*\(\s*@actor\.level\s*([-+])\s*(\d+)\s*\)\s*\/\s*(\d+)\s*\)\s*([-+])\s*(\d+)\s*\)/gi;
    result = result.replace(floorWithMathParensRegex, (_, op1, num1, divisor, op2, num2) => {
        const n1 = parseInt(num1, 10);
        const div = parseInt(divisor, 10);
        const n2 = parseInt(num2, 10);

        // Calculate floor((level ± num1) / divisor) ± num2
        const innerLevel = op1 === '-' ? level - n1 : level + n1;
        const floorResult = Math.floor(innerLevel / div);
        const finalResult = op2 === '+' ? floorResult + n2 : floorResult - n2;

        return String(finalResult);
    });

    // Then handle the non-parenthesized version: floor((@actor.level X Y)/Z) ± W
    const floorMathNoParensRegex = /floor\s*\(\s*\(\s*@actor\.level\s*([-+])\s*(\d+)\s*\)\s*\/\s*(\d+)\s*\)\s*([-+])\s*(\d+)/gi;
    result = result.replace(floorMathNoParensRegex, (_, op1, num1, divisor, op2, num2) => {
        const n1 = parseInt(num1, 10);
        const div = parseInt(divisor, 10);
        const n2 = parseInt(num2, 10);

        // Calculate floor((level ± num1) / divisor) ± num2
        const innerLevel = op1 === '-' ? level - n1 : level + n1;
        const floorResult = Math.floor(innerLevel / div);
        const finalResult = op2 === '+' ? floorResult + n2 : floorResult - n2;

        return String(finalResult);
    });

    // Handle simple floor expressions like: floor((@actor.level - 1)/2)
    result = result.replace(/floor\s*\(\s*\(\s*@actor\.level\s*([-+])\s*(\d+)\s*\)\s*\/\s*(\d+)\s*\)/gi, (_, op, num, divisor) => {
        const n = parseInt(num, 10);
        const div = parseInt(divisor, 10);
        const levelValue = op === '-' ? level - n : level + n;
        return String(Math.floor(levelValue / div));
    });

    // Replace @actor.level
    result = result.replace(/@actor\.level/gi, String(level));

    // Replace ability modifiers
    result = result.replace(/@actor\.abilities\.(str|dex|con|int|wis|cha)\.mod/gi, (match) => {
        const ability = match.split('.')[2];
        const score = character.abilityScores[ability as keyof typeof character.abilityScores] || 10;
        return String(getAbilityModifier(score));
    });

    // Replace max(...) functions
    result = result.replace(/max\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/gi, (_, a, b) => {
        return String(Math.max(Number(a), Number(b)));
    });

    // Clean up whitespace but keep necessary spacing for readability
    result = result.replace(/\s+/g, ' ').trim();

    return result;
}

