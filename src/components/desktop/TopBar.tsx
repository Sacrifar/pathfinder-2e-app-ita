import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';

interface TopBarProps {
    characterName: string;
    className: string;
    level: number;
    onMenuClick: () => void;
    onRestClick: () => void;
    onLevelChange?: (newLevel: number) => void;
    onNameChange?: (newName: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
    characterName,
    className,
    level,
    onMenuClick,
    onRestClick,
    onLevelChange,
    onNameChange,
}) => {
    const { t, language, toggleLanguage } = useLanguage();
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
                <span className="character-info">
                    {characterName || t('character.unnamed')} - {className}
                    {onNameChange && (
                        <button
                            className="name-edit-btn"
                            onClick={handleStartEditingName}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--color-muted, #888)',
                                cursor: 'pointer',
                                marginLeft: '8px',
                                padding: '2px 6px',
                                fontSize: '14px'
                            }}
                            title={t('actions.edit') || 'Edit name'}
                        >
                            ✎
                        </button>
                    )}
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
