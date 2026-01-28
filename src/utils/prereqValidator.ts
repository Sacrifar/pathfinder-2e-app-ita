/**
 * Prerequisite Validator for Pathfinder 2e Feats
 * Parses and validates common prerequisite patterns against character data
 */

import { Character, Proficiency, AbilityName } from '../types';
import { getSpecializationById } from '../data/classSpecializations';

export interface PrereqResult {
    met: boolean;
    reasons: string[];
}

interface LoadedFeatLike {
    prerequisites: string[];
    level: number;
}

// Proficiency levels in order
const PROFICIENCY_ORDER: Proficiency[] = ['untrained', 'trained', 'expert', 'master', 'legendary'];

// Minimum level required for each proficiency (reserved for advanced validation)
// const PROFICIENCY_MIN_LEVEL: Record<Proficiency, number> = {
//     'untrained': 1,
//     'trained': 1,
//     'expert': 1,
//     'master': 7,
//     'legendary': 15,
// };

// Skill name mappings (for fuzzy matching)
const SKILL_ALIASES: Record<string, string> = {
    'acrobatics': 'acrobatics',
    'arcana': 'arcana',
    'athletics': 'athletics',
    'crafting': 'crafting',
    'deception': 'deception',
    'diplomacy': 'diplomacy',
    'intimidation': 'intimidation',
    'lore': 'lore',
    'medicine': 'medicine',
    'nature': 'nature',
    'occultism': 'occultism',
    'performance': 'performance',
    'religion': 'religion',
    'society': 'society',
    'stealth': 'stealth',
    'survival': 'survival',
    'thievery': 'thievery',
};

// Ability name mappings
const ABILITY_ALIASES: Record<string, AbilityName> = {
    'strength': 'str',
    'str': 'str',
    'dexterity': 'dex',
    'dex': 'dex',
    'constitution': 'con',
    'con': 'con',
    'intelligence': 'int',
    'int': 'int',
    'wisdom': 'wis',
    'wis': 'wis',
    'charisma': 'cha',
    'cha': 'cha',
};

// Skills that can be substituted with Performance via Versatile Performance feat
const VERSATILE_PERFORMANCE_SKILLS = ['deception', 'diplomacy', 'intimidation'];

/**
 * Check if a character has the Versatile Performance feat
 * This feat allows using Performance instead of Diplomacy/Intimidation/Deception
 * for certain actions and prerequisites
 */
export function hasVersatilePerformance(character: Character): boolean {
    return character.feats?.some(feat =>
        feat.featId.toLowerCase() === 'versatile-performance' ||
        feat.featId.toLowerCase().includes('versatile-performance')
    ) ?? false;
}

/**
 * Check if a character meets the prerequisites for a feat
 */
export function checkPrerequisites(feat: LoadedFeatLike, character: Character): PrereqResult {
    const unmetReasons: string[] = [];

    // Check level requirement
    if (character.level < feat.level) {
        unmetReasons.push(`Requires level ${feat.level}`);
    }

    // Check each prerequisite
    for (const prereq of feat.prerequisites) {
        const result = parseAndCheckPrereq(prereq.toLowerCase(), character);
        if (!result.met) {
            unmetReasons.push(result.reason || prereq);
        }
    }

    return {
        met: unmetReasons.length === 0,
        reasons: unmetReasons,
    };
}

interface SinglePrereqResult {
    met: boolean;
    reason?: string;
}

/**
 * Parse a single prerequisite string and check it against character
 */
