/**
 * PF2e Data Loader
 * Loads and transforms data from src/data/pf2e FoundryVTT-style JSON files
 */

// Import all equipment JSON files using Vite's glob import
// Note: eager:true loads all data upfront, but enables better caching and code splitting via manualChunks
const equipmentModules = import.meta.glob<{ default: unknown }>(
    './pf2e/equipment/*.json',
    { eager: true }
);

// Import all action JSON files
const actionModules = import.meta.glob<{ default: unknown }>(
    './pf2e/actions/**/*.json',
    { eager: true }
);

// Import all spell JSON files
const spellModules = import.meta.glob<{ default: unknown }>(
    './pf2e/spells/**/*.json',
    { eager: true }
);

// Import all feat JSON files
const featModules = import.meta.glob<{ default: unknown }>(
    './pf2e/feats/**/*.json',
    { eager: true }
);

// Import all condition JSON files
const conditionModules = import.meta.glob<{ default: unknown }>(
    './pf2e/conditions/*.json',
    { eager: true }
);

// Import all ancestry JSON files
const ancestryModules = import.meta.glob<{ default: unknown }>(
    './pf2e/ancestries/*.json',
    { eager: true }
);

// Import all heritage JSON files (all subfolders)
const heritageModules = import.meta.glob<{ default: unknown }>(
    './pf2e/heritages/**/*.json',
    { eager: true }
);

// Import all class JSON files
const classModules = import.meta.glob<{ default: unknown }>(
    './pf2e/classes/*.json',
    { eager: true }
);

// Import all background JSON files
const backgroundModules = import.meta.glob<{ default: unknown }>(
    './pf2e/backgrounds/*.json',
    { eager: true }
);

// ============ Types for raw FoundryVTT data ============

type AbilityName = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

interface RawPF2eItem {
    _id: string;
    name: string;
    img?: string;
    type: string;
    system: Record<string, unknown>;
}

interface RawWeaponSystem {
    category: string;
    group: string;
    baseItem: string | null;
    damage: {
        damageType: string;
        dice: number;
        die: string;
    };
    traits: {
        rarity: string;
        value: string[];
    };
    usage: { value: string };
    bulk: { value: number };
    price: { value: { gp?: number; sp?: number; cp?: number } };
    range: number | null;
    reload: { value: string };
    level: { value: number };
    description: { value: string };
}

interface RawActionSystem {
    actionType: { value: string };
    actions: { value: number | null };
    category: string;
    traits: { rarity: string; value: string[] };
    description: { value: string };
}

interface RawSpellSystem {
    level: { value: number };
    traits: {
        rarity: string;
        traditions: string[];
        value: string[];
    };
    time: { value: string };
    range: { value: string };
    area: { type: string | null; value: number | null } | null;
    target: { value: string };
    duration: { value: string; sustained: boolean };
    damage: Record<string, { formula: string; type: string }>;
    defense: { save: { statistic: string; basic: boolean } | null } | null;
    description: { value: string };
    ritual?: {
        primary?: { check: string };
        secondary?: { casters: number; checks: string };
    };
    publication?: { title: string; license: string; remaster: boolean };
    heightening?: {
        type: 'fixed' | 'interval';
        interval?: number;
        levels?: Record<string, { damage?: Record<string, { formula: string; type: string }>; area?: { type: string; value: number } }>;
        damage?: Record<string, string>;
        area?: number;
    };
}

interface RawFeatSystem {
    actionType: { value: string };
    actions: { value: number | null };
    category: string;
    level: { value: number };
    prerequisites: { value: Array<{ value: string }> };
    traits: { rarity: string; value: string[] };
    description: { value: string };
    rules?: any[];
    subfeatures?: {
        proficiencies?: {
            [category: string]: {
                rank?: number;
                attribute?: string;
            }
        }
    };
}

interface RawConditionSystem {
    description: { value: string };
    group: string;
    value: { isValued: boolean; value: number | null };
    rules: any[];
}

interface RawArmorSystem {
    acBonus: number;
    dexCap: number | null;
    checkPenalty: number | null;
    speedPenalty: number | null;
    strength: number | null;
    bulk: { value: number };
    category: string;
    group: string | null;
    price: { value: { gp?: number; sp?: number; cp?: number } };
    level: { value: number };
    description: { value: string };
    traits: { rarity: string; value: string[] };
}

interface RawShieldSystem {
    acBonus: number;
    hardness: number;
    hp: { max: number; value: number };
    speedPenalty: number;
    bulk: { value: number };
    price: { value: { gp?: number; sp?: number; cp?: number } };
    level: { value: number };
    description: { value: string };
    traits: { rarity: string; value: string[] };
}

interface RawAncestrySystem {
    hp: number;
    speed: number;
    size: string;
    boosts: Record<string, { value: string[] }>;
    flaws: Record<string, { value: string[] }>;
    languages: { value: string[]; custom: string };
    additionalLanguages: { count: number; value: string[]; custom: string };
    description: { value: string };
    traits: { rarity: string; value: string[] };
    vision: string;
    publication: { title: string; license: string; remaster: boolean };
}

interface RawHeritageSystem {
    ancestry: { name: string; slug: string; uuid: string } | null;
    description: { value: string };
    traits: { rarity: string; value: string[] };
    publication: { title: string; license: string; remaster: boolean };
}

interface RawClassSystem {
    hp: number;
    keyAbility: { value: string[] };
    perception: number;
    savingThrows: { fortitude: number; reflex: number; will: number };
    attacks: { simple: number; martial: number; advanced: number; unarmed: number; other?: { name: string; rank: number } };
    defenses: { unarmored: number; light: number; medium: number; heavy: number };
    trainedSkills: { value: string[]; additional: number };
    ancestryFeatLevels: { value: number[] };
    classFeatLevels: { value: number[] };
    generalFeatLevels: { value: number[] };
    skillFeatLevels: { value: number[] };
    skillIncreaseLevels: { value: number[] };
    spellcasting: number;
    description: { value: string };
    traits: { rarity: string; value: string[] };
    items: Record<string, { name: string; level: number; img: string; uuid: string }>;
    publication: { title: string; license: string; remaster: boolean };
}

interface RawBackgroundSystem {
    boosts: Record<string, { value: string[] }>;
    description: { value: string };
    items: Record<string, { name: string; uuid: string }>;
    publication: { title: string; license: string; remaster: boolean };
    rules: any[];
    trainedSkills: { value: string[]; custom: string; lore: string[] };
    traits: { rarity: string; value: string[] };
}

interface RawGearSystem {
    baseItem: string | null;
    bulk: { value: number; capacity?: number; ignored?: number };
    category?: string;
    description: { value: string };
    level: { value: number };
    material?: { grade: string | null; type: string | null };
    price: { value: { gp?: number; sp?: number; cp?: number; pp?: number }; per?: number };
    traits: { rarity: string; value: string[] };
    usage?: { value: string };
    uses?: { max: number; value: number };
    quantity?: number;
    stowing?: boolean;
    rules?: any[];  // FlatModifier and other rules
    apex?: { attribute: AbilityName };  // Apex items that boost ability scores
    acBonus?: number;  // For items like Armored Cloak
}

// ============ App-friendly types ============

export interface LoadedWeapon {
    id: string;
    name: string;
    category: 'simple' | 'martial' | 'advanced' | 'unarmed';
    group: string;
    damage: string;
    damageType: string;
    traits: string[];
    rarity: string;
    hands: number;
    bulk: number;
    priceGp: number;
    range: number | null;
    reload: string;
    level: number;
    description: string;
}

export interface LoadedAction {
    id: string;
    name: string;
    cost: '1' | '2' | '3' | 'free' | 'reaction';
    category: string;
    traits: string[];
    description: string;
    rawDescription?: string; // Raw description with FoundryVTT tags like @Damage[...], @Check[...], etc.
    filePath: string;  // Path to the JSON file (e.g., './pf2e/actions/class/alchemist/quick-alchemy.json')
}

export interface LoadedSpell {
    id: string;
    name: string;
    rank: number;
    traditions: string[];
    traits: string[];
    rarity: string;
    castTime: string;
    range: string;
    area: string | null;
    duration: string;
    damage: string | null;
    save: string | null;
    description: string;
    rawDescription?: string;
    isRitual?: boolean;
    source: string;
    heightening?: SpellHeightening;
}

export interface SpellHeightening {
    type: 'fixed' | 'interval';
    interval?: number;  // For interval type: e.g., 2 = every 2 levels
    levels?: Record<string, HeighteningLevelData>;  // For fixed type: specific levels
    damage?: Record<string, string>;  // For interval type: damage increase per interval
    area?: number;  // Area increase per interval (for interval type)
}

