/**
 * Shield Runes Data
 * Rune data from Pathfinder 2e Core Rulebook and GM Guide
 */

export interface ShieldPropertyRuneData {
    id: string;
    name: string;
    nameIt?: string;
    level: number;
    price: number;
    rarity: 'common' | 'uncommon' | 'rare';
    traits: string[];
    hardnessIncrease?: number;
    maxHPIncrease?: number;
    description?: string;
    descriptionIt?: string;
}

// Fundamental Shield Runes (Reinforcing)
export const SHIELD_FUNDAMENTAL_RUNES = {
    reinforcing: [
        {
            value: 1,
            level: 4,
            price: 75,
            name: 'Minor Reinforcing Rune',
            nameIt: 'Runa Rinforzo Minore',
            hardnessIncrease: 3,
            maxHPIncrease: 44,
        },
        {
            value: 2,
            level: 7,
            price: 300,
            name: 'Lesser Reinforcing Rune',
            nameIt: 'Runa Rinforzo Inferiore',
            hardnessIncrease: 3,
            maxHPIncrease: 52,
        },
        {
            value: 3,
            level: 10,
            price: 900,
            name: 'Moderate Reinforcing Rune',
            nameIt: 'Runa Rinforzo Moderata',
            hardnessIncrease: 3,
            maxHPIncrease: 64,
        },
        {
            value: 4,
            level: 13,
            price: 2500,
            name: 'Greater Reinforcing Rune',
            nameIt: 'Runa Rinforzo Maggiore',
            hardnessIncrease: 5,
            maxHPIncrease: 80,
        },
        {
            value: 5,
            level: 16,
            price: 8000,
            name: 'Major Reinforcing Rune',
            nameIt: 'Runa Rinforzo Suprema',
            hardnessIncrease: 5,
            maxHPIncrease: 84,
        },
        {
            value: 6,
            level: 19,
            price: 32000,
            name: 'Supreme Reinforcing Rune',
            nameIt: 'Runa Rinforzo Estrema',
            hardnessIncrease: 7,
            maxHPIncrease: 108,
        },
    ],
};

