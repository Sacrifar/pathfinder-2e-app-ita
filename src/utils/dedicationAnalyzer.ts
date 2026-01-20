/**
 * Generic Archetype Dedication Analyzer
 *
 * This module provides a generic system for analyzing archetype dedication feats
 * and automatically extracting their skill grants and conditional logic.
 *
 * Instead of hardcoding each dedication, this system:
 * 1. Parses ActiveEffectLike rules to find granted skills
 * 2. Analyzes descriptions for conditional logic patterns
 * 3. Loads GrantItem dependencies (deity, bloodline, etc.) for additional skills
 * 4. Automatically determines how many additional skill choices are needed
 */

import type { LoadedFeat } from '../data/pf2e-loader';
import type { Character } from '../types';
import { FeatChoice } from './featChoices';
import { getDeityById } from '../data/deities';
import { getClassFeatureSkills } from '../data/classFeatures';
import { skills } from '../data/skills';

/**
 * Extract skills mentioned in feat description text
 * This is a fallback for feats that don't have skill rules in JSON (like Barbarian, Fighter)
 * Looks for patterns like "trained in Athletics" or "trained in Acrobatics or Athletics"
 */
export function extractSkillsFromDescription(description: string): string[] {
    const foundSkills: string[] = [];
    const descriptionLower = description.toLowerCase();

    // Check each skill to see if it's mentioned in the description
    for (const skill of skills) {
        // Skip generic "Lore" as it's not a specific skill
        if (skill.id === 'lore') continue;

        // Look for patterns like:
        // - "trained in Athletics"
        // - "trained in Acrobatics or Athletics"
        // - "become trained in [Skill]"
        const skillNameLower = skill.name.toLowerCase();

        // Pattern 1: "trained in [Skill]" or "become trained in [Skill]"
        const patterns = [
            `trained in ${skillNameLower}`,
            `become trained in ${skillNameLower}`,
        ];

        for (const pattern of patterns) {
            if (descriptionLower.includes(pattern)) {
                if (!foundSkills.includes(skill.name)) {
                    foundSkills.push(skill.name);
                    console.log(`[dedicationAnalyzer] Found skill "${skill.name}" in description (pattern: "${pattern}")`);
                }
                break; // Found this skill, no need to check other patterns
            }
        }
    }

    return foundSkills;
}

/**
 * Extract skills granted by a feat from its ActiveEffectLike rules
 * Also extracts skill options from ChoiceSet rules (like Rogue Dedication's Stealth/Thievery choice)
 */
export function extractGrantedSkills(feat: LoadedFeat): string[] {
    const grantedSkills: string[] = [];

    if (!feat.rules || !Array.isArray(feat.rules)) {
        return grantedSkills;
    }

    console.log(`[dedicationAnalyzer] extractGrantedSkills for ${feat.name}`);

    // First, collect skill options from ChoiceSet rules
    const choiceSetSkills: string[] = [];
    for (const rule of feat.rules) {
        if (rule.key === 'ChoiceSet' && rule.choices && Array.isArray(rule.choices)) {
            // Check if this is a skill choice set
            for (const choice of rule.choices) {
                if (choice.value && typeof choice.value === 'string') {
                    // Extract skill name from paths like "system.skills.stealth.rank"
                    const skillMatch = choice.value.match(/system\.skills\.([^.\}]+)\.rank/);
                    if (skillMatch) {
                        const skillName = skillMatch[1];
                        const capitalized = skillName.charAt(0).toUpperCase() + skillName.slice(1);
                        if (!choiceSetSkills.includes(capitalized)) {
                            choiceSetSkills.push(capitalized);
                            console.log(`[dedicationAnalyzer] Found skill option in ChoiceSet: ${capitalized}`);
                        }
                    }
                }
            }
        }
    }

    // Then collect skills from ActiveEffectLike rules
    for (const rule of feat.rules) {
        if (rule.key === 'ActiveEffectLike' && rule.path && rule.mode === 'upgrade') {
            // Check if this is a skill effect
            const skillMatch = rule.path.match(/system\.skills\.([^.\}]+)\.rank/);
            if (skillMatch && rule.value > 0) {
                const skillName = skillMatch[1];
                // Capitalize first letter
                const capitalized = skillName.charAt(0).toUpperCase() + skillName.slice(1);
                if (!grantedSkills.includes(capitalized)) {
                    grantedSkills.push(capitalized);
                    console.log(`[dedicationAnalyzer] Found skill in ActiveEffectLike: ${capitalized}`);
                }
            }
        }
    }

    // Add skill options from ChoiceSet rules as granted skills
    // These are skills the feat CAN grant, even if they're chosen dynamically
    for (const skill of choiceSetSkills) {
        if (!grantedSkills.includes(skill)) {
            grantedSkills.push(skill);
        }
    }

    // If no skills found in rules, try extracting from description text
    // This handles feats like Barbarian Dedication and Fighter Dedication
    // that mention skills in description but don't have them in rules JSON
    if (grantedSkills.length === 0 && feat.description) {
        const skillsFromDescription = extractSkillsFromDescription(feat.description);
        for (const skill of skillsFromDescription) {
            if (!grantedSkills.includes(skill)) {
                grantedSkills.push(skill);
                console.log(`[dedicationAnalyzer] Added skill from description: ${skill}`);
            }
        }
    }

    console.log(`[dedicationAnalyzer] Total extracted skills for ${feat.name}:`, grantedSkills);

    return grantedSkills;
}

