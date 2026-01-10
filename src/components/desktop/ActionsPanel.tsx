import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Character } from '../../types';

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

// Common PF2e actions reference
const commonActions: Action[] = [
    { id: 'strike', name: 'Strike', cost: '1', description: 'Attack with a weapon or unarmed attack.', traits: ['attack'] },
    { id: 'stride', name: 'Stride', cost: '1', description: 'Move up to your Speed.', traits: ['move'] },
    { id: 'step', name: 'Step', cost: '1', description: 'Move 5 feet without triggering reactions.', traits: ['move'] },
    { id: 'interact', name: 'Interact', cost: '1', description: 'Grab an object, open a door, draw a weapon, or manipulate.', traits: ['manipulate'] },
    { id: 'seek', name: 'Seek', cost: '1', description: 'Scan an area for creatures or objects.', traits: ['concentrate'] },
    { id: 'raise-shield', name: 'Raise a Shield', cost: '1', description: 'Raise a shield to gain its circumstance bonus to AC.', traits: [] },
    { id: 'take-cover', name: 'Take Cover', cost: '1', description: 'Gain cover or improve cover.', traits: [] },
    { id: 'ready', name: 'Ready', cost: '2', description: 'Prepare to take an action when a trigger occurs.', traits: ['concentrate'] },
    { id: 'sustain', name: 'Sustain', cost: '1', description: 'Maintain a spell or effect.', traits: ['concentrate'] },
    { id: 'delay', name: 'Delay', cost: 'free', description: 'Wait to act later in the round.', traits: [] },
    { id: 'drop-prone', name: 'Drop Prone', cost: '1', description: 'Fall prone for +2 to AC vs ranged, -2 vs melee.', traits: ['move'] },
    { id: 'stand', name: 'Stand', cost: '1', description: 'Stand up from prone.', traits: ['move'] },
    { id: 'escape', name: 'Escape', cost: '1', description: 'Escape from being grabbed, restrained, or immobilized.', traits: ['attack'] },
    { id: 'aid', name: 'Aid', cost: 'reaction', description: 'Help an ally with a check.', traits: [] },
];

// Skill actions
const skillActions: Action[] = [
    { id: 'recall-knowledge', name: 'Recall Knowledge', cost: '1', skill: 'various', description: 'Attempt to remember information.', traits: ['concentrate'] },
    { id: 'balance', name: 'Balance', cost: '1', skill: 'acrobatics', description: 'Move across a narrow or unsteady surface.', traits: ['move'] },
    { id: 'tumble-through', name: 'Tumble Through', cost: '1', skill: 'acrobatics', description: 'Move through an enemy\'s space.', traits: ['move'] },
    { id: 'climb', name: 'Climb', cost: '1', skill: 'athletics', description: 'Move up, down, or across an incline.', traits: ['move'] },
    { id: 'grapple', name: 'Grapple', cost: '1', skill: 'athletics', description: 'Grab a creature using Athletics.', traits: ['attack'] },
    { id: 'shove', name: 'Shove', cost: '1', skill: 'athletics', description: 'Push a creature away or to the ground.', traits: ['attack'] },
    { id: 'trip', name: 'Trip', cost: '1', skill: 'athletics', description: 'Try to knock a creature prone.', traits: ['attack'] },
    { id: 'disarm', name: 'Disarm', cost: '1', skill: 'athletics', description: 'Knock something out of a creature\'s grasp.', traits: ['attack'] },
    { id: 'demoralize', name: 'Demoralize', cost: '1', skill: 'intimidation', description: 'Cow a creature with threats.', traits: ['auditory', 'concentrate', 'emotion', 'mental'] },
    { id: 'feint', name: 'Feint', cost: '1', skill: 'deception', description: 'Fake out an opponent.', traits: ['mental'] },
    { id: 'hide', name: 'Hide', cost: '1', skill: 'stealth', description: 'Become hidden from creatures.', traits: [] },
    { id: 'sneak', name: 'Sneak', cost: '1', skill: 'stealth', description: 'Move while hidden.', traits: ['move'] },
];

export const ActionsPanel: React.FC<ActionsPanelProps> = ({
    character,
    onActionClick,
}) => {
    const { t } = useLanguage();
    const [filter, setFilter] = useState<ActionCost | 'all' | 'skill'>('all');

    const getCostIcon = (cost: ActionCost): string => {
        switch (cost) {
            case 'free': return '◇';
            case 'reaction': return '⟲';
            case '1': return '◆';
            case '2': return '◆◆';
            case '3': return '◆◆◆';
        }
    };

    const getCostLabel = (cost: ActionCost): string => {
        switch (cost) {
            case 'free': return t('actions.free') || 'Free';
            case 'reaction': return t('actions.reaction') || 'Reaction';
            case '1': return '1 ' + (t('actions.action') || 'Action');
            case '2': return '2 ' + (t('actions.actions') || 'Actions');
            case '3': return '3 ' + (t('actions.actions') || 'Actions');
        }
    };

    // Filter actions based on selection
    const getFilteredActions = (): Action[] => {
        if (filter === 'all') return commonActions;
        if (filter === 'skill') return skillActions;
        return commonActions.filter(a => a.cost === filter);
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
                    ◆
                </button>
                <button
                    className={`filter-btn ${filter === '2' ? 'active' : ''}`}
                    onClick={() => setFilter('2')}
                >
                    ◆◆
                </button>
                <button
                    className={`filter-btn ${filter === '3' ? 'active' : ''}`}
                    onClick={() => setFilter('3')}
                >
                    ◆◆◆
                </button>
                <button
                    className={`filter-btn ${filter === 'reaction' ? 'active' : ''}`}
                    onClick={() => setFilter('reaction')}
                >
                    ⟲
                </button>
                <button
                    className={`filter-btn ${filter === 'free' ? 'active' : ''}`}
                    onClick={() => setFilter('free')}
                >
                    ◇
                </button>
                <button
                    className={`filter-btn ${filter === 'skill' ? 'active' : ''}`}
                    onClick={() => setFilter('skill')}
                >
                    {t('filters.skill') || 'Skill'}
                </button>
            </div>

            {/* Actions Grid */}
            <div className="actions-grid">
                {filteredActions.map(action => (
                    <div
                        key={action.id}
                        className="action-card"
                        onClick={() => onActionClick(action)}
                    >
                        <div className="action-header">
                            <span className="action-cost">{getCostIcon(action.cost)}</span>
                            <span className="action-name">{action.name}</span>
                        </div>
                        <p className="action-description">{action.description}</p>
                        {action.skill && (
                            <span className="action-skill">{action.skill}</span>
                        )}
                        {action.traits.length > 0 && (
                            <div className="action-traits">
                                {action.traits.map(trait => (
                                    <span key={trait} className="action-trait">{trait}</span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActionsPanel;
