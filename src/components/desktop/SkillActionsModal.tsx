import React, { useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { getActions } from '../../data/pf2e-loader';
import { Proficiency, Character } from '../../types';
import { ActionIcon } from '../../utils/actionIcons';
import { hasVersatilePerformance } from '../../utils/prereqValidator';

// Skills that use Recall Knowledge
const RECALL_KNOWLEDGE_SKILLS = [
    'arcana', 'occultism', 'religion', 'society', 'nature', 'crafting',
    'geography', 'history', 'nobility', 'planes'
];

// Skill actions mapped to their required skill and minimum proficiency
const SKILL_ACTION_REQUIREMENTS: Record<string, { skill: string; minProficiency: Proficiency }> = {
    // Acrobatics
    'Balance': { skill: 'acrobatics', minProficiency: 'untrained' },
    'Tumble Through': { skill: 'acrobatics', minProficiency: 'untrained' },
    'Maneuver in Flight': { skill: 'acrobatics', minProficiency: 'trained' },
    'Squeeze': { skill: 'acrobatics', minProficiency: 'trained' },
    // Athletics
    'Climb': { skill: 'athletics', minProficiency: 'untrained' },
    'Force Open': { skill: 'athletics', minProficiency: 'untrained' },
    'Grapple': { skill: 'athletics', minProficiency: 'untrained' },
    'High Jump': { skill: 'athletics', minProficiency: 'untrained' },
    'Long Jump': { skill: 'athletics', minProficiency: 'untrained' },
    'Shove': { skill: 'athletics', minProficiency: 'untrained' },
    'Swim': { skill: 'athletics', minProficiency: 'untrained' },
    'Trip': { skill: 'athletics', minProficiency: 'untrained' },
    'Disarm': { skill: 'athletics', minProficiency: 'trained' },
    // Stealth
    'Hide': { skill: 'stealth', minProficiency: 'untrained' },
    'Sneak': { skill: 'stealth', minProficiency: 'untrained' },
    'Conceal an Object': { skill: 'stealth', minProficiency: 'untrained' },
    // Thievery
    'Palm an Object': { skill: 'thievery', minProficiency: 'untrained' },
    'Steal': { skill: 'thievery', minProficiency: 'untrained' },
    'Disable Device': { skill: 'thievery', minProficiency: 'trained' },
    'Pick a Lock': { skill: 'thievery', minProficiency: 'trained' },
    // Deception
    'Create a Diversion': { skill: 'deception', minProficiency: 'untrained' },
    'Feint': { skill: 'deception', minProficiency: 'trained' },
    'Lie': { skill: 'deception', minProficiency: 'untrained' },
    'Impersonate': { skill: 'deception', minProficiency: 'untrained' },
    // Diplomacy
    'Gather Information': { skill: 'diplomacy', minProficiency: 'untrained' },
    'Make an Impression': { skill: 'diplomacy', minProficiency: 'untrained' },
    'Request': { skill: 'diplomacy', minProficiency: 'untrained' },
    // Intimidation
    'Coerce': { skill: 'intimidation', minProficiency: 'untrained' },
    'Demoralize': { skill: 'intimidation', minProficiency: 'untrained' },
    // Medicine
    'Administer First Aid': { skill: 'medicine', minProficiency: 'untrained' },
    'Treat Disease': { skill: 'medicine', minProficiency: 'trained' },
    'Treat Poison': { skill: 'medicine', minProficiency: 'trained' },
    'Treat Wounds': { skill: 'medicine', minProficiency: 'trained' },
    // Nature
    'Command an Animal': { skill: 'nature', minProficiency: 'untrained' },
    // Performance
    'Perform': { skill: 'performance', minProficiency: 'untrained' },
    // Crafting
    'Repair': { skill: 'crafting', minProficiency: 'untrained' },
    'Craft': { skill: 'crafting', minProficiency: 'trained' },
    // Survival
    'Sense Direction': { skill: 'survival', minProficiency: 'untrained' },
    'Track': { skill: 'survival', minProficiency: 'trained' },
    'Cover Tracks': { skill: 'survival', minProficiency: 'trained' },
    'Subsist': { skill: 'survival', minProficiency: 'untrained' },
};

// Versatile Performance: Actions that Performance can substitute for
const VERSATILE_PERFORMANCE_SUBSTITUTIONS: Record<string, { originalAction: string; substitutionNote: string }> = {
    'Make an Impression': {
        originalAction: 'Diplomacy',
        substitutionNote: 'Can use Performance instead of Diplomacy with Versatile Performance',
    },
    'Demoralize': {
        originalAction: 'Intimidation',
        substitutionNote: 'Can use Performance instead of Intimidation with Versatile Performance',
    },
    'Impersonate': {
        originalAction: 'Deception',
        substitutionNote: 'Can use acting Performance instead of Deception with Versatile Performance',
    },
};

const PROFICIENCY_ORDER: Proficiency[] = ['untrained', 'trained', 'expert', 'master', 'legendary'];

interface VirtualAction {
    id: string;
    name: string;
    cost: '1' | '2' | '3' | 'free' | 'reaction';
    description: string;
    traits: string[];
    minProficiency: Proficiency;
}

interface SkillActionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    skillName: string;
    characterProficiency: Proficiency;
    character?: Character; // Optional: for Versatile Performance check
}

