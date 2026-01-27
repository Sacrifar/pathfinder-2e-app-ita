/**
 * Esoteric Polymath Spellbook Utility Functions
 * Handles the Bard's Esoteric Polymath feat spellbook mechanics
 */

import { Character } from '@/types/character';
import { getClassNameById } from '../data/classSpecializations';
import { getSpells, LoadedSpell } from '../data/pf2e-loader';

/**
 * Check if a character has the Esoteric Polymath feat
 */
export function hasEsotericPolymath(character: Character): boolean {
    // Check both the name-based ID and the Foundry raw ID for compatibility
    return character.feats?.some(feat =>
        feat.featId === 'esoteric-polymath' || feat.featId === '4HZTLPKPteEFsa7n'
    ) || false;
}

/**
 * Check if a character is a Bard with the Polymath muse
 * (prerequisite for Esoteric Polymath)
 */
export function hasPolymathMuse(character: Character): boolean {
    const className = getClassNameById(character.classId);
    if (className !== 'Bard') return false;

    // Check if Polymath muse is selected
    const polymathMuseIds = [
        'z9QXwXcGB9rwYWDm', // Polymath muse (old ID)
        'polymath', // Polymath muse (new ID)
    ];

    const specializationId = character.classSpecializationId;
    if (Array.isArray(specializationId)) {
        return specializationId.some(id => polymathMuseIds.includes(id));
    }

    return specializationId ? polymathMuseIds.includes(specializationId) : false;
}

/**
 * Initialize the Esoteric Polymath spellbook when the feat is taken
 * All spells in the character's repertoire are automatically added to the spellbook
 */
export function initializeEsotericPolymathSpellbook(character: Character): Character {
    if (!hasEsotericPolymath(character)) {
        // If feat is removed, clear the spellbook
        if (character.spellbook?.esotericPolymath) {
            const { spellbook, ...rest } = character;
            return {
                ...rest,
                spellbook: spellbook.esotericPolymath ? undefined : spellbook,
            };
        }
        return character;
    }

    // Get all known spells (the repertoire)
    const knownSpells = character.spellcasting?.knownSpells || [];

    // Initialize spellbook with all known spells
    return {
        ...character,
        spellbook: {
            ...character.spellbook,
            esotericPolymath: {
                occultSpells: knownSpells,
                dailyPreparation: character.spellbook?.esotericPolymath?.dailyPreparation || null,
            },
        },
    };
}

/**
 * Add a new spell to the Esoteric Polymath spellbook
 * This is called when the Bard learns a new spell via Occultism skill
 */
export function addSpellToEsotericPolymathBook(
    character: Character,
    spellId: string
): Character {
    if (!hasEsotericPolymath(character)) {
        return character;
    }

    const occultSpells = character.spellbook?.esotericPolymath?.occultSpells || [];

    // Don't add duplicates
    if (occultSpells.includes(spellId)) {
        return character;
    }

    return {
        ...character,
        spellbook: {
            ...character.spellbook,
            esotericPolymath: {
                ...character.spellbook!.esotericPolymath!,
                occultSpells: [...occultSpells, spellId],
            },
        },
    };
}

/**
 * Remove a spell from the Esoteric Polymath spellbook
 */
export function removeSpellFromEsotericPolymathBook(
    character: Character,
    spellId: string
): Character {
    if (!character.spellbook?.esotericPolymath) {
        return character;
    }

    const occultSpells = character.spellbook.esotericPolymath.occultSpells.filter(
        id => id !== spellId
    );

    // If the removed spell was the daily preparation, clear it
    const dailyPreparation =
        character.spellbook.esotericPolymath.dailyPreparation === spellId
            ? null
            : character.spellbook.esotericPolymath.dailyPreparation;

    return {
        ...character,
        spellbook: {
            ...character.spellbook,
            esotericPolymath: {
                occultSpells,
                dailyPreparation,
            },
        },
    };
}

/**
 * Set the daily preparation spell for Esoteric Polymath
 * This is called during daily preparations
 *
 * For spontaneous casters, this automatically adds heightened versions
 * of the spell to the repertoire, since signature spells can be cast at any rank.
 */
