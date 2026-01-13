import React, { useState } from 'react';
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
import { ActiveConditions } from './ActiveConditions';
import { ConditionBrowser } from './ConditionBrowser';
import { BuffBrowser } from './BuffBrowser';
import { EquipmentBrowser } from './EquipmentBrowser';
import { LoadedCondition, LoadedGear, getFeats } from '../../data/pf2e-loader';
import { useLanguage, useLocalizedName } from '../../hooks/useLanguage';
import { Character, Proficiency, Buff } from '../../types';
import { ancestries, classes, backgrounds, heritages, skills as skillsData } from '../../data';
import {
    calculateConditionPenalties,
    getSkillPenalty,
    getACPenalty,
    getPerceptionPenalty,
    ConditionPenalties
} from '../../utils/conditionModifiers';
import { calculateMaxHP } from '../../utils/pf2e-math';
import {
    exportCharacterAsJSON,
    importCharacterFromJSON,
    copyStatBlockToClipboard,
    generateShareableLink,
    printCharacterSheet,
    CloudSync
} from '../../utils/characterExport';

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

    // Lookup entity names
    const selectedAncestry = ancestries.find(a => a.id === character.ancestryId);
    const selectedClass = classes.find(c => c.id === character.classId);
    const selectedBackground = backgrounds.find(b => b.id === character.backgroundId);
    const selectedHeritage = heritages.find(h => h.id === character.heritageId);

    const ancestryName = selectedAncestry ? getName(selectedAncestry) : '';
    const className = selectedClass ? getName(selectedClass) : '';
    const backgroundName = selectedBackground ? getName(selectedBackground) : '';
    const heritageName = selectedHeritage ? getName(selectedHeritage) : '';

    // Calculate condition penalties once
    const conditionPenalties = calculateConditionPenalties(character.conditions || []);

    // Build level sections for sidebar - Planning Mode: all 20 levels always shown
    const buildSections = () => {
        const sections = [];
        const feats = character.feats || [];
        const allFeats = getFeats();

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

        // Level 1 section
        sections.push({
            level: 1,
            choices: [
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
                    id: 'ancestryFeat1',
                    type: 'feat',
                    label: 'builder.ancestryFeat',
                    value: getFeatName(feats.find(f => f.source === 'ancestry' && f.level === 1)?.featId),
                    required: true,
                    onClick: () => onOpenSelection('ancestryFeat', 1),
                },
                {
                    id: 'classFeat1',
                    type: 'feat',
                    label: 'builder.classFeat',
                    value: getFeatName(feats.find(f => f.source === 'class' && f.level === 1)?.featId),
                    required: true,
                    onClick: () => onOpenSelection('classFeat', 1),
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
                },
            ],
        });

        // Level 2: Class Feat, Skill Feat
        sections.push({
            level: 2,
            choices: [
                {
                    id: 'classFeat2',
                    type: 'feat',
                    label: 'builder.classFeat',
                    value: getFeatName(feats.find(f => f.source === 'class' && f.level === 2)?.featId),
                    required: true,
                    onClick: () => onOpenSelection('classFeat', 2),
                },
                {
                    id: 'skillFeat2',
                    type: 'feat',
                    label: 'builder.skillFeat',
                    value: getFeatName(feats.find(f => f.source === 'skill' && f.level === 2)?.featId),
                    required: true,
                    onClick: () => onOpenSelection('skillFeat', 2),
                },
            ],
        });

        // Level 3: General Feat, Skill Increase
        sections.push({
            level: 3,
            choices: [
                {
                    id: 'generalFeat3',
                    type: 'feat',
                    label: 'builder.generalFeat',
                    value: getFeatName(feats.find(f => f.source === 'general' && f.level === 3)?.featId),
                    required: true,
                    onClick: () => onOpenSelection('generalFeat', 3),
                },
                {
                    id: 'skillIncrease3',
                    type: 'skill',
                    label: 'builder.skillIncrease',
                    value: getSkillIncreaseName(3),
                    required: true,
                    onClick: () => onOpenSelection('skillIncrease', 3),
                },
            ],
        });

        // Level 4: Class Feat, Skill Feat
        sections.push({
            level: 4,
            choices: [
                {
                    id: 'classFeat4',
                    type: 'feat',
                    label: 'builder.classFeat',
                    value: getFeatName(feats.find(f => f.source === 'class' && f.level === 4)?.featId),
                    required: true,
                    onClick: () => onOpenSelection('classFeat', 4),
                },
                {
                    id: 'skillFeat4',
                    type: 'feat',
                    label: 'builder.skillFeat',
                    value: getFeatName(feats.find(f => f.source === 'skill' && f.level === 4)?.featId),
                    required: true,
                    onClick: () => onOpenSelection('skillFeat', 4),
                },
            ],
        });

        // Level 5: Ability Boosts, Ancestry Feat, Skill Increase
        sections.push({
            level: 5,
            choices: [
                {
                    id: 'boosts5',
                    type: 'boost',
                    label: 'builder.levelUpBoosts',
                    value: (() => {
                        const levelBoosts = character.abilityBoosts?.levelUp?.[5] || [];
                        return levelBoosts.length > 0 ? `${levelBoosts.length}/4` : '';
                    })(),
                    required: true,
                    onClick: () => onOpenSelection('boost5', 5),
                },
                {
                    id: 'ancestryFeat5',
                    type: 'feat',
                    label: 'builder.ancestryFeat',
                    value: getFeatName(feats.find(f => f.source === 'ancestry' && f.level === 5)?.featId),
                    required: true,
                    onClick: () => onOpenSelection('ancestryFeat', 5),
                },
                {
                    id: 'skillIncrease5',
                    type: 'skill',
                    label: 'builder.skillIncrease',
                    value: getSkillIncreaseName(5),
                    required: true,
                    onClick: () => onOpenSelection('skillIncrease', 5),
                },
            ],
        });

        // Level 6: Class Feat, Skill Feat
        sections.push({
            level: 6,
            choices: [
                {
                    id: 'classFeat6',
                    type: 'feat',
                    label: 'builder.classFeat',
                    value: getFeatName(feats.find(f => f.source === 'class' && f.level === 6)?.featId),
                    required: true,
                    onClick: () => onOpenSelection('classFeat', 6),
                },
                {
                    id: 'skillFeat6',
                    type: 'feat',
                    label: 'builder.skillFeat',
                    value: getFeatName(feats.find(f => f.source === 'skill' && f.level === 6)?.featId),
                    required: true,
                    onClick: () => onOpenSelection('skillFeat', 6),
                },
            ],
        });

        // Level 7: General Feat, Skill Increase
        sections.push({
            level: 7,
            choices: [
                {
                    id: 'generalFeat7',
                    type: 'feat',
                    label: 'builder.generalFeat',
                    value: getFeatName(feats.find(f => f.source === 'general' && f.level === 7)?.featId),
                    required: true,
                    onClick: () => onOpenSelection('generalFeat', 7),
                },
                {
                    id: 'skillIncrease7',
                    type: 'skill',
                    label: 'builder.skillIncrease',
                    value: getSkillIncreaseName(7),
                    required: true,
                    onClick: () => onOpenSelection('skillIncrease', 7),
                },
            ],
        });

        // Level 8: Class Feat, Skill Feat
        sections.push({
            level: 8,
            choices: [
                {
                    id: 'classFeat8',
                    type: 'feat',
                    label: 'builder.classFeat',
                    value: getFeatName(feats.find(f => f.source === 'class' && f.level === 8)?.featId),
                    required: true,
                    onClick: () => onOpenSelection('classFeat', 8),
                },
                {
                    id: 'skillFeat8',
                    type: 'feat',
                    label: 'builder.skillFeat',
                    value: getFeatName(feats.find(f => f.source === 'skill' && f.level === 8)?.featId),
                    required: true,
                    onClick: () => onOpenSelection('skillFeat', 8),
                },
            ],
        });

        // Level 9: Ancestry Feat, Skill Increase
        sections.push({
            level: 9,
            choices: [
                {
                    id: 'ancestryFeat9',
                    type: 'feat',
                    label: 'builder.ancestryFeat',
                    value: getFeatName(feats.find(f => f.source === 'ancestry' && f.level === 9)?.featId),
                    required: true,
                    onClick: () => onOpenSelection('ancestryFeat', 9),
                },
                {
                    id: 'skillIncrease9',
                    type: 'skill',
                    label: 'builder.skillIncrease',
                    value: getSkillIncreaseName(9),
                    required: true,
                    onClick: () => onOpenSelection('skillIncrease', 9),
                },
            ],
        });

        // Level 10: Ability Boosts, Class Feat, Skill Feat
        sections.push({
            level: 10,
            choices: [
                {
                    id: 'boosts10',
                    type: 'boost',
                    label: 'builder.levelUpBoosts',
                    value: (() => {
                        const levelBoosts = character.abilityBoosts?.levelUp?.[10] || [];
                        return levelBoosts.length > 0 ? `${levelBoosts.length}/4` : '';
                    })(),
                    required: true,
                    onClick: () => onOpenSelection('boost10', 10),
                },
                {
                    id: 'classFeat10',
                    type: 'feat',
                    label: 'builder.classFeat',
                    value: getFeatName(feats.find(f => f.source === 'class' && f.level === 10)?.featId),
                    required: true,
                    onClick: () => onOpenSelection('classFeat', 10),
                },
                {
                    id: 'skillFeat10',
                    type: 'feat',
                    label: 'builder.skillFeat',
                    value: getFeatName(feats.find(f => f.source === 'skill' && f.level === 10)?.featId),
                    required: true,
                    onClick: () => onOpenSelection('skillFeat', 10),
                },
            ],
        });

        // Level 11: General Feat, Skill Increase
        sections.push({
            level: 11,
            choices: [
                {
                    id: 'generalFeat11',
                    type: 'feat',
                    label: 'builder.generalFeat',
                    value: getFeatName(feats.find(f => f.source === 'general' && f.level === 11)?.featId),
                    required: true,
                    onClick: () => onOpenSelection('generalFeat', 11),
                },
                {
                    id: 'skillIncrease11',
                    type: 'skill',
                    label: 'builder.skillIncrease',
                    value: getSkillIncreaseName(11),
                    required: true,
                    onClick: () => onOpenSelection('skillIncrease', 11),
                },
            ],
        });

        // Level 12: Class Feat, Skill Feat
        sections.push({
            level: 12,
            choices: [
                {
                    id: 'classFeat12',
                    type: 'feat',
                    label: 'builder.classFeat',
                    value: getFeatName(feats.find(f => f.source === 'class' && f.level === 12)?.featId),
                    required: true,
                    onClick: () => onOpenSelection('classFeat', 12),
                },
                {
                    id: 'skillFeat12',
                    type: 'feat',
                    label: 'builder.skillFeat',
                    value: getFeatName(feats.find(f => f.source === 'skill' && f.level === 12)?.featId),
                    required: true,
                    onClick: () => onOpenSelection('skillFeat', 12),
                },
            ],
        });

        // Level 13: Ancestry Feat, Skill Increase
        sections.push({
            level: 13,
            choices: [
                {
                    id: 'ancestryFeat13',
                    type: 'feat',
                    label: 'builder.ancestryFeat',
                    value: getFeatName(feats.find(f => f.source === 'ancestry' && f.level === 13)?.featId),
                    required: true,
                    onClick: () => onOpenSelection('ancestryFeat', 13),
                },
                {
                    id: 'skillIncrease13',
                    type: 'skill',
                    label: 'builder.skillIncrease',
                    value: getSkillIncreaseName(13),
                    required: true,
                    onClick: () => onOpenSelection('skillIncrease', 13),
                },
            ],
        });

        // Level 14: Class Feat, Skill Feat
        sections.push({
            level: 14,
            choices: [
                {
                    id: 'classFeat14',
                    type: 'feat',
                    label: 'builder.classFeat',
                    value: getFeatName(feats.find(f => f.source === 'class' && f.level === 14)?.featId),
                    required: true,
                    onClick: () => onOpenSelection('classFeat', 14),
                },
                {
                    id: 'skillFeat14',
                    type: 'feat',
                    label: 'builder.skillFeat',
                    value: getFeatName(feats.find(f => f.source === 'skill' && f.level === 14)?.featId),
                    required: true,
                    onClick: () => onOpenSelection('skillFeat', 14),
                },
            ],
        });

        // Level 15: Ability Boosts, General Feat, Skill Increase
        sections.push({
            level: 15,
            choices: [
                {
                    id: 'boosts15',
                    type: 'boost',
                    label: 'builder.levelUpBoosts',
                    value: (() => {
                        const levelBoosts = character.abilityBoosts?.levelUp?.[15] || [];
                        return levelBoosts.length > 0 ? `${levelBoosts.length}/4` : '';
                    })(),
                    required: true,
                    onClick: () => onOpenSelection('boost15', 15),
                },
                {
                    id: 'generalFeat15',
                    type: 'feat',
                    label: 'builder.generalFeat',
                    value: getFeatName(feats.find(f => f.source === 'general' && f.level === 15)?.featId),
                    required: true,
                    onClick: () => onOpenSelection('generalFeat', 15),
                },
                {
                    id: 'skillIncrease15',
                    type: 'skill',
                    label: 'builder.skillIncrease',
                    value: getSkillIncreaseName(15),
                    required: true,
                    onClick: () => onOpenSelection('skillIncrease', 15),
                },
            ],
        });

        // Level 16: Class Feat, Skill Feat
        sections.push({
            level: 16,
            choices: [
                {
                    id: 'classFeat16',
                    type: 'feat',
                    label: 'builder.classFeat',
                    value: getFeatName(feats.find(f => f.source === 'class' && f.level === 16)?.featId),
                    required: true,
                    onClick: () => onOpenSelection('classFeat', 16),
                },
                {
                    id: 'skillFeat16',
                    type: 'feat',
                    label: 'builder.skillFeat',
                    value: getFeatName(feats.find(f => f.source === 'skill' && f.level === 16)?.featId),
                    required: true,
                    onClick: () => onOpenSelection('skillFeat', 16),
                },
            ],
        });

        // Level 17: Ancestry Feat, Skill Increase
        sections.push({
            level: 17,
            choices: [
                {
                    id: 'ancestryFeat17',
                    type: 'feat',
                    label: 'builder.ancestryFeat',
                    value: getFeatName(feats.find(f => f.source === 'ancestry' && f.level === 17)?.featId),
                    required: true,
                    onClick: () => onOpenSelection('ancestryFeat', 17),
                },
                {
                    id: 'skillIncrease17',
                    type: 'skill',
                    label: 'builder.skillIncrease',
                    value: getSkillIncreaseName(17),
                    required: true,
                    onClick: () => onOpenSelection('skillIncrease', 17),
                },
            ],
        });

        // Level 18: Class Feat, Skill Feat
        sections.push({
            level: 18,
            choices: [
                {
                    id: 'classFeat18',
                    type: 'feat',
                    label: 'builder.classFeat',
                    value: getFeatName(feats.find(f => f.source === 'class' && f.level === 18)?.featId),
                    required: true,
                    onClick: () => onOpenSelection('classFeat', 18),
                },
                {
                    id: 'skillFeat18',
                    type: 'feat',
                    label: 'builder.skillFeat',
                    value: getFeatName(feats.find(f => f.source === 'skill' && f.level === 18)?.featId),
                    required: true,
                    onClick: () => onOpenSelection('skillFeat', 18),
                },
            ],
        });

        // Level 19: General Feat, Skill Increase
        sections.push({
            level: 19,
            choices: [
                {
                    id: 'generalFeat19',
                    type: 'feat',
                    label: 'builder.generalFeat',
                    value: getFeatName(feats.find(f => f.source === 'general' && f.level === 19)?.featId),
                    required: true,
                    onClick: () => onOpenSelection('generalFeat', 19),
                },
                {
                    id: 'skillIncrease19',
                    type: 'skill',
                    label: 'builder.skillIncrease',
                    value: getSkillIncreaseName(19),
                    required: true,
                    onClick: () => onOpenSelection('skillIncrease', 19),
                },
            ],
        });

        // Level 20: Ability Boosts, Class Feat, Skill Feat
        sections.push({
            level: 20,
            choices: [
                {
                    id: 'boosts20',
                    type: 'boost',
                    label: 'builder.levelUpBoosts',
                    value: (() => {
                        const levelBoosts = character.abilityBoosts?.levelUp?.[20] || [];
                        return levelBoosts.length > 0 ? `${levelBoosts.length}/4` : '';
                    })(),
                    required: true,
                    onClick: () => onOpenSelection('boost20', 20),
                },
                {
                    id: 'classFeat20',
                    type: 'feat',
                    label: 'builder.classFeat',
                    value: getFeatName(feats.find(f => f.source === 'class' && f.level === 20)?.featId),
                    required: true,
                    onClick: () => onOpenSelection('classFeat', 20),
                },
                {
                    id: 'skillFeat20',
                    type: 'feat',
                    label: 'builder.skillFeat',
                    value: getFeatName(feats.find(f => f.source === 'skill' && f.level === 20)?.featId),
                    required: true,
                    onClick: () => onOpenSelection('skillFeat', 20),
                },
            ],
        });

        return sections;
    };

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
        const profBonus = getProficiencyBonus(perceptionProf, character.level || 1);
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
        const profBonus = getProficiencyBonus('trained', character.level || 1);
        return 10 + keyMod + profBonus;
    };

    const getAC = () => {
        const dexMod = Math.floor((character.abilityScores.dex - 10) / 2);
        const cap = character.armorClass.dexCap !== undefined ? character.armorClass.dexCap : 99;
        const effectiveDex = Math.min(dexMod, cap);
        const profBonus = getProficiencyBonus(character.armorClass.proficiency, character.level || 1);
        const itemBonus = character.armorClass.itemBonus || 0;

        // Add shield AC bonus if shield is equipped (when raised)
        // Note: In PF2e, shields don't add to AC unless raised (an action)
        // For now, we don't auto-add shield AC to the base AC
        // The shield bonus would be applied when using the Raise Shield action

        const penalty = getACPenalty(conditionPenalties);

        return 10 + effectiveDex + profBonus + itemBonus + penalty;
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

            // 3. Calculate Proficiency Bonus
            let profBonus = 0;
            const level = character.level || 1;
            switch (proficiency) {
                case 'trained': profBonus = 2 + level; break;
                case 'expert': profBonus = 4 + level; break;
                case 'master': profBonus = 6 + level; break;
                case 'legendary': profBonus = 8 + level; break;
                default: profBonus = 0;
            }

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
                className={className || t('character.noClass')}
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
                            levelUp: cleanedLevelUp,
                        },
                        skillIncreases: cleanedSkillIncreases,
                    });
                }}
            />

            <div className="desktop-main">
                <LevelSidebar
                    sections={buildSections()}
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
                                levelUp: cleanedLevelUp,
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
                />
            )}
        </div >
    );
};

export default DesktopCharacterLayout;
