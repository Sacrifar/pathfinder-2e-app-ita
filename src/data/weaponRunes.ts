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
    Speed: {
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
