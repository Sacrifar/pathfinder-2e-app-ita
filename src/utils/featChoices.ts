/**
 * Feat Choices and Dedication Benefits System
 *
 * This module handles:
 * - Parsing feat choices from FoundryVTT JSON structure
 * - Applying skill/weapon/armor proficiencies from archetype dedication feats
 * - Managing conditional skill choices (e.g., "if already trained, gain additional skill")
 * - Processing deity/bloodline/patron choices with associated skills
 *
 * BUILDER MODE CRITICAL REQUIREMENT:
 * ===================================
 * The sidebar functions as BOTH a builder AND character sheet:
 *
 * When user changes level DOWN (e.g., 10 -> 5):
 * - ALL feat choices remain in character.feats[]
 * - ALL selections (deity, bloodline, skill choices) remain in character.feat[x].choices[]
 * - recalculateCharacter() simply doesn't apply effects above current level
 * - User can go back UP to level 10 and all choices are preserved
 *
 * When user changes a choice (e.g., Stealth -> Thievery in Rogue Dedication):
 * - The feat is REPLACED with updated choices in handleSelectFeat()
 * - recalculateCharacter() is called, which:
 *   1. RecalculateSkills() rebuilds ALL skills from scratch (untrained base)
 *   2. Then applies ONLY effects from CURRENT feats in character.feats[]
 *   3. Old choice effects are automatically gone (feat was replaced)
 * - This works because recalculation is FROM SCRATCH, not incremental
 *
 * When user REMOVES a feat (e.g., Rogue Dedication -> Fighter Dedication):
 * - handleRemoveFeat() removes the feat from character.feats[]
 * - recalculateCharacter() is called
 * - Rogue Dedication effects are NOT applied (feat is gone)
 * - All effects from that feat disappear automatically
 *
 * KEY: All recalculation is FROM SCRATCH, not incremental updates!
 * - recalculateSkills() starts with all untrained
 * - Then applies class/background skills
 * - Then applies CURRENT feat effects only
 * - Old feat effects are gone because old feats are gone
 *
 * NEVER remove choices/feats based on level - only recalculate effects!
 * The recalculate functions handle this by only applying active feats.
 */

import { skills } from '../data';
import { getFeats } from '../data/pf2e-loader';
import { getDeityById } from '../data/deities';
import type { LoadedFeat } from '../data/pf2e-loader';
import type { SkillProficiency, Character, AbilityName } from '../types';
import {
    calculateDedicationAdditionalChoices as genericCalculateAdditionalChoices
} from './dedicationAnalyzer';

export interface FeatChoice {
    flag: string;
    prompt: string;
    type: 'skill' | 'feat' | 'spell' | 'string' | 'number' | 'ability';
    count?: number; // For multiple selections (e.g., Natural Skill has 2 skill choices)
    options?: FeatChoiceOption[]; // For predefined choices with labels, values, and predicates
    filter?: {
        level?: number;
        category?: string;
        traits?: string[];
        itemType?: string; // 'feat', 'spell', etc.
        slugs?: string[]; // For spell slugs
    };
    rollOption?: string; // If set, this choice sets a roll option flag (e.g., "champion-dedication")
}

export interface FeatChoiceOption {
    label: string;
    value: string;
    predicate?: any; // Predicate that must be true for this option to be available
}

export interface GrantedItem {
    uuid: string;
    type: 'feat' | 'spell' | 'item';
}

export interface ActiveEffect {
    flag?: string; // Optional: Links to choice flag (can also be extracted from path)
    mode: 'upgrade' | 'set' | 'add' | 'subtract';
    path: string; // Path to modify (e.g., "system.skills.{choice}.rank")
    value: number;
}

/**
 * Parse granted items from feat rules
 * Looks for GrantItem rules in the feat data
 */
export function parseGrantedItems(feat: LoadedFeat): GrantedItem[] {
    const granted: GrantedItem[] = [];

    if (!feat.rules || !Array.isArray(feat.rules)) {
        return granted;
    }

    for (const rule of feat.rules) {
        if (rule.key === 'GrantItem' && rule.uuid) {
            // Determine type based on UUID
            let type: GrantedItem['type'] = 'item';
            if (rule.uuid.includes('feat') || rule.uuid.includes('Item')) {
                // Direct feat reference or Foundry-style item reference (Compendium.pf2e.feats-srd.Item.XXX)
                type = 'feat';
            } else if (rule.uuid.includes('spell')) {
                type = 'spell';
            } else if (rule.uuid.includes('{item|flags.pf2e.rulesSelections.')) {
                // Dynamic reference - typically refers to a feat selected in a choice
                type = 'feat';
            }

            granted.push({
                uuid: rule.uuid,
                type
            });
        }
    }

    return granted;
}

/**
 * Parse ActiveEffectLike rules from feat
 * These modify character properties based on choices
 */
export function parseActiveEffects(feat: LoadedFeat): ActiveEffect[] {
    const effects: ActiveEffect[] = [];

    if (!feat.rules || !Array.isArray(feat.rules)) {
        return effects;
    }

    for (const rule of feat.rules) {
        if (rule.key === 'ActiveEffectLike' && rule.path) {
            // Extract the flag reference from the path
            // Path format: "system.skills.{item|flags.pf2e.rulesSelections.skillOne}.rank"
            const flagMatch = rule.path.match(/\{item\|flags\.pf2e\.rulesSelections\.([^}]+)\}/);

            effects.push({
                flag: flagMatch ? flagMatch[1] : '',
                mode: rule.mode || 'set',
                path: rule.path,
                value: rule.value
            });
        }
    }

    return effects;
}

/**
 * Apply active effects from feat choices to character
 * Returns updated skills array
 */
