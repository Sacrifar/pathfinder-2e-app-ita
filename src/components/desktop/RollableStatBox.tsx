/**
 * RollableStatBox Component
 * Example integration component showing how to make stat boxes clickable for dice rolling
 */

import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useDiceRoller } from '../../hooks/useDiceRoller';

interface RollableStatBoxProps {
    label: string;
    value: number | string;
    modifier?: number;
    rollType?: 'save' | 'skill' | 'attack' | 'perception' | 'initiative';
    customLabel?: string;
}

export const RollableStatBox: React.FC<RollableStatBoxProps> = ({
    label,
    value,
    modifier,
    rollType = 'save',
    customLabel,
}) => {
    const { t } = useLanguage();
    const { rollDice } = useDiceRoller();

    const handleRoll = () => {
        if (modifier === undefined) return;

        const formula = `1d20${modifier >= 0 ? '+' : ''}${modifier}`;
        let rollLabel = customLabel;

        if (!rollLabel) {
            switch (rollType) {
                case 'save':
                    rollLabel = `${t('dice.saveRoll') || 'Save Roll'}: ${label}`;
                    break;
                case 'skill':
                    rollLabel = `${t('dice.skillCheck') || 'Skill Check'}: ${label}`;
                    break;
                case 'attack':
                    rollLabel = `${t('dice.attackRoll') || 'Attack Roll'}: ${label}`;
                    break;
                case 'perception':
                    rollLabel = t('dice.perceptionCheck') || 'Perception Check';
                    break;
                case 'initiative':
                    rollLabel = t('dice.initiative') || 'Initiative';
                    break;
            }
        }

        rollDice(formula, rollLabel);
    };

    const formatValue = (val: number | string) => {
        if (typeof val === 'number') {
            return val >= 0 ? `+${val}` : `${val}`;
        }
        return val;
    };

    return (
        <div
            className={`stat-box ${modifier !== undefined ? 'rollable' : ''}`}
            onClick={modifier !== undefined ? handleRoll : undefined}
            title={modifier !== undefined ? `${t('dice.roll') || 'Roll'} ${label}` : label}
        >
            <span className="stat-box-label">{label}</span>
            <span className="stat-box-value">{formatValue(value)}</span>
            {modifier !== undefined && (
                <span className="stat-box-roll-hint"><img src="/assets/icon_d20_orange_small.png" alt="D20" style={{ width: '16px', height: '16px', verticalAlign: 'middle' }} /></span>
            )}
        </div>
    );
};

export default RollableStatBox;
