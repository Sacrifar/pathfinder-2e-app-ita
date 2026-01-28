import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { getFeats, LoadedFeat, cleanDescriptionForDisplay } from '../../data/pf2e-loader';
import { CharacterFeat, Character } from '../../types';
import { checkPrerequisites, extractSkillFromPrerequisites } from '../../utils/prereqValidator';
import { skills as allSkills, getAncestryById, getClassById, heritages } from '../../data';
import { FeatActionIcon } from '../../utils/actionIcons';
import { getKineticistElementFromGateId } from '../../data/classSpecializations';
import { parseFeatChoices, getChoiceOptions, getChoiceDisplayValue, FeatChoice, parseGrantedItems } from '../../utils/featChoices';
import {
    getActiveDedicationConstraint,
    canSelectFeatWithDedicationConstraint,
    isArchetypeDedication,
    isFeatOfArchetype,
    getArchetypeNameFromDedication
} from '../../utils/archetypeDedication';
import { calculateDedicationAdditionalChoices } from '../../utils/dedicationAnalyzer';

type FeatCategory = 'all' | 'ancestry' | 'class' | 'skill' | 'general' | 'archetype';

// Helper to check if a feat can be selected multiple times
const isRepeatable = (feat: LoadedFeat): boolean => {
    const description = feat.description.toLowerCase();
    const repeatablePhrases = [
        'can be selected more than once',
        'can select this feat more than once',
        'you can take this feat multiple times',
        'you can select this feat multiple times',
        'special you can take',
        'special you can select',
        'puoi selezionare questo talento più volte',
        'può essere selezionato più volte',
        'puoi prendere questo talento più volte',
    ];
    return repeatablePhrases.some(phrase => description.includes(phrase));
};

interface FeatBrowserProps {
    onClose: () => void;
    onSelect: (
        feat: LoadedFeat,
        source: CharacterFeat['source'],
        choices?: Record<string, string>,
        grantedItems?: Array<{ uuid: string; type: string }>
    ) => void;
    onRemove?: (featId: string) => void; // Optional callback for removing a feat
    filterCategory?: 'ancestry' | 'class' | 'skill' | 'general'; // Pre-filter by category
    characterLevel?: number;
    ancestryId?: string; // For filtering ancestry-specific feats
    heritageId?: string; // For filtering heritage-specific feats (versatile heritages)
    classId?: string; // For filtering class-specific feats
    character?: Character; // For prerequisite validation
    skillFilter?: string; // For filtering skill feats by skill
    archetypeOnly?: boolean; // When true, show only archetype feats (class category feats with archetype trait)
}

