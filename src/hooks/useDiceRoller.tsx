/**
 * useDiceRoller Hook
 * Global dice rolling state management
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { DiceRoll, DiceConfig, WeaponRollData, ImpulseRollData, SpellRollData } from '../types/dice';

interface DiceRollOptions {
    isCrit?: boolean;
    isCritFail?: boolean;
    element?: string;
    weaponData?: WeaponRollData;
    impulseData?: ImpulseRollData;
    spellData?: SpellRollData;
}



interface DiceRollerContextType {
    rolls: DiceRoll[];
    addRoll: (roll: DiceRoll) => void;
    clearRolls: () => void;
    rollDice: (
        formula: string,
        label?: string,
        options?: DiceRollOptions
    ) => DiceRoll;
    rollDiceWithResults: (
        formula: string,
        label?: string,
        results?: number[]
    ) => DiceRoll;
    updateLastRollWith3DResults: (rollResult: unknown) => void;
    config: DiceConfig;
    updateConfig: (config: Partial<DiceConfig>) => void;
    // New: Open dicebox without auto-rolling
    pendingWeaponData: WeaponRollData | null;
    pendingImpulseData: ImpulseRollData | null;
    pendingSpellData: SpellRollData | null;
    openDiceBoxWithWeapon: (weaponData: WeaponRollData) => void;
    openDiceBoxWithImpulse: (impulseData: ImpulseRollData) => void;
    openDiceBoxWithSpell: (spellData: SpellRollData) => void;
    clearPendingData: () => void;
}

const DiceRollerContext = createContext<DiceRollerContextType | undefined>(undefined);

export const useDiceRoller = () => {
    const context = useContext(DiceRollerContext);
    if (!context) {
        throw new Error('useDiceRoller must be used within DiceRollerProvider');
    }
    return context;
};

interface DiceRollerProviderProps {
    children: ReactNode;
}

export const DiceRollerProvider: React.FC<DiceRollerProviderProps> = ({ children }) => {
    const [rolls, setRolls] = useState<DiceRoll[]>([]);
    const [config, setConfig] = useState<DiceConfig>({
        enable3D: true,
        soundEnabled: false,
        autoHide: true,
        hideDelay: 3000
    });
    // Pending data for opening dicebox without rolling
    const [pendingWeaponData, setPendingWeaponData] = useState<WeaponRollData | null>(null);
    const [pendingImpulseData, setPendingImpulseData] = useState<ImpulseRollData | null>(null);
    const [pendingSpellData, setPendingSpellData] = useState<SpellRollData | null>(null);

    const addRoll = useCallback((roll: DiceRoll) => {
        setRolls(prev => [...prev, roll]);
    }, []);

    const clearRolls = useCallback(() => {
        setRolls([]);
    }, []);

    const updateConfig = useCallback((newConfig: Partial<DiceConfig>) => {
        setConfig(prev => ({ ...prev, ...newConfig }));
    }, []);

    // Open dicebox with weapon data without auto-rolling
    const openDiceBoxWithWeapon = useCallback((weaponData: WeaponRollData) => {
        setPendingWeaponData(weaponData);
        setPendingImpulseData(null);
    }, []);

    // Open dicebox with impulse data without auto-rolling
    const openDiceBoxWithImpulse = useCallback((impulseData: ImpulseRollData) => {
        setPendingImpulseData(impulseData);
        setPendingWeaponData(null);
        setPendingSpellData(null);
    }, []);

    // Open dicebox with spell data without auto-rolling
    const openDiceBoxWithSpell = useCallback((spellData: SpellRollData) => {
        setPendingSpellData(spellData);
        setPendingWeaponData(null);
        setPendingImpulseData(null);
    }, []);

    // Clear pending data (called after first roll or panel close)
    const clearPendingData = useCallback(() => {
        setPendingWeaponData(null);
        setPendingImpulseData(null);
        setPendingSpellData(null);
    }, []);

    // Parse dice formula (e.g., "1d20+5", "2d8+4", "4d6+6+1d12")
    const parseFormula = useCallback((formula: string) => {
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

        // Sum all modifiers (handles multiple +X or -Y in formula like "4d6+6+1d12")
        let modifier = 0;
        const withoutDice = cleanFormula.replace(diceRegex, '');

        // Find all modifiers (both +X and -Y) and sum them
        const modifierRegex = /[+-]?\d+/g;
        const modifierMatches = withoutDice.match(modifierRegex);
        if (modifierMatches) {
            modifier = modifierMatches.reduce((sum, m) => sum + parseInt(m), 0);
        }

        return { dice, modifier };
    }, []);

    // Create roll with specific results (from 3D dice)
    const createRollWithResults = useCallback((
        formula: string,
        label: string,
        diceResults: Array<{ count: number; sides: number; results: number[] }>,
        modifier: number
    ): DiceRoll => {
        let total = 0;

        // Transform diceResults to include total for each die
        const rollsWithTotal: DiceRoll['rolls'] = diceResults.map(die => {
            const dieTotal = die.results.reduce((sum, r) => sum + r, 0);
            total += dieTotal;
            return {
                ...die,
                total: dieTotal
            };
        });

        total += modifier;

        // Check for natural crit success/failure on d20 rolls
        let isCritSuccess = false;
        let isCritFailure = false;

        const d20Roll = rollsWithTotal.find(r => r.sides === 20);
        if (d20Roll && d20Roll.results.length === 1) {
            if (d20Roll.results[0] === 20) isCritSuccess = true;
            if (d20Roll.results[0] === 1) isCritFailure = true;
        }

        const roll: DiceRoll = {
            formula,
            label: label || 'Roll',
            total,
            rolls: rollsWithTotal,
            modifier,
            isCritSuccess,
            isCritFailure,
            timestamp: Date.now(),
        };

        return roll;
    }, []);

    const rollDice = useCallback((
        formula: string,
        label = '',
        options?: DiceRollOptions
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

        // Check for natural crit success/failure on d20 rolls
        let isCritSuccess = options?.isCrit || false;
        let isCritFailure = options?.isCritFail || false;

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
            element: options?.element,  // Pass element for colored dice
            weaponData: options?.weaponData,  // Pass weapon data for weapon-specific actions
            impulseData: options?.impulseData,  // Pass impulse data for impulse-specific actions
            spellData: options?.spellData,  // Pass spell data for spell actions
        };

        addRoll(roll);
        return roll;
    }, [parseFormula, addRoll]);

    // New method to roll with predetermined results (from 3D dice)
    const rollDiceWithResults = useCallback((
        formula: string,
        label = '',
        results?: number[]
    ): DiceRoll => {
        const { dice, modifier } = parseFormula(formula);

        // If specific results provided, use them; otherwise roll randomly
        const rollResults: DiceRoll['rolls'] = [];

        for (const die of dice) {
            const results: number[] = [];
            let dieTotal = 0;

            for (let i = 0; i < die.count; i++) {
                const result = results && results[i] ? results[i] : Math.floor(Math.random() * die.sides) + 1;
                results.push(result);
                dieTotal += result;
            }

            rollResults.push({
                count: die.count,
                sides: die.sides,
                results,
                total: dieTotal,
            });
        }

        return createRollWithResults(formula, label || 'Roll', rollResults, modifier);
    }, [parseFormula, createRollWithResults]);

    // Update the last roll with 3D dice results
    const updateLastRollWith3DResults = useCallback((
        rollResult: unknown
    ) => {
        setRolls(prev => {
            if (prev.length === 0) return prev;

            const lastRoll = prev[prev.length - 1];
            const { dice, modifier } = parseFormula(lastRoll.formula);

            // Transform the 3D dice results into our format
            const rollsWithTotal: DiceRoll['rolls'] = [];

            // Check if this is an array of RollResult objects from DiceBox
            if (Array.isArray(rollResult) && rollResult.length > 0) {
                // Group results by die type (sides)
                const dieGroups = new Map<number, number[]>();

                for (const rollGroup of rollResult) {
                    if (rollGroup && typeof rollGroup === 'object' && 'sides' in rollGroup && 'rolls' in rollGroup) {
                        const sides = (rollGroup as any).sides;
                        const rolls = (rollGroup as any).rolls;
                        if (Array.isArray(rolls)) {
                            for (const die of rolls) {
                                if (die && typeof die === 'object' && 'value' in die) {
                                    if (!dieGroups.has(sides)) {
                                        dieGroups.set(sides, []);
                                    }
                                    dieGroups.get(sides)!.push((die as any).value);
                                }
                            }
                        }
                    }
                }

                // Build roll results matching the original formula
                let total = 0;
                for (const die of dice) {
                    const results = dieGroups.get(die.sides) || [];
                    const actualResults = results.slice(0, die.count);
                    const dieTotal = actualResults.reduce((sum, r) => sum + r, 0);
                    total += dieTotal;
                    rollsWithTotal.push({
                        count: die.count,
                        sides: die.sides,
                        results: actualResults,
                        total: dieTotal,
                    });
                }

                total += modifier;

                // Check for natural crit success/failure on d20 rolls
                let isCritSuccess = false;
                let isCritFailure = false;
                const d20Roll = rollsWithTotal.find(r => r.sides === 20);
                if (d20Roll && d20Roll.results.length === 1) {
                    if (d20Roll.results[0] === 20) isCritSuccess = true;
                    if (d20Roll.results[0] === 1) isCritFailure = true;
                }

                const updatedRoll: DiceRoll = {
                    ...lastRoll,
                    rolls: rollsWithTotal,
                    total,
                    isCritSuccess,
                    isCritFailure,
                };

                return [...prev.slice(0, -1), updatedRoll];
            }

            // Fallback for other structures
            console.error('Unexpected rollResult structure:', rollResult);
            return prev;
        });
    }, [parseFormula]);

    const contextValue: DiceRollerContextType = {
        rolls,
        addRoll,
        clearRolls,
        rollDice,
        rollDiceWithResults,
        updateLastRollWith3DResults,
        config,
        updateConfig,
        pendingWeaponData,
        pendingImpulseData,
        pendingSpellData,
        openDiceBoxWithWeapon,
        openDiceBoxWithImpulse,
        openDiceBoxWithSpell,
        clearPendingData,
    };

    return (
        <DiceRollerContext.Provider value={contextValue}>
            {children}
        </DiceRollerContext.Provider>
    );
};
