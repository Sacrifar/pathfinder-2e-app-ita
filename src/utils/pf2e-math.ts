/**
 * Pathfinder 2e Core Mathematical Utilities
 * Powers the Leveling System and Stat Calculation
 */

import { Character } from '../types';
import { ancestries, classes } from '../data';

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
