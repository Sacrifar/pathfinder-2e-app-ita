import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';

interface StatsHeaderProps {
    hp: { current: number; max: number };
    speed: number;
    size: string;
    perception: number;
    ac: number;
    heroPoints: number;
    classDC?: number;
    onAddCondition: () => void;
    onAddCustomBuff: () => void;
    onAdvanceRound?: () => void;
}

export const StatsHeader: React.FC<StatsHeaderProps> = ({
    hp,
    speed,
    size,
    perception,
    ac,
    heroPoints,
    classDC,
    onAddCondition,
    onAddCustomBuff,
    onAdvanceRound,
}) => {
    const { t } = useLanguage();

    const formatModifier = (value: number) => {
        return value >= 0 ? `+${value}` : `${value}`;
    };

    return (
        <div className="stats-header">
            <div className="stat-box hp">
                <span className="stat-box-label">HP</span>
                <span className="stat-box-value">{hp.current}/{hp.max}</span>
            </div>

            <div className="stat-box">
                <span className="stat-box-label">{t('stats.speed') || 'Speed'}</span>
                <span className="stat-box-value">{speed}</span>
            </div>

            <div className="stat-box">
                <span className="stat-box-label">{t('stats.size') || 'Size'}</span>
                <span className="stat-box-value">{size}</span>
            </div>

            <div className="stat-box">
                <span className="stat-box-label">{t('stats.perception') || 'Perception'}</span>
                <span className="stat-box-value">{formatModifier(perception)}</span>
            </div>

            <div className="stat-box ac">
                <span className="stat-box-label">AC</span>
                <span className="stat-box-value">{ac}</span>
            </div>

            <div className="hero-points">
                <span className="hero-points-label">{t('stats.heroPoints') || 'Hero Points'}</span>
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className={`hero-point ${i < heroPoints ? '' : 'empty'}`}
                        title={`Hero Point ${i + 1}`}
                    />
                ))}
            </div>

            {classDC && (
                <div className="stat-box">
                    <span className="stat-box-label">{t('stats.classDC') || 'Class DC'}</span>
                    <span className="stat-box-value">{classDC}</span>
                </div>
            )}

            <div className="stats-header-right">
                <button className="header-btn" onClick={onAddCondition}>
                    {t('actions.addCondition') || 'Add Condition'}
                </button>
                <button className="header-btn" onClick={onAddCustomBuff}>
                    {t('actions.addCustomBuff') || 'Add Buff'}
                </button>
                {onAdvanceRound && (
                    <button className="header-btn advance-round-btn" onClick={onAdvanceRound}>
                        {t('actions.advanceRound') || 'Advance Round'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default StatsHeader;
