import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Character, AbilityName } from '../../types';
import '../../styles/desktop.css';

interface LevelUpBoostModalProps {
    character: Character;
    level: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20;
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

    // Determine number of boosts based on variant rules
    // Gradual Ability Boosts: 1 boost per level
    // Standard: 4 boosts at levels 5, 10, 15, 20
    const gradualBoosts = character.variantRules?.gradualAbilityBoosts || false;
    const requiredBoosts = gradualBoosts ? 1 : 4;

    // For gradual boosts, track which abilities were recently selected
    // Rule: An ability cannot be selected again until 3 OTHER abilities have been boosted
    const recentGradualBoosts = useMemo(() => {
        if (!gradualBoosts) return [];

        // Get all gradual boosts from previous levels (excluding current level)
        const allPreviousBoosts: AbilityName[] = [];
        for (let l = 2; l < level; l++) {
            const boostsAtLevel = character.abilityBoosts?.levelUp?.[l] || [];
            allPreviousBoosts.push(...boostsAtLevel);
        }

        // Return in reverse order (most recent first), up to last 3 unique abilities
        const recent: AbilityName[] = [];
        for (let i = allPreviousBoosts.length - 1; i >= 0 && recent.length < 3; i--) {
            const boost = allPreviousBoosts[i];
            if (!recent.includes(boost)) {
                recent.push(boost);
            }
        }

        return recent;
    }, [gradualBoosts, level, character.abilityBoosts?.levelUp]);

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
        } else if (selectedBoosts.length < requiredBoosts) {
            // Add boost (max depends on variant rules)
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
                        {gradualBoosts
                            ? (t('builder.abilityBoost') || 'Ability Boost')
                            : (t('builder.levelUpBoosts') || 'Level-Up Boosts')
                        } - {t('builder.level') || 'Level'} {level}
                        <span className="boost-count" style={{ marginLeft: '10px', fontSize: '0.8em', opacity: 0.7 }}>
                            ({selectedBoosts.length}/{requiredBoosts})
                        </span>
                    </h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="ability-boost-content">
                    {/* Current & Preview Scores Display */}
                    <div className="ability-scores-display">
                        {ABILITIES.map(ability => {
                            const current = currentScores[ability.key];
                            const preview = previewScores[ability.key];
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
                            {gradualBoosts
                                ? (language === 'it'
                                    ? `Seleziona 1 caratteristica da incrementare. Ogni caratteristica sotto 18 ottiene +2, quelle a 18 o più ottengono +1.`
                                    : `Select 1 ability to boost. Each ability below 18 gains +2, those at 18 or above gain +1.`)
                                : (language === 'it'
                                    ? `Seleziona 4 caratteristiche da incrementare. Ogni caratteristica sotto 18 ottiene +2, quelle a 18 o più ottengono +1.`
                                    : `Select 4 abilities to boost. Each ability below 18 gains +2, those at 18 or above gain +1.`)
                            }
                        </p>
                        {gradualBoosts && recentGradualBoosts.length > 0 && (
                            <p className="boost-rule-hint">
                                {language === 'it'
                                    ? `Regola Gradual: Non puoi riselezionare ${recentGradualBoosts.map(a => getAbilityName(a)).join(', ')} finché non hai selezionato altre 3 caratteristiche.`
                                    : `Gradual Rule: You cannot select ${recentGradualBoosts.map(a => getAbilityName(a)).join(', ')} again until you've chosen 3 other abilities.`
                                }
                            </p>
                        )}
                        <div className="boost-counter">
                            {selectedBoosts.length}/{requiredBoosts} {t('builder.selected') || 'selected'}
                        </div>
                    </div>

                    {/* Boost Selection */}
                    <div className="boost-sources">
                        <div className="boost-source">
                            <div className="boost-options level-up-options">
                                {ABILITIES.map(ability => {
                                    const isSelected = selectedBoosts.includes(ability.key);
                                    const isRecentlyUsed = gradualBoosts && recentGradualBoosts.includes(ability.key);
                                    const canSelect = (selectedBoosts.length < requiredBoosts || isSelected) && !isRecentlyUsed;

                                    return (
                                        <button
                                            key={ability.key}
                                            className={`boost-option level-up-boost ${isSelected ? 'selected' : ''} ${isRecentlyUsed ? 'recently-used' : ''}`}
                                            onClick={() => toggleBoost(ability.key)}
                                            disabled={!canSelect && !isSelected}
                                            title={isRecentlyUsed
                                                ? (language === 'it'
                                                    ? `Già selezionato di recente. Seleziona altre 3 caratteristiche prima di poterlo riselezionare.`
                                                    : `Recently selected. Select 3 other abilities before choosing this one again.`)
                                                : undefined
                                            }
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
                                            {isRecentlyUsed && (
                                                <span className="recent-indicator" title={
                                                    language === 'it'
                                                        ? 'Già selezionato di recente'
                                                        : 'Recently selected'
                                                }>⏳</span>
                                            )}
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
                        disabled={selectedBoosts.length !== requiredBoosts}
                    >
                        {t('actions.apply')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LevelUpBoostModal;
