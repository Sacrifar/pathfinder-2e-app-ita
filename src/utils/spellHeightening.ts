/**
 * Spell Heightening Utility Functions
 * Handles calculation of heightened spell effects for spontaneous casters (Bard, Sorcerer, etc.)
 */

import { LoadedSpell, SpellHeightening } from '@/data/pf2e-loader';
import { Character, HeightenedSpell } from '@/types/character';
import { canCastAsSignatureFromEsotericPolymath, getEffectiveSignatureSpells } from './esotericPolymath';

/**
 * Get the available heightened levels for a spell based on character level
 * Returns an array of levels at which the spell can be heightened
 */
export function getAvailableHeightenedLevels(
    spell: LoadedSpell,
    characterLevel: number,
    knownHeightenedLevels: number[]
): number[] {
    const baseRank = spell.rank;
    const availableLevels: number[] = [];

    // Cantrips can be heightened starting from level 3 (typically)
    if (baseRank === 0) {
        // Cantrips heighten at specific levels based on their heightening data
        if (spell.heightening?.type === 'fixed') {
            Object.keys(spell.heightening.levels || {}).forEach(level => {
                const levelNum = parseInt(level);
                if (levelNum <= characterLevel && !knownHeightenedLevels.includes(levelNum)) {
                    availableLevels.push(levelNum);
                }
            });
        } else if (spell.heightening?.type === 'interval' && spell.heightening.interval) {
            // For interval-based heightening (like fireball)
            let level = spell.heightening.interval;
            while (level <= characterLevel) {
                if (!knownHeightenedLevels.includes(level)) {
                    availableLevels.push(level);
                }
                level += spell.heightening.interval!;
            }
        }
    } else {
        // Ranked spells can be heightened to any level above base rank
        // up to character level, if they have heightening data
        if (spell.heightening) {
            for (let level = baseRank + 1; level <= characterLevel; level++) {
                // Check if this level is not already known as heightened
                if (!knownHeightenedLevels.includes(level)) {
                    // For fixed heightening, only allow levels that are defined
                    if (spell.heightening.type === 'fixed') {
                        if (spell.heightening.levels && spell.heightening.levels[level.toString()]) {
                            availableLevels.push(level);
                        }
                    } else {
                        // For interval heightening, allow any level above base
                        availableLevels.push(level);
                    }
                }
            }
        }
    }

    return availableLevels;
}

/**
 * Get the heightened spell data for a specific level
 * Returns the modified damage, area, etc. for the heightened spell
 */
export function getHeightenedSpellData(
    spell: LoadedSpell,
    heightenedLevel: number
): {
    damage: string | null;
    area: string | null;
    description: string;
} {
    const baseRank = spell.rank;
    const levelsAbove = heightenedLevel - baseRank;

    // If not heightened, return base data
    if (levelsAbove <= 0) {
        return {
            damage: spell.damage,
            area: spell.area,
            description: spell.description,
        };
    }

    // Default to base values
    let heightenedDamage = spell.damage;
    let heightenedArea = spell.area;
    let heightenedDescription = spell.description;

    if (spell.heightening) {
        if (spell.heightening.type === 'fixed') {
            // Fixed heightening: specific levels have specific effects
            const levelData = spell.heightening.levels?.[heightenedLevel.toString()];
            if (levelData) {
                // Get first damage entry if available
                if (levelData.damage) {
                    const damageEntry = Object.values(levelData.damage)[0];
                    if (damageEntry) {
                        heightenedDamage = `${damageEntry.formula} ${damageEntry.type}`;
                    }
                }
                if (levelData.area) {
                    heightenedArea = `${levelData.area.value}-foot ${levelData.area.type}`;
                }
            }
        } else if (spell.heightening.type === 'interval') {
            // Interval heightening: calculate based on intervals
            const interval = spell.heightening.interval || 2;
            const intervals = Math.floor(levelsAbove / interval);

            if (intervals > 0) {
                // Apply damage increase
                if (spell.heightening.damage && Object.keys(spell.heightening.damage).length > 0) {
                    const baseDamage = spell.damage?.match(/^(\d+d\d+)/)?.[1] || '';
                    const damageType = spell.damage?.match(/(\w+)$/)?.[1] || '';
                    const increaseDice = spell.heightening.damage['0'] || '';
                    if (baseDamage && increaseDice) {
                        // Parse the increase (e.g., "2d8") and add it to base
                        const baseMatch = baseDamage.match(/(\d+)d(\d+)/);
                        const incMatch = increaseDice.match(/(\d+)d(\d+)/);
                        if (baseMatch && incMatch) {
                            const newDiceCount = parseInt(baseMatch[1]) + (parseInt(incMatch[1]) * intervals);
                            heightenedDamage = `${newDiceCount}d${incMatch[2]} ${damageType}`.trim();
                        }
                    }
                }

                // Apply area increase
                if (spell.heightening.area) {
                    const baseArea = spell.area?.match(/(\d+)/)?.[1] || '0';
                    const newArea = parseInt(baseArea) + (spell.heightening.area * intervals);
                    const areaType = spell.area?.match(/(\w+)$/)?.[1] || 'burst';
                    heightenedArea = `${newArea}-foot ${areaType}`;
                }
            }
        }
    }

    return {
        damage: heightenedDamage,
        area: heightenedArea,
        description: heightenedDescription,
    };
}

