/**
 * Pathfinder 2e Leveling Schedule
 * Defines feat slots, skill increases, and ability boosts per level
 */

export interface FeatSlot {
    type: 'ancestry' | 'class' | 'general' | 'skill';
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

/**
 * Get all feat slots up to and including a given level
 */
export function getAllFeatSlotsUpToLevel(level: number): FeatSlot[] {
    const slots: FeatSlot[] = [];

    for (let l = 1; l <= level; l++) {
        const features = LEVEL_FEATURES[l];
        if (features?.ancestryFeat) slots.push({ type: 'ancestry', level: l });
        if (features?.classFeat) slots.push({ type: 'class', level: l });
        if (features?.generalFeat) slots.push({ type: 'general', level: l });
        if (features?.skillFeat) slots.push({ type: 'skill', level: l });
    }

    return slots;
}

/**
 * Get count of skill increases up to a given level
 */
export function getSkillIncreasesUpToLevel(level: number): number {
    return SKILL_INCREASE_LEVELS.filter(l => l <= level).length;
}

/**
 * Check if a level grants ability boosts
 */
export function hasAbilityBoostAtLevel(level: number): boolean {
    return ABILITY_BOOST_LEVELS.includes(level as typeof ABILITY_BOOST_LEVELS[number]);
}

/**
 * Get all ability boost levels up to a given level
 */
export function getAbilityBoostLevelsUpTo(level: number): number[] {
    return ABILITY_BOOST_LEVELS.filter(l => l <= level);
}
