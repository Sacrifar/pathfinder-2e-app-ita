import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Character, EquippedItem, ResilientRune, ArmorCustomization } from '../../types';
import { LoadedArmor } from '../../data/pf2e-loader';
import {
    ARMOR_FUNDAMENTAL_RUNES,
    ARMOR_PROPERTY_RUNES,
    getMaxArmorPropertyRunes,
    getAvailableArmorPropertyRunes,
    ArmorPropertyRuneData,
} from '../../data/armorRunes';

interface ArmorOptionsModalProps {
    character: Character;
    armor: LoadedArmor;
    equippedArmor: EquippedItem;
    onClose: () => void;
    onSave: (updatedItem: EquippedItem) => void;
}

export const ArmorOptionsModal: React.FC<ArmorOptionsModalProps> = ({
    character,
    armor,
    equippedArmor,
    onClose,
    onSave,
}) => {
    const { t } = useLanguage();

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

    // Calculate available property runes
    const availablePropertyRunes = useMemo(() => {
        return getAvailableArmorPropertyRunes(potencyRune);
    }, [potencyRune]);

    const maxPropertyRunes = useMemo(() => {
        return getMaxArmorPropertyRunes(potencyRune);
    }, [potencyRune]);

    const handleAddPropertyRune = () => {
        if (propertyRunes.length < maxPropertyRunes && availablePropertyRunes.length > 0) {
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

    const getPropertyRuneData = (runeId: string): ArmorPropertyRuneData | undefined => {
        return ARMOR_PROPERTY_RUNES[runeId];
    };

    const handleSave = () => {
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
                                        {rune.nameIt || rune.name} (Lvl {rune.level}, {rune.price} gp)
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
                                        {rune.nameIt || rune.name} (Lvl {rune.level}, {rune.price} gp)
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Property Runes */}
                    <div className="options-section">
                        <h3>
                            {t('armor.propertyRunes') || 'Property Runes'} ({propertyRunes.length}/{maxPropertyRunes})
                        </h3>
                        {propertyRunes.map((runeId, index) => {
                            const runeData = getPropertyRuneData(runeId);
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
                        {propertyRunes.length < maxPropertyRunes && availablePropertyRunes.length > propertyRunes.length && (
                            <button
                                className="add-rune-btn"
                                onClick={handleAddPropertyRune}
                            >
                                + {t('armor.addPropertyRune') || 'Add Property Rune'}
                            </button>
                        )}
                        {propertyRunes.length > 0 && (
                            <div className="rune-total-price">
                                <span className="rune-price-label">{t('armor.totalPrice') || 'Total Price'}: </span>
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

export default ArmorOptionsModal;
