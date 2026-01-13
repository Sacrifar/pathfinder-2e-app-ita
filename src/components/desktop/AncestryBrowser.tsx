import React, { useState, useMemo } from 'react';
import { ancestries, TranslatedAncestry } from '../../data';
import { useLanguage, useLocalizedName, useLocalizedDescription } from '../../hooks/useLanguage';
import '../../styles/desktop.css';

interface AncestryBrowserProps {
    currentAncestryId?: string;
    onClose: () => void;
    onSelect: (ancestryId: string) => void;
}

export const AncestryBrowser: React.FC<AncestryBrowserProps> = ({
    currentAncestryId,
    onClose,
    onSelect,
}) => {
    const { t } = useLanguage();
    const getName = useLocalizedName();
    const getDescription = useLocalizedDescription();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAncestry, setSelectedAncestry] = useState<TranslatedAncestry | null>(
        currentAncestryId ? ancestries.find(a => a.id === currentAncestryId) || null : null
    );

    const filteredAncestries = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return ancestries.filter(a =>
            a.name.toLowerCase().includes(q) ||
            a.nameIt?.toLowerCase().includes(q)
        );
    }, [searchQuery]);

    const handleSelect = () => {
        if (selectedAncestry) {
            onSelect(selectedAncestry.id);
        }
    };

    const formatBoosts = (boosts: string[]) => {
        return boosts.map(b => b === 'free' ? 'Free' : b.toUpperCase()).join(', ');
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="selection-modal ancestry-browser" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{t('builder.chooseAncestry') || 'Choose Ancestry'}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="browser-content">
                    <div className="browser-sidebar">
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder={t('search.placeholder') || 'Search...'}
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="selection-list">
                            {filteredAncestries.map(ancestry => (
                                <div
                                    key={ancestry.id}
                                    className={`selection-list-item ${selectedAncestry?.id === ancestry.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedAncestry(ancestry)}
                                >
                                    <div className="item-name">{getName(ancestry)}</div>
                                    <div className="item-badges">
                                        <span className="badge hp">HP {ancestry.hitPoints}</span>
                                        <span className="badge">{ancestry.size}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="browser-detail">
                        {selectedAncestry ? (
                            <div className="detail-content">
                                <div className="detail-header">
                                    <h3>{getName(selectedAncestry)}</h3>
                                    <div className="detail-badges">
                                        <span className="badge rarity">{selectedAncestry.rarity}</span>
                                        {selectedAncestry.traits.map(t => (
                                            <span key={t} className="badge trait">{t}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="stats-row">
                                    <div className="stat-item">
                                        <span className="stat-label">Hit Points</span>
                                        <span className="stat-value hp">{selectedAncestry.hitPoints}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">Size</span>
                                        <span className="stat-value">{selectedAncestry.size}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">Speed</span>
                                        <span className="stat-value">{selectedAncestry.speed} ft</span>
                                    </div>
                                </div>

                                <div className="boosts-section">
                                    <div className="boost-group">
                                        <span className="boost-label">Ability Boosts:</span>
                                        <span className="boost-value positive">
                                            {formatBoosts(selectedAncestry.abilityBoosts)}
                                        </span>
                                    </div>
                                    {selectedAncestry.abilityFlaws.length > 0 && (
                                        <div className="boost-group">
                                            <span className="boost-label">Ability Flaw:</span>
                                            <span className="boost-value negative">
                                                {selectedAncestry.abilityFlaws.map(f => f.toUpperCase()).join(', ')}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="languages-section">
                                    <span className="section-label">Languages:</span>
                                    <span className="languages-value">
                                        {selectedAncestry.languages.join(', ')}
                                    </span>
                                </div>

                                <div className="description-section">
                                    <p>{getDescription(selectedAncestry)}</p>
                                </div>

                                {selectedAncestry.features.length > 0 && (
                                    <div className="features-section">
                                        <h4>Features</h4>
                                        {selectedAncestry.features.map((feature, i) => (
                                            <div key={i} className="feature-item">
                                                <strong>{getName(feature)}</strong>
                                                <p>{getDescription(feature)}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="empty-state">
                                {t('browser.selectAncestry') || 'Select an ancestry to view details'}
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="modal-btn modal-btn-secondary" onClick={onClose}>
                        {t('actions.cancel') || 'Cancel'}
                    </button>
                    <button
                        className="modal-btn modal-btn-primary"
                        onClick={handleSelect}
                        disabled={!selectedAncestry}
                    >
                        {t('actions.select') || 'Select'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AncestryBrowser;
