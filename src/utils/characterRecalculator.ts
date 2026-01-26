/**
 * Character Recalculation System
 *
 * This system recalculates all character statistics from scratch based on:
 * - Base attributes (ancestry, background, class, level)
 * - Active feats
 * - Active choices
 *
 * IMPORTANT: BUILDER vs CHARACTER SHEET MODE
 * ===========================================
 * The sidebar functions as BOTH a character builder AND a character sheet:
 *
 * BUILDER MODE (retraining enabled):
 * - Users can change level up/down to retrain choices
 * - ALL selections (feats, choices, boosts) MUST persist regardless of current level
 * - recalculateCharacter() applies ONLY effects valid at current level
 * - Choices remain in character data even if their level > character.level
 *
 * CHARACTER SHEET MODE (view-only):
 * - Shows only active effects at current level
 * - Same recalculation logic, just without UI for retraining
 *
 * KEY PRINCIPLE: Never remove data when level decreases!
 * - Feats at level 10 stay in character.feats when going to level 5
 * - Choices at level 10 stay when going to level 5
 * - recalculateCharacter() will simply not apply their effects
 *
 * This ensures proper support for retraining - when anything changes,
 * all dependent values are correctly recalculated.
 */

import { Character, SkillProficiency, AbilityName, Buff, BonusType } from '../types';
import { ancestries, backgrounds, classes, skills, shouldResetDailyUses } from '../data';
import { recalculateSkillsFromFeats, applySubfeaturesProficiencies, applyDeitySkillsFromDedications } from './featChoices';
import { getFeats, getArmor, getGear } from '../data/pf2e-loader';
import { getAllKineticistJunctionSkills } from '../data/classFeatures';
import { getArmorProficiencyAtLevel, getSavingThrowAtLevel, getPerceptionAtLevel, getHitPointsPerLevel, getWeaponProficiencyAtLevel, proficiencyLevelToName } from '../data/classProgressions';
import { getSpellGrantingItem, getSpellForItemChoice, getAllSpellGrantingItemIds } from '../data/spellGrantingItems';
import { getAllInnateSpellsForCharacter } from '../data/innateSpellSources';
import { getClassIdByName } from '../data/classSpecializations';

/**
 * Recalculate ALL character data from scratch
 * This is the main entry point for character recalculation
 */
export function recalculateCharacter(character: Character): Character {
    let updated = { ...character };

    // Recalculate in dependency order
    updated = recalculateAbilityScores(updated);
    updated = recalculateSkills(updated);
    updated = recalculateSavesAndPerception(updated); // Recalculate saves and perception from feats and class
    updated = initializeArmorProficiency(updated); // Initialize base class armor proficiencies
    updated = initializeWeaponProficiency(updated); // Initialize base class weapon proficiencies
    updated = applySubfeaturesProficiencies(updated); // Apply feat proficiencies (armor, weapons, class DC)
    updated = recalculateHP(updated);
    updated = recalculateSpeed(updated);
    updated = recalculateSenses(updated);
    updated = recalculateLanguages(updated);
    updated = processFeatFlatModifiers(updated); // Process FlatModifier rules from feats (e.g., Incredible Initiative)
    updated = processEquipmentBonuses(updated); // Process FlatModifier rules from equipment
    updated = processSpellGrantingItems(updated); // Add spells from invested spell-granting items
    updated = processInnateSpells(updated); // Add innate spells from backgrounds/feats
    updated = resetItemDailyUses(updated); // Reset daily uses for spell-granting items

    return updated;
}

/**
 * Recalculate ability scores from ancestry, background, class, and level
 */
export function recalculateAbilityScores(character: Character): Character {
    const updated = { ...character };

    // Start with base 10 in all abilities
    const baseScores: Record<AbilityName, number> = {
        str: 10,
        dex: 10,
        con: 10,
        int: 10,
        wis: 10,
        cha: 10,
    };

    // Apply ancestry boosts and flaws
    const ancestry = ancestries.find(a => a.id === character.ancestryId);
    if (ancestry) {
        const ancestryBoosts = ancestry.abilityBoosts as (AbilityName | 'free')[];
        const ancestryFlaws = ancestry.abilityFlaws as AbilityName[];

        // Apply flaws
        for (const flaw of ancestryFlaws) {
            baseScores[flaw] -= 2;
        }

        // Apply fixed boosts (non-free)
        for (const boost of ancestryBoosts) {
            if (boost !== 'free') {
                baseScores[boost] = applyAbilityBoost(baseScores[boost]);
            }
        }
    }

    // Apply user-selected ancestry boosts (for free boosts from ancestry)
    if (character.abilityBoosts?.ancestry) {
        for (const boost of character.abilityBoosts.ancestry) {
            if (boost) {
                baseScores[boost] = applyAbilityBoost(baseScores[boost]);
            }
        }
    }

    // Apply background boosts
    const background = backgrounds.find((b: any) => b.id === character.backgroundId);
    if (background && character.abilityBoosts?.background) {
        const bgBoosts = character.abilityBoosts.background;
        for (const boost of bgBoosts) {
            if (boost) {
                baseScores[boost] = applyAbilityBoost(baseScores[boost]);
            }
        }
    }

    // Apply class boost (key ability)
    const classData = classes.find((c: any) => c.id === character.classId);
    if (classData && character.abilityBoosts?.class) {
        const classBoost = character.abilityBoosts.class;
        if (classBoost) {
            baseScores[classBoost] = applyAbilityBoost(baseScores[classBoost]);
        }
    }

    // Apply free boosts (level 1)
    if (character.abilityBoosts?.free) {
        for (const boost of character.abilityBoosts.free) {
            if (boost) {
                baseScores[boost] = applyAbilityBoost(baseScores[boost]);
            }
        }
    }

    // Apply level-up boosts (only for levels up to current level)
    if (character.abilityBoosts?.levelUp) {
        for (const [levelStr, levelBoosts] of Object.entries(character.abilityBoosts.levelUp)) {
            const level = parseInt(levelStr);
            // Only apply boosts for levels the character has reached
            if (level <= character.level && Array.isArray(levelBoosts)) {
                for (const boost of levelBoosts) {
                    if (boost) {
                        baseScores[boost] = applyAbilityBoost(baseScores[boost]);
                    }
                }
            }
        }
    }

    updated.abilityScores = baseScores;
    return updated;
}

