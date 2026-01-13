import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Character, Proficiency } from '../../types';
import { getActions, getFeats, LoadedFeat } from '../../data/pf2e-loader';

// Import action icons
import actionSingle from '../../data/Azioni/action_single.png';
import actionDouble from '../../data/Azioni/action_double.png';
import actionTriple from '../../data/Azioni/action_triple.png';
import actionFree from '../../data/Azioni/action_free.png';
import actionReaction from '../../data/Azioni/action_reaction.png';

type ActionCost = 'free' | 'reaction' | '1' | '2' | '3';
type ActionSource = 'basic' | 'feat' | 'skill' | 'pet';

interface PetAction {
    id: string;
    name: string;
    nameIt?: string;
    cost: ActionCost;
    description: string;
    descriptionIt?: string;
    traits: string[];
    petType: 'familiar' | 'animal-companion' | 'eidolon';
}

// Pet-specific actions
const PET_ACTIONS: PetAction[] = [
    {
        id: 'pet-command-animal',
        name: 'Command an Animal',
        nameIt: 'Comando un Animale',
        cost: '1',
        description: 'You issue an instruction to an animal. Attempt a Nature check against the animal\'s Will DC.',
        descriptionIt: 'Dai un\'istruzione a un animale. Tenta un tiro Natura contro la CD di Volontà dell\'animale.',
        traits: ['auditory', 'concentrate'],
        petType: 'animal-companion',
    },
    {
        id: 'pet-sustain-eidolon',
        name: 'Sustain Eidolon',
        nameIt: 'Sostenere Eidolon',
        cost: '1',
        description: 'You sustain a spell or effect your eidolon created. This allows you to extend the duration of certain spells.',
        descriptionIt: 'Sostieni un incantesimo o effetto che il tuo eidolon ha creato. Questo ti permette di estendere la durata di certi incantesimi.',
        traits: ['concentrate'],
        petType: 'eidolon',
    },
    {
        id: 'pet-act-together',
        name: 'Act Together',
        nameIt: 'Agire Insieme',
        cost: '2',
        description: 'You and your eidolon both act. You each take 1 action, or your eidolon takes 2 actions.',
        descriptionIt: 'Tu e il tuo eidolon agite insieme. Ciascuno prende 1 azione, oppure il tuo eidolon prende 2 azioni.',
        traits: ['concentrate'],
        petType: 'eidolon',
    },
    {
        id: 'pet-familiar-ability',
        name: 'Familiar Ability',
        nameIt: 'Abilità del Famiglio',
        cost: 'free',
        description: 'Your familiar uses one of its granted abilities.',
        descriptionIt: 'Il tuo famiglio usa una delle sue abilità concesse.',
        traits: [],
        petType: 'familiar',
    },
];

