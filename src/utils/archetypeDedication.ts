/**
 * Archetype Dedication Constraint Utilities
 * Handles the Pathfinder 2e rule: After taking an Archetype Dedication feat,
 * you must take 2 feats from that archetype before taking another dedication.
 */

import { Character, CharacterFeat } from '../types';
import { getFeats, LoadedFeat } from '../data/pf2e-loader';

// Cache for the UUID to name-based ID mapping
let uuidToNameIdMap: Record<string, string> | null = null;

/**
 * Build a mapping from old UUID-based IDs to new name-based IDs
 * This is used for migrating characters that have feats stored with UUID IDs
 */
function buildUuidToNameIdMap(): Record<string, string> {
    if (uuidToNameIdMap) {
        return uuidToNameIdMap;
    }

    const map: Record<string, string> = {};
    const allFeats = getFeats();

    // Also need to load the raw feat data to get UUIDs
    // We'll use the feat modules to build this map
    // @ts-ignore - Vite glob import
    const featModules = import.meta.glob<{ default: unknown }>(
        '../data/pf2e/feats/**/*.json',
        { eager: true }
    );

    for (const path in featModules) {
        if (path.includes('_folders.json')) continue;

        const module = featModules[path];
        const raw = (module as { default?: { _id: string; name: string; type: string } }).default || module;

        if (raw && raw.type === 'feat' && raw.name && raw._id) {
            // Generate the name-based ID the same way transformFeat does
            const nameId = raw.name.toLowerCase().replace(/\s+/g, '-');
            map[raw._id] = nameId;
        }
    }

    uuidToNameIdMap = map;
    return map;
}

/**
 * Migrate a character's feat IDs from old UUID-based format to new name-based format
 * This ensures that feats stored with old UUID IDs can still be displayed correctly
 */
export function migrateFeatIds(character: Character): Character {
    const updated = { ...character };

    if (!updated.feats || updated.feats.length === 0) {
        return updated;
    }

    const uuidMap = buildUuidToNameIdMap();
    let hasMigrated = false;

    // Migrate all feat IDs in the character's feat list
    const migratedFeats = updated.feats.map(feat => {
        // If this feat ID is in the UUID map, replace it with the name-based ID
        if (uuidMap[feat.featId]) {
            hasMigrated = true;
            return {
                ...feat,
                featId: uuidMap[feat.featId]
            };
        }
        return feat;
    });

    if (hasMigrated) {
        updated.feats = migratedFeats;
    }

    return updated;
}

export interface ArchetypeDedicationInfo {
    archetypeName: string;
    dedicationLevel: number;
    featsCount: number;
    remainingFeatsNeeded: number;
}

/**
 * Check if a feat is an Archetype Dedication feat
 */
export function isArchetypeDedication(feat: LoadedFeat): boolean {
    return feat.name.toLowerCase().includes('dedication') &&
        feat.traits.some(t => t.toLowerCase() === 'archetype');
}

/**
 * Extract the archetype name from a dedication feat name
 * e.g., "Bastion Dedication" -> "bastion"
 */
export function getArchetypeNameFromDedication(featName: string): string {
    return featName.toLowerCase().replace('dedication', '').trim();
}

/**
 * Check if a feat belongs to a specific archetype
 * This checks if the feat has the archetype's name as a trait,
 * or if the feat name starts with the archetype name,
 * or if the feat has the archetype's dedication as a prerequisite
 */
export function isFeatOfArchetype(feat: LoadedFeat, archetypeName: string): boolean {
    const archNameLower = archetypeName.toLowerCase().trim();
    const featTraits = feat.traits.map(t => t.toLowerCase());

    // Check if feat has the archetype name as a trait
    if (featTraits.includes(archNameLower)) {
        return true;
    }

    // Also check if the feat name starts with the archetype name
    // (some archetype feats may not have the archetype as a trait)
    const featNameLower = feat.name.toLowerCase();
    if (featNameLower.startsWith(archNameLower)) {
        return true;
    }

    // Check if the feat has the archetype's dedication as a prerequisite
    // (e.g., "Herbalist Dedication" for herbalist archetype feats)
    const dedicationName = `${archNameLower} dedication`;
    const hasDedicationPrereq = feat.prerequisites.some(prereq => {
        const prereqLower = prereq.toLowerCase();
        return prereqLower.includes(dedicationName);
    });

    if (hasDedicationPrereq) {
        return true;
    }

    return false;
}