function parseAndCheckPrereq(prereq: string, character: Character): SinglePrereqResult {
    // Pattern: "X and Y" - compound prerequisites with "and"
    // Must check FIRST before other patterns
    if (prereq.includes(' and ')) {
        const parts = prereq.split(' and ').map(p => p.trim());
        const results = parts.map(part => parseAndCheckPrereq(part, character));

        const allMet = results.every(r => r.met);
        const reasons = results.map(r => r.reason).filter((r): r is string => !!r);

        if (allMet) {
            return { met: true };
        }

        return {
            met: false,
            reason: reasons.join(' and ')
        };
    }

    // Pattern: "trained/expert/master in [save]" - Check saving throw proficiencies
    // Must check BEFORE skill proficiencies since "expert in Reflex saves" would match the skill pattern
    const saveProfMatch = prereq.match(/(untrained|trained|expert|master|legendary)\s+in\s+(\w+)\s+saves/i);
    if (saveProfMatch) {
        const requiredProf = saveProfMatch[1].toLowerCase() as Proficiency;
        const saveName = saveProfMatch[2].toLowerCase();

        return checkSaveProficiency(saveName, requiredProf, character);
    }

    // Pattern: "trained/expert in at least one skill" - Check if character has any skill at that proficiency
    const atLeastOneMatch = prereq.match(/(untrained|trained|expert|master|legendary)\s+in\s+at\s+least\s+one\s+skill/i);
    if (atLeastOneMatch) {
        const requiredProf = atLeastOneMatch[1].toLowerCase() as Proficiency;
        return checkAtLeastOneSkillProficiency(requiredProf, character);
    }

    // Pattern: "trained in a skill with the Recall Knowledge action" - Check Recall Knowledge skills
    const recallKnowledgeMatch = prereq.match(/(untrained|trained|expert|master|legendary)\s+in\s+a\s+skill\s+with\s+the\s+recall\s+knowledge\s+action/i);
    if (recallKnowledgeMatch) {
        const requiredProf = recallKnowledgeMatch[1].toLowerCase() as Proficiency;
        return checkRecallKnowledgeSkillProficiency(requiredProf, character);
    }

    // Pattern: "trained in [skill]" / "expert in [skill]" / etc.
    // Extended to handle comma-separated lists: "expert in Arcana, Nature, Occultism, or Religion"
    // Also handles "or" without comma: "trained in Deception or Diplomacy"
    const skillProfMatch = prereq.match(/(untrained|trained|expert|master|legendary)\s+in\s+([\w\s,]+)/i);
    if (skillProfMatch) {
        const requiredProf = skillProfMatch[1].toLowerCase() as Proficiency;
        let skillsText = skillProfMatch[2];

        // Check if multiple skills are listed (comma or "or" separated)
        // First, replace " or " (with spaces) with comma to normalize delimiters
        // This handles both "A, B, or C" and "A or B" formats
        skillsText = skillsText.replace(/\s+or\s+/gi, ',');

        // Split by commas, trim each skill name, and filter empty strings
        const skillNames = skillsText
            .split(',')
            .map(s => s.trim().toLowerCase())
            .filter(s => s.length > 0);

        // If multiple skills, check if character meets requirement for ANY of them
        if (skillNames.length > 1) {
            for (const skillName of skillNames) {
                const result = checkSkillProficiency(skillName, requiredProf, character);
                if (result.met) {
                    return { met: true }; // At least one skill meets the requirement
                }
            }
            // None of the skills met the requirement - return failure with the first skill as reason
            return {
                met: false,
                reason: `Requires ${requiredProf} in ${skillNames.join(' or ')}`,
            };
        }

        // Single skill - use original logic
        const skillName = skillNames[0];
        return checkSkillProficiency(skillName, requiredProf, character);
    }

    // Pattern: "[ability] +2" (modifier format) or "[ability] 14" (score format)
    // Examples: "Int +2", "Strength 16", "Dex +1"
    const abilityMatch = prereq.match(/(strength|str|dexterity|dex|constitution|con|intelligence|int|wisdom|wis|charisma|cha)\s+(\+)?(\d+)/i);
    if (abilityMatch) {
        const abilityKey = ABILITY_ALIASES[abilityMatch[1].toLowerCase()];
        const hasPlus = abilityMatch[2] === '+';
        const requiredValue = parseInt(abilityMatch[3]);

        if (abilityKey) {
            const currentScore = character.abilityScores[abilityKey];

            if (hasPlus) {
                // Modifier format: "Int +2" means mod of +2, which is score 14
                // Mod +0 = score 10, +1 = 12, +2 = 14, +3 = 16, +4 = 18, etc.
                const requiredScore = 10 + (requiredValue * 2);
                if (currentScore >= requiredScore) {
                    return { met: true };
                }
                return {
                    met: false,
                    reason: `Requires ${abilityMatch[1]} +${requiredValue}`
                };
            } else {
                // Direct score format: "Int 14" means score of 14
                if (currentScore >= requiredValue) {
                    return { met: true };
                }
                return {
                    met: false,
                    reason: `Requires ${abilityMatch[1]} ${requiredValue}`
                };
            }
        }
    }

    // Pattern: class feature checks (simple)
    const classFeatures: Record<string, string[]> = {
        'rage': ['barbarian'],
        'sneak attack': ['rogue'],
        'spellcasting': ['wizard', 'cleric', 'druid', 'bard', 'sorcerer', 'witch', 'magus', 'oracle', 'psychic', 'summoner'],
        'divine ally': ['champion'],
        'wild shape': ['druid'],
        'flurry of blows': ['monk'],
        'hunting prey': ['ranger'],
        'panache': ['swashbuckler'],
    };

    for (const [feature, classes] of Object.entries(classFeatures)) {
        if (prereq.includes(feature)) {
            // Check if character's base class matches
            if (classes.includes(character.classId?.toLowerCase() || '')) {
                return { met: true };
            }

            // Also check if character has an archetype dedication for any of these classes
            // This allows archetype characters to access class feats that require class features
            const hasArchetypeDedication = character.feats?.some(feat => {
                const featNameLower = feat.featId.toLowerCase();
                // Check if this is a dedication feat for one of the classes that have this feature
                return classes.some(className =>
                    featNameLower.includes(`${className}-dedication`) ||
                    featNameLower.includes(`${className} dedication`)
                );
            });

            if (hasArchetypeDedication) {
                return { met: true };
            }

            return {
                met: false,
                reason: `Requires ${feature}`
            };
        }
    }

    // Ancestry checks
    if (prereq.includes('human') || prereq.includes('elf') || prereq.includes('dwarf') ||
        prereq.includes('gnome') || prereq.includes('halfling') || prereq.includes('goblin') ||
        prereq.includes('orc') || prereq.includes('leshy')) {
        const ancestryMatch = prereq.match(/(human|elf|dwarf|gnome|halfling|goblin|orc|leshy)/i);
        if (ancestryMatch) {
            const requiredAncestry = ancestryMatch[1].toLowerCase();
            if (character.ancestryId?.toLowerCase() === requiredAncestry) {
                return { met: true };
            }
            return {
                met: false,
                reason: `Requires ${ancestryMatch[1]} ancestry`
            };
        }
    }

    // Class specialization checks (instinct, muse, doctrine, bloodline, etc.)
    // Pattern: "[specialization name] [type]" e.g., "dragon instinct", "enigma muse", "warpriest doctrine"
    const specializationTypes = ['instinct', 'muse', 'doctrine', 'bloodline', 'research field', 'mystery', 'philosophy', 'way', 'hybrid study', 'rune', 'style', 'element', 'conscious mind', 'lesson', 'gate', 'innovation', 'implement', 'arcane school', 'eidolon'];
    const specTypePattern = new RegExp(`(\\w+\\s*\\w*?)\\s+(${specializationTypes.join('|')})`, 'i');
    const specMatch = prereq.match(specTypePattern);

    if (specMatch && character.classSpecializationId) {
        const requiredSpecName = specMatch[1].toLowerCase().trim();

        const specId = Array.isArray(character.classSpecializationId)
            ? character.classSpecializationId[0]
            : character.classSpecializationId;
        const characterSpec = getSpecializationById(specId);

        if (characterSpec) {
            // Check if the character's specialization matches the prerequisite
            // Compare names (case-insensitive)
            const charSpecName = characterSpec.name.toLowerCase();
            const charSpecNameIt = characterSpec.nameIt?.toLowerCase() || '';

            // Check for exact match or partial match (to handle "dragon" matching "dragon instinct")
            if (charSpecName.includes(requiredSpecName) ||
                charSpecNameIt.includes(requiredSpecName) ||
                requiredSpecName.includes(charSpecName) ||
                requiredSpecName.includes(charSpecNameIt)) {
                return { met: true };
            }

            return {
                met: false,
                reason: `Requires ${specMatch[0]}`
            };
        }
    }

    // Archetype dedication feat checks
    // Pattern: "[Archetype] Dedication" or "[Archetype] Dedication feat"
    const dedicationPattern = /(\w+)\s+dedication/i;
    const dedicationMatch = prereq.match(dedicationPattern);

    if (dedicationMatch) {
        const archetypeName = dedicationMatch[1].toLowerCase();

        // Check if character has the dedication feat
        const hasDedication = character.feats?.some(feat => {
            const featNameLower = feat.featId.toLowerCase();
            return featNameLower.includes(archetypeName) && featNameLower.includes('dedication');
        });

        if (hasDedication) {
            return { met: true };
        }

        return {
            met: false,
            reason: `Requires ${dedicationMatch[0]}`
        };
    }

    // Check for specific archetype feats as prerequisites
    // Pattern: "feat: [feat name]" or direct feat name matching
    if (prereq.includes('feat') || prereq.includes('archetype')) {
        // Check if character has this feat
        const hasFeat = character.feats?.some(feat =>
            feat.featId.toLowerCase().includes(prereq.replace('feat:', '').trim().toLowerCase()) ||
            prereq.toLowerCase().includes(feat.featId.toLowerCase().replace(/-/g, ' '))
        );

        if (hasFeat) {
            return { met: true };
        }
    }

    // If we can't parse it, assume it's met (to avoid false negatives)
    return { met: true };
}

