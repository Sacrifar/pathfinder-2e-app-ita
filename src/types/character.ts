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

export interface MagicalItemProperties {
    // For items with daily charges (Staves, some magical items)
    charges?: {
        current: number;
        max: number;
    };
    // For Staves: list of spell IDs linked to this staff
    linkedSpells?: string[];
    // For Wands: overcharge flag when risking wand breakage
    overcharge?: boolean;
    // For Wands: track daily usage
    dailyUses?: {
        current: number;
        max: number;
    };
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
    containerId?: string;  // ID of the container this item is in (if any)
    isContainer?: boolean;   // Whether this item is a container (backpack, pouch, etc.)
    capacity?: number;       // Bulk capacity of this container (if isContainer)
    bulkReduction?: number;  // How much bulk is ignored for items inside (Backpack: 2 if worn)
    magical?: MagicalItemProperties;  // Properties for magical items (Staves, Wands, etc.)
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
    slotType?: 'ancestry' | 'class' | 'general' | 'skill' | 'archetype'; // The type of slot this feat occupies (for distinguishing archetypes from class feats)
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
    masterAbilitiesCount: number;  // Number of abilities available from master (base 2, +1 with feats)
    familiarAbilitiesCount: number;  // Number of abilities familiar can learn
}

export interface AnimalCompanionData {
    companionType: string;  // e.g., 'wolf', 'bear', 'bird'
    size: 'tiny' | 'small' | 'medium' | 'large';
    level: number;  // Scales with master (usually master level - 1)
    stage: 'young' | 'mature' | 'nimble' | 'savage';  // Progression stage
    specialization?: 'undead' | 'construct' | null;  // Special companion types
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
    actTogetherUsed: boolean;  // Tracks if Act Together was used this round
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

// ============ Biography & Appearance ============

export interface CharacterBiography {
    // Quick Stats
    age?: string;
    gender?: string;
    pronouns?: string;
    height?: string;
    weight?: string;
    ethnicity?: string;
    nationality?: string;
    birthplace?: string;

    // Visual
    appearance?: string;    // Physical description
    avatarUrl?: string;     // URL to character portrait/image

    // Personality
    attitude?: string;      // Personality/behavior
    beliefs?: string;       // Religious/philosophical beliefs
    likes?: string;         // Preferences
    dislikes?: string;      // Aversions
    catchphrases?: string;  // Memorable quotes/catchphrases
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
    secondaryClassId?: string; // For Dual Class variant rule
    level: number;

    // Deity
    deityId?: string;

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

    // Variant Rules (GMG Options)
    variantRules: {
        freeArchetype: boolean;          // Extra class feats for archetypes
        dualClass: boolean;               // Two classes at level 1
        ancestryParagon: boolean;         // Extra ancestry feats
        automaticBonusProgression: boolean; // ABP - built-in item bonuses
        gradualAbilityBoosts: boolean;    // 1 boost per level instead of 4 every 5
        proficiencyWithoutLevel: boolean; // Proficiency sans level (0/2/4/6/8)
    };

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
        rituals?: string[];  // IDs of known rituals (time-based spells that don't use slots)
    };

    // Formula Book & Crafting
    formulas?: string[];  // IDs of formulas the character knows
    crafting?: {
        dailyItems: { id: string; quantity: number }[];  // Temporary items (Alchemist/Advanced Alchemy)
        projects: Array<{
            id: string;  // Unique project ID
            name: string;  // Item being crafted
            targetValue: number;  // Total cost in silver pieces (sp)
            progress: number;  // Accumulated progress in sp
            daysSpent: number;
            isFinished: boolean;
        }>;
    };

    // Metadata
    notes?: string;
    biography?: CharacterBiography;  // Detailed character biography and appearance
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

// Default variant rules object
const DEFAULT_VARIANT_RULES = {
    freeArchetype: false,
    dualClass: false,
    ancestryParagon: false,
    automaticBonusProgression: false,
    gradualAbilityBoosts: false,
    proficiencyWithoutLevel: false,
};

// Utility function to create empty character
export function createEmptyCharacter(): Character {
    return {
        id: crypto.randomUUID(),
        name: '',
        ancestryId: '',
        backgroundId: '',
        classId: '',
        secondaryClassId: undefined,
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
        variantRules: { ...DEFAULT_VARIANT_RULES },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
}

/**
 * Migration utility to ensure backwards compatibility
 * Adds missing fields to existing characters loaded from localStorage
 */
export function migrateCharacter(data: any): Character {
    const character = { ...data } as Character;

    // Migrate variantRules (added in v0.1.0)
    if (!character.variantRules) {
        character.variantRules = { ...DEFAULT_VARIANT_RULES };
    } else {
        // Ensure all variant rule keys exist
        for (const key of Object.keys(DEFAULT_VARIANT_RULES)) {
            if (typeof character.variantRules[key as keyof typeof DEFAULT_VARIANT_RULES] !== 'boolean') {
                character.variantRules = { ...DEFAULT_VARIANT_RULES, ...character.variantRules };
                break;
            }
        }
    }

    // Migrate feats to add slotType (added for archetype support)
    if (character.feats) {
        character.feats = character.feats.map(feat => {
            if (!feat.slotType) {
                // For existing feats, set slotType to match source
                // This ensures backwards compatibility
                return {
                    ...feat,
                    slotType: feat.source as CharacterFeat['slotType']
                };
            }
            return feat;
        });
    }

    // Migrate pets array (added earlier)
    if (!character.pets) {
        character.pets = [];
    }

    // Migrate shieldState (added earlier)
    if (character.shieldState === undefined) {
        character.shieldState = undefined;
    }

    // Migrate restCooldowns (added earlier)
    if (!character.restCooldowns) {
        character.restCooldowns = {};
    }

    // Migrate spellcasting.rituals (added for Spellcasting Enhancements)
    if (character.spellcasting && !character.spellcasting.rituals) {
        character.spellcasting.rituals = [];
    }

    // Migrate equipment items with magical properties (added for Spellcasting Enhancements)
    if (character.equipment) {
        character.equipment = character.equipment.map(item => {
            if (!item.magical) {
                return { ...item, magical: undefined };
            }
            return item;
        });
    }

    // Migrate deityId (added for Notes & Biology module)
    if (character.deityId === undefined) {
        character.deityId = undefined;
    }

    // Migrate biography (added for Notes & Biology module)
    if (!character.biography) {
        character.biography = undefined;
    }

    return character;
}
