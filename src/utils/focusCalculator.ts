/**
 * Focus Points Calculator
 * Calculates maximum Focus Points based on character feats and abilities
 */

import { Character } from '../types/character';

/**
 * List of feats that grant Focus Points
 * Each entry maps feat IDs to the number of Focus Points granted
 */
const FOCUS_FEATS: Record<string, number> = {
    // Cleric Domains
    'cleric-domain': 1,

    // Sorcerer Blood Magic
    'sorcerer-blood-magic': 1,

    // Wizard Focus Spell
    'wizard-focus-spell': 1,

    // Bard Muse
    'bard-muse': 1,

    // Champion Cause
    'champion-cause': 1,

    // Druid Order
    'druid-order': 1,

    // Monki Ki
    'monk-ki': 1,

    // Oracle Mystery
    'oracle-mystery': 1,

    // Psychic Conscious Mind
    'psychic-conscious-mind': 1,

    // Summoner Eidolon
    'summoner-eidolon': 1,

    // Swashbuckler Panache
    'swashbuckler-panache': 1,

    // Thaumaturge Implement
    'thaumaturge-implement': 1,

    // Geniekin Versatility
    'geniekin-versatility': 1,

    // Chosen One
    'chosen-one': 1,

    // Gortle's Yip Sigil
    'gortle-yip-sigil': 1,
};

/**
 * List of feats that grant additional Focus Points (beyond the base)
 */
const ADDITIONAL_FOCUS_FEATS: Record<string, number> = {
    'additional-focus': 1,
    'expanded-focus': 1,
};

/**
 * Calculate the maximum Focus Points for a character
 * Base: 1 per Focus feat, maximum of 3
 * Some special feats or abilities may increase this
 */
export function calculateMaxFocusPoints(character: Character): number {
    let focusPoints = 0;

    // Count Focus feats from the character's feat list
    const focusFeatIds = new Set<string>();

    for (const feat of character.feats) {
        if (FOCUS_FEATS[feat.featId]) {
            focusFeatIds.add(feat.featId);
        }
        // Check for additional focus feats
        if (ADDITIONAL_FOCUS_FEATS[feat.featId]) {
            focusPoints += ADDITIONAL_FOCUS_FEATS[feat.featId];
        }
    }

    // Add 1 point per unique Focus feat
    focusPoints += focusFeatIds.size;

    // Maximum of 3 Focus Points by default (Core Rulebook)
    // Some GM games may allow higher limits via house rules
    const maxLimit = 3;

    return Math.min(focusPoints, maxLimit);
}

/**
 * Check if a character has any Focus Point abilities
 */
export function hasFocusAbilities(character: Character): boolean {
    for (const feat of character.feats) {
        if (FOCUS_FEATS[feat.featId]) {
            return true;
        }
    }
    return false;
}

/**
 * Get the list of Focus-granting feats for a character
 */
export function getFocusFeats(character: Character): Array<{ featId: string; points: number }> {
    const focusFeats: Array<{ featId: string; points: number }> = [];

    for (const feat of character.feats) {
        if (FOCUS_FEATS[feat.featId]) {
            focusFeats.push({
                featId: feat.featId,
                points: FOCUS_FEATS[feat.featId],
            });
        }
    }

    return focusFeats;
}
