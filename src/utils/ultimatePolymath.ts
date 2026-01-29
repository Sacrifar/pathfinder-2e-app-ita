/**
 * Ultimate Polymath Utility Functions
 * Handles the Ultimate Polymath feat which makes all repertoire spells signature spells
 */

import { Character } from '@/types/character';
import { getClassNameById } from '../data/classSpecializations';

/**
 * Check if a character has the Ultimate Polymath feat
 */
export function hasUltimatePolymath(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'ultimate-polymath' || feat.featId === 'QSBuAkJ5GMLcuZg9'
    ) || false;
}

/**
 * Check if a character is a Bard with the Polymath muse
 * (prerequisite for Ultimate Polymath)
 */
export function hasPolymathMuseForUltimate(character: Character): boolean {
    const className = getClassNameById(character.classId);
    if (className !== 'Bard') return false;

    // Check if Polymath muse is selected
    const polymathMuseIds = [
        'z9QXwXcGB9rwYWDm', // Polymath muse (old ID)
        'polymath', // Polymath muse (new ID)
    ];

    const specializationId = character.classSpecializationId;
    if (Array.isArray(specializationId)) {
        return specializationId.some(id => polymathMuseIds.includes(id));
    }

    return specializationId ? polymathMuseIds.includes(specializationId) : false;
}

/**
 * Get the effective signature spells for a character
 * If the character has Ultimate Polymath, all repertoire spells are signature spells
 *
 * @param character - The character to check
 * @returns Array of signature spell IDs
 */
export function getEffectiveSignatureSpells(character: Character): string[] {
    if (!hasUltimatePolymath(character)) {
        // Return normal signature spells
        return character.spellcasting?.signatureSpells || [];
    }

    // Ultimate Polymath: all repertoire spells are signature spells
    const knownSpells = character.spellcasting?.knownSpells || [];
    return [...knownSpells];
}

/**
 * Apply Ultimate Polymath effects to a character's spellcasting
 * Makes all repertoire spells signature spells
 *
 * @param character - The character to update
 * @returns The updated character with all spells as signature spells (or unchanged if not applicable)
 */
export function applyUltimatePolymathEffects(character: Character): Character {
    if (!hasUltimatePolymath(character) || !character.spellcasting) {
        return character;
    }

    const knownSpells = character.spellcasting.knownSpells || [];

    // Set all repertoire spells as signature spells
    return {
        ...character,
        spellcasting: {
            ...character.spellcasting,
            signatureSpells: [...knownSpells],
        },
    };
}

/**
 * Check if a specific spell is a signature spell
 * Takes Ultimate Polymath into account
 *
 * @param character - The character to check
 * @param spellId - The spell ID to check
 * @returns true if the spell is a signature spell
 */
export function isSignatureSpell(character: Character, spellId: string): boolean {
    const effectiveSignatures = getEffectiveSignatureSpells(character);
    return effectiveSignatures.includes(spellId);
}