/**
 * Apply a single ability boost following PF2e rules
 */
function applyAbilityBoost(currentScore: number): number {
    if (currentScore >= 18) {
        return currentScore + 1;
    } else {
        return currentScore + 2;
    }
}

/**
 * Recalculate all skills including:
 * - Class trained skills
 * - Background trained skills
 * - Feat effects
 * - Skill increases from level-ups
 */
export function recalculateSkills(character: Character): Character {
    const updated = { ...character };
    const classData = classes.find((c: any) => c.id === character.classId);
    const backgroundData = backgrounds.find((b: any) => b.id === character.backgroundId);

    // Start with all skills as untrained
    let skillMap = new Map<string, SkillProficiency>();

    for (const skill of skills) {
        skillMap.set(skill.name.toLowerCase(), {
            name: skill.name,
            ability: skill.ability,
            proficiency: 'untrained' as const,
        });
    }

    // Apply class trained skills
    if (classData?.trainedSkills) {
        for (const skillName of classData.trainedSkills) {
            const skillKey = skillName.toLowerCase();
            const skill = skillMap.get(skillKey);
            if (skill) {
                skill.proficiency = 'trained';
            }
        }
    }

    // Apply background trained skills
    if (backgroundData?.trainedSkills) {
        for (const skillName of backgroundData.trainedSkills) {
            const skillKey = skillName.toLowerCase();
            const skill = skillMap.get(skillKey);
            if (skill) {
                skill.proficiency = 'trained';
            }
        }
    }

    // Apply bonus skill from overlap (skillIncreases[0])
    if (character.skillIncreases?.[0]) {
        const bonusSkill = character.skillIncreases[0].toLowerCase();
        const skill = skillMap.get(bonusSkill);
        if (skill) {
            skill.proficiency = 'trained';
        }
    }

    // Apply level 1 manual skill training selections (from SkillTrainingModal)
    // Use manualSkillTraining array which stores just the skill NAMES (not calculated proficiencies)
    if (character.manualSkillTraining && character.manualSkillTraining.length > 0) {
        for (const skillName of character.manualSkillTraining) {
            const skillKey = skillName.toLowerCase();
            const skill = skillMap.get(skillKey);
            // Set to trained if currently untrained
            if (skill && skill.proficiency === 'untrained') {
                skill.proficiency = 'trained';
            }
        }
    }

    // Apply INT bonus skills (from Intelligence increases at various levels)
    if (character.intBonusSkills) {
        for (const [levelStr, skillNames] of Object.entries(character.intBonusSkills)) {
            const level = parseInt(levelStr);
            // Only apply INT bonus skills for levels the character has reached
            if (level <= character.level && Array.isArray(skillNames)) {
                for (const skillName of skillNames) {
                    const skillKey = skillName.toLowerCase();
                    const skill = skillMap.get(skillKey);
                    // Set to trained if currently untrained
                    if (skill && skill.proficiency === 'untrained') {
                        skill.proficiency = 'trained';
                    }
                }
            }
        }
    }

    // Apply kineticist junction skills (from gate junctions like Air Gate, Earth Gate, etc.)
    const junctionSkills = getAllKineticistJunctionSkills(character);
    for (const skillName of junctionSkills) {
        const skillKey = skillName.toLowerCase();
        const skill = skillMap.get(skillKey);
        // Set to trained if currently untrained
        if (skill && skill.proficiency === 'untrained') {
            skill.proficiency = 'trained';
        }
    }

    // Convert map back to array
    updated.skills = Array.from(skillMap.values());

    // Apply feat effects (this may upgrade skills, e.g., Herbalism Dedication -> Nature Expert)
    updated.skills = recalculateSkillsFromFeats(updated);

    // Apply deity skills from archetype dedication feats (Cleric, Champion, etc.)
    updated.skills = applyDeitySkillsFromDedications(updated);

    // NOW apply skill increases from level-ups (levels 3, 5, 7, 9, 11, 13, 15, 17, 19)
    // This runs AFTER feat effects so we see the correct current proficiency
    const PROFICIENCY_ORDER = ['untrained', 'trained', 'expert', 'master', 'legendary'] as const;
    const skillIncreaseLevels = [3, 5, 7, 9, 11, 13, 15, 17, 19];

    for (const level of skillIncreaseLevels) {
        const skillName = character.skillIncreases?.[level];
        if (skillName && level <= character.level) {
            const skillKey = skillName.toLowerCase();
            const skill = updated.skills.find(s => s.name.toLowerCase() === skillKey);
            if (skill) {
                const currentIdx = PROFICIENCY_ORDER.indexOf(skill.proficiency);

                // PF2e Remaster: Skill increases can be used to:
                // - Become Trained in an Untrained skill
                // - Upgrade from Trained → Expert → Master → Legendary

                // Check max proficiency for level
                let maxIdx = 2; // expert by default
                if (level >= 15) maxIdx = 4; // legendary
                else if (level >= 7) maxIdx = 3; // master

                if (currentIdx < maxIdx && currentIdx < PROFICIENCY_ORDER.length - 1) {
                    skill.proficiency = PROFICIENCY_ORDER[currentIdx + 1];
                }
            }
        }
    }

    return updated;
}