/**
 * Check if character has required skill proficiency
 *
 * Versatile Performance: If the character has Versatile Performance feat,
 * Performance proficiency can substitute for Deception, Diplomacy, or Intimidation
 * when checking prerequisites.
 */
function checkSkillProficiency(
    skillName: string,
    requiredProf: Proficiency,
    character: Character
): SinglePrereqResult {
    const charSkill = character.skills.find(s =>
        s.name.toLowerCase() === skillName ||
        SKILL_ALIASES[skillName] === s.name.toLowerCase()
    );

    const currentProf = charSkill?.proficiency || 'untrained';
    const currentIdx = PROFICIENCY_ORDER.indexOf(currentProf);
    const requiredIdx = PROFICIENCY_ORDER.indexOf(requiredProf);

    if (currentIdx >= requiredIdx) {
        return { met: true };
    }

    // Versatile Performance: Check if Performance can substitute for this skill
    if (hasVersatilePerformance(character) && VERSATILE_PERFORMANCE_SKILLS.includes(skillName.toLowerCase())) {
        const performanceSkill = character.skills.find(s =>
            s.name.toLowerCase() === 'performance'
        );

        if (performanceSkill) {
            const performanceIdx = PROFICIENCY_ORDER.indexOf(performanceSkill.proficiency);
            if (performanceIdx >= requiredIdx) {
                return { met: true };
            }
        }
    }

    return {
        met: false,
        reason: `Requires ${requiredProf} in ${skillName}`,
    };
}

