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

export interface LoadedCondition {
    id: string;
    name: string;
    description: string;
    isValued: boolean;
    value: number | null;
    group: string;
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

    return {
        id: raw._id,
        name: raw.name,
        description: stripHtml(sys.description?.value || ''),
        isValued: sys.value?.isValued || false,
        value: sys.value?.value || null,
        group: sys.group || '',
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

// ============ Cached data ============

let cachedWeapons: LoadedWeapon[] | null = null;
let cachedActions: LoadedAction[] | null = null;
let cachedSpells: LoadedSpell[] | null = null;
let cachedFeats: LoadedFeat[] | null = null;
let cachedConditions: LoadedCondition[] | null = null;

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

// Summary stats
export function getDataStats() {
    return {
        weapons: getWeapons().length,
        actions: getActions().length,
        spells: getSpells().length,
        feats: getFeats().length,
        conditions: getConditions().length,
    };
}
