/**
 * Weapon Calculation Utilities
 * Optimized functions for weapon attack bonuses, damage, and MAP calculations
 */

import { Character, EquippedItem, WeaponRunes, WeaponCustomization } from '../types';
import { LoadedWeapon } from '../data/pf2e-loader';
import { getAbilityModifier, getWeaponProficiencyRank, calculateProficiencyBonusWithVariant, ProficiencyRank } from './pf2e-math';
import { calculateWeaponDamage } from './pf2e-math';

/**
 * Multiple Attack Penalty values
 */
export interface MAPValues {
    first: number;    // First attack: 0
    second: number;   // Second attack: -5 (-4 for agile)
    third: number;    // Third attack: -10 (-8 for agile)
}

/**
 * Complete weapon stats including MAP
 */
export interface WeaponStats {
    attackBonus: number;
    damage: string;
    damageType: string;
    map: MAPValues;
    proficiency: {
        rank: ProficiencyRank;
        bonus: number;
    };
    itemBonus: number;
    abilityMod: number;
}

/**
 * Calculate MAP (Multiple Attack Penalty) for a weapon
 * Agile weapons have reduced penalty
 */
export function calculateMAP(isAgile: boolean): MAPValues {
    if (isAgile) {
        return { first: 0, second: -4, third: -8 };
    }
    return { first: 0, second: -5, third: -10 };
}

/**
 * Calculate attack bonus with MAP penalty
 */
export function calculateAttackBonusWithMAP(
    baseAttackBonus: number,
    attackNumber: 1 | 2 | 3,
    map: MAPValues
): number {
    const penalty = attackNumber === 1 ? map.first : attackNumber === 2 ? map.second : map.third;
    return baseAttackBonus + penalty;
}

/**
 * Calculate complete weapon stats (memoizable)
 */
export function calculateWeaponStats(
    character: Character,
    weapon: LoadedWeapon,
    isTwoHanded: boolean,
    equippedItem?: EquippedItem
): WeaponStats {
    const weaponRunes = equippedItem?.runes as WeaponRunes | undefined;
    const weaponCustomization = equippedItem?.customization as WeaponCustomization | undefined;

    // Ability modifier
    const abilityMod = getAbilityModifier(character.abilityScores.str);

    // Proficiency
    const profRank = getWeaponProficiencyRank(character, weapon.category);
    const profBonus = calculateProficiencyBonusWithVariant(
        character.level,
        profRank,
        character.variantRules?.proficiencyWithoutLevel
    );

    // Item bonus from potency rune
    let itemBonus = 0;
    if (weaponRunes?.potencyRune) {
        // potencyRune is a number (1, 2, 3, 4, 5) representing the bonus
        itemBonus = typeof weaponRunes.potencyRune === 'number'
            ? weaponRunes.potencyRune
            : 0;
    }

    // Custom bonus
    const customBonus = weaponCustomization?.bonusAttack || 0;

    // Base attack bonus
    const attackBonus = abilityMod + profBonus + itemBonus + customBonus;

    // MAP values
    const isAgile = weapon.traits.includes('agile');
    const map = calculateMAP(isAgile);

    // Damage
    const damage = calculateWeaponDamage(character, weapon, isTwoHanded, {
        runes: weaponRunes,
        customization: weaponCustomization
    });

    return {
        attackBonus,
        damage,
        damageType: weaponCustomization?.customDamageType || weapon.damageType,
        map,
        proficiency: {
            rank: profRank,
            bonus: profBonus
        },
        itemBonus,
        abilityMod
    };
}

/**
 * Format attack bonus with MAP (e.g., "+8/+3/-2")
 */
export function formatAttackWithMAP(baseBonus: number, map: MAPValues): string {
    const first = baseBonus >= 0 ? `+${baseBonus}` : `${baseBonus}`;
    const second = baseBonus + map.second >= 0 ? `+${baseBonus + map.second}` : `${baseBonus + map.second}`;
    const third = baseBonus + map.third >= 0 ? `+${baseBonus + map.third}` : `${baseBonus + map.third}`;
    return `${first}/${second}/${third}`;
}

/**
 * Check if weapon has two-hand-d* trait
 */
export function hasTwoHandTrait(weapon: LoadedWeapon): boolean {
    return weapon.traits.some(t => t.startsWith('two-hand-d'));
}

/**
 * Get weapon type category for display
 */
export function getWeaponCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
        'simple': 'Simple',
        'martial': 'Martial',
        'advanced': 'Advanced',
        'unarmed': 'Unarmed'
    };
    return labels[category] || category;
}

/**
 * Get melee/ranged indicator
 */
export function getWeaponRangeType(weapon: LoadedWeapon): 'melee' | 'ranged' | 'both' {
    const hasRange = weapon.range !== null && weapon.range > 0;
    const hasThrown = weapon.traits.includes('Thrown');

    if (hasRange && !hasThrown) return 'ranged';
    if (hasThrown) return 'both';
    return 'melee';
}

/**
 * Calculate weapon range increment for thrown weapons
 */
export function getWeaponRange(weapon: LoadedWeapon): number | null {
    if (weapon.range !== null && weapon.range > 0) {
        return weapon.range;
    }
    // Thrown weapons use their range value
    const thrownTrait = weapon.traits.find(t => t.startsWith('Thrown '));
    if (thrownTrait) {
        const match = thrownTrait.match(/Thrown (\d+)/);
        if (match) return parseInt(match[1]);
    }
    return null;
}
