/**
 * DiceBox Component
 * Core dice rolling system for Pathfinder 2e
 * Handles dice parsing, rolling, and visual feedback
 */

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';

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

export interface DiceBoxProps {
    onRoll?: (roll: DiceRoll) => void;
    soundEnabled?: boolean;
}

export const DiceBox: React.FC<DiceBoxProps> = ({
    onRoll,
    soundEnabled = false,
}) => {
    const { t } = useLanguage();
    const [currentRoll, setCurrentRoll] = useState<DiceRoll | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [isRolling, setIsRolling] = useState(false);

    /**
     * Parse a dice formula (e.g., "1d20+5", "2d8+4", "1d6+1d6 fire")
     */
    const parseFormula = (formula: string): {
        dice: Array<{ count: number; sides: number }>;
        modifier: number;
        extra: string;
    } => {
        // Remove spaces
        const cleanFormula = formula.replace(/\s+/g, '').toLowerCase();

        // Match all dice rolls (e.g., 1d20, 2d8)
        const diceRegex = /(\d+)d(\d+)/gi;
        const dice: Array<{ count: number; sides: number }> = [];
        let match;
        let remainingFormula = cleanFormula;

        while ((match = diceRegex.exec(cleanFormula)) !== null) {
            dice.push({
                count: parseInt(match[1]),
                sides: parseInt(match[2]),
            });
        }

        // Remove dice from formula to extract modifier
        let modifier = 0;
        const withoutDice = cleanFormula.replace(diceRegex, '');
        const modifierMatch = withoutDice.match(/[+-]?\d+/);
        if (modifierMatch) {
            modifier = parseInt(modifierMatch[0]);
        }

        // Extract extra text (like damage types)
        const extraMatch = cleanFormula.match(/[a-z]+$/);
        const extra = extraMatch ? extraMatch[0] : '';

        return { dice, modifier, extra };
    };

    /**
     * Roll dice and calculate result
     */
    const rollDice = (
        formula: string,
        label: string = '',
        options?: { isCrit?: boolean; isCritFail?: boolean }
    ): DiceRoll => {
        const { dice, modifier, extra } = parseFormula(formula);

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

        // Auto-detect crits on d20 rolls
        const d20Roll = rollResults.find(r => r.sides === 20);
        if (d20Roll && d20Roll.results.length === 1) {
            if (d20Roll.results[0] === 20) isCritSuccess = true;
            if (d20Roll.results[0] === 1) isCritFailure = true;
        }

        const roll: DiceRoll = {
            formula,
            label: label || t('dice.roll') || 'Roll',
            total,
            rolls: rollResults,
            modifier,
            isCritSuccess,
            isCritFailure,
            timestamp: Date.now(),
        };

        // Play sound if enabled
        if (soundEnabled) {
            playRollSound();
        }

        // Trigger animation
        setIsRolling(true);
        setTimeout(() => {
            setCurrentRoll(roll);
            setShowResult(true);
            setIsRolling(false);
        }, 500);

        // Call callback
        onRoll?.(roll);

        return roll;
    };

    /**
     * Play dice roll sound effect
     */
    const playRollSound = () => {
        try {
            const audio = new Audio('/assets/dice-roll.mp3');
            audio.volume = 0.3;
            audio.play().catch(() => {
                // Audio might be blocked by browser
                console.log('Audio playback blocked');
            });
        } catch (error) {
            console.log('Could not play sound');
        }
    };

    /**
     * Close the result overlay
     */
    const closeResult = () => {
        setShowResult(false);
        setTimeout(() => setCurrentRoll(null), 300);
    };

    // Expose rollDice function
    React.useImperativeHandle React.forwardRef, () => ({
        rollDice,
    }));

    return (
        <>
            {/* Roll Result Overlay */}
            {showResult && currentRoll && (
                <div className="dice-result-overlay" onClick={closeResult}>
                    <div
                        className={`dice-result-card ${isRolling ? 'rolling' : ''} ${currentRoll.isCritSuccess ? 'crit-success' : ''} ${currentRoll.isCritFailure ? 'crit-failure' : ''
                            }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Crit Effect */}
                        {currentRoll.isCritSuccess && (
                            <div className="crit-effect crit-success-effect">
                                🎯 {t('dice.criticalSuccess') || 'CRITICAL SUCCESS!'}
                            </div>
                        )}
                        {currentRoll.isCritFailure && (
                            <div className="crit-effect crit-failure-effect">
                                💀 {t('dice.criticalFailure') || 'CRITICAL FAILURE!'}
                            </div>
                        )}

                        {/* Label */}
                        {currentRoll.label && (
                            <div className="dice-result-label">{currentRoll.label}</div>
                        )}

                        {/* Formula Display */}
                        <div className="dice-result-formula">{currentRoll.formula}</div>

                        {/* Roll Details */}
                        <div className="dice-result-details">
                            {currentRoll.rolls.map((roll, index) => (
                                <div key={index} className="dice-result-die">
                                    <span className="die-formula">
                                        {roll.count}d{roll.sides}
                                    </span>
                                    <span className="die-results">
                                        {roll.results.map((r, i) => (
                                            <span
                                                key={i}
                                                className={`die-result ${r === roll.sides ? 'max' : ''} ${r === 1 ? 'min' : ''}`}
                                            >
                                                {r}
                                            </span>
                                        ))}
                                    </span>
                                    <span className="die-total">= {roll.total}</span>
                                </div>
                            ))}
                            {currentRoll.modifier !== 0 && (
                                <div className="dice-result-modifier">
                                    {currentRoll.modifier > 0 ? '+' : ''}{currentRoll.modifier}
                                </div>
                            )}
                        </div>

                        {/* Total */}
                        <div className="dice-result-total">
                            <span className="total-label">{t('dice.total') || 'Total'}</span>
                            <span className="total-value">{currentRoll.total}</span>
                        </div>

                        {/* Close hint */}
                        <div className="dice-result-hint">
                            {t('dice.clickToClose') || 'Click anywhere to close'}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DiceBox;

/**
 * Helper function to roll dice programmatically
 */
export function useDiceRoll() {
    const rollDice = (
        formula: string,
        label?: string,
        options?: { isCrit?: boolean; isCritFail?: boolean }
    ): DiceRoll => {
        const { dice, modifier } = parseFormulaInternal(formula);

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

        const d20Roll = rollResults.find(r => r.sides === 20);
        if (d20Roll && d20Roll.results.length === 1) {
            if (d20Roll.results[0] === 20) isCritSuccess = true;
            if (d20Roll.results[0] === 1) isCritFailure = true;
        }

        return {
            formula,
            label: label || 'Roll',
            total,
            rolls: rollResults,
            modifier,
            isCritSuccess,
            isCritFailure,
            timestamp: Date.now(),
        };
    };

    return { rollDice };
}

/**
 * Internal formula parser
 */
function parseFormulaInternal(formula: string): {
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
