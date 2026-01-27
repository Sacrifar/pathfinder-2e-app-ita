/**
 * Dice types for the dice rolling system
 */

export interface WeaponRollData {
    weaponId: string;
    weaponName: string;
    damage: string;  // Damage formula (e.g., "1d8+3")
    damageType: string;  // Damage type (e.g., "slashing")
    attackBonus: number;  // Base attack bonus without MAP
    isTwoHanded: boolean;  // Whether weapon is in two-handed mode
    isAgile: boolean;  // Whether weapon has agile trait (reduced MAP)
    element?: string;  // Optional: legacy single elemental type (kept for backward compatibility)
    elementalTypes?: string[];  // Optional: array of elemental types for multi-colored dice (e.g., ['fire', 'cold', 'acid'])
}

export interface ImpulseRollData {
    impulseType: 'blast' | 'attack' | 'damage';
    impulseName: string;
    element: string;  // For kineticist element (air, fire, earth, etc.)
    attackBonus: number;  // Base attack bonus without MAP
    damage: string;  // Damage formula
    isAgile: boolean;  // Whether blast is agile
    isMelee: boolean;  // Whether blast is melee (affects damage mod)
    isTwoActions: boolean;  // For blast: whether it's 2-action version (affects damage mod)
}

export interface SpellRollData {
    spellId: string;
    spellName: string;
    rank: number;  // 0 for cantrips
    damage?: string;  // Damage formula if any
    element?: string;  // For elemental spells
    spellAttack: number;  // Spell attack bonus
    spellDC: number;  // Spell DC
    castTime: string;  // Action cost
    requiresAttackRoll?: boolean;  // True if spell requires an attack roll (has 'attack' trait)
}

export interface DiceRoll {
    formula: string;
    label: string;
    total: number;
    rolls: Array<{
        count: number;
        sides: number;
        results: number[];
        total: number;
    }>;
    modifier: number;
    isCritSuccess: boolean;
    isCritFailure: boolean;
    timestamp: number;
    element?: string;  // Optional: for kineticist elemental blasts (air, fire, earth, metal, water, wood)
    weaponData?: WeaponRollData;  // Optional: weapon data for weapon-specific dicebox actions
    impulseData?: ImpulseRollData;  // Optional: impulse data for impulse-specific dicebox actions
    spellData?: SpellRollData;  // Optional: spell data for spell-specific dicebox actions
}

export interface DiceConfig {
    enable3D?: boolean;
    soundEnabled?: boolean;
    autoHide?: boolean;
    hideDelay?: number;
}

export interface DiceTheme {
    name: string;
    diceColor: string;
    labelColor: string;
    outlineColor: string;
    texture?: string;
    material?: 'plastic' | 'metal' | 'wood' | 'glass';
}

export const defaultDiceThemes: Record<string, DiceTheme> = {
    default: {
        name: 'Default',
        diceColor: '#f59e0b',
        labelColor: '#ffffff',
        outlineColor: '#000000',
        material: 'plastic'
    },
    fantasy: {
        name: 'Fantasy',
        diceColor: '#8b5cf6',
        labelColor: '#ffd700',
        outlineColor: '#4c1d95',
        material: 'plastic'
    },
    classic: {
        name: 'Classic',
        diceColor: '#ef4444',
        labelColor: '#ffffff',
        outlineColor: '#000000',
        material: 'plastic'
    }
};
