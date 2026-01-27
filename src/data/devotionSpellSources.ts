/**
 * Devotion Spell Sources Database
 *
 * This file defines feats that grant devotion spells (focus spells).
 * Devotion spells are focus spells granted by:
 * - Archetype dedication feats like:
 *   - Blessed One Dedication (grants Lay on Hands)
 *   - Champion Dedication (grants Lay on Hands via Advanced Devotion)
 * - Class feats that grant focus spells like:
 *   - Bard: Hymn of Healing, Inspire Heroics, etc.
 *   - Other classes with focus spell-granting feats
 *
 * Unlike class-granted focus spells, devotion spells from feats:
 * - Use the character's Focus Pool (same as other focus spells)
 * - May require spellcasting initialization (if the character isn't already a spellcaster)
 * - Have specific traditions (divine, primal, occult, arcane, etc.)
 * - May require specific key abilities (Charisma for Blessed One/Bard)
 */

import type { Character } from '../types';

/**
 * Definition of a devotion spell granted by an archetype dedication feat
 */
export interface DevotionSpellGrant {
    spellId: string;           // The spell ID from pf2e data
    tradition: 'arcane' | 'divine' | 'occult' | 'primal'; // Spell tradition
    keyAbility: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'; // Key ability for spell DC/attack
}

/**
 * Definition of a feat that grants devotion spells
 * IMPORTANT: featId must use the slug-based ID (e.g., 'hymn-of-healing')
 * NOT the Foundry _id (e.g., 'jGTRRCqxn1FIBxE2')
 */
export interface DevotionSpellSource {
    featId: string;            // The feat ID using slug format (e.g., 'hymn-of-healing', 'blessed-one-dedication')
    featName: string;          // Feat name for display (English)
    featNameIt?: string;       // Feat name (Italian)
    grantsFocusPoint: boolean; // Whether this feat grants a Focus Point
    devotionSpell?: DevotionSpellGrant; // The devotion spell granted (if any)
    // Future: could support multiple devotion spells
}

/**
 * Database of all feats that grant devotion spells (focus spells)
 * Includes both archetype dedications and class feats
 */
export const DEVOTION_SPELL_SOURCES: Record<string, DevotionSpellSource> = {
    // ============ ARCHETYPE DEDICATIONS ============

    // BLESSED ONE ARCHETYPE
    'blessed-one-dedication': {
        featId: 'blessed-one-dedication',
        featName: 'Blessed One Dedication',
        featNameIt: 'Dedicazione Benedetto',
        grantsFocusPoint: true,
        devotionSpell: {
            spellId: 'zNN9212H2FGfM7VS', // Lay on Hands (devotion spell)
            tradition: 'divine',
            keyAbility: 'cha',
        },
    },

    // CHAMPION ARCHETYPE
    // Champion Dedication itself doesn't grant a devotion spell,
    // but Advanced Devotion (level 6) does
    'champion-advanced-devotion': {
        featId: 'champion-advanced-devotion',
        featName: 'Advanced Devotion',
        featNameIt: 'Devozione Avanzata',
        grantsFocusPoint: false, // Doesn't grant an additional point
        devotionSpell: {
            spellId: 'zNN9212H2FGfM7VS', // Lay on Hands
            tradition: 'divine',
            keyAbility: 'cha', // Or str/dex for champion
        },
    },

    // ============ CLASS FEATS ============

    // BARD - Composition Spells that are Focus Spells
    // These are optional feats that grant additional focus spells beyond the default ones
    // IMPORTANT: featId uses slug format (name.toLowerCase().replace(/\s+/g, '-'))
    'hymn-of-healing': {
        featId: 'hymn-of-healing', // Hymn of Healing (feat)
        featName: 'Hymn of Healing',
        featNameIt: 'Inno di Guarigione',
        grantsFocusPoint: true, // Grants 1 Focus Point
        devotionSpell: {
            spellId: 'gSUQlTDYoLDGAsCP', // Hymn of Healing (focus spell)
            tradition: 'occult',
            keyAbility: 'cha',
        },
    },
    'lingering-composition': {
        featId: 'lingering-composition', // Lingering Composition (feat)
        featName: 'Lingering Composition',
        featNameIt: 'Composizione Persistente',
        grantsFocusPoint: true, // Grants 1 Focus Point
        devotionSpell: {
            spellId: 'irTdhxTixU9u9YUm', // Lingering Composition (focus spell)
            tradition: 'occult',
            keyAbility: 'cha',
        },
    },
    'soothing-ballad': {
        featId: 'soothing-ballad', // Soothing Ballad (feat)
        featName: 'Soothing Ballad',
        featNameIt: 'Ballata Calmante',
        grantsFocusPoint: true, // Grants 1 Focus Point
        devotionSpell: {
            spellId: '0JigNJDRwevZOyjI', // Soothing Ballad (focus spell)
            tradition: 'occult',
            keyAbility: 'cha',
        },
    },

    // TODO: Add other archetype dedications that grant devotion spells
    // - Cleric Dedication (Domain Initiate grants domain spell)
    // - Druid Dedication (Wild Order grants wild spell)
    // - Sorcerer Dedication (might grant bloodline spells)
    // - Bard Dedication (might grant muse spells)
    // TODO: Add other class feats that grant focus spells
    // - Bard: Inspire Heroics, Lingering Composition, etc.
    // - Other classes with focus spell-granting feats
};

