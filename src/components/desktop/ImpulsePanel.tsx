import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useDiceRoller } from '../../hooks/useDiceRoller';
import { Character, CharacterFeat } from '../../types';
import { getFeats, getActions, LoadedAction, LoadedFeat, cleanDescriptionForDisplay } from '../../data/pf2e-loader';
import { getKineticistElementFromGateId } from '../../data/classSpecializations';
import { ActionIcon } from '../../utils/actionIcons';
import { calculateProficiencyBonusWithVariant, ProficiencyRank, getAbilityModifier, extractDamageFromDescription, simplifyFoundryFormula } from '../../utils/pf2e-math';
import { ImpulseRollData } from '../../types/dice';

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
    const { rollDice } = useDiceRoller();
    const [selectedImpulse, setSelectedImpulse] = useState<ImpulseFeatEntry | null>(null);
    const [selectedBlast, setSelectedBlast] = useState<ElementalBlastEntry | null>(null);

    // Blast options: melee and agile flags for each element (separate for 1-action and 2-action)
    const [blastOptions, setBlastOptions] = useState<Record<string, { melee: boolean; agile: boolean }>>({});

    // Elemental stance options - tracks active bonuses for each element
    // Air: Crowned in Tempest's Fury (1d12 electricity)
    // Fire: Ignite the Sun (1d6 fire), Furnace Form (extra die)
    // Earth: Rebirth in Living Stone (1d10)
    // Metal: Alloy Flesh and Steel (extra die)
    // Wood: Living Bonfire (variable fire damage based on level)
    const [elementalStanceActive, setElementalStanceActive] = useState<Record<string, {
        tempestFury?: boolean;        // Air: 1d12 electricity
        igniteTheSun?: boolean;       // Fire: 1d6 fire
        furnaceForm?: boolean;        // Fire: extra die
        rebirthInStone?: boolean;     // Earth: 1d10
        alloyFlesh?: boolean;         // Metal: extra die
        livingBonfire?: boolean;      // Wood: variable fire damage
    }>>({});

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

    // Toggle blast options (melee/agile) for specific element-action key
    const toggleBlastOption = (key: string, option: 'melee' | 'agile') => {
        setBlastOptions(prev => {
            const current = prev[key] || { melee: false, agile: false };
            return {
                ...prev,
                [key]: {
                    ...current,
                    [option]: !current[option]
                }
            };
        });
    };

    // Get options for element-action combination, initializing if needed
    const getBlastOptions = (element: string, isTwoActions: boolean) => {
        const key = `${element}-${isTwoActions ? 'two' : 'one'}`;
        return blastOptions[key] || { melee: false, agile: false };
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


    // Check if character has Weapon Infusion (uses weapon for attack bonus)
    const hasWeaponInfusion = useMemo(() => {
        return character.feats?.some(feat => {
            const featData = allFeats.find(f => f.id === feat.featId);
            return featData?.name.toLowerCase().includes('weapon infusion');
        });
    }, [character.feats, allFeats]);

    // Get equipped weapon for Weapon Infusion (only for attack ability, NOT for damage)
    const getInfusedWeapon = () => {
        if (!hasWeaponInfusion) return null;
        // Find weapon in equipment
        const weaponItem = character.equipment?.find(e => {
            const itemData = allFeats.find(f => f.id === e.id);
            return itemData?.traits?.includes('weapon');
        });
        if (!weaponItem) return null;
        return allFeats.find(f => f.id === weaponItem.id);
    };

    // Calculate Elemental Blast attack bonus
    const getBlastAttackBonus = (): number => {
        const conMod = getAbilityModifier(character.abilityScores.con);
        const level = character.level || 1;
        const profBonus = calculateProficiencyBonusWithVariant(
            level,
            ProficiencyRank.Trained,
            character.variantRules?.proficiencyWithoutLevel
        );

        // If using Weapon Infusion, use weapon's attack ability score for attack
        const infusedWeapon = getInfusedWeapon();
        if (infusedWeapon) {
            // Check for weapon customization override
            const weaponItem = character.equipment?.find(e => e.id === infusedWeapon.id);
            const customAbility = (weaponItem?.customization as any)?.attackAbilityOverride;
            const weaponAbility = (infusedWeapon as any).attackAbility || 'con';

            const weaponAbilityMod = customAbility
                ? getAbilityModifier(character.abilityScores[customAbility as keyof typeof character.abilityScores] || 10)
                : getAbilityModifier(character.abilityScores[weaponAbility as keyof typeof character.abilityScores] || 10);

            return weaponAbilityMod + profBonus;
        }

        return conMod + profBonus;
    };

    // Calculate Elemental Blast damage
    // Uses the isMelee parameter from checkbox instead of feat detection
    // Weapon Infusion does NOT change damage dice - blast always uses its own damage
    const getBlastDamage = (isTwoActions: boolean, isMelee: boolean, element: string): string => {
        const conMod = getAbilityModifier(character.abilityScores.con);
        const strMod = getAbilityModifier(character.abilityScores.str);
        const level = character.level || 1;

        // Base damage dice increases with level
        let diceCount = 1;
        if (level >= 4) diceCount = 2;
        if (level >= 10) diceCount = 3;
        if (level >= 16) diceCount = 4;

        // Determine die size based on element
        // Air, Fire: d6 | Earth, Metal, Water, Wood: d8
        const elementLower = element.toLowerCase();
        const dieSize = ['air', 'fire'].includes(elementLower) ? 6 : 8;
        const damageDice = `${diceCount}d${dieSize}`;

        // Calculate damage modifier based on actions and melee/ranged from checkbox
        let damageMod = 0;

        if (isTwoActions) {
            // Two-action blast: CON + STR (if melee) or just CON (if ranged)
            damageMod = conMod + (isMelee ? strMod : 0);
        } else {
            // One-action blast: only STR (if melee) or nothing (if ranged)
            damageMod = isMelee ? strMod : 0;
        }

        // Build base damage string
        let damageString = damageDice;
        let totalModifier = damageMod;

        // Check for elemental stance bonuses
        const elementStances = elementalStanceActive[elementLower] || {};

        // Air: Crowned in Tempest's Fury (+1d12 electricity)
        if (elementLower === 'air' && elementStances.tempestFury) {
            damageString += '+1d12';
        }

        // Fire: Ignite the Sun (+1d6 fire)
        if (elementLower === 'fire' && elementStances.igniteTheSun) {
            damageString += '+1d6';
        }

        // Fire: Furnace Form (adds an extra die of damage)
        if (elementLower === 'fire' && elementStances.furnaceForm) {
            // Add one more die of the same size (e.g., 4d6 becomes 5d6)
            damageString = damageString.replace(damageDice, `${diceCount + 1}d${dieSize}`);
        }

        // Earth: Rebirth in Living Stone (+1d10 of normal type)
        if (elementLower === 'earth' && elementStances.rebirthInStone) {
            damageString += '+1d10';
        }

        // Metal: Alloy Flesh and Steel (adds an extra die of damage)
        if (elementLower === 'metal' && elementStances.alloyFlesh) {
            damageString = damageString.replace(damageDice, `${diceCount + 1}d${dieSize}`);
        }

        // Wood: Living Bonfire (+variable fire damage based on level)
        // Formula: (floor((@actor.level -4)/5)+1)d6[fire]
        if (elementLower === 'wood' && elementStances.livingBonfire) {
            const level = character.level || 1;
            const bonfireDice = Math.floor((level - 4) / 5) + 1;
            if (bonfireDice > 0) {
                damageString += `+${bonfireDice}d6`;
            }
        }

        // Add modifier at the end (after all dice)
        if (totalModifier > 0) {
            damageString += `+${totalModifier}`;
        }

        return damageString;
    };

    // Handle Elemental Blast attack roll
    const handleBlastAttackRoll = (element: string) => {
        const attackBonus = getBlastAttackBonus();
        const formula = `1d20${attackBonus >= 0 ? '+' : ''}${attackBonus}`;
        const elementLabel = t(`elements.${element}`) || element;
        rollDice(formula, `${t('impulse.elementalBlast') || 'Elemental Blast'} (${elementLabel}) - ${t('weapons.attack') || 'Attack'}`);
    };

    // Handle Elemental Blast damage roll - opens dicebox with blast data
    const handleBlastDamageRoll = (element: string, isTwoActions: boolean, isMelee: boolean) => {
        const attackBonus = getBlastAttackBonus();
        const damage = getBlastDamage(isTwoActions, isMelee, element);
        const options = getBlastOptions(element, isTwoActions);
        const isAgile = options.agile;

        const impulseData: ImpulseRollData = {
            impulseType: 'blast',
            impulseName: `${t('impulse.elementalBlast') || 'Elemental Blast'} (${t(`elements.${element}`) || element})`,
            element: element,
            attackBonus: attackBonus,
            damage: damage,
            isAgile: isAgile,
            isMelee: isMelee,
            isTwoActions: isTwoActions,
        };

        const elementLabel = t(`elements.${element}`) || element;
        const actionLabel = isTwoActions
            ? (t('actions.twoActionsShort') || '2a')
            : (t('actions.oneActionShort') || '1a');
        const rangeLabel = isMelee
            ? (t('weapons.melee') || 'Melee')
            : (t('weapons.ranged') || 'Ranged');
        rollDice(damage, `${t('impulse.elementalBlast') || 'Elemental Blast'} (${elementLabel}) - ${actionLabel} - ${rangeLabel} - ${t('weapons.damageRoll') || 'Damage'}`, { impulseData });
    };

    // Check if an impulse is an attack (has 'attack' trait)
    const isAttackImpulse = (impulse: ImpulseFeatEntry): boolean => {
        return impulse.data.traits.includes('attack');
    };

    // Check if an impulse deals damage (has @Damage tag in description)
    const isDamageImpulse = (impulse: ImpulseFeatEntry): boolean => {
        const description = impulse.data.rawDescription || impulse.data.description;
        return description.includes('@Damage');
    };

    // Handle impulse attack roll (uses same bonus as Elemental Blast)
    const handleImpulseAttackRoll = (impulse: ImpulseFeatEntry) => {
        const attackBonus = getBlastAttackBonus();
        const formula = `1d20${attackBonus >= 0 ? '+' : ''}${attackBonus}`;
        rollDice(formula, `${impulse.data.name} - ${t('weapons.attack') || 'Attack'}`);
    };

    // Handle impulse damage roll - opens dicebox with impulse data
    const handleImpulseDamageRoll = (impulse: ImpulseFeatEntry) => {
        const attackBonus = getBlastAttackBonus();

        // Get the primary element for this impulse (for colored dice)
        const element = impulse.elements.find(e =>
            ['air', 'earth', 'fire', 'water', 'wood', 'metal'].includes(e)
        ) || 'general';

        // Extract damage formula
        let damage = '';
        const description = impulse.data.rawDescription || impulse.data.description;
        const damages = extractDamageFromDescription(description);

        if (damages && damages.length > 0) {
            const simplifiedDamages = damages.map(d => simplifyFoundryFormula(d, character));
            damage = simplifiedDamages.length === 1 ? simplifiedDamages[0] : simplifiedDamages.join(' + ');
        }

        const impulseData: ImpulseRollData = {
            impulseType: 'damage',
            impulseName: impulse.data.name,
            element: element,
            attackBonus: attackBonus,
            damage: damage,
            isAgile: false,
            isMelee: false,
            isTwoActions: false,
        };

        if (damage) {
            rollDice(damage, `${impulse.data.name} - ${t('weapons.damageRoll') || 'Damage'}`, { impulseData });
        } else {
            // No damage found in description - prompt user
            const damagePrompt = prompt(
                `${t('impulse.enterDamageFormula') || 'Enter damage formula (e.g., 4d6+2, 2d8+4)'}:\n${impulse.data.name}`,
                '2d8'
            );
            if (damagePrompt) {
                rollDice(damagePrompt.trim(), `${impulse.data.name} - ${t('weapons.damageRoll') || 'Damage'}`, { impulseData });
            }
        }
    };

    // Handle opening dicebox with blast data
    const handleOpenBlastDiceBox = (element: string, isTwoActions: boolean, isMelee: boolean, isAgile: boolean) => {
        const attackBonus = getBlastAttackBonus();
        const damage = getBlastDamage(isTwoActions, isMelee, element);

        const impulseData: ImpulseRollData = {
            impulseType: 'blast',
            impulseName: `${t('impulse.elementalBlast') || 'Elemental Blast'} (${t(`elements.${element}`) || element})`,
            element: element,
            attackBonus: attackBonus,
            damage: damage,
            isAgile: isAgile,
            isMelee: isMelee,
            isTwoActions: isTwoActions,
        };

        const elementLabel = t(`elements.${element}`) || element;
        rollDice('1d20', `${t('impulse.elementalBlast') || 'Elemental Blast'} (${elementLabel})`, { impulseData });
    };

    // Handle opening dicebox with impulse data
    const handleOpenImpulseDiceBox = (impulse: ImpulseFeatEntry) => {
        const attackBonus = getBlastAttackBonus();
        const isAttack = isAttackImpulse(impulse);
        const hasDamage = isDamageImpulse(impulse);

        // Get the primary element for this impulse
        const element = impulse.elements.find(e =>
            ['air', 'earth', 'fire', 'water', 'wood', 'metal'].includes(e)
        ) || 'general';

        // Extract damage formula
        let damage = '';
        const description = impulse.data.rawDescription || impulse.data.description;
        const damages = extractDamageFromDescription(description);

        if (damages && damages.length > 0) {
            const simplifiedDamages = damages.map(d => simplifyFoundryFormula(d, character));
            damage = simplifiedDamages.length === 1 ? simplifiedDamages[0] : simplifiedDamages.join(' + ');
        }

        const impulseData: ImpulseRollData = {
            impulseType: isAttack ? 'attack' : 'damage',
            impulseName: impulse.data.name,
            element: element,
            attackBonus: attackBonus,
            damage: damage,
            isAgile: false,
            isMelee: false,
            isTwoActions: false,
        };

        if (isAttack) {
            rollDice('1d20', `${impulse.data.name} - ${t('weapons.attack') || 'Attack'}`, { impulseData });
        } else {
            rollDice(damage || '1d6', `${impulse.data.name} - ${t('weapons.damageRoll') || 'Damage'}`, { impulseData });
        }
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

                        {/* Elemental Blast - two separate cards per element (1-action and 2-action) */}
                        {baseKineticistActions.elementalBlastAction && characterElements.flatMap((element) => {
                            // Create two separate cards: one for 1-action, one for 2-action
                            return [false, true].map((isTwoActions) => {
                                const blastKey = `${element}-${isTwoActions ? 'two' : 'one'}`;
                                const options = getBlastOptions(element, isTwoActions);
                                const isMelee = options.melee;
                                const isAgile = options.agile;

                                return (
                                    <div
                                        key={blastKey}
                                        className="impulse-card blast-card"
                                        style={{
                                            borderLeft: `4px solid ${getElementColor(element)}`
                                        }}
                                    >
                                        <div className="blast-card-header" onClick={() => setSelectedBlast({
                                            action: baseKineticistActions.elementalBlastAction!,
                                            oneActionVersion: baseKineticistActions.elementalBlastAction!,
                                            twoActionVersion: baseKineticistActions.elementalBlastAction!,
                                            element,
                                        })}>
                                            <div className="impulse-header">
                                                <span className="impulse-element-icon">
                                                    {getElementIcon(element)}
                                                </span>
                                                <span className="impulse-name">
                                                    {baseKineticistActions.elementalBlastAction!.name}
                                                </span>
                                            </div>

                                            <div className="impulse-cost">
                                                <ActionIcon cost={isTwoActions ? '2' : '1'} />
                                                <span className="cost-label">{getActionCostLabel(isTwoActions ? '2' : '1')}</span>
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

                                        {/* Blast Options: Melee and Agile checkboxes */}
                                        <div className="blast-options">
                                            <label className="blast-option-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={isMelee}
                                                    onChange={() => toggleBlastOption(blastKey, 'melee')}
                                                />
                                                <span>{t('weapons.melee') || 'Melee'}</span>
                                            </label>
                                            <label className="blast-option-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={isAgile}
                                                    onChange={() => toggleBlastOption(blastKey, 'agile')}
                                                />
                                                <span>{t('weapons.agile') || 'Agile'}</span>
                                            </label>
                                            {/* Elemental Stance Bonuses */}
                                            {element === 'air' && (
                                                <label className="blast-option-checkbox" title="Crowned in Tempest's Fury: +1d12 electricity damage">
                                                    <input
                                                        type="checkbox"
                                                        checked={elementalStanceActive['air']?.tempestFury || false}
                                                        onChange={() => {
                                                            setElementalStanceActive(prev => ({
                                                                ...prev,
                                                                'air': { ...prev['air'], tempestFury: !prev['air']?.tempestFury }
                                                            }));
                                                        }}
                                                    />
                                                    <span>⚡ Tempest's Fury</span>
                                                </label>
                                            )}
                                            {element === 'fire' && (
                                                <>
                                                    <label className="blast-option-checkbox" title="Ignite the Sun: +1d6 fire damage">
                                                        <input
                                                            type="checkbox"
                                                            checked={elementalStanceActive['fire']?.igniteTheSun || false}
                                                            onChange={() => {
                                                                setElementalStanceActive(prev => ({
                                                                    ...prev,
                                                                    'fire': { ...prev['fire'], igniteTheSun: !prev['fire']?.igniteTheSun }
                                                                }));
                                                            }}
                                                        />
                                                        <span>☀️ Ignite the Sun</span>
                                                    </label>
                                                    <label className="blast-option-checkbox" title="Furnace Form: +1 die damage">
                                                        <input
                                                            type="checkbox"
                                                            checked={elementalStanceActive['fire']?.furnaceForm || false}
                                                            onChange={() => {
                                                                setElementalStanceActive(prev => ({
                                                                    ...prev,
                                                                    'fire': { ...prev['fire'], furnaceForm: !prev['fire']?.furnaceForm }
                                                                }));
                                                            }}
                                                        />
                                                        <span>🔥 Furnace Form</span>
                                                    </label>
                                                </>
                                            )}
                                            {element === 'earth' && (
                                                <label className="blast-option-checkbox" title="Rebirth in Living Stone: +1d10 damage">
                                                    <input
                                                        type="checkbox"
                                                        checked={elementalStanceActive['earth']?.rebirthInStone || false}
                                                        onChange={() => {
                                                            setElementalStanceActive(prev => ({
                                                                ...prev,
                                                                'earth': { ...prev['earth'], rebirthInStone: !prev['earth']?.rebirthInStone }
                                                            }));
                                                        }}
                                                    />
                                                    <span>🪨 Rebirth in Stone</span>
                                                </label>
                                            )}
                                            {element === 'metal' && (
                                                <label className="blast-option-checkbox" title="Alloy Flesh and Steel: +1 die damage">
                                                    <input
                                                        type="checkbox"
                                                        checked={elementalStanceActive['metal']?.alloyFlesh || false}
                                                        onChange={() => {
                                                            setElementalStanceActive(prev => ({
                                                                ...prev,
                                                                'metal': { ...prev['metal'], alloyFlesh: !prev['metal']?.alloyFlesh }
                                                            }));
                                                        }}
                                                    />
                                                    <span>⚙️ Alloy Flesh</span>
                                                </label>
                                            )}
                                            {element === 'wood' && (
                                                <label className="blast-option-checkbox" title="Living Bonfire: +variable fire damage">
                                                    <input
                                                        type="checkbox"
                                                        checked={elementalStanceActive['wood']?.livingBonfire || false}
                                                        onChange={() => {
                                                            setElementalStanceActive(prev => ({
                                                                ...prev,
                                                                'wood': { ...prev['wood'], livingBonfire: !prev['wood']?.livingBonfire }
                                                            }));
                                                        }}
                                                    />
                                                    <span>🪵 Living Bonfire</span>
                                                </label>
                                            )}
                                        </div>

                                        {/* Single Dice Roll Button for Blast */}
                                        <div className="blast-dice-buttons">
                                            <button
                                                className="blast-dice-btn attack"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenBlastDiceBox(element, isTwoActions, isMelee, isAgile);
                                                }}
                                                title={`${t('weapons.attack') || 'Attack'}: ${getBlastAttackBonus() >= 0 ? '+' : ''}${getBlastAttackBonus()} | ${t('weapons.damage') || 'Damage'}: ${getBlastDamage(isTwoActions, isMelee, element)}`}
                                            >
                                                <img src="/assets/icon_d20_orange_small.png" alt="D20" style={{ width: '16px', height: '16px', marginRight: '4px', verticalAlign: 'middle' }} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            });
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
                                    {impulses.map((impulse) => {
                                        const isAttack = isAttackImpulse(impulse);
                                        const hasDamage = isDamageImpulse(impulse);
                                        return (
                                            <div
                                                key={impulse.feat.featId}
                                                className={`impulse-card ${isAttack || hasDamage ? 'blast-card' : 'clickable'}`}
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

                                                {/* Single Dice Roll Button for Attack and Damage Impulses */}
                                                {(isAttack || hasDamage) && (
                                                    <div className="blast-dice-buttons">
                                                        <button
                                                            className="blast-dice-btn attack"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleOpenImpulseDiceBox(impulse);
                                                            }}
                                                            title={`${isAttack ? t('weapons.attack') || 'Attack' : ''}${isAttack && hasDamage ? ' | ' : ''}${hasDamage ? t('weapons.damage') || 'Damage' : ''}`}
                                                        >
                                                            <img src="/assets/icon_d20_orange_small.png" alt="D20" style={{ width: '16px', height: '16px', marginRight: '4px', verticalAlign: 'middle' }} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
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
                                    {cleanDescriptionForDisplay(selectedBlast.action.rawDescription || selectedBlast.action.description)}
                                </div>

                                {/* Blast Options in Modal */}
                                <div className="blast-options" style={{ marginTop: '12px' }}>
                                    {selectedBlast.element === 'air' && (
                                        <label className="blast-option-checkbox" title="Crowned in Tempest's Fury: +1d12 electricity damage">
                                            <input
                                                type="checkbox"
                                                checked={elementalStanceActive['air']?.tempestFury || false}
                                                onChange={() => {
                                                    setElementalStanceActive(prev => ({
                                                        ...prev,
                                                        'air': { ...prev['air'], tempestFury: !prev['air']?.tempestFury }
                                                    }));
                                                }}
                                            />
                                            <span>⚡ Tempest's Fury</span>
                                        </label>
                                    )}
                                    {selectedBlast.element === 'fire' && (
                                        <>
                                            <label className="blast-option-checkbox" title="Ignite the Sun: +1d6 fire damage">
                                                <input
                                                    type="checkbox"
                                                    checked={elementalStanceActive['fire']?.igniteTheSun || false}
                                                    onChange={() => {
                                                        setElementalStanceActive(prev => ({
                                                            ...prev,
                                                            'fire': { ...prev['fire'], igniteTheSun: !prev['fire']?.igniteTheSun }
                                                        }));
                                                    }}
                                                />
                                                <span>☀️ Ignite the Sun</span>
                                            </label>
                                            <label className="blast-option-checkbox" title="Furnace Form: +1 die damage">
                                                <input
                                                    type="checkbox"
                                                    checked={elementalStanceActive['fire']?.furnaceForm || false}
                                                    onChange={() => {
                                                        setElementalStanceActive(prev => ({
                                                            ...prev,
                                                            'fire': { ...prev['fire'], furnaceForm: !prev['fire']?.furnaceForm }
                                                        }));
                                                    }}
                                                />
                                                <span>🔥 Furnace Form</span>
                                            </label>
                                        </>
                                    )}
                                    {selectedBlast.element === 'earth' && (
                                        <label className="blast-option-checkbox" title="Rebirth in Living Stone: +1d10 damage">
                                            <input
                                                type="checkbox"
                                                checked={elementalStanceActive['earth']?.rebirthInStone || false}
                                                onChange={() => {
                                                    setElementalStanceActive(prev => ({
                                                        ...prev,
                                                        'earth': { ...prev['earth'], rebirthInStone: !prev['earth']?.rebirthInStone }
                                                    }));
                                                }}
                                            />
                                            <span>🪨 Rebirth in Stone</span>
                                        </label>
                                    )}
                                    {selectedBlast.element === 'metal' && (
                                        <label className="blast-option-checkbox" title="Alloy Flesh and Steel: +1 die damage">
                                            <input
                                                type="checkbox"
                                                checked={elementalStanceActive['metal']?.alloyFlesh || false}
                                                onChange={() => {
                                                    setElementalStanceActive(prev => ({
                                                        ...prev,
                                                        'metal': { ...prev['metal'], alloyFlesh: !prev['metal']?.alloyFlesh }
                                                    }));
                                                }}
                                            />
                                            <span>⚙️ Alloy Flesh</span>
                                        </label>
                                    )}
                                    {selectedBlast.element === 'wood' && (
                                        <label className="blast-option-checkbox" title="Living Bonfire: +variable fire damage">
                                            <input
                                                type="checkbox"
                                                checked={elementalStanceActive['wood']?.livingBonfire || false}
                                                onChange={() => {
                                                    setElementalStanceActive(prev => ({
                                                        ...prev,
                                                        'wood': { ...prev['wood'], livingBonfire: !prev['wood']?.livingBonfire }
                                                    }));
                                                }}
                                            />
                                            <span>🪵 Living Bonfire</span>
                                        </label>
                                    )}
                                </div>

                                {/* Dice Roll Buttons for Blast Modal */}
                                <div className="modal-dice-buttons" style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    <button
                                        className="blast-dice-btn attack"
                                        onClick={() => handleBlastAttackRoll(selectedBlast.element)}
                                        title={`${t('weapons.attack') || 'Attack Roll'}: ${getBlastAttackBonus() >= 0 ? '+' : ''}${getBlastAttackBonus()}`}
                                    >
                                        🎲 {t('weapons.attack') || 'Attack'}
                                    </button>
                                    {/* 1-action blast damage */}
                                    <button
                                        className="blast-dice-btn damage"
                                        onClick={() => {
                                            const options = getBlastOptions(selectedBlast.element, false);
                                            handleBlastDamageRoll(selectedBlast.element, false, options.melee);
                                        }}
                                        title={`1a ${t('weapons.damageRoll') || 'Damage'}`}
                                    >
                                        🎲 1a {t('weapons.damage') || 'Damage'}
                                    </button>
                                    {/* 2-action blast damage */}
                                    <button
                                        className="blast-dice-btn damage"
                                        onClick={() => {
                                            const options = getBlastOptions(selectedBlast.element, true);
                                            handleBlastDamageRoll(selectedBlast.element, true, options.melee);
                                        }}
                                        title={`2a ${t('weapons.damageRoll') || 'Damage'}`}
                                    >
                                        🎲 2a {t('weapons.damage') || 'Damage'}
                                    </button>
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
                                    {cleanDescriptionForDisplay(selectedImpulse.data.rawDescription || selectedImpulse.data.description)}
                                </div>

                                {/* Dice Roll Buttons in Modal */}
                                {(() => {
                                    const isAttack = isAttackImpulse(selectedImpulse);
                                    const hasDamage = isDamageImpulse(selectedImpulse);
                                    return (isAttack || hasDamage) && (
                                        <div className="modal-dice-buttons" style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                                            {isAttack && (
                                                <button
                                                    className="blast-dice-btn attack"
                                                    onClick={() => handleImpulseAttackRoll(selectedImpulse)}
                                                    title={`${t('weapons.attack') || 'Attack Roll'}: ${getBlastAttackBonus() >= 0 ? '+' : ''}${getBlastAttackBonus()}`}
                                                >
                                                    🎲 {t('weapons.attack') || 'Attack'}
                                                </button>
                                            )}
                                            <button
                                                className="blast-dice-btn damage"
                                                onClick={() => handleImpulseDamageRoll(selectedImpulse)}
                                                title={t('weapons.damageRoll') || 'Damage Roll'}
                                            >
                                                🎲 {t('weapons.damage') || 'Damage'}
                                            </button>
                                        </div>
                                    );
                                })()}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImpulsePanel;
