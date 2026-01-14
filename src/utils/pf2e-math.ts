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
 */
export function calculateACWithABP(character: Character): number {
    const baseAC = 10;
    const dexMod = getAbilityModifier(character.abilityScores.dex);
    const profBonus = calculateProficiencyBonusWithVariant(
        character.level,
        character.armorClass.proficiency === 'untrained' ? ProficiencyRank.Untrained :
        character.armorClass.proficiency === 'trained' ? ProficiencyRank.Trained :
        character.armorClass.proficiency === 'expert' ? ProficiencyRank.Expert :
        character.armorClass.proficiency === 'master' ? ProficiencyRank.Master :
        ProficiencyRank.Legendary,
        character.variantRules?.proficiencyWithoutLevel
    );

    let itemBonus = 0;
    if (character.variantRules?.automaticBonusProgression) {
        // ABP: Use built-in bonuses
        const abp = getABPBonuses(character.level);
        itemBonus = abp.potency + abp.resilient;
    } else {
        // Standard: Use item bonus from equipment
        itemBonus = character.armorClass.itemBonus || 0;
    }

    return baseAC + dexMod + profBonus + itemBonus;
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
function getWeaponProficiencyRank(character: Character, weaponCategory: string): ProficiencyRank {
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
    const dexMod = getAbilityModifier(character.abilityScores.dex);

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

