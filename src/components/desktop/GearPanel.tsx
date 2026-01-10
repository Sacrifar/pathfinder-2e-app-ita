import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Character } from '../../types';

interface GearPanelProps {
    character: Character;
    onAddGear: () => void;
}

export const GearPanel: React.FC<GearPanelProps> = ({
    character,
    onAddGear,
}) => {
    const { t } = useLanguage();

    // Calculate bulk limits
    const strMod = Math.floor((character.abilityScores.str - 10) / 2);
    const maxBulk = 5 + strMod;
    const encumberedBulk = maxBulk - 5;

    // Calculate current bulk from equipment
    const currentBulk = character.equipment.reduce((total, item) => total + item.bulk, 0);
    const isEncumbered = currentBulk > encumberedBulk;
    const isOverloaded = currentBulk > maxBulk;

    // Filter non-weapon equipment
    const gearItems = character.equipment.filter(item => !item.wielded);

    // Currency formatting
    const formatCurrency = () => {
        const { cp, sp, gp, pp } = character.currency;
        const parts = [];
        if (pp > 0) parts.push(`${pp} pp`);
        if (gp > 0) parts.push(`${gp} gp`);
        if (sp > 0) parts.push(`${sp} sp`);
        if (cp > 0) parts.push(`${cp} cp`);
        return parts.length > 0 ? parts.join(', ') : '0 gp';
    };

    return (
        <div className="gear-panel">
            <div className="panel-header">
                <h3>{t('tabs.gear') || 'Gear'}</h3>
                <button className="header-btn" onClick={onAddGear}>
                    + {t('actions.addGear') || 'Add Gear'}
                </button>
            </div>

            {/* Bulk Tracker */}
            <div className="bulk-tracker">
                <div className="bulk-header">
                    <span className="bulk-label">{t('stats.bulk') || 'Bulk'}</span>
                    <span className={`bulk-value ${isOverloaded ? 'overloaded' : isEncumbered ? 'encumbered' : ''}`}>
                        {currentBulk} / {maxBulk}
                    </span>
                </div>
                <div className="bulk-bar">
                    <div
                        className={`bulk-fill ${isOverloaded ? 'overloaded' : isEncumbered ? 'encumbered' : ''}`}
                        style={{ width: `${Math.min((currentBulk / maxBulk) * 100, 100)}%` }}
                    />
                    <div
                        className="bulk-encumbered-marker"
                        style={{ left: `${(encumberedBulk / maxBulk) * 100}%` }}
                    />
                </div>
                {isEncumbered && !isOverloaded && (
                    <span className="bulk-warning">{t('status.encumbered') || 'Encumbered'}</span>
                )}
                {isOverloaded && (
                    <span className="bulk-danger">{t('status.overloaded') || 'Overloaded'}</span>
                )}
            </div>

            {/* Currency */}
            <div className="currency-display">
                <span className="currency-label">{t('stats.currency') || 'Currency'}</span>
                <span className="currency-value">{formatCurrency()}</span>
            </div>

            {/* Invested Items */}
            <div className="invested-tracker">
                <span className="invested-label">{t('stats.invested') || 'Invested'}</span>
                <span className="invested-value">
                    {character.equipment.filter(i => i.invested).length} / 10
                </span>
            </div>

            {/* Equipment List */}
            {gearItems.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">🎒</div>
                    <p>{t('builder.noGear') || 'No gear in inventory.'}</p>
                    <p className="empty-state-hint">
                        {t('builder.addGearHint') || 'Add equipment, consumables, and treasure.'}
                    </p>
                </div>
            ) : (
                <div className="gear-list">
                    {gearItems.map(item => (
                        <div key={item.id} className="gear-item">
                            <div className="gear-info">
                                <span className="gear-name">
                                    {item.invested && <span className="invested-dot">●</span>}
                                    {item.name}
                                </span>
                                <span className="gear-bulk">
                                    {item.bulk > 0 ? `${item.bulk} bulk` : 'L'}
                                </span>
                            </div>
                            <div className="gear-actions">
                                {item.worn && (
                                    <span className="gear-status worn">{t('status.worn') || 'Worn'}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GearPanel;
