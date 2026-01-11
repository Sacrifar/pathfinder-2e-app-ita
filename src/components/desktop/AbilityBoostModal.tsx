import React, { useState, useMemo, useEffect } from 'react';
import { ancestries, classes, backgrounds } from '../../data';
import { Character, AbilityName } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';
import '../../styles/desktop.css';

interface AbilityBoostModalProps {
    character: Character;
    onClose: () => void;
    onApply: (updatedScores: Character['abilityScores'], boosts: Character['abilityBoosts']) => void;
}

const ABILITIES: { key: AbilityName; name: string; nameIt: string }[] = [
    { key: 'str', name: 'Strength', nameIt: 'Forza' },
    { key: 'dex', name: 'Dexterity', nameIt: 'Destrezza' },
    { key: 'con', name: 'Constitution', nameIt: 'Costituzione' },
    { key: 'int', name: 'Intelligence', nameIt: 'Intelligenza' },
    { key: 'wis', name: 'Wisdom', nameIt: 'Saggezza' },
    { key: 'cha', name: 'Charisma', nameIt: 'Carisma' },
];

interface BoostSource {
    id: string;
    label: string;
    boosts: (AbilityName | 'free')[];
    flaws?: AbilityName[];
    selected: AbilityName[];
    required: number;
}

export const AbilityBoostModal: React.FC<AbilityBoostModalProps> = ({
    character,
    onClose,
    onApply,
}) => {
    const { t, language } = useLanguage();

    // Get ancestry, background, class data
    const ancestry = useMemo(() =>
        ancestries.find(a => a.id === character.ancestryId),
        [character.ancestryId]
    );
    const background = useMemo(() =>
        backgrounds.find(b => b.id === character.backgroundId),
        [character.backgroundId]
    );
    const classData = useMemo(() =>
        classes.find(c => c.id === character.classId),
        [character.classId]
    );

    // Build boost sources
    const [boostSources, setBoostSources] = useState<BoostSource[]>([]);

    useEffect(() => {
        const sources: BoostSource[] = [];

        // Ancestry boosts
        if (ancestry) {
            const freeCount = ancestry.abilityBoosts.filter(b => b === 'free').length;
            const fixedBoosts = ancestry.abilityBoosts.filter(b => b !== 'free') as AbilityName[];

            sources.push({
                id: 'ancestry',
                label: language === 'it' ? 'Stirpe' : 'Ancestry',
                boosts: ancestry.abilityBoosts,
                flaws: ancestry.abilityFlaws,
                selected: [...fixedBoosts, ...character.abilityBoosts.ancestry.filter(b => !fixedBoosts.includes(b))],
                required: ancestry.abilityBoosts.length,
            });
        }

        // Background boosts
        if (background) {
            sources.push({
                id: 'background',
                label: language === 'it' ? 'Background' : 'Background',
                boosts: background.abilityBoosts,
                selected: character.abilityBoosts.background,
                required: background.abilityBoosts.length,
            });
        }

        // Class boost
        if (classData) {
            const keyAbility = Array.isArray(classData.keyAbility)
                ? classData.keyAbility
                : [classData.keyAbility];
            sources.push({
                id: 'class',
                label: language === 'it' ? 'Classe' : 'Class',
                boosts: keyAbility.length > 1 ? ['free'] : keyAbility,
                selected: character.abilityBoosts.class ? [character.abilityBoosts.class] : [],
                required: 1,
            });
        }

        // 4 Free boosts at level 1
        sources.push({
            id: 'free',
            label: language === 'it' ? 'Liberi' : 'Free',
            boosts: ['free', 'free', 'free', 'free'],
            selected: character.abilityBoosts.free,
            required: 4,
        });

        setBoostSources(sources);
    }, [ancestry, background, classData, character.abilityBoosts, language]);

    // Calculate final scores
    const calculateScores = useMemo(() => {
        const scores = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };

        // Apply ancestry flaws
        if (ancestry) {
            for (const flaw of ancestry.abilityFlaws) {
                scores[flaw] -= 2;
            }
        }

        // Apply all boosts
        for (const source of boostSources) {
            for (const ability of source.selected) {
                if (scores[ability] >= 18) {
                    scores[ability] += 1;
                } else {
                    scores[ability] += 2;
                }
            }
        }

        return scores;
    }, [boostSources, ancestry]);

    const toggleBoost = (sourceId: string, ability: AbilityName) => {
        setBoostSources(prev => prev.map(source => {
            if (source.id !== sourceId) return source;

            const hasBoost = source.selected.includes(ability);
            let newSelected: AbilityName[];

            if (hasBoost) {
                // Remove boost
                newSelected = source.selected.filter(a => a !== ability);
            } else {
                // Add boost if not at limit
                if (source.selected.length >= source.required) {
                    // Replace the last one
                    newSelected = [...source.selected.slice(1), ability];
                } else {
                    newSelected = [...source.selected, ability];
                }
            }

            return { ...source, selected: newSelected };
        }));
    };

    const handleApply = () => {
        const ancestryBoosts = boostSources.find(s => s.id === 'ancestry')?.selected || [];
        const backgroundBoosts = boostSources.find(s => s.id === 'background')?.selected || [];
        const classBoost = boostSources.find(s => s.id === 'class')?.selected[0] || 'str';
        const freeBoosts = boostSources.find(s => s.id === 'free')?.selected || [];

        onApply(calculateScores, {
            ancestry: ancestryBoosts,
            background: backgroundBoosts,
            class: classBoost,
            free: freeBoosts,
            levelUp: character.abilityBoosts.levelUp,
        });
    };

    const getAbilityName = (ability: AbilityName) => {
        const ab = ABILITIES.find(a => a.key === ability);
        return language === 'it' ? ab?.nameIt : ab?.name;
    };

    const getMod = (score: number) => {
        const mod = Math.floor((score - 10) / 2);
        return mod >= 0 ? `+${mod}` : `${mod}`;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="selection-modal ability-boost-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{t('builder.abilityBoosts') || 'Ability Boosts'}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="ability-boost-content">
                    {/* Final Scores Display */}
                    <div className="ability-scores-display">
                        {ABILITIES.map(ability => (
                            <div key={ability.key} className="ability-score-box">
                                <span className="ability-name">{ability.key.toUpperCase()}</span>
                                <span className="ability-value">{calculateScores[ability.key]}</span>
                                <span className="ability-mod">{getMod(calculateScores[ability.key])}</span>
                            </div>
                        ))}
                    </div>

                    {/* Boost Sources */}
                    <div className="boost-sources">
                        {boostSources.map(source => (
                            <div key={source.id} className="boost-source">
                                <div className="boost-source-header">
                                    <span className="source-label">{source.label}</span>
                                    <span className="source-count">
                                        {source.selected.length}/{source.required}
                                    </span>
                                </div>
                                <div className="boost-options">
                                    {ABILITIES.map(ability => {
                                        const isSelected = source.selected.includes(ability.key);
                                        const isFixed = source.boosts.includes(ability.key) && ability.key !== 'free';
                                        const isFlaw = source.flaws?.includes(ability.key);
                                        const canSelect = source.boosts.includes('free') || source.boosts.includes(ability.key);

                                        return (
                                            <button
                                                key={ability.key}
                                                className={`boost-option ${isSelected ? 'selected' : ''} ${isFixed ? 'fixed' : ''} ${isFlaw ? 'flaw' : ''}`}
                                                onClick={() => !isFixed && canSelect && toggleBoost(source.id, ability.key)}
                                                disabled={isFixed || !canSelect}
                                            >
                                                {ability.key.toUpperCase()}
                                            </button>
                                        );
                                    })}
                                </div>
                                {source.flaws && source.flaws.length > 0 && (
                                    <div className="flaw-note">
                                        Flaw: {source.flaws.map(f => f.toUpperCase()).join(', ')}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="modal-btn modal-btn-secondary" onClick={onClose}>
                        {t('actions.cancel') || 'Cancel'}
                    </button>
                    <button className="modal-btn modal-btn-primary" onClick={handleApply}>
                        {t('actions.apply') || 'Apply'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AbilityBoostModal;
