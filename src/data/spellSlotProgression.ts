/**
 * Spell Slot Progression Data
 *
 * Defines spell slot progression for all spellcasting classes in Pathfinder 2e Remastered.
 * Based on Player Core and Core Rulebook tables.
 *
 * Spell slots are defined per level (1-20), with arrays where index 0 = level 1.
 */

import type { AbilityName, SpellSlots, Proficiency } from '../types';

export type SpellcastingType = 'spontaneous' | 'prepared';
export type SpellcastingTradition = 'arcane' | 'divine' | 'occult' | 'primal';

/**
 * Sorcerer Bloodline to Tradition Mapping
 *
 * Each sorcerer bloodline grants access to a specific magical tradition.
 * Based on Player Core 2 and Archives of Nethys.
 */
export const SORCERER_BLOODLINE_TRADITIONS: Record<string, SpellcastingTradition> = {
    // Aberrant bloodline - occult magic
    'bloodline_aberrant': 'occult',

    // Angelic bloodline - divine magic
    'bloodline_angelic': 'divine',

    // Demonic bloodline - divine magic
    'bloodline_demonic': 'divine',

    // Draconic bloodline - arcane magic
    'bloodline_draconic': 'arcane',

    // Elemental bloodline - primal magic
    'bloodline_elemental': 'primal',

    // Fey bloodline - primal magic
    'bloodline_fey': 'primal',

    // Additional bloodlines that may be added in the future:
    // 'bloodline_genie': 'primal',       // Genie (Djinni, Efreeti, Marid, Shaitan)
    // 'bloodline_hag': 'occult',         // Hag
    // 'bloodline_imperial': 'arcane',    // Imperial
    // 'bloodline_nymph': 'primal',       // Nymph
    // 'bloodline_phoenix': 'fire',       // Phoenix (special case)
    // 'bloodline_psychopomp': 'divine',  // Psychopomp
    // 'bloodline_shadow': 'occult',      // Shadow
    // 'bloodline_undead': 'divine',      // Undead
    // 'bloodline_wyrmblessed': 'varies', // Wyrmblessed (varies by dragon type)
};

/**
 * Get the spellcasting tradition for a sorcerer bloodline
 */
export function getSorcererTraditionForBloodline(bloodlineId: string): SpellcastingTradition | undefined {
    return SORCERER_BLOODLINE_TRADITIONS[bloodlineId];
}

/**
 * Configuration for a spellcasting class
 */
export interface SpellcasterClassConfig {
    // Foundry class ID
    classId: string;
    // Class name
    className: string;
    // Spellcasting tradition
    tradition: SpellcastingTradition;
    // Spontaneous or prepared
    type: SpellcastingType;
    // Key ability score
    keyAbility: AbilityName;
    // Starting proficiency (usually trained for casters)
    startingProficiency: Proficiency;
    // Base spell slots per spell level (index = spell level - 1, array index = character level - 1)
    // For spontaneous casters, this is slots per level
    // For prepared casters, this is also slots per level (they prepare spells into these slots)
    // Type: array of 20 elements (character levels 1-20), each containing array of spell slots per spell level
    slots: number[][];
}

/**
 * Spontaneous Caster Slot Progression
 * Index = character level - 1, value = [level 1 slots, level 2 slots, ...]
 *
 * Slot progression for: Bard, Sorcerer, Oracle, Summoner, Psychic, Animist
 * These classes all use the "standard spontaneous" progression.
 */
