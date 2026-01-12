/**
 * PF2e Data Loader
 * Loads and transforms data from src/data/pf2e FoundryVTT-style JSON files
 */

// Import all equipment JSON files using Vite's glob import
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

// ============ Types for raw FoundryVTT data ============

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
}

interface RawFeatSystem {
    actionType: { value: string };
    actions: { value: number | null };
    category: string;
    level: { value: number };
    prerequisites: { value: Array<{ value: string }> };
    traits: { rarity: string; value: string[] };
    description: { value: string };
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

interface RawGearSystem {
    baseItem: string | null;
    bulk: { value: number };
    category?: string;
    description: { value: string };
    level: { value: number };
    material?: { grade: string | null; type: string | null };
    price: { value: { gp?: number; sp?: number; cp?: number; pp?: number }; per?: number };
    traits: { rarity: string; value: string[] };
    usage?: { value: string };
    uses?: { max: number; value: number };
    quantity?: number;
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
}

export interface LoadedFeat {
    id: string;
    name: string;
    category: 'ancestry' | 'class' | 'skill' | 'general' | 'archetype' | 'mythic' | 'bonus';
    level: number;
    actionType: 'passive' | 'action' | 'reaction' | 'free';
    actionCost: number | null;
    traits: string[];
    rarity: string;
    prerequisites: string[];
    description: string;
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

export interface LoadedGear {
    id: string;
    name: string;
    level: number;
    priceGp: number;
    bulk: number;
    traits: string[];
    rarity: string;
    description: string;
    category: 'equipment' | 'consumable' | 'treasure' | 'backpack' | 'kit';
    qty?: number;
}

// ============ Transform Functions ============

function transformWeapon(raw: RawPF2eItem): LoadedWeapon | null {
    if (raw.type !== 'weapon') return null;

    const sys = raw.system as RawWeaponSystem;
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

function transformAction(raw: RawPF2eItem): LoadedAction | null {
    if (raw.type !== 'action') return null;

    const sys = raw.system as RawActionSystem;

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
        description: stripHtml(sys.description?.value || ''),
    };
}

function transformSpell(raw: RawPF2eItem): LoadedSpell | null {
    if (raw.type !== 'spell') return null;

    const sys = raw.system as RawSpellSystem;

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

    return {
        id: raw._id,
        name: raw.name,
        rank: sys.level?.value || 0,
        traditions: sys.traits?.traditions || [],
        traits: sys.traits?.value || [],
        rarity: sys.traits?.rarity || 'common',
        castTime: sys.time?.value || '2',
        range: sys.range?.value || '',
        area,
        duration: sys.duration?.value || '',
        damage,
        save,
        description: stripHtml(sys.description?.value || ''),
    };
}

function transformFeat(raw: RawPF2eItem): LoadedFeat | null {
    if (raw.type !== 'feat') return null;

    const sys = raw.system as RawFeatSystem;

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

    return {
        id: raw._id,
        name: raw.name,
        category,
        level: sys.level?.value || 1,
        actionType,
        actionCost,
        traits: sys.traits?.value || [],
        rarity: sys.traits?.rarity || 'common',
        prerequisites,
        description: stripHtml(sys.description?.value || ''),
    };
}

function transformCondition(raw: RawPF2eItem): LoadedCondition | null {
    if (raw.type !== 'condition') return null;

    const sys = raw.system as RawConditionSystem;

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

    const sys = raw.system as RawArmorSystem;
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
    };
}

function transformShield(raw: RawPF2eItem): LoadedShield | null {
    if (raw.type !== 'shield') return null;

    const sys = raw.system as RawShieldSystem;
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
    };
}

function transformAncestry(raw: RawPF2eItem): LoadedAncestry | null {
    if (raw.type !== 'ancestry') return null;

    const sys = raw.system as RawAncestrySystem;

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

    const sys = raw.system as RawHeritageSystem;

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

    const sys = raw.system as RawClassSystem;

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

function stripHtml(html: string): string {
    return html
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\\n/g, ' ')
        .trim();
}

function transformGear(raw: RawPF2eItem): LoadedGear | null {
    // Filter for gear types only (exclude weapon, armor, shield)
    const validTypes = ['equipment', 'consumable', 'treasure', 'backpack', 'kit'];
    if (!raw.type || !validTypes.includes(raw.type)) return null;

    const sys = raw.system as RawGearSystem;
    if (!sys) return null;

    const price = sys.price?.value || {};
    const priceGp = (price.pp || 0) * 10 + (price.gp || 0) + (price.sp || 0) / 10 + (price.cp || 0) / 100;

    // Map category
    let category: LoadedGear['category'] = 'equipment';
    if (raw.type === 'consumable') category = 'consumable';
    else if (raw.type === 'treasure') category = 'treasure';
    else if (raw.type === 'backpack') category = 'backpack';
    else if (raw.type === 'kit') category = 'kit';

    return {
        id: raw._id,
        name: raw.name,
        level: sys.level?.value || 0,
        priceGp,
        bulk: sys.bulk?.value ?? 0,
        traits: sys.traits?.value || [],
        rarity: sys.traits?.rarity || 'common',
        description: stripHtml(sys.description?.value || ''),
        category,
        qty: sys.quantity ?? sys.uses?.value ?? 1,
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
        const action = transformAction(raw as RawPF2eItem);
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
