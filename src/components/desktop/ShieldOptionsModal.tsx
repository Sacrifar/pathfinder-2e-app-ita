import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Character, EquippedItem, ReinforcingRune, ShieldCustomization } from '../../types';
import { LoadedShield } from '../../data/pf2e-loader';
import {
    SHIELD_FUNDAMENTAL_RUNES,
    SHIELD_PROPERTY_RUNES,
    getShieldStatsWithReinforcing,
    getAvailableShieldPropertyRunes,
    ShieldPropertyRuneData,
} from '../../data/shieldRunes';

interface ShieldOptionsModalProps {
    character: Character;
    shield: LoadedShield;
    equippedShield: EquippedItem;
    onClose: () => void;
    onSave: (updatedItem: EquippedItem) => void;
}

export const ShieldOptionsModal: React.FC<ShieldOptionsModalProps> = ({
    character,
    shield,
    equippedShield,
    onClose,
    onSave,
}) => {
    const { t } = useLanguage();

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

    // Get available property runes (based on character level)
    const availablePropertyRunes = useMemo(() => {
        return getAvailableShieldPropertyRunes(character.level || 1);
    }, [character.level]);

    const handleAddPropertyRune = () => {
        if (availablePropertyRunes.length > 0) {
            const existingRuneIds = new Set(propertyRunes);
            const availableRune = availablePropertyRunes.find(r => !existingRuneIds.has(r.id));
            if (availableRune) {
                setPropertyRunes([...propertyRunes, availableRune.id]);
            }
        }
    };

    const handlePropertyRuneChange = (index: number, newRuneId: string) => {
        const newRunes = [...propertyRunes];
        newRunes[index] = newRuneId;
        setPropertyRunes(newRunes);
    };

    const getPropertyRuneData = (runeId: string): ShieldPropertyRuneData | undefined => {
        return SHIELD_PROPERTY_RUNES[runeId];
    };

    const handleSave = () => {
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
                                        {rune.nameIt || rune.name} (Hardness +{rune.hardnessIncrease}, HP +{rune.maxHPIncrease} - Lvl {rune.level}, {rune.price} gp)
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Property Runes */}
                    <div className="options-section">
                        <h3>
                            {t('shield.propertyRunes') || 'Property Runes'} ({propertyRunes.length})
                        </h3>
                        {propertyRunes.map((runeId, index) => {
                            return (
                                <div key={index} className="option-row property-rune-row">
                                    <select
                                        value={runeId}
                                        onChange={(e) => handlePropertyRuneChange(index, e.target.value)}
                                        className="option-select"
                                    >
                                        <option value="">{t('weapons.none') || 'None'}</option>
                                        {availablePropertyRunes.map(rune => (
                                            <option key={rune.id} value={rune.id}>
                                                {rune.nameIt || rune.name} (Lvl {rune.level}, {rune.price} gp)
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        className="remove-rune-btn"
                                        onClick={() => {
                                            const newRunes = propertyRunes.filter((_, i) => i !== index);
                                            setPropertyRunes(newRunes);
                                        }}
                                        title={t('actions.remove') || 'Remove'}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            );
                        })}
                        {availablePropertyRunes.length > propertyRunes.length && (
                            <button
                                className="add-rune-btn"
                                onClick={handleAddPropertyRune}
                            >
                                + {t('shield.addPropertyRune') || 'Add Property Rune'}
                            </button>
                        )}
                        {propertyRunes.length > 0 && (
                            <div className="rune-total-price">
                                <span className="rune-price-label">{t('shield.totalPrice') || 'Total Price'}: </span>
                                <span className="rune-price-value">
                                    {propertyRunes.reduce((sum, runeId) => {
                                        const rune = getPropertyRuneData(runeId);
                                        return sum + (rune?.price || 0);
                                    }, 0)} gp
                                </span>
                            </div>
                        )}
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

                    {/* Actions */}
                    <div className="modal-actions">
                        <button className="cancel-btn" onClick={onClose}>
                            {t('actions.cancel') || 'Cancel'}
                        </button>
                        <button className="save-btn" onClick={handleSave}>
                            {t('actions.save') || 'Save'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShieldOptionsModal;
