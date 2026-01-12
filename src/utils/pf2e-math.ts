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
 * Calculate maximum Hit Points for a character
 * Formula: Ancestry HP + Class HP + Constitution modifier
 */
export function calculateMaxHP(character: Character): number {
    const ancestry = ancestries.find(a => a.id === character.ancestryId);
    const cls = classes.find(c => c.id === character.classId);

    const ancestryHP = ancestry?.hitPoints || 0;
    const classHP = cls?.hitPoints || 0;
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
