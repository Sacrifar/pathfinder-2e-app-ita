/**
 * Versatile Signature Utility Functions
 * Handles the Versatile Signature feat which allows changing one signature spell daily
 */

import { Character } from '@/types/character';
import { getClassNameById } from '../data/classSpecializations';

/**
 * Check if a character has the Versatile Signature feat
 */
export function hasVersatileSignature(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'versatile-signature' || feat.featId === 'toFhkS9QbObxg6cp'
    ) || false;
}

/**
 * Check if a character is a Bard with the Polymath muse
 * (prerequisite for Versatile Signature)
 */
export function hasPolymathMuse(character: Character): boolean {
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
 * Get the number of flexible signature spell slots from Versatile Signature
 *
 * @param character - The character to check
 * @returns The number of signature spells that can be changed daily (1 if has feat, 0 otherwise)
 */
export function getVersatileSignatureSlots(character: Character): number {
    if (!hasVersatileSignature(character)) {
        return 0;
    }
    return 1; // Versatile Signature allows changing 1 signature spell daily
}

/**
 * Check if a specific spell can be changed as a flexible signature spell
 * The spell must be in the repertoire and currently a signature spell
 *
 * @param character - The character to check
 * @param spellId - The ID of the spell to check
 * @returns true if this spell can be changed as a flexible signature
 */
export function canChangeAsFlexibleSignature(character: Character, spellId: string): boolean {
    if (!hasVersatileSignature(character)) {
        return false;
    }

    const knownSpells = character.spellcasting?.knownSpells || [];
    const signatureSpells = character.spellcasting?.signatureSpells || [];

    // Spell must be both in repertoire and currently a signature spell
    return knownSpells.includes(spellId) && signatureSpells.includes(spellId);
}

/**
 * Change a signature spell to a different spell from the repertoire
 *
 * @param character - The character to modify
 * @param oldSpellId - The current signature spell to replace
 * @param newSpellId - The new spell to make a signature spell (must be in repertoire)
 * @returns The updated character, or the original if the change is invalid
 */
export function changeVersatileSignatureSpell(
    character: Character,
    oldSpellId: string,
    newSpellId: string
): Character {
    if (!hasVersatileSignature(character)) {
        return character;
    }

    const knownSpells = character.spellcasting?.knownSpells || [];
    const signatureSpells = character.spellcasting?.signatureSpells || [];

    // Both spells must be in the repertoire
    if (!knownSpells.includes(oldSpellId) || !knownSpells.includes(newSpellId)) {
        return character;
    }

    // Old spell must currently be a signature spell
    if (!signatureSpells.includes(oldSpellId)) {
        return character;
    }

    // Create new signature spells array
    const newSignatureSpells = signatureSpells.map(spellId =>
        spellId === oldSpellId ? newSpellId : spellId
    );

    return {
        ...character,
        spellcasting: {
            ...character.spellcasting!,
            signatureSpells: newSignatureSpells,
        },
    };
}

/**
 * Get all spells that can be selected as flexible signature spells
 * Returns spells that are both in the repertoire and currently signature spells
 *
 * @param character - The character to check
 * @returns Array of spell IDs that can be changed
 */
export function getAvailableSignatureSpellsForChange(character: Character): string[] {
    if (!hasVersatileSignature(character)) {
        return [];
    }

    const knownSpells = character.spellcasting?.knownSpells || [];
    const signatureSpells = character.spellcasting?.signatureSpells || [];

    // Return signature spells (can change one of these to another repertoire spell)
    return signatureSpells.filter(spellId => knownSpells.includes(spellId));
}

/**
 * Get all spells that can be selected as the new signature spell
 * Returns spells in the repertoire that are not already signature spells
 *
 * @param character - The character to check
 * @returns Array of spell IDs that can become signature spells
 */
export function getAvailableRepertoireSpellsForSignature(character: Character): string[] {
    if (!hasVersatileSignature(character)) {
        return [];
    }

    const knownSpells = character.spellcasting?.knownSpells || [];
    const signatureSpells = character.spellcasting?.signatureSpells || [];

    // Return repertoire spells that are not already signature spells
    return knownSpells.filter(spellId => !signatureSpells.includes(spellId));
}

/**
 * Check if a character has made their daily Versatile Signature change
 * This would typically be tracked in the character data, but for now
 * we'll return false to allow changes (tracking could be added later)
 *
 * @param character - The character to check
 * @returns true if the daily change has been made
 */
export function hasUsedVersatileSignatureToday(character: Character): boolean {
    // TODO: Add tracking for daily usage if needed
    // For now, always return false to allow changes
    return false;
}