export function setEsotericPolymathDailyPreparation(
    character: Character,
    spellId: string | null
): Character {
    if (!hasEsotericPolymath(character)) {
        return character;
    }

    // If setting to null, clear the daily preparation and remove heightened versions
    if (spellId === null) {
        const dailyPrep = character.spellbook?.esotericPolymath?.dailyPreparation;

        // If there was a previous daily preparation, remove its heightened versions
        let updatedCharacter: Character = {
            ...character,
            spellbook: {
                ...character.spellbook,
                esotericPolymath: {
                    ...character.spellbook!.esotericPolymath!,
                    dailyPreparation: null,
                },
            },
        };

        if (dailyPrep) {
            updatedCharacter = removeEsotericPolymathHeightenedVersions(updatedCharacter, dailyPrep);
        }

        return updatedCharacter;
    }

    // Validate that the spell is in the spellbook
    const occultSpells = character.spellbook?.esotericPolymath?.occultSpells || [];
    if (!occultSpells.includes(spellId)) {
        return character;
    }

    let updatedCharacter: Character = {
        ...character,
        spellbook: {
            ...character.spellbook,
            esotericPolymath: {
                ...character.spellbook!.esotericPolymath!,
                dailyPreparation: spellId,
            },
        },
    };

    // For spontaneous casters, add heightened versions of the spell
    // This allows the spell to be cast at any available slot level
    const spellcasting = updatedCharacter.spellcasting;
    if (spellcasting && spellcasting.spellcastingType === 'spontaneous') {
        const allSpells = getSpells();
        const spell = allSpells.find(s => s.id === spellId);

        if (spell) {
            // Remove any previous daily preparation's heightened versions
            const oldDailyPrep = character.spellbook?.esotericPolymath?.dailyPreparation;
            if (oldDailyPrep && oldDailyPrep !== spellId) {
                updatedCharacter = removeEsotericPolymathHeightenedVersions(updatedCharacter, oldDailyPrep);
            }

            // Add heightened versions for all available slot levels above the spell's base rank
            updatedCharacter = addEsotericPolymathHeightenedVersions(updatedCharacter, spellId, spell.rank);
        }
    }

    return updatedCharacter;
}

/**
 * Add heightened versions of an Esoteric Polymath daily preparation spell
 * This allows the spell to be cast at any available slot level
 */
function addEsotericPolymathHeightenedVersions(
    character: Character,
    spellId: string,
    baseRank: number
): Character {
    const spellcasting = character.spellcasting;
    if (!spellcasting) return character;

    const spellSlots = spellcasting.spellSlots || {};
    const characterLevel = character.level || 1;

    // Find all slot levels above the spell's base rank
    const availableLevels = Object.keys(spellSlots)
        .map(Number)
        .filter(level => level > baseRank && level <= characterLevel)
        .sort((a, b) => a - b);

    if (availableLevels.length === 0) {
        return character;
    }

    // Add heightened versions for these levels
    const newHeightenedSpells = availableLevels.map(level => ({
        spellId,
        heightenedLevel: level,
    }));

    // Filter out any existing heightened versions for this spell
    const existingHeightened = spellcasting.heightenedSpells || [];
    const filteredHeightened = existingHeightened.filter(
        h => h.spellId !== spellId || !h._esotericPolymath
    );

    return {
        ...character,
        spellcasting: {
            ...spellcasting,
            heightenedSpells: [
                ...filteredHeightened,
                ...newHeightenedSpells.map(h => ({ ...h, _esotericPolymath: true })),
            ],
        },
    };
}

/**
 * Remove heightened versions that were added by Esoteric Polymath
 */
function removeEsotericPolymathHeightenedVersions(
    character: Character,
    spellId: string
): Character {
    const spellcasting = character.spellcasting;
    if (!spellcasting) return character;

    const existingHeightened = spellcasting.heightenedSpells || [];
    const filteredHeightened = existingHeightened.filter(
        h => !(h.spellId === spellId && h._esotericPolymath)
    );

    return {
        ...character,
        spellcasting: {
            ...spellcasting,
            heightenedSpells: filteredHeightened,
        },
    };
}

/**
 * Check if a spell is the current Esoteric Polymath daily preparation
 */
export function isEsotericPolymathDailyPreparation(
    character: Character,
    spellId: string
): boolean {
    return character.spellbook?.esotericPolymath?.dailyPreparation === spellId;
}

/**
 * Check if a spell can be cast as a signature spell due to Esoteric Polymath
 * (i.e., it's the daily preparation and is in the repertoire)
 */
export function canCastAsSignatureFromEsotericPolymath(
    character: Character,
    spellId: string
): boolean {
    if (!hasEsotericPolymath(character)) {
        return false;
    }

    const dailyPreparation = character.spellbook?.esotericPolymath?.dailyPreparation;
    if (!dailyPreparation || dailyPreparation !== spellId) {
        return false;
    }

    // Check if the spell is in the repertoire (known spells)
    const knownSpells = character.spellcasting?.knownSpells || [];
    return knownSpells.includes(spellId);
}