/**
 * Recalculate HP based on class, level, CON modifier, ancestry, and feats (like Toughness)
 */
export function recalculateHP(character: Character): Character {
    const updated = { ...character };
    const classData = classes.find((c: any) => c.id === character.classId);
    const ancestryData = ancestries.find((a: any) => a.id === character.ancestryId);

    if (!classData) return updated;

    // Calculate CON modifier
    const conMod = Math.floor((updated.abilityScores.con - 10) / 2);

    // Get ancestry HP (added once, not multiplied by level)
    const ancestryHP = ancestryData?.hitPoints || 0;

    // Calculate base HP per level from class progression data
    const classId = classData.id;
    const hpPerLevel = getHitPointsPerLevel(classId);

    // Total HP = Ancestry HP (once) + (Class HP + CON mod) × Level
    let maxHP = ancestryHP + (hpPerLevel + conMod) * character.level;

    // Check for Toughness feat which adds +HP per level
    if (character.feats && character.feats.length > 0) {
        const allFeats = getFeats();

        for (const charFeat of character.feats) {
            // Only count feats at or below current level
            if (charFeat.level > character.level) continue;

            const feat = allFeats.find(f => f.id === charFeat.featId);

            if (feat && feat.rules && Array.isArray(feat.rules)) {
                for (const rule of feat.rules) {
                    // Check for FlatModifier rules that affect HP (like Toughness)
                    if (rule.key === 'FlatModifier' && rule.selector === 'hp') {
                        // Parse the value - could be a number or a reference like "@actor.level"
                        let hpBonus = 0;
                        if (typeof rule.value === 'number') {
                            hpBonus = rule.value;
                        } else if (typeof rule.value === 'string') {
                            // Handle "@actor.level" reference
                            if (rule.value.includes('@actor.level')) {
                                hpBonus = character.level;
                            } else {
                                // Try to parse as number
                                const parsed = parseInt(rule.value);
                                if (!isNaN(parsed)) {
                                    hpBonus = parsed;
                                }
                            }
                        }

                        if (hpBonus > 0) {
                            maxHP += hpBonus;
                        }
                    }
                }
            }
        }
    }

    updated.hitPoints = {
        current: updated.hitPoints?.current || maxHP,
        max: maxHP,
        temporary: updated.hitPoints?.temporary || 0,
    };

    return updated;
}

/**
 * Recalculate saving throws and perception from class base proficiencies and feats
 * This handles feats like Canny Acumen that improve saves/perception
 */
