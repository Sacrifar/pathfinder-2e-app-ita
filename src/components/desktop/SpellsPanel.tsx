import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useDiceRoller } from '../../hooks/useDiceRoller';
import { Character, Proficiency, InnateSpell } from '../../types';
import { getSpells, LoadedSpell, cleanDescriptionForDisplay } from '../../data/pf2e-loader';
import { extractDamageFromDescription, simplifyFoundryFormula } from '../../utils/pf2e-math';
import { getCantripsKnown, getSpellsKnown } from '../../data/spellSlotProgression';
import { getClassNameById } from '../../data/classSpecializations';

interface SpellsPanelProps {
    character: Character;
    onCastSpell: (spellId: string) => void;
    onAddSpell: () => void;
}

type SpellSubTab = 'class' | 'focus' | 'rituals' | 'innate';

// Action icon mapping
const getActionIcon = (castTime: string): string => {
    const time = castTime.toLowerCase();
    if (time === '1' || time === 'single action') return '◆';
    if (time === '2' || time === 'two actions' || time === '2 actions') return '◆◆';
    if (time === '3' || time === 'three actions' || time === '3 actions') return '◆◆◆';
    if (time === 'free' || time === 'free action') return '◇';
    if (time === 'reaction') return '⟳';
    // For longer cast times like "1 minute", "10 minutes", etc.
    if (time.includes('minute') || time.includes('hour')) return '⏱';
    return '◆◆'; // Default to 2 actions
};

