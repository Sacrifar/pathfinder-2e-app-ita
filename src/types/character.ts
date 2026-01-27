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

export interface Resistance {
    id: string;
    type: string; // e.g., "Fire", "Cold", "Electricity", "Acid", "Poison", "Mental", "Physical"
    value: number;
}

export interface Immunity {
    id: string;
    type: string; // e.g., "Fire", "Disease", "Mind-affecting", "Non-magical"
}

export interface ArmorClass {
    base: number;
    proficiency: Proficiency;
    itemBonus: number;
    acBonus?: number;  // Armor bonus from equipped armor
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
    earth?: number;  // For earth-glide abilities
    incorporeal?: number;  // For incorporeal movement
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

export type StrikingRune = 'striking' | 'greaterStriking' | 'majorStriking';

export type ResilientRune = 1 | 2 | 3;

export type ReinforcingRune = 1 | 2 | 3 | 4 | 5 | 6;

export type SpecialMaterial =
    | 'none'
    // Precious metals
    | 'silver' | 'gold' | 'platinum'
    // Special materials
    | 'coldIron' | 'adamantine' | 'mithral' | 'orichalcum' | 'darkwood' | 'dragonscale'
    // Alchemical materials
    | 'aboundedum' | 'abysium' | 'baarrhal' | 'djezet' | 'inubrix' | 'katapesh'
    | 'noqual' | 'orcblood' | 'siccatiteHot' | 'siccatiteCold' | 'skymetal';

export type AbilityOverride = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha' | 'auto';

export interface WeaponRunes {
    potencyRune?: number;        // +1, +2, or +3 potency rune
    strikingRune?: StrikingRune; // Striking, Greater Striking, Major Striking
    propertyRunes?: string[];    // Array of property rune IDs/names
}

export interface ArmorRunes {
    potencyRune?: number;        // +1, +2, +3, or +4 armor potency rune
    resilientRune?: ResilientRune; // Resilient, Greater Resilient, Major Resilient
    propertyRunes?: string[];    // Array of property rune IDs/names
}

export interface ShieldRunes {
    reinforcingRune?: ReinforcingRune; // Minor through Supreme reinforcing
    propertyRunes?: string[];    // Array of property rune IDs/names
    // Shields can also have weapon runes if they have shield boss or spikes
    weaponRunes?: WeaponRunes;
}

/**
 * Spell-granting item configuration
 * Used for items like Gate Attenuator that grant spells with selections
 */
export interface ItemSpellGrant {
    // The selected choice (e.g., element for Gate Attenuator)
    selectedChoice?: string;  // e.g., "air", "earth", "fire", etc.

    // Daily uses tracking
    dailyUses?: {
        current: number;
        max: number;
    };

    // Last reset timestamp (for daily uses)
    lastReset?: string;  // ISO date string
}

export interface WeaponCustomization {
    // Material & Physical Properties
    material?: SpecialMaterial;  // Special material override
    isLarge?: boolean;           // Large weapon toggle (affects bulk/cost/damage)
    bulkOverride?: number;       // Manual bulk override

    // Advanced Customization
    attackAbilityOverride?: AbilityOverride; // Force specific ability (auto = default logic)
    customName?: string;         // Custom display name (e.g., "Goblin Smasher")

    // Manual Bonuses
    bonusAttack?: number;        // Manual attack bonus override
    bonusDamage?: number;        // Manual damage bonus override
    customDamageType?: string;   // Custom damage type

    // Trait Mechanics
    criticalSpecialization?: boolean; // Enable critical specialization effect

    // Ammunition Tracking
    linkedAmmunitionId?: string; // ID of ammunition item linked to this weapon
    ammunitionRemaining?: number; // Current ammo count
}

export interface ArmorCustomization {
    // Customization options for armor
    customName?: string;         // Custom display name
    bonusAC?: number;            // Manual AC bonus override
    checkPenaltyOverride?: number; // Override armor check penalty
    speedPenaltyOverride?: number; // Override speed penalty
    dexCapOverride?: number;     // Override Dex cap
}

export interface ShieldCustomization {
    // Customization options for shields
    customName?: string;         // Custom display name
    hardnessOverride?: number;   // Manual hardness override
    maxHPOverride?: number;      // Manual max HP override
    currentHP?: number;          // Current shield HP
    broken?: boolean;            // Whether shield is broken
}

export interface EquippedItem {
    id: string;
    name: string;
    bulk: number;
    quantity?: number; // Stackable items quantity (default 1)
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

    // Item-specific customization (based on item type)
    runes?: WeaponRunes | ArmorRunes | ShieldRunes;  // Rune system for weapons, armor, or shields
    customization?: WeaponCustomization | ArmorCustomization | ShieldCustomization; // Advanced customization options

