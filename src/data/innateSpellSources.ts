/**
 * Innate Spell Sources Database
 *
 * This file defines backgrounds, feats, and other sources that grant innate spells.
 * Each entry defines the spells granted and their usage frequency.
 *
 * Unlike spell-granting items, innate spells from backgrounds/feats are permanent
 * character abilities and don't require investment.
 *
 * ================================
 * MODULAR REGISTRATION SYSTEM
 * ================================
 *
 * New in this version: You can now register innate spell sources from separate files!
 *
 * To add a new innate spell source from a separate file:
 *
 * ```typescript
 * import { registerInnateSpellSource } from '@/data/innateSpellSources';
 *
 * registerInnateSpellSource({
 *     id: 'my-new-heritage',
 *     type: 'heritage',
 *     name: 'My New Heritage',
 *     nameIt: 'La Mia Nuova Eredità',
 *     spells: [], // No fixed spells
 *     spellSelection: {
 *         frequency: 'at-will',
 *         tradition: 'primal',
 *         filter: {
 *             traditions: ['primal'],
 *             rank: 0,
 *         },
 *     },
 * });
 * ```
 *
 * This approach allows:
 * - Separating innate spell data by ancestry/feature
 * - Adding new sources without editing this file
 * - Better code organization and maintainability
 *
 * ================================
 * SPELL SELECTION CONFIGURATION
 * ================================
 *
 * For sources that require the user to choose spells (like heritage cantrips),
 * use the `spellSelection` property:
 *
 * ```typescript
 * spellSelection: {
 *     frequency: 'at-will',           // How often the spell can be cast
 *     tradition: 'primal',            // The spell's tradition (optional)
 *     filter: {
 *         traditions: ['primal'],     // Filter by available traditions
 *         rank: 0,                    // 0 = cantrips, 1+ = spell rank
 *         rarity: 'common',           // Optional: filter by rarity
 *         spellIds: ['id1', 'id2'],   // Optional: specific spells only
 *         excludeSpellIds: ['id3'],   // Optional: exclude specific spells
 *     },
 * }
 * ```
 */

import type { InnateSpell } from '../types';

/**
 * Frequency of use for innate spells
 */
export type InnateSpellFrequency = 'at-will' | 'once-per-day' | 'once-per-week' | 'once-per-hour';

/**
 * Definition of a single innate spell grant
 */
export interface InnateSpellGrant {
    spellId: string;           // The spell ID from pf2e data
    frequency: InnateSpellFrequency; // How often it can be used
    tradition: 'arcane' | 'divine' | 'occult' | 'primal'; // Spell tradition
}

/**
 * Spell filter for innate spell sources that require user selection
 */
export interface InnateSpellFilter {
    traditions?: ('arcane' | 'divine' | 'occult' | 'primal')[]; // Required traditions
    rank?: number;              // Spell rank (0 for cantrips)
    rarity?: 'common' | 'uncommon' | 'rare' | 'unique'; // Rarity filter
    spellIds?: string[];        // Specific spell IDs (when limited to certain spells)
    excludeSpellIds?: string[]; // Spells to exclude from the list
}

/**
 * Definition of an innate spell source (heritage, background, or feat)
 */
export interface InnateSpellSource {
    id: string;                // Heritage, background, or feat ID
    type: 'heritage' | 'background' | 'feat'; // Source type
    name: string;              // Source name (English)
    nameIt?: string;           // Source name (Italian)
    spells: InnateSpellGrant[] | // Fixed spells granted
    ((choiceValue: string) => InnateSpellGrant[]); // Or function for choice-based grants

    // NEW: Spell selection configuration for sources that require user choice
    spellSelection?: {
        frequency: InnateSpellFrequency; // Frequency of the selected spell
        tradition?: 'arcane' | 'divine' | 'occult' | 'primal'; // Tradition of the selected spell
        filter?: InnateSpellFilter; // Filter for available spells
    };
}

