import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Character } from '../../types';
import { getWeapons, LoadedWeapon } from '../../data/pf2e-loader';
import { calculateWeaponAttack, calculateWeaponDamage } from '../../utils/pf2e-math';

interface WeaponsPanelProps {
    character: Character;
    onAddWeapon: () => void;
}

export const WeaponsPanel: React.FC<WeaponsPanelProps> = ({
    character,
    onAddWeapon,
}) => {
    const { t } = useLanguage();
    const [showBrowser, setShowBrowser] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<'all' | 'simple' | 'martial' | 'advanced'>('all');
    const [selectedWeapon, setSelectedWeapon] = useState<LoadedWeapon | null>(null);

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

    return (
        <div className="weapons-panel">
            <div className="panel-header">
                <h3>{t('tabs.weapons') || 'Weapons'}</h3>
                <button className="header-btn" onClick={() => setShowBrowser(true)}>
                    + {t('actions.addWeapon') || 'Add Weapon'}
                </button>
            </div>

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

                        // Calculate attack bonuses with MAP
                        const [attack1, attack2, attack3] = calculateWeaponAttack(character, weapon);

                        // Calculate damage
                        const damage = calculateWeaponDamage(character, weapon, isTwoHanded);

                        // Check if has two-hand trait
                        const hasTwoHand = hasTwoHandTrait(weapon);

                        return (
                            <div key={item.id} className="weapon-card">
                                <div className="weapon-header">
                                    <span className="weapon-name">{weapon.name}</span>
                                    <div className="weapon-traits">
                                        {weapon.traits.map((trait: string) => (
                                            <span key={trait} className="weapon-trait">{trait}</span>
                                        ))}
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

                                    {/* Attack Buttons with MAP */}
                                    <div className="attack-buttons">
                                        <button
                                            className="attack-btn first-attack"
                                            title={t('weapons.firstAttack') || 'First Attack'}
                                        >
                                            {t('weapons.attack') || 'Attack'} {formatModifier(attack1)}
                                        </button>
                                        <button
                                            className="attack-btn second-attack"
                                            title={t('weapons.secondAttack') || 'Second Attack (MAP)'}
                                        >
                                            {formatModifier(attack2)}
                                        </button>
                                        <button
                                            className="attack-btn third-attack"
                                            title={t('weapons.thirdAttack') || 'Third Attack (MAP)'}
                                        >
                                            {formatModifier(attack3)}
                                        </button>
                                    </div>
                                </div>

                                <div className="weapon-stats">
                                    <div className="weapon-stat damage-stat">
                                        <span className="weapon-stat-label">
                                            {t('stats.damage') || 'Damage'}
                                        </span>
                                        <span className="weapon-stat-value">
                                            {damage} {weapon.damageType}
                                        </span>
                                    </div>
                                    <div className="weapon-stat">
                                        <span className="weapon-stat-label">
                                            {t('stats.hands') || 'Hands'}
                                        </span>
                                        <span className="weapon-stat-value">{weapon.hands}</span>
                                    </div>
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
                                    <button className="add-weapon-btn" onClick={() => {
                                        // TODO: Add weapon to character
                                        setShowBrowser(false);
                                        setSelectedWeapon(null);
                                    }}>
                                        + {t('actions.addToInventory') || 'Add to Inventory'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeaponsPanel;
