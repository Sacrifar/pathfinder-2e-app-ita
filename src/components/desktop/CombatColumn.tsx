import React, { useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { SkillDisplay } from './SkillsPanel';

interface CombatColumnProps {
    heroPoints: number;
    classDC?: number;
    perception: number;
    initiative: number;
    skills: SkillDisplay[];
}

// Componente memoizzato per render singolo skill
const SkillItem = React.memo<{
    skill: SkillDisplay;
    t: (key: string) => string;
    formatModifier: (val: number) => string;
    getProficiencyIcon: (prof: string) => string;
    getProficiencyColor: (prof: string) => string;
}>(({ skill, t, formatModifier, getProficiencyIcon, getProficiencyColor }) => (
    <div className="skill-item">
        <span className="skill-name">
            {t(`skills.${skill.name.toLowerCase()}`) || skill.name}
        </span>
        <div className="skill-modifier-container">
            <span
                className="skill-proficiency"
                style={{ color: getProficiencyColor(skill.proficiency) }}
            >
                {getProficiencyIcon(skill.proficiency)}
            </span>
            <span className="skill-modifier">{formatModifier(skill.modifier)}</span>
        </div>
    </div>
));

SkillItem.displayName = 'SkillItem';

export const CombatColumn: React.FC<CombatColumnProps> = React.memo(({
    heroPoints,
    classDC,
    perception,
    initiative,
    skills,
}) => {
    const { t } = useLanguage();

    const formatModifier = useMemo(() => (value: number) => {
        return value >= 0 ? `+${value}` : `${value}`;
    }, []);

    const getProficiencyIcon = useMemo(() => (proficiency: string) => {
        switch (proficiency) {
            case 'untrained': return 'U';
            case 'trained': return 'T';
            case 'expert': return 'E';
            case 'master': return 'M';
            case 'legendary': return 'L';
            default: return 'U';
        }
    }, []);

    const getProficiencyColor = useMemo(() => (proficiency: string) => {
        switch (proficiency) {
            case 'untrained': return '#888';
            case 'trained': return '#fff';
            case 'expert': return '#10b981';
            case 'master': return '#3b82f6';
            case 'legendary': return '#f59e0b';
            default: return '#888';
        }
    }, []);

    return (
        <div className="combat-column">
            {/* Status & DCs */}
            <div className="status-box">
                <div className="hero-points-display">
                    <span className="status-label">{t('stats.heroPoints') || 'HP'}</span>
                    <div className="hero-points-icons">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className={`hero-point-icon ${i < heroPoints ? 'filled' : 'empty'}`}
                            />
                        ))}
                    </div>
                </div>
                {classDC && (
                    <div className="class-dc-display">
                        <span className="status-label">{t('stats.classDC') || 'Class DC'}</span>
                        <span className="dc-value">{classDC}</span>
                    </div>
                )}
                <div className="perception-display">
                    <span className="status-label">{t('stats.perception') || 'Perception'}</span>
                    <span className="perception-value">{formatModifier(perception)}</span>
                </div>
                <div className="initiative-display">
                    <span className="status-label">{t('stats.initiative') || 'Initiative'}</span>
                    <span className="initiative-value">{formatModifier(initiative)}</span>
                </div>
            </div>

            {/* Skills List */}
            <div className="skills-list-box">
                <h4 className="skills-title">{t('stats.skills') || 'Skills'}</h4>
                <div className="skills-list">
                    {skills.map((skill, index) => (
                        <SkillItem
                            key={index}
                            skill={skill}
                            t={t}
                            formatModifier={formatModifier}
                            getProficiencyIcon={getProficiencyIcon}
                            getProficiencyColor={getProficiencyColor}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
});

CombatColumn.displayName = 'CombatColumn';

export default CombatColumn;
