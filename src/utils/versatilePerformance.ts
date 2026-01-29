/**
 * Versatile Performance Utility Functions
 * Handles the Versatile Performance feat which allows using Performance for other skills
 */

import { Character } from '@/types/character';
import { getClassNameById } from '../data/classSpecializations';

/**
 * Check if a character has the Versatile Performance feat
 */
export function hasVersatilePerformance(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId === 'versatile-performance' || feat.featId === 'jBp91q4uzwd4FeSX'
    ) || false;
}

/**
 * Skills that can be substituted with Performance
 */
const SUBSTITUTABLE_SKILLS = ['diplomacy', 'intimidation', 'deception'] as const;

/**
 * Get the skill that Performance can substitute for
 * This maps Performance to the appropriate social skill based on the action being performed
 *
 * @param originalSkill - The skill being substituted
 * @returns The skill name if substitution is allowed, null otherwise
 */
export function getPerformanceSubstitution(originalSkill: string): string | null {
    const skillKey = originalSkill.toLowerCase();

    switch (skillKey) {
        case 'diplomacy':
        case 'intimidation':
        case 'deception':
            return 'performance';
        default:
            return null;
    }
}

/**
 * Check if a character can use Performance instead of a specific skill
 *
 * @param character - The character to check
 * @param targetSkill - The skill to check (diplomacy, intimidation, or deception)
 * @returns true if Performance can be used instead
 */
export function canUsePerformanceForSkill(character: Character, targetSkill: string): boolean {
    if (!hasVersatilePerformance(character)) {
        return false;
    }

    const skillKey = targetSkill.toLowerCase();
    return SUBSTITUTABLE_SKILLS.some(skill => skill === skillKey);
}

/**
 * Get all skills that Performance can substitute for
 *
 * @returns Array of skill names that Performance can replace
 */
export function getVersatilePerformanceSkills(): string[] {
    return [...SUBSTITUTABLE_SKILLS];
}

/**
 * Check if a skill can be substituted with Performance for a specific action
 *
 * @param originalSkill - The original skill being used
 * @param action - The action being performed (e.g., 'make-an-impression', 'demoralize', 'impersonate')
 * @returns The skill to use (either Performance or the original), or null if not applicable
 */
export function getVersatilePerformanceSkillForAction(
    originalSkill: string,
    action: string
): string | null {
    const actionKey = action.toLowerCase().replace(/-/g, '').replace(/\s+/g, '');
    const skillKey = originalSkill.toLowerCase();

    // Diplomacy -> Performance for Make an Impression
    if (skillKey === 'diplomacy' && actionKey.includes('makeanimpression')) {
        return 'performance';
    }

    // Intimidation -> Performance for Demoralize
    if (skillKey === 'intimidation' && actionKey.includes('demoralize')) {
        return 'performance';
    }

    // Deception -> Performance for Impersonate
    if (skillKey === 'deception' && actionKey.includes('impersonate')) {
        return 'performance';
    }

    return null;
}

/**
 * Check if Performance proficiency can satisfy the prerequisite for a skill feat
 * based on Versatile Performance
 *
 * @param character - The character to check
 * @param requiredSkill - The skill required by the feat
 * @param requiredProficiency - The proficiency level required
 * @returns true if Performance proficiency can satisfy the prerequisite
 */
export function canPerformanceSatisfySkillFeatPrerequisite(
    character: Character,
    requiredSkill: string,
    requiredProficiency: string
): boolean {
    if (!hasVersatilePerformance(character)) {
        return false;
    }

    const skillKey = requiredSkill.toLowerCase();

    // Only works for Diplomacy, Intimidation, and Deception
    if (!SUBSTITUTABLE_SKILLS.some(skill => skill === skillKey)) {
        return false;
    }

    // Check if character has the required proficiency in Performance
    const performanceSkill = character.skills?.find(s => s.name.toLowerCase() === 'performance');
    if (!performanceSkill) {
        return false;
    }

    // Check if Performance proficiency meets or exceeds the required proficiency
    const proficiencyOrder = ['untrained', 'trained', 'expert', 'master', 'legendary'] as const;
    const performanceIndex = proficiencyOrder.indexOf(performanceSkill.proficiency);
    const requiredIndex = proficiencyOrder.indexOf(requiredProficiency as any);

    return performanceIndex >= requiredIndex;
}

/**
 * Get the effective modifier for a skill check when using Versatile Performance
 * Returns the Performance modifier if substitution is allowed, null otherwise
 *
 * @param character - The character to check
 * @param originalSkill - The skill being checked
 * @param action - The action being performed (optional)
 * @returns The skill to use for the modifier calculation, or null if no substitution
 */
export function getEffectiveSkillForVersatilePerformance(
    character: Character,
    originalSkill: string,
    action?: string
): string | null {
    if (!hasVersatilePerformance(character)) {
        return null;
    }

    if (action) {
        return getVersatilePerformanceSkillForAction(originalSkill, action);
    }

    // For general checks, allow substitution for the three skills
    if (canUsePerformanceForSkill(character, originalSkill)) {
        return 'performance';
    }

    return null;
}

/**
 * Check if a given skill is one that can be replaced by Performance
 *
 * @param skillName - The name of the skill to check
 * @returns true if Performance can substitute for this skill
 */
export function isSkillSubstitutableByPerformance(skillName: string): boolean {
    const skillKey = skillName.toLowerCase();
    return SUBSTITUTABLE_SKILLS.some(skill => skill === skillKey);
}
