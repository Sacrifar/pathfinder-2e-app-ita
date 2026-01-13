import React, { useState, useMemo } from 'react';
import { TopBar } from './TopBar';
import { LevelSidebar } from './LevelSidebar';
import { MainMenu } from './MainMenu';
import { StatsHeader } from './StatsHeader';
import { CharacterTabs, TabId } from './CharacterTabs';
import { SkillsPanel, SkillDisplay } from './SkillsPanel';
import { WeaponsPanel } from './WeaponsPanel';
import { DefensePanel } from './DefensePanel';
import { GearPanel } from './GearPanel';
import { ResourcesPanel } from './ResourcesPanel';
import { SpellsPanel } from './SpellsPanel';
import { PetsPanel } from './PetsPanel';
import { FeatsPanel } from './FeatsPanel';
import { ActionsPanel } from './ActionsPanel';
import { DetailModal, ActionDetailContent } from './DetailModal';
import { RestModal } from './RestModal';
import { VariantRulesPanel } from './VariantRulesPanel';
import { ActiveConditions } from './ActiveConditions';
import { ConditionBrowser } from './ConditionBrowser';
import { BuffBrowser } from './BuffBrowser';
import { EquipmentBrowser } from './EquipmentBrowser';
import { LoadedCondition, LoadedGear, getFeats } from '../../data/pf2e-loader';
import { useLanguage, useLocalizedName } from '../../hooks/useLanguage';
import { Character, Proficiency, Buff, AbilityName } from '../../types';
import { ancestries, classes, backgrounds, heritages, skills as skillsData } from '../../data';
import {
    calculateConditionPenalties,
    getSkillPenalty,
    getACPenalty,
    getPerceptionPenalty,
} from '../../utils/conditionModifiers';
import {
    calculateMaxHP,
    calculateACWithABP,
    getAbilityModifier,
    ProficiencyRank,
    calculateProficiencyBonusWithVariant
} from '../../utils/pf2e-math';
import {
    exportCharacterAsJSON,
    importCharacterFromJSON,
    copyStatBlockToClipboard,
    generateShareableLink,
    printCharacterSheet,
    CloudSync
} from '../../utils/characterExport';
import {
    getAllFeatSlotsUpToLevel,
    hasAbilityBoostAtLevel,
    SKILL_INCREASE_LEVELS,
} from '../../utils/levelingSchedule';

interface ActionData {
    id: string;
    name: string;
    cost: string;
    description: string;
    traits: string[];
    skill?: string;
}

interface DesktopCharacterLayoutProps {
    character: Character;
    onCharacterUpdate: (character: Character) => void;
    onOpenSelection: (type: string, targetLevel?: number) => void;
}

