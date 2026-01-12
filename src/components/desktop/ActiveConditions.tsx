import React from 'react';
import { Character, Buff } from '../../types';
import { getConditions, LoadedCondition } from '../../data/pf2e-loader';
import { useLanguage } from '../../hooks/useLanguage';

interface ActiveConditionsProps {
    character: Character;
    onRemoveCondition: (conditionId: string) => void;
    onUpdateConditionValue: (conditionId: string, value: number) => void;
    onRemoveBuff: (buffId: string) => void;
    onUpdateBuffDuration: (buffId: string, duration: number) => void;
}

type ActiveEffect = {
    id: string;
    type: 'condition' | 'buff';
    name: string;
    description?: string;
    value?: number;
    isValued: boolean;
    duration?: number;
    source?: string;
    bonus?: number;
    bonusType?: string;
};

export const ActiveConditions: React.FC<ActiveConditionsProps> = ({
    character,
    onRemoveCondition,
    onUpdateConditionValue,
    onRemoveBuff,
    onUpdateBuffDuration,
}) => {
    const { t } = useLanguage();
    const allConditions = getConditions();

    // Combine conditions and buffs into a single display list
    const activeEffects: ActiveEffect[] = [
        ...character.conditions.map(c => {
            const data = allConditions.find(ac => ac.id === c.id);
            return {
                id: c.id,
                type: 'condition' as const,
                name: data?.name || 'Unknown',
                description: data?.description,
                value: c.value,
                isValued: data?.isValued || false,
                duration: c.duration,
            };
        }),
        ...character.buffs.map(b => ({
            id: b.id,
            type: 'buff' as const,
            name: b.name,
            description: b.source,
            bonus: b.bonus,
            bonusType: b.type,
            duration: b.duration,
            source: b.source,
            isValued: false,
        }))
    ];

    if (activeEffects.length === 0) {
        return null;
    }

    return (
        <div className="active-effects-list">
            {activeEffects.map(effect => (
                <div
                    key={effect.id}
                    className={`active-effect-card ${effect.type === 'buff' ? 'buff' : 'condition'}`}
                >
                    <div className="effect-header">
                        <div className="effect-info">
                            {effect.type === 'buff' && (
                                <span className="effect-icon buff-icon">+</span>
                            )}
                            <span className="effect-name">{effect.name}</span>
                            {effect.bonus !== undefined && effect.bonus !== 0 && (
                                <span className={`effect-value ${effect.bonus > 0 ? 'positive' : 'negative'}`}>
                                    {effect.bonus > 0 ? '+' : ''}{effect.bonus}
                                </span>
                            )}
                            {effect.duration !== undefined && (
                                <span className="effect-duration">{effect.duration}r</span>
                            )}
                            {effect.bonusType && (
                                <span className="effect-type-badge">{effect.bonusType}</span>
                            )}
                        </div>
                        <button
                            className="remove-effect-btn"
                            onClick={() => {
                                if (effect.type === 'condition') {
                                    onRemoveCondition(effect.id);
                                } else {
                                    onRemoveBuff(effect.id);
                                }
                            }}
                            title={t('actions.remove') || 'Remove'}
                        >
                            ×
                        </button>
                    </div>

                    {/* Condition value controls (e.g., Frightened 2) */}
                    {effect.isValued && effect.type === 'condition' && (
                        <div className="condition-value-control">
                            <button
                                onClick={() => onUpdateConditionValue(effect.id, (effect.value || 1) - 1)}
                                disabled={(effect.value || 1) <= 1}
                            >
                                -
                            </button>
                            <span>{effect.value}</span>
                            <button
                                onClick={() => onUpdateConditionValue(effect.id, (effect.value || 1) + 1)}
                            >
                                +
                            </button>
                        </div>
                    )}

                    {/* Duration controls for timed effects */}
                    {effect.duration !== undefined && effect.type === 'buff' && (
                        <div className="duration-control">
                            <button
                                onClick={() => onUpdateBuffDuration(effect.id, effect.duration! - 1)}
                                disabled={effect.duration <= 1}
                            >
                                -
                            </button>
                            <span>{effect.duration} rounds</span>
                            <button
                                onClick={() => onUpdateBuffDuration(effect.id, effect.duration! + 1)}
                            >
                                +
                            </button>
                        </div>
                    )}

                    {effect.source && (
                        <div className="effect-source">{effect.source}</div>
                    )}
                </div>
            ))}
        </div>
    );
};