export interface HeighteningLevelData {
    damage?: Record<string, DamageData>;  // Damage changes at this level
    area?: { type: string; value: number };  // Area changes at this level
    target?: string;  // Target changes at this level
    duration?: string;  // Duration changes at this level
}

export interface DamageData {
    applyMod?: boolean;
    category?: string | null;
    formula: string;
    type: string;
}

export interface LoadedFeat {
    id: string;
    rawId?: string; // Original Foundry UUID (_id from raw data) for matching with character.feats.featId
    name: string;
    category: 'ancestry' | 'class' | 'skill' | 'general' | 'archetype' | 'mythic' | 'bonus';
    level: number;
    actionType: 'passive' | 'action' | 'reaction' | 'free';
    actionCost: number | null;
    altActionCosts?: number[]; // Alternative action costs (e.g., reaction OR 2-action activity)
    traits: string[];
    rarity: string;
    prerequisites: string[];
    description: string;
    rawDescription?: string; // Raw description with FoundryVTT tags like @Damage[...], @Check[...], etc.
    rules?: any[];
    subfeatures?: {
        proficiencies?: {
            [category: string]: {
                rank?: number;
                attribute?: string;
            }
        }
    };
}

export type ConditionRuleSelector =
    | 'all'
    | 'dex-based'
    | 'str-based'
    | 'con-based'
    | 'int-based'
    | 'wis-based'
    | 'cha-based'
    | 'attack'
    | 'ac'
    | 'saving-throw'
    | 'perception'
    | 'skill'
    | 'speed';

export interface ConditionRule {
    selector: ConditionRuleSelector;
    type: 'status' | 'circumstance' | 'item' | 'untyped';
    value: number; // Parsed value (already negative for penalties)
}

export interface LoadedCondition {
    id: string;
    name: string;
    description: string;
    isValued: boolean;
    value: number | null;
    group: string;
    rules: ConditionRule[];
}

export interface LoadedArmor {
    id: string;
    name: string;
    category: 'light' | 'medium' | 'heavy' | 'unarmored';
    group: string;
    acBonus: number;
    dexCap: number;
    checkPenalty: number;
    speedPenalty: number;
    strength: number;
    bulk: number;
    priceGp: number;
    level: number;
    traits: string[];
    rarity: string;
    description: string;
    rawDescription?: string;
}

export interface LoadedShield {
    id: string;
    name: string;
    acBonus: number;
    hardness: number;
    hp: number;
    maxHp: number;
    speedPenalty: number;
    bulk: number;
    priceGp: number;
    level: number;
    traits: string[];
    rarity: string;
    description: string;
    rawDescription?: string;
}

export interface LoadedAncestry {
    id: string;
    name: string;
    hp: number;
    speed: number;
    size: 'tiny' | 'small' | 'medium' | 'large';
    boosts: string[]; // Ability abbreviations
    flaws: string[];
    languages: string[];
    bonusLanguages: number;
    traits: string[];
    rarity: string;
    vision: string;
    description: string;
    source: string;
    remaster: boolean;
}

export interface LoadedHeritage {
    id: string;
    name: string;
    ancestrySlug: string | null; // null for versatile heritages
    traits: string[];
    rarity: string;
    description: string;
    source: string;
    remaster: boolean;
}

export interface LoadedClass {
    id: string;
    name: string;
    hp: number;
    keyAbility: string[];
    perception: number;
    fortitude: number;
    reflex: number;
    will: number;
    attacks: {
        simple: number;
        martial: number;
        advanced: number;
        unarmed: number;
    };
    defenses: {
        unarmored: number;
        light: number;
        medium: number;
        heavy: number;
    };
    trainedSkills: string[];
    additionalSkills: number;
    ancestryFeatLevels: number[];
    classFeatLevels: number[];
    generalFeatLevels: number[];
    skillFeatLevels: number[];
    skillIncreaseLevels: number[];
    hasSpellcasting: boolean;
    traits: string[];
    rarity: string;
    description: string;
    source: string;
    remaster: boolean;
    classFeatures: Array<{ name: string; level: number }>;
}

export interface LoadedBackground {
    id: string;
    name: string;
    boosts: string[];
    trainedSkills: string[];
    trainedLore: string;
    featId: string;
    traits: string[];
    rarity: string;
    description: string;
    source: string;
    remaster: boolean;
}

export interface LoadedGear {
    id: string;
    name: string;
    nameIt?: string;
    level: number;
    priceGp: number;
    bulk: number;
    traits: string[];
    rarity: string;
    description: string;
    rawDescription?: string;
    category: 'equipment' | 'consumable' | 'treasure' | 'backpack' | 'kit';
    qty?: number;
    isContainer?: boolean;  // Whether this item can hold other items (stowing=true in JSON)
    capacity?: number;      // Bulk capacity of this container
    bulkReduction?: number; // Amount of bulk ignored for items inside (e.g., 2 for backpack)
    rules?: any[];          // FlatModifier and other rules that provide bonuses
    apex?: AbilityName;     // Apex items that boost ability scores (e.g., Belt of Giant Strength)
    acBonus?: number;       // Direct AC bonus (e.g., Armored Cloak)
    investable?: boolean;   // Whether this item can be invested (has "invested" trait)
}

// ============ Transform Functions ============

function transformWeapon(raw: RawPF2eItem): LoadedWeapon | null {
    if (raw.type !== 'weapon') return null;

    const sys = raw.system as unknown as RawWeaponSystem;
    if (!sys.damage) return null;

    const usage = sys.usage?.value || 'held-in-one-hand';
    const hands = usage.includes('two-hand') || usage.includes('held-in-two') ? 2 : 1;

    const price = sys.price?.value || {};
    const priceGp = (price.gp || 0) + (price.sp || 0) / 10 + (price.cp || 0) / 100;

    return {
        id: raw._id,
        name: raw.name,
        category: (sys.category || 'simple') as LoadedWeapon['category'],
        group: sys.group || 'other',
        damage: `${sys.damage.dice}${sys.damage.die}`,
        damageType: sys.damage.damageType || 'slashing',
        traits: sys.traits?.value || [],
        rarity: sys.traits?.rarity || 'common',
        hands,
        bulk: sys.bulk?.value || 0,
        priceGp,
        range: sys.range,
        reload: sys.reload?.value || '-',
        level: sys.level?.value || 0,
        description: stripHtml(sys.description?.value || ''),
    };
}

function transformAction(raw: RawPF2eItem, filePath: string): LoadedAction | null {
    if (raw.type !== 'action') return null;

    const sys = raw.system as unknown as RawActionSystem;
    const description = sys.description?.value || '';

    let cost: LoadedAction['cost'] = '1';
    if (sys.actionType?.value === 'free') cost = 'free';
    else if (sys.actionType?.value === 'reaction') cost = 'reaction';
    else if (sys.actions?.value === 2) cost = '2';
    else if (sys.actions?.value === 3) cost = '3';
    else if (sys.actions?.value === 1) cost = '1';

    return {
        id: raw._id,
        name: raw.name,
        cost,
        category: sys.category || 'basic',
        traits: sys.traits?.value || [],
        description: stripHtml(description),
        rawDescription: description, // Keep original HTML with all FoundryVTT tags
        filePath,
    };
}

function transformSpell(raw: RawPF2eItem): LoadedSpell | null {
    if (raw.type !== 'spell') return null;

    const sys = raw.system as unknown as RawSpellSystem;

    // Get damage string
    let damage: string | null = null;
    if (sys.damage && Object.keys(sys.damage).length > 0) {
        const dmgEntry = Object.values(sys.damage)[0];
        if (dmgEntry) {
            damage = `${dmgEntry.formula} ${dmgEntry.type}`;
        }
    }

    // Get save
    let save: string | null = null;
    if (sys.defense?.save?.statistic) {
        save = `${sys.defense.save.basic ? 'basic ' : ''}${sys.defense.save.statistic}`;
    }

    // Get area
    let area: string | null = null;
    if (sys.area?.type && sys.area?.value) {
        area = `${sys.area.value}-foot ${sys.area.type}`;
    }

    // Get traits to check for cantrip
    const traits = sys.traits?.value || [];
    const isCantrip = traits.includes('cantrip');

    // Check if this is a ritual (rituals have the ritual property in system)
    const isRitual = sys.ritual !== undefined && sys.ritual !== null;

    // Parse heightening data
    let heightening: SpellHeightening | undefined;
    if (sys.heightening) {
        heightening = {
            type: sys.heightening.type,
            interval: sys.heightening.interval,
            levels: sys.heightening.levels ? Object.entries(sys.heightening.levels).reduce((acc, [level, data]) => {
                acc[level] = {
                    damage: data.damage,
                    area: data.area,
                };
                return acc;
            }, {} as Record<string, HeighteningLevelData>) : undefined,
            damage: sys.heightening.damage,
            area: sys.heightening.area,
        };
    }

    return {
        id: raw._id,
        name: raw.name,
        rank: isCantrip ? 0 : (sys.level?.value || 0),
        traditions: sys.traits?.traditions || [],
        traits,
        rarity: sys.traits?.rarity || 'common',
        castTime: sys.time?.value || '2',
        range: sys.range?.value || '',
        area,
        duration: sys.duration?.value || '',
        damage,
        save,
        description: stripHtml(sys.description?.value || ''),
        rawDescription: sys.description?.value || '', // Keep original HTML with all FoundryVTT tags
        isRitual,
        source: sys.publication?.title || '',
        heightening,
    };
}

