import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Character, CharacterFeat } from '../../types';
import { getFeats, LoadedFeat } from '../../data/pf2e-loader';
import {
    getKineticistElementFromGateId,
    getSpecializationById,
    getKineticistJunctionsForElement,
    getSpecializationsForClass,
    ClassSpecialization,
} from '../../data/classSpecializations';
import '../../styles/desktop.css';

interface KineticistJunctionBrowserProps {
    character: Character;
    level: number; // 5, 9, 13, or 17
    onClose: () => void;
    onConfirm: (junctionData: {
        choice: 'expand_the_portal' | 'fork_the_path';
        junctionIds?: string[];
        newElementGateId?: string;
        newElementImpulseId?: string;
    }) => void;
}

type ChoiceType = 'expand_the_portal' | 'fork_the_path' | null;

export const KineticistJunctionBrowser: React.FC<KineticistJunctionBrowserProps> = ({
    character,
    level,
    onClose,
    onConfirm,
}) => {
    const { t } = useLanguage();
    const [selectedChoice, setSelectedChoice] = useState<ChoiceType>(null);
    const [selectedJunctions, setSelectedJunctions] = useState<string[]>([]);
    const [selectedNewElementGate, setSelectedNewElementGate] = useState<string | null>(null);
    const [selectedNewElementImpulse, setSelectedNewElementImpulse] = useState<string | null>(null);

    // Get the character's current elements
    const characterElements = useMemo(() => {
        if (!character.classSpecializationId) return [];

        const gateIds = Array.isArray(character.classSpecializationId)
            ? character.classSpecializationId
            : [character.classSpecializationId];

        return gateIds
            .map(gateId => getKineticistElementFromGateId(gateId))
            .filter((e): e is string => e !== null);
    }, [character.classSpecializationId]);

    // Also include elements from previous Fork the Path choices
    const allAvailableElements = useMemo(() => {
        const elements = new Set(characterElements);

        // Add elements from previous Fork the Path choices
        if (character.kineticistJunctions) {
            Object.values(character.kineticistJunctions).forEach((junctionData: any) => {
                if (junctionData.choice === 'fork_the_path' && junctionData.newElementGateId) {
                    const element = getKineticistElementFromGateId(junctionData.newElementGateId);
                    if (element) elements.add(element);
                }
            });
        }

        return Array.from(elements);
    }, [characterElements, character.kineticistJunctions]);

    // Get junctions for each element (for Expand the Portal)
    // Exclude the base junction (Element Impulse Junction) which is automatically gained
    const availableJunctions = useMemo(() => {
        const junctions: Array<{ element: string; junctions: ClassSpecialization[] }> = [];

        allAvailableElements.forEach(element => {
            const elementJunctions = getKineticistJunctionsForElement(element);
            // Skip the base junction (first one is Element Impulse Junction)
            if (elementJunctions.length > 1) {
                junctions.push({ element, junctions: elementJunctions.slice(1) });
            }
        });

        return junctions;
    }, [allAvailableElements]);

    // Get available gates (for Fork the Path) - exclude already chosen elements
    const availableGates = useMemo(() => {
        const kineticistSpecs = getSpecializationsForClass(character.classId);
        const gateSpec = kineticistSpecs.find(s => s.id === 'kineticist_single_gate');

        if (!gateSpec || !gateSpec.options) return [];

        // Filter out gates that are already chosen
        return gateSpec.options.filter(gate => {
            const element = getKineticistElementFromGateId(gate.id);
            return element && !allAvailableElements.includes(element);
        });
    }, [character.classId, allAvailableElements]);

    // Get impulse feats for the selected new element (for Fork the Path)
    const availableNewElementImpulses = useMemo(() => {
        if (!selectedNewElementGate) return [];

        const element = getKineticistElementFromGateId(selectedNewElementGate);
        if (!element) return [];

        const allFeats = getFeats();
        return allFeats.filter(f =>
            f.level === 1 &&
            f.category === 'class' &&
            f.traits.includes('impulse') &&
            f.traits.includes(element)
        );
    }, [selectedNewElementGate]);

    // Handle junction selection for Expand the Portal
    const handleToggleJunction = (junctionId: string) => {
        if (selectedJunctions.includes(junctionId)) {
            setSelectedJunctions(prev => prev.filter(id => id !== junctionId));
        } else {
            setSelectedJunctions(prev => [...prev, junctionId]);
        }
    };

    // Handle confirming the choice
    const canConfirm = useMemo(() => {
        if (selectedChoice === 'expand_the_portal') {
            return selectedJunctions.length === 1; // Must select exactly 1 junction
        } else if (selectedChoice === 'fork_the_path') {
            return selectedNewElementGate && selectedNewElementImpulse;
        }
        return false;
    }, [selectedChoice, selectedJunctions, selectedNewElementGate, selectedNewElementImpulse]);

    const handleConfirm = () => {
        if (!canConfirm || !selectedChoice) return;

        const data: any = {
            choice: selectedChoice,
        };

        if (selectedChoice === 'expand_the_portal') {
            data.junctionIds = selectedJunctions;
        } else if (selectedChoice === 'fork_the_path') {
            data.newElementGateId = selectedNewElementGate;
            data.newElementImpulseId = selectedNewElementImpulse;
        }

        onConfirm(data);
    };

    const getGateName = (gateId: string): string => {
        const spec = getSpecializationById(gateId);
        return spec?.name || gateId;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="selection-modal class-browser" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{t('kineticist.gatesThreshold') || `Gate's Threshold (Level ${level})`}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="browser-content">
                    <div className="browser-sidebar">
                        {!selectedChoice ? (
                            <>
                                <div style={{ padding: '12px', background: 'var(--desktop-bg-secondary)', marginBottom: '12px' }}>
                                    <strong>{t('kineticist.choosePath') || 'Choose Your Path'}</strong>
                                    <p style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>
                                        {t('kineticist.gatesThresholdDescription') || 'Select Expand the Portal to gain a junction from your current element(s), or Fork the Path to gain a new element with 1 impulse.'}
                                    </p>
                                </div>

                                <div className="selection-list">
                                    <div
                                        className="selection-list-item"
                                        onClick={() => setSelectedChoice('expand_the_portal')}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="item-name">
                                            <strong>{t('kineticist.expandThePortal') || 'Expand the Portal'}</strong>
                                        </div>
                                        <div className="item-badges">
                                            <span className="badge source">
                                                {t('kineticist.expandThePortalDesc') || 'Choose a junction from your current element(s)'}
                                            </span>
                                        </div>
                                    </div>

                                    <div
                                        className="selection-list-item"
                                        onClick={() => setSelectedChoice('fork_the_path')}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="item-name">
                                            <strong>{t('kineticist.forkThePath') || 'Fork the Path'}</strong>
                                        </div>
                                        <div className="item-badges">
                                            <span className="badge source">
                                                {t('kineticist.forkThePathDesc') || 'Choose a new element and gain 1 impulse'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : selectedChoice === 'expand_the_portal' ? (
                            <>
                                <button
                                    className="back-btn"
                                    onClick={() => setSelectedChoice(null)}
                                    style={{ margin: '12px' }}
                                >
                                    ← {t('actions.back') || 'Back'}
                                </button>

                                <div className="selection-info" style={{ padding: '12px', background: 'var(--desktop-bg-secondary)', marginBottom: '12px' }}>
                                    <strong>{selectedJunctions.length} / 1 {t('kineticist.junctionSelected') || 'junction selected'}</strong>
                                </div>

                                {availableJunctions.map(({ element, junctions }) => (
                                    <div key={element} style={{ marginBottom: '16px' }}>
                                        <div style={{ padding: '8px 12px', background: 'var(--desktop-accent-red, #c0392b)', color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
                                            {element.charAt(0).toUpperCase() + element.slice(1)}
                                        </div>
                                        <div className="selection-list">
                                            {junctions.map(junction => {
                                                const isSelected = selectedJunctions.includes(junction.id);
                                                return (
                                                    <div
                                                        key={junction.id}
                                                        className={`selection-list-item ${isSelected ? 'selected' : ''}`}
                                                        onClick={() => handleToggleJunction(junction.id)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <div className="item-name">
                                                            {isSelected && <span className="owned-indicator">✓</span>}
                                                            {junction.name}
                                                        </div>
                                                        <div className="item-badges">
                                                            <span className="badge source">{junction.source}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <>
                                <button
                                    className="back-btn"
                                    onClick={() => setSelectedChoice(null)}
                                    style={{ margin: '12px' }}
                                >
                                    ← {t('actions.back') || 'Back'}
                                </button>

                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ padding: '8px 12px', background: 'var(--desktop-accent-red, #c0392b)', color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
                                        {t('kineticist.selectNewElement') || 'Select New Element'}
                                    </div>
                                    <div className="selection-list">
                                        {availableGates.map(gate => {
                                            const isSelected = selectedNewElementGate === gate.id;
                                            return (
                                                <div
                                                    key={gate.id}
                                                    className={`selection-list-item ${isSelected ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        setSelectedNewElementGate(gate.id);
                                                        setSelectedNewElementImpulse(null); // Reset impulse selection
                                                    }}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <div className="item-name">
                                                        {isSelected && <span className="owned-indicator">✓</span>}
                                                        {gate.name}
                                                    </div>
                                                    <div className="item-badges">
                                                        <span className="badge source">{gate.source}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {selectedNewElementGate && (
                                    <div>
                                        <div style={{ padding: '8px 12px', background: 'var(--desktop-accent-red, #c0392b)', color: 'white', fontWeight: 'bold', fontSize: '14px', marginTop: '16px' }}>
                                            {t('kineticist.selectImpulse') || 'Select 1 Impulse'}
                                        </div>
                                        <div className="selection-list">
                                            {availableNewElementImpulses.map(feat => {
                                                const isSelected = selectedNewElementImpulse === feat.id;
                                                return (
                                                    <div
                                                        key={feat.id}
                                                        className={`selection-list-item ${isSelected ? 'selected' : ''}`}
                                                        onClick={() => setSelectedNewElementImpulse(feat.id)}
                                                        style={{ cursor: 'pointer' }}
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
                                )}
                            </>
                        )}
                    </div>

                    <div className="browser-detail">
                        <div className="detail-content">
                            <div className="detail-header">
                                <h3>
                                    {!selectedChoice
                                        ? (t('kineticist.gatesThreshold') || "Gate's Threshold")
                                        : selectedChoice === 'expand_the_portal'
                                            ? (t('kineticist.expandThePortal') || 'Expand the Portal')
                                            : (t('kineticist.forkThePath') || 'Fork the Path')
                                    }
                                </h3>
                            </div>

                            <div className="detail-description">
                                {!selectedChoice ? (
                                    <>
                                        <p>{t('kineticist.gatesThresholdDescription') || 'At this level, your connection to the elemental planes deepens. Choose how to expand your power:'}</p>
                                        <ul>
                                            <li>
                                                <strong>{t('kineticist.expandThePortal') || 'Expand the Portal'}:</strong> {
                                                    t('kineticist.expandThePortalDesc') || 'Choose a junction from your current element(s), gaining access to new impulses.'
                                                }
                                            </li>
                                            <li>
                                                <strong>{t('kineticist.forkThePath') || 'Fork the Path'}:</strong> {
                                                    t('kineticist.forkThePathDesc') || 'Choose a new element and gain 1 impulse feat from that element.'
                                                }
                                            </li>
                                        </ul>
                                    </>
                                ) : selectedChoice === 'expand_the_portal' ? (
                                    <>
                                        <p>{t('kineticist.selectJunctionPrompt') || 'Select 1 junction from your current element(s).'}</p>
                                        <p><strong>{t('kineticist.currentElements') || 'Current Elements'}:</strong> {allAvailableElements.join(', ')}</p>
                                        {selectedJunctions.length > 0 && (
                                            <p><strong>{t('kineticist.selected') || 'Selected'}:</strong> {selectedJunctions.length} / 1</p>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <p>{t('kineticist.forkThePathFullDescription') || 'You are choosing to expand your elemental mastery by adding a new element.'}</p>
                                        {selectedNewElementGate && (
                                            <>
                                                <p><strong>{t('kineticist.newElement') || 'New Element'}:</strong> {getGateName(selectedNewElementGate)}</p>
                                                {selectedNewElementImpulse && (
                                                    <p><strong>{t('kineticist.selectedImpulse') || 'Selected Impulse'}:</strong> {
                                                        availableNewElementImpulses.find(f => f.id === selectedNewElementImpulse)?.name
                                                    }</p>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="detail-actions">
                                <button
                                    className="select-btn"
                                    onClick={handleConfirm}
                                    disabled={!canConfirm}
                                >
                                    {t('actions.confirm') || 'Confirm'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KineticistJunctionBrowser;
