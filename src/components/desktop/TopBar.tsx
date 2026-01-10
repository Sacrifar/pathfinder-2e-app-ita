import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';

interface TopBarProps {
    characterName: string;
    className: string;
    level: number;
    onMenuClick: () => void;
    onRestClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
    characterName,
    className,
    level,
    onMenuClick,
    onRestClick,
}) => {
    const { t, language, toggleLanguage } = useLanguage();

    return (
        <div className="desktop-topbar">
            <div className="topbar-left">
                <button className="topbar-menu-btn" onClick={onMenuClick}>
                    <span style={{ fontSize: '18px' }}>≡</span>
                    <span>{t('nav.menu') || 'Menu'}</span>
                </button>
            </div>

            <div className="topbar-center">
                {characterName || t('character.unnamed')} - {className} {level}
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