export const SpellsPanel: React.FC<SpellsPanelProps> = ({
    character,
    onCastSpell,
    onAddSpell: _onAddSpell,
}) => {
    const { t } = useLanguage();
    const { rollDice } = useDiceRoller();
    const [activeSubTab, setActiveSubTab] = useState<SpellSubTab>('class');
    const [showBrowser, setShowBrowser] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [rankFilter, setRankFilter] = useState<number | 'all'>('all');
    const [traditionFilter, setTraditionFilter] = useState<string>('all');
    const [selectedSpell, setSelectedSpell] = useState<LoadedSpell | null>(null);

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

        // Filter by tradition (default to character's tradition)
        const tradToFilter = traditionFilter !== 'all' ? traditionFilter : character.spellcasting?.tradition;
        if (tradToFilter) {
            spells = spells.filter(s => s.traditions.includes(tradToFilter));
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
    }, [allSpells, rankFilter, traditionFilter, searchQuery, character.spellcasting?.tradition]);

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
        return spellcasting.knownSpells.filter(spellId => {
            const normalizedId = spellId.toLowerCase().replace(/\s+/g, '-');
            // Check if this ID exists in the actual spell database
            return validSpellIds.has(normalizedId) ||
                allSpells.some(s => s.id.toLowerCase() === normalizedId);
        });
    }, [spellcasting.knownSpells, validSpellIds, allSpells]);

    // Calculate spells known limits for spontaneous casters
    const spellsKnownLimits = useMemo(() => {
        if (spellcasting.spellcastingType === 'spontaneous') {
            return getSpellsKnown(character.classId, character.level || 1);
        }
        return {};
    }, [character.classId, character.level, spellcasting.spellcastingType]);

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

    // Handle spell casting with damage rolls
    const handleSpellCast = (spellId: string) => {
        const spell = getSpellFromSlug(spellId);
        if (!spell) return;

        // Call the original onCastSpell callback
        onCastSpell(spellId);

        // Extract damage from spell description if present
        const description = spell.rawDescription || spell.description;
        const damages = extractDamageFromDescription(description);

        if (damages && damages.length > 0) {
            // Simplify damage formulas using character data
            const simplifiedDamages = damages.map(d => simplifyFoundryFormula(d, character));

            // Extract element from traits for colored dice
            const element = extractElementFromTraits(spell.traits);

            if (simplifiedDamages.length === 1) {
                // Single damage type
                rollDice(simplifiedDamages[0], `${spell.name} - ${t('weapons.damageRoll') || 'Damage'}`, { element });
            } else {
                // Multiple damage types - combine them
                const combinedDamage = simplifiedDamages.join(' + ');
                rollDice(combinedDamage, `${spell.name} - ${t('weapons.damageRoll') || 'Damage'}`, { element });
            }
        }
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
                                <div className="spell-detail-header">
                                    <h4>{selectedSpell.name}</h4>
                                    <span className="spell-rank-badge">
                                        {selectedSpell.rank === 0 ? 'Cantrip' : `Rank ${selectedSpell.rank}`}
                                    </span>
                                </div>
                                <div className="spell-traditions-row">
                                    {selectedSpell.traditions.map(trad => (
                                        <span key={trad} className={`tradition-tag ${trad}`}>{trad}</span>
                                    ))}
                                </div>
                                <div className="spell-detail-grid">
                                    <div className="detail-row">
                                        <span className="detail-label">{t('spell.cast') || 'Cast'}</span>
                                        <span className="detail-value">{getActionIcon(selectedSpell.castTime)} {selectedSpell.castTime}</span>
                                    </div>
                                    {selectedSpell.range && (
                                        <div className="detail-row">
                                            <span className="detail-label">{t('spell.range') || 'Range'}</span>
                                            <span className="detail-value">{selectedSpell.range}</span>
                                        </div>
                                    )}
                                    {selectedSpell.area && (
                                        <div className="detail-row">
                                            <span className="detail-label">{t('spell.area') || 'Area'}</span>
                                            <span className="detail-value">{selectedSpell.area}</span>
                                        </div>
                                    )}
                                    {selectedSpell.duration && (
                                        <div className="detail-row">
                                            <span className="detail-label">{t('spell.duration') || 'Duration'}</span>
                                            <span className="detail-value">{selectedSpell.duration}</span>
                                        </div>
                                    )}
                                    {selectedSpell.save && (
                                        <div className="detail-row">
                                            <span className="detail-label">{t('spell.save') || 'Save'}</span>
                                            <span className="detail-value">{selectedSpell.save}</span>
                                        </div>
                                    )}
                                    {selectedSpell.damage && (
                                        <div className="detail-row">
                                            <span className="detail-label">{t('spell.damage') || 'Damage'}</span>
                                            <span className="detail-value damage-value">{selectedSpell.damage}</span>
                                        </div>
                                    )}
                                </div>
                                {selectedSpell.traits.length > 0 && (
                                    <div className="spell-traits-section">
                                        <div className="traits-list">
                                            {selectedSpell.traits.map(trait => (
                                                <span key={trait} className="trait-tag">{trait}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <p className="spell-description">{cleanDescriptionForDisplay(selectedSpell.rawDescription || selectedSpell.description)}</p>
                                <button className="add-spell-btn" onClick={() => {
                                    // TODO: Add spell to character
                                    setShowBrowser(false);
                                    setSelectedSpell(null);
                                }}>
                                    + {t('actions.learnSpell') || 'Learn Spell'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Render a spell row in Pathbuilder style
    const renderSpellRow = (spell: LoadedSpell, isPlaceholder = false) => {
        if (isPlaceholder) {
            return (
                <div className="spell-row placeholder" onClick={() => setShowBrowser(true)}>
                    <span className="spell-row-name">{t('spell.notSelected') || 'Not Selected'}</span>
                    <span className="spell-row-actions">—</span>
                    <span className="spell-row-duration">—</span>
                    <span className="spell-row-range">—</span>
                </div>
            );
        }

        return (
            <div className="spell-row" onClick={() => handleSpellCast(spell.id)}>
                <span className="spell-row-name">{spell.name}</span>
                <span className="spell-row-actions">{getActionIcon(spell.castTime)}</span>
                <span className="spell-row-duration">{spell.duration || '—'}</span>
                <span className="spell-row-range">{spell.range || '—'}</span>
            </div>
        );
    };

    // Render spell level group with fire icons for slots
    const renderSpellLevelGroup = (level: number, spells: LoadedSpell[], limit: number) => {
        const slotData = spellcasting.spellSlots[level];
        const slotsAvailable = slotData ? slotData.max - slotData.used : 0;
        const slotsMax = slotData?.max || 0;

        // Calculate empty slots (placeholders)
        const emptySlots = Math.max(0, limit - spells.length);

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
                    </div>
                    {spells.map(spell => renderSpellRow(spell))}
                    {Array.from({ length: emptySlots }, (_, i) => (
                        <div key={`empty-${i}`}>
                            {renderSpellRow(null as any, true)}
                        </div>
                    ))}
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
            </div>

            {/* Spell Level Groups */}
            <div className="spell-levels-container">
                {/* Cantrips */}
                {renderSpellLevelGroup(0, knownSpellsByLevel[0] || [], cantripsKnownLimit)}

                {/* Ranked Spells */}
                {slotLevels.filter(l => l > 0).map(level => {
                    const limit = spellsKnownLimits[level] || spellcasting.spellSlots[level]?.max || 0;
                    return renderSpellLevelGroup(level, knownSpellsByLevel[level] || [], limit);
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
                        </div>
                        {rituals.map(spell => (
                            <div key={spell.id} className="spell-row">
                                <span className="spell-row-name">{spell.name}</span>
                                <span className="spell-row-actions">{spell.rank}</span>
                                <span className="spell-row-duration">{spell.castTime}</span>
                                <span className="spell-row-range">—</span>
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
                            <span className="spell-row-uses">{t('spell.uses') || 'Uses'}</span>
                        </div>
                        {innateSpells.map(({ spell, uses, maxUses, source }) => (
                            <div key={spell.id} className="spell-row">
                                <span className="spell-row-name">
                                    {spell.name}
                                    <span className="spell-source">{source}</span>
                                </span>
                                <span className="spell-row-actions">{getActionIcon(spell.castTime)}</span>
                                <span className="spell-row-duration">{spell.duration || '—'}</span>
                                <span className="spell-row-range">{spell.range || '—'}</span>
                                <span className="spell-row-uses">
                                    {uses}/{maxUses}
                                </span>
                            </div>
                        ))}
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
                <button
                    className={`subtab-btn ${activeSubTab === 'class' ? 'active' : ''}`}
                    onClick={() => setActiveSubTab('class')}
                >
                    {className}
                </button>
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
            {activeSubTab === 'class' && renderClassSpellsTab()}
            {activeSubTab === 'focus' && renderFocusSpellsTab()}
            {activeSubTab === 'rituals' && renderRitualsTab()}
            {activeSubTab === 'innate' && renderInnateSpellsTab()}

            {/* Spell Browser Modal */}
            {showBrowser && renderSpellBrowser()}
        </div>
    );
};

export default SpellsPanel;
