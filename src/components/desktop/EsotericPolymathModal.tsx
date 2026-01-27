import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import '../../styles/esoteric-polymath.css';
import { DetailModal } from './DetailModal';
import { Character } from '../../types/character';
import {
    getEsotericPolymathAvailableSpells,
    setEsotericPolymathDailyPreparation,
    addSpellToEsotericPolymathBook,
    removeSpellFromEsotericPolymathBook,
    initializeEsotericPolymathSpellbook,
} from '../../utils/esotericPolymath';
import { useLocalizedName } from '../../hooks/useLanguage';
import { cleanDescriptionForDisplay, getSpells, LoadedSpell } from '../../data/pf2e-loader';

interface EsotericPolymathModalProps {
    isOpen: boolean;
    onClose: () => void;
    character: Character;
    onCharacterUpdate: (character: Character) => void;
}

type ModalTab = 'spellbook' | 'daily';

export const EsotericPolymathModal: React.FC<EsotericPolymathModalProps> = ({
    isOpen,
    onClose,
    character,
    onCharacterUpdate,
}) => {
    const { t } = useLanguage();
    const getLocalizedName = useLocalizedName();

    const [activeTab, setActiveTab] = useState<ModalTab>('spellbook');
    const [showSpellBrowser, setShowSpellBrowser] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [rankFilter, setRankFilter] = useState<number | 'all'>('all');

    const allSpells = useMemo(() => getSpells(), []);

    // Get all spells in the spellbook
    const spellbookSpells = useMemo(() => {
        return getEsotericPolymathAvailableSpells(character);
    }, [character]);

    // Get current daily preparation
    const currentDailyPrep = useMemo(() => {
        const dailyId = character.spellbook?.esotericPolymath?.dailyPreparation;
        if (!dailyId) return null;
        return spellbookSpells.find(s => s.spell.id === dailyId);
    }, [character, spellbookSpells]);

    // Filter occult spells for adding to spellbook
    const availableOccultSpells = useMemo(() => {
        const spellbookIds = new Set(spellbookSpells.map(s => s.spell.id));

        return allSpells
            .filter(spell => {
                // Must be occult tradition
                if (!spell.traditions.includes('occult')) return false;
                // Cantrips (rank 0) cannot be added
                if (spell.rank === 0) return false;
                // Already in spellbook
                if (spellbookIds.has(spell.id)) return false;
                // Rituals cannot be added
                if (spell.isRitual) return false;

                return true;
            })
            .filter(spell => {
                // Apply rank filter
                if (rankFilter !== 'all' && spell.rank !== rankFilter) return false;
                // Apply search
                if (searchQuery) {
                    const q = searchQuery.toLowerCase();
                    return spell.name.toLowerCase().includes(q) ||
                        spell.traits.some(t => t.toLowerCase().includes(q));
                }
                return true;
            })
            .slice(0, 50); // Limit for performance
    }, [allSpells, spellbookSpells, rankFilter, searchQuery]);

    // Initialize spellbook when modal opens (if not already initialized)
    useEffect(() => {
        if (isOpen && !character.spellbook?.esotericPolymath) {
            const initialized = initializeEsotericPolymathSpellbook(character);
            onCharacterUpdate(initialized);
        }
    }, [isOpen, character]);

    // Handle selecting daily preparation
    const handleSelectDailyPrep = (spellId: string) => {
        const updated = setEsotericPolymathDailyPreparation(character, spellId);
        onCharacterUpdate(updated);
    };

    // Handle clearing daily preparation
    const handleClearDailyPrep = () => {
        const updated = setEsotericPolymathDailyPreparation(character, null);
        onCharacterUpdate(updated);
    };

    // Handle adding spell to spellbook
    const handleAddSpell = (spellId: string) => {
        const updated = addSpellToEsotericPolymathBook(character, spellId);
        onCharacterUpdate(updated);
        setShowSpellBrowser(false);
    };

    // Handle removing spell from spellbook
    const handleRemoveSpell = (spellId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        const updated = removeSpellFromEsotericPolymathBook(character, spellId);
        onCharacterUpdate(updated);
    };

    return (
        <DetailModal
            isOpen={isOpen}
            onClose={onClose}
            title={t('esotericPolymath.title') || 'Esoteric Polymath'}
            subtitle={activeTab === 'spellbook'
                ? (t('esotericPolymath.spellbook') || 'Manage your spellbook')
                : (t('esotericPolymath.dailyPreparation') || 'Select your daily preparation spell')
            }
            actions={
                <div className="modal-actions">
                    <button className="btn-primary" onClick={onClose}>
                        {t('actions.close') || 'Close'}
                    </button>
                </div>
            }
        >
            <div className="esoteric-polymath-modal-content">
                {/* Tab Navigation */}
                <div className="esoteric-tabs">
                    <button
                        className={`esoteric-tab ${activeTab === 'spellbook' ? 'active' : ''}`}
                        onClick={() => setActiveTab('spellbook')}
                    >
                        📕 {t('esotericPolymath.spellbook') || 'Spellbook'} ({spellbookSpells.length})
                    </button>
                    <button
                        className={`esoteric-tab ${activeTab === 'daily' ? 'active' : ''}`}
                        onClick={() => setActiveTab('daily')}
                    >
                        ⭐ {t('esotericPolymath.dailyPreparation') || 'Daily Preparation'}
                        {currentDailyPrep && <span className="active-badge">✓</span>}
                    </button>
                </div>

                {/* Spellbook Tab */}
                {activeTab === 'spellbook' && (
                    <div className="esoteric-spellbook-tab">
                        <div className="spellbook-header">
                            <p className="spellbook-description">
                                {t('esotericPolymath.spellbookDescription') ||
                                    'Your spellbook contains all the occult spells you have learned. You can add new spells using the Occultism skill.'}
                            </p>
                            <button
                                className="btn-secondary"
                                onClick={() => setShowSpellBrowser(true)}
                                style={{ whiteSpace: 'nowrap' }}
                            >
                                + {t('esotericPolymath.addSpell') || 'Add Spell'}
                            </button>
                        </div>

                        {spellbookSpells.length === 0 ? (
                            <p className="no-spells-message">
                                {t('esotericPolymath.noSpells') || 'No spells in your spellbook yet.'}
                            </p>
                        ) : (
                            <div className="esoteric-spells-list" style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                gap: '12px'
                            }}>
                                {spellbookSpells.map(({ spell, isInRepertoire, effect }) => (
                                    <div key={spell.id} className="esoteric-spell-item" style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '100%'
                                    }}>
                                        <div className="spell-header">
                                            <h4 className="spell-name">
                                                {getLocalizedName(spell)}
                                                {isInRepertoire && (
                                                    <span className="repertoire-badge" title={t('esotericPolymath.inRepertoire')}>
                                                        ✓ {t('esotericPolymath.signature') || 'Signature'}
                                                    </span>
                                                )}
                                            </h4>
                                            <div className="spell-meta">
                                                <span className="spell-rank">Rank {spell.rank}</span>
                                                <button
                                                    className="remove-spell-btn"
                                                    onClick={(e) => handleRemoveSpell(spell.id, e)}
                                                    title={t('esotericPolymath.removeFromSpellbook') || 'Remove from spellbook'}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                        <div className="spell-traits">
                                            {spell.traits?.map((trait: string) => (
                                                <span key={trait} className="trait-badge">
                                                    {trait}
                                                </span>
                                            ))}
                                        </div>
                                        {/* Show effect description if not in repertoire, or if we want to explain what signature means */}
                                        <p className="spell-effect" style={{
                                            fontSize: '13px',
                                            color: 'var(--desktop-accent-blue)',
                                            margin: '0 0 8px 0'
                                        }}>
                                            {t(effect) || effect}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Spell Browser */}
                        {showSpellBrowser && (
                            <div className="spell-browser-overlay">
                                <div className="spell-browser-panel">
                                    <div className="browser-header">
                                        <h3>{t('esotericPolymath.addSpell') || 'Add Spell to Spellbook'}</h3>
                                        <button
                                            className="close-browser-btn"
                                            onClick={() => setShowSpellBrowser(false)}
                                        >
                                            ×
                                        </button>
                                    </div>

                                    <div className="browser-filters">
                                        <input
                                            type="text"
                                            placeholder={t('search.placeholder') || 'Search occult spells...'}
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            className="search-input"
                                        />
                                        <div className="rank-filters">
                                            <button
                                                className={`filter-btn ${rankFilter === 'all' ? 'active' : ''}`}
                                                onClick={() => setRankFilter('all')}
                                            >
                                                All
                                            </button>
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rank => (
                                                <button
                                                    key={rank}
                                                    className={`filter-btn ${rankFilter === rank ? 'active' : ''}`}
                                                    onClick={() => setRankFilter(rank)}
                                                >
                                                    {rank}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="browser-spell-list">
                                        {availableOccultSpells.length === 0 ? (
                                            <p className="no-results">
                                                {t('search.noResults') || 'No spells found'}
                                            </p>
                                        ) : (
                                            availableOccultSpells.map(spell => (
                                                <div
                                                    key={spell.id}
                                                    className="browser-spell-item"
                                                    onClick={() => handleAddSpell(spell.id)}
                                                >
                                                    <span className="spell-rank">{spell.rank}</span>
                                                    <span className="spell-name">{spell.name}</span>
                                                    <div className="spell-traits-mini">
                                                        {spell.traits.slice(0, 3).map(trait => (
                                                            <span key={trait} className="trait-badge-mini">
                                                                {trait}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Daily Preparation Tab */}
                {activeTab === 'daily' && (
                    <div className="esoteric-daily-tab">
                        <p className="daily-description">
                            {t('esotericPolymath.dailyDescription') ||
                                'During your daily preparations, choose any one spell from your book of occult spells.'}
                        </p>

                        {currentDailyPrep && (
                            <div className="current-prep-card">
                                <h4>{t('esotericPolymath.currentPrep') || 'Current Preparation'}</h4>
                                <div className="current-prep-spell">
                                    <strong>{getLocalizedName(currentDailyPrep.spell)}</strong>
                                    <span className="spell-rank">Rank {currentDailyPrep.spell.rank}</span>
                                </div>
                                <button
                                    className="btn-secondary"
                                    onClick={handleClearDailyPrep}
                                >
                                    {t('esotericPolymath.clear') || 'Clear Selection'}
                                </button>
                            </div>
                        )}

                        {spellbookSpells.length === 0 ? (
                            <p className="no-spells-message">
                                {t('esotericPolymath.noSpellsForDaily') || 'No spells in your spellbook. Add spells first.'}
                            </p>
                        ) : (
                            <div className="esoteric-spells-list">
                                <h4>{t('esotericPolymath.selectFromBook') || 'Select from Spellbook'}</h4>
                                {spellbookSpells.map(({ spell, isDailyPreparation, effect }) => (
                                    <div
                                        key={spell.id}
                                        className={`esoteric-spell-item ${isDailyPreparation ? 'selected' : ''}`}
                                        onClick={() => !isDailyPreparation && handleSelectDailyPrep(spell.id)}
                                    >
                                        <div className="spell-header">
                                            <h4 className="spell-name">{getLocalizedName(spell)}</h4>
                                            <div className="spell-meta">
                                                <span className="spell-rank">Rank {spell.rank}</span>
                                                {isDailyPreparation && (
                                                    <span className="daily-badge">
                                                        {t('esotericPolymath.current') || 'Current'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="spell-traits">
                                            {spell.traits?.map((trait: string) => (
                                                <span key={trait} className="trait-badge">
                                                    {trait}
                                                </span>
                                            ))}
                                        </div>
                                        <p className="spell-effect">{effect}</p>
                                        <div
                                            className="spell-description"
                                            dangerouslySetInnerHTML={{
                                                __html: cleanDescriptionForDisplay(spell.description),
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DetailModal>
    );
};

export default EsotericPolymathModal;
