import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Character, EquippedItem, StrikingRune, SpecialMaterial, AbilityOverride, WeaponRunes, WeaponCustomization } from '../../types';
import { LoadedWeapon } from '../../data/pf2e-loader';
import {
    FUNDAMENTAL_RUNES,
    PROPERTY_RUNES,
    getMaxPropertyRunes,
} from '../../data/weaponRunes';
import { getAllMaterials } from '../../data/weaponMaterials';
import { canAfford, formatCurrency } from '../../utils/currency';
import { getEnhancedWeaponName } from '../../utils/weaponName';

// Sort runes by level and name
const sortedPropertyRunes = Object.values(PROPERTY_RUNES).sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    return (a.nameIt || a.name).localeCompare(b.nameIt || b.name);
});

interface WeaponOptionsModalProps {
    character: Character;
    weapon: LoadedWeapon;
    equippedWeapon: EquippedItem;
    onClose: () => void;
    onSave: (updatedItem: EquippedItem) => void;
    onBuyRunes?: (updatedItem: EquippedItem, costGp: number) => void;
}

export const WeaponOptionsModal: React.FC<WeaponOptionsModalProps> = ({
    character,
    weapon,
    equippedWeapon,
    onClose,
    onSave,
    onBuyRunes,
}) => {
    const { t, language } = useLanguage();

    // Cast runes and customization to weapon-specific types
    const weaponRunes = equippedWeapon.runes as WeaponRunes | undefined;
    const weaponCustomization = equippedWeapon.customization as WeaponCustomization | undefined;

    // Local state for form fields
    const [potencyRune, setPotencyRune] = useState<number>(weaponRunes?.potencyRune || 0);
    const [strikingRune, setStrikingRune] = useState<StrikingRune | undefined>(weaponRunes?.strikingRune);
    const [propertyRunes, setPropertyRunes] = useState<string[]>(weaponRunes?.propertyRunes || []);

    const [material, setMaterial] = useState<SpecialMaterial | undefined>(weaponCustomization?.material);
    const [isLarge, setIsLarge] = useState<boolean>(weaponCustomization?.isLarge || false);
    const [bulkOverride, setBulkOverride] = useState<number | undefined>(weaponCustomization?.bulkOverride);

    // Sync state with props when equippedWeapon changes
    useEffect(() => {
        const newWeaponRunes = equippedWeapon.runes as WeaponRunes | undefined;
        setPotencyRune(newWeaponRunes?.potencyRune || 0);
        setStrikingRune(newWeaponRunes?.strikingRune);
        setPropertyRunes(newWeaponRunes?.propertyRunes || []);
    }, [equippedWeapon.runes]);

    useEffect(() => {
        const newWeaponCustomization = equippedWeapon.customization as WeaponCustomization | undefined;
        setMaterial(newWeaponCustomization?.material);
        setIsLarge(newWeaponCustomization?.isLarge || false);
        setBulkOverride(newWeaponCustomization?.bulkOverride);
    }, [equippedWeapon.customization]);

    // Calculate cost of new runes
    const runeCost = useMemo(() => {
        let cost = 0;

        // Potency rune cost
        const oldPotency = weaponRunes?.potencyRune || 0;
        if (potencyRune > oldPotency) {
            const potencyRuneData = FUNDAMENTAL_RUNES.potency.find(r => r.value === potencyRune);
            const oldPotencyRuneData = FUNDAMENTAL_RUNES.potency.find(r => r.value === oldPotency);
            if (potencyRuneData) {
                cost += potencyRuneData.price - (oldPotencyRuneData?.price || 0);
            }
        }

        // Striking rune cost
        const strikingRuneOrder = ['striking', 'greaterStriking', 'majorStriking'];
        const oldStrikingIndex = weaponRunes?.strikingRune ? strikingRuneOrder.indexOf(weaponRunes.strikingRune) : -1;
        const newStrikingIndex = strikingRune ? strikingRuneOrder.indexOf(strikingRune) : -1;
        if (newStrikingIndex > oldStrikingIndex) {
            const strikingRuneData = FUNDAMENTAL_RUNES.striking.find(r => r.value === strikingRune);
            const oldStrikingRuneData = weaponRunes?.strikingRune ? FUNDAMENTAL_RUNES.striking.find(r => r.value === weaponRunes.strikingRune) : null;
            if (strikingRuneData) {
                cost += strikingRuneData.price - (oldStrikingRuneData?.price || 0);
            }
        }

        // Property runes cost (newly added ones only)
        const oldPropertyRunes = weaponRunes?.propertyRunes || [];
        const newPropertyRunes = propertyRunes.filter(r => !oldPropertyRunes.includes(r));
        for (const runeId of newPropertyRunes) {
            const rune = PROPERTY_RUNES[runeId];
            if (rune) cost += rune.price;
        }

        return cost;
    }, [potencyRune, strikingRune, propertyRunes, weaponRunes]);

    // Get all property runes sorted by level
    const allPropertyRunes = useMemo(() => {
        return Object.values(PROPERTY_RUNES).sort((a, b) => {
            if (a.level !== b.level) return a.level - b.level;
            return (a.nameIt || a.name).localeCompare(b.nameIt || b.name);
        });
    }, []);

    const maxPropertyRunes = useMemo(() => {
        return getMaxPropertyRunes(potencyRune);
    }, [potencyRune]);

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

    // Filter runes by search
    const [runeSearch, setRuneSearch] = useState('');
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

    // Get all available materials sorted by level
    const availableMaterials = useMemo(() => {
        return getAllMaterials();
    }, []);

    const [attackAbilityOverride, setAttackAbilityOverride] = useState<AbilityOverride>(
        weaponCustomization?.attackAbilityOverride || 'auto'
    );
    const [customName, setCustomName] = useState<string>(weaponCustomization?.customName || '');
    const [bonusAttack, setBonusAttack] = useState<number | undefined>(weaponCustomization?.bonusAttack);
    const [bonusDamage, setBonusDamage] = useState<number | undefined>(weaponCustomization?.bonusDamage);
    const [customDamageType, setCustomDamageType] = useState<string>(weaponCustomization?.customDamageType || '');

    const [criticalSpecialization, setCriticalSpecialization] = useState<boolean>(
        weaponCustomization?.criticalSpecialization || false
    );

    // Calculate dynamic weapon name that updates as user modifies runes
    const dynamicWeaponName = useMemo(() => {
        // If user has set a custom name, use it
        if (customName) return customName;

        // Otherwise, generate enhanced name with current rune selections
        const currentRunes: WeaponRunes = {
            potencyRune: potencyRune > 0 ? potencyRune : undefined,
            strikingRune: strikingRune,
            propertyRunes: propertyRunes.length > 0 ? propertyRunes : undefined,
        };

        const currentCustomization: WeaponCustomization = {
            material: material,
        };

        return getEnhancedWeaponName(weapon.name, currentRunes, currentCustomization, { language });
    }, [customName, weapon.name, potencyRune, strikingRune, propertyRunes, material, language]);

    const handleSaveGive = () => {
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

    const handleSaveBuy = () => {
        // Check if character can afford the runes
        if (!canAfford(character, runeCost)) {
            alert(`${t('errors.insufficientFunds') || 'Insufficient funds'}: ${formatCurrency(character.currency)} < ${runeCost} gp`);
            return;
        }

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
                        {dynamicWeaponName} - {t('weapons.options') || 'Weapon Options'}
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
                                                {language === 'it' && rune.nameIt ? rune.nameIt : rune.name} (+{rune.diceBonus} die - Lvl {rune.level}, {rune.price} gp)
                                            </option>
                                        ))}
                                    </select>
                                </div>
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
                                        {availableMaterials.map(mat => (
                                            <option key={mat.id} value={mat.id}>
                                                {language === 'it' && mat.nameIt ? mat.nameIt : mat.name} {mat.price > 0 ? `(Lvl ${mat.level}, ${mat.price} gp)` : `(Standard)`}
                                            </option>
                                        ))}
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
                        </div>

                        {/* Right Column - Property Runes */}
                        <div className="modal-column-right">
                            <div className="options-section options-section-full">
                                <h3>
                                    {t('weapons.propertyRunes') || 'Property Runes'} ({propertyRunes.length}/{maxPropertyRunes})
                                </h3>

                                {/* Selected Runes Summary */}
                                {propertyRunes.length > 0 && (
                                    <div className="selected-runes-summary">
                                        <strong>{t('weapons.selected') || 'Selected'}:</strong>
                                        {propertyRunes.map(runeId => {
                                            const rune = PROPERTY_RUNES[runeId];
                                            if (!rune) return null;
                                            return (
                                                <span key={runeId} className="selected-rune-tag">
                                                    {language === 'it' && rune.nameIt ? rune.nameIt : rune.name}
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
                                            {t('weapons.totalPrice') || 'Total Price'}: {propertyRunes.reduce((sum, runeId) => sum + (PROPERTY_RUNES[runeId]?.price || 0), 0)} gp
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
                                                            {language === 'it' && rune.nameIt ? rune.nameIt : rune.name}
                                                        </span>
                                                        <span className="rune-meta">
                                                            Lvl {rune.level} • {rune.price} gp • {rune.rarity}
                                                            {rune.damage && ` • ${rune.damage.dice} ${rune.damage.type}`}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="rune-description">
                                                    {language === 'it' && rune.descriptionIt ? rune.descriptionIt : rune.description}
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

export default WeaponOptionsModal;
