/**
 * Class Specialization Rules
 *
 * This file contains rules for when specializations are available based on level
 * and other conditions. This moves class-specific logic out of components and
 * into the data layer for better maintainability.
 *
 * Previously, this logic was hardcoded in ClassSpecializationBrowser.tsx and
 * DesktopCharacterLayout.tsx with magic numbers like [5, 9, 13, 17].
 */

import { getClassIdByName } from './classMetadata';

/**
 * Specialization availability rule
 */
export interface SpecializationAvailabilityRule {
    specializationTypeId: string;  // ID of the specialization type (e.g., 'kineticist_gates_threshold')
    availableAtLevels?: readonly number[];  // Only available at these specific levels
    unavailableAtLevels?: readonly number[]; // Not available at these specific levels
    minLevel?: number;              // Minimum level required
    maxLevel?: number;              // Maximum level allowed
}

/**
 * Class-specific specialization rules
 */
export interface ClassSpecializationRules {
    className: string;
    rules: SpecializationAvailabilityRule[];
}

/**
 * Kineticist gates threshold levels
 * At levels 5, 9, 13, 17: Must choose Gate's Threshold (junction)
 * At other levels: Choose Single Gate or Dual Gate
 *
 * Exported for use in components that need to check for junction levels
 */
export const KINETICIST_GATES_THRESHOLD_LEVELS: readonly number[] = [5, 9, 13, 17];

/**
 * All class specialization rules
 */
export const CLASS_SPECIALIZATION_RULES: ClassSpecializationRules[] = [
    {
        className: 'Kineticist',
        rules: [
            {
                specializationTypeId: 'kineticist_gates_threshold',
                availableAtLevels: KINETICIST_GATES_THRESHOLD_LEVELS,
            },
            {
                specializationTypeId: 'kineticist_single_gate',
                unavailableAtLevels: KINETICIST_GATES_THRESHOLD_LEVELS,
            },
            {
                specializationTypeId: 'kineticist_dual_gate',
                unavailableAtLevels: KINETICIST_GATES_THRESHOLD_LEVELS,
            },
        ],
    },
    // TODO: Add rules for other classes with level-specific specializations
    // For example:
    // - Wizard schools that become available at certain levels
    // - Oracle mysteries with level restrictions
    // - etc.
];

/**
 * Check if a specialization type is available at a given level
 * @param className - Name of the class (e.g., 'Kineticist')
 * @param specializationTypeId - ID of the specialization type
 * @param level - Character level
 * @returns true if the specialization is available, false otherwise
 */
export function isSpecializationAvailable(
    className: string,
    specializationTypeId: string,
    level: number
): boolean {
    // Find rules for this class
    const classRules = CLASS_SPECIALIZATION_RULES.find(r => r.className === className);
    if (!classRules) {
        // No rules defined = always available
        return true;
    }

    // Find rule for this specialization type
    const rule = classRules.rules.find(r => r.specializationTypeId === specializationTypeId);
    if (!rule) {
        // No rule for this specialization = always available
        return true;
    }

    // Check availableAtLevels (whitelist)
    if (rule.availableAtLevels && !rule.availableAtLevels.includes(level)) {
        return false;
    }

    // Check unavailableAtLevels (blacklist)
    if (rule.unavailableAtLevels && rule.unavailableAtLevels.includes(level)) {
        return false;
    }

    // Check minLevel
    if (rule.minLevel !== undefined && level < rule.minLevel) {
        return false;
    }

    // Check maxLevel
    if (rule.maxLevel !== undefined && level > rule.maxLevel) {
        return false;
    }

    return true;
}

/**
 * Check if a specialization type is available using class ID
 * @param classId - Foundry class ID
 * @param specializationTypeId - ID of the specialization type
 * @param level - Character level
 * @returns true if the specialization is available, false otherwise
 */
export function isSpecializationAvailableById(
    classId: string,
    specializationTypeId: string,
    level: number
): boolean {
    // Convert all class names to IDs for comparison
    const classNameToIdMap = new Map<string, string>();
    for (const rules of CLASS_SPECIALIZATION_RULES) {
        const id = getClassIdByName(rules.className);
        if (id) {
            classNameToIdMap.set(id, rules.className);
        }
    }

    const className = classNameToIdMap.get(classId);
    if (!className) {
        // No rules for this class = always available
        return true;
    }

    return isSpecializationAvailable(className, specializationTypeId, level);
}

/**
 * Get all specialization rules for a class
 * @param className - Name of the class
 * @returns Array of rules or empty array if no rules defined
 */
export function getSpecializationRulesForClass(
    className: string
): SpecializationAvailabilityRule[] {
    const classRules = CLASS_SPECIALIZATION_RULES.find(r => r.className === className);
    return classRules?.rules || [];
}

/**
 * Get all specialization rules for a class by ID
 * @param classId - Foundry class ID
 * @returns Array of rules or empty array if no rules defined
 */
export function getSpecializationRulesForClassById(
    classId: string
): SpecializationAvailabilityRule[] {
    // Convert all class names to IDs for comparison
    const classNameToIdMap = new Map<string, string>();
    for (const rules of CLASS_SPECIALIZATION_RULES) {
        const id = getClassIdByName(rules.className);
        if (id) {
            classNameToIdMap.set(id, rules.className);
        }
    }

    const className = classNameToIdMap.get(classId);
    if (!className) {
        return [];
    }

    return getSpecializationRulesForClass(className);
}

/**
 * Filter specialization types based on level availability
 * @param specializationTypes - Array of specialization types
 * @param classId - Foundry class ID
 * @param level - Character level
 * @returns Filtered specialization types with unavailable ones having empty options
 */
export function filterSpecializationsByLevel<T extends { id: string; options: unknown[] }>(
    specializationTypes: T[],
    classId: string,
    level: number
): T[] {
    return specializationTypes.map(type => {
        const available = isSpecializationAvailableById(classId, type.id, level);
        if (!available) {
            return { ...type, options: [] };
        }
        return type;
    });
}
