/**
 * DiceLog Component
 * Displays history of recent dice rolls
 */

import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { DiceRoll } from './DiceBox';

interface DiceLogProps {
    rolls: DiceRoll[];
    onClear: () => void;
    onClose: () => void;
    isOpen: boolean;
}

export const DiceLog: React.FC<DiceLogProps> = ({
    rolls,
    onClear,
    onClose,
    isOpen,
}) => {
    const { t } = useLanguage();

    if (!isOpen) return null;

    return (
        <div className="dice-log-overlay" onClick={onClose}>
            <div className="dice-log-panel" onClick={(e) => e.stopPropagation()}>
                <div className="dice-log-header">
                    <h3>
                        <span className="dice-log-icon">🎲</span>
                        {t('dice.history') || 'Roll History'}
                    </h3>
                    <div className="dice-log-actions">
                        <button
                            className="dice-log-btn clear-btn"
                            onClick={onClear}
                            title={t('dice.clearHistory') || 'Clear History'}
                        >
                            🗑
                        </button>
                        <button
                            className="dice-log-btn close-btn"
                            onClick={onClose}
                            title={t('actions.close') || 'Close'}
                        >
                            ×
                        </button>
                    </div>
                </div>

                <div className="dice-log-content">
                    {rolls.length === 0 ? (
                        <div className="dice-log-empty">
                            <div className="dice-log-empty-icon">🎲</div>
                            <p>{t('dice.noRolls') || 'No rolls yet.'}</p>
                        </div>
                    ) : (
                        <div className="dice-log-list">
                            {rolls.slice().reverse().map((roll) => (
                                <div
                                    key={roll.timestamp}
                                    className={`dice-log-entry ${roll.isCritSuccess ? 'crit-success' : ''} ${roll.isCritFailure ? 'crit-failure' : ''
                                        }`}
                                >
                                    <div className="dice-log-entry-header">
                                        <span className="dice-log-label">{roll.label}</span>
                                        <span className="dice-log-formula">{roll.formula}</span>
                                    </div>

                                    <div className="dice-log-entry-details">
                                        {roll.rolls.map((r, index) => (
                                            <span key={index} className="dice-log-rolls">
                                                {r.results.map((result, i) => (
                                                    <span
                                                        key={i}
                                                        className={`dice-log-result ${result === r.sides ? 'max' : ''} ${result === 1 ? 'min' : ''}`}
                                                    >
                                                        {result}
                                                    </span>
                                                ))}
                                            </span>
                                        ))}
                                        {roll.modifier !== 0 && (
                                            <span className="dice-log-modifier">
                                                {roll.modifier > 0 ? '+' : ''}{roll.modifier}
                                            </span>
                                        )}
                                    </div>

                                    <div className="dice-log-entry-total">
                                        {roll.isCritSuccess && <span className="crit-badge crit-success-badge">🎯</span>}
                                        {roll.isCritFailure && <span className="crit-badge crit-failure-badge">💀</span>}
                                        <span className={`dice-log-total ${roll.isCritSuccess ? 'crit-success' : ''} ${roll.isCritFailure ? 'crit-failure' : ''}`}>
                                            {roll.total}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="dice-log-footer">
                    <span className="dice-log-count">
                        {rolls.length} {t('dice.rolls') || 'rolls'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default DiceLog;
