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
 * - The class name (e.g., 'Bard') - automatically converted to Foundry ID
 * - Focus spells automatically granted
 * - Cantrips automatically granted
 * - The level at which they're granted (usually 1)
 *
 * NOTE: This file now uses class names instead of hardcoded Foundry IDs
 * for better maintainability. The classMetadata system handles ID conversion.
 */

import { getClassIdByName } from './classMetadata';

export interface ClassGrantedSpell {
    spellId: string;        // The spell ID from pf2e data
    spellType: 'focus' | 'cantrip' | 'spell'; // Type of spell
    grantedAtLevel: number; // Level when this spell is granted
}

export interface ClassGrantedSpells {
    classId: string;        // Foundry class ID (auto-filled from className)
    className?: string;     // Class name (preferred)
    focusSpells?: ClassGrantedSpell[];
    cantrips?: ClassGrantedSpell[];
    spells?: ClassGrantedSpell[];
}

/**
 * Database of class-granted spells (using class names)
 *
 * Maps class names to their automatically granted spells.
 * Class names are automatically converted to Foundry IDs at runtime.
 */
export const CLASS_GRANTED_SPELLS_BY_NAME: Record<string, ClassGrantedSpells> = {
    // BARD
    // Composition Spells class feature grants:
    // - Counter Performance (focus spell) at level 1
    // - Courageous Anthem (composition cantrip) at level 1
    // Note: Composition cantrips are displayed in the Focus Spells tab
    'Bard': {
        classId: '', // Will be auto-filled
        className: 'Bard',
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
 * Convert class-granted spells from names to IDs
 * @internal
 */
function convertGrantedSpellsToIds(): Record<string, ClassGrantedSpells> {
    const result: Record<string, ClassGrantedSpells> = {};

    for (const [className, spells] of Object.entries(CLASS_GRANTED_SPELLS_BY_NAME)) {
        const classId = getClassIdByName(className);

        if (!classId) {
            console.warn(
                `[ClassGrantedSpells] Class "${className}" not found. Granted spells will not work for this class.`
            );
            continue;
        }

        result[classId] = { ...spells, classId };
    }

    return result;
}

/**
 * Exported class granted spells with IDs (for backward compatibility)
 */
export const CLASS_GRANTED_SPELLS: Record<string, ClassGrantedSpells> = convertGrantedSpellsToIds();

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

/**
 * Get the spell granted by the Bard's Muse
 * Checks for specific Muse feats and returns the corresponding spell slug
 */
export function getBardMuseSpell(character: any): string | undefined {
    if (!character.feats) return undefined;

    // Muse Feat IDs (Legacy fallback)
    const ENIGMA_ID = '4ripp6EfdVpS0d60';
    const MAESTRO_ID = 'YMBsi4bndRAk5CX4';
    const POLYMATH_ID = 'y0jGimYdMGDJWrEq';
    const WARRIOR_ID = 'N03BtRvjX9TeHRa4';
    const ZOOPHONIA_ID = 'VjQfJKeDc46cWtgk';

    // Spell IDs (checked from source files)
    const SURE_STRIKE_ID = 'Gb7SeieEvd0pL2Eh';
    const SOOTHE_ID = 'szIyEsvihc5e1w8n';
    const PHANTASMAL_MINION_ID = 'xqmHD8JIjak15lRk';
    const FEAR_ID = '4koZzrnMXhhosn0D';
    const SUMMON_ANIMAL_ID = '4YnON9JHYqtLzccu';

    // Check class specialization first (New system)
    if (character.classSpecializationId) {
        // classSpecializationId can be a string or array of strings
        const specs = Array.isArray(character.classSpecializationId)
            ? character.classSpecializationId
            : [character.classSpecializationId];

        for (const spec of specs) {
            if (spec === 'muse_enigma') return SURE_STRIKE_ID;
            if (spec === 'muse_maestro') return SOOTHE_ID;
            if (spec === 'muse_polymath') return PHANTASMAL_MINION_ID;
            if (spec === 'muse_warrior') return FEAR_ID;
            if (spec === 'muse_zoophonia') return SUMMON_ANIMAL_ID;
        }
    }

    // Fallback: Check feats (Old system / Multifarious Muse)
    for (const feat of character.feats) {
        if (feat.featId === ENIGMA_ID) return SURE_STRIKE_ID;
        if (feat.featId === MAESTRO_ID) return SOOTHE_ID;
        if (feat.featId === POLYMATH_ID) return PHANTASMAL_MINION_ID;
        if (feat.featId === WARRIOR_ID) return FEAR_ID;
        if (feat.featId === ZOOPHONIA_ID) return SUMMON_ANIMAL_ID;
    }

    return undefined;
}
