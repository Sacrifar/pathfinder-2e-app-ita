import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import {
    DesktopCharacterLayout,
    AncestryBrowser,
    HeritageBrowser,
    BackgroundBrowser,
    ClassBrowser,
    ClassSpecializationBrowser,
    KineticistImpulseBrowser,
    AbilityBoostModal,
    FeatBrowser,
    SkillTrainingModal,
    LevelUpBoostModal,
    SkillIncreaseModal,
    TacticBrowser,
    KineticistJunctionBrowser,
    SkillOverlapBonusModal,
    IntBonusSkillModal,
    HeritageSpellModal,
} from '../components/desktop';
import { Character, createEmptyCharacter, migrateCharacter, CharacterFeat, SkillProficiency, AbilityName } from '../types';
import { LoadedFeat, getClasses, getFeats, getSpells } from '../data/pf2e-loader';
import { getDefaultSpecializationForClass, classHasSpecializations, getClassNameById, getBaseJunctionForElement, getKineticistElementFromGateId } from '../data/classSpecializations';
import { getGrantedFeatsForSpecialization, getGrantedFeatIdsForLevel } from '../data/classGrantedFeats';
import { backgrounds, skills as skillsData } from '../data';
import { recalculateCharacter } from '../utils/characterRecalculator';
import { initializeSpellcastingForClass, updateSpellSlotsForLevel } from '../utils/spellcastingInitializer';
import { getAllKineticistJunctionGrantedFeats } from '../data/classFeatures';
import { updateDedicationTrackingOnAdd, updateDedicationTrackingOnRemove, recalculateDedicationTracking, removeDedicationAndArchetypeFeats, isArchetypeDedication, migrateFeatIds } from '../utils/archetypeDedication';
import { hasSpellSelection } from '../data/innateSpellSources';

type SelectionType = 'ancestry' | 'heritage' | 'background' | 'class' | 'classSpecialization' | 'secondaryClass' | 'boost' | 'ancestryFeat' | 'classFeat' | 'archetypeFeat' | 'skillTraining' | 'boost2' | 'boost3' | 'boost4' | 'boost5' | 'boost6' | 'boost7' | 'boost8' | 'boost9' | 'boost10' | 'boost11' | 'boost12' | 'boost13' | 'boost14' | 'boost15' | 'boost16' | 'boost17' | 'boost18' | 'boost19' | 'boost20' | 'skillFeat' | 'generalFeat' | 'skillIncrease' | 'tactics' | 'kineticistImpulse' | 'kineticistJunction' | 'intBonusSkills' | 'heritageSpell' | null;

const CharacterSheetPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { t } = useLanguage();
    const [character, setCharacter] = useState<Character | null>(null);
    const [selectionType, setSelectionType] = useState<SelectionType>(null);
    const [selectionLevel, setSelectionLevel] = useState<number | null>(null);

    // State for skill overlap bonus modal
    const [pendingBackgroundId, setPendingBackgroundId] = useState<string | null>(null);
    const [pendingClassId, setPendingClassId] = useState<string | null>(null);
    const [overlappingSkill, setOverlappingSkill] = useState<string | null>(null);

    // State for heritage spell selection
    const [pendingHeritageId, setPendingHeritageId] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            // Load character from localStorage
            const saved = localStorage.getItem('pf2e-characters');
            if (saved) {
                const characters: Character[] = JSON.parse(saved);
                const found = characters.find((c) => c.id === id);
                if (found) {
                    let migrated = migrateCharacter(found);

                    // Migrate old UUID-based feat IDs to new name-based IDs
                    // This ensures feats display with proper names instead of UUIDs
                    const beforeMigration = JSON.stringify(migrated.feats);
                    migrated = migrateFeatIds(migrated);
                    const afterMigration = JSON.stringify(migrated.feats);

                    // Save if migration occurred
                    const needsSave = beforeMigration !== afterMigration;

                    // Auto-assign default specialization for existing characters that don't have one
                    if (!migrated.classSpecializationId && migrated.classId && classHasSpecializations(migrated.classId)) {
                        const defaultSpec = getDefaultSpecializationForClass(migrated.classId);
                        if (defaultSpec) {
                            migrated.classSpecializationId = defaultSpec;
                        }
                    }

                    // Recalculate archetype dedication tracking for existing characters
                    // This ensures the dedication constraint works for characters created before this feature
                    if (!migrated.archetypeDedications || Object.keys(migrated.archetypeDedications).length === 0) {
                        migrated = recalculateDedicationTracking(migrated);
                        // Save the migrated character with dedication tracking
                        const updatedCharacters = characters.map(c =>
                            c.id === migrated.id ? migrated : c
                        );
                        localStorage.setItem('pf2e-characters', JSON.stringify(updatedCharacters));
                    } else if (needsSave) {
                        // Save the migrated character with updated feat IDs
                        const updatedCharacters = characters.map(c =>
                            c.id === migrated.id ? migrated : c
                        );
                        localStorage.setItem('pf2e-characters', JSON.stringify(updatedCharacters));
                    }

                    // ALWAYS recalculate character on load to ensure saves, perception, and HP are correct
                    // This handles cases where the character was saved before the recalculation system was implemented
                    // Reset saves/perception to force recalculation from current class/feats
                    migrated.saves = {
                        fortitude: 'trained',
                        reflex: 'trained',
                        will: 'trained'
                    };
                    migrated.perception = 'trained';

                    migrated = recalculateCharacter(migrated);
                    // Initialize spellcasting for spellcaster classes
                    migrated = initializeSpellcastingForClass(migrated);

                    // Save the recalculated character back to localStorage
                    const updatedCharacters = characters.map(c =>
                        c.id === migrated.id ? migrated : c
                    );
                    localStorage.setItem('pf2e-characters', JSON.stringify(updatedCharacters));

                    setCharacter(migrated);
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
        // ALWAYS recalculate character on any update to ensure saves, perception, and HP are correct
        // This handles level ups, feat additions, and any other changes
        let recalculated = recalculateCharacter(updated);
        // Update spell slots when level changes for spellcaster classes
        recalculated = updateSpellSlotsForLevel(recalculated);

        setCharacter(recalculated);

        // Save to localStorage
        const saved = localStorage.getItem('pf2e-characters');
        const characters: Character[] = saved ? JSON.parse(saved) : [];
        const index = characters.findIndex((c) => c.id === recalculated.id);

        if (index >= 0) {
            characters[index] = recalculated;
        } else {
            characters.push(recalculated);
        }

        localStorage.setItem('pf2e-characters', JSON.stringify(characters));
    };

    const handleOpenSelection = (type: string, targetLevel?: number) => {
        const validTypes = ['ancestry', 'heritage', 'background', 'class', 'classSpecialization', 'secondaryClass', 'boost', 'ancestryFeat', 'classFeat', 'archetypeFeat', 'skillTraining', 'boost2', 'boost3', 'boost4', 'boost5', 'boost6', 'boost7', 'boost8', 'boost9', 'boost10', 'boost11', 'boost12', 'boost13', 'boost14', 'boost15', 'boost16', 'boost17', 'boost18', 'boost19', 'boost20', 'skillFeat', 'generalFeat', 'skillIncrease', 'tactics', 'kineticistImpulse', 'kineticistJunction', 'intBonusSkills'];
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
            const updated = recalculateCharacter({
                ...character,
                ancestryId,
                heritageId: '', // Reset heritage when ancestry changes
            });
            handleCharacterUpdate(updated);
        }
        setSelectionType(null);
    };

    const handleSelectHeritage = (heritageId: string) => {
        if (hasSpellSelection(heritageId)) {
            // Heritage requires spell selection (e.g. Spellhorn Kobold)
            // Save heritage ID and show modal
            setPendingHeritageId(heritageId);
            setSelectionType('heritageSpell');
        } else {
            // Normal heritage selection
            if (character) {
                const updated = recalculateCharacter({
                    ...character,
                    heritageId,
                    heritageChoice: undefined, // Clear any previous choice
                });
                handleCharacterUpdate(updated);
            }
            setSelectionType(null);
        }
    };

    const handleApplyHeritageSpell = (spellId: string) => {
        if (character && pendingHeritageId) {
            const updated = recalculateCharacter({
                ...character,
                heritageId: pendingHeritageId,
                heritageChoice: spellId,
            });
            handleCharacterUpdate(updated);
        }
        setPendingHeritageId(null);
        setSelectionType(null);
    };

    const handleSelectBackground = (backgroundId: string) => {
        if (character) {
            // Check for skill overlaps with class
            const newBackground = backgrounds.find(b => b.id === backgroundId);
            if (!newBackground) {
                applyBackgroundSelection(backgroundId);
                return;
            }

            const classesList = getClasses();
            const classData = character.classId ? classesList.find((c: any) => c.id === character.classId) : null;

            // Check if there's overlap with class skills
            if (classData && classData.trainedSkills && classData.trainedSkills.length > 0 && newBackground.trainedSkills) {
                for (const bgSkill of newBackground.trainedSkills) {
                    const bgSkillLower = bgSkill.toLowerCase();
                    const hasOverlap = classData.trainedSkills.some(
                        (classSkill: string) => classSkill.toLowerCase() === bgSkillLower
                    );

                    if (hasOverlap) {
                        // Check if bonus skill already matches the overlapping skill
                        const currentBonusSkill = character.skillIncreases?.[0]?.toLowerCase();

                        // Only show modal if the bonus skill doesn't match the overlap
                        if (currentBonusSkill && currentBonusSkill === bgSkillLower) {
                            // Bonus skill already matches - no need to show modal
                            // Just apply the background
                            applyBackgroundSelection(backgroundId);
                            return;
                        }

                        // Show modal to select a different bonus skill
                        setPendingBackgroundId(backgroundId);
                        setOverlappingSkill(bgSkill);
                        return;
                    }
                }
            }

            // No overlap - proceed with normal background selection
            applyBackgroundSelection(backgroundId);
        }
    };

    const applyBackgroundSelection = (backgroundId: string, bonusSkill?: string) => {
        if (!character) return;

        const newBackground = backgrounds.find(b => b.id === backgroundId);
        if (!newBackground) return;

        // Remove old background feat (if any old background exists)
        const oldBackground = character.backgroundId ? backgrounds.find(b => b.id === character.backgroundId) : null;
        let currentFeats = [...(character.feats || [])];

        if (oldBackground && oldBackground.featId) {
            // Remove the old background's feat
            currentFeats = currentFeats.filter(f => f.featId !== oldBackground.featId);
        }

        // Add the new background's free feat if it exists and isn't already owned
        if (newBackground.featId) {
            const hasFeat = currentFeats.some(f => f.featId === newBackground.featId);
            if (!hasFeat) {
                const newFeat: CharacterFeat = {
                    featId: newBackground.featId,
                    level: 1,
                    source: 'bonus', // Background feats are bonus feats
                };
                currentFeats.push(newFeat);
            }
        }

        // Build updated character with all changes - recalculation will handle skills
        let updatedCharacter: Character = {
            ...character,
            backgroundId,
            // Clear existing background boosts when changing background
            abilityBoosts: {
                ...character.abilityBoosts,
                background: [],
            },
            // Update feats
            feats: currentFeats,
            // Update skillIncreases if bonus was selected
            skillIncreases: bonusSkill ? { ...character.skillIncreases, 0: bonusSkill } : character.skillIncreases,
        };

        // Clean up stale bonus skill if no longer valid
        const currentBonusSkill = character.skillIncreases?.[0];
        const classesList = getClasses();
        const classData = character.classId ? classesList.find((c: any) => c.id === character.classId) : null;

        // Check if there's currently an overlap
        let hasOverlap = false;
        if (classData && classData.trainedSkills && newBackground.trainedSkills) {
            hasOverlap = newBackground.trainedSkills.some((bgSkill: string) =>
                classData.trainedSkills.some((classSkill: string) =>
                    classSkill.toLowerCase() === bgSkill.toLowerCase()
                )
            );
        }

        // If no bonus skill provided and there's no overlap, clean up stale bonus
        if (!bonusSkill && currentBonusSkill && !hasOverlap) {
            // Check if the bonus skill is still valid
            const isStillValid = classData?.trainedSkills?.some(
                (classSkill: string) => classSkill.toLowerCase() === currentBonusSkill.toLowerCase()
            ) && newBackground.trainedSkills?.some(
                (bgSkill: string) => bgSkill.toLowerCase() === currentBonusSkill.toLowerCase()
            );

            if (!isStillValid) {
                // Remove the bonus skill registration - recalculation will handle skill proficiency
                const { 0: removed, ...remainingSkillIncreases } = character.skillIncreases || {};
                updatedCharacter.skillIncreases = remainingSkillIncreases;
            }
        }

        // Recalculate everything
        const updated = recalculateCharacter(updatedCharacter);
        handleCharacterUpdate(updated);
        setSelectionType(null);
    };

    const handleSkillOverlapBonusSelect = (skillName: string) => {
        if (pendingBackgroundId) {
            applyBackgroundSelection(pendingBackgroundId, skillName);
            setPendingBackgroundId(null);
            setOverlappingSkill(null);
        } else if (pendingClassId) {
            // Apply class selection with bonus skill - recalculation will handle skills
            if (character) {
                let updated = recalculateCharacter({
                    ...character,
                    classId: pendingClassId,
                    skillIncreases: { ...character.skillIncreases, 0: skillName },
                });
                updated = initializeSpellcastingForClass(updated);
                handleCharacterUpdate(updated);
            }
            setPendingClassId(null);
            setOverlappingSkill(null);
            // Close the class browser
            setSelectionType(null);
        }
    };

    const handleCloseSkillOverlapModal = () => {
        setPendingBackgroundId(null);
        setPendingClassId(null);
        setOverlappingSkill(null);
    };

    const handleSelectClass = (classId: string) => {
        if (character) {
            // Check for skill overlaps with background
            const classes = getClasses();
            const classData = classes.find(c => c.id === classId);

            if (classData && classData.trainedSkills && classData.trainedSkills.length > 0 && character.backgroundId) {
                const backgroundData = backgrounds.find((b: any) => b.id === character.backgroundId);

                if (backgroundData) {
                    // Check if any background skill overlaps with class skills
                    for (const bgSkill of backgroundData.trainedSkills) {
                        const bgSkillLower = bgSkill.toLowerCase();
                        const hasOverlap = classData.trainedSkills.some(
                            (classSkill: string) => classSkill.toLowerCase() === bgSkillLower
                        );

                        if (hasOverlap) {
                            // Check if bonus skill already matches the overlapping skill
                            const currentBonusSkill = character.skillIncreases?.[0]?.toLowerCase();

                            // Only show modal if the bonus skill doesn't match the overlap
                            // This prevents showing the modal unnecessarily when changing classes
                            if (currentBonusSkill && currentBonusSkill === bgSkillLower) {
                                // Bonus skill already matches - no need to show modal
                                // Just update the class
                                let updated = recalculateCharacter({
                                    ...character,
                                    classId,
                                });
                                updated = initializeSpellcastingForClass(updated);
                                handleCharacterUpdate(updated);
                                setSelectionType(null);
                                return;
                            }

                            // Show modal to select a different bonus skill
                            setPendingClassId(classId);
                            setOverlappingSkill(bgSkill);
                            return;
                        }
                    }
                }
            }

            // No overlap - check if we have a stale bonus skill to remove
            // Remove bonus skill registration if no longer valid
            const currentBonusSkill = character.skillIncreases?.[0];
            let updatedCharacter = { ...character, classId };

            if (currentBonusSkill) {
                const isStillValid = classData?.trainedSkills?.some(
                    (classSkill: string) => classSkill.toLowerCase() === currentBonusSkill.toLowerCase()
                );

                if (!isStillValid) {
                    // Remove the bonus skill registration - recalculation will handle skill proficiency
                    const { 0: removed, ...remainingSkillIncreases } = character.skillIncreases || {};
                    updatedCharacter.skillIncreases = remainingSkillIncreases;
                }
            }

            // Remove feats granted by the previous class specialization
            // This is important when changing from a class with granted feats (like Bard) to another class
            if (character.classSpecializationId && character.classId !== classId) {
                // Only process if classSpecializationId is a string (single specialization)
                if (typeof character.classSpecializationId === 'string') {
                    const oldGrantedFeatIds = getGrantedFeatIdsForLevel(
                        character.classId,
                        character.classSpecializationId,
                        20 // Get all granted feats regardless of level
                    );
                    if (oldGrantedFeatIds.length > 0) {
                        updatedCharacter.feats = updatedCharacter.feats.filter(
                            feat => !oldGrantedFeatIds.includes(feat.featId)
                        );
                    }
                }
                // Also clear the specialization since the new class may not have the same specialization options
                updatedCharacter.classSpecializationId = undefined;
            }

            // Automatically set class boost if class has only one key ability option
            if (classData?.keyAbility) {
                const keyAbility = Array.isArray(classData.keyAbility) ? classData.keyAbility : [classData.keyAbility];
                if (keyAbility.length === 1 && keyAbility[0] !== 'free') {
                    updatedCharacter.abilityBoosts = {
                        ...updatedCharacter.abilityBoosts,
                        class: keyAbility[0] as any,
                    };
                }
            }

            let updated = recalculateCharacter(updatedCharacter);
            // Initialize spellcasting for spellcaster classes
            updated = initializeSpellcastingForClass(updated);
            handleCharacterUpdate(updated);
        }
        setSelectionType(null);
    };

    const handleSelectClassSpecialization = (specializationId: string | string[]) => {
        if (character) {
            const className = getClassNameById(character.classId);
            const updateData: any = {
                ...character,
                classSpecializationId: specializationId,
            };

            // For Kineticist Single Gate ONLY, add automatic base junction
            // Dual Gate does NOT get automatic base junctions
            if (className === 'Kineticist' && !Array.isArray(specializationId)) {
                const element = getKineticistElementFromGateId(specializationId);
                if (element) {
                    const baseJunction = getBaseJunctionForElement(element);
                    if (baseJunction) {
                        updateData.kineticistJunctions = {
                            ...character.kineticistJunctions,
                            baseJunctions: [baseJunction],
                        };
                    }
                }
            }

            // Handle granted feats from class specializations (e.g., Bard Muse feats)
            // First, remove feats granted by the previous specialization (if any)
            let updatedFeats = [...character.feats];
            if (character.classSpecializationId && typeof character.classSpecializationId === 'string') {
                const oldGrantedFeatIds = getGrantedFeatIdsForLevel(
                    character.classId,
                    character.classSpecializationId,
                    20 // Get all granted feats regardless of level
                );
                updatedFeats = updatedFeats.filter(feat => !oldGrantedFeatIds.includes(feat.featId));
            }

            // Then, add feats granted by the new specialization
            if (typeof specializationId === 'string') {
                const newGrantedFeats = getGrantedFeatsForSpecialization(
                    character.classId,
                    specializationId
                );
                for (const grantedFeat of newGrantedFeats) {
                    // Check if feat already exists
                    const existingFeat = updatedFeats.find(
                        f => f.featId === grantedFeat.featId && f.level === grantedFeat.grantedAtLevel
                    );
                    if (!existingFeat) {
                        updatedFeats.push({
                            featId: grantedFeat.featId,
                            level: grantedFeat.grantedAtLevel,
                            source: grantedFeat.source,
                            slotType: grantedFeat.slotType,
                            grantedBy: `specialization:${specializationId}`, // Mark as granted by specialization
                        });
                    }
                }
            }

            updateData.feats = updatedFeats;

            const updated = recalculateCharacter(updateData);
            handleCharacterUpdate(updated);
        }
        setSelectionType(null);
    };

    const handleSelectSecondaryClass = (classId: string) => {
        if (character) {
            const updated = recalculateCharacter({
                ...character,
                secondaryClassId: classId,
            });
            handleCharacterUpdate(updated);
        }
        setSelectionType(null);
    };

    const handleApplyBoosts = (scores: Character['abilityScores'], boosts: Character['abilityBoosts']) => {
        if (character) {
            // For initial level 1 boosts, use the calculated scores directly without recalculation
            // This ensures the modal's calculation (which follows the correct boost rules) is preserved
            let updated = {
                ...character,
                abilityScores: scores,
                abilityBoosts: boosts,
            };

            // Validate INT bonus skills: remove skills for levels that no longer have INT boosts
            if (character.intBonusSkills && Object.keys(character.intBonusSkills).length > 0) {
                const validatedIntBonusSkills: { [level: number]: string[] } = {};
                const removedSkillNames = new Set<string>();

                for (const [lvl, skills] of Object.entries(character.intBonusSkills)) {
                    const level = parseInt(lvl);
                    const levelBoosts = boosts?.levelUp?.[level] || [];
                    const intBoostsAtLevel = levelBoosts.filter(b => b === 'int').length;

                    if (intBoostsAtLevel > 0 && skills.length > 0) {
                        // Keep skills for this level (truncate if needed)
                        validatedIntBonusSkills[level] = skills.slice(0, intBoostsAtLevel);
                    } else {
                        // Mark these skills for removal
                        skills.forEach(skill => removedSkillNames.add(skill));
                    }
                }

                // Update skills array: downgrade removed skills to untrained
                if (removedSkillNames.size > 0) {
                    const updatedSkills = [...character.skills];
                    const classesList = getClasses();
                    const classData = classesList.find((c: any) => c.id === character.classId);
                    const autoTrainedSkills = classData?.trainedSkills || [];

                    let backgroundSkills: string[] = [];
                    if (character.backgroundId) {
                        const bgData = backgrounds.find((b: any) => b.id === character.backgroundId);
                        if (bgData?.trainedSkills) {
                            backgroundSkills = bgData.trainedSkills;
                        }
                    }

                    for (const skillName of removedSkillNames) {
                        const existingSkill = updatedSkills.find(s => s.name.toLowerCase() === skillName.toLowerCase());
                        if (existingSkill && existingSkill.proficiency === 'trained') {
                            const isAutoTrained = autoTrainedSkills.some((s: string) => s.toLowerCase() === skillName.toLowerCase()) ||
                                backgroundSkills.some((s: string) => s.toLowerCase() === skillName.toLowerCase()) ||
                                skillName.toLowerCase() === 'perception';

                            if (!isAutoTrained) {
                                existingSkill.proficiency = 'untrained';
                            }
                        }
                    }

                    updated.skills = updatedSkills;
                }

                updated.intBonusSkills = validatedIntBonusSkills;
            }

            // Only recalculate if NOT initial boosts (level 1)
            // Level-up boosts need recalculation for HP, skills, etc.
            if (selectionLevel && selectionLevel > 1) {
                const recalculated = recalculateCharacter(updated);
                handleCharacterUpdate(recalculated);
            } else {
                handleCharacterUpdate(updated);
            }
        }
        setSelectionType(null);
    };

    const handleSelectFeat = (
        feat: LoadedFeat,
        source: CharacterFeat['source'],
        choices?: Record<string, string>,
        grantedItems?: Array<{ uuid: string; type: string }>
    ) => {
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
                choices: choices ? Object.values(choices) : undefined,
                choiceMap: choices, // Store the full choice map for resolving dynamic references
            };

            console.log('[handleSelectFeat] Creating new feat:', {
                name: feat.name,
                id: feat.id,
                level: targetLevel,
                source: source,
                slotType: slotType,
                choices: choices,
                choiceKeys: choices ? Object.keys(choices) : [],
                choiceValues: newFeat.choices,
            });

            // Replace existing feat of same source, level, and slotType, or add new
            // Note: Kineticist level 1 impulses are handled by the dedicated KineticistImpulseBrowser
            const matchingFeats = character.feats.filter(
                f => f.source === source && f.level === targetLevel && f.slotType === slotType
            );

            let updatedFeats: CharacterFeat[];
            let replacedFeatId: string | undefined;

            // Normal behavior: replace existing feat of same source, level, and slotType
            if (matchingFeats.length === 0) {
                // No matching feats - add new
                updatedFeats = [...character.feats, newFeat];
            } else {
                // Check if the existing feat was granted by a specialization (e.g., Bard Muse feat)
                const existingIndex = character.feats.findIndex(
                    f => f.source === source && f.level === targetLevel && f.slotType === slotType
                );
                const existingFeat = character.feats[existingIndex];

                // If the feat was granted by a specialization, it cannot be replaced
                if (existingFeat?.grantedBy?.startsWith('specialization:')) {
                    console.warn('[handleSelectFeat] Cannot replace feat granted by specialization:', existingFeat);
                    alert(t('errors.cannotReplaceGrantedFeat') || 'This feat was automatically granted by your class specialization and cannot be changed.');
                    return; // Prevent the feat replacement
                }

                // Replace first matching feat
                replacedFeatId = existingFeat.featId;
                updatedFeats = [...character.feats];
                updatedFeats[existingIndex] = newFeat;
            }

            // Handle granted items (feats, spells, etc.)
            if (grantedItems && grantedItems.length > 0) {
                for (const granted of grantedItems) {
                    if (granted.type === 'feat') {
                        let grantedUuid = granted.uuid;

                        // Check if this is a dynamic reference that needs to be resolved
                        // Format: "{item|flags.pf2e.rulesSelections.flagName}"
                        if (grantedUuid.includes('{item|flags.pf2e.rulesSelections.')) {
                            // Extract the flag name from the reference
                            const flagMatch = grantedUuid.match(/\{item\|flags\.pf2e\.rulesSelections\.([^}]+)\}/);
                            if (flagMatch && choices) {
                                const flagName = flagMatch[1];
                                // Find the choice value for this flag
                                // choices object has keys like "{featId}_{flag}_{index}"
                                const choiceKey = Object.keys(choices).find(k => k.includes(`_${flagName}_`));
                                if (choiceKey) {
                                    grantedUuid = choices[choiceKey];
                                    console.log(`[handleSelectFeat] Resolved dynamic UUID reference for flag "${flagName}": "${granted.uuid}" -> "${grantedUuid}"`);
                                } else {
                                    console.log(`[handleSelectFeat] Could not find choice key for flag "${flagName}" in choices:`, Object.keys(choices));
                                }
                            }
                        }

                        // Extract feat ID from UUID
                        // UUID can be:
                        // 1. Foundry format: "Compendium.pf2e.feats-srd.Item.Powerful Leap" -> "powerful-leap"
                        // 2. Direct feat ID: "unusual-treatment" (already the feat ID)
                        // 3. ID with hyphens: "unusual-treatment" (already correct)
                        let featId = grantedUuid;

                        // Handle Foundry-style compendium references
                        if (grantedUuid.includes('.')) {
                            const parts = grantedUuid.split('.');
                            const lastPart = parts[parts.length - 1]; // Get last part after final dot
                            // Remove "Item." prefix if present
                            featId = lastPart.replace('Item.', '').replace(/\s+/g, '-').toLowerCase();
                        }

                        console.log(`[handleSelectFeat] Processing granted item: original uuid="${granted.uuid}", resolvedUuid="${grantedUuid}", featId="${featId}"`);

                        if (featId) {
                            // Check if the granted feat already exists
                            const hasGrantedFeat = updatedFeats.some(f => f.featId === featId);
                            if (!hasGrantedFeat) {
                                // Add the granted feat as a bonus feat at same level
                                // Track which feat granted this (for cleanup when source feat is removed)
                                updatedFeats.push({
                                    featId: featId,
                                    level: targetLevel,
                                    source: 'bonus',
                                    slotType: slotType,
                                    grantedBy: feat.id, // Track the source feat
                                });
                                console.log(`[handleSelectFeat] Added granted feat "${featId}" from "${feat.name}"`);
                            } else {
                                console.log(`[handleSelectFeat] Granted feat "${featId}" already exists, skipping`);
                            }
                        }
                    }
                    // TODO: Handle granted spells and other item types
                }
            }

            // Remove bonus feats that were granted by the replaced feat
            if (replacedFeatId) {
                updatedFeats = updatedFeats.filter(f =>
                    !(f.source === 'bonus' && f.grantedBy === replacedFeatId)
                );
            }

            // Update archetype dedication tracking
            let updatedCharacter: Character = {
                ...character,
                feats: updatedFeats,
            };

            // Handle removal of replaced feat
            if (replacedFeatId) {
                updatedCharacter = updateDedicationTrackingOnRemove(updatedCharacter, replacedFeatId);
            }

            // Handle addition of new feat
            updatedCharacter = updateDedicationTrackingOnAdd(updatedCharacter, feat, targetLevel);

            // Recalculate ALL character data to ensure clean state
            // This properly handles feat replacement by only applying effects from active feats
            updatedCharacter = recalculateCharacter(updatedCharacter);

            // Handle spell choices (like Arcane Tattoos)
            // Spells from feat choices need to be added to knownSpells
            let updatedKnownSpells = character.spellcasting?.knownSpells || [];
            let hasSpellChoices = false;

            if (choices && Object.keys(choices).length > 0) {
                // Validate spell IDs against the actual spell database
                const allSpells = getSpells();
                const validSpellIds = new Set(allSpells.map(s => s.id.toLowerCase()));

                // Check if any of the choices are actual spells (validate against spell database)
                const spellChoices = Object.values(choices).filter(v => {
                    const normalizedId = v.toLowerCase().replace(/\s+/g, '-');
                    return v.includes('-') && validSpellIds.has(normalizedId);
                });

                if (spellChoices.length > 0) {
                    hasSpellChoices = true;
                    // Add spell slugs to knownSpells if not already present
                    for (const spellSlug of spellChoices) {
                        if (!updatedKnownSpells.includes(spellSlug)) {
                            updatedKnownSpells.push(spellSlug);
                        }
                    }
                }
            }

            // Initialize spellcasting if needed (for innate spells from feats like Arcane Tattoos)
            if (hasSpellChoices && !updatedCharacter.spellcasting) {
                updatedCharacter.spellcasting = {
                    tradition: 'arcane', // Default for Arcane Tattoos
                    spellcastingType: 'spontaneous',
                    keyAbility: 'int',
                    proficiency: 'untrained',
                    spellSlots: {},
                    knownSpells: updatedKnownSpells,
                };
            } else if (updatedCharacter.spellcasting) {
                updatedCharacter.spellcasting.knownSpells = updatedKnownSpells;
            }

            handleCharacterUpdate(updatedCharacter);
        }
        setSelectionType(null);
        setSelectionLevel(null);
    };

    const handleApplySkillTraining = (trainedSkills: SkillProficiency[], manualSkillTraining: string[]) => {
        if (character) {
            const updated = recalculateCharacter({
                ...character,
                skills: trainedSkills,
                manualSkillTraining: manualSkillTraining, // Save the original skill names for later recalculation
            });
            handleCharacterUpdate(updated);
        }
        setSelectionType(null);
    };

    const handleApplyLevelUpBoosts = (level: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20, boosts: AbilityName[]) => {
        if (character) {
            // Build updated abilityBoosts
            const updatedAbilityBoosts = {
                ...character.abilityBoosts,
                levelUp: {
                    ...character.abilityBoosts.levelUp,
                    [level]: boosts,
                },
            };

            // Check if INT boosts were removed at this level
            const oldIntBoosts = character.abilityBoosts?.levelUp?.[level]?.filter(b => b === 'int').length || 0;
            const newIntBoosts = boosts.filter(b => b === 'int').length;

            let updatedSkills = character.skills;
            let updatedIntBonusSkills = character.intBonusSkills || {};

            // If INT boosts were reduced, remove excess skills
            if (newIntBoosts < oldIntBoosts && character.intBonusSkills?.[level]) {
                const skillsAtLevel = character.intBonusSkills[level];
                const skillsToRemove = skillsAtLevel.slice(newIntBoosts); // Remove excess skills

                // Update intBonusSkills
                if (newIntBoosts === 0) {
                    // No INT boosts at this level anymore, remove all skills for this level
                    delete updatedIntBonusSkills[level];
                } else {
                    // Keep only the first newIntBoosts skills
                    updatedIntBonusSkills = {
                        ...updatedIntBonusSkills,
                        [level]: skillsAtLevel.slice(0, newIntBoosts)
                    };
                }

                // Downgrade removed skills to untrained
                const classesList = getClasses();
                const classData = classesList.find((c: any) => c.id === character.classId);
                const autoTrainedSkills = classData?.trainedSkills || [];

                let backgroundSkills: string[] = [];
                if (character.backgroundId) {
                    const bgData = backgrounds.find((b: any) => b.id === character.backgroundId);
                    if (bgData?.trainedSkills) {
                        backgroundSkills = bgData.trainedSkills;
                    }
                }

                updatedSkills = character.skills.map(skill => {
                    if (skillsToRemove.some(s => s.toLowerCase() === skill.name.toLowerCase()) && skill.proficiency === 'trained') {
                        const isAutoTrained = autoTrainedSkills.some((s: string) => s.toLowerCase() === skill.name.toLowerCase()) ||
                            backgroundSkills.some((s: string) => s.toLowerCase() === skill.name.toLowerCase()) ||
                            skill.name.toLowerCase() === 'perception';

                        if (!isAutoTrained) {
                            return { ...skill, proficiency: 'untrained' as const };
                        }
                    }
                    return skill;
                });
            }

            const updated = recalculateCharacter({
                ...character,
                abilityBoosts: updatedAbilityBoosts,
                skills: updatedSkills,
                intBonusSkills: updatedIntBonusSkills,
            });
            handleCharacterUpdate(updated);
        }
        setSelectionType(null);
    };

    const handleApplySkillIncrease = (skillName: string) => {
        console.log('[SkillIncrease] Called with skillName:', skillName, 'selectionLevel:', selectionLevel);
        if (character && selectionLevel) {
            console.log('[SkillIncrease] Current skillIncreases:', character.skillIncreases);
            const newSkillIncreases = {
                ...character.skillIncreases,
                [selectionLevel]: skillName,
            };
            console.log('[SkillIncrease] New skillIncreases:', newSkillIncreases);
            const updated = recalculateCharacter({
                ...character,
                skillIncreases: newSkillIncreases,
            });
            console.log('[SkillIncrease] Updated character skillIncreases:', updated.skillIncreases);
            handleCharacterUpdate(updated);
        }
        setSelectionType(null);
        setSelectionLevel(null);
    };

    const _handleSelectKineticistImpulse = (feats: CharacterFeat[]) => {
        if (character) {
            const updated = recalculateCharacter({
                ...character,
                feats: [...character.feats, ...feats],
            });
            handleCharacterUpdate(updated);
        }
        setSelectionType(null);
    };

    const handleSelectKineticistJunction = (junctionData: {
        choice: 'expand_the_portal' | 'fork_the_path';
        junctionIds?: string[];
        newElementGateId?: string;
        newElementImpulseId?: string;
    }) => {
        console.log('[CharacterSheetPage] handleSelectKineticistJunction called');
        console.log('[CharacterSheetPage] junctionData received:', junctionData);
        console.log('[CharacterSheetPage] character:', character);
        console.log('[CharacterSheetPage] selectionLevel:', selectionLevel);

        if (character && selectionLevel) {
            const level = selectionLevel;

            // Debug log
            console.log('[Kineticist Junction] Saving junction data at level', level, ':', junctionData);
            console.log('[Kineticist Junction] Current character.kineticistJunctions:', character.kineticistJunctions);

            // Check if there was a previous selection at this level
            const previousJunction = character.kineticistJunctions?.[level];
            const wasForkThePath = previousJunction?.choice === 'fork_the_path';
            const wasExpandThePortal = previousJunction?.choice === 'expand_the_portal';
            console.log('[Kineticist Junction] previousJunction:', previousJunction);
            console.log('[Kineticist Junction] wasForkThePath:', wasForkThePath, 'wasExpandThePortal:', wasExpandThePortal);

            // Remove impulses from this level if changing choice
            let updatedFeats = character.feats;
            if ((wasForkThePath && junctionData.choice === 'expand_the_portal') ||
                (wasExpandThePortal && junctionData.choice === 'fork_the_path')) {

                console.log('[Kineticist Junction] Choice changed, removing old impulses...');
                // Get all feats to check which ones are impulses
                const allFeats = getFeats();

                // Remove all impulse feats at this level by checking the feat data
                updatedFeats = character.feats.filter(f => {
                    if (f.level !== level || f.source !== 'class') {
                        return true; // Keep feats not at this level
                    }

                    // Check if this feat is an impulse by looking at the feat data
                    const featData = allFeats.find(feat => feat.id === f.featId);
                    if (featData && featData.traits.includes('impulse')) {
                        console.log('[Kineticist Junction] Removing impulse:', featData.name);
                        return false; // Remove this impulse
                    }

                    return true; // Keep non-impulse feats
                });

                console.log('[Kineticist Junction] Removed old impulses from level', level);
            }

            // Add gateId to junctionData for Expand the Portal
            // Extract from junctionIds (e.g., "air_gate_skill_junction" -> "air-gate")
            type JunctionDataWithGateId = typeof junctionData & { gateId?: string | null };
            let junctionDataWithGateId: JunctionDataWithGateId = { ...junctionData };
            if (junctionData.choice === 'expand_the_portal' && junctionData.junctionIds && junctionData.junctionIds.length > 0) {
                const firstJunctionId = junctionData.junctionIds[0];
                // Extract element from junctionId (e.g., "air_gate_skill_junction" -> "air")
                const element = firstJunctionId.split('_')[0];
                // Map element to gate ID
                const gateIdMap: Record<string, string> = {
                    'air': 'X11Y3T1IzmtNqGMV', // Air Gate
                    'earth': 'dEm00L1XFXFCH2wS', // Earth Gate
                    'fire': 'PfeDtJBJdUun0THS', // Fire Gate
                    'metal': '21JjdNW0RQ2LfaH3', // Metal Gate
                    'water': 'MvunDFH8Karxee0t', // Water Gate
                    'wood': '8X8db58vKx21L0Dr', // Wood Gate
                };
                junctionDataWithGateId.gateId = gateIdMap[element] || null;
                console.log('[Kineticist Junction] Deduced gateId from junction:', element, '->', junctionDataWithGateId.gateId);
            }

            const updatedJunctions = {
                ...(character.kineticistJunctions || {}),
                [level]: junctionDataWithGateId,
            };

            console.log('[Kineticist Junction] Updated junctions object:', updatedJunctions);

            // If Fork the Path, also add the new impulse feat automatically
            // If Expand the Portal, impulse will be selected in the feats section
            if (junctionData.choice === 'fork_the_path' && junctionData.newElementImpulseId) {
                console.log('[Kineticist Junction] Fork the Path selected, adding impulse feat:', junctionData.newElementImpulseId);
                const newFeat: CharacterFeat = {
                    featId: junctionData.newElementImpulseId,
                    level: level,
                    source: 'class',
                    slotType: 'impulse',
                };
                updatedFeats = [...updatedFeats, newFeat];
            }

            // Add any feats granted by junctions (e.g., skill junctions grant skill feats like Experienced Smuggler)
            const allFeats = getFeats();
            const tempCharacterWithJunctions = { ...character, kineticistJunctions: updatedJunctions };
            const grantedFeatNames = getAllKineticistJunctionGrantedFeats(tempCharacterWithJunctions);
            console.log('[Kineticist Junction] Granted feats from junctions:', grantedFeatNames);

            if (grantedFeatNames.length > 0) {
                for (const featName of grantedFeatNames) {
                    // Find the feat by name
                    const grantedFeat = allFeats.find(f => f.name === featName);
                    if (grantedFeat) {
                        console.log('[Kineticist Junction] Adding granted feat:', grantedFeat.name);

                        // Check if this feat is already in the list
                        const hasGrantedFeat = updatedFeats.some(f => f.featId === grantedFeat.id);
                        if (!hasGrantedFeat) {
                            // Add the granted feat as a bonus feat at this level
                            // Use 'kineticist-junction' as the source to track it comes from a junction
                            const newFeat: CharacterFeat = {
                                featId: grantedFeat.id,
                                level: level,
                                source: 'bonus',
                                slotType: 'skill', // Skill junctions grant skill feats
                                grantedBy: `kineticist-junction-${level}`, // Track which junction granted this
                            };
                            updatedFeats = [...updatedFeats, newFeat];
                        }
                    }
                }
            }

            // Remove old bonus feats that were granted by junctions at this level
            // This handles the case where the user changes their junction selection
            updatedFeats = updatedFeats.filter(f => {
                if (f.source === 'bonus' && f.grantedBy?.startsWith(`kineticist-junction-${level}`)) {
                    // Check if this feat is still granted by the new junction selection
                    const featData = allFeats.find(feat => feat.id === f.featId);
                    if (featData && grantedFeatNames.includes(featData.name)) {
                        return true; // Keep this feat, it's still granted
                    }
                    console.log('[Kineticist Junction] Removing old granted feat:', featData?.name);
                    return false; // Remove this feat, it's no longer granted
                }
                return true; // Keep all other feats
            });

            console.log('[Kineticist Junction] Calling recalculateCharacter...');
            const updated = recalculateCharacter({
                ...character,
                kineticistJunctions: updatedJunctions,
                feats: updatedFeats,
            });

            console.log('[Kineticist Junction] Final character junctions after recalc:', updated.kineticistJunctions);
            console.log('[Kineticist Junction] Calling handleCharacterUpdate...');
            handleCharacterUpdate(updated);
            console.log('[Kineticist Junction] handleCharacterUpdate completed');
        } else {
            console.log('[CharacterSheetPage] Cannot save junction - missing character or selectionLevel');
        }
        setSelectionType(null);
        setSelectionLevel(null);
    };

    const handleApplyIntBonusSkills = (intBonusSkills: { [level: number]: string[] }) => {
        if (character) {
            console.log('[IntBonusSkills] Applying INT bonus skills:', intBonusSkills);

            // Validate: remove skills for levels that don't have INT boosts anymore
            const validatedIntBonusSkills: { [level: number]: string[] } = {};
            for (const [lvl, skills] of Object.entries(intBonusSkills)) {
                const level = parseInt(lvl);
                const levelBoosts = character.abilityBoosts?.levelUp?.[level] || [];
                const intBoostsAtLevel = levelBoosts.filter(b => b === 'int').length;

                // Only keep skills if there are still INT boosts at this level
                if (intBoostsAtLevel > 0 && skills.length > 0) {
                    validatedIntBonusSkills[level] = skills.slice(0, intBoostsAtLevel);
                }
            }

            // Get all valid skill names from validated intBonusSkills
            const allValidSkillNames = new Set<string>();
            Object.values(validatedIntBonusSkills).forEach(skills => {
                skills.forEach(skill => allValidSkillNames.add(skill));
            });

            // Get old skill names to find which ones were removed
            const oldSkillNames = new Set<string>();
            Object.values(character.intBonusSkills || {}).forEach(skills => {
                skills.forEach(skill => oldSkillNames.add(skill));
            });

            // Find removed skills (were in old but not in new)
            const removedSkills = [...oldSkillNames].filter(skill => !allValidSkillNames.has(skill));

            // Update skills: add new ones, downgrade removed ones to untrained
            const updatedSkills = [...character.skills];

            // Add or keep valid skills as trained
            for (const skillName of allValidSkillNames) {
                const existingSkill = updatedSkills.find(s => s.name.toLowerCase() === skillName.toLowerCase());

                if (!existingSkill) {
                    // Find skill data to get ability score
                    const skillData = skillsData.find(s => s.name.toLowerCase() === skillName.toLowerCase());
                    if (skillData) {
                        updatedSkills.push({
                            name: skillName,
                            ability: skillData.ability,
                            proficiency: 'trained',
                        });
                    }
                } else if (existingSkill.proficiency === 'untrained') {
                    // Upgrade from untrained to trained
                    existingSkill.proficiency = 'trained';
                }
            }

            // Downgrade removed skills to untrained (only if they were trained via INT bonus)
            for (const skillName of removedSkills) {
                const existingSkill = updatedSkills.find(s => s.name.toLowerCase() === skillName.toLowerCase());
                if (existingSkill && existingSkill.proficiency === 'trained') {
                    // Check if this skill is NOT trained by other means (class, background, etc.)
                    const classesList = getClasses();
                    const classData = classesList.find((c: any) => c.id === character.classId);
                    const autoTrainedSkills = classData?.trainedSkills || [];

                    let backgroundSkills: string[] = [];
                    if (character.backgroundId) {
                        const bgData = backgrounds.find((b: any) => b.id === character.backgroundId);
                        if (bgData?.trainedSkills) {
                            backgroundSkills = bgData.trainedSkills;
                        }
                    }

                    const isAutoTrained = autoTrainedSkills.some((s: string) => s.toLowerCase() === skillName.toLowerCase()) ||
                        backgroundSkills.some((s: string) => s.toLowerCase() === skillName.toLowerCase()) ||
                        skillName.toLowerCase() === 'perception';

                    // Only downgrade to untrained if not auto-trained by class/background
                    if (!isAutoTrained) {
                        existingSkill.proficiency = 'untrained';
                    }
                }
            }

            const updated = recalculateCharacter({
                ...character,
                skills: updatedSkills,
                intBonusSkills: validatedIntBonusSkills,
            });

            handleCharacterUpdate(updated);
        }
        setSelectionType(null);
    };

    const handleRemoveFeat = (featId: string) => {
        if (!character) return;

        const allFeats = getFeats();
        const featToRemove = allFeats.find(f => f.id === featId);

        if (!featToRemove) return;

        let updatedCharacter: Character;

        if (isArchetypeDedication(featToRemove)) {
            // Remove dedication and ALL archetype feats
            const result = removeDedicationAndArchetypeFeats(character, featId);
            updatedCharacter = result.character;

            // Recalculate after removing archetype feats
            updatedCharacter = recalculateCharacter(updatedCharacter);
        } else {
            // Regular feat removal - remove this feat and any bonus feats it granted
            updatedCharacter = {
                ...character,
                feats: character.feats.filter(f => {
                    // Remove the feat itself
                    if (f.featId === featId) return false;
                    // Also remove any bonus feats that were granted by this feat
                    if (f.source === 'bonus' && f.grantedBy === featId) return false;
                    return true;
                }),
            };

            // Update dedication tracking
            updatedCharacter = updateDedicationTrackingOnRemove(updatedCharacter, featId);

            // Recalculate after removing feat
            updatedCharacter = recalculateCharacter(updatedCharacter);
        }

        handleCharacterUpdate(updatedCharacter);
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

            {selectionType === 'classSpecialization' && (
                <ClassSpecializationBrowser
                    classId={character.classId}
                    currentSpecializationId={character.classSpecializationId}
                    onClose={handleCloseSelection}
                    onSelect={handleSelectClassSpecialization}
                    characterLevel={character.level || 1}
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
                    onRemove={handleRemoveFeat}
                    filterCategory="ancestry"
                    characterLevel={selectionLevel ?? character.level}
                    ancestryId={character.ancestryId}
                    heritageId={character.heritageId}
                    character={character}
                />
            )}

            {selectionType === 'classFeat' && (
                <FeatBrowser
                    onClose={handleCloseSelection}
                    onSelect={handleSelectFeat}
                    onRemove={handleRemoveFeat}
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
                    onRemove={handleRemoveFeat}
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
                    onRemove={handleRemoveFeat}
                    filterCategory="skill"
                    characterLevel={selectionLevel ?? character.level}
                    character={character}
                />
            )}

            {selectionType === 'generalFeat' && (
                <FeatBrowser
                    onClose={handleCloseSelection}
                    onSelect={handleSelectFeat}
                    onRemove={handleRemoveFeat}
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

            {(pendingBackgroundId || pendingClassId) && overlappingSkill && character && (
                <SkillOverlapBonusModal
                    currentSkills={character.skills || []}
                    overlappingSkill={overlappingSkill}
                    onClose={handleCloseSkillOverlapModal}
                    onSelect={handleSkillOverlapBonusSelect}
                />
            )}

            {selectionType === 'tactics' && character.classId === 'Oyee5Ds9uwYLEkD0' && (() => {
                // Determine max selections based on level
                const level = selectionLevel ?? character.level;
                let maxSelections = 1;
                if (level === 1) maxSelections = 5;
                else if (level === 7) maxSelections = 2;
                else if (level === 15) maxSelections = 2;
                else if (level === 19) maxSelections = 2;

                return (
                    <TacticBrowser
                        characterLevel={level}
                        knownTactics={character.tactics?.known || []}
                        maxSelections={maxSelections}
                        onSelect={(tactic) => {
                            if (character) {
                                const currentTactics = character.tactics || { known: [], prepared: [] };
                                const newKnown = [...currentTactics.known, tactic.id];

                                // Auto-add to prepared if we have room
                                let newPrepared = [...currentTactics.prepared];
                                const maxPrepared = 3;
                                if (newPrepared.length < maxPrepared && !newPrepared.includes(tactic.id)) {
                                    newPrepared.push(tactic.id);
                                }

                                handleCharacterUpdate({
                                    ...character,
                                    tactics: {
                                        ...currentTactics,
                                        known: newKnown,
                                        prepared: newPrepared,
                                    },
                                });
                            }
                            // Don't close the browser - let user continue selecting
                        }}
                        onRemove={(tacticId) => {
                            if (character) {
                                const currentTactics = character.tactics || { known: [], prepared: [] };
                                const newKnown = currentTactics.known.filter(id => id !== tacticId);
                                const newPrepared = currentTactics.prepared.filter(id => id !== tacticId);

                                handleCharacterUpdate({
                                    ...character,
                                    tactics: {
                                        ...currentTactics,
                                        known: newKnown,
                                        prepared: newPrepared,
                                    },
                                });
                            }
                        }}
                        onClose={handleCloseSelection}
                    />
                );
            })()}

            {selectionType === 'kineticistImpulse' && character && (
                <KineticistImpulseBrowser
                    character={character}
                    level={selectionLevel || 1}
                    onClose={handleCloseSelection}
                    onConfirm={(feats) => {
                        const targetLevel = selectionLevel || 1;

                        // Remove any existing impulse feats at this level (to avoid duplicates)
                        const filteredFeats = character.feats.filter(
                            f => !(f.level === targetLevel && f.source === 'class' && f.slotType === 'impulse')
                        );

                        // Mark all new feats as impulse slotType
                        const impulseFeats = feats.map(f => ({
                            ...f,
                            slotType: 'impulse' as const,
                        }));

                        handleCharacterUpdate({
                            ...character,
                            feats: [...filteredFeats, ...impulseFeats],
                        });
                        handleCloseSelection();
                    }}
                />
            )}

            {selectionType === 'kineticistJunction' && character && selectionLevel && (
                <>
                    {console.log('[CharacterSheetPage] Rendering KineticistJunctionBrowser with level:', selectionLevel)}
                    <KineticistJunctionBrowser
                        character={character}
                        level={selectionLevel}
                        onClose={handleCloseSelection}
                        onConfirm={handleSelectKineticistJunction}
                    />
                </>
            )}

            {selectionType === 'intBonusSkills' && character && (
                <IntBonusSkillModal
                    character={character}
                    level={selectionLevel ?? undefined}
                    onClose={handleCloseSelection}
                    onApply={handleApplyIntBonusSkills}
                />
            )}

            {selectionType === 'heritageSpell' && pendingHeritageId && (
                <HeritageSpellModal
                    isOpen={true}
                    heritageId={pendingHeritageId}
                    onClose={() => {
                        setPendingHeritageId(null);
                        setSelectionType(null);
                    }}
                    onApply={handleApplyHeritageSpell}
                />
            )}
        </>
    );
};

export default CharacterSheetPage;
