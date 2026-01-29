/**
 * True Hypercognition Utility Functions
 * Handles the True Hypercognition feat which allows instant Recall Knowledge actions
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
 * Check if a character has the True Hypercognition feat
 */
export function hasTrueHypercognition(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'true-hypercognition' || feat.featId === 'Xk9inG3pln4UKbs3'
    ) || false;
}

/**
 * Get the number of instant Recall Knowledge actions available from True Hypercognition
 *
 * @param character - The character to check
 * @returns The number of instant actions available (up to 5)
 */
export function getTrueHypercognitionActions(character: Character): number {
    if (!hasTrueHypercognition(character)) {
        return 0;
    }
    return 5; // True Hypercognition grants 5 instant Recall Knowledge actions
}

/**
 * Get the remaining (unused) True Hypercognition actions for today
 *
 * @param character - The character to check
 * @returns Array of action numbers (1-5) that are still available
 */
export function getAvailableTrueHypercognitionActions(character: Character): number[] {
    if (!hasTrueHypercognition(character)) {
        return [];
    }

    const tracking = character.dailyFeatUses?.trueHypercognition;
    if (!tracking) {
        // No tracking yet - all 5 actions available
        return [1, 2, 3, 4, 5];
    }

    const today = getTodayDate();
    if (tracking.lastReset !== today) {
        // Reset needed - all 5 actions available
        return [1, 2, 3, 4, 5];
    }

    // Return actions that haven't been used
    const usedSet = new Set(tracking.actionsUsed);
    return [1, 2, 3, 4, 5].filter(n => !usedSet.has(n));
}

/**
 * Check if a character can use True Hypercognition for a Recall Knowledge action
 *
 * @param character - The character to check
 * @returns true if True Hypercognition can be used
 */
export function canUseTrueHypercognition(character: Character): boolean {
    return getAvailableTrueHypercognitionActions(character).length > 0;
}

/**
 * Use one True Hypercognition action
 *
 * @param character - The character using the action
 * @param actionNumber - Which action to use (1-5)
 * @returns The updated character with action used, or original if invalid
 */
export function useTrueHypercognitionAction(character: Character, actionNumber: number): Character {
    if (!hasTrueHypercognition(character)) {
        return character;
    }

    if (actionNumber < 1 || actionNumber > 5) {
        return character;
    }

    const today = getTodayDate();
    const tracking = character.dailyFeatUses?.trueHypercognition;
    const currentUsed = tracking?.lastReset === today ? tracking.actionsUsed : [];
    const usedSet = new Set(currentUsed);

    if (usedSet.has(actionNumber)) {
        // Already used this action today
        return character;
    }

    return {
        ...character,
        dailyFeatUses: {
            ...character.dailyFeatUses,
            trueHypercognition: {
                actionsUsed: [...currentUsed, actionNumber],
                lastReset: today,
            },
        },
    };
}

/**
 * Reset True Hypercognition actions (called during daily preparations)
 *
 * @param character - The character to reset
 * @returns The character with actions reset
 */
export function resetTrueHypercognitionActions(character: Character): Character {
    if (!hasTrueHypercognition(character)) {
        return character;
    }

    const tracking = character.dailyFeatUses?.trueHypercognition;
    if (!tracking) return character;

    const today = getTodayDate();
    if (tracking.lastReset === today) {
        // Already reset today
        return character;
    }

    return {
        ...character,
        dailyFeatUses: {
            ...character.dailyFeatUses,
            trueHypercognition: {
                actionsUsed: [],
                lastReset: today,
            },
        },
    };
}

/**
 * Check if special abilities can trigger with True Hypercognition
 * They cannot - this is explicitly stated in the feat
 *
 * @returns always false (special abilities cannot trigger)
 */
export function canTriggerSpecialAbilitiesWithTrueHypercognition(): boolean {
    return false; // Special abilities cannot trigger with True Hypercognition
}
