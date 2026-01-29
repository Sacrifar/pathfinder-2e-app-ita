/**
 * Studious Capacity Utility Functions
 * Handles the Studious Capacity feat which allows casting one spell per day without slots
 */

import { Character } from '@/types/character';
import { getClassNameById } from '../data/classSpecializations';

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
function getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
}

/**
 * Check if a character has the Studious Capacity feat
 */
export function hasStudiousCapacity(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'studious-capacity' || feat.featId === 'QGpcyvIezLMgmTia'
    ) || false;
}

/**
 * Check if a character meets the prerequisites for Studious Capacity
 * (enigma muse + legendary in Occultism)
 *
 * @param character - The character to check
 * @returns true if the character meets the prerequisites
 */
export function meetsStudiousCapacityPrerequisites(character: Character): boolean {
    const className = getClassNameById(character.classId);
    if (className !== 'Bard') return false;

    // Check for enigma muse
    const enigmaMuseIds = ['enigma'];
    const specializationId = character.classSpecializationId;
    const hasEnigmaMuse = Array.isArray(specializationId)
        ? specializationId.some(id => enigmaMuseIds.includes(id))
        : specializationId ? enigmaMuseIds.includes(specializationId) : false;

    if (!hasEnigmaMuse) return false;

    // Check for legendary Occultism
    const occultismSkill = character.skills?.find(s => s.name.toLowerCase() === 'occultism');
    return occultismSkill?.proficiency === 'legendary';
}

/**
 * Get the character's highest spell rank
 *
 * @param character - The character to check
 * @returns The highest spell rank the character can cast
 */
export function getHighestSpellRank(character: Character): number {
    if (!character.spellcasting) {
        return 0;
    }

    const spellSlots = character.spellcasting.spellSlots || {};
    const ranks = Object.keys(spellSlots).map(Number).filter(r => r > 0);

    if (ranks.length === 0) {
        return 0;
    }

    return Math.max(...ranks);
}

/**
 * Check if a spell can be cast using Studious Capacity
 * Cannot be used for the highest spell rank
 *
 * @param character - The character to check
 * @param spellRank - The rank of the spell to cast
 * @returns true if the spell can be cast using Studious Capacity
 */
export function canCastWithStudiousCapacity(character: Character, spellRank: number): boolean {
    if (!hasStudiousCapacity(character)) {
        return false;
    }

    const highestRank = getHighestSpellRank(character);

    // Cannot use for highest spell rank
    if (spellRank >= highestRank) {
        return false;
    }

    // Must have spell slots for this rank (to have exhausted them)
    const spellSlots = character.spellcasting?.spellSlots || {};
    const slots = spellSlots[spellRank];

    if (!slots || slots.max === 0) {
        return false;
    }

    return true;
}

/**
 * Check if Studious Capacity has been used today
 *
 * @param character - The character to check
 * @returns true if already used today
 */
export function hasUsedStudiousCapacityToday(character: Character): boolean {
    const usage = character.dailyFeatUses?.studiousCapacity;
    if (!usage) return false;

    const today = getTodayDate();
    return usage.used && usage.lastUsed === today;
}

/**
 * Use Studious Capacity to cast a spell
 *
 * @param character - The character using the feat
 * @param spellRank - The rank of the spell being cast
 * @returns The updated character with usage tracked, or original if invalid
 */
export function useStudiousCapacity(character: Character, spellRank: number): Character {
    if (!hasStudiousCapacity(character)) {
        return character;
    }

    if (!canCastWithStudiousCapacity(character, spellRank)) {
        return character;
    }

    if (hasUsedStudiousCapacityToday(character)) {
        return character;
    }

    const today = getTodayDate();

    return {
        ...character,
        dailyFeatUses: {
            ...character.dailyFeatUses,
            studiousCapacity: {
                used: true,
                lastUsed: today,
            },
        },
    };
}

/**
 * Reset Studious Capacity usage (called during daily preparations)
 *
 * @param character - The character to reset
 * @returns The character with Studious Capacity reset
 */
export function resetStudiousCapacity(character: Character): Character {
    if (!hasStudiousCapacity(character)) {
        return character;
    }

    const usage = character.dailyFeatUses?.studiousCapacity;
    if (!usage) return character;

    const today = getTodayDate();
    if (usage.lastUsed !== today) {
        // Already reset (different day)
        return character;
    }

    return {
        ...character,
        dailyFeatUses: {
            ...character.dailyFeatUses,
            studiousCapacity: {
                used: false,
                lastUsed: undefined,
            },
        },
    };
}

/**
 * Get all spell ranks that can be used with Studious Capacity
 * (all ranks except the highest)
 *
 * @param character - The character to check
 * @returns Array of valid spell ranks
 */
export function getStudiousCapacityValidRanks(character: Character): number[] {
    if (!hasStudiousCapacity(character)) {
        return [];
    }

    const highestRank = getHighestSpellRank(character);
    const spellSlots = character.spellcasting?.spellSlots || {};

    // Return all ranks except the highest
    return Object.keys(spellSlots)
        .map(Number)
        .filter(r => r > 0 && r < highestRank);
}
