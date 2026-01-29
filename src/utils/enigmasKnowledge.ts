/**
 * Enigma's Knowledge Utility Functions
 * Handles the Enigma's Knowledge feat which grants Automatic Knowledge for Recall Knowledge
 */

import { Character } from '@/types/character';
import { getClassNameById } from '../data/classSpecializations';

/**
 * Check if a character has the Enigma's Knowledge feat
 */
export function hasEnigmasKnowledge(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'enigmas-knowledge' || feat.featId === '8cbSVw8RnVzy5USe'
    ) || false;
}

/**
 * Check if a character has the prerequisite for Enigma's Knowledge (Assured Knowledge)
 *
 * @param character - The character to check
 * @returns true if the character has Assured Knowledge
 */
export function hasEnigmasKnowledgePrerequisite(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'assured-knowledge' || feat.featId === 'c6CS97Zs0DPmInaI'
    ) || false;
}

/**
 * Check if a skill can be used with Automatic Knowledge via Enigma's Knowledge
 * Any skill that can be used for Recall Knowledge is valid
 *
 * @param skillName - The name of the skill to check
 * @returns true if the skill can be used for Recall Knowledge
 */
export function canUseAutomaticKnowledgeForSkill(skillName: string): boolean {
    // All these skills can be used for Recall Knowledge
    const recallKnowledgeSkills = [
        'arcana', 'nature', 'religion', 'occultism', 'society',
        'acrobatics', 'athletics', 'crafting', 'deception', 'diplomacy',
        'intimidation', 'medicine', 'occultism', 'performance', 'society',
        'survival', 'thievery',
        // Lore skills (any skill starting with or containing "Lore")
    ];

    const skillKey = skillName.toLowerCase();

    // Check if it's a standard Recall Knowledge skill
    if (recallKnowledgeSkills.includes(skillKey)) {
        return true;
    }

    // Check if it's a Lore skill
    if (skillKey.includes('lore') || skillKey.includes('tradizione')) {
        return true;
    }

    // Check for Bardic Lore specifically
    if (skillKey === 'bardic lore' || skillKey === 'tradizione bardica') {
        return true;
    }

    return false;
}

/**
 * Get the number of times Automatic Knowledge can be used per round
 * Enigma's Knowledge specifies it can still only be used once per round
 *
 * @returns 1 (once per round limitation)
 */
export function getAutomaticKnowledgeUsesPerRound(): number {
    return 1; // Explicitly limited to once per round by the feat
}

/**
 * Check if Automatic Knowledge has been used this round
 * This would typically be tracked in combat/state tracking
 *
 * @param character - The character to check
 * @returns true if already used this round (placeholder)
 */
export function hasUsedAutomaticKnowledgeThisRound(character: Character): boolean {
    // This would be tracked in combat/state tracking
    // For now, return false (always available)
    // Future implementation: check round tracking
    return false;
}

/**
 * Check if Enigma's Knowledge is active for a specific skill
 *
 * @param character - The character to check
 * @param skillName - The skill being used
 * @returns true if Enigma's Knowledge applies to this skill
 */
export function isEnigmasKnowledgeActiveForSkill(character: Character, skillName: string): boolean {
    if (!hasEnigmasKnowledge(character)) {
        return false;
    }

    return canUseAutomaticKnowledgeForSkill(skillName);
}
