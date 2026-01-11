import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';

interface BuildChoice {
    id: string;
    type: string;
    label: string;
    value?: string;
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

export const LevelSidebar: React.FC<LevelSidebarProps> = ({
    sections,
    currentLevel,
    onLevelChange,
}) => {
    const { t } = useLanguage();

    const handleLevelUp = () => {
        if (currentLevel < 20 && onLevelChange) {
            onLevelChange(currentLevel + 1);
        }
    };

    const handleLevelDown = () => {
        if (currentLevel > 1 && onLevelChange) {
            onLevelChange(currentLevel - 1);
        }
    };

    return (
        <div className="level-sidebar">
            {/* Level Selector Header */}
            <div className="level-selector-header">
                <div className="level-badge-container">
                    <button
                        className="level-change-btn"
                        onClick={handleLevelDown}
                        disabled={currentLevel <= 1}
                    >
                        −
                    </button>
                    <div className="level-badge">
                        <span className="level-number">{currentLevel}</span>
                    </div>
                    <button
                        className="level-change-btn"
                        onClick={handleLevelUp}
                        disabled={currentLevel >= 20}
                    >
                        +
                    </button>
                </div>
                <span className="level-label">{t('builder.level') || 'Level'}</span>
            </div>

            {sections.map((section) => (
                <div key={section.level} className="level-section">
                    <div className="level-header">
                        {t('character.level')} {section.level}
                    </div>
                    <div className="level-choices">
                        {section.choices.map((choice) => (
                            <div
                                key={choice.id}
                                className={`build-choice ${choice.value ? 'selected' : 'not-selected'}`}
                                onClick={choice.onClick}
                            >
                                <div className="build-choice-icon">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66z" />
                                    </svg>
                                </div>
                                <span className="build-choice-label">
                                    {choice.value || t(choice.label) || choice.label}
                                </span>
                                {choice.value && (
                                    <span className="build-choice-value">→</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Show grayed out future levels */}
            {currentLevel < 20 && (
                <div className="level-section" style={{ opacity: 0.5 }}>
                    <div className="level-header" style={{ background: 'var(--desktop-text-muted)' }}>
                        {t('character.level')} {currentLevel + 1}+
                    </div>
                    <div className="level-choices">
                        <div className="build-choice not-selected">
                            <div className="build-choice-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66z" />
                                </svg>
                            </div>
                            <span className="build-choice-label" style={{ color: 'var(--desktop-text-muted)' }}>
                                {t('builder.futureChoices') || 'Future choices...'}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LevelSidebar;

