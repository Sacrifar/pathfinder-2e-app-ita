import React, { useState, useMemo } from 'react';
import { backgrounds } from '../../data';
import { Background } from '../../types';
import { useLanguage, useLocalizedName, useLocalizedDescription } from '../../hooks/useLanguage';
import { getFeats } from '../../data/pf2e-loader';
import '../../styles/desktop.css';

interface BackgroundBrowserProps {
    currentBackgroundId?: string;
    onClose: () => void;
    onSelect: (backgroundId: string) => void;
}

export const BackgroundBrowser: React.FC<BackgroundBrowserProps> = ({
    currentBackgroundId,
    onClose,
    onSelect,
}) => {
    const { t } = useLanguage();
    const getName = useLocalizedName();
    const getDescription = useLocalizedDescription();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBackground, setSelectedBackground] = useState<Background | null>(
        currentBackgroundId ? backgrounds.find(b => b.id === currentBackgroundId) || null : null
    );

    // Load all feats for lookup
    const allFeats = useMemo(() => getFeats(), []);

    // Helper to get feat name by ID
    const getFeatName = (featId: string): string => {
        const feat = allFeats.find(f => f.id === featId);
        return feat?.name || featId;
    };

    const filteredBackgrounds = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return backgrounds.filter(b =>
            b.name.toLowerCase().includes(q) ||
            b.nameIt?.toLowerCase().includes(q)
        );
    }, [searchQuery]);

    const handleSelect = () => {
        if (selectedBackground) {
            onSelect(selectedBackground.id);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="selection-modal background-browser" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{t('builder.chooseBackground') || 'Choose Background'}</h2>
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
                            {filteredBackgrounds.map(bg => (
                                <div
                                    key={bg.id}
                                    className={`selection-list-item ${selectedBackground?.id === bg.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedBackground(bg)}
                                >
                                    <div className="item-name">{getName(bg)}</div>
                                    <div className="item-badges">
                                        {bg.trainedSkills.slice(0, 2).map((skill, i) => (
                                            <span key={i} className="badge skill">{skill}</span>
                                        ))}
                                        {bg.featId && (
                                            <span className="badge feat">{getFeatName(bg.featId)}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="browser-detail">
                        {selectedBackground ? (
                            <div className="detail-content">
                                <div className="detail-header">
                                    <h3>{getName(selectedBackground)}</h3>
                                </div>

                                <div className="skills-section">
                                    <div className="section-group">
                                        <span className="section-label">Trained Skills:</span>
                                        <div className="skill-badges">
                                            {selectedBackground.trainedSkills.map((skill, i) => (
                                                <span key={i} className="badge skill">{skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="boosts-section">
                                    <div className="boost-group">
                                        <span className="boost-label">Ability Boosts:</span>
                                        <div className="boost-value positive">
                                            {/* Get the two ability options (excluding 'free') */}
                                            {(() => {
                                                const abilityOptions = selectedBackground.abilityBoosts.filter(b => b !== 'free');
                                                const hasFree = selectedBackground.abilityBoosts.includes('free');

                                                return (
                                                    <>
                                                        <div>One boost: {abilityOptions.map(b => b.toUpperCase()).join(' or ')}</div>
                                                        {hasFree && <div>One free boost (not one of the above)</div>}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>

                                <div className="description-section">
                                    <p>{getDescription(selectedBackground)}</p>
                                </div>

                                {selectedBackground.featId && (
                                    <div className="feat-section">
                                        <span className="section-label">{t('builder.freeFeat') || 'Free Feat'}:</span>
                                        <div className="feat-value">
                                            <span className="feat-name">{getFeatName(selectedBackground.featId)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="empty-state">
                                {t('browser.selectBackground') || 'Select a background to view details'}
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
                        disabled={!selectedBackground}
                    >
                        {t('actions.select') || 'Select'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BackgroundBrowser;