/**
 * Get active archetype dedication constraint for a character
 * Returns the dedication that is currently constraining feat selection,
 * or null if no constraint is active
 */
export function getActiveDedicationConstraint(character: Character): ArchetypeDedicationInfo | null {
    if (!character.archetypeDedications) {
        return null;
    }

    // Find the most recent dedication that hasn't been satisfied
    for (const [archName, info] of Object.entries(character.archetypeDedications)) {
        const featsNeeded = 2; // PF2e rule: need 2 feats after dedication
        const remaining = Math.max(0, featsNeeded - info.featsCount + 1); // +1 because dedication counts

        if (remaining > 0) {
            return {
                archetypeName: archName,
                dedicationLevel: info.dedicationLevel,
                featsCount: info.featsCount,
                remainingFeatsNeeded: remaining,
            };
        }
    }

    return null;
}

/**
 * Update archetype dedication tracking when a feat is added
 */
export function updateDedicationTrackingOnAdd(
    character: Character,
    newFeat: LoadedFeat,
    featLevel: number
): Character {
    const updated = { ...character };

    if (!updated.archetypeDedications) {
        updated.archetypeDedications = {};
    }

    // If this is a dedication feat, add new tracking entry
    if (isArchetypeDedication(newFeat)) {
        const archName = getArchetypeNameFromDedication(newFeat.name);
        updated.archetypeDedications[archName] = {
            dedicationLevel: featLevel,
            featsCount: 1, // Dedication itself counts as first feat
        };
    } else {
        // Check if this feat belongs to any tracked archetype
        for (const [archName, info] of Object.entries(updated.archetypeDedications)) {
            if (isFeatOfArchetype(newFeat, archName)) {
                updated.archetypeDedications[archName] = {
                    ...info,
                    featsCount: info.featsCount + 1,
                };
                break;
            }
        }
    }

    return updated;
}

/**
 * Update archetype dedication tracking when a feat is removed
 */
export function updateDedicationTrackingOnRemove(
    character: Character,
    removedFeatId: string
): Character {
    const updated = { ...character };

    if (!updated.archetypeDedications) {
        return updated;
    }

    const allFeats = getFeats();
    const removedFeat = allFeats.find(f => f.id === removedFeatId);

    if (!removedFeat) {
        return updated;
    }

    // If removing a dedication, remove the entire tracking entry
    if (isArchetypeDedication(removedFeat)) {
        const archName = getArchetypeNameFromDedication(removedFeat.name);
        delete updated.archetypeDedications[archName];
    } else {
        // Check if this feat belongs to any tracked archetype
        for (const [archName, info] of Object.entries(updated.archetypeDedications)) {
            if (isFeatOfArchetype(removedFeat, archName)) {
                updated.archetypeDedications[archName] = {
                    ...info,
                    featsCount: Math.max(0, info.featsCount - 1),
                };
                break;
            }
        }
    }

    return updated;
}

/**
 * Remove an archetype dedication and ALL its associated feats
 * This is used when completely removing a dedication from the character
 */
