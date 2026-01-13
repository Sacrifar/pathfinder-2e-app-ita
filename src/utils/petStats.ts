/**
 * Pet Statistics Calculator
 * Automatically calculates stats for familiars, animal companions, and eidolons
 * based on master's stats and pet level
 */

import { Pet, PetType, FamiliarData, AnimalCompanionData, EidolonData, Character } from '../types/character';
import { getFamiliarAbilities, getAnimalCompanionTypes, FamiliarAbility } from '../data/pf2e-loader';

// ============ Familiar Calculations ============

/**
 * Calculate familiar statistics
 * Familiars derive most stats from their master
 */
export function calculateFamiliarStats(
    familiar: Pet & { specificData: FamiliarData },
    master: Character
): Partial<FamiliarData> & { hp: number; ac: number; saves: { fortitude: number; reflex: number; will: number }; perception: number; stealth: number } {
    const masterLevel = master.level || 1;
    const masterAC = calculateCharacterAC(master);
    const masterFort = calculateCharacterSave(master, 'fortitude');
    const masterReflex = calculateCharacterSave(master, 'reflex');
    const masterWill = calculateCharacterSave(master, 'will');
    const masterPerception = calculateCharacterPerception(master);
    const masterStealth = calculateCharacterSkill(master, 'stealth');

    // Familiar HP = 5 × master level
    const hp = 5 * masterLevel;

    // AC = master's AC (without armor)
    const ac = masterAC - getArmorACBonus(master);

    // Saves = master's saves
    const saves = {
        fortitude: masterFort,
        reflex: masterReflex,
        will: masterWill,
    };

    // Perception and Stealth = master's modifier or +4, whichever is better
    const perception = Math.max(masterPerception, 4);
    const stealth = Math.max(masterStealth, 4);

    // Count available abilities
    const baseAbilities = 2;
    const additionalAbilities = countFamiliarFeats(master);
    const totalAbilities = baseAbilities + additionalAbilities;

    return {
        hp,
        ac,
        saves,
        perception,
        stealth,
        masterAbilitiesCount: totalAbilities,
        familiarAbilitiesCount: familiar.specificData.abilities.length,
    };
}

// ============ Animal Companion Calculations ============

/**
 * Progression stages for animal companions
 */
interface CompanionProgression {
    stage: 'young' | 'mature' | 'nimble' | 'savage';
    level: number;
    hpModifier: number;
    acModifier: number;
    strModifier: number;
    dexModifier: number;
    attackBonusModifier: number;
    damageDiceModifier: number;
}

const COMPANION_PROGRESSION: CompanionProgression[] = [
    { stage: 'young', level: 1, hpModifier: 0, acModifier: 0, strModifier: 0, dexModifier: 0, attackBonusModifier: 0, damageDiceModifier: 0 },
    { stage: 'mature', level: 4, hpModifier: 8, acModifier: 2, strModifier: 2, dexModifier: 2, attackBonusModifier: 1, damageDiceModifier: 1 },
    { stage: 'nimble', level: 8, hpModifier: 14, acModifier: 3, strModifier: 3, dexModifier: 4, attackBonusModifier: 2, damageDiceModifier: 1 },
    { stage: 'savage', level: 8, hpModifier: 16, acModifier: 2, strModifier: 4, dexModifier: 2, attackBonusModifier: 2, damageDiceModifier: 2 },
];

/**
 * Calculate animal companion statistics based on stage and level
 */
