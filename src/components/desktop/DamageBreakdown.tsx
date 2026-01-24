import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { DamageComponent, DamageBreakdown as DamageBreakdownType } from '../../utils/damageBreakdown';

interface DamageBreakdownProps {
    breakdown: DamageBreakdownType;
    onToggleConditional?: (conditionalId: string) => void;
    compact?: boolean;  // If true, show compact view (inline with damage)
}

export const DamageBreakdown: React.FC<DamageBreakdownProps> = ({
    breakdown,
    onToggleConditional,
    compact = false,
}) => {
    const { t, language } = useLanguage();

    const getLabel = (comp: DamageComponent) => {
        return language === 'it' && comp.labelIt ? comp.labelIt : comp.label;
    };

    const getDamageTypeColor = (type?: string) => {
        if (!type) return '';
        const colors: Record<string, string> = {
            'physical': '',
            'slashing': '#e74c3c',
            'piercing': '#e67e22',
            'bludgeoning': '#f39c12',
            'fire': '#e74c3c',
            'cold': '#3498db',
            'electricity': '#f1c40f',
            'acid': '#2ecc71',
            'sonic': '#9b59b6',
            'force': '#95a5a6',
            'positive': '#f5f5dc',
            'negative': '#8b0000',
            'holy': '#ffd700',
            'unholy': '#4b0082',
            'spirit': '#dda0dd',
            'bleed': '#8b0000',
            'vitality': '#ff69b4',
        };
        return colors[type.toLowerCase()] || '';
    };

    const hasContent = breakdown.base.length > 0 ||
        breakdown.runes.length > 0 ||
        breakdown.modifier.length > 0 ||
        breakdown.buffs.length > 0 ||
        breakdown.conditional.length > 0;

    if (!hasContent) {
        return null;
    }

    // Compact view: show inline summary
    if (compact) {
        const allParts = [
            ...breakdown.base,
            ...breakdown.runes.filter(r => r.isActive !== false),
            ...breakdown.modifier,
            ...breakdown.buffs,
        ];

        return (
            <span className="damage-breakdown-compact">
                {allParts.map((part, idx) => (
                    <span
                        key={idx}
                        className="damage-part"
                        style={{ color: getDamageTypeColor(part.damageType) }}
                        title={`${getLabel(part)}: ${part.value}`}
                    >
                        {part.value}
                    </span>
                ))}
            </span>
        );
    }

    // Full view: show detailed breakdown with checkboxes
    return (
        <div className="damage-breakdown">
            {/* Base Damage */}
            {breakdown.base.length > 0 && (
                <div className="damage-section">
                    <span className="damage-section-title">
                        {t('damage.base') || 'Base'}
                    </span>
                    {breakdown.base.map((comp, idx) => (
                        <span
                            key={idx}
                            className="damage-component"
                            style={{ color: getDamageTypeColor(comp.damageType) }}
                        >
                            {comp.value}
                        </span>
                    ))}
                </div>
            )}

            {/* Runes */}
            {breakdown.runes.length > 0 && (
                <div className="damage-section">
                    <span className="damage-section-title">
                        {t('damage.runes') || 'Runes'}
                    </span>
                    {breakdown.runes.map((comp, idx) => {
                        const isConditional = comp.conditionalId !== undefined;
                        return (
                            <span
                                key={idx}
                                className={`damage-component ${isConditional ? 'conditional' : ''} ${comp.isActive === false ? 'inactive' : ''}`}
                                style={{ color: getDamageTypeColor(comp.damageType) }}
                                title={`${getLabel(comp)}${comp.source ? ` (${comp.source})` : ''}`}
                            >
                                {comp.value}
                                {isConditional && onToggleConditional && (
                                    <input
                                        type="checkbox"
                                        checked={comp.isActive !== false}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            if (comp.conditionalId) {
                                                onToggleConditional(comp.conditionalId);
                                            }
                                        }}
                                        className="damage-checkbox"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                )}
                            </span>
                        );
                    })}
                </div>
            )}

            {/* Modifiers */}
            {breakdown.modifier.length > 0 && (
                <div className="damage-section">
                    <span className="damage-section-title">
                        {t('damage.modifiers') || 'Modifiers'}
                    </span>
                    {breakdown.modifier.map((comp, idx) => (
                        <span
                            key={idx}
                            className="damage-component modifier"
                            style={{ color: getDamageTypeColor(comp.damageType) }}
                            title={getLabel(comp)}
                        >
                            {comp.value}
                        </span>
                    ))}
                </div>
            )}

            {/* Buffs */}
            {breakdown.buffs.length > 0 && (
                <div className="damage-section">
                    <span className="damage-section-title">
                        {t('damage.buffs') || 'Buffs'}
                    </span>
                    {breakdown.buffs.map((comp, idx) => (
                        <span
                            key={idx}
                            className="damage-component buff"
                            style={{ color: getDamageTypeColor(comp.damageType) }}
                            title={getLabel(comp)}
                        >
                            {comp.value}
                        </span>
                    ))}
                </div>
            )}

            {/* Conditional Damage */}
            {breakdown.conditional.length > 0 && (
                <div className="damage-section conditional-section">
                    <span className="damage-section-title">
                        {t('damage.conditional') || 'Conditional'}
                    </span>
                    {breakdown.conditional.map((comp, idx) => (
                        <label
                            key={idx}
                            className={`damage-component conditional ${comp.isActive ? 'active' : 'inactive'}`}
                            style={{ color: comp.isActive ? getDamageTypeColor(comp.damageType) : '#666' }}
                        >
                            <input
                                type="checkbox"
                                checked={comp.isActive}
                                onChange={() => onToggleConditional?.(comp.conditionalId!)}
                                className="damage-checkbox"
                            />
                            <span className="conditional-damage-text">
                                <span className="conditional-value">{comp.value}</span>
                                <span className="conditional-label">{getLabel(comp)}</span>
                            </span>
                        </label>
                    ))}
                </div>
            )}

            {/* Total */}
            {breakdown.total && (
                <div className="damage-total">
                    <span className="damage-total-label">{t('damage.total') || 'Total'}:</span>
                    <span className="damage-total-value">{breakdown.total}</span>
                </div>
            )}
        </div>
    );
};

export default DamageBreakdown;
