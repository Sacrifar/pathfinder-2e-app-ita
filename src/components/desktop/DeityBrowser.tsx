/**
 * DeityBrowser Component
 * Browse and select deities for your character
 */

import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Deity } from '../../types/deity';
import { getDeities } from '../../data/deities';

interface DeityBrowserProps {
    onSelectDeity: (deity: Deity) => void;
    onClose: () => void;
}

export const DeityBrowser: React.FC<DeityBrowserProps> = ({
    onSelectDeity,
    onClose,
}) => {
    const { t, language } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [fontFilter, setFontFilter] = useState<'all' | 'heal' | 'harm' | 'both'>('all');
    const [selectedDeity, setSelectedDeity] = useState<Deity | null>(null);

    const allDeities = useMemo(() => getDeities(), []);

    // Filter deities
    const filteredDeities = useMemo(() => {
        let deities = allDeities;

        // Filter by font
        if (fontFilter !== 'all') {
            deities = deities.filter(d => d.font === fontFilter);
        }

        // Filter by search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            deities = deities.filter(d =>
                d.name.toLowerCase().includes(q) ||
                (d.nameIt && d.nameIt.toLowerCase().includes(q)) ||
                d.domains.some(domain => domain.toLowerCase().includes(q))
            );
        }

        return deities;
    }, [allDeities, alignmentFilter, fontFilter, searchQuery]);

    const getDeityName = (deity: Deity) => {
        return language === 'it' && deity.nameIt ? deity.nameIt : deity.name;
    };

    const getDomainTranslation = (domain: string): string => {
        const translations: Record<string, { en: string; it: string }> = {
            'Strength': { en: 'Strength', it: 'Forza' },
            'War': { en: 'War', it: 'Guerra' },
            'Zeal': { en: 'Zeal', it: 'Zelo' },
            'Good': { en: 'Good', it: 'Bontà' },
            'Law': { en: 'Law', it: 'Legge' },
            'Protection': { en: 'Protection', it: 'Protezione' },
            'Ambition': { en: 'Ambition', it: 'Ambizione' },
            'Evil': { en: 'Evil', it: 'Malvagità' },
            'Tyranny': { en: 'Tyranny', it: 'Tirannia' },
            'Creation': { en: 'Creation', it: 'Creazione' },
            'Dreams': { en: 'Dreams', it: 'Sogni' },
            'Luck': { en: 'Luck', it: 'Fortuna' },
            'Healing': { en: 'Healing', it: 'Guarigione' },
            'Nature': { en: 'Nature', it: 'Natura' },
            'Repose': { en: 'Repose', it: 'Reposo' },
            'Earth': { en: 'Earth', it: 'Terra' },
            'Wealth': { en: 'Wealth', it: 'Ricchezza' },
            'Water': { en: 'Water', it: 'Acqua' },
            'Weather': { en: 'Weather', it: 'Tempo atmosferico' },
            'Charm': { en: 'Charm', it: 'Carisma' },
            'Passion': { en: 'Passion', it: 'Passione' },
            'Trickery': { en: 'Trickery', it: 'Inganno' },
            'Darkness': { en: 'Darkness', it: 'Oscurità' },
            'Knowledge': { en: 'Knowledge', it: 'Conoscenza' },
            'Void': { en: 'Void', it: 'Vuoto' },
            'Perfection': { en: 'Perfection', it: 'Perfezione' },
            'Truth': { en: 'Truth', it: 'Verità' },
            'Madness': { en: 'Madness', it: 'Follia' },
            'Nightmares': { en: 'Nightmares', it: 'Incubi' },
            'Magic': { en: 'Magic', it: 'Magia' },
            'Death': { en: 'Death', it: 'Morte' },
            'Destruction': { en: 'Destruction', it: 'Distruzione' },
            'Fire': { en: 'Fire', it: 'Fuoco' },
            'Art': { en: 'Art', it: 'Arte' },
            'Love': { en: 'Love', it: 'Amore' },
            'Moon': { en: 'Moon', it: 'Luna' },
            'Undead': { en: 'Undead', it: 'Non morti' },
            'Pain': { en: 'Pain', it: 'Dolore' },
        };

        const translated = translations[domain];
        return translated ? (language === 'it' ? translated.it : translated.en) : domain;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="deity-browser-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{t('deity.selectDeity') || 'Select Deity'}</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="browser-filters">
                    <input
                        type="text"
                        placeholder={t('deity.searchDeities') || 'Search deities...'}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="search-input"
                    />

                    <div className="filter-row">
                        {/* Font Filter */}
                        <div className="font-filters">
                            <button
                                className={`filter-btn ${fontFilter === 'all' ? 'active' : ''}`}
                                onClick={() => setFontFilter('all')}
                            >
                                {t('deity.allFonts') || 'All Fonts'}
                            </button>
                            <button
                                className={`filter-btn font-btn heal ${fontFilter === 'heal' ? 'active' : ''}`}
                                onClick={() => setFontFilter('heal')}
                            >
                                {t('deity.fontHeal') || 'Heal'}
                            </button>
                            <button
                                className={`filter-btn font-btn harm ${fontFilter === 'harm' ? 'active' : ''}`}
                                onClick={() => setFontFilter('harm')}
                            >
                                {t('deity.fontHarm') || 'Harm'}
                            </button>
                            <button
                                className={`filter-btn font-btn both ${fontFilter === 'both' ? 'active' : ''}`}
                                onClick={() => setFontFilter('both')}
                            >
                                {t('deity.fontBoth') || 'Both'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="browser-content">
                    <div className="deity-list">
                        {filteredDeities.map(deity => (
                            <div
                                key={deity.id}
                                className={`deity-list-item ${selectedDeity?.id === deity.id ? 'selected' : ''}`}
                                onClick={() => setSelectedDeity(deity)}
                            >
                                <span className="deity-name">{getDeityName(deity)}</span>
                                <span className="deity-font">
                                    {deity.font === 'heal' && '✚'}
                                    {deity.font === 'harm' && '✝'}
                                    {deity.font === 'both' && '✚✝'}
                                </span>
                            </div>
                        ))}
                    </div>

                    {selectedDeity && (
                        <div className="deity-detail">
                            <div className="deity-detail-header">
                                <h4>{getDeityName(selectedDeity)}</h4>
                                <span className="deity-font-badge">
                                    {selectedDeity.font === 'heal' && '✚'}
                                    {selectedDeity.font === 'harm' && '✝'}
                                    {selectedDeity.font === 'both' && '✚✝'}
                                </span>
                            </div>

                            {selectedDeity.source && (
                                <div className="deity-source">{selectedDeity.source}</div>
                            )}

                            <div className="deity-detail-grid">
                                <div className="detail-row">
                                    <span className="detail-label">{t('deity.font') || 'Font'}</span>
                                    <span className="detail-value">
                                        {selectedDeity.font === 'heal' && (t('deity.fontHeal') || 'Heal')}
                                        {selectedDeity.font === 'harm' && (t('deity.fontHarm') || 'Harm')}
                                        {selectedDeity.font === 'both' && (t('deity.fontBoth') || 'Both')}
                                    </span>
                                </div>

                                <div className="detail-row">
                                    <span className="detail-label">{t('deity.favoredWeapon') || 'Favored Weapon'}</span>
                                    <span className="detail-value">
                                        {selectedDeity.favoredWeapon.nameIt && language === 'it'
                                            ? selectedDeity.favoredWeapon.nameIt
                                            : selectedDeity.favoredWeapon.name}
                                    </span>
                                </div>

                                {selectedDeity.skill && (
                                    <div className="detail-row">
                                        <span className="detail-label">{t('deity.skill') || 'Skill'}</span>
                                        <span className="detail-value">
                                            {selectedDeity.skill.nameIt && language === 'it'
                                                ? selectedDeity.skill.nameIt
                                                : selectedDeity.skill.name}
                                        </span>
                                    </div>
                                )}

                                <div className="detail-row domains-row">
                                    <span className="detail-label">{t('deity.domains') || 'Domains'}</span>
                                    <div className="detail-value domain-tags">
                                        {selectedDeity.domains.map(domain => (
                                            <span key={domain} className="domain-tag">
                                                {getDomainTranslation(domain)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {selectedDeity.edicts && selectedDeity.edicts.length > 0 && (
                                <div className="deity-edicts">
                                    <span className="edicts-label">{t('deity.edicts') || 'Edicts'}:</span>
                                    <ul>
                                        {selectedDeity.edicts.map((edict, i) => (
                                            <li key={i}>{edict}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {selectedDeity.anathema && selectedDeity.anathema.length > 0 && (
                                <div className="deity-anathema">
                                    <span className="anathema-label">{t('deity.anathema') || 'Anathema'}:</span>
                                    <ul>
                                        {selectedDeity.anathema.map((ana, i) => (
                                            <li key={i}>{ana}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {selectedDeity.description && (
                                <p className="deity-description">
                                    {selectedDeity.descriptionIt && language === 'it'
                                        ? selectedDeity.descriptionIt
                                        : selectedDeity.description}
                                </p>
                            )}

                            <button
                                className="select-deity-btn"
                                onClick={() => {
                                    onSelectDeity(selectedDeity);
                                    onClose();
                                }}
                            >
                                + {t('deity.select') || 'Select'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeityBrowser;