/**
 * Convert frequency to daily uses count
 * For simplicity in tracking, we convert frequencies to daily uses:
 * - at-will: 999 (essentially unlimited)
 * - once-per-day: 1
 * - once-per-week: 1 (but note once per week in description)
 * - once-per-hour: 24 (practical limit)
 */
export function frequencyToDailyUses(frequency: InnateSpellFrequency): number {
    switch (frequency) {
        case 'at-will': return 999;
        case 'once-per-day': return 1;
        case 'once-per-week': return 1; // TODO: Track weekly separately if needed
        case 'once-per-hour': return 24;
        default: return 1;
    }
}

/**
 * Get frequency display text
 */
export function getFrequencyText(frequency: InnateSpellFrequency): string {
    switch (frequency) {
        case 'at-will': return 'At will';
        case 'once-per-day': return '1/day';
        case 'once-per-week': return '1/week';
        case 'once-per-hour': return '1/hour';
        default: return '1/day';
    }
}

/**
 * Convert innate spell grant to InnateSpell object for character
 */
export function innateSpellGrantToCharacterSpell(
    grant: InnateSpellGrant,
    source: string,
    sourceType: 'heritage' | 'background' | 'feat' | 'item'
): InnateSpell {
    return {
        spellId: grant.spellId,
        uses: frequencyToDailyUses(grant.frequency),
        maxUses: frequencyToDailyUses(grant.frequency),
        source,
        sourceType,
    };
}

/**
 * Zodiac Sign Choices for Zodiac Bound background
 */
export const ZODIAC_SIGNS = {
    'underworld-dragon': { name: 'The Underworld Dragon', nameIt: 'Il Drago del Sottosuolo', ability: 'int' },
    'swordswoman': { name: 'The Swordswoman', nameIt: 'La Spadaccina', ability: 'dex' },
    'sea-dragon': { name: 'The Sea Dragon', nameIt: 'Il Drago di Mare', ability: 'con' },
    'swallow': { name: 'The Swallow', nameIt: 'La Rondine', ability: 'dex' },
    'ox': { name: 'The Ox', nameIt: 'Il Bue', ability: 'str' },
    'sovereign-dragon': { name: 'The Sovereign Dragon', nameIt: 'Il Drago Sovrano', ability: 'cha' },
    'ogre': { name: 'The Ogre', nameIt: 'L\'Orco', ability: 'str' },
    'forest-dragon': { name: 'The Forest Dragon', nameIt: 'Il Drago della Foresta', ability: 'wis' },
    'blossom': { name: 'The Blossom', nameIt: 'Il Fiore', ability: 'cha' },
    'dog': { name: 'The Dog', nameIt: 'Il Cane', ability: 'con' },
    'sky-dragon': { name: 'The Sky Dragon', nameIt: 'Il Drago del Cielo', ability: 'int' },
    'archer': { name: 'The Archer', nameIt: 'L\'Arciere', ability: 'dex' },
} as const;

/**
 * Spells granted by each zodiac sign
 * Note: Using _id from PF2E spell data files
 */
export const ZODIAC_SPELLS: Record<string, InnateSpellGrant[]> = {
    'underworld-dragon': [
        { spellId: '6DfLZBl8wKIV03Iq', frequency: 'at-will', tradition: 'divine' }, // Ignition
    ],
    'swordswoman': [
        { spellId: 'dDiOnjcsBFbAvP6t', frequency: 'at-will', tradition: 'divine' }, // Gale Blast
    ],
    'sea-dragon': [
        { spellId: 'MZGkMsPBztFN0pUO', frequency: 'once-per-week', tradition: 'divine' }, // Water Breathing
    ],
    'swallow': [
        { spellId: 'Q7QQ91vQtyi1Ux36', frequency: 'once-per-day', tradition: 'divine' }, // Jump
    ],
    'ox': [
        { spellId: 'X9dkmh23lFwMjrYd', frequency: 'once-per-day', tradition: 'divine' }, // Ant Haul
    ],
    'sovereign-dragon': [
        { spellId: 'aIHY2DArKFweIrpf', frequency: 'once-per-day', tradition: 'divine' }, // Command
    ],
    'ogre': [
        { spellId: '4koZzrnMXhhosn0D', frequency: 'once-per-day', tradition: 'divine' }, // Fear
    ],
    'forest-dragon': [
        { spellId: 'uZK2BYzPnxUBnDjr', frequency: 'at-will', tradition: 'divine' }, // Tangle Vine
    ],
    'blossom': [
        { spellId: 'UKsIOWmMx4hSpafl', frequency: 'once-per-day', tradition: 'divine' }, // Dizzying Colors
    ],
    'dog': [
        { spellId: 'EfFMLVbmkBWmzoLF', frequency: 'once-per-week', tradition: 'divine' }, // Clear Mind
    ],
    'sky-dragon': [
        { spellId: 'XSujb7EsSwKl19Uu', frequency: 'once-per-day', tradition: 'divine' }, // Bless
    ],
    'archer': [
        { spellId: 'Gb7SeieEvd0pL2Eh', frequency: 'once-per-day', tradition: 'divine' }, // Sure Strike
    ],
};

