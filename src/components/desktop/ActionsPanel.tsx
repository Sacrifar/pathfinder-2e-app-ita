import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Character, Proficiency } from '../../types';
import { getActions, getFeats, getActionsByClass } from '../../data/pf2e-loader';
import { classes } from '../../data';

// Import action icons
import actionSingle from '../../data/Azioni/action_single.png';
import actionDouble from '../../data/Azioni/action_double.png';
import actionTriple from '../../data/Azioni/action_triple.png';
import actionFree from '../../data/Azioni/action_free.png';
import actionReaction from '../../data/Azioni/action_reaction.png';

type ActionCost = 'free' | 'reaction' | '1' | '2' | '3';
type ActionSource = 'basic' | 'feat' | 'skill' | 'pet';
type ActionCategory = 'all' | 'basic' | 'skill' | 'interaction' | 'offense' | 'movement' | 'class';

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
    rawDescription?: string;
    traits: string[];
    source: ActionSource;
    category?: string;
}

interface ActionData {
    id: string;
    name: string;
    cost: '1' | '2' | '3' | 'free' | 'reaction';
    description: string;
    rawDescription?: string;
    traits: string[];
    skill?: string;
}

interface ActionsPanelProps {
    character: Character;
    onActionClick: (action: ActionData) => void;
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

export const ActionsPanel: React.FC<ActionsPanelProps> = ({
    character,
    onActionClick,
}) => {
    const { t, language } = useLanguage();
    const [costFilter, setCostFilter] = useState<ActionCost | 'all'>('all');
    const [categoryFilter, setCategoryFilter] = useState<ActionCategory>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Load ONLY relevant actions for this character
    const allActions = useMemo(() => {
        const actions: Action[] = [];

        // Get character's class name for class-specific actions
        const characterClass = classes.find(c => c.id === character.classId);
        const className = characterClass?.name?.toLowerCase().replace(/\s+/g, '-');

        // Get all class-specific actions (intrinsic class actions)
        let classSpecificActions: string[] = [];
        if (className) {
            const classActions = getActionsByClass(className);
            classSpecificActions = classActions.map(a => a.id);
        }

        // Get all actions from the database
        const loaded = getActions();

        // Get all feat IDs the character has
        const characterFeatIds = new Set(character.feats?.map(f => f.featId) || []);

        // Load all feats to check which ones grant actions
        const allFeats = getFeats();
        const characterFeats = allFeats.filter(f => characterFeatIds.has(f.id));

        // Create a set of action names granted by character's feats
        const featGrantedActions = new Set<string>();
        for (const feat of characterFeats) {
            if (feat.actionType !== 'passive') {
                featGrantedActions.add(feat.name.toLowerCase());
            }
        }

        // Create a map of actions by name for quick lookup
        const actionsByName = new Map<string, typeof loaded[0]>();
        for (const a of loaded) {
            actionsByName.set(a.name.toLowerCase(), a);
        }

        // Track which action IDs we've already included
        const includedActionIds = new Set<string>();

        for (const a of loaded) {
            let source: ActionSource = 'basic';
            let skill: string | undefined;
            let shouldInclude = false;

            // 1. Basic actions - always include
            if (BASIC_ACTION_NAMES.includes(a.name)) {
                shouldInclude = true;
                source = 'basic';
            }
            // 2. Skill actions - include if character has the skill with required proficiency
            else if (SKILL_ACTION_REQUIREMENTS[a.name]) {
                const req = SKILL_ACTION_REQUIREMENTS[a.name];
                const charSkill = character.skills.find(
                    s => s.name.toLowerCase() === req.skill.toLowerCase()
                );
                if (charSkill && meetsSkillRequirement(character, req.skill, req.minProficiency)) {
                    shouldInclude = true;
                    source = 'skill';
                    skill = req.skill;
                }
            }
            // 3. Class-specific actions (intrinsic class actions from actions/class/{className}/)
            else if (classSpecificActions.includes(a.id)) {
                shouldInclude = true;
                source = 'feat';  // Use 'feat' source for class actions
            }
            // 4. Actions from character's feats (including archetypes, etc.)
            else if (featGrantedActions.has(a.name.toLowerCase())) {
                shouldInclude = true;
                source = 'feat';
            }

            if (shouldInclude) {
                actions.push({
                    id: a.id,
                    name: a.name,
                    cost: a.cost,
                    skill,
                    description: a.description,
                    rawDescription: a.rawDescription,
                    traits: a.traits,
                    source,
                    category: a.category,
                });
                includedActionIds.add(a.id);
            }
        }

        // 5. Add virtual actions from feats that don't exist in the actions database
        // These are typically class abilities, impulses, etc.
        for (const feat of characterFeats) {
            if (feat.actionType !== 'passive') {
                const featNameLower = feat.name.toLowerCase();

                // Only add if we haven't already included an action with this name
                if (!includedActionIds.has(featNameLower)) {
                    let cost: ActionCost = '1';
                    if (feat.actionType === 'free') cost = 'free';
                    else if (feat.actionType === 'reaction') cost = 'reaction';
                    else if (feat.actionCost === 2) cost = '2';
                    else if (feat.actionCost === 3) cost = '3';

                    actions.push({
                        id: `feat-${feat.id}`,  // Use feat ID prefix
                        name: feat.name,
                        cost: cost,
                        description: feat.description,
                        rawDescription: feat.rawDescription,
                        traits: feat.traits,
                        source: 'feat',
                        category: feat.category === 'class' ? 'class' : undefined,
                    });
                    includedActionIds.add(`feat-${feat.id}`);
                }
            }
        }

        // Add pet-specific actions
        const characterPetTypes = new Set<'familiar' | 'animal-companion' | 'eidolon'>();
        character.pets?.forEach(pet => {
            if (pet.type === 'familiar') characterPetTypes.add('familiar');
            if (pet.type === 'animal-companion') characterPetTypes.add('animal-companion');
            if (pet.type === 'eidolon') characterPetTypes.add('eidolon');
        });

        for (const petAction of PET_ACTIONS) {
            if (characterPetTypes.has(petAction.petType)) {
                actions.push({
                    id: petAction.id,
                    name: petAction.name,
                    cost: petAction.cost,
                    description: language === 'it' && petAction.descriptionIt ? petAction.descriptionIt : petAction.description,
                    traits: petAction.traits,
                    source: 'pet',
                    category: 'basic',
                });
            }
        }

        return actions;
    }, [character, language, classes]);

    // Get class-specific actions count (from character's class feats)
    const classActionsCount = useMemo(() => {
        const allFeats = getFeats();
        const characterFeatIds = new Set(character.feats?.map(f => f.featId) || []);

        return allActions.filter(a => {
            // Find if this action corresponds to a feat
            const matchingFeat = allFeats.find(f =>
                f.name.toLowerCase() === a.name.toLowerCase() ||
                f.name.toLowerCase().replace(/\s+/g, '-') === a.name.toLowerCase().replace(/\s+/g, '-')
            );
            // Only count if it's a class feat that the character has
            return matchingFeat && matchingFeat.category === 'class' && characterFeatIds.has(matchingFeat.id);
        }).length;
    }, [allActions, character.feats]);

    // Filter actions based on cost and category filters
    const filteredActions = useMemo(() => {
        let actions = [...allActions];

        // Apply cost filter
        if (costFilter !== 'all') {
            actions = actions.filter(a => a.cost === costFilter);
        }

        // Apply category filter
        if (categoryFilter === 'basic') {
            actions = actions.filter(a => a.source === 'basic' || BASIC_ACTION_NAMES.includes(a.name));
        } else if (categoryFilter === 'skill') {
            actions = actions.filter(a => a.source === 'skill' || a.traits.some(tr => tr.toLowerCase() === 'skill'));
        } else if (categoryFilter === 'class') {
            // Filter for class-specific actions (from character's class feats only)
            const allFeats = getFeats();
            const characterFeatIds = new Set(character.feats?.map(f => f.featId) || []);

            actions = actions.filter(a => {
                const matchingFeat = allFeats.find(f =>
                    f.name.toLowerCase() === a.name.toLowerCase() ||
                    f.name.toLowerCase().replace(/\s+/g, '-') === a.name.toLowerCase().replace(/\s+/g, '-')
                );
                // Only show class feats that the character has
                return matchingFeat && matchingFeat.category === 'class' && characterFeatIds.has(matchingFeat.id);
            });
        } else if (categoryFilter === 'interaction') {
            actions = actions.filter(a => a.category === 'interaction');
        } else if (categoryFilter === 'offense') {
            actions = actions.filter(a => a.category === 'offense');
        } else if (categoryFilter === 'movement') {
            actions = actions.filter(a => a.category === 'movement');
        }

        // Apply search filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            actions = actions.filter(a =>
                a.name.toLowerCase().includes(q) ||
                a.description.toLowerCase().includes(q) ||
                a.traits.some(tr => tr.toLowerCase().includes(q))
            );
        }

        // Sort by name
        actions.sort((a, b) => a.name.localeCompare(b.name));

        return actions;
    }, [allActions, costFilter, categoryFilter, searchQuery]);

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

    return (
        <div className="actions-panel">
            <div className="panel-header">
                <h3>{t('tabs.actions') || 'Actions'}</h3>
            </div>

            {/* Search Input */}
            <div className="actions-search">
                <input
                    type="text"
                    placeholder={t('search.placeholder') || 'Search actions...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
            </div>

            {/* Cost Filter Buttons */}
            <div className="actions-filters">
                <span className="filter-label">{t('filters.cost') || 'Cost'}:</span>
                <button
                    className={`filter-btn ${costFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setCostFilter('all')}
                >
                    {t('filters.all') || 'All'}
                </button>
                <button
                    className={`filter-btn ${costFilter === '1' ? 'active' : ''}`}
                    onClick={() => setCostFilter('1')}
                >
                    <img src={actionSingle} alt="1 Action" className="filter-icon" />
                </button>
                <button
                    className={`filter-btn ${costFilter === '2' ? 'active' : ''}`}
                    onClick={() => setCostFilter('2')}
                >
                    <img src={actionDouble} alt="2 Actions" className="filter-icon" />
                </button>
                <button
                    className={`filter-btn ${costFilter === '3' ? 'active' : ''}`}
                    onClick={() => setCostFilter('3')}
                >
                    <img src={actionTriple} alt="3 Actions" className="filter-icon" />
                </button>
                <button
                    className={`filter-btn ${costFilter === 'reaction' ? 'active' : ''}`}
                    onClick={() => setCostFilter('reaction')}
                >
                    <img src={actionReaction} alt="Reaction" className="filter-icon" />
                </button>
                <button
                    className={`filter-btn ${costFilter === 'free' ? 'active' : ''}`}
                    onClick={() => setCostFilter('free')}
                >
                    <img src={actionFree} alt="Free Action" className="filter-icon" />
                </button>
            </div>

            {/* Category Filter Buttons */}
            <div className="actions-filters">
                <span className="filter-label">{t('filters.category') || 'Category'}:</span>
                <button
                    className={`filter-btn ${categoryFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setCategoryFilter('all')}
                >
                    {t('filters.all') || 'All'}
                </button>
                <button
                    className={`filter-btn ${categoryFilter === 'basic' ? 'active' : ''}`}
                    onClick={() => setCategoryFilter('basic')}
                >
                    {t('filters.basic') || 'Basic'}
                </button>
                <button
                    className={`filter-btn ${categoryFilter === 'skill' ? 'active' : ''}`}
                    onClick={() => setCategoryFilter('skill')}
                >
                    {t('filters.skill') || 'Skill'}
                </button>
                <button
                    className={`filter-btn ${categoryFilter === 'class' ? 'active' : ''}`}
                    onClick={() => setCategoryFilter('class')}
                >
                    {t('filters.class') || 'Class'} ({classActionsCount})
                </button>
                <button
                    className={`filter-btn ${categoryFilter === 'interaction' ? 'active' : ''}`}
                    onClick={() => setCategoryFilter('interaction')}
                >
                    {t('filters.interaction') || 'Interaction'}
                </button>
                <button
                    className={`filter-btn ${categoryFilter === 'offense' ? 'active' : ''}`}
                    onClick={() => setCategoryFilter('offense')}
                >
                    {t('filters.offense') || 'Offense'}
                </button>
                <button
                    className={`filter-btn ${categoryFilter === 'movement' ? 'active' : ''}`}
                    onClick={() => setCategoryFilter('movement')}
                >
                    {t('filters.movement') || 'Movement'}
                </button>
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
                            onClick={() => onActionClick({
                                id: action.id,
                                name: action.name,
                                cost: action.cost,
                                description: action.description,
                                rawDescription: action.rawDescription,
                                traits: action.traits,
                                skill: action.skill,
                            })}
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
