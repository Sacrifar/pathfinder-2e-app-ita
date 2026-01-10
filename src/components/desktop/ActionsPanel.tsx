import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Character } from '../../types';
import { getActions } from '../../data/pf2e-loader';

// Import action icons
import actionSingle from '../../data/Azioni/action_single.png';
import actionDouble from '../../data/Azioni/action_double.png';
import actionTriple from '../../data/Azioni/action_triple.png';
import actionFree from '../../data/Azioni/action_free.png';
import actionReaction from '../../data/Azioni/action_reaction.png';

type ActionCost = 'free' | 'reaction' | '1' | '2' | '3';

interface Action {
    id: string;
    name: string;
    cost: ActionCost;
    skill?: string;
    description: string;
    traits: string[];
}

interface ActionsPanelProps {
    character: Character;
    onActionClick: (action: Action) => void;
}

export const ActionsPanel: React.FC<ActionsPanelProps> = ({
    character,
    onActionClick,
}) => {
    const { t } = useLanguage();
    const [filter, setFilter] = useState<ActionCost | 'all' | 'skill'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Load actions from pf2e data
    const allActions = useMemo(() => {
        const loaded = getActions();
        return loaded.map((a): Action => ({
            id: a.id,
            name: a.name,
            cost: a.cost,
            description: a.description,
            traits: a.traits,
        }));
    }, []);

    // Skill actions (those with skill-related traits or categories)
    const skillActions = useMemo(() => {
        return allActions.filter(a =>
            a.traits.some(t => ['skill', 'trained-only'].includes(t)) ||
            ['offensive', 'defensive'].includes(a.traits[0] || '')
        );
    }, [allActions]);

    // Basic/common actions
    const commonActions = useMemo(() => {
        const basicNames = ['Strike', 'Stride', 'Step', 'Interact', 'Seek', 'Raise a Shield',
            'Take Cover', 'Ready', 'Sustain', 'Delay', 'Drop Prone', 'Stand', 'Escape', 'Aid',
            'Crawl', 'Leap', 'Release', 'Point Out', 'Avert Gaze'];
        return allActions.filter(a => basicNames.includes(a.name));
    }, [allActions]);

    // Get the icon image for action cost
    const getCostIcon = (cost: ActionCost): string => {
        switch (cost) {
            case 'free': return actionFree;
            case 'reaction': return actionReaction;
            case '1': return actionSingle;
            case '2': return actionDouble;
            case '3': return actionTriple;
        }
    };

    // Filter actions based on selection
    const getFilteredActions = (): Action[] => {
        let actions: Action[];
        if (filter === 'all') {
            actions = commonActions.length > 0 ? commonActions : allActions.slice(0, 20);
        } else if (filter === 'skill') {
            actions = skillActions.length > 0 ? skillActions : allActions.filter(a => a.traits.length > 0).slice(0, 20);
        } else {
            actions = allActions.filter(a => a.cost === filter);
        }

        // Apply search filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            actions = actions.filter(a =>
                a.name.toLowerCase().includes(q) ||
                a.description.toLowerCase().includes(q) ||
                a.traits.some(t => t.toLowerCase().includes(q))
            );
        }

        return actions;
    };

    const filteredActions = getFilteredActions();

    return (
        <div className="actions-panel">
            <div className="panel-header">
                <h3>{t('tabs.actions') || 'Actions'}</h3>
            </div>

            {/* Filter Buttons */}
            <div className="actions-filters">
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    {t('filters.all') || 'All'}
                </button>
                <button
                    className={`filter-btn ${filter === '1' ? 'active' : ''}`}
                    onClick={() => setFilter('1')}
                >
                    <img src={actionSingle} alt="1 Action" className="filter-icon" />
                </button>
                <button
                    className={`filter-btn ${filter === '2' ? 'active' : ''}`}
                    onClick={() => setFilter('2')}
                >
                    <img src={actionDouble} alt="2 Actions" className="filter-icon" />
                </button>
                <button
                    className={`filter-btn ${filter === '3' ? 'active' : ''}`}
                    onClick={() => setFilter('3')}
                >
                    <img src={actionTriple} alt="3 Actions" className="filter-icon" />
                </button>
                <button
                    className={`filter-btn ${filter === 'reaction' ? 'active' : ''}`}
                    onClick={() => setFilter('reaction')}
                >
                    <img src={actionReaction} alt="Reaction" className="filter-icon" />
                </button>
                <button
                    className={`filter-btn ${filter === 'free' ? 'active' : ''}`}
                    onClick={() => setFilter('free')}
                >
                    <img src={actionFree} alt="Free Action" className="filter-icon" />
                </button>
                <button
                    className={`filter-btn ${filter === 'skill' ? 'active' : ''}`}
                    onClick={() => setFilter('skill')}
                >
                    {t('filters.skill') || 'Skill'}
                </button>
            </div>

            {/* Actions Grid - Simplified: only icon + name */}
            <div className="actions-grid actions-grid-compact">
                {filteredActions.map(action => (
                    <div
                        key={action.id}
                        className="action-card action-card-compact"
                        onClick={() => onActionClick(action)}
                    >
                        <img
                            src={getCostIcon(action.cost)}
                            alt={action.cost}
                            className="action-cost-icon"
                        />
                        <span className="action-name">{action.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActionsPanel;