/**
 * Database of all innate spell sources
 */
export const INNATE_SPELL_SOURCES: Record<string, InnateSpellSource> = {
    // ================================
    // BACKGROUNDS
    // ================================

    'zodiac-bound': {
        id: 'zodiac-bound',
        type: 'background',
        name: 'Zodiac Bound',
        nameIt: 'Legato allo Zodiaco',
        spells: (zodiacSign: string) => {
            return ZODIAC_SPELLS[zodiacSign] || [];
        },
    },

    // ================================
    // HERITAGES
    // ================================

    // GNOME HERITAGES
    'fey-touched-gnome': {
        id: 'fey-touched-gnome',
        type: 'heritage',
        name: 'Fey-Touched Gnome',
        nameIt: 'Gnome Toccato dalla Fatata',
        spells: [],
        spellSelection: {
            frequency: 'at-will',
            tradition: 'primal',
            filter: { traditions: ['primal'], rank: 0 },
        },
    },

    'wellspring-gnome': {
        id: 'wellspring-gnome',
        type: 'heritage',
        name: 'Wellspring Gnome',
        nameIt: 'Gnome Sorgente',
        spells: [],
        spellSelection: {
            frequency: 'at-will',
            filter: { traditions: ['arcane', 'divine', 'occult'], rank: 0 },
        },
    },

    // ELF HERITAGES
    'seer-elf': {
        id: 'seer-elf',
        type: 'heritage',
        name: 'Seer Elf',
        nameIt: 'Elfo Veggente',
        spells: [
            { spellId: 'VnDI3pTCx6eS8o6c', frequency: 'at-will', tradition: 'arcane' }, // Detect Magic
        ],
    },

    // DWARF HERITAGES
    'forge-blessed-dwarf': {
        id: 'forge-blessed-dwarf',
        type: 'heritage',
        name: 'Forge-Blessed Dwarf',
        nameIt: 'Nano Benedetto dalla Fucina',
        spells: [], // Requires deity selection - handled separately
    },

    // VERSATILE HERITAGES
    'talos': {
        id: 'talos',
        type: 'heritage',
        name: 'Talos',
        nameIt: 'Talos',
        spells: [
            { spellId: 'AiyDEEQf2vTjZVzJ', frequency: 'at-will', tradition: 'arcane' }, // Detect Metal
        ],
    },

    // CATFOLK HERITAGES
    'liminal-catfolk': {
        id: 'liminal-catfolk',
        type: 'heritage',
        name: 'Liminal Catfolk',
        nameIt: 'Felino Liminale',
        spells: [
            { spellId: 'VnDI3pTCx6eS8o6c', frequency: 'at-will', tradition: 'occult' }, // Detect Magic
        ],
    },

    // CENTAUR HERITAGES
    'budding-speaker-centaur': {
        id: 'budding-speaker-centaur',
        type: 'heritage',
        name: 'Budding Speaker Centaur',
        nameIt: 'Centauro Oratore Nascente',
        spells: [],
        spellSelection: {
            frequency: 'at-will',
            filter: { traditions: ['divine', 'primal'], rank: 0 },
        },
    },

    // DRAGONET HERITAGES
    'homing-drake': {
        id: 'homing-drake',
        type: 'heritage',
        name: 'Homing Drake',
        nameIt: 'Drake Homing',
        spells: [
            { spellId: 'cKuWxRH5H7qsSTsD', frequency: 'at-will', tradition: 'arcane' }, // Know the Way
        ],
    },

    // GOBLIN HERITAGES
    'dokkaebi-goblin': {
        id: 'dokkaebi-goblin',
        type: 'heritage',
        name: 'Dokkaebi Goblin',
        nameIt: 'Goblin Dokkaebi',
        spells: [
            { spellId: 'VGpj0kJMrHNqaCXF', frequency: 'at-will', tradition: 'occult' }, // Figment
        ],
    },

    // LIZARDFOLK HERITAGES
    'makari-lizardfolk': {
        id: 'makari-lizardfolk',
        type: 'heritage',
        name: 'Makari Lizardfolk',
        nameIt: 'Lizardfolk Makari',
        spells: [],
        spellSelection: {
            frequency: 'at-will',
            filter: {
                spellIds: ['rLyDaYQDEP0eTmCU', 'm2nqgMfHJLhmDxLQ'], // Divine Lance, Forbidding Ward
            },
        },
    },

    // KHOLO HERITAGES
    'witch-kholo': {
        id: 'witch-kholo',
        type: 'heritage',
        name: 'Witch Kholo',
        nameIt: 'Kholo Strega',
        spells: [
            { spellId: 'VGpj0kJMrHNqaCXF', frequency: 'at-will', tradition: 'occult' }, // Figment
        ],
    },

    // YAOGUAI HERITAGES
    'born-of-elements': {
        id: 'born-of-elements',
        type: 'heritage',
        name: 'Born of Elements',
        nameIt: 'Nato dagli Elementi',
        spells: [],
        spellSelection: {
            frequency: 'at-will',
            tradition: 'primal',
            filter: {
                spellIds: [
                    'GmgcigXsYuHQBycY', // Electric Arc
                    'VSqoZOdBBdnadMAy', // Frostbite
                    '6DfLZBl8wKIV03Iq', // Ignition
                    'xMzVFcex3tBQVYvM', // Needle Darts
                    'Rnm5T6b0YTXWR8Cu', // Timber
                    'hRk79AWmEc3mzJus', // Scatter Scree
                    'DYYl1L5HgDh0T9vD', // Slashing Gust
                    'dA4k8qvqsLDStQsZ', // Spout
                ],
            },
        },
    },

    'born-of-celestial': {
        id: 'born-of-celestial',
        type: 'heritage',
        name: 'Born of Celestial',
        nameIt: 'Nato dal Celeste',
        spells: [],
        spellSelection: {
            frequency: 'at-will',
            tradition: 'divine',
            filter: { traditions: ['divine'], rank: 0 },
        },
    },

    // YAKSHA HERITAGES
    'respite-of-loam-and-leaf': {
        id: 'respite-of-loam-and-leaf',
        type: 'heritage',
        name: 'Respite of Loam and Leaf',
        nameIt: 'Refugio di Terra e Foglia',
        spells: [],
        spellSelection: {
            frequency: 'at-will',
            tradition: 'primal',
            filter: { traditions: ['primal'], rank: 0 },
        },
    },

    // CONRASU HERITAGES
    'rite-of-invocation': {
        id: 'rite-of-invocation',
        type: 'heritage',
        name: 'Rite of Invocation',
        nameIt: 'Rito dell\'Invocazione',
        spells: [],
        spellSelection: {
            frequency: 'at-will',
            filter: { traditions: ['arcane', 'occult'], rank: 0 },
        },
    },

    // AUTOMATON HERITAGES
    'mage-automaton': {
        id: 'mage-automaton',
        type: 'heritage',
        name: 'Mage Automaton',
        nameIt: 'Automaton Mago',
        spells: [],
        spellSelection: {
            frequency: 'at-will',
            tradition: 'arcane',
            filter: { traditions: ['arcane'], rank: 0 },
        },
    },

    // SAMSARAN HERITAGES
    'oracular-samsaran': {
        id: 'oracular-samsaran',
        type: 'heritage',
        name: 'Oracular Samsaran',
        nameIt: 'Samsaran Oracolare',
        spells: [],
        spellSelection: {
            frequency: 'at-will',
            filter: { traditions: ['arcane', 'divine', 'occult'], rank: 0 },
        },
    },

    // MINOTAUR HERITAGES
    'ghost-bull-minotaur': {
        id: 'ghost-bull-minotaur',
        type: 'heritage',
        name: 'Ghost Bull Minotaur',
        nameIt: 'Minotauro Toro Fantasma',
        spells: [
            { spellId: 'cKuWxRH5H7qsSTsD', frequency: 'at-will', tradition: 'occult' }, // Know the Way
        ],
    },

    // SHISK HERITAGES
    'spellkeeper-shisk': {
        id: 'spellkeeper-shisk',
        type: 'heritage',
        name: 'Spellkeeper Shisk',
        nameIt: 'Shisk Custode di Incantesimi',
        spells: [],
        spellSelection: {
            frequency: 'at-will',
            filter: { traditions: ['occult', 'primal'], rank: 0 },
        },
    },

    // KOBOLD HERITAGES
    'VRyX00OuPGsJSurM': { // spellhorn-kobold
        id: 'VRyX00OuPGsJSurM',
        type: 'heritage',
        name: 'Spellhorn Kobold',
        nameIt: 'Kobold Corno Incantato',
        spells: [],
        spellSelection: {
            frequency: 'at-will',
            tradition: 'arcane',
            filter: { traditions: ['arcane'], rank: 0, rarity: 'common' },
        },
    },

    // ================================
    // ANCESTRY FEATS
    // ================================

    'efreeti-magic': {
        id: 'efreeti-magic',
        type: 'feat',
        name: 'Efreeti Magic',
        nameIt: 'Magia degli Efreeti',
        spells: [
            { spellId: 'wzctak6BxOW8xvFV', frequency: 'once-per-day', tradition: 'arcane' }, // Enlarge
            { spellId: '2oH5IufzdESuYxat', frequency: 'once-per-day', tradition: 'arcane' }, // Illusory Object
        ],
    },

    'arcane-eye': {
        id: 'arcane-eye',
        type: 'feat',
        name: 'Arcane Eye',
        nameIt: 'Occhio Arcano',
        spells: (enhancement: string) => {
            // Only grants spell if enhanced
            if (enhancement === 'arcane-eye') {
                return [
                    { spellId: 'jwK43yKsHTkJQvQ9', frequency: 'once-per-hour', tradition: 'arcane' }, // See the Unseen
                ];
            }
            return [];
        },
    },

    // Automaton Enhancements
    'core-attunement': {
        id: 'core-attunement',
        type: 'feat',
        name: 'Core Attunement',
        nameIt: 'Sintonizzazione del Nucleo',
        spells: [], // Requires spell selection via UI - handled separately
    },

    'arcane-camouflage': {
        id: 'arcane-camouflage',
        type: 'feat',
        name: 'Arcane Camouflage',
        nameIt: 'Camuffamento Arcano',
        spells: [
            { spellId: '3JG1t3T4mWn6vTke', frequency: 'once-per-day', tradition: 'arcane' }, // Blur
            { spellId: 'XXqE1eY3w3z6xJCB', frequency: 'once-per-day', tradition: 'arcane' }, // Invisibility
        ],
    },

    'astral-blink': {
        id: 'astral-blink',
        type: 'feat',
        name: 'Astral Blink',
        nameIt: 'Lampo Astrale',
        spells: [
            { spellId: 'zjG6NncHyAKqSF7m', frequency: 'once-per-day', tradition: 'arcane' }, // Dimensional Steps
        ],
    },

    'axial-recall': {
        id: 'axial-recall',
        type: 'feat',
        name: 'Axial Recall',
        nameIt: 'Richiamo Assiale',
        spells: [
            { spellId: '5bTt2CvYHPvaR7QQ', frequency: 'once-per-week', tradition: 'arcane' }, // Interplanar Teleport
        ],
    },

    // TODO: Add more innate spell granting feats as needed
    // - Studious Magic/Advent (Anadi)
    // - Advanced Targeting System (Android)
    // - Nanite Shroud (Android)
    // - Emissary Assistance (Athamaru)
    // - Awakened Magic (Awakened Animal)
    // And many more...
};

