/**
 * GlobalDiceDisplay Component
 * Displays dice rolls with 3D visual feedback
 */

import React, { useState, useEffect, useRef } from 'react';
import { useDiceRoller } from '../../hooks/useDiceRoller';
import { useLanguage } from '../../hooks/useLanguage';
import DiceBox from '@3d-dice/dice-box';
import { WeaponRollData, ImpulseRollData, SpellRollData } from '../../types/dice';

/**
 * Helper function to extract element from traits for dice coloring
 * Returns the first matching elemental trait, or undefined if none found
 */
function extractElementFromTraits(traits: string[]): string | undefined {
    const elementalTraits = [
        'air', 'fire', 'earth', 'metal', 'water', 'wood',  // Kineticist elements
        'electricity', 'cold', 'acid', 'poison', 'sonic',    // Spell damage traits
        'force', 'vitality', 'void', 'chaos',                // Other spell traits
        'precision'                                          // Precision damage
    ];
    return traits.find(t => elementalTraits.includes(t.toLowerCase()));
}

/**
 * Element color mapping for 3D dice
 * Colors match the impulse panel (ImpulsePanel.tsx) for consistency
 * Each element has a primary color (for base dice) and a bonus color (for extra damage dice)
 * Includes kineticist elements, spell damage traits, and weapon rune damage types
 */
const ELEMENT_COLORS: Record<string, { primary: string; bonus: string }> = {
    // Kineticist elements (colors from ImpulsePanel.tsx getElementColor)
    air: { primary: '#87CEEB', bonus: '#FBBF24' },      // Sky Blue (base) + Yellow (electricity)
    fire: { primary: '#FF4500', bonus: '#F97316' },     // Orange Red (base) + Orange (bonus)
    earth: { primary: '#8B4513', bonus: '#22C55E' },    // Saddle Brown (base) + Green (bonus)
    metal: { primary: '#C0C0C0', bonus: '#EAB308' },    // Silver (base) + Gold (bonus)
    water: { primary: '#1E90FF', bonus: '#06B6D4' },    // Dodger Blue (base) + Cyan (bonus)
    wood: { primary: '#228B22', bonus: '#DC2626' },     // Forest Green (base) + Red (fire bonus)
    aether: { primary: '#9370DB', bonus: '#A855F7' },   // Medium Purple (base) + Light Purple (bonus)
    void: { primary: '#2F4F4F', bonus: '#374151' },     // Dark Slate Gray (base) + Gray (bonus)

    // Spell damage traits and weapon rune elements
    electricity: { primary: '#FBBF24', bonus: '#FDE047' }, // Yellow + Light Yellow
    cold: { primary: '#06B6D4', bonus: '#67E8F9' },      // Cyan + Light Cyan
    acid: { primary: '#2ecc71', bonus: '#A3E635' },      // Green + Light Green (matches DamageBreakdown)
    poison: { primary: '#A855F7', bonus: '#C084FC' },     // Purple + Light Purple
    sonic: { primary: '#9b59b6', bonus: '#BB8DBF' },      // Purple + Light Purple (matches DamageBreakdown)
    force: { primary: '#95a5a6', bonus: '#BDC3C7' },     // Gray + Light Gray (matches DamageBreakdown)
    vitality: { primary: '#ff69b4', bonus: '#F9A8D4' },   // Hot Pink + Light Pink (matches DamageBreakdown)

    // Spirit damage (holy/unholy runes)
    spirit: { primary: '#dda0dd', bonus: '#E6B8E6' },     // Plum + Light Plum (matches DamageBreakdown)
    holy: { primary: '#ffd700', bonus: '#FFEC8B' },      // Gold + Light Gold (matches DamageBreakdown)
    unholy: { primary: '#4b0082', bonus: '#6A0DAD' },    // Indigo + Purple (matches DamageBreakdown)

    // Alignment damage (axiomatic/anarchic runes)
    chaotic: { primary: '#7C3AED', bonus: '#8B5CF6' },   // Violet + Purple
    lawful: { primary: '#3B82F6', bonus: '#60A5FA' },    // Blue + Light Blue

    // Other damage types (weapon runes)
    positive: { primary: '#f5f5dc', bonus: '#FFFACD' },  // Beige + Lemon Chiffon (matches DamageBreakdown)
    negative: { primary: '#8b0000', bonus: '#A52A2A' },  // Dark Red + Brown (matches DamageBreakdown)
    bleed: { primary: '#8b0000', bonus: '#A52A2A' },     // Dark Red + Brown (matches DamageBreakdown)

    // Physical damage types
    precision: { primary: '#14B8A6', bonus: '#5EEAD4' }, // Teal + Light Teal
};

