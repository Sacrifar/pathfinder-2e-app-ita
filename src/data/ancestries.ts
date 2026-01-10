/**
 * Pathfinder 2e Core Ancestries (Remastered)
 */

import type { Ancestry, Heritage } from '../types';

export const ancestries: Ancestry[] = [
    {
        id: 'human',
        name: 'Human',
        nameIt: 'Umano',
        description: 'As unpredictable and varied as any of the world\'s peoples, humans have exceptional drive and the capacity to endure and expand.',
        descriptionIt: 'Imprevedibili e variegati come qualsiasi altro popolo del mondo, gli umani hanno uno slancio eccezionale e la capacità di resistere e espandersi.',
        source: { book: 'Player Core', page: 54 },
        rarity: 'common',
        traits: ['human', 'humanoid'],
        hitPoints: 8,
        size: 'medium',
        speed: 25,
        abilityBoosts: ['free', 'free'],
        abilityFlaws: [],
        languages: ['Common'],
        bonusLanguages: ['any'],
        features: [
            {
                name: 'Humanity\'s Adaptability',
                nameIt: 'Adattabilità Umana',
                description: 'Humans\' versatility gives them a general feat at 1st level.',
                descriptionIt: 'La versatilità degli umani conferisce loro un talento generico al 1° livello.'
            }
        ]
    },
    {
        id: 'elf',
        name: 'Elf',
        nameIt: 'Elfo',
        description: 'Elves are a tall, slender, long-lived people with a deep connection to magic and the natural world.',
        descriptionIt: 'Gli elfi sono un popolo alto, snello e longevo con un profondo legame con la magia e il mondo naturale.',
        source: { book: 'Player Core', page: 48 },
        rarity: 'common',
        traits: ['elf', 'humanoid'],
        hitPoints: 6,
        size: 'medium',
        speed: 30,
        abilityBoosts: ['dex', 'int', 'free'],
        abilityFlaws: ['con'],
        languages: ['Common', 'Elven'],
        bonusLanguages: ['Celestial', 'Draconic', 'Gnoll', 'Gnomish', 'Goblin', 'Orcish', 'Sylvan'],
        features: [
            {
                name: 'Low-Light Vision',
                nameIt: 'Visione Crepuscolare',
                description: 'You can see in dim light as though it were bright light.',
                descriptionIt: 'Puoi vedere in luce fioca come se fosse luce intensa.'
            }
        ]
    },
    {
        id: 'dwarf',
        name: 'Dwarf',
        nameIt: 'Nano',
        description: 'Dwarves are a short, stocky people who are often stubborn, fierce, and devoted to their traditions and crafts.',
        descriptionIt: 'I nani sono un popolo basso e robusto, spesso testardo, feroce e devoto alle proprie tradizioni e mestieri.',
        source: { book: 'Player Core', page: 44 },
        rarity: 'common',
        traits: ['dwarf', 'humanoid'],
        hitPoints: 10,
        size: 'medium',
        speed: 20,
        abilityBoosts: ['con', 'wis', 'free'],
        abilityFlaws: ['cha'],
        languages: ['Common', 'Dwarven'],
        bonusLanguages: ['Gnomish', 'Goblin', 'Jotun', 'Orcish', 'Terran', 'Undercommon'],
        features: [
            {
                name: 'Darkvision',
                nameIt: 'Scurovisione',
                description: 'You can see in darkness and dim light just as well as you can see in bright light.',
                descriptionIt: 'Puoi vedere nell\'oscurità e nella luce fioca così bene come nella luce intensa.'
            },
            {
                name: 'Clan Dagger',
                nameIt: 'Pugnale del Clan',
                description: 'You get a free clan dagger at character creation.',
                descriptionIt: 'Ottieni un pugnale del clan gratuito alla creazione del personaggio.'
            }
        ]
    },
    {
        id: 'gnome',
        name: 'Gnome',
        nameIt: 'Gnomo',
        description: 'Gnomes are short, curious creatures who originated from the First World and retain a connection to that realm of fey.',
        descriptionIt: 'Gli gnomi sono creature piccole e curiose originarie del Primo Mondo, che mantengono una connessione con quel reame fatato.',
        source: { book: 'Player Core', page: 50 },
        rarity: 'common',
        traits: ['gnome', 'humanoid'],
        hitPoints: 8,
        size: 'small',
        speed: 25,
        abilityBoosts: ['con', 'cha', 'free'],
        abilityFlaws: ['str'],
        languages: ['Common', 'Gnomish', 'Sylvan'],
        bonusLanguages: ['Draconic', 'Dwarven', 'Elven', 'Goblin', 'Jotun', 'Orcish'],
        features: [
            {
                name: 'Low-Light Vision',
                nameIt: 'Visione Crepuscolare',
                description: 'You can see in dim light as though it were bright light.',
                descriptionIt: 'Puoi vedere in luce fioca come se fosse luce intensa.'
            }
        ]
    },
    {
        id: 'goblin',
        name: 'Goblin',
        nameIt: 'Goblin',
        description: 'Goblins are a short, scrappy folk who have spent most of their history on society\'s fringes.',
        descriptionIt: 'I goblin sono un popolo piccolo e combattivo che ha trascorso la maggior parte della sua storia ai margini della società.',
        source: { book: 'Player Core', page: 52 },
        rarity: 'common',
        traits: ['goblin', 'humanoid'],
        hitPoints: 6,
        size: 'small',
        speed: 25,
        abilityBoosts: ['dex', 'cha', 'free'],
        abilityFlaws: ['wis'],
        languages: ['Common', 'Goblin'],
        bonusLanguages: ['Draconic', 'Dwarven', 'Gnoll', 'Gnomish', 'Halfling', 'Orcish'],
        features: [
            {
                name: 'Darkvision',
                nameIt: 'Scurovisione',
                description: 'You can see in darkness and dim light just as well as you can see in bright light.',
                descriptionIt: 'Puoi vedere nell\'oscurità e nella luce fioca così bene come nella luce intensa.'
            }
        ]
    },
    {
        id: 'halfling',
        name: 'Halfling',
        nameIt: 'Halfling',
        description: 'Halflings are a short, adaptable people who have spread throughout the world, often living among other ancestries.',
        descriptionIt: 'Gli halfling sono un popolo piccolo e adattabile, diffuso in tutto il mondo, che spesso vive tra altre stirpi.',
        source: { book: 'Player Core', page: 56 },
        rarity: 'common',
        traits: ['halfling', 'humanoid'],
        hitPoints: 6,
        size: 'small',
        speed: 25,
        abilityBoosts: ['dex', 'wis', 'free'],
        abilityFlaws: ['str'],
        languages: ['Common', 'Halfling'],
        bonusLanguages: ['Dwarven', 'Elven', 'Gnomish', 'Goblin'],
        features: [
            {
                name: 'Keen Eyes',
                nameIt: 'Occhi Acuti',
                description: 'Your eyes are sharp, granting you a +2 circumstance bonus to locate hidden objects.',
                descriptionIt: 'I tuoi occhi sono acuti, conferendoti un bonus di circostanza +2 per individuare oggetti nascosti.'
            }
        ]
    },
    {
        id: 'leshy',
        name: 'Leshy',
        nameIt: 'Leshy',
        description: 'Leshies are small, plant-based creatures who are awakened by druids and other guardians of nature.',
        descriptionIt: 'I leshy sono piccole creature vegetali risvegliate da druidi e altri guardiani della natura.',
        source: { book: 'Player Core', page: 58 },
        rarity: 'common',
        traits: ['leshy', 'plant'],
        hitPoints: 8,
        size: 'small',
        speed: 25,
        abilityBoosts: ['con', 'wis', 'free'],
        abilityFlaws: ['int'],
        languages: ['Common', 'Sylvan'],
        bonusLanguages: ['Draconic', 'Elven', 'Gnomish', 'Goblin', 'Halfling', 'Undercommon'],
        features: [
            {
                name: 'Low-Light Vision',
                nameIt: 'Visione Crepuscolare',
                description: 'You can see in dim light as though it were bright light.',
                descriptionIt: 'Puoi vedere in luce fioca come se fosse luce intensa.'
            },
            {
                name: 'Plant Nourishment',
                nameIt: 'Nutrimento Vegetale',
                description: 'You gain nourishment from sunlight and water rather than eating food.',
                descriptionIt: 'Ti nutri di luce solare e acqua invece di mangiare cibo.'
            }
        ]
    },
    {
        id: 'orc',
        name: 'Orc',
        nameIt: 'Orco',
        description: 'Orcs are a passionate, proud people who value strength and individual prowess.',
        descriptionIt: 'Gli orchi sono un popolo appassionato e orgoglioso che valorizza la forza e il valore individuale.',
        source: { book: 'Player Core', page: 60 },
        rarity: 'common',
        traits: ['orc', 'humanoid'],
        hitPoints: 10,
        size: 'medium',
        speed: 25,
        abilityBoosts: ['str', 'free'],
        abilityFlaws: [],
        languages: ['Common', 'Orcish'],
        bonusLanguages: ['Goblin', 'Jotun', 'Terran', 'Undercommon'],
        features: [
            {
                name: 'Darkvision',
                nameIt: 'Scurovisione',
                description: 'You can see in darkness and dim light just as well as you can see in bright light.',
                descriptionIt: 'Puoi vedere nell\'oscurità e nella luce fioca così bene come nella luce intensa.'
            }
        ]
    }
];

