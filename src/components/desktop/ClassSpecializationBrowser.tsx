import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import {
    getSpecializationsForClass,
    classHasSpecializations,
    ClassSpecialization,
    ClassSpecializationType,
} from '../../data/classSpecializations';
import '../../styles/desktop.css';

interface ClassSpecializationBrowserProps {
    classId: string;
    currentSpecializationId?: string;
    onClose: () => void;
    onSelect: (specializationId: string) => void;
}

export const ClassSpecializationBrowser: React.FC<ClassSpecializationBrowserProps> = ({
    classId,
    currentSpecializationId,
    onClose,
    onSelect,
}) => {
    const { t, language } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecialization, setSelectedSpecialization] = useState<ClassSpecialization | null>(
        currentSpecializationId ? null : null // We'll set this from the options
    );

    // Get specializations for this class
    const specializationTypes = useMemo(() => {
        return getSpecializationsForClass(classId);
    }, [classId]);

    // Flatten all specializations for the list
    const allSpecializations = useMemo(() => {
        const all: (ClassSpecialization & { type: ClassSpecializationType })[] = [];
        for (const specType of specializationTypes) {
            for (const spec of specType.options) {
                all.push({ ...spec, type: specType });
            }
        }
        return all;
    }, [specializationTypes]);

    // Filter specializations based on search
    const filteredSpecializations = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return allSpecializations.filter(spec => {
            return spec.name.toLowerCase().includes(q) ||
                spec.nameIt?.toLowerCase().includes(q) ||
                spec.description.toLowerCase().includes(q);
        });
    }, [searchQuery, allSpecializations]);

    // Set initial selected specialization if provided
    React.useEffect(() => {
        if (currentSpecializationId && !selectedSpecialization) {
            const found = allSpecializations.find(s => s.id === currentSpecializationId);
            if (found) setSelectedSpecialization(found);
        }
    }, [currentSpecializationId, allSpecializations]);

    const handleSelect = () => {
        if (selectedSpecialization) {
            onSelect(selectedSpecialization.id);
        }
    };

    const getTypeName = (type: ClassSpecializationType): string => {
        return language === 'it' && type.nameIt ? type.nameIt : type.name;
    };

    const getSpecName = (spec: ClassSpecialization): string => {
        return language === 'it' && spec.nameIt ? spec.nameIt : spec.name;
    };

    if (!classHasSpecializations(classId)) {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="selection-modal" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>{t('specialization.title') || 'Class Specialization'}</h2>
                        <button className="close-btn" onClick={onClose}>×</button>
                    </div>
                    <div className="browser-content">
                        <div className="detail-content">
                            <p>{t('specialization.notAvailable') || 'This class does not have a specialization option.'}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="selection-modal class-browser" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        {specializationTypes.length > 0
                            ? getTypeName(specializationTypes[0])
                            : (t('specialization.title') || 'Class Specialization')
                        }
                    </h2>
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
                            {filteredSpecializations.map(spec => (
                                <div
                                    key={spec.id}
                                    className={`selection-list-item ${selectedSpecialization?.id === spec.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedSpecialization(spec)}
                                >
                                    <div className="item-name">{getSpecName(spec)}</div>
                                    <div className="item-badges">
                                        <span className="badge source">{spec.source}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="browser-detail">
                        {selectedSpecialization ? (
                            <div className="detail-content">
                                <div className="detail-header">
                                    <h3>{getSpecName(selectedSpecialization)}</h3>
                                </div>

                                <div className="stats-row">
                                    <div className="stat-item">
                                        <span className="stat-label">Source</span>
                                        <span className="stat-value">{selectedSpecialization.source}</span>
                                    </div>
                                </div>

                                <div className="detail-description">
                                    <p>{selectedSpecialization.description}</p>
                                </div>

                                <div className="detail-actions">
                                    <button
                                        className="select-btn"
                                        onClick={handleSelect}
                                    >
                                        {t('actions.select') || 'Select'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="detail-content empty-state">
                                <p>{t('specialization.selectPrompt') || 'Select a specialization from the list to view details.'}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClassSpecializationBrowser;
