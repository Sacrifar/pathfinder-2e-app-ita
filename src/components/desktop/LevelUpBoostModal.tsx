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
    // Standard: 4 boosts at levels 5, 10, 15, 20
    // Gradual: 1 boost at levels 2,3,4,5, 7,8,9,10, 12,13,14,15, 17,18,19,20 (pause at 6,11,16)
    const gradualBoosts = character.variantRules?.gradualAbilityBoosts || false;
    const requiredBoosts = gradualBoosts ? 1 : 4;

    /**
     * Get the current block for a given level (gradual boosts only)
     * Block 1: Levels 2-5
     * Block 2: Levels 7-10
     * Block 3: Levels 12-15
     * Block 4: Levels 17-20
     */
    const getBlockForLevel = (lvl: number): number => {
        if (lvl <= 5) return 1;
        if (lvl <= 10) return 2;
        if (lvl <= 15) return 3;
        return 4;
    };

    /**
     * Get abilities already used in the current block
     * Rule: You cannot boost the same ability more than once per block
     */
    const usedAbilitiesInBlock = useMemo(() => {
        if (!gradualBoosts) return [];

        const currentBlock = getBlockForLevel(level);
        const blockStartLevel = currentBlock === 1 ? 2 : (currentBlock === 2 ? 7 : (currentBlock === 3 ? 12 : 17));

        const usedInBlock: AbilityName[] = [];

        // Get all boosts from previous levels in the same block
        for (let l = blockStartLevel; l < level; l++) {
            // Skip pause levels (6, 11, 16) - levels where l % 5 == 1
            if (l % 5 === 1) continue;
            const boostsAtLevel = character.abilityBoosts?.levelUp?.[l] || [];
            usedInBlock.push(...boostsAtLevel);
        }

        return usedInBlock;
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
                        {gradualBoosts && usedAbilitiesInBlock.length > 0 && (
                            <p className="boost-rule-hint">
                                {language === 'it'
                                    ? `Regola Gradual: In questo blocco hai già usato: ${usedAbilitiesInBlock.map(a => getAbilityName(a)).join(', ')}. Non puoi selezionare la stessa caratteristica più di una volta per blocco.`
                                    : `Gradual Rule: You already used: ${usedAbilitiesInBlock.map(a => getAbilityName(a)).join(', ')} in this block. You cannot select the same ability more than once per block.`
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
                                    const isUsedInBlock = gradualBoosts && usedAbilitiesInBlock.includes(ability.key);
                                    const canSelect = (selectedBoosts.length < requiredBoosts || isSelected) && !isUsedInBlock;

                                    return (
                                        <button
                                            key={ability.key}
                                            className={`boost-option level-up-boost ${isSelected ? 'selected' : ''} ${isUsedInBlock ? 'recently-used' : ''}`}
                                            onClick={() => toggleBoost(ability.key)}
                                            disabled={!canSelect && !isSelected}
                                            title={isUsedInBlock
                                                ? (language === 'it'
                                                    ? `Già selezionato in questo blocco. Non puoi selezionare la stessa caratteristica più di una volta per blocco.`
                                                    : `Already used in this block. You cannot select the same ability more than once per block.`)
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
                                            {isUsedInBlock && (
                                                <span className="recent-indicator" title={
                                                    language === 'it'
                                                        ? 'Già usato in questo blocco'
                                                        : 'Already used in this block'
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
