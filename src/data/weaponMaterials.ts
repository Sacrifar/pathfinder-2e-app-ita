/**
 * Weapon Materials Data
 * Material data from Pathfinder 2e Core Rulebook and GM Guide
 */

export interface WeaponMaterialData {
    id: string;
    name: string;
    nameIt?: string;
    level: number;
    price: number; // Additional cost per weapon
    rarity: 'common' | 'uncommon' | 'rare';
    traits: string[];
    description: string;
    descriptionIt?: string;
    effects?: {
        // Special effects of the material
        damageBonus?: number;
        strikeBonus?: number;
        hardness?: number;
        hp?: number;
        bulkReduction?: number;
        special?: string; // Free text description of special effects
    };
    // Materials that can be applied to weapons only
    weaponOnly?: boolean;
    // Materials that require specific weapon traits
    requiredTraits?: string[];
}

// Basic materials (standard steel/iron - no additional cost)
export const BASIC_MATERIALS: WeaponMaterialData = {
    id: 'none',
    name: 'Standard (Steel/Iron)',
    nameIt: 'Standard (Acciaio/Ferro)',
    level: 0,
    price: 0,
    rarity: 'common',
    traits: [],
    description: 'Standard weapons are made of steel or iron.',
    descriptionIt: 'Le armi standard sono fatte di acciaio o ferro.',
};

// Precious metals
export const PRECIOUS_METALS: Record<string, WeaponMaterialData> = {
    silver: {
        id: 'silver',
        name: 'Silver',
        nameIt: 'Argento',
        level: 2,
        price: 20,
        rarity: 'common',
        traits: ['precious'],
        description: 'Silver weapons are valuable but soft. They deal additional damage to creatures with weakness to silver.',
        descriptionIt: 'Le armi d\'argento sono preziose ma morbide. Infliggono danni aggiuntivi alle creature con debolezza all\'argento.',
        effects: {
            special: 'Effective against creatures with weakness to silver (lycanthropes, devils, etc.)',
        },
    },
    gold: {
        id: 'gold',
        name: 'Gold',
        nameIt: 'Oro',
        level: 4,
        price: 50,
        rarity: 'uncommon',
        traits: ['precious', 'soft'],
        description: 'Gold weapons are ceremonial and valuable. They are extremely soft and deal damage as if one grade lower.',
        descriptionIt: 'Le armi d\'oro sono cerimoniali e preziose. Sono estremamente morbide e infliggono danni come se fossero di un grado inferiore.',
        effects: {
            special: 'Damage die reduced by one step (d8→d6, d6→d4, etc.)',
        },
    },
    platinum: {
        id: 'platinum',
        name: 'Platinum',
        nameIt: 'Platino',
        level: 8,
        price: 150,
        rarity: 'uncommon',
        traits: ['precious'],
        description: 'Platinum weapons are extremely valuable but soft. They are mostly ceremonial.',
        descriptionIt: 'Le armi di platino sono estremamente preziose ma morbide. Sono principalmente cerimoniali.',
    },
};

