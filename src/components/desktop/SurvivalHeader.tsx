import React, { useMemo } from 'react';

interface SurvivalHeaderProps {
    ac: number;
    hp: {
        current: number;
        max: number;
    };
    fortitude: number;
    reflex: number;
    will: number;
    onRest: () => void;
    onAddCondition: () => void;
    onAddBuff: () => void;
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
}) => {
    const hpPercentage = useMemo(() => (hp.current / hp.max) * 100, [hp.current, hp.max]);
    const hpColor = useMemo(() =>
        hpPercentage > 50 ? '#4caf50' : hpPercentage > 25 ? '#ff9800' : '#f44336',
        [hpPercentage]
    );

    return (
        <div className="survival-header">
            {/* AC Display */}
            <div className="survival-ac">
                <div className="ac-value">{ac}</div>
                <div className="ac-label">AC</div>
            </div>

            {/* HP Display */}
            <div className="survival-hp">
                <div className="hp-bar-container">
                    <div
                        className="hp-bar-fill"
                        style={{
                            width: `${hpPercentage}%`,
                            backgroundColor: hpColor,
                        }}
                    />
                </div>
                <div className="hp-text">
                    <span className="hp-current">{hp.current}</span>
                    <span className="hp-separator">/</span>
                    <span className="hp-max">{hp.max}</span>
                    <span className="hp-label">HP</span>
                </div>
            </div>

            {/* Saving Throws */}
            <div className="survival-saves">
                <div className="save-item">
                    <span className="save-label">FORT</span>
                    <span className={`save-value ${fortitude >= 0 ? 'positive' : 'negative'}`}>
                        {fortitude >= 0 ? `+${fortitude}` : fortitude}
                    </span>
                </div>
                <div className="save-item">
                    <span className="save-label">REF</span>
                    <span className={`save-value ${reflex >= 0 ? 'positive' : 'negative'}`}>
                        {reflex >= 0 ? `+${reflex}` : reflex}
                    </span>
                </div>
                <div className="save-item">
                    <span className="save-label">WILL</span>
                    <span className={`save-value ${will >= 0 ? 'positive' : 'negative'}`}>
                        {will >= 0 ? `+${will}` : will}
                    </span>
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
