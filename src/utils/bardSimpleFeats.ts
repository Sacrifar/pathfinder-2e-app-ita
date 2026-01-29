/**
 * Bard Simple Feats Utility Functions
 * Consolidated utility functions for Bard feats that are primarily
 * handled by JSON rules but need helper functions for validation/queries
 */

import { Character } from '@/types/character';
import { getClassNameById } from '../data/classSpecializations';

// ============================================
// MARTIAL PERFORMANCE (Level 1)
// ============================================

export function hasMartialPerformance(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'martial-performance' || feat.featId === 'G6PHJ0zRA87wR1hV'
    ) || false;
}

// ============================================
// WELL-VERSED (Level 1)
// ============================================

export function hasWellVersed(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'well-versed' || feat.featId === 'iX5HEqRImhKzfPR2'
    ) || false;
}

// The +1 circumstance bonus to saves is handled by JSON FlatModifier rules

// ============================================
// ZOOPHONIC COMMUNICATION (Level 1)
// ============================================

export function hasZoophonicCommunication(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'zoophonic-communication' || feat.featId === 'I8lFOrVJvxxLsxRR'
    ) || false;
}

// ============================================
// HYMN OF HEALING (Level 1)
// ============================================

export function hasHymnOfHealing(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'hymn-of-healing' || feat.featId === 'aM5WuPiLRzOVsu2s'
    ) || false;
}

// ============================================
// BESTIAL SNARLING (Level 2)
// ============================================

export function hasBestialSnarling(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'bestial-snarling' || feat.featId === 'nCmsylaV144Pr4TZ'
    ) || false;
}

// ============================================
// SONG OF STRENGTH (Level 2)
// ============================================

export function hasSongOfStrength(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'song-of-strength' || feat.featId === 'FkN9QX1W2Iv56bkn'
    ) || false;
}

// ============================================
// COMBAT READING (Level 4)
// ============================================

export function hasCombatReading(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'combat-reading' || feat.featId === 'xtr5fv71B6tDXHYp0'
    ) || false;
}

// ============================================
// COURAGEOUS ADVANCE (Level 4)
// ============================================

export function hasCourageousAdvance(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'courageous-advance' || feat.featId === 'qFLpQdDd6Zr3I8sL'
    ) || false;
}

// ============================================
// IN TUNE (Level 4)
// ============================================

export function hasInTune(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'in-tune' || feat.featId === 'zZ2vkXCRy2YLi89i'
    ) || false;
}

// ============================================
// MELODIOUS SPELL (Level 4)
// ============================================

export function hasMelodiousSpell(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'melodious-spell' || feat.featId === 'SqM2jLXlnCBMA5lX'
    ) || false;
}

// ============================================
// RALLYING ANTHEM (Level 4)
// ============================================

export function hasRallyingAnthem(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'rallying-anthem' || feat.featId === 'JfAnm8Olmn3u2Q9R'
    ) || false;
}

// ============================================
// TRIPLE TIME (Level 4)
// ============================================

export function hasTripleTime(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'triple-time' || feat.featId === 'o1FpMD5u45wRWF5u'
    ) || false;
}

// ============================================
// ZOOPHONIC COMPOSITION (Level 4)
// ============================================

export function hasZoophonicComposition(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'zoophonic-composition' || feat.featId === 'yJVbDAhpTx8vIR71u'
    ) || false;
}

// ============================================
// DEFENSIVE COORDINATION (Level 6)
// ============================================

export function hasDefensiveCoordination(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'defensive-coordination' || feat.featId === 'YNRGmETR7GWrhcOe'
    ) || false;
}

// ============================================
// DIRGE OF DOOM (Level 6)
// ============================================

export function hasDirgeOfDoom(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'dirge-of-doom' || feat.featId === 'KnqVHv2vF1RIqWN6'
    ) || false;
}

// ============================================
// EDUCATE ALLIES (Level 6)
// ============================================

export function hasEducateAllies(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'educate-allies' || feat.featId === 'L0EqJp4tOMqCNaRC'
    ) || false;
}

// ============================================
// HARMONIZE (Level 6)
// ============================================

export function hasHarmonize(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'harmonize' || feat.featId === '3wqB03U19mR9FMTt'
    ) || false;
}

// ============================================
// SONG OF MARCHING (Level 6)
// ============================================