export function calculateCompanionStats(
    companion: Pet & { specificData: AnimalCompanionData },
    master: Character
): Partial<AnimalCompanionData> {
    const companionData = companion.specificData;
    const companionLevel = companionData.level;
    const stage = companionData.stage || 'young';

    // Get base stats from companion type
    const companionType = getAnimalCompanionTypes().find(ct => ct.id === companionData.companionType);
    if (!companionType) {
        throw new Error(`Unknown companion type: ${companionData.companionType}`);
    }

    // Get progression stats
    const progression = COMPANION_PROGRESSION.find(p => p.stage === stage) || COMPANION_PROGRESSION[0];

    // Calculate HP
    const hp = companionType.baseStats.hp + progression.hpModifier + (companionLevel - 1) * 4;

    // Calculate AC
    const ac = companionType.baseStats.ac + progression.acModifier + Math.floor(companionLevel / 4);

    // Calculate saves
    const fortitude = companionType.baseStats.fortitude + Math.floor(companionLevel / 2);
    const reflex = companionType.baseStats.reflex + Math.floor(companionLevel / 2);
    const will = companionType.baseStats.will + Math.floor(companionLevel / 2);

    // Calculate attack bonus
    const attackBonus = progression.attackBonusModifier + Math.floor(companionLevel / 2);

    // Update attacks with new damage
    const attacks = companionType.baseStats.attacks.map(attack => {
        const baseDamage = parseInt(attack.damage) || 0;
        const damageBonus = progression.damageDiceModifier;
        return {
            ...attack,
            attackBonus,
            damage: upgradeDamageDice(attack.damage, damageBonus),
        };
    });

    return {
        hitPoints: {
            current: companionData.hitPoints?.current || hp,
            max: hp,
        },
        armorClass: ac,
        attacks,
        perception: companionType.baseStats.perception + Math.floor(companionLevel / 2),
        Fortitude: { proficiency: 'trained', value: fortitude },
        reflex: { proficiency: 'trained', value: reflex },
        will: { proficiency: 'trained', value: will },
    };
}

// ============ Eidolon Calculations ============

/**
 * Calculate eidolon statistics
 * Eidolons are more powerful and share some mechanics with the summoner
 */
export function calculateEidolonStats(
    eidolon: Pet & { specificData: EidolonData },
    master: Character
): Partial<EidolonData> {
    const eidolonData = eidolon.specificData;
    const eidolonLevel = eidolonData.level || master.level || 1;

    // Eidolon HP calculation (scales with level)
    // If sharesHP is true, eidolon uses summoner's HP pool
    const hp = eidolonData.sharesHP ? 0 : 10 + eidolonLevel * 6;

    // Base AC (scales with level)
    const ac = 21 + Math.floor(eidolonLevel / 2);

    // Saves (eidolons have good saves)
    const fortitude = 10 + Math.floor(eidolonLevel / 2);
    const reflex = 8 + Math.floor(eidolonLevel / 2);
    const will = 8 + Math.floor(eidolonLevel / 2);

    // Perception
    const perception = 10 + Math.floor(eidolonLevel / 2);

    return {
        hitPoints: {
            current: eidolonData.hitPoints?.current || hp,
            max: hp,
        },
        armorClass: ac,
        perception,
        saves: {
            fortitude: { proficiency: 'expert', value: fortitude },
            reflex: { proficiency: 'expert', value: reflex },
            will: { proficiency: 'expert', value: will },
        },
    };
}

// ============ Helper Functions ============

/**
 * Calculate character's AC (without armor)
 */
function calculateCharacterAC(character: Character): number {
    const baseAC = 10;
    const dexMod = Math.floor((character.abilityScores?.dex || 10 - 10) / 2);
    const armorBonus = getArmorACBonus(character);

    return baseAC + dexMod + armorBonus;
}

/**
 * Get armor AC bonus from character's equipment
 */
function getArmorACBonus(character: Character): number {
    // This would look at character's equipped armor
    // For now, return 0
    return 0;
}

/**
 * Calculate character's saving throw modifier
 */