    // Spell-granting items (like Gate Attenuator)
    spellGrant?: ItemSpellGrant;
}

export interface PreparedSpell {
    spellId: string;
    slotLevel: number;
    uses: number;
    maxUses: number;
}

/**
 * Innate spells are spells granted by heritages, backgrounds, feats, or items
 * that can be cast a specific number of times per day.
 * Unlike prepared or spontaneous spells, they don't use spell slots.
 */
export interface InnateSpell {
    spellId: string;      // The spell ID from pf2e data
    uses: number;         // Current uses remaining today
    maxUses: number;      // Maximum uses per day (usually 1)
    source: string;       // Source description (e.g., "Heritage: Fey-Touched", "Background")
    sourceType: 'heritage' | 'background' | 'feat' | 'item'; // Where the spell comes from
}

/**
 * Heightened spells are higher-rank versions of spells that spontaneous casters (like Bards)
 * can add to their repertoire as they gain levels.
 */
export interface HeightenedSpell {
    spellId: string;          // Base spell ID
    heightenedLevel: number;  // The level to which it's heightened (must be > base rank)
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
    slotType?: 'ancestry' | 'class' | 'general' | 'skill' | 'archetype' | 'impulse'; // The type of slot this feat occupies (for distinguishing archetypes from class feats, and kineticist impulses)
    choices?: string[];
    // IMPORTANT: Choices persist even when level decreases (builder mode support)
    // Example: If user selects Rogue Dedication at level 6 with Stealth skill choice,
    // then goes back to level 2, the choice remains. When returning to level 6,
    // the choice is still there and effects are reapplied.
    // Stores choice VALUES only (e.g., "system.skills.thievery.rank", "Bon Mot")
    // The flag mapping is determined by parsing the feat's ChoiceSet rules in order
    choiceMap?: Record<string, string>; // Full choice map with flag names for resolving dynamic references
    grantedBy?: string; // featId of the feat that granted this bonus feat (for cleanup when source feat is removed)
}

export type BonusType = 'status' | 'circumstance' | 'item' | 'penalty';

export type BonusSelector =
    | 'ac'
    | 'fortitude'
    | 'reflex'
    | 'will'
    | 'perception'
    | 'initiative'
    | 'attack'
    | 'damage'
    | 'speed'
    | 'all-saves'
    | 'impulse-attack'
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
    heritageChoice?: string; // Choice for heritages with spell selection (e.g., chosen cantrip for Fey-Touched Gnome)
    backgroundId: string;
    backgroundChoice?: string; // Choice for backgrounds with options (e.g., zodiac sign for Zodiac Bound)
    classId: string;
    classSpecializationId?: string | string[]; // Class specialization (Muse, Doctrine, Instinct, etc.) - can be array for dual-selection classes like Kineticist
    kineticistJunctions?: {
        baseJunctions?: string[]; // Automatic base junctions for Single Gate (one per element)
        [level: number]: { // Level 5, 9, 13, 17
            choice: 'expand_the_portal' | 'fork_the_path';
            junctionIds?: string[]; // For expand_the_portal - selected junction IDs
            newElementGateId?: string; // For fork_the_path - new element gate ID
            newElementImpulseId?: string; // For fork_the_path - selected impulse feat from new element
        };
    };
    secondaryClassId?: string; // For Dual Class variant rule
    level: number;
    xp?: number; // Experience points

    // Archetype Dedication Tracking
    archetypeDedications?: {
        [archetypeName: string]: {
            dedicationLevel: number; // Level when dedication was taken
            featsCount: number; // Number of archetype feats taken (including dedication)
        };
    };

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

    // Hero Points (0-3)
    heroPoints?: number;

    // Skills
    skills: SkillProficiency[];

    // Manual skill training selections from level 1 (skill names chosen by user)
    // These are stored separately from calculated proficiencies to survive recalculation
    manualSkillTraining?: string[];

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
    // Class DC proficiencies from archetype dedications (e.g., rogue, fighter, monk)
    classDCs?: Array<{
        classType: string;  // e.g., 'rogue', 'fighter', 'monk'
        proficiency: Proficiency;
        ability: AbilityName;  // e.g., 'dex' for rogue, choice of 'str'/'dex' for fighter/monk
        dedicated?: boolean;  // Whether this is a dedicated class DC (from actual class, not archetype)
    }>;
    // Track which feats grant spellcasting (for archetype dedication spellcasters)
    spellcastingFromFeats?: string[];  // Names of feats that grant spellcasting

    // Feats
    feats: CharacterFeat[];

    // Skill Increases (level -> skill name)
    skillIncreases: { [level: number]: string };

    // Skill Bonus from INT increases (Remastered rule: +1 Trained skill per INT boost after level 1)
    // Maps level -> array of skill names selected at that level
    intBonusSkills: { [level: number]: string[] };

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

    // Active conditional damage for weapons (rune IDs that are currently active)
    activeConditionalDamage: string[];