// ================================
// MODULAR REGISTRATION SYSTEM
// ================================

/**
 * Internal registry for all innate spell sources
 * Uses a Map for O(1) lookups and easy extension
 */
const innateSpellRegistry = new Map<string, InnateSpellSource>();

/**
 * Register an innate spell source
 * Can be called multiple times to build up the registry from multiple files
 */
export function registerInnateSpellSource(source: InnateSpellSource): void {
    innateSpellRegistry.set(source.id, source);
}

/**
 * Register multiple innate spell sources at once
 */
export function registerInnateSpellSources(sources: InnateSpellSource[]): void {
    for (const source of sources) {
        innateSpellRegistry.set(source.id, source);
    }
}

/**
 * Get all registered innate spell sources as a Record
 * Provides backward compatibility with code expecting INNATE_SPELL_SOURCES object
 */
export function getInnateSpellSources(): Record<string, InnateSpellSource> {
    return Object.fromEntries(innateSpellRegistry);
}

/**
 * Get a single innate spell source by ID
 */
export function getInnateSpellSource(sourceId: string): InnateSpellSource | undefined {
    return innateSpellRegistry.get(sourceId);
}

/**
 * Check if a source has spell selection (requires user to choose spells)
 */
export function hasSpellSelection(sourceId: string): boolean {
    const source = innateSpellRegistry.get(sourceId);
    return source?.spellSelection !== undefined;
}