// Modal state to track expanded action
const useExpandedAction = (initialState: string | null = null) => {
    const [expandedActionId, setExpandedActionId] = React.useState<string | null>(initialState);

    const toggleExpanded = (id: string) => {
        setExpandedActionId(prev => prev === id ? null : id);
    };

    return { expandedActionId, toggleExpanded };
};

// Create Recall Knowledge action for knowledge skills
const createRecallKnowledgeAction = (skillName: string): VirtualAction => {
    const skillLower = skillName.toLowerCase();
    let dcExamples = '';
    let topicExamples = '';

    // Set DC and topic examples based on skill
    switch (skillLower) {
        case 'arcana':
            dcExamples = '15 for common creatures, 20 for uncommon, 25+ for rare';
            topicExamples = 'magical traditions, spells, magic items, constructs, phantoms, etc.';
            break;
        case 'crafting':
            dcExamples = '15 for common items, 20 for uncommon, 25+ for rare';
            topicExamples = 'alchemical items, weapons, armor, constructs, etc.';
            break;
        case 'occultism':
            dcExamples = '15 for common entities, 20 for uncommon, 25+ for rare';
            topicExamples = 'spirits, haunts, curses, occult planes, etc.';
            break;
        case 'religion':
            dcExamples = '15 for common deities, 20 for uncommon, 25+ for rare';
            topicExamples = 'deities, religious traditions, divine planes, celestials, fiends, etc.';
            break;
        case 'society':
            dcExamples = '15 for common info, 20 for uncommon, 25+ for rare';
            topicExamples = 'history, politics, laws, royalty, wars, ancient civilizations, etc.';
            break;
        case 'nature':
            dcExamples = '15 for common creatures, 20 for uncommon, 25+ for rare';
            topicExamples = 'animals, fungi, plants, fey, incl. identification of creatures';
            break;
        default:
            dcExamples = 'varies by rarity';
            topicExamples = 'topics related to this skill';
    }

    return {
        id: `recall-knowledge-${skillLower}`,
        name: 'Recall Knowledge',
        cost: '1' as const,
        description: `Try to remember some relevant information about ${skillName}. The GM determines a DC and adjusts it based on ${skillName} is an appropriate action.\n\nDC Examples: ${dcExamples}\n\nTopics: ${topicExamples}`,
        traits: ['secret'],
        minProficiency: 'untrained' as Proficiency,
    };
};

