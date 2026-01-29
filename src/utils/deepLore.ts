/**
 * Deep Lore Utility Functions
 * Handles the Deep Lore feat which adds one spell of each rank to the repertoire
 */

import { Character } from '@/types/character';
import { getClassNameById } from '../data/classSpecializations';
import { getSpells, LoadedSpell } from '../data/pf2e-loader';

/**
 * Check if a character has the Deep Lore feat
 */
export function hasDeepLore(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'deep-lore' || feat.featId === 'iTtnN49D8ZJ2Ilur'
    ) || false;
}

/**
 * Check if a character meets the prerequisites for Deep Lore
 * (enigma muse + legendary in Occultism)
 *
 * @param character - The character to check
 * @returns true if the character meets the prerequisites
 */
export function meetsDeepLorePrerequisites(character: Character): boolean {
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
 * Get the number of extra spells added by Deep Lore
 * Deep Lore adds 1 spell of each rank the bard can cast
 *
 * @param character - The character to check
 * @returns The number of extra spells per spell rank (1 if has feat, 0 otherwise)
 */
export function getDeepLoreExtraSpellsPerRank(character: Character): number {
    if (!hasDeepLore(character)) {
        return 0;
    }
    return 1; // Adds 1 spell of each rank
}

/**
 * Get the maximum spell rank a Bard can cast based on their level
 * @param character - The character to check
 * @returns The maximum spell rank (1-10)
 */
export function getMaxSpellRank(character: Character): number {
    const level = character.level;
    // Bards get spell ranks at odd levels starting from 1
    // Rank 1: level 1, Rank 2: level 3, Rank 3: level 5, etc.
    return Math.floor((level + 1) / 2);
}

/**
 * Get the Deep Lore extra spells selected by the character
 * @param character - The character to check
 * @returns Object mapping rank to spell ID
 */
export function getDeepLoreExtraSpells(character: Character): Record<number, string> {
    return character.spellbook?.deepLore?.extraSpells || {};
}

/**
 * Check if a spell can be selected for Deep Lore
 * @param character - The character to check
 * @param spellId - The spell ID to check
 * @returns true if the spell can be selected
 */
export function canSelectSpellForDeepLore(character: Character, spellId: string): boolean {
    if (!hasDeepLore(character)) return false;

    const allSpells = getSpells();
    const spell = allSpells.find(s => s.id === spellId);
    if (!spell) return false;

    // Must be occult tradition
    if (!spell.traditions.includes('occult')) return false;

    // Cannot be a cantrip (rank 0) or ritual
    if (spell.rank === 0 || spell.isRitual) return false;

    // Must be able to cast spells of this rank
    const maxRank = getMaxSpellRank(character);
    if (spell.rank > maxRank) return false;

    // Cannot already be in repertoire
    const knownSpells = character.spellcasting?.knownSpells || [];
    if (knownSpells.includes(spellId)) return false;

    // Cannot already be selected for Deep Lore
    const extraSpells = getDeepLoreExtraSpells(character);
    if (Object.values(extraSpells).includes(spellId)) return false;

    return true;
}

/**
 * Get available spells that can be selected for a given rank
 * @param character - The character to check
 * @param rank - The spell rank to filter by
 * @returns Array of spells that can be selected
 */
export function getAvailableSpellsForDeepLore(character: Character, rank: number): LoadedSpell[] {
    const allSpells = getSpells();
    const knownSpells = character.spellcasting?.knownSpells || [];
    const extraSpells = getDeepLoreExtraSpells(character);
    const knownSet = new Set([...knownSpells, ...Object.values(extraSpells)]);

    return allSpells.filter(spell => {
        // Must be occult tradition
        if (!spell.traditions.includes('occult')) return false;
        // Must match rank
        if (spell.rank !== rank) return false;
        // Cannot be cantrip or ritual
        if (spell.rank === 0 || spell.isRitual) return false;
        // Cannot already be known or selected
        if (knownSet.has(spell.id)) return false;
        return true;
    });
}

/**
 * Set a Deep Lore extra spell for a specific rank
 * @param character - The character to update
 * @param rank - The spell rank
 * @param spellId - The spell ID (or null to remove)
 * @returns Updated character
 */
export function setDeepLoreExtraSpell(
    character: Character,
    rank: number,
    spellId: string | null
): Character {
    if (!hasDeepLore(character)) return character;

    const extraSpells = { ...getDeepLoreExtraSpells(character) };

    if (spellId) {
        extraSpells[rank] = spellId;
    } else {
        delete extraSpells[rank];
    }

    return {
        ...character,
        spellbook: {
            ...character.spellbook,
            deepLore: {
                ...character.spellbook?.deepLore,
                extraSpells,
            },
        },
    };
}

/**
 * Get all Deep Lore spells to add to the character's repertoire
 * @param character - The character to check
 * @returns Array of spell IDs that should be in knownSpells
 */
export function getDeepLoreSpellsForRepertoire(character: Character): string[] {
    if (!hasDeepLore(character)) return [];
    return Object.values(getDeepLoreExtraSpells(character)).filter(Boolean);
}

/**
 * Apply Deep Lore effects to a character's spellcasting
 * This should be called during character recalculation to add Deep Lore spells to knownSpells
 *
 * @param character - The character to update
 * @returns The character with Deep Lore effects applied (or unchanged if not applicable)
 */
export function applyDeepLoreEffects(character: Character): Character {
    if (!hasDeepLore(character) || !character.spellcasting) {
        return character;
    }

    const deepLoreSpells = getDeepLoreSpellsForRepertoire(character);
    const knownSpells = character.spellcasting.knownSpells || [];

    // Add Deep Lore spells to knownSpells if not already there
    const newKnownSpells = [...knownSpells];
    for (const spellId of deepLoreSpells) {
        if (!newKnownSpells.includes(spellId)) {
            newKnownSpells.push(spellId);
        }
    }

    if (newKnownSpells.length === knownSpells.length) {
        return character; // No changes
    }

    return {
        ...character,
        spellcasting: {
            ...character.spellcasting,
            knownSpells: newKnownSpells,
        },
    };
}