export const heritages: Heritage[] = [
    // Human Heritages
    {
        id: 'skilled-heritage',
        name: 'Skilled Heritage',
        nameIt: 'Retaggio Esperto',
        ancestryId: 'human',
        description: 'Your ingenuity allows you to train in a wide variety of skills.',
        descriptionIt: 'La tua ingegnosità ti permette di addestrarti in una vasta gamma di abilità.',
        source: { book: 'Player Core', page: 55 },
        rarity: 'common',
        traits: [],
        features: [
            {
                name: 'Trained Skill',
                nameIt: 'Abilità Addestrata',
                description: 'You become trained in one skill of your choice.',
                descriptionIt: 'Diventi addestrato in un\'abilità a tua scelta.'
            }
        ]
    },
    {
        id: 'versatile-heritage',
        name: 'Versatile Heritage',
        nameIt: 'Retaggio Versatile',
        ancestryId: 'human',
        description: 'Humanity\'s versatility grants you an additional general feat.',
        descriptionIt: 'La versatilità umana ti conferisce un talento generico aggiuntivo.',
        source: { book: 'Player Core', page: 55 },
        rarity: 'common',
        traits: [],
        features: [
            {
                name: 'Extra Feat',
                nameIt: 'Talento Extra',
                description: 'You gain a 1st-level general feat.',
                descriptionIt: 'Ottieni un talento generico di 1° livello.'
            }
        ]
    },
    // Elf Heritages
    {
        id: 'cavern-elf',
        name: 'Cavern Elf',
        nameIt: 'Elfo delle Caverne',
        ancestryId: 'elf',
        description: 'You were born underground and have darkvision.',
        descriptionIt: 'Sei nato sottoterra e possiedi scurovisione.',
        source: { book: 'Player Core', page: 49 },
        rarity: 'common',
        traits: [],
        features: [
            {
                name: 'Darkvision',
                nameIt: 'Scurovisione',
                description: 'You gain darkvision.',
                descriptionIt: 'Ottieni scurovisione.'
            }
        ]
    },
    {
        id: 'woodland-elf',
        name: 'Woodland Elf',
        nameIt: 'Elfo dei Boschi',
        ancestryId: 'elf',
        description: 'You\'re adapted to life in the forest.',
        descriptionIt: 'Sei adattato alla vita nella foresta.',
        source: { book: 'Player Core', page: 49 },
        rarity: 'common',
        traits: [],
        features: [
            {
                name: 'Forest Walker',
                nameIt: 'Camminatore dei Boschi',
                description: 'You can move through forest terrain without penalty.',
                descriptionIt: 'Puoi muoverti attraverso terreni forestali senza penalità.'
            }
        ]
    },
    // Dwarf Heritages
    {
        id: 'rock-dwarf',
        name: 'Rock Dwarf',
        nameIt: 'Nano della Roccia',
        ancestryId: 'dwarf',
        description: 'Your ancestors lived in stone halls carved deep in the mountains.',
        descriptionIt: 'I tuoi antenati vivevano in sale di pietra scavate nelle profondità delle montagne.',
        source: { book: 'Player Core', page: 45 },
        rarity: 'common',
        traits: [],
        features: [
            {
                name: 'Rock Runner',
                nameIt: 'Corridore delle Rocce',
                description: 'You can move through rocky terrain without penalty.',
                descriptionIt: 'Puoi muoverti attraverso terreni rocciosi senza penalità.'
            }
        ]
    },
    {
        id: 'forge-dwarf',
        name: 'Forge Dwarf',
        nameIt: 'Nano della Forgia',
        ancestryId: 'dwarf',
        description: 'You have a natural resistance to fire from your ancestors\' work at the forge.',
        descriptionIt: 'Hai una resistenza naturale al fuoco grazie al lavoro alla forgia dei tuoi antenati.',
        source: { book: 'Player Core', page: 45 },
        rarity: 'common',
        traits: [],
        features: [
            {
                name: 'Fire Resistance',
                nameIt: 'Resistenza al Fuoco',
                description: 'You gain fire resistance equal to half your level (minimum 1).',
                descriptionIt: 'Ottieni resistenza al fuoco pari a metà del tuo livello (minimo 1).'
            }
        ]
    }
];

export function getAncestryById(id: string): Ancestry | undefined {
    return ancestries.find(a => a.id === id);
}

export function getHeritagesForAncestry(ancestryId: string): Heritage[] {
    return heritages.filter(h => h.ancestryId === ancestryId);
}
