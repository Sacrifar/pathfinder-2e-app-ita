import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Character, AbilityName } from '../../types';
import '../../styles/desktop.css';

interface LevelUpBoostModalProps {
    character: Character;
    level: 5 | 10 | 15 | 20;
    onClose: () => void;
    onApply: (boosts: AbilityName[]) => void;
}

const ABILITIES: { key: AbilityName; name: string; nameIt: string }[] = [
    { key: 'str', name: 'Strength', nameIt: 'Forza' },
    { key: 'dex', name: 'Dexterity', nameIt: 'Destrezza' },
    { key: 'con', name: 'Constitution', nameIt: 'Costituzione' },
    { key: 'int', name: 'Intelligence', nameIt: 'Intelligenza' },
    { key: 'wis', name: 'Wisdom', nameIt: 'Saggezza' },
    { key: 'cha', name: 'Charisma', nameIt: 'Carisma' },
];

export const LevelUpBoostModal: React.FC<LevelUpBoostModalProps> = ({
    character,
    level,
    onClose,
    onApply,
}) => {
    const { t, language } = useLanguage();

    // Initialize with existing selections for this level
    const [selectedBoosts, setSelectedBoosts] = useState<AbilityName[]>(() => {
        return character.abilityBoosts?.levelUp?.[level] || [];
    });

    // Calculate current scores (without this level's boosts applied)
    const currentScores = useMemo(() => {
        const scores = { ...character.abilityScores };
        // Remove this level's boosts from the calculation to show "before" state
        const existingBoosts = character.abilityBoosts?.levelUp?.[level] || [];
        for (const ability of existingBoosts) {
            if (scores[ability] >= 18) {
                scores[ability] -= 1;
            } else {
                scores[ability] -= 2;
            }
        }
        return scores;
    }, [character.abilityScores, character.abilityBoosts?.levelUp, level]);

    // Calculate preview scores with currently selected boosts
    const previewScores = useMemo(() => {
        const scores = { ...currentScores };
        for (const ability of selectedBoosts) {
            if (scores[ability] >= 18) {
                scores[ability] += 1;
            } else {
                scores[ability] += 2;
            }
        }
        return scores;
    }, [currentScores, selectedBoosts]);

    const toggleBoost = (ability: AbilityName) => {
        if (selectedBoosts.includes(ability)) {
            // Remove boost
            setSelectedBoosts(prev => prev.filter(a => a !== ability));
        } else if (selectedBoosts.length < 4) {
            // Add boost (max 4, can't boost same ability twice at same level)
            setSelectedBoosts(prev => [...prev, ability]);
        }
    };

    const handleApply = () => {
        onApply(selectedBoosts);
    };

    const getMod = (score: number) => {
        const mod = Math.floor((score - 10) / 2);
        return mod >= 0 ? `+${mod}` : `${mod}`;
    };

    const getAbilityName = (ability: AbilityName) => {
        const ab = ABILITIES.find(a => a.key === ability);
        return language === 'it' ? ab?.nameIt : ab?.name;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="selection-modal ability-boost-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        {t('builder.levelUpBoosts') || 'Level-Up Boosts'} - {t('builder.level') || 'Level'} {level}
                    </h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="ability-boost-content">
                    {/* Current & Preview Scores Display */}
                    <div className="ability-scores-display">
                        {ABILITIES.map(ability => {
                            const current = currentScores[ability.key];
                            const preview = previewScores[ability.key];
                            const isSelected = selectedBoosts.includes(ability.key);
                            const boosted = preview > current;

                            return (
                                <div
                                    key={ability.key}
                                    className={`ability-score-box ${boosted ? 'boosted' : ''}`}
                                >
                                    <span className="ability-name">{ability.key.toUpperCase()}</span>
                                    <span className="ability-value">
                                        {current}
                                        {boosted && <span className="boost-arrow"> → {preview}</span>}
                                    </span>
                                    <span className="ability-mod">
                                        {getMod(current)}
                                        {boosted && <span className="boost-arrow"> → {getMod(preview)}</span>}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Info */}
                    <div className="boost-info">
                        <p>
                            {language === 'it'
                                ? `Seleziona 4 caratteristiche da incrementare. Ogni caratteristica sotto 18 ottiene +2, quelle a 18 o più ottengono +1.`
                                : `Select 4 abilities to boost. Each ability below 18 gains +2, those at 18 or above gain +1.`
                            }
                        </p>
                        <div className="boost-counter">
                            {selectedBoosts.length}/4 {t('builder.selected') || 'selected'}
                        </div>
                    </div>

                    {/* Boost Selection */}
                    <div className="boost-sources">
                        <div className="boost-source">
                            <div className="boost-options level-up-options">
                                {ABILITIES.map(ability => {
                                    const isSelected = selectedBoosts.includes(ability.key);
                                    const canSelect = selectedBoosts.length < 4 || isSelected;

                                    return (
                                        <button
                                            key={ability.key}
                                            className={`boost-option level-up-boost ${isSelected ? 'selected' : ''}`}
                                            onClick={() => toggleBoost(ability.key)}
                                            disabled={!canSelect && !isSelected}
                                        >
                                            <span className="boost-ability-name">
                                                {getAbilityName(ability.key)}
                                            </span>
                                            <span className="boost-ability-key">
                                                {ability.key.toUpperCase()}
                                            </span>
                                            <span className="boost-preview">
                                                {currentScores[ability.key]} → {
                                                    currentScores[ability.key] >= 18
                                                        ? currentScores[ability.key] + 1
                                                        : currentScores[ability.key] + 2
                                                }
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="modal-btn modal-btn-secondary" onClick={onClose}>
                        {t('actions.cancel')}
                    </button>
                    <button
                        className="modal-btn modal-btn-primary"
                        onClick={handleApply}
                        disabled={selectedBoosts.length !== 4}
                    >
                        {t('actions.apply')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LevelUpBoostModal;
