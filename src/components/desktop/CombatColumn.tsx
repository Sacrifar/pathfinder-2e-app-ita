import React, { useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { SkillDisplay } from './SkillsPanel';

interface ClassDCDisplay {
    classType: string;
    value: number;
}

interface CombatColumnProps {
    heroPoints: number;
    classDC?: number | ClassDCDisplay[];
    perception: number;
    initiative: number;
    skills: SkillDisplay[];
    onSkillClick?: (skillName: string) => void;
    onHeroPointChange?: (newHeroPoints: number) => void;
}

// Componente memoizzato per render singolo skill
const SkillItem = React.memo<{
    skill: SkillDisplay;
    t: (key: string) => string;
    formatModifier: (val: number) => string;
    getProficiencyIcon: (prof: string) => string;
    getProficiencyColor: (prof: string) => string;
    onSkillClick?: (skillName: string) => void;
}>(({ skill, t, formatModifier, getProficiencyIcon, getProficiencyColor, onSkillClick }) => (
    <div
        className={`skill-item ${onSkillClick ? 'clickable' : ''}`}
        onClick={() => onSkillClick?.(skill.name)}
        style={onSkillClick ? { cursor: 'pointer' } : undefined}
    >
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
    onSkillClick,
    onHeroPointChange,
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
            case 'untrained': return 'var(--prof-untrained)';
            case 'trained': return 'var(--prof-trained)';
            case 'expert': return 'var(--prof-expert)';
            case 'master': return 'var(--prof-master)';
            case 'legendary': return 'var(--prof-legendary)';
            default: return 'var(--prof-untrained)';
        }
    }, []);

    // Handle hero point click with cascade behavior
    const handleHeroPointClick = (clickedIndex: number) => {
        if (!onHeroPointChange) return;

        // If clicking on a filled dot, empty it and all dots after it (cascade off)
        // If clicking on an empty dot, fill it and all dots before it (cascade on)
        if (clickedIndex < heroPoints) {
            // Clicking a filled dot - cascade off (empty this and all after)
            onHeroPointChange(clickedIndex);
        } else {
            // Clicking an empty dot - cascade on (fill this and all before)
            onHeroPointChange(clickedIndex + 1);
        }
    };

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
                                className={`hero-point-icon ${i < heroPoints ? 'filled' : 'empty'} ${onHeroPointChange ? 'clickable' : ''}`}
                                onClick={() => handleHeroPointClick(i)}
                                style={onHeroPointChange ? { cursor: 'pointer' } : undefined}
                            />
                        ))}
                    </div>
                </div>
                {classDC && (
                    <>
                        {typeof classDC === 'number' ? (
                            <div className="class-dc-display">
                                <span className="status-label">{t('stats.classDC') || 'Class DC'}</span>
                                <span className="dc-value">{classDC}</span>
                            </div>
                        ) : (
                            classDC.map((dc) => (
                                <div key={dc.classType} className="class-dc-display">
                                    <span className="status-label">
                                        {dc.classType.charAt(0).toUpperCase() + dc.classType.slice(1)} DC
                                    </span>
                                    <span className="dc-value">{dc.value}</span>
                                </div>
                            ))
                        )}
                    </>
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
                            onSkillClick={onSkillClick}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
});

CombatColumn.displayName = 'CombatColumn';

export default CombatColumn;
