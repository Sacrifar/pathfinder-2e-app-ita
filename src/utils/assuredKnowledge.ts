/**
 * Assured Knowledge Utility Functions
 * Handles the Assured Knowledge feat which allows guaranteed Recall Knowledge results
 */

import { Character, Proficiency } from '@/types/character';
import { getClassNameById } from '../data/classSpecializations';

/**
 * Check if a character has the Assured Knowledge feat
 */
export function hasAssuredKnowledge(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'assured-knowledge' || feat.featId === 'c6CS97Zs0DPmInaI'
    ) || false;
}

/**
 * Check if a character can use Assured Knowledge for a Recall Knowledge check
 *
 * @param character - The character to check
 * @param skillName - The skill being used for Recall Knowledge
 * @returns true if Assured Knowledge can be used
 */
export function canUseAssuredKnowledge(character: Character, skillName: string): boolean {
    return hasAssuredKnowledge(character);
}

/**
 * Get the guaranteed result for Assured Knowledge
 * Returns 10 + proficiency bonus (no other modifiers apply)
 *
 * @param character - The character to check
 * @param skillName - The skill being used
 * @returns The guaranteed result (10 + proficiency bonus), or null if feat not applicable
 */
export function getAssuredKnowledgeResult(character: Character, skillName: string): number | null {
    if (!hasAssuredKnowledge(character)) {
        return null;
    }

    // Get the skill proficiency
    const skill = character.skills?.find(s => s.name.toLowerCase() === skillName.toLowerCase());
    if (!skill) {
        return null;
    }

    // Calculate proficiency bonus
    const proficiencyBonus = getProficiencyBonus(skill.proficiency, character.level);

    // Result is 10 + proficiency bonus (no other modifiers)
    return 10 + proficiencyBonus;
}

/**
 * Get the proficiency bonus for a given proficiency level and character level
 */
function getProficiencyBonus(proficiency: Proficiency, level: number): number {
    switch (proficiency) {
        case 'untrained':
            return 0;
        case 'trained':
            return level + 2; // In PF2e Remaster, trained = level + 2
        case 'expert':
            return level + 4;
        case 'master':
            return level + 6;
        case 'legendary':
            return level + 8;
        default:
            return 0;
    }
}

/**
 * Check if a character meets the Automatic Knowledge feat prerequisite
 * using Assured Knowledge (expert in skill = meets prerequisite)
 *
 * @param character - The character to check
 * @param skillName - The skill to check
 * @returns true if the character meets the Automatic Knowledge prerequisite via Assured Knowledge
 */
export function meetsAutomaticKnowledgePrerequisiteViaAssuredKnowledge(
    character: Character,
    skillName: string
): boolean {
    if (!hasAssuredKnowledge(character)) {
        return false;
    }

    const skill = character.skills?.find(s => s.name.toLowerCase() === skillName.toLowerCase());
    if (!skill) {
        return false;
    }

    // Must be expert or higher in the skill
    const proficiencyOrder: Proficiency[] = ['untrained', 'trained', 'expert', 'master', 'legendary'];
    const currentIndex = proficiencyOrder.indexOf(skill.proficiency);

    return currentIndex >= 2; // expert or higher
}