/**
 * Check if a spell can be heightened (has heightening data)
 */
export function canSpellBeHeightened(spell: LoadedSpell): boolean {
    return spell.heightening !== undefined && spell.heightening !== null;
}

/**
 * Check if a spell is a signature spell (can be heightened freely)
 * Includes Esoteric Polymath daily preparation if applicable
 */
export function isSignatureSpell(character: Character, spellId: string): boolean {
    // Check base signature spells
    const isBaseSignature = character.spellcasting?.signatureSpells?.includes(spellId) || false;
    if (isBaseSignature) return true;

    // Check Esoteric Polymath daily preparation
    return canCastAsSignatureFromEsotericPolymath(character, spellId);
}

/**
 * Check if a character can cast a spell at a heightened level
 * Takes into account signature spells and known heightened versions
 */
export function canCastAtLevel(
    character: Character,
    spellId: string,
    targetLevel: number,
    spellBaseRank: number,
    allSpells: LoadedSpell[]
): boolean {
    // Must have spell slots of the target level
    if (!character.spellcasting?.spellSlots[targetLevel]) {
        return false;
    }

    const slots = character.spellcasting.spellSlots[targetLevel];
    if (slots.used >= slots.max) {
        return false;
    }

    const spell = allSpells.find(s => s.id === spellId);
    if (!spell) return false;

    // Cantrips can always be heightened (they don't use spell slots)
    if (spellBaseRank === 0) {
        return true;
    }

    // Check if signature spell (can be heightened freely)
    if (isSignatureSpell(character, spellId)) {
        return true;
    }

    // Check if the heightened version is in the repertoire
    const knownHeightened = character.spellcasting?.heightenedSpells || [];
    const hasHeightenedVersion = knownHeightened.some(
        h => h.spellId === spellId && h.heightenedLevel === targetLevel
    );

    return hasHeightenedVersion;
}

/**
 * Get the effective cast level for a spell
 * This is the level at which the spell is actually being cast
 * For signature spells, this can be any level up to character level
 * For non-signature spells, must be in heightenedSpells
 */
export function getEffectiveCastLevel(
    character: Character,
    spellId: string,
    baseRank: number,
    allSpells: LoadedSpell[]
): number {
    const spell = allSpells.find(s => s.id === spellId);
    if (!spell || !canSpellBeHeightened(spell)) {
        return baseRank;
    }

    // If it's a signature spell, return the highest available slot level
    if (isSignatureSpell(character, spellId)) {
        const slotLevels = Object.keys(character.spellcasting?.spellSlots || {})
            .map(Number)
            .filter(level => level >= baseRank)
            .sort((a, b) => b - a); // Sort descending

        // Find highest level with available slots
        for (const level of slotLevels) {
            const slots = character.spellcasting!.spellSlots[level];
            if (slots.used < slots.max) {
                return level;
            }
        }
    }

    // Check known heightened versions
    const knownHeightened = character.spellcasting?.heightenedSpells || [];
    const heightenedEntry = knownHeightened.find(h => h.spellId === spellId);

    if (heightenedEntry) {
        return heightenedEntry.heightenedLevel;
    }

    return baseRank;
}

/**
 * Get the number of signature spells a character should have
 * Based on class and level (Bards get 1 at level 1, additional at higher levels)
 */
export function getSignatureSpellCount(classId: string, level: number): number {
    // Bard gets signature spells: 1 at level 1, +1 at levels 4, 6, 8, 10, 12, 14, 16, 18, 20
    // This follows the "Signature Spells" class feature pattern
    if (classId.includes('Bard') || classId === 'XwfcJuskrhI9GIjX') {
        // Old Bard ID or new pattern
        let count = 1; // Level 1 gives 1 signature spell
        if (level >= 4) count++;
        if (level >= 6) count++;
        if (level >= 8) count++;
        if (level >= 10) count++;
        if (level >= 12) count++;
        if (level >= 14) count++;
        if (level >= 16) count++;
        if (level >= 18) count++;
        if (level >= 20) count++;
        return count;
    }

    // Sorcerer gets signature spells starting at level 2
    if (classId.includes('Sorcerer')) {
        let count = 0;
        if (level >= 2) count = 1;
        if (level >= 4) count++;
        if (level >= 6) count++;
        if (level >= 8) count++;
        if (level >= 10) count++;
        if (level >= 12) count++;
        if (level >= 14) count++;
        if (level >= 16) count++;
        if (level >= 18) count++;
        if (level >= 20) count++;
        return count;
    }

    return 0;
}
