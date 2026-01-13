import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../contexts/ThemeContext';
import { Character } from '../../types/character';

interface VariantRulesPanelProps {
    character: Character;
    onCharacterUpdate: (character: Character) => void;
    onClose: () => void;
}

interface VariantRuleOption {
    key: keyof Character['variantRules'];
    name: string;
    nameIt: string;
    description: string;
    descriptionIt: string;
    level: 'basic' | 'advanced' | 'expert';
}

const VARIANT_RULES: VariantRuleOption[] = [
    {
        key: 'freeArchetype',
        name: 'Free Archetype',
        nameIt: 'Archetipo Gratuito',
        description: 'Gain an extra Class Feat at even levels (2, 4, 6, etc.) that must be used for Archetype feats.',
        descriptionIt: 'Ottieni un talento di classe extra ai livelli pari (2, 4, 6, ecc.) che deve essere usato per talenti di archetipo.',
        level: 'basic',
    },
    {
        key: 'gradualAbilityBoosts',
        name: 'Gradual Ability Boosts',
        nameIt: 'Aumenti Graduali delle Caratteristiche',
        description: 'Gain 1 ability boost per level instead of 4 every 5 levels.',
        descriptionIt: 'Ottieni 1 aumento di caratteristica per livello invece di 4 ogni 5 livelli.',
        level: 'basic',
    },
    {
        key: 'automaticBonusProgression',
        name: 'Automatic Bonus Progression',
        nameIt: 'Progressione Automatica dei Bonus',
        description: 'Items grant fixed bonuses based on level. Ignore item bonuses on equipment.',
        descriptionIt: 'Gli oggetti concedono bonus fissi basati sul livello. Ignora i bonus degli oggetti sull\'equipaggiamento.',
        level: 'advanced',
    },
    {
        key: 'proficiencyWithoutLevel',
        name: 'Proficiency Without Level',
        nameIt: 'Competenza Senza Livello',
        description: 'Proficiency bonus is 0/2/4/6/8 based on rank, without adding level.',
        descriptionIt: 'Il bonus di competenza è 0/2/4/6/8 basato sul rango, senza aggiungere il livello.',
        level: 'advanced',
    },
    {
        key: 'ancestryParagon',
        name: 'Ancestry Paragon',
        nameIt: 'Eroe della Stirpe',
        description: 'Gain extra Ancestry Feats at levels 1, 3, 7, 11, 15, 19.',
        descriptionIt: 'Ottieni talenti della stirpe extra ai livelli 1, 3, 7, 11, 15, 19.',
        level: 'expert',
    },
    {
        key: 'dualClass',
        name: 'Dual Class',
        nameIt: 'Classe Doppia',
        description: 'Select two classes at level 1. Combine best HP and proficiencies.',
        descriptionIt: 'Seleziona due classi al livello 1. Combina i migliori PF e le competenze.',
        level: 'expert',
    },
];

