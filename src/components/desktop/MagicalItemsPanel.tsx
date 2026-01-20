/**
 * Magical Items Panel Component
 * Handles Staves (charges, linked spells) and Wands (daily uses, overcharge)
 */

import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { EquippedItem } from '../../types';

interface MagicalItemsPanelProps {
    equipment: EquippedItem[];
    onUseStaffSpell: (staffId: string, spellId: string) => void;
    onPrepareStaff: (staffId: string) => void;
    onCastWand: (wandId: string, overcharge: boolean) => void;
}

export const MagicalItemsPanel: React.FC<MagicalItemsPanelProps> = ({
    equipment,
    onUseStaffSpell,
    onPrepareStaff,
    onCastWand,
}) => {
    const { t, language: _language } = useLanguage();
    const [_selectedStaff, _setSelectedStaff] = useState<EquippedItem | null>(null);
    const [showOverchargeWarning, setShowOverchargeWarning] = useState(false);
    const [overchargeWandId, setOverchargeWandId] = useState<string | null>(null);

    // Filter magical items (Staves and Wands)
    const staves = equipment.filter(item =>
        item.magical?.charges && item.magical.linkedSpells && item.magical.linkedSpells.length > 0
    );

    const wands = equipment.filter(item =>
        item.magical?.dailyUses && item.name.toLowerCase().includes('wand')
    );

    const handleWandCast = (wand: EquippedItem) => {
        if (!wand.magical?.dailyUses) return;

        const dailyUses = wand.magical.dailyUses;

        // First use is free
        if (dailyUses.current < dailyUses.max) {
            onCastWand(wand.id, false);
            return;
        }

        // Second use requires overcharge check
        setShowOverchargeWarning(true);
        setOverchargeWandId(wand.id);
    };

    const confirmOvercharge = (willingToBreak: boolean) => {
        if (overchargeWandId && willingToBreak) {
            onCastWand(overchargeWandId, true);
        }
        setShowOverchargeWarning(false);
        setOverchargeWandId(null);
    };

    return (
        <div className="magical-items-panel">
            {/* Staves Section */}
            {staves.length > 0 && (
                <div className="magical-items-section staves-section">
                    <h4 className="section-title">
                        <span className="section-icon">🪄</span>
                        {t('magicalItems.staves') || 'Staves'}
                    </h4>

                    <div className="staves-grid">
                        {staves.map(staff => (
                            <div key={staff.id} className="staff-card">
                                <div className="staff-header">
                                    <span className="staff-name">{staff.name}</span>
                                    <button
                                        className="prepare-staff-btn"
                                        onClick={() => onPrepareStaff(staff.id)}
                                        title={t('magicalItems.prepareStaff') || 'Prepare Staff'}
                                    >
                                        {t('magicalItems.prepare') || 'Prepare'}
                                    </button>
                                </div>

                                {/* Charges Display */}
                                {staff.magical?.charges && (
                                    <div className="staff-charges">
                                        <span className="charges-label">{t('magicalItems.charges') || 'Charges'}</span>
                                        <div className="charges-pips">
                                            {Array.from({ length: staff.magical.charges.max }, (_, i) => (
                                                <div
                                                    key={i}
                                                    className={`charge-pip ${i < staff.magical!.charges!.current ? 'filled' : 'empty'}`}
                                                />
                                            ))}
                                        </div>
                                        <span className="charges-count">
                                            {staff.magical.charges.current}/{staff.magical.charges.max}
                                        </span>
                                    </div>
                                )}

                                {/* Linked Spells */}
                                {staff.magical?.linkedSpells && staff.magical.linkedSpells.length > 0 && (
                                    <div className="staff-spells">
                                        <span className="staff-spells-label">{t('magicalItems.spells') || 'Spells'}</span>
                                        <div className="staff-spells-list">
                                            {staff.magical.linkedSpells.map(spellId => (
                                                <button
                                                    key={spellId}
                                                    className="staff-spell-btn"
                                                    onClick={() => onUseStaffSpell(staff.id, spellId)}
                                                    disabled={!staff.magical?.charges || staff.magical.charges.current <= 0}
                                                    title={t('magicalItems.castFromStaff') || 'Cast from Staff'}
                                                >
                                                    {spellId}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Wands Section */}
            {wands.length > 0 && (
                <div className="magical-items-section wands-section">
                    <h4 className="section-title">
                        <span className="section-icon">🪄</span>
                        {t('magicalItems.wands') || 'Wands'}
                    </h4>

                    <div className="wands-grid">
                        {wands.map(wand => {
                            const dailyUses = wand.magical?.dailyUses;
                            const isDepleted = dailyUses ? dailyUses.current >= dailyUses.max : false;
                            const needsOvercharge = dailyUses ? dailyUses.current === dailyUses.max - 1 : false;

                            return (
                                <div key={wand.id} className={`wand-card ${isDepleted ? 'depleted' : ''}`}>
                                    <div className="wand-header">
                                        <span className="wand-name">{wand.name}</span>
                                        {isDepleted && (
                                            <span className="wand-depleted-badge">
                                                {t('magicalItems.depleted') || 'Depleted'}
                                            </span>
                                        )}
                                    </div>

                                    {/* Daily Uses Display */}
                                    {dailyUses && (
                                        <div className="wand-uses">
                                            <span className="uses-label">{t('magicalItems.dailyUses') || 'Daily Uses'}</span>
                                            <div className="uses-pips">
                                                {Array.from({ length: dailyUses.max }, (_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`use-pip ${i < dailyUses.current ? 'used' : 'available'}`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="uses-count">
                                                {dailyUses.current}/{dailyUses.max}
                                            </span>
                                        </div>
                                    )}

                                    {/* Cast Button */}
                                    <button
                                        className={`cast-wand-btn ${needsOvercharge ? 'overcharge-risk' : ''}`}
                                        onClick={() => handleWandCast(wand)}
                                        disabled={isDepleted}
                                        title={needsOvercharge
                                            ? t('magicalItems.overchargeRisk') || 'Overcharge Risk'
                                            : t('magicalItems.castFromWand') || 'Cast from Wand'
                                        }
                                    >
                                        {needsOvercharge
                                            ? `${t('magicalItems.castOvercharge') || 'Cast (Overcharge)'}`
                                            : t('magicalItems.cast') || 'Cast'
                                        }
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {staves.length === 0 && wands.length === 0 && (
                <div className="empty-state magical-items-empty">
                    <div className="empty-state-icon">🪄</div>
                    <p>{t('magicalItems.noMagicalItems') || 'No magical items equipped.'}</p>
                    <p className="text-muted text-sm">
                        {t('magicalItems.addStavesWands') || 'Add Staves or Wands to your equipment to manage their magical properties.'}
                    </p>
                </div>
            )}

            {/* Overcharge Warning Modal */}
            {showOverchargeWarning && (
                <div className="modal-overlay" onClick={() => setShowOverchargeWarning(false)}>
                    <div className="overcharge-warning-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header warning-header">
                            <h3>⚠️ {t('magicalItems.overchargeWarning') || 'Overcharge Warning'}</h3>
                        </div>

                        <div className="warning-content">
                            <p>{t('magicalItems.overchargeWarningText') || 'Using this wand again today requires overcharging it. This risks damaging or destroying the wand.'}</p>

                            <div className="overcharge-details">
                                <div className="overcharge-check">
                                    <span className="check-label">{t('magicalItems.overchargeDC') || 'Overcharge DC'}:</span>
                                    <span className="check-value">20</span>
                                </div>
                                <div className="overcharge-fail">
                                    <span className="fail-label">{t('magicalItems.onFailure') || 'On Failure'}:</span>
                                    <span className="fail-value">{t('magicalItems.wandTakesDamage') || 'Wand takes damage'}</span>
                                </div>
                                <div className="overcharge-crit-fail">
                                    <span className="fail-label">{t('magicalItems.onCriticalFailure') || 'On Critical Failure'}:</span>
                                    <span className="fail-value">{t('magicalItems.wandDestroyed') || 'Wand is destroyed'}</span>
                                </div>
                            </div>

                            <div className="warning-actions">
                                <button
                                    className="warning-btn cancel-btn"
                                    onClick={() => confirmOvercharge(false)}
                                >
                                    {t('actions.cancel') || 'Cancel'}
                                </button>
                                <button
                                    className="warning-btn risk-btn"
                                    onClick={() => confirmOvercharge(true)}
                                >
                                    {t('magicalItems.riskOvercharge') || 'Risk Overcharge'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MagicalItemsPanel;
