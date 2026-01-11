import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Character, Proficiency, SkillProficiency } from '../../types';
import { skills as allSkills } from '../../data';
import '../../styles/desktop.css';

interface SkillIncreaseModalProps {
    character: Character;
    level: number;
    onClose: () => void;
    onApply: (skillName: string, newProficiency: Proficiency) => void;
}

const PROFICIENCY_ORDER: Proficiency[] = ['untrained', 'trained', 'expert', 'master', 'legendary'];

// Max proficiency based on level
function getMaxProficiency(level: number): Proficiency {
    if (level >= 15) return 'legendary';
    if (level >= 7) return 'master';
    return 'expert';
}

function getNextProficiency(current: Proficiency): Proficiency | null {
    const idx = PROFICIENCY_ORDER.indexOf(current);
    if (idx < PROFICIENCY_ORDER.length - 1) {
        return PROFICIENCY_ORDER[idx + 1];
    }
    return null;
}

function canIncreaseTo(newProf: Proficiency, level: number): boolean {
    const maxProf = getMaxProficiency(level);
    const maxIdx = PROFICIENCY_ORDER.indexOf(maxProf);
    const newIdx = PROFICIENCY_ORDER.indexOf(newProf);
    return newIdx <= maxIdx;
}

export const SkillIncreaseModal: React.FC<SkillIncreaseModalProps> = ({
    character,
    level,
    onClose,
    onApply,
}) => {
    const { t, language } = useLanguage();
    const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

    const getSkillName = (skill: typeof allSkills[0]) => {
        return language === 'it' ? (skill.nameIt || skill.name) : skill.name;
    };

    const getCurrentProficiency = (skillName: string): Proficiency => {
        const charSkill = character.skills.find(s =>
            s.name.toLowerCase() === skillName.toLowerCase()
        );
        return charSkill?.proficiency || 'untrained';
    };

    // Filter skills that can be increased
    const increasableSkills = useMemo(() => {
        return allSkills.filter(skill => {
            const current = getCurrentProficiency(skill.name);
            if (current === 'legendary') return false;

            const next = getNextProficiency(current);
            if (!next) return false;

            return canIncreaseTo(next, level);
        });
    }, [character.skills, level]);

    const handleApply = () => {
        if (selectedSkill) {
            const current = getCurrentProficiency(selectedSkill);
            const next = getNextProficiency(current);
            if (next) {
                onApply(selectedSkill, next);
            }
        }
    };

    const getProficiencyLabel = (prof: Proficiency): string => {
        const labels: Record<Proficiency, { en: string; it: string }> = {
            'untrained': { en: 'Untrained', it: 'Non Addestrato' },
            'trained': { en: 'Trained', it: 'Addestrato' },
            'expert': { en: 'Expert', it: 'Esperto' },
            'master': { en: 'Master', it: 'Maestro' },
            'legendary': { en: 'Legendary', it: 'Leggendario' },
        };
        return language === 'it' ? labels[prof].it : labels[prof].en;
    };

    const maxProf = getMaxProficiency(level);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="selection-modal skill-increase-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        {t('builder.skillIncrease') || 'Skill Increase'} - {t('builder.level') || 'Level'} {level}
                    </h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="skill-increase-content">
                    <div className="skill-increase-info">
                        <p>
                            {language === 'it'
                                ? `Scegli un'abilità da migliorare. Max livello a ${level}: ${getProficiencyLabel(maxProf)}`
                                : `Choose a skill to improve. Max rank at level ${level}: ${getProficiencyLabel(maxProf)}`
                            }
                        </p>
                    </div>

                    <div className="skill-increase-list">
                        {increasableSkills.map(skill => {
                            const current = getCurrentProficiency(skill.name);
                            const next = getNextProficiency(current);
                            const isSelected = selectedSkill === skill.name;

                            return (
                                <button
                                    key={skill.id}
                                    className={`skill-increase-option ${isSelected ? 'selected' : ''}`}
                                    onClick={() => setSelectedSkill(skill.name)}
                                >
                                    <span className="skill-increase-name">{getSkillName(skill)}</span>
                                    <span className="skill-increase-progression">
                                        <span className={`prof-badge ${current}`}>
                                            {getProficiencyLabel(current)}
                                        </span>
                                        <span className="arrow">→</span>
                                        <span className={`prof-badge ${next}`}>
                                            {next && getProficiencyLabel(next)}
                                        </span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="modal-btn modal-btn-secondary" onClick={onClose}>
                        {t('actions.cancel')}
                    </button>
                    <button
                        className="modal-btn modal-btn-primary"
                        onClick={handleApply}
                        disabled={!selectedSkill}
                    >
                        {t('actions.apply')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SkillIncreaseModal;
