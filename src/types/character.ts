/**
 * Core Character Types for Pathfinder 2e
 */

export type AbilityName = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

export interface AbilityScores {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
}

export type Proficiency = 'untrained' | 'trained' | 'expert' | 'master' | 'legendary';

export interface SkillProficiency {
    name: string;
    ability: AbilityName;
    proficiency: Proficiency;
    assuranceRanks?: number;
}

export interface SavingThrow {
    name: 'fortitude' | 'reflex' | 'will';
    ability: AbilityName;
    proficiency: Proficiency;
}

export interface ArmorClass {
    base: number;
    proficiency: Proficiency;
    itemBonus: number;
    dexCap?: number;
}

export interface HitPoints {
    current: number;
    max: number;
    temporary: number;
}

export interface Speed {
    land: number;
    swim?: number;
    climb?: number;
    fly?: number;
    burrow?: number;
}

export interface EquippedItem {
    id: string;
    name: string;
    bulk: number;
    invested?: boolean;
    worn?: boolean;
    wielded?: {
        hands: 1 | 2;
    };
}

export interface PreparedSpell {
    spellId: string;
    slotLevel: number;
    uses: number;
    maxUses: number;
}

export interface SpellSlots {
    [level: number]: {
        max: number;
        used: number;
    };
}

export interface FocusPool {
    current: number;
    max: number;
}

export interface CharacterFeat {
    featId: string;
    level: number;
    source: 'ancestry' | 'class' | 'general' | 'skill' | 'bonus';
    choices?: string[];
}

export interface Character {
    id: string;
    name: string;
    player?: string;

    // Core Identity
    ancestryId: string;
    heritageId?: string;
    backgroundId: string;
    classId: string;
    level: number;

    // Ability Scores
    abilityScores: AbilityScores;
    abilityBoosts: {
        ancestry: AbilityName[];
        background: AbilityName[];
        class: AbilityName;
        free: AbilityName[];
        levelUp: { [level: number]: AbilityName[] };
    };

    // HP
    hitPoints: HitPoints;

    // Skills
    skills: SkillProficiency[];

    // Saves
    saves: {
        fortitude: Proficiency;
        reflex: Proficiency;
        will: Proficiency;
    };

    // Combat
    perception: Proficiency;
    armorClass: ArmorClass;
    speed: Speed;

    // Proficiencies
    weaponProficiencies: { category: string; proficiency: Proficiency }[];
    armorProficiencies: { category: string; proficiency: Proficiency }[];

    // Feats
    feats: CharacterFeat[];

    // Equipment
    equipment: EquippedItem[];
    currency: {
        cp: number;
        sp: number;
        gp: number;
        pp: number;
    };

    // Conditions
    conditions: { id: string; value?: number }[];

    // Spellcasting (optional)
    spellcasting?: {
        tradition: 'arcane' | 'divine' | 'occult' | 'primal';
        spellcastingType: 'prepared' | 'spontaneous';
        keyAbility: AbilityName;
        proficiency: Proficiency;
        spellSlots: SpellSlots;
        knownSpells: string[];
        preparedSpells?: PreparedSpell[];
        focusPool?: FocusPool;
        focusSpells?: string[];
    };

    // Metadata
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CharacterSummary {
    id: string;
    name: string;
    level: number;
    ancestryId: string;
    classId: string;
    updatedAt: string;
}

// Utility function to create empty character
export function createEmptyCharacter(): Character {
    return {
        id: crypto.randomUUID(),
        name: '',
        ancestryId: '',
        backgroundId: '',
        classId: '',
        level: 1,
        abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
        abilityBoosts: {
            ancestry: [],
            background: [],
            class: 'str',
            free: [],
            levelUp: {}
        },
        hitPoints: { current: 0, max: 0, temporary: 0 },
        skills: [],
        saves: { fortitude: 'untrained', reflex: 'untrained', will: 'untrained' },
        perception: 'untrained',
        armorClass: { base: 10, proficiency: 'untrained', itemBonus: 0 },
        speed: { land: 25 },
        weaponProficiencies: [],
        armorProficiencies: [],
        feats: [],
        equipment: [],
        currency: { cp: 0, sp: 0, gp: 15, pp: 0 },
        conditions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
}
