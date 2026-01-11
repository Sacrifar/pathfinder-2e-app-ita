/**
 * Pathfinder 2e Core Mathematical Utilities
 * Powers the Leveling System and Stat Calculation
 */

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
