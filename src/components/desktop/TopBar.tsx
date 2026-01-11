import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';

interface TopBarProps {
    characterName: string;
    className: string;
    level: number;
    onMenuClick: () => void;
    onRestClick: () => void;
    onLevelChange?: (newLevel: number) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
    characterName,
    className,
    level,
    onMenuClick,
    onRestClick,
    onLevelChange,
}) => {
    const { t, language, toggleLanguage } = useLanguage();

    const handleLevelUp = () => {
        if (level < 20 && onLevelChange) {
            onLevelChange(level + 1);
        }
    };

    const handleLevelDown = () => {
        if (level > 1 && onLevelChange) {
            onLevelChange(level - 1);
        }
    };

    return (
        <div className="desktop-topbar">
            <div className="topbar-left">
                <button className="topbar-menu-btn" onClick={onMenuClick}>
                    <span style={{ fontSize: '18px' }}>≡</span>
                    <span>{t('nav.menu') || 'Menu'}</span>
                </button>
            </div>

            <div className="topbar-center">
                <span className="character-info">
                    {characterName || t('character.unnamed')} - {className}
                </span>
                <div className="level-controls">
                    <button
                        className="level-btn"
                        onClick={handleLevelDown}
                        disabled={level <= 1}
                        title="Level Down"
                    >
                        −
                    </button>
                    <span className="level-display">
                        {t('builder.level') || 'Lv'} {level}
                    </span>
                    <button
                        className="level-btn"
                        onClick={handleLevelUp}
                        disabled={level >= 20}
                        title="Level Up"
                    >
                        +
                    </button>
                </div>
            </div>

            <div className="topbar-right">
                <button className="topbar-btn" onClick={toggleLanguage}>
                    {language === 'en' ? '🇬🇧' : '🇮🇹'}
                </button>
                <button className="topbar-btn" onClick={onRestClick}>
                    {t('actions.rest') || 'Rest'}
                </button>
            </div>
        </div>
    );
};

export default TopBar;