/**
 * Get spell selection configuration for a source
 */
export function getSpellSelection(sourceId: string): InnateSpellSource['spellSelection'] | undefined {
    const source = innateSpellRegistry.get(sourceId);
    return source?.spellSelection;
}

// ================================
// AUTO-REGISTRATION
// ================================

// Automatically register all sources from INNATE_SPELL_SOURCES
// This maintains backward compatibility while enabling the modular system
// NOTE: This must come AFTER the registry and registration functions are defined
Object.values(INNATE_SPELL_SOURCES).forEach(source => {
    registerInnateSpellSource(source);
});

// Debug log to verify registration
console.log('[innateSpellSources] Auto-registration complete:', {
    sourcesCount: Object.keys(INNATE_SPELL_SOURCES).length,
    registrySize: innateSpellRegistry.size,
    registeredIds: Array.from(innateSpellRegistry.keys()),
    spellhornRegistered: innateSpellRegistry.has('VRyX00OuPGsJSurM'),
});

// Expose to global scope for debugging (only in development)
if (import.meta.env.DEV) {
    (globalThis as any).__innateSpellRegistry = innateSpellRegistry;
    (globalThis as any).__INNATE_SPELL_SOURCES = INNATE_SPELL_SOURCES;
    console.log('[innateSpellSources] Debug info available at window.__innateSpellRegistry');
}

