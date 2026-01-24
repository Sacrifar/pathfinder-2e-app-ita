import React, { useState, useMemo, useCallback } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useDiceRoller } from '../../hooks/useDiceRoller';
import { Character, EquippedItem, WeaponCustomization, WeaponRunes } from '../../types';
import { getWeapons, LoadedWeapon } from '../../data/pf2e-loader';
import { getAbilityModifier, getWeaponProficiencyRank, calculateProficiencyBonusWithVariant, ProficiencyRank } from '../../utils/pf2e-math';
import { WeaponOptionsModal } from './WeaponOptionsModal';
import { getEnhancedWeaponName } from '../../utils/weaponName';
import { getTactics } from '../../data/tactics';
import { ActionIcon } from '../../utils/actionIcons';
import { WeaponRollData } from '../../types/dice';
import { canAfford, deductCurrency, formatCurrency } from '../../utils/currency';
import { calculateDamageBreakdown, formatDamageInline, getElementalRuneDisplays } from '../../utils/damageBreakdown';
import {
    calculateMAP,
    formatAttackWithMAP,
    hasTwoHandTrait,
} from '../../utils/weaponCalculations';
import { calculateWeaponDamage } from '../../utils/pf2e-math';
import { PROPERTY_RUNES } from '../../data/weaponRunes';

interface WeaponsPanelProps {
    character: Character;
    onCharacterUpdate: (character: Character) => void;
}