function transformFeat(raw: RawPF2eItem): LoadedFeat | null {
    if (raw.type !== 'feat') return null;

    const sys = raw.system as unknown as RawFeatSystem;

    // Determine action type
    let actionType: LoadedFeat['actionType'] = 'passive';
    if (sys.actionType?.value === 'action') actionType = 'action';
    else if (sys.actionType?.value === 'reaction') actionType = 'reaction';
    else if (sys.actionType?.value === 'free') actionType = 'free';

    // Get action cost for action types
    let actionCost: number | null = null;
    if (actionType === 'action' && sys.actions?.value) {
        actionCost = sys.actions.value;
    }

    // For feats that can be used in multiple ways (e.g., reaction OR 2-action activity)
    // parse the description to extract alternative action costs
    const altActionCosts: number[] = [];
    const description = sys.description?.value || '';

    // Check for reaction indicator
    const hasReaction = /<span[^>]*action-glyph[^>]*>R<\/span>/i.test(description) ||
        /<span[^>]*action-glyph[^>]*>reaction<\/span>/i.test(description);

    // Check for numeric action glyphs like <span class="action-glyph">2</span>
    const actionGlyphPattern = /<span[^>]*action-glyph[^>]*>(\d+)<\/span>/gi;
    const foundCosts = new Set<number>();

    let match;
    while ((match = actionGlyphPattern.exec(description)) !== null) {
        const costNum = parseInt(match[1]);
        if (!isNaN(costNum) && costNum >= 1 && costNum <= 3) {
            foundCosts.add(costNum);
        }
    }

    // If we found numeric action costs or reaction, process them
    if (foundCosts.size > 0 || hasReaction) {
        const costsArray = Array.from(foundCosts).sort();

        // Use the first numeric cost as actionCost if not already set
        if (actionCost === null && costsArray.length > 0) {
            actionCost = costsArray[0];
        }

        // Add remaining costs as alternatives
        for (const cost of costsArray) {
            if (actionCost !== cost) {
                altActionCosts.push(cost);
            }
        }

        // For reaction feats that also have a numeric cost alternative
        // mark the reaction as the primary if actionType is reaction
        // but don't add it to altActionCosts since it's not a "numeric" cost
        if (hasReaction && actionType !== 'reaction') {
            // This feat has both reaction and numeric cost options
            // Keep the reaction type but add the numeric cost to alternatives
            altActionCosts.push(...costsArray.filter(c => c !== actionCost));
        }
    }

    // Fallback: check for "X-action activity" patterns
    if (altActionCosts.length === 0) {
        const activityMatch = description.match(/(\d+)-action activity/gi);
        if (activityMatch) {
            activityMatch.forEach(match => {
                const costNum = parseInt(match.match(/\d+/)![0]);
                if (!isNaN(costNum) && costNum >= 1 && costNum <= 3) {
                    if (actionCost === null) {
                        actionCost = costNum;
                    } else if (actionCost !== costNum && !altActionCosts.includes(costNum)) {
                        altActionCosts.push(costNum);
                    }
                }
            });
        }
    }

    // Normalize category
    let category: LoadedFeat['category'] = 'general';
    const rawCategory = sys.category?.toLowerCase() || '';
    if (rawCategory === 'ancestry') category = 'ancestry';
    else if (rawCategory === 'class') category = 'class';
    else if (rawCategory === 'skill') category = 'skill';
    else if (rawCategory === 'general') category = 'general';
    else if (rawCategory === 'archetype') category = 'archetype';
    else if (rawCategory === 'mythic') category = 'mythic';
    else if (rawCategory === 'bonus') category = 'bonus';

    // Extract prerequisites as strings
    const prerequisites = (sys.prerequisites?.value || []).map(p => p.value);

    // Generate ID from name for consistency (matches granted item UUID format)
    // This ensures that feats granted via UUIDs can be found in the database
    const id = raw.name.toLowerCase().replace(/\s+/g, '-');

    // Store the raw _id for matching with character.feats.featId
    const rawId = raw._id;

    return {
        id,
        rawId,
        name: raw.name,
        category,
        level: sys.level?.value || 1,
        actionType,
        actionCost,
        altActionCosts: altActionCosts.length > 0 ? altActionCosts : undefined,
        traits: sys.traits?.value || [],
        rarity: sys.traits?.rarity || 'common',
        prerequisites,
        description: stripHtml(description), // For display purposes
        rawDescription: description, // Keep original HTML with all FoundryVTT tags
        rules: sys.rules,
        subfeatures: sys.subfeatures,
    };
}

function transformCondition(raw: RawPF2eItem): LoadedCondition | null {
    if (raw.type !== 'condition') return null;

    const sys = raw.system as unknown as RawConditionSystem;

    // Parse rules into our format
    const rules: ConditionRule[] = [];
    if (sys.rules && Array.isArray(sys.rules)) {
        for (const rule of sys.rules) {
            if (rule.key === 'FlatModifier' && rule.selector && rule.value) {
                // Map FoundryVTT selectors to our types
                let selector: ConditionRuleSelector = 'all';
                const rawSelector = String(rule.selector).toLowerCase();

                if (rawSelector === 'all') selector = 'all';
                else if (rawSelector === 'dex-based') selector = 'dex-based';
                else if (rawSelector === 'str-based') selector = 'str-based';
                else if (rawSelector === 'con-based') selector = 'con-based';
                else if (rawSelector === 'int-based') selector = 'int-based';
                else if (rawSelector === 'wis-based') selector = 'wis-based';
                else if (rawSelector === 'cha-based') selector = 'cha-based';
                else if (rawSelector === 'attack' || rawSelector === 'attack-roll') selector = 'attack';
                else if (rawSelector === 'ac') selector = 'ac';
                else if (rawSelector.includes('save') || rawSelector.includes('saving')) selector = 'saving-throw';
                else if (rawSelector === 'perception') selector = 'perception';
                else if (rawSelector === 'speed') selector = 'speed';
                else selector = 'all'; // Default fallback

                // Parse type
                const ruleType = (rule.type || 'status') as ConditionRule['type'];

                // Parse value - handle formulas like "-@item.badge.value"
                let value = 0;
                if (typeof rule.value === 'number') {
                    value = rule.value;
                } else if (typeof rule.value === 'string') {
                    // For formulas, we'll store -1 as placeholder (actual value computed at runtime)
                    if (rule.value.includes('@item.badge.value')) {
                        value = -1; // Marker that this uses the condition's value
                    }
                }

                rules.push({ selector, type: ruleType, value });
            }
        }
    }

    return {
        id: raw._id,
        name: raw.name,
        description: stripHtml(sys.description?.value || ''),
        isValued: sys.value?.isValued || false,
        value: sys.value?.value || null,
        group: sys.group || '',
        rules,
    };
}

function transformArmor(raw: RawPF2eItem): LoadedArmor | null {
    if (raw.type !== 'armor') return null;

    const sys = raw.system as unknown as RawArmorSystem;
    const price = sys.price?.value || {};
    const priceGp = (price.gp || 0) + (price.sp || 0) / 10 + (price.cp || 0) / 100;

    return {
        id: raw._id,
        name: raw.name,
        category: (sys.category || 'unarmored') as LoadedArmor['category'],
        group: sys.group || '',
        acBonus: sys.acBonus || 0,
        dexCap: sys.dexCap !== undefined && sys.dexCap !== null ? sys.dexCap : 99,
        checkPenalty: sys.checkPenalty || 0,
        speedPenalty: sys.speedPenalty || 0,
        strength: sys.strength || 0,
        bulk: sys.bulk?.value || 0,
        priceGp,
        level: sys.level?.value || 0,
        traits: sys.traits?.value || [],
        rarity: sys.traits?.rarity || 'common',
        description: stripHtml(sys.description?.value || ''),
        rawDescription: sys.description?.value || '',
    };
}

