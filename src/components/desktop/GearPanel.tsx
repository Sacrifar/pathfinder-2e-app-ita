import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Character } from '../../types';

interface GearPanelProps {
    character: Character;
    onAddGear: () => void;
    onCharacterUpdate: (character: Character) => void;
}

export const GearPanel: React.FC<GearPanelProps> = ({
    character,
    onAddGear,
    onCharacterUpdate,
}) => {
    const { t } = useLanguage();
    const [editingCurrency, setEditingCurrency] = useState(false);

    // Safety defaults for potentially undefined properties
    const equipment = character.equipment || [];
    const currency = character.currency || { cp: 0, sp: 0, gp: 0, pp: 0 };

    // Calculate bulk limits
    const strMod = Math.floor(((character.abilityScores?.str ?? 10) - 10) / 2);
    const maxBulk = 5 + strMod;
    const encumberedBulk = maxBulk - 5;

    // Check for containers (backpacks reduce bulk)
    const hasBackpack = equipment.some(
        item => item.name?.toLowerCase().includes('backpack') && item.worn
    );
    const containerBulkReduction = hasBackpack ? 2 : 0;

    // Calculate current bulk from equipment (with container reduction)
    const rawBulk = equipment.reduce((total, item) => total + (item.bulk || 0), 0);
    const currentBulk = Math.max(0, rawBulk - containerBulkReduction);
    const isEncumbered = currentBulk > encumberedBulk;
    const isOverloaded = currentBulk > maxBulk;

    // Filter non-weapon equipment
    const gearItems = equipment.filter(item => !item.wielded);

    // Currency handlers
    const updateCurrency = (type: 'cp' | 'sp' | 'gp' | 'pp', value: number) => {
        onCharacterUpdate({
            ...character,
            currency: {
                ...currency,
                [type]: Math.max(0, value)
            }
        });
    };

    const adjustCurrency = (type: 'cp' | 'sp' | 'gp' | 'pp', delta: number) => {
        updateCurrency(type, currency[type] + delta);
    };

    // Currency conversion
    const convertUp = (from: 'cp' | 'sp' | 'gp', to: 'sp' | 'gp' | 'pp') => {
        const rate = 10;
        if (currency[from] >= rate) {
            onCharacterUpdate({
                ...character,
                currency: {
                    ...currency,
                    [from]: currency[from] - rate,
                    [to]: currency[to] + 1
                }
            });
        }
    };

    const convertDown = (from: 'sp' | 'gp' | 'pp', to: 'cp' | 'sp' | 'gp') => {
        const rate = 10;
        if (currency[from] >= 1) {
            onCharacterUpdate({
                ...character,
                currency: {
                    ...currency,
                    [from]: currency[from] - 1,
                    [to]: currency[to] + rate
                }
            });
        }
    };

    // Calculate total wealth in GP
    const totalWealth =
        currency.cp / 100 +
        currency.sp / 10 +
        currency.gp +
        currency.pp * 10;

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
                        {containerBulkReduction > 0 && (
                            <span className="bulk-reduction" title="Backpack reduction">
                                (-{containerBulkReduction})
                            </span>
                        )}
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

            {/* Currency Section */}
            <div className="currency-section">
                <div className="currency-header">
                    <span className="currency-label">{t('stats.currency') || 'Currency'}</span>
                    <button
                        className="edit-currency-btn"
                        onClick={() => setEditingCurrency(!editingCurrency)}
                    >
                        {editingCurrency ? '✓' : '✎'}
                    </button>
                </div>

                <div className="currency-total">
                    Total: {totalWealth.toFixed(2)} gp
                </div>

                <div className="currency-grid">
                    {(['pp', 'gp', 'sp', 'cp'] as const).map(type => (
                        <div key={type} className="currency-item">
                            <span className={`currency-type ${type}`}>{type.toUpperCase()}</span>
                            {editingCurrency ? (
                                <div className="currency-controls">
                                    <button
                                        className="currency-btn minus"
                                        onClick={() => adjustCurrency(type, -1)}
                                        disabled={currency[type] <= 0}
                                    >
                                        −
                                    </button>
                                    <input
                                        type="number"
                                        className="currency-input"
                                        value={currency[type]}
                                        onChange={(e) => updateCurrency(type, parseInt(e.target.value) || 0)}
                                        min={0}
                                    />
                                    <button
                                        className="currency-btn plus"
                                        onClick={() => adjustCurrency(type, 1)}
                                    >
                                        +
                                    </button>
                                </div>
                            ) : (
                                <span className="currency-amount">{currency[type]}</span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Currency Conversion */}
                {editingCurrency && (
                    <div className="currency-conversion">
                        <span className="conversion-label">Convert:</span>
                        <div className="conversion-buttons">
                            <button
                                className="convert-btn"
                                onClick={() => convertUp('cp', 'sp')}
                                disabled={currency.cp < 10}
                                title="10 CP → 1 SP"
                            >
                                10cp→1sp
                            </button>
                            <button
                                className="convert-btn"
                                onClick={() => convertUp('sp', 'gp')}
                                disabled={currency.sp < 10}
                                title="10 SP → 1 GP"
                            >
                                10sp→1gp
                            </button>
                            <button
                                className="convert-btn"
                                onClick={() => convertUp('gp', 'pp')}
                                disabled={currency.gp < 10}
                                title="10 GP → 1 PP"
                            >
                                10gp→1pp
                            </button>
                        </div>
                        <div className="conversion-buttons">
                            <button
                                className="convert-btn"
                                onClick={() => convertDown('sp', 'cp')}
                                disabled={currency.sp < 1}
                                title="1 SP → 10 CP"
                            >
                                1sp→10cp
                            </button>
                            <button
                                className="convert-btn"
                                onClick={() => convertDown('gp', 'sp')}
                                disabled={currency.gp < 1}
                                title="1 GP → 10 SP"
                            >
                                1gp→10sp
                            </button>
                            <button
                                className="convert-btn"
                                onClick={() => convertDown('pp', 'gp')}
                                disabled={currency.pp < 1}
                                title="1 PP → 10 GP"
                            >
                                1pp→10gp
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Invested Items */}
            <div className="invested-tracker">
                <span className="invested-label">{t('stats.invested') || 'Invested'}</span>
                <span className="invested-value">
                    {equipment.filter(i => i.invested).length} / 10
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
                        <div key={item.id} className={`gear-item ${item.name.toLowerCase().includes('backpack') ? 'container' : ''}`}>
                            <div className="gear-info">
                                <span className="gear-name">
                                    {item.invested && <span className="invested-dot">●</span>}
                                    {item.name.toLowerCase().includes('backpack') && <span className="container-icon">📦</span>}
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

