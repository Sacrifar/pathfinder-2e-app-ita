import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import {
    getSpecializationsForClass,
    classHasSpecializations,
    ClassSpecialization,
    ClassSpecializationType,
} from '../../data/classSpecializations';
import { filterSpecializationsByLevel } from '../../data/classSpecializationRules';
import '../../styles/desktop.css';

interface ClassSpecializationBrowserProps {
    classId: string;
    currentSpecializationId?: string | string[]; // Support both single and multiple selections
    onClose: () => void;
    onSelect: (specializationId: string | string[]) => void;
    characterLevel?: number; // For Kineticist - to determine which options to show
}

export const ClassSpecializationBrowser: React.FC<ClassSpecializationBrowserProps> = ({
    classId,
    currentSpecializationId,
    onClose,
    onSelect,
    characterLevel = 1,
}) => {
    const { t, language } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecialization, setSelectedSpecialization] = useState<ClassSpecialization | null>(null);
    const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]); // For multi-select
    const [selectedTypeIndex, setSelectedTypeIndex] = useState(0);

    // Get specializations for this class, filtered by level availability rules
    const specializationTypes = useMemo(() => {
        const allTypes = getSpecializationsForClass(classId);

        // Apply level-based filtering using centralized rules from classSpecializationRules.ts
        // This replaces the hardcoded Kineticist logic that was previously here
        const filteredTypes = filterSpecializationsByLevel(allTypes, classId, characterLevel);

        // Remove types with no options
        return filteredTypes.filter(type => type.options.length > 0);
    }, [classId, characterLevel]);

    // Get the current type
    const currentType = specializationTypes[selectedTypeIndex];

    // Get specializations for the current type
    const currentSpecializations = useMemo(() => {
        if (!currentType) return [];
        return currentType.options;
    }, [currentType]);

    // Filter specializations based on search
    const filteredSpecializations = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return currentSpecializations.filter(spec => {
            return spec.name.toLowerCase().includes(q) ||
                spec.nameIt?.toLowerCase().includes(q) ||
                spec.description.toLowerCase().includes(q);
        });
    }, [searchQuery, currentSpecializations]);

    // Check if current type supports multiple selections
    const supportsMultiSelect = currentType?.maxSelections && currentType.maxSelections > 1;
    const maxSelections = currentType?.maxSelections || 1;

    // Set initial selected specialization(s) if provided
    React.useEffect(() => {
        if (currentSpecializationId) {
            // Handle multiple selections
            if (Array.isArray(currentSpecializationId)) {
                setSelectedSpecializations(currentSpecializationId);
            } else if (!selectedSpecialization) {
                // Search in all types for the current specialization
                for (const specType of specializationTypes) {
                    const found = specType.options.find(s => s.id === currentSpecializationId);
                    if (found) {
                        setSelectedSpecialization(found);
                        // Also set the correct type index
                        const typeIndex = specializationTypes.indexOf(specType);
                        if (typeIndex >= 0) setSelectedTypeIndex(typeIndex);
                        break;
                    }
                }
            }
        }
    }, [currentSpecializationId, specializationTypes]);

    // Reset multi-select when type changes
    React.useEffect(() => {
        if (!supportsMultiSelect) {
            setSelectedSpecializations([]);
        } else if (currentSpecializationId && Array.isArray(currentSpecializationId)) {
            setSelectedSpecializations(currentSpecializationId);
        }
    }, [selectedTypeIndex, supportsMultiSelect, currentSpecializationId]);

    const handleSelect = () => {
        if (supportsMultiSelect) {
            // Return array of selected specializations
            onSelect(selectedSpecializations);
        } else if (selectedSpecialization) {
            // Return single specialization
            onSelect(selectedSpecialization.id);
        }
    };

    const handleToggleSpecialization = (specId: string) => {
        if (!supportsMultiSelect) {
            // Single select mode - just select this one
            const spec = currentSpecializations.find(s => s.id === specId);
            setSelectedSpecialization(spec || null);
            return;
        }

        // Multi-select mode
        if (selectedSpecializations.includes(specId)) {
            // Remove if already selected
            setSelectedSpecializations(prev => prev.filter(id => id !== specId));
        } else if (selectedSpecializations.length < maxSelections) {
            // Add if under limit
            setSelectedSpecializations(prev => [...prev, specId]);
        }
        // If at max, don't add (could show feedback)
    };

    const isSpecializationSelected = (specId: string): boolean => {
        if (supportsMultiSelect) {
            return selectedSpecializations.includes(specId);
        }
        return selectedSpecialization?.id === specId;
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
                    <h2>{t('specialization.title') || 'Class Specialization'}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                {/* Type tabs - show when there are multiple types */}
                {specializationTypes.length > 1 && (
                    <div className="type-tabs">
                        {specializationTypes.map((type, index) => (
                            <button
                                key={type.id}
                                className={`type-tab ${selectedTypeIndex === index ? 'active' : ''}`}
                                onClick={() => {
                                    setSelectedTypeIndex(index);
                                    setSelectedSpecialization(null);
                                }}
                            >
                                {getTypeName(type)}
                            </button>
                        ))}
                    </div>
                )}

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
                            {supportsMultiSelect && (
                                <div className="selection-info">
                                    {selectedSpecializations.length} / {maxSelections} {t('specialization.selected') || 'selected'}
                                </div>
                            )}
                            {filteredSpecializations.map(spec => {
                                const isSelected = isSpecializationSelected(spec.id);
                                const canSelect = !supportsMultiSelect || selectedSpecializations.length < maxSelections || isSelected;

                                return (
                                    <div
                                        key={spec.id}
                                        className={`selection-list-item ${isSelected ? 'selected' : ''} ${!canSelect ? 'disabled' : ''}`}
                                        onClick={() => canSelect && handleToggleSpecialization(spec.id)}
                                    >
                                        <div className="item-name">
                                            {isSelected && <span className="owned-indicator">✓</span>}
                                            {getSpecName(spec)}
                                        </div>
                                        <div className="item-badges">
                                            <span className="badge source">{spec.source}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="browser-detail">
                        {(selectedSpecialization || selectedSpecializations.length > 0) ? (
                            <div className="detail-content">
                                <div className="detail-header">
                                    <h3>
                                        {supportsMultiSelect
                                            ? (selectedSpecializations.length > 0
                                                ? `${selectedSpecializations.length} ${t('specialization.selected') || 'selected'}`
                                                : getTypeName(currentType!)
                                            )
                                            : getSpecName(selectedSpecialization!)
                                        }
                                    </h3>
                                </div>

                                {!supportsMultiSelect && selectedSpecialization && (
                                    <>
                                        <div className="stats-row">
                                            <div className="stat-item">
                                                <span className="stat-label">Source</span>
                                                <span className="stat-value">{selectedSpecialization.source}</span>
                                            </div>
                                        </div>

                                        <div className="detail-description">
                                            <p>{selectedSpecialization.description}</p>
                                        </div>
                                    </>
                                )}

                                {supportsMultiSelect && (
                                    <div className="detail-description">
                                        <p>
                                            {selectedSpecializations.length > 0
                                                ? `${selectedSpecializations.map(id => {
                                                    const spec = currentSpecializations.find(s => s.id === id);
                                                    return spec ? getSpecName(spec) : id;
                                                }).join(', ')}`
                                                : t('specialization.multiSelectPrompt') || `Select up to ${maxSelections} options.`
                                            }
                                        </p>
                                    </div>
                                )}

                                <div className="detail-actions">
                                    <button
                                        className="select-btn"
                                        onClick={handleSelect}
                                        disabled={supportsMultiSelect && selectedSpecializations.length === 0 || undefined}
                                    >
                                        {t('actions.confirm') || 'Confirm'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="detail-content empty-state">
                                <p>
                                    {supportsMultiSelect
                                        ? `${t('specialization.multiSelectPrompt') || `Select up to ${maxSelections} options.`}`
                                        : (t('specialization.selectPrompt') || 'Select a specialization from the list to view details.')
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClassSpecializationBrowser;