function transformShield(raw: RawPF2eItem): LoadedShield | null {
    if (raw.type !== 'shield') return null;

    const sys = raw.system as unknown as RawShieldSystem;
    const price = sys.price?.value || {};
    const priceGp = (price.gp || 0) + (price.sp || 0) / 10 + (price.cp || 0) / 100;

    return {
        id: raw._id,
        name: raw.name,
        acBonus: sys.acBonus || 0,
        hardness: sys.hardness || 0,
        hp: sys.hp?.value || 0,
        maxHp: sys.hp?.max || 0,
        speedPenalty: sys.speedPenalty || 0,
        bulk: sys.bulk?.value || 0,
        priceGp,
        level: sys.level?.value || 0,
        traits: sys.traits?.value || [],
        rarity: sys.traits?.rarity || 'common',
        description: stripHtml(sys.description?.value || ''),
        rawDescription: sys.description?.value || '',
    };
}

function transformAncestry(raw: RawPF2eItem): LoadedAncestry | null {
    if (raw.type !== 'ancestry') return null;

    const sys = raw.system as unknown as RawAncestrySystem;

    // Extract boosts from the record structure
    const boosts: string[] = [];
    if (sys.boosts) {
        for (const key of Object.keys(sys.boosts)) {
            const boost = sys.boosts[key];
            if (boost.value && boost.value.length > 0) {
                // If only one option, it's a fixed boost
                if (boost.value.length === 1) {
                    boosts.push(boost.value[0]);
                } else if (boost.value.length === 6) {
                    boosts.push('free'); // All 6 abilities = free choice
                }
            }
        }
    }

    // Extract flaws
    const flaws: string[] = [];
    if (sys.flaws) {
        for (const key of Object.keys(sys.flaws)) {
            const flaw = sys.flaws[key];
            if (flaw.value && flaw.value.length > 0) {
                flaws.push(...flaw.value);
            }
        }
    }

    // Map size
    const sizeMap: Record<string, 'tiny' | 'small' | 'medium' | 'large'> = {
        'tiny': 'tiny',
        'sm': 'small',
        'small': 'small',
        'med': 'medium',
        'medium': 'medium',
        'lg': 'large',
        'large': 'large',
    };

    return {
        id: raw._id,
        name: raw.name,
        hp: sys.hp || 8,
        speed: sys.speed || 25,
        size: sizeMap[sys.size?.toLowerCase()] || 'medium',
        boosts,
        flaws,
        languages: sys.languages?.value || [],
        bonusLanguages: sys.additionalLanguages?.count || 0,
        traits: sys.traits?.value || [],
        rarity: sys.traits?.rarity || 'common',
        vision: sys.vision || 'normal',
        description: stripHtml(sys.description?.value || ''),
        source: sys.publication?.title || '',
        remaster: sys.publication?.remaster || false,
    };
}

function transformHeritage(raw: RawPF2eItem): LoadedHeritage | null {
    if (raw.type !== 'heritage') return null;

    const sys = raw.system as unknown as RawHeritageSystem;

    return {
        id: raw._id,
        name: raw.name,
        ancestrySlug: sys.ancestry?.slug || null,
        traits: sys.traits?.value || [],
        rarity: sys.traits?.rarity || 'common',
        description: stripHtml(sys.description?.value || ''),
        source: sys.publication?.title || '',
        remaster: sys.publication?.remaster || false,
    };
}

function transformClass(raw: RawPF2eItem): LoadedClass | null {
    if (raw.type !== 'class') return null;

    const sys = raw.system as unknown as RawClassSystem;

    // Extract class features from items
    const classFeatures: Array<{ name: string; level: number }> = [];
    if (sys.items) {
        for (const key of Object.keys(sys.items)) {
            const item = sys.items[key];
            if (item.name && item.level !== undefined) {
                classFeatures.push({ name: item.name, level: item.level });
            }
        }
    }
    // Sort by level
    classFeatures.sort((a, b) => a.level - b.level);

    return {
        id: raw._id,
        name: raw.name,
        hp: sys.hp || 8,
        keyAbility: sys.keyAbility?.value || [],
        perception: sys.perception || 1,
        fortitude: sys.savingThrows?.fortitude || 1,
        reflex: sys.savingThrows?.reflex || 1,
        will: sys.savingThrows?.will || 1,
        attacks: {
            simple: sys.attacks?.simple || 0,
            martial: sys.attacks?.martial || 0,
            advanced: sys.attacks?.advanced || 0,
            unarmed: sys.attacks?.unarmed || 0,
        },
        defenses: {
            unarmored: sys.defenses?.unarmored || 0,
            light: sys.defenses?.light || 0,
            medium: sys.defenses?.medium || 0,
            heavy: sys.defenses?.heavy || 0,
        },
        trainedSkills: sys.trainedSkills?.value || [],
        additionalSkills: sys.trainedSkills?.additional || 0,
        ancestryFeatLevels: sys.ancestryFeatLevels?.value || [],
        classFeatLevels: sys.classFeatLevels?.value || [],
        generalFeatLevels: sys.generalFeatLevels?.value || [],
        skillFeatLevels: sys.skillFeatLevels?.value || [],
        skillIncreaseLevels: sys.skillIncreaseLevels?.value || [],
        hasSpellcasting: sys.spellcasting > 0,
        traits: sys.traits?.value || [],
        rarity: sys.traits?.rarity || 'common',
        description: stripHtml(sys.description?.value || ''),
        source: sys.publication?.title || '',
        remaster: sys.publication?.remaster || false,
        classFeatures,
    };
}

function transformBackground(raw: RawPF2eItem): LoadedBackground | null {
    if (raw.type !== 'background') return null;

    const sys = raw.system as unknown as RawBackgroundSystem;

    // Extract boosts from the record structure
    // PF2E background boosts have two entries:
    // - "0": 2 fixed ability options (e.g., ["cha", "dex"])
    // - "1": either 2 options OR all 6 abilities (meaning free choice)
    const boosts: string[] = [];
    if (sys.boosts) {
        const boostKeys = Object.keys(sys.boosts).sort();
        for (const key of boostKeys) {
            const boost = sys.boosts[key];
            if (boost.value && boost.value.length > 0) {
                // If 6 abilities, it's a free choice
                if (boost.value.length === 6) {
                    boosts.push('free');
                } else {
                    // Add the available options
                    boosts.push(...boost.value);
                }
            }
        }
    }

    // Extract trained skills
    const trainedSkills: string[] = sys.trainedSkills?.value || [];

    // Get the granted feat
    let featId = '';
    if (sys.items) {
        for (const key of Object.keys(sys.items)) {
            const item = sys.items[key];
            if (item.name && item.uuid) {
                // Extract feat ID from name (e.g., "Virtuosic Performer" -> "virtuosic-performer")
                featId = item.name.toLowerCase().replace(/\s+/g, '-');
                break;
            }
        }
    }

    // Determine lore skill - if there's a custom lore or lore array
    let trainedLore = '';
    if (sys.trainedSkills?.custom) {
        trainedLore = sys.trainedSkills.custom;
    } else if (sys.trainedSkills?.lore && sys.trainedSkills.lore.length > 0) {
        trainedLore = sys.trainedSkills.lore[0];
    }

    return {
        id: raw._id,
        name: raw.name,
        boosts,
        trainedSkills,
        trainedLore,
        featId,
        traits: sys.traits?.value || [],
        rarity: sys.traits?.rarity || 'common',
        description: stripHtml(sys.description?.value || ''),
        source: sys.publication?.title || '',
        remaster: sys.publication?.remaster || false,
    };
}

/**
 * Clean up FoundryVTT UUID references from descriptions.
 * Converts @UUID[Compendium.pf2e.actionspf2e.Item.Treat Wounds] to "Treat Wounds"
 */
function cleanUuidReferences(text: string): string {
    // Match @UUID[...] patterns and extract the item name
    // Pattern matches: @UUID[Compendium.pf2e.actionspf2e.Item.Treat Wounds]
    // The name is typically the last part after the last dot
    return text.replace(
        /@UUID\[Compendium\.[^\]]+\](?:\{([^}]+)\})?/g,
        (match, displayText) => {
            // If there's display text in curly braces, use that
            if (displayText) {
                return displayText;
            }

            // Extract the content inside the brackets
            const content = match.slice(6, -1); // Remove "@UUID[" and "]"

            // Try to extract the name (last segment after the last dot)
            // Handle cases like "Compendium.pf2e.actionspf2e.Item.Treat Wounds"
            const parts = content.split('.');
            if (parts.length >= 4) {
                // The name is after the 4th part (e.g., "Item.Treat Wounds" -> "Treat Wounds")
                // Or sometimes it's just the last part
                const lastPart = parts[parts.length - 1];

                // Also handle nested brackets like [[/act ...]]{...}
                const bracketMatch = lastPart.match(/\}\]([^\]]+)\]$/);
                if (bracketMatch) {
                    return bracketMatch[1];
                }

                // Check if there's a display text in curly braces at the end
                const curlyMatch = content.match(/\{([^}]+)\}$/);
                if (curlyMatch) {
                    return curlyMatch[1];
                }

                // Return the last part as the name
                return lastPart.replace(/\\/g, '').trim();
            }

            // If we can't parse it, just return a placeholder
            return '[link]';
        }
    );
}

