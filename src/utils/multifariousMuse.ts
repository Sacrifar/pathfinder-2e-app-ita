/**
 * Multifarious Muse Utility Functions
 * Handles the Multifarious Muse feat which allows selecting multiple muses
 */

import { Character } from '@/types/character';
import { getClassNameById } from '../data/classSpecializations';

/**
 * Check if a character has the Multifarious Muse feat
 */
export function hasMultifariousMuse(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'multifarious-muse' || feat.featId === 'a898miJnjgD93ZsX'
    ) || false;
}

/**
 * Get the number of times Multifarious Muse has been taken (max 3)
 *
 * @param character - The character to check
 * @returns The number of times the feat has been taken
 */
export function getMultifariousMuseCount(character: Character): number {
    return character.feats?.filter(feat =>
        feat.featId === 'multifarious-muse' || feat.featId === 'a898miJnjgD93ZsX'
    ).length || 0;
}

/**
 * Get all additional muses from Multifarious Muse feats
 *
 * @param character - The character to check
 * @returns Array of additional muse IDs (excludes the primary muse)
 */
export function getAdditionalMuses(character: Character): string[] {
    if (!hasMultifariousMuse(character)) {
        return [];
    }

    // Get the additional muse selections from feat choices
    const additionalMuses: string[] = [];

    const multifariousFeats = character.feats?.filter(feat =>
        feat.featId === 'multifarious-muse' || feat.featId === 'a898miJnjgD93ZsX'
    ) || [];

    for (const feat of multifariousFeats) {
        // The feat choices should contain the selected muse
        if (feat.choices && feat.choices.length > 0) {
            // The muse choice would be stored in feat.choices
            // This depends on how featChoices.ts stores the selections
            additionalMuses.push(...feat.choices.filter(c => c && c !== character.classSpecializationId));
        }
    }

    return additionalMuses;
}

/**
 * Check if a character has a specific muse (including additional muses from Multifarious Muse)
 *
 * @param character - The character to check
 * @param museId - The muse ID to check
 * @returns true if the character has that muse
 */
export function hasMuse(character: Character, museId: string): boolean {
    const primaryMuse = character.classSpecializationId;

    // Check primary muse
    if (Array.isArray(primaryMuse)) {
        if (primaryMuse.includes(museId)) return true;
    } else if (primaryMuse === museId) {
        return true;
    }

    // Check additional muses from Multifarious Muse
    const additionalMuses = getAdditionalMuses(character);
    return additionalMuses.includes(museId);
}

/**
 * Get all muses a character has (primary + additional from Multifarious Muse)
 *
 * @param character - The character to check
 * @returns Array of all muse IDs the character has
 */
export function getAllMuses(character: Character): string[] {
    const allMuses: string[] = [];

    // Add primary muse
    const primaryMuse = character.classSpecializationId;
    if (Array.isArray(primaryMuse)) {
        allMuses.push(...primaryMuse);
    } else if (primaryMuse) {
        allMuses.push(primaryMuse);
    }

    // Add additional muses
    allMuses.push(...getAdditionalMuses(character));

    return allMuses;
}

/**
 * Check if a character can take a feat that requires a specific muse
 * This accounts for Multifarious Muse granting additional muses
 *
 * @param character - The character to check
 * @param requiredMuseId - The muse required by the feat
 * @returns true if the character meets the muse prerequisite
 */
export function meetsMusePrerequisite(character: Character, requiredMuseId: string): boolean {
    return hasMuse(character, requiredMuseId);
}

/**
 * Get the feats granted by Multifarious Muse
 * Each instance of the feat grants a 1st-level feat requiring the selected muse
 *
 * @param character - The character to check
 * @returns Array of feat IDs granted by Multifarious Muse
 */
export function getMultifariousMuseGrantedFeats(character: Character): string[] {
    const grantedFeats: string[] = [];

    const multifariousFeats = character.feats?.filter(feat =>
        feat.featId === 'multifarious-muse' || feat.featId === 'a898miJnjgD93ZsX'
    ) || [];

    for (const feat of multifariousFeats) {
        // The granted feat would be stored in feat choices
        // This depends on how featChoices.ts handles GrantItem rules
        if (feat.choices && feat.choices.length > 1) {
            // The second choice would be the granted feat
            grantedFeats.push(feat.choices[1]);
        }
    }

    return grantedFeats;
}

/**
 * Check if a character has reached the maximum number of Multifarious Muse feats
 * Maximum is 3 (as per maxTakable in the JSON)
 *
 * @param character - The character to check
 * @returns true if the character has taken Multifarious Muse 3 times
 */
export function hasMaxMultifariousMuse(character: Character): boolean {
    return getMultifariousMuseCount(character) >= 3;
}

/**
 * Get available muse options for Multifarious Muse
 * Returns all muses except the character's primary muse and any already selected additional muses
 *
 * @param character - The character to check
 * @returns Array of available muse IDs
 */
export function getAvailableMusesForMultifarious(character: Character): string[] {
    // All bard muses
    const allMuseIds = [
        'polymath', 'polymath',
        'enigma', 'enigma',
        'maestro', 'maestro',
    ];

    const primaryMuse = character.classSpecializationId;
    const additionalMuses = getAdditionalMuses(character);

    // Filter out primary muse and already selected additional muses
    return allMuseIds.filter(muse => {
        if (Array.isArray(primaryMuse)) {
            if (primaryMuse.includes(muse)) return false;
        } else if (primaryMuse === muse) {
            return false;
        }
        return !additionalMuses.includes(muse);
    });
}
