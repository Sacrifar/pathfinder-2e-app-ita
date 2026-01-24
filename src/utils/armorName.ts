/**
 * Enhanced Armor Name Generator
 * Generates descriptive armor names including runes and materials
 */

import { EquippedItem, ArmorRunes, ArmorCustomization } from '../types';
import { ARMOR_FUNDAMENTAL_RUNES, ARMOR_PROPERTY_RUNES } from '../data/armorRunes';

/**
 * Get the localized potency rune name
 */
function getPotencyRuneName(potencyRune: number | undefined, language: string = 'en'): string {
    if (!potencyRune || potencyRune === 0) return '';

    const potencyData = ARMOR_FUNDAMENTAL_RUNES.potency.find(r => r.value === potencyRune);
    if (!potencyData) return '';

    return language === 'it' ? potencyData.nameIt : potencyData.name;
}

/**
 * Get the localized resilient rune name
 */
function getResilientRuneName(resilientRune: number | undefined, language: string = 'en'): string {
    if (!resilientRune) return '';

    const resilientData = ARMOR_FUNDAMENTAL_RUNES.resilient.find(r => r.value === resilientRune);
    if (!resilientData) return '';

    return language === 'it' ? resilientData.nameIt : resilientData.name;
}

/**
 * Generate an enhanced armor name with runes and materials
 *
 * Format: +3 Potency Resilient Acid Resistant Chain Mail
 *
 * @param baseName - The base armor name (e.g., "Chain Mail")
 * @param runes - Armor runes configuration
 * @param customization - Armor customization (material, etc.)
 * @param options - Additional options
 * @returns Enhanced armor name
 */
export interface GetEnhancedArmorNameOptions {
    language?: 'en' | 'it';
}

export function getEnhancedArmorName(
    baseName: string,
    runes?: ArmorRunes | null,
    customization?: ArmorCustomization | null,
    options: GetEnhancedArmorNameOptions = {}
): string {
    const { language = 'en' } = options;
    const parts: string[] = [];

    // 1. Add Potency Rune (e.g., "+1 Armor Potency Rune" -> "+1")
    if (runes?.potencyRune && runes.potencyRune > 0) {
        parts.push(`+${runes.potencyRune}`);
    }

    // 2. Add Resilient Rune (e.g., "Resilient", "Greater Resilient", "Major Resilient")
    const resilientName = getResilientRuneName(runes?.resilientRune, language);
    if (resilientName) {
        // Remove "Rune" suffix for cleaner display
        parts.push(resilientName.replace(' Rune', ''));
    }

    // 3. Add Property Runes (e.g., "Acid Resistant", "Fortification", "Shadow")
    if (runes?.propertyRunes && runes.propertyRunes.length > 0) {
        for (const runeId of runes.propertyRunes) {
            const rune = ARMOR_PROPERTY_RUNES[runeId];
            if (rune) {
                const runeName = language === 'it' ? (rune.nameIt || rune.name) : rune.name;
                parts.push(runeName);
            }
        }
    }

    // 4. Finally, add the base armor name
    parts.push(baseName);

    // Join all parts with spaces
    return parts.join(' ');
}

/**
 * Convenience function to get the enhanced name from an EquippedItem
 */
export function getEquippedArmorDisplayName(
    equippedItem: EquippedItem,
    baseArmorName: string,
    options: GetEnhancedArmorNameOptions = {}
): string {
    // Check for custom name first
    const customization = equippedItem.customization as any;
    if (customization?.customName) {
        return customization.customName;
    }

    const runes = equippedItem.runes as ArmorRunes | undefined;
    return getEnhancedArmorName(baseArmorName, runes, customization, options);
}