/**
 * Clean up [[/act ...]] action links
 * Converts [[/act decipher-writing statistic=society]]{Society} to "Society"
 */
function cleanActionLinks(text: string): string {
    return text.replace(
        /\[\[\/act[^\]]+\]\]\{([^}]+)\}/g,
        '$1'
    );
}

/**
 * Clean up @Check[...] references
 * Converts @Check[reflex|against:kineticist|basic|options:area-effect] to "Reflex save"
 */
function cleanCheckReferences(text: string): string {
    return text.replace(
        /@Check\[([^\]]+)\]/g,
        (_match, content: string) => {
            // Extract the save type (first part before |)
            const saveType = content.split('|')[0];
            // Capitalize the save type
            return saveType.charAt(0).toUpperCase() + saveType.slice(1) + ' save';
        }
    );
}

/**
 * Clean up @Damage[...] references
 * Converts @Damage[(floor((@actor.level -8)/3)+3)d12[electricity],1d10[sonic]|options:area-damage]{text} to "text" or "damage"
 */
function cleanDamageReferences(text: string): string {
    return text.replace(
        /@Damage\[([^\]]+)\](?:\{([^}]+)\})?/g,
        (_match, _content: string, displayText?: string) => {
            // If there's display text in curly braces, use that
            if (displayText) {
                return displayText;
            }
            return 'damage';
        }
    );
}

/**
 * Clean up @Localize[...] references
 * Converts @Localize[PF2E.NPC.Abilities.Glossary.Ferocity] to "[Special]"
 */
function cleanLocalizeReferences(text: string): string {
    return text.replace(
        /@Localize\[([^\]]+)\]/g,
        '[Special]'
    );
}

/**
 * Clean up @Template[...] references
 * Converts @Template[emanation|distance:10] to "10-foot emanation"
 */
function cleanTemplateReferences(text: string): string {
    return text.replace(
        /@Template\[([^\]]+)\]/g,
        (_match, content: string) => {
            const parts = content.split('|');
            const type = parts[0];
            const distancePart = parts.find((p: string) => p.startsWith('distance:'));
            const distance = distancePart ? distancePart.split(':')[1] : '';
            return distance ? `${distance}-foot ${type}` : type;
        }
    );
}

/**
 * Clean up any leftover FoundryVTT syntax fragments
 * Removes things like |options:area-damage] or similar fragments
 */
function cleanLeftoverFragments(text: string): string {
    return text
        // Remove leftover pipe options like |options:area-damage]
        .replace(/\|options:[^\]\s,\.]+/g, '')
        // Remove leftover |against:CLASS|basic patterns
        .replace(/\|against:[^\]\s,\.]+/g, '')
        // Remove lone |basic fragments
        .replace(/\|basic(?=[\]\s,\.])/g, '')
        // Remove any remaining brackets that shouldn't be there
        .replace(/(?<!\w)\]|\[(?!\w)/g, '');
}

function stripHtml(html: string): string {
    // First, clean all FoundryVTT references
    let cleaned = cleanUuidReferences(html);
    cleaned = cleanActionLinks(cleaned);
    cleaned = cleanCheckReferences(cleaned);
    cleaned = cleanDamageReferences(cleaned);
    cleaned = cleanLocalizeReferences(cleaned);
    cleaned = cleanTemplateReferences(cleaned);
    cleaned = cleanLeftoverFragments(cleaned);

    // Then remove HTML tags and entities
    return cleaned
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\\n/g, ' ')
        .trim();
}

/**
 * Clean HTML but preserve FoundryVTT game mechanic tags like @Damage[...], @Check[...], etc.
 * This is for display purposes - removes HTML formatting but keeps game data intact
 * @param html The HTML string with FoundryVTT tags
 * @returns Cleaned text with game mechanic tags preserved
 */
export function cleanDescriptionForDisplay(html: string): string {
    if (!html) return '';

    // Remove HTML tags but preserve FoundryVTT special tags by temporarily replacing them
    const replacements: Record<string, string> = {};
    let tempCounter = 0;

    // Protect FoundryVTT tags
    const tempHtml = html.replace(/@(?:Damage|Check|Template|UUID|Localize|Action|Condition)\[([^\]]+)\]/gi, (match) => {
        const placeholder = `__FOUNDRYVT_TAG_${tempCounter}__`;
        replacements[placeholder] = match;
        tempCounter++;
        return placeholder;
    });

    // Now remove HTML tags
    let cleaned = tempHtml.replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&ldquo;/g, '"')
        .replace(/&rdquo;/g, '"')
        .replace(/&lsquo;/g, "'")
        .replace(/&rsquo;/g, "'")
        .replace(/&#8217;/g, "'")
        .replace(/\\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    // Restore FoundryVTT tags
    Object.entries(replacements).forEach(([placeholder, original]) => {
        cleaned = cleaned.replace(placeholder, original);
    });

    return cleaned;
}

function transformGear(raw: RawPF2eItem): LoadedGear | null {
    // Filter for gear types only (exclude weapon, armor, shield)
    const validTypes = ['equipment', 'consumable', 'treasure', 'backpack', 'kit'];
    if (!raw.type || !validTypes.includes(raw.type)) return null;

    const sys = raw.system as unknown as RawGearSystem;
    if (!sys) return null;

    const price = sys.price?.value || {};
    const priceGp = (price.pp || 0) * 10 + (price.gp || 0) + (price.sp || 0) / 10 + (price.cp || 0) / 100;

    // Map category
    let category: LoadedGear['category'] = 'equipment';
    if (raw.type === 'consumable') category = 'consumable';
    else if (raw.type === 'treasure') category = 'treasure';
    else if (raw.type === 'backpack') category = 'backpack';
    else if (raw.type === 'kit') category = 'kit';

    // Determine if this is a container (backpack type with stowing=true)
    const isContainer = raw.type === 'backpack' && sys.stowing === true;
    const capacity = sys.bulk?.capacity;
    const bulkReduction = sys.bulk?.ignored;

    // Parse rules array (if present)
    const rules = sys.rules ? [...sys.rules] : undefined;

    // Parse apex attribute (for items like Belt of Giant Strength)
    const apex = sys.apex?.attribute as AbilityName | undefined;

    // Parse direct AC bonus (for items like Armored Cloak)
    const acBonus = sys.acBonus;

    // Check if this item can be invested (has "invested" trait)
    const traits = sys.traits?.value || [];
    const investable = traits.includes('invested');

    return {
        id: raw._id,
        name: raw.name,
        level: sys.level?.value || 0,
        priceGp,
        bulk: sys.bulk?.value ?? 0,
        traits,
        rarity: sys.traits?.rarity || 'common',
        description: stripHtml(sys.description?.value || ''),
        rawDescription: sys.description?.value || '',
        category,
        qty: sys.quantity ?? sys.uses?.value ?? 1,
        isContainer,
        capacity,
        bulkReduction,
        rules,
        apex,
        acBonus,
        investable,
    };
}

// ============ Cached data ============

let cachedWeapons: LoadedWeapon[] | null = null;
let cachedActions: LoadedAction[] | null = null;
let cachedSpells: LoadedSpell[] | null = null;
let cachedFeats: LoadedFeat[] | null = null;
let cachedConditions: LoadedCondition[] | null = null;
let cachedArmor: LoadedArmor[] | null = null;
let cachedShields: LoadedShield[] | null = null;
let cachedAncestries: LoadedAncestry[] | null = null;
let cachedHeritages: LoadedHeritage[] | null = null;
let cachedClasses: LoadedClass[] | null = null;
let cachedBackgrounds: LoadedBackground[] | null = null;
let cachedGear: LoadedGear[] | null = null;

// ============ Public API ============

export function getWeapons(): LoadedWeapon[] {
    if (cachedWeapons) return cachedWeapons;

    const weapons: LoadedWeapon[] = [];

    for (const path in equipmentModules) {
        const module = equipmentModules[path];
        const raw = (module as { default?: RawPF2eItem }).default || module;
        const weapon = transformWeapon(raw as RawPF2eItem);
        if (weapon) {
            weapons.push(weapon);
        }
    }

    // Sort by name
    weapons.sort((a, b) => a.name.localeCompare(b.name));
    cachedWeapons = weapons;
    return weapons;
}

export function getWeaponsByCategory(category: LoadedWeapon['category']): LoadedWeapon[] {
    return getWeapons().filter(w => w.category === category);
}

export function searchWeapons(query: string): LoadedWeapon[] {
    const q = query.toLowerCase();
    return getWeapons().filter(w =>
        w.name.toLowerCase().includes(q) ||
        w.traits.some(t => t.toLowerCase().includes(q))
    );
}

export function getActions(): LoadedAction[] {
    if (cachedActions) return cachedActions;

    const actions: LoadedAction[] = [];

    for (const path in actionModules) {
        // Skip _folders.json
        if (path.includes('_folders.json')) continue;

        const module = actionModules[path];
        const raw = (module as { default?: RawPF2eItem }).default || module;
        const action = transformAction(raw as RawPF2eItem, path);
        if (action) {
            actions.push(action);
        }
    }

    // Sort by name
    actions.sort((a, b) => a.name.localeCompare(b.name));
    cachedActions = actions;
    return actions;
}

export function getActionsByCategory(category: string): LoadedAction[] {
    return getActions().filter(a => a.category === category);
}

export function getActionsByCost(cost: LoadedAction['cost']): LoadedAction[] {
    return getActions().filter(a => a.cost === cost);
}

/**
 * Get actions for a specific class by filtering file path
 * Class actions are stored in ./pf2e/actions/class/{className}/
 */
export function getActionsByClass(className: string): LoadedAction[] {
    return getActions().filter(a => {
        // Normalize class name for path matching (lowercase, spaces to hyphens)
        const normalizedClass = className.toLowerCase().replace(/\s+/g, '-');
        return a.filePath.includes(`./pf2e/actions/class/${normalizedClass}/`);
    });
}

export function getSpells(): LoadedSpell[] {
    if (cachedSpells) return cachedSpells;

    const spells: LoadedSpell[] = [];

    for (const path in spellModules) {
        // Skip _folders.json
        if (path.includes('_folders.json')) continue;

        const module = spellModules[path];
        const raw = (module as { default?: RawPF2eItem }).default || module;
        const spell = transformSpell(raw as RawPF2eItem);
        if (spell) {
            spells.push(spell);
        }
    }

    // Sort by rank then name
    spells.sort((a, b) => {
        if (a.rank !== b.rank) return a.rank - b.rank;
        return a.name.localeCompare(b.name);
    });

    cachedSpells = spells;
    return spells;
}

export function getSpellsByRank(rank: number): LoadedSpell[] {
    return getSpells().filter(s => s.rank === rank);
}

export function getSpellsByTradition(tradition: string): LoadedSpell[] {
    return getSpells().filter(s => s.traditions.includes(tradition));
}

export function searchSpells(query: string): LoadedSpell[] {
    const q = query.toLowerCase();
    return getSpells().filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.traits.some(t => t.toLowerCase().includes(q))
    );
}

