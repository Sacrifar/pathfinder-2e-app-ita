import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Character } from '../../types';
import { skills as skillsData, backgrounds } from '../../data';
import { getClasses } from '../../data/pf2e-loader';

interface IntBonusSkillModalProps {
    character: Character;
    level?: number; // The level at which INT bonus skills are being selected
    onClose: () => void;
    onApply: (intBonusSkills: { [level: number]: string[] }) => void;
}

export const IntBonusSkillModal: React.FC<IntBonusSkillModalProps> = ({
    character,
    level,
    onClose,
    onApply,
}) => {
    const { t, language } = useLanguage();
    const [selectedSkills, setSelectedSkills] = useState<string[]>(
        level ? (character.intBonusSkills?.[level] || []) : []
    );

    // Calculate how many INT bonus skills are available at this specific level
    const calculateAvailableSlots = () => {
        if (!level) return 0;

        // Count INT boosts at this specific level
        const levelBoosts = character.abilityBoosts?.levelUp?.[level] || [];
        const intBoostsAtLevel = levelBoosts.filter(b => b === 'int').length;

        return intBoostsAtLevel;
    };

    const totalSlots = calculateAvailableSlots();

    // Count how many INT bonus skills have been selected from all previous levels
    const previouslySelectedCount = Object.values(character.intBonusSkills || {})
        .reduce((sum, skills, lvl) => sum + (lvl < (level || 0) ? skills.length : 0), 0);

    // Get auto-trained skills from class/background
    const getAutoTrainedSkills = (): Set<string> => {
        const autoTrainedSkills = new Set<string>();

        // Add perception (always auto-trained)
        autoTrainedSkills.add('perception');

        // Add class trained skills
        if (character.classId) {
            const classesList = getClasses();
            const classData = classesList.find((c: any) => c.id === character.classId);
            if (classData?.trainedSkills) {
                classData.trainedSkills.forEach((s: string) => autoTrainedSkills.add(s.toLowerCase()));
            }
        }

        // Add background trained skills
        if (character.backgroundId) {
            const bg = backgrounds.find((b: any) => b.id === character.backgroundId);
            if (bg?.trainedSkills) {
                bg.trainedSkills.forEach((s: string) => autoTrainedSkills.add(s.toLowerCase()));
            }
        }

        return autoTrainedSkills;
    };

    // Get skills that can be selected
    // Include: untrained skills, and skills already selected as INT bonus skills
    // Exclude: auto-trained skills (class, background, perception)
    const selectableSkills = useMemo(() => {
        const autoTrainedSkills = getAutoTrainedSkills();
        const intBonusSkillsAtThisLevel = level ? (character.intBonusSkills?.[level] || []) : [];

        return skillsData.filter(skill => {
            const skillIdLower = skill.id.toLowerCase();

            // Skip if auto-trained by class/background/perception
            if (autoTrainedSkills.has(skillIdLower)) {
                return false;
            }

            const charSkill = character.skills.find(s => s.name.toLowerCase() === skillIdLower);

            // Include if: untrained, OR already selected as INT bonus skill
            const isUntrained = !charSkill || charSkill.proficiency === 'untrained';
            const isIntBonusSkill = intBonusSkillsAtThisLevel.some(s => s.toLowerCase() === skillIdLower);

            return isUntrained || isIntBonusSkill;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [character.skills]);

    const toggleSkill = (skillId: string) => {
        const skillName = skillsData.find(s => s.id === skillId)?.name;
        if (!skillName) return;

        // Check if this skill was previously selected at THIS level
        const selectedAtThisLevel = level ? (character.intBonusSkills?.[level] || []) : [];
        const isPreviouslySelectedAtThisLevel = selectedAtThisLevel.includes(skillName);

        if (isPreviouslySelectedAtThisLevel) return; // Don't allow deselecting

        if (selectedSkills.includes(skillName)) {
            // Remove if already selected
            setSelectedSkills(prev => prev.filter(s => s !== skillName));
        } else {
            // Add if we have slots available
            if (selectedSkills.length < totalSlots) {
                setSelectedSkills(prev => [...prev, skillName]);
            }
        }
    };

    const handleApply = () => {
        if (!level) return;

        // Create the updated intBonusSkills object with skills for this level
        const updatedIntBonusSkills = {
            ...(character.intBonusSkills || {}),
            [level]: selectedSkills
        };

        // Pass the updated object to the parent
        onApply(updatedIntBonusSkills);
    };

    const canApply = selectedSkills.length >= totalSlots;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="selection-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{level ? `${t('builder.intBonusSkills') || 'INT Bonus Skills'} (Level ${level})` : t('builder.intBonusSkills') || 'INT Bonus Skills'}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="browser-content" style={{ flexDirection: 'column' }}>
                    <div className="selection-info" style={{ padding: '12px', background: 'var(--desktop-bg-secondary)', marginBottom: '12px', flexShrink: 0 }}>
                        <p>
                            {language === 'it'
                                ? `La tua Intelligenza è aumentata al livello ${level || ''}! Guadagni ${totalSlots} skill bonus${totalSlots > 1 ? ' da questo livello' : ''}. Seleziona le skill da rendere Trained.`
                                : level
                                    ? `Your Intelligence has increased at level ${level}! You gain ${totalSlots} trained skill${totalSlots > 1 ? 's' : ''} from this increase. Select skills to make Trained.`
                                    : `Your Intelligence has increased! You gain ${totalSlots} trained skill${totalSlots > 1 ? 's' : ''}. Select skills to make Trained.`
                            }
                        </p>
                        {previouslySelectedCount > 0 && (
                            <p style={{ fontSize: '12px', opacity: 0.8 }}>
                                {language === 'it'
                                    ? `${previouslySelectedCount} skill già selezionate dai livelli precedenti.`
                                    : `${previouslySelectedCount} skill${previouslySelectedCount > 1 ? 's' : ''} already selected from previous levels.`
                                }
                            </p>
                        )}
                        <p><strong>{selectedSkills.length} / {totalSlots} {t('builder.selected') || 'selected'}</strong></p>
                    </div>

                    <div className="selection-list">
                        {selectableSkills.map(skill => {
                            const isSelected = selectedSkills.includes(skill.name);
                            const selectedAtThisLevel = level ? (character.intBonusSkills?.[level] || []) : [];
                            const isPreviouslySelectedAtThisLevel = selectedAtThisLevel.includes(skill.name);

                            return (
                                <div
                                    key={skill.id}
                                    className="selection-list-item"
                                    onClick={() => !isPreviouslySelectedAtThisLevel && toggleSkill(skill.id)}
                                    style={{
                                        cursor: isPreviouslySelectedAtThisLevel ? 'not-allowed' : 'pointer',
                                        opacity: isSelected ? 1 : isPreviouslySelectedAtThisLevel ? 0.5 : 0.7,
                                        background: isSelected ? 'var(--desktop-bg-secondary)' : 'transparent'
                                    }}
                                >
                                    <div className="item-name">
                                        <strong>{language === 'it' ? skill.nameIt || skill.name : skill.name}</strong>
                                        {isPreviouslySelectedAtThisLevel && (
                                            <span style={{ marginLeft: '8px', fontSize: '12px', opacity: 0.7 }}>
                                                ({t('builder.previouslySelected') || 'previously selected'})
                                            </span>
                                        )}
                                    </div>
                                    <div className="item-badges">
                                        <span className="badge source">
                                            {skill.ability.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="modal-btn modal-btn-secondary" onClick={onClose}>
                        {t('actions.cancel') || 'Cancel'}
                    </button>
                    <button
                        className="modal-btn modal-btn-primary"
                        onClick={handleApply}
                        disabled={!canApply}
                    >
                        {t('actions.apply') || 'Apply'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IntBonusSkillModal;
