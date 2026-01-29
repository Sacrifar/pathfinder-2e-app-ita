/**
 * Active Compositions Utility for Bard
 * Tracks active composition effects like Inspire Courage, Lingering Composition, etc.
 */

import { Character } from '@/types/character';

type ActiveComposition = NonNullable<Character['activeCompositions']>[number];

/**
 * Get all active compositions for a character
 */
export function getActiveCompositions(character: Character): ActiveComposition[] {
    return character.activeCompositions || [];
}

/**
 * Check if a specific composition is active
 */
export function isCompositionActive(character: Character, compositionId: string): boolean {
    const comps = getActiveCompositions(character);
    return comps ? comps.some(c => c.id === compositionId) : false;
}

/**
 * Add an active composition to the character
 */
export function addActiveComposition(
    character: Character,
    composition: Omit<ActiveComposition, 'id' | 'startedAt'>
): Character {
    const id = `composition-${Date.now()}`;
    const newComposition: ActiveComposition = {
        ...composition,
        id,
        nameIt: composition.nameIt || composition.name,
        startedAt: Date.now(),
    };

    return {
        ...character,
        activeCompositions: [...getActiveCompositions(character), newComposition],
    };
}

/**
 * Remove an active composition from the character
 */
export function removeActiveComposition(
    character: Character,
    compositionId: string
): Character {
    const current = getActiveCompositions(character);
    return {
        ...character,
        activeCompositions: current.filter(c => c.id !== compositionId),
    };
}

/**
 * Clear all expired compositions
 */
export function clearExpiredCompositions(character: Character): Character {
    const current = getActiveCompositions(character);
    if (!current) return character;

    const now = Date.now();
    const active = current.filter(c => {
        if (c.expiresAt && c.expiresAt < now) {
            return false;
        }
        return true;
    });

    return {
        ...character,
        activeCompositions: active,
    };
}

/**
 * Check if Inspire Courage is active
 */
export function hasInspireCourage(character: Character): boolean {
    return isCompositionActive(character, 'inspire-courage');
}

/**
 * Add Inspire Courage composition
 * +1 circumstance bonus to attack and damage rolls, and +1 to Fortitude saves against fear
 */
export function addInspireCourage(character: Character): Character {
    return addActiveComposition(character, {
        name: 'Inspire Courage',
        nameIt: 'Coraggio Illustrato',
        duration: 'sustained',
        bonuses: {
            attack: 1,
            damage: 1,
        },
    });
}

/**
 * Check if Lingering Composition is active
 */
export function hasLingeringComposition(character: Character): boolean {
    return isCompositionActive(character, 'lingering-composition');
}

/**
 * Add Lingering Composition effect
 * Extends the duration of an ended composition by 1 round
 */
export function addLingeringCompositionEffect(character: Character, baseComposition: ActiveComposition): Character {
    // Lingering Composition extends by 1 round after performance ends
    return addActiveComposition(character, {
        ...baseComposition,
        name: `${baseComposition.name} (Lingering)`,
        nameIt: `${baseComposition.nameIt || baseComposition.name} (Persistente)`,
        duration: '1 minute',
        // In a real game, this would track rounds and expire after 1 round
        expiresAt: Date.now() + 60000, // 1 minute placeholder
    });
}

/**
 * Get all active bonuses from compositions
 */
export function getActiveCompositionBonuses(character: Character): {
    attackBonus: number;
    damageBonus: number;
    saveBonuses: Record<string, number>;  // save name -> bonus
    skillBonuses: Record<string, number>; // skill name -> bonus
} {
    const compositions = getActiveCompositions(character);
    const result = {
        attackBonus: 0,
        damageBonus: 0,
        saveBonuses: {} as Record<string, number>,
        skillBonuses: {} as Record<string, number>,
    };

    for (const comp of compositions) {
        if (comp.bonuses.attack) result.attackBonus += comp.bonuses.attack;
        if (comp.bonuses.damage) result.damageBonus += comp.bonuses.damage;
        if (comp.bonuses.savingThrows) {
            result.saveBonuses['all'] = (result.saveBonuses['all'] || 0) + comp.bonuses.savingThrows;
        }
        if (comp.bonuses.skills) {
            for (const skill of comp.bonuses.skills) {
                result.skillBonuses[skill] = (result.skillBonuses[skill] || 0) + (comp.bonuses.skillBonus || 1);
            }
        }
    }

    return result;
}
