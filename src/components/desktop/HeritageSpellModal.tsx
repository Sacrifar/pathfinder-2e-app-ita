import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { getSpells } from '../../data/pf2e-loader';
import type { LoadedSpell } from '../../data/pf2e-loader';
import {
    getInnateSpellSource,
    hasSpellSelection,
    getSpellSelection,
    filterSpellsByConfig,
} from '../../data/innateSpellSources';

interface HeritageSpellModalProps {
    isOpen: boolean;
    heritageId: string;
    onClose: () => void;
    onApply: (spellId: string) => void;
}

export const HeritageSpellModal: React.FC<HeritageSpellModalProps> = ({
    isOpen,
    heritageId,
    onClose,
    onApply,
}) => {
    const { t } = useLanguage();
    const [selectedSpellId, setSelectedSpellId] = useState<string | null>(null);

    // Load all cantrips (rank 0)
    const allCantrips = useMemo(() => {
        const spells = getSpells();
        return spells.filter(s => s.rank === 0);
    }, []);

    // Get the heritage configuration
    const heritageConfig = useMemo(() => {
        return getInnateSpellSource(heritageId);
    }, [heritageId]);

    // Filter cantrips based on heritage spell selection configuration
    const availableSpells = useMemo(() => {
        if (!heritageConfig || !hasSpellSelection(heritageId)) return [];

        const selection = getSpellSelection(heritageId);
        if (!selection) return [];

        // Get the filtered spell IDs using the configuration
        const filteredIds = filterSpellsByConfig(allCantrips, selection.filter);

        // Return the full spell objects for the filtered IDs
        return allCantrips.filter(s => filteredIds.includes(s.id));
    }, [heritageConfig, heritageId, allCantrips]);

    // Group spells by tradition for display
    const spellsByTradition = useMemo(() => {
        const groups: Record<string, LoadedSpell[]> = {};
        const allowedTraditions = heritageConfig?.spellSelection?.filter?.traditions;

        // If a specific output tradition is forced (e.g. "Cast as arcane innate spell"),
        // use that for grouping instead of the spell's original traditions?
        // Actually, usually we catch the original tradition.
        // But if we filter by traditions, we should only show those buckets.

        for (const spell of availableSpells) {
            for (const tradition of spell.traditions) {
                // If strict tradition filtering is active, only show allowed traditions
                // This prevents multi-tradition spells (e.g. Arcane/Divine) from showing up under Divine
                // when we only asked for Arcane spells.
                if (allowedTraditions && allowedTraditions.length > 0) {
                    if (!allowedTraditions.includes(tradition as any)) {
                        continue;
                    }
                }

                if (!groups[tradition]) {
                    groups[tradition] = [];
                }
                if (!groups[tradition].find(s => s.id === spell.id)) {
                    groups[tradition].push(spell);
                }
            }
        }
        return groups;
    }, [availableSpells, heritageConfig]);

    if (!isOpen || !heritageConfig) return null;

    const handleApply = () => {
        if (selectedSpellId) {
            onApply(selectedSpellId);
            onClose();
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const getTraditionLabel = (tradition: string): string => {
        const labels: Record<string, string> = {
            'arcane': t('traditions.arcane') || 'Arcane',
            'divine': t('traditions.divine') || 'Divine',
            'occult': t('traditions.occult') || 'Occult',
            'primal': t('traditions.primal') || 'Primal',
        };
        return labels[tradition] || tradition;
    };

    const traditionOrder = ['arcane', 'divine', 'occult', 'primal'];

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="selection-modal heritage-spell-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{t('builder.chooseHeritageSpell') || 'Choose Your Heritage Spell'}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="heritage-spell-content">
                    <p className="heritage-spell-description">
                        {heritageConfig.nameIt ? `${heritageConfig.name} (${heritageConfig.nameIt})` : heritageConfig.name}
                    </p>

                    {Object.entries(spellsByTradition).length === 0 ? (
                        <div className="empty-state">
                            <p>{t('builder.noHeritageSpells') || 'No spells available for this heritage.'}</p>
                        </div>
                    ) : (
                        <div className="heritage-spells-list">
                            {traditionOrder
                                .filter(trad => spellsByTradition[trad])
                                .map(tradition => (
                                    <div key={tradition} className="tradition-group">
                                        <h4 className="tradition-header">
                                            {getTraditionLabel(tradition)}
                                        </h4>
                                        <div className="spells-grid">
                                            {spellsByTradition[tradition]
                                                .sort((a, b) => a.name.localeCompare(b.name))
                                                .map(spell => (
                                                    <button
                                                        key={spell.id}
                                                        className={`spell-card ${selectedSpellId === spell.id ? 'selected' : ''}`}
                                                        onClick={() => setSelectedSpellId(spell.id)}
                                                    >
                                                        <div className="spell-name">{spell.name}</div>
                                                        <div className="spell-traits">
                                                            {spell.traits.slice(0, 2).map(trait => (
                                                                <span key={trait} className="badge trait">{trait}</span>
                                                            ))}
                                                        </div>
                                                    </button>
                                                ))}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}

                    {selectedSpellId && (
                        <div className="selected-spell-preview">
                            {(() => {
                                const spell = availableSpells.find(s => s.id === selectedSpellId);
                                if (!spell) return null;
                                return (
                                    <div className="spell-preview">
                                        <h4>{spell.name}</h4>
                                        <div className="spell-meta">
                                            <span className="badge trait">{spell.rank === 0 ? 'Cantrip' : `Rank ${spell.rank}`}</span>
                                            <span className="spell-time">{spell.castTime}</span>
                                            {spell.range && <span className="spell-range">{spell.range}</span>}
                                        </div>
                                        <p className="spell-description">
                                            {spell.description?.substring(0, 200)}
                                            {spell.description?.length > 200 ? '...' : ''}
                                        </p>
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="modal-btn modal-btn-secondary" onClick={onClose}>
                        {t('actions.cancel') || 'Cancel'}
                    </button>
                    <button
                        className="modal-btn modal-btn-primary"
                        onClick={handleApply}
                        disabled={!selectedSpellId}
                    >
                        {t('actions.apply') || 'Apply'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HeritageSpellModal;
