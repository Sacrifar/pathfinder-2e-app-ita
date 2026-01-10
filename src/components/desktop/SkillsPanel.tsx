import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { SkillDefinition } from '../../data/skills';
import { Proficiency } from '../../types';

export interface SkillDisplay extends SkillDefinition {
    modifier: number;
    proficiency: Proficiency;
}

interface SkillsPanelProps {
    skills: SkillDisplay[];
    onSkillClick: (skill: SkillDisplay) => void;
}

export const SkillsPanel: React.FC<SkillsPanelProps> = ({
    skills,
    onSkillClick,
}) => {
    const { language } = useLanguage();

    const formatModifier = (value: number) => {
        return value >= 0 ? `+${value}` : `${value}`;
    };

    const getSkillName = (skill: SkillDisplay) => {
        return language === 'it' && skill.nameIt ? skill.nameIt : skill.name;
    };

    // Split skills into two columns
    const midpoint = Math.ceil(skills.length / 2);
    const leftColumn = skills.slice(0, midpoint);
    const rightColumn = skills.slice(midpoint);

    return (
        <div className="skills-panel">
            <div className="skills-grid">
                <div className="skills-column">
                    {leftColumn.map((skill) => (
                        <div
                            key={skill.id}
                            className="skill-row"
                            onClick={() => onSkillClick(skill)}
                        >
                            <span className="skill-name">{getSkillName(skill)}</span>
                            <span className={`skill-modifier ${skill.modifier >= 0 ? 'positive' : 'negative'}`}>
                                {formatModifier(skill.modifier)}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="skills-column">
                    {rightColumn.map((skill) => (
                        <div
                            key={skill.id}
                            className="skill-row"
                            onClick={() => onSkillClick(skill)}
                        >
                            <span className="skill-name">{getSkillName(skill)}</span>
                            <span className={`skill-modifier ${skill.modifier >= 0 ? 'positive' : 'negative'}`}>
                                {formatModifier(skill.modifier)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SkillsPanel;