// Shield Property Runes - special shield abilities
// Note: Many shields can also take weapon runes if they have shield boss or shield spikes
export const SHIELD_PROPERTY_RUNES: Record<string, ShieldPropertyRuneData> = {
    arrowCatching: {
        id: 'arrowCatching',
        name: 'Arrow Catching',
        nameIt: 'Cacciaguardia',
        level: 9,
        price: 650,
        rarity: 'common',
        traits: ['magical'],
        description: 'Can use Shield Block to catch projectiles.',
        descriptionIt: 'Può usare Scudo per intercettare proiettili.',
    },
    arrowDeflecting: {
        id: 'arrowDeflecting',
        name: 'Arrow Deflecting',
        nameIt: 'Deviafreccia',
        level: 6,
        price: 230,
        rarity: 'common',
        traits: ['magical'],
        description: 'Bonus to AC against ranged attacks.',
        descriptionIt: 'Bonus alla CA contro attacchi a distanza.',
    },
    bashing: {
        id: 'bashing',
        name: 'Bashing',
        nameIt: 'Bashing',
        level: 4,
        price: 90,
        rarity: 'common',
        traits: ['magical'],
        description: 'Shield deals additional damage on shield bash.',
        descriptionIt: 'Lo scudo infligge danni addizionali con lo scudo.',
    },
    fortification: {
        id: 'fortification',
        name: 'Fortification',
        nameIt: 'Fortificazione',
        level: 12,
        price: 2000,
        rarity: 'common',
        traits: ['magical'],
        description: 'When you critically fail a Reflex save while using the shield, you get a failure instead.',
        descriptionIt: 'Quando ottieni un fallimento critico ai tiri di Riflessi mentre usi lo scudo, ottieni un fallimento.',
    },
    animated: {
        id: 'animated',
        name: 'Animated',
        nameIt: 'Animato',
        level: 15,
        price: 9000,
        rarity: 'common',
        traits: ['magical'],
        description: 'Shield can float and protect you on its own.',
        descriptionIt: 'Lo scudo può levitare e proteggerti da solo.',
    },
    defending: {
        id: 'defending',
        name: 'Defending',
        nameIt: 'Difesa',
        level: 8,
        price: 450,
        rarity: 'common',
        traits: ['magical'],
        description: 'Grants a bonus to AC when raised.',
        descriptionIt: 'Conferisce un bonus alla CA quando è alzato.',
    },
    dragonhide: {
        id: 'dragonhide',
        name: 'Dragonhide',
        nameIt: 'Dragopelle',
        level: 7,
        price: 320,
        rarity: 'uncommon',
        traits: ['magical'],
        description: 'Grants resistance to a dragon\'s energy type.',
        descriptionIt: 'Conferisce resistenza al tipo di energia del drago.',
    },
    energyAbsorption: {
        id: 'energyAbsorption',
        name: 'Energy Absorption',
        nameIt: 'Assorbimento Energetico',
        level: 12,
        price: 1800,
        rarity: 'uncommon',
        traits: ['magical'],
        description: 'Absorb energy damage when using Shield Block.',
        descriptionIt: 'Assorbe danni energetici quando usi Scudo.',
    },
    guardian: {
        id: 'guardian',
        name: 'Guardian',
        nameIt: 'Guardiano',
        level: 5,
        price: 160,
        rarity: 'common',
        traits: ['magical'],
        description: 'Can protect adjacent allies.',
        descriptionIt: 'Può proteggere alleati adiacenti.',
    },
    reflecting: {
        id: 'reflecting',
        name: 'Reflecting',
        nameIt: 'Riflettente',
        level: 10,
        price: 950,
        rarity: 'common',
        traits: ['magical'],
        description: 'Reflect ranged attacks back at attacker.',
        descriptionIt: 'Riflette attacchi a distanza indietro all\'attaccante.',
    },
    returning: {
        id: 'returning',
        name: 'Returning',
        nameIt: 'Di Ritorno',
        level: 4,
        price: 70,
        rarity: 'common',
        traits: ['magical'],
        description: 'Returns to your hand after being thrown.',
        descriptionIt: 'Ritorna nella tua mano dopo essere stato lanciato.',
    },
    spellguard: {
        id: 'spellguard',
        name: 'Spellguard',
        nameIt: 'Custodia Incantesimi',
        level: 13,
        price: 2800,
        rarity: 'uncommon',
        traits: ['magical'],
        description: 'Grants bonus to saves against spells.',
        descriptionIt: 'Conferisce bonus ai tiri salvezza contro incantesimi.',
    },
    shieldOther: {
        id: 'shieldOther',
        name: 'Shield Other',
        nameIt: 'Scudo dell\'Altro',
        level: 3,
        price: 50,
        rarity: 'common',
        traits: ['magical'],
        description: 'Can use Shield Block to protect an adjacent ally.',
        descriptionIt: 'Può usare Scudo per proteggere un alleato adiacente.',
    },
    livingShield: {
        id: 'livingShield',
        name: 'Living Shield',
        nameIt: 'Scudo Vivente',
        level: 11,
        price: 1400,
        rarity: 'uncommon',
        traits: ['magical', 'necromancy'],
        description: 'Shield can heal you when blocking.',
        descriptionIt: 'Lo scudo può curarti quando blocca.',
    },
    invulnerable: {
        id: 'invulnerable',
        name: 'Invulnerable',
        nameIt: 'Invulnerabile',
        level: 16,
        price: 8000,
        rarity: 'rare',
        traits: ['magical', 'abjuration'],
        description: 'Grants incredible durability.',
        descriptionIt: 'Conferisce una resistenza incredibile.',
    },
};

// Helper function to get shield stats with reinforcing rune
export function getShieldStatsWithReinforcing(
    baseHardness: number,
    baseMaxHP: number,
    reinforcingRune: number
): { hardness: number; maxHP: number } {
    const rune = SHIELD_FUNDAMENTAL_RUNES.reinforcing.find(r => r.value === reinforcingRune);
    if (!rune) {
        return { hardness: baseHardness, maxHP: baseMaxHP };
    }

    return {
        hardness: Math.min(baseHardness + (rune.hardnessIncrease || 0), rune.hardnessIncrease || 20),
        maxHP: Math.min(baseMaxHP + (rune.maxHPIncrease || 0), rune.maxHPIncrease || 160),
    };
}

// Helper function to get property rune price
export function getShieldPropertyRunePrice(runeId: string): number {
    return SHIELD_PROPERTY_RUNES[runeId]?.price || 0;
}

// Get list of available property runes for a given level
export function getAvailableShieldPropertyRunes(maxLevel: number): ShieldPropertyRuneData[] {
    return Object.values(SHIELD_PROPERTY_RUNES).filter(rune => rune.level <= maxLevel);
}

// Helper function to get max property runes for shields
// Shields can only have 1 property rune because it makes the shield invested
export function getMaxShieldPropertyRunes(): number {
    return 1;
}
