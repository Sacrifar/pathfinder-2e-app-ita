/**
 * Spell-Granting Items Database
 *
 * This file defines items that grant spells to characters, along with their
 * configurable options (like element selection for Gate Attenuator).
 *
 * Each entry defines:
 * - The item ID
 * - Available choices (e.g., elements for Gate Attenuator)
 * - Spells granted for each choice
 * - Usage frequency (daily, etc.)
 */

export interface ItemSpellChoice {
    value: string;           // Choice value (e.g., "air", "earth", "fire")
    label: string;           // Display label (e.g., "Air", "Earth", "Fire")
    labelIt?: string;        // Italian label
    spellId?: string;        // The spell granted for this choice
    spellRank?: number;      // The rank of the spell
    description?: string;    // Optional description of the effect
    descriptionIt?: string;  // Italian description
}

export interface SpellGrantingItem {
    id: string;              // Item ID from equipment JSON
    name: string;            // Item name
    nameIt?: string;         // Italian name
    choiceLabel: string;     // Label for the choice (e.g., "Element", "Option")
    choiceLabelIt?: string;  // Italian choice label
    choices: ItemSpellChoice[]; // Available choices
    frequency: 'daily' | 'week' | 'unlimited'; // How often it can be used
    requiresInvestment: boolean; // Whether the item must be invested
}

/**
 * Database of spell-granting items
 *
 * Maps item IDs to their spell-granting configuration
 */
export const SPELL_GRANTING_ITEMS: Record<string, SpellGrantingItem> = {
    // Gate Attenuator (Level 3)
    'ioiMUDqv85BI4shY': {
        id: 'ioiMUDqv85BI4shY',
        name: 'Gate Attenuator',
        nameIt: 'Attenuatore di Portale',
        choiceLabel: 'Element',
        choiceLabelIt: 'Elemento',
        frequency: 'daily',
        requiresInvestment: true,
        choices: [
            {
                value: 'air',
                label: 'Air',
                labelIt: 'Aria',
                spellId: 'g8QqHpv2CWDwmIm1',  // gust-of-wind
                spellRank: 1,
                description: 'Casts Gust of Wind (1st rank)',
                descriptionIt: 'Lancia Vento di Gusto (rango 1)',
            },
            {
                value: 'earth',
                label: 'Earth',
                labelIt: 'Terra',
                spellId: 'Rn2LkoSq1XhLsODV',  // pummeling-rubble
                spellRank: 1,
                description: 'Casts Pummeling Rubble (1st rank)',
                descriptionIt: 'Lancia Macerie Polverizzanti (rango 1)',
            },
            {
                value: 'fire',
                label: 'Fire',
                labelIt: 'Fuoco',
                spellId: 'f9m9DayyGy3meqUX',  // dehydrate
                spellRank: 1,
                description: 'Casts Dehydrate (1st rank)',
                descriptionIt: 'Lancia Disidratare (rango 1)',
            },
            {
                value: 'metal',
                label: 'Metal',
                labelIt: 'Metallo',
                spellId: 'zDJS8E66UI0himqV',  // thunderstrike
                spellRank: 1,
                description: 'Casts Thunderstrike (1st rank)',
                descriptionIt: 'Lancia Colpo di Tuono (rango 1)',
            },
            {
                value: 'water',
                label: 'Water',
                labelIt: 'Acqua',
                spellId: 'W6QlRwQLPoBSw6PZ',  // snowball
                spellRank: 1,
                description: 'Casts Snowball (1st rank)',
                descriptionIt: 'Lancia Palla di Neve (rango 1)',
            },
            {
                value: 'wood',
                label: 'Wood',
                labelIt: 'Legno',
                spellId: 'b6AQvzs8EotmlK56',  // flourishing-flora
                spellRank: 1,
                description: 'Casts Flourishing Flora (1st rank)',
                descriptionIt: 'Lancia Flora Fiorente (rango 1)',
            },
        ],
    },

    // Gate Attenuator (Greater) - Level 11
    'RC3axCXEWwiSEEUl': {
        id: 'RC3axCXEWwiSEEUl',
        name: 'Gate Attenuator (Greater)',
        nameIt: 'Attenuatore di Portale (Maggiore)',
        choiceLabel: 'Element',
        choiceLabelIt: 'Elemento',
        frequency: 'daily',
        requiresInvestment: true,
        choices: [
            {
                value: 'air',
                label: 'Air',
                labelIt: 'Aria',
                spellId: 'e4c73RBCQAZdYxau',  // pressure-zone
                spellRank: 5,
                description: 'Casts Pressure Zone (5th rank)',
                descriptionIt: 'Lancia Zona di Pressione (rango 5)',
            },
            {
                value: 'earth',
                label: 'Earth',
                labelIt: 'Terra',
                spellId: 'e4c73RBCQAZdYxau',  // pressure-zone (fallback: sand-form not in database)
                spellRank: 5,
                description: 'Casts Pressure Zone (5th rank)',
                descriptionIt: 'Lancia Zona di Pressione (rango 5)',
            },
            {
                value: 'fire',
                label: 'Fire',
                labelIt: 'Fuoco',
                spellId: 'ZClfmMoKG3E926Uq',  // flames-of-ego
                spellRank: 5,
                description: 'Casts Flames of Ego (5th rank)',
                descriptionIt: 'Lancia Fiamme dell\'Ego (rango 5)',
            },
            {
                value: 'metal',
                label: 'Metal',
                labelIt: 'Metallo',
                spellId: 'oXeEbcUdgJGWHGEJ',  // impaling-spike
                spellRank: 5,
                description: 'Casts Impaling Spike (5th rank)',
                descriptionIt: 'Lancia Picca Impalante (rango 5)',
            },
            {
                value: 'water',
                label: 'Water',
                labelIt: 'Acqua',
                spellId: '9AZEObUdLI2fwmPl',  // freezing-rain
                spellRank: 5,
                description: 'Casts Freezing Rain (5th rank)',
                descriptionIt: 'Lancia Pioggia Gelida (rango 5)',
            },
            {
                value: 'wood',
                label: 'Wood',
                labelIt: 'Legno',
                spellId: 'VDK5cQ94BszDrMiJ',  // entwined-roots
                spellRank: 5,
                description: 'Casts Entwined Roots (5th rank)',
                descriptionIt: 'Lancia Radici Intrecciate (rango 5)',
            },
        ],
    },

    // Gate Attenuator (Major) - Level 15
    // TODO: Add when item data is available
};

