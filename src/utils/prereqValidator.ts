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
    // Pattern: "trained in [skill]" / "expert in [skill]" / etc.
    const skillProfMatch = prereq.match(/(untrained|trained|expert|master|legendary)\s+in\s+(\w+)/i);
    if (skillProfMatch) {
        const requiredProf = skillProfMatch[1].toLowerCase() as Proficiency;
        const skillName = skillProfMatch[2].toLowerCase();

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
            if (classes.includes(character.classId?.toLowerCase() || '')) {
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

        // Get the character's current specialization
        const characterSpec = getSpecializationById(character.classSpecializationId);

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

    // If we can't parse it, assume it's met (to avoid false negatives)
    return { met: true };
}

/**
 * Check if character has required skill proficiency
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

    return {
        met: false,
        reason: `Requires ${requiredProf} in ${skillName}`,
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
