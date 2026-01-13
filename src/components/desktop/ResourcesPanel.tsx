import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Character, CustomResource } from '../../types';

interface ResourcesPanelProps {
    character: Character;
    onCharacterUpdate: (character: Character) => void;
}

export const ResourcesPanel: React.FC<ResourcesPanelProps> = ({
    character,
    onCharacterUpdate,
}) => {
    const { t } = useLanguage();
    const [showAddModal, setShowAddModal] = useState(false);
    const [newResourceName, setNewResourceName] = useState('');
    const [newResourceMax, setNewResourceMax] = useState(1);
    const [newResourceFrequency, setNewResourceFrequency] = useState<'daily' | 'per-encounter'>('daily');
    // const [editingResource, setEditingResource] = useState<string | null>(null);  // Reserved for inline edit

    const resources = character.customResources || [];

    const handleDecrement = (resourceId: string) => {
        const updatedResources = resources.map(r =>
            r.id === resourceId && r.current > 0
                ? { ...r, current: r.current - 1 }
                : r
        );
        onCharacterUpdate({
            ...character,
            customResources: updatedResources,
        });
    };

    const handleIncrement = (resourceId: string) => {
        const updatedResources = resources.map(r =>
            r.id === resourceId && r.current < r.max
                ? { ...r, current: r.current + 1 }
                : r
        );
        onCharacterUpdate({
            ...character,
            customResources: updatedResources,
        });
    };

    const handleAddResource = () => {
        if (!newResourceName.trim() || newResourceMax < 1) return;

        const newResource: CustomResource = {
            id: crypto.randomUUID(),
            name: newResourceName.trim(),
            max: newResourceMax,
            current: newResourceMax,
            frequency: newResourceFrequency,
        };

        onCharacterUpdate({
            ...character,
            customResources: [...resources, newResource],
        });

        setNewResourceName('');
        setNewResourceMax(1);
        setNewResourceFrequency('daily');
        setShowAddModal(false);
    };

    const handleDeleteResource = (resourceId: string) => {
        const updatedResources = resources.filter(r => r.id !== resourceId);
        onCharacterUpdate({
            ...character,
            customResources: updatedResources,
        });
    };

    const handleResetAllDaily = () => {
        const updatedResources = resources.map(r =>
            r.frequency === 'daily' ? { ...r, current: r.max } : r
        );
        onCharacterUpdate({
            ...character,
            customResources: updatedResources,
        });
    };

    const handleResetAllEncounter = () => {
        const updatedResources = resources.map(r =>
            r.frequency === 'per-encounter' ? { ...r, current: r.max } : r
        );
        onCharacterUpdate({
            ...character,
            customResources: updatedResources,
        });
    };

    return (
        <div className="resources-panel">
            <div className="panel-header">
                <h3>{t('resources.title') || 'Resources'}</h3>
                <div className="panel-header-actions">
                    <button
                        className="btn btn-sm"
                        onClick={handleResetAllDaily}
                        disabled={!resources.some(r => r.frequency === 'daily' && r.current < r.max)}
                        title={t('resources.resetDaily') || 'Reset all daily resources'}
                    >
                        {t('resources.resetDailyShort') || 'Reset Daily'}
                    </button>
                    <button
                        className="btn btn-sm"
                        onClick={handleResetAllEncounter}
                        disabled={!resources.some(r => r.frequency === 'per-encounter' && r.current < r.max)}
                        title={t('resources.resetEncounter') || 'Reset all encounter resources'}
                    >
                        {t('resources.resetEncounterShort') || 'Reset Encounter'}
                    </button>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setShowAddModal(true)}
                    >
                        + {t('resources.add') || 'Add'}
                    </button>
                </div>
            </div>

            {resources.length === 0 ? (
                <div className="empty-state-small">
                    <p>{t('resources.empty') || 'No custom resources yet. Add abilities or items with limited uses.'}</p>
                </div>
            ) : (
                <div className="resources-grid">
                    {resources.map(resource => (
                        <div key={resource.id} className="resource-card">
                            <div className="resource-header">
                                <span className="resource-name">{resource.name}</span>
                                <span className={`resource-frequency ${resource.frequency}`}>
                                    {resource.frequency === 'daily'
                                        ? (t('resources.daily') || 'Daily')
                                        : (t('resources.perEncounter') || 'Encounter')}
                                </span>
                                <button
                                    className="btn-icon btn-icon-sm"
                                    onClick={() => handleDeleteResource(resource.id)}
                                    title={t('actions.delete') || 'Delete'}
                                >
                                    ×
                                </button>
                            </div>
                            <div className="resource-controls">
                                <button
                                    className="resource-btn"
                                    onClick={() => handleDecrement(resource.id)}
                                    disabled={resource.current <= 0}
                                >
                                    −
                                </button>
                                <span className="resource-value">
                                    {resource.current} / {resource.max}
                                </span>
                                <button
                                    className="resource-btn"
                                    onClick={() => handleIncrement(resource.id)}
                                    disabled={resource.current >= resource.max}
                                >
                                    +
                                </button>
                            </div>
                            <div className="resource-bar">
                                <div
                                    className="resource-bar-fill"
                                    style={{
                                        width: `${(resource.current / resource.max) * 100}%`,
                                        backgroundColor: resource.current === 0
                                            ? 'var(--color-danger, #dc2626)'
                                            : resource.current < resource.max / 2
                                                ? 'var(--color-warning, #f59e0b)'
                                                : 'var(--color-success, #22c55e)'
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Resource Modal */}
            {showAddModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999
                    }}
                    onClick={() => setShowAddModal(false)}
                >
                    <div
                        style={{
                            background: 'var(--bg-elevated, #1a1a1a)',
                            borderRadius: '12px',
                            padding: '24px',
                            maxWidth: '400px',
                            width: '90%',
                            border: '1px solid var(--border-primary, #333)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ marginBottom: '16px', color: 'var(--text-primary, #fff)' }}>
                            {t('resources.addResource') || 'Add Custom Resource'}
                        </h3>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ color: 'var(--text-secondary, #888)', display: 'block', marginBottom: '6px' }}>
                                {t('resources.name') || 'Name'}:
                            </label>
                            <input
                                type="text"
                                value={newResourceName}
                                onChange={(e) => setNewResourceName(e.target.value)}
                                placeholder={t('resources.namePlaceholder') || 'e.g., Channel Energy, Rage, etc.'}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    background: 'var(--bg-secondary, #2a2a2a)',
                                    border: '1px solid var(--border-primary, #333)',
                                    borderRadius: '6px',
                                    color: 'var(--text-primary, #fff)',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ color: 'var(--text-secondary, #888)', display: 'block', marginBottom: '6px' }}>
                                {t('resources.maxUses') || 'Max Uses'}:
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={newResourceMax}
                                onChange={(e) => setNewResourceMax(Math.max(1, parseInt(e.target.value) || 1))}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    background: 'var(--bg-secondary, #2a2a2a)',
                                    border: '1px solid var(--border-primary, #333)',
                                    borderRadius: '6px',
                                    color: 'var(--text-primary, #fff)',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ color: 'var(--text-secondary, #888)', display: 'block', marginBottom: '6px' }}>
                                {t('resources.frequency') || 'Frequency'}:
                            </label>
                            <select
                                value={newResourceFrequency}
                                onChange={(e) => setNewResourceFrequency(e.target.value as 'daily' | 'per-encounter')}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    background: 'var(--bg-secondary, #2a2a2a)',
                                    border: '1px solid var(--border-primary, #333)',
                                    borderRadius: '6px',
                                    color: 'var(--text-primary, #fff)',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                            >
                                <option value="daily">{t('resources.daily') || 'Daily'}</option>
                                <option value="per-encounter">{t('resources.perEncounter') || 'Per Encounter'}</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setShowAddModal(false)}
                                style={{
                                    flex: 1,
                                    padding: '10px 20px',
                                    background: 'var(--bg-elevated, #2a2a2a)',
                                    color: 'var(--text-primary, #fff)',
                                    border: '1px solid var(--border-primary, #333)',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                {t('actions.cancel') || 'Cancel'}
                            </button>
                            <button
                                onClick={handleAddResource}
                                disabled={!newResourceName.trim() || newResourceMax < 1}
                                style={{
                                    flex: 1,
                                    padding: '10px 20px',
                                    background: 'var(--color-primary, #3b82f6)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    opacity: (!newResourceName.trim() || newResourceMax < 1) ? 0.5 : 1
                                }}
                            >
                                {t('actions.add') || 'Add'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResourcesPanel;
