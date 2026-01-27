/**
 * Class Progression Data
 *
 * This file contains armor and weapon proficiency progression data for all classes,
 * plus saving throws, perception, hit points, and feat progression.
 * Data is extracted from PF2e class journals which list level-based class features.
 *
 * Progressions are defined as arrays where index represents level (0-19, where 0 = level 1)
 * Values: 0 = untrained, 1 = trained, 2 = expert, 3 = master, 4 = legendary
 *
 * NOTE: This file is being refactored to use classMetadata.ts for automatic ID mapping.
 * Helper functions (fillArray, setFromLevel) and STANDARD_FEAT_PROGRESSION are now
 * imported from classMetadata.ts to reduce duplication.
 */

import {
    fillArray,
    setFromLevel,
    STANDARD_FEAT_PROGRESSION,
    getClassIdByName
} from './classMetadata';

export type ProficiencyLevel = 0 | 1 | 2 | 3 | 4; // untrained, trained, expert, master, legendary

export interface ClassProgression {
    armorProficiencies: {
        light: ProficiencyLevel[];
        medium: ProficiencyLevel[];
        heavy: ProficiencyLevel[];
        unarmored: ProficiencyLevel[];
    };
    weaponProficiencies: {
        simple: ProficiencyLevel[];
        martial: ProficiencyLevel[];
        unarmed: ProficiencyLevel[];
        advanced?: ProficiencyLevel[];
    };
    savingThrows?: {
        fortitude: ProficiencyLevel[];
        reflex: ProficiencyLevel[];
        will: ProficiencyLevel[];
    };
    perception?: ProficiencyLevel[];
    hitPointsPerLevel?: number;
    featProgression?: {
        classFeats: number[];
        generalFeats: number[];
        skillFeats: number[];
        skillIncreases: number[];
        ancestryFeats: number[];
    };
}

// Helper functions (fillArray, setFromLevel) are now imported from classMetadata.ts

// Default: trained in light armor and unarmored, untrained in others
const defaultArmorProgression: ClassProgression['armorProficiencies'] = {
    light: fillArray(20, 1),      // Trained
    medium: fillArray(20, 0),     // Untrained
    heavy: fillArray(20, 0),      // Untrained
    unarmored: fillArray(20, 1),  // Trained
};

// Default: trained in simple weapons and unarmed
const defaultWeaponProgression: ClassProgression['weaponProficiencies'] = {
    simple: fillArray(20, 1),     // Trained
    martial: fillArray(20, 0),    // Untrained
    unarmed: fillArray(20, 1),    // Trained
};

/**
 * Class Progressions Map
 * Key: Class ID (from classes.json)
 */
