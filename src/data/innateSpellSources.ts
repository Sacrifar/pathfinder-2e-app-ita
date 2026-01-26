/**
 * Innate Spell Sources Database
 *
 * This file defines backgrounds, feats, and other sources that grant innate spells.
 * Each entry defines the spells granted and their usage frequency.
 *
 * Unlike spell-granting items, innate spells from backgrounds/feats are permanent
 * character abilities and don't require investment.
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
 * Definition of an innate spell source (heritage, background, or feat)
 */
export interface InnateSpellSource {
    id: string;                // Heritage, background, or feat ID
    type: 'heritage' | 'background' | 'feat'; // Source type
    name: string;              // Source name (English)
    nameIt?: string;           // Source name (Italian)
    spells: InnateSpellGrant[] | // Fixed spells granted
            ((choiceValue: string) => InnateSpellGrant[]); // Or function for choice-based grants
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
        spells: [], // User selects any primal cantrip - handled via heritageChoice
    },

    'wellspring-gnome': {
        id: 'wellspring-gnome',
        type: 'heritage',
        name: 'Wellspring Gnome',
        nameIt: 'Gnome Sorgente',
        spells: [], // User selects tradition and cantrip - handled via heritageChoice
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
        spells: [], // Spell depends on chosen deity - handled via heritageChoice
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
        spells: [], // User selects tradition and cantrip - handled via heritageChoice
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
        spells: [], // User chooses Divine Lance or Forbidding Ward - handled via heritageChoice
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
        spells: [], // User selects from 8 primal cantrips - handled via heritageChoice
    },

    'born-of-celestial': {
        id: 'born-of-celestial',
        type: 'heritage',
        name: 'Born of Celestial',
        nameIt: 'Nato dal Celeste',
        spells: [], // User selects any divine cantrip - handled via heritageChoice
    },

    // YAKSHA HERITAGES
    'respite-of-loam-and-leaf': {
        id: 'respite-of-loam-and-leaf',
        type: 'heritage',
        name: 'Respite of Loam and Leaf',
        nameIt: 'Refugio di Terra e Foglia',
        spells: [], // User selects any primal cantrip - handled via heritageChoice
    },

    // CONRASU HERITAGES
    'rite-of-invocation': {
        id: 'rite-of-invocation',
        type: 'heritage',
        name: 'Rite of Invocation',
        nameIt: 'Rito dell\'Invocazione',
        spells: [], // User selects cantrip from arcane or occult - handled via heritageChoice
    },

    // AUTOMATON HERITAGES
    'mage-automaton': {
        id: 'mage-automaton',
        type: 'heritage',
        name: 'Mage Automaton',
        nameIt: 'Automaton Mago',
        spells: [], // User selects any arcane cantrip - handled via heritageChoice
    },

    // SAMSARAN HERITAGES
    'oracular-samsaran': {
        id: 'oracular-samsaran',
        type: 'heritage',
        name: 'Oracular Samsaran',
        nameIt: 'Samsaran Oracolare',
        spells: [], // User selects tradition and cantrip - handled via heritageChoice
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
        spells: [], // User selects tradition and cantrip - handled via heritageChoice
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
        spells: [], // Requires spell selection via UI - user chooses spells
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

/**
 * Get innate spells from a source
 * Returns array of InnateSpell objects for character
 */
export function getInnateSpellsFromSource(
    sourceId: string,
    sourceType: 'heritage' | 'background' | 'feat',
    choiceValue?: string
): InnateSpell[] {
    const source = INNATE_SPELL_SOURCES[sourceId];
    if (!source) return [];

    let spellGrants: InnateSpellGrant[];

    if (typeof source.spells === 'function') {
        // Choice-based source - requires choiceValue
        if (!choiceValue) return [];
        spellGrants = source.spells(choiceValue);
    } else {
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
    return sourceId in INNATE_SPELL_SOURCES;
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
