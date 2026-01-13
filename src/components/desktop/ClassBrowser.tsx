import React, { useState, useMemo } from 'react';
import { classes, TranslatedClass } from '../../data';
import { useLanguage, useLocalizedName, useLocalizedDescription } from '../../hooks/useLanguage';
import '../../styles/desktop.css';

interface ClassBrowserProps {
    currentClassId?: string;
    excludeClassId?: string; // For Dual Class - exclude the primary class
    onClose: () => void;
    onSelect: (classId: string) => void;
}

export const ClassBrowser: React.FC<ClassBrowserProps> = ({
    currentClassId,
    excludeClassId,
    onClose,
    onSelect,
}) => {
    const { t } = useLanguage();
    const getName = useLocalizedName();
    const getDescription = useLocalizedDescription();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClass, setSelectedClass] = useState<TranslatedClass | null>(
        currentClassId ? classes.find(c => c.id === currentClassId) || null : null
    );

    const filteredClasses = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return classes.filter(c => {
            // Exclude the primary class when selecting secondary class
            if (excludeClassId && c.id === excludeClassId) {
                return false;
            }
            return c.name.toLowerCase().includes(q) ||
                c.nameIt?.toLowerCase().includes(q);
        });
    }, [searchQuery, excludeClassId]);

    const handleSelect = () => {
        if (selectedClass) {
            onSelect(selectedClass.id);
        }
    };

    const formatKeyAbility = (keyAbility: string | string[]) => {
        if (Array.isArray(keyAbility)) {
            return keyAbility.map(k => k.toUpperCase()).join(' or ');
        }
        return keyAbility.toUpperCase();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="selection-modal class-browser" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{t('builder.chooseClass') || 'Choose Class'}</h2>
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
                            {filteredClasses.map(cls => (
                                <div
                                    key={cls.id}
                                    className={`selection-list-item ${selectedClass?.id === cls.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedClass(cls)}
                                >
                                    <div className="item-name">{getName(cls)}</div>
                                    <div className="item-badges">
                                        <span className="badge hp">HP {cls.hitPoints}</span>
                                        <span className="badge">{formatKeyAbility(cls.keyAbility)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="browser-detail">
                        {selectedClass ? (
                            <div className="detail-content">
                                <div className="detail-header">
                                    <h3>{getName(selectedClass)}</h3>
                                </div>

                                <div className="stats-row">
                                    <div className="stat-item">
                                        <span className="stat-label">HP per Level</span>
                                        <span className="stat-value hp">{selectedClass.hitPoints}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">Key Ability</span>
                                        <span className="stat-value">{formatKeyAbility(selectedClass.keyAbility)}</span>
                                    </div>
                                </div>

                                <div className="proficiencies-section">
                                    <h4>Proficiencies</h4>
                                    <div className="proficiency-grid">
                                        <div className="prof-item">
                                            <span className="prof-label">Perception</span>
                                            <span className="prof-value">{selectedClass.perception}</span>
                                        </div>
                                        <div className="prof-item">
                                            <span className="prof-label">Fortitude</span>
                                            <span className="prof-value">{selectedClass.fortitude}</span>
                                        </div>
                                        <div className="prof-item">
                                            <span className="prof-label">Reflex</span>
                                            <span className="prof-value">{selectedClass.reflex}</span>
                                        </div>
                                        <div className="prof-item">
                                            <span className="prof-label">Will</span>
                                            <span className="prof-value">{selectedClass.will}</span>
                                        </div>
                                    </div>
                                </div>

                                {selectedClass.spellcasting && (
                                    <div className="spellcasting-section">
                                        <h4>Spellcasting</h4>
                                        <div className="spell-info">
                                            <span className="badge">{selectedClass.spellcasting.tradition}</span>
                                            <span className="badge">{selectedClass.spellcasting.type}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="description-section">
                                    <p>{getDescription(selectedClass)}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="empty-state">
                                {t('browser.selectClass') || 'Select a class to view details'}
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
                        disabled={!selectedClass}
                    >
                        {t('actions.select') || 'Select'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClassBrowser;
