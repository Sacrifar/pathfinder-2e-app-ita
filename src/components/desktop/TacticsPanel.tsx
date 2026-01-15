import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Character } from '../../types';
import { getTactics, type LoadedTactic } from '../../data/tactics';
import { ActionIcon } from '../../utils/actionIcons';

interface TacticsPanelProps {
    character: Character;
    onTogglePreparedTactic?: (tacticId: string) => void;
}

export const TacticsPanel: React.FC<TacticsPanelProps> = ({
    character,
    onTogglePreparedTactic,
}) => {
    const { t } = useLanguage();
    const [selectedTactic, setSelectedTactic] = useState<LoadedTactic | null>(null);
    const [filter, setFilter] = useState<'all' | 'prepared' | 'known'>('all');

    // Get all known and prepared tactics
    const knownTactics = useMemo(() => {
        const knownIds = character.tactics?.known || [];
        const allTactics = getTactics();
        return allTactics.filter(t => knownIds.includes(t.id));
    }, [character.tactics?.known]);

    const preparedTactics = useMemo(() => {
        const preparedIds = character.tactics?.prepared || [];
        const allTactics = getTactics();
        return allTactics.filter(t => preparedIds.includes(t.id));
    }, [character.tactics?.prepared]);

    // Filter tactics based on current filter
    const filteredTactics = useMemo(() => {
        switch (filter) {
            case 'prepared':
                return preparedTactics;
            case 'known':
                return knownTactics.filter(t => !preparedTactics.some(p => p.id === t.id));
            case 'all':
            default:
                return knownTactics;
        }
    }, [filter, knownTactics, preparedTactics]);

    const getTierColor = (tier: LoadedTactic['tacticTier']): string => {
        switch (tier) {
            case 'basic': return '#4caf50';
            case 'expert': return '#2196f3';
            case 'master': return '#9c27b0';
            case 'legendary': return '#ff9800';
            default: return '#888';
        }
    };

    const getCategoryColor = (category: LoadedTactic['tacticCategory']): string => {
        switch (category) {
            case 'mobility': return '#03a9f4';
            case 'offensive': return '#f44336';
            default: return '#888';
        }
    };

    const isPrepared = (tacticId: string): boolean => {
        return (character.tactics?.prepared || []).includes(tacticId);
    };

    return (
        <div className="tactics-panel">
            <div className="panel-header">
                <h3>{t('commander.tactics') || 'Tactics'}</h3>
                <div className="panel-filters">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        {t('commander.all') || 'All'} ({knownTactics.length})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'prepared' ? 'active' : ''}`}
                        onClick={() => setFilter('prepared')}
                    >
                        {t('commander.prepared') || 'Prepared'} ({preparedTactics.length}/3)
                    </button>
                    <button
                        className={`filter-btn ${filter === 'known' ? 'active' : ''}`}
                        onClick={() => setFilter('known')}
                    >
                        {t('commander.known') || 'Known'} ({knownTactics.length - preparedTactics.length})
                    </button>
                </div>
            </div>

            <div className="tactics-content">
                {filteredTactics.length === 0 ? (
                    <div className="no-tactics">
                        {filter === 'prepared'
                            ? (t('commander.noPreparedTactics') || 'No tactics prepared yet.')
                            : (t('commander.noTactics') || 'No tactics available.')}
                    </div>
                ) : (
                    <div className="tactics-grid">
                        {filteredTactics.map(tactic => (
                            <div
                                key={tactic.id}
                                className={`tactic-card ${isPrepared(tactic.id) ? 'prepared' : ''}`}
                                onClick={() => setSelectedTactic(tactic)}
                            >
                                <div className="tactic-header">
                                    <div className="tactic-actions">
                                        <ActionIcon cost={tactic.cost} />
                                    </div>
                                    <h4 className="tactic-name">{tactic.name}</h4>
                                    {onTogglePreparedTactic && (
                                        <button
                                            className={`prepare-toggle ${isPrepared(tactic.id) ? 'prepared' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onTogglePreparedTactic(tactic.id);
                                            }}
                                            title={isPrepared(tactic.id)
                                                ? (t('commander.unprepare') || 'Unprepare')
                                                : (t('commander.prepare') || 'Prepare')}
                                        >
                                            {isPrepared(tactic.id) ? '★' : '☆'}
                                        </button>
                                    )}
                                </div>

                                <div className="tactic-tags">
                                    <span
                                        className="tag tier-tag"
                                        style={{ backgroundColor: getTierColor(tactic.tacticTier) }}
                                    >
                                        {t(`commander.${tactic.tacticTier}`) || tactic.tacticTier}
                                    </span>
                                    <span
                                        className="tag category-tag"
                                        style={{ backgroundColor: getCategoryColor(tactic.tacticCategory) }}
                                    >
                                        {t(`commander.${tactic.tacticCategory}`) || tactic.tacticCategory}
                                    </span>
                                </div>

                                <div
                                    className="tactic-description"
                                    dangerouslySetInnerHTML={{ __html: tactic.description }}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedTactic && (
                <div className="modal-overlay" onClick={() => setSelectedTactic(null)}>
                    <div className="modal-content tactic-detail" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{selectedTactic.name}</h2>
                            <button className="close-btn" onClick={() => setSelectedTactic(null)}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="tactic-detail-tags">
                                <div className="tag-group">
                                    <span className="tag-label">{t('commander.tier') || 'Tier'}:</span>
                                    <span
                                        className="tag"
                                        style={{ backgroundColor: getTierColor(selectedTactic.tacticTier) }}
                                    >
                                        {t(`commander.${selectedTactic.tacticTier}`) || selectedTactic.tacticTier}
                                    </span>
                                </div>

                                <div className="tag-group">
                                    <span className="tag-label">{t('commander.category') || 'Category'}:</span>
                                    <span
                                        className="tag"
                                        style={{ backgroundColor: getCategoryColor(selectedTactic.tacticCategory) }}
                                    >
                                        {t(`commander.${selectedTactic.tacticCategory}`) || selectedTactic.tacticCategory}
                                    </span>
                                </div>

                                <div className="tag-group">
                                    <span className="tag-label">{t('commander.cost') || 'Cost'}:</span>
                                    <span className="action-cost">
                                        <ActionIcon cost={selectedTactic.cost} />
                                    </span>
                                </div>
                            </div>

                            <div
                                className="tactic-detail-description"
                                dangerouslySetInnerHTML={{ __html: selectedTactic.description }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TacticsPanel;
