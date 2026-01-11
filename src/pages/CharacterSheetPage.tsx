import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    DesktopCharacterLayout,
    AncestryBrowser,
    HeritageBrowser,
    BackgroundBrowser,
    ClassBrowser,
    AbilityBoostModal,
    FeatBrowser,
    SkillTrainingModal,
    LevelUpBoostModal
} from '../components/desktop';
import { Character, createEmptyCharacter, CharacterFeat, SkillProficiency, AbilityName } from '../types';
import { LoadedFeat } from '../data/pf2e-loader';

type SelectionType = 'ancestry' | 'heritage' | 'background' | 'class' | 'boost' | 'ancestryFeat' | 'classFeat' | 'skillTraining' | 'boost5' | 'boost10' | 'boost15' | 'boost20' | null;

const CharacterSheetPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [character, setCharacter] = useState<Character | null>(null);
    const [selectionType, setSelectionType] = useState<SelectionType>(null);

    useEffect(() => {
        if (id) {
            // Load character from localStorage
            const saved = localStorage.getItem('pf2e-characters');
            if (saved) {
                const characters: Character[] = JSON.parse(saved);
                const found = characters.find((c) => c.id === id);
                if (found) {
                    setCharacter(found);
                    return;
                }
            }
        }

        // Create new character if not found
        const newChar = createEmptyCharacter();
        newChar.name = 'Unknown Adventurer';
        setCharacter(newChar);
    }, [id]);

    const handleCharacterUpdate = (updated: Character) => {
        setCharacter(updated);

        // Save to localStorage
        const saved = localStorage.getItem('pf2e-characters');
        const characters: Character[] = saved ? JSON.parse(saved) : [];
        const index = characters.findIndex((c) => c.id === updated.id);

        if (index >= 0) {
            characters[index] = updated;
        } else {
            characters.push(updated);
        }

        localStorage.setItem('pf2e-characters', JSON.stringify(characters));
    };

    const handleOpenSelection = (type: string) => {
        if (type === 'ancestry' || type === 'heritage' || type === 'background' || type === 'class' || type === 'boost' || type === 'ancestryFeat' || type === 'classFeat' || type === 'skillTraining' || type === 'boost5' || type === 'boost10' || type === 'boost15' || type === 'boost20') {
            setSelectionType(type);
        }
    };

    const handleCloseSelection = () => {
        setSelectionType(null);
    };

    const handleSelectAncestry = (ancestryId: string) => {
        if (character) {
            handleCharacterUpdate({
                ...character,
                ancestryId,
                heritageId: '', // Reset heritage when ancestry changes
            });
        }
        setSelectionType(null);
    };

    const handleSelectHeritage = (heritageId: string) => {
        if (character) {
            handleCharacterUpdate({
                ...character,
                heritageId,
            });
        }
        setSelectionType(null);
    };

    const handleSelectBackground = (backgroundId: string) => {
        if (character) {
            handleCharacterUpdate({
                ...character,
                backgroundId,
            });
        }
        setSelectionType(null);
    };

    const handleSelectClass = (classId: string) => {
        if (character) {
            handleCharacterUpdate({
                ...character,
                classId,
            });
        }
        setSelectionType(null);
    };

    const handleApplyBoosts = (scores: Character['abilityScores'], boosts: Character['abilityBoosts']) => {
        if (character) {
            handleCharacterUpdate({
                ...character,
                abilityScores: scores,
                abilityBoosts: boosts,
            });
        }
        setSelectionType(null);
    };

    const handleSelectFeat = (feat: LoadedFeat, source: CharacterFeat['source']) => {
        if (character) {
            const newFeat: CharacterFeat = {
                featId: feat.id,
                level: character.level,
                source: source,
            };

            // Replace existing feat of same source at level 1, or add new
            const existingIndex = character.feats.findIndex(
                f => f.source === source && f.level === character.level
            );

            let updatedFeats: CharacterFeat[];
            if (existingIndex >= 0) {
                updatedFeats = [...character.feats];
                updatedFeats[existingIndex] = newFeat;
            } else {
                updatedFeats = [...character.feats, newFeat];
            }

            handleCharacterUpdate({
                ...character,
                feats: updatedFeats,
            });
        }
        setSelectionType(null);
    };

    const handleApplySkillTraining = (trainedSkills: SkillProficiency[]) => {
        if (character) {
            handleCharacterUpdate({
                ...character,
                skills: trainedSkills,
            });
        }
        setSelectionType(null);
    };

    const handleApplyLevelUpBoosts = (level: 5 | 10 | 15 | 20, boosts: AbilityName[]) => {
        if (character) {
            // Calculate new ability scores
            const newScores = { ...character.abilityScores };
            const oldBoosts = character.abilityBoosts?.levelUp?.[level] || [];

            // Remove old boosts from this level
            for (const ability of oldBoosts) {
                if (newScores[ability] >= 19) {
                    newScores[ability] -= 1;
                } else {
                    newScores[ability] -= 2;
                }
            }

            // Apply new boosts
            for (const ability of boosts) {
                if (newScores[ability] >= 18) {
                    newScores[ability] += 1;
                } else {
                    newScores[ability] += 2;
                }
            }

            handleCharacterUpdate({
                ...character,
                abilityScores: newScores,
                abilityBoosts: {
                    ...character.abilityBoosts,
                    levelUp: {
                        ...character.abilityBoosts.levelUp,
                        [level]: boosts,
                    },
                },
            });
        }
        setSelectionType(null);
    };

    if (!character) {
        return (
            <div className="desktop-layout" style={{ alignItems: 'center', justifyContent: 'center' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <>
            <DesktopCharacterLayout
                character={character}
                onCharacterUpdate={handleCharacterUpdate}
                onOpenSelection={handleOpenSelection}
            />

            {/* Selection Modals */}
            {selectionType === 'ancestry' && (
                <AncestryBrowser
                    currentAncestryId={character.ancestryId}
                    onClose={handleCloseSelection}
                    onSelect={handleSelectAncestry}
                />
            )}

            {selectionType === 'heritage' && (
                <HeritageBrowser
                    ancestryId={character.ancestryId}
                    currentHeritageId={character.heritageId}
                    onClose={handleCloseSelection}
                    onSelect={handleSelectHeritage}
                />
            )}

            {selectionType === 'background' && (
                <BackgroundBrowser
                    currentBackgroundId={character.backgroundId}
                    onClose={handleCloseSelection}
                    onSelect={handleSelectBackground}
                />
            )}

            {selectionType === 'class' && (
                <ClassBrowser
                    currentClassId={character.classId}
                    onClose={handleCloseSelection}
                    onSelect={handleSelectClass}
                />
            )}

            {selectionType === 'boost' && (
                <AbilityBoostModal
                    character={character}
                    onClose={handleCloseSelection}
                    onApply={handleApplyBoosts}
                />
            )}

            {selectionType === 'ancestryFeat' && (
                <FeatBrowser
                    onClose={handleCloseSelection}
                    onSelect={handleSelectFeat}
                    filterCategory="ancestry"
                    characterLevel={character.level}
                    ancestryId={character.ancestryId}
                />
            )}

            {selectionType === 'classFeat' && (
                <FeatBrowser
                    onClose={handleCloseSelection}
                    onSelect={handleSelectFeat}
                    filterCategory="class"
                    characterLevel={character.level}
                    classId={character.classId}
                />
            )}

            {selectionType === 'skillTraining' && (
                <SkillTrainingModal
                    character={character}
                    onClose={handleCloseSelection}
                    onApply={handleApplySkillTraining}
                />
            )}

            {selectionType === 'boost5' && (
                <LevelUpBoostModal
                    character={character}
                    level={5}
                    onClose={handleCloseSelection}
                    onApply={(boosts) => handleApplyLevelUpBoosts(5, boosts)}
                />
            )}

            {selectionType === 'boost10' && (
                <LevelUpBoostModal
                    character={character}
                    level={10}
                    onClose={handleCloseSelection}
                    onApply={(boosts) => handleApplyLevelUpBoosts(10, boosts)}
                />
            )}

            {selectionType === 'boost15' && (
                <LevelUpBoostModal
                    character={character}
                    level={15}
                    onClose={handleCloseSelection}
                    onApply={(boosts) => handleApplyLevelUpBoosts(15, boosts)}
                />
            )}

            {selectionType === 'boost20' && (
                <LevelUpBoostModal
                    character={character}
                    level={20}
                    onClose={handleCloseSelection}
                    onApply={(boosts) => handleApplyLevelUpBoosts(20, boosts)}
                />
            )}
        </>
    );
};

export default CharacterSheetPage;
