/**
 * Spellcasting Initialization Utility
 *
 * Automatically initializes spellcasting data for spellcaster classes
 * when the class is selected or the level changes.
 */

import { Character, SpellSlots } from '../types';
import {
    isSpellcasterClass,
    getSpellcasterConfig,
    calculateSpellSlots,
    getCantripsKnown,
    getSorcererTraditionForBloodline,
    type SpellcasterClassConfig,
} from '../data/spellSlotProgression';
import { getClassNameById } from '../data/classSpecializations';

/**
 * Initialize or update spellcasting data for a spellcaster class
 *
 * This function:
 * 1. Checks if the class is a spellcaster
 * 2. Initializes spellcasting structure if not present
 * 3. Updates spell slots based on level
 * 4. For Sorcerers, determines tradition from bloodline
 * 5. Preserves existing spells and focus pool
 *
 * @param character - The character to update
 * @returns Updated character with spellcasting data
 */
export function initializeSpellcastingForClass(character: Character): Character {
    const { classId, level } = character;

    // Check if this is a spellcaster class
    if (!isSpellcasterClass(classId)) {
        // Not a spellcaster - remove spellcasting data if present
        if (character.spellcasting) {
            const { spellcasting, ...rest } = character;
            return rest as Character;
        }
        return character;
    }

    const config = getSpellcasterConfig(classId);
    if (!config) {
        return character;
    }

    // Calculate spell slots for current level
    const spellSlots = calculateSpellSlots(classId, level);

    // Get cantrips known
    const cantripsKnown = getCantripsKnown(classId, level);

    // Preserve existing spellcasting data where possible
    const existingSpellcasting = character.spellcasting;

    // Determine tradition (varies by bloodline for sorcerers)
    let tradition = config.tradition;
    const className = getClassNameById(classId);

    // For Sorcerers, check if a bloodline is selected and use its tradition
    if (className === 'Sorcerer' && character.classSpecializationId) {
        const bloodlineId = character.classSpecializationId as string;
        const bloodlineTradition = getSorcererTraditionForBloodline(bloodlineId);
        if (bloodlineTradition) {
            tradition = bloodlineTradition;
        }
    }

    // Initialize or update spellcasting
    const updated: Character = {
        ...character,
        spellcasting: {
            tradition,
            spellcastingType: config.type,
            keyAbility: config.keyAbility,
            proficiency: config.startingProficiency,
            spellSlots,
            // Preserve existing spells and focus pool, or initialize new ones
            knownSpells: existingSpellcasting?.knownSpells || [],
            preparedSpells: existingSpellcasting?.preparedSpells,
            focusPool: existingSpellcasting?.focusPool || { current: 1, max: 1 },
            focusSpells: existingSpellcasting?.focusSpells || [],
            rituals: existingSpellcasting?.rituals || [],
        },
    };

    return updated;
}

/**
 * Update spell slots when level changes
 * Preserves used slot counts while updating max slots
 * Also updates tradition for sorcerers if bloodline changes
 *
 * @param character - The character to update
 * @returns Updated character with recalculated spell slots
 */
export function updateSpellSlotsForLevel(character: Character): Character {
    const { classId, level } = character;

    if (!character.spellcasting || !isSpellcasterClass(classId)) {
        return character;
    }

    const newSpellSlots = calculateSpellSlots(classId, level);

    // Preserve used counts from existing slots
    const updatedSpellSlots: SpellSlots = {};
    for (const [spellLevel, slotData] of Object.entries(newSpellSlots)) {
        const levelNum = parseInt(spellLevel, 10);
        const existingUsed = character.spellcasting?.spellSlots[levelNum]?.used || 0;

        updatedSpellSlots[levelNum] = {
            max: slotData.max,
            used: Math.min(existingUsed, slotData.max), // Ensure used doesn't exceed new max
        };
    }

    // Update tradition for sorcerers if bloodline is selected
    let tradition = character.spellcasting.tradition;
    const className = getClassNameById(classId);

    if (className === 'Sorcerer' && character.classSpecializationId) {
        const bloodlineId = character.classSpecializationId as string;
        const bloodlineTradition = getSorcererTraditionForBloodline(bloodlineId);
        if (bloodlineTradition) {
            tradition = bloodlineTradition;
        }
    }

    return {
        ...character,
        spellcasting: {
            ...character.spellcasting,
            tradition,
            spellSlots: updatedSpellSlots,
        },
    };
}

/**
 * Reset all spell slot usage to 0
 * Called after a rest
 *
 * @param character - The character to update
 * @returns Updated character with reset spell slots
 */
export function resetSpellSlotUsage(character: Character): Character {
    if (!character.spellcasting) {
        return character;
    }

    const resetSpellSlots: SpellSlots = {};
    for (const [spellLevel, slotData] of Object.entries(character.spellcasting.spellSlots)) {
        resetSpellSlots[parseInt(spellLevel, 10)] = {
            max: slotData.max,
            used: 0,
        };
    }

    return {
        ...character,
        spellcasting: {
            ...character.spellcasting,
            spellSlots: resetSpellSlots,
        },
    };
}

/**
 * Get spellcasting config for a class (utility function)
 */
export function getClassSpellcastingConfig(classId: string): SpellcasterClassConfig | undefined {
    return getSpellcasterConfig(classId);
}
