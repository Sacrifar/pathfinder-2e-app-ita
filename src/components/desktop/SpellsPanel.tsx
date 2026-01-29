import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useDiceRoller } from '../../hooks/useDiceRoller';
import { Character, Proficiency, InnateSpell } from '../../types';
import { SpellRollData } from '../../types/dice';
import { getSpells, LoadedSpell, cleanDescriptionForDisplay } from '../../data/pf2e-loader';
import { extractDamageFromDescription, simplifyFoundryFormula } from '../../utils/pf2e-math';
import { getCantripsKnown, getSpellsKnown, isSpellcasterClass } from '../../data/spellSlotProgression';
import { getClassNameById } from '../../data/classSpecializations';
import { getBardMuseSpell } from '../../data/classGrantedSpells';
import { ActionIcon } from '../../utils/actionIcons';
import {
    getAvailableHeightenedLevels,
    getHeightenedSpellData,
    canSpellBeHeightened,
    isSignatureSpell,
    getSignatureSpellCount
} from '../../utils/spellHeightening';
import { hasEsotericPolymath, getEsotericPolymathAvailableSpells } from '../../utils/esotericPolymath';
import { hasDeepLore, getDeepLoreExtraSpells, getMaxSpellRank } from '../../utils/deepLore';
import { EsotericPolymathModal } from './EsotericPolymathModal';
import { DeepLoreModal } from './DeepLoreModal';

interface SpellsPanelProps {
    character: Character;
    onCharacterUpdate: (character: Character) => void;
}

type SpellSubTab = 'class' | 'focus' | 'rituals' | 'innate';

// Action icon mapping - returns the cost type for ActionIcon component
const getSpellActionCost = (castTime: string): '1' | '2' | '3' | 'free' | 'reaction' | null => {
    const time = castTime.toLowerCase();
    if (time === '1' || time === 'single action') return '1';
    if (time === '2' || time === 'two actions' || time === '2 actions') return '2';
    if (time === '3' || time === 'three actions' || time === '3 actions') return '3';
    if (time === 'free' || time === 'free action') return 'free';
    if (time === 'reaction') return 'reaction';
    // For longer cast times like "1 minute", "10 minutes", etc. - return null to show text
    return null;
};

// Render spell action icon or text for non-standard cast times
const renderSpellActionIcon = (castTime: string) => {
    const cost = getSpellActionCost(castTime);
    if (cost) {
        return <ActionIcon cost={cost} />;
    }
    // For longer cast times, show a truncated version
    const time = castTime.toLowerCase();
    if (time.includes('minute') || time.includes('hour')) {
        return <span className="spell-cast-time-text">{castTime}</span>;
    }
    return <span className="spell-cast-time-text">{castTime}</span>;
};

