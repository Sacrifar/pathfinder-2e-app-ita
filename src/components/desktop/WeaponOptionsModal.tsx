import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Character, EquippedItem, StrikingRune, SpecialMaterial, AbilityOverride } from '../../types';
import { LoadedWeapon } from '../../data/pf2e-loader';
import {
    FUNDAMENTAL_RUNES,
    PROPERTY_RUNES,
    getMaxPropertyRunes,
    getAvailablePropertyRunes,
    isValidPropertyRune,
    PropertyRuneData,
} from '../../data/weaponRunes';

interface WeaponOptionsModalProps {
    character: Character;
    weapon: LoadedWeapon;
    equippedWeapon: EquippedItem;
    onClose: () => void;
    onSave: (updatedItem: EquippedItem) => void;
}

export const WeaponOptionsModal: React.FC<WeaponOptionsModalProps> = ({
    character,
    weapon,
    equippedWeapon,
    onClose,
    onSave,
}) => {
    const { t } = useLanguage();

    // Local state for form fields
    const [potencyRune, setPotencyRune] = useState<number>(equippedWeapon.runes?.potencyRune || 0);
    const [strikingRune, setStrikingRune] = useState<StrikingRune | undefined>(equippedWeapon.runes?.strikingRune);
    const [propertyRunes, setPropertyRunes] = useState<string[]>(equippedWeapon.runes?.propertyRunes || []);

    const [material, setMaterial] = useState<SpecialMaterial | undefined>(equippedWeapon.customization?.material);
    const [isLarge, setIsLarge] = useState<boolean>(equippedWeapon.customization?.isLarge || false);
    const [bulkOverride, setBulkOverride] = useState<number | undefined>(equippedWeapon.customization?.bulkOverride);

    // Calculate available property runes
    const availablePropertyRunes = useMemo(() => {
        return getAvailablePropertyRunes(potencyRune);
    }, [potencyRune]);

    const maxPropertyRunes = useMemo(() => {
        return getMaxPropertyRunes(potencyRune);
    }, [potencyRune]);

    const [attackAbilityOverride, setAttackAbilityOverride] = useState<AbilityOverride>(
        equippedWeapon.customization?.attackAbilityOverride || 'auto'
    );
    const [customName, setCustomName] = useState<string>(equippedWeapon.customization?.customName || '');
    const [bonusAttack, setBonusAttack] = useState<number | undefined>(equippedWeapon.customization?.bonusAttack);
    const [bonusDamage, setBonusDamage] = useState<number | undefined>(equippedWeapon.customization?.bonusDamage);
    const [customDamageType, setCustomDamageType] = useState<string>(equippedWeapon.customization?.customDamageType || '');

    const [criticalSpecialization, setCriticalSpecialization] = useState<boolean>(
        equippedWeapon.customization?.criticalSpecialization || false
    );

    // Calculate max property runes based on potency rune
    const getMaxPropertyRunes = () => {
        if (potencyRune >= 3) return 3;
        if (potencyRune >= 2) return 2;
        if (potencyRune >= 1) return 1;
        return 0;
    };

    const handleAddPropertyRune = () => {
        if (propertyRunes.length < maxPropertyRunes && availablePropertyRunes.length > 0) {
            // Add the first available rune that's not already equipped
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

    const getPropertyRuneData = (runeId: string): PropertyRuneData | undefined => {
        return PROPERTY_RUNES[runeId];
    };

    const handleSave = () => {
        const updatedItem: EquippedItem = {
            ...equippedWeapon,
            runes: {
                potencyRune: potencyRune > 0 ? potencyRune : undefined,
                strikingRune: strikingRune,
                propertyRunes: propertyRunes.length > 0 ? propertyRunes : undefined,
            },
            customization: {
                material,
                isLarge: isLarge || undefined,
                bulkOverride: bulkOverride,
                attackAbilityOverride: attackAbilityOverride !== 'auto' ? attackAbilityOverride : undefined,
                customName: customName || undefined,
                bonusAttack: bonusAttack,
                bonusDamage: bonusDamage,
                customDamageType: customDamageType || undefined,
                criticalSpecialization: criticalSpecialization || undefined,
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
                        {customName || weapon.name} - {t('weapons.options') || 'Weapon Options'}
                    </h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-content">
                    {/* Fundamental Runes */}
                    <div className="options-section">
                        <h3>{t('weapons.fundamentalRunes') || 'Fundamental Runes'}</h3>

                        <div className="option-row">
                            <label>{t('weapons.potencyRune') || 'Potency Rune'}</label>
                            <select
                                value={potencyRune}
                                onChange={(e) => setPotencyRune(parseInt(e.target.value))}
                                className="option-select"
                            >
                                <option value={0}>{t('weapons.none') || 'None'}</option>
                                {FUNDAMENTAL_RUNES.potency.map(rune => (
                                    <option key={rune.value} value={rune.value}>
                                        {t('weapons.potency') || 'Potency'} +{rune.value} (Lvl {rune.level}, {rune.price} gp)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="option-row">
                            <label>{t('weapons.strikingRune') || 'Striking Rune'}</label>
                            <select
                                value={strikingRune || 'none'}
                                onChange={(e) => setStrikingRune(e.target.value === 'none' ? undefined : e.target.value as StrikingRune)}
                                className="option-select"
                            >
                                <option value="none">{t('weapons.none') || 'None'}</option>
                                {FUNDAMENTAL_RUNES.striking.map(rune => (
                                    <option key={rune.value} value={rune.value}>
                                        {rune.nameIt || rune.name} (+{rune.diceBonus} die - Lvl {rune.level}, {rune.price} gp)
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Property Runes */}
                    <div className="options-section">
                        <h3>
                            {t('weapons.propertyRunes') || 'Property Runes'} ({propertyRunes.length}/{maxPropertyRunes})
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
                                + {t('weapons.addPropertyRune') || 'Add Property Rune'}
                            </button>
                        )}
                        {propertyRunes.length > 0 && (
                            <div className="rune-total-price">
                                <span className="rune-price-label">{t('weapons.totalPrice') || 'Total Price'}: </span>
                                <span className="rune-price-value">
                                    {propertyRunes.reduce((sum, runeId) => {
                                        const rune = getPropertyRuneData(runeId);
                                        return sum + (rune?.price || 0);
                                    }, 0)} gp
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Material & Physical Properties */}
                    <div className="options-section">
                        <h3>{t('weapons.materialPhysical') || 'Material & Physical'}</h3>

                        <div className="option-row">
                            <label>{t('weapons.material') || 'Material'}</label>
                            <select
                                value={material || 'none'}
                                onChange={(e) => setMaterial(e.target.value === 'none' ? undefined : e.target.value as SpecialMaterial)}
                                className="option-select"
                            >
                                <option value="none">{t('weapons.none') || 'None'}</option>
                                <option value="coldIron">{t('materials.coldIron') || 'Cold Iron'}</option>
                                <option value="silver">{t('materials.silver') || 'Silver'}</option>
                                <option value="adamantine">{t('materials.adamantine') || 'Adamantine'}</option>
                                <option value="orichalcum">{t('materials.orichalcum') || 'Orichalcum'}</option>
                                <option value="mithral">{t('materials.mithral') || 'Mithral'}</option>
                            </select>
                        </div>

                        <div className="option-row">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={isLarge}
                                    onChange={(e) => setIsLarge(e.target.checked)}
                                />
                                {t('weapons.isLarge') || 'Large Weapon'}
                            </label>
                        </div>

                        <div className="option-row">
                            <label>{t('weapons.bulkOverride') || 'Bulk Override'}</label>
                            <input
                                type="number"
                                value={bulkOverride ?? ''}
                                onChange={(e) => setBulkOverride(e.target.value ? parseInt(e.target.value) : undefined)}
                                placeholder={weapon.bulk.toString()}
                                className="option-input"
                                step="0.1"
                                min="0"
                            />
                        </div>
                    </div>

                    {/* Advanced Customization */}
                    <div className="options-section">
                        <h3>{t('weapons.advancedCustomization') || 'Advanced'}</h3>

                        <div className="option-row">
                            <label>{t('weapons.attackAbility') || 'Attack Ability'}</label>
                            <select
                                value={attackAbilityOverride}
                                onChange={(e) => setAttackAbilityOverride(e.target.value as AbilityOverride)}
                                className="option-select"
                            >
                                <option value="auto">{t('weapons.auto') || 'Auto (Default)'}</option>
                                <option value="str">STR</option>
                                <option value="dex">DEX</option>
                                <option value="con">CON</option>
                                <option value="int">INT</option>
                                <option value="wis">WIS</option>
                                <option value="cha">CHA</option>
                            </select>
                        </div>

                        <div className="option-row">
                            <label>{t('weapons.customName') || 'Custom Name'}</label>
                            <input
                                type="text"
                                value={customName}
                                onChange={(e) => setCustomName(e.target.value)}
                                placeholder={weapon.name}
                                className="option-input"
                            />
                        </div>

                        <div className="option-row">
                            <label>{t('weapons.bonusAttack') || 'Bonus Attack'}</label>
                            <input
                                type="number"
                                value={bonusAttack ?? ''}
                                onChange={(e) => setBonusAttack(e.target.value ? parseInt(e.target.value) : undefined)}
                                placeholder="+0"
                                className="option-input"
                            />
                        </div>

                        <div className="option-row">
                            <label>{t('weapons.bonusDamage') || 'Bonus Damage'}</label>
                            <input
                                type="number"
                                value={bonusDamage ?? ''}
                                onChange={(e) => setBonusDamage(e.target.value ? parseInt(e.target.value) : undefined)}
                                placeholder="+0"
                                className="option-input"
                            />
                        </div>

                        <div className="option-row">
                            <label>{t('weapons.customDamageType') || 'Custom Damage Type'}</label>
                            <input
                                type="text"
                                value={customDamageType}
                                onChange={(e) => setCustomDamageType(e.target.value)}
                                placeholder={weapon.damageType}
                                className="option-input"
                            />
                        </div>

                        <div className="option-row">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={criticalSpecialization}
                                    onChange={(e) => setCriticalSpecialization(e.target.checked)}
                                />
                                {t('weapons.criticalSpecialization') || 'Critical Specialization'}
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

export default WeaponOptionsModal;
