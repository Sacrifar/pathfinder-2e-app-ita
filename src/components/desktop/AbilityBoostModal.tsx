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

        // Background boosts - special handling
        // Background gives: 1 boost from 2 options, 1 free boost (not from those 2)
        if (background) {
            const backgroundOptions = background.abilityBoosts.filter(b => b !== 'free') as AbilityName[];
            const hasFree = background.abilityBoosts.includes('free');
            const bgBoosts = character.abilityBoosts.background;

            // First boost: chosen from the 2 options
            const chosenBoost = bgBoosts[0];
            // Second boost: free (but can't be one of the 2 options)
            const chosenFreeBoost = bgBoosts[1];

            sources.push({
                id: 'background',
                label: language === 'it' ? 'Background' : 'Background',
                boosts: [...backgroundOptions, ...(hasFree ? ['free' as const] : [])],
                selected: bgBoosts,
                required: 2, // Always 2 boosts for background
                // Store metadata for custom rendering
                backgroundOptions: backgroundOptions,
                hasFreeBoost: hasFree,
            } as BoostSource & { backgroundOptions?: AbilityName[]; hasFreeBoost?: boolean });
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

    const toggleBoost = (sourceId: string, ability: AbilityName, slotIndex?: number) => {
        setBoostSources(prev => prev.map(source => {
            if (source.id !== sourceId) return source;

            // Special handling for background
            if (sourceId === 'background') {
                const bgSource = source as BoostSource & { backgroundOptions?: AbilityName[]; hasFreeBoost?: boolean };
                const backgroundOptions = bgSource.backgroundOptions || [];
                const hasFree = bgSource.hasFreeBoost || false;

                // Determine which slot is being modified
                if (slotIndex === 0) {
                    // First slot: choose from the 2 background options
                    if (!backgroundOptions.includes(ability)) return source; // Not a valid option
                    return { ...source, selected: [ability, source.selected[1] || ('' as AbilityName)] };
                } else if (slotIndex === 1 && hasFree) {
                    // Second slot: free boost (can't be one of the background options)
                    if (backgroundOptions.includes(ability)) return source; // Not allowed
                    return { ...source, selected: [source.selected[0] || ('' as AbilityName), ability] };
                }
                return source;
            }

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
                        {boostSources.map(source => {
                            // Special rendering for background
                            if (source.id === 'background') {
                                const bgSource = source as BoostSource & { backgroundOptions?: AbilityName[]; hasFreeBoost?: boolean };
                                const backgroundOptions = bgSource.backgroundOptions || [];
                                const hasFree = bgSource.hasFreeBoost || false;

                                return (
                                    <div key={source.id} className="boost-source">
                                        <div className="boost-source-header">
                                            <span className="source-label">{source.label}</span>
                                            <span className="source-count">
                                                {source.selected.filter(s => s).length}/{source.required}
                                            </span>
                                        </div>

                                        {/* First boost: choose from the 2 background options */}
                                        <div className="boost-slot">
                                            <div className="slot-label">
                                                {language === 'it' ? 'Scegli un boost:' : 'Choose one boost:'}
                                            </div>
                                            <div className="boost-options">
                                                {backgroundOptions.map(opt => (
                                                    <button
                                                        key={opt}
                                                        className={`boost-option ${source.selected[0] === opt ? 'selected' : ''}`}
                                                        onClick={() => toggleBoost(source.id, opt, 0)}
                                                    >
                                                        {opt.toUpperCase()}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Second boost: free (can't be from the 2 options) */}
                                        {hasFree && (
                                            <div className="boost-slot">
                                                <div className="slot-label">
                                                    {language === 'it' ? 'Scegli un boost libero:' : 'Choose one free boost:'}
                                                </div>
                                                <div className="boost-hint">
                                                    {language === 'it' ? '(Non può essere uno dei due sopra)' : '(Cannot be one of the two above)'}
                                                </div>
                                                <div className="boost-options">
                                                    {ABILITIES.filter(a => !backgroundOptions.includes(a.key)).map(ability => (
                                                        <button
                                                            key={ability.key}
                                                            className={`boost-option ${source.selected[1] === ability.key ? 'selected' : ''}`}
                                                            onClick={() => toggleBoost(source.id, ability.key, 1)}
                                                        >
                                                            {ability.key.toUpperCase()}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            // Standard rendering for other sources
                            return (
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
                            );
                        })}
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
