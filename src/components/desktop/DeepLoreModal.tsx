import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useLocalizedName } from '../../hooks/useLanguage';
import '../../styles/deep-lore.css';
import { DetailModal } from './DetailModal';
import { Character } from '../../types/character';
import {
    hasDeepLore,
    getMaxSpellRank,
    getDeepLoreExtraSpells,
    getAvailableSpellsForDeepLore,
    setDeepLoreExtraSpell,
} from '../../utils/deepLore';
import { getSpells, LoadedSpell } from '../../data/pf2e-loader';

interface DeepLoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    character: Character;
    onCharacterUpdate: (character: Character) => void;
}

export const DeepLoreModal: React.FC<DeepLoreModalProps> = ({
    isOpen,
    onClose,
    character,
    onCharacterUpdate,
}) => {
    const { t } = useLanguage();
    const getLocalizedName = useLocalizedName();

    const [selectedRank, setSelectedRank] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const allSpells = useMemo(() => getSpells(), []);
    const maxRank = useMemo(() => getMaxSpellRank(character), [character]);
    const extraSpells = useMemo(() => getDeepLoreExtraSpells(character), [character]);

    // Initialize spellbook data if not present
    React.useMemo(() => {
        if (isOpen && hasDeepLore(character) && !character.spellbook?.deepLore) {
            onCharacterUpdate({
                ...character,
                spellbook: {
                    ...character.spellbook,
                    deepLore: { extraSpells: {} },
                },
            });
        }
    }, [isOpen, character]);

    // Get available spells for the selected rank
    const availableSpells = useMemo(() => {
        if (selectedRank === null) return [];

        const spells = getAvailableSpellsForDeepLore(character, selectedRank);

        return spells.filter(spell => {
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                return spell.name.toLowerCase().includes(q) ||
                    spell.traits.some(t => t.toLowerCase().includes(q));
            }
            return true;
        });
    }, [character, selectedRank, searchQuery]);

    // Get spell details for a selected spell
    const getSpellById = (spellId: string): LoadedSpell | undefined => {
        return allSpells.find(s => s.id === spellId);
    };

    // Handle selecting a spell for a rank
    const handleSelectSpell = (spellId: string) => {
        if (selectedRank === null) return;

        const updated = setDeepLoreExtraSpell(character, selectedRank, spellId);
        onCharacterUpdate(updated);
        setSelectedRank(null); // Close the browser after selection
        setSearchQuery('');
    };

    // Handle removing a spell from a rank
    const handleRemoveSpell = (rank: number, event: React.MouseEvent) => {
        event.stopPropagation();

        const updated = setDeepLoreExtraSpell(character, rank, null);
        onCharacterUpdate(updated);
    };

    return (
        <DetailModal
            isOpen={isOpen}
            onClose={onClose}
            title={t('deepLore.title') || 'Deep Lore'}
            subtitle={t('deepLore.subtitle') || 'Select one extra spell of each rank to add to your repertoire'}
            actions={
                <div className="modal-actions">
                    <button className="btn-primary" onClick={onClose}>
                        {t('actions.close') || 'Close'}
                    </button>
                </div>
            }
        >
            <div className="deep-lore-modal-content">
                <p className="deep-lore-description">
                    {t('deepLore.description') ||
                        'Your studies of the occult have granted you access to hidden magical knowledge. ' +
                        'Select one extra spell of each rank you can cast. These spells are added directly to your repertoire.'}
                </p>

                {/* Rank Selection Grid */}
                <div className="rank-grid">
                    {Array.from({ length: maxRank }, (_, i) => i + 1).map(rank => {
                        const spellId = extraSpells[rank];
                        const spell = spellId ? getSpellById(spellId) : undefined;
                        const isSelected = selectedRank === rank;

                        return (
                            <div
                                key={rank}
                                className={`rank-card ${isSelected ? 'selected' : ''}`}
                                onClick={() => setSelectedRank(isSelected ? null : rank)}
                            >
                                <div className="rank-header">
                                    <span className="rank-number">{t('deepLore.rank') || 'Rank'} {rank}</span>
                                    {spell && (
                                        <button
                                            className="remove-spell-btn"
                                            onClick={(e) => handleRemoveSpell(rank, e)}
                                            title={t('deepLore.remove') || 'Remove spell'}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>

                                {spell ? (
                                    <div className="rank-spell-info">
                                        <h4 className="spell-name">{getLocalizedName(spell)}</h4>
                                        <div className="spell-traits">
                                            {spell.traits?.slice(0, 3).map((trait: string) => (
                                                <span key={trait} className="trait-badge">
                                                    {trait}
                                                </span>
                                            ))}
                                        </div>
                                        <p
                                            className="spell-description"
                                            dangerouslySetInnerHTML={{
                                                __html: spell.description.slice(0, 150) + (spell.description.length > 150 ? '...' : ''),
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="rank-empty">
                                        <span className="empty-icon">+</span>
                                        <span className="empty-text">
                                            {t('deepLore.selectSpell') || 'Select a spell'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Spell Browser for selected rank */}
                {selectedRank !== null && (
                    <div className="spell-browser-overlay" onClick={() => setSelectedRank(null)}>
                        <div className="spell-browser-panel" onClick={(e) => e.stopPropagation()}>
                            <div className="browser-header">
                                <h3>
                                    {t('deepLore.selectRank') || 'Select'} {t('deepLore.rank') || 'Rank'} {selectedRank} {t('deepLore.spell') || 'Spell'}
                                </h3>
                                <button
                                    className="close-browser-btn"
                                    onClick={() => setSelectedRank(null)}
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
                                    autoFocus
                                />
                            </div>

                            <div className="browser-spell-list">
                                {availableSpells.length === 0 ? (
                                    <p className="no-results">
                                        {t('search.noResults') || 'No spells found'}
                                    </p>
                                ) : (
                                    availableSpells.map(spell => (
                                        <div
                                            key={spell.id}
                                            className="browser-spell-item"
                                            onClick={() => handleSelectSpell(spell.id)}
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
        </DetailModal>
    );
};

export default DeepLoreModal;
