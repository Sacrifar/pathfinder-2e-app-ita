/**
 * EXAMPLE: How to Register Heritage Innate Spells Modulary
 *
 * This file demonstrates how to add innate spell sources for heritages
 * without modifying the main innateSpellSources.ts file.
 *
 * To use this template:
 * 1. Copy this file and rename it (e.g., "gnomeInnateSpells.ts")
 * 2. Import it in your data barrel or component files
 * 3. The sources will be automatically registered
 */

import {
    registerInnateSpellSource,
    type InnateSpellSource,
} from '@/data/innateSpellSources';

// ================================
// GNOME HERITAGES
// ================================

registerInnateSpellSource({
    id: 'fey-touched-gnome',
    type: 'heritage',
    name: 'Fey-Touched Gnome',
    nameIt: 'Gnome Toccato dalla Fatata',
    spells: [], // No fixed spells - user selects
    spellSelection: {
        frequency: 'at-will',
        tradition: 'primal',
        filter: {
            traditions: ['primal'],
            rank: 0, // Cantrips only
        },
    },
});

registerInnateSpellSource({
    id: 'wellspring-gnome',
    type: 'heritage',
    name: 'Wellspring Gnome',
    nameIt: 'Gnome Sorgente',
    spells: [],
    spellSelection: {
        frequency: 'at-will',
        filter: {
            traditions: ['arcane', 'divine', 'occult'],
            rank: 0,
        },
    },
});

// ================================
// EXAMPLE: FIXED SPELLS (No Selection)
// ================================

registerInnateSpellSource({
    id: 'seer-elf',
    type: 'heritage',
    name: 'Seer Elf',
    nameIt: 'Elfo Veggente',
    spells: [
        {
            spellId: 'VnDI3pTCx6eS8o6c', // Detect Magic
            frequency: 'at-will',
            tradition: 'arcane',
        },
    ],
    // No spellSelection needed - spells are fixed
});

// ================================
// EXAMPLE: LIMITED SPELL CHOICE
// ================================

registerInnateSpellSource({
    id: 'makari-lizardfolk',
    type: 'heritage',
    name: 'Makari Lizardfolk',
    nameIt: 'Lizardfolk Makari',
    spells: [],
    spellSelection: {
        frequency: 'at-will',
        filter: {
            // Only these specific spells
            spellIds: [
                'rLyDaYQDEP0eTmCU', // Divine Lance
                'm2nqgMfHJLhmDxLQ', // Forbidding Ward
            ],
        },
    },
});

// ================================
// USAGE IN YOUR APP
// ================================

// Import this file early in your app startup:
// import './src/data/heritageInnateSpells';
//
// Or import in a central data barrel file:
// export * from './heritageInnateSpells';

export {};
