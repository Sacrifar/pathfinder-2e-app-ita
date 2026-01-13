/**
 * Focus Points Tracker Component
 * Visual tracker for Focus Points with spend/recover controls
 */

import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { FocusPool } from '../../types';

interface FocusTrackerProps {
    focusPool: FocusPool;
    onSpendFocus: (amount: number) => void;
    onRecoverFocus: (amount: number) => void;
    maxFocus?: number;  // Calculated max based on feats
}

export const FocusTracker: React.FC<FocusTrackerProps> = ({
    focusPool,
    onSpendFocus,
    onRecoverFocus,
    maxFocus = 3,
}) => {
    const { t } = useLanguage();
    const [showConfirmSpend, setShowConfirmSpend] = useState(false);
    const [showConfirmRecover, setShowConfirmRecover] = useState(false);

    const handleSpend = (amount: number) => {
        if (focusPool.current >= amount) {
            onSpendFocus(amount);
        }
        setShowConfirmSpend(false);
    };

    const handleRecover = (amount: number) => {
        if (focusPool.current + amount <= maxFocus) {
            onRecoverFocus(amount);
        }
        setShowConfirmRecover(false);
    };

    const canSpend = focusPool.current > 0;
    const canRecover = focusPool.current < maxFocus;

    return (
        <div className="focus-tracker">
            <div className="focus-tracker-header">
                <span className="focus-label">{t('stats.focusPoints') || 'Focus Points'}</span>
                <span className="focus-count">{focusPool.current}/{maxFocus}</span>
            </div>

            {/* Visual gem/sphere display */}
            <div className="focus-gems">
                {Array.from({ length: maxFocus }, (_, i) => (
                    <div
                        key={i}
                        className={`focus-gem ${i < focusPool.current ? 'filled' : 'empty'}`}
                        title={`${t('stats.focusPoint') || 'Focus Point'} ${i + 1}`}
                    >
                        <div className="gem-inner">
                            {i < focusPool.current && (
                                <div className="gem-shine" />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick actions */}
            <div className="focus-actions">
                {/* Spend Focus */}
                <div className="focus-action-group">
                    <button
                        className="focus-action-btn spend-btn"
                        disabled={!canSpend}
                        onClick={() => canSpend && setShowConfirmSpend(!showConfirmSpend)}
                        title={t('actions.spendFocus') || 'Spend Focus Point'}
                    >
                        − {t('actions.spend') || 'Spend'}
                    </button>
                    {showConfirmSpend && (
                        <div className="focus-confirm-actions">
                            <button
                                className="focus-confirm-btn"
                                onClick={() => handleSpend(1)}
                            >
                                −1
                            </button>
                            {focusPool.current >= 2 && (
                                <button
                                    className="focus-confirm-btn"
                                    onClick={() => handleSpend(2)}
                                >
                                    −2
                                </button>
                            )}
                            <button
                                className="focus-cancel-btn"
                                onClick={() => setShowConfirmSpend(false)}
                            >
                                ×
                            </button>
                        </div>
                    )}
                </div>

                {/* Recover Focus */}
                <div className="focus-action-group">
                    <button
                        className="focus-action-btn recover-btn"
                        disabled={!canRecover}
                        onClick={() => canRecover && setShowConfirmRecover(!showConfirmRecover)}
                        title={t('actions.recoverFocus') || 'Recover Focus Point'}
                    >
                        + {t('actions.recover') || 'Recover'}
                    </button>
                    {showConfirmRecover && (
                        <div className="focus-confirm-actions">
                            <button
                                className="focus-confirm-btn"
                                onClick={() => handleRecover(1)}
                            >
                                +1
                            </button>
                            {focusPool.current + 2 <= maxFocus && (
                                <button
                                    className="focus-confirm-btn"
                                    onClick={() => handleRecover(2)}
                                >
                                    +2
                                </button>
                            )}
                            <button
                                className="focus-cancel-btn"
                                onClick={() => setShowConfirmRecover(false)}
                            >
                                ×
                            </button>
                        </div>
                    )}
                </div>

                {/* Refocus (recover all) */}
                <button
                    className="focus-action-btn refocus-btn"
                    disabled={focusPool.current >= maxFocus}
                    onClick={() => onRecoverFocus(maxFocus - focusPool.current)}
                    title={t('actions.refocus') || 'Refocus (recover all)'}
                >
                    {t('actions.refocus') || 'Refocus'}
                </button>
            </div>

            {/* Ref Note */}
            {focusPool.current < maxFocus && (
                <div className="focus-note">
                    {t('focus.refocusNote') || 'Use Refocus during daily preparations to recover Focus Points.'}
                </div>
            )}
        </div>
    );
};

export default FocusTracker;
