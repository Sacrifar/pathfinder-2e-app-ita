/**
 * Weapon Runes Data
 * Rune data from Pathfinder 2e Core Rulebook and GM Guide
 */

export interface PropertyRuneData {
    id: string;
    name: string;
    nameIt?: string;
    level: number;
    price: number;
    rarity: 'common' | 'uncommon' | 'rare';
    traits: string[];
    damage?: {
        type: string;
        dice: string;
        persistent?: boolean;
    };
    description?: string;
    descriptionIt?: string;
}

// Fundamental Weapon Runes (Potency & Striking)
export const FUNDAMENTAL_RUNES = {
    potency: [
        { value: 1, level: 2, price: 35, name: '+1 Potency Rune', nameIt: 'Runa Potenza +1' },
        { value: 2, level: 10, price: 935, name: '+2 Potency Rune', nameIt: 'Runa Potenza +2' },
        { value: 3, level: 16, price: 8935, name: '+3 Potency Rune', nameIt: 'Runa Potenza +3' },
    ],
    striking: [
        { value: 'striking', level: 4, price: 65, name: 'Striking Rune', nameIt: 'Runa Colpitore', diceBonus: 1 },
        { value: 'greaterStriking', level: 12, price: 1065, name: 'Greater Striking Rune', nameIt: 'Runa Grande Colpitore', diceBonus: 2 },
        { value: 'majorStriking', level: 19, price: 31065, name: 'Major Striking Rune', nameIt: 'Runa Suprema Colpitore', diceBonus: 3 },
    ],
};

