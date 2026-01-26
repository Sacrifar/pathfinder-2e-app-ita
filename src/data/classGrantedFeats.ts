/**
 * Class-Granted Feats Database
 *
 * This file defines feats that are automatically granted to characters
 * based on their class specializations. These include:
 * - Bard Muse feats (granted at level 1 based on chosen muse)
 * - Other class specialization feats that are granted automatically
 *
 * Each entry defines:
 * - The class ID (Foundry ID)
 * - The specialization ID (e.g., muse_enigma)
 * - The feat ID that is granted
 * - The level at which it's granted (usually 1)
 */

import type { CharacterFeat } from '../types';

export interface ClassGrantedFeat {
    featId: string;        // The feat ID (generated from feat name in lowercase with hyphens)
    grantedAtLevel: number; // Level when this feat is granted
    source: CharacterFeat['source']; // Usually 'class'
    slotType: CharacterFeat['slotType']; // Usually 'class'
    lock?: boolean; // If true, this feat cannot be manually changed by the user
}

export interface ClassSpecializationGrantedFeats {
    classId: string;        // Foundry class ID
    grantedFeats: Record<string, ClassGrantedFeat[]>; // Map of specialization ID to granted feats
}

/**
 * Database of class specialization granted feats
 *
 * Maps class IDs and specialization IDs to their automatically granted feats
 */
export const CLASS_GRANTED_FEATS: ClassSpecializationGrantedFeats[] = [
    // BARD
    // Muse feats are granted at level 1 based on the chosen muse
    {
        classId: '3gweRQ5gn7szIWAv', // Bard Foundry ID
        grantedFeats: {
            // Enigma Muse → Bardic Lore feat
            'muse_enigma': [
                {
                    featId: 'bardic-lore',
                    grantedAtLevel: 1,
                    source: 'class',
                    slotType: 'class',
                    lock: true, // This feat cannot be manually changed
                },
            ],
            // Maestro Muse → Lingering Composition feat
            'muse_maestro': [
                {
                    featId: 'lingering-composition',
                    grantedAtLevel: 1,
                    source: 'class',
                    slotType: 'class',
                    lock: true, // This feat cannot be manually changed
                },
            ],
            // Polymath Muse → Versatile Performance feat
            'muse_polymath': [
                {
                    featId: 'versatile-performance',
                    grantedAtLevel: 1,
                    source: 'class',
                    slotType: 'class',
                    lock: true, // This feat cannot be manually changed
                },
            ],
            // Warrior Muse → Martial Performance feat
            'muse_warrior': [
                {
                    featId: 'martial-performance',
                    grantedAtLevel: 1,
                    source: 'class',
                    slotType: 'class',
                    lock: true, // This feat cannot be manually changed
                },
            ],
        },
    },

    // TODO: Add other classes with specialization-granted feats
    // For example:
    // - Sorcerer bloodline feats
    // - Barbarian instinct feats
    // - Ranger hunter's edge feats
    // - Rogue racket feats
    // etc.
];

/**
 * Get granted feats configuration by class ID and specialization ID
 */
export function getGrantedFeatsForSpecialization(
    classId: string,
    specializationId: string
): ClassGrantedFeat[] {
    const classData = CLASS_GRANTED_FEATS.find(c => c.classId === classId);
    if (!classData) return [];

    return classData.grantedFeats[specializationId] || [];
}

/**
 * Check if a class has any granted feats configured
 */
export function classHasGrantedFeats(classId: string): boolean {
    return CLASS_GRANTED_FEATS.some(c => c.classId === classId);
}

/**
 * Get all granted feat IDs for a class and specialization at a specific level
 * Returns feat IDs that should be granted at or below the given level
 */
export function getGrantedFeatIdsForLevel(
    classId: string,
    specializationId: string,
    level: number
): string[] {
    const allGrantedFeats = getGrantedFeatsForSpecialization(classId, specializationId);
    return allGrantedFeats
        .filter(feat => feat.grantedAtLevel <= level)
        .map(feat => feat.featId);
}

/**
 * Check if a specific feat is granted by a class specialization
 */
export function isFeatGrantedBySpecialization(
    classId: string,
    specializationId: string,
    featId: string
): boolean {
    const grantedFeatIds = getGrantedFeatIdsForLevel(classId, specializationId, 20);
    return grantedFeatIds.includes(featId);
}
