import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { getFeats, LoadedFeat } from '../../data/pf2e-loader';
import { CharacterFeat, Character } from '../../types';
import { checkPrerequisites, extractSkillFromPrerequisites } from '../../utils/prereqValidator';
import { skills as allSkills, getAncestryById, getClassById } from '../../data';

type FeatCategory = 'all' | 'ancestry' | 'class' | 'skill' | 'general' | 'archetype';

interface FeatBrowserProps {
    onClose: () => void;
    onSelect: (feat: LoadedFeat, source: CharacterFeat['source']) => void;
    filterCategory?: 'ancestry' | 'class' | 'skill' | 'general'; // Pre-filter by category
    characterLevel?: number;
    ancestryId?: string; // For filtering ancestry-specific feats
    classId?: string; // For filtering class-specific feats
    character?: Character; // For prerequisite validation
    skillFilter?: string; // For filtering skill feats by skill
}

export const FeatBrowser: React.FC<FeatBrowserProps> = ({
    onClose,
    onSelect,
    filterCategory,
    characterLevel = 20,
    ancestryId,
    classId,
    character,
    skillFilter,
}) => {
    const { t, language } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<FeatCategory>(filterCategory || 'all');
    const [levelFilter, setLevelFilter] = useState<number | null>(null);
    const [selectedFeat, setSelectedFeat] = useState<LoadedFeat | null>(null);
    const [hideUnavailable, setHideUnavailable] = useState(false);
    const [selectedSkillFilter, setSelectedSkillFilter] = useState<string | null>(skillFilter || null);

    // Load all feats
    const allFeats = useMemo(() => getFeats(), []);

    // Get available levels up to character level
    const availableLevels = useMemo(() => {
        const levels = new Set(allFeats.filter(f => f.level <= characterLevel).map(f => f.level));
        return Array.from(levels).sort((a, b) => a - b);
    }, [allFeats, characterLevel]);

    // Filter feats
    const filteredFeats = useMemo(() => {
        let feats = allFeats.filter(f => f.level <= characterLevel);

        // Filter by category
        if (categoryFilter !== 'all') {
            feats = feats.filter(f => f.category === categoryFilter);
        }

        // Additional filtering for ancestry/class specific feats
        if (categoryFilter === 'ancestry' && ancestryId) {
            // Get the ancestry name from ID
            const ancestry = getAncestryById(ancestryId);
            if (!ancestry) {
                // If ancestry not found, show no feats
                feats = [];
            } else {
                const ancestryName = ancestry.name?.toLowerCase() || ancestryId.toLowerCase();

                // Filter by ancestry trait - show ONLY feats with matching trait
                // This excludes feats with other ancestry traits and generic feats without specific ancestry traits
                feats = feats.filter(f => {
                    // Check if feat has the selected ancestry as a trait
                    return f.traits.some(t => t.toLowerCase() === ancestryName);
                });
            }
        }

        if (categoryFilter === 'class' && classId) {
            // Get the class name from ID
            const cls = getClassById(classId);
            if (!cls) {
                // If class not found, show no feats
                feats = [];
            } else {
                const className = cls.name?.toLowerCase() || classId.toLowerCase();

                // Filter by class trait - show ONLY feats with matching trait
                // This excludes feats with other class traits and generic feats without specific class traits
                feats = feats.filter(f => {
                    // Check if feat has the selected class as a trait
                    return f.traits.some(t => t.toLowerCase() === className);
                });
            }
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

        // Filter skill feats by specific skill
        if ((categoryFilter === 'skill' || filterCategory === 'skill') && selectedSkillFilter) {
            feats = feats.filter(f => {
                const skillReq = extractSkillFromPrerequisites(f.prerequisites);
                return skillReq === selectedSkillFilter.toLowerCase();
            });
        }

        // Filter out unavailable feats if option enabled
        if (hideUnavailable && character) {
            feats = feats.filter(f => checkPrerequisites(f, character).met);
        }

        return feats.slice(0, 100);
    }, [allFeats, categoryFilter, levelFilter, searchQuery, characterLevel, ancestryId, classId, selectedSkillFilter, hideUnavailable]);

    const getActionIcon = (actionType: LoadedFeat['actionType'], actionCost: number | null): string => {
        if (actionType === 'passive') return '◈';
        if (actionType === 'free') return '◇';
        if (actionType === 'reaction') return '↺';
        if (actionCost === 1) return '◆';
        if (actionCost === 2) return '◆◆';
        if (actionCost === 3) return '◆◆◆';
        return '◆';
    };

    const getCategoryColor = (category: string): string => {
        switch (category) {
            case 'ancestry': return 'var(--desktop-accent-orange)';
            case 'class': return 'var(--desktop-accent-red)';
            case 'general': return 'var(--desktop-text-secondary)';
            case 'skill': return 'var(--desktop-accent-blue)';
            case 'archetype': return 'var(--desktop-accent-purple, #9b59b6)';
            default: return 'var(--desktop-accent-green)';
        }
    };

    const handleSelectFeat = () => {
        if (selectedFeat) {
            let source: CharacterFeat['source'] = 'bonus';
            if (selectedFeat.category === 'ancestry') source = 'ancestry';
            else if (selectedFeat.category === 'class') source = 'class';
            else if (selectedFeat.category === 'general') source = 'general';
            else if (selectedFeat.category === 'skill') source = 'skill';

            onSelect(selectedFeat, source);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="selection-modal feat-browser-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        {filterCategory === 'ancestry'
                            ? t('builder.ancestryFeat') || 'Ancestry Feat'
                            : filterCategory === 'class'
                                ? t('builder.classFeat') || 'Class Feat'
                                : t('browser.feats') || 'Feat Browser'}
                    </h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="browser-filters">
                    <input
                        type="text"
                        placeholder={t('search.placeholder') || 'Search feats...'}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="browser-search"
                    />
                    <div className="filter-row">
                        {!filterCategory && (
                            <div className="category-filters">
                                {(['all', 'ancestry', 'class', 'skill', 'general'] as const).map(cat => (
                                    <button
                                        key={cat}
                                        className={`filter-btn ${categoryFilter === cat ? 'active' : ''}`}
                                        onClick={() => setCategoryFilter(cat)}
                                    >
                                        {cat === 'all' ? t('filters.all') || 'All' : cat}
                                    </button>
                                ))}
                            </div>
                        )}
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

                    {/* Skill filter for skill feats */}
                    {(categoryFilter === 'skill' || filterCategory === 'skill') && (
                        <div className="filter-row">
                            <select
                                className="skill-filter"
                                value={selectedSkillFilter ?? ''}
                                onChange={e => setSelectedSkillFilter(e.target.value || null)}
                            >
                                <option value="">{t('filters.allSkills') || 'All Skills'}</option>
                                {allSkills.map(skill => (
                                    <option key={skill.id} value={skill.name.toLowerCase()}>
                                        {language === 'it' ? (skill.nameIt || skill.name) : skill.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Hide unavailable toggle */}
                    {character && (
                        <label className="filter-checkbox">
                            <input
                                type="checkbox"
                                checked={hideUnavailable}
                                onChange={e => setHideUnavailable(e.target.checked)}
                            />
                            {t('filters.hideUnavailable') || 'Hide unavailable'}
                        </label>
                    )}
                </div>

                <div className="browser-content">
                    <div className="browser-list">
                        {filteredFeats.length === 0 ? (
                            <div className="no-results">
                                {t('search.noResults') || 'No feats found.'}
                            </div>
                        ) : (
                            filteredFeats.map(feat => {
                                const prereqResult = character ? checkPrerequisites(feat, character) : { met: true, reasons: [] };

                                return (
                                    <div
                                        key={feat.id}
                                        className={`browser-item ${selectedFeat?.id === feat.id ? 'selected' : ''} ${!prereqResult.met ? 'prereq-unmet' : ''}`}
                                        onClick={() => setSelectedFeat(feat)}
                                    >
                                        <div className="item-header">
                                            <span className="item-name">
                                                {!prereqResult.met && <span className="prereq-warning">⚠️</span>}
                                                {feat.name}
                                            </span>
                                            <span className="item-action">
                                                {getActionIcon(feat.actionType, feat.actionCost)}
                                            </span>
                                        </div>
                                        <div className="item-meta">
                                            <span className="item-level">Lv {feat.level}</span>
                                            <span
                                                className="item-category"
                                                style={{ color: getCategoryColor(feat.category) }}
                                            >
                                                {feat.category}
                                            </span>
                                            {feat.rarity !== 'common' && (
                                                <span className={`item-rarity rarity-${feat.rarity}`}>
                                                    {feat.rarity}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {selectedFeat && (
                        <div className="browser-detail">
                            <div className="detail-header">
                                <h3>{selectedFeat.name}</h3>
                                <span className="detail-action">
                                    {getActionIcon(selectedFeat.actionType, selectedFeat.actionCost)}
                                </span>
                            </div>

                            <div className="detail-meta">
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
                                <div className="detail-traits">
                                    {selectedFeat.traits.map(trait => (
                                        <span key={trait} className="trait-tag">{trait}</span>
                                    ))}
                                </div>
                            )}

                            {selectedFeat.prerequisites.length > 0 && (
                                <div className="detail-prereqs">
                                    <strong>{t('feats.prerequisites') || 'Prerequisites'}:</strong>{' '}
                                    {selectedFeat.prerequisites.join('; ')}
                                </div>
                            )}

                            <p className="detail-description">{selectedFeat.description}</p>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="modal-btn modal-btn-secondary" onClick={onClose}>
                        {t('actions.cancel')}
                    </button>
                    <button
                        className="modal-btn modal-btn-primary"
                        onClick={handleSelectFeat}
                        disabled={!selectedFeat}
                    >
                        {t('actions.select')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeatBrowser;