export const SpellsPanel: React.FC<SpellsPanelProps> = ({
    character,
    onCharacterUpdate,
}) => {
    const { t } = useLanguage();
    const { openDiceBoxWithSpell } = useDiceRoller();

    // Check if character has class spellcasting
    const hasClassSpellcasting = useMemo(() => {
        return character.classId ? isSpellcasterClass(character.classId) : false;
    }, [character.classId]);

    // Determines default tab: 'class' (if spellcaster) -> 'innate' (if has innate) -> 'focus' (if has focus)
    const getInitialTab = (): SpellSubTab => {
        if (hasClassSpellcasting) return 'class';
        if (character.spellcasting?.innateSpells && character.spellcasting.innateSpells.length > 0) return 'innate';
        if (character.spellcasting?.focusSpells && character.spellcasting.focusSpells.length > 0) return 'focus';
        return 'innate'; // Fallback
    };

    const [activeSubTab, setActiveSubTab] = useState<SpellSubTab>(getInitialTab());
    const [showBrowser, setShowBrowser] = useState(false);
    const [showEsotericPolymathModal, setShowEsotericPolymathModal] = useState(false);
    const [showDeepLoreModal, setShowDeepLoreModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [rankFilter, setRankFilter] = useState<number | 'all'>('all');
    const [traditionFilter, setTraditionFilter] = useState<string>('all');
    const [selectedSpell, setSelectedSpell] = useState<LoadedSpell | null>(null);
    const [viewingSpell, setViewingSpell] = useState<LoadedSpell | null>(null);  // For spell description modal
    const [selectedHeightenedLevel, setSelectedHeightenedLevel] = useState<number | null>(null);  // For heightening selection

    // Check if character has Esoteric Polymath feat
    const hasEsotericPolymathFeat = useMemo(() => {
        return hasEsotericPolymath(character);
    }, [character.feats]);

    // Check if character has Deep Lore feat
    const hasDeepLoreFeat = useMemo(() => {
        return hasDeepLore(character);
    }, [character.feats]);

    // Get Esoteric Polymath daily preparation info
    const esotericPolymathInfo = useMemo(() => {
        if (!hasEsotericPolymathFeat) return null;
        const availableSpells = getEsotericPolymathAvailableSpells(character);
        const currentPrep = character.spellbook?.esotericPolymath?.dailyPreparation;
        const currentSpell = currentPrep
            ? availableSpells.find(s => s.spell.id === currentPrep)
            : null;
        return { availableSpells, currentSpell };
    }, [hasEsotericPolymathFeat, character]);

    // Get Deep Lore extra spells info
    const deepLoreInfo = useMemo(() => {
        if (!hasDeepLoreFeat) return null;
        const extraSpells = getDeepLoreExtraSpells(character);
        const maxRank = getMaxSpellRank(character);
        const selectedCount = Object.keys(extraSpells).length;
        return { extraSpells, maxRank, selectedCount };
    }, [hasDeepLoreFeat, character]);

    // Calculate signature spell limit for this character
    const signatureSpellLimit = useMemo(() => {
        return getSignatureSpellCount(character.classId, character.level || 1);
    }, [character.classId, character.level]);

    const currentSignatureSpells = useMemo(() => {
        return character.spellcasting?.signatureSpells || [];
    }, [character.spellcasting?.signatureSpells]);

    const canAddSignatureSpell = currentSignatureSpells.length < signatureSpellLimit;

    // Get known heightened levels for a specific spell
    const getKnownHeightenedLevels = (spellId: string): number[] => {
        const heightenedSpells = character.spellcasting?.heightenedSpells || [];
        return heightenedSpells
            .filter(h => h.spellId === spellId)
            .map(h => h.heightenedLevel);
    };

    // Handle toggling signature spell status
    const handleToggleSignatureSpell = (spellId: string, event: React.MouseEvent | React.ChangeEvent<HTMLInputElement>) => {
        event.stopPropagation();

        const isCurrentlySignature = currentSignatureSpells.includes(spellId);
        let updatedSignatureSpells: string[];

        if (isCurrentlySignature) {
            // Remove from signature spells
            updatedSignatureSpells = currentSignatureSpells.filter(id => id !== spellId);
        } else {
            // Add to signature spells (if limit not reached)
            if (!canAddSignatureSpell) return;
            updatedSignatureSpells = [...currentSignatureSpells, spellId];
        }

        const updatedCharacter = {
            ...character,
            spellcasting: {
                ...character.spellcasting!,
                signatureSpells: updatedSignatureSpells,
            },
        };

        onCharacterUpdate(updatedCharacter);
    };

    // Handle adding a heightened version of a spell
    const handleAddHeightenedVersion = (spellId: string, heightenedLevel: number) => {
        const currentHeightened = character.spellcasting?.heightenedSpells || [];

        // Check if already exists
        if (currentHeightened.some(h => h.spellId === spellId && h.heightenedLevel === heightenedLevel)) {
            return;
        }

        const updatedHeightened = [
            ...currentHeightened,
            { spellId, heightenedLevel }
        ];

        const updatedCharacter = {
            ...character,
            spellcasting: {
                ...character.spellcasting!,
                heightenedSpells: updatedHeightened,
            },
        };

        onCharacterUpdate(updatedCharacter);
        setSelectedHeightenedLevel(null);
    };

    // Handle removing a heightened version
    const handleRemoveHeightenedVersion = (spellId: string, heightenedLevel: number, event: React.MouseEvent) => {
        event.stopPropagation();

        const currentHeightened = character.spellcasting?.heightenedSpells || [];
        const updatedHeightened = currentHeightened.filter(
            h => !(h.spellId === spellId && h.heightenedLevel === heightenedLevel)
        );

        const updatedCharacter = {
            ...character,
            spellcasting: {
                ...character.spellcasting!,
                heightenedSpells: updatedHeightened,
            },
        };

        onCharacterUpdate(updatedCharacter);
    };

    // Load all spells from pf2e data
    const allSpells = useMemo(() => getSpells(), []);

    // Get class name for display
    const className = useMemo(() => {
        return getClassNameById(character.classId) || 'Spellcaster';
    }, [character.classId]);

    // Filter spells
    const filteredSpells = useMemo(() => {
        let spells = allSpells;

        // Filter by rank
        if (rankFilter !== 'all') {
            spells = spells.filter(s => s.rank === rankFilter);
        }

        // Filter for rituals only when on rituals tab (before tradition filter)
        if (activeSubTab === 'rituals') {
            // Show all rituals except unique ones (matching AON reference)
            spells = spells.filter(s => s.isRitual === true && s.rarity !== 'unique');
        } else {
            // Filter by tradition (default to character's tradition) - skip for rituals
            const tradToFilter = traditionFilter !== 'all' ? traditionFilter : character.spellcasting?.tradition;
            if (tradToFilter) {
                spells = spells.filter(s => s.traditions.includes(tradToFilter));
            }
        }

        // Filter by search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            spells = spells.filter(s =>
                s.name.toLowerCase().includes(q) ||
                s.traits.some(t => t.toLowerCase().includes(q))
            );
        }

        return spells.slice(0, 50); // Limit for performance
    }, [allSpells, rankFilter, traditionFilter, searchQuery, character.spellcasting?.tradition, activeSubTab]);

    // Check if character has spellcasting
    if (!character.spellcasting) {
        return (
            <div className="spells-panel pathbuilder-style">
                <div className="panel-header">
                    <h3>{t('tabs.spells') || 'Spells'}</h3>
                    <button className="header-btn" onClick={() => setShowBrowser(true)}>
                        📖 {t('actions.browseSpells') || 'Browse Spells'}
                    </button>
                </div>
                <div className="empty-state">
                    <div className="empty-state-icon">✨</div>
                    <p>{t('builder.noSpellcasting') || 'This character is not a spellcaster.'}</p>
                    <button className="add-btn" onClick={() => setShowBrowser(true)}>
                        📖 {t('actions.browseSpells') || 'Browse Spell Database'}
                    </button>
                </div>

                {/* Spell Browser Modal */}
                {showBrowser && renderSpellBrowser()}
            </div>
        );
    }

    const { spellcasting } = character;

    // Get proficiency bonus
    const getProficiencyBonus = (prof: Proficiency, level: number) => {
        switch (prof) {
            case 'trained': return 2 + level;
            case 'expert': return 4 + level;
            case 'master': return 6 + level;
            case 'legendary': return 8 + level;
            default: return 0;
        }
    };

    // Proficiency level helpers
    const getProficiencyLevel = (prof: Proficiency): number => {
        switch (prof) {
            case 'trained': return 1;
            case 'expert': return 2;
            case 'master': return 3;
            case 'legendary': return 4;
            default: return 0;
        }
    };

    // Calculate spell attack and DC
    const keyAbilityScore = character.abilityScores[spellcasting.keyAbility];
    const keyMod = Math.floor((keyAbilityScore - 10) / 2);
    const profBonus = getProficiencyBonus(spellcasting.proficiency, character.level || 1);
    const profLevel = getProficiencyLevel(spellcasting.proficiency);
    const spellAttack = keyMod + profBonus;
    const spellDC = 10 + keyMod + profBonus;

    const formatModifier = (value: number) => {
        return value >= 0 ? `+${value}` : `${value}`;
    };

    // Create a Set of valid spell IDs for quick lookup
    const validSpellIds = useMemo(() => {
        return new Set(allSpells.map(s => s.id.toLowerCase()));
    }, [allSpells]);

    // Filter known spells to only include actual spells (not feats/actions)
    const validKnownSpells = useMemo(() => {
        const museSpellId = getBardMuseSpell(character);
        const knownList = [...spellcasting.knownSpells];

        // Inject Muse spell if not already learned
        if (museSpellId && !knownList.includes(museSpellId)) {
            // Only add if we are a Bard (double check to be safe, though getBardMuseSpell checks feats)
            if (character.classId && getClassNameById(character.classId) === 'Bard') {
                knownList.push(museSpellId);
            }
        }

        return knownList.filter(spellId => {
            const normalizedId = spellId.toLowerCase().replace(/\s+/g, '-');
            // Check if this ID exists in the actual spell database
            return validSpellIds.has(normalizedId) ||
                allSpells.some(s => s.id.toLowerCase() === normalizedId);
        });
    }, [spellcasting.knownSpells, validSpellIds, allSpells, character.feats, character.classId]);

    // Calculate spells known limits for spontaneous casters
    const spellsKnownLimits = useMemo(() => {
        if (spellcasting.spellcastingType === 'spontaneous') {
            const limits = { ...getSpellsKnown(character.classId, character.level || 1) };

            // Bard Muse Spell Logic:
            // If the character is a Bard and has a Muse spell, increase Rank 1 limit by 1
            // This allows the Muse spell to be "known" without taking up a standard repertoire slot
            // (Technically it takes a slot but the limit is effectively N+1 where 1 is fixed)
            const museSpell = getBardMuseSpell(character);
            if (museSpell && character.classId && getClassNameById(character.classId) === 'Bard') {
                limits[1] = (limits[1] || 0) + 1;
            }

            return limits;
        }
        return {};
    }, [character.classId, character.level, spellcasting.spellcastingType, character.feats]); // Added feats dependency for Muse check

    // Calculate cantrips known limit
    const cantripsKnownLimit = useMemo(() => {
        return getCantripsKnown(character.classId, character.level || 1);
    }, [character.classId, character.level]);

    // Helper to get full spell object from slug
    const getSpellFromSlug = (slug: string): LoadedSpell | undefined => {
        return allSpells.find(s => {
            const spellSlug = s.id.toLowerCase().replace(/\s+/g, '-');
            return spellSlug === slug.toLowerCase();
        });
    };

    // Group known spells by level
    const knownSpellsByLevel = useMemo(() => {
        const grouped: { [level: number]: LoadedSpell[] } = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [] };
        validKnownSpells.forEach(spellId => {
            const spell = getSpellFromSlug(spellId);
            if (spell) {
                const level = spell.rank;
                if (!grouped[level]) grouped[level] = [];
                grouped[level].push(spell);
            }
        });
        return grouped;
    }, [validKnownSpells]);

    // Separate focus spells from regular spells
    const focusSpells = useMemo(() => {
        return (spellcasting.focusSpells || [])
            .map(spellId => getSpellFromSlug(spellId))
            .filter((spell): spell is LoadedSpell => spell !== undefined);
    }, [spellcasting.focusSpells]);

    // Focus cantrips vs focus spells
    // Note: Composition cantrips (like Courageous Anthem) have 'cantrip' and 'composition' traits
    // but not 'focus' trait. They should be treated as focus cantrips.
    const focusCantrips = useMemo(() => focusSpells.filter(s =>
        s.traits.includes('cantrip') || s.traits.includes('composition')
    ), [focusSpells]);
    const focusSpellsNonCantrip = useMemo(() => focusSpells.filter(s =>
        !s.traits.includes('cantrip') && !s.traits.includes('composition')
    ), [focusSpells]);

    // Rituals
    const rituals = useMemo(() => {
        return (spellcasting.rituals || [])
            .map(spellId => getSpellFromSlug(spellId))
            .filter((spell): spell is LoadedSpell => spell !== undefined);
    }, [spellcasting.rituals]);

    // Innate Spells
    const innateSpells = useMemo(() => {
        return (spellcasting.innateSpells || [])
            .map(innate => ({
                ...innate,
                spell: getSpellFromSlug(innate.spellId),
            }))
            .filter((item): item is InnateSpell & { spell: LoadedSpell } => item.spell !== undefined);
    }, [spellcasting.innateSpells]);

    // Extract element from spell traits for dice coloring
    const extractElementFromTraits = (traits: string[]): string | undefined => {
        const elementalTraits = [
            'air', 'fire', 'earth', 'metal', 'water', 'wood',  // Kineticist elements
            'electricity', 'cold', 'acid', 'poison', 'sonic',    // Spell damage traits
            'force', 'vitality', 'void', 'chaos'                 // Other spell traits
        ];
        return traits.find(t => elementalTraits.includes(t.toLowerCase()));
    };

    // Handle consuming a spell slot when casting
    const handleConsumeSpellSlot = (spellRank: number, event: React.MouseEvent) => {
        event.stopPropagation();

        // Cantrips don't use spell slots
        if (spellRank === 0) return;

        const slotData = spellcasting.spellSlots[spellRank];
        if (!slotData || slotData.used >= slotData.max) return; // No slots available

        // Update spell slots
        const updatedSpellSlots = {
            ...spellcasting.spellSlots,
            [spellRank]: {
                ...slotData,
                used: slotData.used + 1
            }
        };

        const updatedCharacter = {
            ...character,
            spellcasting: {
                ...spellcasting,
                spellSlots: updatedSpellSlots
            }
        };

        onCharacterUpdate(updatedCharacter);
    };

    // Handle consuming a Focus Point when casting a focus spell
    const handleConsumeFocusPoint = (event: React.MouseEvent) => {
        event.stopPropagation();

        if (!spellcasting.focusPool || spellcasting.focusPool.current <= 0) return; // No focus points available

        // Update focus pool
        const updatedFocusPool = {
            ...spellcasting.focusPool,
            current: spellcasting.focusPool.current - 1,
        };

        const updatedCharacter = {
            ...character,
            spellcasting: {
                ...spellcasting,
                focusPool: updatedFocusPool,
            },
        };
        onCharacterUpdate(updatedCharacter);
    };

    // Handle consuming an innate spell use
    const handleConsumeInnateSpellUse = (spellId: string, event: React.MouseEvent) => {
        event.stopPropagation();

        const innateSpells = spellcasting.innateSpells || [];
        const innateSpellIndex = innateSpells.findIndex(is => is.spellId === spellId);

        if (innateSpellIndex === -1) return; // Spell not found

        const innateSpell = innateSpells[innateSpellIndex];

        // Cantrips (unlimited uses) don't consume uses
        if (innateSpell.maxUses >= 999) return;

        if (innateSpell.uses <= 0) return; // No uses available

        // Update innate spell uses
        const updatedInnateSpells = [...innateSpells];
        updatedInnateSpells[innateSpellIndex] = {
            ...innateSpell,
            uses: innateSpell.uses - 1,
        };

        const updatedCharacter = {
            ...character,
            spellcasting: {
                ...spellcasting,
                innateSpells: updatedInnateSpells,
            },
        };
        onCharacterUpdate(updatedCharacter);
    };

    // Check if spell requires an attack roll (has 'attack' trait and no save)
    const spellRequiresAttackRoll = (spell: LoadedSpell): boolean => {
        return spell.traits.includes('attack');
    };

    // Handle opening the dicebox with spell data (without auto-rolling)
    const handleOpenDiceBoxForSpell = (spell: LoadedSpell, event: React.MouseEvent) => {
        event.stopPropagation();

        const element = extractElementFromTraits(spell.traits);
        // Use spell.damage directly (already contains formula and type like "2d4 cold")
        // If spell.damage is not available, try extracting from description
        let damageFormula = spell.damage || undefined;
        if (!damageFormula) {
            const description = spell.rawDescription || spell.description;
            const damages = extractDamageFromDescription(description);
            if (damages && damages.length > 0) {
                damageFormula = damages.map(d => simplifyFoundryFormula(d, character)).join(' + ');
            }
        }

        const spellData: SpellRollData = {
            spellId: spell.id,
            spellName: spell.name,
            rank: spell.rank,
            damage: damageFormula,
            element,
            spellAttack,
            spellDC,
            castTime: spell.castTime,
            requiresAttackRoll: spellRequiresAttackRoll(spell)
        };

        openDiceBoxWithSpell(spellData);
    };

    // Handle showing spell description
    const handleViewSpellDetails = (spell: LoadedSpell, event: React.MouseEvent) => {
        event.stopPropagation();
        setViewingSpell(spell);
    };

    // Spell slots display
    const slotLevels = Object.keys(spellcasting.spellSlots || {}).map(Number).sort((a, b) => a - b);

    // Get ability abbreviation
    const getAbilityAbbrev = (ability: string): string => {
        const abbrevMap: Record<string, string> = {
            'str': 'For', 'dex': 'Des', 'con': 'Cos', 'int': 'Int', 'wis': 'Sag', 'cha': 'Car'
        };
        return abbrevMap[ability] || ability.charAt(0).toUpperCase() + ability.slice(1, 3);
    };

    function renderSpellBrowser() {
        return (
            <div className="modal-overlay" onClick={() => setShowBrowser(false)}>
                <div className="spell-browser-modal" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h3>{t('browser.spells') || 'Spell Browser'}</h3>
                        <button className="modal-close" onClick={() => setShowBrowser(false)}>×</button>
                    </div>

                    <div className="browser-filters">
                        <input
                            type="text"
                            placeholder={t('search.placeholder') || 'Search spells...'}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                        <div className="filter-row">
                            <div className="rank-filters">
                                <button
                                    className={`filter-btn ${rankFilter === 'all' ? 'active' : ''}`}
                                    onClick={() => setRankFilter('all')}
                                >
                                    All
                                </button>
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rank => (
                                    <button
                                        key={rank}
                                        className={`filter-btn rank-btn ${rankFilter === rank ? 'active' : ''}`}
                                        onClick={() => setRankFilter(rank)}
                                    >
                                        {rank === 0 ? 'C' : rank}
                                    </button>
                                ))}
                            </div>
                            <div className="tradition-filters">
                                {['all', 'arcane', 'divine', 'occult', 'primal'].map(trad => (
                                    <button
                                        key={trad}
                                        className={`filter-btn tradition-btn ${traditionFilter === trad ? 'active' : ''} ${trad !== 'all' ? `tradition-${trad}` : ''}`}
                                        onClick={() => setTraditionFilter(trad)}
                                    >
                                        {trad === 'all' ? 'All' : trad.charAt(0).toUpperCase() + trad.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="browser-content">
                        <div className="spell-list">
                            {filteredSpells.map(spell => (
                                <div
                                    key={spell.id}
                                    className={`spell-list-item ${selectedSpell?.id === spell.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedSpell(spell)}
                                >
                                    <span className="spell-item-rank">{spell.rank === 0 ? 'C' : spell.rank}</span>
                                    <span className="spell-item-name">{spell.name}</span>
                                    <div className="spell-item-traditions">
                                        {spell.traditions.map(trad => (
                                            <span key={trad} className={`tradition-dot ${trad}`} title={trad} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {selectedSpell && (
                            <div className="spell-detail">
                                <div className="spell-detail-header-row">
                                    <div className="spell-detail-title-section">
                                        <h4>{selectedSpell.name}</h4>
                                        <div className="spell-badges">
                                            <span className="spell-rank-badge">
                                                {selectedSpell.rank === 0 ? 'Cantrip' : `Rank ${selectedSpell.rank}`}
                                            </span>
                                            {selectedSpell.traditions.map(trad => (
                                                <span key={trad} className={`tradition-tag ${trad}`}>{trad}</span>
                                            ))}
                                        </div>
                                    </div>

                                    {selectedSpell.traits.length > 0 && (
                                        <div className="spell-detail-traits">
                                            {selectedSpell.traits.map(trait => (
                                                <span key={trait} className="trait-tag">{trait}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="spell-detail-stats-grid">
                                    <div className="detail-stat-box">
                                        <span className="stat-label">{t('spell.cast') || 'Cast'}</span>
                                        <div className="stat-value-row">
                                            {renderSpellActionIcon(selectedSpell.castTime)}
                                            {/* Only show text if it's not a standard action icon or if we want to reinforce it */}
                                            {(!['1', '2', '3', 'free', 'reaction'].includes(getSpellActionCost(selectedSpell.castTime) || '')) && (
                                                <span className="cast-text">{selectedSpell.castTime}</span>
                                            )}
                                        </div>
                                    </div>

                                    {selectedSpell.range && (
                                        <div className="detail-stat-box">
                                            <span className="stat-label">{t('spell.range') || 'Range'}</span>
                                            <span className="stat-value">{selectedSpell.range}</span>
                                        </div>
                                    )}

                                    {selectedSpell.area && (
                                        <div className="detail-stat-box">
                                            <span className="stat-label">{t('spell.area') || 'Area'}</span>
                                            <span className="stat-value">{selectedSpell.area}</span>
                                        </div>
                                    )}

                                    {selectedSpell.duration && (
                                        <div className="detail-stat-box">
                                            <span className="stat-label">{t('spell.duration') || 'Duration'}</span>
                                            <span className="stat-value">{selectedSpell.duration}</span>
                                        </div>
                                    )}

                                    {selectedSpell.save && (
                                        <div className="detail-stat-box">
                                            <span className="stat-label">{t('spell.save') || 'Save'}</span>
                                            <span className="stat-value">{selectedSpell.save}</span>
                                        </div>
                                    )}

                                    {selectedSpell.damage && (
                                        <div className="detail-stat-box full-width">
                                            <span className="stat-label">{t('spell.damage') || 'Damage'}</span>
                                            <span className="stat-value damage-text">{selectedSpell.damage}</span>
                                        </div>
                                    )}
                                </div>
                                <p className="spell-description">{cleanDescriptionForDisplay(selectedSpell.rawDescription || selectedSpell.description)}</p>
                                <button className="add-spell-btn" onClick={() => {
                                    // Add spell to appropriate list based on active tab
                                    if (activeSubTab === 'rituals') {
                                        // Add to rituals
                                        const updatedRituals = [...(character.spellcasting?.rituals || []), selectedSpell.id];
                                        const updatedCharacter = {
                                            ...character,
                                            spellcasting: {
                                                ...character.spellcasting!,
                                                rituals: updatedRituals,
                                            },
                                        };
                                        onCharacterUpdate(updatedCharacter);
                                    } else {
                                        // Add to knownSpells
                                        const updatedKnownSpells = [...(character.spellcasting?.knownSpells || []), selectedSpell.id];
                                        const updatedCharacter = {
                                            ...character,
                                            spellcasting: {
                                                ...character.spellcasting!,
                                                knownSpells: updatedKnownSpells,
                                            },
                                        };
                                        onCharacterUpdate(updatedCharacter);
                                    }
                                    setShowBrowser(false);
                                    setSelectedSpell(null);
                                }}>
                                    + {activeSubTab === 'rituals'
                                        ? (t('actions.learnRitual') || 'Learn Ritual')
                                        : (t('actions.learnSpell') || 'Learn Spell')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Handle removing a learned spell
    const handleRemoveSpell = (spellId: string, event: React.MouseEvent) => {
        event.stopPropagation();

        const updatedKnownSpells = spellcasting.knownSpells.filter(id => id !== spellId);
        const updatedCharacter = {
            ...character,
            spellcasting: {
                ...spellcasting,
                knownSpells: updatedKnownSpells,
            },
        };
        onCharacterUpdate(updatedCharacter);
    };

    // Render a spell row in Pathbuilder style
    const renderSpellRow = (spell: LoadedSpell | null, isPlaceholder = false, key?: string) => {
        // Handle placeholder rendering first to avoid null access errors
        if (isPlaceholder || !spell) {
            return (
                <div key={key} className="spell-row placeholder" onClick={() => setShowBrowser(true)}>
                    <span className="spell-row-name">{t('spell.notSelected') || 'Not Selected'}</span>
                    <span className="spell-row-actions">—</span>
                    <span className="spell-row-duration">—</span>
                    <span className="spell-row-range">—</span>
                    <span className="spell-row-damage">—</span>
                    <span className="spell-row-area">—</span>
                    <span className="spell-row-cast"></span>
                    <span></span>
                    <span className="spell-row-signature"></span>
                    <span className="spell-row-heightened"></span>
                </div>
            );
        }

        const museSpellId = getBardMuseSpell(character);
        const isMuseSpell = spell.id === museSpellId;
        const isCantrip = spell.rank === 0;
        const isSignature = isSignatureSpell(character, spell.id);
        const knownHeightenedLevels = getKnownHeightenedLevels(spell.id);
        const canBeHeightened = canSpellBeHeightened(spell);
        const availableHeightenedLevels = canBeHeightened
            ? getAvailableHeightenedLevels(spell, character.level || 1, knownHeightenedLevels)
            : [];

        // Check if this is a focus spell (from focusSpells array)
        const isFocusSpell = focusSpells.some(fs => fs?.id === spell.id);

        // Check if spell slot available for this rank (for regular spells)
        const slotData = spellcasting.spellSlots[spell.rank];
        const hasSlotAvailable = isCantrip || (slotData && slotData.used < slotData.max);

        // Check if focus point available (for focus spells)
        const hasFocusPointAvailable = spellcasting.focusPool && spellcasting.focusPool.current > 0;

        return (
            <>
                <div key={key} className={`spell-row ${isMuseSpell ? 'locked-spell' : ''}`}>
                    {/* Spell name - click to view description */}
                    <span
                        className="spell-row-name clickable"
                        onClick={(e) => handleViewSpellDetails(spell, e)}
                        title={t('actions.viewSpellDetails') || 'View spell details'}
                    >
                        {spell.name}
                        {isMuseSpell && <span className="locked-icon" title="Granted by Muse">🔒</span>}
                        {isSignature && <span className="signature-icon" title="Signature Spell">⭐</span>}
                    </span>

                    {/* Actions - click to open dicebox */}
                    <span
                        className="spell-row-actions clickable"
                        onClick={(e) => handleOpenDiceBoxForSpell(spell, e)}
                        title={t('actions.openDicebox') || 'Open dice box'}
                    >
                        {renderSpellActionIcon(spell.castTime)}
                    </span>

                    <span className="spell-row-duration">{spell.duration || '—'}</span>
                    <span className="spell-row-range">{spell.range || '—'}</span>
                    <span className="spell-row-damage">{spell.damage || '—'}</span>
                    <span className="spell-row-area">{spell.area || '—'}</span>

                    {/* Cast button - consumes spell slot for regular spells, Focus Point for focus spells */}
                    <span className="spell-row-cast">
                        {!isMuseSpell && (
                            <button
                                className={`spell-cast-btn ${isFocusSpell ? 'focus-spell' : ''} ${!hasSlotAvailable && !isFocusSpell ? 'disabled' : ''} ${isFocusSpell && !hasFocusPointAvailable ? 'disabled' : ''}`}
                                onClick={(e) => isFocusSpell ? handleConsumeFocusPoint(e) : handleConsumeSpellSlot(spell.rank, e)}
                                disabled={isFocusSpell ? !hasFocusPointAvailable : !hasSlotAvailable}
                                title={isFocusSpell
                                    ? (hasFocusPointAvailable
                                        ? (t('actions.castFocusSpell') || 'Cast focus spell (1 Focus Point)')
                                        : (t('spell.noFocusPointsAvailable') || 'No Focus Points available'))
                                    : (isCantrip
                                        ? (t('actions.castCantrip') || 'Cast cantrip')
                                        : hasSlotAvailable
                                            ? (t('actions.castSpell') || 'Cast spell')
                                            : (t('spell.noSlotsAvailable') || 'No spell slots available'))
                                }
                            >
                                {t('actions.cast') || 'Cast'}
                            </button>
                        )}
                    </span>

                    {/* Remove button */}
                    {!isMuseSpell && (
                        <button
                            className="spell-remove-btn"
                            onClick={(e) => handleRemoveSpell(spell.id, e)}
                            title={t('actions.removeSpell') || 'Remove Spell'}
                        >
                            ×
                        </button>
                    )}

                    {/* Signature spell checkbox */}
                    {!isMuseSpell && !isCantrip && spellcasting.spellcastingType === 'spontaneous' && (
                        <span className="spell-row-signature">
                            <input
                                type="checkbox"
                                checked={isSignature}
                                onChange={(e) => handleToggleSignatureSpell(spell.id, e)}
                                disabled={!canAddSignatureSpell && !isSignature}
                                title={isSignature
                                    ? (t('spell.removeSignature') || 'Remove as signature spell')
                                    : canAddSignatureSpell
                                        ? (t('spell.makeSignature') || 'Make signature spell')
                                        : (t('spell.signatureLimitReached') || 'Signature spell limit reached')
                                }
                            />
                        </span>
                    )}

                    {/* Heightened versions display/add */}
                    {canBeHeightened && !isCantrip && spellcasting.spellcastingType === 'spontaneous' && !isSignature && (
                        <span className="spell-row-heightened">
                            <div className="heightened-versions">
                                {knownHeightenedLevels.map(level => (
                                    <span key={level} className="heightened-badge">
                                        {level}
                                        <button
                                            className="heightened-remove"
                                            onClick={(e) => handleRemoveHeightenedVersion(spell.id, level, e)}
                                            title={t('actions.removeHeightened') || 'Remove heightened version'}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                                {availableHeightenedLevels.length > 0 && (
                                    <select
                                        className="heightened-add-select"
                                        onChange={(e) => {
                                            const level = parseInt(e.target.value);
                                            if (level) handleAddHeightenedVersion(spell.id, level);
                                        }}
                                        value=""
                                        title={t('spell.addHeightened') || 'Add heightened version'}
                                    >
                                        <option value="">+{t('spell.heightened') || 'Heightened'}</option>
                                        {availableHeightenedLevels.map(level => (
                                            <option key={level} value={level}>Rank {level}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </span>
                    )}
                </div>
            </>
        );
    };

    // Render spell level group with fire icons for slots
    const renderSpellLevelGroup = (level: number, spells: LoadedSpell[], limit: number, extraSpells: LoadedSpell[] = []) => {
        const slotData = spellcasting.spellSlots[level];
        const slotsAvailable = slotData ? slotData.max - slotData.used : 0;
        const slotsMax = slotData?.max || 0;

        // Calculate empty slots (placeholders) - based only on actual known spells
        const emptySlots = Math.max(0, limit - spells.length);

        // Combine spells for display
        const displaySpells = [...spells, ...extraSpells];

        return (
            <div key={level} className="spell-level-group">
                <div className="spell-level-header">
                    <h5>{level === 0 ? 'Cantrips' : `${t('stats.spellRank') || 'Spell Rank'} ${level}`}</h5>
                    <div className="slot-icons">
                        {level > 0 && Array.from({ length: slotsMax }, (_, i) => (
                            <span
                                key={i}
                                className={`slot-icon ${i < slotsAvailable ? 'available' : 'used'}`}
                                title={i < slotsAvailable ? 'Available' : 'Used'}
                            >
                                🔥
                            </span>
                        ))}
                        {level === 0 && <span className="cantrip-indicator">∞</span>}
                    </div>
                </div>
                <div className="spell-rows">
                    <div className="spell-row-header">
                        <span className="spell-row-name">{t('spell.name') || 'Spell'}</span>
                        <span className="spell-row-actions">{t('spell.actions') || 'Actions'}</span>
                        <span className="spell-row-duration">{t('spell.duration') || 'Duration'}</span>
                        <span className="spell-row-range">{t('spell.range') || 'Range'}</span>
                        <span className="spell-row-damage">{t('spell.damage') || 'Damage'}</span>
                        <span className="spell-row-area">{t('spell.area') || 'Area'}</span>
                        <span className="spell-row-cast"></span>
                        <span></span>
                        {spellcasting.spellcastingType === 'spontaneous' && (
                            <>
                                <span key="signature" className="spell-row-signature" title={t('spell.signatureSpell') || 'Signature Spell'}>⭐</span>
                                <span key="heightened" className="spell-row-heightened" title={t('spell.heightenedVersions') || 'Heightened Versions'}>H</span>
                            </>
                        )}
                    </div>
                    {displaySpells.map(spell => renderSpellRow(spell, false, `${spell.id}-${level}`))}
                    {Array.from({ length: emptySlots }, (_, i) => renderSpellRow(null as any, true, `empty-${i}`))}
                </div>
            </div>
        );
    };

    // Render Class spells tab
    const renderClassSpellsTab = () => (
        <div className="spells-tab-content">
            {/* Spell Stats Header */}
            <div className="spell-stats-header">
                <div className="spell-dc-section">
                    <span className="stat-label">{t('stats.spellDC') || 'Spell DC'}</span>
                    <span className="stat-value large">DC {spellDC}</span>
                </div>
                <div className="spell-attack-section">
                    <span className="stat-label">{t('stats.spellAttack') || 'Spell Attack'}</span>
                    <span className="stat-value large">{formatModifier(spellAttack)}</span>
                </div>
                <div className="proficiency-section">
                    <div className="proficiency-badges">
                        {['T', 'E', 'M', 'L'].map((letter, idx) => (
                            <span
                                key={letter}
                                className={`prof-badge ${idx + 1 <= profLevel ? 'active' : ''}`}
                            >
                                {letter}
                            </span>
                        ))}
                    </div>
                    <div className="stat-breakdown">
                        <span>{getAbilityAbbrev(spellcasting.keyAbility)} {formatModifier(keyMod)}</span>
                        <span className="separator">|</span>
                        <span>Prof {formatModifier(profBonus - (character.level || 1))}</span>
                        <span className="separator">|</span>
                        <span>Item +0</span>
                    </div>
                </div>
            </div>

            {/* Bonus Spells & Print buttons */}
            <div className="spell-actions-row">
                <button className="spell-action-btn" onClick={() => setShowBrowser(true)}>
                    + {t('actions.addSpell') || 'Add Spell'}
                </button>
                {hasEsotericPolymathFeat && (
                    <button
                        className="spell-action-btn esoteric-polymath-btn"
                        onClick={() => setShowEsotericPolymathModal(true)}
                    >
                        📕 {t('esotericPolymath.dailyPreparation') || 'Daily Preparation'}
                        {esotericPolymathInfo?.currentSpell && (
                            <span className="current-prep-badge" style={{ marginLeft: '8px' }}>
                                {esotericPolymathInfo.currentSpell.spell.name}
                            </span>
                        )}
                    </button>
                )}
                {hasDeepLoreFeat && (
                    <button
                        className="spell-action-btn deep-lore-btn"
                        onClick={() => setShowDeepLoreModal(true)}
                    >
                        📖 {t('deepLore.title') || 'Deep Lore'}
                        {deepLoreInfo && (
                            <span className="current-prep-badge" style={{ marginLeft: '8px' }}>
                                {deepLoreInfo.selectedCount}/{deepLoreInfo.maxRank}
                            </span>
                        )}
                    </button>
                )}
            </div>

            {/* Spell Level Groups */}
            <div className="spell-levels-container">
                {/* Cantrips */}
                {renderSpellLevelGroup(0, knownSpellsByLevel[0] || [], cantripsKnownLimit)}

                {/* Ranked Spells */}
                {slotLevels.filter(l => l > 0).map(level => {
                    const limit = spellsKnownLimits[level] || spellcasting.spellSlots[level]?.max || 0;

                    // Get signature spells applicable for this level (from lower ranks)
                    const signatureSpellsForLevel = validKnownSpells
                        .map(id => getSpellFromSlug(id))
                        .filter((s): s is LoadedSpell => !!s)
                        .filter(s => {
                            // Check if signature spell
                            if (!isSignatureSpell(character, s.id)) return false;

                            const isLower = s.rank < level;
                            const duplicate = knownSpellsByLevel[level]?.some(k => k.id === s.id);
                            const canHeighten = canSpellBeHeightened(s);

                            return isLower && canHeighten && !duplicate;
                        })
                        .map(s => ({
                            ...s,
                            rank: level,
                            ...getHeightenedSpellData(s, level)
                        }));

                    return renderSpellLevelGroup(level, knownSpellsByLevel[level] || [], limit, signatureSpellsForLevel);
                })}
            </div>
        </div>
    );

    // Render Focus Spells tab
    const renderFocusSpellsTab = () => (
        <div className="spells-tab-content">
            {/* Focus Points Display */}
            {spellcasting.focusPool && (
                <div className="focus-points-header">
                    <span className="focus-label">{t('stats.focusPoints') || 'Focus Points'}</span>
                    <div className="focus-point-icons">
                        {Array.from({ length: spellcasting.focusPool.max }, (_, i) => (
                            <span
                                key={i}
                                className={`focus-icon ${i < spellcasting.focusPool!.current ? 'available' : 'used'}`}
                            >
                                🔥
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Focus Cantrips */}
            {focusCantrips.length > 0 && (
                <div className="spell-level-group">
                    <div className="spell-level-header">
                        <h5>{t('stats.focusCantrips') || 'Focus Cantrips'}</h5>
                    </div>
                    <div className="spell-rows">
                        <div className="spell-row-header">
                            <span className="spell-row-name">{t('spell.name') || 'Spell'}</span>
                            <span className="spell-row-actions">{t('spell.actions') || 'Actions'}</span>
                            <span className="spell-row-duration">{t('spell.duration') || 'Duration'}</span>
                            <span className="spell-row-range">{t('spell.range') || 'Range'}</span>
                            <span className="spell-row-damage">{t('spell.damage') || 'Damage'}</span>
                            <span className="spell-row-area">{t('spell.area') || 'Area'}</span>
                            <span></span>
                        </div>
                        {focusCantrips.map(spell => renderSpellRow(spell))}
                    </div>
                </div>
            )}

            {/* Focus Spells */}
            {focusSpellsNonCantrip.length > 0 && (
                <div className="spell-level-group">
                    <div className="spell-level-header">
                        <h5>{t('stats.focusSpells') || 'Focus Spells'}</h5>
                    </div>
                    <div className="spell-rows">
                        <div className="spell-row-header">
                            <span className="spell-row-name">{t('spell.name') || 'Spell'}</span>
                            <span className="spell-row-actions">{t('spell.actions') || 'Actions'}</span>
                            <span className="spell-row-duration">{t('spell.duration') || 'Duration'}</span>
                            <span className="spell-row-range">{t('spell.range') || 'Range'}</span>
                            <span className="spell-row-damage">{t('spell.damage') || 'Damage'}</span>
                            <span className="spell-row-area">{t('spell.area') || 'Area'}</span>
                            <span></span>
                        </div>
                        {focusSpellsNonCantrip.map(spell => renderSpellRow(spell))}
                    </div>
                </div>
            )}

            {focusSpells.length === 0 && (
                <div className="empty-focus-state">
                    <p>{t('builder.noFocusSpells') || 'No focus spells yet.'}</p>
                </div>
            )}
        </div>
    );

    // Render Rituals tab
    const renderRitualsTab = () => (
        <div className="spells-tab-content">
            <div className="rituals-header">
                <button className="spell-action-btn" onClick={() => setShowBrowser(true)}>
                    + {t('actions.addRitual') || 'Add Ritual'}
                </button>
            </div>

            {rituals.length > 0 ? (
                <div className="spell-level-group">
                    <div className="spell-rows">
                        <div className="spell-row-header">
                            <span className="spell-row-name">{t('spell.name') || 'Ritual'}</span>
                            <span className="spell-row-actions">{t('spell.rank') || 'Rank'}</span>
                            <span className="spell-row-duration">{t('spell.castTime') || 'Cast Time'}</span>
                            <span className="spell-row-range">{t('spell.cost') || 'Cost'}</span>
                            <span className="spell-row-damage">{t('spell.damage') || 'Damage'}</span>
                            <span className="spell-row-area">{t('spell.area') || 'Area'}</span>
                            <span></span>
                        </div>
                        {rituals.map(spell => (
                            <div key={spell.id} className="spell-row">
                                <span className="spell-row-name">{spell.name}</span>
                                <span className="spell-row-actions">{spell.rank}</span>
                                <span className="spell-row-duration">{spell.castTime}</span>
                                <span className="spell-row-range">—</span>
                                <span className="spell-row-damage">—</span>
                                <span className="spell-row-area">—</span>
                                <span></span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="empty-rituals-state">
                    <p>{t('builder.noRituals') || 'No rituals learned yet.'}</p>
                </div>
            )}
        </div>
    );

    // Render Innate Spells tab
    const renderInnateSpellsTab = () => (
        <div className="spells-tab-content">
            <div className="innate-spells-header">
                <p className="innate-spells-description">
                    {t('builder.innateSpellsDescription') || 'Spells granted by your background, feats, or items that can be cast a limited number of times per day.'}
                </p>
            </div>

            {innateSpells.length > 0 ? (
                <div className="spell-level-group">
                    <div className="spell-rows">
                        <div className="spell-row-header">
                            <span className="spell-row-name">{t('spell.name') || 'Spell'}</span>
                            <span className="spell-row-actions">{t('spell.actions') || 'Actions'}</span>
                            <span className="spell-row-duration">{t('spell.duration') || 'Duration'}</span>
                            <span className="spell-row-range">{t('spell.range') || 'Range'}</span>
                            <span className="spell-row-damage">{t('spell.damage') || 'Damage'}</span>
                            <span className="spell-row-area">{t('spell.area') || 'Area'}</span>
                            <span className="spell-row-uses">{t('spell.uses') || 'Uses'}</span>
                            <span className="spell-row-cast">{t('actions.cast') || 'Cast'}</span>
                        </div>
                        {innateSpells.map(({ spell, uses, maxUses }) => {
                            const hasUseAvailable = uses > 0;
                            const isUnlimited = maxUses >= 999;

                            return (
                                <div key={spell.id} className="spell-row" onClick={(e) => handleOpenDiceBoxForSpell(spell, e)}>
                                    <span className="spell-row-name">
                                        <span className="spell-name-text">{spell.name}</span>
                                    </span>
                                    <span className="spell-row-actions">{renderSpellActionIcon(spell.castTime)}</span>
                                    <span className="spell-row-duration">{spell.duration || '—'}</span>
                                    <span className="spell-row-range">{spell.range || '—'}</span>
                                    <span className="spell-row-damage">{spell.damage || '—'}</span>
                                    <span className="spell-row-area">{spell.area || '—'}</span>
                                    <span className="spell-row-uses">
                                        {isUnlimited ? <span className="cantrip-indicator">∞</span> : `${uses}/${maxUses}`}
                                    </span>
                                    <span className="spell-row-cast">
                                        <button
                                            className={`spell-cast-btn innate-spell ${!hasUseAvailable && !isUnlimited ? 'disabled' : ''}`}
                                            onClick={(e) => handleConsumeInnateSpellUse(spell.id, e)}
                                            disabled={!hasUseAvailable && !isUnlimited}
                                            title={isUnlimited
                                                ? (t('actions.castInnateSpell') || 'Cast innate spell')
                                                : hasUseAvailable
                                                    ? (t('actions.castInnateSpell') || `Cast innate spell (1 use)`)
                                                    : (t('spell.noUsesAvailable') || 'No uses available')}
                                        >
                                            {t('actions.cast') || 'Cast'}
                                        </button>
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="empty-innate-state">
                    <p>{t('builder.noInnateSpells') || 'No innate spells yet.'}</p>
                </div>
            )}
        </div>
    );

    return (
        <div className="spells-panel pathbuilder-style">
            {/* Sub-tabs Navigation */}
            <div className="spell-subtabs">
                {hasClassSpellcasting && (
                    <button
                        className={`subtab-btn ${activeSubTab === 'class' ? 'active' : ''}`}
                        onClick={() => setActiveSubTab('class')}
                    >
                        {className}
                    </button>
                )}
                <button
                    className={`subtab-btn ${activeSubTab === 'focus' ? 'active' : ''}`}
                    onClick={() => setActiveSubTab('focus')}
                >
                    {t('tabs.focusSpells') || 'Focus Spells'}
                </button>
                <button
                    className={`subtab-btn ${activeSubTab === 'rituals' ? 'active' : ''}`}
                    onClick={() => setActiveSubTab('rituals')}
                >
                    {t('tabs.rituals') || 'Rituals'}
                </button>
                <button
                    className={`subtab-btn ${activeSubTab === 'innate' ? 'active' : ''}`}
                    onClick={() => setActiveSubTab('innate')}
                >
                    {t('tabs.innateSpells') || 'Innate Spells'}
                </button>
            </div>

            {/* Tab Content */}
            {activeSubTab === 'class' && hasClassSpellcasting && renderClassSpellsTab()}
            {activeSubTab === 'focus' && renderFocusSpellsTab()}
            {activeSubTab === 'rituals' && renderRitualsTab()}
            {activeSubTab === 'innate' && renderInnateSpellsTab()}

            {/* Spell Browser Modal */}
            {showBrowser && renderSpellBrowser()}

            {/* Esoteric Polymath Modal */}
            {hasEsotericPolymathFeat && (
                <EsotericPolymathModal
                    isOpen={showEsotericPolymathModal}
                    onClose={() => setShowEsotericPolymathModal(false)}
                    character={character}
                    onCharacterUpdate={onCharacterUpdate}
                />
            )}

            {/* Deep Lore Modal */}
            {hasDeepLoreFeat && (
                <DeepLoreModal
                    isOpen={showDeepLoreModal}
                    onClose={() => setShowDeepLoreModal(false)}
                    character={character}
                    onCharacterUpdate={onCharacterUpdate}
                />
            )}

            {/* Spell Details Modal */}
            {viewingSpell && (
                <div className="modal-overlay" onClick={() => setViewingSpell(null)}>
                    <div className="spell-detail-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{viewingSpell.name}</h3>
                            <button className="modal-close" onClick={() => setViewingSpell(null)}>×</button>
                        </div>
                        <div className="spell-detail-content">
                            <div className="spell-detail-header-row">
                                <div className="spell-detail-title-section">
                                    <div className="spell-badges">
                                        <span className="spell-rank-badge">
                                            {viewingSpell.rank === 0 ? 'Cantrip' : `Rank ${viewingSpell.rank}`}
                                        </span>
                                        {viewingSpell.traditions.map(trad => (
                                            <span key={trad} className={`tradition-tag ${trad}`}>{trad}</span>
                                        ))}
                                    </div>
                                </div>

                                {viewingSpell.traits.length > 0 && (
                                    <div className="spell-detail-traits">
                                        {viewingSpell.traits.map(trait => (
                                            <span key={trait} className="trait-tag">{trait}</span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="spell-detail-stats-grid">
                                <div className="detail-stat-box">
                                    <span className="stat-label">{t('spell.cast') || 'Cast'}</span>
                                    <div className="stat-value-row">
                                        {renderSpellActionIcon(viewingSpell.castTime)}
                                        {(!['1', '2', '3', 'free', 'reaction'].includes(getSpellActionCost(viewingSpell.castTime) || '')) && (
                                            <span className="cast-text">{viewingSpell.castTime}</span>
                                        )}
                                    </div>
                                </div>

                                {viewingSpell.range && (
                                    <div className="detail-stat-box">
                                        <span className="stat-label">{t('spell.range') || 'Range'}</span>
                                        <span className="stat-value">{viewingSpell.range}</span>
                                    </div>
                                )}

                                {viewingSpell.area && (
                                    <div className="detail-stat-box">
                                        <span className="stat-label">{t('spell.area') || 'Area'}</span>
                                        <span className="stat-value">{viewingSpell.area}</span>
                                    </div>
                                )}

                                {viewingSpell.duration && (
                                    <div className="detail-stat-box">
                                        <span className="stat-label">{t('spell.duration') || 'Duration'}</span>
                                        <span className="stat-value">{viewingSpell.duration}</span>
                                    </div>
                                )}

                                {viewingSpell.save && (
                                    <div className="detail-stat-box">
                                        <span className="stat-label">{t('spell.save') || 'Save'}</span>
                                        <span className="stat-value">{viewingSpell.save}</span>
                                    </div>
                                )}

                                {viewingSpell.damage && (
                                    <div className="detail-stat-box full-width">
                                        <span className="stat-label">{t('spell.damage') || 'Damage'}</span>
                                        <span className="stat-value damage-text">{viewingSpell.damage}</span>
                                    </div>
                                )}
                            </div>

                            <p className="spell-description">{cleanDescriptionForDisplay(viewingSpell.rawDescription || viewingSpell.description)}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpellsPanel;