export function applyActiveEffects(
    character: Character,
    choices: Record<string, string>,
    effects: ActiveEffect[]
): SkillProficiency[] {
    let updatedSkills = [...(character.skills || [])];

    for (const effect of effects) {
        // Extract flag from the path
        // Path format: "system.skills.{item|flags.pf2e.rulesSelections.flagName}.rank"
        let effectFlag = '';
        let targetSkill = '';

        if (effect.path && effect.path.includes('{item|flags.pf2e.rulesSelections.')) {
            // Extract the flag name from the dynamic path
            const flagMatch = effect.path.match(/\{item\|flags\.pf2e\.rulesSelections\.([^}]+)\}/);
            if (flagMatch) {
                effectFlag = flagMatch[1];
                targetSkill = choices[effectFlag] || '';
            }
        } else if (effect.flag) {
            // Use explicit flag from effect
            effectFlag = effect.flag;
            targetSkill = choices[effectFlag] || '';
        }

        if (!targetSkill) {
            continue;
        }

        // Find or create the skill
        let skill = updatedSkills.find(s => s.name.toLowerCase() === targetSkill.toLowerCase());

        if (!skill) {
            // Create new skill entry
            // Capitalize the skill name to match the format in skills.ts
            const capitalizedName = targetSkill.charAt(0).toUpperCase() + targetSkill.slice(1).toLowerCase();
            skill = {
                name: capitalizedName,
                ability: 'int', // Default ability, will be determined by system
                proficiency: 'untrained'
            };
            updatedSkills.push(skill);
        }

        // Apply the effect
        if (effect.mode === 'upgrade') {
            // Upgrade proficiency: 0=untrained, 1=trained, 2=expert, 3=master, 4=legendary
            const proficiencyLevels: Array<'untrained' | 'trained' | 'expert' | 'master' | 'legendary'> =
                ['untrained', 'trained', 'expert', 'master', 'legendary'];

            const currentRank = proficiencyLevels.indexOf(skill.proficiency);
            const newRank = Math.max(currentRank, effect.value);

            if (newRank > currentRank) {
                skill.proficiency = proficiencyLevels[newRank];
            }
        } else if (effect.mode === 'set') {
            const proficiencyLevels: Array<'untrained' | 'trained' | 'expert' | 'master' | 'legendary'> =
                ['untrained', 'trained', 'expert', 'master', 'legendary'];

            if (effect.value >= 0 && effect.value < proficiencyLevels.length) {
                skill.proficiency = proficiencyLevels[effect.value];
            }
        }
    }

    return updatedSkills;
}

/**
 * Apply additional skill choices from dedication feats
 * Handles "additionalSkill" and "conditionalSkill_*" flags that are dynamically calculated
 * These choices grant training in a selected skill
 */
export function applyAdditionalSkillChoices(
    character: Character,
    choices: Record<string, string>
): SkillProficiency[] {
    let updatedSkills = [...(character.skills || [])];

    console.log('[applyAdditionalSkillChoices] Applying additional skill choices:', choices);

    // Find all additional skill choice flags
    const additionalSkillFlags = Object.keys(choices).filter(key =>
        key === 'additionalSkill' || key.startsWith('conditionalSkill_')
    );

    if (additionalSkillFlags.length === 0) {
        return updatedSkills;
    }

    for (const flag of additionalSkillFlags) {
        const choiceValue = choices[flag];
        if (!choiceValue) continue;

        // The choice value is the skill name (e.g., "Acrobatics", "Athletics", etc.)
        // Find or create the skill
        const capitalizedName = choiceValue.charAt(0).toUpperCase() + choiceValue.slice(1).toLowerCase();
        let skill = updatedSkills.find(s => s.name.toLowerCase() === capitalizedName.toLowerCase());

        if (!skill) {
            // Create new skill entry
            skill = {
                name: capitalizedName,
                ability: 'int', // Default ability, will be determined by system
                proficiency: 'untrained'
            };
            updatedSkills.push(skill);
        }

        // Upgrade to trained if currently untrained
        if (skill.proficiency === 'untrained') {
            skill.proficiency = 'trained';
        }
    }
    return updatedSkills;
}

/**
 * Recalculate all skills by applying effects from all character feats
 * This ensures that only active feat effects are applied
 */