export function recalculateSavesAndPerception(character: Character): Character {
    const updated = { ...character };
    const classData = classes.find((c: any) => c.id === character.classId);

    if (!classData) return updated;

    // Helper to convert proficiency level number (0-4) to rank number (0, 2, 4, 6, 8)
    // Mapping: 0(untrained)=0, 1(trained)=2, 2(expert)=4, 3(master)=6, 4(legendary)=8
    const profLevelToRank = (level: number): number => level * 2;

    const rankToProf = (rank: number): 'untrained' | 'trained' | 'expert' | 'master' | 'legendary' => {
        switch (rank) {
            case 0: return 'untrained';
            case 2: return 'trained';
            case 4: return 'expert';
            case 6: return 'master';
            case 8: return 'legendary';
            default: return 'untrained';
        }
    };

    // Get base proficiencies from class progression data
    const classId = classData.id;
    const level = character.level || 1;

    // Get saving throw proficiencies from class progression data (returns 0-4)
    const fortProfLevel = getSavingThrowAtLevel(classId, 'fortitude', level);
    const reflexProfLevel = getSavingThrowAtLevel(classId, 'reflex', level);
    const willProfLevel = getSavingThrowAtLevel(classId, 'will', level);
    const perceptionProfLevel = getPerceptionAtLevel(classId, level);

    // Convert to rank numbers (0, 2, 4, 6, 8) for compatibility with feat calculations
    let fortitudeRank = profLevelToRank(fortProfLevel);
    let reflexRank = profLevelToRank(reflexProfLevel);
    let willRank = profLevelToRank(willProfLevel);
    let perceptionRank = profLevelToRank(perceptionProfLevel);

    // Now apply feat effects (like Canny Acumen)
    if (character.feats && character.feats.length > 0) {
        const allFeats = getFeats();

        for (const charFeat of character.feats) {
            // Only count feats at or below current level
            if (charFeat.level > character.level) continue;

            const feat = allFeats.find(f => f.id === charFeat.featId);

            if (!feat) {
                continue;
            }

            if (!feat.rules) {
                continue;
            }

            if (!Array.isArray(feat.rules)) {
                continue;
            }

            for (const rule of feat.rules) {
                // Check for ActiveEffectLike rules that affect saves/perception rank
                if (rule.key === 'ActiveEffectLike' && rule.mode === 'upgrade') {
                    // The path could be:
                    // - "system.saves.fortitude.rank"
                    // - "system.saves.reflex.rank"
                    // - "system.saves.will.rank"
                    // - "system.perception.rank"
                    // - Or dynamic: "{item|flags.pf2e.rulesSelections.cannyAcumen}"

                    let targetPath = rule.path;

                    // Resolve dynamic path if present
                    if (targetPath && targetPath.includes('{item|flags.pf2e.rulesSelections.')) {
                        // Get the choice value from character feats
                        if (charFeat.choices && Array.isArray(charFeat.choices)) {
                            // For Canny Acumen, choices[0] should be the selected path
                            const choiceValue = charFeat.choices[0];
                            if (choiceValue && typeof choiceValue === 'string') {
                                // Extract the path part (e.g., "system.saves.fortitude.rank" from full value)
                                if (choiceValue.includes('system.saves.') || choiceValue.includes('system.perception.')) {
                                    targetPath = choiceValue;
                                }
                            }
                        }
                    }

                    if (!targetPath) {
                        continue;
                    }

                    // Parse the value (could be "ternary(gte(@actor.level,17),3,2)" or just a number)
                    // Foundry uses different rank values: 2=Expert, 3=Master, 4=Legendary
                    // We need to convert to PF2e standard: 4=Expert, 6=Master, 8=Legendary
                    let targetRank = 4; // Default to expert (PF2e value)
                    if (typeof rule.value === 'number') {
                        // Convert Foundry rank to PF2e rank
                        const foundryRank = rule.value;
                        if (foundryRank === 2) targetRank = 4; // Expert
                        else if (foundryRank === 3) targetRank = 6; // Master
                        else if (foundryRank === 4) targetRank = 8; // Legendary
                        else targetRank = foundryRank;
                    } else if (typeof rule.value === 'string') {
                        // Handle ternary expression: "ternary(gte(@actor.level,17),3,2)"
                        // Foundry values: 3=Master, 2=Expert → PF2e: 6=Master, 4=Expert
                        if (rule.value.includes('gte(@actor.level,17)')) {
                            if (character.level >= 17) {
                                targetRank = 6; // Master
                            } else {
                                targetRank = 4; // Expert
                            }
                        } else {
                            const parsed = parseInt(rule.value);
                            if (!isNaN(parsed)) {
                                // Convert Foundry rank to PF2e rank
                                if (parsed === 2) targetRank = 4; // Expert
                                else if (parsed === 3) targetRank = 6; // Master
                                else if (parsed === 4) targetRank = 8; // Legendary
                                else targetRank = parsed;
                            }
                        }
                    }

                    // Apply to the appropriate save/perception
                    if (targetPath.includes('saves.fortitude.rank')) {
                        fortitudeRank = Math.max(fortitudeRank, targetRank);
                    }
                    if (targetPath.includes('saves.reflex.rank')) {
                        reflexRank = Math.max(reflexRank, targetRank);
                    }
                    if (targetPath.includes('saves.will.rank')) {
                        willRank = Math.max(willRank, targetRank);
                    }
                    if (targetPath.includes('perception.rank')) {
                        perceptionRank = Math.max(perceptionRank, targetRank);
                    }
                }
            }
        }
    }

    // Update character with final proficiencies
    updated.saves = {
        fortitude: rankToProf(fortitudeRank),
        reflex: rankToProf(reflexRank),
        will: rankToProf(willRank),
    };

    updated.perception = rankToProf(perceptionRank);

    return updated;
}

/**
 * Initialize base class armor proficiencies
 * Uses class progression data to determine armor proficiency at each level
 * This sets the armorClass.proficiency field based on equipped armor or unarmored
 */
export function initializeArmorProficiency(character: Character): Character {
    const updated = { ...character };
    const classData = classes.find((c: any) => c.id === character.classId);

    if (!classData) return updated;

    // Initialize armorProficiencies array if not present
    if (!updated.armorProficiencies) {
        updated.armorProficiencies = [];
    }

    const classId = classData.id;
    const level = character.level || 1;

    // Helper to update or add armor proficiency
    const updateArmorProficiency = (
        category: 'light' | 'medium' | 'heavy' | 'unarmored'
    ) => {
        const profLevel = getArmorProficiencyAtLevel(classId, category, level);
        const profName = proficiencyLevelToName(profLevel);

        const existing = updated.armorProficiencies!.find(p => p.category === category);
        if (existing) {
            // Update existing if class progression is higher
            const profOrder = ['untrained', 'trained', 'expert', 'master', 'legendary'];
            const existingIdx = profOrder.indexOf(existing.proficiency);
            const newIdx = profOrder.indexOf(profName);
            if (newIdx > existingIdx) {
                existing.proficiency = profName;
            }
        } else if (profLevel > 0) {
            // Only add if trained or better
            updated.armorProficiencies!.push({ category, proficiency: profName });
        }
    };

    // Update all armor categories from class progression
    updateArmorProficiency('light');
    updateArmorProficiency('medium');
    updateArmorProficiency('heavy');
    updateArmorProficiency('unarmored');

    // Determine the appropriate armorClass.proficiency based on equipped armor
    if (updated.equippedArmor) {
        // Character has armor equipped - use the best applicable armor proficiency
        // For now, we'll use light armor proficiency for light armor
        const lightArmorProf = updated.armorProficiencies.find(p => p.category === 'light');
        const mediumArmorProf = updated.armorProficiencies.find(p => p.category === 'medium');
        const heavyArmorProf = updated.armorProficiencies.find(p => p.category === 'heavy');

        // Find the equipped armor to determine its category
        const armors = getArmor();
        const equippedArmorData = armors.find((a: any) => a.id === updated.equippedArmor);

        if (equippedArmorData) {
            const armorCategory = equippedArmorData.category;
            let bestProficiency: 'untrained' | 'trained' | 'expert' | 'master' | 'legendary' = 'untrained';

            if (armorCategory === 'heavy' && heavyArmorProf) {
                bestProficiency = heavyArmorProf.proficiency;
            } else if (armorCategory === 'medium' && mediumArmorProf) {
                bestProficiency = mediumArmorProf.proficiency;
            } else if (lightArmorProf) {
                bestProficiency = lightArmorProf.proficiency;
            }

            updated.armorClass = {
                ...updated.armorClass,
                proficiency: bestProficiency
            };
        }
    } else {
        // No armor equipped - use unarmored defense proficiency
        const unarmoredProf = updated.armorProficiencies.find(p => p.category === 'unarmored');
        updated.armorClass = {
            ...updated.armorClass,
            proficiency: unarmoredProf?.proficiency || 'trained'
        };
    }

    return updated;
}