export const WeaponsPanel: React.FC<WeaponsPanelProps> = ({
    character,
    onCharacterUpdate,
}) => {
    const { t, language } = useLanguage();
    const { rollDice } = useDiceRoller();
    const [showBrowser, setShowBrowser] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<'all' | 'simple' | 'martial' | 'advanced'>('all');
    const [selectedWeapon, setSelectedWeapon] = useState<LoadedWeapon | null>(null);

    // Weapon Options Modal state
    const [showOptionsModal, setShowOptionsModal] = useState(false);
    const [selectedEquippedWeapon, setSelectedEquippedWeapon] = useState<{
        weapon: LoadedWeapon;
        equippedItem: EquippedItem;
    } | null>(null);

    // Track which weapons are two-handed (for two-hand-d* trait)
    const [twoHandedWeapons, setTwoHandedWeapons] = useState<Set<string>>(new Set());

    // No longer need expandedDamageBreakdown state - damage is shown inline

    // Load all weapons from pf2e data
    const allWeapons = useMemo(() => getWeapons(), []);

    // Filter weapons based on search and category (optimized with search normalization)
    const searchQueryNormalized = useMemo(() => searchQuery.toLowerCase().trim(), [searchQuery]);

    const filteredWeapons = useMemo(() => {
        let weapons = allWeapons;

        // Filter by category
        if (categoryFilter !== 'all') {
            weapons = weapons.filter(w => w.category === categoryFilter);
        }

        // Filter by search (optimized with pre-lowercased query)
        if (searchQueryNormalized) {
            weapons = weapons.filter(w =>
                w.name.toLowerCase().includes(searchQueryNormalized) ||
                w.traits.some(t => t.toLowerCase().includes(searchQueryNormalized)) ||
                w.group.toLowerCase().includes(searchQueryNormalized)
            );
        }

        return weapons.slice(0, 50); // Limit for performance
    }, [allWeapons, categoryFilter, searchQueryNormalized]);

    // Toggle handlers - optimized with useCallback to prevent unnecessary re-renders
    const toggleTwoHand = useCallback((weaponId: string) => {
        setTwoHandedWeapons(prev => {
            const newSet = new Set(prev);
            if (newSet.has(weaponId)) {
                newSet.delete(weaponId);
            } else {
                newSet.add(weaponId);
            }
            return newSet;
        });
    }, []);

    // toggleConditionalDamage is kept for elemental rune toggles

    const toggleConditionalDamage = useCallback((conditionalId: string) => {
        const currentActive = character.activeConditionalDamage || [];
        const isActive = currentActive.includes(conditionalId);
        const newActive = isActive
            ? currentActive.filter(id => id !== conditionalId)
            : [...currentActive, conditionalId];

        onCharacterUpdate({
            ...character,
            activeConditionalDamage: newActive,
        });
    }, [character.activeConditionalDamage, onCharacterUpdate]);

    // Memoized proficiency calculations for all weapon categories
    const proficiencyCalculations = useMemo(() => {
        const categories = ['simple', 'martial', 'advanced', 'unarmed'] as const;
        return categories.reduce((acc, category) => {
            const profRank = getWeaponProficiencyRank(character, category);
            const profBonus = calculateProficiencyBonusWithVariant(
                character.level,
                profRank,
                character.variantRules?.proficiencyWithoutLevel
            );
            acc[category] = { rank: profRank, bonus: profBonus };
            return acc;
        }, {} as Record<string, { rank: ProficiencyRank; bonus: number }>);
    }, [character.level, character.variantRules?.proficiencyWithoutLevel, character.weaponProficiencies]);

    // Calculate attack bonus for a weapon (optimized, uses memoized proficiency)
    const calculateAttackBonus = useCallback((weapon: LoadedWeapon, mapPenalty: number = 0): number => {
        const strMod = getAbilityModifier(character.abilityScores.str);
        const profData = proficiencyCalculations[weapon.category];
        const profBonus = profData?.bonus ?? 0;

        // Check for potency rune bonus
        let itemBonus = 0;
        const equippedWeapon = character.equipment?.find(e => e.id === weapon.id);
        if (equippedWeapon?.runes) {
            const runes = equippedWeapon.runes as WeaponRunes;
            // potencyRune is a number (1, 2, 3, 4, 5)
            if (runes.potencyRune && typeof runes.potencyRune === 'number') {
                itemBonus = runes.potencyRune;
            }
        }

        // Check for custom attack bonus
        const customBonus = (equippedWeapon?.customization as WeaponCustomization | undefined)?.bonusAttack || 0;

        return strMod + profBonus + itemBonus + customBonus - mapPenalty;
    }, [character.abilityScores.str, character.equipment, proficiencyCalculations]);

    // Get elemental damage from active property runes
    const getElementalDamage = useCallback((weaponRunes: WeaponRunes | undefined): string => {
        if (!weaponRunes?.propertyRunes) return '';

        const activeDamage = character.activeConditionalDamage || [];

        const elementalDamages: string[] = [];
        for (const runeId of weaponRunes.propertyRunes) {
            const runeData = PROPERTY_RUNES[runeId];
            if (runeData?.damage && activeDamage.includes(runeId)) {
                elementalDamages.push(runeData.damage.dice);
            }
        }

        return elementalDamages.length > 0 ? elementalDamages.join('+') : '';
    }, [character.activeConditionalDamage]);

    // Helper to get active elemental types from runes (for dice coloring)
    const getActiveElementalTypes = useCallback((weaponRunes: WeaponRunes | undefined): string[] => {
        if (!weaponRunes?.propertyRunes) return [];

        const activeDamage = character.activeConditionalDamage || [];

        const elementalTypes: string[] = [];
        for (const runeId of weaponRunes.propertyRunes) {
            const runeData = PROPERTY_RUNES[runeId];
            if (runeData?.damage && activeDamage.includes(runeId)) {
                const type = runeData.damage.type;
                if (['fire', 'cold', 'acid', 'electricity', 'sonic'].includes(type)) {
                    elementalTypes.push(type);
                }
            }
        }

        return elementalTypes;
    }, [character.activeConditionalDamage]);

    // Handle opening dicebox with weapon data (including active elemental damage)
    const handleOpenWeaponDiceBox = useCallback((weapon: LoadedWeapon, equippedItem: EquippedItem, isTwoHanded: boolean) => {
        const weaponRunes = equippedItem.runes as WeaponRunes | undefined;
        const weaponCustomization = equippedItem.customization as WeaponCustomization | undefined;

        // Get base damage
        const baseDamage = calculateWeaponDamage(character, weapon, isTwoHanded, {
            runes: weaponRunes,
            customization: weaponCustomization
        });

        // Get active elemental damage from runes
        const elementalDamage = getElementalDamage(weaponRunes);

        // Combine base damage with elemental damage
        const fullDamage = elementalDamage ? `${baseDamage}+${elementalDamage}` : baseDamage;

        const attackBonus = calculateAttackBonus(weapon, 0);
        const isAgile = weapon.traits.includes('agile');

        // Get active elemental types for dice coloring
        const activeElementalTypes = getActiveElementalTypes(weaponRunes);

        const weaponData: WeaponRollData = {
            weaponId: weapon.id,
            weaponName: weaponCustomization?.customName || weapon.name,
            damage: fullDamage,  // Store FULL damage including elemental runes
            damageType: weaponCustomization?.customDamageType || weapon.damageType,
            attackBonus: attackBonus,
            isTwoHanded: isTwoHanded,
            isAgile: isAgile,
            element: activeElementalTypes.length > 0 ? activeElementalTypes[0] : undefined,  // Legacy: single element for backward compatibility
            elementalTypes: activeElementalTypes.length > 0 ? activeElementalTypes : undefined,  // Array for per-die coloring
        };

        const rollContext: any = { weaponData };

        console.log('[WeaponsPanel] Opening dicebox:', {
            baseDamage,
            elementalDamage,
            fullDamage,
            activeElementalTypes,
            weaponData
        });

        rollDice('1d20', `${t('weapons.attack') || 'Attack'}: ${weaponData.weaponName}`, rollContext);
    }, [character, calculateAttackBonus, getElementalDamage, getActiveElementalTypes, rollDice, t]);

    // Handle damage roll - opens dicebox with weapon data and elemental damage
    const handleDamageRoll = useCallback((weapon: LoadedWeapon, equippedItem: EquippedItem, isTwoHanded: boolean) => {
        const weaponRunes = equippedItem.runes as WeaponRunes | undefined;
        const weaponCustomization = equippedItem.customization as WeaponCustomization | undefined;

        // Get base damage
        const baseDamage = calculateWeaponDamage(character, weapon, isTwoHanded, {
            runes: weaponRunes,
            customization: weaponCustomization
        });

        // Get active elemental damage from runes
        const elementalDamage = getElementalDamage(weaponRunes);

        // Combine base damage with elemental damage
        const fullDamage = elementalDamage ? `${baseDamage}+${elementalDamage}` : baseDamage;

        const attackBonus = calculateAttackBonus(weapon, 0);
        const isAgile = weapon.traits.includes('agile');

        // Get active elemental types for dice coloring
        const activeElementalTypes = getActiveElementalTypes(weaponRunes);

        const weaponData: WeaponRollData = {
            weaponId: weapon.id,
            weaponName: weaponCustomization?.customName || weapon.name,
            damage: fullDamage,  // Store FULL damage including elemental runes
            damageType: weaponCustomization?.customDamageType || weapon.damageType,
            attackBonus: attackBonus,
            isTwoHanded: isTwoHanded,
            isAgile: isAgile,
            element: activeElementalTypes.length > 0 ? activeElementalTypes[0] : undefined,  // Legacy: single element for backward compatibility
            elementalTypes: activeElementalTypes.length > 0 ? activeElementalTypes : undefined,  // Array for per-die coloring
        };

        const rollContext: any = { weaponData };

        console.log('[WeaponsPanel] Damage roll:', {
            baseDamage,
            elementalDamage,
            fullDamage,
            activeElementalTypes,
            weaponData
        });

        rollDice(fullDamage, `${t('weapons.damageRoll') || 'Damage'}: ${weaponData.weaponName}`, rollContext);
    }, [character, calculateAttackBonus, getElementalDamage, getActiveElementalTypes, rollDice, t]);

    // Add weapon to character's inventory (Give - free)
    const handleGiveWeapon = (weapon: LoadedWeapon) => {
        const currentEquipment = character.equipment || [];

        // Check if weapon already exists in equipment
        const existingWeapon = currentEquipment.find(item => item.id === weapon.id);
        if (existingWeapon) {
            // Weapon already exists, just wield it
            onCharacterUpdate({
                ...character,
                equipment: currentEquipment.map(item =>
                    item.id === weapon.id
                        ? { ...item, wielded: { hands: weapon.hands as 1 | 2 } }
                        : item
                ),
            });
        } else {
            // Create new equipment item from LoadedWeapon
            const newEquipmentItem = {
                id: weapon.id,
                name: weapon.name,
                bulk: weapon.bulk,
                invested: false,
                worn: false,
                wielded: { hands: weapon.hands as 1 | 2 },
            };

            // Add the weapon to equipment (free, no currency deduction)
            onCharacterUpdate({
                ...character,
                equipment: [...currentEquipment, newEquipmentItem],
            });
        }

        setShowBrowser(false);
        setSelectedWeapon(null);
    };

    // Buy weapon (deduct currency)
    const handleBuyWeapon = (weapon: LoadedWeapon) => {
        const costGp = weapon.priceGp;

        // Check if character can afford it
        if (!canAfford(character, costGp)) {
            alert(`${t('errors.insufficientFunds') || 'Insufficient funds'}: ${formatCurrency(character.currency)} < ${costGp} gp`);
            return;
        }

        // Deduct currency
        const newCurrency = deductCurrency(character, costGp);
        if (!newCurrency) {
            alert(`${t('errors.insufficientFunds') || 'Insufficient funds'}`);
            return;
        }

        const currentEquipment = character.equipment || [];

        // Check if weapon already exists in equipment
        const existingWeapon = currentEquipment.find(item => item.id === weapon.id);
        if (existingWeapon) {
            // Weapon already exists, just wield it
            onCharacterUpdate({
                ...character,
                currency: newCurrency,
                equipment: currentEquipment.map(item =>
                    item.id === weapon.id
                        ? { ...item, wielded: { hands: weapon.hands as 1 | 2 } }
                        : item
                ),
            });
        } else {
            // Create new equipment item from LoadedWeapon
            const newEquipmentItem = {
                id: weapon.id,
                name: weapon.name,
                bulk: weapon.bulk,
                invested: false,
                worn: false,
                wielded: { hands: weapon.hands as 1 | 2 },
            };

            // Add the weapon to equipment and deduct currency
            onCharacterUpdate({
                ...character,
                currency: newCurrency,
                equipment: [...currentEquipment, newEquipmentItem],
            });
        }

        setShowBrowser(false);
        setSelectedWeapon(null);
    };

    // Remove weapon from character's inventory
    const handleRemoveWeapon = (weaponId: string) => {
        const currentEquipment = character.equipment || [];
        onCharacterUpdate({
            ...character,
            equipment: currentEquipment.filter(item => item.id !== weaponId),
        });
    };

    // Stow weapon - remove wielded status but keep in inventory with enhanced name
    const handleStowWeapon = (weaponId: string) => {
        const currentEquipment = character.equipment || [];
        onCharacterUpdate({
            ...character,
            equipment: currentEquipment.map(item => {
                if (item.id === weaponId) {
                    // Get weapon data to generate enhanced name
                    const weapon = allWeapons.find(w => w.id === weaponId);
                    if (!weapon) return { ...item, wielded: undefined };

                    const weaponRunes = item.runes as WeaponRunes | undefined;
                    const weaponCustomization = item.customization as WeaponCustomization | undefined;

                    // Generate enhanced name with runes and materials
                    const enhancedName = weaponCustomization?.customName ||
                        getEnhancedWeaponName(weapon.name, weaponRunes, weaponCustomization, { language });

                    return {
                        ...item,
                        name: enhancedName,
                        wielded: undefined,
                    };
                }
                return item;
            }),
        });
    };

    // Open weapon options modal
    const handleOpenOptions = (weapon: LoadedWeapon, equippedItem: EquippedItem) => {
        setSelectedEquippedWeapon({ weapon, equippedItem });
        setShowOptionsModal(true);
    };

    // Save weapon options
    const handleSaveWeaponOptions = (updatedItem: EquippedItem) => {
        const currentEquipment = character.equipment || [];
        const weapon = allWeapons.find(w => w.id === updatedItem.id);
        if (!weapon) {
            // Weapon not found, just save the item as-is
            onCharacterUpdate({
                ...character,
                equipment: currentEquipment.map(item =>
                    item.id === updatedItem.id ? updatedItem : item
                ),
            });
            return;
        }

        const weaponRunes = updatedItem.runes as WeaponRunes | undefined;
        const weaponCustomization = updatedItem.customization as WeaponCustomization | undefined;

        // Generate enhanced name with runes and materials
        const enhancedName = weaponCustomization?.customName ||
            getEnhancedWeaponName(weapon.name, weaponRunes, weaponCustomization, { language });

        // Update the item with the enhanced name
        const itemWithEnhancedName = { ...updatedItem, name: enhancedName };

        onCharacterUpdate({
            ...character,
            equipment: currentEquipment.map(item =>
                item.id === updatedItem.id ? itemWithEnhancedName : item
            ),
        });
    };

    // Buy weapon runes (with currency deduction)
    const handleBuyRunes = (updatedItem: EquippedItem, costGp: number) => {
        const newCurrency = deductCurrency(character, costGp);
        if (!newCurrency) {
            alert(`${t('errors.insufficientFunds') || 'Insufficient funds'}`);
            return;
        }
        const currentEquipment = character.equipment || [];
        const weapon = allWeapons.find(w => w.id === updatedItem.id);
        if (!weapon) {
            // Weapon not found, just save the item as-is
            onCharacterUpdate({
                ...character,
                currency: newCurrency,
                equipment: currentEquipment.map(item =>
                    item.id === updatedItem.id ? updatedItem : item
                ),
            });
            return;
        }

        const weaponRunes = updatedItem.runes as WeaponRunes | undefined;
        const weaponCustomization = updatedItem.customization as WeaponCustomization | undefined;

        // Generate enhanced name with runes and materials
        const enhancedName = weaponCustomization?.customName ||
            getEnhancedWeaponName(weapon.name, weaponRunes, weaponCustomization, { language });

        // Update the item with the enhanced name
        const itemWithEnhancedName = { ...updatedItem, name: enhancedName };

        onCharacterUpdate({
            ...character,
            currency: newCurrency,
            equipment: currentEquipment.map(item =>
                item.id === updatedItem.id ? itemWithEnhancedName : item
            ),
        });
    };

    // Format modifier (e.g., -2, +5)
    const formatModifier = (value: number) => {
        return value >= 0 ? `+${value}` : `${value}`;
    };

    // Get proficiency display (name and value)
    const getProficiencyDisplay = (category: string) => {
        const profRank = getWeaponProficiencyRank(character, category);
        const profBonus = calculateProficiencyBonusWithVariant(
            character.level,
            profRank,
            character.variantRules?.proficiencyWithoutLevel
        );

        const profNames: Record<ProficiencyRank, string> = {
            [ProficiencyRank.Untrained]: t('proficiency.untrained') || 'Untrained',
            [ProficiencyRank.Trained]: t('proficiency.trained') || 'Trained',
            [ProficiencyRank.Expert]: t('proficiency.expert') || 'Expert',
            [ProficiencyRank.Master]: t('proficiency.master') || 'Master',
            [ProficiencyRank.Legendary]: t('proficiency.legendary') || 'Legendary',
        };

        // Include ability modifier in displayed value so players see their total attack bonus
        // Use STR for melee weapons, DEX for ranged
        const strMod = getAbilityModifier(character.abilityScores.str);
        const dexMod = getAbilityModifier(character.abilityScores.dex);

        // Use the higher of STR/DEX as a default display value
        // (Most weapon categories have both melee and ranged options)
        const abilityMod = Math.max(strMod, dexMod);

        const totalBonus = profBonus > 0 ? profBonus + abilityMod : 0;

        return {
            name: profNames[profRank],
            value: totalBonus
        };
    };

    // Get equipped weapons with full weapon data
    const equippedWeapons = useMemo(() => {
        // Parse equipment to get wielded weapons with their full data
        return character.equipment
            .filter(item => item.wielded)
            .map(item => {
                // Find the weapon definition from allWeapons
                const weaponDef = allWeapons.find(w => w.id === item.id);
                if (!weaponDef) return null;

                // Check if this weapon is in two-handed mode
                const isTwoHanded = twoHandedWeapons.has(item.id);

                return {
                    ...item,
                    weaponData: weaponDef,
                    isTwoHanded,
                };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null);
    }, [character.equipment, allWeapons, twoHandedWeapons]);

    // ===== COMMANDER TACTICS SELECTION =====
    const isCommander = character.classId === 'Oyee5Ds9uwYLEkD0'; // Commander class ID

    // Calculate max prepared tactics based on level
    const maxPreparedTactics = useMemo(() => {
        if (!isCommander) return 0;
        const level = character.level;
        if (level >= 19) return 6;
        if (level >= 15) return 5;
        if (level >= 7) return 4;
        return 3; // Level 1-6
    }, [isCommander, character.level]);

    // Get all known tactics for Commander
    const knownTactics = useMemo(() => {
        if (!isCommander) return [];
        const knownIds = character.tactics?.known || [];
        const allTactics = getTactics();
        return allTactics.filter(t => knownIds.includes(t.id));
    }, [isCommander, character.tactics?.known]);

    // Get currently prepared tactics
    const _preparedTactics = useMemo(() => {
        if (!isCommander) return [];
        const preparedIds = character.tactics?.prepared || [];
        return knownTactics.filter(t => preparedIds.includes(t.id));
    }, [isCommander, knownTactics, character.tactics?.prepared]);

    // Toggle tactic preparation
    const handleToggleTactic = (tacticId: string) => {
        const currentPrepared = character.tactics?.prepared || [];
        const isPrepared = currentPrepared.includes(tacticId);

        let newPrepared: string[];
        if (isPrepared) {
            // Remove from prepared
            newPrepared = currentPrepared.filter(id => id !== tacticId);
        } else {
            // Add to prepared if we have room
            if (currentPrepared.length >= maxPreparedTactics) return;
            newPrepared = [...currentPrepared, tacticId];
        }

        onCharacterUpdate({
            ...character,
            tactics: {
                ...character.tactics,
                known: character.tactics?.known || [],
                prepared: newPrepared,
            },
        });
    };

    return (
        <div className="weapons-panel">
            <div className="panel-header">
                <h3>{t('tabs.weapons') || 'Weapons'}</h3>
                <button className="header-btn" onClick={() => setShowBrowser(true)}>
                    + {t('actions.addWeapon') || 'Add Weapon'}
                </button>
            </div>

            {/* ===== WEAPON PROFICIENCIES ===== */}
            <div className="proficiencies-section">
                <h4>{t('proficiency.weaponProficiencies') || 'Weapon Proficiencies'}</h4>
                <div className="proficiencies-grid">
                    <div className="proficiency-item">
                        <span className="proficiency-label">{t('proficiency.simpleWeapons') || 'Simple Weapons'}</span>
                        <span className="proficiency-value">{getProficiencyDisplay('simple').name} ({formatModifier(getProficiencyDisplay('simple').value)})</span>
                    </div>
                    <div className="proficiency-item">
                        <span className="proficiency-label">{t('proficiency.martialWeapons') || 'Martial Weapons'}</span>
                        <span className="proficiency-value">{getProficiencyDisplay('martial').name} ({formatModifier(getProficiencyDisplay('martial').value)})</span>
                    </div>
                    <div className="proficiency-item">
                        <span className="proficiency-label">{t('proficiency.advancedWeapons') || 'Advanced Weapons'}</span>
                        <span className="proficiency-value">{getProficiencyDisplay('advanced').name} ({formatModifier(getProficiencyDisplay('advanced').value)})</span>
                    </div>
                    <div className="proficiency-item">
                        <span className="proficiency-label">{t('proficiency.unarmedAttacks') || 'Unarmed Attacks'}</span>
                        <span className="proficiency-value">{getProficiencyDisplay('unarmed').name} ({formatModifier(getProficiencyDisplay('unarmed').value)})</span>
                    </div>
                </div>
            </div>

            {/* ===== COMMANDER DAILY TACTICS ===== */}
            {isCommander && (
                <div className="commander-tactics-section">
                    <div className="section-header">
                        <h4>{t('commander.dailyTactics') || 'Daily Tactics'}</h4>
                        <span className="tactics-count">
                            {(character.tactics?.prepared || []).length} / {maxPreparedTactics}
                        </span>
                    </div>

                    {knownTactics.length === 0 ? (
                        <div className="empty-state-small">
                            <p>{t('commander.noKnownTactics') || 'No tactics selected yet. Go to level selection to choose your tactics.'}</p>
                        </div>
                    ) : (
                        <div className="tactics-slots">
                            {knownTactics.map(tactic => {
                                const isPrepared = (character.tactics?.prepared || []).includes(tactic.id);
                                return (
                                    <div
                                        key={tactic.id}
                                        className={`tactic-slot ${isPrepared ? 'prepared' : ''}`}
                                        onClick={() => handleToggleTactic(tactic.id)}
                                        title={tactic.name}
                                    >
                                        <div className="tactic-slot-header">
                                            <span className="tactic-slot-name">{tactic.name}</span>
                                            <span className="tactic-slot-action">
                                                <ActionIcon cost={tactic.cost} />
                                            </span>
                                        </div>
                                        <div className="tactic-slot-tier">
                                            {t(`commander.${tactic.tacticTier}`) || tactic.tacticTier}
                                        </div>
                                        <div className="tactic-slot-status">
                                            {isPrepared ? '✓' : '○'}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {equippedWeapons.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">⚔️</div>
                    <p>{t('builder.noWeapons') || 'No weapons equipped.'}</p>
                    <p className="empty-state-hint">
                        {t('builder.addWeaponHint') || 'Add a weapon to calculate attack bonuses.'}
                    </p>
                    <button className="add-btn" onClick={() => setShowBrowser(true)}>
                        + {t('actions.addWeapon') || 'Add Weapon'}
                    </button>
                </div>
            ) : (
                <div className="weapons-list">
                    {equippedWeapons.map(item => {
                        const weapon = item.weaponData;
                        const isTwoHanded = item.isTwoHanded;

                        // Calculate damage with equipped weapon data (runes, customization)
                        // Cast runes and customization to weapon-specific types
                        const weaponRunes = item.runes as WeaponRunes | undefined;
                        const weaponCustomization = item.customization as WeaponCustomization | undefined;
                        const damage = calculateWeaponDamage(character, weapon, isTwoHanded, { runes: weaponRunes, customization: weaponCustomization });

                        // Check if has two-hand trait
                        const hasTwoHand = hasTwoHandTrait(weapon);

                        // Calculate MAP values for display
                        const isAgile = weapon.traits.includes('agile');
                        const mapValues = calculateMAP(isAgile);
                        const baseAttackBonus = calculateAttackBonus(weapon, 0);
                        const attackWithMAP = formatAttackWithMAP(baseAttackBonus, mapValues);

                        // Get custom name if set, otherwise generate enhanced name with runes and materials
                        const displayName = weaponCustomization?.customName ||
                            getEnhancedWeaponName(weapon.name, weaponRunes, weaponCustomization, { language });

                        return (
                            <div key={item.id} className="weapon-card">
                                {/* Header with name, options button, stow button and remove button */}
                                <div className="weapon-header">
                                    <div className="weapon-title-section">
                                        <span className="weapon-name" title={weapon.name}>{displayName}</span>
                                        <button
                                            className="weapon-options-btn"
                                            onClick={() => handleOpenOptions(weapon, item)}
                                            title={t('weapons.options') || 'Weapon Options'}
                                        >
                                            ⚙️
                                        </button>
                                        <button
                                            className="stow-weapon-btn"
                                            onClick={() => handleStowWeapon(item.id)}
                                            title={t('actions.stow') || 'Stow'}
                                        >
                                            📦
                                        </button>
                                        <button
                                            className="remove-weapon-btn"
                                            onClick={() => handleRemoveWeapon(item.id)}
                                            title={t('actions.remove') || 'Remove'}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                    <div className="weapon-traits">
                                        {weapon.traits.map((trait: string) => (
                                            <span key={trait} className="weapon-trait">{trait}</span>
                                        ))}
                                    </div>
                                </div>

                                {/* Attack section with MAP display */}
                                <div className="weapon-attack-section">
                                    <div className="attack-info-row">
                                        <div className="attack-label">{t('weapons.attack') || 'Attack'}</div>
                                        <div className="attack-bonus-display">
                                            <span className="attack-bonus-label">{t('weapons.attackBonus') || 'Attack Bonus'}</span>
                                            <span className="attack-bonus-value">{attackWithMAP}</span>
                                            {isAgile && (
                                                <span className="agile-indicator" title={t('weapons.agileTrait') || 'Agile: Reduced MAP penalties'}>⚡</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="weapon-controls">
                                        {/* Two-Hand Toggle */}
                                        {hasTwoHand && (
                                            <button
                                                className={`two-hand-toggle ${isTwoHanded ? 'active' : ''}`}
                                                onClick={() => toggleTwoHand(item.id)}
                                                title={t('weapons.twoHandToggle') || 'Two-Hand Mode'}
                                            >
                                                {isTwoHanded ? '2H' : '1H'}
                                            </button>
                                        )}

                                        {/* Single Attack Button - opens dicebox with weapon actions */}
                                        <button
                                            className="attack-btn main-attack"
                                            onClick={() => handleOpenWeaponDiceBox(weapon, item, isTwoHanded)}
                                            title={`${t('weapons.rollAttack') || 'Roll Attack'}: +${baseAttackBonus}`}
                                        >
                                            <img src="/assets/icon_d20_orange_small.png" alt="D20" style={{ width: '20px', height: '20px' }} />
                                        </button>
                                    </div>
                                </div>

                                {/* Damage and stats section */}
                                <div className="weapon-stats-section">
                                    {/* Damage row - inline display with all components */}
                                    {(() => {
                                        const breakdown = calculateDamageBreakdown(
                                            character,
                                            weapon,
                                            isTwoHanded,
                                            item,
                                            character.activeConditionalDamage || []
                                        );
                                        const inlineDamage = formatDamageInline(breakdown, character.activeConditionalDamage || []);
                                        const elementalRunes = getElementalRuneDisplays(breakdown, character.activeConditionalDamage || []);

                                        return (
                                            <>
                                                <div className="weapon-stat-row damage-row">
                                                    <span className="stat-label">{t('stats.damage') || 'Damage'}:</span>
                                                    <span className="damage-value">{inlineDamage}</span>
                                                </div>

                                                {/* Elemental Rune Toggles */}
                                                {elementalRunes.length > 0 && (
                                                    <div className="elemental-runes-row">
                                                        {elementalRunes.map(rune => (
                                                            <label
                                                                key={rune.id}
                                                                className={`elemental-rune-toggle ${rune.isActive ? 'active' : ''}`}
                                                                title={language === 'it' ? rune.nameIt || rune.name : rune.name}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={rune.isActive}
                                                                    onChange={() => toggleConditionalDamage(rune.id)}
                                                                />
                                                                <span className={`rune-type ${rune.damageType}`}>
                                                                    {rune.dice} {rune.damageType}
                                                                </span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}


                                    {/* Critical Specialization Effect */}
                                    {(item.customization as WeaponCustomization | undefined)?.criticalSpecialization && (
                                        <div className="weapon-stat-row crit-spec-row">
                                            <span className="stat-label">{t('weapons.criticalSpecialization') || 'Crit Spec'}:</span>
                                            <span className="stat-value crit-spec-enabled">✓ Enabled</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Quick Attack Reference */}
            <div className="attack-reference">
                <h4>{t('reference.attackBonus') || 'Attack Bonus Reference'}</h4>
                <div className="reference-grid">
                    <div className="reference-item">
                        <span className="ref-label">STR mod</span>
                        <span className="ref-value">
                            {formatModifier(Math.floor((character.abilityScores.str - 10) / 2))}
                        </span>
                    </div>
                    <div className="reference-item">
                        <span className="ref-label">DEX mod</span>
                        <span className="ref-value">
                            {formatModifier(Math.floor((character.abilityScores.dex - 10) / 2))}
                        </span>
                    </div>
                    <div className="reference-item">
                        <span className="ref-label">{t('stats.level') || 'Level'}</span>
                        <span className="ref-value">{character.level || 1}</span>
                    </div>
                </div>
            </div>

            {/* Weapon Browser Modal */}
            {showBrowser && (
                <div className="modal-overlay" onClick={() => setShowBrowser(false)}>
                    <div className="weapon-browser-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{t('browser.weapons') || 'Weapon Browser'}</h3>
                            <button className="modal-close" onClick={() => setShowBrowser(false)}>×</button>
                        </div>

                        <div className="browser-filters">
                            <input
                                type="text"
                                placeholder={t('search.placeholder') || 'Search weapons...'}
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                            <div className="category-filters">
                                {(['all', 'simple', 'martial', 'advanced'] as const).map(cat => (
                                    <button
                                        key={cat}
                                        className={`filter-btn ${categoryFilter === cat ? 'active' : ''}`}
                                        onClick={() => setCategoryFilter(cat)}
                                    >
                                        {cat === 'all' ? t('filters.all') || 'All' : cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="browser-content">
                            <div className="weapon-list">
                                {filteredWeapons.map(weapon => (
                                    <div
                                        key={weapon.id}
                                        className={`weapon-list-item ${selectedWeapon?.id === weapon.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedWeapon(weapon)}
                                    >
                                        <span className="weapon-item-name">{weapon.name}</span>
                                        <span className="weapon-item-category">{weapon.category}</span>
                                        <span className="weapon-item-damage">{weapon.damage}</span>
                                    </div>
                                ))}
                            </div>

                            {selectedWeapon && (
                                <div className="weapon-detail">
                                    <h4>{selectedWeapon.name}</h4>
                                    <div className="weapon-detail-grid">
                                        <div className="detail-row">
                                            <span className="detail-label">Category</span>
                                            <span className="detail-value">{selectedWeapon.category}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Group</span>
                                            <span className="detail-value">{selectedWeapon.group}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Damage</span>
                                            <span className="detail-value">{selectedWeapon.damage} {selectedWeapon.damageType}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Hands</span>
                                            <span className="detail-value">{selectedWeapon.hands}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Price</span>
                                            <span className="detail-value">{selectedWeapon.priceGp} gp</span>
                                        </div>
                                        {selectedWeapon.range && (
                                            <div className="detail-row">
                                                <span className="detail-label">Range</span>
                                                <span className="detail-value">{selectedWeapon.range} ft</span>
                                            </div>
                                        )}
                                    </div>
                                    {selectedWeapon.traits.length > 0 && (
                                        <div className="weapon-traits-section">
                                            <span className="detail-label">Traits</span>
                                            <div className="traits-list">
                                                {selectedWeapon.traits.map(trait => (
                                                    <span key={trait} className="trait-tag">{trait}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <p className="weapon-description">{selectedWeapon.description}</p>
                                    <div className="weapon-action-buttons">
                                        <button
                                            className="buy-weapon-btn"
                                            onClick={() => handleBuyWeapon(selectedWeapon)}
                                            disabled={!canAfford(character, selectedWeapon.priceGp)}
                                            title={`${t('actions.buy') || 'Buy'}: ${selectedWeapon.priceGp} gp`}
                                        >
                                            💰 {t('actions.buy') || 'Buy'} ({selectedWeapon.priceGp} gp)
                                        </button>
                                        <button
                                            className="give-weapon-btn"
                                            onClick={() => handleGiveWeapon(selectedWeapon)}
                                            title={t('actions.give') || 'Give (Free)'}
                                        >
                                            🎁 {t('actions.give') || 'Give'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Weapon Options Modal */}
            {showOptionsModal && selectedEquippedWeapon && (
                <WeaponOptionsModal
                    character={character}
                    weapon={selectedEquippedWeapon.weapon}
                    equippedWeapon={selectedEquippedWeapon.equippedItem}
                    onClose={() => setShowOptionsModal(false)}
                    onSave={handleSaveWeaponOptions}
                    onBuyRunes={handleBuyRunes}
                />
            )}
        </div>
    );
};

export default WeaponsPanel;
