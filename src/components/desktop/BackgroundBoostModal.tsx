import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { backgrounds } from '../../data';
import { AbilityName } from '../../types';

interface BackgroundBoostModalProps {
    backgroundId: string;
    onClose: () => void;
    onApply: (boosts: AbilityName[]) => void;
}

export const BackgroundBoostModal: React.FC<BackgroundBoostModalProps> = ({
    backgroundId,
    onClose,
    onApply,
}) => {
    const { t } = useLanguage();
    const background = backgrounds.find(b => b.id === backgroundId);

    const [selectedBoost, setSelectedBoost] = useState<AbilityName | null>(null);
    const [selectedFreeBoost, setSelectedFreeBoost] = useState<AbilityName | null>(null);

    if (!background) {
        return null;
    }

    // Extract the two ability options (excluding 'free')
    const abilityOptions = background.abilityBoosts.filter(b => b !== 'free') as AbilityName[];
    const hasFree = background.abilityBoosts.includes('free');

    const handleApply = () => {
        if (selectedBoost && selectedFreeBoost) {
            onApply([selectedBoost, selectedFreeBoost]);
        }
    };

    const canApply = selectedBoost !== null && selectedFreeBoost !== null;

    const getAbilityLabel = (ability: AbilityName | 'free'): string => {
        if (ability === 'free') return t('abilities.free') || 'Free';
        return t(`abilities.${ability}`) || ability.toUpperCase();
    };

    // For free boost, exclude only the selected ability (not both options)
    const freeBoostOptions = useMemo((): AbilityName[] => {
        const allAbilities: AbilityName[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
        // Exclude only the ability that was selected as the first boost
        const filtered = selectedBoost
            ? allAbilities.filter(a => a !== selectedBoost)
            : allAbilities;
        return filtered;
    }, [selectedBoost]);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="selection-modal background-boost-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{t('builder.backgroundBoosts') || 'Background Ability Boosts'}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="boost-selection-content">
                    {/* First boost: choose between the two offered abilities */}
                    <div className="boost-section">
                        <h3>{t('builder.chooseBoost') || 'Choose one boost:'}</h3>
                        <div className="boost-options">
                            {abilityOptions.map(ability => (
                                <button
                                    key={ability}
                                    className={`boost-option ${selectedBoost === ability ? 'selected' : ''}`}
                                    onClick={() => setSelectedBoost(ability)}
                                >
                                    {getAbilityLabel(ability)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Second boost: free (but can't be one of the two above) */}
                    {hasFree && (
                        <div className="boost-section">
                            <h3>{t('builder.chooseFreeBoost') || 'Choose one free boost:'}</h3>
                            <p className="boost-hint">
                                {t('builder.freeBoostHint') || '(Cannot be one of the abilities above)'}
                            </p>
                            <div className="boost-options">
                                {freeBoostOptions.map(ability => (
                                    <button
                                        key={ability}
                                        className={`boost-option ${selectedFreeBoost === ability ? 'selected' : ''}`}
                                        onClick={() => setSelectedFreeBoost(ability)}
                                    >
                                        {getAbilityLabel(ability)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="modal-btn modal-btn-secondary" onClick={onClose}>
                        {t('actions.cancel') || 'Cancel'}
                    </button>
                    <button
                        className="modal-btn modal-btn-primary"
                        onClick={handleApply}
                        disabled={!canApply}
                    >
                        {t('actions.apply') || 'Apply'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BackgroundBoostModal;
