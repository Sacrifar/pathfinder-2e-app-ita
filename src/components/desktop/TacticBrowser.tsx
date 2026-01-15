import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { getTactics, type LoadedTactic } from '../../data/tactics';

type TacticTier = 'all' | 'basic' | 'expert' | 'master' | 'legendary';
type TacticCategory = 'all' | 'mobility' | 'offensive';

interface TacticBrowserProps {
    onClose: () => void;
    onSelect: (tactic: LoadedTactic) => void;
    onRemove?: (tacticId: string) => void; // Allow removing tactics
    characterLevel?: number;
    knownTactics?: string[]; // IDs of already known tactics
    maxSelections?: number; // Maximum number of tactics that can be selected (e.g., 5 for level 1)
}

export const TacticBrowser: React.FC<TacticBrowserProps> = ({
    onClose,
    onSelect,
    onRemove,
    characterLevel = 1,
    knownTactics = [],
    maxSelections = 99,
}) => {
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [tierFilter, setTierFilter] = useState<TacticTier>('all');
    const [categoryFilter, setCategoryFilter] = useState<TacticCategory>('all');
    const [selectedTactic, setSelectedTactic] = useState<LoadedTactic | null>(null);

    // Load all tactics available for this level
    const allTactics = useMemo(() => {
        return getTactics().filter(tactic => {
            // Filter by level requirements
            switch (tactic.tacticTier) {
                case 'basic':
                    return characterLevel >= 1;
                case 'expert':
                    return characterLevel >= 7;
                case 'master':
                    return characterLevel >= 15;
                case 'legendary':
                    return characterLevel >= 19;
                default:
                    return false;
            }
        });
    }, [characterLevel]);

    // Filter tactics
    const filteredTactics = useMemo(() => {
        let tactics = allTactics;

        // Filter by tier
        if (tierFilter !== 'all') {
            tactics = tactics.filter(t => t.tacticTier === tierFilter);
        }

        // Filter by category
        if (categoryFilter !== 'all') {
            tactics = tactics.filter(t => t.tacticCategory === categoryFilter);
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            tactics = tactics.filter(t =>
                t.name.toLowerCase().includes(query) ||
                t.description.toLowerCase().includes(query)
            );
        }

        // DON'T filter out already known tactics - show all so users can remove them
        return tactics;
    }, [allTactics, tierFilter, categoryFilter, searchQuery]);

    const canSelectMore = knownTactics.length < maxSelections;

    const handleSelectTactic = () => {
        if (selectedTactic) {
            const isKnown = knownTactics.includes(selectedTactic.id);
            if (!isKnown && canSelectMore) {
                onSelect(selectedTactic);
            } else if (isKnown && onRemove) {
                onRemove(selectedTactic.id);
            }
        }
    };

    const handleRemoveTactic = () => {
        if (selectedTactic && onRemove && knownTactics.includes(selectedTactic.id)) {
            onRemove(selectedTactic.id);
        }
    };

    const getActionSymbol = (cost: LoadedTactic['cost']): string => {
        if (cost === 'free') return '◇';
        if (cost === 'reaction') return '↺';
        if (cost === '1') return '◆';
        if (cost === '2') return '◆◆';
        if (cost === '3') return '◆◆◆';
        return '◆';
    };

    const getTierColor = (tier: LoadedTactic['tacticTier']): string => {
        switch (tier) {
            case 'basic': return 'var(--desktop-accent-green, #4caf50)';
            case 'expert': return 'var(--desktop-accent-blue, #2196f3)';
            case 'master': return 'var(--desktop-accent-purple, #9c27b0)';
            case 'legendary': return 'var(--desktop-accent-orange, #ff9800)';
            default: return '#888';
        }
    };

    const getCategoryColor = (category: LoadedTactic['tacticCategory']): string => {
        switch (category) {
            case 'mobility': return 'var(--desktop-accent-cyan, #03a9f4)';
            case 'offensive': return 'var(--desktop-accent-red, #f44336)';
            default: return '#888';
        }
    };

    // Get available tiers
    const availableTiers = useMemo(() => {
        const tiers = new Set(allTactics.map(t => t.tacticTier));
        return Array.from(tiers);
    }, [allTactics]);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="selection-modal feat-browser-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{t('commander.selectTactics') || 'Select Tactics'}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="browser-filters">
                    <input
                        type="text"
                        placeholder={t('search.placeholder') || 'Search tactics...'}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="browser-search"
                    />
                    <div className="filter-row">
                        <div className="category-filters">
                            {(['all', 'mobility', 'offensive'] as const).map(cat => (
                                <button
                                    key={cat}
                                    className={`filter-btn ${categoryFilter === cat ? 'active' : ''}`}
                                    onClick={() => setCategoryFilter(cat)}
                                >
                                    {cat === 'all'
                                        ? (t('commander.allCategories') || 'All')
                                        : cat === 'mobility'
                                            ? (t('commander.mobility') || 'Mobility')
                                            : (t('commander.offensive') || 'Offensive')}
                                </button>
                            ))}
                        </div>
                        <select
                            className="level-filter"
                            value={tierFilter}
                            onChange={e => setTierFilter(e.target.value as TacticTier)}
                        >
                            <option value="all">{t('commander.allTiers') || 'All Tiers'}</option>
                            {availableTiers.includes('basic') && (
                                <option value="basic">{t('commander.basic') || 'Basic (Level 1+)'}</option>
                            )}
                            {availableTiers.includes('expert') && (
                                <option value="expert">{t('commander.expert') || 'Expert (Level 7+)'}</option>
                            )}
                            {availableTiers.includes('master') && (
                                <option value="master">{t('commander.master') || 'Master (Level 15+)'}</option>
                            )}
                            {availableTiers.includes('legendary') && (
                                <option value="legendary">{t('commander.legendary') || 'Legendary (Level 19+)'}</option>
                            )}
                        </select>
                    </div>

                    {/* Selection info */}
                    <div className="filter-row">
                        <span className="selection-info">
                            {knownTactics.length} / {maxSelections} {t('commander.tacticsSelected') || 'selected'}
                        </span>
                    </div>
                </div>

                <div className="browser-content">
                    <div className="browser-list">
                        {filteredTactics.length === 0 ? (
                            <div className="no-results">
                                {t('commander.noTacticsAvailable') || 'No tactics available with current filters.'}
                            </div>
                        ) : (
                            filteredTactics.map(tactic => {
                                const isKnown = knownTactics.includes(tactic.id);
                                return (
                                    <div
                                        key={tactic.id}
                                        className={`browser-item ${selectedTactic?.id === tactic.id ? 'selected' : ''} ${isKnown ? 'already-owned' : ''}`}
                                        onClick={() => setSelectedTactic(tactic)}
                                    >
                                        <div className="item-header">
                                            <span className="item-name">
                                                {isKnown && <span className="owned-indicator">✓</span>}
                                                {tactic.name}
                                            </span>
                                            <span className="item-action">
                                                {getActionSymbol(tactic.cost)}
                                            </span>
                                        </div>
                                        <div className="item-meta">
                                            <span
                                                className="item-tier"
                                                style={{ color: getTierColor(tactic.tacticTier) }}
                                            >
                                                {t(`commander.${tactic.tacticTier}`) || tactic.tacticTier}
                                            </span>
                                            <span
                                                className="item-category"
                                                style={{ color: getCategoryColor(tactic.tacticCategory) }}
                                            >
                                                {t(`commander.${tactic.tacticCategory}`) || tactic.tacticCategory}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {selectedTactic && (
                        <div className="browser-detail">
                            <div className="detail-header">
                                <h3>{selectedTactic.name}</h3>
                                <span className="detail-action">
                                    {getActionSymbol(selectedTactic.cost)}
                                </span>
                            </div>

                            <div className="detail-meta">
                                <span
                                    className="detail-tier"
                                    style={{ color: getTierColor(selectedTactic.tacticTier) }}
                                >
                                    {t(`commander.${selectedTactic.tacticTier}`) || selectedTactic.tacticTier}
                                </span>
                                <span
                                    className="detail-category"
                                    style={{ color: getCategoryColor(selectedTactic.tacticCategory) }}
                                >
                                    {t(`commander.${selectedTactic.tacticCategory}`) || selectedTactic.tacticCategory}
                                </span>
                            </div>

                            <p
                                className="detail-description"
                                dangerouslySetInnerHTML={{ __html: selectedTactic.description }}
                            />
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="modal-btn modal-btn-secondary" onClick={onClose}>
                        {t('actions.cancel')}
                    </button>
                    {selectedTactic && knownTactics.includes(selectedTactic.id) ? (
                        <button
                            className="modal-btn modal-btn-danger"
                            onClick={handleRemoveTactic}
                        >
                            {t('actions.remove') || 'Remove'}
                        </button>
                    ) : (
                        <button
                            className="modal-btn modal-btn-primary"
                            onClick={handleSelectTactic}
                            disabled={!selectedTactic || !canSelectMore}
                        >
                            {t('actions.select')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TacticBrowser;