export function recalculateSkillsFromFeats(
    character: Character
): SkillProficiency[] {
    // Start with current skills as base
    let updatedSkills = [...(character.skills || [])];

    // Apply effects from all feats
    if (character.feats) {
        const allFeats = getFeats();

        for (const charFeat of character.feats) {
            // Only process feats at or below current level
            if (charFeat.level > character.level) {
                continue;
            }

            const feat = allFeats.find(f => f.id === charFeat.featId);
            if (!feat || !feat.rules) continue;

            const activeEffects = parseActiveEffects(feat);
            if (activeEffects.length === 0) {
                continue;
            }

            // Build choices object from feat's choices
            const choices: Record<string, string> = {};
            if (charFeat.choices && Array.isArray(charFeat.choices)) {
                // Map choices to flag format
                const featChoices = parseFeatChoices(feat);

                // First, map ChoiceSet choices to their flags
                charFeat.choices.forEach((choiceValue: string, index: number) => {
                    if (featChoices[index]) {
                        choices[featChoices[index].flag] = choiceValue;
                    } else {
                        // This choice doesn't have a corresponding ChoiceSet
                        // It might be an additional skill choice (additionalSkill, conditionalSkill_*)
                        // These are added at the end of the choices array
                        const remainingChoiceCount = charFeat.choices.length - featChoices.length;
                        if (index >= featChoices.length && remainingChoiceCount > 0) {
                            // Calculate which additional skill choice this is
                            const additionalIndex = index - featChoices.length;

                            // Map additional choices to flags based on order
                            // For dedication feats, additional choices are typically: additionalSkill, conditionalSkill_0, etc.
                            const additionalSkillFlags = ['additionalSkill'];
                            for (let i = 0; i < 10; i++) {
                                additionalSkillFlags.push(`conditionalSkill_${i}`);
                            }

                            if (additionalIndex < additionalSkillFlags.length) {
                                const flag = additionalSkillFlags[additionalIndex];
                                choices[flag] = choiceValue;
                            }
                        }
                    }
                });
            }

            // Apply static effects (no flag required)
            const staticEffects = activeEffects.filter(e => !e.flag || e.flag === '');

            for (const effect of staticEffects) {
                const skillMatch = effect.path.match(/system\.skills\.([^.\}]+)\.rank/);

                if (skillMatch) {
                    const skillName = skillMatch[1];
                    let skill = updatedSkills.find(s =>
                        s.name.toLowerCase() === skillName.toLowerCase()
                    );

                    if (!skill) {
                        // Capitalize the skill name to match the format in skills.ts
                        const capitalizedName = skillName.charAt(0).toUpperCase() + skillName.slice(1).toLowerCase();
                        skill = {
                            name: capitalizedName,
                            ability: 'int',
                            proficiency: 'untrained'
                        };
                        updatedSkills.push(skill);
                    }

                    // Apply the effect
                    if (effect.mode === 'upgrade') {
                        const proficiencyLevels: Array<'untrained' | 'trained' | 'expert' | 'master' | 'legendary'> =
                            ['untrained', 'trained', 'expert', 'master', 'legendary'];

                        const currentRank = proficiencyLevels.indexOf(skill.proficiency);
                        const newRank = Math.max(currentRank, effect.value);

                        if (newRank > currentRank) {
                            skill.proficiency = proficiencyLevels[newRank];
                        }
                    } else if (effect.mode === 'set') {
                        const proficiencyLevels: Array<'untrained' | 'trained' | 'expert' | 'master' | 'legendary'> =
                            ['untrained', 'trained', 'expert', 'master', 'legendary'];

                        if (effect.value >= 0 && effect.value < proficiencyLevels.length) {
                            skill.proficiency = proficiencyLevels[effect.value];
                        }
                    }
                }
            }

            // Apply effects that require choices
            if (Object.keys(choices).length > 0) {
                const effectsWithChoices = activeEffects.filter(e => e.flag && e.flag !== '');
                if (effectsWithChoices.length > 0) {
                    updatedSkills = applyActiveEffects(
                        { ...character, skills: updatedSkills },
                        choices,
                        effectsWithChoices
                    );
                }

                // Apply additional skill choices (additionalSkill, conditionalSkill_*)
                // These choices grant training in selected skills but don't have ActiveEffectLike rules
                const additionalSkillFlags = Object.keys(choices).filter(key =>
                    key === 'additionalSkill' || key.startsWith('conditionalSkill_')
                );
                if (additionalSkillFlags.length > 0) {
                    const additionalChoices: Record<string, string> = {};
                    for (const flag of additionalSkillFlags) {
                        additionalChoices[flag] = choices[flag];
                    }
                    updatedSkills = applyAdditionalSkillChoices(
                        { ...character, skills: updatedSkills },
                        additionalChoices
                    );
                }
            }
        }
    }

    return updatedSkills;
}

/**
 * Parse feat choices from feat rules
 * Looks for ChoiceSet rules in the feat data
 */
export function parseFeatChoices(feat: LoadedFeat): FeatChoice[] {
    const choices: FeatChoice[] = [];

    // Check if feat has rules array (from pf2e system data)
    if (!feat.rules || !Array.isArray(feat.rules)) {
        return choices;
    }

    for (const rule of feat.rules) {
        if (rule.key === 'ChoiceSet') {
            const choice: FeatChoice = {
                flag: rule.flag || 'choice',
                prompt: rule.prompt || 'Choose',
                type: inferChoiceType(rule),
            };

            // Handle rollOption field (sets a flag based on choice)
            if (rule.rollOption) {
                choice.rollOption = rule.rollOption;
            }

            // Parse choices configuration
            if (rule.choices) {
                // Check if choices is a direct array (like Champion Dedication armor choice)
                if (Array.isArray(rule.choices)) {
                    choice.options = rule.choices.map((c: any) => ({
                        label: c.label,
                        value: c.value,
                        predicate: c.predicate,
                    }));
                    choice.type = 'string';
                } else if (rule.choices.config === 'skills') {
                    choice.type = 'skill';
                } else if (rule.choices.itemType === 'feat') {
                    choice.type = 'feat';
                    // Parse filter for feat selection
                    if (rule.choices.filter && Array.isArray(rule.choices.filter)) {
                        choice.filter = {};
                        parseFilterArray(rule.choices.filter, choice);
                    }
                } else if (rule.choices.itemType === 'spell') {
                    choice.type = 'spell';
                    choice.filter = { itemType: 'spell' };
                    // Parse filter for spell selection
                    if (rule.choices.filter && Array.isArray(rule.choices.filter)) {
                        parseFilterArray(rule.choices.filter, choice);
                    }
                }
            }

            choices.push(choice);
        }
    }

    return choices;
}

/**
 * Parse filter array for choice filters
 */
function parseFilterArray(filterArray: any[], choice: FeatChoice) {
    for (const filterItem of filterArray) {
        if (typeof filterItem === 'string') {
            // Parse filters like "item:level:1", "item:trait:general"
            const parts = filterItem.split(':');
            if (parts[0] === 'item') {
                if (parts[1] === 'level') {
                    choice.filter!.level = parseInt(parts[2]);
                } else if (parts[1] === 'trait') {
                    choice.filter!.traits = choice.filter!.traits || [];
                    choice.filter!.traits.push(parts[2]);
                } else if (parts[1] === 'category') {
                    choice.filter!.category = parts[2];
                } else if (parts[1] === 'slug') {
                    choice.filter!.slugs = choice.filter!.slugs || [];
                    choice.filter!.slugs.push(parts[2]);
                }
            }
        } else if (typeof filterItem === 'object' && filterItem.or) {
            // Handle OR filters (like in Arcane Tattoos)
            for (const orItem of filterItem.or) {
                const parts = orItem.split(':');
                if (parts[0] === 'item' && parts[1] === 'slug') {
                    choice.filter!.slugs = choice.filter!.slugs || [];
                    choice.filter!.slugs.push(parts[2]);
                }
            }
        }
    }
}

/**
 * Infer the type of choice based on the rule configuration
 */
