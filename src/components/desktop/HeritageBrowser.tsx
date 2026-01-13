import React, { useState, useMemo } from 'react';
import { getHeritagesForAncestry, TranslatedHeritage } from '../../data';
import { useLanguage, useLocalizedName, useLocalizedDescription } from '../../hooks/useLanguage';
import '../../styles/desktop.css';

interface HeritageBrowserProps {
    ancestryId: string;
    currentHeritageId?: string;
    onClose: () => void;
    onSelect: (heritageId: string) => void;
}

export const HeritageBrowser: React.FC<HeritageBrowserProps> = ({
    ancestryId,
    currentHeritageId,
    onClose,
    onSelect,
}) => {
    const { t } = useLanguage();
    const getName = useLocalizedName();
    const getDescription = useLocalizedDescription();

    const availableHeritages = useMemo(() => getHeritagesForAncestry(ancestryId), [ancestryId]);

    const [selectedHeritage, setSelectedHeritage] = useState<TranslatedHeritage | null>(
        currentHeritageId ? availableHeritages.find(h => h.id === currentHeritageId) || null : null
    );

    const handleSelect = () => {
        if (selectedHeritage) {
            onSelect(selectedHeritage.id);
        }
    };

    if (availableHeritages.length === 0) {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="selection-modal heritage-browser" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>{t('builder.chooseHeritage') || 'Choose Heritage'}</h2>
                        <button className="close-btn" onClick={onClose}>×</button>
                    </div>
                    <div className="modal-content">
                        <div className="empty-state">
                            <p>{t('builder.noHeritages') || 'No heritages available for this ancestry.'}</p>
                            <button className="modal-btn modal-btn-primary" onClick={() => onSelect('')}>
                                {t('actions.continue') || 'Continue'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="selection-modal heritage-browser" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{t('builder.chooseHeritage') || 'Choose Heritage'}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="browser-content">
                    <div className="browser-sidebar">
                        <div className="selection-list">
                            {availableHeritages.map(heritage => (
                                <div
                                    key={heritage.id}
                                    className={`selection-list-item ${selectedHeritage?.id === heritage.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedHeritage(heritage)}
                                >
                                    <div className="item-name">{getName(heritage)}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="browser-detail">
                        {selectedHeritage ? (
                            <div className="detail-content">
                                <div className="detail-header">
                                    <h3>{getName(selectedHeritage)}</h3>
                                    {selectedHeritage.traits.length > 0 && (
                                        <div className="detail-badges">
                                            {selectedHeritage.traits.map(t => (
                                                <span key={t} className="badge trait">{t}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="description-section">
                                    <p>{getDescription(selectedHeritage)}</p>
                                </div>

                                {selectedHeritage.features.length > 0 && (
                                    <div className="features-section">
                                        <h4>Features</h4>
                                        {selectedHeritage.features.map((feature, i) => (
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
                                {t('browser.selectHeritage') || 'Select a heritage to view details'}
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
                        disabled={!selectedHeritage}
                    >
                        {t('actions.select') || 'Select'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HeritageBrowser;
