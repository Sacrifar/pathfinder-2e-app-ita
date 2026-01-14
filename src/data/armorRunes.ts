/**
 * Armor Runes Data
 * Rune data from Pathfinder 2e Core Rulebook and GM Guide
 */

export interface ArmorPropertyRuneData {
    id: string;
    name: string;
    nameIt?: string;
    level: number;
    price: number;
    rarity: 'common' | 'uncommon' | 'rare';
    traits: string[];
    description?: string;
    descriptionIt?: string;
}

// Fundamental Armor Runes (Potency & Resilient)
export const ARMOR_FUNDAMENTAL_RUNES = {
    potency: [
        { value: 1, level: 5, price: 160, name: '+1 Armor Potency Rune', nameIt: 'Runa Potenza Armatura +1' },
        { value: 2, level: 11, price: 1060, name: '+2 Armor Potency Rune', nameIt: 'Runa Potenza Armatura +2' },
        { value: 3, level: 18, price: 20560, name: '+3 Armor Potency Rune', nameIt: 'Runa Potenza Armatura +3' },
        { value: 4, level: 20, price: 70000, name: '+4 Armor Potency Rune', nameIt: 'Runa Potenza Armatura +4', rarity: 'rare' },
    ],
    resilient: [
        { value: 1, level: 8, price: 340, name: 'Resilient Rune', nameIt: 'Runa Resiliente' },
        { value: 2, level: 14, price: 3440, name: 'Greater Resilient Rune', nameIt: 'Runa Grande Resiliente' },
        { value: 3, level: 20, price: 49440, name: 'Major Resilient Rune', nameIt: 'Runa Suprema Resiliente' },
    ],
};

