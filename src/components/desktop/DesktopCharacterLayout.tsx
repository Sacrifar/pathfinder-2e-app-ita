import React, { useState, useMemo, lazy, Suspense } from 'react';
import { TopBar } from './TopBar';
import { LevelSidebar } from './LevelSidebar';
import { MainMenu } from './MainMenu';
import { CharacterTabs, TabId } from './CharacterTabs';
import { SkillDisplay } from './SkillsPanel';
import { CombatColumn } from './CombatColumn';
import { SurvivalHeader } from './SurvivalHeader';

// Lazy load panels - caricate solo quando necessarie
const WeaponsPanel = lazy(() => import('./WeaponsPanel').then(m => ({ default: m.WeaponsPanel })));
const DefensePanel = lazy(() => import('./DefensePanel').then(m => ({ default: m.DefensePanel })));
const GearPanel = lazy(() => import('./GearPanel').then(m => ({ default: m.GearPanel })));
const ResourcesPanel = lazy(() => import('./ResourcesPanel').then(m => ({ default: m.ResourcesPanel })));
const SpellsPanel = lazy(() => import('./SpellsPanel').then(m => ({ default: m.SpellsPanel })));
const PetsPanel = lazy(() => import('./PetsPanel').then(m => ({ default: m.PetsPanel })));
const FeatsPanel = lazy(() => import('./FeatsPanel').then(m => ({ default: m.FeatsPanel })));
const ActionsPanel = lazy(() => import('./ActionsPanel').then(m => ({ default: m.ActionsPanel })));
const BiographyPanel = lazy(() => import('./BiographyPanel').then(m => ({ default: m.BiographyPanel })));
const DetailModal = lazy(() => import('./DetailModal').then(m => ({ default: m.DetailModal })));
const ActionDetailContent = lazy(() => import('./DetailModal').then(m => ({ default: m.ActionDetailContent })));
const RestModal = lazy(() => import('./RestModal').then(m => ({ default: m.RestModal })));
const ConditionBrowser = lazy(() => import('./ConditionBrowser').then(m => ({ default: m.ConditionBrowser })));
const BuffBrowser = lazy(() => import('./BuffBrowser').then(m => ({ default: m.BuffBrowser })));
const EquipmentBrowser = lazy(() => import('./EquipmentBrowser').then(m => ({ default: m.EquipmentBrowser })));
const DeityBrowser = lazy(() => import('./DeityBrowser').then(m => ({ default: m.DeityBrowser })));
const VariantRulesPanel = lazy(() => import('./VariantRulesPanel').then(m => ({ default: m.VariantRulesPanel })));
const TacticBrowser = lazy(() => import('./TacticBrowser').then(m => ({ default: m.TacticBrowser })));
const TacticsPanel = lazy(() => import('./TacticsPanel').then(m => ({ default: m.TacticsPanel })));

// ActiveConditions e CharacterTabs devono rimanere non-lazy per performance
import { ActiveConditions } from './ActiveConditions';

import { RichTextEditor } from '../common/RichTextEditor';

