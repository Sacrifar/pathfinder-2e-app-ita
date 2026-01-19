import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { skills } from '../../data';
import type { SkillProficiency } from '../../types';

interface SkillOverlapBonusModalProps {
    onClose: () => void;
    onSelect: (skillName: string) => void;
    currentSkills: SkillProficiency[];
    overlappingSkill: string;
}

export const SkillOverlapBonusModal: React.FC<SkillOverlapBonusModalProps> = ({
    onClose,
    onSelect,
    currentSkills,
    overlappingSkill,
}) => {
    const { t } = useLanguage();
    const [selectedSkill, setSelectedSkill] = useState<string>('');

    // Get skills that are NOT already trained (excluding the overlapping one)
    const availableSkills = useMemo(() => {
        return skills.filter(skill => {
            const skillLower = skill.name.toLowerCase();
            // Exclude skills that are already trained
            const isAlreadyTrained = currentSkills.some(
                s => s.name.toLowerCase() === skillLower && s.proficiency !== 'untrained'
            );
            // Exclude the overlapping skill (which caused this modal)
            const isOverlapping = skillLower === overlappingSkill.toLowerCase();
            return !isAlreadyTrained && !isOverlapping;
        });
    }, [currentSkills, overlappingSkill]);

    const handleSelect = () => {
        if (selectedSkill) {
            onSelect(selectedSkill);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="selection-modal skill-overlap-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{t('builder.skillOverlapBonus') || 'Skill Overlap Bonus'}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <p className="overlap-description">
                        {t('builder.skillOverlapDescription') || `Your background grants training in ${overlappingSkill}, but your class also provides it. Choose an additional skill to receive training as a bonus.`}
                    </p>

                    <div className="skills-grid">
                        {availableSkills.map(skill => (
                            <div
                                key={skill.id}
                                className={`skill-option ${selectedSkill === skill.name ? 'selected' : ''}`}
                                onClick={() => setSelectedSkill(skill.name)}
                            >
                                <span className="skill-name">{skill.name}</span>
                                <span className="skill-ability">({skill.ability.toUpperCase()})</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="secondary-btn" onClick={onClose}>
                        {t('actions.cancel') || 'Cancel'}
                    </button>
                    <button
                        className="primary-btn"
                        onClick={handleSelect}
                        disabled={!selectedSkill}
                    >
                        {t('actions.confirm') || 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SkillOverlapBonusModal;