// Export for backward compatibility (read-only view of registry)
export const INNATE_SPELL_SOURCES_READONLY = getInnateSpellSources();

/**
 * Get innate spells from a source
 * Returns array of InnateSpell objects for character
 */
export function getInnateSpellsFromSource(
    sourceId: string,
    sourceType: 'heritage' | 'background' | 'feat',
    choiceValue?: string
): InnateSpell[] {
    const source = innateSpellRegistry.get(sourceId);
    if (!source) return [];

    let spellGrants: InnateSpellGrant[];

    if (source.spellSelection) {
        // If source has spellSelection, the choiceValue IS the spellId
        if (choiceValue) {
            spellGrants = [{
                spellId: choiceValue,
                frequency: source.spellSelection.frequency,
                tradition: source.spellSelection.tradition || 'arcane' // Fallback, though tradition usually comes from spell
            }];
        } else {
            spellGrants = [];
        }
    } else if (typeof source.spells === 'function') {
        // Choice-based source (function) - requires choiceValue
        if (!choiceValue) return [];
        spellGrants = source.spells(choiceValue);
    } else {
        // Fixed spells
        spellGrants = source.spells;
    }

    const sourceName = source.nameIt ? `${source.name} (${source.nameIt})` : source.name;

    return spellGrants.map(grant =>
        innateSpellGrantToCharacterSpell(grant, sourceName, sourceType)
    );
}

