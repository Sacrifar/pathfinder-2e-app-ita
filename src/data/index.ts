/**
 * Data barrel - exports all data with translations
 */

// Export raw loader functions (excluding duplicates from pets.ts)
export {
    getWeapons,
    getActions,
    getSpells,
    getFeats,
    getConditions,
    getAncestries,
    getHeritages,
    getClasses,
    getArmor,
    getShields,
    getGear,
    getAnimalCompanionTypes,
    type LoadedWeapon,
    type LoadedAction,
    type LoadedSpell,
    type LoadedFeat,
    type LoadedCondition,
    type LoadedAncestry,
    type LoadedHeritage,
    type LoadedClass,
    type LoadedArmor,
    type LoadedShield,
    type LoadedGear,
    type CompanionType,
    type FamiliarAbility,
    type EidolonEvolution,
} from './pf2e-loader';

// Export translations
export * from './translations';

// Export backgrounds (now loaded from JSON)
export * from './backgrounds';

// Also import for compatibility wrapper
import { getBackgrounds as getBackgroundsRaw } from './backgrounds';

// Export as array for backward compatibility
export const backgrounds = getBackgroundsRaw();

// Export skills
export * from './skills';

// Export pets (includes getFamiliarAbilities and getEidolonEvolutions)
export * from './pets';

// Export tactics
export * from './tactics';

// Export spell-granting items database
export * from './spellGrantingItems';

// Export class progressions
export * from './classProgressions';

// Export spell slot progression
export * from './spellSlotProgression';

// ============ Compatibility wrappers ============
// These provide nameIt/descriptionIt for components that expect them

import {
    getAncestries as getAncestriesRaw,
    getClasses as getClassesRaw,
    getHeritages as getHeritagesRaw,
    type LoadedAncestry,
    type LoadedClass,
    type LoadedHeritage,
} from './pf2e-loader';

import {
    ancestryTranslations,
    classTranslations,
    heritageTranslations
} from './translations';

// Ancestry with translations
export interface TranslatedAncestry extends LoadedAncestry {
    nameIt?: string;
    descriptionIt?: string;
    hitPoints: number; // Alias for hp
    abilityBoosts: string[];
    abilityFlaws: string[];
    features: Array<{ name: string; nameIt?: string; description: string; descriptionIt?: string }>;
}

export const ancestries: TranslatedAncestry[] = getAncestriesRaw().map(a => ({
    ...a,
    nameIt: ancestryTranslations[a.name]?.nameIt,
    descriptionIt: ancestryTranslations[a.name]?.descriptionIt,
    hitPoints: a.hp,
    abilityBoosts: a.boosts,
    abilityFlaws: a.flaws,
    features: [], // Will be loaded separately if needed
}));

// Class with translations
export interface TranslatedClass extends LoadedClass {
    nameIt?: string;
    descriptionIt?: string;
    hitPoints: number;
    spellcasting?: { tradition: string; type: string; ability: string } | null;
    features: Array<{ level: number; name: string; nameIt?: string; description: string; descriptionIt?: string }>;
}

export const classes: TranslatedClass[] = getClassesRaw().map(c => ({
    ...c,
    nameIt: classTranslations[c.name]?.nameIt,
    descriptionIt: classTranslations[c.name]?.descriptionIt,
    hitPoints: c.hp,
    spellcasting: c.hasSpellcasting ? { tradition: 'arcane', type: 'prepared', ability: 'int' } : null,
    features: c.classFeatures.map(f => ({
        level: f.level,
        name: f.name,
        nameIt: undefined, // Could add translations later
        description: '',
        descriptionIt: undefined,
    })),
}));

// Heritage with translations
export interface TranslatedHeritage extends LoadedHeritage {
    nameIt?: string;
    descriptionIt?: string;
    ancestryId: string;
    features: Array<{ name: string; nameIt?: string; description: string; descriptionIt?: string }>;
}

export const heritages: TranslatedHeritage[] = getHeritagesRaw().map(h => ({
    ...h,
    nameIt: heritageTranslations[h.name]?.nameIt,
    descriptionIt: undefined,
    ancestryId: h.ancestrySlug || '',
    features: [], // Heritages features are embedded in description
}));

export function getHeritagesForAncestry(ancestryId: string): TranslatedHeritage[] {
    // Find the ancestry by ID to get its name (which is the slug in heritages)
    const ancestry = ancestries.find(a => a.id === ancestryId);

    if (!ancestry) {
        // Try direct slug match as fallback
        return heritages.filter(h =>
            h.ancestrySlug === ancestryId.toLowerCase()
        );
    }

    // Match by ancestry name (lowercased = slug)
    const ancestrySlug = ancestry.name.toLowerCase();

    return heritages.filter(h =>
        h.ancestrySlug === ancestrySlug
    );
}

// Get versatile heritages (can be applied to any ancestry)
export function getVersatileHeritages(): TranslatedHeritage[] {
    return heritages.filter(h => h.ancestrySlug === null || h.ancestrySlug === '');
}

// Helper to get ancestry by ID
export function getAncestryById(id: string) {
    return ancestries.find(a => a.id === id || a.name.toLowerCase() === id.toLowerCase());
}

// Helper to get class by ID  
export function getClassById(id: string) {
    return classes.find(c => c.id === id || c.name.toLowerCase() === id.toLowerCase());
}
