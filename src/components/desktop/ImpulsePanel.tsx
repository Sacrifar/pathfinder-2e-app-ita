import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Character, CharacterFeat } from '../../types';
import { getFeats, getActions, LoadedAction, LoadedFeat } from '../../data/pf2e-loader';
import { getKineticistElementFromGateId } from '../../data/classSpecializations';
import { ActionIcon } from '../../utils/actionIcons';

interface ImpulsePanelProps {
    character: Character;
}

interface ElementalBlastEntry {
    action: LoadedAction;
    oneActionVersion: LoadedAction | null;
    twoActionVersion: LoadedAction | null;
    element: string;
}

interface ImpulseFeatEntry {
    feat: CharacterFeat;
    data: LoadedFeat;
    elements: string[];
}

export const ImpulsePanel: React.FC<ImpulsePanelProps> = ({ character }) => {
    const { t } = useLanguage();
    const [selectedBlastMode, setSelectedBlastMode] = useState<Record<string, 'one' | 'two'>>({});
    const [selectedImpulse, setSelectedImpulse] = useState<ImpulseFeatEntry | null>(null);
    const [selectedBlast, setSelectedBlast] = useState<ElementalBlastEntry | null>(null);

    // Load all data
    const allFeats = useMemo(() => getFeats(), []);
    const allActions = useMemo(() => getActions(), []);

    // Get character's kineticist elements (from gates)
    const characterElements = useMemo(() => {
        if (!character.classSpecializationId) return [];

        const gates = Array.isArray(character.classSpecializationId)
            ? character.classSpecializationId
            : [character.classSpecializationId];

        return gates.map(gateId => getKineticistElementFromGateId(gateId)).filter(e => e) as string[];
    }, [character.classSpecializationId]);

    // Get ALL impulses for the character's elements
    // This includes both selected feats AND automatically granted impulses from class features
    // IMPORTANT: Only show impulses that are available at the character's CURRENT level
    const impulseFeats = useMemo(() => {
        const impulses: ImpulseFeatEntry[] = [];
        const currentLevel = character.level || 1;

        // First, get all impulse feats from character.feats (manually selected)
        const selectedFeatIds = new Set<string>();

        for (const feat of character.feats) {
            // Filter out feats that are above the character's current level
            // This ensures that when leveling down, higher-level impulses are hidden
            if (feat.level > currentLevel) continue;

            // Include class impulses, archetype impulses (for dedication), and explicit impulse slot type
            const isFromClassFeat = feat.source === 'class' || feat.source === 'general';
            const isFromArchetypeSlot = feat.slotType === 'archetype';
            const isFromImpulseSlot = feat.slotType === 'impulse';

            if (!isFromClassFeat && !isFromArchetypeSlot && !isFromImpulseSlot) continue;

            // Try to find by ID first, then by rawId (Foundry UUID), then by name as fallback
            let featData = allFeats.find(f => f.id === feat.featId);
            if (!featData) {
                // Fallback 1: try to find by rawId (Foundry UUID)
                featData = allFeats.find(f => f.rawId === feat.featId);
            }
            if (!featData) {
                // Fallback 2: try to find by name (exact match)
                featData = allFeats.find(f => f.name.toLowerCase() === feat.featId.toLowerCase());
            }
            if (!featData) {
                // Fallback 3: try fuzzy name matching (for UUIDs that don't match)
                // This handles cases where featId is a UUID and we need to match by name
                const featIdLower = feat.featId.toLowerCase();
                featData = allFeats.find(f => {
                    const nameLower = f.name.toLowerCase();
                    const idFromName = nameLower.replace(/\s+/g, '-');
                    return idFromName === featIdLower ||
                        nameLower === featIdLower ||
                        nameLower.includes(featIdLower) ||
                        featIdLower.includes(nameLower.replace(/\s+/g, ''));
                });
            }
            if (!featData) continue;

            // Track selected feat IDs
            selectedFeatIds.add(featData.id);
            if (featData.rawId) selectedFeatIds.add(featData.rawId);

            // Check if this feat is an impulse (by trait or by slotType)
            const isImpulse = featData.traits.includes('impulse') || feat.slotType === 'impulse';
            if (!isImpulse) continue;

            // Debug: log impulse found
            console.log('[ImpulsePanel] Found impulse:', featData.name, 'featId:', feat.featId, 'matched ID:', featData.id);

            // Extract elements from traits
            const elementTraits = featData.traits.filter(trait =>
                ['air', 'earth', 'fire', 'water', 'wood', 'metal', 'aether', 'void'].includes(trait)
            );

            // If no element trait found, group under "General" or use first character element
            const elements = elementTraits.length > 0 ? elementTraits : (characterElements[0] ? [characterElements[0]] : ['general']);

            impulses.push({
                feat,
                data: featData,
                elements
            });
        }

        // Second, add class actions that are impulses (e.g., Extract Element)
        // These are automatically granted to Kineticists at certain levels
        if (character.classId === 'RggQN3bX5SEcsffR') { // Kineticist class ID
            for (const action of allActions) {
                // Only include actions with the 'impulse' trait
                if (!action.traits.includes('impulse')) continue;

                // Skip base actions that are already shown separately
                if (action.name === 'Base Kinesis' ||
                    action.name === 'Channel Elements' ||
                    action.name === 'Elemental Blast') {
                    continue;
                }

                // Determine at what level this action becomes available
                // Extract Element is level 1, other class actions may have different levels
                let actionLevel = 1;
                if (action.name.toLowerCase().includes('extract element')) {
                    actionLevel = 1;
                }

                // Filter out actions that are above the character's current level
                if (actionLevel > currentLevel) continue;

                // Check if this action is already in the list (from feats)
                const actionId = action.id || action.name.toLowerCase();
                if (selectedFeatIds.has(actionId)) continue;

                // Extract elements from traits
                const elementTraits = action.traits.filter(trait =>
                    ['air', 'earth', 'fire', 'water', 'wood', 'metal', 'aether', 'void'].includes(trait)
                );

                // If no element trait found, group under "General" or use first character element
                const elements = elementTraits.length > 0 ? elementTraits : (characterElements[0] ? [characterElements[0]] : ['general']);

                // Create a synthetic feat entry for this action
                // Map LoadedAction fields to LoadedFeat format
                impulses.push({
                    feat: {
                        featId: action.id || action.name,
                        level: actionLevel,
                        source: 'class',
                        slotType: 'impulse',
                    },
                    data: {
                        id: action.id,
                        rawId: action.id,
                        name: action.name,
                        description: action.description,
                        traits: action.traits,
                        level: actionLevel,
                        category: 'class' as const,
                        actionType: action.cost === 'reaction' ? 'reaction' :
                            action.cost === 'free' ? 'free' : 'action',
                        actionCost: action.cost === '1' ? 1 :
                            action.cost === '2' ? 2 :
                                action.cost === '3' ? 3 : null,
                        prerequisites: [],
                        rarity: 'common',
                        rules: undefined,
                    } as LoadedFeat,
                    elements
                });
            }
        }

        return impulses;
    }, [character.feats, allFeats, characterElements, character.level, character.classId, allActions]);

    // Debug: log character data
    console.log('[ImpulsePanel] Character elements:', characterElements);
    console.log('[ImpulsePanel] Total character.feats:', character.feats.length);
    console.log('[ImpulsePanel] Impulse feats found:', impulseFeats.length);
    console.log('[ImpulsePanel] Impulse feats:', impulseFeats.map(i => i.data.name));

    // Group impulses by element
    const impulsesByElement = useMemo(() => {
        const groups: Record<string, ImpulseFeatEntry[]> = {};

        for (const impulse of impulseFeats) {
            for (const element of impulse.elements) {
                if (!groups[element]) {
                    groups[element] = [];
                }
                groups[element].push(impulse);
            }
        }

        return groups;
    }, [impulseFeats]);

    // Find base Kineticist actions (all Kineticists have these)
    const baseKineticistActions = useMemo(() => {
        const baseActions = allActions.filter(action =>
            action.name === 'Base Kinesis' ||
            action.name === 'Channel Elements'
        );

        // Find Elemental Blast action (single action that works for all elements)
        const elementalBlastAction = allActions.find(action =>
            action.name === 'Elemental Blast' ||
            action.name.toLowerCase().includes('elemental blast')
        );

        return { baseActions, elementalBlastAction };
    }, [allActions]);

    // Toggle blast mode between 1 and 2 actions
    const toggleBlastMode = (key: string) => {
        setSelectedBlastMode(prev => ({
            ...prev,
            [key]: prev[key] === 'one' ? 'two' : 'one'
        }));
    };

    // Get element color for styling
    const getElementColor = (element: string): string => {
        const colors: Record<string, string> = {
            air: '#87CEEB',
            earth: '#8B4513',
            fire: '#FF4500',
            water: '#1E90FF',
            wood: '#228B22',
            metal: '#C0C0C0',
            aether: '#9370DB',
            void: '#2F4F4F',
            general: '#888888',
        };
        return colors[element] || '#666';
    };

    // Get element icon
    const getElementIcon = (element: string): string => {
        const icons: Record<string, string> = {
            air: '💨',
            earth: '🪨',
            fire: '🔥',
            water: '💧',
            wood: '🌿',
            metal: '⚙️',
            aether: '✨',
            void: '🌑',
            general: '⚡',
        };
        return icons[element] || '⭐';
    };

    // Get action cost label
    const getActionCostLabel = (cost: string): string => {
        switch (cost) {
            case '1': return t('actions.oneAction') || '1 Action';
            case '2': return t('actions.twoActions') || '2 Actions';
            case '3': return t('actions.threeActions') || '3 Actions';
            case 'free': return t('actions.free') || 'Free';
            case 'reaction': return t('actions.reaction') || 'Reaction';
            default: return cost;
        }
    };

    // Strip HTML tags from description
    const stripHtml = (html: string): string => {
        return html
            .replace(/<[^>]*>/g, '')
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&')
            .replace(/&nbsp;/g, ' ')
            .replace(/&ldquo;/g, '"')
            .replace(/&rdquo;/g, '"')
            .replace(/&rsquo;/g, "'")
            .replace(/&#8217;/g, "'")
            .trim();
    };

    return (
        <div className="impulse-panel">
            <h3 className="panel-title">
                {t('tabs.impulse') || 'Impulses'}
            </h3>

            {/* Base Kineticist Actions Section */}
            {(baseKineticistActions.baseActions.length > 0 || baseKineticistActions.elementalBlastAction) && (
                <div className="impulse-section">
                    <h4 className="impulse-section-title">
                        {t('impulse.baseActions') || 'Base Actions'}
                    </h4>
                    <div className="impulse-grid">
                        {/* Base actions (Base Kinesis, Channel Elements) */}
                        {baseKineticistActions.baseActions.map((action) => (
                            <div
                                key={action.id}
                                className="impulse-card clickable"
                                style={{
                                    borderLeft: `4px solid #666`
                                }}
                                onClick={() => setSelectedBlast({
                                    action,
                                    oneActionVersion: action.cost === '1' ? action : null,
                                    twoActionVersion: action.cost === '2' ? action : null,
                                    element: 'general',
                                })}
                            >
                                <div className="impulse-header">
                                    <span className="impulse-element-icon">⚡</span>
                                    <span className="impulse-name">
                                        {action.name}
                                    </span>
                                </div>

                                <div className="impulse-cost">
                                    <ActionIcon cost={action.cost} />
                                    <span className="cost-label">{getActionCostLabel(action.cost)}</span>
                                </div>

                                <div className="impulse-traits">
                                    {action.traits.slice(0, 4).map(trait => (
                                        <span key={trait} className="trait-badge">
                                            {t(`traits.${trait}`) || trait}
                                        </span>
                                    ))}
                                    {action.traits.length > 4 && (
                                        <span className="trait-badge">
                                            +{action.traits.length - 4}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Elemental Blast - shows all character elements */}
                        {baseKineticistActions.elementalBlastAction && characterElements.map((element) => {
                            const blastKey = `elemental-blast-${element}`;
                            const currentMode = selectedBlastMode[blastKey] || 'one';

                            return (
                                <div
                                    key={blastKey}
                                    className="impulse-card blast-card clickable"
                                    style={{
                                        borderLeft: `4px solid ${getElementColor(element)}`
                                    }}
                                    onClick={() => setSelectedBlast({
                                        action: baseKineticistActions.elementalBlastAction!,
                                        oneActionVersion: baseKineticistActions.elementalBlastAction!,
                                        twoActionVersion: baseKineticistActions.elementalBlastAction!,
                                        element,
                                    })}
                                >
                                    <div className="impulse-header">
                                        <span className="impulse-element-icon">
                                            {getElementIcon(element)}
                                        </span>
                                        <span className="impulse-name">
                                            {baseKineticistActions.elementalBlastAction!.name}
                                        </span>
                                        <span className="impulse-element-badge">{element}</span>
                                    </div>

                                    <div className="impulse-cost">
                                        <span className={`blast-mode-btn ${currentMode === 'one' ? 'active' : ''}`}
                                            style={{ marginRight: '4px', fontSize: '12px', padding: '2px 6px' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleBlastMode(blastKey);
                                            }}>
                                            {t('actions.oneActionShort') || '1a'}
                                        </span>
                                        <span className={`blast-mode-btn ${currentMode === 'two' ? 'active' : ''}`}
                                            style={{ fontSize: '12px', padding: '2px 6px' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleBlastMode(blastKey);
                                            }}>
                                            {t('actions.twoActionsShort') || '2a'}
                                        </span>
                                    </div>

                                    <div className="impulse-traits">
                                        <span className="trait-badge">{element}</span>
                                        {baseKineticistActions.elementalBlastAction!.traits.slice(0, 3).map(trait => (
                                            <span key={trait} className="trait-badge">
                                                {t(`traits.${trait}`) || trait}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Impulses by Element */}
            {Object.keys(impulsesByElement).length > 0 && (
                <div className="impulse-section">
                    <h4 className="impulse-section-title">
                        {t('impulse.learnedImpulses') || 'Learned Impulses'}
                    </h4>
                    {Object.entries(impulsesByElement)
                        .sort(([, a], [, b]) => b.length - a.length)
                        .map(([element, impulses]) => (
                            <div key={element} className="element-group">
                                <div
                                    className="element-header"
                                    style={{ borderBottom: `2px solid ${getElementColor(element)}` }}
                                >
                                    <span className="element-icon">{getElementIcon(element)}</span>
                                    <span className="element-name">
                                        {t(`elements.${element}`) || element.charAt(0).toUpperCase() + element.slice(1)}
                                    </span>
                                    <span className="element-count">{impulses.length}</span>
                                </div>
                                <div className="impulse-grid">
                                    {impulses.map((impulse) => (
                                        <div
                                            key={impulse.feat.featId}
                                            className="impulse-card clickable"
                                            style={{
                                                borderLeft: `4px solid ${getElementColor(element)}`
                                            }}
                                            onClick={() => setSelectedImpulse(impulse)}
                                        >
                                            <div className="impulse-header">
                                                <span className="impulse-level">
                                                    {impulse.data.level}
                                                </span>
                                                <span className="impulse-name">
                                                    {impulse.data.name}
                                                </span>
                                            </div>

                                            <div className="impulse-cost">
                                                {impulse.data.altActionCosts && impulse.data.altActionCosts.length > 0 ? (
                                                    // Has alternative action costs (e.g., reaction OR 2-action)
                                                    <div className="multi-cost">
                                                        {impulse.data.actionType === 'reaction' && (
                                                            <span className="cost-option">
                                                                <ActionIcon cost="reaction" />
                                                                <span className="cost-label">{t('actions.reaction') || 'Reaction'}</span>
                                                            </span>
                                                        )}
                                                        {impulse.data.altActionCosts.map(cost => (
                                                            <span key={cost} className="cost-option">
                                                                <ActionIcon cost={String(cost) as '1' | '2' | '3'} />
                                                                <span className="cost-label">{getActionCostLabel(String(cost))}</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : impulse.data.actionType === 'passive' ? (
                                                    <span className="passive-badge">◈ {t('feat.passive') || 'Passive'}</span>
                                                ) : impulse.data.actionType === 'free' ? (
                                                    <>
                                                        <ActionIcon cost="free" />
                                                        <span className="cost-label">{t('actions.free') || 'Free'}</span>
                                                    </>
                                                ) : impulse.data.actionType === 'reaction' ? (
                                                    <>
                                                        <ActionIcon cost="reaction" />
                                                        <span className="cost-label">{t('actions.reaction') || 'Reaction'}</span>
                                                    </>
                                                ) : impulse.data.actionCost ? (
                                                    <>
                                                        <ActionIcon cost={String(impulse.data.actionCost) as '1' | '2' | '3'} />
                                                        <span className="cost-label">{getActionCostLabel(String(impulse.data.actionCost))}</span>
                                                    </>
                                                ) : (
                                                    <span className="passive-badge">◈ {t('feat.passive') || 'Passive'}</span>
                                                )}
                                            </div>

                                            <div className="impulse-traits">
                                                {impulse.data.traits.slice(0, 4).map(trait => (
                                                    <span key={trait} className="trait-badge">
                                                        {t(`traits.${trait}`) || trait}
                                                    </span>
                                                ))}
                                                {impulse.data.traits.length > 4 && (
                                                    <span className="trait-badge">
                                                        +{impulse.data.traits.length - 4}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {/* No impulses message */}
            {impulseFeats.length === 0 && baseKineticistActions.baseActions.length === 0 && !baseKineticistActions.elementalBlastAction && (
                <div className="empty-state">
                    <p>{t('impulse.noImpulses') || 'No impulses learned yet.'}</p>
                    <p className="empty-state-hint">
                        {t('impulse.noImpulsesHint') || 'Impulses are gained through class feats and gate thresholds.'}
                    </p>
                    {characterElements.length > 0 && (
                        <p className="empty-state-debug">
                            {t('impulse.debugElements') || 'Elements detected:'} {characterElements.join(', ')}
                        </p>
                    )}
                </div>
            )}

            {/* Impulse Detail Modal */}
            {(selectedImpulse || selectedBlast) && (
                <div className="modal-overlay" onClick={() => {
                    setSelectedImpulse(null);
                    setSelectedBlast(null);
                }}>
                    <div className="modal-content impulse-modal" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="modal-close"
                            onClick={() => {
                                setSelectedImpulse(null);
                                setSelectedBlast(null);
                            }}
                        >
                            ×
                        </button>

                        {selectedBlast && (
                            <>
                                <h2 className="modal-title">
                                    <span className="impulse-element-icon">
                                        {getElementIcon(selectedBlast.element)}
                                    </span>
                                    {selectedBlast.action.name}
                                </h2>

                                <div className="modal-meta">
                                    <span className="modal-element-badge" style={{
                                        background: getElementColor(selectedBlast.element)
                                    }}>
                                        {selectedBlast.element}
                                    </span>
                                    <div className="modal-cost">
                                        <ActionIcon cost={selectedBlast.action.cost} />
                                        <span>{getActionCostLabel(selectedBlast.action.cost)}</span>
                                    </div>
                                </div>

                                <div className="modal-traits">
                                    {selectedBlast.action.traits.map(trait => (
                                        <span key={trait} className="trait-badge">
                                            {t(`traits.${trait}`) || trait}
                                        </span>
                                    ))}
                                </div>

                                <div className="modal-description">
                                    {stripHtml(selectedBlast.action.description)}
                                </div>
                            </>
                        )}

                        {selectedImpulse && (
                            <>
                                <h2 className="modal-title">
                                    {selectedImpulse.data.name}
                                </h2>

                                <div className="modal-meta">
                                    <span className="modal-level-badge">
                                        {t('feat.level') || 'Level'} {selectedImpulse.data.level}
                                    </span>
                                    {selectedImpulse.elements.length > 0 && (
                                        <span className="modal-element-badge" style={{
                                            background: getElementColor(selectedImpulse.elements[0])
                                        }}>
                                            {selectedImpulse.elements[0]}
                                        </span>
                                    )}
                                    <div className="modal-cost">
                                        {selectedImpulse.data.altActionCosts && selectedImpulse.data.altActionCosts.length > 0 ? (
                                            // Has alternative action costs (e.g., reaction OR 2-action)
                                            <div className="multi-cost">
                                                {selectedImpulse.data.actionType === 'reaction' && (
                                                    <span className="cost-option">
                                                        <ActionIcon cost="reaction" />
                                                        <span>{t('actions.reaction') || 'Reaction'}</span>
                                                    </span>
                                                )}
                                                {selectedImpulse.data.altActionCosts.map(cost => (
                                                    <span key={cost} className="cost-option">
                                                        <ActionIcon cost={String(cost) as '1' | '2' | '3'} />
                                                        <span>{getActionCostLabel(String(cost))}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        ) : selectedImpulse.data.actionType === 'passive' ? (
                                            <span>◈ {t('feat.passive') || 'Passive'}</span>
                                        ) : selectedImpulse.data.actionType === 'free' ? (
                                            <>
                                                <ActionIcon cost="free" />
                                                <span>{t('actions.free') || 'Free'}</span>
                                            </>
                                        ) : selectedImpulse.data.actionType === 'reaction' ? (
                                            <>
                                                <ActionIcon cost="reaction" />
                                                <span>{t('actions.reaction') || 'Reaction'}</span>
                                            </>
                                        ) : selectedImpulse.data.actionCost ? (
                                            <>
                                                <ActionIcon cost={String(selectedImpulse.data.actionCost) as '1' | '2' | '3'} />
                                                <span>{getActionCostLabel(String(selectedImpulse.data.actionCost))}</span>
                                            </>
                                        ) : (
                                            <span>◈ {t('feat.passive') || 'Passive'}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="modal-traits">
                                    {selectedImpulse.data.traits.map(trait => (
                                        <span key={trait} className="trait-badge">
                                            {t(`traits.${trait}`) || trait}
                                        </span>
                                    ))}
                                </div>

                                <div className="modal-description">
                                    {stripHtml(selectedImpulse.data.description)}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImpulsePanel;
