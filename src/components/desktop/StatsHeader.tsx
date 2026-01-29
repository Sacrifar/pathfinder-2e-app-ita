import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useDiceRoller } from '../../hooks/useDiceRoller';
import { StatTooltip } from './StatTooltip';

interface StatsHeaderProps {
    hp: { current: number; max: number };
    speed: number;
    size: string;
    perception: number;
    ac: number;
    heroPoints: number;
    classDC?: number;
    fortitude?: number;
    reflex?: number;
    will?: number;
    abilityScores?: {
        str: number;
        dex: number;
        con: number;
        int: number;
        wis: number;
        cha: number;
    };
    onAddCondition: () => void;
    onAddCustomBuff: () => void;
    onAdvanceRound?: () => void;
    // Active modifiers
    acModifiers?: { value: number; source: string; type: 'buff' | 'penalty' }[];
    perceptionModifiers?: { value: number; source: string; type: 'buff' | 'penalty' }[];
    speedModifiers?: { value: number; source: string; type: 'buff' | 'penalty' }[];
    fortitudeModifiers?: { value: number; source: string; type: 'buff' | 'penalty' }[];
    reflexModifiers?: { value: number; source: string; type: 'buff' | 'penalty' }[];
    willModifiers?: { value: number; source: string; type: 'buff' | 'penalty' }[];
}