export function hasSongOfMarching(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'song-of-marching' || feat.featId === 'aVfLJQhPmpBfv8C6'
    ) || false;
}

// ============================================
// ACCOMPANY (Level 8)
// ============================================

export function hasAccompany(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'accompany' || feat.featId === '6F9G3y7yOBnZpPM2'
    ) || false;
}

// ============================================
// CALL AND RESPONSE (Level 8)
// ============================================

export function hasCallAndResponse(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'call-and-response' || feat.featId === 'z5sjteOUYjyOfwIq'
    ) || false;
}

// ============================================
// FORTISSIMO COMPOSITION (Level 8)
// ============================================

export function hasFortissimoComposition(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'fortissimo-composition' || feat.featId === '3T3e3e8jCB9uGumL'
    ) || false;
}

// ============================================
// REFLEXIVE COURAGE (Level 8)
// ============================================

export function hasReflexiveCourage(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'reflexive-courage' || feat.featId === 'OVhOsOQPkyL3OVl0'
    ) || false;
}

// ============================================
// EARS OF THE FOREST (Level 8)
// ============================================

export function hasEarsOfTheForest(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'ears-of-the-forest' || feat.featId === 'M5LgVNEbJeMoTMd5'
    ) || false;
}

// ============================================
// SONGBIRD'S CALL (Level 8)
// ============================================

export function hasSongbirdsCall(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'songbirds-call' || feat.featId === 'NfZKocqIKG2Iychg'
    ) || false;
}

// ============================================
// CHORUS COMPANION (Level 12)
// ============================================

export function hasChorusCompanion(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'chorus-companion' || feat.featId === 'c6vqVL15nSP6lVAB'
    ) || false;
}

// ============================================
// COURAGEOUS ASSAULT (Level 10)
// ============================================

export function hasCourageousAssault(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'courageous-assault' || feat.featId === 'Asb0UsQqeATsxqFJ'
    ) || false;
}

// ============================================
// MUSICAL SUMMONS (Level 14)
// ============================================

export function hasMusicalSummons(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'musical-summons' || feat.featId === '4Gl55zsGU6TkSKOJ'
    ) || false;
}

// ============================================
// TRIUMPHANT INSPIRATION (Level 14)
// ============================================

export function hasTriumphantInspiration(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'triumphant-inspiration' || feat.featId === 'RHLfM9NlIlHTH85w'
    ) || false;
}

// ============================================
// VIGOROUS ANTHEM (Level 14)
// ============================================

export function hasVigorousAnthem(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'vigorous-anthem' || feat.featId === 'kPBEnS1H0wjUBWMS'
    ) || false;
}

// ============================================
// RESOUNDING FINALE (Level 16)
// ============================================

export function hasResoundingFinale(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'resounding-finale' || feat.featId === 'fXgLm39gDNUJYOCi'
    ) || false;
}

// ============================================
// ETERNAL COMPOSITION (Level 18)
// ============================================

export function hasEternalComposition(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'eternal-composition' || feat.featId === 'x5aWY3fwdRDEf1RUX'
    ) || false;
}

// ============================================
// PACK PERFORMANCE (Level 18)
// ============================================

export function hasPackPerformance(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'pack-performance' || feat.featId === 'CGvN4xaahJegFwnX'
    ) || false;
}

// ============================================
// GENERAL HELPER FUNCTIONS
// ============================================

/**
 * Get all Bard feats a character has that need special tracking
 * (for UI purposes, daily tracking, etc.)
 *
 * @param character - The character to check
 * @returns Object with feat names as keys and presence as values
 */
export function getBardFeatTrackingInfo(character: Character): Record<string, boolean> {
    return {
        // Feats with daily usage tracking
        studiousCapacity: hasStudiousCapacity(character),
        versatileSignature: hasVersatileSignature(character),
        trueHypercognition: hasTrueHypercognition(character),

        // Feats with special mechanics
        esotericPolymath: hasEsotericPolymath(character),
        multifariousMuse: hasMultifariousMuse(character),
        lingeringComposition: hasLingeringComposition(character),
    };
}

// Import from other files
import { hasStudiousCapacity } from './studiousCapacity';
import { hasVersatileSignature } from './versatileSignature';
import { hasTrueHypercognition } from './trueHypercognition';
import { hasEsotericPolymath } from './esotericPolymath';
import { hasMultifariousMuse } from './multifariousMuse';
import { hasLingeringComposition } from './lingeringComposition';