/**
 * Check if a spell can be cast as if it were in the repertoire
 * (i.e., it's the daily preparation and is NOT in the repertoire)
 */
export function canCastAsInRepertoireFromEsotericPolymath(
    character: Character,
    spellId: string
): boolean {
    if (!hasEsotericPolymath(character)) {
        return false;
    }

    const dailyPreparation = character.spellbook?.esotericPolymath?.dailyPreparation;
    if (!dailyPreparation || dailyPreparation !== spellId) {
        return false;
    }

    // Check if the spell is NOT in the repertoire
    const knownSpells = character.spellcasting?.knownSpells || [];
    return !knownSpells.includes(spellId);
}

/**
 * Get all available spells for the Esoteric Polymath daily preparation
 * Returns all spells in the spellbook with their details
 */
export function getEsotericPolymathAvailableSpells(character: Character) {
    if (!hasEsotericPolymath(character)) {
        return [];
    }

    const occultSpells = character.spellbook?.esotericPolymath?.occultSpells || [];
    const knownSpells = character.spellcasting?.knownSpells || [];
    const allSpells = getSpells();

    return occultSpells
        .map(spellId => {
            const spell = allSpells.find((s: LoadedSpell) => s.id === spellId);
            if (!spell) return null;

            const isInRepertoire = knownSpells.includes(spellId);
            const isDailyPreparation =
                character.spellbook?.esotericPolymath?.dailyPreparation === spellId;

            return {
                spell,
                isInRepertoire,
                isDailyPreparation,
                effect: isInRepertoire
                    ? 'esotericPolymath.inRepertoire'
                    : 'esotericPolymath.notInRepertoire',
            };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);
}

/**
 * Synchronize the Esoteric Polymath spellbook with the character's repertoire
 * Called when a spell is learned or forgotten
 */
export function syncEsotericPolymathSpellbook(character: Character): Character {
    if (!hasEsotericPolymath(character)) {
        return character;
    }

    const knownSpells = character.spellcasting?.knownSpells || [];
    const occultSpells = character.spellbook?.esotericPolymath?.occultSpells || [];

    // Add all known spells to the spellbook (but don't remove spells that were manually added)
    const updatedOccultSpells = [...new Set([...occultSpells, ...knownSpells])];

    return {
        ...character,
        spellbook: {
            ...character.spellbook,
            esotericPolymath: {
                ...character.spellbook!.esotericPolymath!,
                occultSpells: updatedOccultSpells,
            },
        },
    };
}

/**
 * Reset daily preparation (called during daily preparations)
 */
export function resetEsotericPolymathDailyPreparation(character: Character): Character {
    if (!hasEsotericPolymath(character)) {
        return character;
    }

    return {
        ...character,
        spellbook: {
            ...character.spellbook,
            esotericPolymath: {
                ...character.spellbook!.esotericPolymath!,
                dailyPreparation: null,
            },
        },
    };
}

/**
 * Get the effective signature spells including the Esoteric Polymath daily preparation
 */
export function getEffectiveSignatureSpells(character: Character): string[] {
    const baseSignatureSpells = character.spellcasting?.signatureSpells || [];

    if (!hasEsotericPolymath(character)) {
        return baseSignatureSpells;
    }

    const dailyPreparation = character.spellbook?.esotericPolymath?.dailyPreparation;
    if (!dailyPreparation) {
        return baseSignatureSpells;
    }

    // Only add the daily preparation if it's in the repertoire
    const knownSpells = character.spellcasting?.knownSpells || [];
    if (knownSpells.includes(dailyPreparation)) {
        return [...baseSignatureSpells, dailyPreparation];
    }

    return baseSignatureSpells;
}

/**
 * Get the effective repertoire including the Esoteric Polymath daily preparation
 */
export function getEffectiveRepertoire(character: Character): string[] {
    const baseRepertoire = character.spellcasting?.knownSpells || [];

    if (!hasEsotericPolymath(character)) {
        return baseRepertoire;
    }

    const dailyPreparation = character.spellbook?.esotericPolymath?.dailyPreparation;
    if (!dailyPreparation) {
        return baseRepertoire;
    }

    // Only add the daily preparation if it's NOT in the repertoire
    if (!baseRepertoire.includes(dailyPreparation)) {
        return [...baseRepertoire, dailyPreparation];
    }

    return baseRepertoire;
}