export const StatsHeader: React.FC<StatsHeaderProps> = ({
    hp,
    speed,
    size,
    perception,
    ac,
    heroPoints,
    classDC,
    fortitude,
    reflex,
    will,
    abilityScores,
    onAddCondition,
    onAddCustomBuff,
    onAdvanceRound,
    acModifiers = [],
    perceptionModifiers = [],
    speedModifiers = [],
    fortitudeModifiers = [],
    reflexModifiers = [],
    willModifiers = [],
}) => {
    const { t } = useLanguage();
    const { rollDice } = useDiceRoller();

    const formatModifier = (value: number) => {
        return value >= 0 ? `+${value}` : `${value}`;
    };

    // Handle dice roll for saves and perception
    const handleRoll = (type: 'fortitude' | 'reflex' | 'will' | 'perception', value: number, label: string) => {
        const formula = `1d20${value >= 0 ? '+' : ''}${value}`;
        rollDice(formula, label);
    };

    const hasActiveModifiers = (modifiers: typeof acModifiers) => {
        return modifiers && modifiers.length > 0;
    };

    const getModifierBadges = (modifiers: typeof acModifiers) => {
        if (!modifiers || modifiers.length === 0) return null;

        const netModifier = modifiers.reduce((sum, mod) => sum + mod.value, 0);

        return (
            <div
                className="modifier-badges"
                style={{
                    display: 'flex',
                    gap: '4px',
                    marginTop: '4px',
                }}
            >
                {modifiers.slice(0, 3).map((mod, index) => (
                    <span
                        key={index}
                        className="badge-active"
                        style={{
                            fontSize: '10px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: mod.value > 0
                                ? 'rgba(16, 185, 129, 0.2)'
                                : 'rgba(239, 68, 68, 0.2)',
                            color: mod.value > 0
                                ? 'var(--color-success, #10b981)'
                                : 'var(--color-danger, #ef4444)',
                            border: `1px solid ${mod.value > 0
                                ? 'var(--color-success, #10b981)'
                                : 'var(--color-danger, #ef4444)'}`,
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                        }}
                        title={mod.source}
                    >
                        {mod.source}
                    </span>
                ))}
                {modifiers.length > 3 && (
                    <span
                        style={{
                            fontSize: '10px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: 'var(--bg-secondary, #2a2a2a)',
                            color: 'var(--text-secondary, #888)',
                            border: '1px solid var(--border-primary, #333)',
                        }}
                    >
                        +{modifiers.length - 3}
                    </span>
                )}
            </div>
        );
    };

    const createBreakdown = (base: number, modifiers: typeof acModifiers, baseLabel: string) => {
        const breakdown = [
            { label: baseLabel, value: base, type: 'base' as const },
            ...modifiers.map(mod => ({
                label: mod.source,
                value: mod.value,
                type: mod.type as 'buff' | 'penalty',
            })),
        ];
        const total = breakdown.reduce((sum, item) => sum + item.value, 0);
        return { breakdown, total };
    };

    const acBreakdown = createBreakdown(10, acModifiers, 'Base AC');
    const perceptionBreakdown = createBreakdown(perception, [], 'Wisdom');
    const speedBreakdown = createBreakdown(speed, speedModifiers, 'Base Speed');

    return (
        <div className="stats-header">
            <div className={`stat-box hp ${hp.current <= hp.max / 2 ? 'low-hp' : ''}`}>
                <span className="stat-box-label">HP</span>
                <span className="stat-box-value">{hp.current}/{hp.max}</span>
            </div>

            <div className="stat-box" style={{ position: 'relative' }}>
                <StatTooltip
                    breakdown={speedBreakdown.breakdown}
                    total={speedBreakdown.total}
                    label={t('stats.speed') || 'Speed Breakdown'}
                >
                    <div>
                        <span className="stat-box-label">{t('stats.speed') || 'Speed'}</span>
                        <span className="stat-box-value">{speed}</span>
                        {hasActiveModifiers(speedModifiers) && getModifierBadges(speedModifiers)}
                    </div>
                </StatTooltip>
            </div>

            <div className="stat-box">
                <span className="stat-box-label">{t('stats.size') || 'Size'}</span>
                <span className="stat-box-value">{size}</span>
            </div>

            <div className="stat-box" style={{ position: 'relative' }}>
                <StatTooltip
                    breakdown={perceptionBreakdown.breakdown}
                    total={perceptionBreakdown.total}
                    label={t('stats.perception') || 'Perception Breakdown'}
                >
                    <div
                        className="rollable"
                        onClick={() => handleRoll('perception', perception, t('dice.perceptionCheck') || 'Perception Check')}
                        style={{ cursor: 'pointer' }}
                        title={`${t('dice.roll') || 'Roll'} ${t('stats.perception') || 'Perception'}`}
                    >
                        <span className="stat-box-label">{t('stats.perception') || 'Perception'}</span>
                        <span className="stat-box-value">{formatModifier(perception)}</span>
                        {hasActiveModifiers(perceptionModifiers) && getModifierBadges(perceptionModifiers)}
                    </div>
                </StatTooltip>
            </div>

            <div
                className={`stat-box ac ${hasActiveModifiers(acModifiers) ? 'has-modifiers' : ''}`}
                style={{
                    position: 'relative',
                    border: hasActiveModifiers(acModifiers)
                        ? '1px solid var(--accent, #f59e0b)'
                        : undefined,
                }}
            >
                <StatTooltip
                    breakdown={acBreakdown.breakdown}
                    total={acBreakdown.total}
                    label="Armor Class Breakdown"
                >
                    <div>
                        <span className="stat-box-label">AC</span>
                        <span
                            className="stat-box-value"
                            style={{
                                color: hasActiveModifiers(acModifiers)
                                    ? 'var(--accent, #f59e0b)'
                                    : undefined,
                            }}
                        >
                            {ac}
                        </span>
                        {hasActiveModifiers(acModifiers) && getModifierBadges(acModifiers)}
                    </div>
                </StatTooltip>
            </div>

            {/* Saving Throws */}
            {(fortitude !== undefined || reflex !== undefined || will !== undefined) && (
                <>
                    {fortitude !== undefined && (
                        <div
                            className={`stat-box save-box rollable ${hasActiveModifiers(fortitudeModifiers) ? 'has-modifiers' : ''}`}
                            onClick={() => handleRoll('fortitude', fortitude, `${t('dice.saveRoll') || 'Save Roll'}: ${t('stats.fortitude') || 'Fortitude'}`)}
                            title={`${t('dice.roll') || 'Roll'} ${t('stats.fortitude') || 'Fortitude'}`}
                            style={{ cursor: 'pointer', position: 'relative' }}
                        >
                            <span className="stat-box-label">{t('stats.fortitude') || 'Fort'}</span>
                            <span className="stat-box-value">{formatModifier(fortitude)}</span>
                            {hasActiveModifiers(fortitudeModifiers) && getModifierBadges(fortitudeModifiers)}
                        </div>
                    )}
                    {reflex !== undefined && (
                        <div
                            className={`stat-box save-box rollable ${hasActiveModifiers(reflexModifiers) ? 'has-modifiers' : ''}`}
                            onClick={() => handleRoll('reflex', reflex, `${t('dice.saveRoll') || 'Save Roll'}: ${t('stats.reflex') || 'Reflex'}`)}
                            title={`${t('dice.roll') || 'Roll'} ${t('stats.reflex') || 'Reflex'}`}
                            style={{ cursor: 'pointer', position: 'relative' }}
                        >
                            <span className="stat-box-label">{t('stats.reflex') || 'Ref'}</span>
                            <span className="stat-box-value">{formatModifier(reflex)}</span>
                            {hasActiveModifiers(reflexModifiers) && getModifierBadges(reflexModifiers)}
                        </div>
                    )}
                    {will !== undefined && (
                        <div
                            className={`stat-box save-box rollable ${hasActiveModifiers(willModifiers) ? 'has-modifiers' : ''}`}
                            onClick={() => handleRoll('will', will, `${t('dice.saveRoll') || 'Save Roll'}: ${t('stats.will') || 'Will'}`)}
                            title={`${t('dice.roll') || 'Roll'} ${t('stats.will') || 'Will'}`}
                            style={{ cursor: 'pointer', position: 'relative' }}
                        >
                            <span className="stat-box-label">{t('stats.will') || 'Will'}</span>
                            <span className="stat-box-value">{formatModifier(will)}</span>
                            {hasActiveModifiers(willModifiers) && getModifierBadges(willModifiers)}
                        </div>
                    )}
                </>
            )}

            {/* Ability Scores */}
            {abilityScores && (
                <>
                    <div className="stat-box ability-box">
                        <span className="stat-box-label">{t('stats.str') || 'STR'}</span>
                        <span className="stat-box-value">{abilityScores.str}</span>
                    </div>
                    <div className="stat-box ability-box">
                        <span className="stat-box-label">{t('stats.dex') || 'DEX'}</span>
                        <span className="stat-box-value">{abilityScores.dex}</span>
                    </div>
                    <div className="stat-box ability-box">
                        <span className="stat-box-label">{t('stats.con') || 'CON'}</span>
                        <span className="stat-box-value">{abilityScores.con}</span>
                    </div>
                    <div className="stat-box ability-box">
                        <span className="stat-box-label">{t('stats.int') || 'INT'}</span>
                        <span className="stat-box-value">{abilityScores.int}</span>
                    </div>
                    <div className="stat-box ability-box">
                        <span className="stat-box-label">{t('stats.wis') || 'WIS'}</span>
                        <span className="stat-box-value">{abilityScores.wis}</span>
                    </div>
                    <div className="stat-box ability-box">
                        <span className="stat-box-label">{t('stats.cha') || 'CHA'}</span>
                        <span className="stat-box-value">{abilityScores.cha}</span>
                    </div>
                </>
            )}

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
