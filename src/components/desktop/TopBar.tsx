import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../contexts/ThemeContext';

interface TopBarProps {
    characterName: string;
    className: string;
    level: number;
    xp?: number;
    size?: string;
    speed?: number;
    abilityScores?: {
        str: number;
        dex: number;
        con: number;
        int: number;
        wis: number;
        cha: number;
    };
    onMenuClick: () => void;
    onRestClick: () => void;
    onLevelChange?: (newLevel: number) => void;
    onNameChange?: (newName: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
    characterName,
    className,
    level,
    xp = 0,
    size = 'Medium',
    speed = 25,
    abilityScores,
    onMenuClick,
    onRestClick: _onRestClick,
    onLevelChange,
    onNameChange,
}) => {
    const { t, language, toggleLanguage } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const [isEditingName, setIsEditingName] = useState(false);
    const [editingName, setEditingName] = useState(characterName);

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

    const handleStartEditingName = () => {
        setEditingName(characterName);
        setIsEditingName(true);
    };

    const handleSaveName = () => {
        if (editingName.trim() && onNameChange) {
            onNameChange(editingName.trim());
        }
        setIsEditingName(false);
    };

    const handleCancelEditName = () => {
        setEditingName(characterName);
        setIsEditingName(false);
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
                <div className="character-identity">
                    <span className="character-name">
                        {characterName || t('character.unnamed')}
                        {onNameChange && (
                            <button
                                className="name-edit-btn"
                                onClick={handleStartEditingName}
                                title={t('actions.edit') || 'Edit name'}
                            >
                                ✎
                            </button>
                        )}
                    </span>
                    <span className="character-class">{className}</span>
                </div>
                <div className="character-progress">
                    <div className="level-display-value">
                        <span className="progress-label">{t('builder.level') || 'Lv'}</span>
                        <span className="progress-value">{level}</span>
                    </div>
                    <div className="xp-display">
                        <span className="progress-label">{t('builder.xp') || 'XP'}</span>
                        <span className="progress-value">{xp}</span>
                    </div>
                </div>
                <div className="character-physical">
                    <div className="physical-stat">
                        <span className="physical-label">{t('stats.size') || 'Size'}</span>
                        <span className="physical-value">{size}</span>
                    </div>
                    <div className="physical-stat">
                        <span className="physical-label">{t('stats.speed') || 'Speed'}</span>
                        <span className="physical-value">{speed}ft</span>
                    </div>
                </div>
                {/* Ability Scores */}
                {abilityScores && (
                    <div className="ability-scores-bar">
                        {Object.entries(abilityScores).map(([key, value]) => {
                            const modifier = Math.floor((value - 10) / 2);
                            const modStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
                            return (
                                <div key={key} className="ability-score-mini">
                                    <span className="ability-name">{key.toUpperCase()}</span>
                                    <div className="ability-score-content">
                                        <span className="ability-value">{value}</span>
                                        <span className="ability-modifier">{modStr}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="topbar-right">
                {/* Level Controls */}
                {onLevelChange && (
                    <div className="level-controls">
                        <button
                            className="level-btn"
                            onClick={handleLevelDown}
                            disabled={level <= 1}
                            title="Level Down"
                        >
                            −
                        </button>
                        <button
                            className="level-btn"
                            onClick={handleLevelUp}
                            disabled={level >= 20}
                            title="Level Up"
                        >
                            +
                        </button>
                    </div>
                )}
                <button
                    className="topbar-btn"
                    onClick={toggleTheme}
                    title={theme === 'dark' ? (t('theme.light') || 'Light Mode') : (t('theme.dark') || 'Dark Mode')}
                >
                    <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
                </button>
                <button
                    className="topbar-btn"
                    onClick={toggleLanguage}
                >
                    <span>{language === 'en' ? '🇬🇧' : '🇮🇹'}</span>
                </button>
            </div>

            {/* Edit Name Modal */}
            {isEditingName && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999
                    }}
                    onClick={handleCancelEditName}
                >
                    <div
                        style={{
                            background: 'var(--bg-elevated, #1a1a1a)',
                            borderRadius: '12px',
                            padding: '24px',
                            maxWidth: '400px',
                            width: '90%',
                            border: '1px solid var(--border-primary, #333)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ marginBottom: '16px', color: 'var(--text-primary, #fff)' }}>
                            {t('character.editName') || 'Edit Character Name'}
                        </h3>
                        <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveName();
                                if (e.key === 'Escape') handleCancelEditName();
                            }}
                            autoFocus
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                background: 'var(--bg-secondary, #2a2a2a)',
                                border: '1px solid var(--border-primary, #333)',
                                borderRadius: '6px',
                                color: 'var(--text-primary, #fff)',
                                fontSize: '16px',
                                marginBottom: '20px',
                                boxSizing: 'border-box'
                            }}
                        />
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={handleCancelEditName}
                                style={{
                                    padding: '10px 20px',
                                    background: 'var(--bg-elevated, #2a2a2a)',
                                    color: 'var(--text-primary, #fff)',
                                    border: '1px solid var(--border-primary, #333)',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                {t('actions.cancel') || 'Cancel'}
                            </button>
                            <button
                                onClick={handleSaveName}
                                disabled={!editingName.trim()}
                                style={{
                                    padding: '10px 20px',
                                    background: 'var(--color-primary, #3b82f6)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: editingName.trim() ? 'pointer' : 'not-allowed',
                                    opacity: editingName.trim() ? 1 : 0.5
                                }}
                            >
                                {t('actions.save') || 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TopBar;
