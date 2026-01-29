/**
 * Bardic Lore Utility Functions
 * Handles the Bardic Lore feat which creates a special Lore skill
 */

import { Character, Proficiency, SkillProficiency } from '@/types/character';
import { getClassNameById } from '../data/classSpecializations';

/**
 * The special skill name for Bardic Lore
 */
export const BARDIC_LORE_SKILL_NAME = 'Bardic Lore';

/**
 * Check if a character has the Bardic Lore feat
 */
export function hasBardicLoreFeat(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'bardic-lore' || feat.featId === 'uVXEZblPRuCyPRua'
    ) || false;
}

/**
 * Check if a character is a Bard with the Enigma muse
 * (prerequisite for Bardic Lore)
 */
export function hasEnigmaMuse(character: Character): boolean {
    const className = getClassNameById(character.classId);
    if (className !== 'Bard') return false;

    // Check if Enigma muse is selected
    const enigmaMuseIds = [
        'enigma', // Enigma muse (new ID)
    ];

    const specializationId = character.classSpecializationId;
    if (Array.isArray(specializationId)) {
        return specializationId.some(id => enigmaMuseIds.includes(id));
    }

    return specializationId ? enigmaMuseIds.includes(specializationId) : false;
}

/**
 * Get the Bardic Lore proficiency based on Occultism rank
 * - Trained by default (from the feat)
 * - Expert if legendary in Occultism
 *
 * @param character - The character to check
 * @returns The proficiency level for Bardic Lore
 */
export function getBardicLoreProficiency(character: Character): Proficiency {
    if (!hasBardicLoreFeat(character)) {
        return 'untrained';
    }

    // Get Occultism proficiency
    const occultismSkill = character.skills?.find(s => s.name.toLowerCase() === 'occultism');
    const occultismProficiency = occultismSkill?.proficiency || 'untrained';

    // If legendary in Occultism, Bardic Lore becomes expert
    if (occultismProficiency === 'legendary') {
        return 'expert';
    }

    // Default to trained (granted by the feat)
    return 'trained';
}

/**
 * Create the Bardic Lore skill object for a character
 *
 * @param character - The character to create Bardic Lore for
 * @returns A SkillProficiency object for Bardic Lore
 */
export function createBardicLoreSkill(character: Character): SkillProficiency {
    return {
        name: BARDIC_LORE_SKILL_NAME,
        ability: 'int', // Bardic Lore uses Intelligence
        proficiency: getBardicLoreProficiency(character),
    };
}

/**
 * Check if a given skill is Bardic Lore
 *
 * @param skillName - The name of the skill to check
 * @returns true if this is the Bardic Lore skill
 */
export function isBardicLore(skillName: string): boolean {
    return skillName.toLowerCase() === BARDIC_LORE_SKILL_NAME.toLowerCase();
}

/**
 * Check if Bardic Lore can be used for a particular task
 * Bardic Lore can only be used for Recall Knowledge actions
 *
 * @param skillName - The name of the skill
 * @param action - The action being attempted (e.g., 'recall-knowledge')
 * @returns true if Bardic Lore can be used for this action
 */
export function canUseBardicLoreForAction(skillName: string, action: string): boolean {
    return isBardicLore(skillName) && action.toLowerCase() === 'recall-knowledge';
}

/**
 * Initialize Bardic Lore for a character when they take the feat
 * This ensures Bardic Lore is added to the character's skills
 *
 * @param character - The character to initialize Bardic Lore for
 * @returns The updated character with Bardic Lore skill
 */
export function initializeBardicLore(character: Character): Character {
    if (!hasBardicLoreFeat(character)) {
        // If feat is removed, remove Bardic Lore skill
        const filteredSkills = character.skills?.filter(s => !isBardicLore(s.name)) || [];
        return {
            ...character,
            skills: filteredSkills,
        };
    }

    // Check if Bardic Lore already exists
    const existingBardicLore = character.skills?.find(s => isBardicLore(s.name));

    if (existingBardicLore) {
        // Update existing Bardic Lore proficiency
        const newProficiency = getBardicLoreProficiency(character);
        if (existingBardicLore.proficiency !== newProficiency) {
            return {
                ...character,
                skills: character.skills?.map(s =>
                    isBardicLore(s.name)
                        ? { ...s, proficiency: newProficiency }
                        : s
                ) || [],
            };
        }
        return character;
    }

    // Add Bardic Lore skill
    const bardicLoreSkill = createBardicLoreSkill(character);
    return {
        ...character,
        skills: [...(character.skills || []), bardicLoreSkill],
    };
}

/**
 * Check if Bardic Lore should be displayed as a special Lore skill
 * (for UI purposes - to show that it can only be used for Recall Knowledge)
 *
 * @param skillName - The name of the skill
 * @returns true if this skill should be displayed as special Lore
 */
export function isSpecialLoreSkill(skillName: string): boolean {
    return isBardicLore(skillName);
}
