import React from 'react';
import { Character } from '../../types';
import { getConditions, LoadedCondition } from '../../data/pf2e-loader';
import { useLanguage } from '../../hooks/useLanguage';

interface ActiveConditionsProps {
    character: Character;
    onRemove: (conditionId: string) => void;
    onUpdateValue: (conditionId: string, value: number) => void;
}

export const ActiveConditions: React.FC<ActiveConditionsProps> = ({
    character,
    onRemove,
    onUpdateValue,
}) => {
    const { t } = useLanguage();
    const allConditions = getConditions();

    if (!character.conditions || character.conditions.length === 0) {
        return null;
    }

    const activeList = character.conditions.map(c => {
        const data = allConditions.find(ac => ac.id === c.id);
        return {
            ...c,
            name: data?.name || 'Unknown',
            description: data?.description || '',
            isValued: data?.isValued || false,
            defValue: data?.value,
        };
    });

    return (
        <div className="active-conditions-list">
            {activeList.map(condition => (
                <div key={condition.id} className="active-condition-card">
                    <div className="condition-header">
                        <span className="condition-name">{condition.name}</span>
                        <button
                            className="remove-condition-btn"
                            onClick={() => onRemove(condition.id)}
                            title={t('actions.remove') || 'Remove'}
                        >
                            ×
                        </button>
                    </div>
                    {condition.isValued && (
                        <div className="condition-value-control">
                            <button
                                onClick={() => onUpdateValue(condition.id, (condition.value || 1) - 1)}
                                disabled={(condition.value || 1) <= 1}
                            >
                                -
                            </button>
                            <span>{condition.value}</span>
                            <button
                                onClick={() => onUpdateValue(condition.id, (condition.value || 1) + 1)}
                            >
                                +
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
