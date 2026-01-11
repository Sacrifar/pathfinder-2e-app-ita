import React, { useState } from 'react';
import { TopBar } from './TopBar';
import { LevelSidebar } from './LevelSidebar';
import { StatsHeader } from './StatsHeader';
import { CharacterTabs, TabId } from './CharacterTabs';
import { SkillsPanel, SkillDisplay } from './SkillsPanel';
import { WeaponsPanel } from './WeaponsPanel';
import { DefensePanel } from './DefensePanel';
import { GearPanel } from './GearPanel';
import { SpellsPanel } from './SpellsPanel';
import { FeatsPanel } from './FeatsPanel';
import { ActionsPanel } from './ActionsPanel';
import { DetailModal, ActionDetailContent } from './DetailModal';
import { ActiveConditions } from './ActiveConditions';
import { ConditionBrowser } from './ConditionBrowser';
import { LoadedCondition, getFeats } from '../../data/pf2e-loader';
import { useLanguage, useLocalizedName } from '../../hooks/useLanguage';
import { Character, Proficiency } from '../../types';
import { ancestries, classes, backgrounds, heritages, skills as skillsData } from '../../data';
import {
    calculateConditionPenalties,
    getSkillPenalty,
    getACPenalty,
    getPerceptionPenalty,
    ConditionPenalties
} from '../../utils/conditionModifiers';

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
    onOpenSelection: (type: string) => void;
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

    // Build level sections for sidebar
    const buildSections = () => {
        const sections = [];
        const feats = character.feats || [];

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
                    onClick: () => onOpenSelection('ancestry'),
                },
                {
                    id: 'heritage',
                    type: 'heritage',
                    label: 'builder.heritage',
                    value: heritageName,
                    required: true,
                    onClick: () => onOpenSelection('heritage'),
                },
                {
                    id: 'background',
                    type: 'background',
                    label: 'builder.background',
                    value: backgroundName,
                    required: true,
                    onClick: () => onOpenSelection('background'),
                },
                {
                    id: 'class',
                    type: 'class',
                    label: 'builder.class',
                    value: className,
                    required: true,
                    onClick: () => onOpenSelection('class'),
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
                    onClick: () => onOpenSelection('boost'),
                },
                {
                    id: 'ancestryFeat',
                    type: 'feat',
                    label: 'builder.ancestryFeat',
                    value: (() => {
                        const featId = feats.find(f => f.source === 'ancestry')?.featId;
                        if (!featId) return '';
                        const allFeats = getFeats();
                        return allFeats.find(f => f.id === featId)?.name || featId;
                    })(),
                    required: true,
                    onClick: () => onOpenSelection('ancestryFeat'),
                },
                {
                    id: 'classFeat1',
                    type: 'feat',
                    label: 'builder.classFeat',
                    value: (() => {
                        const featId = feats.find(f => f.source === 'class' && f.level === 1)?.featId;
                        if (!featId) return '';
                        const allFeats = getFeats();
                        return allFeats.find(f => f.id === featId)?.name || featId;
                    })(),
                    required: true,
                    onClick: () => onOpenSelection('classFeat'),
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
                    onClick: () => onOpenSelection('skillTraining'),
                },
            ],
        });

        // Level 2+
        if (character.level >= 2) {
            sections.push({
                level: 2,
                choices: [
                    {
                        id: 'classFeat2',
                        type: 'feat',
                        label: 'builder.classFeat',
                        value: feats.find(f => f.source === 'class' && f.level === 2)?.featId || '',
                        required: true,
                        onClick: () => onOpenSelection('classFeat'),
                    },
                    {
                        id: 'skillFeat2',
                        type: 'feat',
                        label: 'builder.skillFeat',
                        value: feats.find(f => f.source === 'skill' && f.level === 2)?.featId || '',
                        required: true,
                        onClick: () => onOpenSelection('skillFeat'),
                    },
                ],
            });
        }

        // Level 5 with Ability Boosts (4 free boosts)
        if (character.level >= 5) {
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
                        onClick: () => onOpenSelection('boost5'),
                    },
                ],
            });
        }

        // Level 10 with Ability Boosts
        if (character.level >= 10) {
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
                        onClick: () => onOpenSelection('boost10'),
                    },
                ],
            });
        }

        // Level 15 with Ability Boosts
        if (character.level >= 15) {
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
                        onClick: () => onOpenSelection('boost15'),
                    },
                ],
            });
        }

        // Level 20 with Ability Boosts
        if (character.level >= 20) {
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
                        onClick: () => onOpenSelection('boost20'),
                    },
                ],
            });
        }

        return sections;
    };

    const handleRest = () => {
        // Reset HP to max, restore spell slots, etc.
        onCharacterUpdate({
            ...character,
            hitPoints: { ...character.hitPoints, current: character.hitPoints.max },
        });
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

    // Calculate character stats
    const getPerceptionMod = () => {
        const wisMod = Math.floor((character.abilityScores.wis - 10) / 2);
        const profBonus = getProficiencyBonus(character.perception, character.level || 1);
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
                onLevelChange={(newLevel) => {
                    // Cleanup on level down: remove feats and boosts above new level
                    const cleanedFeats = character.feats.filter(f => f.level <= newLevel);
                    const cleanedLevelUp: Record<number, string[]> = {};
                    if (character.abilityBoosts?.levelUp) {
                        for (const [lvl, boosts] of Object.entries(character.abilityBoosts.levelUp)) {
                            if (parseInt(lvl) <= newLevel) {
                                cleanedLevelUp[parseInt(lvl)] = boosts;
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
                    });
                }}
            />

            <div className="desktop-main">
                <LevelSidebar
                    sections={buildSections()}
                    currentLevel={character.level || 1}
                    onLevelChange={(newLevel) => {
                        // Cleanup on level down: remove feats and boosts above new level
                        const cleanedFeats = character.feats.filter(f => f.level <= newLevel);
                        const cleanedLevelUp: Record<number, string[]> = {};
                        if (character.abilityBoosts?.levelUp) {
                            for (const [lvl, boosts] of Object.entries(character.abilityBoosts.levelUp)) {
                                if (parseInt(lvl) <= newLevel) {
                                    cleanedLevelUp[parseInt(lvl)] = boosts;
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
                        });
                    }}
                />

                <div className="desktop-content">
                    <StatsHeader
                        hp={{ current: character.hitPoints.current, max: character.hitPoints.max }}
                        speed={character.speed.land}
                        size={selectedAncestry?.size || 'Medium'}
                        perception={getPerceptionMod()}
                        ac={getAC()}
                        heroPoints={1}
                        classDC={getClassDC()}
                        onAddCondition={() => setShowConditionBrowser(true)}
                        onAddCustomBuff={() => console.log('Add custom buff')}
                    />

                    <ActiveConditions
                        character={character}
                        onRemove={handleRemoveCondition}
                        onUpdateValue={handleUpdateConditionValue}
                    />

                    <CharacterTabs
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        hasSpells={selectedClass?.spellcasting !== undefined}
                        hasPets={false}
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
                                    onAddGear={() => console.log('Add gear')}
                                />
                            )}

                            {activeTab === 'spells' && (
                                <SpellsPanel
                                    character={character}
                                    onCastSpell={(spellId) => console.log('Cast:', spellId)}
                                    onAddSpell={() => console.log('Add spell')}
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
        </div >
    );
};

export default DesktopCharacterLayout;
