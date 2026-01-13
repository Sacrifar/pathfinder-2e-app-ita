/**
 * useDiceRoller Hook
 * Global state management for dice rolling system
 */

import { useState, useCallback, createContext, useContext } from 'react';
import { DiceRoll } from '../components/common/DiceBox';

interface DiceRollerContextType {
    rolls: DiceRoll[];
    addRoll: (roll: DiceRoll) => void;
    clearRolls: () => void;
    rollDice: (formula: string, label?: string, options?: { isCrit?: boolean; isCritFail?: boolean }) => DiceRoll;
}

const DiceRollerContext = createContext<DiceRollerContextType | null>(null);

export function DiceRollerProvider({ children }: { children: React.ReactNode }) {
    const [rolls, setRolls] = useState<DiceRoll[]>([]);

    const addRoll = useCallback((roll: DiceRoll) => {
        setRolls(prev => {
            const newRolls = [...prev, roll];
            // Keep only last 20 rolls
            return newRolls.slice(-20);
        });
    }, []);

    const clearRolls = useCallback(() => {
        setRolls([]);
    }, []);

    const rollDice = useCallback((
        formula: string,
        label?: string,
        options?: { isCrit?: boolean; isCritFail?: boolean }
    ): DiceRoll => {
        const { dice, modifier } = parseFormula(formula);

        const rollResults: DiceRoll['rolls'] = [];
        let total = 0;

        for (const die of dice) {
            const results: number[] = [];
            let dieTotal = 0;

            for (let i = 0; i < die.count; i++) {
                const result = Math.floor(Math.random() * die.sides) + 1;
                results.push(result);
                dieTotal += result;
            }

            rollResults.push({
                count: die.count,
                sides: die.sides,
                results,
                total: dieTotal,
            });

            total += dieTotal;
        }

        total += modifier;

        let isCritSuccess = options?.isCrit || false;
        let isCritFailure = options?.isCritFail || false;

        // Auto-detect crits on d20 rolls
        const d20Roll = rollResults.find(r => r.sides === 20);
        if (d20Roll && d20Roll.results.length === 1) {
            if (d20Roll.results[0] === 20) isCritSuccess = true;
            if (d20Roll.results[0] === 1) isCritFailure = true;
        }

        const roll: DiceRoll = {
            formula,
            label: label || 'Roll',
            total,
            rolls: rollResults,
            modifier,
            isCritSuccess,
            isCritFailure,
            timestamp: Date.now(),
        };

        addRoll(roll);
        return roll;
    }, [addRoll]);

    return (
        <DiceRollerContext.Provider value={{ rolls, addRoll, clearRolls, rollDice }}>
            {children}
        </DiceRollerContext.Provider>
    );
}

export function useDiceRoller(): DiceRollerContextType {
    const context = useContext(DiceRollerContext);
    if (!context) {
        throw new Error('useDiceRoller must be used within DiceRollerProvider');
    }
    return context;
}

/**
 * Parse dice formula into components
 */
function parseFormula(formula: string): {
    dice: Array<{ count: number; sides: number }>;
    modifier: number;
} {
    const cleanFormula = formula.replace(/\s+/g, '').toLowerCase();
    const diceRegex = /(\d+)d(\d+)/gi;
    const dice: Array<{ count: number; sides: number }> = [];
    let match;

    while ((match = diceRegex.exec(cleanFormula)) !== null) {
        dice.push({
            count: parseInt(match[1]),
            sides: parseInt(match[2]),
        });
    }

    let modifier = 0;
    const withoutDice = cleanFormula.replace(diceRegex, '');
    const modifierMatch = withoutDice.match(/[+-]?\d+/);
    if (modifierMatch) {
        modifier = parseInt(modifierMatch[0]);
    }

    return { dice, modifier };
}

/**
 * Helper to roll with advantage (2d20, take higher)
 */
export function rollAdvantage(baseModifier: number): number {
    const roll1 = Math.floor(Math.random() * 20) + 1;
    const roll2 = Math.floor(Math.random() * 20) + 1;
    return Math.max(roll1, roll2) + baseModifier;
}

/**
 * Helper to roll with disadvantage (2d20, take lower)
 */
export function rollDisadvantage(baseModifier: number): number {
    const roll1 = Math.floor(Math.random() * 20) + 1;
    const roll2 = Math.floor(Math.random() * 20) + 1;
    return Math.min(roll1, roll2) + baseModifier;
}