    // Resistances & Immunities
    resistances: Resistance[];
    immunities: Immunity[];

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
        innateSpells?: InnateSpell[];  // Spells granted by backgrounds/feats/items with daily uses
        // Heightening system for spontaneous casters (Bard, Sorcerer, etc.)
        heightenedSpells?: HeightenedSpell[];  // Higher-rank versions of spells in repertoire
        signatureSpells?: string[];  // Spell IDs that can be heightened freely without adding to repertoire
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

    // Commander Tactics
    tactics?: {
        known: string[];  // IDs of known tactics (available for selection)
        prepared: string[];  // IDs of prepared tactics (3 daily tactics)
    };
    commanderBanner?: string;  // Selected banner type (optional)

    // Metadata
    notes?: string;
    biography?: CharacterBiography;  // Detailed character biography and appearance
    senses?: string[];  // List of senses like darkvision, low-light vision
    languages?: string[];  // List of known languages
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
        heroPoints: 1, // Start with 1 hero point
        skills: [],
        saves: { fortitude: 'untrained', reflex: 'untrained', will: 'untrained' },
        perception: 'trained',
        armorClass: { base: 10, proficiency: 'untrained', itemBonus: 0 },
        speed: { land: 25 },
        weaponProficiencies: [],
        armorProficiencies: [],
        feats: [],
        skillIncreases: {},
        intBonusSkills: {},
        equipment: [],
        equippedArmor: '',
        equippedShield: '',
        shieldState: undefined,
        currency: { cp: 0, sp: 0, gp: 15, pp: 0 },
        conditions: [],
        buffs: [],
        activeConditionalDamage: [],
        resistances: [],
        immunities: [],
        customResources: [],
        pets: [],
        kineticistJunctions: {},
        variantRules: { ...DEFAULT_VARIANT_RULES },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
}

/**
 * Migration map for old class IDs to new class IDs
 * This handles cases where FoundryVTT data was updated and IDs changed
 */
const CLASS_ID_MIGRATION_MAP: Record<string, string> = {
    // Add old ID → new ID mappings here as needed
    'IiG7DgeLWYrSNXuX': 'RggQN3bX5SEcsffR', // Old Kineticist → New Kineticist
};

/**
 * Migration utility to ensure backwards compatibility
 * Adds missing fields to existing characters loaded from localStorage
 */
export function migrateCharacter(data: any): Character {
    const character = { ...data } as Character;

    // Migrate class ID if needed (handles old FoundryVTT data)
    if (character.classId && CLASS_ID_MIGRATION_MAP[character.classId]) {
        character.classId = CLASS_ID_MIGRATION_MAP[character.classId];
    }

    // Migrate secondary class ID if needed (for dual class)
    if (character.secondaryClassId && CLASS_ID_MIGRATION_MAP[character.secondaryClassId]) {
        character.secondaryClassId = CLASS_ID_MIGRATION_MAP[character.secondaryClassId];
    }

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

    // Migrate spellcasting.innateSpells (added for Innate Spells support)
    if (character.spellcasting && !character.spellcasting.innateSpells) {
        character.spellcasting.innateSpells = [];
    }

    // Migrate heritageChoice (added for Heritage Innate Spells)
    if (character.heritageChoice === undefined) {
        character.heritageChoice = undefined;
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

    // Migrate classSpecializationId (added for Class Specializations system)
    // Note: Default specialization will be assigned in CharacterSheetPage on load
    if (character.classSpecializationId === undefined) {
        character.classSpecializationId = undefined;
    }

    // Migrate equipment weapon customization (added for Weapon Options system)
    if (character.equipment) {
        character.equipment = character.equipment.map(item => {
            // Initialize weapon customization fields if they don't exist
            if (!item.runes) {
                item.runes = undefined;
            }
            if (!item.customization) {
                item.customization = undefined;
            }
            // Migrate quantity (added for stackable items)
            if (item.quantity === undefined) {
                item.quantity = 1;
            }
            return item;
        });
    }

    // Migrate Commander tactics (added for Commander class support)
    if (!character.tactics) {
        character.tactics = { known: [], prepared: [] };
    }

    // Migrate commanderBanner (added for Commander class support)
    if (character.commanderBanner === undefined) {
        character.commanderBanner = undefined;
    }

    // Migrate archetypeDedications (added for Archetype Dedication Constraints)
    if (!character.archetypeDedications) {
        character.archetypeDedications = {};
    }

    // Migrate activeConditionalDamage (added for conditional damage system)
    if (!character.activeConditionalDamage) {
        character.activeConditionalDamage = [];
    }

    // Migrate heroPoints (added for interactive hero points)
    if (character.heroPoints === undefined) {
        character.heroPoints = 1;
    }

    // Migrate spellcasting.heightenedSpells and signatureSpells (added for Heightening system)
    if (character.spellcasting) {
        if (!character.spellcasting.heightenedSpells) {
            character.spellcasting.heightenedSpells = [];
        }
        if (!character.spellcasting.signatureSpells) {
            character.spellcasting.signatureSpells = [];
        }
    }

    return character;
}