function inferChoiceType(rule: any): FeatChoice['type'] {
    if (rule.choices?.config === 'skills') {
        return 'skill';
    }
    if (rule.choices?.itemType === 'feat') {
        return 'feat';
    }
    if (rule.choices?.itemType === 'spell') {
        return 'spell';
    }
    return 'string';
}

/**
 * Evaluate predicate with access to previous choices
 * This is used for filtering options based on earlier selections in a feat
 * For example, in Skill Mastery, the skill feat choice should only show feats
 * associated with the skills selected in previous choices (skillMaster and skillExpert)
 */
function evaluatePredicateWithChoices(
    character: Character,
    predicate: any,
    previousChoices?: Record<string, string>
): boolean {
    if (!predicate) return true;

    // Handle "or" predicate
    if (predicate.or && Array.isArray(predicate.or)) {
        return predicate.or.some((p: any) => evaluatePredicateWithChoices(character, p, previousChoices));
    }

    // Handle "and" predicate
    if (predicate.and && Array.isArray(predicate.and)) {
        return predicate.and.every((p: any) => evaluatePredicateWithChoices(character, p, previousChoices));
    }

    // Handle "not" predicate
    if (predicate.not && Array.isArray(predicate.not)) {
        return !predicate.not.some((p: any) => evaluatePredicateWithChoices(character, p, previousChoices));
    }

    // Handle "nor" predicate (none of these)
    if (predicate.nor && Array.isArray(predicate.nor)) {
        return !predicate.nor.some((p: any) => evaluatePredicateWithChoices(character, p, previousChoices));
    }

    // Handle "lte" (less than or equal)
    if (predicate.lte !== undefined) {
        const [path, value] = Object.entries(predicate.lte)[0] as [string, number];
        return getCharacterValue(character, path) <= value;
    }

    // Handle simple string predicates (format: "type:value")
    if (typeof predicate === 'string') {
        // Split on first colon to get type and rest
        const colonIndex = predicate.indexOf(':');
        if (colonIndex === -1) {
            // Simple flag check - check if it's in roll options
            const rollOptions = processRollOptions(character);
            return !!rollOptions[predicate];
        }

        const type = predicate.substring(0, colonIndex);
        const value = predicate.substring(colonIndex + 1);

        switch (type) {
            case 'defense':
                // Format: "defense:light:rank:0" means light armor is untrained
                return checkDefensePredicate(character, value);
            case 'skill': {
                // Format: "skill:acrobatics:rank:2" means acrobatics is expert
                // Check if the skill in the predicate matches any of the previous choices
                return checkSkillPredicateWithChoices(character, value, previousChoices);
            }
            default: {
                // Check against roll options
                const rollOptions = processRollOptions(character);
                return !!rollOptions[predicate];
            }
        }
    }

    return true;
}

/**
 * Check skill proficiency predicate with access to previous choices
 * This allows predicates like "skill:acrobatics:rank:2" to be evaluated against
 * the skills selected in previous choices
 */
function checkSkillPredicateWithChoices(
    character: Character,
    value: string,
    previousChoices?: Record<string, string>
): boolean {
    // Format: "skill:acrobatics:rank:2" or "skill:athletics:rank:1"
    const parts = value.split(':');
    if (parts.length < 4) return true;
    if (parts[0] !== 'skill') return true;

    const skillName = parts[1];
    const rankType = parts[2]; // Should be "rank"
    const requiredRank = parseInt(parts[3]); // 0=untrained, 1=trained, 2=expert, 3=master, 4=legendary

    if (rankType !== 'rank') return true;

    // Check if any previous choice matches this skill
    const selectedSkills = Object.values(previousChoices || {}).filter(v => v === skillName);

    if (selectedSkills.length === 0) {
        // No previous choice selected this skill, check character's actual skill proficiency
        const skill = character.skills?.find(s =>
            s.name.toLowerCase() === skillName.toLowerCase()
        );
        if (skill) {
            const proficiencyOrder = ['untrained', 'trained', 'expert', 'master', 'legendary'];
            const currentIdx = proficiencyOrder.indexOf(skill.proficiency);
            return currentIdx >= requiredRank;
        }
        return false;
    }

    // The skill was selected in a previous choice
    // For Skill Mastery, we need to check if the character has the required rank
    // The previous choices just tell us which skills were selected, not their ranks
    const skill = character.skills?.find(s =>
        s.name.toLowerCase() === skillName.toLowerCase()
    );
    if (skill) {
        const proficiencyOrder = ['untrained', 'trained', 'expert', 'master', 'legendary'];
        const currentIdx = proficiencyOrder.indexOf(skill.proficiency);
        return currentIdx >= requiredRank;
    }

    return false;
}

/**
 * Get available options for a choice
 * Evaluates predicates to filter available options if present
 * @param choice - The choice to get options for
 * @param character - Optional character for context
 * @param previousChoices - Optional map of previous choice values (flag -> value)
 */
export function getChoiceOptions(
    choice: FeatChoice,
    character?: Character,
    previousChoices?: Record<string, string>
): string[] {
    // Handle predefined options with predicates (like Champion Dedication armor)
    if (choice.options && Array.isArray(choice.options)) {
        if (!character) {
            // If no character provided, return all options
            return choice.options.map(o => o.value);
        }

        // Filter options based on predicates
        return choice.options
            .filter(option => {
                if (!option.predicate) return true;
                return evaluatePredicateWithChoices(character, option.predicate, previousChoices);
            })
            .map(option => option.value);
    }

    switch (choice.type) {
        case 'skill':
            // Return all skill names
            return skills.map(s => s.name);

        case 'feat':
            // Return feat IDs matching the filter
            const allFeats = getFeats();
            let filteredFeats = allFeats;

            if (choice.filter) {
                if (choice.filter.level !== undefined) {
                    filteredFeats = filteredFeats.filter(f => f.level === choice.filter.level);
                }
                if (choice.filter.category) {
                    filteredFeats = filteredFeats.filter(f => f.category === choice.filter.category);
                }
                if (choice.filter.traits && choice.filter.traits.length > 0) {
                    filteredFeats = filteredFeats.filter(f =>
                        choice.filter!.traits!.some(trait =>
                            f.traits.map(t => t.toLowerCase()).includes(trait.toLowerCase())
                        )
                    );
                }
            }

            // Note: We don't filter skill feats based on previous choices here
            // Users should see ALL available skill feats to choose from
            // The skill ranks from previous choices are applied separately

            return filteredFeats.map(f => f.id);

        case 'spell':
            // For spells, return slugs if available, otherwise return predefined options
            if (choice.filter?.slugs && choice.filter.slugs.length > 0) {
                return choice.filter.slugs;
            }
            // TODO: Load actual spells from spell data
            return [];

        case 'string':
        case 'ability':
        case 'number':
            // For predefined options, return values
            if (choice.options && Array.isArray(choice.options)) {
                return choice.options.map(o => o.value);
            }
            return [];

        default:
            return [];
    }
}

