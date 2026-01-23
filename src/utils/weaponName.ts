/**
 * Enhanced Weapon Name Generator
 * Generates descriptive weapon names including runes and materials
 */

import { EquippedItem, WeaponRunes, WeaponCustomization } from '../types';
import { FUNDAMENTAL_RUNES, PROPERTY_RUNES } from '../data/weaponRunes';
import { ALL_MATERIALS } from '../data/weaponMaterials';

/**
 * Material grade levels for enhanced naming
 */
export type MaterialGrade = 'standard' | 'high' | 'superior';

const MATERIAL_GRADE_SUFFIX: Record<MaterialGrade, string> = {
    standard: '',
    high: ' (High Grade)',
    superior: ' (Superior Grade)',
};

/**
 * Get the localized striking rune name
 */
function getStrikingRuneName(strikingRune: string | undefined, language: string = 'en'): string {
    if (!strikingRune) return '';

    const strikingData = FUNDAMENTAL_RUNES.striking.find(s => s.value === strikingRune);
    if (!strikingData) return '';

    const name = language === 'it' ? strikingData.nameIt : strikingData.name;

    // Format as "Striking (Greater)" or "Striking (Major)"
    if (strikingRune === 'greaterStriking') {
        return language === 'it' ? 'Colpitore (Maggiore)' : 'Striking (Greater)';
    } else if (strikingRune === 'majorStriking') {
        return language === 'it' ? 'Colpitore (Supremo)' : 'Striking (Major)';
    }

    return name;
}

/**
 * Get the localized material name with optional grade
 */
function getMaterialName(
    materialId: string | undefined,
    grade: MaterialGrade = 'standard',
    language: string = 'en'
): string {
    if (!materialId || materialId === 'none') return '';

    const material = ALL_MATERIALS[materialId];
    if (!material) return '';

    const baseName = language === 'it' ? (material.nameIt || material.name) : material.name;
    const gradeSuffix = MATERIAL_GRADE_SUFFIX[grade];

    return baseName + gradeSuffix;
}

/**
 * Generate an enhanced weapon name with runes and materials
 *
 * Format: +3 Striking (Greater) Corrosive Astral Keen Cold Iron (High Grade) Rapier
 *
 * @param baseName - The base weapon name (e.g., "Rapier")
 * @param runes - Weapon runes configuration
 * @param customization - Weapon customization (material, etc.)
 * @param options - Additional options
 * @returns Enhanced weapon name
 */
export interface GetEnhancedWeaponNameOptions {
    language?: 'en' | 'it';
    materialGrade?: MaterialGrade;
    customRuneNames?: string[]; // For custom/additional runes not in the standard list
}

export function getEnhancedWeaponName(
    baseName: string,
    runes?: WeaponRunes | null,
    customization?: WeaponCustomization | null,
    options: GetEnhancedWeaponNameOptions = {}
): string {
    const { language = 'en', materialGrade = 'standard', customRuneNames = [] } = options;

    const parts: string[] = [];

    // 1. Add Potency Rune (e.g., "+3")
    if (runes?.potencyRune && runes.potencyRune > 0) {
        parts.push(`+${runes.potencyRune}`);
    }

    // 2. Add Striking Rune (e.g., "Striking (Greater)")
    const strikingName = getStrikingRuneName(runes?.strikingRune, language);
    if (strikingName) {
        parts.push(strikingName);
    }

    // 3. Add Property Runes (e.g., "Corrosive", "Keen", "Frost")
    if (runes?.propertyRunes && runes.propertyRunes.length > 0) {
        for (const runeId of runes.propertyRunes) {
            const rune = PROPERTY_RUNES[runeId];
            if (rune) {
                const runeName = language === 'it' ? (rune.nameIt || rune.name) : rune.name;
                parts.push(runeName);
            }
        }
    }

    // 4. Add Custom Rune Names (for runes not in the standard list)
    for (const customRune of customRuneNames) {
        parts.push(customRune);
    }

    // 5. Add Material with Grade (e.g., "Cold Iron (High Grade)")
    const materialName = getMaterialName(customization?.material, materialGrade, language);
    if (materialName) {
        parts.push(materialName);
    }

    // 6. Finally, add the base weapon name
    parts.push(baseName);

    // Join all parts with spaces
    return parts.join(' ');
}

/**
 * Convenience function to get the enhanced name from an EquippedItem
 */
export function getEquippedWeaponDisplayName(
    equippedItem: EquippedItem,
    baseWeaponName: string,
    options: GetEnhancedWeaponNameOptions = {}
): string {
    // Check for custom name first
    const customization = equippedItem.customization as any;
    if (customization?.customName) {
        return customization.customName;
    }

    const runes = equippedItem.runes as WeaponRunes | undefined;
    return getEnhancedWeaponName(baseWeaponName, runes, customization, options);
}

/**
 * Parse an enhanced weapon name back into its components
 * Useful for importing/exporting weapon configurations
 */
export interface ParsedWeaponName {
    potencyRune?: number;
    strikingRune?: string;
    propertyRunes?: string[];
    material?: string;
    materialGrade?: MaterialGrade;
    baseName: string;
}

export function parseEnhancedWeaponName(enhancedName: string): ParsedWeaponName | null {
    // This is a simplified parser - a full implementation would need more sophisticated logic
    // For now, return null to indicate this feature is not fully implemented
    // TODO: Implement full parsing logic if needed for import/export
    return null;
}
