import React, { useState, useMemo } from 'react';
import { getConditions, LoadedCondition } from '../../data/pf2e-loader';
import { useLanguage } from '../../hooks/useLanguage';
import '../../styles/desktop.css'; // Ensure we have access to styles

interface ConditionBrowserProps {
    onClose: () => void;
    onAdd: (condition: LoadedCondition) => void;
}

export const ConditionBrowser: React.FC<ConditionBrowserProps> = ({
    onClose,
    onAdd,
}) => {
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCondition, setSelectedCondition] = useState<LoadedCondition | null>(null);

    const allConditions = useMemo(() => getConditions(), []);

    const filteredConditions = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return allConditions.filter(c =>
            c.name.toLowerCase().includes(q)
        );
    }, [allConditions, searchQuery]);

    const handleAdd = () => {
        if (selectedCondition) {
            onAdd(selectedCondition);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="feat-browser-modal condition-browser-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{t('browser.conditions') || 'Conditions Browser'}</h2>
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

                        <div className="feat-list">
                            {filteredConditions.map(condition => (
                                <div
                                    key={condition.id}
                                    className={`feat-list-item ${selectedCondition?.id === condition.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedCondition(condition)}
                                >
                                    <div className="feat-name">{condition.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="feat-detail-panel">
                        {selectedCondition ? (
                            <div className="feat-detail-content">
                                <div className="detail-header">
                                    <h3>{selectedCondition.name}</h3>
                                </div>

                                <div
                                    className="feat-description"
                                    dangerouslySetInnerHTML={{ __html: selectedCondition.description }}
                                />

                                <div className="detail-actions">
                                    <button className="add-btn" onClick={handleAdd}>
                                        {t('actions.addCondition') || 'Add Condition'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="empty-state">
                                {t('browser.selectCondition') || 'Select a condition to view details'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