// Basic action names that are always available
const BASIC_ACTION_NAMES = [
    'Strike', 'Stride', 'Step', 'Interact', 'Seek', 'Raise a Shield',
    'Take Cover', 'Ready', 'Sustain', 'Sustain a Spell', 'Delay', 'Drop Prone', 'Stand',
    'Escape', 'Aid', 'Crawl', 'Leap', 'Release', 'Point Out', 'Avert Gaze',
    'Mount', 'Dismiss', 'Arrest a Fall', 'Grab an Edge', 'Maneuver in Flight',
    'Squeeze', 'Burrow', 'Fly', 'Swim'
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

// Proficiency order for comparison
const PROFICIENCY_ORDER: Proficiency[] = ['untrained', 'trained', 'expert', 'master', 'legendary'];

interface Action {
    id: string;
    name: string;
    cost: ActionCost;
    skill?: string;
    description: string;
    traits: string[];
    source: ActionSource;
}

interface ActionsPanelProps {
    character: Character;
    onActionClick: (action: Action) => void;
}

// Helper to check if character meets proficiency requirement
const meetsSkillRequirement = (
    character: Character,
    skillName: string,
    minProficiency: Proficiency
): boolean => {
    const charSkill = character.skills.find(
        s => s.name.toLowerCase() === skillName.toLowerCase()
    );
    const charProfLevel = PROFICIENCY_ORDER.indexOf(charSkill?.proficiency || 'untrained');
    const requiredLevel = PROFICIENCY_ORDER.indexOf(minProficiency);
    return charProfLevel >= requiredLevel;
};

// Helper to check if an action comes from a feat the character has
const isActionFromCharacterFeat = (
    actionName: string,
    characterFeatIds: Set<string>,
    allFeats: LoadedFeat[]
): boolean => {
    // Find feats that match the action name (feats often grant actions with the same name)
    const matchingFeat = allFeats.find(f =>
        f.name.toLowerCase() === actionName.toLowerCase() ||
        f.name.toLowerCase().replace(/\s+/g, '-') === actionName.toLowerCase().replace(/\s+/g, '-')
    );

    if (matchingFeat && characterFeatIds.has(matchingFeat.id)) {
        return true;
    }

    return false;
};

export const ActionsPanel: React.FC<ActionsPanelProps> = ({
    character,
    onActionClick,
}) => {
    const { t, language } = useLanguage();
    const [filter, setFilter] = useState<ActionCost | 'all' | 'skill' | 'feat' | 'pet'>('all');
    const [searchQuery] = useState('');

    // Load all feats for cross-referencing
    const allFeats = useMemo(() => getFeats(), []);

    // Get character's feat IDs
    const characterFeatIds = useMemo(() => {
        return new Set(character.feats?.map(f => f.featId) || []);
    }, [character.feats]);

    // Get character's pet types
    const characterPetTypes = useMemo(() => {
        const types = new Set<'familiar' | 'animal-companion' | 'eidolon'>();
        character.pets?.forEach(pet => {
            if (pet.type === 'familiar') types.add('familiar');
            if (pet.type === 'animal-companion') types.add('animal-companion');
            if (pet.type === 'eidolon') types.add('eidolon');
        });
        return types;
    }, [character.pets]);

    // Load and categorize actions from pf2e data
    const { basicActions, skillActions, featActions, petActions } = useMemo(() => {
        const loaded = getActions();
        const basic: Action[] = [];
        const skill: Action[] = [];
        const feat: Action[] = [];
        const pet: Action[] = [];

        for (const a of loaded) {
            const action: Action = {
                id: a.id,
                name: a.name,
                cost: a.cost,
                description: a.description,
                traits: a.traits,
                source: 'basic',
            };

            // Check if it's a basic action
            if (BASIC_ACTION_NAMES.includes(a.name)) {
                action.source = 'basic';
                basic.push(action);
                continue;
            }

            // Check if it's a skill action
            const skillReq = SKILL_ACTION_REQUIREMENTS[a.name];
            if (skillReq) {
                action.source = 'skill';
                action.skill = skillReq.skill;
                // Only include if character meets the proficiency requirement
                if (meetsSkillRequirement(character, skillReq.skill, skillReq.minProficiency)) {
                    skill.push(action);
                }
                continue;
            }

            // Check if it's an action from a feat the character has
            if (isActionFromCharacterFeat(a.name, characterFeatIds, allFeats)) {
                action.source = 'feat';
                feat.push(action);
                continue;
            }

            // Also check traits for skill-related actions not in our map
            if (a.traits.some(t => t.toLowerCase() === 'skill')) {
                action.source = 'skill';
                skill.push(action);
            }
        }

        // Add pet-specific actions
        for (const petAction of PET_ACTIONS) {
            // Only include pet actions if character has that type of pet
            if (characterPetTypes.has(petAction.petType)) {
                pet.push({
                    id: petAction.id,
                    name: petAction.name,
                    cost: petAction.cost,
                    description: language === 'it' && petAction.descriptionIt ? petAction.descriptionIt : petAction.description,
                    traits: petAction.traits,
                    source: 'pet',
                });
            }
        }

        return { basicActions: basic, skillActions: skill, featActions: feat, petActions: pet };
    }, [character, characterFeatIds, allFeats, characterPetTypes, language]);

    // Combined actions for "all" filter (basic + skill + feat actions available to character)
    const availableActions = useMemo(() => {
        return [...basicActions, ...skillActions, ...featActions, ...petActions];
    }, [basicActions, skillActions, featActions, petActions]);

    // Get the icon image for action cost
    const getCostIcon = (cost: ActionCost): string => {
        switch (cost) {
            case 'free': return actionFree;
            case 'reaction': return actionReaction;
            case '1': return actionSingle;
            case '2': return actionDouble;
            case '3': return actionTriple;
        }
    };

    // Filter actions based on selection
    const getFilteredActions = (): Action[] => {
        let actions: Action[];

        switch (filter) {
            case 'all':
                // Show basic actions + actions from character feats + available skill actions
                actions = availableActions;
                break;
            case 'skill':
                actions = skillActions;
                break;
            case 'feat':
                actions = featActions;
                break;
            case 'pet':
                actions = petActions;
                break;
            case '1':
            case '2':
            case '3':
            case 'free':
            case 'reaction':
                actions = availableActions.filter(a => a.cost === filter);
                break;
            default:
                actions = availableActions;
        }

        // Apply search filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            actions = actions.filter(a =>
                a.name.toLowerCase().includes(q) ||
                a.description.toLowerCase().includes(q) ||
                a.traits.some(t => t.toLowerCase().includes(q))
            );
        }

        // Sort: basic first, then skill, then feat
        actions.sort((a, b) => {
            const sourceOrder: Record<ActionSource, number> = { basic: 0, skill: 1, feat: 2, pet: 3 };
            const orderDiff = sourceOrder[a.source] - sourceOrder[b.source];
            if (orderDiff !== 0) return orderDiff;
            return a.name.localeCompare(b.name);
        });

        return actions;
    };

    const filteredActions = getFilteredActions();

    return (
        <div className="actions-panel">
            <div className="panel-header">
                <h3>{t('tabs.actions') || 'Actions'}</h3>
            </div>

            {/* Filter Buttons */}
            <div className="actions-filters">
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    {t('filters.all') || 'All'}
                </button>
                <button
                    className={`filter-btn ${filter === '1' ? 'active' : ''}`}
                    onClick={() => setFilter('1')}
                >
                    <img src={actionSingle} alt="1 Action" className="filter-icon" />
                </button>
                <button
                    className={`filter-btn ${filter === '2' ? 'active' : ''}`}
                    onClick={() => setFilter('2')}
                >
                    <img src={actionDouble} alt="2 Actions" className="filter-icon" />
                </button>
                <button
                    className={`filter-btn ${filter === '3' ? 'active' : ''}`}
                    onClick={() => setFilter('3')}
                >
                    <img src={actionTriple} alt="3 Actions" className="filter-icon" />
                </button>
                <button
                    className={`filter-btn ${filter === 'reaction' ? 'active' : ''}`}
                    onClick={() => setFilter('reaction')}
                >
                    <img src={actionReaction} alt="Reaction" className="filter-icon" />
                </button>
                <button
                    className={`filter-btn ${filter === 'free' ? 'active' : ''}`}
                    onClick={() => setFilter('free')}
                >
                    <img src={actionFree} alt="Free Action" className="filter-icon" />
                </button>
                <button
                    className={`filter-btn ${filter === 'skill' ? 'active' : ''}`}
                    onClick={() => setFilter('skill')}
                >
                    {t('filters.skill') || 'Skill'}
                </button>
                {featActions.length > 0 && (
                    <button
                        className={`filter-btn ${filter === 'feat' ? 'active' : ''}`}
                        onClick={() => setFilter('feat')}
                    >
                        {t('filters.feat') || 'Feat'}
                    </button>
                )}
                {petActions.length > 0 && (
                    <button
                        className={`filter-btn ${filter === 'pet' ? 'active' : ''}`}
                        onClick={() => setFilter('pet')}
                    >
                        {t('filters.pet') || 'Pet'}
                    </button>
                )}
            </div>

            {/* Actions Grid - Simplified: only icon + name + source indicator */}
            <div className="actions-grid actions-grid-compact">
                {filteredActions.length === 0 ? (
                    <div className="no-actions">
                        {t('actions.noActions') || 'No actions available'}
                    </div>
                ) : (
                    filteredActions.map(action => (
                        <div
                            key={action.id}
                            className={`action-card action-card-compact action-source-${action.source}`}
                            onClick={() => onActionClick(action)}
                        >
                            <img
                                src={getCostIcon(action.cost)}
                                alt={action.cost}
                                className="action-cost-icon"
                            />
                            <span className="action-name">{action.name}</span>
                            {action.source !== 'basic' && (
                                <span className={`action-source-tag action-source-${action.source}`}>
                                    {action.source === 'skill' ? action.skill : action.source}
                                </span>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ActionsPanel;