/**
 * Get the display name for a choice value
 */
export function getChoiceDisplayValue(
    value: string,
    choice: FeatChoice
): string {
    // First check if this value is in the predefined options
    if (choice.options && Array.isArray(choice.options)) {
        const option = choice.options.find(o => o.value === value);
        if (option) {
            // Convert PF2E localization keys to readable names
            // e.g., "PF2E.Actor.Character.Proficiency.Defense.LightShort" -> "Light Armor"
            if (option.label.includes('.')) {
                const parts = option.label.split('.');
                const lastPart = parts[parts.length - 1];
                // Capitalize and format
                return lastPart
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase())
                    .trim();
            }
            return option.label;
        }
    }

    switch (choice.type) {
        case 'skill': {
            const skill = skills.find(s => s.name === value || s.name.toLowerCase() === value.toLowerCase());
            return skill?.name || value;
        }

        case 'feat': {
            const allFeats = getFeats();
            const feat = allFeats.find(f => f.id === value);
            return feat?.name || value;
        }

        case 'spell':
            // Convert slug to readable name
            return value.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

        case 'ability':
            // Capitalize ability score
            return value.toUpperCase();

        default:
            return value;
    }
}

/**
 * Apply subfeatures proficiencies from feats (armor, weapons, class DC, spellcasting, etc.)
 * Returns updated character with all proficiencies applied
 */
export function applySubfeaturesProficiencies(character: Character): Character {
    console.log(`[applySubfeaturesProficiencies] START - Processing ${character.feats?.length || 0} feats for character at level ${character.level}`);

    const updated = { ...character };
    const allFeats = getFeats();

    // Initialize arrays if not present
    if (!updated.weaponProficiencies) {
        updated.weaponProficiencies = [];
    }
    if (!updated.armorProficiencies) {
        updated.armorProficiencies = [];
    }
    if (!updated.classDCs) {
        updated.classDCs = [];
    }

    // Collect all proficiencies from feats
    for (const charFeat of character.feats || []) {
        // Only process feats at or below current level
        if (charFeat.level > character.level) {
            continue;
        }

        const feat = allFeats.find(f => f.id === charFeat.featId);
        if (!feat) continue;

        const proficiencies = feat.subfeatures?.proficiencies;

        // Build choices map from feat's choices array (for class DC ability score selection)
        const choices: Record<string, string> = {};
        if (charFeat.choices && Array.isArray(charFeat.choices)) {
            const featChoices = parseFeatChoices(feat);
            charFeat.choices.forEach((choiceValue: string, index: number) => {
                if (featChoices[index]) {
                    choices[featChoices[index].flag] = choiceValue;
                }
            });
        }

        // Apply subfeatures proficiencies first
        if (proficiencies) {
            // Apply armor proficiencies (light, medium, heavy)
            for (const armorType of ['light', 'medium', 'heavy'] as const) {
                if (proficiencies[armorType]?.rank) {
                    const rank = proficiencyRankFromNumber(proficiencies[armorType].rank!);
                    applyArmorProficiency(updated, armorType, rank);
                }
            }

            // Apply weapon proficiencies (unarmed, simple, martial)
            for (const weaponType of ['unarmed', 'simple', 'martial'] as const) {
                if (proficiencies[weaponType]?.rank) {
                    const rank = proficiencyRankFromNumber(proficiencies[weaponType].rank!);
                    applyWeaponProficiency(updated, weaponType, rank);
                }
            }

            // Apply class DC proficiencies
            for (const [classType, data] of Object.entries(proficiencies)) {
                // Skip if it's not a class DC (armor/weapon types already handled)
                if (['light', 'medium', 'heavy', 'unarmed', 'simple', 'martial', 'spellcasting'].includes(classType)) {
                    continue;
                }

                // Check if this looks like a class DC (has rank property)
                if (data && typeof data === 'object' && 'rank' in data) {
                    const classDCData = data as { rank?: number; attribute?: string };
                    if (classDCData.rank) {
                        const rank = proficiencyRankFromNumber(classDCData.rank);
                        // For archetype dedications, prefer user's choice over hardcoded attribute
                        // This allows players to choose the ability score for archetype Class DCs
                        let abilityScore = choices.attribute || classDCData.attribute;
                        applyClassDCProficiency(updated, classType, rank, abilityScore);
                    }
                }
            }

            // Handle spellcasting proficiency
            if (proficiencies.spellcasting?.rank) {
                // Spellcasting is handled separately in the character sheet
                // This just marks that the character has spellcasting from this archetype
                if (!updated.spellcastingFromFeats) {
                    updated.spellcastingFromFeats = [];
                }
                const sourceFeat = feat.name;
                if (!updated.spellcastingFromFeats.includes(sourceFeat)) {
                    updated.spellcastingFromFeats.push(sourceFeat);
                }
            }

            // Handle languages from subfeatures (e.g., Druid Dedication grants Wildsong)
            if (feat.subfeatures?.languages?.granted && Array.isArray(feat.subfeatures.languages.granted)) {
                if (!updated.languages) {
                    updated.languages = [];
                }
                for (const language of feat.subfeatures.languages.granted) {
                    if (!updated.languages.includes(language)) {
                        updated.languages.push(language);
                    }
                }
            }
        }

        // Also process ActiveEffectLike rules for weapon proficiencies (e.g., alchemical bombs)
        // This handles cases like Alchemist Dedication which grants training in "weapon-base-alchemical-bomb"
        if (feat.rules && Array.isArray(feat.rules)) {
            // Process RollOption rules first (needed for predicates)
            const rollOptions = processRollOptions(updated);

            for (const rule of feat.rules) {
                if (rule.key === 'ActiveEffectLike' && rule.path && rule.mode === 'upgrade') {
                    // Check if this effect has a predicate
                    if (rule.predicate) {
                        if (!evaluatePredicate(updated, rule.predicate)) {
                            continue; // Skip this effect if predicate doesn't match
                        }
                    }

                    // Check if this is a weapon proficiency effect
                    const weaponMatch = rule.path.match(/system\.proficiencies\.attacks\.(.+)\.rank/);
                    if (weaponMatch) {
                        const weaponCategory = weaponMatch[1];
                        const value = evaluateEffectValue(rule.value, updated, rollOptions);
                        if (value > 0) {
                            const rank = proficiencyRankFromNumber(value);
                            applyWeaponProficiency(updated, weaponCategory as any, rank);
                        }
                    }

                    // Check if this is an armor proficiency effect
                    const armorMatch = rule.path.match(/system\.proficiencies\.defenses\.(.+)\.rank/);
                    if (armorMatch) {
                        const armorCategory = armorMatch[1];
                        const value = evaluateEffectValue(rule.value, updated, rollOptions);
                        if (value > 0) {
                            const rank = proficiencyRankFromNumber(value);
                            applyArmorProficiency(updated, armorCategory as any, rank);
                        }
                    }
                }
            }
        }
    }

    return updated;
}

