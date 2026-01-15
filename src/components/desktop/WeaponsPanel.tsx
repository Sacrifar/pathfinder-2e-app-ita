import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Character, EquippedItem } from '../../types';
import { getWeapons, LoadedWeapon } from '../../data/pf2e-loader';
import { calculateWeaponDamage } from '../../utils/pf2e-math';
import { WeaponOptionsModal } from './WeaponOptionsModal';
import { getTactics, type LoadedTactic } from '../../data/tactics';

interface WeaponsPanelProps {
    character: Character;
    onCharacterUpdate: (character: Character) => void;
}

export const WeaponsPanel: React.FC<WeaponsPanelProps> = ({
    character,
    onCharacterUpdate,
}) => {
    const { t } = useLanguage();
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

    // Load all weapons from pf2e data
    const allWeapons = useMemo(() => getWeapons(), []);

    // Filter weapons based on search and category
    const filteredWeapons = useMemo(() => {
        let weapons = allWeapons;

        // Filter by category
        if (categoryFilter !== 'all') {
            weapons = weapons.filter(w => w.category === categoryFilter);
        }

        // Filter by search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            weapons = weapons.filter(w =>
                w.name.toLowerCase().includes(q) ||
                w.traits.some(t => t.toLowerCase().includes(q)) ||
                w.group.toLowerCase().includes(q)
            );
        }

        return weapons.slice(0, 50); // Limit for performance
    }, [allWeapons, categoryFilter, searchQuery]);

    // Check if weapon has two-hand-d* trait
    const hasTwoHandTrait = (weapon: LoadedWeapon) => {
        return weapon.traits.some(t => t.startsWith('two-hand-d'));
    };

    // Toggle two-handed mode for a weapon
    const toggleTwoHand = (weaponId: string) => {
        setTwoHandedWeapons(prev => {
            const newSet = new Set(prev);
            if (newSet.has(weaponId)) {
                newSet.delete(weaponId);
            } else {
                newSet.add(weaponId);
            }
            return newSet;
        });
    };

    // Add weapon to character's inventory
    const handleAddWeapon = (weapon: LoadedWeapon) => {
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

            // Add the weapon to equipment
            onCharacterUpdate({
                ...character,
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

    // Open weapon options modal
    const handleOpenOptions = (weapon: LoadedWeapon, equippedItem: EquippedItem) => {
        setSelectedEquippedWeapon({ weapon, equippedItem });
        setShowOptionsModal(true);
    };

    // Save weapon options
    const handleSaveWeaponOptions = (updatedItem: EquippedItem) => {
        const currentEquipment = character.equipment || [];
        onCharacterUpdate({
            ...character,
            equipment: currentEquipment.map(item =>
                item.id === updatedItem.id ? updatedItem : item
            ),
        });
    };

    // Format modifier (e.g., -2, +5)
    const formatModifier = (value: number) => {
        return value >= 0 ? `+${value}` : `${value}`;
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
    const preparedTactics = useMemo(() => {
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

    // Get action symbol for tactics
    const getActionSymbol = (cost: LoadedTactic['cost']): string => {
        if (cost === 'free') return '◇';
        if (cost === 'reaction') return '↺';
        if (cost === '1') return '◆';
        if (cost === '2') return '◆◆';
        if (cost === '3') return '◆◆◆';
        return '◆';
    };

    return (
        <div className="weapons-panel">
            <div className="panel-header">
                <h3>{t('tabs.weapons') || 'Weapons'}</h3>
                <button className="header-btn" onClick={() => setShowBrowser(true)}>
                    + {t('actions.addWeapon') || 'Add Weapon'}
                </button>
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
                                                {getActionSymbol(tactic.cost)}
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
                        const damage = calculateWeaponDamage(character, weapon, isTwoHanded, item);

                        // Check if has two-hand trait
                        const hasTwoHand = hasTwoHandTrait(weapon);

                        // Get custom name if set
                        const displayName = item.customization?.customName || weapon.name;

                        return (
                            <div key={item.id} className="weapon-card">
                                {/* Header with name, options button, and remove button */}
                                <div className="weapon-header">
                                    <div className="weapon-title-section">
                                        <span className="weapon-name">{displayName}</span>
                                        <button
                                            className="weapon-options-btn"
                                            onClick={() => handleOpenOptions(weapon, item)}
                                            title={t('weapons.options') || 'Weapon Options'}
                                        >
                                            ⚙️
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

                                {/* Attack section */}
                                <div className="weapon-attack-section">
                                    <div className="attack-label">{t('weapons.attack') || 'Attack'}</div>
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

                                        {/* Main Attack Button - rolls dice */}
                                        <button
                                            className="attack-btn main-attack"
                                            title={t('weapons.rollAttack') || 'Roll Attack'}
                                        >
                                            🎲
                                        </button>

                                        {/* MAP Attack Buttons - show only numbers */}
                                        <div className="attack-buttons">
                                            <button
                                                className="attack-btn map-attack"
                                                title={t('weapons.secondAttack') || 'Second Attack (MAP)'}
                                            >
                                                2
                                            </button>
                                            <button
                                                className="attack-btn map-attack"
                                                title={t('weapons.thirdAttack') || 'Third Attack (MAP)'}
                                            >
                                                3
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Damage and stats section */}
                                <div className="weapon-stats-section">
                                    <div className="weapon-stat-row">
                                        <span className="stat-label">{t('stats.damage') || 'Damage'}:</span>
                                        <span className="stat-value">{damage} {item.customization?.customDamageType || weapon.damageType}</span>
                                    </div>
                                    <div className="weapon-stat-row">
                                        <span className="stat-label">{t('stats.hands') || 'Hands'}:</span>
                                        <span className="stat-value">{weapon.hands}</span>
                                    </div>
                                    {/* Critical Specialization Effect */}
                                    {item.customization?.criticalSpecialization && (
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
                                    <button className="add-weapon-btn" onClick={() => handleAddWeapon(selectedWeapon)}>
                                        + {t('actions.addToInventory') || 'Add to Inventory'}
                                    </button>
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
                />
            )}
        </div>
    );
};

export default WeaponsPanel;
