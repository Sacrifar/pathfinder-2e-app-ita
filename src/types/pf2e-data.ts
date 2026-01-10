/**
 * Pathfinder 2e Game Data Types
 */

import type { AbilityName, Proficiency } from './character';

// === Rarity ===
export type Rarity = 'common' | 'uncommon' | 'rare' | 'unique';

// === Source ===
export interface Source {
    book: string;
    page?: number;
}

// === Base Entity ===
export interface BaseEntity {
    id: string;
    name: string;
    nameIt?: string; // Italian translation
    description: string;
    descriptionIt?: string;
    source: Source;
    rarity: Rarity;
    traits: string[];
}

// === Ancestry ===
export interface Ancestry extends BaseEntity {
    hitPoints: number;
    size: 'tiny' | 'small' | 'medium' | 'large';
    speed: number;
    abilityBoosts: (AbilityName | 'free')[];
    abilityFlaws: AbilityName[];
    languages: string[];
    bonusLanguages: string[];
    features: AncestryFeature[];
}

export interface AncestryFeature {
    name: string;
    nameIt?: string;
    description: string;
    descriptionIt?: string;
}

export interface Heritage extends BaseEntity {
    ancestryId: string;
    features: AncestryFeature[];
}

// === Background ===
export interface Background extends BaseEntity {
    abilityBoosts: (AbilityName | 'free')[];
    trainedSkills: string[];
    trainedLore: string;
    featId: string;
}

// === Class ===
export interface ClassDef extends BaseEntity {
    keyAbility: AbilityName | AbilityName[];
    hitPoints: number;

    // Proficiencies at level 1
    perception: Proficiency;
    fortitude: Proficiency;
    reflex: Proficiency;
    will: Proficiency;

    skills: {
        trained: string[];
        additionalTrainedSkills: number;
    };

    attacks: {
        simple: Proficiency;
        martial: Proficiency;
        advanced: Proficiency;
        unarmed: Proficiency;
    };

    defenses: {
        unarmored: Proficiency;
        light: Proficiency;
        medium: Proficiency;
        heavy: Proficiency;
    };

    classDC: Proficiency;

    // Spellcasting (optional)
    spellcasting?: {
        tradition: 'arcane' | 'divine' | 'occult' | 'primal';
        type: 'prepared' | 'spontaneous';
        ability: AbilityName;
    };

    features: ClassFeature[];
}

export interface ClassFeature {
    level: number;
    name: string;
    nameIt?: string;
    description: string;
    descriptionIt?: string;
}

// === Feats ===
export type FeatType = 'ancestry' | 'class' | 'general' | 'skill';

export interface Feat extends BaseEntity {
    level: number;
    featType: FeatType;
    prerequisites?: string[];
    frequency?: string;
    trigger?: string;
    requirements?: string;
    actions?: 0 | 1 | 2 | 3 | 'free' | 'reaction';

    // For ancestry/class feats
    ancestryId?: string;
    classId?: string;
}

// === Skills ===
export interface Skill {
    id: string;
    name: string;
    nameIt?: string;
    ability: AbilityName;
    description: string;
    descriptionIt?: string;
    actions: SkillAction[];
}

export interface SkillAction {
    name: string;
    nameIt?: string;
    proficiencyRequired: Proficiency;
    description: string;
    descriptionIt?: string;
}

// === Spells ===
export type SpellTradition = 'arcane' | 'divine' | 'occult' | 'primal';

export interface Spell extends BaseEntity {
    level: number; // 0 = cantrip
    traditions: SpellTradition[];
    school: string;
    actions?: 0 | 1 | 2 | 3 | 'free' | 'reaction' | 'varies';
    components: ('verbal' | 'somatic' | 'material' | 'focus')[];
    range?: string;
    area?: string;
    targets?: string;
    duration?: string;
    savingThrow?: {
        type: 'fortitude' | 'reflex' | 'will';
        basic: boolean;
    };
    heightened?: {
        [level: string]: string;
    };
}

// === Equipment ===
export type EquipmentCategory =
    | 'weapon'
    | 'armor'
    | 'shield'
    | 'adventuring-gear'
    | 'alchemical'
    | 'consumable'
    | 'held'
    | 'worn';

export interface Equipment extends BaseEntity {
    category: EquipmentCategory;
    level: number;
    price: {
        gp?: number;
        sp?: number;
        cp?: number;
    };
    bulk: number | 'L' | '-';
    hands?: 1 | 2;

    // For weapons
    weapon?: {
        category: 'simple' | 'martial' | 'advanced' | 'unarmed';
        group: string;
        damage: {
            dice: string;
            type: 'bludgeoning' | 'piercing' | 'slashing';
        };
        range?: number;
        reload?: number;
    };

    // For armor
    armor?: {
        category: 'unarmored' | 'light' | 'medium' | 'heavy';
        acBonus: number;
        dexCap: number;
        checkPenalty: number;
        speedPenalty: number;
        strength: number;
        group: string;
    };

    // For shields
    shield?: {
        acBonus: number;
        hardness: number;
        hitPoints: number;
        brokenThreshold: number;
    };

    // For magic items
    activation?: {
        actions: 0 | 1 | 2 | 3 | 'free' | 'reaction';
        frequency?: string;
    };
    invested?: boolean;
}

// === Conditions ===
export interface Condition {
    id: string;
    name: string;
    nameIt?: string;
    description: string;
    descriptionIt?: string;
    value?: boolean; // true if condition has a value (e.g., frightened 2)
    overrides?: string[]; // conditions this one overrides
}