const SPONTANEOUS_PROGRESSION: number[][] = [
    // Level 1 (index 0): 2 slots of level 1
    [2],  // Level 1: [2] (2 level-1 slots)
    // Level 2 (index 1): 2 slots of level 1
    [2],  // Level 2: [2] (2 level-1 slots)
    // Level 3 (index 2): 3 level-1, 1 level-2
    [3, 1],  // Level 3: [3, 1] (3 level-1, 1 level-2)
    // Level 4 (index 3): 3 level-1, 2 level-2
    [3, 2],  // Level 4: [3, 2]
    // Level 5 (index 4): 3 level-1, 2 level-2, 1 level-3
    [3, 2, 1],  // Level 5: [3, 2, 1]
    // Level 6 (index 5): 3 level-1, 2 level-2, 2 level-3
    [3, 2, 2],  // Level 6: [3, 2, 2]
    // Level 7 (index 6): 3 level-1, 2 level-2, 2 level-3, 1 level-4
    [3, 2, 2, 1],  // Level 7: [3, 2, 2, 1]
    // Level 8 (index 7): 3 level-1, 2 level-2, 2 level-3, 2 level-4
    [3, 2, 2, 2],  // Level 8: [3, 2, 2, 2]
    // Level 9 (index 8): 3 level-1, 2 level-2, 2 level-3, 2 level-4, 1 level-5
    [3, 2, 2, 2, 1],  // Level 9: [3, 2, 2, 2, 1]
    // Level 10 (index 9): 3 level-1, 2 level-2, 2 level-3, 2 level-4, 2 level-5
    [3, 2, 2, 2, 2],  // Level 10: [3, 2, 2, 2, 2]
    // Level 11 (index 10): 3 level-1, 3 level-2, 2 level-3, 2 level-4, 2 level-5, 1 level-6
    [3, 3, 2, 2, 2, 1],  // Level 11: [3, 3, 2, 2, 2, 1]
    // Level 12 (index 11): 3 level-1, 3 level-2, 2 level-3, 2 level-4, 2 level-5, 2 level-6
    [3, 3, 2, 2, 2, 2],  // Level 12: [3, 3, 2, 2, 2, 2]
    // Level 13 (index 12): 3 level-1, 3 level-2, 3 level-3, 2 level-4, 2 level-5, 2 level-6, 1 level-7
    [3, 3, 3, 2, 2, 2, 1],  // Level 13: [3, 3, 3, 2, 2, 2, 1]
    // Level 14 (index 13): 3 level-1, 3 level-2, 3 level-3, 2 level-4, 2 level-5, 2 level-6, 2 level-7
    [3, 3, 3, 2, 2, 2, 2],  // Level 14: [3, 3, 3, 2, 2, 2, 2]
    // Level 15 (index 14): 3 level-1, 3 level-2, 3 level-3, 3 level-4, 2 level-5, 2 level-6, 2 level-7, 1 level-8
    [3, 3, 3, 3, 2, 2, 2, 1],  // Level 15: [3, 3, 3, 3, 2, 2, 2, 1]
    // Level 16 (index 15): 3 level-1, 3 level-2, 3 level-3, 3 level-4, 2 level-5, 2 level-6, 2 level-7, 2 level-8
    [3, 3, 3, 3, 2, 2, 2, 2],  // Level 16: [3, 3, 3, 3, 2, 2, 2, 2]
    // Level 17 (index 16): 3 level-1, 3 level-2, 3 level-3, 3 level-4, 3 level-5, 2 level-6, 2 level-7, 2 level-8, 1 level-9
    [3, 3, 3, 3, 3, 2, 2, 2, 1],  // Level 17: [3, 3, 3, 3, 3, 2, 2, 2, 1]
    // Level 18 (index 17): 3 level-1, 3 level-2, 3 level-3, 3 level-4, 3 level-5, 2 level-6, 2 level-7, 2 level-8, 2 level-9
    [3, 3, 3, 3, 3, 2, 2, 2, 2],  // Level 18: [3, 3, 3, 3, 3, 2, 2, 2, 2]
    // Level 19 (index 18): 3 level-1, 3 level-2, 3 level-3, 3 level-4, 3 level-5, 3 level-6, 2 level-7, 2 level-8, 2 level-9, 1 level-10
    [3, 3, 3, 3, 3, 3, 2, 2, 2, 1],  // Level 19: [3, 3, 3, 3, 3, 3, 2, 2, 2, 1]
    // Level 20 (index 19): 3 level-1, 3 level-2, 3 level-3, 3 level-4, 3 level-5, 3 level-6, 2 level-7, 2 level-8, 2 level-9, 2 level-10
    [3, 3, 3, 3, 3, 3, 2, 2, 2, 2],  // Level 20: [3, 3, 3, 3, 3, 3, 2, 2, 2, 2]
];

/**
 * Prepared Caster Slot Progression (Cleric, Druid, Magus)
 *
 * These classes have the same slot progression as spontaneous casters.
 */
const PREPARED_STANDARD_PROGRESSION = SPONTANEOUS_PROGRESSION;

/**
 * Wizard Slot Progression
 *
 * Wizards get more low-level slots but fewer high-level slots.
 */
