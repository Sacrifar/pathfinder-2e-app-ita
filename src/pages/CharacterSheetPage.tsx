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
    LevelUpBoostModal,
    SkillIncreaseModal
} from '../components/desktop';
import { Character, createEmptyCharacter, migrateCharacter, CharacterFeat, SkillProficiency, AbilityName, Proficiency } from '../types';
import { LoadedFeat } from '../data/pf2e-loader';

type SelectionType = 'ancestry' | 'heritage' | 'background' | 'class' | 'secondaryClass' | 'boost' | 'ancestryFeat' | 'classFeat' | 'archetypeFeat' | 'skillTraining' | 'boost2' | 'boost3' | 'boost4' | 'boost5' | 'boost6' | 'boost7' | 'boost8' | 'boost9' | 'boost10' | 'boost11' | 'boost12' | 'boost13' | 'boost14' | 'boost15' | 'boost16' | 'boost17' | 'boost18' | 'boost19' | 'boost20' | 'skillFeat' | 'generalFeat' | 'skillIncrease' | null;

const CharacterSheetPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [character, setCharacter] = useState<Character | null>(null);
    const [selectionType, setSelectionType] = useState<SelectionType>(null);
    const [selectionLevel, setSelectionLevel] = useState<number | null>(null);

    useEffect(() => {
        if (id) {
            // Load character from localStorage
            const saved = localStorage.getItem('pf2e-characters');
            if (saved) {
                const characters: Character[] = JSON.parse(saved);
                const found = characters.find((c) => c.id === id);
                if (found) {
                    setCharacter(migrateCharacter(found));
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

    const handleOpenSelection = (type: string, targetLevel?: number) => {
        const validTypes = ['ancestry', 'heritage', 'background', 'class', 'secondaryClass', 'boost', 'ancestryFeat', 'classFeat', 'archetypeFeat', 'skillTraining', 'boost2', 'boost3', 'boost4', 'boost5', 'boost6', 'boost7', 'boost8', 'boost9', 'boost10', 'boost11', 'boost12', 'boost13', 'boost14', 'boost15', 'boost16', 'boost17', 'boost18', 'boost19', 'boost20', 'skillFeat', 'generalFeat', 'skillIncrease'];
        if (validTypes.includes(type)) {
            setSelectionType(type as SelectionType);
            setSelectionLevel(targetLevel ?? null);
        }
    };

    const handleCloseSelection = () => {
        setSelectionType(null);
        setSelectionLevel(null);
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
                // Clear existing background boosts when changing background
                abilityBoosts: {
                    ...character.abilityBoosts,
                    background: [],
                },
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

    const handleSelectSecondaryClass = (classId: string) => {
        if (character) {
            handleCharacterUpdate({
                ...character,
                secondaryClassId: classId,
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
            // Use selectionLevel if set, otherwise fall back to character.level
            const targetLevel = selectionLevel ?? character.level;

            // Determine slotType based on selectionType
            let slotType: CharacterFeat['slotType'] = undefined;
            if (selectionType === 'archetypeFeat') {
                slotType = 'archetype';
            } else if (selectionType === 'ancestryFeat') {
                slotType = 'ancestry';
            } else if (selectionType === 'classFeat') {
                slotType = 'class';
            } else if (selectionType === 'skillFeat') {
                slotType = 'skill';
            } else if (selectionType === 'generalFeat') {
                slotType = 'general';
            }

            const newFeat: CharacterFeat = {
                featId: feat.id,
                level: targetLevel,
                source: source,
                slotType: slotType,
            };

            // Replace existing feat of same source, level, and slotType, or add new
            const existingIndex = character.feats.findIndex(
                f => f.source === source && f.level === targetLevel && f.slotType === slotType
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
        setSelectionLevel(null);
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

    const handleApplyLevelUpBoosts = (level: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20, boosts: AbilityName[]) => {
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

    const handleApplySkillIncrease = (skillName: string, newProficiency: Proficiency) => {
        if (character && selectionLevel) {
            // Update the skillIncreases record
            const updatedSkillIncreases = {
                ...character.skillIncreases,
                [selectionLevel]: skillName,
            };

            // Update the skill proficiency in the skills array
            const updatedSkills = character.skills.map(s => {
                if (s.name.toLowerCase() === skillName.toLowerCase()) {
                    return { ...s, proficiency: newProficiency };
                }
                return s;
            });

            // If the skill doesn't exist in the array, we may need to add it
            // (though it should already be there from skill training)
            const skillExists = character.skills.some(s => s.name.toLowerCase() === skillName.toLowerCase());
            if (!skillExists) {
                // This shouldn't happen if skill training was done first,
                // but handle it just in case
                updatedSkills.push({
                    name: skillName,
                    ability: 'int' as AbilityName, // Default, should be fetched from skills data
                    proficiency: newProficiency,
                });
            }

            handleCharacterUpdate({
                ...character,
                skills: updatedSkills,
                skillIncreases: updatedSkillIncreases,
            });
        }
        setSelectionType(null);
        setSelectionLevel(null);
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

            {selectionType === 'secondaryClass' && (
                <ClassBrowser
                    currentClassId={character.secondaryClassId || ''}
                    excludeClassId={character.classId}
                    onClose={handleCloseSelection}
                    onSelect={handleSelectSecondaryClass}
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
                    characterLevel={selectionLevel ?? character.level}
                    ancestryId={character.ancestryId}
                    character={character}
                />
            )}

            {selectionType === 'classFeat' && (
                <FeatBrowser
                    onClose={handleCloseSelection}
                    onSelect={handleSelectFeat}
                    filterCategory="class"
                    characterLevel={selectionLevel ?? character.level}
                    classId={character.classId}
                    character={character}
                />
            )}

            {selectionType === 'archetypeFeat' && (
                <FeatBrowser
                    onClose={handleCloseSelection}
                    onSelect={handleSelectFeat}
                    filterCategory="class"
                    characterLevel={selectionLevel ?? character.level}
                    character={character}
                    archetypeOnly={true}
                />
            )}

            {selectionType === 'skillFeat' && (
                <FeatBrowser
                    onClose={handleCloseSelection}
                    onSelect={handleSelectFeat}
                    filterCategory="skill"
                    characterLevel={selectionLevel ?? character.level}
                    character={character}
                />
            )}

            {selectionType === 'generalFeat' && (
                <FeatBrowser
                    onClose={handleCloseSelection}
                    onSelect={handleSelectFeat}
                    filterCategory="general"
                    characterLevel={selectionLevel ?? character.level}
                    character={character}
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

            {selectionType === 'boost2' && (
                <LevelUpBoostModal
                    character={character}
                    level={2}
                    onClose={handleCloseSelection}
                    onApply={(boosts) => handleApplyLevelUpBoosts(2, boosts)}
                />
            )}

            {selectionType === 'boost3' && (
                <LevelUpBoostModal
                    character={character}
                    level={3}
                    onClose={handleCloseSelection}
                    onApply={(boosts) => handleApplyLevelUpBoosts(3, boosts)}
                />
            )}

            {selectionType === 'boost4' && (
                <LevelUpBoostModal
                    character={character}
                    level={4}
                    onClose={handleCloseSelection}
                    onApply={(boosts) => handleApplyLevelUpBoosts(4, boosts)}
                />
            )}

            {selectionType === 'boost6' && (
                <LevelUpBoostModal
                    character={character}
                    level={6}
                    onClose={handleCloseSelection}
                    onApply={(boosts) => handleApplyLevelUpBoosts(6, boosts)}
                />
            )}

            {selectionType === 'boost7' && (
                <LevelUpBoostModal
                    character={character}
                    level={7}
                    onClose={handleCloseSelection}
                    onApply={(boosts) => handleApplyLevelUpBoosts(7, boosts)}
                />
            )}

            {selectionType === 'boost8' && (
                <LevelUpBoostModal
                    character={character}
                    level={8}
                    onClose={handleCloseSelection}
                    onApply={(boosts) => handleApplyLevelUpBoosts(8, boosts)}
                />
            )}

            {selectionType === 'boost9' && (
                <LevelUpBoostModal
                    character={character}
                    level={9}
                    onClose={handleCloseSelection}
                    onApply={(boosts) => handleApplyLevelUpBoosts(9, boosts)}
                />
            )}

            {selectionType === 'boost11' && (
                <LevelUpBoostModal
                    character={character}
                    level={11}
                    onClose={handleCloseSelection}
                    onApply={(boosts) => handleApplyLevelUpBoosts(11, boosts)}
                />
            )}

            {selectionType === 'boost12' && (
                <LevelUpBoostModal
                    character={character}
                    level={12}
                    onClose={handleCloseSelection}
                    onApply={(boosts) => handleApplyLevelUpBoosts(12, boosts)}
                />
            )}

            {selectionType === 'boost13' && (
                <LevelUpBoostModal
                    character={character}
                    level={13}
                    onClose={handleCloseSelection}
                    onApply={(boosts) => handleApplyLevelUpBoosts(13, boosts)}
                />
            )}

            {selectionType === 'boost14' && (
                <LevelUpBoostModal
                    character={character}
                    level={14}
                    onClose={handleCloseSelection}
                    onApply={(boosts) => handleApplyLevelUpBoosts(14, boosts)}
                />
            )}

            {selectionType === 'boost16' && (
                <LevelUpBoostModal
                    character={character}
                    level={16}
                    onClose={handleCloseSelection}
                    onApply={(boosts) => handleApplyLevelUpBoosts(16, boosts)}
                />
            )}

            {selectionType === 'boost17' && (
                <LevelUpBoostModal
                    character={character}
                    level={17}
                    onClose={handleCloseSelection}
                    onApply={(boosts) => handleApplyLevelUpBoosts(17, boosts)}
                />
            )}

            {selectionType === 'boost18' && (
                <LevelUpBoostModal
                    character={character}
                    level={18}
                    onClose={handleCloseSelection}
                    onApply={(boosts) => handleApplyLevelUpBoosts(18, boosts)}
                />
            )}

            {selectionType === 'boost19' && (
                <LevelUpBoostModal
                    character={character}
                    level={19}
                    onClose={handleCloseSelection}
                    onApply={(boosts) => handleApplyLevelUpBoosts(19, boosts)}
                />
            )}

            {selectionType === 'skillIncrease' && selectionLevel && (
                <SkillIncreaseModal
                    character={character}
                    level={selectionLevel}
                    onClose={handleCloseSelection}
                    onApply={handleApplySkillIncrease}
                />
            )}
        </>
    );
};

export default CharacterSheetPage;
