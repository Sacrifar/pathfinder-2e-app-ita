import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Character, CharacterFeat } from '../../types';
import { getFeats, LoadedFeat } from '../../data/pf2e-loader';
import { FeatActionIcon } from '../../utils/actionIcons';


interface FeatsPanelProps {
    character: Character;
    onFeatClick: (feat: CharacterFeat) => void;
    onAddFeat?: (feat: LoadedFeat, source: CharacterFeat['source']) => void;
}

interface FeatGroup {
    source: CharacterFeat['source'];
    label: string;
    feats: CharacterFeat[];
}

type CategoryFilter = 'all' | 'ancestry' | 'class' | 'skill' | 'general' | 'archetype';

export const FeatsPanel: React.FC<FeatsPanelProps> = ({
    character,
    onFeatClick,
    onAddFeat,
}) => {
    const { t } = useLanguage();

    // Browser state
    const [showBrowser, setShowBrowser] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
    const [levelFilter, setLevelFilter] = useState<number | null>(null);
    const [selectedFeat, setSelectedFeat] = useState<LoadedFeat | null>(null);

    // Load all feats from pf2e data
    const allFeats = useMemo(() => getFeats(), []);

    // Get unique levels for filter dropdown
    const availableLevels = useMemo(() => {
        const levels = new Set(allFeats.map(f => f.level));
        return Array.from(levels).sort((a, b) => a - b);
    }, [allFeats]);

    // Filter feats based on search, category and level
    const filteredFeats = useMemo(() => {
        let feats = allFeats;

        // Filter by category
        if (categoryFilter !== 'all') {
            feats = feats.filter(f => f.category === categoryFilter);
        }

        // Filter by level
        if (levelFilter !== null) {
            feats = feats.filter(f => f.level === levelFilter);
        }

        // Filter by search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            feats = feats.filter(f =>
                f.name.toLowerCase().includes(q) ||
                f.traits.some(t => t.toLowerCase().includes(q)) ||
                f.prerequisites.some(p => p.toLowerCase().includes(q))
            );
        }

        return feats.slice(0, 100); // Limit for performance
    }, [allFeats, categoryFilter, levelFilter, searchQuery]);

    // Group character's feats by source
    const groupFeats = (): FeatGroup[] => {
        const groups: Record<CharacterFeat['source'], CharacterFeat[]> = {
            ancestry: [],
            class: [],
            general: [],
            skill: [],
            bonus: [],
        };

        character.feats.forEach(feat => {
            // Only show feats at or below current character level
            if (feat.level <= character.level) {
                groups[feat.source].push(feat);
            }
        });

        return [
            { source: 'ancestry' as const, label: t('feats.ancestry') || 'Ancestry Feats', feats: groups.ancestry },
            { source: 'class' as const, label: t('feats.class') || 'Class Feats', feats: groups.class },
            { source: 'general' as const, label: t('feats.general') || 'General Feats', feats: groups.general },
            { source: 'skill' as const, label: t('feats.skill') || 'Skill Feats', feats: groups.skill },
            { source: 'bonus' as const, label: t('feats.bonus') || 'Bonus Feats', feats: groups.bonus },
        ].filter(group => group.feats.length > 0);
    };

    const featGroups = groupFeats();
    const totalFeats = featGroups.reduce((sum, group) => sum + group.feats.length, 0);

    const getSourceColor = (source: CharacterFeat['source']): string => {
        switch (source) {
            case 'ancestry': return 'var(--desktop-accent-orange)';
            case 'class': return 'var(--desktop-accent-red)';
            case 'general': return 'var(--desktop-text-secondary)';
            case 'skill': return 'var(--desktop-accent-blue)';
            case 'bonus': return 'var(--desktop-accent-green)';
        }
    };

    const getCategoryColor = (category: string): string => {
        switch (category) {
            case 'ancestry': return 'var(--desktop-accent-orange)';
            case 'class': return 'var(--desktop-accent-red)';
            case 'general': return 'var(--desktop-text-secondary)';
            case 'skill': return 'var(--desktop-accent-blue)';
            case 'archetype': return 'var(--desktop-accent-purple, #9b59b6)';
            case 'mythic': return 'var(--desktop-accent-gold, #f1c40f)';
            default: return 'var(--desktop-accent-green)';
        }
    };

    const handleAddFeat = (feat: LoadedFeat) => {
        if (onAddFeat) {
            // Map LoadedFeat category to CharacterFeat source
            let source: CharacterFeat['source'] = 'bonus';
            if (feat.category === 'ancestry') source = 'ancestry';
            else if (feat.category === 'class') source = 'class';
            else if (feat.category === 'general') source = 'general';
            else if (feat.category === 'skill') source = 'skill';

            onAddFeat(feat, source);
        }
        setShowBrowser(false);
        setSelectedFeat(null);
    };

    return (
        <div className="feats-panel">
            <div className="panel-header">
                <h3>{t('tabs.feats') || 'Feats'}</h3>
                <div className="header-actions">
                    <span className="feat-count">{totalFeats} {t('feats.total') || 'total'}</span>
                    <button className="header-btn" onClick={() => setShowBrowser(true)}>
                        + {t('actions.browseFeat') || 'Browse Feats'}
                    </button>
                </div>
            </div>

            {totalFeats === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📜</div>
                    <p>{t('builder.noFeats') || 'No feats selected yet.'}</p>
                    <p className="empty-state-hint">
                        {t('builder.addFeatHint') || 'Browse feats to add them to your character.'}
                    </p>
                    <button className="add-btn" onClick={() => setShowBrowser(true)}>
                        + {t('actions.browseFeat') || 'Browse Feats'}
                    </button>
                </div>
            ) : (
                <div className="feat-groups">
                    {featGroups.map(group => (
                        <div key={group.source} className="feat-group">
                            <div
                                className="feat-group-header"
                                style={{ borderLeftColor: getSourceColor(group.source) }}
                            >
                                <span className="group-name">{group.label}</span>
                                <span className="group-count">{group.feats.length}</span>
                            </div>
                            <div className="feat-list">
                                {group.feats
                                    .sort((a, b) => a.level - b.level)
                                    .map(feat => {
                                        const featData = allFeats.find(f => f.id === feat.featId);
                                        const featName = featData?.name || feat.featId;
                                        return (
                                            <div
                                                key={feat.featId}
                                                className="feat-item"
                                                onClick={() => onFeatClick(feat)}
                                            >
                                                <span className="feat-level">Lv {feat.level}</span>
                                                <span className="feat-name">{featName}</span>
                                                {feat.choices && feat.choices.length > 0 && (
                                                    <span className="feat-choices">
                                                        ({feat.choices.join(', ')})
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Feat Browser Modal */}
            {showBrowser && (
                <div className="modal-overlay" onClick={() => setShowBrowser(false)}>
                    <div className="feat-browser-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{t('browser.feats') || 'Feat Browser'}</h3>
                            <button className="modal-close" onClick={() => setShowBrowser(false)}>×</button>
                        </div>

                        <div className="browser-filters">
                            <input
                                type="text"
                                placeholder={t('search.placeholder') || 'Search feats...'}
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                            <div className="filter-row">
                                <div className="category-filters">
                                    {(['all', 'ancestry', 'class', 'skill', 'general', 'archetype'] as const).map(cat => (
                                        <button
                                            key={cat}
                                            className={`filter-btn ${categoryFilter === cat ? 'active' : ''}`}
                                            onClick={() => setCategoryFilter(cat)}
                                        >
                                            {cat === 'all' ? t('filters.all') || 'All' : cat}
                                        </button>
                                    ))}
                                </div>
                                <select
                                    className="level-filter"
                                    value={levelFilter ?? ''}
                                    onChange={e => setLevelFilter(e.target.value ? Number(e.target.value) : null)}
                                >
                                    <option value="">{t('filters.allLevels') || 'All Levels'}</option>
                                    {availableLevels.map(level => (
                                        <option key={level} value={level}>
                                            {t('filters.level') || 'Level'} {level}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="browser-content">
                            <div className="feat-browser-list">
                                {filteredFeats.length === 0 ? (
                                    <div className="no-results">
                                        {t('search.noResults') || 'No feats found matching your criteria.'}
                                    </div>
                                ) : (
                                    filteredFeats.map(feat => (
                                        <div
                                            key={feat.id}
                                            className={`feat-list-item ${selectedFeat?.id === feat.id ? 'selected' : ''}`}
                                            onClick={() => setSelectedFeat(feat)}
                                        >
                                            <div className="feat-item-header">
                                                <span className="feat-item-name">{feat.name}</span>
                                                <span
                                                    className="feat-item-action"
                                                    title={feat.actionType}
                                                >
                                                    <FeatActionIcon actionType={feat.actionType} actionCost={feat.actionCost} />
                                                </span>
                                            </div>
                                            <div className="feat-item-meta">
                                                <span className="feat-item-level">Lv {feat.level}</span>
                                                <span
                                                    className="feat-item-category"
                                                    style={{ color: getCategoryColor(feat.category) }}
                                                >
                                                    {feat.category}
                                                </span>
                                                {feat.rarity !== 'common' && (
                                                    <span className={`feat-item-rarity rarity-${feat.rarity}`}>
                                                        {feat.rarity}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {selectedFeat && (
                                <div className="feat-detail">
                                    <div className="feat-detail-header">
                                        <h4>{selectedFeat.name}</h4>
                                        <span className="feat-detail-action">
                                            <FeatActionIcon actionType={selectedFeat.actionType} actionCost={selectedFeat.actionCost} />
                                        </span>
                                    </div>

                                    <div className="feat-detail-meta">
                                        <span className="detail-level">Level {selectedFeat.level}</span>
                                        <span
                                            className="detail-category"
                                            style={{ color: getCategoryColor(selectedFeat.category) }}
                                        >
                                            {selectedFeat.category}
                                        </span>
                                        {selectedFeat.rarity !== 'common' && (
                                            <span className={`detail-rarity rarity-${selectedFeat.rarity}`}>
                                                {selectedFeat.rarity}
                                            </span>
                                        )}
                                    </div>

                                    {selectedFeat.traits.length > 0 && (
                                        <div className="feat-traits-section">
                                            <div className="traits-list">
                                                {selectedFeat.traits.map(trait => (
                                                    <span key={trait} className="trait-tag">{trait}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {selectedFeat.prerequisites.length > 0 && (
                                        <div className="feat-prerequisites">
                                            <span className="prereq-label">
                                                {t('feats.prerequisites') || 'Prerequisites'}:
                                            </span>
                                            <span className="prereq-list">
                                                {selectedFeat.prerequisites.join('; ')}
                                            </span>
                                        </div>
                                    )}

                                    <p className="feat-description">{selectedFeat.description}</p>

                                    <button
                                        className="add-feat-btn"
                                        onClick={() => handleAddFeat(selectedFeat)}
                                    >
                                        + {t('actions.addToCharacter') || 'Add to Character'}
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

export default FeatsPanel;