/**
 * Check if character has required saving throw proficiency
 */
function checkSaveProficiency(
    saveName: string,
    requiredProf: Proficiency,
    character: Character
): SinglePrereqResult {
    // Map save names to character.saves properties
    const saveMap: Record<string, keyof typeof character.saves> = {
        'fortitude': 'fortitude',
        'fort': 'fortitude',
        'reflex': 'reflex',
        'ref': 'reflex',
        'will': 'will',
    };

    const saveKey = saveMap[saveName.toLowerCase()];
    if (!saveKey) {
        // If we can't map it, assume it's met to avoid false negatives
        return { met: true };
    }

    const currentProf = character.saves?.[saveKey] || 'untrained';
    const currentIdx = PROFICIENCY_ORDER.indexOf(currentProf);
    const requiredIdx = PROFICIENCY_ORDER.indexOf(requiredProf);

    if (currentIdx >= requiredIdx) {
        return { met: true };
    }

    return {
        met: false,
        reason: `Requires ${requiredProf} in ${saveName} saves`,
    };
}

/**
 * Check if character has at least one skill at required proficiency level
 */
function checkAtLeastOneSkillProficiency(
    requiredProf: Proficiency,
    character: Character
): SinglePrereqResult {
    const requiredIdx = PROFICIENCY_ORDER.indexOf(requiredProf);

    // Check if any skill meets the required proficiency
    const hasOneSkill = character.skills?.some(skill => {
        const currentIdx = PROFICIENCY_ORDER.indexOf(skill.proficiency);
        return currentIdx >= requiredIdx;
    });

    if (hasOneSkill) {
        return { met: true };
    }

    return {
        met: false,
        reason: `Requires at least one skill ${requiredProf}`,
    };
}

/**
 * Check if character has required proficiency in any Recall Knowledge skill
 * Recall Knowledge skills: Arcana, Crafting, Lore, Medicine, Nature, Occultism, Religion, Society
 */
function checkRecallKnowledgeSkillProficiency(
    requiredProf: Proficiency,
    character: Character
): SinglePrereqResult {
    // Skills that can use Recall Knowledge action
    const recallKnowledgeSkills = [
        'arcana', 'crafting', 'medicine', 'nature', 'occultism', 'religion', 'society',
        'lore' // Covers all Lore skills
    ];

    const requiredIdx = PROFICIENCY_ORDER.indexOf(requiredProf);

    // Check if any Recall Knowledge skill meets the required proficiency
    const hasRecallKnowledgeSkill = character.skills?.some(skill => {
        const skillNameLower = skill.name.toLowerCase();
        const isRecallKnowledgeSkill = recallKnowledgeSkills.some(rkSkill =>
            skillNameLower === rkSkill || skillNameLower.includes(rkSkill)
        );
        if (!isRecallKnowledgeSkill) return false;

        const currentIdx = PROFICIENCY_ORDER.indexOf(skill.proficiency);
        return currentIdx >= requiredIdx;
    });

    if (hasRecallKnowledgeSkill) {
        return { met: true };
    }

    return {
        met: false,
        reason: `Requires ${requiredProf} in a skill with the Recall Knowledge action`,
    };
}

/**
 * Extract skill name from feat prerequisites (for skill feat filtering)
 */
export function extractSkillFromPrerequisites(prerequisites: string[]): string | null {
    for (const prereq of prerequisites) {
        const match = prereq.match(/(trained|expert|master|legendary)\s+in\s+(\w+)/i);
        if (match) {
            return match[2].toLowerCase();
        }
    }
    return null;
}