/**
 * Extract ALL skills granted by a dedication, including those from GrantItem dependencies
 * This handles:
 * - Direct ActiveEffectLike skill grants
 * - Deity skills (from deity choice)
 * - Bloodline skills (from bloodline choice)
 * - Order/muse/mystery/instinct skills (from class features)
 */
export function extractAllGrantedSkills(
    feat: LoadedFeat,
    character: Character
): string[] {
    const allSkills = new Set<string>();

    // 1. Get skills from ActiveEffectLike rules
    const directSkills = extractGrantedSkills(feat);
    for (const skill of directSkills) {
        allSkills.add(skill);
    }

    // 2. Check if this feat has choices that might grant additional skills
    const charFeat = character.feats?.find(f => f.featId === feat.id);
    if (!charFeat || !charFeat.choices || !feat.rules) {
        return Array.from(allSkills);
    }

    // 3. Parse feat choices to find deity/bloodline/order/muse/mystery choices
    // @ts-ignore - Vite glob import
    const featChoices = [];
    if (feat.rules && Array.isArray(feat.rules)) {
        for (const rule of feat.rules) {
            if (rule.key === 'ChoiceSet') {
                featChoices.push({
                    flag: rule.flag || 'choice',
                    rollOption: rule.rollOption,
                });
            }
        }
    }

    // 4. Check each choice for skill-granting dependencies
    for (let i = 0; i < charFeat.choices.length; i++) {
        const choiceValue = charFeat.choices[i];
        const choiceInfo = featChoices[i];

        if (!choiceValue || !choiceInfo) continue;

        // Check if this is a deity choice
        if (choiceInfo.flag === 'deity') {
            const deity = getDeityById(choiceValue);
            if (deity?.skill) {
                allSkills.add(deity.skill.name);
            }
        }

        // Check if this is a bloodline/order/muse/mystery/instinct choice
        // These are GrantItem choices that refer to class features
        if (choiceInfo.rollOption && (
            choiceInfo.rollOption.includes('bloodline') ||
            choiceInfo.rollOption.includes('order') ||
            choiceInfo.rollOption.includes('muse') ||
            choiceInfo.rollOption.includes('mystery') ||
            choiceInfo.rollOption.includes('instinct') ||
            choiceInfo.rollOption.includes('patron')
        )) {
            // Try to get skills from the class feature
            const featureSkills = getClassFeatureSkills(choiceValue);
            for (const skill of featureSkills) {
                allSkills.add(skill);
            }
        }

        // Also check for specific flag names
        if (choiceInfo.flag === 'bloodline' || choiceInfo.flag === 'druidicOrder' ||
            choiceInfo.flag === 'muse' || choiceInfo.flag === 'mystery' ||
            choiceInfo.flag === 'instinct' || choiceInfo.flag === 'patron') {
            const featureSkills = getClassFeatureSkills(choiceValue);
            for (const skill of featureSkills) {
                allSkills.add(skill);
            }
        }
    }

    return Array.from(allSkills);
}