export const FeatBrowser: React.FC<FeatBrowserProps> = ({
    onClose,
    onSelect,
    onRemove,
    filterCategory,
    characterLevel = 20,
    ancestryId,
    heritageId,
    classId,
    character,
    skillFilter,
    archetypeOnly,
}) => {
    const { t, language } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<FeatCategory>(filterCategory || 'all');
    const [levelFilter, setLevelFilter] = useState<number | null>(null);
    const [selectedFeat, setSelectedFeat] = useState<LoadedFeat | null>(null);
    const [hideUnavailable, setHideUnavailable] = useState(false);
    const [selectedSkillFilter, setSelectedSkillFilter] = useState<string | null>(skillFilter || null);
    const [featChoices, setFeatChoices] = useState<Record<string, string>>({}); // featId -> selected choice(s)

    // Load all feats
    const allFeats = useMemo(() => getFeats(), []);

    // Get IDs of feats already owned by the character
    const ownedFeatIds = useMemo(() => {
        if (!character?.feats) return new Set<string>();
        return new Set(character.feats.map(f => f.featId));
    }, [character?.feats]);

    // Get available levels up to character level
    const availableLevels = useMemo(() => {
        const levels = new Set(allFeats.filter(f => f.level <= characterLevel).map(f => f.level));
        return Array.from(levels).sort((a, b) => a - b);
    }, [allFeats, characterLevel]);

    // Parse choices for selected feat
    const selectedFeatChoices = useMemo((): FeatChoice[] => {
        if (!selectedFeat) return [];
        const baseChoices = parseFeatChoices(selectedFeat);
        console.log(`[FeatBrowser] ${selectedFeat?.name || 'unknown'} base choices:`, baseChoices.map(c => ({ flag: c.flag, prompt: c.prompt, type: c.type })));

        // Filter choices by character level (for level-gated choices like spell scaling)
        const levelFilteredChoices = baseChoices.filter(choice => {
            // If no minLevel specified, always show
            if (choice.minLevel === undefined) return true;
            // Only show if character level >= minLevel
            return characterLevel >= choice.minLevel;
        });

        // For archetype dedication feats, also calculate additional conditional choices
        // (e.g., "if already trained in X, gain additional skill choice")
        if (character && selectedFeat.traits.includes('archetype') && selectedFeat.traits.includes('dedication')) {
            const additionalChoices = calculateDedicationAdditionalChoices(selectedFeat, character);
            console.log(`[FeatBrowser] ${selectedFeat.name} has ${additionalChoices.length} additional choices`, additionalChoices.map(c => ({ flag: c.flag, prompt: c.prompt, type: c.type })));
            const merged = [...levelFilteredChoices, ...additionalChoices];
            console.log(`[FeatBrowser] ${selectedFeat.name} total choices:`, merged.map(c => ({ flag: c.flag, prompt: c.prompt, type: c.type })));
            return merged;
        }

        return levelFilteredChoices;
    }, [selectedFeat, character, characterLevel]);

    // Parse granted items for selected feat
    const grantedItems = useMemo(() => {
        if (!selectedFeat) return [];
        return parseGrantedItems(selectedFeat);
    }, [selectedFeat]);

    // Get active archetype dedication constraint
    const activeDedicationConstraint = useMemo(() => {
        if (character && archetypeOnly) {
            return getActiveDedicationConstraint(character);
        }
        return null;
    }, [character, archetypeOnly]);

    // Reset choices when selected feat changes
    useEffect(() => {
        resetChoices();
    }, [selectedFeat?.id]);

    // Filter feats
    const filteredFeats = useMemo(() => {
        let feats = allFeats.filter(f => {
            // When there's an active dedication constraint, allow showing all feats from that archetype
            // even if they're above character level (so user can see what's available for future levels)
            if (activeDedicationConstraint) {
                if (isFeatOfArchetype(f, activeDedicationConstraint.archetypeName)) {
                    return true;
                }
            }

            // Standard filter: only show feats at or below character level
            return f.level <= characterLevel;
        });

        // Filter by category
        if (categoryFilter !== 'all') {
            feats = feats.filter(f => f.category === categoryFilter);
        }

        // Additional filtering for ancestry/class specific feats
        if (categoryFilter === 'ancestry' && ancestryId) {
            // Get the ancestry name from ID
            const ancestry = getAncestryById(ancestryId);
            if (!ancestry) {
                // If ancestry not found, show no feats
                feats = [];
            } else {
                const ancestryName = ancestry.name?.toLowerCase() || ancestryId.toLowerCase();

                // Get heritage traits if a versatile heritage is selected
                let heritageTraits: string[] = [];
                if (heritageId) {
                    const heritage = heritages.find(h => h.id === heritageId);
                    if (heritage) {
                        // For versatile heritages, use the heritage name as a trait
                        // For example: "Changeling" heritage gives access to feats with "Changeling" trait
                        heritageTraits = [heritage.name.toLowerCase()];
                        // Also add any other traits the heritage might have
                        heritageTraits.push(...heritage.traits.map(t => t.toLowerCase()));
                    }
                }

                // Filter by ancestry trait OR heritage traits
                // This shows feats with the selected ancestry trait OR the selected heritage's traits
                feats = feats.filter(f => {
                    const featTraits = f.traits.map(t => t.toLowerCase());

                    // Check if feat has the selected ancestry as a trait
                    const hasAncestryTrait = featTraits.includes(ancestryName);

                    // Check if feat has any of the heritage traits
                    const hasHeritageTrait = heritageTraits.length > 0 &&
                        heritageTraits.some(trait => featTraits.includes(trait));

                    return hasAncestryTrait || hasHeritageTrait;
                });
            }
        }

        if (categoryFilter === 'class' && classId) {
            // Get the class name from ID
            const cls = getClassById(classId);
            if (!cls) {
                // If class not found, show no feats
                feats = [];
            } else {
                const className = cls.name?.toLowerCase() || classId.toLowerCase();

                // Filter by class trait - show ONLY feats with matching trait
                // This excludes feats with other class traits and generic feats without specific class traits
                feats = feats.filter(f => {
                    // Check if feat has the selected class as a trait
                    return f.traits.some(t => t.toLowerCase() === className);
                });

                // For Kineticist, additionally filter by impulse element
                if (cls.name === 'Kineticist' && character?.classSpecializationId) {
                    const gateIds = Array.isArray(character.classSpecializationId)
                        ? character.classSpecializationId
                        : [character.classSpecializationId];

                    const elements = gateIds
                        .map(gateId => getKineticistElementFromGateId(gateId))
                        .filter((e): e is string => e !== null);

                    // Also include elements from Fork the Path choices
                    if (character.kineticistJunctions) {
                        Object.values(character.kineticistJunctions).forEach((junctionData: any) => {
                            if (junctionData.choice === 'fork_the_path' && junctionData.newElementGateId) {
                                const element = getKineticistElementFromGateId(junctionData.newElementGateId);
                                if (element && !elements.includes(element)) {
                                    elements.push(element);
                                }
                            }
                        });
                    }

                    // Filter impulse feats to only show those matching the character's elements
                    if (elements.length > 0) {
                        feats = feats.filter(f => {
                            const hasImpulse = f.traits.some(t => t.toLowerCase() === 'impulse');

                            // Check for "two or more kinetic elements" prerequisite
                            const hasMultiElementPrereq = f.prerequisites.some(p =>
                                p.toLowerCase().includes('two or more kinetic elements') ||
                                p.toLowerCase().includes('two or more elements')
                            );

                            // If feat requires multiple elements, hide it for single gate
                            if (hasMultiElementPrereq && elements.length < 2) {
                                return false;
                            }

                            // If it's an impulse feat, check element requirements
                            if (hasImpulse) {
                                // Define all possible Kineticist elements
                                const kineticistElements = ['air', 'earth', 'fire', 'metal', 'water', 'wood'];

                                // Find which elemental traits this feat has
                                const featElements = f.traits.filter(t => kineticistElements.includes(t));

                                // If feat has no elemental traits, show it (generic impulse)
                                if (featElements.length === 0) {
                                    return true;
                                }

                                // If feat has elemental traits, character must have ALL of them
                                // For example: if feat requires ["air", "fire"], character must have both
                                return featElements.every(elem => elements.includes(elem));
                            }
                            // Non-impulse class feats are still shown (unless they have multi-element prereq)
                            return true;
                        });
                    }
                }
            }
        }

        // Archetype-only mode: show only feats with the "archetype" trait
        // This is used for Free Archetype variant rule
        if (categoryFilter === 'class' && !classId && archetypeOnly) {
            feats = feats.filter(f => {
                // Show only class-category feats that have the "archetype" trait
                return f.traits.some(t => t.toLowerCase() === 'archetype');
            });
        }

        // Filter by level
        if (levelFilter !== null) {
            feats = feats.filter(f => f.level === levelFilter);
        }

        // Filter by search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            feats = feats.filter(f =>
                f.name.toLowerCase().includes(q) ||
                f.traits.some(t => t.toLowerCase().includes(q)) ||
                f.prerequisites.some(p => p.toLowerCase().includes(q))
            );
        }

        // Filter skill feats by specific skill
        if ((categoryFilter === 'skill' || filterCategory === 'skill') && selectedSkillFilter) {
            feats = feats.filter(f => {
                const skillReq = extractSkillFromPrerequisites(f.prerequisites);
                return skillReq === selectedSkillFilter.toLowerCase();
            });
        }

        // Filter out unavailable feats if option enabled
        // BUT: When there's an active dedication constraint, allow showing other feats from that archetype
        if (hideUnavailable && character) {
            feats = feats.filter(f => {
                // If this feat belongs to the active archetype constraint, always allow it
                if (activeDedicationConstraint) {
                    // Always allow the dedication feat itself (for replacement)
                    if (isArchetypeDedication(f)) {
                        const featArchName = getArchetypeNameFromDedication(f.name);
                        if (featArchName === activeDedicationConstraint.archetypeName) {
                            return true;
                        }
                    }

                    // Always allow other feats from the constrained archetype
                    // (even if they don't meet prerequisites yet - user wants to see what's available)
                    if (isFeatOfArchetype(f, activeDedicationConstraint.archetypeName)) {
                        return true;
                    }
                }

                // Standard filter: hide if prerequisites not met
                return checkPrerequisites(f, character).met;
            });
        }

        // Filter out already-owned non-repeatable feats
        if (hideUnavailable && ownedFeatIds.size > 0) {
            feats = feats.filter(f => {
                // If this feat belongs to the active archetype constraint, allow it
                if (activeDedicationConstraint) {
                    // Always allow the dedication feat itself (for replacement)
                    if (isArchetypeDedication(f)) {
                        const featArchName = getArchetypeNameFromDedication(f.name);
                        if (featArchName === activeDedicationConstraint.archetypeName) {
                            return true;
                        }
                    }

                    // Always allow other feats from the constrained archetype
                    if (isFeatOfArchetype(f, activeDedicationConstraint.archetypeName)) {
                        return true;
                    }
                }

                // Standard filter: hide if already owned and not repeatable
                return !ownedFeatIds.has(f.id) || isRepeatable(f);
            });
        }

        // Apply archetype dedication constraint
        // When an archetype dedication is active, only show archetype feats from that archetype
        if (activeDedicationConstraint) {
            feats = feats.filter(f => {
                // Apply the constraint to ALL feats in archetype-only mode
                const checkResult = canSelectFeatWithDedicationConstraint(
                    character!,
                    f,
                    characterLevel
                );
                return checkResult.allowed;
            });
        }

        // Sort: eligible feats first, then alphabetically
        feats.sort((a, b) => {
            // Check if both feats meet prerequisites
            const aMet = character ? checkPrerequisites(a, character).met : true;
            const bMet = character ? checkPrerequisites(b, character).met : true;

            // If one meets prerequisites and the other doesn't, prioritize the one that does
            if (aMet && !bMet) return -1;
            if (!aMet && bMet) return 1;

            // If both or neither meet prerequisites, sort alphabetically
            return a.name.localeCompare(b.name);
        });

        return feats.slice(0, 100);
    }, [allFeats, categoryFilter, levelFilter, searchQuery, characterLevel, ancestryId, heritageId, classId, selectedSkillFilter, hideUnavailable, ownedFeatIds, character, activeDedicationConstraint]);

    const getCategoryColor = (category: string): string => {
        switch (category) {
            case 'ancestry': return 'var(--desktop-accent-orange)';
            case 'class': return 'var(--desktop-accent-red)';
            case 'general': return 'var(--desktop-text-secondary)';
            case 'skill': return 'var(--desktop-accent-blue)';
            case 'archetype': return 'var(--desktop-accent-purple, #9b59b6)';
            default: return 'var(--desktop-accent-green)';
        }
    };

    const handleSelectFeat = () => {
        if (selectedFeat) {
            let source: CharacterFeat['source'] = 'bonus';
            if (selectedFeat.category === 'ancestry') source = 'ancestry';
            else if (selectedFeat.category === 'class') source = 'class';
            else if (selectedFeat.category === 'general') source = 'general';
            else if (selectedFeat.category === 'skill') source = 'skill';

            // Check if feat has choices and if all required choices are made
            if (selectedFeatChoices.length > 0) {
                const choiceValues = Object.values(featChoices);
                if (choiceValues.length !== selectedFeatChoices.length || choiceValues.some(v => !v)) {
                    // Not all choices made
                    return;
                }
            }

            // Check if feat level is appropriate for character level
            // (Even though we show higher-level feats for planning, they can't be selected)
            if (selectedFeat.level > characterLevel) {
                console.warn(`Cannot select feat of level ${selectedFeat.level} at character level ${characterLevel}`);
                return;
            }

            // Check archetype dedication constraint (for archetype feats)
            if (activeDedicationConstraint) {
                const constraintCheck = canSelectFeatWithDedicationConstraint(
                    character!,
                    selectedFeat,
                    characterLevel
                );
                if (!constraintCheck.allowed) {
                    // This should not happen due to filtering, but adds extra safety
                    console.warn('Feat selection blocked by dedication constraint:', constraintCheck.reason);
                    return;
                }
            }

            // Pass the choices and granted items to onSelect
            onSelect(selectedFeat, source, featChoices, grantedItems);
        }
    };

    const resetChoices = () => {
        setFeatChoices({});
    };

    const isAllChoicesMade = (): boolean => {
        if (selectedFeatChoices.length === 0) return true;
        const choiceValues = Object.values(featChoices);
        return choiceValues.length === selectedFeatChoices.length && choiceValues.every(v => v);
    };

    const handleRemoveFeat = () => {
        if (selectedFeat && onRemove && ownedFeatIds.has(selectedFeat.id)) {
            onRemove(selectedFeat.id);
            onClose();
        }
    };

    // Check if selected feat can be removed (owned and onRemove callback provided)
    const canRemoveSelectedFeat = selectedFeat && onRemove && ownedFeatIds.has(selectedFeat.id);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="selection-modal feat-browser-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        {filterCategory === 'ancestry'
                            ? t('builder.ancestryFeat') || 'Ancestry Feat'
                            : filterCategory === 'class' && archetypeOnly
                                ? t('builder.archetypeFeat') || 'Archetype Feat'
                                : filterCategory === 'class'
                                    ? t('builder.classFeat') || 'Class Feat'
                                    : t('browser.feats') || 'Feat Browser'}
                    </h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="browser-filters">
                    <input
                        type="text"
                        placeholder={t('search.placeholder') || 'Search feats...'}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="browser-search"
                    />
                    <div className="filter-row">
                        {!filterCategory && (
                            <div className="category-filters">
                                {(['all', 'ancestry', 'class', 'skill', 'general'] as const).map(cat => (
                                    <button
                                        key={cat}
                                        className={`filter-btn ${categoryFilter === cat ? 'active' : ''}`}
                                        onClick={() => setCategoryFilter(cat)}
                                    >
                                        {cat === 'all' ? t('filters.all') || 'All' : cat}
                                    </button>
                                ))}
                            </div>
                        )}
                        <select
                            className="level-filter"
                            value={levelFilter ?? ''}
                            onChange={e => setLevelFilter(e.target.value ? Number(e.target.value) : null)}
                        >
                            <option value="">{t('filters.allLevels') || 'All Levels'}</option>
                            {availableLevels.map(level => (
                                <option key={level} value={level}>
                                    {t('filters.level') || 'Level'} {level}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Skill filter for skill feats */}
                    {(categoryFilter === 'skill' || filterCategory === 'skill') && (
                        <div className="filter-row">
                            <select
                                className="skill-filter"
                                value={selectedSkillFilter ?? ''}
                                onChange={e => setSelectedSkillFilter(e.target.value || null)}
                            >
                                <option value="">{t('filters.allSkills') || 'All Skills'}</option>
                                {allSkills.map(skill => (
                                    <option key={skill.id} value={skill.name.toLowerCase()}>
                                        {language === 'it' ? (skill.nameIt || skill.name) : skill.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Hide unavailable toggle */}
                    {character && (
                        <label className="filter-checkbox">
                            <input
                                type="checkbox"
                                checked={hideUnavailable}
                                onChange={e => setHideUnavailable(e.target.checked)}
                            />
                            {t('filters.hideUnavailable') || 'Hide unavailable'}
                        </label>
                    )}
                </div>

                {/* Archetype Dedication Constraint Warning */}
                {activeDedicationConstraint && (
                    <div style={{
                        padding: '12px 16px',
                        margin: '0 16px 16px 16px',
                        background: 'rgba(155, 89, 182, 0.1)',
                        border: '1px solid var(--desktop-accent-purple, #9b59b6)',
                        borderRadius: '4px',
                        fontSize: '14px',
                        color: 'var(--desktop-text-primary, #fff)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '18px' }}>🔒</span>
                            <div>
                                <strong>{t('feats.dedicationConstraint') || 'Archetype Dedication Constraint'}</strong>
                                <div style={{ marginTop: '4px', fontSize: '13px', opacity: 0.9 }}>
                                    {t('feats.dedicationConstraintDescription') || `You must take ${activeDedicationConstraint.remainingFeatsNeeded} more ${activeDedicationConstraint.archetypeName} feat${activeDedicationConstraint.remainingFeatsNeeded > 1 ? 's' : ''} before selecting feats from other archetypes.`}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="browser-content">
                    <div className="browser-list">
                        {filteredFeats.length === 0 ? (
                            <div className="no-results">
                                {t('search.noResults') || 'No feats found.'}
                            </div>
                        ) : (
                            filteredFeats.map(feat => {
                                const prereqResult = character ? checkPrerequisites(feat, character) : { met: true, reasons: [] };
                                const isOwned = ownedFeatIds.has(feat.id);
                                const canSelectAgain = isOwned && isRepeatable(feat);
                                const isTooHighLevel = feat.level > characterLevel;

                                return (
                                    <div
                                        key={feat.id}
                                        className={`browser-item ${selectedFeat?.id === feat.id ? 'selected' : ''} ${!prereqResult.met ? 'prereq-unmet' : ''} ${isOwned && !canSelectAgain ? 'already-owned' : ''} ${isTooHighLevel ? 'level-too-high' : ''}`}
                                        onClick={() => setSelectedFeat(feat)}
                                    >
                                        <div className="item-header">
                                            <span className="item-name">
                                                {isTooHighLevel && <span className="level-warning">🔒</span>}
                                                {!prereqResult.met && !isTooHighLevel && <span className="prereq-warning">⚠️</span>}
                                                {feat.name}
                                            </span>
                                            <span className="item-action">
                                                <FeatActionIcon actionType={feat.actionType} actionCost={feat.actionCost} />
                                            </span>
                                        </div>
                                        <div className="item-meta">
                                            <span className="item-level">Lv {feat.level}</span>
                                            <span
                                                className="item-category"
                                                style={{ color: getCategoryColor(feat.category) }}
                                            >
                                                {feat.category}
                                            </span>
                                            {feat.rarity !== 'common' && (
                                                <span className={`item-rarity rarity-${feat.rarity}`}>
                                                    {feat.rarity}
                                                </span>
                                            )}
                                            {isTooHighLevel && (
                                                <span className="item-level-warning">
                                                    {t('feats.levelTooHigh') || `Richiede Lv ${feat.level}`}
                                                </span>
                                            )}
                                            {isOwned && (
                                                <span className={`item-owned ${canSelectAgain ? 'repeatable' : ''}`}>
                                                    {canSelectAgain
                                                        ? (t('feats.alreadySelectedRepeatable') || '✓ Selezionato (ripetibile)')
                                                        : (t('feats.alreadySelected') || '✓ Già selezionato')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {selectedFeat && (
                        <div className="browser-detail">
                            <div className="detail-header">
                                <h3>{selectedFeat.name}</h3>
                                <span className="detail-action">
                                    <FeatActionIcon actionType={selectedFeat.actionType} actionCost={selectedFeat.actionCost} />
                                </span>
                            </div>

                            <div className="detail-meta">
                                <span className="detail-level">Level {selectedFeat.level}</span>
                                <span
                                    className="detail-category"
                                    style={{ color: getCategoryColor(selectedFeat.category) }}
                                >
                                    {selectedFeat.category}
                                </span>
                                {selectedFeat.rarity !== 'common' && (
                                    <span className={`detail-rarity rarity-${selectedFeat.rarity}`}>
                                        {selectedFeat.rarity}
                                    </span>
                                )}
                            </div>

                            {selectedFeat.traits.length > 0 && (
                                <div className="detail-traits">
                                    {selectedFeat.traits.map(trait => (
                                        <span key={trait} className="trait-tag">{trait}</span>
                                    ))}
                                </div>
                            )}

                            {selectedFeat.prerequisites.length > 0 && (
                                <div className="detail-prereqs">
                                    <strong>{t('feats.prerequisites') || 'Prerequisites'}:</strong>{' '}
                                    {selectedFeat.prerequisites.join('; ')}
                                </div>
                            )}

                            <p className="detail-description">{cleanDescriptionForDisplay(selectedFeat.rawDescription || selectedFeat.description)}</p>

                            {/* Granted Feats Section */}
                            {grantedItems.length > 0 && (
                                <div className="granted-items-section">
                                    <h4>{t('feats.grantedItems') || 'Granted Feats'}</h4>
                                    {grantedItems.map((item, index) => {
                                        // Extract feat name from UUID
                                        const featName = item.uuid.split('.').pop()?.replace(/Item\./, '').replace(/-/g, ' ')
                                            .replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown Feat';

                                        return (
                                            <div key={index} className="granted-item">
                                                <span className="granted-item-name">{featName}</span>
                                                <span className="granted-item-type">{item.type}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Feat Choices Section */}
                            {selectedFeatChoices.length > 0 && (
                                <div className="feat-choices-section">
                                    <h4>{t('feats.makeChoices') || 'Make Your Choices'}</h4>
                                    {selectedFeatChoices.map((choice, index) => {
                                        const choiceKey = `${selectedFeat.id}_${choice.flag}_${index}`;
                                        const selectedValue = featChoices[choiceKey];

                                        // Build previous choices map for filtering later choices
                                        const previousChoices: Record<string, string> = {};
                                        selectedFeatChoices.slice(0, index).forEach((prevChoice, prevIndex) => {
                                            const prevChoiceKey = `${selectedFeat.id}_${prevChoice.flag}_${prevIndex}`;
                                            const prevValue = featChoices[prevChoiceKey];
                                            if (prevValue) {
                                                previousChoices[prevChoice.flag] = prevValue;
                                            }
                                        });

                                        const options = getChoiceOptions(choice, character, previousChoices);

                                        // For feat choices with many options (like skill feats), use a searchable list
                                        const useSearchableList = choice.type === 'feat' && options.length > 20;

                                        return (
                                            <div key={choiceKey} className="feat-choice">
                                                <label className="choice-label">
                                                    {choice.prompt.replace('PF2E.SpecificRule.', '').replace(/([A-Z])/g, ' $1').trim()}
                                                </label>
                                                {useSearchableList ? (
                                                    <SearchableFeatChoice
                                                        options={options}
                                                        choice={choice}
                                                        selectedValue={selectedValue}
                                                        character={character}
                                                        previousChoices={previousChoices}
                                                        selectedFeat={selectedFeat}
                                                        onSelect={(value) => {
                                                            setFeatChoices(prev => ({
                                                                ...prev,
                                                                [choiceKey]: value
                                                            }));
                                                        }}
                                                    />
                                                ) : (
                                                    <select
                                                        className="choice-select"
                                                        value={selectedValue || ''}
                                                        onChange={(e) => {
                                                            setFeatChoices(prev => ({
                                                                ...prev,
                                                                [choiceKey]: e.target.value
                                                            }));
                                                        }}
                                                    >
                                                        <option key="placeholder" value="">{t('actions.select') || 'Select...'}</option>
                                                        {options.map(option => (
                                                            <option key={option} value={option}>
                                                                {getChoiceDisplayValue(option, choice)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="modal-btn modal-btn-secondary" onClick={onClose}>
                        {t('actions.cancel')}
                    </button>
                    {canRemoveSelectedFeat && (
                        <button
                            className="modal-btn"
                            style={{ background: 'var(--desktop-accent-red, #e74c3c)', color: 'white' }}
                            onClick={handleRemoveFeat}
                        >
                            {t('actions.remove') || 'Remove'}
                        </button>
                    )}
                    <button
                        className="modal-btn modal-btn-primary"
                        onClick={handleSelectFeat}
                        disabled={
                            !selectedFeat ||
                            (ownedFeatIds.has(selectedFeat.id) && !isRepeatable(selectedFeat)) ||
                            (character && !checkPrerequisites(selectedFeat, character).met) ||
                            !isAllChoicesMade()
                        }
                    >
                        {t('actions.select')}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Component for searchable feat choice (for lists with many options like skill feats)
interface SearchableFeatChoiceProps {
    options: string[];
    choice: FeatChoice;
    selectedValue: string | undefined;
    character?: Character;
    previousChoices: Record<string, string>;
    selectedFeat: LoadedFeat | null;
    onSelect: (value: string) => void;
}

const SearchableFeatChoice: React.FC<SearchableFeatChoiceProps> = ({
    options,
    choice,
    selectedValue,
    character,
    previousChoices,
    selectedFeat,
    onSelect
}) => {
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    const allFeats = getFeats();
    const selectedFeatData = selectedValue ? allFeats.find(f => f.id === selectedValue) : null;

    // Create a virtual character with Skill Mastery skill upgrades applied for prerequisite checking
    const virtualCharacter = useMemo(() => {
        if (!character || !selectedFeat) return character;

        // Check if this is Skill Mastery feat
        const isSkillMastery = selectedFeat.id === 'c9rhGmKft1BVT4JO' || selectedFeat.name.includes('Skill Mastery');
        if (!isSkillMastery) return character;

        // Create a copy of character with updated skill proficiencies
        const updated = { ...character, skills: [...(character.skills || [])] };

        // Apply skillMaster (upgrade to master)
        if (previousChoices.skillMaster) {
            const skillName = previousChoices.skillMaster;
            const skillIndex = updated.skills.findIndex(s =>
                s.name.toLowerCase() === skillName.toLowerCase()
            );
            if (skillIndex >= 0) {
                updated.skills[skillIndex] = { ...updated.skills[skillIndex], proficiency: 'master' };
            }
        }

        // Apply skillExpert (upgrade to expert)
        if (previousChoices.skillExpert) {
            const skillName = previousChoices.skillExpert;
            const skillIndex = updated.skills.findIndex(s =>
                s.name.toLowerCase() === skillName.toLowerCase()
            );
            if (skillIndex >= 0) {
                // Only upgrade to expert if not already master or higher
                const profOrder = ['untrained', 'trained', 'expert', 'master', 'legendary'];
                const currentIdx = profOrder.indexOf(updated.skills[skillIndex].proficiency);
                if (currentIdx < 2) {
                    updated.skills[skillIndex] = { ...updated.skills[skillIndex], proficiency: 'expert' };
                }
            }
        }

        return updated;
    }, [character, selectedFeat, previousChoices]);

    // Filter options based on search query AND prerequisites
    const filteredOptions = useMemo(() => {
        let filtered = options;

        // First filter by search query if provided
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(option => {
                const displayValue = getChoiceDisplayValue(option, choice).toLowerCase();
                return displayValue.includes(query);
            });
        }

        // For skill feats, also filter by prerequisites using virtual character
        if (choice.type === 'feat' && choice.filter?.category === 'skill' && virtualCharacter) {
            filtered = filtered.filter(option => {
                const feat = allFeats.find(f => f.id === option);
                if (!feat) return true; // Keep if feat not found

                // Check prerequisites against virtual character
                const prereqCheck = checkPrerequisites(feat, virtualCharacter);
                return prereqCheck.met;
            });
        }

        return filtered;
    }, [options, searchQuery, choice, virtualCharacter]);

    return (
        <div className="searchable-feat-choice">
            {/* Selected value display with expand button */}
            <div className="selected-feat-display" onClick={() => setIsExpanded(!isExpanded)}>
                {selectedFeatData ? (
                    <span className="selected-feat-name">{selectedFeatData.name}</span>
                ) : (
                    <span className="selected-feat-placeholder">{t('actions.select') || 'Select...'}</span>
                )}
                <span className="expand-arrow">{isExpanded ? '▲' : '▼'}</span>
            </div>

            {/* Searchable dropdown */}
            {isExpanded && (
                <div className="feat-choice-dropdown">
                    <input
                        type="text"
                        className="feat-choice-search"
                        placeholder={t('search.placeholder') || 'Search...'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                    />
                    <div className="feat-choice-options">
                        {filteredOptions.length === 0 ? (
                            <div className="no-results">{t('search.noResults') || 'No results'}</div>
                        ) : (
                            filteredOptions.map(option => {
                                const feat = allFeats.find(f => f.id === option);
                                if (!feat) return null;
                                return (
                                    <div
                                        key={option}
                                        className={`feat-choice-option ${selectedValue === option ? 'selected' : ''}`}
                                        onClick={() => {
                                            onSelect(option);
                                            setIsExpanded(false);
                                            setSearchQuery('');
                                        }}
                                    >
                                        <div className="feat-option-name">{feat.name}</div>
                                        <div className="feat-option-meta">
                                            <span className="feat-option-level">Lv {feat.level}</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeatBrowser;
