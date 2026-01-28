/**
 * Focus Points Calculator
 * Calculates maximum Focus Points based on character feats and abilities
 */

import { Character } from '../types/character';
import { getClassIdByName } from '../data/classSpecializations';
import { getFeats } from '../data/pf2e-loader';

/**
 * List of classes that grant Focus Points through their class features
 * (Bard Muse, Champion Cause, Cleric Domain, etc.)
 */
const FOCUS_SPELL_CLASS_NAMES: string[] = [
    'Bard',      // Bard Muse
    'Champion',  // Champion Cause
    'Cleric',    // Cleric Domain
    'Druid',     // Druid Order
    'Monk',      // Monk Ki
    'Oracle',    // Oracle Mystery
    'Psychic',   // Psychic Conscious Mind
    'Sorcerer',  // Sorcerer Bloodline
    'Summoner',  // Summoner Eidolon
    'Swashbuckler', // Swashbuckler Panache
    'Thaumaturge', // Thaumaturge Implement
    'Wizard',    // Wizard Focus Spell
    'Gunslinger', // Gunslinger Implement
    'Kineticist', // Kineticist Impulse
];

/**
 * List of feat names that grant Focus Points
 * Using feat names instead of IDs to handle both UUID and name-based IDs
 */
const FOCUS_FEAT_NAMES: string[] = [
    // Cleric Domains
    'Cleric Domain',

    // Sorcerer Blood Magic
    'Sorcerer Blood Magic',

    // Wizard Focus Spell
    'Wizard Focus Spell',

    // Champion Cause
    'Champion Cause',

    // Druid Order
    'Druid Order',

    // Monk Ki
    'Monk Ki',

    // Oracle Mystery
    'Oracle Mystery',

    // Psychic Conscious Mind
    'Psychic Conscious Mind',

    // Summoner Eidolon
    'Summoner Eidolon',

    // Swashbuckler Panache
    'Swashbuckler Panache',

    // Thaumaturge Implement
    'Thaumaturge Implement',

    // Geniekin Versatility
    'Geniekin Versatility',

    // Chosen One
    'Chosen One',

    // Gortle's Yip Sigil
    'Gortle\'s Yip Sigil',

    // Archetype Dedications with Devotion Spells
    'Blessed One Dedication',
    'Advanced Devotion',
];

/**
 * List of feat names that grant additional Focus Points (beyond the base)
 */
const ADDITIONAL_FOCUS_FEAT_NAMES: string[] = [
    'Additional Focus',
    'Expanded Focus',
];

/**
 * Cache for feat lookups to avoid repeated getFeats() calls
 */
let allFeatsCache: Map<string, { name: string; id: string; rawId?: string }> | null = null;

function buildFeatCache(): Map<string, { name: string; id: string; rawId?: string }> {
    if (allFeatsCache) {
        return allFeatsCache;
    }

    const cache = new Map<string, { name: string; id: string; rawId?: string }>();
    const allFeats = getFeats();

    for (const feat of allFeats) {
        // Index by both ID and rawId for lookup
        cache.set(feat.id, { name: feat.name, id: feat.id, rawId: feat.rawId });
        if (feat.rawId) {
            cache.set(feat.rawId, { name: feat.name, id: feat.id, rawId: feat.rawId });
        }
    }

    allFeatsCache = cache;
    return cache;
}

/**
 * Check if a feat grants a Focus Point by looking up its name
 */
function featGrantsFocusPoint(featId: string): boolean {
    const cache = buildFeatCache();
    const feat = cache.get(featId);

    if (!feat) {
        return false;
    }

    // Check if the feat's name matches any focus-granting feat name
    return FOCUS_FEAT_NAMES.some(focusFeatName =>
        feat.name === focusFeatName
    );
}

/**
 * Check if a feat grants additional Focus Points (beyond the base)
 */
function featGrantsAdditionalFocus(featId: string): number {
    const cache = buildFeatCache();
    const feat = cache.get(featId);

    if (!feat) {
        return 0;
    }

    // Check if the feat's name matches any additional focus-granting feat name
    if (ADDITIONAL_FOCUS_FEAT_NAMES.some(featName => feat.name === featName)) {
        return 1;
    }

    return 0;
}

/**
 * Check if a character's class grants Focus Points
 */
function classGrantsFocusPoints(classId: string): boolean {
    // Try to find class by ID first, then by name
    for (const className of FOCUS_SPELL_CLASS_NAMES) {
        const id = getClassIdByName(className);
        if (id && id === classId) {
            return true;
        }
    }
    return false;
}

/**
 * Calculate the maximum Focus Points for a character
 * Base: 1 per Focus feat, maximum of 3
 * Some special feats or abilities may increase this
 */
export function calculateMaxFocusPoints(character: Character): number {
    let focusPoints = 0;

    // Count Focus feats from the character's feat list
    const focusFeatIds = new Set<string>();

    console.log('[FocusCalculator] Calculating focus points for character:', {
        classId: character.classId,
        feats: character.feats?.map(f => ({ id: f.featId, level: f.level })),
    });

    // Check if character's class grants Focus Points (Bard Muse, Champion Cause, etc.)
    if (classGrantsFocusPoints(character.classId)) {
        console.log('[FocusCalculator] Found focus spell class:', character.classId);
        focusPoints += 1;
    }

    for (const feat of character.feats) {
        // Check if this feat grants a focus point (by looking up its name)
        if (featGrantsFocusPoint(feat.featId)) {
            const cache = buildFeatCache();
            const featData = cache.get(feat.featId);
            console.log('[FocusCalculator] Found focus feat:', feat.featId, '→', featData?.name);
            focusFeatIds.add(feat.featId);
        }
        // Check for additional focus feats
        const additionalPoints = featGrantsAdditionalFocus(feat.featId);
        if (additionalPoints > 0) {
            const cache = buildFeatCache();
            const featData = cache.get(feat.featId);
            console.log('[FocusCalculator] Found additional focus feat:', feat.featId, '→', featData?.name, `(+${additionalPoints})`);
            focusPoints += additionalPoints;
        }
    }

    // Add 1 point per unique Focus feat
    focusPoints += focusFeatIds.size;

    console.log('[FocusCalculator] Total focus points:', {
        classGrant: classGrantsFocusPoints(character.classId) ? 1 : 0,
        uniqueFeats: focusFeatIds.size,
        additional: focusPoints - focusFeatIds.size - (classGrantsFocusPoints(character.classId) ? 1 : 0),
        total: focusPoints,
    });

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
        if (featGrantsFocusPoint(feat.featId)) {
            return true;
        }
    }
    return false;
}

/**
 * Get the list of Focus-granting feats for a character
 */
export function getFocusFeats(character: Character): Array<{ featId: string; featName: string; points: number }> {
    const focusFeats: Array<{ featId: string; featName: string; points: number }> = [];
    const cache = buildFeatCache();

    for (const feat of character.feats) {
        if (featGrantsFocusPoint(feat.featId)) {
            const featData = cache.get(feat.featId);
            focusFeats.push({
                featId: feat.featId,
                featName: featData?.name || feat.featId,
                points: 1,
            });
        }
    }

    return focusFeats;
}
