/**
 * Class Resource Templates
 * Definisce le risorse automatiche per ogni classe in base al livello
 */

export interface ClassResourceTemplate {
    name: string;
    nameIt?: string;
    maxUses: number | ((level: number) => number);
    frequency: 'daily' | 'per-encounter';
    minLevel: number;
    // IDs delle classi (dal database delle classi)
    classIds: string[];
    description?: string;
    descriptionIt?: string;
}

export const classResourceTemplates: ClassResourceTemplate[] = [
    // ===== CLERIC =====
    {
        name: 'Channel Energy',
        nameIt: 'Canale Energetico',
        maxUses: (level: number) => {
            // Cleric gets Cha modifier uses per day, min 1
            // This is a simplified version - you may want to calculate from actual Cha
            return Math.max(1, Math.floor((level + 1) / 2)); // Simplified formula
        },
        frequency: 'daily',
        minLevel: 1,
        classIds: ['EizrWvUPMS67Pahd'],
        description: 'Use negative energy to heal the living or harm the undead.',
        descriptionIt: 'Usa energia negativa per curare i vivi o danneggiare i non morti.',
    },
    // ===== BARBARIAN =====
    {
        name: 'Rage',
        nameIt: 'Furia',
        maxUses: (level: number) => {
            // Barbarian rage uses: 3 + Con modifier (min 1)
            // Simplified - assume +2 Con for most builds
            return 3 + 2; // Will be calculated dynamically
        },
        frequency: 'daily',
        minLevel: 1,
        classIds: ['YDRiP7uVvr9WRhOI'],
        description: 'Enter a state of rage to gain combat bonuses.',
        descriptionIt: 'Entra in uno stato di furia per ottenere bonus in combattimento.',
    },
    // ===== MONK =====
    {
        name: 'Ki Points',
        nameIt: 'Punti Ki',
        maxUses: (level: number) => {
            // Monk Ki Points: level + Wis modifier (min 1)
            // Simplified formula
            return Math.max(1, level);
        },
        frequency: 'daily',
        minLevel: 1,
        classIds: ['YPxpk9JbMnKjbNLc'],
        description: 'Use your inner focus to perform extraordinary techniques.',
        descriptionIt: 'Usa il tuo focus interiore per eseguire tecniche straordinarie.',
    },
    // ===== MAGUS =====
    {
        name: 'Spell Points',
        nameIt: 'Punti Incantesimo',
        maxUses: (level: number) => {
            // Magus Spell Points: 3 + Int modifier (level 1-9), 4 + Int (level 10-19), 5 + Int (level 20)
            if (level <= 9) return 3;
            if (level <= 19) return 4;
            return 5;
        },
        frequency: 'daily',
        minLevel: 1,
        classIds: ['HQBA9Yx2s8ycvz3C'],
        description: 'Pool of points used to cast spells.',
        descriptionIt: 'Riserva di punti usati per lanciare incantesimi.',
    },
    // ===== ALCHEMIST =====
    {
        name: 'Infused Reagents',
        nameIt: 'Reagenti Infusi',
        maxUses: (level: number) => {
            // Alchemist infused reagents: Int modifier + level (min 1)
            return Math.max(1, level);
        },
        frequency: 'daily',
        minLevel: 1,
        classIds: ['XwfcJuskrhI9GIjX'],
        description: 'Magically infused alchemical substances used to create items.',
        descriptionIt: 'Sostanze alchemiche infuse magicamente usate per creare oggetti.',
    },
    // ===== CHAMPION =====
    {
        name: 'Reaction',
        nameIt: 'Reazione',
        maxUses: 1,
        frequency: 'per-encounter',
        minLevel: 1,
        classIds: ['x8iwnpdLbfcoZkHA'],
        description: 'Champion reaction to protect allies.',
        descriptionIt: 'Reazione del Campione per proteggere gli alleati.',
    },
    // ===== SORCERER =====
    {
        name: 'Focus Points',
        nameIt: 'Punti Focus',
        maxUses: (level: number) => {
            // Sorcerer focus points: Cha modifier + 1 (min 1)
            return Math.max(1, 3); // Simplified
        },
        frequency: 'daily',
        minLevel: 1,
        classIds: ['15Yc1r6s9CEhSTMe'],
        description: 'Inner magical focus used to power spell feats.',
        descriptionIt: 'Focus magico interiore usato per potenziare talenti incantesimo.',
    },
];

/**
 * Get available resource templates for a specific class
 */
export function getResourceTemplatesForClass(classId: string): ClassResourceTemplate[] {
    return classResourceTemplates.filter(template =>
        template.classIds.includes(classId)
    );
}

/**
 * Get all available resource templates for a character's level
 */
export function getAvailableResources(
    classId: string,
    level: number
): ClassResourceTemplate[] {
    return getResourceTemplatesForClass(classId).filter(
        template => template.minLevel <= level
    );
}