// ============ Feat API ============

export function getFeats(): LoadedFeat[] {
    if (cachedFeats) return cachedFeats;

    const feats: LoadedFeat[] = [];

    for (const path in featModules) {
        // Skip _folders.json
        if (path.includes('_folders.json')) continue;

        const module = featModules[path];
        const raw = (module as { default?: RawPF2eItem }).default || module;
        const feat = transformFeat(raw as RawPF2eItem);
        if (feat) {
            feats.push(feat);
        }
    }

    // Sort by level then name
    feats.sort((a, b) => {
        if (a.level !== b.level) return a.level - b.level;
        return a.name.localeCompare(b.name);
    });

    cachedFeats = feats;
    return feats;
}

export function getFeatsByCategory(category: LoadedFeat['category']): LoadedFeat[] {
    return getFeats().filter(f => f.category === category);
}

export function getFeatsByLevel(level: number): LoadedFeat[] {
    return getFeats().filter(f => f.level === level);
}

export function searchFeats(query: string): LoadedFeat[] {
    const q = query.toLowerCase();
    return getFeats().filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.traits.some(t => t.toLowerCase().includes(q))
    );
}

/**
 * Get level 1 impulse feats for a specific element trait
 * Used for Kineticist starting feat assignment
 */
export function getLevel1ImpulseFeatsForElement(elementTrait: string): LoadedFeat[] {
    return getFeats().filter(f =>
        f.level === 1 &&
        f.category === 'class' &&
        f.traits.includes('impulse') &&
        f.traits.includes(elementTrait)
    );
}

// ============ Condition API ============

export function getConditions(): LoadedCondition[] {
    if (cachedConditions) return cachedConditions;

    const conditions: LoadedCondition[] = [];

    for (const path in conditionModules) {
        // Skip _folders.json
        if (path.includes('_folders.json')) continue;

        const module = conditionModules[path];
        const raw = (module as { default?: RawPF2eItem }).default || module;
        const condition = transformCondition(raw as RawPF2eItem);
        if (condition) {
            conditions.push(condition);
        }
    }

    // Sort by name
    conditions.sort((a, b) => a.name.localeCompare(b.name));

    cachedConditions = conditions;
    return conditions;
}

export function getArmor(): LoadedArmor[] {
    if (cachedArmor) return cachedArmor;

    const armorList: LoadedArmor[] = [];

    for (const path in equipmentModules) {
        // Skip _folders.json
        if (path.includes('_folders.json')) continue;

        const module = equipmentModules[path];
        const raw = (module as { default?: RawPF2eItem }).default || module;
        const armor = transformArmor(raw as RawPF2eItem);
        if (armor) {
            armorList.push(armor);
        }
    }

    // Sort by level then name
    armorList.sort((a, b) => {
        if (a.level !== b.level) return a.level - b.level;
        return a.name.localeCompare(b.name);
    });

    cachedArmor = armorList;
    return armorList;
}

export function getShields(): LoadedShield[] {
    if (cachedShields) return cachedShields;

    const shields: LoadedShield[] = [];

    for (const path in equipmentModules) {
        // Skip _folders.json
        if (path.includes('_folders.json')) continue;

        const module = equipmentModules[path];
        const raw = (module as { default?: RawPF2eItem }).default || module;
        const shield = transformShield(raw as RawPF2eItem);
        if (shield) {
            shields.push(shield);
        }
    }

    // Sort by level then name
    shields.sort((a, b) => {
        if (a.level !== b.level) return a.level - b.level;
        return a.name.localeCompare(b.name);
    });

    cachedShields = shields;
    return shields;
}

// ============ Gear API ============

export function getGear(): LoadedGear[] {
    if (cachedGear) return cachedGear;

    const gear: LoadedGear[] = [];

    for (const path in equipmentModules) {
        // Skip _folders.json
        if (path.includes('_folders.json')) continue;

        const module = equipmentModules[path];
        const raw = (module as { default?: RawPF2eItem }).default || module;
        const item = transformGear(raw as RawPF2eItem);
        if (item) {
            gear.push(item);
        }
    }

    // Sort by name
    gear.sort((a, b) => a.name.localeCompare(b.name));

    cachedGear = gear;
    return gear;
}

export function getGearByCategory(category: LoadedGear['category']): LoadedGear[] {
    return getGear().filter(g => g.category === category);
}

export function getGearByLevel(level: number): LoadedGear[] {
    return getGear().filter(g => g.level === level);
}

export function searchGear(query: string): LoadedGear[] {
    const q = query.toLowerCase();
    return getGear().filter(g =>
        g.name.toLowerCase().includes(q) ||
        g.traits.some(t => t.toLowerCase().includes(q))
    );
}

// Summary stats
export function getDataStats() {
    return {
        weapons: getWeapons().length,
        actions: getActions().length,
        spells: getSpells().length,
        feats: getFeats().length,
        conditions: getConditions().length,
        armor: getArmor().length,
        shields: getShields().length,
        gear: getGear().length,
        ancestries: getAncestries().length,
        heritages: getHeritages().length,
        classes: getClasses().length,
    };
}

// ============ Ancestry API ============

export function getAncestries(): LoadedAncestry[] {
    if (cachedAncestries) return cachedAncestries;

    const ancestries: LoadedAncestry[] = [];

    for (const path in ancestryModules) {
        // Skip _folders.json
        if (path.includes('_folders.json')) continue;

        const module = ancestryModules[path];
        const raw = (module as { default?: RawPF2eItem }).default || module;
        const ancestry = transformAncestry(raw as RawPF2eItem);
        if (ancestry) {
            ancestries.push(ancestry);
        }
    }

    // Sort by name
    ancestries.sort((a, b) => a.name.localeCompare(b.name));

    cachedAncestries = ancestries;
    return ancestries;
}

export function getAncestryById(id: string): LoadedAncestry | undefined {
    return getAncestries().find(a => a.id === id);
}

export function getAncestryByName(name: string): LoadedAncestry | undefined {
    return getAncestries().find(a => a.name.toLowerCase() === name.toLowerCase());
}

