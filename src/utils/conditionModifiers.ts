/**
 * Condition Modifiers Utility
 * Calculates penalties from active conditions and applies them to stats
 */

import { getConditions } from '../data/pf2e-loader';
import { AbilityName } from '../types';

export interface ConditionPenalties {
    all: number;           // Frightened, Sickened - applies to everything
    dexBased: number;      // Clumsy - AC, Reflex, DEX skills
    strBased: number;      // Enfeebled - STR skills, melee damage
    conBased: number;      // Constitution-based
    intBased: number;      // Stupefied - INT skills, spell DC
    wisBased: number;      // Wisdom-based
    chaBased: number;      // Charisma-based
    attack: number;        // Attack rolls only
    ac: number;            // AC only
    savingThrow: number;   // Saves only
    perception: number;    // Perception only
    speed: number;         // Speed only
}

const EMPTY_PENALTIES: ConditionPenalties = {
    all: 0,
    dexBased: 0,
    strBased: 0,
    conBased: 0,
    intBased: 0,
    wisBased: 0,
    chaBased: 0,
    attack: 0,
    ac: 0,
    savingThrow: 0,
    perception: 0,
    speed: 0,
};

/**
 * Calculate all penalties from active conditions
 */
export function calculateConditionPenalties(
    activeConditions: { id: string; value?: number }[]
): ConditionPenalties {
    if (!activeConditions || activeConditions.length === 0) {
        return { ...EMPTY_PENALTIES };
    }

    const allConditions = getConditions();
    const penalties = { ...EMPTY_PENALTIES };

    for (const active of activeConditions) {
        const conditionData = allConditions.find(c => c.id === active.id);
        if (!conditionData) continue;

        // Get the effective value for this condition
        const conditionValue = active.value ?? conditionData.value ?? 1;

        for (const rule of conditionData.rules) {
            // Calculate the actual penalty value
            // If rule.value is -1, it's a formula using the condition value
            const penaltyValue = rule.value === -1 ? -conditionValue : rule.value;

            // Apply to the appropriate category
            switch (rule.selector) {
                case 'all':
                    penalties.all = Math.min(penalties.all, penaltyValue);
                    break;
                case 'dex-based':
                    penalties.dexBased = Math.min(penalties.dexBased, penaltyValue);
                    break;
                case 'str-based':
                    penalties.strBased = Math.min(penalties.strBased, penaltyValue);
                    break;
                case 'con-based':
                    penalties.conBased = Math.min(penalties.conBased, penaltyValue);
                    break;
                case 'int-based':
                    penalties.intBased = Math.min(penalties.intBased, penaltyValue);
                    break;
                case 'wis-based':
                    penalties.wisBased = Math.min(penalties.wisBased, penaltyValue);
                    break;
                case 'cha-based':
                    penalties.chaBased = Math.min(penalties.chaBased, penaltyValue);
                    break;
                case 'attack':
                    penalties.attack = Math.min(penalties.attack, penaltyValue);
                    break;
                case 'ac':
                    penalties.ac = Math.min(penalties.ac, penaltyValue);
                    break;
                case 'saving-throw':
                    penalties.savingThrow = Math.min(penalties.savingThrow, penaltyValue);
                    break;
                case 'perception':
                    penalties.perception = Math.min(penalties.perception, penaltyValue);
                    break;
                case 'speed':
                    penalties.speed = Math.min(penalties.speed, penaltyValue);
                    break;
            }
        }
    }

    return penalties;
}

/**
 * Get penalty for a specific skill based on its key ability
 */
export function getSkillPenalty(
    skillAbility: AbilityName,
    penalties: ConditionPenalties
): number {
    let total = penalties.all;

    switch (skillAbility) {
        case 'dex':
            total += penalties.dexBased;
            break;
        case 'str':
            total += penalties.strBased;
            break;
        case 'con':
            total += penalties.conBased;
            break;
        case 'int':
            total += penalties.intBased;
            break;
        case 'wis':
            total += penalties.wisBased;
            break;
        case 'cha':
            total += penalties.chaBased;
            break;
    }

    return total;
}

/**
 * Get total AC penalty (includes all + dex-based + ac-specific)
 */
export function getACPenalty(penalties: ConditionPenalties): number {
    return penalties.all + penalties.dexBased + penalties.ac;
}

/**
 * Get perception penalty
 */
export function getPerceptionPenalty(penalties: ConditionPenalties): number {
    return penalties.all + penalties.wisBased + penalties.perception;
}

/**
 * Get save penalty (for a specific save type)
 */
export function getSavePenalty(
    saveAbility: 'con' | 'dex' | 'wis',
    penalties: ConditionPenalties
): number {
    let total = penalties.all + penalties.savingThrow;

    switch (saveAbility) {
        case 'dex': // Reflex
            total += penalties.dexBased;
            break;
        case 'con': // Fortitude
            total += penalties.conBased;
            break;
        case 'wis': // Will
            total += penalties.wisBased;
            break;
    }

    return total;
}

/**
 * Get attack roll penalty
 */
export function getAttackPenalty(penalties: ConditionPenalties): number {
    return penalties.all + penalties.attack;
}

/**
 * Check if any penalty is active
 */
export function hasAnyPenalty(penalties: ConditionPenalties): boolean {
    return Object.values(penalties).some(v => v < 0);
}