export const DesktopCharacterLayout: React.FC<DesktopCharacterLayoutProps> = ({
    character,
    onCharacterUpdate,
    onOpenSelection,
}) => {
    const { t } = useLanguage();
    const getName = useLocalizedName();
    const [activeTab, setActiveTab] = useState<TabId>('weapons');
    const [menuOpen, setMenuOpen] = useState(false);
    const [selectedAction, setSelectedAction] = useState<ActionData | null>(null);
    const [showConditionBrowser, setShowConditionBrowser] = useState(false);
    const [showBuffBrowser, setShowBuffBrowser] = useState(false);
    const [showEquipmentBrowser, setShowEquipmentBrowser] = useState(false);
    const [showRestModal, setShowRestModal] = useState(false);
    const [showVariantRules, setShowVariantRules] = useState(false);

    // Lookup entity names
    const selectedAncestry = ancestries.find(a => a.id === character.ancestryId);
    const selectedClass = classes.find(c => c.id === character.classId);
    const selectedBackground = backgrounds.find(b => b.id === character.backgroundId);
    const selectedHeritage = heritages.find(h => h.id === character.heritageId);
    const selectedSecondaryClass = character.secondaryClassId
        ? classes.find(c => c.id === character.secondaryClassId)
        : null;

    const ancestryName = selectedAncestry ? getName(selectedAncestry) : '';
    const className = selectedClass ? getName(selectedClass) : '';
    const secondaryClassName = selectedSecondaryClass ? getName(selectedSecondaryClass) : null;
    const backgroundName = selectedBackground ? getName(selectedBackground) : '';
    const heritageName = selectedHeritage ? getName(selectedHeritage) : '';

    // Combine class names for Dual Class
    const displayClassName = character.variantRules?.dualClass && secondaryClassName
        ? `${className} / ${secondaryClassName}`
        : className;

    // Calculate condition penalties once
    const conditionPenalties = calculateConditionPenalties(character.conditions || []);

    // Build level sections for sidebar - NOW VARIANT-AWARE
    const buildSections = useMemo(() => {
        const sections = [];
        const feats = character.feats || [];
        const allFeats = getFeats();
        const variantRules = character.variantRules || {};

        // Helper to get feat name by id
        const getFeatName = (featId: string | undefined) => {
            if (!featId) return '';
            return allFeats.find(f => f.id === featId)?.name || featId;
        };

        // Helper to get skill increase display name
        const getSkillIncreaseName = (level: number) => {
            const skillName = character.skillIncreases?.[level];
            if (!skillName) return '';
            const skillDef = skillsData.find(s => s.name.toLowerCase() === skillName.toLowerCase());
            if (!skillDef) return skillName;
            return getName(skillDef);
        };

        // Get all feat slots using variant-aware function
        const allFeatSlots = getAllFeatSlotsUpToLevel(20, variantRules);

        // Group feat slots by level
        const featSlotsByLevel: Record<number, Array<{type: string; index: number}>> = {};
        allFeatSlots.forEach(slot => {
            if (!featSlotsByLevel[slot.level]) {
                featSlotsByLevel[slot.level] = [];
            }
            // Track multiple feats of same type with index
            const existingOfType = featSlotsByLevel[slot.level].filter(s => s.type === slot.type).length;
            featSlotsByLevel[slot.level].push({ type: slot.type, index: existingOfType });
        });

        // Build sections for each level 1-20
        for (let level = 1; level <= 20; level++) {
            const choices = [];

            // Level 1 has special character creation choices
            if (level === 1) {
                choices.push(
                    {
                        id: 'ancestry',
                        type: 'ancestry',
                        label: 'builder.ancestry',
                        value: ancestryName,
                        required: true,
                        onClick: () => onOpenSelection('ancestry', 1),
                    },
                    {
                        id: 'heritage',
                        type: 'heritage',
                        label: 'builder.heritage',
                        value: heritageName,
                        required: true,
                        onClick: () => onOpenSelection('heritage', 1),
                    },
                    {
                        id: 'background',
                        type: 'background',
                        label: 'builder.background',
                        value: backgroundName,
                        required: true,
                        onClick: () => onOpenSelection('background', 1),
                    },
                    {
                        id: 'class',
                        type: 'class',
                        label: 'builder.class',
                        value: className,
                        required: true,
                        onClick: () => onOpenSelection('class', 1),
                    },
                    ...(variantRules.dualClass ? [{
                        id: 'secondaryClass',
                        type: 'secondaryClass',
                        label: 'builder.secondaryClass',
                        value: secondaryClassName || '',
                        required: true,
                        onClick: () => onOpenSelection('secondaryClass', 1),
                    } as const] : []),
                    {
                        id: 'boosts',
                        type: 'boost',
                        label: 'builder.abilityBoosts',
                        value: (() => {
                            const boosts = character.abilityBoosts;
                            const totalBoosts =
                                (boosts?.ancestry?.length || 0) +
                                (boosts?.background?.length || 0) +
                                (boosts?.class ? 1 : 0) +
                                (boosts?.free?.length || 0);
                            return totalBoosts > 0 ? `${totalBoosts} boosts` : '';
                        })(),
                        required: true,
                        onClick: () => onOpenSelection('boost', 1),
                    },
                    {
                        id: 'skillTraining',
                        type: 'skill',
                        label: 'builder.skillTraining',
                        value: (() => {
                            const trainedCount = character.skills.filter(s => s.proficiency !== 'untrained').length;
                            return trainedCount > 0 ? `${trainedCount} skills` : '';
                        })(),
                        required: true,
                        onClick: () => onOpenSelection('skillTraining', 1),
                    }
                );
            }

            // Add ability boosts if this level has them (including Gradual Ability Boosts)
            if (level > 1 && hasAbilityBoostAtLevel(level, variantRules.gradualAbilityBoosts)) {
                const levelBoosts = character.abilityBoosts?.levelUp?.[level] || [];
                const boostsCount = variantRules.gradualAbilityBoosts ? 1 : 4;

                choices.push({
                    id: `boosts${level}`,
                    type: 'boost',
                    label: variantRules.gradualAbilityBoosts ? 'builder.abilityBoost' : 'builder.levelUpBoosts',
                    value: levelBoosts.length > 0 ? `${levelBoosts.length}/${boostsCount}` : '',
                    required: true,
                    onClick: () => onOpenSelection(`boost${level}`, level),
                });
            }

            // Add skill increases if this level has them
            if (SKILL_INCREASE_LEVELS.includes(level as any)) {
                choices.push({
                    id: `skillIncrease${level}`,
                    type: 'skill',
                    label: 'builder.skillIncrease',
                    value: getSkillIncreaseName(level),
                    required: true,
                    onClick: () => onOpenSelection('skillIncrease', level),
                });
            }

            // Add feat slots for this level
            const levelFeatSlots = featSlotsByLevel[level] || [];
            levelFeatSlots.forEach((slot, idx) => {
                let featId: string | undefined;

                // Count how many slots of this type exist before this one (to get the correct feat index)
                const slotIndex = levelFeatSlots.slice(0, idx).filter(s => s.type === slot.type).length;

                // Find the feat for this slot
                const featsOfSlotTypeAtLevel = feats.filter(f => {
                    // Match by level
                    if (f.level !== level) return false;

                    // For archetype slots, match feats with slotType='archetype'
                    if (slot.type === 'archetype') {
                        return f.slotType === 'archetype';
                    }

                    // For other slots, match by slotType or fall back to source for backwards compatibility
                    if (f.slotType === slot.type) return true;

                    // Backwards compatibility: if slotType is undefined, check source
                    if (!f.slotType && f.source === slot.type) return true;

                    return false;
                });
                featId = featsOfSlotTypeAtLevel[slotIndex]?.featId;

                // Determine label based on feat type
                let labelKey = 'builder.classFeat';
                switch (slot.type) {
                    case 'ancestry':
                        labelKey = 'builder.ancestryFeat';
                        break;
                    case 'class':
                    case 'archetype':
                        labelKey = slot.type === 'archetype' ? 'builder.archetypeFeat' : 'builder.classFeat';
                        break;
                    case 'general':
                        labelKey = 'builder.generalFeat';
                        break;
                    case 'skill':
                        labelKey = 'builder.skillFeat';
                        break;
                }

                choices.push({
                    id: `${slot.type}Feat${level}${idx > 0 ? idx : ''}`,
                    type: 'feat',
                    label: labelKey,
                    value: getFeatName(featId),
                    required: true,
                    onClick: () => onOpenSelection(slot.type === 'archetype' ? 'archetypeFeat' : `${slot.type}Feat`, level),
                });
            });

            sections.push({
                level,
                choices,
            });
        }

        return sections;
    }, [character, ancestryName, className, secondaryClassName, backgroundName, heritageName, displayClassName, getName, onOpenSelection]);

    const handleRest = () => {
        // Open the Rest & Recovery modal
        setShowRestModal(true);
    };

    const handleSkillClick = (skill: any) => {
        // Show skill actions popup
        console.log('Skill clicked:', skill);
    };

    // Condition Handlers
    const handleAddCondition = (condition: LoadedCondition) => {
        const currentConditions = character.conditions || [];
        if (!currentConditions.find(c => c.id === condition.id)) {
            const newCondition = {
                id: condition.id,
                value: condition.isValued ? (condition.value || 1) : undefined
            };
            onCharacterUpdate({
                ...character,
                conditions: [...currentConditions, newCondition]
            });
        }
        setShowConditionBrowser(false);
    };

    const handleRemoveCondition = (conditionId: string) => {
        const currentConditions = character.conditions || [];
        onCharacterUpdate({
            ...character,
            conditions: currentConditions.filter(c => c.id !== conditionId)
        });
    };

    const handleUpdateConditionValue = (conditionId: string, value: number) => {
        const currentConditions = character.conditions || [];
        onCharacterUpdate({
            ...character,
            conditions: currentConditions.map(c =>
                c.id === conditionId ? { ...c, value } : c
            )
        });
    };

    // Buff handlers
    const handleAddBuff = (buff: Buff) => {
        const currentBuffs = character.buffs || [];
        onCharacterUpdate({
            ...character,
            buffs: [...currentBuffs, buff]
        });
        setShowBuffBrowser(false);
    };

    const handleRemoveBuff = (buffId: string) => {
        const currentBuffs = character.buffs || [];
        onCharacterUpdate({
            ...character,
            buffs: currentBuffs.filter(b => b.id !== buffId)
        });
    };

    const handleUpdateBuffDuration = (buffId: string, duration: number) => {
        const currentBuffs = character.buffs || [];
        onCharacterUpdate({
            ...character,
            buffs: currentBuffs.map(b =>
                b.id === buffId ? { ...b, duration } : b
            )
        });
    };

    // Advance Round: decrement durations, handle frightened value decrease, remove expired effects
    const handleAdvanceRound = () => {
        const currentConditions = character.conditions || [];
        const currentBuffs = character.buffs || [];

        // Update conditions: decrement duration, auto-decrease frightened value
        const updatedConditions = currentConditions
            .map(c => {
                // Conditions that decrease by 1 at end of round (e.g., Frightened)
                if (c.id === 'frightened' && c.value && c.value > 1) {
                    return { ...c, value: c.value - 1 };
                }
                // Decrement duration for timed conditions
                if (c.duration !== undefined) {
                    return c.duration > 1 ? { ...c, duration: c.duration - 1 } : null;
                }
                return c;
            })
            .filter((c): c is NonNullable<typeof c> => c !== null);

        // Update buffs: decrement duration, remove if reaches 0
        const updatedBuffs = currentBuffs
            .map(b => {
                if (b.duration !== undefined) {
                    return b.duration > 1 ? { ...b, duration: b.duration - 1 } : null;
                }
                return b;
            })
            .filter((b): b is NonNullable<typeof b> => b !== null);

        onCharacterUpdate({
            ...character,
            conditions: updatedConditions,
            buffs: updatedBuffs
        });
    };

    // Equipment handlers for gear
    const handleEquipGear = (gear: LoadedGear) => {
        const currentEquipment = character.equipment || [];
        // Create new equipment item from LoadedGear
        const newEquipmentItem = {
            id: gear.id,
            name: gear.name,
            bulk: gear.bulk,
            invested: false,
            worn: false,
        };
        // Add the gear to equipment (for now, just add - could check for duplicates in future)
        onCharacterUpdate({
            ...character,
            equipment: [...currentEquipment, newEquipmentItem],
        });
        setShowEquipmentBrowser(false);
    };

    // Helper for proficiency bonus
    const getProficiencyBonus = (prof: Proficiency, level: number) => {
        switch (prof) {
            case 'trained': return 2 + level;
            case 'expert': return 4 + level;
            case 'master': return 6 + level;
            case 'legendary': return 8 + level;
            default: return 0;
        }
    };

    // Menu handlers for Export & Sharing
    const handleExportJSON = () => {
        exportCharacterAsJSON(character);
    };

    const handleImportJSON = async (file: File) => {
        try {
            const importedChar = await importCharacterFromJSON(file);
            // Confirm before overwriting
            if (confirm(t('menu.confirmImport') || 'This will overwrite the current character. Continue?')) {
                onCharacterUpdate({
                    ...importedChar,
                    id: character.id, // Keep the same ID
                    updatedAt: new Date().toISOString()
                });
            }
        } catch (error) {
            alert(t('menu.importError') || 'Failed to import character');
        }
    };

    const handleCopyStatBlock = async () => {
        try {
            await copyStatBlockToClipboard(character);
            alert(t('menu.copiedToClipboard') || 'Stat block copied to clipboard!');
        } catch (error) {
            alert(t('menu.copyError') || 'Failed to copy stat block');
        }
    };

    const handlePrintPDF = () => {
        printCharacterSheet();
    };

    const handleShareLink = async () => {
        const shareLink = generateShareableLink(character);
        try {
            await navigator.clipboard.writeText(shareLink);
            alert(t('menu.linkCopied') || 'Share link copied to clipboard!');
        } catch {
            alert(shareLink);
        }
    };

    const handleSyncCloud = async () => {
        try {
            if (!CloudSync.isAuthenticated()) {
                await CloudSync.authenticate();
                alert(t('menu.authSuccess') || 'Successfully authenticated with Google Drive');
            } else {
                await CloudSync.syncCharacter(character);
                alert(t('menu.syncSuccess') || 'Character synced to cloud');
            }
        } catch (error) {
            alert(t('menu.syncError') || 'Failed to sync with cloud');
        }
    };

    const handleLoadFromCloud = async () => {
        try {
            if (!CloudSync.isAuthenticated()) {
                await CloudSync.authenticate();
            }
            const cloudCharacters = await CloudSync.loadCharacters();
            if (cloudCharacters.length === 0) {
                alert(t('menu.noCloudCharacters') || 'No characters found in cloud');
                return;
            }
            // Show list of characters to import
            const characterList = cloudCharacters.map((c, i) =>
                `${i + 1}. ${c.name || 'Unnamed'} (Level ${c.level})`
            ).join('\n');
            const selection = prompt(
                `${t('menu.selectCharacter') || 'Select a character to load:'}\n\n${characterList}\n\n${t('menu.enterNumber') || 'Enter the number'}:`
            );
            if (selection) {
                const index = parseInt(selection) - 1;
                if (index >= 0 && index < cloudCharacters.length) {
                    const selectedChar = cloudCharacters[index];
                    if (confirm(t('menu.confirmLoad') || 'This will replace the current character. Continue?')) {
                        onCharacterUpdate({
                            ...selectedChar,
                            id: character.id, // Keep the same ID
                            updatedAt: new Date().toISOString()
                        });
                        alert(t('menu.loadSuccess') || 'Character loaded successfully');
                    }
                }
            }
        } catch (error) {
            alert(t('menu.loadError') || 'Failed to load characters from cloud');
        }
    };

    // Calculate character stats
    const getPerceptionMod = () => {
        const wisMod = Math.floor((character.abilityScores.wis - 10) / 2);
        // Ensure minimum trained proficiency for perception (PF2e rule)
        const perceptionProf = character.perception === 'untrained' ? 'trained' : character.perception;

        // Calculate proficiency bonus with Variant Rules support
        const profRank = perceptionProf === 'trained' ? ProficiencyRank.Trained :
            perceptionProf === 'expert' ? ProficiencyRank.Expert :
            perceptionProf === 'master' ? ProficiencyRank.Master :
            perceptionProf === 'legendary' ? ProficiencyRank.Legendary :
            ProficiencyRank.Untrained;

        const profBonus = calculateProficiencyBonusWithVariant(
            character.level || 1,
            profRank,
            character.variantRules?.proficiencyWithoutLevel
        );

        const penalty = getPerceptionPenalty(conditionPenalties);
        return wisMod + profBonus + penalty;
    };

    const getClassDC = () => {
        // Default to Strength if no class selected, otherwise use class key ability
        // Note: Class key ability can be an array in data, we take the first one or default
        let keyAbilityAttr = 'str';
        if (selectedClass) {
            if (Array.isArray(selectedClass.keyAbility)) {
                keyAbilityAttr = selectedClass.keyAbility[0];
            } else {
                keyAbilityAttr = selectedClass.keyAbility;
            }
        }

        // In a real app, we would check if character has actually selected a key ability boost
        // For now, we use the class default
        const keyAbilityScore = character.abilityScores[keyAbilityAttr as keyof typeof character.abilityScores] || 10;
        const keyMod = Math.floor((keyAbilityScore - 10) / 2);

        // Class DC is usually 10 + key mod + proficiency + level.
        // Assuming trained for level 1 characters unless specified otherwise.
        // Use Variant Rules support for Proficiency Without Level
        const profBonus = calculateProficiencyBonusWithVariant(
            character.level || 1,
            ProficiencyRank.Trained,
            character.variantRules?.proficiencyWithoutLevel
        );
        return 10 + keyMod + profBonus;
    };

    const getAC = () => {
        // Use calculateACWithABP which handles both Automatic Bonus Progression and Proficiency Without Level
        const baseAC = calculateACWithABP(character);

        // Add condition penalties
        const penalty = getACPenalty(conditionPenalties);

        // Add shield bonus if shield is raised (handled by shieldState)
        const shieldBonus = character.shieldState?.raised ? (character.shieldState?.currentHp ?? 0) > 0 ? 2 : 0 : 0;

        return baseAC + penalty + shieldBonus;
    };

    // Calculate all skills
    const calculateSkills = (): SkillDisplay[] => {
        return skillsData.map(skill => {
            // 1. Get Ability Modifier
            const abilityScore = character.abilityScores[skill.ability];
            const abilityMod = Math.floor((abilityScore - 10) / 2);

            // 2. Get Proficiency
            // Find in character skills or default to untrained
            const charSkill = character.skills.find(s => s.name.toLowerCase() === skill.id.toLowerCase());
            const proficiency = charSkill?.proficiency || 'untrained';

            // 3. Calculate Proficiency Bonus with Variant Rules support
            const profRank = proficiency === 'trained' ? ProficiencyRank.Trained :
                proficiency === 'expert' ? ProficiencyRank.Expert :
                proficiency === 'master' ? ProficiencyRank.Master :
                proficiency === 'legendary' ? ProficiencyRank.Legendary :
                ProficiencyRank.Untrained;

            const profBonus = calculateProficiencyBonusWithVariant(
                character.level || 1,
                profRank,
                character.variantRules?.proficiencyWithoutLevel
            );

            // 4. Calculate Total Modifier including condition penalties
            const conditionPenalty = getSkillPenalty(skill.ability, conditionPenalties);
            const totalMod = abilityMod + profBonus + conditionPenalty;

            return {
                ...skill,
                modifier: totalMod,
                proficiency: proficiency,
                hasPenalty: conditionPenalty < 0
            };
        });
    };

    const calculatedSkills = calculateSkills();

    return (
        <div className="desktop-layout">
            <TopBar
                characterName={character.name || t('character.unnamed')}
                className={displayClassName || t('character.noClass')}
                level={character.level || 1}
                onMenuClick={() => setMenuOpen(!menuOpen)}
                onRestClick={handleRest}
                onNameChange={(newName) => {
                    onCharacterUpdate({
                        ...character,
                        name: newName,
                    });
                }}
                onLevelChange={(newLevel) => {
                    // Cleanup on level down: remove feats, boosts, and skill increases above new level
                    const cleanedFeats = character.feats.filter(f => f.level <= newLevel);
                    const cleanedLevelUp: Record<number, string[]> = {};
                    if (character.abilityBoosts?.levelUp) {
                        for (const [lvl, boosts] of Object.entries(character.abilityBoosts.levelUp)) {
                            if (parseInt(lvl) <= newLevel) {
                                cleanedLevelUp[parseInt(lvl)] = boosts;
                            }
                        }
                    }
                    const cleanedSkillIncreases: Record<number, string> = {};
                    if (character.skillIncreases) {
                        for (const [lvl, skill] of Object.entries(character.skillIncreases)) {
                            if (parseInt(lvl) <= newLevel) {
                                cleanedSkillIncreases[parseInt(lvl)] = skill;
                            }
                        }
                    }

                    onCharacterUpdate({
                        ...character,
                        level: newLevel,
                        feats: cleanedFeats,
                        abilityBoosts: {
                            ...character.abilityBoosts,
                            levelUp: cleanedLevelUp as { [level: number]: AbilityName[] },
                        },
                        skillIncreases: cleanedSkillIncreases,
                    });
                }}
            />

            <div className="desktop-main">
                <LevelSidebar
                    sections={buildSections}
                    currentLevel={character.level || 1}
                    onLevelChange={(newLevel) => {
                        // Cleanup on level down: remove feats, boosts, and skill increases above new level
                        const cleanedFeats = character.feats.filter(f => f.level <= newLevel);
                        const cleanedLevelUp: Record<number, string[]> = {};
                        if (character.abilityBoosts?.levelUp) {
                            for (const [lvl, boosts] of Object.entries(character.abilityBoosts.levelUp)) {
                                if (parseInt(lvl) <= newLevel) {
                                    cleanedLevelUp[parseInt(lvl)] = boosts;
                                }
                            }
                        }
                        const cleanedSkillIncreases: Record<number, string> = {};
                        if (character.skillIncreases) {
                            for (const [lvl, skill] of Object.entries(character.skillIncreases)) {
                                if (parseInt(lvl) <= newLevel) {
                                    cleanedSkillIncreases[parseInt(lvl)] = skill;
                                }
                            }
                        }

                        onCharacterUpdate({
                            ...character,
                            level: newLevel,
                            feats: cleanedFeats,
                            abilityBoosts: {
                                ...character.abilityBoosts,
                                levelUp: cleanedLevelUp as { [level: number]: AbilityName[] },
                            },
                            skillIncreases: cleanedSkillIncreases,
                        });
                    }}
                />

                <div className="desktop-content">
                    <StatsHeader
                        hp={{
                            current: character.hitPoints.current || calculateMaxHP(character),
                            max: character.hitPoints.max || calculateMaxHP(character)
                        }}
                        speed={character.speed.land}
                        size={selectedAncestry?.size || 'Medium'}
                        perception={getPerceptionMod()}
                        ac={getAC()}
                        heroPoints={1}
                        classDC={getClassDC()}
                        onAddCondition={() => setShowConditionBrowser(true)}
                        onAddCustomBuff={() => setShowBuffBrowser(true)}
                        onAdvanceRound={handleAdvanceRound}
                    />

                    <ActiveConditions
                        character={character}
                        onRemoveCondition={handleRemoveCondition}
                        onUpdateConditionValue={handleUpdateConditionValue}
                        onRemoveBuff={handleRemoveBuff}
                        onUpdateBuffDuration={handleUpdateBuffDuration}
                    />

                    <CharacterTabs
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        hasSpells={selectedClass?.spellcasting !== undefined}
                        hasPets={true}
                    />

                    <div className="tab-content">
                        <SkillsPanel
                            skills={calculatedSkills}
                            onSkillClick={handleSkillClick}
                        />

                        <div className="main-content-area">
                            {activeTab === 'weapons' && (
                                <WeaponsPanel
                                    character={character}
                                    onAddWeapon={() => console.log('Add weapon')}
                                />
                            )}

                            {activeTab === 'defense' && (
                                <DefensePanel
                                    character={character}
                                    ac={getAC()}
                                    onCharacterUpdate={onCharacterUpdate}
                                />
                            )}

                            {activeTab === 'gear' && (
                                <GearPanel
                                    character={character}
                                    onAddGear={() => setShowEquipmentBrowser(true)}
                                    onCharacterUpdate={onCharacterUpdate}
                                />
                            )}

                            {activeTab === 'resources' && (
                                <ResourcesPanel
                                    character={character}
                                    onCharacterUpdate={onCharacterUpdate}
                                />
                            )}

                            {activeTab === 'spells' && (
                                <SpellsPanel
                                    character={character}
                                    onCastSpell={(spellId) => console.log('Cast:', spellId)}
                                    onAddSpell={() => console.log('Add spell')}
                                />
                            )}

                            {activeTab === 'pets' && (
                                <PetsPanel
                                    character={character}
                                    onCharacterUpdate={onCharacterUpdate}
                                />
                            )}

                            {activeTab === 'feats' && (
                                <FeatsPanel
                                    character={character}
                                    onFeatClick={(feat) => console.log('Feat:', feat)}
                                />
                            )}

                            {activeTab === 'details' && (
                                <div className="details-panel">
                                    <div className="panel-header">
                                        <h3>{t('tabs.details') || 'Details'}</h3>
                                    </div>
                                    <div className="details-content">
                                        <div className="detail-field">
                                            <label>{t('character.name') || 'Name'}</label>
                                            <span>{character.name || t('character.unnamed')}</span>
                                        </div>
                                        <div className="detail-field">
                                            <label>{t('character.player') || 'Player'}</label>
                                            <span>{character.player || '-'}</span>
                                        </div>
                                        <div className="detail-field">
                                            <label>{t('character.notes') || 'Notes'}</label>
                                            <p className="notes-text">{character.notes || t('builder.noNotes') || 'No notes yet.'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'actions' && (
                                <ActionsPanel
                                    character={character}
                                    onActionClick={(action) => setSelectedAction(action as ActionData)}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Detail Modal */}
            <DetailModal
                isOpen={selectedAction !== null}
                onClose={() => setSelectedAction(null)}
                title={selectedAction?.name || ''}
            >
                {selectedAction && (
                    <ActionDetailContent
                        name={selectedAction.name}
                        cost={selectedAction.cost === '1' ? '◆' : selectedAction.cost === '2' ? '◆◆' : selectedAction.cost === '3' ? '◆◆◆' : selectedAction.cost === 'reaction' ? '⟲' : '◇'}
                        description={selectedAction.description}
                        traits={selectedAction.traits}
                        skill={selectedAction.skill}
                    />
                )}
            </DetailModal>


            {/* Condition Browser Modal */}
            {
                showConditionBrowser && (
                    <ConditionBrowser
                        onClose={() => setShowConditionBrowser(false)}
                        onAdd={handleAddCondition}
                    />
                )
            }

            {/* Buff Browser Modal */}
            {
                showBuffBrowser && (
                    <BuffBrowser
                        onClose={() => setShowBuffBrowser(false)}
                        onAddBuff={handleAddBuff}
                    />
                )
            }

            {/* Equipment Browser Modal */}
            {
                showEquipmentBrowser && (
                    <EquipmentBrowser
                        onClose={() => setShowEquipmentBrowser(false)}
                        onEquipArmor={() => {}}
                        onEquipShield={() => {}}
                        onEquipGear={handleEquipGear}
                        initialTab="gear"
                    />
                )
            }

            {/* Rest & Recovery Modal */}
            {
                showRestModal && (
                    <RestModal
                        character={character}
                        onClose={() => setShowRestModal(false)}
                        onCharacterUpdate={onCharacterUpdate}
                    />
                )
            }

            {/* Variant Rules Modal */}
            {
                showVariantRules && (
                    <VariantRulesPanel
                        character={character}
                        onClose={() => setShowVariantRules(false)}
                        onCharacterUpdate={onCharacterUpdate}
                    />
                )
            }

            {/* Main Menu */}
            {menuOpen && (
                <MainMenu
                    isOpen={menuOpen}
                    character={character}
                    onClose={() => setMenuOpen(false)}
                    onExportJSON={handleExportJSON}
                    onImportJSON={handleImportJSON}
                    onCopyStatBlock={handleCopyStatBlock}
                    onPrintPDF={handlePrintPDF}
                    onShareLink={handleShareLink}
                    onSyncCloud={handleSyncCloud}
                    onLoadFromCloud={handleLoadFromCloud}
                    onShowVariantRules={() => setShowVariantRules(true)}
                />
            )}
        </div >
    );
};

export default DesktopCharacterLayout;