/**
 * Convert numeric rank (0-4) to proficiency name
 */
function proficiencyRankFromNumber(rank: number): 'untrained' | 'trained' | 'expert' | 'master' | 'legendary' {
    const ranks: Array<'untrained' | 'trained' | 'expert' | 'master' | 'legendary'> =
        ['untrained', 'trained', 'expert', 'master', 'legendary'];
    return ranks[Math.min(Math.max(rank, 0), 4)] || 'untrained';
}

/**
 * Apply or upgrade armor proficiency
 */
function applyArmorProficiency(
    character: Character,
    category: 'light' | 'medium' | 'heavy',
    proficiency: 'untrained' | 'trained' | 'expert' | 'master' | 'legendary'
): void {
    const existing = character.armorProficiencies!.find(p => p.category === category);

    if (existing) {
        // Upgrade if new proficiency is higher
        const order = ['untrained', 'trained', 'expert', 'master', 'legendary'];
        const currentIdx = order.indexOf(existing.proficiency);
        const newIdx = order.indexOf(proficiency);
        if (newIdx > currentIdx) {
            existing.proficiency = proficiency;
        }
    } else {
        // Add new proficiency
        character.armorProficiencies!.push({ category, proficiency });
    }
}

/**
 * Apply or upgrade weapon proficiency
 */
function applyWeaponProficiency(
    character: Character,
    category: 'unarmed' | 'simple' | 'martial',
    proficiency: 'untrained' | 'trained' | 'expert' | 'master' | 'legendary'
): void {
    const existing = character.weaponProficiencies!.find(p => p.category === category);

    if (existing) {
        // Upgrade if new proficiency is higher
        const order = ['untrained', 'trained', 'expert', 'master', 'legendary'];
        const currentIdx = order.indexOf(existing.proficiency);
        const newIdx = order.indexOf(proficiency);
        if (newIdx > currentIdx) {
            existing.proficiency = proficiency;
        }
    } else {
        // Add new proficiency
        character.weaponProficiencies!.push({ category, proficiency });
    }
}

/**
 * Apply or upgrade class DC proficiency
 */
function applyClassDCProficiency(
    character: Character,
    classType: string,
    proficiency: 'untrained' | 'trained' | 'expert' | 'master' | 'legendary',
    attribute?: string
): void {
    console.log(`[applyClassDCProficiency] classType=${classType}, proficiency=${proficiency}, attribute=${attribute}`);

    // Find or create class DC entry
    let classDC = character.classDCs!.find(c => c.classType === classType);

    if (!classDC) {
        // Create new class DC entry
        classDC = {
            classType,
            proficiency,
            ability: attribute as AbilityName || 'cha', // Default to cha if not specified
            dedicated: false
        };
        character.classDCs!.push(classDC);
        console.log(`[applyClassDCProficiency] Created new class DC: ${classType} with ${proficiency} proficiency and ${attribute} ability`);
    } else {
        // Upgrade proficiency if higher
        const order = ['untrained', 'trained', 'expert', 'master', 'legendary'];
        const currentIdx = order.indexOf(classDC.proficiency);
        const newIdx = order.indexOf(proficiency);
        if (newIdx > currentIdx) {
            classDC.proficiency = proficiency;
        }
        // Update attribute if provided
        if (attribute) {
            classDC.ability = attribute as AbilityName;
        }
    }
}

/**
 * Calculate additional choices needed for archetype dedication feats
 *
 * This is now a GENERIC system that automatically analyzes all dedication feats
 * by parsing their ActiveEffectLike rules and descriptions.
 *
 * No more hardcoding - this works for ALL dedications including:
 * - Core class dedications (Barbarian, Bard, Champion, Cleric, Druid, Fighter, etc.)
 * - Hybrid class dedications (Magus, Summoner, etc.)
 * - Archetype dedications (Alkenstar Agent, Bright Lion, etc.)
 * - ANY dedication that grants skills with "if already trained" logic
 *
 * The system:
 * 1. Extracts granted skills from ActiveEffectLike rules
 * 2. Parses description for conditional logic patterns
 * 3. Checks character's current skills to determine additional choices needed
 */
