/**
 * Rituals Panel Component
 * Display and manage ritual spells (time-based spells that don't use slots)
 */

import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';

export interface RitualData {
    id: string;
    name: string;
    nameIt?: string;
    level: number;
    castTime: string;  // e.g., "1 hour", "4 hours"
    primaryCheck: {
        skill: string;
        dc: number;
    };
    secondaryCheck?: {
        skill: string;
        dc: number;
        casters: number;  // Number of secondary casters required
    };
    cost?: string;  // Material cost, e.g., "50 gp of incense"
    description: string;
    descriptionIt?: string;
    traits?: string[];
}

interface RitualsPanelProps {
    rituals: string[];  // IDs of known rituals
    onAddRitual: (ritualId: string) => void;
    onRemoveRitual: (ritualId: string) => void;
}

// Mock rituals data - would be loaded from pf2e-loader in production
const MOCK_RITUALS: RitualData[] = [
    {
        id: 'ritual-animate-dead',
        name: 'Animate Dead',
        nameIt: 'Nutri i Morti',
        level: 4,
        castTime: '1 hour',
        primaryCheck: { skill: 'Nature', dc: 20 },
        secondaryCheck: { skill: 'Nature', dc: 18, casters: 1 },
        cost: 'unholy water worth 10 gp',
        description: 'You summon an undead creature.',
        descriptionIt: 'Evochi una creatura non morta.',
        traits: ['Necromancy', 'Evil'],
    },
    {
        id: 'ritual-plant-creature',
        name: 'Plant Creature',
        nameIt: 'Creatura Vegetale',
        level: 3,
        castTime: '1 hour',
        primaryCheck: { skill: 'Nature', dc: 18 },
        cost: 'rare incense and oils worth 20 gp',
        description: 'Transform a living creature into a plant.',
        descriptionIt: 'Trasforma una creatura vivente in una pianta.',
        traits: ['Plant', 'Polymorph'],
    },
    {
        id: 'ritual-restore-senses',
        name: 'Restore Senses',
        nameIt: 'Ripristina i Sensi',
        level: 3,
        castTime: '1 hour',
        primaryCheck: { skill: 'Medicine', dc: 20 },
        description: 'Restore a creature\'s lost senses.',
        descriptionIt: 'Ripristina i sensi persi di una creatura.',
        traits: ['Healing', 'Necromancy'],
    },
];