// Special materials
export const SPECIAL_MATERIALS: Record<string, WeaponMaterialData> = {
    coldIron: {
        id: 'coldIron',
        name: 'Cold Iron',
        nameIt: 'Freddo',
        level: 2,
        price: 20,
        rarity: 'common',
        traits: [],
        description: 'Cold iron is effective against fey and demons. It bypasses their damage reduction.',
        descriptionIt: 'Il ferro freddo è efficace contro le fate e i demoni. Ignora la loro riduzione del danno.',
        effects: {
            special: 'Ignores damage reduction of fey and demons',
        },
    },
    adamantine: {
        id: 'adamantine',
        name: 'Adamantine',
        nameIt: 'Adamantio',
        level: 5,
        price: 90,
        rarity: 'common',
        traits: [],
        description: 'Adamantine is incredibly durable. Weapons ignore object hardness and have +1 weapon potency rune effect.',
        descriptionIt: 'L\'adamantio è incredibilmente durevole. Le armi ignorano la durezza degli oggetti e hanno effetto di runa potenza +1.',
        effects: {
            strikeBonus: 1, // Equivalent to +1 potency
            special: 'Ignores object hardness when damaging objects',
        },
    },
    mithral: {
        id: 'mithral',
        name: 'Mithral',
        nameIt: 'Mitral',
        level: 3,
        price: 45,
        rarity: 'common',
        traits: [],
        description: 'Mithral is lightweight and durable. Weapons have -1 bulk.',
        descriptionIt: 'Il mitral è leggero e durevole. Le armi hanno -1 ingombro.',
        effects: {
            bulkReduction: 1,
        },
    },
    orichalcum: {
        id: 'orichalcum',
        name: 'Orichalcum',
        nameIt: 'Oricalco',
        level: 15,
        price: 3500,
        rarity: 'rare',
        traits: ['magical'],
        description: 'Orichalcum is a legendary metal with powerful magical properties. It grants a +2 potency rune effect.',
        descriptionIt: 'L\'oricalco è un metallo leggendario con proprietà magiche potenti. Conferisce effetto di runa potenza +2.',
        effects: {
            strikeBonus: 2,
            special: 'Counts as magical for overcoming resistance',
        },
    },
    darkwood: {
        id: 'darkwood',
        name: 'Darkwood',
        nameIt: 'Legno Scuro',
        level: 3,
        price: 40,
        rarity: 'uncommon',
        traits: [],
        description: 'Darkwood is lightweight and sturdy. Ranged weapons made of darkwood have -1 bulk.',
        descriptionIt: 'Il legno scuro è leggero e robusto. Le armi a distanza fatte di legno scuro hanno -1 ingombro.',
        effects: {
            bulkReduction: 1,
        },
        weaponOnly: true,
    },
    dragonscale: {
        id: 'dragonscale',
        name: 'Dragon Scale',
        nameIt: 'Scaglia di Drago',
        level: 9,
        price: 650,
        rarity: 'rare',
        traits: [],
        description: 'Weapons made from dragon scales. They have resistance to the dragon\'s energy type.',
        descriptionIt: 'Arme fatte di scaglie di drago. Hanno resistenza al tipo di energia del drago.',
        effects: {
            special: 'Grants energy resistance to weapon wielder (varies by dragon type)',
        },
    },
};