/**
 * Initialize base class weapon proficiencies
 * Uses class progression data to determine weapon proficiency at each level
 */
export function initializeWeaponProficiency(character: Character): Character {
    const updated = { ...character };
    const classData = classes.find((c: any) => c.id === character.classId);

    if (!classData) return updated;

    // Initialize weaponProficiencies array if not present
    if (!updated.weaponProficiencies) {
        updated.weaponProficiencies = [];
    }

    const classId = classData.id;
    const level = character.level || 1;

    // Helper to update or add weapon proficiency
    const updateWeaponProficiency = (
        category: 'simple' | 'martial' | 'unarmed' | 'advanced'
    ) => {
        const profLevel = getWeaponProficiencyAtLevel(classId, category, level);
        const profName = proficiencyLevelToName(profLevel);

        const existing = updated.weaponProficiencies!.find(p => p.category === category);
        if (existing) {
            // Update existing if class progression is higher
            const profOrder = ['untrained', 'trained', 'expert', 'master', 'legendary'];
            const existingIdx = profOrder.indexOf(existing.proficiency);
            const newIdx = profOrder.indexOf(profName);
            if (newIdx > existingIdx) {
                existing.proficiency = profName;
            }
        } else if (profLevel > 0) {
            // Only add if trained or better
            updated.weaponProficiencies!.push({ category, proficiency: profName });
        }
    };

    // Update all weapon categories from class progression
    updateWeaponProficiency('simple');
    updateWeaponProficiency('martial');
    updateWeaponProficiency('unarmed');
    updateWeaponProficiency('advanced');

    return updated;
}

/**
 * Recalculate speed based on ancestry and heritage
 */
export function recalculateSpeed(character: Character): Character {
    const updated = { ...character };
    const ancestry = ancestries.find(a => a.id === character.ancestryId);

    if (!ancestry) return updated;

    // Start with ancestry base speed
    let baseSpeed = ancestry.speed || 25;

    // Apply speed modifiers from feats
    if (character.feats && character.feats.length > 0) {
        const allFeats = getFeats();
        let speedModifier = 0;
        let hasSpeedModifier = false;

        // Check each feat the character has
        for (const charFeat of character.feats) {
            // Find the feat data
            const feat = allFeats.find(f => f.id === charFeat.featId);

            if (feat && feat.rules && Array.isArray(feat.rules)) {
                // Check for FlatModifier rules that affect land-speed
                for (const rule of feat.rules) {
                    if (rule.key === 'FlatModifier' && rule.selector === 'land-speed') {
                        const value = parseInt(rule.value);
                        if (!isNaN(value)) {
                            // Take only the highest speed increase (not cumulative)
                            if (value > speedModifier) {
                                speedModifier = value;
                            }
                            hasSpeedModifier = true;
                        }
                    }
                }
            }
        }

        if (hasSpeedModifier) {
            baseSpeed += speedModifier;
        }
    }

    // Heritage could modify speed (not implemented yet)
    // TODO: Add heritage speed modifications

    // Preserve other speed types (swim, climb, fly, burrow) if they exist
    updated.speed = {
        land: baseSpeed,
        ...(updated.speed && {
            swim: updated.speed.swim,
            climb: updated.speed.climb,
            fly: updated.speed.fly,
            burrow: updated.speed.burrow,
        }),
    };
    return updated;
}

/**
 * Recalculate senses based on ancestry
 */
export function recalculateSenses(character: Character): Character {
    const updated = { ...character };
    const ancestry = ancestries.find(a => a.id === character.ancestryId);

    if (!ancestry) {
        updated.senses = [];
        return updated;
    }

    // Start with ancestry senses (cast to include senses which may exist in data)
    updated.senses = (ancestry as { senses?: string[] }).senses || ['vision'];

    // TODO: Add feat-based senses (like Keen Eyes)

    return updated;
}

/**
 * Recalculate languages based on ancestry and background
 */
