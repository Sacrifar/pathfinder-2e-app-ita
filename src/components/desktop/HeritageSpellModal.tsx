import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { getSpells } from '../../data/pf2e-loader';
import type { LoadedSpell } from '../../data/pf2e-loader';
import { isInnateSpellSource, INNATE_SPELL_SOURCES } from '../../data/innateSpellSources';

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
        return INNATE_SPELL_SOURCES[heritageId];
    }, [heritageId]);

    // Filter cantrips based on heritage requirements
    const availableSpells = useMemo(() => {
        if (!heritageConfig) return [];

        const heritageName = heritageId;

        // Fey-Touched Gnome: any primal cantrip
        if (heritageName === 'fey-touched-gnome') {
            return allCantrips.filter(s => s.traditions.includes('primal'));
        }

        // Wellspring Gnome: any arcane, divine, or occult cantrip
        if (heritageName === 'wellspring-gnome') {
            return allCantrips.filter(s =>
                s.traditions.includes('arcane') ||
                s.traditions.includes('divine') ||
                s.traditions.includes('occult')
            );
        }

        // Budding Speaker Centaur: divine or primal cantrip
        if (heritageName === 'budding-speaker-centaur') {
            return allCantrips.filter(s =>
                s.traditions.includes('divine') ||
                s.traditions.includes('primal')
            );
        }

        // Makari Lizardfolk: Divine Lance or Forbidding Ward only
        if (heritageName === 'makari-lizardfolk') {
            return allCantrips.filter(s =>
                s.id === 'rLyDaYQDEP0eTmCU' || // Divine Lance
                s.id === 'm2nqgMfHJLhmDxLQ'  // Forbidding Ward
            );
        }

        // Born of Elements: 8 specific primal cantrips
        if (heritageName === 'born-of-elements') {
            const elementalCantrips = [
                'GmgcigXsYuHQBycY', // Electric Arc
                'VSqoZOdBBdnadMAy', // Frostbite
                '6DfLZBl8wKIV03Iq', // Ignition
                'xMzVFcex3tBQVYvM', // Needle Darts
                'Rnm5T6b0YTXWR8Cu', // Timber
                'hRk79AWmEc3mzJus', // Scatter Scree
                'DYYl1L5HgDh0T9vD', // Slashing Gust
                'dA4k8qvqsLDStQsZ', // Spout
            ];
            return allCantrips.filter(s => elementalCantrips.includes(s.id));
        }

        // Born of Celestial: any divine cantrip
        if (heritageName === 'born-of-celestial') {
            return allCantrips.filter(s => s.traditions.includes('divine'));
        }

        // Respite of Loam and Leaf: any primal cantrip
        if (heritageName === 'respite-of-loam-and-leaf') {
            return allCantrips.filter(s => s.traditions.includes('primal'));
        }

        // Rite of Invocation: arcane or occult cantrip
        if (heritageName === 'rite-of-invocation') {
            return allCantrips.filter(s =>
                s.traditions.includes('arcane') ||
                s.traditions.includes('occult')
            );
        }

        // Mage Automaton: any arcane cantrip
        if (heritageName === 'mage-automaton') {
            return allCantrips.filter(s => s.traditions.includes('arcane'));
        }

        // Oracular Samsaran: arcane, divine, or occult cantrip
        if (heritageName === 'oracular-samsaran') {
            return allCantrips.filter(s =>
                s.traditions.includes('arcane') ||
                s.traditions.includes('divine') ||
                s.traditions.includes('occult')
            );
        }

        // Spellkeeper Shisk: occult or primal cantrip
        if (heritageName === 'spellkeeper-shisk') {
            return allCantrips.filter(s =>
                s.traditions.includes('occult') ||
                s.traditions.includes('primal')
            );
        }

        // Forge-Blessed Dwarf: specific spells based on deity
        // This would need deity selection, so for now return empty
        if (heritageName === 'forge-blessed-dwarf') {
            return [];
        }

        return [];
    }, [heritageConfig, allCantrips, heritageId]);

    // Group spells by tradition for display
    const spellsByTradition = useMemo(() => {
        const groups: Record<string, LoadedSpell[]> = {};
        for (const spell of availableSpells) {
            for (const tradition of spell.traditions) {
                if (!groups[tradition]) {
                    groups[tradition] = [];
                }
                if (!groups[tradition].find(s => s.id === spell.id)) {
                    groups[tradition].push(spell);
                }
            }
        }
        return groups;
    }, [availableSpells]);

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