export function calculateDedicationAdditionalChoices(
    feat: LoadedFeat,
    character: Character
): FeatChoice[] {
    // Use the generic analyzer system
    return genericCalculateAdditionalChoices(feat, character);
}

/**
 * Check if a feat requires additional choices based on character's current skills
 */
export function needsAdditionalSkillChoice(feat: LoadedFeat, character: Character): boolean {
    const additionalChoices = calculateDedicationAdditionalChoices(feat, character);
    return additionalChoices.length > 0;
}

/**
 * Apply special skills from archetype dedication feats
 * Handles:
 * - Deity skills (Cleric, Champion)
 * - Muse/Order/Instinct skills (Bard, Druid, Barbarian, etc.)
 * - Additional conditional skill choices stored in feat choices
 */
export function applyDeitySkillsFromDedications(character: Character): SkillProficiency[] {
    const updatedSkills = [...(character.skills || [])];
    const allFeats = getFeats();

    for (const charFeat of character.feats || []) {
        // Only process feats at or below current level
        if (charFeat.level > character.level) {
            continue;
        }

        const feat = allFeats.find(f => f.id === charFeat.featId);
        if (!feat) continue;

        // Build choices map from feat's choices array
        const choices: Record<string, string> = {};
        if (charFeat.choices && Array.isArray(charFeat.choices)) {
            const featChoices = parseFeatChoices(feat);
            charFeat.choices.forEach((choiceValue: string, index: number) => {
                if (featChoices[index]) {
                    choices[featChoices[index].flag] = choiceValue;
                }
            });
        }

        // Handle deity skills (Cleric, Champion)
        if (feat.name === 'Cleric Dedication' || feat.name === 'Champion Dedication') {
            const deityChoice = choices.deity;
            if (!deityChoice) continue;

            const deity = getDeityById(deityChoice);
            if (!deity?.skill) continue;

            // Apply the deity's skill as trained
            const skillName = deity.skill.name;
            const skillKey = skillName.toLowerCase();
            let skill = updatedSkills.find(s => s.name.toLowerCase() === skillKey);

            if (!skill) {
                skill = {
                    name: skillName,
                    ability: getAbilityForSkill(skillName),
                    proficiency: 'untrained'
                };
                updatedSkills.push(skill);
            }

            // Upgrade to trained if currently untrained
            if (skill.proficiency === 'untrained') {
                skill.proficiency = 'trained';
            }
        }

        // Handle conditional additional skills (from "if already trained, gain additional skill")
        // These are stored with the "additionalSkill" flag in choices
        const additionalSkillChoice = choices.additionalSkill;
        if (additionalSkillChoice) {
            // Find the skill by name
            let skill = updatedSkills.find(s =>
                s.name.toLowerCase() === additionalSkillChoice.toLowerCase() ||
                s.name.toLowerCase() === additionalSkillChoice.toLowerCase().replace(/-/g, ' ')
            );

            if (!skill) {
                // Create new skill entry
                skill = {
                    name: additionalSkillChoice, // Assume it's already the proper name
                    ability: 'int', // Will be corrected by recalculation
                    proficiency: 'untrained'
                };
                updatedSkills.push(skill);
            }

            // Upgrade to trained
            if (skill.proficiency === 'untrained') {
                skill.proficiency = 'trained';
            }
        }
    }

    return updatedSkills;
}

/**
 * Get the ability score associated with a skill
 */
function getAbilityForSkill(skillName: string): AbilityName {
    const skillLower = skillName.toLowerCase();
    const skill = skills.find(s => s.name.toLowerCase() === skillLower);
    return (skill?.ability || 'int') as AbilityName;
}

/**
 * Predicate matching system for complex feat rules
 * Evaluates PF2e-style predicates against character state
 */
export function evaluatePredicate(
    character: Character,
    predicate: any
): boolean {
    if (!predicate) return true;

    // Handle "or" predicate
    if (predicate.or && Array.isArray(predicate.or)) {
        return predicate.or.some((p: any) => evaluatePredicate(character, p));
    }

    // Handle "and" predicate
    if (predicate.and && Array.isArray(predicate.and)) {
        return predicate.and.every((p: any) => evaluatePredicate(character, p));
    }

    // Handle "not" predicate
    if (predicate.not && Array.isArray(predicate.not)) {
        return !predicate.not.some((p: any) => evaluatePredicate(character, p));
    }

    // Handle "nor" predicate (none of these)
    if (predicate.nor && Array.isArray(predicate.nor)) {
        return !predicate.nor.some((p: any) => evaluatePredicate(character, p));
    }

    // Handle "lte" (less than or equal)
    if (predicate.lte !== undefined) {
        const [path, value] = Object.entries(predicate.lte)[0] as [string, number];
        return getCharacterValue(character, path) <= value;
    }

    // Handle simple string predicates (format: "type:value")
    if (typeof predicate === 'string') {
        // Split on first colon to get type and rest
        const colonIndex = predicate.indexOf(':');
        if (colonIndex === -1) {
            // Simple flag check - check if it's in roll options
            const rollOptions = processRollOptions(character);
            return !!rollOptions[predicate];
        }

        const type = predicate.substring(0, colonIndex);
        const value = predicate.substring(colonIndex + 1);

        switch (type) {
            case 'defense':
                // Format: "defense:light:rank:0" means light armor is untrained
                return checkDefensePredicate(character, value);
            default: {
                // Check against roll options
                const rollOptions = processRollOptions(character);
                return !!rollOptions[predicate];
            }
        }
    }

    return true;
}

/**
 * Get a character value by path
 */
function getCharacterValue(character: Character, path: string): number {
    const parts = path.split('.');
    let value: any = character;

    for (const part of parts) {
        if (value && typeof value === 'object' && part in value) {
            value = value[part];
        } else {
            return 0;
        }
    }

    return typeof value === 'number' ? value : 0;
}

/**
 * Check defense proficiency predicate
 * Format: "light:rank:0" = light armor untrained, "light:rank:1" = light armor trained
 */