export function recalculateLanguages(character: Character): Character {
    const updated = { ...character };
    const ancestry = ancestries.find(a => a.id === character.ancestryId);
    const background = backgrounds.find((b: any) => b.id === character.backgroundId);

    const languages: string[] = [];

    // Add ancestry languages
    if (ancestry?.languages) {
        languages.push(...ancestry.languages);
    }

    // Add background bonus languages (cast to include bonusLanguages which may exist in data)
    const bgWithLang = background as { bonusLanguages?: string[] } | undefined;
    if (bgWithLang?.bonusLanguages) {
        for (const lang of bgWithLang.bonusLanguages) {
            if (!languages.includes(lang)) {
                languages.push(lang);
            }
        }
    }

    // Add Intelligence bonus languages (1 language per positive INT mod)
    const intMod = Math.floor((updated.abilityScores.int - 10) / 2);
    if (intMod > 0) {
        // TODO: Let user choose bonus languages
        // For now, we'll just add common languages
        const commonLanguages = ['Common', 'Elven', 'Dwarven', 'Orcish', 'Gnomish', 'Goblin', 'Sylvan', 'Undercommon'];
        for (let i = 0; i < intMod; i++) {
            if (commonLanguages[i] && !languages.includes(commonLanguages[i])) {
                languages.push(commonLanguages[i]);
            }
        }
    }

    updated.languages = languages;
    return updated;
}

/**
 * Process FlatModifier rules from feats and convert them to buffs
 * This handles feats like Incredible Initiative that grant bonuses to specific selectors
 */
export function processFeatFlatModifiers(character: Character): Character {
    const updated = { ...character };
    const allFeats = getFeats();

    // Initialize buffs array if not present
    if (!updated.buffs) {
        updated.buffs = [];
    }

    // Remove existing feat-derived buffs (they'll be re-added)
    // We identify feat buffs by having a source that looks like a feat name
    const existingFeatBuffIds = new Set<string>();
    for (const buff of updated.buffs) {
        if (buff.source && buff.source.startsWith('feat:')) {
            existingFeatBuffIds.add(buff.id);
        }
    }
    updated.buffs = updated.buffs.filter(b => !existingFeatBuffIds.has(b.id));

    // Process FlatModifier rules from all feats
    for (const charFeat of character.feats || []) {
        // Only process feats at or below current level
        if (charFeat.level > character.level) {
            continue;
        }

        const feat = allFeats.find(f => f.id === charFeat.featId);
        if (!feat || !feat.rules || !Array.isArray(feat.rules)) {
            continue;
        }

        for (const rule of feat.rules) {
            if (rule.key === 'FlatModifier' && rule.selector && rule.value) {
                // Map the selector to our BonusSelector type
                let selector: string;
                switch (rule.selector) {
                    case 'initiative':
                        selector = 'initiative';
                        break;
                    case 'ac':
                        selector = 'ac';
                        break;
                    case 'fortitude':
                        selector = 'fortitude';
                        break;
                    case 'reflex':
                        selector = 'reflex';
                        break;
                    case 'will':
                        selector = 'will';
                        break;
                    case 'perception':
                        selector = 'perception';
                        break;
                    case 'attack':
                        selector = 'attack';
                        break;
                    case 'damage':
                        selector = 'damage';
                        break;
                    case 'land-speed':
                        selector = 'speed';
                        break;
                    case 'skill-check':
                        // Special selector for Untrained Improvisation - applies to all untrained skill checks
                        selector = 'skill-*';
                        break;
                    default:
                        // Handle skill selectors like "skill-acrobatics", "skill-arcana", etc.
                        if (rule.selector.startsWith('skill-')) {
                            const skillName = rule.selector.substring(6);
                            selector = `skill-${skillName}`;
                        } else {
                            continue;
                        }
                }

                // Map the type to our BonusType
                let type: BonusType = 'circumstance';
                if (rule.type === 'status') type = 'status';
                else if (rule.type === 'item') type = 'item';
                else if (rule.type === 'penalty') type = 'penalty';
                else if (rule.type === 'proficiency') type = 'circumstance'; // Proficiency bonuses behave like circumstance
                else if (rule.type === 'circumstance') type = 'circumstance';

                // Calculate bonus value - handle formulas for feats like Untrained Improvisation
                let bonusValue = rule.value;
                if (typeof rule.value === 'string' && rule.value.includes('@actor.level')) {
                    // Special handling for Untrained Improvisation formula:
                    // @actor.level + clamp(-2, floor((@actor.level - 7) / 2), 0)
                    // This gives: level - 2 (lv 3-4), level - 1 (lv 5-6), level (lv 7+)
                    const level = character.level || 1;
                    const clampValue = Math.max(-2, Math.min(0, Math.floor((level - 7) / 2)));
                    bonusValue = level + clampValue;
                }

                // Create buff from FlatModifier rule
                const buff: Buff = {
                    id: `feat:${feat.id}:${selector}`,
                    name: feat.name,
                    bonus: bonusValue,
                    type: type,
                    selector: selector as any,
                    source: `feat:${feat.name}`
                };

                // Check if buff with same id already exists (avoid duplicates)
                const existingBuffIndex = updated.buffs.findIndex(b => b.id === buff.id);
                if (existingBuffIndex === -1) {
                    updated.buffs.push(buff);
                }
            }
        }
    }

    return updated;
}

/**
 * Process bonuses from equipped/worn/invested gear items
 * This handles items that provide bonuses through their rules array
 * Similar to processFeatFlatModifiers but for equipment
 */
