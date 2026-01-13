import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../contexts/ThemeContext';

interface StatBreakdown {
    label: string;
    value: number;
    type: 'base' | 'ability' | 'proficiency' | 'item' | 'buff' | 'penalty';
}

interface StatTooltipProps {
    children: React.ReactElement;
    breakdown: StatBreakdown[];
    total: number;
    label?: string;
}

export const StatTooltip: React.FC<StatTooltipProps> = ({
    children,
    breakdown,
    total,
    label
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const { theme } = useTheme();
    const { t } = useLanguage();

    const getTypeColor = (type: StatBreakdown['type']) => {
        switch (type) {
            case 'base':
                return 'var(--text-secondary, #888)';
            case 'ability':
                return 'var(--accent, #f59e0b)';
            case 'proficiency':
                return 'var(--text-primary, #fff)';
            case 'item':
                return 'var(--color-info, #3b82f6)';
            case 'buff':
                return 'var(--color-success, #10b981)';
            case 'penalty':
                return 'var(--color-danger, #ef4444)';
            default:
                return 'var(--text-primary, #fff)';
        }
    };

    const getTypeLabel = (type: StatBreakdown['type']) => {
        switch (type) {
            case 'base':
                return t('tooltip.base') || 'Base';
            case 'ability':
                return t('tooltip.ability') || 'Ability';
            case 'proficiency':
                return t('tooltip.proficiency') || 'Proficiency';
            case 'item':
                return t('tooltip.item') || 'Item';
            case 'buff':
                return t('tooltip.buff') || 'Buff';
            case 'penalty':
                return t('tooltip.penalty') || 'Penalty';
            default:
                return type;
        }
    };

    return (
        <div
            style={{ position: 'relative', display: 'inline-block' }}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}

            {isVisible && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        marginBottom: '8px',
                        padding: '12px',
                        background: theme === 'dark'
                            ? 'var(--bg-elevated, #1a1a1a)'
                            : 'var(--bg-elevated, #ffffff)',
                        border: `1px solid ${theme === 'dark' ? 'var(--border-primary, #333)' : 'var(--border-primary, #ddd)'}`,
                        borderRadius: '8px',
                        minWidth: '200px',
                        maxWidth: '280px',
                        boxShadow: theme === 'dark'
                            ? '0 4px 12px rgba(0, 0, 0, 0.5)'
                            : '0 4px 12px rgba(0, 0, 0, 0.15)',
                        zIndex: 1000,
                        pointerEvents: 'none',
                        transition: 'opacity 0.2s ease, transform 0.2s ease',
                    }}
                >
                    {label && (
                        <div
                            style={{
                                fontSize: '12px',
                                fontWeight: 'bold',
                                color: 'var(--text-secondary, #888)',
                                marginBottom: '8px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                            }}
                        >
                            {label}
                        </div>
                    )}

                    <div
                        style={{
                            fontSize: '13px',
                            color: theme === 'dark' ? 'var(--text-primary, #fff)' : 'var(--text-primary, #000)',
                        }}
                    >
                        {breakdown.map((item, index) => (
                            <div
                                key={index}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '4px',
                                    fontSize: '12px',
                                }}
                            >
                                <span style={{ color: 'var(--text-secondary, #888)' }}>
                                    {item.label}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span
                                        style={{
                                            fontSize: '10px',
                                            color: getTypeColor(item.type),
                                            textTransform: 'uppercase',
                                            fontWeight: 500,
                                        }}
                                    >
                                        {getTypeLabel(item.type)}
                                    </span>
                                    <span
                                        style={{
                                            fontWeight: 600,
                                            color: item.value >= 0
                                                ? 'var(--color-success, #10b981)'
                                                : 'var(--color-danger, #ef4444)',
                                        }}
                                    >
                                        {item.value >= 0 ? '+' : ''}{item.value}
                                    </span>
                                </div>
                            </div>
                        ))}

                        <div
                            style={{
                                marginTop: '8px',
                                paddingTop: '8px',
                                borderTop: `1px solid ${theme === 'dark' ? 'var(--border-primary, #333)' : 'var(--border-primary, #ddd)'}`,
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontWeight: 'bold',
                            }}
                        >
                            <span style={{ color: 'var(--text-secondary, #888)' }}>
                                {t('tooltip.total') || 'Total'}
                            </span>
                            <span style={{ color: 'var(--accent, #f59e0b)' }}>
                                {total >= 0 ? '+' : ''}{total}
                            </span>
                        </div>
                    </div>

                    {/* Arrow */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '-6px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 0,
                            height: 0,
                            borderLeft: '6px solid transparent',
                            borderRight: '6px solid transparent',
                            borderTop: `6px solid ${theme === 'dark' ? 'var(--bg-elevated, #1a1a1a)' : 'var(--bg-elevated, #ffffff)'}`,
                        }}
                    />
                </div>
            )}
        </div>
    );
};
