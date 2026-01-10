import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Character, Proficiency } from '../../types';
import { getWeapons, LoadedWeapon } from '../../data/pf2e-loader';

interface WeaponDisplay {
    id: string;
    name: string;
    attackBonus: number;
    damage: string;
    damageType: string;
    traits: string[];
    hands: 1 | 2;
}

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

    // Get proficiency bonus
    const getProficiencyBonus = (prof: Proficiency, level: number) => {
        switch (prof) {
            case 'trained': return 2 + level;
            case 'expert': return 4 + level;
            case 'master': return 6 + level;
            case 'legendary': return 8 + level;
            default: return 0;
        }
    };

    // Calculate attack bonus for a weapon
    const calculateAttackBonus = (weaponCategory: string) => {
        const strMod = Math.floor((character.abilityScores.str - 10) / 2);
        const dexMod = Math.floor((character.abilityScores.dex - 10) / 2);

        // Find weapon proficiency
        const profEntry = character.weaponProficiencies.find(
            p => p.category === weaponCategory || p.category === 'all'
        );
        const proficiency = profEntry?.proficiency || 'untrained';
        const profBonus = getProficiencyBonus(proficiency, character.level || 1);

        // Use DEX for finesse/ranged, STR otherwise
        const abilityMod = Math.max(strMod, dexMod);

        return abilityMod + profBonus;
    };

    // Parse equipped weapons
    const equippedWeapons: WeaponDisplay[] = character.equipment
        .filter(item => item.wielded)
        .map(item => ({
            id: item.id,
            name: item.name,
            attackBonus: calculateAttackBonus('martial'),
            damage: '1d8',
            damageType: 'slashing',
            traits: [],
            hands: item.wielded?.hands || 1,
        }));

    const formatModifier = (value: number) => {
        return value >= 0 ? `+${value}` : `${value}`;
    };

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
                    {equippedWeapons.map(weapon => (
                        <div key={weapon.id} className="weapon-card">
                            <div className="weapon-header">
                                <span className="weapon-name">{weapon.name}</span>
                                <div className="weapon-traits">
                                    {weapon.traits.map(trait => (
                                        <span key={trait} className="weapon-trait">{trait}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="weapon-stats">
                                <div className="weapon-stat">
                                    <span className="weapon-stat-label">
                                        {t('stats.attack') || 'Attack'}
                                    </span>
                                    <span className="weapon-stat-value attack-bonus">
                                        {formatModifier(weapon.attackBonus)}
                                    </span>
                                </div>
                                <div className="weapon-stat">
                                    <span className="weapon-stat-label">
                                        {t('stats.damage') || 'Damage'}
                                    </span>
                                    <span className="weapon-stat-value">
                                        {weapon.damage} {weapon.damageType}
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
                    ))}
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
