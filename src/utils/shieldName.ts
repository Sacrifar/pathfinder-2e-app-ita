/**
 * Enhanced Shield Name Generator
 * Generates descriptive shield names including runes and materials
 */

import { EquippedItem, ShieldRunes, ShieldCustomization } from '../types';
import { SHIELD_FUNDAMENTAL_RUNES, SHIELD_PROPERTY_RUNES } from '../data/shieldRunes';

/**
 * Get the localized reinforcing rune name
 */
function getReinforcingRuneName(reinforcingRune: number | undefined, language: string = 'en'): string {
    if (!reinforcingRune || reinforcingRune === 0) return '';

    const reinforcingData = SHIELD_FUNDAMENTAL_RUNES.reinforcing.find(r => r.value === reinforcingRune);
    if (!reinforcingData) return '';

    return language === 'it' ? reinforcingData.nameIt : reinforcingData.name;
}

/**
 * Generate an enhanced shield name with runes and materials
 *
 * Format: +3 Reinforcing Steel Shield
 *
 * @param baseName - The base shield name (e.g., "Steel Shield")
 * @param runes - Shield runes configuration
 * @param customization - Shield customization (material, etc.)
 * @param options - Additional options
 * @returns Enhanced shield name
 */
export interface GetEnhancedShieldNameOptions {
    language?: 'en' | 'it';
}

export function getEnhancedShieldName(
    baseName: string,
    runes?: ShieldRunes | null,
    customization?: ShieldCustomization | null,
    options: GetEnhancedShieldNameOptions = {}
): string {
    const { language = 'en' } = options;
    const parts: string[] = [];

    // 1. Add Reinforcing Rune (e.g., "+1 Reinforcing" -> "+1")
    if (runes?.reinforcingRune && runes.reinforcingRune > 0) {
        parts.push(`+${runes.reinforcingRune}`);
    }

    // 2. Add Property Runes (e.g., "Arrow Catching", "Fortification")
    if (runes?.propertyRunes && runes.propertyRunes.length > 0) {
        for (const runeId of runes.propertyRunes) {
            const rune = SHIELD_PROPERTY_RUNES[runeId];
            if (rune) {
                const runeName = language === 'it' ? (rune.nameIt || rune.name) : rune.name;
                parts.push(runeName);
            }
        }
    }

    // 3. Finally, add the base shield name
    parts.push(baseName);

    // Join all parts with spaces
    return parts.join(' ');
}

/**
 * Convenience function to get the enhanced name from an EquippedItem
 */
export function getEquippedShieldDisplayName(
    equippedItem: EquippedItem,
    baseShieldName: string,
    options: GetEnhancedShieldNameOptions = {}
): string {
    // Check for custom name first
    const customization = equippedItem.customization as any;
    if (customization?.customName) {
        return customization.customName;
    }

    const runes = equippedItem.runes as ShieldRunes | undefined;
    return getEnhancedShieldName(baseShieldName, runes, customization, options);
}
