/**
 * Dice types for the dice rolling system
 */

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