/**
 * Helper function to determine if a roll is a D20 check (attack, save, skill)
 * vs a damage roll that happens to include d20 dice.
 * D20 checks are typically: 1d20, 2d20 (for certain feats), possibly with modifiers
 * Damage rolls have mixed dice types (d4, d6, d8, d12, etc.)
 */
function isD20CheckRoll(roll: { rolls: Array<{ sides: number; count: number }> }): boolean {
    const d20Dice = roll.rolls.filter(r => r.sides === 20);
    const nonD20Dice = roll.rolls.filter(r => r.sides !== 20);

    // Pure d20 roll: only d20 dice, no other dice types
    // Examples: 1d20, 2d20, 1d20+5
    if (nonD20Dice.length === 0 && d20Dice.length > 0) {
        return true;
    }

    // Mixed dice: this is a damage roll, not a d20 check
    return false;
}

/**
 * Helper function to roll multiple dice types using DiceBox's roll method.
 * Supports Roll Objects with themeColor for elemental dice coloring.
 * For "4d6+1d12+6", we extract dice notations and pass them as Roll Objects with colors.
 *
 * @param elementalTypes Optional array of elemental types for multi-colored runes (e.g., ['fire', 'cold', 'acid'])
 * @param elementalRunesMode If true, only color subsequent dice (elemental damage), not the first group (base weapon damage)
 */
function rollWithDiceBox(
    diceBox: DiceBox,
    formula: string,
    element?: string,
    elementalRunesMode?: boolean,
    elementalTypes?: string[]
) {
    const cleanFormula = formula.replace(/\s+/g, '').toLowerCase();
    const diceRegex = /(\d+)d(\d+)/gi;
    const rollObjects: Array<{ qty: number; sides: number; themeColor?: string }> = [];
    let match;

    // Extract all dice notations (e.g., "4d6", "1d12")
    while ((match = diceRegex.exec(cleanFormula)) !== null) {
        const qty = parseInt(match[1], 10);
        const sides = parseInt(match[2], 10);
        rollObjects.push({ qty, sides });
    }

    if (rollObjects.length === 0) {
        return;
    }

    console.log('[rollWithDiceBox]', {
        formula,
        element,
        elementalTypes,
        elementalRunesMode,
        rollObjects: JSON.parse(JSON.stringify(rollObjects)),
        colorsAvailable: element ? ELEMENT_COLORS[element] : undefined
    });

    // If we have elemental types array, use per-die coloring (for weapon runes)
    if (elementalTypes && elementalTypes.length > 0) {
        // First die group is base weapon damage (uncolored or damage type color)
        // Subsequent groups are elemental runes with their specific colors
        rollObjects.forEach((obj, index) => {
            if (index === 0) {
                // Base weapon damage - no color (use default)
                // Optionally could use damage type color here
            } else if (index - 1 < elementalTypes.length) {
                // Each elemental rune gets its specific color
                const elementType = elementalTypes[index - 1];
                const colorData = ELEMENT_COLORS[elementType];
                if (colorData) {
                    obj.themeColor = colorData.primary;
                }
            }
        });
    }
    // Legacy behavior: single element for all dice
    else if (element && ELEMENT_COLORS[element]) {
        const colors = ELEMENT_COLORS[element];

        rollObjects.forEach((obj, index) => {
            if (elementalRunesMode) {
                // For weapon runes: only color elemental dice (index > 0), leave base damage uncolored
                if (index > 0) {
                    obj.themeColor = colors.primary;
                }
                // First group (base weapon damage) stays uncolored (default)
            } else {
                // For elemental blast and stances: first group gets primary, rest get bonus
                if (index === 0) {
                    obj.themeColor = colors.primary;
                } else {
                    obj.themeColor = colors.bonus;
                }
            }
        });
    }

    console.log('[rollWithDiceBox] Final rollObjects:', JSON.parse(JSON.stringify(rollObjects)));

    // Roll all dice at once using Roll Objects
    diceBox.roll(rollObjects);
}