// Alchemical materials
export const ALCHEMICAL_MATERIALS: Record<string, WeaponMaterialData> = {
    aboundedum: {
        id: 'aboundedum',
        name: 'Abundanum',
        nameIt: 'Abundanio',
        level: 9,
        price: 120,
        rarity: 'uncommon',
        traits: ['alchemical'],
        description: 'Abundanum is a pale metal that promotes healing. Critical hits heal the wielder.',
        descriptionIt: 'L\'abundanio è un metallo pallido che promuove la guarigione. I colpi critici guariscono chi lo impugna.',
        effects: {
            special: 'On critical hit, heal 1d6 HP (+1 per 2 weapon levels above 9)',
        },
    },
    abysium: {
        id: 'abysium',
        name: 'Abysium',
        nameIt: 'Abisio',
        level: 6,
        price: 70,
        rarity: 'uncommon',
        traits: ['alchemical'],
        description: 'Abysium is radioactive and causes sickness. On hit, targets must Fort save or become sickened.',
        descriptionIt: 'L\'abisio è radioattivo e causa malattia. Colpendo, i target devono fare un tiro salvezza Fort o diventare nauseati.',
        effects: {
            special: 'On hit, DC 20 Fort save or become sickened 1',
        },
    },
    baarrhal: {
        id: 'baarrhal',
        name: 'Baarrhal',
        nameIt: 'Baarrhal',
        level: 8,
        price: 110,
        rarity: 'uncommon',
        traits: ['alchemical'],
        description: 'Baarrmal is hot to the touch and deals fire damage. Deals 1d6 persistent fire damage on critical hit.',
        descriptionIt: 'Il baarrhal è caldo al tatto e infligge danni da fuoco. Infligge 1d6 danni persistenti da fuoco su colpo critico.',
        effects: {
            special: '+1d6 fire damage, on crit: 1d6 persistent fire',
        },
    },
    djezet: {
        id: 'djezet',
        name: 'Djezet',
        nameIt: 'Djezet',
        level: 7,
        price: 90,
        rarity: 'uncommon',
        traits: ['alchemical'],
        description: 'Djezet enhances speed. Gives a +1 item bonus to attack rolls.',
        descriptionIt: 'Il djezet potenzia la velocità. Conferisce un bonus oggetto +1 ai tiri di attacco.',
        effects: {
            strikeBonus: 1,
        },
    },
    inubrix: {
        id: 'inubrix',
        name: 'Inubrix',
        nameIt: 'Inubrix',
        level: 6,
        price: 75,
        rarity: 'uncommon',
        traits: ['alchemical'],
        description: 'Inubrix is ghostly and can strike incorporeal creatures without penalty.',
        descriptionIt: 'L\'inubrix è spettrale e può colpire creature incorporee senza penalità.',
        effects: {
            special: 'No penalty against incorporeal creatures (like ghost touch)',
        },
    },
    katapesh: {
        id: 'katapesh',
        name: 'Katapesh',
        nameIt: 'Katapesh',
        level: 5,
        price: 65,
        rarity: 'uncommon',
        traits: ['alchemical'],
        description: 'Katapesh is a soporific metal. Critical hits cause targets to become fatigued.',
        descriptionIt: 'Il katapesh è un metallo soporifero. I colpi critici causano affaticamento ai target.',
        effects: {
            special: 'On crit: DC 20 Fort save or become fatigued',
        },
    },
    noqual: {
        id: 'noqual',
        name: 'Noqual',
        nameIt: 'Noqual',
        level: 9,
        price: 120,
        rarity: 'uncommon',
        traits: ['alchemical'],
        description: 'Noqual interferes with magic. On hit, creatures cannot cast spells or use abilities for 1 round.',
        descriptionIt: 'Il noqual interferisce con la magia. Colpendo, le creature non possono lanciare incantesimi o usare abilità per 1 round.',
        effects: {
            special: 'On hit: disrupt spellcasting (DC 20 Will negates)',
        },
    },
    orcblood: {
        id: 'orcblood',
        name: 'Orcblood',
        nameIt: 'Sangue di Orco',
        level: 4,
        price: 50,
        rarity: 'uncommon',
        traits: ['alchemical'],
        description: 'Orcblood steel is red and exceptionally hard. Deals additional damage on critical hits.',
        descriptionIt: 'L\'acciaio sangue di orco è rossa e eccezionalmente dura. Infligge danni aggiuntivi su colpi critici.',
        effects: {
            damageBonus: 1,
        },
    },
    siccatiteHot: {
        id: 'siccatiteHot',
        name: 'Siccatite (Hot)',
        nameIt: 'Siccatite (Calda)',
        level: 7,
        price: 100,
        rarity: 'uncommon',
        traits: ['alchemical'],
        description: 'Hot siccatite deals fire damage and makes metal red-hot.',
        descriptionIt: 'La siccatite calda infligge danni da fuoco e rende il metallo rovente.',
        effects: {
            special: '+1d6 fire damage, heats metal objects',
        },
    },
    siccatiteCold: {
        id: 'siccatiteCold',
        name: 'Siccatite (Cold)',
        nameIt: 'Siccatite (Fredda)',
        level: 7,
        price: 100,
        rarity: 'uncommon',
        traits: ['alchemical'],
        description: 'Cold siccatite deals cold damage and freezes metal.',
        descriptionIt: 'La siccatite fredda infligge danni da freddo e congela il metallo.',
        effects: {
            special: '+1d6 cold damage, freezes metal objects',
        },
    },
    skymetal: {
        id: 'skymetal',
        name: 'Skymetal',
        nameIt: 'Metallo del Cielo',
        level: 11,
        price: 450,
        rarity: 'rare',
        traits: ['alchemical', 'magical'],
        description: 'Skymetal from the Starstone falls grants incredible properties. Weapons have +2 potency rune effect and strike as magical.',
        descriptionIt: 'Il metallo del cielo dalle cadute della Pietra Stellare conferisce proprietà incredibili. Le armi hanno effetto di runa potenza +2 e colpiscono come magiche.',
        effects: {
            strikeBonus: 2,
            special: 'Counts as magical, light enough to float',
        },
    },
};

// All materials combined
export const ALL_MATERIALS: Record<string, WeaponMaterialData> = {
    none: BASIC_MATERIALS,
    ...PRECIOUS_METALS,
    ...SPECIAL_MATERIALS,
    ...ALCHEMICAL_MATERIALS,
};

// Get material by ID
export function getMaterialById(id: string): WeaponMaterialData | undefined {
    return ALL_MATERIALS[id];
}

// Get materials by rarity
export function getMaterialsByRarity(rarity: 'common' | 'uncommon' | 'rare'): WeaponMaterialData[] {
    return Object.values(ALL_MATERIALS).filter(m => m.rarity === rarity);
}

// Get all materials sorted by level
export function getAllMaterials(): WeaponMaterialData[] {
    return Object.values(ALL_MATERIALS).sort((a, b) => a.level - b.level);
}

// Get materials available for a specific item level
export function getMaterialsByLevel(itemLevel: number): WeaponMaterialData[] {
    return Object.values(ALL_MATERIALS).filter(m => m.level <= itemLevel);
}
