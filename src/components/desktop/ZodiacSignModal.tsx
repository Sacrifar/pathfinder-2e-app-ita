import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { ZODIAC_SIGNS, ZODIAC_SPELLS, getFrequencyText } from '../../data/innateSpellSources';
import { getSpells } from '../../data/pf2e-loader';
import type { LoadedSpell } from '../../data/pf2e-loader';

interface ZodiacSignModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (zodiacSign: string) => void;
}

export const ZodiacSignModal: React.FC<ZodiacSignModalProps> = ({
    isOpen,
    onClose,
    onApply,
}) => {
    const { t } = useLanguage();
    const [selectedSign, setSelectedSign] = useState<string | null>(null);

    // Load all spells for lookup
    const allSpells = useMemo(() => getSpells(), []);

    // Helper to get spell by ID
    const getSpellFromId = (spellId: string): LoadedSpell | undefined => {
        return allSpells.find(s => s.id === spellId);
    };

    if (!isOpen) return null;

    const handleApply = () => {
        if (selectedSign) {
            onApply(selectedSign);
            onClose();
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const getAbilityLabel = (ability: string): string => {
        return t(`abilities.${ability}`) || ability.toUpperCase();
    };

    const zodiacSigns = Object.entries(ZODIAC_SIGNS);

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="selection-modal zodiac-sign-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{t('builder.chooseZodiacSign') || 'Choose Your Zodiac Sign'}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="zodiac-sign-content">
                    <p className="zodiac-sign-description">
                        {t('builder.zodiacSignDescription') ||
                            'Select a zodiac sign to determine your ability boost and innate spell.'}
                    </p>

                    <div className="zodiac-signs-grid">
                        {zodiacSigns.map(([signKey, signData]) => {
                            const spells = ZODIAC_SPELLS[signKey];
                            const spell = spells?.[0];
                            const spellData = spell ? getSpellFromId(spell.spellId) : null;

                            // Type assertion for proper TypeScript inference
                            const name = signData.name;
                            const nameIt = signData.nameIt;
                            const ability = signData.ability;

                            return (
                                <button
                                    key={signKey}
                                    className={`zodiac-sign-card ${selectedSign === signKey ? 'selected' : ''}`}
                                    onClick={() => setSelectedSign(signKey)}
                                >
                                    <div className="zodiac-sign-header">
                                        <span className="zodiac-sign-name">
                                            {nameIt ? `${name} (${nameIt})` : name}
                                        </span>
                                    </div>

                                    <div className="zodiac-sign-details">
                                        <div className="zodiac-sign-ability">
                                            <span className="ability-label">
                                                {t('builder.abilityBoost') || 'Ability Boost'}:
                                            </span>
                                            <span className="ability-value">
                                                {getAbilityLabel(ability)}
                                            </span>
                                        </div>

                                        {spellData && (
                                            <div className="zodiac-sign-spell">
                                                <span className="spell-label">
                                                    {t('builder.innateSpell') || 'Innate Spell'}:
                                                </span>
                                                <span className="spell-name">{spellData.name}</span>
                                                <span className="spell-frequency">
                                                    {getFrequencyText(spell.frequency)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="modal-btn modal-btn-secondary" onClick={onClose}>
                        {t('actions.cancel') || 'Cancel'}
                    </button>
                    <button
                        className="modal-btn modal-btn-primary"
                        onClick={handleApply}
                        disabled={!selectedSign}
                    >
                        {t('actions.apply') || 'Apply'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ZodiacSignModal;
