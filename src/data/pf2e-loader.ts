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

// Summary stats
export function getDataStats() {
    return {
        weapons: getWeapons().length,
        actions: getActions().length,
        spells: getSpells().length,
    };
}