// ============ Heritage API ============

export function getHeritages(): LoadedHeritage[] {
    if (cachedHeritages) return cachedHeritages;

    const heritages: LoadedHeritage[] = [];

    for (const path in heritageModules) {
        // Skip _folders.json
        if (path.includes('_folders.json')) continue;

        const module = heritageModules[path];
        const raw = (module as { default?: RawPF2eItem }).default || module;
        const heritage = transformHeritage(raw as RawPF2eItem);
        if (heritage) {
            heritages.push(heritage);
        }
    }

    // Sort by name
    heritages.sort((a, b) => a.name.localeCompare(b.name));

    cachedHeritages = heritages;
    return heritages;
}

export function getHeritagesForAncestry(ancestrySlug: string): LoadedHeritage[] {
    return getHeritages().filter(h => h.ancestrySlug === ancestrySlug);
}

export function getVersatileHeritages(): LoadedHeritage[] {
    return getHeritages().filter(h => h.ancestrySlug === null);
}

// ============ Class API ============

export function getClasses(): LoadedClass[] {
    if (cachedClasses) return cachedClasses;

    const classes: LoadedClass[] = [];

    for (const path in classModules) {
        // Skip _folders.json
        if (path.includes('_folders.json')) continue;

        const module = classModules[path];
        const raw = (module as { default?: RawPF2eItem }).default || module;
        const classDef = transformClass(raw as RawPF2eItem);
        if (classDef) {
            classes.push(classDef);
        }
    }

    // Sort by name
    classes.sort((a, b) => a.name.localeCompare(b.name));

    cachedClasses = classes;
    return classes;
}

export function getClassById(id: string): LoadedClass | undefined {
    return getClasses().find(c => c.id === id);
}

export function getClassByName(name: string): LoadedClass | undefined {
    return getClasses().find(c => c.name.toLowerCase() === name.toLowerCase());
}

// ============ Background API ============

export function getBackgrounds(): LoadedBackground[] {
    if (cachedBackgrounds) return cachedBackgrounds;

    const backgrounds: LoadedBackground[] = [];

    for (const path in backgroundModules) {
        // Skip _folders.json
        if (path.includes('_folders.json')) continue;

        const module = backgroundModules[path];
        const raw = (module as { default?: RawPF2eItem }).default || module;
        const background = transformBackground(raw as RawPF2eItem);
        if (background) {
            backgrounds.push(background);
        }
    }

    // Sort by name
    backgrounds.sort((a, b) => a.name.localeCompare(b.name));

    cachedBackgrounds = backgrounds;
    return backgrounds;
}

export function getBackgroundById(id: string): LoadedBackground | undefined {
    return getBackgrounds().find(b => b.id === id);
}

export function getBackgroundByName(name: string): LoadedBackground | undefined {
    return getBackgrounds().find(b => b.name.toLowerCase() === name.toLowerCase());
}

// ============ Pet API ============

export interface FamiliarAbility {
    id: string;
    name: string;
    nameIt?: string;
    description: string;
    descriptionIt?: string;
    type: 'passive' | 'action' | 'reaction' | 'free';
    actionCost?: number;
    source: string;
}

export interface CompanionType {
    id: string;
    name: string;
    nameIt?: string;
    size: 'tiny' | 'small' | 'medium' | 'large';
    baseStats: {
        hp: number;
        speed: number;
        perception: number;
        fortitude: number;
        reflex: number;
        will: number;
        ac: number;
        attacks: Array<{
            name: string;
            damage: string;
            damageType: string;
            attackBonus?: number;
        }>;
    };
    specialAbilities: string[];
    description: string;
}

export interface EidolonEvolution {
    id: string;
    name: string;
    nameIt?: string;
    description: string;
    descriptionIt?: string;
    type: 'passive' | 'action' | 'reaction' | 'free';
    actionCost?: number;
    points: number; // Evolution point cost
    prerequisites?: string[];
    source: string;
}

let cachedFamiliarAbilities: FamiliarAbility[] | null = null;
let cachedCompanionTypes: CompanionType[] | null = null;
let cachedEidolonEvolutions: EidolonEvolution[] | null = null;

/**
 * Get all familiar abilities
 * Familiars have base abilities (Damage avoidance, manual dexterity) and can learn more
 */
export function getFamiliarAbilities(): FamiliarAbility[] {
    if (cachedFamiliarAbilities) return cachedFamiliarAbilities;

    // Core familiar abilities from Pathfinder 2e Remaster
    const abilities: FamiliarAbility[] = [
        {
            id: 'fam_bark_skin',
            name: 'Bark Skin',
            nameIt: 'Pelle di Corteccia',
            description: 'Your familiar gains resistance to physical damage equal to half your level.',
            descriptionIt: 'Il tuo famiglio guadagna resistenza ai danni fisici pari alla metà del tuo livello.',
            type: 'passive',
            source: 'Player Core',
        },
        {
            id: 'fam_cloud_and_liquid',
            name: 'Cloud and Liquid Sight',
            nameIt: 'Vista through Clouds and Liquids',
            description: 'Your familiar can see through clouds and fog, and can see underwater as well as a human can see through air.',
            descriptionIt: 'Il tuo famiglio può vedere attraverso nuvole e nebbia, e può vedere sott\'acqua come un umano vede attraverso l\'aria.',
            type: 'passive',
            source: 'Player Core',
        },
        {
            id: 'fam_darkvision',
            name: 'Darkvision',
            nameIt: 'Visione Oscura',
            description: 'Your familiar can see in darkness as if it were bright light.',
            descriptionIt: 'Il tuo famiglio può vedere al buio come se fosse luce brillante.',
            type: 'passive',
            source: 'Player Core',
        },
        {
            id: 'fam_damage_avoidance',
            name: 'Damage Avoidance',
            nameIt: 'Evitamento Danni',
            description: 'Your familiar uses your saving throw modifiers for Fortitude and Reflex saves.',
            descriptionIt: 'Il tuo famiglio usa i tuoi modificatori di tiro salvezza per i tiri salvezza di Fortezza e Riflessi.',
            type: 'passive',
            source: 'Player Core',
        },
        {
            id: 'fam_delicate_touch',
            name: 'Delicate Touch',
            nameIt: 'Tocco Delicato',
            description: 'Your familiar can use its Manipulator appendages to Perform Thievery actions and use items.',
            descriptionIt: 'Il tuo famiglio può usare i suoi appendici manipolatori per compiere azioni di Furto e usare oggetti.',
            type: 'passive',
            source: 'Player Core',
        },
        {
            id: 'fam_drawing_noticing',
            name: 'Drawing Notice',
            nameIt: 'Attirare l\'Attenzione',
            description: 'Your familiar can use a single action to Feint, Demoralize, or Impersonate.',
            descriptionIt: 'Il tuo famiglio può usare un\'azione singola per Ingannare, Demoralizzare o Impersonare.',
            type: 'passive',
            source: 'Player Core',
        },
        {
            id: 'fam_effortless_train',
            name: 'Effortless Training',
            nameIt: 'Addestramento Senza Sforzo',
            description: 'Your familiar can use a single action to Command an Animal.',
            descriptionIt: 'Il tuo famiglio può usare un\'azione singola per Comandare un Animale.',
            type: 'passive',
            source: 'Player Core',
        },
        {
            id: 'fam_flier',
            name: 'Flier',
            nameIt: 'Volatore',
            description: 'Your familiar gains a fly Speed of 20 feet.',
            descriptionIt: 'Il tuo famiglio guadagna una velocità di volo di 20 piedi.',
            type: 'passive',
            source: 'Player Core',
        },
        {
            id: 'fam_forager',
            name: 'Forager',
            nameIt: 'Raccoglitore',
            description: 'Your familiar can forage for food while you travel, granting you a +2 circumstance bonus to Survival checks to Subsist.',
            descriptionIt: 'Il tuo famiglio può cercare cibo mentre viaggi, concedendoti un bonus circostanziale di +2 ai tiri di Sopravvivenza per Sussistere.',
            type: 'passive',
            source: 'Player Core',
        },
        {
            id: 'fam_labourer',
            name: 'Labourer',
            nameIt: 'Lavoratore',
            description: 'Your familiar can use a single action to Force Open.',
            descriptionIt: 'Il tuo famiglio può usare un\'azione singola per Forzare l\'Apertura.',
            type: 'passive',
            source: 'Player Core',
        },
        {
            id: 'fam_manual_dexterity',
            name: 'Manual Dexterity',
            nameIt: 'Destrezza Manuale',
            description: 'Your familiar can use one or more limbs to use items and Perform Interact actions.',
            descriptionIt: 'Il tuo famiglio può usare uno o più arti per usare oggetti e compiere azioni di Interagire.',
            type: 'passive',
            source: 'Player Core',
        },
        {
            id: 'fam_mobility',
            name: 'Mobility',
            nameIt: 'Mobilità',
            description: 'Your familiar gains a +10-foot status bonus to all its Speeds.',
            descriptionIt: 'Il tuo famiglio guadagna un bonus di stato di +10 piedi a tutte le sue velocità.',
            type: 'passive',
            source: 'Player Core',
        },
        {
            id: 'fam_speech',
            name: 'Speech',
            nameIt: 'Parlato',
            description: 'Your familiar can speak a language you know.',
            descriptionIt: 'Il tuo famiglio può parlare una lingua che conosci.',
            type: 'passive',
            source: 'Player Core',
        },
        {
            id: 'fam_swimmer',
            name: 'Swimmer',
            nameIt: 'Nuotatore',
            description: 'Your familiar gains a swim Speed of 20 feet.',
            descriptionIt: 'Il tuo famiglio guadagna una velocità di nuoto di 20 piedi.',
            type: 'passive',
            source: 'Player Core',
        },
        {
            id: 'fam_winged',
            name: 'Winged',
            nameIt: 'Alato',
            description: 'Your familiar has wings, allowing it to fly.',
            descriptionIt: 'Il tuo famiglio ha le ali, che gli permettono di volare.',
            type: 'passive',
            source: 'Player Core',
        },
    ];

    cachedFamiliarAbilities = abilities;
    return abilities;
}

