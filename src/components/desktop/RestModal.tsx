import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Character } from '../../types';
import { recalculateCharacter } from '../../utils/characterRecalculator';
import { calculateMaxFocusPoints } from '../../utils/focusCalculator';

type DegreeOfSuccess = 'criticalFailure' | 'failure' | 'success' | 'criticalSuccess';
type DC = 15 | 20 | 30 | 40;

interface RestModalProps {
    character: Character;
    onClose: () => void;
    onCharacterUpdate: (character: Character) => void;
}

export const RestModal: React.FC<RestModalProps> = ({
    character,
    onClose,
    onCharacterUpdate,
}) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'short' | 'long'>('short');
    const [treatWoundsDC, setTreatWoundsDC] = useState<DC>(20);
    const [selectedDegree, setSelectedDegree] = useState<DegreeOfSuccess>('success');

    // Calculate the actual current max focus points (may have changed with new feats)
    const actualMaxFocusPoints = useMemo(() => calculateMaxFocusPoints(character), [character]);
    const currentFocusPoints = character.spellcasting?.focusPool?.current || 0;
    const displayMaxFocusPoints = character.spellcasting?.focusPool?.max || actualMaxFocusPoints;

    // Calculate cooldown for Treat Wounds (50 minutes = 3000000 ms)
    const treatWoundsCooldown = 50 * 60 * 1000;
    const lastTreatWoundsTime = character.restCooldowns?.lastTreatWoundsTime;
    const isTreatWoundsOnCooldown = lastTreatWoundsTime
        ? Date.now() - lastTreatWoundsTime < treatWoundsCooldown
        : false;

    const remainingCooldownMinutes = lastTreatWoundsTime
        ? Math.max(0, Math.ceil((treatWoundsCooldown - (Date.now() - lastTreatWoundsTime)) / 60000))
        : 0;

    // Treat Wounds healing formula
    const calculateHealing = (dc: DC, degree: DegreeOfSuccess): number => {
        const baseHealing: Record<DC, number> = {
            15: 10,
            20: 20,
            30: 30,
            40: 40,
        };

        const healing = baseHealing[dc];

        switch (degree) {
            case 'criticalFailure':
                return 0;
            case 'failure':
                return Math.floor(healing / 2);
            case 'success':
                return healing;
            case 'criticalSuccess':
                return healing * 2;
            default:
                return 0;
        }
    };

    const handleLongRest = () => {
        // First recalculate to ensure max values are correct
        let updated = recalculateCharacter(character);

        // Reset HP to max, remove temporary HP
        const updatedHP = {
            current: updated.hitPoints.max,
            max: updated.hitPoints.max,
            temporary: 0,
        };

        // Reset spell slots
        let updatedSpellcasting = updated.spellcasting;
        if (updatedSpellcasting?.spellSlots) {
            updatedSpellcasting = {
                ...updatedSpellcasting,
                spellSlots: Object.keys(updatedSpellcasting!.spellSlots).reduce((acc, level) => {
                    const lvl = parseInt(level);
                    acc[lvl] = {
                        ...updatedSpellcasting!.spellSlots![lvl],
                        used: 0,
                    };
                    return acc;
                }, {} as Record<number, any>),
            };
        }

        // Reset focus pool to max (using recalculated max)
        if (updatedSpellcasting?.focusPool) {
            updatedSpellcasting.focusPool.current = updatedSpellcasting.focusPool.max;
        }

        // Reset daily custom resources
        const updatedResources = (updated.customResources || []).map(r =>
            r.frequency === 'daily' ? { ...r, current: r.max } : r
        );

        // Remove or reduce certain conditions (e.g., Fatigued, Drained)
        const updatedConditions = (updated.conditions || []).filter(c => {
            // Conditions that persist through a full rest
            const persistentConditions = ['cursed', 'doomed', 'drained', 'dying'];
            return persistentConditions.includes(c.id);
        });

        onCharacterUpdate({
            ...updated,
            hitPoints: updatedHP,
            spellcasting: updatedSpellcasting,
            customResources: updatedResources,
            conditions: updatedConditions,
        });
        onClose();
    };

    const handleTreatWounds = () => {
        const healing = calculateHealing(treatWoundsDC, selectedDegree);
        const newHP = Math.min(
            character.hitPoints.current + healing,
            character.hitPoints.max
        );

        onCharacterUpdate({
            ...character,
            hitPoints: {
                ...character.hitPoints,
                current: newHP,
            },
            restCooldowns: {
                ...character.restCooldowns,
                lastTreatWoundsTime: Date.now(),
            },
        });
        onClose();
    };

    const handleRefocus = () => {
        // First recalculate to ensure max focus points is correct
        const updated = recalculateCharacter(character);

        if (!updated.spellcasting?.focusPool) return;

        const focusPool = updated.spellcasting.focusPool;
        const newCurrent = Math.min(focusPool.current + 1, focusPool.max);

        onCharacterUpdate({
            ...updated,
            spellcasting: {
                ...updated.spellcasting,
                focusPool: {
                    ...focusPool,
                    current: newCurrent,
                },
            },
            restCooldowns: {
                ...updated.restCooldowns,
                lastRefocusTime: Date.now(),
            },
        });
        onClose();
    };

    const canRefocus = character.spellcasting?.focusPool
        && currentFocusPoints < actualMaxFocusPoints;

    return (
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
            onClick={onClose}
        >
            <div
                style={{
                    background: 'var(--bg-elevated, #1a1a1a)',
                    borderRadius: '12px',
                    padding: '24px',
                    maxWidth: '500px',
                    width: '90%',
                    maxHeight: '80vh',
                    overflowY: 'auto',
                    border: '1px solid var(--border-primary, #333)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 style={{ marginBottom: '20px', color: 'var(--text-primary, #fff)' }}>
                    {t('rest.title') || 'Rest & Recovery'}
                </h2>

                {/* Tab Navigation */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-primary, #333)' }}>
                    <button
                        onClick={() => setActiveTab('short')}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: 'transparent',
                            border: 'none',
                            color: activeTab === 'short' ? 'var(--color-primary, #3b82f6)' : 'var(--text-secondary, #888)',
                            borderBottom: activeTab === 'short' ? '2px solid var(--color-primary, #3b82f6)' : '2px solid transparent',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: activeTab === 'short' ? 'bold' : 'normal'
                        }}
                    >
                        {t('rest.shortRest') || 'Short Rest'}
                    </button>
                    <button
                        onClick={() => setActiveTab('long')}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: 'transparent',
                            border: 'none',
                            color: activeTab === 'long' ? 'var(--color-primary, #3b82f6)' : 'var(--text-secondary, #888)',
                            borderBottom: activeTab === 'long' ? '2px solid var(--color-primary, #3b82f6)' : '2px solid transparent',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: activeTab === 'long' ? 'bold' : 'normal'
                        }}
                    >
                        {t('rest.longRest') || 'Long Rest'}
                    </button>
                </div>

                {/* Short Rest Content */}
                {activeTab === 'short' && (
                    <div>
                        {/* Treat Wounds Section */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ color: 'var(--text-primary, #fff)', marginBottom: '12px' }}>
                                {t('rest.treatWounds') || 'Treat Wounds'}
                            </h3>
                            <p style={{ color: 'var(--text-secondary, #888)', fontSize: '14px', marginBottom: '12px' }}>
                                {t('rest.treatWoundsDesc') || 'Use the Medicine skill to heal HP. Takes 10 minutes.'}
                            </p>

                            {/* DC Selection */}
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ color: 'var(--text-secondary, #888)', display: 'block', marginBottom: '6px' }}>
                                    {t('rest.dc') || 'DC'}:
                                </label>
                                <select
                                    value={treatWoundsDC}
                                    onChange={(e) => setTreatWoundsDC(parseInt(e.target.value) as DC)}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        background: 'var(--bg-secondary, #2a2a2a)',
                                        border: '1px solid var(--border-primary, #333)',
                                        borderRadius: '6px',
                                        color: 'var(--text-primary, #fff)',
                                        fontSize: '14px'
                                    }}
                                >
                                    <option value={15}>DC 15 ({t('rest.trained') || 'Trained'})</option>
                                    <option value={20}>DC 20 ({t('rest.expert') || 'Expert'})</option>
                                    <option value={30}>DC 30 ({t('rest.master') || 'Master'})</option>
                                    <option value={40}>DC 40 ({t('rest.legendary') || 'Legendary'})</option>
                                </select>
                            </div>

                            {/* Degree of Success Selection */}
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ color: 'var(--text-secondary, #888)', display: 'block', marginBottom: '6px' }}>
                                    {t('rest.degreeOfSuccess') || 'Degree of Success'}:
                                </label>
                                <select
                                    value={selectedDegree}
                                    onChange={(e) => setSelectedDegree(e.target.value as DegreeOfSuccess)}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        background: 'var(--bg-secondary, #2a2a2a)',
                                        border: '1px solid var(--border-primary, #333)',
                                        borderRadius: '6px',
                                        color: 'var(--text-primary, #fff)',
                                        fontSize: '14px'
                                    }}
                                >
                                    <option value="criticalFailure">{t('rest.criticalFailure') || 'Critical Failure'} (0 HP)</option>
                                    <option value="failure">{t('rest.failure') || 'Failure'} (½ healing)</option>
                                    <option value="success">{t('rest.success') || 'Success'} (full healing)</option>
                                    <option value="criticalSuccess">{t('rest.criticalSuccess') || 'Critical Success'} (2× healing)</option>
                                </select>
                            </div>

                            {/* Healing Preview */}
                            <div style={{
                                padding: '12px',
                                background: 'var(--bg-secondary, #2a2a2a)',
                                borderRadius: '6px',
                                marginBottom: '12px'
                            }}>
                                <span style={{ color: 'var(--text-secondary, #888)', fontSize: '14px' }}>
                                    {t('rest.healing') || 'Healing'}: <strong style={{ color: 'var(--color-success, #22c55e)' }}>
                                        {calculateHealing(treatWoundsDC, selectedDegree)} HP
                                    </strong>
                                </span>
                            </div>

                            {/* Cooldown Warning */}
                            {isTreatWoundsOnCooldown && (
                                <div style={{
                                    padding: '12px',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '6px',
                                    marginBottom: '12px'
                                }}>
                                    <span style={{ color: '#ef4444', fontSize: '14px' }}>
                                        {t('rest.cooldown') || 'Cooldown'}: {remainingCooldownMinutes} {t('rest.minutes') || 'minutes'}
                                    </span>
                                </div>
                            )}

                            <button
                                onClick={handleTreatWounds}
                                disabled={isTreatWoundsOnCooldown}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: isTreatWoundsOnCooldown ? 'var(--bg-secondary, #2a2a2a)' : 'var(--color-primary, #3b82f6)',
                                    color: isTreatWoundsOnCooldown ? 'var(--text-secondary, #888)' : 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: isTreatWoundsOnCooldown ? 'not-allowed' : 'pointer',
                                    fontSize: '16px',
                                    opacity: isTreatWoundsOnCooldown ? 0.5 : 1
                                }}
                            >
                                {t('rest.applyTreatWounds') || 'Apply Treat Wounds'}
                            </button>
                        </div>

                        {/* Refocus Section */}
                        {character.spellcasting?.focusPool && (
                            <div>
                                <h3 style={{ color: 'var(--text-primary, #fff)', marginBottom: '12px' }}>
                                    {t('rest.refocus') || 'Refocus'}
                                </h3>
                                <p style={{ color: 'var(--text-secondary, #888)', fontSize: '14px', marginBottom: '12px' }}>
                                    {t('rest.refocusDesc') || 'Regain 1 Focus Point by meditating or performing a ritual. Takes 10 minutes.'}
                                </p>

                                <div style={{
                                    padding: '12px',
                                    background: 'var(--bg-secondary, #2a2a2a)',
                                    borderRadius: '6px',
                                    marginBottom: '12px'
                                }}>
                                    <span style={{ color: 'var(--text-secondary, #888)', fontSize: '14px' }}>
                                        {t('rest.focusPoints') || 'Focus Points'}: <strong style={{ color: 'var(--color-primary, #3b82f6)' }}>
                                            {currentFocusPoints} / {actualMaxFocusPoints}
                                        </strong>
                                    </span>
                                </div>

                                <button
                                    onClick={handleRefocus}
                                    disabled={!canRefocus}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: canRefocus ? 'var(--color-primary, #3b82f6)' : 'var(--bg-secondary, #2a2a2a)',
                                        color: canRefocus ? 'white' : 'var(--text-secondary, #888)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: canRefocus ? 'pointer' : 'not-allowed',
                                        fontSize: '16px',
                                        opacity: canRefocus ? 1 : 0.5
                                    }}
                                >
                                    {t('rest.refocus') || 'Refocus'}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Long Rest Content */}
                {activeTab === 'long' && (
                    <div>
                        <p style={{ color: 'var(--text-secondary, #888)', fontSize: '14px', marginBottom: '20px' }}>
                            {t('rest.longRestDesc') || 'After 8 hours of rest, you recover fully. All HP and spell slots are restored. Daily resources are reset.'}
                        </p>

                        {/* Preview what will be restored */}
                        <div style={{
                            padding: '16px',
                            background: 'var(--bg-secondary, #2a2a2a)',
                            borderRadius: '8px',
                            marginBottom: '20px'
                        }}>
                            <h4 style={{ color: 'var(--text-primary, #fff)', marginBottom: '12px' }}>
                                {t('rest.willRestore') || 'Will Restore'}:
                            </h4>
                            <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary, #888)' }}>
                                <li>{t('rest.hitPoints') || 'Hit Points'}: {character.hitPoints.max} / {character.hitPoints.max}</li>
                                {character.spellcasting?.spellSlots && (
                                    <li>{t('rest.spellSlots') || 'Spell Slots'}: {t('rest.allSlots') || 'All slots restored'}</li>
                                )}
                                {character.spellcasting?.focusPool && (
                                    <li>{t('rest.focusPoints') || 'Focus Points'}: {actualMaxFocusPoints} / {actualMaxFocusPoints}</li>
                                )}
                                {(character.customResources?.filter(r => r.frequency === 'daily').length || 0) > 0 && (
                                    <li>{t('rest.dailyResources') || 'Daily Resources'}: {t('rest.allRestored') || 'All restored'}</li>
                                )}
                            </ul>
                        </div>

                        <button
                            onClick={handleLongRest}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: 'var(--color-success, #22c55e)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold'
                            }}
                        >
                            {t('rest.takeLongRest') || 'Take Long Rest (8 hours)'}
                        </button>
                    </div>
                )}

                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        marginTop: '20px',
                        width: '100%',
                        padding: '12px',
                        background: 'var(--bg-elevated, #2a2a2a)',
                        color: 'var(--text-primary, #fff)',
                        border: '1px solid var(--border-primary, #333)',
                        borderRadius: '8px',
                        cursor: 'pointer'
                    }}
                >
                    {t('actions.cancel') || 'Cancel'}
                </button>
            </div>
        </div>
    );
};

export default RestModal;
