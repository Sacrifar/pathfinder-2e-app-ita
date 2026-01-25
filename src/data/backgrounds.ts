/**
 * Pathfinder 2e Backgrounds
 * Loads all backgrounds from PF2E JSON data files
 */

import type { Background } from '../types';
import { getBackgrounds as getLoadedBackgrounds, type LoadedBackground } from './pf2e-loader';

// Map from LoadedBackground to Background type (with Italian translations)
function mapToBackground(loaded: LoadedBackground): Background {
    // Italian translations will be added gradually - for now use English names
    const translations: Record<string, { nameIt: string; descriptionIt: string }> = {
        'acolyte': {
            nameIt: 'Accolito',
            descriptionIt: 'Hai trascorso i tuoi primi giorni in un monastero o convento religioso.'
        },
        'acrobat': {
            nameIt: 'Acrobata',
            descriptionIt: 'In un circo o per le strade, ti guadagnavi da vivere facendo acrobazie e spettacoli audaci.'
        },
        'artisan': {
            nameIt: 'Artigiano',
            descriptionIt: 'Come apprendista, hai praticato una particolare forma di costruzione o artigianato.'
        },
        'barkeep': {
            nameIt: 'Oste',
            descriptionIt: 'Hai visto di tutto nel tempo passato dietro il bancone. Sei veloce con un drink e una conversazione.'
        },
        'charlatan': {
            nameIt: 'Ciarlatano',
            descriptionIt: 'Hai viaggiato di luogo in luogo, vendendo false pozioni o altri prodotti inutili.'
        },
        'criminal': {
            nameIt: 'Criminale',
            descriptionIt: 'Come agente illecito in un sindacato criminale, rubavi beni o contrabbandavi merci.'
        },
        'entertainer': {
            nameIt: 'Intrattenitore',
            descriptionIt: 'Attraverso un\'arte performativa eclettica, hai ispirato emozioni nel tuo pubblico.'
        },
        'farmhand': {
            nameIt: 'Bracciante',
            descriptionIt: 'Con una schiena forte e una comprensione dei cicli stagionali, sei cresciuto coltivando la terra.'
        },
        'fortune-teller': {
            nameIt: 'Indovino',
            descriptionIt: 'I fili del destino sono esposti ai tuoi occhi.'
        },
        'gladiator': {
            nameIt: 'Gladiatore',
            descriptionIt: 'Il ruggito della folla e il brivido del combattimento scorrono nel tuo sangue.'
        },
        'guard': {
            nameIt: 'Guardia',
            descriptionIt: 'Hai servito come guardia, sia in una città che nelle terre vicine.'
        },
        'herbalist': {
            nameIt: 'Erborista',
            descriptionIt: 'Come farmacista formalmente formato o come praticante rurale di medicina popolare, hai appreso le proprietà curative di varie erbe.'
        },
        'hermit': {
            nameIt: 'Eremita',
            descriptionIt: 'In un luogo isolato—come una grotta, una capanna remota o un boschetto appartato—hai trovato quiete e solitudine.'
        },
        'hunter': {
            nameIt: 'Cacciatore',
            descriptionIt: 'Hai inseguito e ucciso animali selvatici, imparando i loro comportamenti.'
        },
        'laborer': {
            nameIt: 'Manovale',
            descriptionIt: 'Hai trascorso anni a svolgere lavori fisici nei campi o nei cantieri.'
        },
        'merchant': {
            nameIt: 'Mercante',
            descriptionIt: 'In un negozio polveroso o viaggiando con una carovana, ti guadagnavi da vivere comprando e vendendo merci.'
        },
        'noble': {
            nameIt: 'Nobile',
            descriptionIt: 'Ai nobili vengono concessi molti privilegi, e molto ci si aspetta in cambio.'
        },
        'sailor': {
            nameIt: 'Marinaio',
            descriptionIt: 'Per molti anni hai chiamato il mare la tua casa. Venti e maree guidano la tua intuizione.'
        },
        'saloon-entertainer': {
            nameIt: 'Intrattenitore da Saloon',
            descriptionIt: 'Tutto ciò che vuoi fare è intrattenere la gente, ma con certezza, cattive notizie sembrano seguirti.'
        },
        'scholar': {
            nameIt: 'Studioso',
            descriptionIt: 'Hai una profonda passione per l\'apprendimento e ti sei dedicato ai tuoi studi.'
        },
        'scout': {
            nameIt: 'Esploratore',
            descriptionIt: 'Hai chiamato la natura selvaggia la tua casa mentre trovavi sentieri e guidavi viaggiatori.'
        },
        'street-urchin': {
            nameIt: 'Monello',
            descriptionIt: 'Sei cresciuto per le strade, imparando a sopravvivere nei bassifondi di una città.'
        },
        'warrior': {
            nameIt: 'Guerriero',
            descriptionIt: 'Nei tuoi giorni più giovani, ti sei allenato con le armi e hai imparato tattiche di battaglia.'
        },
    };

    const translation = translations[loaded.id];
    const loreSkill = loaded.trainedLore || 'General Lore';

    return {
        id: loaded.id,
        name: loaded.name,
        nameIt: translation?.nameIt || loaded.name,
        description: loaded.description,
        descriptionIt: translation?.descriptionIt || loaded.description,
        source: { book: loaded.source },
        rarity: loaded.rarity as 'common' | 'uncommon' | 'rare' | 'unique',
        traits: loaded.traits,
        abilityBoosts: loaded.boosts as ('str' | 'dex' | 'con' | 'int' | 'wis' | 'cha' | 'free')[],
        trainedSkills: loaded.trainedSkills as ('Acrobatics' | 'Arcana' | 'Athletics' | 'Crafting' | 'Deception' | 'Diplomacy' | 'Intimidation' | 'Medicine' | 'Nature' | 'Occultism' | 'Performance' | 'Religion' | 'Society' | 'Stealth' | 'Survival' | 'Thievery')[],
        trainedLore: loreSkill,
        featId: loaded.featId
    };
}

// Get all backgrounds with translations
export function getBackgrounds(): Background[] {
    const loaded = getLoadedBackgrounds();
    return loaded.map(mapToBackground);
}

export function getBackgroundById(id: string): Background | undefined {
    const loaded = getLoadedBackgrounds();
    const found = loaded.find(b => b.id === id);
    return found ? mapToBackground(found) : undefined;
}

export function getAllBackgrounds(): Background[] {
    return getBackgrounds();
}
