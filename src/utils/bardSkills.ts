/**
 * Bard Skill Feats Utility Functions
 * Handles skill-related Bard feats like Eclectic Skill
 */

import { Character, Proficiency } from '@/types/character';
import { getClassNameById } from '../data/classSpecializations';

/**
 * Check if a character has the Eclectic Skill feat
 */
export function hasEclecticSkill(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'eclectic-skill' || feat.featId === 'TOyqtUUnOkOLl1Pm'
    ) || false;
}

/**
 * Get the effective proficiency for a skill check when the character has Eclectic Skill
 * This allows bypassing training requirements for certain checks
 *
 * @param character - The character to check
 * @param skillName - The name of the skill being checked
 * @param currentProficiency - The character's current proficiency in the skill
 * @returns The effective proficiency level, or null if no override applies
 */
export function getEclecticSkillEffectiveProficiency(
    character: Character,
    skillName: string,
    currentProficiency: Proficiency
): Proficiency | null {
    if (!hasEclecticSkill(character)) {
        return null;
    }

    // Get Occultism proficiency to check for legendary
    const occultismSkill = character.skills?.find(s => s.name.toLowerCase() === 'occultism');
    const hasLegendaryOccultism = occultismSkill?.proficiency === 'legendary';

    // If legendary in Occultism, can attempt expert-only checks even if untrained or trained
    if (hasLegendaryOccultism && (currentProficiency === 'untrained' || currentProficiency === 'trained')) {
        return 'expert'; // Effectively treated as expert for prerequisite purposes
    }

    // If currently untrained, Eclectic Skill allows attempting trained-only checks
    if (currentProficiency === 'untrained') {
        return 'trained'; // Effectively treated as trained for prerequisite purposes
    }

    return null;
}

/**
 * Check if a character can attempt a skill check that normally requires training
 * (used for validating skill checks with Eclectic Skill)
 *
 * @param character - The character to check
 * @param skillName - The name of the skill
 * @param requiredProficiency - The minimum proficiency required (e.g., 'trained', 'expert')
 * @returns true if the character can attempt the check
 */
export function canAttemptSkillCheckWithEclecticSkill(
    character: Character,
    skillName: string,
    requiredProficiency: Proficiency
): boolean {
    if (!hasEclecticSkill(character)) {
        return false;
    }

    const skill = character.skills?.find(s => s.name.toLowerCase() === skillName.toLowerCase());
    if (!skill) {
        // For untrained skills with Eclectic Skill, can attempt trained-only checks
        return requiredProficiency === 'trained';
    }

    const currentProficiency = skill.proficiency;

    // If already proficient enough, no need for Eclectic Skill
    const proficiencyOrder: Proficiency[] = ['untrained', 'trained', 'expert', 'master', 'legendary'];
    const currentIndex = proficiencyOrder.indexOf(currentProficiency);
    const requiredIndex = proficiencyOrder.indexOf(requiredProficiency);

    if (currentIndex >= requiredIndex) {
        return true; // Already proficient enough
    }

    // Check if Eclectic Skill can bridge the gap
    const effectiveProficiency = getEclecticSkillEffectiveProficiency(character, skillName, currentProficiency);
    if (effectiveProficiency) {
        const effectiveIndex = proficiencyOrder.indexOf(effectiveProficiency);
        return effectiveIndex >= requiredIndex;
    }

    return false;
}

/**
 * Get the proficiency bonus for untrained skills with Eclectic Skill
 * Normally untrained = 0, but with Eclectic Skill it equals character level
 *
 * @param character - The character to check
 * @param skillName - The name of the skill
 * @returns The proficiency bonus (usually character level for untrained skills)
 */
export function getEclecticSkillProficiencyBonus(
    character: Character,
    skillName: string
): number | null {
    if (!hasEclecticSkill(character)) {
        return null;
    }

    const skill = character.skills?.find(s => s.name.toLowerCase() === skillName.toLowerCase());

    // Only applies to untrained skills
    if (!skill || skill.proficiency === 'untrained') {
        return character.level || 1;
    }

    return null;
}

/**
 * Check if a skill check modifier should use the character's level instead of 0
 * for the proficiency bonus (Eclectic Skill effect)
 *
 * @param character - The character to check
 * @param skillName - The name of the skill
 * @returns true if the skill should use level-based proficiency bonus
 */
export function shouldUseLevelBonusForSkill(
    character: Character,
    skillName: string
): boolean {
    return getEclecticSkillProficiencyBonus(character, skillName) !== null;
}