// Create skill-specific actions for trained+ skills
const createSkillSpecificActions = (skillName: string): VirtualAction[] => {
    const skillLower = skillName.toLowerCase();
    const actions: VirtualAction[] = [];

    if (skillLower === 'arcana') {
        actions.push(
            {
                id: 'borrow-arcane-spell',
                name: 'Borrow an Arcane Spell',
                cost: '1' as const,
                description: 'You can use your magical skills to cast a spell from a borrowed arcane spellbook. You must have the spell in your own spellbook and succeed at a DC check equal to the spell level + 10.',
                traits: ['manipulate'],
                minProficiency: 'trained' as Proficiency,
            },
            {
                id: 'decipher-writing-arcana',
                name: 'Decipher Writing',
                cost: '1' as const,
                description: 'You can decipher writing in an unfamiliar language or a message written in code. The DC depends on the complexity and rarity of the writing.',
                traits: ['secret', 'exploration'],
                minProficiency: 'trained' as Proficiency,
            },
            {
                id: 'identify-magic-arcana',
                name: 'Identify Magic',
                cost: '1' as const,
                description: 'You can identify the magical tradition and properties of an item. DC = 15 + item level for common items, higher for uncommon/rare items.',
                traits: ['concentrate', 'secret'],
                minProficiency: 'trained' as Proficiency,
            },
            {
                id: 'learn-spell-arcana',
                name: 'Learn a Spell',
                cost: '1' as const,
                description: 'You can learn a new spell from a scroll, spellbook, or other source. You must succeed at a DC check equal to the spell level + 10.',
                traits: ['exploration'],
                minProficiency: 'trained' as Proficiency,
            }
        );
    } else if (skillLower === 'crafting') {
        actions.push(
            {
                id: 'craft-item',
                name: 'Craft',
                cost: '1' as const,
                description: 'You can craft items if you have the formula and sufficient raw materials. The DC is determined by the item level and rarity.',
                traits: ['downtime', 'manipulate'],
                minProficiency: 'trained' as Proficiency,
            },
            {
                id: 'craft-goods',
                name: 'Crafting Goods for the Market',
                cost: '1' as const,
                description: 'You can craft goods to sell. Earn an amount of silver pieces based on your skill check - 10. DC 15 for typical items.',
                traits: ['downtime', 'manipulate'],
                minProficiency: 'trained' as Proficiency,
            },
            {
                id: 'earn-income-crafting',
                name: 'Earn Income',
                cost: '1' as const,
                description: 'You spend time practicing a trade to earn money. Your proficiency in the skill determines the tasks you can accomplish and the DC.',
                traits: ['downtime'],
                minProficiency: 'trained' as Proficiency,
            },
            {
                id: 'identify-alchemy',
                name: 'Identify Alchemy',
                cost: '1' as const,
                description: 'You can identify an alchemical item if you hold it for 1 minute. DC = 15 + item level for common items, higher for uncommon/rare.',
                traits: ['exploration', 'secret'],
                minProficiency: 'trained' as Proficiency,
            }
        );
    } else if (skillLower === 'nature') {
        actions.push(
            {
                id: 'decipher-writing-nature',
                name: 'Decipher Writing',
                cost: '1' as const,
                description: 'You can decipher writing in an unfamiliar language or a message written in code. The DC depends on the complexity and rarity of the writing.',
                traits: ['secret', 'exploration'],
                minProficiency: 'trained' as Proficiency,
            },
            {
                id: 'impersonate-nature',
                name: 'Impersonate',
                cost: '1' as const,
                description: 'You can create a disguise to impersonate someone. The DC depends on how well you know the person and how different you are from them.',
                traits: ['manipulate', 'secret'],
                minProficiency: 'trained' as Proficiency,
            }
        );
    } else if (skillLower === 'religion') {
        actions.push(
            {
                id: 'decipher-writing-religion',
                name: 'Decipher Writing',
                cost: '1' as const,
                description: 'You can decipher writing in an unfamiliar language or a message written in code. The DC depends on the complexity and rarity of the writing.',
                traits: ['secret', 'exploration'],
                minProficiency: 'trained' as Proficiency,
            },
            {
                id: 'identify-magic-religion',
                name: 'Identify Magic',
                cost: '1' as const,
                description: 'You can identify the magical tradition and properties of an item. DC = 15 + item level for common items, higher for uncommon/rare items.',
                traits: ['concentrate', 'secret'],
                minProficiency: 'trained' as Proficiency,
            },
            {
                id: 'learn-spell-religion',
                name: 'Learn a Spell',
                cost: '1' as const,
                description: 'You can learn a new spell from a scroll, prayer book, or other source. You must succeed at a DC check equal to the spell level + 10.',
                traits: ['exploration'],
                minProficiency: 'trained' as Proficiency,
            }
        );
    } else if (skillLower === 'occultism') {
        actions.push(
            {
                id: 'decipher-writing-occultism',
                name: 'Decipher Writing',
                cost: '1' as const,
                description: 'You can decipher writing in an unfamiliar language or a message written in code. The DC depends on the complexity and rarity of the writing.',
                traits: ['secret', 'exploration'],
                minProficiency: 'trained' as Proficiency,
            },
            {
                id: 'identify-magic-occultism',
                name: 'Identify Magic',
                cost: '1' as const,
                description: 'You can identify the magical tradition and properties of an item. DC = 15 + item level for common items, higher for uncommon/rare items.',
                traits: ['concentrate', 'secret'],
                minProficiency: 'trained' as Proficiency,
            }
        );
    } else if (skillLower === 'society') {
        actions.push(
            {
                id: 'decipher-writing-society',
                name: 'Decipher Writing',
                cost: '1' as const,
                description: 'You can decipher writing in an unfamiliar language or a message written in code. The DC depends on the complexity and rarity of the writing.',
                traits: ['secret', 'exploration'],
                minProficiency: 'trained' as Proficiency,
            },
            {
                id: 'impersonate-society',
                name: 'Impersonate',
                cost: '1' as const,
                description: 'You can create a disguise to impersonate someone. The DC depends on how well you know the person and how different you are from them.',
                traits: ['manipulate', 'secret'],
                minProficiency: 'trained' as Proficiency,
            },
            {
                id: 'create-forgery-society',
                name: 'Create a Forgery',
                cost: '1' as const,
                description: 'You can create a forged document. The DC depends on the complexity of the document and how familiar you are with it.',
                traits: ['downtime', 'secret'],
                minProficiency: 'trained' as Proficiency,
            }
        );
    }

    return actions;
};