// Property Runes - most commonly used ones
export const PROPERTY_RUNES: Record<string, PropertyRuneData> = {
    frost: {
        id: 'frost',
        name: 'Frost',
        nameIt: 'Gelo',
        level: 8,
        price: 500,
        rarity: 'common',
        traits: ['cold', 'magical'],
        damage: {
            type: 'cold',
            dice: '1d6',
        },
        description: 'The weapon deals an additional 1d6 cold damage on a successful hit.',
        descriptionIt: 'L\'arma infligge 1d6 danni da freddo aggiuntivi con un colpo andato a buon fine.',
    },
    flaming: {
        id: 'flaming',
        name: 'Flaming',
        nameIt: 'Fiammante',
        level: 8,
        price: 500,
        rarity: 'common',
        traits: ['fire', 'magical'],
        damage: {
            type: 'fire',
            dice: '1d6',
            persistent: true,
        },
        description: 'The weapon deals an additional 1d6 fire damage and 1d10 persistent fire damage on a critical hit.',
        descriptionIt: 'L\'arma infligge 1d6 danni da fuoco e 1d10 danni persistenti da fuoco su un colpo critico.',
    },
    shock: {
        id: 'shock',
        name: 'Shock',
        nameIt: 'Scossa',
        level: 8,
        price: 500,
        rarity: 'common',
        traits: ['electricity', 'magical'],
        damage: {
            type: 'electricity',
            dice: '1d6',
        },
        description: 'The weapon deals an additional 1d6 electricity damage on a successful hit.',
        descriptionIt: 'L\'arma infligge 1d6 danni da elettricità aggiuntivi con un colpo andato a buon fine.',
    },
    corrosive: {
        id: 'corrosive',
        name: 'Corrosive',
        nameIt: 'Corrosivo',
        level: 8,
        price: 500,
        rarity: 'common',
        traits: ['acid', 'magical'],
        damage: {
            type: 'acid',
            dice: '1d6',
        },
        description: 'The weapon deals an additional 1d6 acid damage on a successful hit.',
        descriptionIt: 'L\'arma infligge 1d6 danni da acido aggiuntivi con un colpo andato a buon fine.',
    },
    ghostTouch: {
        id: 'ghostTouch',
        name: 'Ghost Touch',
        nameIt: 'Tocco Spettrale',
        level: 4,
        price: 75,
        rarity: 'common',
        traits: ['magical'],
        description: 'The weapon can damage incorporeal creatures with no attack roll penalty.',
        descriptionIt: 'L\'arma può danneggiare creature incorporee senza penalità al tiro di attacco.',
    },
    keen: {
        id: 'keen',
        name: 'Keen',
        nameIt: 'Affilato',
        level: 13,
        price: 3000,
        rarity: 'uncommon',
        traits: ['magical'],
        description: 'On a 19, the attack counts as a critical hit (20 is still a critical hit).',
        descriptionIt: 'Su un 19, l\'attacco conta come colpo critico (il 20 è comunque un colpo critico).',
    },
    returning: {
        id: 'returning',
        name: 'Returning',
        nameIt: 'Di Ritorno',
        level: 3,
        price: 55,
        rarity: 'common',
        traits: ['magical'],
        description: 'The weapon returns to your hand after making a thrown attack.',
        descriptionIt: 'L\'arma ritorna nella tua mano dopo aver effettuato un attacco a distanza.',
    },
    wounding: {
        id: 'wounding',
        name: 'Wounding',
        nameIt: 'Ferrimento',
        level: 7,
        price: 340,
        rarity: 'common',
        traits: ['magical'],
        damage: {
            type: 'bleed',
            dice: '1d6',
            persistent: true,
        },
        description: 'The weapon deals an additional 1d6 persistent bleed damage.',
        descriptionIt: 'L\'arma infligge 1d6 danni persistenti da sanguinamento.',
    },
    holy: {
        id: 'holy',
        name: 'Holy',
        nameIt: 'Santo',
        level: 11,
        price: 1400,
        rarity: 'common',
        traits: ['holy', 'magical'],
        damage: {
            type: 'spirit',
            dice: '1d4',
        },
        description: 'The weapon deals additional spirit damage to unholy targets.',
        descriptionIt: 'L\'arma infligge danni spirituali aggiuntivi ai target non santi.',
    },
    unholy: {
        id: 'unholy',
        name: 'Unholy',
        nameIt: 'Profano',
        level: 11,
        price: 1400,
        rarity: 'common',
        traits: ['unholy', 'magical'],
        damage: {
            type: 'spirit',
            dice: '1d4',
        },
        description: 'The weapon deals additional spirit damage to holy targets.',
        descriptionIt: 'L\'arma infligge danni spirituali aggiuntivi ai target santi.',
    },
    disrupting: {
        id: 'disrupting',
        name: 'Disrupting',
        nameIt: 'Dispersante',
        level: 5,
        price: 150,
        rarity: 'common',
        traits: ['magical'],
        damage: {
            type: 'vitality',
            dice: '1d6',
            persistent: true,
        },
        description: 'The weapon deals additional vitality damage to negative healing creatures.',
        descriptionIt: 'L\'arma infligge danni vitali aggiuntivi alle creature con Guarigione Negativa.',
    },
    vorpal: {
        id: 'vorpal',
        name: 'Vorpal',
        nameIt: 'Vorpal',
        level: 17,
        price: 15000,
        rarity: 'rare',
        traits: ['magical'],
        description: 'On a critical hit, the weapon decapitates the target if it has a head.',
        descriptionIt: 'Su un colpo critico, l\'arma decapita il target se ha una testa.',
    },
    dancing: {
        id: 'dancing',
        name: 'Dancing',
        nameIt: 'Danzante',
        level: 13,
        price: 2700,
        rarity: 'uncommon',
        traits: ['magical'],
        description: 'The weapon can fight on its own for a limited time.',
        descriptionIt: 'L\'arma può combattere da sola per un tempo limitato.',
    },
    thundering: {
        id: 'thundering',
        name: 'Thundering',
        nameIt: 'Tonante',
        level: 8,
        price: 500,
        rarity: 'common',
        traits: ['magical', 'sonic'],
        damage: {
            type: 'sonic',
            dice: '1d6',
        },
        description: 'The weapon deals an additional 1d6 sonic damage.',
        descriptionIt: 'L\'arma infligge 1d6 danni sonori aggiuntivi.',
    },
    anchoring: {
        id: 'anchoring',
        name: 'Anchoring',
        nameIt: 'Àncora',
        level: 10,
        price: 900,
        rarity: 'uncommon',
        traits: ['magical'],
        description: 'On a critical hit, the weapon prevents the target from moving away.',
        descriptionIt: 'Su un colpo critico, l\'arma impedisce al target di allontanarsi.',
    },
    transformative: {
        id: 'transformative',
        name: 'Transformative',
        nameIt: 'Trasformativo',
        level: 6,
        price: 250,
        rarity: 'common',
        traits: ['magical'],
        description: 'The weapon can transform into another weapon of the same group.',
        descriptionIt: 'L\'arma può trasformarsi in un\'altra arma dello stesso gruppo.',
    },
    speed: {
        id: 'speed',
        name: 'Speed',
        nameIt: 'Velocità',
        level: 16,
        price: 10000,
        rarity: 'rare',
        traits: ['magical'],
        description: 'You can make an extra attack with this weapon each round.',
        descriptionIt: 'Puoi fare un attacco extra con quest\'arma ogni round.',
    },
    // Additional Property Runes from PF2E sources
    throwing: {
        id: 'throwing',
        name: 'Throwing',
        nameIt: 'Di Lancio',
        level: 1,
        price: 15,
        rarity: 'common',
        traits: ['magical'],
        description: 'The weapon can be thrown with a range increment of 20 feet.',
        descriptionIt: 'L\'arma può essere lanciata con un increment di gittata di 20 piedi.',
    },
    axiomatic: {
        id: 'axiomatic',
        name: 'Axiomatic',
        nameIt: 'Assiomatico',
        level: 15,
        price: 6500,
        rarity: 'uncommon',
        traits: ['lawful', 'magical'],
        damage: {
            type: 'spirit',
            dice: '1d6',
        },
        description: 'The weapon deals additional spirit damage to chaotic targets.',
        descriptionIt: 'L\'arma infligge danni spirituali aggiuntivi ai target caotici.',
    },
    anarchic: {
        id: 'anarchic',
        name: 'Anarchic',
        nameIt: 'Anarchico',
        level: 15,
        price: 6500,
        rarity: 'uncommon',
        traits: ['chaotic', 'magical'],
        damage: {
            type: 'spirit',
            dice: '1d6',
        },
        description: 'The weapon deals additional spirit damage to lawful targets.',
        descriptionIt: 'L\'arma infligge danni spirituali aggiuntivi ai target legali.',
    },
    seeking: {
        id: 'seeking',
        name: 'Seeking',
        nameIt: 'Cercatore',
        level: 10,
        price: 900,
        rarity: 'uncommon',
        traits: ['magical'],
        description: 'The weapon ignores concealment and cover penalties.',
        descriptionIt: 'L\'arma ignora le penalità di copertura e occultamento.',
    },
    dispatching: {
        id: 'dispatching',
        name: 'Dispatching',
        nameIt: 'Finale',
        level: 6,
        price: 225,
        rarity: 'uncommon',
        traits: ['magical'],
        damage: {
            type: 'positive',
            dice: '1d6',
        },
        description: 'The weapon deals additional positive damage to undead.',
        descriptionIt: 'L\'arma infligge danni positivi aggiuntivi ai non morti.',
    },
    grievous: {
        id: 'grievous',
        name: 'Grievous',
        nameIt: 'Grave',
        level: 10,
        price: 900,
        rarity: 'uncommon',
        traits: ['magical'],
        damage: {
            type: 'bleed',
            dice: '2d4',
            persistent: true,
        },
        description: 'The weapon deals additional persistent bleed damage that increases on critical hits.',
        descriptionIt: 'L\'arma infligge danni persistenti da sanguinamento che aumentano su colpi critici.',
    },
    annihilating: {
        id: 'annihilating',
        name: 'Annihilating',
        nameIt: 'Annichilente',
        level: 13,
        price: 2800,
        rarity: 'rare',
        traits: ['magical'],
        damage: {
            type: 'force',
            dice: '2d6',
        },
        description: 'The weapon deals additional force damage that affects all creatures.',
        descriptionIt: 'L\'arma infligge danni da forza aggiuntivi che affectano tutte le creature.',
    },
    ominous: {
        id: 'ominous',
        name: 'Ominous',
        nameIt: 'Ominos',
        level: 7,
        price: 340,
        rarity: 'uncommon',
        traits: ['emotion', 'fear', 'magical', 'mental'],
        description: 'On a critical hit, the target becomes frightened 1.',
        descriptionIt: 'Su un colpo critico, il target diventa spaventato 1.',
    },
    impact: {
        id: 'impact',
        name: 'Impact',
        nameIt: 'Impatto',
        level: 8,
        price: 500,
        rarity: 'uncommon',
        traits: ['magical'],
        description: 'On a critical hit, the weapon deals additional dice of damage equal to the weapon\'s number of damage dice.',
        descriptionIt: 'Su un colpo critico, l\'arma infligge dadi addizionali pari al numero di dadi dell\'arma.',
    },
    terror: {
        id: 'terror',
        name: 'Terror',
        nameIt: 'Terrore',
        level: 9,
        price: 650,
        rarity: 'uncommon',
        traits: ['emotion', 'fear', 'magical', 'mental'],
        description: 'On a hit, the target must succeed at a Will save or become frightened.',
        descriptionIt: 'Su un colpo, il target deve superare un tiro salvezza Volontà o diventare spaventato.',
    },
    spellStoring: {
        id: 'spellStoring',
        name: 'Spell-Storing',
        nameIt: 'Memoria Incantesimi',
        level: 12,
        price: 1800,
        rarity: 'uncommon',
        traits: ['magical'],
        description: 'The weapon can store one spell that can be cast once when striking.',
        descriptionIt: 'L\'arma può memorizzare un incantesimo che può essere lanciato una volta colpendo.',
    },
    corrosiveGreater: {
        id: 'corrosiveGreater',
        name: 'Greater Corrosive',
        nameIt: 'Corrosivo Maggiore',
        level: 14,
        price: 4000,
        rarity: 'common',
        traits: ['acid', 'magical'],
        damage: {
            type: 'acid',
            dice: '2d6',
        },
        description: 'The weapon deals an additional 2d6 acid damage on a successful hit.',
        descriptionIt: 'L\'arma infligge 2d6 danni da acido aggiuntivi con un colpo andato a buon fine.',
    },
    flamingGreater: {
        id: 'flamingGreater',
        name: 'Greater Flaming',
        nameIt: 'Fiammante Maggiore',
        level: 14,
        price: 4000,
        rarity: 'common',
        traits: ['fire', 'magical'],
        damage: {
            type: 'fire',
            dice: '2d6',
            persistent: true,
        },
        description: 'The weapon deals an additional 2d6 fire damage and 2d10 persistent fire damage on a critical hit.',
        descriptionIt: 'L\'arma infligge 2d6 danni da fuoco e 2d10 danni persistenti da fuoco su un colpo critico.',
    },
    frostGreater: {
        id: 'frostGreater',
        name: 'Greater Frost',
        nameIt: 'Gelo Maggiore',
        level: 14,
        price: 4000,
        rarity: 'common',
        traits: ['cold', 'magical'],
        damage: {
            type: 'cold',
            dice: '2d6',
        },
        description: 'The weapon deals an additional 2d6 cold damage on a successful hit.',
        descriptionIt: 'L\'arma infligge 2d6 danni da freddo aggiuntivi con un colpo andato a buon fine.',
    },
    shockGreater: {
        id: 'shockGreater',
        name: 'Greater Shock',
        nameIt: 'Scossa Maggiore',
        level: 14,
        price: 4000,
        rarity: 'common',
        traits: ['electricity', 'magical'],
        damage: {
            type: 'electricity',
            dice: '2d6',
        },
        description: 'The weapon deals an additional 2d6 electricity damage on a successful hit.',
        descriptionIt: 'L\'arma infligge 2d6 danni da elettricità aggiuntivi con un colpo andato a buon fine.',
    },
    thunderingGreater: {
        id: 'thunderingGreater',
        name: 'Greater Thundering',
        nameIt: 'Tonante Maggiore',
        level: 14,
        price: 4000,
        rarity: 'common',
        traits: ['magical', 'sonic'],
        damage: {
            type: 'sonic',
            dice: '2d6',
        },
        description: 'The weapon deals an additional 2d6 sonic damage.',
        descriptionIt: 'L\'arma infligge 2d6 danni sonori aggiuntivi.',
    },
    vorpalGreater: {
        id: 'vorpalGreater',
        name: 'Greater Vorpal',
        nameIt: 'Vorpal Maggiore',
        level: 20,
        price: 25000,
        rarity: 'rare',
        traits: ['magical'],
        description: 'On a critical hit, the weapon decapitates the target. On a 19, it counts as a critical hit.',
        descriptionIt: 'Su un colpo critico, l\'arma decapita il target. Su un 19, conta come colpo critico.',
    },
    // Remaster (Player Core) additions
    corrosiveBurst: {
        id: 'corrosiveBurst',
        name: 'Corrosive Burst',
        nameIt: 'Scoppio Corrosivo',
        level: 12,
        price: 1800,
        rarity: 'common',
        traits: ['acid', 'magical'],
        damage: {
            type: 'acid',
            dice: '1d6',
        },
        description: 'The weapon deals 1d6 acid damage on a hit and 2d6 on a critical hit.',
        descriptionIt: 'L\'arma infligge 1d6 danni da acido su un colpo e 2d6 su un colpo critico.',
    },
    flamingBurst: {
        id: 'flamingBurst',
        name: 'Flaming Burst',
        nameIt: 'Scoppio Fiammante',
        level: 12,
        price: 1800,
        rarity: 'common',
        traits: ['fire', 'magical'],
        damage: {
            type: 'fire',
            dice: '1d6',
            persistent: true,
        },
        description: 'The weapon deals 1d6 fire damage on a hit and 1d10 persistent fire damage on a critical hit.',
        descriptionIt: 'L\'arma infligge 1d6 danni da fuoco su un colpo e 1d10 danni persistenti da fuoco su un colpo critico.',
    },
    icyBurst: {
        id: 'icyBurst',
        name: 'Icy Burst',
        nameIt: 'Scoppio Ghiacciato',
        level: 12,
        price: 1800,
        rarity: 'common',
        traits: ['cold', 'magical'],
        damage: {
            type: 'cold',
            dice: '1d6',
        },
        description: 'The weapon deals 1d6 cold damage on a hit and 2d6 on a critical hit.',
        descriptionIt: 'L\'arma infligge 1d6 danni da freddo su un colpo e 2d6 su un colpo critico.',
    },
    shockingBurst: {
        id: 'shockingBurst',
        name: 'Shocking Burst',
        nameIt: 'Scoppio Scintillante',
        level: 12,
        price: 1800,
        rarity: 'common',
        traits: ['electricity', 'magical'],
        damage: {
            type: 'electricity',
            dice: '1d6',
        },
        description: 'The weapon deals 1d6 electricity damage on a hit and 2d6 on a critical hit.',
        descriptionIt: 'L\'arma infligge 1d6 danni da elettricità su un colpo e 2d6 su un colpo critico.',
    },
};

// Helper function to get max property runes based on potency
export function getMaxPropertyRunes(potencyRune: number): number {
    return Math.min(potencyRune, 4);
}

// Helper function to get property rune price
export function getPropertyRunePrice(runeId: string): number {
    return PROPERTY_RUNES[runeId]?.price || 0;
}

// Helper function to check if property rune is valid for potency level
export function isValidPropertyRune(runeId: string, potencyRune: number): boolean {
    const rune = PROPERTY_RUNES[runeId];
    if (!rune) return false;

    // Property runes must be <= (potency rune level + 3)
    return rune.level <= (potencyRune + 3);
}

// Get list of available property runes for a given potency level
export function getAvailablePropertyRunes(potencyRune: number): PropertyRuneData[] {
    const maxLevel = potencyRune + 3;
    return Object.values(PROPERTY_RUNES).filter(rune => rune.level <= maxLevel);
}
