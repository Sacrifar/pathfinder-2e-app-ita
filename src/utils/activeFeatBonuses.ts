/**
 * Active Feat Bonuses Utility
 * Collects and displays active bonuses from feats for the UI
 */

import { Character } from '@/types/character';

export interface FeatBonus {
    featName: string;
    featNameIt: string;
    bonus: string;
    description: string;
    descriptionIt: string;
    type: 'circumstance' | 'item' | 'proficiency' | 'status' | 'item';
    appliesTo: string[];
}

/**
 * Get active feat modifiers for display in header components
 * Returns modifiers in the format: { value: number; source: string; type: 'buff' | 'penalty' }[]
 *
 * @param character - The character to check
 * @param target - 'fortitude', 'reflex', 'will', or a specific skill
 * @returns Array of modifiers
 */
export function getFeatModifiers(character: Character, target: 'fortitude' | 'reflex' | 'will'): { value: number; source: string; type: 'buff' }[] {
    const modifiers: { value: number; source: string; type: 'buff' }[] = [];

    // Check for Well-Versed
    // +1 circumstance bonus to saves against effects with auditory, illusion, linguistic, sonic, or visual traits
    // This applies to all saves but is conditional - we'll show it as a visible indicator
    if (character.feats?.some(f => f.featId === 'well-versed' || f.featId === 'iX5HEqRImhKzfPR2')) {
        modifiers.push({
            value: 1,
            source: 'WV',
            type: 'buff',
        });
    }

    return modifiers;
}

/**
 * Get all active feat bonuses for a character
 * @param character - The character to check
 * @returns Array of active feat bonuses
 */
export function getActiveFeatBonuses(character: Character): FeatBonus[] {
    const bonuses: FeatBonus[] = [];

    // Check for Well-Versed
    if (character.feats?.some(f => f.featId === 'well-versed' || f.featId === 'iX5HEqRImhKzfPR2')) {
        bonuses.push({
            featName: 'Well-Versed',
            featNameIt: 'Bene Allenato',
            bonus: '+1',
            description: '+1 circumstance bonus to saves against effects with the auditory, illusion, linguistic, sonic, or visual traits.',
            descriptionIt: '+1 bonus circostanzale ai tiri salvezza contro effetti con i tratti udito, illusione, linguistico, sonoro o visivo.',
            type: 'circumstance',
            appliesTo: ['fortitude', 'reflex', 'will'],
        });
    }

    // Add more feats as needed
    // For example:
    // - Courageous Advance: +1 circumstance bonus to Will saves against fear
    // - Defensive Coordination: bonus to AC when adjacent to ally
    // - Etc.

    return bonuses;
}

/**
 * Get feat bonuses that apply to a specific save
 * @param character - The character to check
 * @param saveName - The save name ('fortitude', 'reflex', 'will')
 * @returns Array of applicable bonuses
 */
export function getSaveBonuses(character: Character, saveName: string): FeatBonus[] {
    return getActiveFeatBonuses(character).filter(b =>
        b.appliesTo.includes(saveName)
    );
}

/**
 * Get feat bonuses that apply to a specific skill
 * @param character - The character to check
 * @param skillName - The skill name
 * @returns Array of applicable bonuses
 */
export function getSkillBonuses(character: Character, skillName: string): FeatBonus[] {
    // Most bard skill bonuses are conditional (based on performance type, etc.)
    // This can be expanded as needed
    const bonuses: FeatBonus[] = [];

    // Example: Eclectic Skill grants level bonus to untrained skills
    // This would need to check skill proficiency and character level

    return bonuses;
}

/**
 * Get a summary of all active bonuses for display
 * @param character - The character to check
 * @returns Object with bonus counts by type
 */
export function getBonusSummary(character: Character): {
    total: number;
    byType: Record<string, number>;
    byTarget: Record<string, number>;
} {
    const bonuses = getActiveFeatBonuses(character);
    const byType: Record<string, number> = {};
    const byTarget: Record<string, number> = {};

    for (const bonus of bonuses) {
        byType[bonus.type] = (byType[bonus.type] || 0) + 1;
        for (const target of bonus.appliesTo) {
            byTarget[target] = (byTarget[target] || 0) + 1;
        }
    }

    return {
        total: bonuses.length,
        byType,
        byTarget,
    };
}

