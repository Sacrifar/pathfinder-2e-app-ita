/**
 * GlobalDiceDisplay Component
 * Displays dice rolls with 3D visual feedback
 */

import React, { useState, useEffect, useRef } from 'react';
import { useDiceRoller } from '../../hooks/useDiceRoller';
import { useLanguage } from '../../hooks/useLanguage';
import DiceBox from '@3d-dice/dice-box';

export function GlobalDiceDisplay() {
    const { t } = useLanguage();
    const { rolls, clearRolls, rollDice, updateLastRollWith3DResults } = useDiceRoller();
    const [showPanel, setShowPanel] = useState(false);
    const [lastProcessedRoll, setLastProcessedRoll] = useState<number | null>(null);
    const diceBoxRef = useRef<DiceBox | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize DiceBox once on mount (after container exists)
    useEffect(() => {
        // Only initialize when panel is shown and not already initialized
        if (!showPanel || diceBoxRef.current) return;

        // Use setTimeout to ensure DOM has been updated
        const initTimer = setTimeout(() => {
            if (!containerRef.current) {
                console.log('Container still not available');
                return;
            }

            console.log('Initializing DiceBox...');

            const diceBox = new DiceBox({
                id: 'dice-canvas-container',
                assetPath: '/assets/dice-box/',
                container: '#dice-canvas-container',
                themeColor: '#8B0000',
                scale: 7,
                offscreen: false,
                // Improved lighting for better visuals
                lightIntensity: 1.2,
                enableShadows: true,
                shadowTransparency: 0.3,
                // Physics - keeping gravity at 1 (DO NOT CHANGE)
                gravity: 1,
                // Adjusted for better dice behavior
                mass: 1,
                friction: 0.8,
                restitution: 0.1,
                angularDamping: 0.4,
                linearDamping: 0.4,
                spinForce: 4,
                throwForce: 5,
                startingHeight: 8,
            });

            diceBox.init().then(() => {
                console.log('DiceBox initialized successfully');
                diceBoxRef.current = diceBox;
                setIsInitialized(true);

                // Set up the onRollComplete callback to sync results
                diceBox.onRollComplete = (rollResult) => {
                    console.log('3D dice roll complete:', rollResult);
                    if (Array.isArray(rollResult) && rollResult.length > 0) {
                        updateLastRollWith3DResults(rollResult);
                    }
                };

                // Roll any pending dice after initialization
                if (rolls.length > 0) {
                    const latestRoll = rolls[rolls.length - 1];
                    setTimeout(() => {
                        diceBox.roll(latestRoll.formula);
                    }, 300);
                }
            }).catch(err => {
                console.error('Failed to initialize DiceBox:', err);
            });
        }, 100); // Small delay to ensure DOM is ready

        return () => clearTimeout(initTimer);
    }, [showPanel]); // Run when panel is shown

    // Show panel when a new roll is added
    useEffect(() => {
        if (rolls.length > 0) {
            const latestRoll = rolls[rolls.length - 1];
            // Only process new rolls
            if (lastProcessedRoll !== latestRoll.timestamp) {
                setLastProcessedRoll(latestRoll.timestamp);
                setShowPanel(true);

                // Roll 3D dice if initialized
                if (diceBoxRef.current && isInitialized) {
                    setTimeout(() => {
                        diceBoxRef.current?.roll(latestRoll.formula);
                    }, 300);
                }
            }
        }
    }, [rolls.length, lastProcessedRoll, isInitialized]);

    const handleClose = () => {
        setShowPanel(false);
        // Reset initialization state so it can reinitialize when reopened
        setIsInitialized(false);
        diceBoxRef.current = null;
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const handleManualRoll = (sides: number) => {
        const formula = `1d${sides}`;
        const label = `Manual Roll d${sides}`;
        rollDice(formula, label);
    };

    return (
        <>
            {/* Dice Box Overlay */}
            {showPanel && (
                <div className="dice-box-overlay" onClick={handleClose}>
                    <div className="dice-box-panel" onClick={(e) => e.stopPropagation()}>
                        {/* Close Button */}
                        <button className="dice-box-close" onClick={handleClose}>
                            ✕
                        </button>

                        {/* Dice Display Area - 3D Canvas */}
                        <div className="dice-display-area">
                            {!isInitialized && (
                                <div style={{ color: '#fff', textAlign: 'center' }}>
                                    Loading 3D Dice...
                                </div>
                            )}
                            <div
                                ref={containerRef}
                                id="dice-canvas-container"
                                style={{ width: '100%', height: '100%' }}
                            ></div>
                        </div>

                        {/* Latest Roll Info */}
                        {rolls.length > 0 && (
                            <div className="dice-box-info">
                                {/* Natural 20 Banner - Special Highlight */}
                                {rolls[rolls.length - 1].isCritSuccess && (
                                    <div className="dice-nat20-banner">
                                        <div className="nat20-icon">⚔️</div>
                                        <div className="nat20-text">
                                            <div className="nat20-title">NATURAL 20!</div>
                                            <div className="nat20-subtitle">CRITICAL SUCCESS</div>
                                        </div>
                                    </div>
                                )}

                                {/* Natural 1 Banner - Critical Failure */}
                                {rolls[rolls.length - 1].isCritFailure && (
                                    <div className="dice-nat1-banner">
                                        <div className="nat1-icon">💀</div>
                                        <div className="nat1-text">
                                            <div className="nat1-title">NATURAL 1!</div>
                                            <div className="nat1-subtitle">CRITICAL FAILURE</div>
                                        </div>
                                    </div>
                                )}

                                {/* Total Result */}
                                <div className="dice-box-total">
                                    <span className="total-label">{t('dice.total') || 'TOTAL'}</span>
                                    <span className={`total-value ${rolls[rolls.length - 1].isCritSuccess ? 'crit-success' : ''} ${rolls[rolls.length - 1].isCritFailure ? 'crit-failure' : ''}`}>
                                        {rolls[rolls.length - 1].total}
                                    </span>
                                    {rolls[rolls.length - 1].modifier !== 0 && (
                                        <span className="modifier-result">
                                            {rolls[rolls.length - 1].modifier >= 0 ? '+' : ''}{rolls[rolls.length - 1].modifier}
                                        </span>
                                    )}
                                </div>

                                {/* Timestamp */}
                                <div className="roll-timestamp">
                                    {formatTime(rolls[rolls.length - 1].timestamp)}
                                </div>
                            </div>
                        )}

                        {/* Manual Dice Buttons */}
                        <div className="manual-dice-section">
                            <div className="manual-dice-title">Quick Roll</div>
                            <div className="manual-dice-grid">
                                {[4, 6, 8, 10, 12, 20].map((sides) => (
                                    <button
                                        key={sides}
                                        className="manual-dice-btn"
                                        onClick={() => handleManualRoll(sides)}
                                        title={`Roll 1d${sides}`}
                                    >
                                        d{sides}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Roll History */}
                        {rolls.length > 1 && (
                            <div className="dice-history">
                                <div className="history-title">Recent Rolls</div>
                                <div className="history-list">
                                    {rolls.slice().reverse().slice(1, 6).map((roll) => (
                                        <div
                                            key={roll.timestamp}
                                            className={`history-item ${roll.isCritSuccess ? 'crit-success' : ''} ${roll.isCritFailure ? 'crit-failure' : ''}`}
                                        >
                                            <div className="history-time">{formatTime(roll.timestamp)}</div>
                                            <div className="history-label">{roll.label}</div>
                                            <div className="history-result">{roll.total}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Clear All Button */}
                        {rolls.length > 0 && (
                            <button className="clear-all-btn" onClick={() => clearRolls()}>
                                Clear All Rolls
                            </button>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default GlobalDiceDisplay;