/**
 * Parse the dedication description to detect conditional skill logic
 * Looks for patterns like:
 * - "if you were already trained in X"
 * - "for each of these skills in which you were already trained"
 * - "plus one skill of your choice" (unconditional additional skill)
 */
export function parseDedicationSkillLogic(feat: LoadedFeat, character: Character): {
    grantedSkills: string[];
    hasConditionalLogic: boolean;
    conditionalCount: number;
    hasUnconditionalAdditionalSkill: boolean;
} {
    const result = {
        grantedSkills: extractAllGrantedSkills(feat, character),
        hasConditionalLogic: false,
        conditionalCount: 0,
        hasUnconditionalAdditionalSkill: false,
    };

    // Check description for conditional logic patterns
    const description = feat.description?.toLowerCase() || '';

    // Pattern 1: "if you were already trained"
    if (description.includes('already trained')) {
        result.hasConditionalLogic = true;

        // Count how many skills have the conditional logic
        // Pattern: "for each of these skills" indicates multiple
        if (description.includes('for each of these')) {
            // Multiple skills with conditional logic
            result.conditionalCount = result.grantedSkills.length;
        } else if (description.includes('both')) {
            // "both X and Y" pattern
            result.conditionalCount = 2;
        } else {
            // Single skill with conditional logic (default to number of granted skills)
            result.conditionalCount = result.grantedSkills.length;
        }
    }

    // Pattern 2: "plus one skill of your choice" (unconditional additional skill)
    // This is common in many dedication feats like Rogue Dedication
    if (description.includes('plus one skill') || description.includes('plus an additional skill')) {
        result.hasUnconditionalAdditionalSkill = true;
    }

    return result;
}

/**
 * Calculate additional choices needed for archetype dedication feats
 *
 * This is a GENERIC system that analyzes the feat's rules and description
 * to determine if additional skill choices are needed.
 *
 * Handles conditional logic like "if already trained in X, gain additional skill choice"
 * AND unconditional additional skills like "plus one skill of your choice"
 * Now supports:
 * - Direct skill grants from ActiveEffectLike rules
 * - Skill options from ChoiceSet rules (for dynamic skill choices)
 * - Deity skills (from deity choice via GrantItem)
 * - Bloodline skills (from bloodline choice via GrantItem)
 * - Order/Muse/Mystery/Instinct skills (from class features via GrantItem)
 */
