import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage, useLocalizedName } from '../../hooks/useLanguage';
import { Character, EquippedItem, ReinforcingRune, ShieldCustomization } from '../../types';
import { LoadedShield } from '../../data/pf2e-loader';
import {
    SHIELD_FUNDAMENTAL_RUNES,
    SHIELD_PROPERTY_RUNES,
    getShieldStatsWithReinforcing,
} from '../../data/shieldRunes';
import { canAfford, formatCurrency } from '../../utils/currency';

interface ShieldOptionsModalProps {
    character: Character;
    shield: LoadedShield;
    equippedShield: EquippedItem;
    onClose: () => void;
    onSave: (updatedItem: EquippedItem) => void;
    onBuyRunes?: (updatedItem: EquippedItem, costGp: number) => void;
}

export const ShieldOptionsModal: React.FC<ShieldOptionsModalProps> = ({
    character,
    shield,
    equippedShield,
    onClose,
    onSave,
    onBuyRunes,
}) => {
    const { t } = useLanguage();
    const getLocalizedName = useLocalizedName();

    // Local state for form fields
    const [reinforcingRune, setReinforcingRune] = useState<ReinforcingRune | undefined>(
        (equippedShield.runes as { reinforcingRune?: ReinforcingRune })?.reinforcingRune
    );
    const [propertyRunes, setPropertyRunes] = useState<string[]>(
        (equippedShield.runes as { propertyRunes?: string[] })?.propertyRunes || []
    );

    const [customName, setCustomName] = useState<string>(
        (equippedShield.customization as ShieldCustomization)?.customName || ''
    );
    const [hardnessOverride, setHardnessOverride] = useState<number | undefined>(
        (equippedShield.customization as ShieldCustomization)?.hardnessOverride
    );
    const [maxHPOverride, setMaxHPOverride] = useState<number | undefined>(
        (equippedShield.customization as ShieldCustomization)?.maxHPOverride
    );
    const [currentHP, setCurrentHP] = useState<number>(
        (equippedShield.customization as ShieldCustomization)?.currentHP ?? shield.hp
    );
    const [broken, setBroken] = useState<boolean>(
        (equippedShield.customization as ShieldCustomization)?.broken || false
    );

    // Search state for property runes
    const [runeSearch, setRuneSearch] = useState('');

    // Sync state with props when equippedShield changes
    useEffect(() => {
        const newRunes = equippedShield.runes as { reinforcingRune?: ReinforcingRune; propertyRunes?: string[] } | undefined;
        setReinforcingRune(newRunes?.reinforcingRune);
        setPropertyRunes(newRunes?.propertyRunes || []);
    }, [equippedShield.runes]);

    useEffect(() => {
        const newCustomization = equippedShield.customization as ShieldCustomization | undefined;
        setCustomName(newCustomization?.customName || '');
        setHardnessOverride(newCustomization?.hardnessOverride);
        setMaxHPOverride(newCustomization?.maxHPOverride);
        setCurrentHP(newCustomization?.currentHP ?? shield.hp);
        setBroken(newCustomization?.broken || false);
    }, [equippedShield.customization, shield.hp]);

    // Calculate cost of new runes
    const runeCost = useMemo(() => {
        let cost = 0;

        // Reinforcing rune cost
        const oldReinforcing = (equippedShield.runes as { reinforcingRune?: ReinforcingRune })?.reinforcingRune;
        if (reinforcingRune && oldReinforcing !== reinforcingRune) {
            const reinforcingRuneData = SHIELD_FUNDAMENTAL_RUNES.reinforcing.find(r => r.value === reinforcingRune);
            const oldReinforcingRuneData = oldReinforcing ? SHIELD_FUNDAMENTAL_RUNES.reinforcing.find(r => r.value === oldReinforcing) : null;
            if (reinforcingRuneData) {
                cost += reinforcingRuneData.price - (oldReinforcingRuneData?.price || 0);
            }
        }

        // Property runes cost (newly added ones only)
        const oldPropertyRunes = (equippedShield.runes as { propertyRunes?: string[] })?.propertyRunes || [];
        const newPropertyRunes = propertyRunes.filter(r => !oldPropertyRunes.includes(r));
        for (const runeId of newPropertyRunes) {
            const rune = SHIELD_PROPERTY_RUNES[runeId];
            if (rune) cost += rune.price;
        }

        return cost;
    }, [reinforcingRune, propertyRunes, equippedShield.runes]);

    // Calculate shield stats with reinforcing rune
    const shieldStats = useMemo(() => {
        if (reinforcingRune) {
            return getShieldStatsWithReinforcing(shield.hardness, shield.maxHp, reinforcingRune);
        }
        return {
            hardness: hardnessOverride ?? shield.hardness,
            maxHP: maxHPOverride ?? shield.maxHp,
        };
    }, [reinforcingRune, shield.hardness, shield.maxHp, hardnessOverride, maxHPOverride]);

    // Get all property runes sorted by level
    const allPropertyRunes = useMemo(() => {
        return Object.values(SHIELD_PROPERTY_RUNES).sort((a, b) => {
            if (a.level !== b.level) return a.level - b.level;
            return (a.nameIt || a.name).localeCompare(b.nameIt || b.name);
        });
    }, []);

    // Filter runes by search
    const filteredRunes = useMemo(() => {
        if (!runeSearch) return allPropertyRunes;
        const search = runeSearch.toLowerCase();
        return allPropertyRunes.filter(rune =>
            rune.name.toLowerCase().includes(search) ||
            (rune.nameIt && rune.nameIt.toLowerCase().includes(search)) ||
            (rune.description && rune.description.toLowerCase().includes(search)) ||
            (rune.descriptionIt && rune.descriptionIt.toLowerCase().includes(search))
        );
    }, [allPropertyRunes, runeSearch]);

    // Toggle property rune selection
    const togglePropertyRune = (runeId: string) => {
        const isSelected = propertyRunes.includes(runeId);
        if (isSelected) {
            // Remove the rune
            setPropertyRunes(propertyRunes.filter(id => id !== runeId));
        } else {
            // Add the rune if under limit (shields can only have 1)
            if (propertyRunes.length < 1) {
                setPropertyRunes([...propertyRunes, runeId]);
            }
        }
    };

    const handleSaveGive = () => {
        const updatedItem: EquippedItem = {
            ...equippedShield,
            runes: {
                reinforcingRune: reinforcingRune,
                propertyRunes: propertyRunes.length > 0 ? propertyRunes : undefined,
            },
            customization: {
                customName: customName || undefined,
                hardnessOverride: hardnessOverride,
                maxHPOverride: maxHPOverride,
                currentHP: currentHP,
                broken: broken,
            },
        };
        onSave(updatedItem);
        onClose();
    };

    const handleSaveBuy = () => {
        // Check if character can afford the runes
        if (!canAfford(character, runeCost)) {
            alert(`${t('errors.insufficientFunds') || 'Insufficient funds'}: ${formatCurrency(character.currency)} < ${runeCost} gp`);
            return;
        }

        const updatedItem: EquippedItem = {
            ...equippedShield,
            runes: {
                reinforcingRune: reinforcingRune,
                propertyRunes: propertyRunes.length > 0 ? propertyRunes : undefined,
            },
            customization: {
                customName: customName || undefined,
                hardnessOverride: hardnessOverride,
                maxHPOverride: maxHPOverride,
                currentHP: currentHP,
                broken: broken,
            },
        };

        // Use the onBuyRunes callback if available, otherwise fall back to onSave
        if (onBuyRunes) {
            onBuyRunes(updatedItem, runeCost);
        } else {
            onSave(updatedItem);
        }
        onClose();
    };


    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="weapon-options-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        {customName || shield.name} - {t('shield.options') || 'Shield Options'}
                    </h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-content">
                    <div className="modal-two-columns">
                        {/* Left Column */}
                        <div className="modal-column-left">
                            {/* Shield Stats Display */}
                            <div className="options-section">
                                <h3>{t('shield.currentHP') || 'Current Stats'}</h3>
                                <div className="shield-stats-grid">
                                    <div className="shield-stat">
                                        <span className="stat-label">{t('shield.currentHP') || 'Current HP'}:</span>
                                        <span className="stat-value">{currentHP} / {shieldStats.maxHP}</span>
                                    </div>
                                    <div className="shield-stat">
                                        <span className="stat-label">{t('shield.hardnessOverride') || 'Hardness'}:</span>
                                        <span className="stat-value">{shieldStats.hardness}</span>
                                    </div>
                                    {broken && (
                                        <div className="shield-stat broken-status">
                                            <span className="stat-value">{t('shield.broken') || 'BROKEN'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Fundamental Runes */}
                            <div className="options-section">
                                <h3>{t('weapons.fundamentalRunes') || 'Fundamental Runes'}</h3>

                                <div className="option-row">
                                    <label>{t('shield.reinforcingRune') || 'Reinforcing Rune'}</label>
                                    <select
                                        value={reinforcingRune || 'none'}
                                        onChange={(e) => setReinforcingRune(
                                            e.target.value === 'none' ? undefined : parseInt(e.target.value) as ReinforcingRune
                                        )}
                                        className="option-select"
                                    >
                                        <option value="none">{t('weapons.none') || 'None'}</option>
                                        {SHIELD_FUNDAMENTAL_RUNES.reinforcing.map(rune => (
                                            <option key={rune.value} value={rune.value}>
                                                {getLocalizedName(rune)} (Hardness +{rune.hardnessIncrease}, HP +{rune.maxHPIncrease} - Lvl {rune.level}, {rune.price} gp)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Advanced Customization */}
                            <div className="options-section">
                                <h3>{t('shield.advancedCustomization') || 'Advanced Customization'}</h3>

                                <div className="option-row">
                                    <label>{t('shield.customName') || 'Custom Name'}</label>
                                    <input
                                        type="text"
                                        value={customName}
                                        onChange={(e) => setCustomName(e.target.value)}
                                        placeholder={shield.name}
                                        className="option-input"
                                    />
                                </div>

                                <div className="option-row">
                                    <label>{t('shield.hardnessOverride') || 'Hardness Override'}</label>
                                    <input
                                        type="number"
                                        value={hardnessOverride ?? ''}
                                        onChange={(e) => setHardnessOverride(e.target.value ? parseInt(e.target.value) : undefined)}
                                        placeholder={shield.hardness.toString()}
                                        className="option-input"
                                    />
                                </div>

                                <div className="option-row">
                                    <label>{t('shield.maxHPOverride') || 'Max HP Override'}</label>
                                    <input
                                        type="number"
                                        value={maxHPOverride ?? ''}
                                        onChange={(e) => setMaxHPOverride(e.target.value ? parseInt(e.target.value) : undefined)}
                                        placeholder={shield.maxHp.toString()}
                                        className="option-input"
                                    />
                                </div>

                                <div className="option-row">
                                    <label>{t('shield.currentHP') || 'Current HP'}</label>
                                    <input
                                        type="number"
                                        value={currentHP}
                                        onChange={(e) => setCurrentHP(parseInt(e.target.value))}
                                        max={shieldStats.maxHP}
                                        min={0}
                                        className="option-input"
                                    />
                                </div>

                                <div className="option-row">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={broken}
                                            onChange={(e) => setBroken(e.target.checked)}
                                        />
                                        {t('shield.broken') || 'Broken'}
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Property Runes */}
                        <div className="modal-column-right">
                            <div className="options-section options-section-full">
                                <h3>
                                    {t('shield.propertyRunes') || 'Property Runes'} ({propertyRunes.length}/1)
                                </h3>

                                {/* Selected Runes Summary */}
                                {propertyRunes.length > 0 && (
                                    <div className="selected-runes-summary">
                                        <strong>{t('weapons.selected') || 'Selected'}:</strong>
                                        {propertyRunes.map(runeId => {
                                            const rune = SHIELD_PROPERTY_RUNES[runeId];
                                            if (!rune) return null;
                                            return (
                                                <span key={runeId} className="selected-rune-tag">
                                                    {getLocalizedName(rune)}
                                                    <button
                                                        className="remove-tag-btn"
                                                        onClick={() => togglePropertyRune(runeId)}
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            );
                                        })}
                                        <div className="rune-total-price">
                                            {t('weapons.totalPrice') || 'Total Price'}: {propertyRunes.reduce((sum, runeId) => sum + (SHIELD_PROPERTY_RUNES[runeId]?.price || 0), 0)} gp
                                        </div>
                                    </div>
                                )}

                                {/* Search */}
                                <input
                                    type="text"
                                    value={runeSearch}
                                    onChange={(e) => setRuneSearch(e.target.value)}
                                    placeholder={t('weapons.searchRunes') || 'Search runes...'}
                                    className="rune-search-input"
                                />

                                {/* Rune List */}
                                <div className="property-runes-list property-runes-list-tall">
                                    {filteredRunes.map(rune => {
                                        const isSelected = propertyRunes.includes(rune.id);
                                        const canSelect = !isSelected && propertyRunes.length >= 1;

                                        return (
                                            <div
                                                key={rune.id}
                                                className={`property-rune-card ${isSelected ? 'selected' : ''} ${canSelect ? 'disabled' : ''}`}
                                                onClick={() => !canSelect && togglePropertyRune(rune.id)}
                                            >
                                                <div className="rune-card-header">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => togglePropertyRune(rune.id)}
                                                        disabled={canSelect}
                                                    />
                                                    <div className="rune-name-info">
                                                        <span className="rune-name">
                                                            {getLocalizedName(rune)}
                                                        </span>
                                                        <span className="rune-meta">
                                                            Lvl {rune.level} • {rune.price} gp • {rune.rarity}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="rune-description">
                                                    {t('language') === 'it' && rune.descriptionIt ? rune.descriptionIt : rune.description}
                                                </div>
                                                {rune.traits && rune.traits.length > 0 && (
                                                    <div className="rune-traits">
                                                        {rune.traits.map(trait => (
                                                            <span key={trait} className="trait-tag">{trait}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {filteredRunes.length === 0 && (
                                        <div className="no-runes-found">
                                            {t('weapons.noRunesFound') || 'No runes found'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="modal-actions">
                        <button className="cancel-btn" onClick={onClose}>
                            {t('actions.cancel') || 'Cancel'}
                        </button>
                        <button className="give-btn" onClick={handleSaveGive}>
                            🎁 {t('actions.give') || 'Give'}
                        </button>
                        <button
                            className="buy-btn"
                            onClick={handleSaveBuy}
                            disabled={runeCost === 0 || !canAfford(character, runeCost)}
                            title={runeCost > 0 ? `${t('actions.buy') || 'Buy'}: ${runeCost} gp` : t('actions.noNewRunes') || 'No new runes to buy'}
                        >
                            💰 {t('actions.buy') || 'Buy'} ({runeCost} gp)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShieldOptionsModal;