export const SkillActionsModal: React.FC<SkillActionsModalProps> = ({
    isOpen,
    onClose,
    skillName,
    characterProficiency,
    character,
}) => {
    const { t } = useLanguage();
    const { expandedActionId, toggleExpanded } = useExpandedAction();

    // Get all actions for this skill that the character can use
    const skillActions = useMemo(() => {
        const allActions = getActions();
        const skillNameLower = skillName.toLowerCase();

        // Find actions that require this skill
        const actions = allActions.filter(action => {
            const req = SKILL_ACTION_REQUIREMENTS[action.name];
            if (!req) return false;
            if (req.skill.toLowerCase() !== skillNameLower) return false;

            // Check if character meets proficiency requirement
            const charProfLevel = PROFICIENCY_ORDER.indexOf(characterProficiency);
            const requiredLevel = PROFICIENCY_ORDER.indexOf(req.minProficiency);
            return charProfLevel >= requiredLevel;
        });

        // Versatile Performance: Add Performance-based actions for Diplomacy/Intimidation/Deception
        if (character && hasVersatilePerformance(character)) {
            const performanceSkill = character.skills.find(s => s.name.toLowerCase() === 'performance');
            if (performanceSkill) {
                const performanceProfLevel = PROFICIENCY_ORDER.indexOf(performanceSkill.proficiency);

                // Check which skill we're viewing and add appropriate substitutions
                Object.entries(VERSATILE_PERFORMANCE_SUBSTITUTIONS).forEach(([actionName, substitution]) => {
                    if (substitution.originalAction.toLowerCase() === skillNameLower) {
                        const req = SKILL_ACTION_REQUIREMENTS[actionName];
                        if (req && performanceProfLevel >= PROFICIENCY_ORDER.indexOf(req.minProficiency)) {
                            const action = allActions.find(a => a.name === actionName);
                            if (action && !actions.some(a => a.id === action.id)) {
                                // Mark this action as using Performance instead
                                actions.push({
                                    ...action,
                                    _versatilePerformance: true,
                                    _originalSkill: substitution.originalAction,
                                } as any);
                            }
                        }
                    }
                });
            }
        }

        return actions;
    }, [skillName, characterProficiency, character]);

    // Add Recall Knowledge for skills that use it
    const recallKnowledgeAction = useMemo(() => {
        const skillNameLower = skillName.toLowerCase();
        if (RECALL_KNOWLEDGE_SKILLS.includes(skillNameLower)) {
            const action = createRecallKnowledgeAction(skillName);
            // Check proficiency
            const charProfLevel = PROFICIENCY_ORDER.indexOf(characterProficiency);
            const requiredLevel = PROFICIENCY_ORDER.indexOf(action.minProficiency);
            if (charProfLevel >= requiredLevel) {
                return action;
            }
        }
        return null;
    }, [skillName, characterProficiency]);

    // Add skill-specific actions (trained only)
    const skillSpecificActions = useMemo(() => {
        const actions = createSkillSpecificActions(skillName);
        const charProfLevel = PROFICIENCY_ORDER.indexOf(characterProficiency);

        return actions.filter(action => {
            const requiredLevel = PROFICIENCY_ORDER.indexOf(action.minProficiency);
            return charProfLevel >= requiredLevel;
        });
    }, [skillName, characterProficiency]);

    // Combine database actions with Recall Knowledge and skill-specific actions
    const allDisplayActions = useMemo(() => {
        const combined = [...skillActions];
        if (recallKnowledgeAction) {
            combined.push(recallKnowledgeAction as any);
        }
        combined.push(...skillSpecificActions.map(a => a as any));
        return combined;
    }, [skillActions, recallKnowledgeAction, skillSpecificActions]);

    // Check if this skill type typically has actions
    const skillHasActions = useMemo(() => {
        const skillNameLower = skillName.toLowerCase();
        // Skills that typically have actions in PF2e
        const skillsWithActions = [
            'acrobatics', 'athletics', 'stealth', 'thievery',
            'deception', 'diplomacy', 'intimidation', 'medicine',
            'nature', 'performance', 'crafting', 'survival'
        ];
        return skillsWithActions.includes(skillNameLower);
    }, [skillName]);

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="detail-modal skill-actions-modal">
                <div className="modal-header">
                    <div className="modal-title-group">
                        <h2 className="modal-title">
                            {t(`skills.${skillName.toLowerCase()}`) || skillName}
                        </h2>
                        <span className="modal-subtitle">
                            {t('actions.skillActions') || 'Skill Actions'} ({allDisplayActions.length})
                        </span>
                    </div>
                    <button className="modal-close" onClick={onClose} aria-label="Close">
                        ×
                    </button>
                </div>
                <div className="modal-content">
                    {allDisplayActions.length === 0 ? (
                        <div className="no-actions-message">
                            {skillHasActions ? (
                                <>
                                    {t('actions.noSkillActionsProficiency') ||
                                        `You need to be at least ${characterProficiency} proficiency to use actions with this skill.`}
                                </>
                            ) : (
                                <>
                                    {t('actions.noSkillActionsForSkill') ||
                                        `This skill (${skillName}) doesn't have dedicated actions in Pathfinder 2e.\nIt's used for checks like Recall Knowledge.`}
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="skill-actions-list">
                            {allDisplayActions.map(action => {
                                const isExpanded = expandedActionId === action.id;
                                const minProf = (action as any).minProficiency || SKILL_ACTION_REQUIREMENTS[action.name]?.minProficiency;
                                const isVersatilePerformance = (action as any)._versatilePerformance;

                                // Create short description (first sentence only)
                                const shortDesc = action.description.split('.')[0] + '.';

                                return (
                                    <div key={action.id} className="skill-action-card">
                                        <div
                                            className="action-header"
                                            onClick={() => toggleExpanded(action.id)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="action-cost-badge">
                                                <ActionIcon cost={action.cost} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h3 className="action-title">
                                                    {action.name}
                                                    {isVersatilePerformance && (
                                                        <span style={{
                                                            fontSize: '0.75em',
                                                            color: 'var(--desktop-accent)',
                                                            marginLeft: '8px',
                                                            fontWeight: 'normal'
                                                        }}>
                                                            (via Performance)
                                                        </span>
                                                    )}
                                                </h3>
                                                {isVersatilePerformance && (
                                                    <div style={{
                                                        fontSize: '0.7em',
                                                        color: 'var(--desktop-text-secondary)',
                                                        marginTop: '2px'
                                                    }}>
                                                        Using Performance instead of {(action as any)._originalSkill}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="action-proficiency-badge">
                                                {minProf}
                                            </span>
                                            <span className="expand-icon">{isExpanded ? '−' : '+'}</span>
                                        </div>
                                        <div className="action-body">
                                            <p className="action-description">
                                                {isExpanded ? action.description : shortDesc}
                                            </p>
                                            {isExpanded && action.traits && action.traits.length > 0 && (
                                                <div className="action-traits">
                                                    {action.traits.map(trait => (
                                                        <span key={trait} className="trait-tag">
                                                            {trait}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SkillActionsModal;
