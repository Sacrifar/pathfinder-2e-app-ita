import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { Character } from '../../types';

interface MainMenuProps {
    isOpen: boolean;
    character: Character;
    onClose: () => void;
    onExportJSON: () => void;
    onImportJSON: (file: File) => void;
    onCopyStatBlock: () => void;
    onPrintPDF: () => void;
    onShareLink: () => Promise<void>;
    onSyncCloud: () => Promise<void>;
    onLoadFromCloud?: () => Promise<void>;
    onShowVariantRules?: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
    isOpen,
    character,
    onClose,
    onExportJSON,
    onImportJSON,
    onCopyStatBlock,
    onPrintPDF,
    onShareLink,
    onSyncCloud,
    onLoadFromCloud,
    onShowVariantRules,
}) => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    // const [showExportOptions, setShowExportOptions] = useState(false);  // Reserved for future submenu

    if (!isOpen) return null;

    const handleImportClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                onImportJSON(file);
            }
        };
        input.click();
    };

    const handleExportJSON = () => {
        onExportJSON();
        onClose();
    };

    const handleCopyStatBlock = () => {
        onCopyStatBlock();
        onClose();
    };

    const handlePrintPDF = () => {
        onPrintPDF();
        onClose();
    };

    const handleShareLink = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onShareLink().then(() => {
            onClose();
        }).catch((err) => {
            console.error('Share link error:', err);
            onClose();
        });
    };

    const handleSyncCloud = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onSyncCloud().then(() => {
            onClose();
        }).catch((err) => {
            console.error('Sync cloud error:', err);
            onClose();
        });
    };

    const handleLoadFromCloud = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onLoadFromCloud) {
            onLoadFromCloud().then(() => {
                onClose();
            }).catch((err) => {
                console.error('Load from cloud error:', err);
                onClose();
            });
        }
    };

    const buttonStyle = {
        width: '100%',
        padding: '12px 20px',
        background: 'none',
        border: 'none',
        color: 'var(--text-primary, #fff)',
        textAlign: 'left' as const,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '14px',
    };

    return (
        <>
            <div
                className="main-menu-overlay"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 9999,
                }}
                onClick={onClose}
            />
            <div
                className="main-menu-sidebar"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '320px',
                    maxWidth: '90%',
                    height: '100%',
                    background: 'var(--bg-elevated, #1a1a1a)',
                    borderRight: '1px solid var(--border-primary, #333)',
                    overflowY: 'auto',
                    zIndex: 10000,
                    pointerEvents: 'auto',
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid var(--border-primary, #333)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: '20px',
                        color: 'var(--text-primary, #fff)',
                    }}>
                        {t('menu.title') || 'Menu'}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-secondary, #888)',
                            fontSize: '24px',
                            cursor: 'pointer',
                            padding: '4px 8px',
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Character Info */}
                <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--border-primary, #333)',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: 'var(--color-primary, #3b82f6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: 'white',
                        }}>
                            {character.level}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontSize: '16px',
                                fontWeight: 'bold',
                                color: 'var(--text-primary, #fff)',
                            }}>
                                {character.name || t('character.unnamed')}
                            </div>
                            <div style={{
                                fontSize: '14px',
                                color: 'var(--text-secondary, #888)',
                            }}>
                                {character.ancestryId} • {character.classId}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Menu Sections */}
                <div style={{ padding: '8px 0' }}>
                    {/* Navigation Section */}
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{
                            padding: '8px 20px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            color: 'var(--text-muted, #666)',
                            letterSpacing: '0.5px',
                        }}>
                            {t('menu.navigation') || 'Navigation'}
                        </div>

                        {/* Back to Home */}
                        <button
                            onClick={() => {
                                navigate('/');
                                onClose();
                            }}
                            style={buttonStyle}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary, #2a2a2a)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                        >
                            <span style={{ fontSize: '18px' }}>🏠</span>
                            <span>{t('menu.backToHome') || 'Back to Home'}</span>
                        </button>
                    </div>

                    {/* Variant Rules Section */}
                    {onShowVariantRules && (
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{
                                padding: '8px 20px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                color: 'var(--text-muted, #666)',
                                letterSpacing: '0.5px',
                            }}>
                                {t('menu.variantRules') || 'Variant Rules'}
                            </div>

                            <button
                                onClick={() => {
                                    onShowVariantRules();
                                    onClose();
                                }}
                                style={buttonStyle}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary, #2a2a2a)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                            >
                                <span style={{ fontSize: '18px' }}>⚙️</span>
                                <span>{t('menu.configureVariantRules') || 'Configure Variant Rules'}</span>
                            </button>

                            {/* Active variant rules indicators */}
                            {Object.values(character.variantRules || {}).filter(Boolean).length > 0 && (
                                <div style={{
                                    padding: '8px 20px',
                                    fontSize: '11px',
                                    color: 'var(--color-warning, #f59e0b)',
                                }}>
                                    {Object.values(character.variantRules || {}).filter(Boolean).length} {t('menu.activeVariantRules') || 'active'}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Export & Backup Section */}
                    <div>
                        <div style={{
                            padding: '8px 20px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            color: 'var(--text-muted, #666)',
                            letterSpacing: '0.5px',
                        }}>
                            {t('menu.exportSection') || 'Export & Backup'}
                        </div>

                        {/* JSON Export */}
                        <button
                            onClick={handleExportJSON}
                            style={buttonStyle}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary, #2a2a2a)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                        >
                            <span style={{ fontSize: '18px' }}>📄</span>
                            <span>{t('menu.exportJSON') || 'Export as JSON'}</span>
                        </button>

                        {/* JSON Import */}
                        <button
                            onClick={handleImportClick}
                            style={buttonStyle}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary, #2a2a2a)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                        >
                            <span style={{ fontSize: '18px' }}>📥</span>
                            <span>{t('menu.importJSON') || 'Import from JSON'}</span>
                        </button>

                        {/* Copy Stat Block */}
                        <button
                            onClick={handleCopyStatBlock}
                            style={buttonStyle}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary, #2a2a2a)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                        >
                            <span style={{ fontSize: '18px' }}>📋</span>
                            <span>{t('menu.copyStatBlock') || 'Copy Stat Block'}</span>
                        </button>

                        {/* Print PDF */}
                        <button
                            onClick={handlePrintPDF}
                            style={buttonStyle}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary, #2a2a2a)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                        >
                            <span style={{ fontSize: '18px' }}>🖨️</span>
                            <span>{t('menu.printPDF') || 'Print / Save as PDF'}</span>
                        </button>
                    </div>

                    {/* Share & Cloud Section */}
                    <div style={{ marginTop: '16px' }}>
                        <div style={{
                            padding: '8px 20px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            color: 'var(--text-muted, #666)',
                            letterSpacing: '0.5px',
                        }}>
                            {t('menu.shareSection') || 'Share & Cloud'}
                        </div>

                        {/* Share Link */}
                        <button
                            onClick={handleShareLink}
                            style={buttonStyle}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary, #2a2a2a)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                        >
                            <span style={{ fontSize: '18px' }}>🔗</span>
                            <span>{t('menu.shareLink') || 'Share Link'}</span>
                        </button>

                        {/* Cloud Sync */}
                        <button
                            onClick={handleSyncCloud}
                            style={buttonStyle}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary, #2a2a2a)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                        >
                            <span style={{ fontSize: '18px' }}>☁️</span>
                            <span>{t('menu.syncCloud') || 'Sync to Cloud'}</span>
                        </button>

                        {/* Load from Cloud */}
                        {onLoadFromCloud && (
                            <button
                                onClick={handleLoadFromCloud}
                                style={buttonStyle}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary, #2a2a2a)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                            >
                                <span style={{ fontSize: '18px' }}>⬇️</span>
                                <span>{t('menu.loadFromCloud') || 'Load from Cloud'}</span>
                            </button>
                        )}
                    </div>

                    {/* Local Storage Info */}
                    <div style={{ marginTop: '16px', padding: '16px 20px' }}>
                        <div style={{
                            fontSize: '12px',
                            color: 'var(--text-secondary, #888)',
                            lineHeight: '1.5',
                        }}>
                            <div>💾 {t('menu.autoSave') || 'Auto-save enabled'}</div>
                            <div style={{ marginTop: '4px', fontSize: '11px', opacity: 0.7 }}>
                                {t('menu.lastSaved') || 'Last saved'}: {new Date(character.updatedAt).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MainMenu;
