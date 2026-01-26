/**
 * Class Progressions Builder
 *
 * Provides a more maintainable way to define class progressions using class names
 * instead of hardcoded Foundry IDs. This builder automatically converts class names
 * to IDs using the classMetadata system.
 *
 * Usage:
 * ```typescript
 * const progressions = createClassProgressions({
 *   'Alchemist': {
 *     armorProficiencies: { ... },
 *     weaponProficiencies: { ... },
 *     // ...
 *   },
 *   // ... more classes
 * });
 * ```
 */

import { getClassIdByName } from './classMetadata';
import type { ClassProgression } from './classProgressions';

/**
 * Define class progressions using class names
 */
export type ClassProgressionsByName = Record<string, ClassProgression>;

/**
 * Convert class progressions from name-based keys to ID-based keys
 * @param progressionsByName - Progressions with class names as keys
 * @returns Progressions with Foundry IDs as keys
 */
export function convertProgressionsToIds(
    progressionsByName: ClassProgressionsByName
): Record<string, ClassProgression> {
    const result: Record<string, ClassProgression> = {};

    for (const [className, progression] of Object.entries(progressionsByName)) {
        const classId = getClassIdByName(className);

        if (!classId) {
            console.warn(
                `[ClassProgressionsBuilder] Class "${className}" not found in loaded data. Skipping progression.`
            );
            continue;
        }

        result[classId] = progression;
    }

    return result;
}

/**
 * Create class progressions using class names
 * This is the recommended way to define new class progressions
 *
 * @param progressions - Object with class names as keys
 * @returns Object with Foundry IDs as keys (compatible with existing system)
 */
export function createClassProgressions(
    progressions: ClassProgressionsByName
): Record<string, ClassProgression> {
    return convertProgressionsToIds(progressions);
}

/**
 * Validate that all defined progressions have valid class names
 * @param progressions - Progressions to validate
 * @returns List of invalid class names
 */
export function validateProgressionClassNames(
    progressions: ClassProgressionsByName
): string[] {
    const invalidNames: string[] = [];

    for (const className of Object.keys(progressions)) {
        const classId = getClassIdByName(className);
        if (!classId) {
            invalidNames.push(className);
        }
    }

    return invalidNames;
}

/**
 * Merge multiple progression definitions
 * Later definitions override earlier ones for the same class
 */
export function mergeClassProgressions(
    ...progressionSets: Record<string, ClassProgression>[]
): Record<string, ClassProgression> {
    return Object.assign({}, ...progressionSets);
}

/**
 * Get progression for a class by name or ID
 * @param progressions - Progressions map (ID-based)
 * @param classIdentifier - Class name or Foundry ID
 * @returns ClassProgression or undefined
 */
export function getProgression(
    progressions: Record<string, ClassProgression>,
    classIdentifier: string
): ClassProgression | undefined {
    // Try direct ID lookup first
    if (progressions[classIdentifier]) {
        return progressions[classIdentifier];
    }

    // Try converting name to ID
    const classId = getClassIdByName(classIdentifier);
    if (classId && progressions[classId]) {
        return progressions[classId];
    }

    return undefined;
}
