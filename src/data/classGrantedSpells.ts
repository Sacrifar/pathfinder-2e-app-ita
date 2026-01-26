/**
 * Class-Granted Spells Database
 *
 * This file defines spells that are automatically granted to characters
 * based on their class features. These include:
 * - Focus spells (granted by class features like "Composition Spells")
 * - Cantrips (class-specific cantrips like "Composition Cantrips")
 * - Other spells granted by class features at level 1
 *
 * Each entry defines:
 * - The class ID (Foundry ID)
 * - Focus spells automatically granted
 * - Cantrips automatically granted
 * - The level at which they're granted (usually 1)
 */

export interface ClassGrantedSpell {
    spellId: string;        // The spell ID from pf2e data
    spellType: 'focus' | 'cantrip' | 'spell'; // Type of spell
    grantedAtLevel: number; // Level when this spell is granted
}

export interface ClassGrantedSpells {
    classId: string;        // Foundry class ID
    focusSpells?: ClassGrantedSpell[];
    cantrips?: ClassGrantedSpell[];
    spells?: ClassGrantedSpell[];
}

/**
 * Database of class-granted spells
 *
 * Maps class IDs to their automatically granted spells
 */
export const CLASS_GRANTED_SPELLS: Record<string, ClassGrantedSpells> = {
    // BARD
    // Composition Spells class feature grants:
    // - Counter Performance (focus spell) at level 1
    // - Courageous Anthem (composition cantrip) at level 1
    // Note: Composition cantrips are displayed in the Focus Spells tab
    '3gweRQ5gn7szIWAv': {
        classId: '3gweRQ5gn7szIWAv',
        focusSpells: [
            {
                spellId: 'WILXkjU5Yq3yw10r', // Counter Performance (focus spell)
                spellType: 'focus',
                grantedAtLevel: 1,
            },
            {
                spellId: 'IAjvwqgiDr3qGYxY', // Courageous Anthem (composition cantrip)
                spellType: 'cantrip',
                grantedAtLevel: 1,
            },
        ],
    },

    // TODO: Add other classes with granted spells
    // CHAMPION - Divine ally grants champion specific focus spells
    // CLERIC - Doctrine grants specific spells
    // SORCERER - Bloodline grants bloodline spells
    // etc.
};

/**
 * Get class-granted spells configuration by class ID
 */
export function getClassGrantedSpells(classId: string): ClassGrantedSpells | undefined {
    return CLASS_GRANTED_SPELLS[classId];
}

/**
 * Get all focus spells granted by a class at a specific level
 */
export function getClassGrantedFocusSpells(classId: string, level: number): string[] {
    const classSpells = CLASS_GRANTED_SPELLS[classId];
    if (!classSpells?.focusSpells) return [];

    return classSpells.focusSpells
        .filter(spell => spell.grantedAtLevel <= level)
        .map(spell => spell.spellId);
}

/**
 * Get all cantrips granted by a class at a specific level
 */
export function getClassGrantedCantrips(classId: string, level: number): string[] {
    const classSpells = CLASS_GRANTED_SPELLS[classId];
    if (!classSpells?.cantrips) return [];

    return classSpells.cantrips
        .filter(spell => spell.grantedAtLevel <= level)
        .map(spell => spell.spellId);
}

/**
 * Get all spells (non-focus, non-cantrip) granted by a class at a specific level
 */
export function getClassGrantedRegularSpells(classId: string, level: number): string[] {
    const classSpells = CLASS_GRANTED_SPELLS[classId];
    if (!classSpells?.spells) return [];

    return classSpells.spells
        .filter(spell => spell.grantedAtLevel <= level)
        .map(spell => spell.spellId);
}

/**
 * Get all spells (any type) granted by a class at a specific level
 */
export function getAllClassGrantedSpells(classId: string, level: number): ClassGrantedSpell[] {
    const classSpells = CLASS_GRANTED_SPELLS[classId];
    if (!classSpells) return [];

    const allSpells: ClassGrantedSpell[] = [];

    if (classSpells.focusSpells) {
        allSpells.push(...classSpells.focusSpells.filter(spell => spell.grantedAtLevel <= level));
    }

    if (classSpells.cantrips) {
        allSpells.push(...classSpells.cantrips.filter(spell => spell.grantedAtLevel <= level));
    }

    if (classSpells.spells) {
        allSpells.push(...classSpells.spells.filter(spell => spell.grantedAtLevel <= level));
    }

    return allSpells;
}