const WIZARD_PROGRESSION: number[][] = [
    // Level 1: 4 level-1 slots
    [4],  // Level 1: [4] (4 level-1 slots)
    // Level 2: 4 level-1 slots
    [4],  // Level 2: [4]
    // Level 3: 4 level-1, 2 level-2
    [4, 2],  // Level 3: [4, 2]
    // Level 4: 4 level-1, 3 level-2
    [4, 3],  // Level 4: [4, 3]
    // Level 5: 4 level-1, 3 level-2, 1 level-3
    [4, 3, 1],  // Level 5: [4, 3, 1]
    // Level 6: 4 level-1, 3 level-2, 2 level-3
    [4, 3, 2],  // Level 6: [4, 3, 2]
    // Level 7: 4 level-1, 3 level-2, 2 level-3, 1 level-4
    [4, 3, 2, 1],  // Level 7: [4, 3, 2, 1]
    // Level 8: 4 level-1, 3 level-2, 2 level-3, 2 level-4
    [4, 3, 2, 2],  // Level 8: [4, 3, 2, 2]
    // Level 9: 4 level-1, 3 level-2, 2 level-3, 2 level-4, 1 level-5
    [4, 3, 2, 2, 1],  // Level 9: [4, 3, 2, 2, 1]
    // Level 10: 4 level-1, 3 level-2, 2 level-3, 2 level-4, 2 level-5
    [4, 3, 2, 2, 2],  // Level 10: [4, 3, 2, 2, 2]
    // Level 11: 4 level-1, 4 level-2, 2 level-3, 2 level-4, 2 level-5, 1 level-6
    [4, 4, 2, 2, 2, 1],  // Level 11: [4, 4, 2, 2, 2, 1]
    // Level 12: 4 level-1, 4 level-2, 2 level-3, 2 level-4, 2 level-5, 2 level-6
    [4, 4, 2, 2, 2, 2],  // Level 12: [4, 4, 2, 2, 2, 2]
    // Level 13: 4 level-1, 4 level-2, 3 level-3, 2 level-4, 2 level-5, 2 level-6, 1 level-7
    [4, 4, 3, 2, 2, 2, 1],  // Level 13: [4, 4, 3, 2, 2, 2, 1]
    // Level 14: 4 level-1, 4 level-2, 3 level-3, 2 level-4, 2 level-5, 2 level-6, 2 level-7
    [4, 4, 3, 2, 2, 2, 2],  // Level 14: [4, 4, 3, 2, 2, 2, 2]
    // Level 15: 4 level-1, 4 level-2, 3 level-3, 3 level-4, 2 level-5, 2 level-6, 2 level-7, 1 level-8
    [4, 4, 3, 3, 2, 2, 2, 1],  // Level 15: [4, 4, 3, 3, 2, 2, 2, 1]
    // Level 16: 4 level-1, 4 level-2, 3 level-3, 3 level-4, 2 level-5, 2 level-6, 2 level-7, 2 level-8
    [4, 4, 3, 3, 2, 2, 2, 2],  // Level 16: [4, 4, 3, 3, 2, 2, 2, 2]
    // Level 17: 4 level-1, 4 level-2, 3 level-3, 3 level-4, 3 level-5, 2 level-6, 2 level-7, 2 level-8, 1 level-9
    [4, 4, 3, 3, 3, 2, 2, 2, 1],  // Level 17: [4, 4, 3, 3, 3, 2, 2, 2, 1]
    // Level 18: 4 level-1, 4 level-2, 3 level-3, 3 level-4, 3 level-5, 2 level-6, 2 level-7, 2 level-8, 2 level-9
    [4, 4, 3, 3, 3, 2, 2, 2, 2],  // Level 18: [4, 4, 3, 3, 3, 2, 2, 2, 2]
    // Level 19: 4 level-1, 4 level-2, 3 level-3, 3 level-4, 3 level-5, 3 level-6, 2 level-7, 2 level-8, 2 level-9, 1 level-10
    [4, 4, 3, 3, 3, 3, 2, 2, 2, 1],  // Level 19: [4, 4, 3, 3, 3, 3, 2, 2, 2, 1]
    // Level 20: 4 level-1, 4 level-2, 3 level-3, 3 level-4, 3 level-5, 3 level-6, 2 level-7, 2 level-8, 2 level-9, 2 level-10
    [4, 4, 3, 3, 3, 3, 2, 2, 2, 2],  // Level 20: [4, 4, 3, 3, 3, 3, 2, 2, 2, 2]
];

/**
 * Witch Slot Progression
 *
 * Witches get more low-level slots like wizards.
 */
const WITCH_PROGRESSION = WIZARD_PROGRESSION;

/**
 * All spellcaster class configurations
 */
