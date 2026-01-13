/**
 * Pathfinder 2e Leveling Schedule
 * Defines feat slots, skill increases, and ability boosts per level
 * Supports Variant Rules from GMG
 */

import { Character } from '../types/character';

export interface FeatSlot {
    type: 'ancestry' | 'class' | 'general' | 'skill' | 'archetype'; // Added 'archetype' for Free Archetype
    level: number;
}

export interface LevelFeatures {
    ancestryFeat: boolean;
    classFeat: boolean;
    generalFeat: boolean;
    skillFeat: boolean;
    skillIncrease: boolean;
    abilityBoost: boolean;
}

// Levels at which ability boosts are gained (4 free boosts each)
export const ABILITY_BOOST_LEVELS = [5, 10, 15, 20] as const;

// Levels at which skill increases are gained
export const SKILL_INCREASE_LEVELS = [3, 5, 7, 9, 11, 13, 15, 17, 19] as const;

// Levels for Ancestry Paragon variant rule
export const ANCESTRY_PARAGON_LEVELS = [1, 3, 7, 11, 15, 19] as const;

// Levels for Free Archetype variant rule (even levels)
export const FREE_ARCHETYPE_LEVELS = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20] as const;

// Complete feat schedule for levels 1-20
export const LEVEL_FEATURES: Record<number, LevelFeatures> = {
    1: { ancestryFeat: true, classFeat: true, generalFeat: false, skillFeat: false, skillIncrease: false, abilityBoost: false },
    2: { ancestryFeat: false, classFeat: true, generalFeat: false, skillFeat: true, skillIncrease: false, abilityBoost: false },
    3: { ancestryFeat: false, classFeat: false, generalFeat: true, skillFeat: false, skillIncrease: true, abilityBoost: false },
    4: { ancestryFeat: false, classFeat: true, generalFeat: false, skillFeat: true, skillIncrease: false, abilityBoost: false },
    5: { ancestryFeat: true, classFeat: false, generalFeat: false, skillFeat: false, skillIncrease: true, abilityBoost: true },
    6: { ancestryFeat: false, classFeat: true, generalFeat: false, skillFeat: true, skillIncrease: false, abilityBoost: false },
    7: { ancestryFeat: false, classFeat: false, generalFeat: true, skillFeat: false, skillIncrease: true, abilityBoost: false },
    8: { ancestryFeat: false, classFeat: true, generalFeat: false, skillFeat: true, skillIncrease: false, abilityBoost: false },
    9: { ancestryFeat: true, classFeat: false, generalFeat: false, skillFeat: false, skillIncrease: true, abilityBoost: false },
    10: { ancestryFeat: false, classFeat: true, generalFeat: false, skillFeat: true, skillIncrease: false, abilityBoost: true },
    11: { ancestryFeat: false, classFeat: false, generalFeat: true, skillFeat: false, skillIncrease: true, abilityBoost: false },
    12: { ancestryFeat: false, classFeat: true, generalFeat: false, skillFeat: true, skillIncrease: false, abilityBoost: false },
    13: { ancestryFeat: true, classFeat: false, generalFeat: false, skillFeat: false, skillIncrease: true, abilityBoost: false },
    14: { ancestryFeat: false, classFeat: true, generalFeat: false, skillFeat: true, skillIncrease: false, abilityBoost: false },
    15: { ancestryFeat: false, classFeat: false, generalFeat: true, skillFeat: false, skillIncrease: true, abilityBoost: true },
    16: { ancestryFeat: false, classFeat: true, generalFeat: false, skillFeat: true, skillIncrease: false, abilityBoost: false },
    17: { ancestryFeat: true, classFeat: false, generalFeat: false, skillFeat: false, skillIncrease: true, abilityBoost: false },
    18: { ancestryFeat: false, classFeat: true, generalFeat: false, skillFeat: true, skillIncrease: false, abilityBoost: false },
    19: { ancestryFeat: false, classFeat: false, generalFeat: true, skillFeat: false, skillIncrease: true, abilityBoost: false },
    20: { ancestryFeat: false, classFeat: true, generalFeat: false, skillFeat: true, skillIncrease: false, abilityBoost: true },
};

/**
 * Get all features available at a specific level
 */
export function getFeaturesAtLevel(level: number): LevelFeatures {
    return LEVEL_FEATURES[level] || {
        ancestryFeat: false,
        classFeat: false,
        generalFeat: false,
        skillFeat: false,
        skillIncrease: false,
        abilityBoost: false,
    };
}

// ===================================
// VARIANT RULES FUNCTIONS
// ===================================

/**
 * Get all feat slots up to and including a given level, considering variant rules
 */
export function getAllFeatSlotsUpToLevel(
    level: number,
    variantRules?: Character['variantRules']
): FeatSlot[] {
    const slots: FeatSlot[] = [];

    for (let l = 1; l <= level; l++) {
        const features = LEVEL_FEATURES[l];
        if (features?.ancestryFeat) slots.push({ type: 'ancestry', level: l });
        if (features?.classFeat) slots.push({ type: 'class', level: l });
        if (features?.generalFeat) slots.push({ type: 'general', level: l });
        if (features?.skillFeat) slots.push({ type: 'skill', level: l });

        // Free Archetype: Extra class feat at even levels (must be used for archetypes)
        if (variantRules?.freeArchetype && FREE_ARCHETYPE_LEVELS.includes(l as any)) {
            slots.push({ type: 'archetype', level: l });
        }

        // Ancestry Paragon: Extra ancestry feats at specific levels
        if (variantRules?.ancestryParagon && ANCESTRY_PARAGON_LEVELS.includes(l as any)) {
            // Only add if not already added from standard progression
            if (!features?.ancestryFeat) {
                slots.push({ type: 'ancestry', level: l });
            }
        }
    }

    return slots;
}

/**
 * Get ability boost levels up to a given level, considering Gradual Ability Boosts variant
 */
export function getAbilityBoostLevelsUpTo(
    level: number,
    gradualBoosts?: boolean
): number[] {
    if (gradualBoosts) {
        // Gradual Ability Boosts: 1 boost per level (levels 1-20)
        // But level 1 is handled separately in character creation
        return Array.from({ length: level }, (_, i) => i + 1).filter(l => l > 1);
    }
    return ABILITY_BOOST_LEVELS.filter(l => l <= level);
}

/**
 * Check if a level grants ability boosts, considering variant rules
 */
export function hasAbilityBoostAtLevel(
    level: number,
    gradualBoosts?: boolean
): boolean {
    if (gradualBoosts) {
        return level > 1; // Every level except 1 gets a boost
    }
    return ABILITY_BOOST_LEVELS.includes(level as typeof ABILITY_BOOST_LEVELS[number]);
}

/**
 * Get total number of ability boosts up to a given level
 */
export function getTotalAbilityBoostsUpTo(
    level: number,
    gradualBoosts?: boolean
): number {
    if (gradualBoosts) {
        // Level 1 doesn't count in gradual boosts (handled in creation)
        return Math.max(0, level - 1);
    }
    return ABILITY_BOOST_LEVELS.filter(l => l <= level).length * 4; // 4 boosts per level
}
