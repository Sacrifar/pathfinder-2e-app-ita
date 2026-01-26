/**
 * Class Metadata Index
 *
 * This file provides automatic mapping between class names and Foundry IDs,
 * eliminating the need for hardcoded IDs throughout the codebase.
 *
 * The mapping is automatically generated from the loaded class data,
 * making it resilient to changes in Foundry IDs or class additions.
 */

import { getClasses } from './pf2e-loader';

/**
 * Class metadata with both ID and normalized name
 */
export interface ClassMetadata {
    id: string;           // Foundry UUID
    name: string;         // Display name (e.g., "Bard")
    normalizedName: string; // Lowercase, no spaces (e.g., "bard")
}

/**
 * Cached mappings for performance
 */
let classMetadataCache: ClassMetadata[] | null = null;
let nameToIdMap: Map<string, string> | null = null;
let idToNameMap: Map<string, string> | null = null;

/**
 * Initialize metadata cache from loaded class data
 */
function initializeCache(): void {
    if (classMetadataCache !== null) return;

    const classes = getClasses();
    classMetadataCache = classes.map(cls => ({
        id: cls.id,
        name: cls.name,
        normalizedName: cls.name.toLowerCase().replace(/\s+/g, ''),
    }));

    nameToIdMap = new Map(
        classMetadataCache.map(m => [m.normalizedName, m.id])
    );

    idToNameMap = new Map(
        classMetadataCache.map(m => [m.id, m.name])
    );
}

/**
 * Get all class metadata
 */
export function getAllClassMetadata(): ClassMetadata[] {
    initializeCache();
    return classMetadataCache!;
}

/**
 * Get Foundry ID from class name
 * @param className - Display name (e.g., "Bard") or normalized (e.g., "bard")
 * @returns Foundry ID or undefined if not found
 */
export function getClassIdByName(className: string): string | undefined {
    initializeCache();
    const normalized = className.toLowerCase().replace(/\s+/g, '');
    return nameToIdMap!.get(normalized);
}

/**
 * Get class name from Foundry ID
 * @param classId - Foundry UUID
 * @returns Display name or undefined if not found
 */
export function getClassNameById(classId: string): string | undefined {
    initializeCache();
    return idToNameMap!.get(classId);
}

/**
 * Validate that a class ID exists in the loaded data
 * @param classId - Foundry UUID to validate
 * @returns true if the ID exists, false otherwise
 */
export function isValidClassId(classId: string): boolean {
    initializeCache();
    return idToNameMap!.has(classId);
}

/**
 * Validate that a class name exists in the loaded data
 * @param className - Class name to validate (case-insensitive)
 * @returns true if the name exists, false otherwise
 */
export function isValidClassName(className: string): boolean {
    initializeCache();
    const normalized = className.toLowerCase().replace(/\s+/g, '');
    return nameToIdMap!.has(normalized);
}

/**
 * Get class metadata by name
 * @param className - Display name or normalized name
 * @returns ClassMetadata or undefined if not found
 */
export function getClassMetadataByName(className: string): ClassMetadata | undefined {
    initializeCache();
    const normalized = className.toLowerCase().replace(/\s+/g, '');
    return classMetadataCache!.find(m => m.normalizedName === normalized);
}

/**
 * Get class metadata by ID
 * @param classId - Foundry UUID
 * @returns ClassMetadata or undefined if not found
 */
export function getClassMetadataById(classId: string): ClassMetadata | undefined {
    initializeCache();
    return classMetadataCache!.find(m => m.id === classId);
}

/**
 * Clear the metadata cache (useful for testing or hot-reloading)
 */
export function clearMetadataCache(): void {
    classMetadataCache = null;
    nameToIdMap = null;
    idToNameMap = null;
}

/**
 * Standard feat progression (most classes follow this pattern)
 */
export const STANDARD_FEAT_PROGRESSION = {
    classFeats: [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
    generalFeats: [3, 7, 11, 15, 19],
    skillFeats: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
    skillIncreases: [3, 5, 7, 9, 11, 13, 15, 17, 19],
    ancestryFeats: [1, 5, 9, 13, 17],
} as const;

/**
 * Proficiency level type (matches classProgressions.ts)
 */
export type ProficiencyLevel = 0 | 1 | 2 | 3 | 4;

/**
 * Proficiency progression helper - creates an array filled with a value
 */
export const fillArray = (length: number, value: ProficiencyLevel): ProficiencyLevel[] =>
    Array(length).fill(value) as ProficiencyLevel[];

/**
 * Proficiency progression helper - sets proficiency from a level onward
 */
export const setFromLevel = (array: ProficiencyLevel[], level: number, value: ProficiencyLevel): ProficiencyLevel[] => {
    const result = [...array];
    for (let i = level; i < result.length; i++) {
        result[i] = value;
    }
    return result;
};