function calculateCharacterSave(character: Character, saveType: 'fortitude' | 'reflex' | 'will'): number {
    const proficiency = character.proficiencies?.saves?.[saveType] || 'untrained';
    const proficiencyBonus = getProficiencyBonus(proficiency, character.level || 1);

    let abilityMod = 0;
    if (saveType === 'fortitude') {
        abilityMod = Math.floor((character.abilityScores?.con || 10 - 10) / 2);
    } else if (saveType === 'reflex') {
        abilityMod = Math.floor((character.abilityScores?.dex || 10 - 10) / 2);
    } else if (saveType === 'will') {
        abilityMod = Math.floor((character.abilityScores?.wis || 10 - 10) / 2);
    }

    return proficiencyBonus + abilityMod;
}

/**
 * Calculate character's perception modifier
 */
function calculateCharacterPerception(character: Character): number {
    const wisMod = Math.floor((character.abilityScores?.wis || 10 - 10) / 2);
    const proficiency = character.proficiencies?.perception || 'untrained';
    const proficiencyBonus = getProficiencyBonus(proficiency, character.level || 1);

    return proficiencyBonus + wisMod;
}

/**
 * Calculate character's skill modifier
 */
function calculateCharacterSkill(character: Character, skillName: string): number {
    const skill = character.skills?.find(s => s.name.toLowerCase() === skillName.toLowerCase());
    if (!skill) return 0;

    const abilityMod = Math.floor((character.abilityScores?.[skill.ability.toLowerCase() as keyof typeof character.abilityScores] || 10 - 10) / 2);

    let proficiencyBonus = 0;
    if (skill.proficiency === 'trained') {
        proficiencyBonus = 2 + Math.floor((character.level || 1) / 2);
    } else if (skill.proficiency === 'expert') {
        proficiencyBonus = 4 + Math.floor((character.level || 1) / 2);
    } else if (skill.proficiency === 'master') {
        proficiencyBonus = 6 + Math.floor((character.level || 1) / 2);
    } else if (skill.proficiency === 'legendary') {
        proficiencyBonus = 8 + Math.floor((character.level || 1) / 2);
    }

    return proficiencyBonus + abilityMod;
}

/**
 * Get proficiency bonus based on proficiency rank and level
 */
function getProficiencyBonus(proficiency: string, level: number): number {
    if (proficiency === 'untrained') return 0;
    if (proficiency === 'trained') return 2 + Math.floor(level / 2);
    if (proficiency === 'expert') return 4 + Math.floor(level / 2);
    if (proficiency === 'master') return 6 + Math.floor(level / 2);
    if (proficiency === 'legendary') return 8 + Math.floor(level / 2);
    return 0;
}

/**
 * Count familiar feats that grant additional abilities
 */
function countFamiliarFeats(character: Character): number {
    // This would check for feats like "Advanced Familiar" or similar
    // For now, return 0
    return 0;
}

/**
 * Upgrade damage dice (e.g., 1d6 -> 1d8 -> 2d6 -> 2d8)
 */
function upgradeDamageDice(currentDamage: string, steps: number): string {
    const diceUpgrade: Record<string, string[]> = {
        '1d4': ['1d4', '1d6', '1d8', '2d6', '2d8'],
        '1d6': ['1d6', '1d8', '2d6', '2d8', '3d6'],
        '1d8': ['1d8', '2d6', '2d8', '3d6', '3d8'],
        '1d10': ['1d10', '2d6', '2d8', '3d6', '3d8'],
        '1d12': ['1d12', '2d8', '3d8', '4d8', '4d10'],
        '2d6': ['2d6', '2d8', '3d6', '3d8', '4d8'],
        '2d8': ['2d8', '3d6', '3d8', '4d8', '4d10'],
    };

    const match = currentDamage.match(/(\d+)d(\d+)/);
    if (!match) return currentDamage;

    const numDice = match[1];
    const dieSize = match[2];
    const damageKey = `${numDice}d${dieSize}`;

    const upgrades = diceUpgrade[damageKey];
    if (!upgrades) return currentDamage;

    return upgrades[Math.min(steps, upgrades.length - 1)] || currentDamage;
}