// Armor Property Runes - most commonly used ones
export const ARMOR_PROPERTY_RUNES: Record<string, ArmorPropertyRuneData> = {
    // Energy Resistance Runes
    acidResistant: {
        id: 'acidResistant',
        name: 'Acid Resistant',
        nameIt: 'Resistente all\'Acido',
        level: 8,
        price: 420,
        rarity: 'common',
        traits: ['magical'],
        description: 'Grants resistance to acid damage.',
        descriptionIt: 'Conferisce resistenza ai danni da acido.',
    },
    coldResistant: {
        id: 'coldResistant',
        name: 'Cold Resistant',
        nameIt: 'Resistente al Freddo',
        level: 8,
        price: 420,
        rarity: 'common',
        traits: ['magical'],
        description: 'Grants resistance to cold damage.',
        descriptionIt: 'Conferisce resistenza ai danni da freddo.',
    },
    electricityResistant: {
        id: 'electricityResistant',
        name: 'Electricity Resistant',
        nameIt: 'Resistente all\'Elettricità',
        level: 8,
        price: 420,
        rarity: 'common',
        traits: ['magical'],
        description: 'Grants resistance to electricity damage.',
        descriptionIt: 'Conferisce resistenza ai danni da elettricità.',
    },
    fireResistant: {
        id: 'fireResistant',
        name: 'Fire Resistant',
        nameIt: 'Resistente al Fuoco',
        level: 8,
        price: 420,
        rarity: 'common',
        traits: ['magical'],
        description: 'Grants resistance to fire damage.',
        descriptionIt: 'Conferisce resistenza ai danni da fuoco.',
    },
    // Greater versions
    greaterAcidResistant: {
        id: 'greaterAcidResistant',
        name: 'Greater Acid Resistant',
        nameIt: 'Resistente all\'Acido Maggiore',
        level: 12,
        price: 1650,
        rarity: 'common',
        traits: ['magical'],
        description: 'Grants greater resistance to acid damage.',
        descriptionIt: 'Conferisce resistenza maggiore ai danni da acido.',
    },
    greaterColdResistant: {
        id: 'greaterColdResistant',
        name: 'Greater Cold Resistant',
        nameIt: 'Resistente al Freddo Maggiore',
        level: 12,
        price: 1650,
        rarity: 'common',
        traits: ['magical'],
        description: 'Grants greater resistance to cold damage.',
        descriptionIt: 'Conferisce resistenza maggiore ai danni da freddo.',
    },
    greaterElectricityResistant: {
        id: 'greaterElectricityResistant',
        name: 'Greater Electricity Resistant',
        nameIt: 'Resistente all\'Elettricità Maggiore',
        level: 12,
        price: 1650,
        rarity: 'common',
        traits: ['magical'],
        description: 'Grants greater resistance to electricity damage.',
        descriptionIt: 'Conferisce resistenza maggiore ai danni da elettricità.',
    },
    greaterFireResistant: {
        id: 'greaterFireResistant',
        name: 'Greater Fire Resistant',
        nameIt: 'Resistente al Fuoco Maggiore',
        level: 12,
        price: 1650,
        rarity: 'common',
        traits: ['magical'],
        description: 'Grants greater resistance to fire damage.',
        descriptionIt: 'Conferisce resistenza maggiore ai danni da fuoco.',
    },
    // Stealth and Mobility
    shadow: {
        id: 'shadow',
        name: 'Shadow',
        nameIt: 'Ombra',
        level: 5,
        price: 55,
        rarity: 'common',
        traits: ['magical'],
        description: 'Reduces armor check penalty by 1.',
        descriptionIt: 'Riduce la penalità ai tiri dell\'armatura di 1.',
    },
    greaterShadow: {
        id: 'greaterShadow',
        name: 'Greater Shadow',
        nameIt: 'Ombra Maggiore',
        level: 9,
        price: 650,
        rarity: 'common',
        traits: ['magical'],
        description: 'Reduces armor check penalty by 2.',
        descriptionIt: 'Riduce la penalità ai tiri dell\'armatura di 2.',
    },
    majorShadow: {
        id: 'majorShadow',
        name: 'Major Shadow',
        nameIt: 'Ombra Suprema',
        level: 17,
        price: 14000,
        rarity: 'common',
        traits: ['magical'],
        description: 'Reduces armor check penalty by 3.',
        descriptionIt: 'Riduce la penalità ai tiri dell\'armatura di 3.',
    },
    slick: {
        id: 'slick',
        name: 'Slick',
        nameIt: 'Scivolosa',
        level: 5,
        price: 45,
        rarity: 'common',
        traits: ['magical'],
        description: 'Reduces armor Speed penalty by 5 ft.',
        descriptionIt: 'Riduce la penalità alla velocità dell\'armatura di 1,5 m.',
    },
    greaterSlick: {
        id: 'greaterSlick',
        name: 'Greater Slick',
        nameIt: 'Scivolosa Maggiore',
        level: 8,
        price: 450,
        rarity: 'common',
        traits: ['magical'],
        description: 'Reduces armor Speed penalty by 10 ft.',
        descriptionIt: 'Riduce la penalità alla velocità dell\'armatura di 3 m.',
    },
    majorSlick: {
        id: 'majorSlick',
        name: 'Major Slick',
        nameIt: 'Scivolosa Suprema',
        level: 16,
        price: 9000,
        rarity: 'common',
        traits: ['magical'],
        description: 'Eliminates armor Speed penalty.',
        descriptionIt: 'Elimina la penalità alla velocità dell\'armatura.',
    },
    // Invisibility and Stealth
    invisibility: {
        id: 'invisibility',
        name: 'Invisibility',
        nameIt: 'Invisibilità',
        level: 8,
        price: 500,
        rarity: 'common',
        traits: ['illusion', 'magical'],
        description: 'Can cast invisibility once per day.',
        descriptionIt: 'Può lanciare invisibilità una volta al giorno.',
    },
    greaterInvisibility: {
        id: 'greaterInvisibility',
        name: 'Greater Invisibility',
        nameIt: 'Invisibilità Maggiore',
        level: 10,
        price: 1000,
        rarity: 'common',
        traits: ['illusion', 'magical'],
        description: 'Can cast invisibility twice per day.',
        descriptionIt: 'Può lanciare invisibilità due volte al giorno.',
    },
    glamered: {
        id: 'glamered',
        name: 'Glamered',
        nameIt: 'Inganno',
        level: 5,
        price: 140,
        rarity: 'common',
        traits: ['illusion', 'magical'],
        description: 'Armor can be disguised as other clothing.',
        descriptionIt: 'L\'armatura può essere camuffata come altri vestiti.',
    },
    // Defensive Runes
    fortification: {
        id: 'fortification',
        name: 'Fortification',
        nameIt: 'Fortificazione',
        level: 12,
        price: 2000,
        rarity: 'common',
        traits: ['magical'],
        description: 'When you critically fail a Reflex save, you get a failure instead.',
        descriptionIt: 'Quando ottieni un fallimento critico ai tiri di Riflessi, ottieni un fallimento.',
    },
    greaterFortification: {
        id: 'greaterFortification',
        name: 'Greater Fortification',
        nameIt: 'Fortificazione Maggiore',
        level: 19,
        price: 24000,
        rarity: 'common',
        traits: ['magical'],
        description: 'When you critically fail a Reflex save, you get a success instead.',
        descriptionIt: 'Quando ottieni un fallimento critico ai tiri di Riflessi, ottieni un successo.',
    },
    // Quenching (anti-fire)
    quenching: {
        id: 'quenching',
        name: 'Quenching',
        nameIt: 'Spegnefuoco',
        level: 6,
        price: 250,
        rarity: 'common',
        traits: ['magical'],
        description: 'Grants fire resistance and can cast quench.',
        descriptionIt: 'Conferisce resistenza al fuoco e può lanciare spegnefuoco.',
    },
    greaterQuenching: {
        id: 'greaterQuenching',
        name: 'Greater Quenching',
        nameIt: 'Spegnefuoco Maggiore',
        level: 10,
        price: 1000,
        rarity: 'common',
        traits: ['magical'],
        description: 'Grants greater fire resistance.',
        descriptionIt: 'Conferisce resistenza maggiore al fuoco.',
    },
    majorQuenching: {
        id: 'majorQuenching',
        name: 'Major Quenching',
        nameIt: 'Spegnefuoco Supremo',
        level: 14,
        price: 4500,
        rarity: 'common',
        traits: ['magical'],
        description: 'Grants major fire resistance.',
        descriptionIt: 'Conferisce resistenza suprema al fuoco.',
    },
    // Stanching (anti-bleed)
    stanching: {
        id: 'stanching',
        name: 'Stanching',
        nameIt: 'Stanchimento',
        level: 5,
        price: 130,
        rarity: 'uncommon',
        traits: ['magical'],
        description: 'Reduces persistent bleed damage.',
        descriptionIt: 'Riduce i danni persistenti da sanguinamento.',
    },
    greaterStanching: {
        id: 'greaterStanching',
        name: 'Greater Stanching',
        nameIt: 'Stanchimento Maggiore',
        level: 9,
        price: 600,
        rarity: 'uncommon',
        traits: ['magical'],
        description: 'Negates persistent bleed damage.',
        descriptionIt: 'Nega i danni persistenti da sanguinamento.',
    },
    // Utility Runes
    energyAdaptive: {
        id: 'energyAdaptive',
        name: 'Energy Adaptive',
        nameIt: 'Adattamento Energetico',
        level: 13,
        price: 2600,
        rarity: 'common',
        traits: ['magical'],
        description: 'Adapt to one energy type as a free action.',
        descriptionIt: 'Adattati a un tipo di energia come azione gratuita.',
    },
    ready: {
        id: 'ready',
        name: 'Ready',
        nameIt: 'Pronta',
        level: 6,
        price: 200,
        rarity: 'common',
        traits: ['magical'],
        description: 'Don armor quickly.',
        descriptionIt: 'Indossa l\'armatura velocemente.',
    },
    greaterReady: {
        id: 'greaterReady',
        name: 'Greater Ready',
        nameIt: 'Pronta Maggiore',
        level: 11,
        price: 1200,
        rarity: 'common',
        traits: ['magical'],
        description: 'Don armor instantly.',
        descriptionIt: 'Indossa l\'armatura istantaneamente.',
    },
    winged: {
        id: 'winged',
        name: 'Winged',
        nameIt: 'Alata',
        level: 13,
        price: 2500,
        rarity: 'common',
        traits: ['magical'],
        description: 'Can fly for 1 minute per day.',
        descriptionIt: 'Può volare per 1 minuto al giorno.',
    },
    greaterWinged: {
        id: 'greaterWinged',
        name: 'Greater Winged',
        nameIt: 'Alata Maggiore',
        level: 19,
        price: 35000,
        rarity: 'common',
        traits: ['magical'],
        description: 'Can fly for 10 minutes per day.',
        descriptionIt: 'Può volare per 10 minuti al giorno.',
    },
    gliding: {
        id: 'gliding',
        name: 'Gliding',
        nameIt: 'Planante',
        level: 8,
        price: 450,
        rarity: 'common',
        traits: ['magical'],
        description: 'Can glide safely to the ground.',
        descriptionIt: 'Può planare verso il terreno in sicurezza.',
    },
    soaring: {
        id: 'soaring',
        name: 'Soaring',
        nameIt: 'Aliante',
        level: 14,
        price: 3750,
        rarity: 'common',
        traits: ['magical'],
        description: 'Can fly once per day.',
        descriptionIt: 'Può volare una volta al giorno.',
    },
};

// Helper function to get max property runes based on potency
export function getMaxArmorPropertyRunes(potencyRune: number): number {
    return Math.min(potencyRune, 4);
}

// Helper function to get property rune price
export function getArmorPropertyRunePrice(runeId: string): number {
    return ARMOR_PROPERTY_RUNES[runeId]?.price || 0;
}

// Helper function to check if property rune is valid for potency level
export function isValidArmorPropertyRune(runeId: string, potencyRune: number): boolean {
    const rune = ARMOR_PROPERTY_RUNES[runeId];
    if (!rune) return false;

    // Property runes must be <= (potency rune level + 4)
    return rune.level <= (potencyRune + 4);
}

// Get list of available property runes for a given potency level
export function getAvailableArmorPropertyRunes(potencyRune: number): ArmorPropertyRuneData[] {
    const maxLevel = potencyRune + 4;
    return Object.values(ARMOR_PROPERTY_RUNES).filter(rune => rune.level <= maxLevel);
}