function checkDefensePredicate(character: Character, value: string): boolean {
    const [armorType, prop, expectedRank] = value.split(':');

    if (!prop || prop !== 'rank') return true;

    const armorProf = character.armorProficiencies?.find(p => p.category === armorType);

    if (expectedRank === '0') {
        // Check if untrained
        return !armorProf || armorProf.proficiency === 'untrained';
    }

    if (armorProf) {
        const proficiencyOrder = ['untrained', 'trained', 'expert', 'master', 'legendary'];
        const currentIdx = proficiencyOrder.indexOf(armorProf.proficiency);
        const expectedIdx = parseInt(expectedRank);
        return currentIdx >= expectedIdx;
    }

    return false;
}

/**
 * Process RollOption rules from feats
 * These set flags that can be used by other rules as predicates
 * Also processes rollOption field from ChoiceSet rules (e.g., Champion Dedication)
 */
export function processRollOptions(character: Character): Record<string, any> {
    const rollOptions: Record<string, any> = {};

    if (!character.feats) return rollOptions;

    const allFeats = getFeats();

    for (const charFeat of character.feats) {
        const feat = allFeats.find(f => f.id === charFeat.featId);
        if (!feat?.rules) continue;

        // Build choices map
        const choices: Record<string, string> = {};
        const featChoices = parseFeatChoices(feat);
        if (charFeat.choices && Array.isArray(charFeat.choices)) {
            charFeat.choices.forEach((choiceValue: string, index: number) => {
                if (featChoices[index]) {
                    choices[featChoices[index].flag] = choiceValue;

                    // Handle rollOption field from ChoiceSet
                    // When a choice with rollOption is made, set the flag
                    const rollOptionFlag = featChoices[index].rollOption;
                    if (rollOptionFlag) {
                        // Set the roll option flag with the choice value
                        // e.g., "champion-dedication": "light-and-medium"
                        rollOptions[`${rollOptionFlag}:${choiceValue}`] = true;
                        rollOptions[rollOptionFlag] = choiceValue;
                    }
                }
            });
        }

        // Process RollOption rules
        if (feat.rules && Array.isArray(feat.rules)) {
            for (const rule of feat.rules) {
                if (rule.key === 'RollOption' && rule.option) {
                    const optionValue = rule.value || true;

                    // Check if this RollOption has a predicate
                    if (rule.predicate) {
                        if (evaluatePredicate(character, rule.predicate)) {
                            rollOptions[rule.option] = optionValue;
                        }
                    } else {
                        rollOptions[rule.option] = optionValue;
                    }
                }
            }
        }
    }

    return rollOptions;
}

/**
 * Evaluate complex effect value formulas from ActiveEffectLike rules
 * Handles FoundryVTT-style formulas like:
 * - "max(@actor.system.proficiencies.defenses.medium.rank, 1)"
 * - "ternary(gte(@actor.level,13),min(@actor.system.proficiencies.defenses.unarmored.rank,2),1)"
 */
export function evaluateEffectValue(
    value: number | string,
    character: Character,
    rollOptions: Record<string, any>
): number {
    // If already a number, return it
    if (typeof value === 'number') {
        return value;
    }

    // Handle simple numeric strings
    if (/^\d+$/.test(value)) {
        return parseInt(value, 10);
    }

    // Handle max(a, b, c) function
    const maxMatch = value.match(/max\((.+)\)/);
    if (maxMatch) {
        const args = maxMatch[1].split(',').map(arg => evaluateEffectValue(arg.trim(), character, rollOptions));
        return Math.max(...args);
    }

    // Handle min(a, b, c) function
    const minMatch = value.match(/min\((.+)\)/);
    if (minMatch) {
        const args = minMatch[1].split(',').map(arg => evaluateEffectValue(arg.trim(), character, rollOptions));
        return Math.min(...args);
    }

    // Handle ternary(condition, trueValue, falseValue) function
    const ternaryMatch = value.match(/ternary\((.+),(.+),(.+)\)/);
    if (ternaryMatch) {
        const condition = ternaryMatch[1].trim();
        const trueValue = evaluateEffectValue(ternaryMatch[2].trim(), character, rollOptions);
        const falseValue = evaluateEffectValue(ternaryMatch[3].trim(), character, rollOptions);

        // Handle gte(a, b) - greater than or equal
        const gteMatch = condition.match(/gte\((.+),(.+)\)/);
        if (gteMatch) {
            const left = evaluateEffectValue(gteMatch[1].trim(), character, rollOptions);
            const right = evaluateEffectValue(gteMatch[2].trim(), character, rollOptions);
            return left >= right ? trueValue : falseValue;
        }

        return falseValue;
    }

    // Handle @actor references
    // @actor.level -> character.level
    // @actor.system.proficiencies.defenses.{type}.rank -> armor proficiency rank
    const actorLevelMatch = value.match(/@actor\.level/);
    if (actorLevelMatch) {
        return character.level;
    }

    // @actor.system.proficiencies.defenses.{type}.rank
    const defenseRankMatch = value.match(/@actor\.system\.proficiencies\.defenses\.(\w+)\.rank/);
    if (defenseRankMatch) {
        const armorType = defenseRankMatch[1];
        const armorProf = character.armorProficiencies?.find(p => p.category === armorType);
        if (armorProf) {
            const proficiencyOrder = ['untrained', 'trained', 'expert', 'master', 'legendary'];
            return proficiencyOrder.indexOf(armorProf.proficiency);
        }
        return 0; // untrained
    }

    // @actor.system.proficiencies.defenses.unarmored.rank
    const unarmoredRankMatch = value.match(/@actor\.system\.proficiencies\.defenses\.unarmored\.rank/);
    if (unarmoredRankMatch) {
        // Check if character has unarmored defense from class or feats
        // For simplicity, if they have armor proficiencies, assume they might have unarmored
        // This would need to be enhanced with proper unarmored defense tracking
        return 0; // Default to untrained for archetype dedications
    }

    // Default to parsing as number or return 0
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed;
}
