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

export type BonusType = 'status' | 'circumstance' | 'item' | 'penalty';

export type BonusSelector =
    | 'ac'
    | 'fortitude'
    | 'reflex'
    | 'will'
    | 'perception'
    | 'attack'
    | 'damage'
    | 'speed'
    | 'all-saves'
    | 'skill-*'
    | `skill-${string}`
    | 'ability-*'
    | `ability-${AbilityName}`;

export interface Buff {
    id: string;
    name: string;
    bonus: number;  // Can be negative for penalties
    type: BonusType;
    selector: BonusSelector;
    duration?: number;  // In rounds, undefined = permanent
    source?: string;  // Optional description of source
}

export interface CustomResource {
    id: string;
    name: string;
    max: number;
    current: number;
    frequency: 'daily' | 'per-encounter';
    description?: string;
}

export interface RestCooldown {
    lastTreatWoundsTime?: number;  // timestamp
    lastRefocusTime?: number;  // timestamp
}

// ============ Pets & Companions ============

export type PetType = 'familiar' | 'animal-companion' | 'eidolon';

export interface PetAttack {
    name: string;
    actionCost: number | null;  // null for free attacks
    attackBonus: number;
    damage: string;
    damageType: string;
    traits?: string[];
}

export interface PetAbility {
    id: string;
    name: string;
    nameIt?: string;
    description: string;
    descriptionIt?: string;
    type: 'passive' | 'action' | 'reaction' | 'free';
    actionCost?: number;
}

export interface FamiliarData {
    abilities: PetAbility[];  // Typically 2 base abilities
    selectedAbilities: string[];  // IDs of selected abilities
}

export interface AnimalCompanionData {
    companionType: string;  // e.g., 'wolf', 'bear', 'bird'
    size: 'tiny' | 'small' | 'medium' | 'large';
    level: number;  // Scales with master (usually master level - 1)
    hitPoints: {
        current: number;
        max: number;
    };
    armorClass: number;
    attacks: PetAttack[];
    specialAbilities: PetAbility[];
    perception: number;
    Fortitude: Proficiency;
    reflex: Proficiency;
    will: Proficiency;
    speed: Speed;
}

export interface EidolonData {
    type: string;  // e.g., 'angel', 'demon', 'elemental'
    size: 'medium' | 'large';
    level: number;  // Same as summoner
    hitPoints: {
        current: number;
        max: number;
    };
    sharesHP: boolean;  // Eidolon shares HP pool with summoner
    armorClass: number;
    attacks: PetAttack[];
    evolutionPoints: number;
    selectedEvolutions: PetAbility[];
    perception: number;
    saves: {
        fortitude: Proficiency;
        reflex: Proficiency;
        will: Proficiency;
    };
    speed: Speed;
}

export type PetSpecificData = FamiliarData | AnimalCompanionData | EidolonData;

export interface Pet {
    id: string;
    name: string;
    type: PetType;
    data: PetSpecificData;
    notes?: string;
}

export interface CharacterWithPets extends Omit<Character, 'pets'> {
    pets: Pet[];
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

    // Skill Increases (level -> skill name)
    skillIncreases: { [level: number]: string };

    // Equipment
    // Equipment
    equipment: EquippedItem[];
    equippedArmor?: string;
    equippedShield?: string;
    // Shield state for HP tracking and Raise Shield action
    shieldState?: {
        currentHp: number;
        raised: boolean;  // True when shield is raised (+2 AC)
    };
    currency: {
        cp: number;
        sp: number;
        gp: number;
        pp: number;
    };

    // Conditions
    conditions: { id: string; value?: number; duration?: number }[];
    buffs: Buff[];

    // Custom Resources (for daily/per-encounter abilities)
    customResources: CustomResource[];

    // Rest Cooldowns
    restCooldowns?: RestCooldown;

    // Pets & Companions
    pets: Pet[];

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
        perception: 'trained',
        armorClass: { base: 10, proficiency: 'untrained', itemBonus: 0 },
        speed: { land: 25 },
        weaponProficiencies: [],
        armorProficiencies: [],
        feats: [],
        skillIncreases: {},
        equipment: [],
        equippedArmor: '',
        equippedShield: '',
        shieldState: undefined,
        currency: { cp: 0, sp: 0, gp: 15, pp: 0 },
        conditions: [],
        buffs: [],
        customResources: [],
        pets: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
}