/**
 * Get all animal companion types
 * These are the base companions that can be selected
 */
export function getAnimalCompanionTypes(): CompanionType[] {
    if (cachedCompanionTypes) return cachedCompanionTypes;

    const companions: CompanionType[] = [
        {
            id: 'companion_bear',
            name: 'Bear',
            nameIt: 'Orso',
            size: 'large',
            baseStats: {
                hp: 15,
                speed: 40,
                perception: 8,
                fortitude: 7,
                reflex: 3,
                will: 3,
                ac: 22,
                attacks: [
                    { name: 'Jaws', damage: '2d8+4', damageType: 'piercing' },
                    { name: 'Claw', damage: '2d6+4', damageType: 'slashing' },
                ],
            },
            specialAbilities: ['Scent', 'Powerful Jaws'],
            description: 'A massive beast with powerful claws and jaws.',
        },
        {
            id: 'companion_wolf',
            name: 'Wolf',
            nameIt: 'Lupo',
            size: 'medium',
            baseStats: {
                hp: 12,
                speed: 50,
                perception: 8,
                fortitude: 6,
                reflex: 6,
                will: 3,
                ac: 23,
                attacks: [
                    { name: 'Jaws', damage: '1d8+3', damageType: 'piercing' },
                ],
            },
            specialAbilities: ['Scent', 'Pack Attack'],
            description: 'A loyal pack predator with keen senses.',
        },
        {
            id: 'companion_bird',
            name: 'Bird',
            nameIt: 'Uccello',
            size: 'small',
            baseStats: {
                hp: 8,
                speed: 20,
                perception: 8,
                fortitude: 3,
                reflex: 7,
                will: 3,
                ac: 23,
                attacks: [
                    { name: 'Beak', damage: '1d6+1', damageType: 'piercing' },
                ],
            },
            specialAbilities: ['Scout'],
            description: 'A nimble flying creature useful for reconnaissance.',
        },
        {
            id: 'companion_cat',
            name: 'Cat',
            nameIt: 'Gatto',
            size: 'small',
            baseStats: {
                hp: 8,
                speed: 40,
                perception: 9,
                fortitude: 4,
                reflex: 7,
                will: 3,
                ac: 24,
                attacks: [
                    { name: 'Jaws', damage: '1d6+2', damageType: 'piercing' },
                ],
            },
            specialAbilities: ['Scent', 'Stealthy'],
            description: 'A stealthy predator with sharp claws.',
        },
        {
            id: 'companion_horse',
            name: 'Horse',
            nameIt: 'Cavallo',
            size: 'large',
            baseStats: {
                hp: 15,
                speed: 50,
                perception: 7,
                fortitude: 7,
                reflex: 4,
                will: 2,
                ac: 22,
                attacks: [
                    { name: 'Hoof', damage: '2d4+4', damageType: 'bludgeoning' },
                    { name: 'Jaws', damage: '1d6+4', damageType: 'piercing' },
                ],
            },
            specialAbilities: ['Mount'],
            description: 'A loyal mount for travel and combat.',
        },
        {
            id: 'companion_dog',
            name: 'Dog',
            nameIt: 'Cane',
            size: 'medium',
            baseStats: {
                hp: 10,
                speed: 40,
                perception: 8,
                fortitude: 5,
                reflex: 6,
                will: 4,
                ac: 23,
                attacks: [
                    { name: 'Jaws', damage: '1d8+2', damageType: 'piercing' },
                ],
            },
            specialAbilities: ['Scent', 'Guard Dog'],
            description: 'A faithful companion and guardian.',
        },
    ];

    cachedCompanionTypes = companions;
    return companions;
}

/**
 * Get eidolon evolution abilities
 * These are special abilities that eidolons can unlock with evolution points
 */
export function getEidolonEvolutions(): EidolonEvolution[] {
    if (cachedEidolonEvolutions) return cachedEidolonEvolutions;

    const evolutions: EidolonEvolution[] = [
        {
            id: 'evo_arms',
            name: 'Additional Arms',
            nameIt: 'Armi Addizionali',
            description: 'Your eidolon gains two additional arms at the end of its torso.',
            descriptionIt: 'Il tuo eidolon guadagna due braccia addizionali alla fine del suo torso.',
            type: 'passive',
            points: 1,
            source: 'Player Core 2',
        },
        {
            id: 'evo_aquatic',
            name: 'Aquatic',
            nameIt: 'Acquatico',
            description: 'Your eidolon gains a swim Speed equal to its land Speed and can breathe underwater.',
            descriptionIt: 'Il tuo eidolon guadagna una velocità di nuoto pari alla sua velocità terrestre e può respirare sott\'acqua.',
            type: 'passive',
            points: 1,
            source: 'Player Core 2',
        },
        {
            id: 'evo_cleave',
            name: 'Cleave',
            nameIt: 'Fendente',
            description: 'Your eidolon can make a melee Strike to damage two adjacent foes.',
            descriptionIt: 'Il tuo eidolon può fare un attacco melee per danneggiare due nemici adiacenti.',
            type: 'action',
            actionCost: 2,
            points: 1,
            source: 'Player Core 2',
        },
        {
            id: 'evo_climbing',
            name: 'Climbing',
            nameIt: 'Arrampicata',
            description: 'Your eidolon gains a climb Speed equal to its land Speed.',
            descriptionIt: 'Il tuo eidolon guadagna una velocità di arrampicata pari alla sua velocità terrestre.',
            type: 'passive',
            points: 1,
            source: 'Player Core 2',
        },
        {
            id: 'evo_darkvision',
            name: 'Darkvision',
            nameIt: 'Visione Oscura',
            description: 'Your eidolon can see in darkness as if it were bright light.',
            descriptionIt: 'Il tuo eidolon può vedere al buio come se fosse luce brillante.',
            type: 'passive',
            points: 1,
            source: 'Player Core 2',
        },
        {
            id: 'evo_flyer',
            name: 'Flyer',
            nameIt: 'Volatore',
            description: 'Your eidolon gains a fly Speed equal to its land Speed.',
            descriptionIt: 'Il tuo eidolon guadagna una velocità di volo pari alla sua velocità terrestre.',
            type: 'passive',
            points: 2,
            source: 'Player Core 2',
        },
        {
            id: 'evo_reach',
            name: 'Greater Reach',
            nameIt: 'Gittata Superiore',
            description: 'Your eidolon\'s Reach increases by 5 feet.',
            descriptionIt: 'La Gittata del tuo eidolon aumenta di 5 piedi.',
            type: 'passive',
            points: 1,
            source: 'Player Core 2',
        },
        {
            id: 'evo_energy',
            name: 'Energy Attacks',
            nameIt: 'Attacchi di Energia',
            description: 'Your eidolon deals additional energy damage on Strikes.',
            descriptionIt: 'Il tuo eidolon infligge danni di energia addizionali sui colpi.',
            type: 'passive',
            points: 1,
            source: 'Player Core 2',
        },
        {
            id: 'evo_resistances',
            name: 'Resistances',
            nameIt: 'Resistenze',
            description: 'Your eidolon gains resistance to two energy types.',
            descriptionIt: 'Il tuo eidolon guadagna resistenza a due tipi di energia.',
            type: 'passive',
            points: 1,
            source: 'Player Core 2',
        },
    ];

    cachedEidolonEvolutions = evolutions;
    return evolutions;
}