export function processEquipmentBonuses(character: Character): Character {
    const updated = { ...character };
    const allGear = getGear();

    // Initialize buffs array if not present
    if (!updated.buffs) {
        updated.buffs = [];
    }

    // Remove existing equipment-derived buffs (they'll be re-added)
    const existingEquipmentBuffIds = new Set<string>();
    for (const buff of updated.buffs) {
        if (buff.source && buff.source.startsWith('equipment:')) {
            existingEquipmentBuffIds.add(buff.id);
        }
    }
    updated.buffs = updated.buffs.filter(b => !existingEquipmentBuffIds.has(b.id));

    // Process all equipped items
    for (const item of character.equipment || []) {
        // Gear must be worn or invested to provide bonuses
        if (!item.worn && !item.invested) {
            continue;
        }

        // Get the gear data
        const gear = allGear.find(g => g.id === item.id);
        if (!gear) continue;

        // Process rules array (if present)
        if (gear.rules && Array.isArray(gear.rules)) {
            for (const rule of gear.rules) {
                if (rule.key === 'FlatModifier' && rule.selector && rule.value !== undefined) {
                    // Map the selector to our BonusSelector type
                    let selector: string;
                    switch (rule.selector) {
                        case 'initiative':
                            selector = 'initiative';
                            break;
                        case 'ac':
                            selector = 'ac';
                            break;
                        case 'fortitude':
                            selector = 'fortitude';
                            break;
                        case 'reflex':
                            selector = 'reflex';
                            break;
                        case 'will':
                            selector = 'will';
                            break;
                        case 'perception':
                            selector = 'perception';
                            break;
                        case 'attack':
                        case 'attack-roll':
                            selector = 'attack';
                            break;
                        case 'damage':
                            selector = 'damage';
                            break;
                        case 'land-speed':
                            selector = 'speed';
                            break;
                        case 'impulse-attack':
                        case 'impulse-attack-roll':
                            selector = 'impulse-attack';
                            break;
                        case 'saving-throw':
                        case 'all-saves':
                            selector = 'all-saves';
                            break;
                        default:
                            // Handle skill selectors like "skill-acrobatics", "skill-arcana", etc.
                            if (rule.selector.startsWith('skill-')) {
                                const skillName = rule.selector.substring(6);
                                selector = `skill-${skillName}`;
                            } else {
                                continue;
                            }
                    }

                    // Map the type to our BonusType
                    let type: BonusType = 'item';  // Equipment bonuses are typically item bonuses
                    if (rule.type === 'status') type = 'status';
                    else if (rule.type === 'item') type = 'item';
                    else if (rule.type === 'circumstance') type = 'circumstance';
                    else if (rule.type === 'penalty') type = 'penalty';

                    // Handle predicate (conditional bonuses)
                    if (rule.predicate && Array.isArray(rule.predicate) && rule.predicate.length > 0) {
                        // Check if the predicate conditions are met
                        let predicateMet = true;

                        for (const condition of rule.predicate) {
                            if (condition.or && Array.isArray(condition.or)) {
                                // OR condition: met if ANY of the conditions are true
                                const orMet = condition.or.some((orCondition: any) => {
                                    if (orCondition.startsWith('class:')) {
                                        const className = orCondition.substring(6);
                                        const classId = getClassIdByName(className);
                                        return classId === updated.classId;
                                    }
                                    if (orCondition.startsWith('feat:')) {
                                        const featId = orCondition.substring(5);
                                        return updated.feats.some(f => f.featId === featId);
                                    }
                                    return false;
                                });
                                if (!orMet) {
                                    predicateMet = false;
                                    break;
                                }
                            }
                        }

                        if (!predicateMet) {
                            continue;
                        }
                    }

                    // Create buff from FlatModifier rule
                    const buff: Buff = {
                        id: `equipment:${gear.id}:${selector}`,
                        name: gear.name,
                        bonus: rule.value,
                        type: type,
                        selector: selector as any,
                        source: `equipment:${gear.name}`
                    };

                    // Check if buff with same id already exists (avoid duplicates)
                    const existingBuffIndex = updated.buffs.findIndex(b => b.id === buff.id);
                    if (existingBuffIndex === -1) {
                        updated.buffs.push(buff);
                    }
                }
            }
        }

        // Handle direct AC bonus items (like Armored Cloak)
        if (gear.acBonus && gear.acBonus > 0) {
            const buff: Buff = {
                id: `equipment:${gear.id}:ac`,
                name: gear.name,
                bonus: gear.acBonus,
                type: 'item',
                selector: 'ac',
                source: `equipment:${gear.name}`
            };

            const existingBuffIndex = updated.buffs.findIndex(b => b.id === buff.id);
            if (existingBuffIndex === -1) {
                updated.buffs.push(buff);
            }
        }
    }

    // Process apex items (ability score boosting items like Belt of Giant Strength)
    // These require investment to work
    for (const item of character.equipment || []) {
        if (!item.invested) continue;

        const gear = allGear.find(g => g.id === item.id);
        if (!gear || !gear.apex) continue;

        // Apex items give a +1 ability bonus to the associated ability score
        // This is handled as a circumstance bonus to ability checks
        const ability = gear.apex;
        const buff: Buff = {
            id: `equipment:${gear.id}:apex-${ability}`,
            name: gear.name,
            bonus: 1,
            type: 'circumstance',
            selector: `ability-${ability}` as any,
            source: `equipment:${gear.name}`
        };

        const existingBuffIndex = updated.buffs.findIndex(b => b.id === buff.id);
        if (existingBuffIndex === -1) {
            updated.buffs.push(buff);
        }
    }

    return updated;
}

/**
 * Reset daily uses for spell-granting items
 * Checks if a new day has started and resets daily uses accordingly
 */