/**
 * Get spell-granting item configuration by item ID
 */
export function getSpellGrantingItem(itemId: string): SpellGrantingItem | undefined {
    return SPELL_GRANTING_ITEMS[itemId];
}

/**
 * Check if an item grants spells
 */
export function isSpellGrantingItem(itemId: string): boolean {
    return itemId in SPELL_GRANTING_ITEMS;
}

/**
 * Get all spell-granting items
 */
export function getAllSpellGrantingItems(): SpellGrantingItem[] {
    return Object.values(SPELL_GRANTING_ITEMS);
}

/**
 * Get the spell granted by an item for a specific choice
 */
export function getSpellForItemChoice(
    itemId: string,
    choice: string
): ItemSpellChoice | undefined {
    const item = SPELL_GRANTING_ITEMS[itemId];
    if (!item) return undefined;

    return item.choices.find(c => c.value === choice);
}

/**
 * Get a map of all spell IDs to their granting item IDs
 * This is used to identify which spells come from spell-granting items
 * so they can be removed when items are uninvested or removed
 */
export function getAllSpellGrantingItemIds(): Record<string, string> {
    const result: Record<string, string> = {};

    for (const [itemId, item] of Object.entries(SPELL_GRANTING_ITEMS)) {
        for (const choice of item.choices) {
            if (choice.spellId) {
                result[choice.spellId] = itemId;
            }
        }
    }

    return result;
}

/**
 * Check if daily uses should be reset (new day since last reset)
 */
export function shouldResetDailyUses(lastReset?: string): boolean {
    if (!lastReset) return true;

    const lastResetDate = new Date(lastReset);
    const today = new Date();

    // Reset if the date has changed (midnight)
    return (
        lastResetDate.getDate() !== today.getDate() ||
        lastResetDate.getMonth() !== today.getMonth() ||
        lastResetDate.getFullYear() !== today.getFullYear()
    );
}

/**
 * Reset daily uses for an item
 */
export function resetDailyUses(current?: number, max?: number, lastReset?: string): {
    current: number;
    max: number;
    lastReset: string;
} {
    const now = new Date().toISOString();
    return {
        current: max || 1,
        max: max || 1,
        lastReset: now,
    };
}
