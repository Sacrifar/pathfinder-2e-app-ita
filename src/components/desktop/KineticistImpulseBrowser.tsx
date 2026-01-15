import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Character, CharacterFeat } from '../../types';
import { getFeats, LoadedFeat } from '../../data/pf2e-loader';
import { getKineticistElementFromGateId, getSpecializationById } from '../../data/classSpecializations';
import '../../styles/desktop.css';

interface KineticistImpulseBrowserProps {
    character: Character;
    onClose: () => void;
    onConfirm: (feats: CharacterFeat[]) => void;
}

interface ImpulseSelection {
    gateId: string;
    element: string;
    requiredCount: number;
    selectedFeats: string[];
}

export const KineticistImpulseBrowser: React.FC<KineticistImpulseBrowserProps> = ({
    character,
    onClose,
    onConfirm,
}) => {
    const { t } = useLanguage();
    const [selections, setSelections] = useState<ImpulseSelection[]>([]);

    // Parse the gate selection
    const gateSelections = useMemo(() => {
        if (!character.classSpecializationId) return [];

        const gates = Array.isArray(character.classSpecializationId)
            ? character.classSpecializationId
            : [character.classSpecializationId];

        return gates.map(gateId => {
            const element = getKineticistElementFromGateId(gateId);
            return { gateId, element: element || '' };
        });
    }, [character.classSpecializationId]);

    // Determine required feat count per gate
    const isDualGate = Array.isArray(character.classSpecializationId);
    const requiredCountPerGate = isDualGate ? 1 : 2;

    // Initialize selections
    React.useEffect(() => {
        const newSelections: ImpulseSelection[] = gateSelections.map(gate => ({
            gateId: gate.gateId,
            element: gate.element,
            requiredCount: requiredCountPerGate,
            selectedFeats: [],
        }));
        setSelections(newSelections);
    }, [gateSelections, requiredCountPerGate]);

    // Load all feats once
    const allFeats = useMemo(() => getFeats(), []);

    // Get available impulse feats for each element
    const getAvailableImpulses = (element: string): LoadedFeat[] => {
        if (!element) return [];
        return allFeats.filter(f =>
            f.level === 1 &&
            f.category === 'class' &&
            f.traits.includes('impulse') &&
            f.traits.includes(element)
        );
    };

    // Get gate name
    const getGateName = (gateId: string): string => {
        const spec = getSpecializationById(gateId);
        return spec?.name || gateId;
    };

    const handleToggleFeat = (selectionIndex: number, featId: string) => {
        setSelections(prev => {
            const newSelections = prev.map((sel, idx) => {
                if (idx !== selectionIndex) return sel;

                // Create a new selection object with updated selectedFeats
                if (sel.selectedFeats.includes(featId)) {
                    // Remove feat
                    return {
                        ...sel,
                        selectedFeats: sel.selectedFeats.filter(id => id !== featId)
                    };
                } else if (sel.selectedFeats.length < sel.requiredCount) {
                    // Add feat if under limit
                    return {
                        ...sel,
                        selectedFeats: [...sel.selectedFeats, featId]
                    };
                }

                return sel;
            });

            return newSelections;
        });
    };

    const canConfirm = useMemo(() => {
        return selections.every(s => s.selectedFeats.length === s.requiredCount);
    }, [selections]);

    const handleConfirm = () => {
        if (!canConfirm) return;

        const newFeats: CharacterFeat[] = [];
        selections.forEach(selection => {
            selection.selectedFeats.forEach(featId => {
                newFeats.push({
                    featId,
                    level: 1,
                    source: 'class',
                    slotType: 'impulse', // Use dedicated slotType for impulse feats
                });
            });
        });

        onConfirm(newFeats);
    };

    const totalRequired = selections.reduce((sum, s) => sum + s.requiredCount, 0);
    const totalSelected = selections.reduce((sum, s) => sum + s.selectedFeats.length, 0);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="selection-modal class-browser" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{t('kineticist.selectImpulses') || 'Select Starting Impulses'}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="browser-content">
                    <div className="browser-sidebar">
                        <div className="selection-info" style={{ padding: '12px', background: 'var(--desktop-bg-secondary)', marginBottom: '12px' }}>
                            <strong>{totalSelected} / {totalRequired} {t('kineticist.impulsesSelected') || 'impulses selected'}</strong>
                            <p style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>
                                {isDualGate
                                    ? (t('kineticist.dualGateHint') || 'Select 1 impulse for each element')
                                    : (t('kineticist.singleGateHint') || 'Select 2 impulses for your element')
                                }
                            </p>
                        </div>

                        {selections.map((selection, selIndex) => {
                            const availableImpulses = getAvailableImpulses(selection.element);
                            const gateName = getGateName(selection.gateId);

                            return (
                                <div key={selection.gateId} style={{ marginBottom: '16px' }}>
                                    <div style={{ padding: '8px 12px', background: 'var(--desktop-accent-red, #c0392b)', color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
                                        {gateName} ({selection.selectedFeats.length} / {selection.requiredCount})
                                    </div>
                                    <div className="selection-list">
                                        {availableImpulses.map(feat => {
                                            const isSelected = selection.selectedFeats.includes(feat.id);
                                            const isDisabled = !isSelected && selection.selectedFeats.length >= selection.requiredCount;

                                            return (
                                                <div
                                                    key={feat.id}
                                                    className={`selection-list-item ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                                                    onClick={() => !isDisabled && handleToggleFeat(selIndex, feat.id)}
                                                    style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                                                >
                                                    <div className="item-name">
                                                        {isSelected && <span className="owned-indicator">✓</span>}
                                                        {feat.name}
                                                    </div>
                                                    <div className="item-badges">
                                                        <span className="badge source">{feat.traits.join(', ')}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="browser-detail">
                        <div className="detail-content">
                            <div className="detail-header">
                                <h3>{t('kineticist.impulseSelection') || 'Impulse Selection'}</h3>
                            </div>

                            <div className="detail-description">
                                <p>{t('kineticist.selectStartingImpulses') || 'Select your starting impulse feats.'}</p>
                                <p><strong>{isDualGate ? t('kineticist.dualGate') || 'Dual Gate' : t('kineticist.singleGate') || 'Single Gate'}</strong></p>
                                <ul>
                                    {selections.map((selection, idx) => {
                                        const gateName = getGateName(selection.gateId);
                                        const selectedFeatNames = selection.selectedFeats.map(id => {
                                            const feat = getAvailableImpulses(selection.element).find(f => f.id === id);
                                            return feat?.name || id;
                                        });

                                        return (
                                            <li key={idx}>
                                                <strong>{gateName}</strong>: {selectedFeatNames.length > 0 ? selectedFeatNames.join(', ') : t('common.none') || 'None'}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>

                            <div className="detail-actions">
                                <button
                                    className="select-btn"
                                    onClick={handleConfirm}
                                    disabled={!canConfirm}
                                >
                                    {t('actions.confirm') || 'Confirm'} ({totalSelected}/{totalRequired})
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KineticistImpulseBrowser;