export function resetItemDailyUses(character: Character): Character {
    const updated = { ...character };

    // Check each equipment item for spellGrant with dailyUses
    if (!updated.equipment) return updated;

    let hasChanges = false;
    const newEquipment = updated.equipment.map(item => {
        if (!item.spellGrant?.dailyUses) return item;

        const { dailyUses, lastReset } = item.spellGrant;

        // Check if we need to reset (new day)
        if (shouldResetDailyUses(lastReset)) {
            hasChanges = true;
            return {
                ...item,
                spellGrant: {
                    ...item.spellGrant,
                    dailyUses: {
                        ...dailyUses,
                        current: dailyUses.max,
                    },
                    lastReset: new Date().toISOString(),
                },
            };
        }

        return item;
    });

    if (hasChanges) {
        updated.equipment = newEquipment;
    }

    return updated;
}

/**
 * Process spell-granting items and add spells to character
 * Only invested items grant their spells
 *
 * IMPORTANT: This function also REMOVES spells from items that are no longer
 * invested or have been removed from equipment entirely.
 */
export function processSpellGrantingItems(character: Character): Character {
    const updated = { ...character };

    // Initialize spellcasting if not present (for non-spellcasters using magic items)
    if (!updated.spellcasting) {
        updated.spellcasting = {
            tradition: 'arcane', // Default, may be overridden by class
            spellcastingType: 'spontaneous',
            keyAbility: 'int',
            proficiency: 'untrained',
            spellSlots: {},
            knownSpells: [],
            focusPool: { current: 0, max: 0 },
        };
    }

    // Initialize knownSpells array if not present
    if (!updated.spellcasting.knownSpells) {
        updated.spellcasting.knownSpells = [];
    }

    // Get all gear data
    const allGear = getGear();

    // Get a global map of ALL spells that could be granted by ANY spell-granting item
    // This is needed to identify which known spells come from spell-granting items
    // so we can remove them when items are uninvested or removed
    const allSpellGrantingSpells = getAllSpellGrantingItemIds();

    // First, collect all spells that should be granted by currently invested items
    const grantedSpells = new Set<string>();

    // Process each equipment item
    for (const item of updated.equipment || []) {
        // Skip items that aren't invested
        if (!item.invested) continue;

        // Get spell-granting item configuration
        const spellGrantingItem = getSpellGrantingItem(item.id);
        if (!spellGrantingItem) continue;

        // Check if item has a selected spell choice
        const selectedChoice = item.spellGrant?.selectedChoice;
        if (!selectedChoice) continue;

        // Get the spell configuration for this choice
        const spellChoice = getSpellForItemChoice(item.id, selectedChoice);
        if (!spellChoice || !spellChoice.spellId) continue;

        // Check daily uses (if applicable)
        const dailyUses = item.spellGrant?.dailyUses;
        if (dailyUses && dailyUses.current <= 0) continue;

        // Add to granted spells set
        grantedSpells.add(spellChoice.spellId);
    }

    // Filter knownSpells: keep only spells that are either:
    // 1. Currently granted by invested items, OR
    // 2. NOT from any spell-granting item (i.e., from class feats, etc.)
    updated.spellcasting.knownSpells = updated.spellcasting.knownSpells.filter(spellId => {
        // If this spell is currently granted, keep it
        if (grantedSpells.has(spellId)) return true;

        // If this spell could potentially be from a spell-granting item, remove it
        // (because it's not in the grantedSpells set, meaning the item isn't invested/has no uses/was removed)
        if (spellId in allSpellGrantingSpells) return false;

        // Otherwise, keep it (from other sources like class feats)
        return true;
    });

    // Add any newly granted spells that aren't already in the list
    for (const spellId of grantedSpells) {
        if (!updated.spellcasting.knownSpells.includes(spellId)) {
            updated.spellcasting.knownSpells.push(spellId);
        }
    }

    return updated;
}

/**
 * Process innate spells from backgrounds and feats
 * These are spells granted by sources like Zodiac Bound background or Efreeti Magic feat
 */
export function processInnateSpells(character: Character): Character {
    const updated = { ...character };

    // Initialize spellcasting if not present (for non-spellcasters with innate spells)
    if (!updated.spellcasting) {
        updated.spellcasting = {
            tradition: 'arcane', // Default, may be overridden by class
            spellcastingType: 'spontaneous',
            keyAbility: 'int',
            proficiency: 'untrained',
            spellSlots: {},
            knownSpells: [],
            focusPool: { current: 0, max: 0 },
        };
    }

    // Initialize innateSpells array if not present
    if (!updated.spellcasting.innateSpells) {
        updated.spellcasting.innateSpells = [];
    }

    // Get all innate spells from backgrounds and feats
    const newInnateSpells = getAllInnateSpellsForCharacter(updated);

    // Merge with existing innate spells, preserving current uses for matching spells
    const existingInnateMap = new Map<string, { uses: number; maxUses: number }>();
    for (const existing of updated.spellcasting.innateSpells) {
        existingInnateMap.set(existing.spellId, {
            uses: existing.uses,
            maxUses: existing.maxUses,
        });
    }

    // Update innate spells, preserving usage counts
    updated.spellcasting.innateSpells = newInnateSpells.map(spell => {
        const existing = existingInnateMap.get(spell.spellId);
        if (existing) {
            // Preserve current uses, but update maxUses if different
            return {
                ...spell,
                uses: existing.uses,
                maxUses: spell.maxUses,
            };
        }
        return spell;
    });

    return updated;
}