export function GlobalDiceDisplay() {
    const { t } = useLanguage();
    const { rolls, clearRolls, rollDice, updateLastRollWith3DResults, pendingWeaponData, pendingImpulseData, pendingSpellData, clearPendingData } = useDiceRoller();
    const [showPanel, setShowPanel] = useState(false);
    const [lastProcessedRoll, setLastProcessedRoll] = useState<number | null>(null);
    const diceBoxRef = useRef<DiceBox | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isRolling, setIsRolling] = useState(false);

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
                    setIsRolling(false);
                    if (Array.isArray(rollResult) && rollResult.length > 0) {
                        updateLastRollWith3DResults(rollResult);
                    }
                };

                // Roll any pending dice after initialization
                if (rolls.length > 0) {
                    const latestRoll = rolls[rolls.length - 1];
                    console.log('[GlobalDiceDisplay] Rolling with formula:', latestRoll.formula, 'element:', latestRoll.element, 'weaponData:', latestRoll.weaponData);
                    setIsRolling(true);
                    setTimeout(() => {
                        // For weapons with elemental runes, use elementalRunesMode to only color elemental dice
                        const elementalRunesMode = latestRoll.weaponData !== undefined && latestRoll.element !== undefined;
                        const elementalTypes = latestRoll.weaponData?.elementalTypes;
                        console.log('[GlobalDiceDisplay] elementalRunesMode:', elementalRunesMode, 'elementalTypes:', elementalTypes);
                        rollWithDiceBox(diceBox, latestRoll.formula, latestRoll.element, elementalRunesMode, elementalTypes);
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
                    setIsRolling(true);
                    setTimeout(() => {
                        console.log('[GlobalDiceDisplay] Rolling with formula:', latestRoll.formula, 'element:', latestRoll.element, 'weaponData:', latestRoll.weaponData);
                        if (diceBoxRef.current) {
                            // For weapons with elemental runes, use elementalRunesMode to only color elemental dice
                            const elementalRunesMode = latestRoll.weaponData !== undefined && latestRoll.element !== undefined;
                            const elementalTypes = latestRoll.weaponData?.elementalTypes;
                            console.log('[GlobalDiceDisplay] elementalRunesMode:', elementalRunesMode, 'elementalTypes:', elementalTypes);
                            rollWithDiceBox(diceBoxRef.current, latestRoll.formula, latestRoll.element, elementalRunesMode, elementalTypes);
                        }
                    }, 300);
                }
            }
        }
    }, [rolls.length, lastProcessedRoll, isInitialized]);

    // Show panel when pendingData is set (without auto-rolling)
    useEffect(() => {
        if (pendingWeaponData || pendingImpulseData || pendingSpellData) {
            setShowPanel(true);
        }
    }, [pendingWeaponData, pendingImpulseData, pendingSpellData]);

    const handleClose = () => {
        setShowPanel(false);
        // Reset initialization state so it can reinitialize when reopened
        setIsInitialized(false);
        diceBoxRef.current = null;
        // Clear pending data on close
        clearPendingData();
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

    // Parse damage formula and double it for critical damage
    const doubleDamageFormula = (formula: string): string => {
        const cleanFormula = formula.replace(/\s+/g, '').toLowerCase();
        const diceRegex = /(\d+)d(\d+)/gi;

        // Replace all dice notations with doubled count
        return cleanFormula.replace(diceRegex, (_match, count, sides) => {
            const newCount = parseInt(count, 10) * 2;
            return `${newCount}d${sides}`;
        });
    };

    // Handle weapon attack roll with MAP
    const handleWeaponAttackRoll = (weaponData: WeaponRollData, attackNumber: 1 | 2 | 3) => {
        // Agile weapons have reduced MAP: -4/-8 instead of -5/-10
        let mapPenalty = 0;
        if (attackNumber > 1) {
            if (weaponData.isAgile) {
                mapPenalty = attackNumber === 2 ? 4 : 8;
            } else {
                mapPenalty = (attackNumber - 1) * 5;
            }
        }
        const attackBonus = weaponData.attackBonus - mapPenalty;
        const formula = `1d20${attackBonus >= 0 ? '+' : ''}${attackBonus}`;
        const label = `${t('weapons.attack') || 'Attack'}: ${weaponData.weaponName}${attackNumber > 1 ? ` (${attackNumber})` : ''}`;
        // Pass element from weaponData if available (for elemental rune dice coloring)
        rollDice(formula, label, { weaponData, element: weaponData.element });
    };

    // Handle weapon damage roll
    const handleWeaponDamageRoll = (weaponData: WeaponRollData, doubleDamage: boolean = false) => {
        const formula = doubleDamage ? doubleDamageFormula(weaponData.damage) : weaponData.damage;
        const label = `${t('weapons.damageRoll') || 'Damage'}: ${weaponData.weaponName}${doubleDamage ? ' (Critical)' : ''}`;
        // Pass element from weaponData if available (for elemental rune dice coloring)
        rollDice(formula, label, { weaponData, element: weaponData.element });
    };

    // Handle impulse attack roll with MAP
    const handleImpulseAttackRoll = (impulseData: ImpulseRollData, attackNumber: 1 | 2 | 3) => {
        // Agile impulses have reduced MAP: -4/-8 instead of -5/-10
        let mapPenalty = 0;
        if (attackNumber > 1) {
            if (impulseData.isAgile) {
                mapPenalty = attackNumber === 2 ? 4 : 8;
            } else {
                mapPenalty = (attackNumber - 1) * 5;
            }
        }
        const attackBonus = impulseData.attackBonus - mapPenalty;
        const formula = `1d20${attackBonus >= 0 ? '+' : ''}${attackBonus}`;
        const label = `${impulseData.impulseName}${attackNumber > 1 ? ` (${attackNumber})` : ''}`;
        rollDice(formula, label, { impulseData, element: impulseData.element });
    };

    // Handle impulse damage roll
    const handleImpulseDamageRoll = (impulseData: ImpulseRollData, doubleDamage: boolean = false) => {
        const formula = doubleDamage ? doubleDamageFormula(impulseData.damage) : impulseData.damage;
        const label = `${impulseData.impulseName}${doubleDamage ? ' (Critical)' : ''}`;
        rollDice(formula, label, { impulseData, element: impulseData.element });
    };

    // Handle spell attack roll
    const handleSpellAttackRoll = (spellData: SpellRollData) => {
        const formula = `1d20+${spellData.spellAttack}`;
        // Spells typically don't have MAP in the same way, but if needed we can add it later
        const attackLabel = spellData.requiresAttackRoll
            ? (t('spell.spellAttack') || 'Spell Attack')
            : (t('spell.attack') || 'Spell Attack');
        const label = `${attackLabel}: ${spellData.spellName}`;
        rollDice(formula, label, { element: spellData.element, spellData });
    };

    // Handle spell damage roll
    const handleSpellDamageRoll = (spellData: SpellRollData, doubleDamage: boolean = false) => {
        if (!spellData.damage) return;
        const formula = doubleDamage ? doubleDamageFormula(spellData.damage) : spellData.damage;
        const label = `${t('weapons.damageRoll') || 'Damage'}: ${spellData.spellName}${doubleDamage ? ' (Critical)' : ''}`;
        rollDice(formula, label, { element: spellData.element, spellData });
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
                                {/* Natural 20 Banner - Special Highlight (hidden while rolling) */}
                                {!isRolling && rolls[rolls.length - 1].isCritSuccess && (
                                    <div className="dice-nat20-banner">
                                        <div className="nat20-icon">⚔️</div>
                                        <div className="nat20-text">
                                            <div className="nat20-title">NATURAL 20!</div>
                                            <div className="nat20-subtitle">CRITICAL SUCCESS</div>
                                        </div>
                                    </div>
                                )}

                                {/* Natural 1 Banner - Critical Failure (hidden while rolling) */}
                                {!isRolling && rolls[rolls.length - 1].isCritFailure && (
                                    <div className="dice-nat1-banner">
                                        <div className="nat1-icon">💀</div>
                                        <div className="nat1-text">
                                            <div className="nat1-title">NATURAL 1!</div>
                                            <div className="nat1-subtitle">CRITICAL FAILURE</div>
                                        </div>
                                    </div>
                                )}

                                {/* Total Result - Hidden while dice are rolling */}
                                <div className="dice-box-total" style={{ opacity: isRolling ? 0 : 1, transition: 'opacity 0.3s ease-in-out' }}>
                                    {/* Show D20 icon for d20 check rolls (attacks, saves, skills) */}
                                    {isD20CheckRoll(rolls[rolls.length - 1]) && (
                                        <img
                                            src="/assets/icon_d20_orange_small.png"
                                            alt="D20"
                                            className="d20-icon"
                                            style={{ width: '24px', height: '24px', marginRight: '8px' }}
                                        />
                                    )}
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

                        {/* Weapon Action Buttons */}
                        {(() => {
                            // Use weaponData from latest roll OR from pendingWeaponData
                            const weaponData = (rolls.length > 0 && rolls[rolls.length - 1].weaponData)
                                ? rolls[rolls.length - 1].weaponData!
                                : pendingWeaponData;
                            if (!weaponData) return null;
                            return (
                                <div className="weapon-actions-section">
                                    <div className="weapon-actions-title">{weaponData.weaponName}</div>
                                    <div className="weapon-actions-grid">
                                        {/* Attack buttons with MAP */}
                                        <button
                                            className="weapon-action-btn attack-btn"
                                            onClick={() => handleWeaponAttackRoll(weaponData, 1)}
                                            title={`${t('weapons.attack') || 'Attack'} (1d20+${weaponData.attackBonus})`}
                                        >
                                            <img src="/assets/icon_d20_orange_small.png" alt="D20" style={{ width: '16px', height: '16px', marginRight: '4px' }} />
                                            {t('weapons.attack') || 'Attack'}
                                        </button>
                                        <button
                                            className="weapon-action-btn attack-btn"
                                            onClick={() => handleWeaponAttackRoll(weaponData, 2)}
                                            title={`${t('weapons.attack') || 'Attack'} 2 (MAP -${weaponData.isAgile ? 4 : 5})`}
                                        >
                                            <img src="/assets/icon_d20_orange_small.png" alt="D20" style={{ width: '16px', height: '16px', marginRight: '4px' }} />
                                            {t('weapons.attack') || 'Attack'} -{weaponData.isAgile ? 4 : 5}
                                        </button>
                                        <button
                                            className="weapon-action-btn attack-btn"
                                            onClick={() => handleWeaponAttackRoll(weaponData, 3)}
                                            title={`${t('weapons.attack') || 'Attack'} 3 (MAP -${weaponData.isAgile ? 8 : 10})`}
                                        >
                                            <img src="/assets/icon_d20_orange_small.png" alt="D20" style={{ width: '16px', height: '16px', marginRight: '4px' }} />
                                            {t('weapons.attack') || 'Attack'} -{weaponData.isAgile ? 8 : 10}
                                        </button>
                                        {/* Damage buttons */}
                                        <button
                                            className="weapon-action-btn damage-btn"
                                            onClick={() => handleWeaponDamageRoll(weaponData, false)}
                                            title={`${t('weapons.damageRoll') || 'Damage'}: ${weaponData.damage} ${weaponData.damageType}`}
                                        >
                                            🎲 {t('weapons.damage') || 'Damage'}
                                        </button>
                                        <button
                                            className="weapon-action-btn damage-btn crit-btn"
                                            onClick={() => handleWeaponDamageRoll(weaponData, true)}
                                            title={`${t('weapons.criticalDamage') || 'Critical Damage'}: 2× ${weaponData.damage} ${weaponData.damageType}`}
                                        >
                                            💥 {t('weapons.critical') || 'Crit'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Impulse Action Buttons */}
                        {(() => {
                            // Use impulseData from latest roll OR from pendingImpulseData
                            const impulseData = (rolls.length > 0 && rolls[rolls.length - 1].impulseData)
                                ? rolls[rolls.length - 1].impulseData!
                                : pendingImpulseData;
                            if (!impulseData) return null;
                            return (
                                <div className="weapon-actions-section">
                                    <div className="weapon-actions-title">{impulseData.impulseName}</div>
                                    <div className="weapon-actions-grid">
                                        {/* Attack buttons with MAP (only for blasts and attack impulses) */}
                                        {(impulseData.impulseType === 'blast' || impulseData.impulseType === 'attack') && (
                                            <>
                                                <button
                                                    className="weapon-action-btn attack-btn"
                                                    onClick={() => handleImpulseAttackRoll(impulseData, 1)}
                                                    title={`${t('weapons.attack') || 'Attack'} (1d20+${impulseData.attackBonus})`}
                                                >
                                                    <img src="/assets/icon_d20_orange_small.png" alt="D20" style={{ width: '16px', height: '16px', marginRight: '4px' }} />
                                                    {t('weapons.attack') || 'Attack'}
                                                </button>
                                                <button
                                                    className="weapon-action-btn attack-btn"
                                                    onClick={() => handleImpulseAttackRoll(impulseData, 2)}
                                                    title={`${t('weapons.attack') || 'Attack'} 2 (MAP -${impulseData.isAgile ? 4 : 5})`}
                                                >
                                                    <img src="/assets/icon_d20_orange_small.png" alt="D20" style={{ width: '16px', height: '16px', marginRight: '4px' }} />
                                                    {t('weapons.attack') || 'Attack'} -{impulseData.isAgile ? 4 : 5}
                                                </button>
                                                <button
                                                    className="weapon-action-btn attack-btn"
                                                    onClick={() => handleImpulseAttackRoll(impulseData, 3)}
                                                    title={`${t('weapons.attack') || 'Attack'} 3 (MAP -${impulseData.isAgile ? 8 : 10})`}
                                                >
                                                    <img src="/assets/icon_d20_orange_small.png" alt="D20" style={{ width: '16px', height: '16px', marginRight: '4px' }} />
                                                    {t('weapons.attack') || 'Attack'} -{impulseData.isAgile ? 8 : 10}
                                                </button>
                                            </>
                                        )}
                                        {/* Damage buttons */}
                                        <button
                                            className="weapon-action-btn damage-btn"
                                            onClick={() => handleImpulseDamageRoll(impulseData, false)}
                                            title={`${t('weapons.damageRoll') || 'Damage'}: ${impulseData.damage}`}
                                        >
                                            🎲 {t('weapons.damage') || 'Damage'}
                                        </button>
                                        <button
                                            className="weapon-action-btn damage-btn crit-btn"
                                            onClick={() => handleImpulseDamageRoll(impulseData, true)}
                                            title={`${t('weapons.criticalDamage') || 'Critical Damage'}: 2× ${impulseData.damage}`}
                                        >
                                            💥 {t('weapons.critical') || 'Crit'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Spell Action Buttons */}
                        {(() => {
                            // Use spellData from latest roll OR from pendingSpellData
                            // Note: We need to check if the latest roll HAS spellData
                            const latestRoll = rolls.length > 0 ? rolls[rolls.length - 1] : null;
                            const spellData = (latestRoll && latestRoll.spellData)
                                ? latestRoll.spellData
                                : pendingSpellData;

                            if (!spellData) return null;

                            return (
                                <div className="weapon-actions-section">
                                    <div className="weapon-actions-title">{spellData.spellName}</div>
                                    <div className="weapon-actions-grid">
                                        {/* Attack button (only for spells with attack roll trait) */}
                                        {spellData.spellAttack > 0 && spellData.requiresAttackRoll && (
                                            <button
                                                className="weapon-action-btn attack-btn"
                                                onClick={() => handleSpellAttackRoll(spellData)}
                                                title={`${t('spell.spellAttack') || 'Spell Attack'} (1d20+${spellData.spellAttack})`}
                                            >
                                                <img src="/assets/icon_d20_orange_small.png" alt="D20" style={{ width: '16px', height: '16px', marginRight: '4px' }} />
                                                {t('spell.spellAttack') || 'Spell Attack'} (+{spellData.spellAttack})
                                            </button>
                                        )}

                                        {/* DC display (non-interactive but informative) */}
                                        {spellData.spellDC > 0 && (
                                            <div className="weapon-action-btn" style={{ cursor: 'default', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
                                                {t('stats.spellDC') || 'DC'} {spellData.spellDC}
                                            </div>
                                        )}

                                        {/* Damage buttons (if has damage) */}
                                        {spellData.damage && (
                                            <>
                                                <button
                                                    className="weapon-action-btn damage-btn"
                                                    onClick={() => handleSpellDamageRoll(spellData, false)}
                                                    title={`${t('weapons.damageRoll') || 'Damage'}: ${spellData.damage}`}
                                                >
                                                    🎲 {t('weapons.damage') || 'Damage'}
                                                </button>
                                                <button
                                                    className="weapon-action-btn damage-btn crit-btn"
                                                    onClick={() => handleSpellDamageRoll(spellData, true)}
                                                    title={`${t('weapons.criticalDamage') || 'Critical Damage'}: 2× ${spellData.damage}`}
                                                >
                                                    💥 {t('weapons.critical') || 'Crit'}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}

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
                                            <div className="history-label">
                                                {isD20CheckRoll(roll) && (
                                                    <img
                                                        src="/assets/icon_d20_orange_small.png"
                                                        alt="D20"
                                                        className="d20-icon-small"
                                                        style={{ width: '16px', height: '16px', marginRight: '4px', verticalAlign: 'middle' }}
                                                    />
                                                )}
                                                {roll.label}
                                            </div>
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