export function calculateDedicationAdditionalChoices(
    feat: LoadedFeat,
    character: Character
): FeatChoice[] {
    const additionalChoices: FeatChoice[] = [];

    // Only process archetype dedication feats
    if (!feat.traits.includes('archetype') || !feat.traits.includes('dedication')) {
        return additionalChoices;
    }

    console.log(`[dedicationAnalyzer] === Analyzing ${feat.name} ===`);
    console.log(`[dedicationAnalyzer] Character skills:`, character.skills?.map(s => `${s.name}:${s.proficiency}`).join(', '));

    // Parse the feat to understand its skill grants and conditional logic
    const skillLogic = parseDedicationSkillLogic(feat, character);
    console.log(`[dedicationAnalyzer] Granted skills:`, skillLogic.grantedSkills);
    console.log(`[dedicationAnalyzer] hasConditionalLogic: ${skillLogic.hasConditionalLogic}, conditionalCount: ${skillLogic.conditionalCount}`);
    console.log(`[dedicationAnalyzer] hasUnconditionalAdditionalSkill: ${skillLogic.hasUnconditionalAdditionalSkill}`);

    // Handle unconditional additional skill (like "plus one skill of your choice")
    if (skillLogic.hasUnconditionalAdditionalSkill) {
        additionalChoices.push({
            flag: 'additionalSkill',
            prompt: 'PF2E.SpecificRule.Prompt.Skill',
            type: 'skill',
        });
        console.log(`[dedicationAnalyzer] ${feat.name} has unconditional additional skill choice (flag: additionalSkill)`);
    }

    // Handle conditional additional skills (like "if already trained")
    if (!skillLogic.hasConditionalLogic || skillLogic.grantedSkills.length === 0) {
        console.log(`[dedicationAnalyzer] ${feat.name} skipping conditional logic - hasConditionalLogic: ${skillLogic.hasConditionalLogic}, grantedSkills.length: ${skillLogic.grantedSkills.length}`);
        return additionalChoices;
    }

    // Check which granted skills are already trained
    let alreadyTrainedCount = 0;
    for (const skillName of skillLogic.grantedSkills) {
        const skill = character.skills?.find(s =>
            s.name.toLowerCase() === skillName.toLowerCase() && s.proficiency !== 'untrained'
        );
        if (skill) {
            alreadyTrainedCount++;
            console.log(`[dedicationAnalyzer] ${feat.name}: ${skillName} is already trained (proficiency: ${skill.proficiency})`);
        } else {
            console.log(`[dedicationAnalyzer] ${feat.name}: ${skillName} is NOT already trained`);
        }
    }

    // Special handling for "both X and Y" pattern
    // In this case, ALL skills must be trained to get the additional choice
    const description = feat.description?.toLowerCase() || '';
    if (description.includes('both') && description.includes('already trained')) {
        // Check if ALL granted skills are trained
        const allSkillsTrained = alreadyTrainedCount === skillLogic.grantedSkills.length;
        if (allSkillsTrained) {
            console.log(`[dedicationAnalyzer] ${feat.name}: All ${alreadyTrainedCount} skills are trained, granting 1 conditional choice (both pattern)`);
            additionalChoices.push({
                flag: 'conditionalSkill_both',
                prompt: 'PF2E.SpecificRule.Prompt.Skill',
                type: 'skill',
            });
        } else {
            console.log(`[dedicationAnalyzer] ${feat.name}: Not all skills trained (${alreadyTrainedCount}/${skillLogic.grantedSkills.length}), no conditional choice (both pattern)`);
        }
        return additionalChoices;
    }

    // Add additional skill choices based on how many are already trained
    // Most dedications give 1 additional choice per already-trained skill
    const additionalChoicesNeeded = Math.min(alreadyTrainedCount, skillLogic.conditionalCount);

    console.log(`[dedicationAnalyzer] ${feat.name}: ${alreadyTrainedCount} skills already trained, conditionalCount: ${skillLogic.conditionalCount}, adding ${additionalChoicesNeeded} conditional choices`);

    for (let i = 0; i < additionalChoicesNeeded; i++) {
        additionalChoices.push({
            flag: `conditionalSkill_${i}`,
            prompt: 'PF2E.SpecificRule.Prompt.Skill',
            type: 'skill',
        });
        console.log(`[dedicationAnalyzer] ${feat.name} added conditional choice ${i} (flag: conditionalSkill_${i})`);
    }

    console.log(`[dedicationAnalyzer] === Final choices for ${feat.name}: ${additionalChoices.length} ===`);
    console.log(`[dedicationAnalyzer] Choices:`, additionalChoices.map(c => c.flag));

    return additionalChoices;
}

/**
 * Check if a dedication has GrantItem rules that might grant additional skills
 * (e.g., deity, bloodline, mystery, muse, order, instinct, patron)
 */
export function hasGrantItemDependencies(feat: LoadedFeat): boolean {
    if (!feat.rules || !Array.isArray(feat.rules)) {
        return false;
    }

    for (const rule of feat.rules) {
        if (rule.key === 'GrantItem' && rule.uuid) {
            return true;
        }
    }

    return false;
}

/**
 * Get all GrantItem UUIDs from a feat
 */
export function getGrantItemUUIDs(feat: LoadedFeat): string[] {
    const uuids: string[] = [];

    if (!feat.rules || !Array.isArray(feat.rules)) {
        return uuids;
    }

    for (const rule of feat.rules) {
        if (rule.key === 'GrantItem' && rule.uuid) {
            // Skip if it's a reference to a choice value like "{item|flags.pf2e.rulesSelections.bloodline}"
            if (!rule.uuid.includes('{')) {
                uuids.push(rule.uuid);
            }
        }
    }

    return uuids;
}