export function removeDedicationAndArchetypeFeats(
    character: Character,
    dedicationFeatId: string
): { character: Character; removedFeatIds: string[] } {
    const allFeats = getFeats();
    const dedicationFeat = allFeats.find(f => f.id === dedicationFeatId);

    if (!dedicationFeat || !isArchetypeDedication(dedicationFeat)) {
        return { character, removedFeatIds: [] };
    }

    const archName = getArchetypeNameFromDedication(dedicationFeat.name);
    const removedFeatIds: string[] = [dedicationFeatId];

    // Collect IDs of granted feats from the dedication
    const grantedFeatIds: string[] = [];
    if (dedicationFeat.rules && Array.isArray(dedicationFeat.rules)) {
        for (const rule of dedicationFeat.rules) {
            if (rule.key === 'GrantItem' && rule.uuid) {
                // Extract feat ID from UUID
                // UUID format: Compendium.pf2e.feats-srd.Item.Alchemical Crafting
                const grantedFeatName = rule.uuid.split('.').pop()?.replace(/Item\./, '').trim();
                if (grantedFeatName) {
                    const grantedFeatId = grantedFeatName.toLowerCase().replace(/\s+/g, '-');
                    grantedFeatIds.push(grantedFeatId);
                }
            }
        }
    }

    // Remove all feats from this archetype AND granted feats
    let updatedFeats = character.feats.filter(charFeat => {
        const feat = allFeats.find(f => f.id === charFeat.featId);
        if (!feat) return true;

        // Check if feat belongs to the archetype
        if (isFeatOfArchetype(feat, archName) || isArchetypeDedication(feat)) {
            removedFeatIds.push(charFeat.featId);
            return false; // Remove this feat
        }

        // Check if this feat was granted by the dedication (using grantedBy field OR GrantItem rules)
        if (charFeat.grantedBy === dedicationFeatId || grantedFeatIds.includes(charFeat.featId)) {
            removedFeatIds.push(charFeat.featId);
            return false; // Remove granted feat
        }

        return true; // Keep this feat
    });

    // Update character
    const updatedCharacter = {
        ...character,
        feats: updatedFeats,
        archetypeDedications: { ...character.archetypeDedications },
    };

    // Remove the archetype dedication tracking
    delete updatedCharacter.archetypeDedications![archName];

    return { character: updatedCharacter, removedFeatIds };
}

/**
 * Check if a character can select a specific feat based on dedication constraints
 */
export function canSelectFeatWithDedicationConstraint(
    character: Character,
    feat: LoadedFeat,
    featLevel: number
): { allowed: boolean; reason?: string } {
    const constraint = getActiveDedicationConstraint(character);

    // No active constraint - all feats allowed
    if (!constraint) {
        return { allowed: true };
    }

    // Check if this is a dedication feat
    if (isArchetypeDedication(feat)) {
        // Extract archetype name from this dedication
        const featArchName = getArchetypeNameFromDedication(feat.name);

        // Allow only if it's the SAME archetype as the active constraint
        // This lets you replace your current dedication with another from the same archetype
        if (featArchName === constraint.archetypeName) {
            return { allowed: true };
        }

        // Different dedication - not allowed while constrained
        return {
            allowed: false,
            reason: `Must take ${constraint.remainingFeatsNeeded} more ${constraint.archetypeName} feat(s) before selecting another dedication`
        };
    }

    // If feat belongs to the constrained archetype, allowed
    if (isFeatOfArchetype(feat, constraint.archetypeName)) {
        return { allowed: true };
    }

    // If feat is from a different archetype, not allowed
    if (feat.traits.some(t => t.toLowerCase() === 'archetype')) {
        return {
            allowed: false,
            reason: `Must take ${constraint.remainingFeatsNeeded} more ${constraint.archetypeName} feat(s) before feats from other archetypes`
        };
    }

    // Non-archetype feats are always allowed
    return { allowed: true };
}

/**
 * Recalculate archetype dedication tracking from character's feats
 * Useful for migration or fixing corrupted data
 */
export function recalculateDedicationTracking(character: Character): Character {
    const updated = { ...character };
    updated.archetypeDedications = {};

    if (!character.feats || character.feats.length === 0) {
        return updated;
    }

    const allFeats = getFeats();

    // Sort feats by level to process in order
    const sortedFeats = [...character.feats].sort((a, b) => a.level - b.level);

    for (const charFeat of sortedFeats) {
        const feat = allFeats.find(f => f.id === charFeat.featId);
        if (!feat) continue;

        if (isArchetypeDedication(feat)) {
            const archName = getArchetypeNameFromDedication(feat.name);
            if (!updated.archetypeDedications) {
                updated.archetypeDedications = {};
            }
            updated.archetypeDedications[archName] = {
                dedicationLevel: charFeat.level,
                featsCount: 1,
            };
        } else {
            // Check if feat belongs to any tracked archetype
            for (const [archName, info] of Object.entries(updated.archetypeDedications || {})) {
                if (isFeatOfArchetype(feat, archName)) {
                    updated.archetypeDedications![archName] = {
                        ...info,
                        featsCount: info.featsCount + 1,
                    };
                    break;
                }
            }
        }
    }

    return updated;
}