export const VariantRulesPanel: React.FC<VariantRulesPanelProps> = ({
    character,
    onCharacterUpdate,
    onClose,
}) => {
    const { language } = useLanguage();
    const { theme } = useTheme();

    const handleToggleRule = (ruleKey: keyof Character['variantRules']) => {
        const currentVariantRules = character.variantRules || {
            freeArchetype: false,
            dualClass: false,
            ancestryParagon: false,
            automaticBonusProgression: false,
            gradualAbilityBoosts: false,
            proficiencyWithoutLevel: false,
        };

        const updatedCharacter = {
            ...character,
            variantRules: {
                ...currentVariantRules,
                [ruleKey]: !currentVariantRules[ruleKey],
            },
            updatedAt: new Date().toISOString(),
        };

        // Special handling for Dual Class
        if (ruleKey === 'dualClass' && !currentVariantRules.dualClass) {
            // Enabling dual class - reset secondary class if needed
            // This would be handled by a separate dual class selector
        }

        onCharacterUpdate(updatedCharacter);
    };

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'basic':
                return 'var(--color-success, #10b981)';
            case 'advanced':
                return 'var(--color-warning, #f59e0b)';
            case 'expert':
                return 'var(--color-error, #ef4444)';
            default:
                return 'var(--text-secondary, #888)';
        }
    };

    const getLevelLabel = (level: string) => {
        switch (level) {
            case 'basic':
                return language === 'it' ? 'Base' : 'Basic';
            case 'advanced':
                return language === 'it' ? 'Avanzato' : 'Advanced';
            case 'expert':
                return language === 'it' ? 'Esperto' : 'Expert';
            default:
                return level;
        }
    };

    const activeCount = Object.values(character.variantRules || {}).filter(Boolean).length;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: theme === 'dark'
                        ? 'var(--bg-elevated, #1a1a1a)'
                        : 'var(--bg-elevated, #ffffff)',
                    borderRadius: '16px',
                    maxWidth: '700px',
                    width: '100%',
                    maxHeight: '80vh',
                    overflow: 'auto',
                    border: `1px solid ${theme === 'dark' ? 'var(--border-primary, #333)' : 'var(--border-primary, #ddd)'}`,
                    boxShadow: theme === 'dark'
                        ? '0 20px 50px rgba(0, 0, 0, 0.5)'
                        : '0 20px 50px rgba(0, 0, 0, 0.15)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    style={{
                        padding: '24px',
                        borderBottom: `1px solid ${theme === 'dark' ? 'var(--border-primary, #333)' : 'var(--border-primary, #ddd)'}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <div>
                        <h2
                            style={{
                                margin: 0,
                                fontSize: '24px',
                                color: theme === 'dark' ? 'var(--text-primary, #fff)' : 'var(--text-primary, #000)',
                                fontFamily: 'var(--font-family-display)',
                            }}
                        >
                            {language === 'it' ? 'Regole Varianti' : 'Variant Rules'}
                        </h2>
                        <p
                            style={{
                                margin: '4px 0 0 0',
                                fontSize: '13px',
                                color: 'var(--text-secondary, #888)',
                            }}
                        >
                            {language === 'it'
                                ? `Opzioni dal Gamemastery Guide. Attive: ${activeCount}/6`
                                : `Options from Gamemastery Guide. Active: ${activeCount}/6`}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-secondary, #888)',
                            fontSize: '24px',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '8px',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--bg-hover, #2a2a2a)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'none';
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Rules List */}
                <div style={{ padding: '16px 24px' }}>
                    {VARIANT_RULES.map((rule) => {
                        const variantRules = character.variantRules || {};
                        const isActive = variantRules[rule.key];
                        const ruleName = language === 'it' ? rule.nameIt : rule.name;
                        const ruleDesc = language === 'it' ? rule.descriptionIt : rule.description;

                        return (
                            <div
                                key={rule.key}
                                onClick={() => handleToggleRule(rule.key)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '16px',
                                    padding: '16px',
                                    marginBottom: '12px',
                                    background: isActive
                                        ? theme === 'dark'
                                            ? 'rgba(16, 185, 129, 0.1)'
                                            : 'rgba(16, 185, 129, 0.05)'
                                        : theme === 'dark'
                                            ? 'var(--bg-secondary, #2a2a2a)'
                                            : 'var(--bg-secondary, #f5f5f5)',
                                    border: `1px solid ${isActive
                                        ? 'var(--color-success, #10b981)'
                                        : theme === 'dark'
                                            ? 'var(--border-primary, #333)'
                                            : 'var(--border-primary, #ddd)'}`,
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'none';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                {/* Toggle Switch */}
                                <div
                                    style={{
                                        position: 'relative',
                                        width: '48px',
                                        height: '26px',
                                        flexShrink: 0,
                                        marginTop: '2px',
                                    }}
                                >
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: isActive
                                                ? 'var(--color-success, #10b981)'
                                                : theme === 'dark'
                                                    ? 'var(--bg-tertiary, #333)'
                                                    : 'var(--bg-tertiary, #ddd)',
                                            borderRadius: '13px',
                                            transition: 'background 0.3s',
                                        }}
                                    />
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '3px',
                                            left: isActive ? '25px' : '3px',
                                            width: '20px',
                                            height: '20px',
                                            background: 'white',
                                            borderRadius: '50%',
                                            transition: 'left 0.3s',
                                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                                        }}
                                    />
                                </div>

                                {/* Content */}
                                <div style={{ flex: 1 }}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            marginBottom: '4px',
                                        }}
                                    >
                                        <h4
                                            style={{
                                                margin: 0,
                                                fontSize: '15px',
                                                fontWeight: 600,
                                                color: isActive
                                                    ? 'var(--color-success, #10b981)'
                                                    : theme === 'dark'
                                                        ? 'var(--text-primary, #fff)'
                                                        : 'var(--text-primary, #000)',
                                            }}
                                        >
                                            {ruleName}
                                        </h4>
                                        <span
                                            style={{
                                                fontSize: '10px',
                                                padding: '2px 8px',
                                                borderRadius: '10px',
                                                background: getLevelColor(rule.level),
                                                color: 'white',
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                            }}
                                        >
                                            {getLevelLabel(rule.level)}
                                        </span>
                                    </div>
                                    <p
                                        style={{
                                            margin: 0,
                                            fontSize: '13px',
                                            lineHeight: '1.5',
                                            color: 'var(--text-secondary, #888)',
                                        }}
                                    >
                                        {ruleDesc}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div
                    style={{
                        padding: '16px 24px',
                        borderTop: `1px solid ${theme === 'dark' ? 'var(--border-primary, #333)' : 'var(--border-primary, #ddd)'}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '12px',
                        color: 'var(--text-secondary, #888)',
                    }}
                >
                    <span>
                        {language === 'it'
                            ? '⚠️ Le regole varianti cambiano la progressione del personaggio'
                            : '⚠️ Variant rules alter character progression'}
                    </span>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 24px',
                            background: 'var(--color-primary, #8B0000)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 0, 0, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        {language === 'it' ? 'Chiudi' : 'Close'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VariantRulesPanel;
