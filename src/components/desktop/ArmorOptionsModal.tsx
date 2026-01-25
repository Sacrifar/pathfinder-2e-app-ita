import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage, useLocalizedName } from '../../hooks/useLanguage';
import { Character, EquippedItem, ResilientRune, ArmorCustomization } from '../../types';
import { LoadedArmor } from '../../data/pf2e-loader';
import {
    ARMOR_FUNDAMENTAL_RUNES,
    ARMOR_PROPERTY_RUNES,
    getMaxArmorPropertyRunes,
} from '../../data/armorRunes';
import { canAfford, formatCurrency } from '../../utils/currency';

interface ArmorOptionsModalProps {
    character: Character;
    armor: LoadedArmor;
    equippedArmor: EquippedItem;
    onClose: () => void;
    onSave: (updatedItem: EquippedItem) => void;
    onBuyRunes?: (updatedItem: EquippedItem, costGp: number) => void;
}

export const ArmorOptionsModal: React.FC<ArmorOptionsModalProps> = ({
    character,
    armor,
    equippedArmor,
    onClose,
    onSave,
    onBuyRunes,
}) => {
    const { t } = useLanguage();
    const getLocalizedName = useLocalizedName();

    // Local state for form fields
    const [potencyRune, setPotencyRune] = useState<number>(
        (equippedArmor.runes as { potencyRune?: number })?.potencyRune || 0
    );
    const [resilientRune, setResilientRune] = useState<ResilientRune | undefined>(
        (equippedArmor.runes as { resilientRune?: ResilientRune })?.resilientRune
    );
    const [propertyRunes, setPropertyRunes] = useState<string[]>(
        (equippedArmor.runes as { propertyRunes?: string[] })?.propertyRunes || []
    );

    const [customName, setCustomName] = useState<string>(
        (equippedArmor.customization as ArmorCustomization)?.customName || ''
    );
    const [bonusAC, setBonusAC] = useState<number | undefined>(
        (equippedArmor.customization as ArmorCustomization)?.bonusAC
    );
    const [checkPenaltyOverride, setCheckPenaltyOverride] = useState<number | undefined>(
        (equippedArmor.customization as ArmorCustomization)?.checkPenaltyOverride
    );
    const [speedPenaltyOverride, setSpeedPenaltyOverride] = useState<number | undefined>(
        (equippedArmor.customization as ArmorCustomization)?.speedPenaltyOverride
    );
    const [dexCapOverride, setDexCapOverride] = useState<number | undefined>(
        (equippedArmor.customization as ArmorCustomization)?.dexCapOverride
    );

    // Search state for property runes
    const [runeSearch, setRuneSearch] = useState('');

    // Sync state with props when equippedArmor changes
    useEffect(() => {
        const newRunes = equippedArmor.runes as { potencyRune?: number; resilientRune?: ResilientRune; propertyRunes?: string[] } | undefined;
        setPotencyRune(newRunes?.potencyRune || 0);
        setResilientRune(newRunes?.resilientRune);
        setPropertyRunes(newRunes?.propertyRunes || []);
    }, [equippedArmor.runes]);

    useEffect(() => {
        const newCustomization = equippedArmor.customization as ArmorCustomization | undefined;
        setCustomName(newCustomization?.customName || '');
        setBonusAC(newCustomization?.bonusAC);
        setCheckPenaltyOverride(newCustomization?.checkPenaltyOverride);
        setSpeedPenaltyOverride(newCustomization?.speedPenaltyOverride);
        setDexCapOverride(newCustomization?.dexCapOverride);
    }, [equippedArmor.customization]);

    // Calculate cost of new runes
    const runeCost = useMemo(() => {
        let cost = 0;

        // Potency rune cost
        const oldPotency = (equippedArmor.runes as { potencyRune?: number })?.potencyRune || 0;
        if (potencyRune > oldPotency) {
            const potencyRuneData = ARMOR_FUNDAMENTAL_RUNES.potency.find(r => r.value === potencyRune);
            const oldPotencyRuneData = ARMOR_FUNDAMENTAL_RUNES.potency.find(r => r.value === oldPotency);
            if (potencyRuneData) {
                cost += potencyRuneData.price - (oldPotencyRuneData?.price || 0);
            }
        }

        // Resilient rune cost
        const oldResilient = (equippedArmor.runes as { resilientRune?: ResilientRune })?.resilientRune;
        if (resilientRune && oldResilient !== resilientRune) {
            const resilientRuneData = ARMOR_FUNDAMENTAL_RUNES.resilient.find(r => r.value === resilientRune);
            const oldResilientRuneData = oldResilient ? ARMOR_FUNDAMENTAL_RUNES.resilient.find(r => r.value === oldResilient) : null;
            if (resilientRuneData) {
                cost += resilientRuneData.price - (oldResilientRuneData?.price || 0);
            }
        }

        // Property runes cost (newly added ones only)
        const oldPropertyRunes = (equippedArmor.runes as { propertyRunes?: string[] })?.propertyRunes || [];
        const newPropertyRunes = propertyRunes.filter(r => !oldPropertyRunes.includes(r));
        for (const runeId of newPropertyRunes) {
            const rune = ARMOR_PROPERTY_RUNES[runeId];
            if (rune) cost += rune.price;
        }

        return cost;
    }, [potencyRune, resilientRune, propertyRunes, equippedArmor.runes]);

    // Get all property runes sorted by level
    const allPropertyRunes = useMemo(() => {
        return Object.values(ARMOR_PROPERTY_RUNES).sort((a, b) => {
            if (a.level !== b.level) return a.level - b.level;
            return (a.nameIt || a.name).localeCompare(b.nameIt || b.name);
        });
    }, []);

    const maxPropertyRunes = useMemo(() => {
        return getMaxArmorPropertyRunes(potencyRune);
    }, [potencyRune]);

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
            // Add the rune if under limit
            if (propertyRunes.length < maxPropertyRunes) {
                setPropertyRunes([...propertyRunes, runeId]);
            }
        }
    };

    const handleSaveGive = () => {
        const updatedItem: EquippedItem = {
            ...equippedArmor,
            runes: {
                potencyRune: potencyRune > 0 ? potencyRune : undefined,
                resilientRune: resilientRune,
                propertyRunes: propertyRunes.length > 0 ? propertyRunes : undefined,
            },
            customization: {
                customName: customName || undefined,
                bonusAC: bonusAC,
                checkPenaltyOverride: checkPenaltyOverride,
                speedPenaltyOverride: speedPenaltyOverride,
                dexCapOverride: dexCapOverride,
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
            ...equippedArmor,
            runes: {
                potencyRune: potencyRune > 0 ? potencyRune : undefined,
                resilientRune: resilientRune,
                propertyRunes: propertyRunes.length > 0 ? propertyRunes : undefined,
            },
            customization: {
                customName: customName || undefined,
                bonusAC: bonusAC,
                checkPenaltyOverride: checkPenaltyOverride,
                speedPenaltyOverride: speedPenaltyOverride,
                dexCapOverride: dexCapOverride,
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
                        {customName || armor.name} - {t('armor.options') || 'Armor Options'}
                    </h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-content">
                    <div className="modal-two-columns">
                        {/* Left Column */}
                        <div className="modal-column-left">
                            {/* Fundamental Runes */}
                            <div className="options-section">
                                <h3>{t('weapons.fundamentalRunes') || 'Fundamental Runes'}</h3>

                                <div className="option-row">
                                    <label>{t('armor.potencyRune') || 'Armor Potency Rune'}</label>
                                    <select
                                        value={potencyRune}
                                        onChange={(e) => setPotencyRune(parseInt(e.target.value))}
                                        className="option-select"
                                    >
                                        <option value={0}>{t('weapons.none') || 'None'}</option>
                                        {ARMOR_FUNDAMENTAL_RUNES.potency.map(rune => (
                                            <option key={rune.value} value={rune.value}>
                                                {getLocalizedName(rune)} (Lvl {rune.level}, {rune.price} gp)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="option-row">
                                    <label>{t('armor.resilientRune') || 'Resilient Rune'}</label>
                                    <select
                                        value={resilientRune || 'none'}
                                        onChange={(e) => setResilientRune(
                                            e.target.value === 'none' ? undefined : parseInt(e.target.value) as ResilientRune
                                        )}
                                        className="option-select"
                                    >
                                        <option value="none">{t('weapons.none') || 'None'}</option>
                                        {ARMOR_FUNDAMENTAL_RUNES.resilient.map(rune => (
                                            <option key={rune.value} value={rune.value}>
                                                {getLocalizedName(rune)} (Lvl {rune.level}, {rune.price} gp)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Advanced Customization */}
                            <div className="options-section">
                                <h3>{t('armor.advancedCustomization') || 'Advanced Customization'}</h3>

                                <div className="option-row">
                                    <label>{t('armor.customName') || 'Custom Name'}</label>
                                    <input
                                        type="text"
                                        value={customName}
                                        onChange={(e) => setCustomName(e.target.value)}
                                        placeholder={armor.name}
                                        className="option-input"
                                    />
                                </div>

                                <div className="option-row">
                                    <label>{t('armor.bonusAC') || 'Bonus AC'}</label>
                                    <input
                                        type="number"
                                        value={bonusAC ?? ''}
                                        onChange={(e) => setBonusAC(e.target.value ? parseInt(e.target.value) : undefined)}
                                        placeholder="+0"
                                        className="option-input"
                                    />
                                </div>

                                <div className="option-row">
                                    <label>{t('armor.checkPenaltyOverride') || 'Check Penalty Override'}</label>
                                    <input
                                        type="number"
                                        value={checkPenaltyOverride ?? ''}
                                        onChange={(e) => setCheckPenaltyOverride(e.target.value ? parseInt(e.target.value) : undefined)}
                                        placeholder={armor.checkPenalty.toString()}
                                        className="option-input"
                                    />
                                </div>

                                <div className="option-row">
                                    <label>{t('armor.speedPenaltyOverride') || 'Speed Penalty Override'}</label>
                                    <input
                                        type="number"
                                        value={speedPenaltyOverride ?? ''}
                                        onChange={(e) => setSpeedPenaltyOverride(e.target.value ? parseInt(e.target.value) : undefined)}
                                        placeholder={armor.speedPenalty.toString()}
                                        className="option-input"
                                    />
                                </div>

                                <div className="option-row">
                                    <label>{t('armor.dexCapOverride') || 'Dex Cap Override'}</label>
                                    <input
                                        type="number"
                                        value={dexCapOverride ?? ''}
                                        onChange={(e) => setDexCapOverride(e.target.value ? parseInt(e.target.value) : undefined)}
                                        placeholder={armor.dexCap.toString()}
                                        className="option-input"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Property Runes */}
                        <div className="modal-column-right">
                            <div className="options-section options-section-full">
                                <h3>
                                    {t('armor.propertyRunes') || 'Property Runes'} ({propertyRunes.length}/{maxPropertyRunes})
                                </h3>

                                {/* Selected Runes Summary */}
                                {propertyRunes.length > 0 && (
                                    <div className="selected-runes-summary">
                                        <strong>{t('weapons.selected') || 'Selected'}:</strong>
                                        {propertyRunes.map(runeId => {
                                            const rune = ARMOR_PROPERTY_RUNES[runeId];
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
                                            {t('weapons.totalPrice') || 'Total Price'}: {propertyRunes.reduce((sum, runeId) => sum + (ARMOR_PROPERTY_RUNES[runeId]?.price || 0), 0)} gp
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
                                        const canSelect = !isSelected && propertyRunes.length >= maxPropertyRunes;

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

export default ArmorOptionsModal;