export const SPELLCASTER_CLASSES: SpellcasterClassConfig[] = [
    // ===== BARD =====
    {
        classId: '3gweRQ5gn7szIWAv',
        className: 'Bard',
        tradition: 'occult',
        type: 'spontaneous',
        keyAbility: 'cha',
        startingProficiency: 'trained',
        slots: SPONTANEOUS_PROGRESSION,
    },

    // ===== SORCERER =====
    // Tradition varies by bloodline (arcane, divine, occult, primal)
    // Using arcane as default, should be overridden by bloodline choice
    {
        classId: '15Yc1r6s9CEhSTMe',
        className: 'Sorcerer',
        tradition: 'arcane', // Default, varies by bloodline
        type: 'spontaneous',
        keyAbility: 'cha',
        startingProficiency: 'trained',
        slots: SPONTANEOUS_PROGRESSION,
    },

    // ===== WIZARD =====
    {
        classId: 'RwjIZzIxzPpUglnK',
        className: 'Wizard',
        tradition: 'arcane',
        type: 'prepared',
        keyAbility: 'int',
        startingProficiency: 'trained',
        slots: WIZARD_PROGRESSION,
    },

    // ===== CLERIC =====
    {
        classId: 'EizrWvUPMS67Pahd',
        className: 'Cleric',
        tradition: 'divine',
        type: 'prepared',
        keyAbility: 'wis',
        startingProficiency: 'trained',
        slots: PREPARED_STANDARD_PROGRESSION,
    },

    // ===== DRUID =====
    {
        classId: '7s57JDCaiYYCAdFx',
        className: 'Druid',
        tradition: 'primal',
        type: 'spontaneous',
        keyAbility: 'wis',
        startingProficiency: 'trained',
        slots: SPONTANEOUS_PROGRESSION,
    },

    // ===== MAGUS =====
    {
        classId: 'HQBA9Yx2s8ycvz3C',
        className: 'Magus',
        tradition: 'arcane',
        type: 'spontaneous',
        keyAbility: 'int',
        startingProficiency: 'trained',
        slots: SPONTANEOUS_PROGRESSION,
    },

    // ===== WITCH =====
    {
        classId: 'bYDXk9HUMKOuym9h',
        className: 'Witch',
        tradition: 'occult',
        type: 'prepared',
        keyAbility: 'int',
        startingProficiency: 'trained',
        slots: WITCH_PROGRESSION,
    },

    // ===== ORACLE =====
    {
        classId: 'pWHx4SXcft9O2udP',
        className: 'Oracle',
        tradition: 'divine',
        type: 'spontaneous',
        keyAbility: 'cha',
        startingProficiency: 'trained',
        slots: SPONTANEOUS_PROGRESSION,
    },

    // ===== SUMMONER =====
    {
        classId: 'YtOm245r8GFSFYeD',
        className: 'Summoner',
        tradition: 'arcane',
        type: 'spontaneous',
        keyAbility: 'cha',
        startingProficiency: 'trained',
        slots: SPONTANEOUS_PROGRESSION,
    },

    // ===== PSYCHIC =====
    {
        classId: 'Inq4gH3P5PYjSQbD',
        className: 'Psychic',
        tradition: 'occult',
        type: 'spontaneous',
        keyAbility: 'int',
        startingProficiency: 'trained',
        slots: SPONTANEOUS_PROGRESSION,
    },

    // ===== ANIMIST =====
    {
        classId: '9KiqZVG9r5g8mC4V',
        className: 'Animist',
        tradition: 'primal',
        type: 'spontaneous',
        keyAbility: 'wis',
        startingProficiency: 'trained',
        slots: SPONTANEOUS_PROGRESSION,
    },
];

/**
 * Map class ID to spellcaster config
 */
export const SPELLCASTER_CONFIG_BY_CLASS_ID: Record<string, SpellcasterClassConfig> =
    Object.fromEntries(
        SPELLCASTER_CLASSES.map(config => [config.classId, config])
    );

/**
 * Get spellcaster config for a class ID
 */
export function getSpellcasterConfig(classId: string): SpellcasterClassConfig | undefined {
    return SPELLCASTER_CONFIG_BY_CLASS_ID[classId];
}

/**
 * Check if a class is a spellcaster
 */
export function isSpellcasterClass(classId: string): boolean {
    return classId in SPELLCASTER_CONFIG_BY_CLASS_ID;
}

/**
 * Calculate spell slots for a given class and level
 * Returns a SpellSlots object with max/used for each spell level
 */
export function calculateSpellSlots(classId: string, level: number): SpellSlots {
    const config = getSpellcasterConfig(classId);
    if (!config || level < 1 || level > 20) {
        return {};
    }

    const levelIndex = level - 1;
    const levelSlots = config.slots[levelIndex];

    if (!levelSlots || levelSlots.length === 0) {
        return {};
    }

    // Convert array format to SpellSlots format
    // levelSlots[0] = slots for spell level 1, etc.
    const spellSlots: SpellSlots = {};
    for (let spellLevel = 1; spellLevel <= levelSlots.length; spellLevel++) {
        const maxSlots = levelSlots[spellLevel - 1];
        if (maxSlots > 0) {
            spellSlots[spellLevel] = {
                max: maxSlots,
                used: 0,
            };
        }
    }

    return spellSlots;
}

/**
 * Get cantrips known for a given level
 * All spellcasters get 4 cantrips (0-level spells) at level 1
 */
export function getCantripsKnown(_classId: string, level: number): number {
    // All spellcasters get 4 cantrips + 1 at level 10 (total 5)
    return level >= 10 ? 5 : 4;
}
