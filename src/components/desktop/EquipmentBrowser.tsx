import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { LoadedArmor, LoadedShield, LoadedGear, getArmor, getShields, getGear } from '../../data/pf2e-loader';

interface EquipmentBrowserProps {
    onClose: () => void;
    onEquipArmor: (armor: LoadedArmor) => void;
    onEquipShield: (shield: LoadedShield) => void;
    onEquipGear: (gear: LoadedGear) => void;
    initialTab?: 'armor' | 'shield' | 'gear';
}

type Tab = 'armor' | 'shield' | 'gear';

export const EquipmentBrowser: React.FC<EquipmentBrowserProps> = ({ onClose, onEquipArmor, onEquipShield, onEquipGear, initialTab = 'armor' }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<Tab>(initialTab);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedArmor, setSelectedArmor] = useState<LoadedArmor | null>(null);
    const [selectedShield, setSelectedShield] = useState<LoadedShield | null>(null);
    const [selectedGear, setSelectedGear] = useState<LoadedGear | null>(null);
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [levelFilter, setLevelFilter] = useState<string>('all');

    // Load data
    const allArmor = useMemo(() => getArmor(), []);
    const allShields = useMemo(() => getShields(), []);
    const allGear = useMemo(() => getGear(), []);

    // Filter Logic
    const filteredItems = useMemo(() => {
        const query = searchQuery.toLowerCase();

        if (activeTab === 'armor') {
            return allArmor.filter(item => {
                const matchesSearch = item.name.toLowerCase().includes(query) ||
                    item.traits.some(t => t.toLowerCase().includes(query));
                const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
                const matchesLevel = levelFilter === 'all' || item.level === parseInt(levelFilter);
                return matchesSearch && matchesCategory && matchesLevel;
            });
        } else if (activeTab === 'shield') {
            return allShields.filter(item => {
                const matchesSearch = item.name.toLowerCase().includes(query) ||
                    item.traits.some(t => t.toLowerCase().includes(query));
                const matchesLevel = levelFilter === 'all' || item.level === parseInt(levelFilter);
                return matchesSearch && matchesLevel;
            });
        } else {
            // gear tab
            return allGear.filter(item => {
                const matchesSearch = item.name.toLowerCase().includes(query) ||
                    item.traits.some(t => t.toLowerCase().includes(query));
                const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
                const matchesLevel = levelFilter === 'all' || item.level === parseInt(levelFilter);
                return matchesSearch && matchesCategory && matchesLevel;
            });
        }
    }, [activeTab, searchQuery, categoryFilter, levelFilter, allArmor, allShields, allGear]);

    const handleEquip = () => {
        if (activeTab === 'armor' && selectedArmor) {
            onEquipArmor(selectedArmor);
            onClose();
        } else if (activeTab === 'shield' && selectedShield) {
            onEquipShield(selectedShield);
            onClose();
        } else if (activeTab === 'gear' && selectedGear) {
            onEquipGear(selectedGear);
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="feat-browser-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-content">
                    <div className="modal-header">
                        <h2>{t('browser.equipment') || 'Equipment Browser'}</h2>
                        <button className="close-btn" onClick={onClose}>×</button>
                    </div>

                    <div className="browser-layout">
                        {/* LEFT PANEL: Filters & List */}
                        <div className="browser-list-column">
                            <div className="browser-filters">
                                <div className="search-bar">
                                    <span className="search-icon">🔍</span>
                                    <input
                                        type="text"
                                        placeholder={t('browser.search') || 'Search...'}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        autoFocus
                                    />
                                </div>

                                <div className="filter-tabs">
                                    <button
                                        className={`filter-tab ${activeTab === 'armor' ? 'active' : ''}`}
                                        onClick={() => { setActiveTab('armor'); setCategoryFilter('all'); }}
                                    >
                                        <span style={{ marginRight: 8 }}>👕</span> {t('equipment.armor') || 'Armor'}
                                    </button>
                                    <button
                                        className={`filter-tab ${activeTab === 'shield' ? 'active' : ''}`}
                                        onClick={() => { setActiveTab('shield'); setCategoryFilter('all'); }}
                                    >
                                        <span style={{ marginRight: 8 }}>🛡️</span> {t('equipment.shield') || 'Shield'}
                                    </button>
                                    <button
                                        className={`filter-tab ${activeTab === 'gear' ? 'active' : ''}`}
                                        onClick={() => { setActiveTab('gear'); setCategoryFilter('all'); }}
                                    >
                                        <span style={{ marginRight: 8 }}>🎒</span> {t('equipment.gear') || 'Gear'}
                                    </button>
                                </div>

                                <div className="filter-row">
                                    {activeTab === 'armor' && (
                                        <select
                                            value={categoryFilter}
                                            onChange={(e) => setCategoryFilter(e.target.value)}
                                            className="filter-select"
                                        >
                                            <option value="all">All Categories</option>
                                            <option value="light">Light</option>
                                            <option value="medium">Medium</option>
                                            <option value="heavy">Heavy</option>
                                            <option value="unarmored">Unarmored</option>
                                        </select>
                                    )}
                                    {activeTab === 'gear' && (
                                        <select
                                            value={categoryFilter}
                                            onChange={(e) => setCategoryFilter(e.target.value)}
                                            className="filter-select"
                                        >
                                            <option value="all">All Categories</option>
                                            <option value="equipment">Adventuring Gear</option>
                                            <option value="consumable">Consumables</option>
                                            <option value="treasure">Treasure</option>
                                            <option value="backpack">Containers</option>
                                            <option value="kit">Kits</option>
                                        </select>
                                    )}
                                    <select
                                        value={levelFilter}
                                        onChange={(e) => setLevelFilter(e.target.value)}
                                        className="filter-select"
                                    >
                                        <option value="all">All Levels</option>
                                        {[...Array(21).keys()].map(l => (
                                            <option key={l} value={l}>Level {l}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="browser-list">
                                {filteredItems.map((item: LoadedArmor | LoadedShield | LoadedGear) => {
                                    const isSelected = activeTab === 'armor'
                                        ? (selectedArmor?.id === item.id)
                                        : activeTab === 'shield'
                                        ? (selectedShield?.id === item.id)
                                        : (selectedGear?.id === item.id);

                                    return (
                                        <div
                                            key={item.id}
                                            className={`feat-list-item ${isSelected ? 'selected' : ''}`}
                                            onClick={() => {
                                                if (activeTab === 'armor') setSelectedArmor(item as LoadedArmor);
                                                else if (activeTab === 'shield') setSelectedShield(item as LoadedShield);
                                                else setSelectedGear(item as LoadedGear);
                                            }}
                                        >
                                            <div className="feat-item-header">
                                                <span className="feat-item-name">{item.name}</span>
                                                <span className="feat-item-level">Lvl {item.level}</span>
                                            </div>
                                            <div className="feat-item-meta">
                                                <span className="feat-item-category">
                                                    {activeTab === 'armor'
                                                        ? (item as LoadedArmor).category
                                                        : activeTab === 'shield'
                                                        ? 'Shield'
                                                        : (item as LoadedGear).category}
                                                </span>
                                                <span className="feat-item-cost">
                                                    {item.priceGp} gp
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* RIGHT PANEL: Details */}
                        <div className="browser-detail-column">
                            {(activeTab === 'armor' ? selectedArmor : activeTab === 'shield' ? selectedShield : selectedGear) ? (
                                <div className="feat-detail-panel">
                                    <div className="feat-detail-header">
                                        <h3>{activeTab === 'armor' ? selectedArmor?.name : activeTab === 'shield' ? selectedShield?.name : selectedGear?.name}</h3>
                                        <div className="feat-badges">
                                            <span className={`rarity-badge ${(activeTab === 'armor' ? selectedArmor : activeTab === 'shield' ? selectedShield : selectedGear)?.rarity}`}>
                                                {(activeTab === 'armor' ? selectedArmor : activeTab === 'shield' ? selectedShield : selectedGear)?.rarity}
                                            </span>
                                            <span className="level-badge">
                                                Level {(activeTab === 'armor' ? selectedArmor : activeTab === 'shield' ? selectedShield : selectedGear)?.level}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="feat-traits">
                                        {(activeTab === 'armor' ? selectedArmor : activeTab === 'shield' ? selectedShield : selectedGear)?.traits.map(t => (
                                            <span key={t} className="trait-tag">{t}</span>
                                        ))}
                                    </div>

                                    <div className="equipment-stats-grid">
                                        <div className="stat-box">
                                            <label>Price</label>
                                            <span>{(activeTab === 'armor' ? selectedArmor : activeTab === 'shield' ? selectedShield : selectedGear)?.priceGp} gp</span>
                                        </div>
                                        <div className="stat-box">
                                            <label>Bulk</label>
                                            <span>{(activeTab === 'armor' ? selectedArmor : activeTab === 'shield' ? selectedShield : selectedGear)?.bulk}</span>
                                        </div>

                                        {activeTab === 'armor' && selectedArmor && (
                                            <>
                                                <div className="stat-box">
                                                    <label>AC Bonus</label>
                                                    <span>+{selectedArmor.acBonus}</span>
                                                </div>
                                                <div className="stat-box">
                                                    <label>Speed Pen.</label>
                                                    <span>{selectedArmor.speedPenalty} ft</span>
                                                </div>
                                                <div className="stat-box">
                                                    <label>Dex Cap</label>
                                                    <span>{selectedArmor.dexCap === 99 ? '-' : selectedArmor.dexCap}</span>
                                                </div>
                                                <div className="stat-box">
                                                    <label>Check Pen.</label>
                                                    <span>{selectedArmor.checkPenalty}</span>
                                                </div>
                                                <div className="stat-box">
                                                    <label>Strength</label>
                                                    <span>{selectedArmor.strength || '-'}</span>
                                                </div>
                                                <div className="stat-box">
                                                    <label>Group</label>
                                                    <span>{selectedArmor.group || '-'}</span>
                                                </div>
                                            </>
                                        )}

                                        {activeTab === 'shield' && selectedShield && (
                                            <>
                                                <div className="stat-box">
                                                    <label>AC Bonus</label>
                                                    <span>+{selectedShield.acBonus}</span>
                                                </div>
                                                <div className="stat-box">
                                                    <label>Hardness</label>
                                                    <span>{selectedShield.hardness}</span>
                                                </div>
                                                <div className="stat-box">
                                                    <label>HP (BT)</label>
                                                    <span>{selectedShield.hp} ({Math.floor(selectedShield.hp / 2)})</span>
                                                </div>
                                                <div className="stat-box">
                                                    <label>Speed Pen.</label>
                                                    <span>{selectedShield.speedPenalty} ft</span>
                                                </div>
                                            </>
                                        )}

                                        {activeTab === 'gear' && selectedGear && (
                                            <>
                                                <div className="stat-box">
                                                    <label>Category</label>
                                                    <span style={{ textTransform: 'capitalize' }}>{selectedGear.category}</span>
                                                </div>
                                                <div className="stat-box">
                                                    <label>Quantity</label>
                                                    <span>{selectedGear.qty || 1}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div
                                        className="feat-description"
                                        dangerouslySetInnerHTML={{ __html: (activeTab === 'armor' ? selectedArmor?.rawDescription : activeTab === 'shield' ? selectedShield?.rawDescription : selectedGear?.rawDescription) || '' }}
                                    />

                                    <div className="feat-actions">
                                        <button className="add-feat-btn" onClick={handleEquip}>
                                            {t('actions.equip') || 'Equip'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <p>{t('browser.selectItem') || 'Select an item to view details'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