export const RitualsPanel: React.FC<RitualsPanelProps> = ({
    rituals,
    onAddRitual,
    onRemoveRitual,
}) => {
    const { t, language } = useLanguage();
    const [showBrowser, setShowBrowser] = useState(false);
    const [selectedRitual, setSelectedRitual] = useState<RitualData | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [levelFilter, setLevelFilter] = useState<number | 'all'>('all');

    // Filter rituals
    const filteredRituals = useMemo(() => {
        let filtered = MOCK_RITUALS;

        if (levelFilter !== 'all') {
            filtered = filtered.filter(r => r.level === levelFilter);
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(r =>
                r.name.toLowerCase().includes(q) ||
                (r.nameIt && r.nameIt.toLowerCase().includes(q)) ||
                r.traits?.some(t => t.toLowerCase().includes(q))
            );
        }

        return filtered;
    }, [levelFilter, searchQuery]);

    const getRitualName = (ritual: RitualData) => {
        return language === 'it' && ritual.nameIt ? ritual.nameIt : ritual.name;
    };

    const getRitualDescription = (ritual: RitualData) => {
        return language === 'it' && ritual.descriptionIt ? ritual.descriptionIt : ritual.description;
    };

    const renderRitualBrowser = () => {
        return (
            <div className="modal-overlay" onClick={() => setShowBrowser(false)}>
                <div className="ritual-browser-modal" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h3>{t('rituals.browser') || 'Ritual Browser'}</h3>
                        <button className="modal-close" onClick={() => setShowBrowser(false)}>×</button>
                    </div>

                    <div className="browser-filters">
                        <input
                            type="text"
                            placeholder={t('search.placeholder') || 'Search rituals...'}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                        <div className="filter-row">
                            <div className="level-filters">
                                <button
                                    className={`filter-btn ${levelFilter === 'all' ? 'active' : ''}`}
                                    onClick={() => setLevelFilter('all')}
                                >
                                    {t('filter.all') || 'All'}
                                </button>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(level => (
                                    <button
                                        key={level}
                                        className={`filter-btn level-btn ${levelFilter === level ? 'active' : ''}`}
                                        onClick={() => setLevelFilter(level)}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="browser-content">
                        <div className="ritual-list">
                            {filteredRituals.map(ritual => (
                                <div
                                    key={ritual.id}
                                    className={`ritual-list-item ${selectedRitual?.id === ritual.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedRitual(ritual)}
                                >
                                    <span className="ritual-item-level">{ritual.level}</span>
                                    <span className="ritual-item-name">{getRitualName(ritual)}</span>
                                    {ritual.traits && ritual.traits.length > 0 && (
                                        <div className="ritual-item-traits">
                                            {ritual.traits.slice(0, 2).map(trait => (
                                                <span key={trait} className="trait-tag ritual-trait">{trait}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {selectedRitual && (
                            <div className="ritual-detail">
                                <div className="ritual-detail-header">
                                    <h4>{getRitualName(selectedRitual)}</h4>
                                    <span className="ritual-level-badge">
                                        Level {selectedRitual.level}
                                    </span>
                                </div>

                                {selectedRitual.traits && selectedRitual.traits.length > 0 && (
                                    <div className="ritual-traits-section">
                                        <div className="traits-list">
                                            {selectedRitual.traits.map(trait => (
                                                <span key={trait} className="trait-tag">{trait}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="ritual-detail-grid">
                                    <div className="detail-row">
                                        <span className="detail-label">{t('rituals.castTime') || 'Cast Time'}</span>
                                        <span className="detail-value">{selectedRitual.castTime}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">{t('rituals.primaryCheck') || 'Primary Check'}</span>
                                        <span className="detail-value">
                                            {selectedRitual.primaryCheck.skill} DC {selectedRitual.primaryCheck.dc}
                                        </span>
                                    </div>
                                    {selectedRitual.secondaryCheck && (
                                        <div className="detail-row">
                                            <span className="detail-label">{t('rituals.secondaryCheck') || 'Secondary Check'}</span>
                                            <span className="detail-value">
                                                {selectedRitual.secondaryCheck.skill} DC {selectedRitual.secondaryCheck.dc}
                                                {' '}×{selectedRitual.secondaryCheck.casters}
                                            </span>
                                        </div>
                                    )}
                                    {selectedRitual.cost && (
                                        <div className="detail-row">
                                            <span className="detail-label">{t('rituals.cost') || 'Cost'}</span>
                                            <span className="detail-value cost-value">{selectedRitual.cost}</span>
                                        </div>
                                    )}
                                </div>

                                <p className="ritual-description">{getRitualDescription(selectedRitual)}</p>

                                <button
                                    className="add-ritual-btn"
                                    onClick={() => {
                                        onAddRitual(selectedRitual.id);
                                        setShowBrowser(false);
                                        setSelectedRitual(null);
                                    }}
                                    disabled={rituals.includes(selectedRitual.id)}
                                >
                                    {rituals.includes(selectedRitual.id)
                                        ? t('rituals.alreadyKnown') || 'Already Known'
                                        : `+ ${t('actions.learnRitual') || 'Learn Ritual'}`
                                    }
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="rituals-panel">
            <div className="panel-header rituals-header">
                <h3>
                    <span className="rituals-icon">🔮</span>
                    {t('tabs.rituals') || 'Rituals'}
                </h3>
                <button className="header-btn" onClick={() => setShowBrowser(true)}>
                    + {t('actions.browseRituals') || 'Browse Rituals'}
                </button>
            </div>

            {rituals.length === 0 ? (
                <div className="empty-state rituals-empty">
                    <div className="empty-state-icon">🔮</div>
                    <p>{t('rituals.noRituals') || 'No rituals known.'}</p>
                    <button className="add-btn" onClick={() => setShowBrowser(true)}>
                        + {t('actions.browseRituals') || 'Browse Rituals'}
                    </button>
                </div>
            ) : (
                <div className="rituals-list">
                    {rituals.map(ritualId => {
                        const ritual = MOCK_RITUALS.find(r => r.id === ritualId);
                        if (!ritual) return null;

                        return (
                            <div key={ritual.id} className="ritual-card">
                                <div className="ritual-card-header">
                                    <span className="ritual-name">{getRitualName(ritual)}</span>
                                    <button
                                        className="ritual-remove-btn"
                                        onClick={() => onRemoveRitual(ritual.id)}
                                        title={t('actions.removeRitual') || 'Remove Ritual'}
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className="ritual-meta">
                                    <span className="ritual-level-badge">Level {ritual.level}</span>
                                    <span className="ritual-cast-time">⏱ {ritual.castTime}</span>
                                </div>

                                <div className="ritual-checks">
                                    <div className="ritual-check">
                                        <span className="check-label">{t('rituals.primary') || 'Primary'}:</span>
                                        <span className="check-value">{ritual.primaryCheck.skill} DC {ritual.primaryCheck.dc}</span>
                                    </div>
                                    {ritual.secondaryCheck && (
                                        <div className="ritual-check">
                                            <span className="check-label">{t('rituals.secondary') || 'Secondary'}:</span>
                                            <span className="check-value">{ritual.secondaryCheck.skill} DC {ritual.secondaryCheck.dc} ×{ritual.secondaryCheck.casters}</span>
                                        </div>
                                    )}
                                </div>

                                {ritual.cost && (
                                    <div className="ritual-cost">
                                        <span className="cost-label">{t('rituals.cost') || 'Cost'}:</span>
                                        <span className="cost-value">{ritual.cost}</span>
                                    </div>
                                )}

                                <p className="ritual-description">{getRitualDescription(ritual)}</p>
                            </div>
                        );
                    })}
                </div>
            )}

            {showBrowser && renderRitualBrowser()}
        </div>
    );
};

export default RitualsPanel;
