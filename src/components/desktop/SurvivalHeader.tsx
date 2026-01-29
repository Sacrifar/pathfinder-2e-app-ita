import React, { useMemo, useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useDiceRoller } from '../../hooks/useDiceRoller';

interface SurvivalHeaderProps {
    ac: number;
    hp: {
        current: number;
        max: number;
        temporary?: number;
    };
    fortitude: number;
    reflex: number;
    will: number;
    onRest: () => void;
    onAddCondition: () => void;
    onAddBuff: () => void;
    onHPChange?: (newHP: { current: number; temporary?: number }) => void;
    // Save modifiers from feats
    fortitudeModifiers?: { value: number; source: string; type: 'buff' | 'penalty' }[];
    reflexModifiers?: { value: number; source: string; type: 'buff' | 'penalty' }[];
    willModifiers?: { value: number; source: string; type: 'buff' | 'penalty' }[];
}

export const SurvivalHeader: React.FC<SurvivalHeaderProps> = React.memo(({
    ac,
    hp,
    fortitude,
    reflex,
    will,
    onRest,
    onAddCondition,
    onAddBuff,
    onHPChange,
    fortitudeModifiers = [],
    reflexModifiers = [],
    willModifiers = [],
}) => {
    const { t } = useLanguage();
    const { rollDice } = useDiceRoller();
    const [showHPControls, setShowHPControls] = useState(false);
    const [customHPValue, setCustomHPValue] = useState('');
    const [sliderValue, setSliderValue] = useState(0);

    const temporaryHP = hp.temporary ?? 0;
    const effectiveMax = hp.max + temporaryHP;
    const hpPercentage = useMemo(() => (hp.current / effectiveMax) * 100, [hp.current, effectiveMax]);
    const hpColor = useMemo(() =>
        hpPercentage > 50 ? 'var(--color-success, #10b981)' : hpPercentage > 25 ? 'var(--color-warning, #f59e0b)' : 'var(--color-danger, #ef4444)',
        [hpPercentage]
    );

    // Reset slider value when HP change externally or modal opens
    React.useEffect(() => {
        setSliderValue(0);
    }, [hp.current, showHPControls]);

    // Handle slider change (update visual only)
    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        setSliderValue(value);
    };

    // Handle slider apply button
    const handleSliderApply = () => {
        if (sliderValue < 0) {
            handleDamage(Math.abs(sliderValue));
        } else if (sliderValue > 0) {
            handleHeal(sliderValue);
        }
        setSliderValue(0);
    };

    // Handle damage (reduce HP)
    const handleDamage = (damage: number) => {
        if (!onHPChange) return;

        // First reduce temporary HP
        let newTempHP = temporaryHP;
        let newCurrentHP = hp.current;

        if (newTempHP > 0) {
            if (damage <= newTempHP) {
                newTempHP -= damage;
                damage = 0;
            } else {
                damage -= newTempHP;
                newTempHP = 0;
            }
        }

        // Then reduce current HP
        newCurrentHP = Math.max(0, hp.current - damage);

        onHPChange({
            current: newCurrentHP,
            temporary: newTempHP
        });
    };

    // Handle healing (restore HP)
    const handleHeal = (amount: number) => {
        if (!onHPChange) return;
        const newHP = Math.min(hp.max, hp.current + amount);
        onHPChange({ current: newHP, temporary: temporaryHP });
    };

    // Handle temporary HP
    const handleSetTempHP = (amount: number) => {
        if (!onHPChange) return;
        const newTempHP = Math.max(0, amount);
        onHPChange({ current: hp.current, temporary: newTempHP });
    };

    // Handle custom HP value
    const handleCustomHP = () => {
        const value = parseInt(customHPValue);
        if (isNaN(value)) return;

        if (value < 0) {
            handleDamage(Math.abs(value));
        } else {
            handleHeal(value);
        }
        setCustomHPValue('');
    };

    return (
        <div className="survival-header">
            {/* AC Display */}
            <div className="survival-ac">
                <div className="ac-value">{ac}</div>
                <div className="ac-label">AC</div>
            </div>

            {/* HP Display */}
            <div className="survival-hp">
                <div
                    className="hp-bar-container"
                    onClick={() => onHPChange && setShowHPControls(true)}
                    style={onHPChange ? { cursor: 'pointer' } : undefined}
                    title={onHPChange ? (t('hp.clickToManage') || 'Click to manage HP') : undefined}
                >
                    <div
                        className="hp-bar-fill"
                        style={{
                            width: `${Math.min(100, hpPercentage)}%`,
                            backgroundColor: hpColor,
                        }}
                    />
                    {temporaryHP > 0 && (
                        <div
                            className="hp-bar-fill hp-temp-fill"
                            style={{
                                width: `${(temporaryHP / effectiveMax) * 100}%`,
                                left: `${(hp.current / effectiveMax) * 100}%`,
                            }}
                        />
                    )}
                </div>
                <div className="hp-text">
                    <span className="hp-current">{hp.current}</span>
                    {temporaryHP > 0 && (
                        <span className="hp-temporary">(+{temporaryHP})</span>
                    )}
                    <span className="hp-separator">/</span>
                    <span className="hp-max">{hp.max}</span>
                    <span className="hp-label">HP</span>
                </div>

                {/* HP Controls Modal */}
                {showHPControls && onHPChange && (
                    <div className="hp-modal-overlay" onClick={() => setShowHPControls(false)}>
                        <div className="hp-modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="hp-modal-header">
                                <h3>{t('hp.manageTitle') || 'Manage Hit Points'}</h3>
                                <button
                                    className="hp-modal-close"
                                    onClick={() => setShowHPControls(false)}
                                    title={t('actions.close') || 'Close'}
                                >
                                    ×
                                </button>
                            </div>
                            <div className="hp-modal-body">
                        <div className="hp-controls-section slider">
                            <span className="hp-controls-label">{t('hp.quickAdjust') || 'Quick Adjust'}</span>
                            <div className="hp-slider-container">
                                <input
                                    type="range"
                                    className="hp-slider"
                                    min={-hp.max}
                                    max={hp.max}
                                    value={sliderValue}
                                    onChange={handleSliderChange}
                                    style={{
                                        background: `linear-gradient(to right, var(--desktop-accent-red) 0%, var(--desktop-accent-red) 50%, var(--desktop-accent-green) 50%, var(--desktop-accent-green) 100%)`
                                    }}
                                />
                                <div className="hp-slider-labels">
                                    <span className="hp-slider-label min">-{hp.max}</span>
                                    <span className="hp-slider-label current">
                                        {sliderValue !== 0 ? (
                                            <span style={{ color: sliderValue < 0 ? 'var(--desktop-accent-red)' : 'var(--desktop-accent-green)' }}>
                                                {sliderValue > 0 ? '+' : ''}{sliderValue}
                                            </span>
                                        ) : (
                                            hp.current
                                        )}
                                    </span>
                                    <span className="hp-slider-label max">+{hp.max}</span>
                                </div>
                                <button
                                    className="hp-btn apply"
                                    onClick={handleSliderApply}
                                    disabled={sliderValue === 0}
                                    style={{ marginTop: '8px', width: '100%' }}
                                >
                                    {t('hp.apply') || 'Apply'}
                                </button>
                            </div>
                        </div>

                        <div className="hp-controls-section custom">
                            <span className="hp-controls-label">{t('hp.customHP') || 'Custom HP'}</span>
                            <input
                                type="number"
                                className="hp-custom-input"
                                placeholder={t('hp.customValue') || 'Enter value (negative for damage)'}
                                value={customHPValue}
                                onChange={(e) => setCustomHPValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleCustomHP();
                                    }
                                }}
                            />
                            <button
                                className="hp-btn apply"
                                onClick={handleCustomHP}
                                disabled={!customHPValue}
                            >
                                {t('hp.apply') || 'Apply'}
                            </button>
                        </div>

                        <div className="hp-controls-section custom">
                            <span className="hp-controls-label">{t('hp.tempHP') || 'Temporary HP'}</span>
                            <div className="hp-temp-controls">
                                <input
                                    type="number"
                                    className="hp-custom-input"
                                    placeholder={t('hp.tempValue') || 'Set temp HP'}
                                    value={temporaryHP}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value) || 0;
                                        handleSetTempHP(Math.max(0, value));
                                    }}
                                    min={0}
                                />
                                <button
                                    className="hp-btn temp"
                                    onClick={() => handleSetTempHP(0)}
                                    disabled={temporaryHP <= 0}
                                    title="Clear temporary HP"
                                >
                                    {t('hp.clear') || 'Clear'}
                                </button>
                            </div>
                            {temporaryHP > 0 && (
                                <span className="hp-temp-info">{t('hp.currentTemp') || 'Current'}: {temporaryHP}</span>
                            )}
                        </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Saving Throws */}
            <div className="survival-saves">
                <div
                    className="save-item rollable"
                    onClick={() => {
                        const formula = `1d20${fortitude >= 0 ? '+' : ''}${fortitude}`;
                        rollDice(formula, `${t('dice.saveRoll') || 'Save Roll'}: ${t('stats.fortitude') || 'Fortitude'}`);
                    }}
                    title={`${t('dice.roll') || 'Roll'} ${t('stats.fortitude') || 'Fortitude'}`}
                >
                    <span className="save-label">FORT</span>
                    <span className={`save-value ${fortitude >= 0 ? 'positive' : 'negative'}`}>
                        {fortitude >= 0 ? `+${fortitude}` : fortitude}
                    </span>
                    {fortitudeModifiers.length > 0 && (
                        <div className="save-modifier-badges">
                            {fortitudeModifiers.map((mod, i) => (
                                <span key={i} className="save-modifier-badge" title={mod.source}>
                                    {mod.value > 0 ? '+' : ''}{mod.value}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                <div
                    className="save-item rollable"
                    onClick={() => {
                        const formula = `1d20${reflex >= 0 ? '+' : ''}${reflex}`;
                        rollDice(formula, `${t('dice.saveRoll') || 'Save Roll'}: ${t('stats.reflex') || 'Reflex'}`);
                    }}
                    title={`${t('dice.roll') || 'Roll'} ${t('stats.reflex') || 'Reflex'}`}
                >
                    <span className="save-label">REF</span>
                    <span className={`save-value ${reflex >= 0 ? 'positive' : 'negative'}`}>
                        {reflex >= 0 ? `+${reflex}` : reflex}
                    </span>
                    {reflexModifiers.length > 0 && (
                        <div className="save-modifier-badges">
                            {reflexModifiers.map((mod, i) => (
                                <span key={i} className="save-modifier-badge" title={mod.source}>
                                    {mod.value > 0 ? '+' : ''}{mod.value}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                <div
                    className="save-item rollable"
                    onClick={() => {
                        const formula = `1d20${will >= 0 ? '+' : ''}${will}`;
                        rollDice(formula, `${t('dice.saveRoll') || 'Save Roll'}: ${t('stats.will') || 'Will'}`);
                    }}
                    title={`${t('dice.roll') || 'Roll'} ${t('stats.will') || 'Will'}`}
                >
                    <span className="save-label">WILL</span>
                    <span className={`save-value ${will >= 0 ? 'positive' : 'negative'}`}>
                        {will >= 0 ? `+${will}` : will}
                    </span>
                    {willModifiers.length > 0 && (
                        <div className="save-modifier-badges">
                            {willModifiers.map((mod, i) => (
                                <span key={i} className="save-modifier-badge" title={mod.source}>
                                    {mod.value > 0 ? '+' : ''}{mod.value}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Utility Buttons */}
            <div className="survival-actions">
                <button className="survival-action-btn" onClick={onRest}>
                    Rest
                </button>
                <button className="survival-action-btn" onClick={onAddCondition}>
                    +Cond
                </button>
                <button className="survival-action-btn" onClick={onAddBuff}>
                    +Buff
                </button>
            </div>
        </div>
    );
});

SurvivalHeader.displayName = 'SurvivalHeader';