/**
 * Check if a feat grants a devotion spell
 */
export function isDevotionSpellSource(featId: string): boolean {
    return featId in DEVOTION_SPELL_SOURCES;
}

/**
 * Get devotion spell source by feat ID
 */
export function getDevotionSpellSource(featId: string): DevotionSpellSource | undefined {
    return DEVOTION_SPELL_SOURCES[featId];
}

/**
 * Get all devotion spells for a character from their archetype dedication feats
 * Returns an array of spell IDs that should be added to focusSpells
 */
export function getDevotionSpellsForCharacter(character: Character): string[] {
    const devotionSpellIds: string[] = [];

    if (!character.feats) {
        return devotionSpellIds;
    }

    for (const feat of character.feats) {
        // Only process feats at or below current level
        if (feat.level > character.level) {
            continue;
        }

        const source = DEVOTION_SPELL_SOURCES[feat.featId];
        if (source?.devotionSpell) {
            devotionSpellIds.push(source.devotionSpell.spellId);
        }
    }

    return devotionSpellIds;
}

/**
 * Check if a character has any archetype dedication that grants spellcasting
 * (for initializing spellcasting data if needed)
 */
export function hasArchetypeSpellcasting(character: Character): boolean {
    if (!character.feats) {
        return false;
    }

    for (const feat of character.feats) {
        if (feat.level <= character.level && isDevotionSpellSource(feat.featId)) {
            return true;
        }
    }

    return false;
}

/**
 * Get the spellcasting tradition for archetype devotion spells
 * Returns the tradition of the first devotion spell source found
 */
export function getArchetypeSpellTradition(character: Character): 'arcane' | 'divine' | 'occult' | 'primal' | null {
    if (!character.feats) {
        return null;
    }

    for (const feat of character.feats) {
        if (feat.level <= character.level) {
            const source = DEVOTION_SPELL_SOURCES[feat.featId];
            if (source?.devotionSpell) {
                return source.devotionSpell.tradition;
            }
        }
    }

    return null;
}

/**
 * Get the key ability for archetype devotion spells
 * Returns the ability of the first devotion spell source found
 */
export function getArchetypeSpellKeyAbility(character: Character): 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha' | null {
    if (!character.feats) {
        return null;
    }

    for (const feat of character.feats) {
        if (feat.level <= character.level) {
            const source = DEVOTION_SPELL_SOURCES[feat.featId];
            if (source?.devotionSpell) {
                return source.devotionSpell.keyAbility;
            }
        }
    }

    return null;
}