export const classProgressions: Record<string, ClassProgression> = {
    // ALCHMIST
    // Light/Med/Unarmored: T at 1
    // Level 7: Alchemical Weapon Expertise, Will Expertise
    // Level 9: Perception Expertise, Double Brew, Alchemical Expertise
    // Level 11: Chemical Hardiness (Fort Expert), Advanced Vials
    // Level 13: Medium Armor Expertise, Weapon Specialization
    // Level 15: Alchemical Weapon Mastery, Explosion Dodger
    // Level 17: Alchemical Mastery, Abundant Vials
    // Level 19: Medium Armor Mastery
    'XwfcJuskrhI9GIjX': { // Alchemist Foundry ID
        armorProficiencies: {
            light: fillArray(20, 1),
            medium: setFromLevel(setFromLevel(fillArray(20, 1), 12, 2), 18, 3), // Expert at 13, Master at 19
            heavy: fillArray(20, 0),
            unarmored: fillArray(20, 1),
        },
        weaponProficiencies: {
            simple: setFromLevel(fillArray(20, 1), 10, 2),   // Expert at 11
            martial: fillArray(20, 0),
            unarmed: setFromLevel(fillArray(20, 1), 10, 2),  // Expert at 11
        },
        savingThrows: {
            fortitude: setFromLevel(fillArray(20, 2), 10, 2),        // Expert at 1, Expert at 11
            reflex: setFromLevel(fillArray(20, 2), 0, 2),           // Expert at 1
            will: setFromLevel(fillArray(20, 1), 6, 2),            // Trained, Expert at 7
        },
        perception: setFromLevel(fillArray(20, 1), 8, 2),           // Trained, Expert at 9
        hitPointsPerLevel: 8,
        featProgression: {
            classFeats: [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
            generalFeats: [3, 7, 11, 15, 19],
            skillFeats: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
            skillIncreases: [3, 5, 7, 9, 11, 13, 15, 17, 19],
            ancestryFeats: [1, 5, 9, 13, 17],
        },
    },

    // BARBARIAN
    // Light/Med/Unarmored: T at 1
    // Level 7: Juggernaut (Fort Master)
    // Level 9: Reflex Expertise, Raging Resistance
    // Level 11: Mighty Rage (Will Expert)
    // Level 13: Greater Juggernaut (Fort Legendary), Medium Armor Expertise, Weapon Mastery
    // Level 15: Indomitable Will (Will Master), Greater Weapon Specialization
    // Level 17: Perception Mastery, Revitalizing Rage
    // Level 19: Armor Mastery, Devastator
    'YDRiP7uVvr9WRhOI': { // Barbarian Foundry ID
        armorProficiencies: {
            light: setFromLevel(fillArray(20, 1), 18, 3),    // Master at 19
            medium: setFromLevel(setFromLevel(fillArray(20, 1), 12, 2), 18, 3),  // Expert at 13, Master at 19
            heavy: fillArray(20, 0),
            unarmored: setFromLevel(fillArray(20, 1), 18, 3),  // Master at 19
        },
        weaponProficiencies: {
            simple: setFromLevel(setFromLevel(fillArray(20, 1), 4, 2), 12, 3),  // Expert at 5, Master at 13
            martial: setFromLevel(setFromLevel(fillArray(20, 1), 4, 2), 12, 3),  // Expert at 5, Master at 13
            unarmed: setFromLevel(setFromLevel(fillArray(20, 1), 4, 2), 12, 3),  // Expert at 5, Master at 13
        },
        savingThrows: {
            fortitude: setFromLevel(setFromLevel(fillArray(20, 2), 6, 3), 12, 4), // Expert at 1, Master at 7, Legendary at 13
            reflex: setFromLevel(fillArray(20, 1), 8, 2),        // Trained, Expert at 9
            will: setFromLevel(fillArray(20, 2), 14, 3),         // Expert at 1, Master at 15
        },
        perception: setFromLevel(fillArray(20, 2), 16, 3),       // Expert at 1, Master at 17
        hitPointsPerLevel: 12,  // Highest HP
        featProgression: {
            classFeats: [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
            generalFeats: [3, 7, 11, 15, 19],
            skillFeats: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
            skillIncreases: [3, 5, 7, 9, 11, 13, 15, 17, 19],
            ancestryFeats: [1, 5, 9, 13, 17],
        },
    },

    // BARD
    // Light/Unarmored: T at 1
    // Level 3: Reflex Expertise
    // Level 7: Expert Spellcaster
    // Level 9: Performer's Heart, Fortitude Expertise
    // Level 11: Bard Weapon Expertise, Perception Mastery
    // Level 13: Light Armor Expertise, Weapon Specialization
    // Level 15: Master Spellcaster, Greater Performer's Heart
    // Level 17: Champion Mastery (Will Master)
    // Level 19: Legendary Spellcaster, Magnum Opus
    '3gweRQ5gn7szIWAv': { // Bard Foundry ID
        armorProficiencies: {
            light: setFromLevel(fillArray(20, 1), 12, 2),    // Expert at 13
            medium: fillArray(20, 0),
            heavy: fillArray(20, 0),
            unarmored: fillArray(20, 1),
        },
        weaponProficiencies: {
            simple: setFromLevel(fillArray(20, 1), 10, 2),   // Expert at 11
            martial: setFromLevel(fillArray(20, 1), 10, 2),  // Expert at 11
            unarmed: setFromLevel(fillArray(20, 1), 10, 2),  // Expert at 11
        },
        savingThrows: {
            fortitude: setFromLevel(fillArray(20, 1), 8, 2),        // Trained, Expert at 9
            reflex: setFromLevel(fillArray(20, 1), 2, 2),          // Trained, Expert at 3
            will: setFromLevel(setFromLevel(fillArray(20, 2), 16, 3), 0, 2), // Expert at 1, Master at 17
        },
        perception: setFromLevel(setFromLevel(fillArray(20, 2), 10, 3), 0, 2), // Expert at 1, Master at 11
        hitPointsPerLevel: 8,
        featProgression: {
            classFeats: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],  // No class feat at level 1
            generalFeats: [3, 7, 11, 15, 19],
            skillFeats: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
            skillIncreases: [3, 5, 7, 9, 11, 13, 15, 17, 19],
            ancestryFeats: [1, 5, 9, 13, 17],
        },
    },

    // CHAMPION
    // Light/Med/Heavy/Unarmored: T at 1
    // Level 5: Weapon Expertise
    // Level 7: Armor Expertise, Weapon Specialization
    // Level 9: Champion Expertise (Fort/Ref Expert), Reflex Expertise
    // Level 11: Divine Will (Will Expert), Perception Expertise, Exalted Reaction
    // Level 13: Armor Mastery, Weapon Mastery
    // Level 15: Greater Weapon Specialization
    // Level 17: Legendary Armor, Champion Mastery (all saves Master)
    'x8iwnpdLbfcoZkHA': { // Champion Foundry ID
        armorProficiencies: {
            light: setFromLevel(setFromLevel(fillArray(20, 1), 6, 2), 16, 3),    // Expert at 7, Master at 17
            medium: setFromLevel(setFromLevel(fillArray(20, 1), 6, 2), 16, 3),   // Expert at 7, Master at 17
            heavy: setFromLevel(setFromLevel(fillArray(20, 1), 6, 2), 16, 3),    // Expert at 7, Master at 17
            unarmored: setFromLevel(setFromLevel(fillArray(20, 1), 6, 2), 16, 3),  // Expert at 7, Master at 17
        },
        weaponProficiencies: {
            simple: setFromLevel(setFromLevel(fillArray(20, 1), 4, 2), 12, 3),  // Expert at 5, Master at 13
            martial: setFromLevel(setFromLevel(fillArray(20, 1), 4, 2), 12, 3),  // Expert at 5, Master at 13
            unarmed: setFromLevel(setFromLevel(fillArray(20, 1), 4, 2), 12, 3),  // Expert at 5, Master at 13
        },
        savingThrows: {
            fortitude: setFromLevel(setFromLevel(fillArray(20, 2), 8, 3), 16, 3), // Expert at 1, Master at 9
            reflex: setFromLevel(setFromLevel(fillArray(20, 1), 8, 2), 16, 3),    // Trained, Expert at 9, Master at 17
            will: setFromLevel(setFromLevel(fillArray(20, 2), 8, 3), 16, 3),      // Expert at 1, Master at 9
        },
        perception: setFromLevel(fillArray(20, 1), 10, 2),           // Trained, Expert at 11
        hitPointsPerLevel: 10,
        featProgression: {
            classFeats: [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
            generalFeats: [3, 7, 11, 15, 19],
            skillFeats: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
            skillIncreases: [3, 5, 7, 9, 11, 13, 15, 17, 19],
            ancestryFeats: [1, 5, 9, 13, 17],
        },
    },

    // CLERIC
    // Armor proficiencies depend on Doctrine choice
    // Level 5: Perception Expertise
    // Level 9: Resolute Faith (Fort Expert)
    // Level 11: Reflex Expertise
    // Level 13: Divine Defense, Weapon Specialization
    // Level 19: Miraculous Spell (Will Master)
    'EizrWvUPMS67Pahd': { // Cleric Foundry ID
        armorProficiencies: {
            light: setFromLevel(fillArray(20, 0), 0, 1),  // Based on doctrine
            medium: fillArray(20, 0),                    // Based on doctrine
            heavy: fillArray(20, 0),                     // Based on doctrine
            unarmored: fillArray(20, 1),
        },
        weaponProficiencies: {
            simple: setFromLevel(fillArray(20, 1), 10, 2),   // Expert at 11
            martial: fillArray(20, 0),
            unarmed: setFromLevel(fillArray(20, 1), 10, 2),  // Expert at 11
        },
        savingThrows: {
            fortitude: setFromLevel(fillArray(20, 1), 8, 2),        // Trained, Expert at 9
            reflex: setFromLevel(fillArray(20, 1), 10, 2),         // Trained, Expert at 11
            will: setFromLevel(fillArray(20, 2), 18, 3),           // Expert at 1, Master at 19
        },
        perception: setFromLevel(fillArray(20, 1), 4, 2),          // Trained, Expert at 5
        hitPointsPerLevel: 8,
        featProgression: {
            classFeats: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],  // No class feat at level 1
            generalFeats: [3, 7, 11, 15, 19],
            skillFeats: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
            skillIncreases: [3, 5, 7, 9, 11, 13, 15, 17, 19],
            ancestryFeats: [1, 5, 9, 13, 17],
        },
    },

    // DRUID
    // Light/Med/Unarmored: T at 1
    // Level 3: Fortitude Expertise, Perception Expertise
    // Level 5: Reflex Expertise
    // Level 7: Expert Spellcaster
    // Level 11: Wild Willpower (Will Expert), Weapon Expertise
    // Level 13: Medium Armor Expertise, Weapon Specialization
    // Level 15: Master Spellcaster
    // Level 19: Legendary Spellcaster, Primal Hierophant
    '7s57JDCaiYYCAdFx': { // Druid Foundry ID
        armorProficiencies: {
            light: fillArray(20, 1),
            medium: setFromLevel(fillArray(20, 1), 12, 2),    // Expert at 13
            heavy: fillArray(20, 0),
            unarmored: fillArray(20, 1),
        },
        weaponProficiencies: {
            simple: setFromLevel(fillArray(20, 1), 10, 2),   // Expert at 11
            martial: fillArray(20, 0),
            unarmed: setFromLevel(fillArray(20, 1), 10, 2),  // Expert at 11
        },
        savingThrows: {
            fortitude: setFromLevel(fillArray(20, 1), 2, 2),        // Trained, Expert at 3
            reflex: setFromLevel(fillArray(20, 1), 4, 2),          // Trained, Expert at 5
            will: setFromLevel(fillArray(20, 2), 10, 2),           // Expert at 1, Expert at 11
        },
        perception: setFromLevel(fillArray(20, 1), 2, 2),          // Trained, Expert at 3
        hitPointsPerLevel: 8,
        featProgression: {
            classFeats: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],  // No class feat at level 1
            generalFeats: [3, 7, 11, 15, 19],
            skillFeats: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
            skillIncreases: [3, 5, 7, 9, 11, 13, 15, 17, 19],
            ancestryFeats: [1, 5, 9, 13, 17],
        },
    },

    // FIGHTER
    // Light/Med/Heavy/Unarmored: T at 1
    // Level 11: Armor Expertise, Fighter Expertise (Fort/Ref/Per)
    // Level 13: Medium/Heavy Armor Expertise
    // Level 15: Tempered Reflexes (Reflex Master), Greater Weapon Specialization
    // Level 17: Armor Mastery (all → Master)
    // Level 19: Versatile Legend (Fort Legendary)
    '8zn3cD6GSmoo1LW4': { // Fighter Foundry ID
        armorProficiencies: {
            light: setFromLevel(fillArray(20, 1), 16, 3),    // Master at 17
            medium: setFromLevel(setFromLevel(fillArray(20, 1), 10, 2), 16, 3),  // Expert at 11, Master at 17
            heavy: setFromLevel(setFromLevel(fillArray(20, 1), 10, 2), 16, 3),   // Expert at 11, Master at 17
            unarmored: setFromLevel(fillArray(20, 1), 16, 3),  // Master at 17
        },
        weaponProficiencies: {
            simple: setFromLevel(setFromLevel(fillArray(20, 1), 12, 3), 18, 4),   // Master at 13, Legendary at 19
            martial: setFromLevel(setFromLevel(fillArray(20, 1), 12, 3), 18, 4),  // Master at 13, Legendary at 19
            unarmed: setFromLevel(setFromLevel(fillArray(20, 1), 12, 3), 18, 4),  // Master at 13, Legendary at 19
            advanced: setFromLevel(setFromLevel(fillArray(20, 1), 12, 3), 18, 4),  // Master at 13, Legendary at 19
        },
        savingThrows: {
            fortitude: setFromLevel(fillArray(20, 2), 10, 3),       // Expert at 1, Master at 11, Legendary at 19
            reflex: setFromLevel(fillArray(20, 2), 14, 3),          // Expert at 1, Master at 15
            will: fillArray(20, 1),                                  // Trained
        },
        perception: setFromLevel(fillArray(20, 2), 16, 3),           // Expert at 1, Legendary at 17
        hitPointsPerLevel: 10,
        featProgression: {
            classFeats: [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
            generalFeats: [3, 7, 11, 15, 19],
            skillFeats: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
            skillIncreases: [3, 5, 7, 9, 11, 13, 15, 17, 19],
            ancestryFeats: [1, 5, 9, 13, 17],
        },
    },

    // INVESTIGATOR
    // Light/Unarmored: T at 1
    // Level 3: Skillful Lessons (extra skill increases)
    // Level 5: Weapon Expertise
    // Level 7: Perception Mastery (Vigilant Senses)
    // Level 9: Fortitude Expertise, Investigator Expertise
    // Level 11: Dogged Will (Will Expert), Deductive Improvisation
    // Level 13: Light Armor Expertise, Weapon Mastery, Incredible Senses (Perception Legend)
    // Level 15: Greater Weapon Specialization, Savvy Reflexes (Ref Master)
    // Level 17: Greater Dogged Will (Will Master)
    // Level 19: Light Armor Mastery, Master Detective
    // UNIQUE: Skill feats and skill increases at EVERY level (1-20)
    '4wrSCyX6akmyo7Wj': { // Investigator Foundry ID
        armorProficiencies: {
            light: setFromLevel(setFromLevel(fillArray(20, 1), 12, 2), 18, 3), // Expert at 13, Master at 19
            medium: fillArray(20, 0),
            heavy: fillArray(20, 0),
            unarmored: fillArray(20, 1),
        },
        weaponProficiencies: {
            simple: setFromLevel(setFromLevel(fillArray(20, 1), 4, 2), 12, 3),  // Expert at 5, Master at 13
            martial: setFromLevel(setFromLevel(fillArray(20, 1), 4, 2), 12, 3),  // Expert at 5, Master at 13
            unarmed: setFromLevel(setFromLevel(fillArray(20, 1), 4, 2), 12, 3),  // Expert at 5, Master at 13
        },
        savingThrows: {
            fortitude: setFromLevel(fillArray(20, 1), 8, 2),        // Trained, Expert at 9
            reflex: setFromLevel(setFromLevel(fillArray(20, 2), 14, 3), 0, 2), // Expert at 1, Master at 15
            will: setFromLevel(setFromLevel(fillArray(20, 2), 10, 3), 16, 3), // Expert at 1, Master at 11, Master at 17
        },
        perception: setFromLevel(setFromLevel(fillArray(20, 2), 6, 3), 12, 4), // Expert at 1, Master at 7, Legendary at 13
        hitPointsPerLevel: 8,
        featProgression: {
            classFeats: [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
            generalFeats: [3, 7, 11, 15, 19],
            skillFeats: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],  // EVERY level!
            skillIncreases: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],  // EVERY level!
            ancestryFeats: [1, 5, 9, 13, 17],
        },
    },

    // KINETICIST
    // Light/Unarmored: T at 1
    // Level 3: Will Expertise, Extract Element
    // Level 5: Gate's Threshold
    // Level 7: Kinetic Durability (Fort Expert), Kinetic Expertise
    // Level 9: Perception Expertise, Second Gate's Threshold
    // Level 11: Weapon Expertise, Kinetic Quickness, Reflow Elements
    // Level 13: Light Armor Expertise, Third Gate's Threshold, Weapon Specialization
    // Level 15: Kinetic Mastery, Greater Kinetic Durability (Fort Master)
    // Level 17: Fourth Gate's Threshold, Double Reflow
    // Level 19: Light Armor Mastery, Kinetic Legend, Final Gate
    'RggQN3bX5SEcsffR': { // Kineticist Foundry ID
        armorProficiencies: {
            light: setFromLevel(setFromLevel(fillArray(20, 1), 12, 2), 18, 3),    // Expert at 13, Master at 19
            medium: fillArray(20, 0),
            heavy: fillArray(20, 0),
            unarmored: setFromLevel(setFromLevel(fillArray(20, 1), 12, 2), 18, 3), // Expert at 13, Master at 19
        },
        weaponProficiencies: {
            simple: setFromLevel(fillArray(20, 1), 10, 2),   // Expert at 11
            martial: setFromLevel(fillArray(20, 0), 4, 1),   // Trained at 5 (Gate's Threshold)
            unarmed: setFromLevel(fillArray(20, 1), 10, 2),  // Expert at 11
        },
        savingThrows: {
            fortitude: setFromLevel(setFromLevel(fillArray(20, 2), 0, 2), 14, 3), // Expert at 1, Master at 15
            reflex: fillArray(20, 2),                               // Expert at 1
            will: setFromLevel(fillArray(20, 1), 2, 2),           // Trained, Expert at 3
        },
        perception: setFromLevel(fillArray(20, 1), 8, 2),           // Trained, Expert at 9
        hitPointsPerLevel: 8,
        featProgression: {
            classFeats: [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
            generalFeats: [3, 7, 11, 15, 19],
            skillFeats: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
            skillIncreases: [3, 5, 7, 9, 11, 13, 15, 17, 19],
            ancestryFeats: [1, 5, 9, 13, 17],
        },
    },

    // MAGUS
    // Light/Med/Unarmored: T at 1
    // Level 5: Weapon Expertise, Lightning Reflexes (Ref Expert)
    // Level 7: Weapon Specialization, Studious Spells
    // Level 9: Expert Spellcaster, Alertness (Perception Expertise), Resolve (Fort Expert)
    // Level 11: Medium Armor Expertise
    // Level 13: Weapon Mastery
    // Level 15: Greater Weapon Specialization, Juggernaut (Fort Master)
    // Level 17: Master Spellcaster, Medium Armor Mastery
    // Level 19: Double Spellstrike
    'HQBA9Yx2s8ycvz3C': { // Magus Foundry ID
        armorProficiencies: {
            light: fillArray(20, 1),
            medium: setFromLevel(setFromLevel(fillArray(20, 1), 10, 2), 16, 3), // Expert at 11, Master at 17
            heavy: fillArray(20, 0),
            unarmored: fillArray(20, 1),
        },
        weaponProficiencies: {
            simple: setFromLevel(setFromLevel(fillArray(20, 1), 4, 2), 12, 3),  // Expert at 5, Master at 13
            martial: setFromLevel(setFromLevel(fillArray(20, 1), 4, 2), 12, 3),  // Expert at 5, Master at 13
            unarmed: setFromLevel(setFromLevel(fillArray(20, 1), 4, 2), 12, 3),  // Expert at 5, Master at 13
        },
        savingThrows: {
            fortitude: setFromLevel(setFromLevel(fillArray(20, 2), 8, 3), 0, 2), // Expert at 1, Master at 9
            reflex: setFromLevel(fillArray(20, 1), 4, 2),          // Trained, Expert at 5
            will: setFromLevel(fillArray(20, 2), 0, 2),           // Expert at 1
        },
        perception: setFromLevel(fillArray(20, 1), 8, 2),           // Trained, Expert at 9
        hitPointsPerLevel: 8,
        featProgression: {
            classFeats: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],  // No class feat at level 1
            generalFeats: [3, 7, 11, 15, 19],
            skillFeats: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
            skillIncreases: [3, 5, 7, 9, 11, 13, 15, 17, 19],
            ancestryFeats: [1, 5, 9, 13, 17],
        },
    },

    // MONK
    // Unarmored: E at 1 → Master at 11 → Legendary at 17
    // Level 5: Expert Strikes (Unarmed Expert), Perception Expertise
    // Level 7: Weapon Specialization, Path to Perfection (All saves Master at 11)
    // Level 9: Monk Expertise (All saves Expert), Metal Strikes
    // Level 11: Second Path to Perfection
    // Level 13: Graceful Mastery (Perception Master), Master Strikes
    // Level 15: Greater Weapon Specialization, Third Path to Perfection
    // Level 17: Graceful Legend (Perception Legendary), Adamantine Strikes
    'YPxpk9JbMnKjbNLc': { // Monk Foundry ID
        armorProficiencies: {
            light: fillArray(20, 0),
            medium: fillArray(20, 0),
            heavy: fillArray(20, 0),
            unarmored: setFromLevel(setFromLevel(fillArray(20, 2), 10, 3), 16, 4), // Expert at 1, Master at 11, Legendary at 17
        },
        weaponProficiencies: {
            simple: fillArray(20, 1),
            martial: fillArray(20, 0),
            unarmed: setFromLevel(setFromLevel(setFromLevel(fillArray(20, 1), 4, 2), 12, 3), 16, 4),    // Trained, Expert at 5, Master at 13, Legendary at 17
        },
        savingThrows: {
            fortitude: setFromLevel(setFromLevel(fillArray(20, 2), 10, 3), 16, 4), // Expert at 1, Master at 11, Legendary at 17
            reflex: setFromLevel(setFromLevel(fillArray(20, 2), 10, 3), 16, 4),   // Expert at 1, Master at 11, Legendary at 17
            will: setFromLevel(setFromLevel(fillArray(20, 2), 10, 3), 16, 4),     // Expert at 1, Master at 11, Legendary at 17
        },
        perception: setFromLevel(setFromLevel(fillArray(20, 1), 4, 2), 16, 4), // Trained, Expert at 5, Legendary at 17
        hitPointsPerLevel: 10,
        featProgression: {
            classFeats: [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
            generalFeats: [3, 7, 11, 15, 19],
            skillFeats: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
            skillIncreases: [3, 5, 7, 9, 11, 13, 15, 17, 19],
            ancestryFeats: [1, 5, 9, 13, 17],
        },
    },

    // ORACLE
    // Light/Unarmored: T at 1
    // Level 7: Expert Spellcaster, Mysterious Resolve
    // Level 9: Magical Fortitude (Fort Expert)
    // Level 11: Major Curse, Weapon/Perception Expertise (Oracular Senses)
    // Level 13: Light Armor Expertise, Premonition Reflexes (Ref Expert), Weapon Specialization
    // Level 15: Master Spellcaster
    // Level 17: Extreme Curse, Greater Mysterious Resolve (Will Master)
    // Level 19: Legendary Spellcaster, Oracular Clarity
    'pWHx4SXcft9O2udP': { // Oracle Foundry ID
        armorProficiencies: {
            light: setFromLevel(fillArray(20, 1), 12, 2),    // Expert at 13
            medium: fillArray(20, 0),
            heavy: fillArray(20, 0),
            unarmored: fillArray(20, 1),
        },
        weaponProficiencies: {
            simple: setFromLevel(fillArray(20, 1), 10, 2),   // Expert at 11
            martial: fillArray(20, 0),
            unarmed: setFromLevel(fillArray(20, 1), 10, 2),  // Expert at 11
        },
        savingThrows: {
            fortitude: setFromLevel(fillArray(20, 1), 8, 2),        // Trained, Expert at 9
            reflex: setFromLevel(fillArray(20, 1), 12, 2),         // Trained, Expert at 13
            will: setFromLevel(setFromLevel(fillArray(20, 2), 16, 3), 0, 2), // Expert at 1, Master at 17
        },
        perception: setFromLevel(fillArray(20, 1), 10, 2),           // Trained, Expert at 11
        hitPointsPerLevel: 8,
        featProgression: {
            classFeats: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],  // No class feat at level 1
            generalFeats: [3, 7, 11, 15, 19],
            skillFeats: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
            skillIncreases: [3, 5, 7, 9, 11, 13, 15, 17, 19],
            ancestryFeats: [1, 5, 9, 13, 17],
        },
    },

    // RANGER
    // Light/Med/Unarmored: T at 1
    // Level 3: Will Expertise
    // Level 5: Ranger Weapon Expertise, Trackless Journey
    // Level 7: Natural Reflexes (Ref Expert), Perception Mastery
    // Level 9: Ranger Expertise (Fort Expert), Nature's Edge
    // Level 11: Medium Armor Expertise, Warden's Endurance (Fort Expert)
    // Level 13: Weapon Mastery
    // Level 15: Greater Natural Reflexes (Ref Master), Greater Weapon Specialization, Perception Legend
    // Level 17: Masterful Hunter
    // Level 19: Medium Armor Mastery, Swift Prey
    'Yix76sfxrIlltSTJ': { // Ranger Foundry ID
        armorProficiencies: {
            light: fillArray(20, 1),
            medium: setFromLevel(fillArray(20, 1), 12, 2),    // Expert at 13
            heavy: fillArray(20, 0),
            unarmored: fillArray(20, 1),
        },
        weaponProficiencies: {
            simple: setFromLevel(setFromLevel(fillArray(20, 1), 4, 2), 12, 3),  // Expert at 5, Master at 13
            martial: setFromLevel(setFromLevel(fillArray(20, 1), 4, 2), 12, 3),  // Expert at 5, Master at 13
            unarmed: setFromLevel(setFromLevel(fillArray(20, 1), 4, 2), 12, 3),  // Expert at 5, Master at 13
        },
        savingThrows: {
            fortitude: setFromLevel(fillArray(20, 2), 10, 2),        // Expert at 1, Expert at 11
            reflex: setFromLevel(setFromLevel(fillArray(20, 2), 6, 3), 14, 3), // Expert at 1, Master at 7, Master at 15
            will: setFromLevel(fillArray(20, 1), 2, 2),           // Trained, Expert at 3
        },
        perception: setFromLevel(setFromLevel(fillArray(20, 2), 6, 3), 14, 4), // Expert at 1, Master at 7, Legendary at 15
        hitPointsPerLevel: 10,
        featProgression: {
            classFeats: [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
            generalFeats: [3, 7, 11, 15, 19],
            skillFeats: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
            skillIncreases: [3, 5, 7, 9, 11, 13, 15, 17, 19],
            ancestryFeats: [1, 5, 9, 13, 17],
        },
    },

    // ROGUE
    // Light Armor: T at 1
    // Level 7: Evasive Reflexes (Reflex Master), Perception Mastery
    // Level 9: Rogue Resilience (Fort Expert), Debilitating Strikes
    // Level 11: Rogue Expertise (Will Expert)
    // Level 13: Light Armor Expertise, Greater Rogue Reflexes (Reflex Legendary), Perception Legend
    // Level 15: Greater Weapon Specialization, Double Debilitation
    // Level 17: Agile Mind
    // Level 19: Light Armor Mastery, Master Strike
    // UNIQUE: Skill feats at EVERY level (1-20), skill increases at even levels
    'LO9STvskJemPkiAI': { // Rogue Foundry ID
        armorProficiencies: {
            light: setFromLevel(setFromLevel(fillArray(20, 1), 12, 2), 18, 3), // Expert at 13, Master at 19
            medium: fillArray(20, 0),
            heavy: fillArray(20, 0),
            unarmored: fillArray(20, 1),
        },
        weaponProficiencies: {
            simple: fillArray(20, 1),
            martial: fillArray(20, 1),
            unarmed: fillArray(20, 1),
        },
        savingThrows: {
            fortitude: setFromLevel(fillArray(20, 1), 8, 2),        // Trained, Expert at 9
            reflex: setFromLevel(setFromLevel(fillArray(20, 2), 6, 3), 12, 4), // Expert at 1, Master at 7, Legendary at 13
            will: setFromLevel(fillArray(20, 2), 10, 2),           // Expert at 1, Expert at 11
        },
        perception: setFromLevel(setFromLevel(fillArray(20, 2), 6, 3), 12, 4), // Expert at 1, Master at 7, Legendary at 13
        hitPointsPerLevel: 8,
        featProgression: {
            classFeats: [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
            generalFeats: [3, 7, 11, 15, 19],
            skillFeats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],  // EVERY level!
            skillIncreases: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],  // Even levels
            ancestryFeats: [1, 5, 9, 13, 17],
        },
    },

    // SORCERER
    // Unarmored: T at 1
    // Level 5: Magical Fortitude (Fort Expert)
    // Level 7: Expert Spellcaster
    // Level 9: Reflex Expertise
    // Level 11: Weapon/Perception Expertise
    // Level 13: Weapon Specialization, Defensive Robes
    // Level 15: Master Spellcaster
    // Level 17: Majestic Will (Will Master)
    // Level 19: Legendary Spellcaster, Bloodline Paragon
    '15Yc1r6s9CEhSTMe': { // Sorcerer Foundry ID
        armorProficiencies: {
            light: fillArray(20, 0),
            medium: fillArray(20, 0),
            heavy: fillArray(20, 0),
            unarmored: fillArray(20, 1),
        },
        weaponProficiencies: {
            simple: setFromLevel(fillArray(20, 1), 10, 2),   // Expert at 11
            martial: fillArray(20, 0),
            unarmed: setFromLevel(fillArray(20, 1), 10, 2),  // Expert at 11
        },
        savingThrows: {
            fortitude: setFromLevel(fillArray(20, 1), 4, 2),        // Trained, Expert at 5
            reflex: setFromLevel(fillArray(20, 1), 8, 2),          // Trained, Expert at 9
            will: setFromLevel(setFromLevel(fillArray(20, 2), 16, 3), 0, 2), // Expert at 1, Master at 17
        },
        perception: setFromLevel(fillArray(20, 1), 10, 2),           // Trained, Expert at 11
        hitPointsPerLevel: 6,  // Lowest HP with Wizard
        featProgression: {
            classFeats: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],  // No class feat at level 1
            generalFeats: [3, 7, 11, 15, 19],
            skillFeats: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
            skillIncreases: [3, 5, 7, 9, 11, 13, 15, 17, 19],
            ancestryFeats: [1, 5, 9, 13, 17],
        },
    },

    // SWASHBUCKLER
    // Light/Unarmored: T at 1
    // Level 3: Fortitude Expertise, Opportune Riposte
    // Level 5: Weapon Expertise
    // Level 7: Weapon Specialization, Confident Evasion
    // Level 9: Swashbuckler Expertise (Will Expert), Exemplary Finisher
    // Level 11: Continuous Flair, Perception Mastery (Vigilant Senses)
    // Level 13: Light Armor Expertise, Weapon Mastery, Assured Evasion
    // Level 15: Greater Weapon Specialization, Keen Flair
    // Level 17: Reinforced Ego
    // Level 19: Light Armor Mastery, Eternal Confidence
    'uJ5aCzlw34GGdWjp': { // Swashbuckler Foundry ID
        armorProficiencies: {
            light: setFromLevel(setFromLevel(fillArray(20, 1), 12, 2), 18, 3), // Expert at 13, Master at 19
            medium: fillArray(20, 0),
            heavy: fillArray(20, 0),
            unarmored: fillArray(20, 1),
        },
        weaponProficiencies: {
            simple: setFromLevel(setFromLevel(fillArray(20, 1), 4, 2), 12, 3),  // Expert at 5, Master at 13
            martial: setFromLevel(setFromLevel(fillArray(20, 1), 4, 2), 12, 3),  // Expert at 5, Master at 13
            unarmed: setFromLevel(setFromLevel(fillArray(20, 1), 4, 2), 12, 3),  // Expert at 5, Master at 13
        },
        savingThrows: {
            fortitude: setFromLevel(fillArray(20, 1), 2, 2),        // Trained, Expert at 3
            reflex: setFromLevel(fillArray(20, 2), 0, 2),           // Expert at 1
            will: setFromLevel(fillArray(20, 2), 8, 2),            // Expert at 1, Expert at 9
        },
        perception: setFromLevel(fillArray(20, 2), 10, 3),           // Expert at 1, Master at 11
        hitPointsPerLevel: 10,
        featProgression: {
            classFeats: [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
            generalFeats: [3, 7, 11, 15, 19],
            skillFeats: [2, 3, 4, 6, 7, 8, 10, 12, 14, 15, 16, 18, 20], // Extra skill feats at odd levels
            skillIncreases: [3, 5, 7, 9, 11, 13, 15, 17, 19],
            ancestryFeats: [1, 5, 9, 13, 17],
        },
    },

    // WIZARD
    // Unarmored: T at 1
    // Level 5: Reflex Expertise
    // Level 7: Expert Spellcaster
    // Level 9: Magical Fortitude (Fort Expert)
    // Level 11: Weapon/Perception Expertise
    // Level 13: Weapon Specialization
    // Level 15: Master Spellcaster
    // Level 17: Prodigious Will (Will Master)
    // Level 19: Legendary Spellcaster
    'RwjIZzIxzPpUglnK': { // Wizard Foundry ID
        armorProficiencies: {
            light: fillArray(20, 0),
            medium: fillArray(20, 0),
            heavy: fillArray(20, 0),
            unarmored: fillArray(20, 1),
        },
        weaponProficiencies: {
            simple: setFromLevel(fillArray(20, 1), 10, 2),   // Expert at 11
            martial: fillArray(20, 0),
            unarmed: setFromLevel(fillArray(20, 1), 10, 2),  // Expert at 11
        },
        savingThrows: {
            fortitude: setFromLevel(fillArray(20, 1), 8, 2),        // Trained, Expert at 9
            reflex: setFromLevel(fillArray(20, 1), 4, 2),          // Trained, Expert at 5
            will: setFromLevel(setFromLevel(fillArray(20, 2), 16, 3), 18, 4), // Expert at 1, Master at 17, Legendary at 19
        },
        perception: setFromLevel(fillArray(20, 1), 10, 2),           // Trained, Expert at 11
        hitPointsPerLevel: 6,
        featProgression: {
            classFeats: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],  // No class feat at level 1
            generalFeats: [3, 7, 11, 15, 19],
            skillFeats: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
            skillIncreases: [3, 5, 7, 9, 11, 13, 15, 17, 19],
            ancestryFeats: [1, 5, 9, 13, 17],
        },
    },

    // ANIMIST
    // Light/Med/Unarmored: T at 1
    // Level 3: Fortitude Expertise
    // Level 7: Expert Spellcaster, Third Apparition
    // Level 9: Perception Expertise
    // Level 11: Simple Weapon Expertise, Expert Protections
    // Level 13: Master of Mind and Spirit
    // Level 15: Master Spellcaster, Fourth Apparition
    // Level 19: Legendary Spellcaster, Supreme Incarnation
    '9KiqZVG9r5g8mC4V': { // Animist Foundry ID
        armorProficiencies: {
            light: fillArray(20, 1),
            medium: fillArray(20, 1),
            heavy: fillArray(20, 0),
            unarmored: fillArray(20, 1),
        },
        weaponProficiencies: {
            simple: fillArray(20, 1),
            martial: fillArray(20, 0),
            unarmed: fillArray(20, 1),
        },
        savingThrows: {
            fortitude: setFromLevel(fillArray(20, 1), 2, 2),        // Trained, Expert at 3
            reflex: fillArray(20, 1),                               // Trained
            will: setFromLevel(fillArray(20, 2), 10, 2),           // Expert at 1, Expert at 11
        },
        perception: setFromLevel(fillArray(20, 1), 8, 2),           // Trained, Expert at 9
        hitPointsPerLevel: 8,
        featProgression: {
            classFeats: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],  // No class feat at level 1
            generalFeats: [3, 7, 11, 15, 19],
            skillFeats: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
            skillIncreases: [3, 5, 7, 9, 11, 13, 15, 17, 19],
            ancestryFeats: [1, 5, 9, 13, 17],
        },
    },

    // COMMANDER (PF2e Remaster - Battlecry!)
    // Light/Med/Heavy/Unarmored: T at 1
    // Level 3: Warfare Expertise (Fort/Ref/Per Expert)
    // Level 5: Military Expertise (Will Expert)
    // Level 7: Expert Tactician, Weapon Specialization
    // Level 9: Fortitude Expertise
    // Level 11: Armor Expertise, Commanding Will (Will Expert)
    // Level 13: Perception Mastery, Weapon Mastery
    // Level 15: Master Tactician, Battlefield Intuition (Per Master), Greater Weapon Specialization
    // Level 17: Armor Mastery
    // Level 19: Legendary Tactician
    'Oyee5Ds9uwYLEkD0': { // Commander Foundry ID
        armorProficiencies: {
            light: setFromLevel(setFromLevel(fillArray(20, 1), 10, 2), 16, 3),    // Trained at 1, Expert at 11, Master at 17
            medium: setFromLevel(setFromLevel(fillArray(20, 1), 10, 2), 16, 3),   // Trained at 1, Expert at 11, Master at 17
            heavy: setFromLevel(setFromLevel(fillArray(20, 1), 10, 2), 16, 3),    // Trained at 1, Expert at 11, Master at 17
            unarmored: setFromLevel(setFromLevel(fillArray(20, 1), 10, 2), 16, 3),  // Trained at 1, Expert at 11, Master at 17
        },
        weaponProficiencies: {
            simple: fillArray(20, 1),
            martial: fillArray(20, 1),
            unarmed: fillArray(20, 1),
        },
        savingThrows: {
            fortitude: setFromLevel(fillArray(20, 1), 2, 2),        // Trained, Expert at 3
            reflex: setFromLevel(fillArray(20, 1), 2, 2),          // Trained, Expert at 3
            will: setFromLevel(setFromLevel(fillArray(20, 1), 4, 2), 10, 2), // Trained, Expert at 5, Expert at 11
        },
        perception: setFromLevel(setFromLevel(fillArray(20, 1), 2, 2), 14, 3), // Trained, Expert at 3, Master at 15
        hitPointsPerLevel: 8,
        featProgression: {
            classFeats: [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
            generalFeats: [3, 7, 11, 15, 19],
            skillFeats: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
            skillIncreases: [3, 5, 7, 9, 11, 13, 15, 17, 19],
            ancestryFeats: [1, 5, 9, 13, 17],
        },
    },

    // GUARDIAN (PF2e Remaster - Battlecry!)
    // Light/Med/Heavy/Unarmored: T at 1
    // Level 3: Tough To Kill (Fort Expert)
    // Level 5: Unbreakable Expertise (Fort Expert), Weapon Expertise
    // Level 7: Reaction Time, Reflex Expertise
    // Level 9: Battle Hardened (Fort/Ref/Will Expert), Guardian Expertise
    // Level 11: Unbreakable Mastery (Fort Master), Weapon Specialization
    // Level 13: Weapon Mastery
    // Level 15: Unbreakable Legend (Fort Legendary), Greater Weapon Specialization
    // Level 17: Unyielding Resolve (Will Master), Greater Weapon Specialization
    // Level 19: Guardian Mastery
    '1L7geK3aoosye3Xj': { // Guardian Foundry ID
        armorProficiencies: {
            light: fillArray(20, 1),
            medium: fillArray(20, 1),
            heavy: fillArray(20, 1),
            unarmored: fillArray(20, 1),
        },
        weaponProficiencies: {
            simple: fillArray(20, 1),
            martial: fillArray(20, 1),
            unarmed: fillArray(20, 1),
        },
        savingThrows: {
            fortitude: setFromLevel(setFromLevel(fillArray(20, 2), 2, 3), 14, 4), // Expert at 1, Expert at 3, Master at 11, Legendary at 15
            reflex: setFromLevel(fillArray(20, 1), 6, 2),        // Trained, Expert at 7
            will: setFromLevel(fillArray(20, 2), 16, 3),         // Expert at 1, Master at 17
        },
        perception: fillArray(20, 1),                             // Trained
        hitPointsPerLevel: 12,  // Highest HP with Barbarian
        featProgression: {
            classFeats: [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
            generalFeats: [3, 7, 11, 15, 19],
            skillFeats: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
            skillIncreases: [3, 5, 7, 9, 11, 13, 15, 17, 19],
            ancestryFeats: [1, 5, 9, 13, 17],
        },
    },

    // GUNSLINGER
    // Light/Med/Unarmored: T at 1
    // Level 3: Stubborn (Fort Expert)
    // Level 5: Gunslinger Weapon Mastery
    // Level 7: Weapon Specialization, Perception Mastery
    // Level 9: Gunslinger Expertise (Ref/Will Expert), Advanced Deed
    // Level 11: Blast Dodger (Ref Master)
    // Level 13: Medium Armor Expertise, Gunslinging Legend
    // Level 15: Greater Weapon Specialization, Greater Deed, Lead Constitution (Fort Master)
    // Level 17: Shootist's Edge
    // Level 19: Medium Armor Mastery, Perception Legend
    'Z9li154CPNmun29Q': { // Gunslinger Foundry ID
        armorProficiencies: {
            light: fillArray(20, 1),
            medium: setFromLevel(setFromLevel(fillArray(20, 1), 12, 2), 18, 3), // Expert at 13, Master at 19
            heavy: fillArray(20, 0),
            unarmored: fillArray(20, 1),
        },
        weaponProficiencies: {
            simple: fillArray(20, 1),
            martial: fillArray(20, 1),
            unarmed: fillArray(20, 1),
        },
        savingThrows: {
            fortitude: setFromLevel(setFromLevel(fillArray(20, 2), 2, 3), 14, 3), // Expert at 1, Expert at 3, Master at 15
            reflex: setFromLevel(setFromLevel(fillArray(20, 2), 2, 3), 10, 3),    // Expert at 1, Expert at 3, Master at 11
            will: setFromLevel(fillArray(20, 1), 8, 2),          // Trained, Expert at 9
        },
        perception: setFromLevel(setFromLevel(fillArray(20, 2), 6, 3), 18, 4), // Expert at 1, Master at 7, Legendary at 19
        hitPointsPerLevel: 8,
        featProgression: {
            classFeats: [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
            generalFeats: [3, 7, 11, 15, 19],
            skillFeats: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
            skillIncreases: [3, 5, 7, 9, 11, 13, 15, 17, 19],
            ancestryFeats: [1, 5, 9, 13, 17],
        },
    },

    // INVENTOR
    // Light/Med/Unarmored: T at 1
    // Level 3: Expert Overdrive
    // Level 5: Inventor Weapon Expertise
    // Level 7: Weapon Specialization, Reflex Expertise, Master Overdrive
    // Level 9: Inventive Expertise, Offensive Boost
    // Level 11: Medium Armor Expertise
    // Level 13: Perception Expertise, Inventor Weapon Mastery
    // Level 15: Greater Weapon Specialization, Revolutionary Innovation, Legendary Overdrive
    // Level 17: Inventive Mastery, Anvil's Hardness
    // Level 19: Medium Armor Mastery, Infinite Invention
    '30qVs46dVNflgQNx': { // Inventor Foundry ID
        armorProficiencies: {
            light: fillArray(20, 1),
            medium: setFromLevel(setFromLevel(fillArray(20, 1), 10, 2), 18, 3), // Expert at 11, Master at 19
            heavy: fillArray(20, 0),
            unarmored: fillArray(20, 1),
        },
        weaponProficiencies: {
            simple: fillArray(20, 1),
            martial: fillArray(20, 1),
            unarmed: fillArray(20, 1),
        },
        savingThrows: {
            fortitude: fillArray(20, 2),                           // Expert at 1
            reflex: setFromLevel(fillArray(20, 1), 6, 2),         // Trained, Expert at 7
            will: fillArray(20, 2),                               // Expert at 1
        },
        perception: setFromLevel(fillArray(20, 1), 12, 2),        // Trained, Expert at 13
        hitPointsPerLevel: 8,
        featProgression: {
            classFeats: [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
            generalFeats: [3, 7, 11, 15, 19],
            skillFeats: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
            skillIncreases: [3, 5, 7, 9, 11, 13, 15, 17, 19],
            ancestryFeats: [1, 5, 9, 13, 17],
        },
    },

    // PSYCHIC
    // Unarmored: T at 1
    // Level 5: Precognitive Reflexes (Ref Expert), Clarity of Focus
    // Level 7: Expert Spellcaster
    // Level 9: Great Fortitude (Fort Expert)
    // Level 11: Extrasensory Perception (Per Expert), Weapon Expertise
    // Level 13: Psychic Weapon Specialization, Personal Barrier
    // Level 15: Master Spellcaster
    // Level 17: Fortress of Will (Will Master)
    // Level 19: Legendary Spellcaster, Infinite Mind
    'Inq4gH3P5PYjSQbD': { // Psychic Foundry ID
        armorProficiencies: {
            light: fillArray(20, 0),
            medium: fillArray(20, 0),
            heavy: fillArray(20, 0),
            unarmored: fillArray(20, 1),
        },
        weaponProficiencies: {
            simple: fillArray(20, 1),
            martial: fillArray(20, 0),
            unarmed: fillArray(20, 1),
        },
        savingThrows: {
            fortitude: setFromLevel(fillArray(20, 1), 8, 2),        // Trained, Expert at 9
            reflex: setFromLevel(fillArray(20, 1), 4, 2),          // Trained, Expert at 5
            will: setFromLevel(setFromLevel(fillArray(20, 2), 16, 3), 0, 2), // Expert at 1, Master at 17
        },
        perception: setFromLevel(fillArray(20, 1), 10, 2),           // Trained, Expert at 11
        hitPointsPerLevel: 6,  // Lowest HP
        featProgression: {
            classFeats: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],  // No class feat at level 1
            generalFeats: [3, 7, 11, 15, 19],
            skillFeats: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
            skillIncreases: [3, 5, 7, 9, 11, 13, 15, 17, 19],
            ancestryFeats: [1, 5, 9, 13, 17],
        },
    },

    // SUMMONER
    // Unarmored: T at 1
    // Level 3: Shared Vigilance (Per Expert)
    // Level 5: Eidolon Unarmed Expertise
    // Level 7: Eidolon Weapon Specialization, Eidolon Symbiosis
    // Level 9: Expert Spellcaster, Shared Reflexes (Ref Expert)
    // Level 11: Simple Weapon Expertise, Eidolon Defensive Expertise, Twin Juggernauts (Fort Expert)
    // Level 13: Defensive Robes, Weapon Specialization, Eidolon Unarmed Mastery
    // Level 15: Greater Eidolon Specialization, Shared Resolve
    // Level 17: Master Spellcaster, Eidolon Transcendence (Fort/Ref Master)
    // Level 19: Eidolon Defensive Mastery, Instant Manifestation
    'YtOm245r8GFSFYeD': { // Summoner Foundry ID
        armorProficiencies: {
            light: fillArray(20, 0),
            medium: fillArray(20, 0),
            heavy: fillArray(20, 0),
            unarmored: fillArray(20, 1),
        },
        weaponProficiencies: {
            simple: fillArray(20, 1),
            martial: fillArray(20, 0),
            unarmed: fillArray(20, 1),
        },
        savingThrows: {
            fortitude: setFromLevel(setFromLevel(fillArray(20, 2), 0, 2), 14, 3), // Expert at 1, Master at 15
            reflex: setFromLevel(setFromLevel(fillArray(20, 1), 8, 2), 16, 3),    // Trained, Expert at 9, Master at 17
            will: setFromLevel(fillArray(20, 2), 0, 2),           // Expert at 1
        },
        perception: setFromLevel(fillArray(20, 1), 2, 2),           // Trained, Expert at 3
        hitPointsPerLevel: 10,
        featProgression: {
            classFeats: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],  // No class feat at level 1
            generalFeats: [3, 7, 11, 15, 19],
            skillFeats: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
            skillIncreases: [3, 5, 7, 9, 11, 13, 15, 17, 19],
            ancestryFeats: [1, 5, 9, 13, 17],
        },
    },

    // THAUMATURGE
    // Light/Med/Unarmored: T at 1
    // Level 3: Lightning Reflexes (Ref Expert)
    // Level 5: Thaumaturge Weapon Expertise, Second Implement
    // Level 7: Weapon Specialization, Resolve, Implement Adept
    // Level 9: Intensify Vulnerability, Thaumaturgic Expertise (Fort/Ref/Will Expert), Vigilant Senses (Per Master)
    // Level 11: Medium Armor Expertise, Second Adept
    // Level 13: Weapon Mastery, Greater Resolve
    // Level 15: Juggernaut (Fort Master), Third Implement, Greater Weapon Specialization
    // Level 17: Thaumaturgic Mastery (Will Master), Implement Paragon
    // Level 19: Medium Armor Mastery, Unlimited Esoterica
    'Y5GsHqzCzJlKka6x': { // Thaumaturge Foundry ID
        armorProficiencies: {
            light: fillArray(20, 1),
            medium: setFromLevel(setFromLevel(fillArray(20, 1), 12, 2), 18, 3), // Expert at 13, Master at 19
            heavy: fillArray(20, 0),
            unarmored: fillArray(20, 1),
        },
        weaponProficiencies: {
            simple: fillArray(20, 1),
            martial: fillArray(20, 1),
            unarmed: fillArray(20, 1),
        },
        savingThrows: {
            fortitude: setFromLevel(setFromLevel(fillArray(20, 2), 0, 2), 14, 3), // Expert at 1, Master at 15
            reflex: setFromLevel(fillArray(20, 1), 2, 2),          // Trained, Expert at 3
            will: setFromLevel(setFromLevel(fillArray(20, 2), 0, 2), 16, 3),    // Expert at 1, Master at 17
        },
        perception: setFromLevel(setFromLevel(fillArray(20, 2), 8, 3), 0, 2), // Expert at 1, Master at 9
        hitPointsPerLevel: 8,
        featProgression: {
            classFeats: [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
            generalFeats: [3, 7, 11, 15, 19],
            skillFeats: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
            skillIncreases: [3, 5, 7, 9, 11, 13, 15, 17, 19],
            ancestryFeats: [1, 5, 9, 13, 17],
        },
    },

    // WITCH
    // Unarmored: T at 1
    // Level 5: Magical Fortitude (Fort Expert)
    // Level 7: Expert Spellcaster
    // Level 9: Reflex Expertise
    // Level 11: Perception Expertise, Defensive Robes
    // Level 13: Weapon Specialization
    // Level 15: Master Spellcaster
    // Level 17: Will of the Pupil (Will Master)
    // Level 19: Legendary Spellcaster, Patron's Gift
    'bYDXk9HUMKOuym9h': { // Witch Foundry ID
        armorProficiencies: {
            light: fillArray(20, 0),
            medium: fillArray(20, 0),
            heavy: fillArray(20, 0),
            unarmored: fillArray(20, 1),
        },
        weaponProficiencies: {
            simple: fillArray(20, 1),
            martial: fillArray(20, 0),
            unarmed: fillArray(20, 1),
        },
        savingThrows: {
            fortitude: setFromLevel(fillArray(20, 1), 4, 2),        // Trained, Expert at 5
            reflex: setFromLevel(fillArray(20, 1), 8, 2),          // Trained, Expert at 9
            will: setFromLevel(setFromLevel(fillArray(20, 2), 16, 3), 0, 2), // Expert at 1, Master at 17
        },
        perception: setFromLevel(fillArray(20, 1), 10, 2),           // Trained, Expert at 11
        hitPointsPerLevel: 6,  // Lowest HP
        featProgression: {
            classFeats: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],  // No class feat at level 1
            generalFeats: [3, 7, 11, 15, 19],
            skillFeats: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
            skillIncreases: [3, 5, 7, 9, 11, 13, 15, 17, 19],
            ancestryFeats: [1, 5, 9, 13, 17],
        },
    },
};

/**
 * Mapping of Foundry IDs to class names for lookup
 */
export const foundryIdToClassName: Record<string, string> = {
    'XwfcJuskrhI9GIjX': 'alchemist',
    '9KiqZVG9r5g8mC4V': 'animist',
    'YDRiP7uVvr9WRhOI': 'barbarian',
    '3gweRQ5gn7szIWAv': 'bard',
    'x8iwnpdLbfcoZkHA': 'champion',
    'EizrWvUPMS67Pahd': 'cleric',
    '7s57JDCaiYYCAdFx': 'druid',
    'Oyee5Ds9uwYLEkD0': 'commander',
    '1L7geK3aoosye3Xj': 'guardian',
    'Z9li154CPNmun29Q': 'gunslinger',
    '30qVs46dVNflgQNx': 'inventor',
    '4wrSCyX6akmyo7Wj': 'investigator',
    'RggQN3bX5SEcsffR': 'kineticist',
    'HQBA9Yx2s8ycvz3C': 'magus',
    'YPxpk9JbMnKjbNLc': 'monk',
    'pWHx4SXcft9O2udP': 'oracle',
    'Inq4gH3P5PYjSQbD': 'psychic',
    'Yix76sfxrIlltSTJ': 'ranger',
    'LO9STvskJemPkiAI': 'rogue',
    '15Yc1r6s9CEhSTMe': 'sorcerer',
    'YtOm245r8GFSFYeD': 'summoner',
    'uJ5aCzlw34GGdWjp': 'swashbuckler',
    'Y5GsHqzCzJlKka6x': 'thaumaturge',
    'bYDXk9HUMKOuym9h': 'witch',
    '8zn3cD6GSmoo1LW4': 'fighter',
    'RwjIZzIxzPpUglnK': 'wizard',
};

/**
 * Get class progression by class ID (Foundry ID) or class name
 * Falls back to default progression if class not found
 */
export function getClassProgression(classId: string): ClassProgression {
    // Direct lookup by Foundry ID
    if (classProgressions[classId]) {
        return classProgressions[classId];
    }

    // Lookup by class name mapping
    const className = foundryIdToClassName[classId];
    if (className && classProgressions[className]) {
        return classProgressions[className];
    }

    // Try direct lowercase lookup
    const lowerKey = classId.toLowerCase();
    if (classProgressions[lowerKey]) {
        return classProgressions[lowerKey];
    }

    return {
        armorProficiencies: defaultArmorProgression,
        weaponProficiencies: defaultWeaponProgression,
    };
}

/**
 * Get armor proficiency at a specific level for a class
 * @param classId Class ID
 * @param category Armor category (light, medium, heavy, unarmored)
 * @param level Character level (1-20)
 * @returns Proficiency level (0-4)
 */
export function getArmorProficiencyAtLevel(
    classId: string,
    category: 'light' | 'medium' | 'heavy' | 'unarmored',
    level: number
): ProficiencyLevel {
    const progression = getClassProgression(classId);
    const levelIndex = Math.max(0, Math.min(19, level - 1));
    return progression.armorProficiencies[category][levelIndex];
}

/**
 * Get weapon proficiency at a specific level for a class
 * @param classId Class ID
 * @param category Weapon category (simple, martial, unarmed)
 * @param level Character level (1-20)
 * @returns Proficiency level (0-4)
 */
export function getWeaponProficiencyAtLevel(
    classId: string,
    category: 'simple' | 'martial' | 'unarmed' | 'advanced',
    level: number
): ProficiencyLevel {
    const progression = getClassProgression(classId);
    const levelIndex = Math.max(0, Math.min(19, level - 1));
    // advanced is optional - return 0 (untrained) if not defined
    return progression.weaponProficiencies[category]?.[levelIndex] ?? 0;
}

/**
 * Convert proficiency level number to proficiency name
 */
export function proficiencyLevelToName(level: ProficiencyLevel): 'untrained' | 'trained' | 'expert' | 'master' | 'legendary' {
    const names: ('untrained' | 'trained' | 'expert' | 'master' | 'legendary')[] =
        ['untrained', 'trained', 'expert', 'master', 'legendary'];
    return names[level];
}

/**
 * Get saving throw proficiency at a specific level for a class
 * @param classId Class ID
 * @param save Saving throw type (fortitude, reflex, will)
 * @param level Character level (1-20)
 * @returns Proficiency level (0-4)
 */
export function getSavingThrowAtLevel(
    classId: string,
    save: 'fortitude' | 'reflex' | 'will',
    level: number
): ProficiencyLevel {
    const progression = getClassProgression(classId);
    const levelIndex = Math.max(0, Math.min(19, level - 1));
    return progression.savingThrows?.[save]?.[levelIndex] ?? 1; // Default to trained
}

/**
 * Get perception proficiency at a specific level for a class
 * @param classId Class ID
 * @param level Character level (1-20)
 * @returns Proficiency level (0-4)
 */
export function getPerceptionAtLevel(classId: string, level: number): ProficiencyLevel {
    const progression = getClassProgression(classId);
    const levelIndex = Math.max(0, Math.min(19, level - 1));
    return progression.perception?.[levelIndex] ?? 1; // Default to trained
}

/**
 * Get hit points per level for a class
 * @param classId Class ID
 * @returns HP per level (usually 6-12)
 */
export function getHitPointsPerLevel(classId: string): number {
    const progression = getClassProgression(classId);
    return progression.hitPointsPerLevel ?? 8; // Default to 8 HP
}

/**
 * Check if a class gains a feat type at a specific level
 * @param classId Class ID
 * @param featType Type of feat (classFeats, generalFeats, skillFeats, skillIncreases, ancestryFeats)
 * @param level Character level (1-20)
 * @returns True if the class gains this feat at this level
 */
export function hasFeatAtLevel(
    classId: string,
    featType: 'classFeats' | 'generalFeats' | 'skillFeats' | 'skillIncreases' | 'ancestryFeats',
    level: number
): boolean {
    const progression = getClassProgression(classId);
    const levels = progression.featProgression?.[featType];
    return levels ? levels.includes(level) : false;
}

/**
 * Get all feat levels for a specific feat type
 * @param classId Class ID
 * @param featType Type of feat (classFeats, generalFeats, skillFeats, skillIncreases, ancestryFeats)
 * @returns Array of levels where this feat is gained
 */
export function getFeatLevels(
    classId: string,
    featType: 'classFeats' | 'generalFeats' | 'skillFeats' | 'skillIncreases' | 'ancestryFeats'
): number[] {
    const progression = getClassProgression(classId);
    return progression.featProgression?.[featType] ?? [];
}
