import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Character } from '../../types';
import { getSpells, LoadedSpell } from '../../data/pf2e-loader';

interface SpellsPanelProps {
    character: Character;
    onCastSpell: (spellId: string) => void;
    onAddSpell: () => void;
}

export const SpellsPanel: React.FC<SpellsPanelProps> = ({
    character,
    onCastSpell,
    onAddSpell,
}) => {
    const { t } = useLanguage();
    const [showBrowser, setShowBrowser] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [rankFilter, setRankFilter] = useState<number | 'all'>('all');
    const [traditionFilter, setTraditionFilter] = useState<string>('all');
    const [selectedSpell, setSelectedSpell] = useState<LoadedSpell | null>(null);

    // Load all spells from pf2e data
    const allSpells = useMemo(() => getSpells(), []);

    // Filter spells
    const filteredSpells = useMemo(() => {
        let spells = allSpells;

        // Filter by rank
        if (rankFilter !== 'all') {
            spells = spells.filter(s => s.rank === rankFilter);
        }

        // Filter by tradition
        if (traditionFilter !== 'all') {
            spells = spells.filter(s => s.traditions.includes(traditionFilter));
        }

        // Filter by search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            spells = spells.filter(s =>
                s.name.toLowerCase().includes(q) ||
                s.traits.some(t => t.toLowerCase().includes(q))
            );
        }

        return spells.slice(0, 50); // Limit for performance
    }, [allSpells, rankFilter, traditionFilter, searchQuery]);

    // Check if character has spellcasting
    if (!character.spellcasting) {
        return (
            <div className="spells-panel">
                <div className="panel-header">
                    <h3>{t('tabs.spells') || 'Spells'}</h3>
                    <button className="header-btn" onClick={() => setShowBrowser(true)}>
                        📖 {t('actions.browseSpells') || 'Browse Spells'}
                    </button>
                </div>
                <div className="empty-state">
                    <div className="empty-state-icon">✨</div>
                    <p>{t('builder.noSpellcasting') || 'This character is not a spellcaster.'}</p>
                    <button className="add-btn" onClick={() => setShowBrowser(true)}>
                        📖 {t('actions.browseSpells') || 'Browse Spell Database'}
                    </button>
                </div>

                {/* Spell Browser Modal */}
                {showBrowser && renderSpellBrowser()}
            </div>
        );
    }

    const { spellcasting } = character;

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

    // Calculate spell attack and DC
    const keyAbilityScore = character.abilityScores[spellcasting.keyAbility];
    const keyMod = Math.floor((keyAbilityScore - 10) / 2);
    const profBonus = getProficiencyBonus(spellcasting.proficiency, character.level || 1);
    const spellAttack = keyMod + profBonus;
    const spellDC = 10 + keyMod + profBonus;

    const formatModifier = (value: number) => {
        return value >= 0 ? `+${value}` : `${value}`;
    };

    // Spell slots display
    const slotLevels = Object.keys(spellcasting.spellSlots || {}).map(Number).sort((a, b) => a - b);

    function renderSpellBrowser() {
        return (
            <div className="modal-overlay" onClick={() => setShowBrowser(false)}>
                <div className="spell-browser-modal" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h3>{t('browser.spells') || 'Spell Browser'}</h3>
                        <button className="modal-close" onClick={() => setShowBrowser(false)}>×</button>
                    </div>

                    <div className="browser-filters">
                        <input
                            type="text"
                            placeholder={t('search.placeholder') || 'Search spells...'}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                        <div className="filter-row">
                            <div className="rank-filters">
                                <button
                                    className={`filter-btn ${rankFilter === 'all' ? 'active' : ''}`}
                                    onClick={() => setRankFilter('all')}
                                >
                                    All
                                </button>
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rank => (
                                    <button
                                        key={rank}
                                        className={`filter-btn rank-btn ${rankFilter === rank ? 'active' : ''}`}
                                        onClick={() => setRankFilter(rank)}
                                    >
                                        {rank === 0 ? 'C' : rank}
                                    </button>
                                ))}
                            </div>
                            <div className="tradition-filters">
                                {['all', 'arcane', 'divine', 'occult', 'primal'].map(trad => (
                                    <button
                                        key={trad}
                                        className={`filter-btn tradition-btn ${traditionFilter === trad ? 'active' : ''}`}
                                        onClick={() => setTraditionFilter(trad)}
                                    >
                                        {trad === 'all' ? 'All' : trad}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="browser-content">
                        <div className="spell-list">
                            {filteredSpells.map(spell => (
                                <div
                                    key={spell.id}
                                    className={`spell-list-item ${selectedSpell?.id === spell.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedSpell(spell)}
                                >
                                    <span className="spell-item-rank">{spell.rank === 0 ? 'C' : spell.rank}</span>
                                    <span className="spell-item-name">{spell.name}</span>
                                    <div className="spell-item-traditions">
                                        {spell.traditions.map(trad => (
                                            <span key={trad} className={`tradition-dot ${trad}`} title={trad} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {selectedSpell && (
                            <div className="spell-detail">
                                <div className="spell-detail-header">
                                    <h4>{selectedSpell.name}</h4>
                                    <span className="spell-rank-badge">
                                        {selectedSpell.rank === 0 ? 'Cantrip' : `Rank ${selectedSpell.rank}`}
                                    </span>
                                </div>
                                <div className="spell-traditions-row">
                                    {selectedSpell.traditions.map(trad => (
                                        <span key={trad} className={`tradition-tag ${trad}`}>{trad}</span>
                                    ))}
                                </div>
                                <div className="spell-detail-grid">
                                    <div className="detail-row">
                                        <span className="detail-label">Cast</span>
                                        <span className="detail-value">{selectedSpell.castTime} actions</span>
                                    </div>
                                    {selectedSpell.range && (
                                        <div className="detail-row">
                                            <span className="detail-label">Range</span>
                                            <span className="detail-value">{selectedSpell.range}</span>
                                        </div>
                                    )}
                                    {selectedSpell.area && (
                                        <div className="detail-row">
                                            <span className="detail-label">Area</span>
                                            <span className="detail-value">{selectedSpell.area}</span>
                                        </div>
                                    )}
                                    {selectedSpell.duration && (
                                        <div className="detail-row">
                                            <span className="detail-label">Duration</span>
                                            <span className="detail-value">{selectedSpell.duration}</span>
                                        </div>
                                    )}
                                    {selectedSpell.save && (
                                        <div className="detail-row">
                                            <span className="detail-label">Save</span>
                                            <span className="detail-value">{selectedSpell.save}</span>
                                        </div>
                                    )}
                                    {selectedSpell.damage && (
                                        <div className="detail-row">
                                            <span className="detail-label">Damage</span>
                                            <span className="detail-value damage-value">{selectedSpell.damage}</span>
                                        </div>
                                    )}
                                </div>
                                {selectedSpell.traits.length > 0 && (
                                    <div className="spell-traits-section">
                                        <div className="traits-list">
                                            {selectedSpell.traits.map(trait => (
                                                <span key={trait} className="trait-tag">{trait}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <p className="spell-description">{selectedSpell.description}</p>
                                <button className="add-spell-btn" onClick={() => {
                                    // TODO: Add spell to character
                                    setShowBrowser(false);
                                    setSelectedSpell(null);
                                }}>
                                    + {t('actions.learnSpell') || 'Learn Spell'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="spells-panel">
            <div className="panel-header">
                <h3>{t('tabs.spells') || 'Spells'}</h3>
                <button className="header-btn" onClick={() => setShowBrowser(true)}>
                    + {t('actions.addSpell') || 'Add Spell'}
                </button>
            </div>

            {/* Spellcasting Info */}
            <div className="spellcasting-info">
                <div className="spell-stat">
                    <span className="spell-stat-label">{t('stats.tradition') || 'Tradition'}</span>
                    <span className="spell-stat-value tradition-badge">
                        {spellcasting.tradition}
                    </span>
                </div>
                <div className="spell-stat">
                    <span className="spell-stat-label">{t('stats.spellAttack') || 'Spell Attack'}</span>
                    <span className="spell-stat-value">{formatModifier(spellAttack)}</span>
                </div>
                <div className="spell-stat">
                    <span className="spell-stat-label">{t('stats.spellDC') || 'Spell DC'}</span>
                    <span className="spell-stat-value">{spellDC}</span>
                </div>
            </div>

            {/* Focus Points */}
            {spellcasting.focusPool && (
                <div className="focus-pool">
                    <span className="focus-label">{t('stats.focusPoints') || 'Focus Points'}</span>
                    <div className="focus-pips">
                        {Array.from({ length: spellcasting.focusPool.max }, (_, i) => (
                            <div
                                key={i}
                                className={`focus-pip ${i < spellcasting.focusPool!.current ? 'filled' : 'empty'}`}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Spell Slots */}
            <div className="spell-slots-section">
                <h4>{t('stats.spellSlots') || 'Spell Slots'}</h4>
                <div className="spell-slots-grid">
                    {slotLevels.map(level => {
                        const slot = spellcasting.spellSlots[level];
                        const remaining = slot.max - slot.used;
                        return (
                            <div key={level} className="spell-slot-row">
                                <span className="slot-level">
                                    {level === 0 ? 'Cantrip' : `${t('stats.rank') || 'Rank'} ${level}`}
                                </span>
                                <div className="slot-pips">
                                    {Array.from({ length: slot.max }, (_, i) => (
                                        <div
                                            key={i}
                                            className={`slot-pip ${i < remaining ? 'available' : 'used'}`}
                                        />
                                    ))}
                                </div>
                                <span className="slot-count">{remaining}/{slot.max}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Known Spells */}
            <div className="known-spells-section">
                <h4>{t('stats.knownSpells') || 'Known Spells'}</h4>
                {spellcasting.knownSpells.length === 0 ? (
                    <div>
                        <p className="text-muted">{t('builder.noSpellsKnown') || 'No spells known yet.'}</p>
                        <button className="add-btn" onClick={() => setShowBrowser(true)}>
                            + {t('actions.browseSpells') || 'Browse Spells'}
                        </button>
                    </div>
                ) : (
                    <div className="spells-list">
                        {spellcasting.knownSpells.map(spellId => (
                            <div key={spellId} className="spell-item">
                                <span className="spell-name">{spellId}</span>
                                <button
                                    className="spell-cast-btn"
                                    onClick={() => onCastSpell(spellId)}
                                >
                                    {t('actions.cast') || 'Cast'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Spell Browser Modal */}
            {showBrowser && renderSpellBrowser()}
        </div>
    );
};

export default SpellsPanel;
