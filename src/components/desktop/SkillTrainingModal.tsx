import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Character, SkillProficiency } from '../../types';
import { classes, skills as allSkills } from '../../data';

interface SkillTrainingModalProps {
    character: Character;
    onClose: () => void;
    onApply: (trainedSkills: SkillProficiency[]) => void;
}

export const SkillTrainingModal: React.FC<SkillTrainingModalProps> = ({
    character,
    onClose,
    onApply,
}) => {
    const { t, language } = useLanguage();

    // Get class data
    const selectedClass = useMemo(() =>
        classes.find(c => c.id === character.classId),
        [character.classId]
    );

    // Calculate INT modifier for bonus skills
    const intMod = Math.floor((character.abilityScores.int - 10) / 2);

    // Calculate total skill slots available
    const classSkillSlots = selectedClass?.skills.additionalTrainedSkills || 0;
    const totalSlots = classSkillSlots + Math.max(0, intMod);

    // Skills already trained by class (automatic)
    const autoTrainedSkills = selectedClass?.skills.trained || [];

    // Initialize selected skills from character
    const [selectedSkills, setSelectedSkills] = useState<string[]>(() => {
        const existingTrained = character.skills
            .filter(s => s.proficiency !== 'untrained' && !autoTrainedSkills.includes(s.name))
            .map(s => s.name);
        return existingTrained;
    });

    // Toggle skill selection
    const toggleSkill = (skillName: string) => {
        if (autoTrainedSkills.includes(skillName)) return; // Can't toggle auto-trained

        if (selectedSkills.includes(skillName)) {
            setSelectedSkills(prev => prev.filter(s => s !== skillName));
        } else if (selectedSkills.length < totalSlots) {
            setSelectedSkills(prev => [...prev, skillName]);
        }
    };

    // Apply the skill selections
    const handleApply = () => {
        const allTrainedNames = [...autoTrainedSkills, ...selectedSkills];

        const trainedSkills: SkillProficiency[] = allSkills.map(skill => ({
            name: skill.name,
            ability: skill.ability,
            proficiency: allTrainedNames.includes(skill.name) ? 'trained' : 'untrained',
        }));

        onApply(trainedSkills);
    };

    const getSkillName = (skill: typeof allSkills[0]) => {
        return language === 'it' ? (skill.nameIt || skill.name) : skill.name;
    };

    const getAbilityLabel = (ability: string) => {
        return ability.toUpperCase();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="selection-modal skill-training-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{t('builder.skillTraining') || 'Skill Training'}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="skill-training-content">
                    {/* Info Section */}
                    <div className="skill-info-section">
                        <div className="skill-info-row">
                            <span className="info-label">{t('builder.classSkillSlots') || 'Class Skill Slots'}:</span>
                            <span className="info-value">{classSkillSlots}</span>
                        </div>
                        <div className="skill-info-row">
                            <span className="info-label">{t('builder.intBonus') || 'INT Bonus'}:</span>
                            <span className="info-value">{intMod >= 0 ? `+${intMod}` : intMod}</span>
                        </div>
                        <div className="skill-info-row total">
                            <span className="info-label">{t('builder.totalSlots') || 'Total Slots'}:</span>
                            <span className="info-value">{totalSlots}</span>
                        </div>
                        <div className="skill-info-row selected">
                            <span className="info-label">{t('builder.selected') || 'Selected'}:</span>
                            <span className="info-value">{selectedSkills.length}/{totalSlots}</span>
                        </div>
                    </div>

                    {/* Auto-trained skills from class */}
                    {autoTrainedSkills.length > 0 && (
                        <div className="auto-trained-section">
                            <h3>{t('builder.autoTrainedSkills') || 'Class-Trained Skills'}</h3>
                            <div className="auto-trained-list">
                                {autoTrainedSkills.map(skillName => {
                                    const skill = allSkills.find(s => s.name === skillName);
                                    return (
                                        <div key={skillName} className="skill-chip auto-trained">
                                            <span className="skill-name">{skill ? getSkillName(skill) : skillName}</span>
                                            <span className="skill-ability">({skill?.ability.toUpperCase()})</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Skill Selection Grid */}
                    <div className="skill-selection-section">
                        <h3>{t('builder.chooseSkills') || 'Choose Additional Skills'}</h3>
                        <div className="skill-grid">
                            {allSkills
                                .filter(skill => !autoTrainedSkills.includes(skill.name))
                                .map(skill => {
                                    const isSelected = selectedSkills.includes(skill.name);
                                    const canSelect = selectedSkills.length < totalSlots || isSelected;

                                    return (
                                        <button
                                            key={skill.id}
                                            className={`skill-option ${isSelected ? 'selected' : ''} ${!canSelect ? 'disabled' : ''}`}
                                            onClick={() => toggleSkill(skill.name)}
                                            disabled={!canSelect && !isSelected}
                                        >
                                            <span className="skill-name">{getSkillName(skill)}</span>
                                            <span className="skill-ability">{getAbilityLabel(skill.ability)}</span>
                                        </button>
                                    );
                                })}
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="modal-btn modal-btn-secondary" onClick={onClose}>
                        {t('actions.cancel')}
                    </button>
                    <button
                        className="modal-btn modal-btn-primary"
                        onClick={handleApply}
                    >
                        {t('actions.apply')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SkillTrainingModal;
