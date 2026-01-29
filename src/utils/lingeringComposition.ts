/**
 * Lingering Composition Utility Functions
 * Handles the Lingering Composition feat which grants the Lingering Composition focus spell
 */

import { Character } from '@/types/character';
import { getClassNameById } from '../data/classSpecializations';

/**
 * Check if a character has the Lingering Composition feat
 */
export function hasLingeringComposition(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'lingering-composition' || feat.featId === 'sVjATEo8eqkAosNp'
    ) || false;
}

/**
 * Check if a character has the Maestro muse (prerequisite for Lingering Composition)
 *
 * @param character - The character to check
 * @returns true if the character has the Maestro muse
 */
export function hasMaestroMuse(character: Character): boolean {
    const className = getClassNameById(character.classId);
    if (className !== 'Bard') return false;

    // Check if Maestro muse is selected
    const maestroMuseIds = [
        'maestro', // Maestro muse (new ID)
    ];

    const specializationId = character.classSpecializationId;
    if (Array.isArray(specializationId)) {
        return specializationId.some(id => maestroMuseIds.includes(id));
    }

    return specializationId ? maestroMuseIds.includes(specializationId) : false;
}

/**
 * Check if Lingering Composition focus spell should be in the character's focus spells
 * The feat grants this focus spell automatically
 *
 * @param character - The character to check
 * @returns true if the character should have Lingering Composition focus spell
 */
export function shouldHaveLingeringCompositionFocusSpell(character: Character): boolean {
    return hasLingeringComposition(character);
}

/**
 * Get the Lingering Composition focus spell ID
 * This would be the actual spell ID from the pf2e data
 *
 * @returns The spell ID for Lingering Composition
 */
export function getLingeringCompositionSpellId(): string {
    // This is the Foundry ID for the Lingering Composition focus spell
    return 'Lingering Composition'; // Placeholder - actual ID would come from pf2e data
}

/**
 * Add Lingering Composition focus spell to a character
 * This is called during character recalculation when the feat is present
 *
 * @param character - The character to update
 * @returns The updated character with the focus spell added
 */
export function addLingeringCompositionFocusSpell(character: Character): Character {
    if (!shouldHaveLingeringCompositionFocusSpell(character)) {
        // If feat is removed, the focus spell should also be removed
        // This would be handled by the normal focus spell processing
        return character;
    }

    const spellId = getLingeringCompositionSpellId();

    if (!character.spellcasting) {
        return character;
    }

    const focusSpells = character.spellcasting.focusSpells || [];

    // Add the focus spell if not already present
    if (!focusSpells.includes(spellId)) {
        return {
            ...character,
            spellcasting: {
                ...character.spellcasting,
                focusSpells: [...focusSpells, spellId],
            },
        };
    }

    return character;
}