// Componente di loading per Suspense
const LoadingFallback = () => (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
        color: 'var(--desktop-text-secondary)'
    }}>
        Loading...
    </div>
);
import { LoadedCondition, LoadedGear, getFeats } from '../../data/pf2e-loader';
import { useLanguage, useLocalizedName } from '../../hooks/useLanguage';
import { Character, Proficiency, Buff, AbilityName } from '../../types';
import { ancestries, classes, backgrounds, heritages, skills as skillsData } from '../../data';
import { getSpecializationById, classHasSpecializations, getSpecializationsForClass, getKineticistElementFromGateId, type ClassSpecialization } from '../../data/classSpecializations';
import {
    calculateConditionPenalties,
    getSkillPenalty,
    getACPenalty,
    getPerceptionPenalty,
} from '../../utils/conditionModifiers';
import {
    calculateMaxHP,
    calculateACWithABP,
    ProficiencyRank,
    calculateProficiencyBonusWithVariant,
    calculateSavingThrow,
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
import { recalculateCharacter } from '../../utils/characterRecalculator';

interface ActionData {
    id: string;
    name: string;
    cost: '1' | '2' | '3' | 'free' | 'reaction';
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
    const [activeDetailsTab, setActiveDetailsTab] = useState<'biography' | 'notes'>('biography');
    const [menuOpen, setMenuOpen] = useState(false);
    const [selectedAction, setSelectedAction] = useState<ActionData | null>(null);
    const [showConditionBrowser, setShowConditionBrowser] = useState(false);
    const [showBuffBrowser, setShowBuffBrowser] = useState(false);
    const [showEquipmentBrowser, setShowEquipmentBrowser] = useState(false);
    const [showRestModal, setShowRestModal] = useState(false);
    const [showVariantRules, setShowVariantRules] = useState(false);
    const [showDeityBrowser, setShowDeityBrowser] = useState(false);
    // NOTE: TacticBrowser is now handled via onOpenSelection mechanism
    // const [showTacticBrowser, setShowTacticBrowser] = useState(false);
    // const [tacticsLevel, setTacticsLevel] = useState(1);

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

        // Calculate initial INT from character creation boosts only
        // This is used for Level 1 Skill Training cap (should not change with level-up INT boosts)
        const calculateInitialInt = () => {
            let intScore = 10; // Base score

            // Add ancestry INT boosts
            if (character.abilityBoosts?.ancestry) {
                const intBoosts = character.abilityBoosts.ancestry.filter(b => b === 'int').length;
                intScore += intBoosts * 2;
            }

            // Add background INT boosts
            if (character.abilityBoosts?.background) {
                const intBoosts = character.abilityBoosts.background.filter(b => b === 'int').length;
                intScore += intBoosts * 2;
            }

            // Add class INT boost
            if (character.abilityBoosts?.class === 'int') {
                intScore += 2;
            }

            // Add free INT boosts (from level 1 free boosts)
            if (character.abilityBoosts?.free) {
                const intBoosts = character.abilityBoosts.free.filter(b => b === 'int').length;
                intScore += intBoosts * 2;
            }

            return intScore;
        };

        const initialInt = calculateInitialInt();

        // Calculate INT-based skill bonuses (Remastered rule)
        // Each INT boost after level 1 grants 1 Trained skill
        const calculateIntBonusSkillsAvailable = () => {
            let intBoostCount = 0;
            if (character.abilityBoosts?.levelUp) {
                for (const [level, boosts] of Object.entries(character.abilityBoosts.levelUp)) {
                    const lvl = parseInt(level);
                    if (lvl > 1) {
                        const intBoosts = boosts.filter(b => b === 'int').length;
                        intBoostCount += intBoosts;
                    }
                }
            }
            // Count total selected skills across all levels
            let selectedCount = 0;
            if (character.intBonusSkills) {
                Object.values(character.intBonusSkills).forEach(skills => {
                    selectedCount += skills.length;
                });
            }
            const available = intBoostCount - selectedCount;
            return Math.max(0, available);
        };

        // Get INT bonus skills available at a specific level
        const getIntBonusSkillsAvailableAtLevel = (level: number) => {
            // Count INT boosts from levelUp at this specific level
            const levelBoosts = character.abilityBoosts?.levelUp?.[level] || [];
            const intBoostsAtLevel = levelBoosts.filter(b => b === 'int').length;

            // Count how many skills have been selected at this level
            const selectedAtLevel = character.intBonusSkills?.[level]?.length || 0;

            // Return the number of available slots at this level
            return Math.max(0, intBoostsAtLevel - selectedAtLevel);
        };

        const intBonusSkillsAvailable = calculateIntBonusSkillsAvailable();

        // Get all feat slots using variant-aware function
        const allFeatSlots = getAllFeatSlotsUpToLevel(20, variantRules);

        // Group feat slots by level
        const featSlotsByLevel: Record<number, Array<{ type: string; index: number }>> = {};
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
                    // Add class specialization choice if the class has specializations
                    ...(classHasSpecializations(character.classId) ? [{
                        id: 'classSpecialization',
                        type: 'classSpecialization',
                        label: (() => {
                            const specTypes = getSpecializationsForClass(character.classId);
                            const specType = specTypes.length > 0 ? specTypes[0] : null;
                            if (!specType) return 'builder.classSpecialization';
                            // Use Italian translation if the UI is in Italian
                            if (t('specialization.title') === 'Specializzazione di Classe' && specType.nameIt) {
                                return specType.nameIt;
                            }
                            return specType.name;
                        })(),
                        value: (() => {
                            if (character.classSpecializationId) {
                                // Handle array of specializations (e.g., Kineticist Dual Gate)
                                if (Array.isArray(character.classSpecializationId)) {
                                    const specs = character.classSpecializationId
                                        .map(id => getSpecializationById(id))
                                        .filter((s): s is ClassSpecialization => s !== null);

                                    if (specs.length > 0) {
                                        const names = specs.map(spec =>
                                            spec.nameIt && t('specialization.title') === 'Specializzazione di Classe'
                                                ? spec.nameIt
                                                : spec.name
                                        );
                                        return names.join(' + ');
                                    }
                                    return '';
                                }

                                // Handle single specialization
                                const spec = getSpecializationById(character.classSpecializationId);
                                if (spec) {
                                    // Return localized name if available
                                    return spec.nameIt && t('specialization.title') === 'Specializzazione di Classe'
                                        ? spec.nameIt
                                        : spec.name;
                                }
                            }
                            return '';
                        })(),
                        required: true,
                        onClick: () => onOpenSelection('classSpecialization', 1),
                    } as const] : []),
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
                        value: '',  // Icon and badge provide all info
                        currentCount: (() => {
                            const boosts = character.abilityBoosts;
                            return (boosts?.ancestry?.length || 0) +
                                (boosts?.background?.length || 0) +
                                (boosts?.class ? 1 : 0) +
                                (boosts?.free?.length || 0);
                        })(),
                        maxValue: 9,
                        required: true,
                        onClick: () => onOpenSelection('boost', 1),
                    },
                    {
                        id: 'skillTraining',
                        type: 'skill',
                        label: 'builder.skillTraining',
                        value: '',  // Icon and badge provide all info
                        currentCount: (() => {
                            const autoTrainedSkills = selectedClass?.trainedSkills || [];
                            const bonusSkill = character.skillIncreases?.[0]; // Get overlap bonus skill if exists

                            // Get background trained skills to exclude from count
                            let backgroundSkills: string[] = [];
                            if (character.backgroundId) {
                                const bgData = backgrounds.find((b: any) => b.id === character.backgroundId);
                                if (bgData?.trainedSkills) {
                                    backgroundSkills = bgData.trainedSkills.map((s: string) => s.toLowerCase());
                                }
                            }

                            const count = character.skills.filter(s => {
                                const skillNameLower = s.name.toLowerCase();
                                return s.proficiency !== 'untrained' &&
                                    !autoTrainedSkills.some(classSkill => classSkill.toLowerCase() === skillNameLower) &&
                                    skillNameLower !== (bonusSkill?.toLowerCase() || '') &&
                                    !backgroundSkills.includes(skillNameLower);
                            }).length;

                            console.log('[SkillTraining] currentCount:', count, 'INT:', character.abilityScores.int);
                            return count;
                        })(),
                        maxValue: (() => {
                            const classSkillSlots = selectedClass?.additionalSkills || 0;
                            // Use initial INT for level 1 skill training cap (not current INT)
                            // This ensures the cap doesn't increase when INT is raised at higher levels
                            const intMod = Math.floor((initialInt - 10) / 2);
                            const max = classSkillSlots + Math.max(0, intMod);
                            console.log('[SkillTraining] maxValue:', max, 'classSkillSlots:', classSkillSlots, 'intMod:', intMod, 'initialInt:', initialInt, 'currentInt:', character.abilityScores.int);
                            return max;
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
                    value: '',  // Icon and badge provide all info
                    currentCount: levelBoosts.length,
                    maxValue: boostsCount,
                    required: true,
                    onClick: () => onOpenSelection(`boost${level}`, level),
                });
            }

            // Add INT bonus skills section (Remastered rule: 1 Trained skill per INT boost after level 1)
            // This appears at the level where INT was boosted
            const intBonusSkillsAtLevel = getIntBonusSkillsAvailableAtLevel(level);
            const hasIntBoostAtLevel = character.abilityBoosts?.levelUp?.[level]?.includes('int');

            if (level > 1 && hasIntBoostAtLevel) {
                // Show skills selected at this specific level
                const selectedSkillsAtLevel = character.intBonusSkills?.[level] || [];
                const skillNames = selectedSkillsAtLevel.map(skillName => {
                    const skillDef = skillsData.find(s => s.name.toLowerCase() === skillName.toLowerCase());
                    return skillDef ? getName(skillDef) : skillName;
                }).join(', ');

                const levelBoosts = character.abilityBoosts?.levelUp?.[level] || [];
                const intBoostsAtLevel = levelBoosts.filter(b => b === 'int').length;

                choices.push({
                    id: `intBonusSkills${level}`,
                    type: 'skill',
                    label: 'builder.intBonusSkills',
                    value: skillNames,
                    currentCount: selectedSkillsAtLevel.length,
                    maxValue: intBoostsAtLevel,
                    required: selectedSkillsAtLevel.length < intBoostsAtLevel,
                    onClick: () => onOpenSelection('intBonusSkills', level),
                });
            }

            // Add skill increases if this level has them
            if (SKILL_INCREASE_LEVELS.includes(level as any)) {
                const hasSkillIncrease = !!character.skillIncreases?.[level];
                choices.push({
                    id: `skillIncrease${level}`,
                    type: 'skill',
                    label: 'builder.skillIncrease',
                    value: getSkillIncreaseName(level),
                    currentCount: hasSkillIncrease ? 1 : 0,
                    maxValue: 1,
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

                // For Kineticist level 1 class feats, show all selected feats
                let featValue = getFeatName(featId);
                if (slot.type === 'class' && level === 1 && character.classId === 'RggQN3bX5SEcsffR' && featsOfSlotTypeAtLevel.length > 1) {
                    featValue = featsOfSlotTypeAtLevel.map(f => getFeatName(f.featId)).join(', ');
                }

                choices.push({
                    id: `${slot.type}Feat${level}${idx > 0 ? idx : ''}`,
                    type: `${slot.type}Feat`,  // e.g., 'ancestryFeat', 'classFeat', 'generalFeat', 'skillFeat'
                    label: labelKey,
                    value: featValue,
                    required: true,
                    onClick: () => onOpenSelection(slot.type === 'archetype' ? 'archetypeFeat' : `${slot.type}Feat`, level),
                });
            });

            // Add Commander tactics selection
            // Commander gains new tactics at levels 1, 7, 15, 19
            if (character.classId === 'Oyee5Ds9uwYLEkD0') { // Commander class ID
                const tacticsLevels: { level: number; tier: string; count: number }[] = [
                    { level: 1, tier: 'basic', count: 5 },
                    { level: 7, tier: 'expert', count: 2 },
                    { level: 15, tier: 'master', count: 2 },
                    { level: 19, tier: 'legendary', count: 2 },
                ];

                const tacticsInfo = tacticsLevels.find(t => t.level === level);
                if (tacticsInfo) {
                    const knownTactics = character.tactics?.known || [];
                    const tierTactics = knownTactics.filter(id => {
                        // This would require loading tactic data to check tier
                        // For now, we'll just count total known tactics
                        return true;
                    });

                    choices.push({
                        id: `tactics${level}`,
                        type: 'tactics',
                        label: `commander.tactics${tacticsInfo.tier.charAt(0).toUpperCase() + tacticsInfo.tier.slice(1)}`,
                        value: `${knownTactics.length} tactics`,
                        required: true,
                        onClick: () => onOpenSelection('tactics', level),
                    });
                }
            }

            // Add Kineticist Gate's Threshold at levels 5, 9, 13, 17
            // Show ONLY Gate's Threshold option (hide Single Gate and Dual Gate choices)
            const GATES_THRESHOLD_LEVELS = [5, 9, 13, 17];
            if (character.classId === 'RggQN3bX5SEcsffR' && GATES_THRESHOLD_LEVELS.includes(level)) {
                if (level === 5) {
                    console.log('[Sidebar] Full kineticistJunctions object:', character.kineticistJunctions);
                }
                const junctionData = character.kineticistJunctions?.[level];

                // Check if junction is properly completed:
                // - Fork the Path: needs newElementGateId
                // - Expand the Portal: needs junctionIds with at least 1 junction
                const hasJunction = junctionData && (
                    (junctionData.choice === 'fork_the_path' && !!junctionData.newElementGateId) ||
                    (junctionData.choice === 'expand_the_portal' && junctionData.junctionIds && junctionData.junctionIds.length > 0)
                );

                console.log(`[Sidebar Level ${level}] junctionData:`, junctionData, 'hasJunction:', hasJunction);

                // Get the junction value for display - show junction name or 'Fork: [Element]'
                let junctionValue = '';
                if (hasJunction) {
                    if (junctionData.choice === 'expand_the_portal' && junctionData.junctionIds && junctionData.junctionIds.length > 0) {
                        // Show the selected junction name (e.g., "Aura Junction")
                        const junctionId = junctionData.junctionIds[0];
                        const junction = getSpecializationById(junctionId);
                        if (junction) {
                            junctionValue = (junction.nameIt && t('specialization.title') === 'Specializzazione di Classe')
                                ? junction.nameIt
                                : junction.name;
                        } else {
                            junctionValue = t('kineticist.expand') || 'Expand';
                        }
                    } else if (junctionData.choice === 'fork_the_path' && junctionData.newElementGateId) {
                        // Show 'Fork: [Element]' for Fork the Path
                        const newElement = getKineticistElementFromGateId(junctionData.newElementGateId);
                        junctionValue = newElement
                            ? `Fork: ${newElement.charAt(0).toUpperCase() + newElement.slice(1)}`
                            : 'Fork';
                    }
                }

                choices.push({
                    id: `gatesThreshold${level}`,
                    type: 'secondaryClass',
                    label: 'kineticist.gatesThreshold',
                    value: junctionValue,
                    required: true,
                    onClick: () => {
                        console.log('[DesktopCharacterLayout] Opening kineticistJunction for level:', level);
                        onOpenSelection('kineticistJunction', level);
                    },
                });

                // If Expand the Portal was chosen, add impulse selection
                // Fork the Path adds the impulse automatically, so no selection needed
                if (hasJunction && junctionData.choice === 'expand_the_portal') {
                    console.log(`[Sidebar Level ${level}] Adding impulse selection for Expand the Portal`);
                    // Expand the Portal gives access to impulses from current elements
                    const impulseFeats = feats.filter(f => {
                        if (f.level !== level) return false;
                        const featData = getFeats().find(feat => feat.id === f.featId);
                        return featData && featData.traits.includes('impulse');
                    });

                    console.log(`[Sidebar Level ${level}] Found impulse feats:`, impulseFeats);

                    // Get feat names for display
                    const impulseFeatNames = impulseFeats.map(f => {
                        const featData = getFeats().find(feat => feat.id === f.featId);
                        return featData ? featData.name : f.featId;
                    });

                    choices.push({
                        id: `kineticistImpulse${level}`,
                        type: 'kineticistImpulse',
                        label: 'kineticist.impulseFeats',
                        value: impulseFeatNames.length > 0 ? impulseFeatNames.join(', ') : '',
                        required: true,
                        onClick: () => onOpenSelection('kineticistImpulse', level),
                    });
                }
            }

            // Add Kineticist impulse selection at level 1
            // Kineticist gains impulse feats at level 1 (2 for Single Gate, 1 for each element for Dual Gate)
            // This is IN ADDITION to the normal class feat slot
            if (character.classId === 'RggQN3bX5SEcsffR' && level === 1) {
                const impulseFeats = feats.filter(f => {
                    if (f.level !== 1) return false;
                    const featData = getFeats().find(feat => feat.id === f.featId);
                    return featData && featData.traits.includes('impulse');
                });

                choices.push({
                    id: `kineticistImpulse${level}`,
                    type: 'kineticistImpulse',
                    label: 'kineticist.impulseFeats',
                    value: impulseFeats.length > 0 ? `${impulseFeats.length} impulse${impulseFeats.length > 1 ? 's' : ''}` : '',
                    required: true,
                    onClick: () => onOpenSelection('kineticistImpulse', level),
                });
            }

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

    // HP Handler
    const handleHPChange = (newHP: { current: number; temporary?: number }) => {
        onCharacterUpdate({
            ...character,
            hitPoints: {
                ...character.hitPoints,
                current: newHP.current,
                temporary: newHP.temporary ?? character.hitPoints.temporary
            }
        });
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

    // Deity handlers
    const handleSelectDeity = (deity: any) => {
        onCharacterUpdate({
            ...character,
            deityId: deity.id,
        });
        setShowDeityBrowser(false);
    };

    // Tactics handlers
    const handleAddTactic = (tactic: any) => {
        const currentTactics = character.tactics || { known: [], prepared: [] };
        const newKnown = [...currentTactics.known, tactic.id];

        // Auto-add to prepared if we have room
        let newPrepared = [...currentTactics.prepared];
        if (newPrepared.length < 3 && !newPrepared.includes(tactic.id)) {
            newPrepared.push(tactic.id);
        }

        onCharacterUpdate({
            ...character,
            tactics: {
                ...currentTactics,
                known: newKnown,
                prepared: newPrepared,
            },
        });
    };

    const handleTogglePreparedTactic = (tacticId: string) => {
        const currentTactics = character.tactics || { known: [], prepared: [] };
        const isPrepared = currentTactics.prepared.includes(tacticId);

        let newPrepared: string[];
        if (isPrepared) {
            // Remove from prepared
            newPrepared = currentTactics.prepared.filter(id => id !== tacticId);
        } else {
            // Add to prepared if we have room
            if (currentTactics.prepared.length >= 3) {
                // Already at max, don't add
                return;
            }
            newPrepared = [...currentTactics.prepared, tacticId];
        }

        onCharacterUpdate({
            ...character,
            tactics: {
                ...currentTactics,
                prepared: newPrepared,
            },
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

    const getClassDC = (): { classType: string; value: number }[] => {
        console.log(`[getClassDC] START - character.level=${character.level}, character.classDCs=`, character.classDCs);
        const result: { classType: string; value: number }[] = [];

        // Calculate ABP item bonus for class DC (same for all class DCs)
        let itemBonus = 0;
        if (character.variantRules?.automaticBonusProgression) {
            const level = character.level || 1;
            if (level >= 4) itemBonus = 1;
            if (level >= 8) itemBonus = 2;
            if (level >= 12) itemBonus = 3;
            if (level >= 16) itemBonus = 4;
            if (level >= 20) itemBonus = 5;
        }

        // Calculate base class DC
        // Default to Strength if no class selected, otherwise use class key ability
        let keyAbilityAttr = 'str';
        if (selectedClass) {
            if (Array.isArray(selectedClass.keyAbility)) {
                keyAbilityAttr = selectedClass.keyAbility[0];
            } else {
                keyAbilityAttr = selectedClass.keyAbility;
            }
        }

        const keyAbilityScore = character.abilityScores[keyAbilityAttr as keyof typeof character.abilityScores] || 10;
        const keyMod = Math.floor((keyAbilityScore - 10) / 2);

        // Determine Class DC proficiency based on class and level
        const KINETICIST_CLASS_ID = 'RggQN3bX5SEcsffR';
        const isKineticist = character.classId === KINETICIST_CLASS_ID || selectedClass?.name?.toLowerCase() === 'kineticist';

        let classDCProficiency = ProficiencyRank.Trained;

        if (isKineticist) {
            if (character.level >= 19) {
                classDCProficiency = ProficiencyRank.Legendary;
            } else if (character.level >= 15) {
                classDCProficiency = ProficiencyRank.Master;
            } else if (character.level >= 7) {
                classDCProficiency = ProficiencyRank.Expert;
            }
        }

        const profBonus = calculateProficiencyBonusWithVariant(
            character.level || 1,
            classDCProficiency,
            character.variantRules?.proficiencyWithoutLevel
        );

        console.log(`[getClassDC] Base ${selectedClass?.name || 'Class'}: mod=${keyMod}, profBonus=${profBonus}, itemBonus=${itemBonus}, total=${10 + keyMod + profBonus + itemBonus}`);

        result.push({
            classType: selectedClass?.name || 'Class',
            value: 10 + keyMod + profBonus + itemBonus
        });

        // Add class DCs from archetype dedications
        if (character.classDCs && Array.isArray(character.classDCs)) {
            for (const dc of character.classDCs) {
                // Only show class DCs at or below current level
                // Note: classDCs array is populated by applySubfeaturesProficiencies which already filters by level

                // Get ability modifier for this class DC
                const dcAbilityScore = character.abilityScores[dc.ability] || 10;
                const dcMod = Math.floor((dcAbilityScore - 10) / 2);

                // Calculate proficiency bonus
                const dcProfRank = dc.proficiency === 'trained' ? ProficiencyRank.Trained :
                    dc.proficiency === 'expert' ? ProficiencyRank.Expert :
                        dc.proficiency === 'master' ? ProficiencyRank.Master :
                            dc.proficiency === 'legendary' ? ProficiencyRank.Legendary :
                                ProficiencyRank.Untrained;

                // Archetype dedication class DCs use the same formula as base class DC
                // Proficiency bonus = Level + Rank (e.g., Level 10 + Trained 2 = 12)
                const dcProfBonus = calculateProficiencyBonusWithVariant(
                    character.level || 1,
                    dcProfRank,
                    character.variantRules?.proficiencyWithoutLevel
                );

                // Use the same itemBonus calculated earlier for base class DC
                const calculatedDC = 10 + dcMod + dcProfBonus + itemBonus;
                console.log(`[getClassDC] ${dc.classType}: mod=${dcMod}, profBonus=${dcProfBonus}, itemBonus=${itemBonus}, total=${calculatedDC}`);

                result.push({
                    classType: dc.classType.charAt(0).toUpperCase() + dc.classType.slice(1),
                    value: calculatedDC
                });
            }
        }

        console.log(`[getClassDC] END - result:`, result);
        return result;
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

            // 4. Apply buffs from feats (e.g., Untrained Improvisation)
            const skillId = skill.id.toLowerCase();
            const skillBuffs = (character.buffs || []).filter(b => {
                // Check for buffs that apply to this specific skill or all skills
                // For "skill-*" buffs (like Untrained Improvisation), only apply to untrained skills
                if (b.selector === 'skill-*' && proficiency !== 'untrained') {
                    return false;
                }
                return b.selector === `skill-${skillId}` || b.selector === 'skill-*';
            });

            // Group bonuses by type - only the highest bonus of each type applies
            const statusBonuses = skillBuffs.filter(b => b.type === 'status' && b.bonus > 0).map(b => b.bonus);
            const circumstanceBonuses = skillBuffs.filter(b => b.type === 'circumstance' && b.bonus > 0).map(b => b.bonus);
            const itemBonuses = skillBuffs.filter(b => b.type === 'item' && b.bonus > 0).map(b => b.bonus);

            // Only the highest bonus of each type applies
            const totalBonus = Math.max(0, ...statusBonuses, 0) +
                              Math.max(0, ...circumstanceBonuses, 0) +
                              Math.max(0, ...itemBonuses, 0);

            // Penalties always stack (add together)
            const penalties = skillBuffs
                .filter(b => b.bonus < 0 || b.type === 'penalty')
                .reduce((sum, b) => sum + b.bonus, 0);

            // 5. Calculate Total Modifier including condition penalties
            const conditionPenalty = getSkillPenalty(skill.ability, conditionPenalties);
            const totalMod = abilityMod + profBonus + totalBonus + penalties + conditionPenalty;

            return {
                ...skill,
                modifier: totalMod,
                proficiency: proficiency,
                hasPenalty: conditionPenalty < 0
            };
        });
    };

    const calculatedSkills = calculateSkills();

    // Calculate initiative including buffs from feats (e.g., Incredible Initiative)
    const getInitiativeMod = () => {
        const basePerception = getPerceptionMod();

        // Apply initiative buffs from feats with proper PF2e stacking rules
        const initiativeBuffs = (character.buffs || []).filter(b => b.selector === 'initiative');

        // Group bonuses by type - only the highest bonus of each type applies
        const statusBonuses = initiativeBuffs.filter(b => b.type === 'status' && b.bonus > 0).map(b => b.bonus);
        const circumstanceBonuses = initiativeBuffs.filter(b => b.type === 'circumstance' && b.bonus > 0).map(b => b.bonus);
        const itemBonuses = initiativeBuffs.filter(b => b.type === 'item' && b.bonus > 0).map(b => b.bonus);

        // Only the highest bonus of each type applies
        const totalBonus = Math.max(0, ...statusBonuses, 0) +
                          Math.max(0, ...circumstanceBonuses, 0) +
                          Math.max(0, ...itemBonuses, 0);

        // Penalties always stack (add together)
        const penalties = initiativeBuffs
            .filter(b => b.bonus < 0 || b.type === 'penalty')
            .reduce((sum, b) => sum + b.bonus, 0);

        return basePerception + totalBonus + penalties;
    };

    return (
        <div className="desktop-layout">
            <TopBar
                characterName={character.name || t('character.unnamed')}
                className={displayClassName || t('character.noClass')}
                level={character.level || 1}
                xp={character.xp}
                size={selectedAncestry?.size || 'Medium'}
                speed={character.speed.land}
                abilityScores={{
                    str: character.abilityScores.str || 10,
                    dex: character.abilityScores.dex || 10,
                    con: character.abilityScores.con || 10,
                    int: character.abilityScores.int || 10,
                    wis: character.abilityScores.wis || 10,
                    cha: character.abilityScores.cha || 10,
                }}
                onMenuClick={() => setMenuOpen(!menuOpen)}
                onRestClick={handleRest}
                onNameChange={(newName) => {
                    onCharacterUpdate({
                        ...character,
                        name: newName,
                    });
                }}
                onLevelChange={(newLevel) => {
                    // Preserve ALL choices for builder mode/retraining
                    // The character data keeps all selections regardless of level
                    // recalculateCharacter handles applying only what's active at newLevel

                    const updatedCharacter = {
                        ...character,
                        level: newLevel,
                        // Keep all feats, boosts, and skillIncreases for builder mode
                        feats: character.feats || [],
                        abilityBoosts: character.abilityBoosts,
                        skillIncreases: character.skillIncreases || {},
                    };

                    // Recalculate to properly update HP, skill proficiencies, and other derived stats
                    const recalculatedCharacter = recalculateCharacter(updatedCharacter);
                    onCharacterUpdate(recalculatedCharacter);
                }}
            />

            <div className="desktop-main">
                {/* Column 1: Level Sidebar - Origins & Progression */}
                <LevelSidebar
                    sections={buildSections}
                    currentLevel={character.level || 1}
                    onLevelChange={(newLevel) => {
                        // Preserve ALL choices for builder mode/retraining
                        // The character data keeps all selections regardless of level
                        // recalculateCharacter handles applying only what's active at newLevel

                        const updatedCharacter = {
                            ...character,
                            level: newLevel,
                            // Keep all feats, boosts, and skillIncreases for builder mode
                            feats: character.feats || [],
                            abilityBoosts: character.abilityBoosts,
                            skillIncreases: character.skillIncreases || {},
                        };

                        // Recalculate to properly update HP, skill proficiencies, and other derived stats
                        const recalculatedCharacter = recalculateCharacter(updatedCharacter);
                        onCharacterUpdate(recalculatedCharacter);
                    }}
                />

                {/* Column 2: Combat Column - Character Sheet */}
                <CombatColumn
                    heroPoints={1}
                    classDC={getClassDC()}
                    perception={getPerceptionMod()}
                    initiative={getInitiativeMod()}
                    skills={calculatedSkills}
                />

                {/* Column 3: Content Area - Status & Management */}
                <div className="desktop-content">
                    {/* Survival Header - AC, HP, Saving Throws */}
                    <SurvivalHeader
                        ac={getAC()}
                        hp={{
                            current: character.hitPoints.current,
                            max: character.hitPoints.max,
                            temporary: character.hitPoints.temporary
                        }}
                        fortitude={calculateSavingThrow(character, 'fortitude')}
                        reflex={calculateSavingThrow(character, 'reflex')}
                        will={calculateSavingThrow(character, 'will')}
                        onRest={handleRest}
                        onAddCondition={() => setShowConditionBrowser(true)}
                        onAddBuff={() => setShowBuffBrowser(true)}
                        onHPChange={handleHPChange}
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
                        hasPets={character.pets && character.pets.length > 0}
                    />

                    <div className="tab-content">
                        <div className="main-content-area">
                            {activeTab === 'weapons' && (
                                <Suspense fallback={<LoadingFallback />}>
                                    <WeaponsPanel
                                        character={character}
                                        onCharacterUpdate={onCharacterUpdate}
                                    />
                                </Suspense>
                            )}

                            {activeTab === 'defense' && (
                                <Suspense fallback={<LoadingFallback />}>
                                    <DefensePanel
                                        character={character}
                                        ac={getAC()}
                                        onCharacterUpdate={onCharacterUpdate}
                                    />
                                </Suspense>
                            )}

                            {activeTab === 'gear' && (
                                <Suspense fallback={<LoadingFallback />}>
                                    <GearPanel
                                        character={character}
                                        onAddGear={() => setShowEquipmentBrowser(true)}
                                        onCharacterUpdate={onCharacterUpdate}
                                    />
                                </Suspense>
                            )}

                            {activeTab === 'resources' && (
                                <Suspense fallback={<LoadingFallback />}>
                                    <ResourcesPanel
                                        character={character}
                                        onCharacterUpdate={onCharacterUpdate}
                                    />
                                </Suspense>
                            )}

                            {activeTab === 'spells' && (
                                <Suspense fallback={<LoadingFallback />}>
                                    <SpellsPanel
                                        character={character}
                                        onCastSpell={(spellId) => console.log('Cast:', spellId)}
                                        onAddSpell={() => console.log('Add spell')}
                                    />
                                </Suspense>
                            )}

                            {activeTab === 'pets' && (
                                <Suspense fallback={<LoadingFallback />}>
                                    <PetsPanel
                                        character={character}
                                        onCharacterUpdate={onCharacterUpdate}
                                    />
                                </Suspense>
                            )}

                            {activeTab === 'feats' && (
                                <Suspense fallback={<LoadingFallback />}>
                                    <FeatsPanel
                                        character={character}
                                        onFeatClick={(feat) => console.log('Feat:', feat)}
                                    />
                                </Suspense>
                            )}

                            {activeTab === 'biography' && (
                                <Suspense fallback={<LoadingFallback />}>
                                    <BiographyPanel
                                        character={character}
                                        onBiographyUpdate={(biography) => {
                                            onCharacterUpdate({
                                                ...character,
                                                biography,
                                            });
                                        }}
                                        onDeitySelect={() => setShowDeityBrowser(true)}
                                    />
                                </Suspense>
                            )}

                            {activeTab === 'notes' && (
                                <div className="notes-panel">
                                    <div className="panel-header">
                                        <h3>{t('tabs.notes') || 'Notes'}</h3>
                                    </div>
                                    <div className="notes-content">
                                        <RichTextEditor
                                            value={character.notes || ''}
                                            onChange={(notes) => {
                                                onCharacterUpdate({
                                                    ...character,
                                                    notes,
                                                });
                                            }}
                                            placeholder={t('notes.startTyping') || 'Start typing...'}
                                            maxLength={10000}
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'details' && (
                                <div className="details-container">
                                    {/* Internal tabs for Biography and Notes */}
                                    <div className="details-tabs">
                                        <button
                                            className={`details-tab ${activeDetailsTab === 'biography' ? 'active' : ''}`}
                                            onClick={() => setActiveDetailsTab('biography')}
                                        >
                                            {t('details.biography') || 'Biography'}
                                        </button>
                                        <button
                                            className={`details-tab ${activeDetailsTab === 'notes' ? 'active' : ''}`}
                                            onClick={() => setActiveDetailsTab('notes')}
                                        >
                                            {t('tabs.notes') || 'Notes'}
                                        </button>
                                    </div>

                                    {/* Biography Tab Content */}
                                    {activeDetailsTab === 'biography' && (
                                        <Suspense fallback={<LoadingFallback />}>
                                            <BiographyPanel
                                                character={character}
                                                onBiographyUpdate={(biography) => {
                                                    onCharacterUpdate({ ...character, biography });
                                                }}
                                                onDeitySelect={() => setShowDeityBrowser(true)}
                                            />
                                        </Suspense>
                                    )}

                                    {/* Notes Tab Content */}
                                    {activeDetailsTab === 'notes' && (
                                        <div className="notes-content-wrapper">
                                            <RichTextEditor
                                                value={character.notes || ''}
                                                onChange={(notes) => {
                                                    onCharacterUpdate({
                                                        ...character,
                                                        notes,
                                                    });
                                                }}
                                                placeholder={t('notes.startTyping') || 'Start typing...'}
                                                maxLength={10000}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'actions' && (
                                <Suspense fallback={<LoadingFallback />}>
                                    <ActionsPanel
                                        character={character}
                                        onActionClick={setSelectedAction}
                                    />
                                </Suspense>
                            )}

                            {/* Commander Tactics Panel - only show for Commander class */}
                            {character.classId === 'Oyee5Ds9uwYLEkD0' && activeTab === 'actions' && (
                                <Suspense fallback={<LoadingFallback />}>
                                    <TacticsPanel
                                        character={character}
                                        onTogglePreparedTactic={handleTogglePreparedTactic}
                                    />
                                </Suspense>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Detail Modal */}
            <Suspense fallback={<LoadingFallback />}>
                <DetailModal
                    isOpen={selectedAction !== null}
                    onClose={() => setSelectedAction(null)}
                    title={selectedAction?.name || ''}
                >
                    {selectedAction && (
                        <Suspense fallback={<LoadingFallback />}>
                            <ActionDetailContent
                                name={selectedAction.name}
                                cost={selectedAction.cost}
                                description={selectedAction.description}
                                traits={selectedAction.traits}
                                skill={selectedAction.skill}
                            />
                        </Suspense>
                    )}
                </DetailModal>
            </Suspense>

            {/* Condition Browser Modal */}
            {
                showConditionBrowser && (
                    <Suspense fallback={<LoadingFallback />}>
                        <ConditionBrowser
                            onClose={() => setShowConditionBrowser(false)}
                            onAdd={handleAddCondition}
                        />
                    </Suspense>
                )
            }

            {/* Buff Browser Modal */}
            {
                showBuffBrowser && (
                    <Suspense fallback={<LoadingFallback />}>
                        <BuffBrowser
                            onClose={() => setShowBuffBrowser(false)}
                            onAddBuff={handleAddBuff}
                        />
                    </Suspense>
                )
            }

            {/* Equipment Browser Modal */}
            {
                showEquipmentBrowser && (
                    <Suspense fallback={<LoadingFallback />}>
                        <EquipmentBrowser
                            onClose={() => setShowEquipmentBrowser(false)}
                            onEquipArmor={() => { }}
                            onEquipShield={() => { }}
                            onEquipGear={handleEquipGear}
                            initialTab="gear"
                        />
                    </Suspense>
                )
            }

            {/* Rest & Recovery Modal */}
            {
                showRestModal && (
                    <Suspense fallback={<LoadingFallback />}>
                        <RestModal
                            character={character}
                            onClose={() => setShowRestModal(false)}
                            onCharacterUpdate={onCharacterUpdate}
                        />
                    </Suspense>
                )
            }

            {/* Variant Rules Modal */}
            {
                showVariantRules && (
                    <Suspense fallback={<LoadingFallback />}>
                        <VariantRulesPanel
                            character={character}
                            onClose={() => setShowVariantRules(false)}
                            onCharacterUpdate={onCharacterUpdate}
                        />
                    </Suspense>
                )
            }

            {/* Deity Browser Modal */}
            {
                showDeityBrowser && (
                    <Suspense fallback={<LoadingFallback />}>
                        <DeityBrowser
                            onSelectDeity={handleSelectDeity}
                            onClose={() => setShowDeityBrowser(false)}
                        />
                    </Suspense>
                )
            }

            {/* Tactics Browser Modal - Now handled via CharacterSheetPage selection mechanism */}
            {/* 
                showTacticBrowser && (
                    <Suspense fallback={<LoadingFallback />}>
                        <TacticBrowser
                            characterLevel={character.level}
                            knownTactics={character.tactics?.known || []}
                            maxSelections={3}
                            onAdd={handleAddTactic}
                            onClose={() => setShowTacticBrowser(false)}
                        />
                    </Suspense>
                )
            */}

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
