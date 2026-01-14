import React, { useMemo, useCallback } from 'react';
import { useLanguage } from '../../hooks/useLanguage';

// Import icons
import iconAncestry from '../../data/Azioni/icon_ancestry.png';
import iconBackground from '../../data/Azioni/icon_background.png';
import iconClass from '../../data/Azioni/icon_class.png';
import iconCog from '../../data/Azioni/icon_cog.png';
import iconCogTick from '../../data/Azioni/icon_cog_tick.png';
import iconSkill from '../../data/Azioni/icon_skill.png';
import iconGeneral from '../../data/Azioni/icon_general.png';

interface BuildChoice {
    id: string;
    type: string;
    label: string;
    value?: string;
    currentCount?: number; // Current count for boost/skill (used for badge countdown)
    maxValue?: number; // Maximum value for this choice (e.g., 5 for skills at level 1)
    required: boolean;
    onClick: () => void;
}

interface LevelSection {
    level: number;
    choices: BuildChoice[];
}

interface LevelSidebarProps {
    sections: LevelSection[];
    currentLevel: number;
    onLevelChange?: (newLevel: number) => void;
}

// Icon mapping
const getIconForType = (type: string): string => {
    const iconMap: Record<string, string> = {
        'ancestry': 'ancestry',
        'heritage': 'ancestry',
        'background': 'background',
        'class': 'class',
        'secondaryClass': 'class',
        'boost': 'cog',
        'skill': 'cog', // skill training always uses cog
        'ancestryFeat': 'ancestry',
        'classFeat': 'class',
        'archetypeFeat': 'class',
        'skillFeat': 'skill',
        'generalFeat': 'general',
    };
    return iconMap[type] || 'cog';
};

// Get actual icon import
const getIconImport = (iconKey: string): any => {
    const iconImports: Record<string, any> = {
        'ancestry': iconAncestry,
        'background': iconBackground,
        'class': iconClass,
        'cog': iconCog,
        'skill': iconSkill,
        'general': iconGeneral,
    };
    return iconImports[iconKey] || iconCog;
};

// Check if choice has a value (is completed)
const isCompleted = (choice: BuildChoice): boolean => {
    return !!choice.value && choice.value !== '';
};

export const LevelSidebar: React.FC<LevelSidebarProps> = React.memo(({
    sections,
    currentLevel,
    onLevelChange,
}) => {
    const { t } = useLanguage();

    const handleLevelUp = useCallback(() => {
        if (currentLevel < 20 && onLevelChange) {
            onLevelChange(currentLevel + 1);
        }
    }, [currentLevel, onLevelChange]);

    const handleLevelDown = useCallback(() => {
        if (currentLevel > 1 && onLevelChange) {
            onLevelChange(currentLevel - 1);
        }
    }, [currentLevel, onLevelChange]);

    return (
        <div className="level-sidebar-new">
            {/* Level Selector Header */}
            <div className="level-selector-header-new">
                <div className="level-controls">
                    <button
                        className="level-btn"
                        onClick={handleLevelDown}
                        disabled={currentLevel <= 1}
                    >
                        −
                    </button>
                    <div className="level-badge-new">
                        <span className="level-text">{t('builder.level') || 'Level'}</span>
                        <span className="level-number-new">{currentLevel}</span>
                    </div>
                    <button
                        className="level-btn"
                        onClick={handleLevelUp}
                        disabled={currentLevel >= 20}
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Level Sections */}
            <div className="level-sections-container">
                {sections.map((section) => {
                    const isFutureLevel = section.level > currentLevel;
                    return (
                        <div
                            key={section.level}
                            className={`level-section-new ${isFutureLevel ? 'future-level' : ''}`}
                        >
                            {/* Level Header */}
                            <div className="level-header-new">
                                {t('character.level')} {section.level}
                            </div>

                            {/* Choices */}
                            <div className="level-choices-new">
                                {section.choices.map((choice) => {
                                    const completed = isCompleted(choice);
                                    const iconKey = getIconForType(choice.type);

                                    // Special handling for skill training and boosts
                                    let iconSrc = iconCog;
                                    let useTickIcon = false;
                                    let skillCount = 0;
                                    let maxSkills = 5;
                                    let boostCount = 0;
                                    let totalBoosts = 4; // Default

                                    // Set default icon based on type (for incomplete items)
                                    if (choice.type !== 'skill' && choice.type !== 'boost') {
                                        iconSrc = getIconImport(iconKey);
                                    }

                                    if (choice.type === 'skill') {
                                        // Use currentCount and maxValue if available
                                        if (choice.currentCount !== undefined && choice.maxValue !== undefined) {
                                            skillCount = choice.currentCount;
                                            maxSkills = choice.maxValue;
                                            if (skillCount >= maxSkills && maxSkills > 0) {
                                                useTickIcon = true;
                                            }
                                        } else {
                                            // Fallback: extract from value (e.g., "3 skills" -> 3)
                                            const match = choice.value?.match(/(\d+)/);
                                            skillCount = match ? parseInt(match[1]) : 0;
                                            maxSkills = choice.maxValue || 5;
                                            if (skillCount >= maxSkills && maxSkills > 0) {
                                                useTickIcon = true;
                                            }
                                        }
                                    } else if (choice.type === 'boost') {
                                        // Use currentCount and maxValue if available
                                        if (choice.currentCount !== undefined && choice.maxValue !== undefined) {
                                            boostCount = choice.currentCount;
                                            totalBoosts = choice.maxValue;
                                            if (boostCount >= totalBoosts) {
                                                useTickIcon = true;
                                            }
                                        } else {
                                            // Fallback: extract from value (e.g., "9 boosts" -> 9)
                                            const match = choice.value?.match(/(\d+)/);
                                            boostCount = match ? parseInt(match[1]) : 0;
                                            totalBoosts = choice.maxValue || 9;
                                            if (boostCount >= totalBoosts) {
                                                useTickIcon = true;
                                            }
                                        }
                                    }

                                    return (
                                        <div
                                            key={choice.id}
                                            className={`choice-card ${completed ? 'completed' : 'incomplete'} ${isFutureLevel ? 'future' : ''}`}
                                            onClick={choice.onClick || (() => { })}
                                        >
                                            {/* Icon with overlay for skills and boosts */}
                                            <div className="choice-icon">
                                                {choice.type === 'skill' && useTickIcon ? (
                                                    <img src={iconCogTick} alt="✓" className="icon-img" />
                                                ) : choice.type === 'skill' ? (
                                                    <>
                                                        <img src={iconCog} alt="" className="icon-img" />
                                                        <span className="icon-overlay">{maxSkills - skillCount}</span>
                                                    </>
                                                ) : choice.type === 'boost' && useTickIcon ? (
                                                    <img src={iconCogTick} alt="✓" className="icon-img" />
                                                ) : choice.type === 'boost' ? (
                                                    <>
                                                        <img src={iconCog} alt="" className="icon-img" />
                                                        <span className="icon-overlay">{totalBoosts - boostCount}</span>
                                                    </>
                                                ) : (
                                                    <img src={iconSrc} alt="" className="icon-img" />
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="choice-content">
                                                <div className="choice-label">{t(choice.label) || choice.label}</div>
                                                {/* Hide value for boost/skill (badge shows status), show for other types */}
                                                {(choice.type !== 'boost' && choice.type !== 'skill') && (
                                                    <div className={`choice-value ${completed ? 'has-value' : 'no-value'}`}>
                                                        {completed ? choice.value : t('builder.notSelected') || 'Not Selected'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

LevelSidebar.displayName = 'LevelSidebar';

export default LevelSidebar;