/**
 * Check if a source grants innate spells
 */
export function isInnateSpellSource(sourceId: string): boolean {
    const result = innateSpellRegistry.has(sourceId);
    // Debug log to see what IDs are being checked
    console.log('[isInnateSpellSource] Checking heritage:', {
        sourceId,
        found: result,
        // Show if this might be a spell-related heritage
        isKnownSource: INNATE_SPELL_SOURCES[sourceId] ? INNATE_SPELL_SOURCES[sourceId].name : 'unknown',
    });
    return result;
}

/**
 * Get all innate spells for a character
 * Aggregates from heritage, background, and feats
 */
export function getAllInnateSpellsForCharacter(character: {
    heritageId?: string;
    heritageChoice?: string;
    backgroundId?: string;
    backgroundChoice?: string;
    feats?: Array<{ featId: string; choices?: string[] }>;
}): InnateSpell[] {
    const innateSpells: InnateSpell[] = [];

    // Heritage innate spells
    if (character.heritageId && isInnateSpellSource(character.heritageId)) {
        const heritageSpells = getInnateSpellsFromSource(
            character.heritageId,
            'heritage',
            character.heritageChoice
        );
        innateSpells.push(...heritageSpells);
    }

    // Background innate spells
    if (character.backgroundId && isInnateSpellSource(character.backgroundId)) {
        const backgroundSpells = getInnateSpellsFromSource(
            character.backgroundId,
            'background',
            character.backgroundChoice
        );
        innateSpells.push(...backgroundSpells);
    }

    // Feat innate spells
    if (character.feats) {
        for (const feat of character.feats) {
            if (isInnateSpellSource(feat.featId)) {
                // Get first choice for choice-based feats
                const choiceValue = feat.choices?.[0];
                const featSpells = getInnateSpellsFromSource(feat.featId, 'feat', choiceValue);
                innateSpells.push(...featSpells);
            }
        }
    }

    return innateSpells;
}

/**
 * Apply spell filter to get matching spells from a list
 * Used by HeritageSpellModal and similar components
 */
export function filterSpellsByConfig(
    spells: Array<{ id: string; traditions: string[]; rank: number; rarity: string }>,
    filter?: InnateSpellFilter
): string[] {
    if (!filter) return spells.map(s => s.id);

    return spells
        .filter(spell => {
            // Filter by tradition
            if (filter.traditions && filter.traditions.length > 0) {
                if (!filter.traditions.some(t => spell.traditions.includes(t))) {
                    return false;
                }
            }

            // Filter by rank
            if (filter.rank !== undefined && spell.rank !== filter.rank) {
                return false;
            }

            // Filter by rarity
            if (filter.rarity && spell.rarity !== filter.rarity) {
                return false;
            }

            // Filter by specific spell IDs
            if (filter.spellIds && filter.spellIds.length > 0) {
                if (!filter.spellIds.includes(spell.id)) {
                    return false;
                }
            }

            // Exclude specific spell IDs
            if (filter.excludeSpellIds && filter.excludeSpellIds.length > 0) {
                if (filter.excludeSpellIds.includes(spell.id)) {
                    return false;
                }
            }

            return true;
        })
        .map(s => s.id);
}
