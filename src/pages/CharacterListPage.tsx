import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { CharacterSummary } from '../types';
import { migrateCharacter } from '../types';
import { ancestries, classes } from '../data';
import { useLanguage } from '../hooks/useLanguage';
import { useLocalizedName } from '../hooks/useLanguage';
import { useMediaQuery } from '../hooks/useMediaQuery';

export function CharacterListPage() {
    const { t, language } = useLanguage();
    const getName = useLocalizedName();
    const navigate = useNavigate();
    const [characters, setCharacters] = useState<CharacterSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

    useEffect(() => {
        // Load characters from localStorage
        const savedCharacters = localStorage.getItem('pf2e-characters');
        if (savedCharacters) {
            try {
                const parsed = JSON.parse(savedCharacters);
                // Apply migration to handle old class IDs
                const migrated = parsed.map((char: any) => migrateCharacter(char));
                setCharacters(migrated);
            } catch {
                console.error('Failed to parse saved characters');
            }
        }
        setLoading(false);
    }, []);

    const handleDeleteCharacter = (characterId: string, characterName: string) => {
        setDeleteConfirm({ id: characterId, name: characterName });
    };

    const confirmDelete = () => {
        if (deleteConfirm) {
            const updatedCharacters = characters.filter(c => c.id !== deleteConfirm.id);
            setCharacters(updatedCharacters);
            localStorage.setItem('pf2e-characters', JSON.stringify(updatedCharacters));
            setDeleteConfirm(null);
        }
    };

    const cancelDelete = () => {
        setDeleteConfirm(null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center" style={{ minHeight: '50vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (characters.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                </div>
                <h2 className="empty-state-title">{t('characters.empty.title')}</h2>
                <p className="empty-state-description">
                    {t('characters.empty.description')}
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="btn btn-secondary"
                    style={{
                        background: 'var(--bg-elevated, #2a2a2a)',
                        color: 'var(--text-primary, #fff)',
                        border: '1px solid var(--border-primary, #333)',
                        borderRadius: '8px',
                        padding: '10px 20px',
                        cursor: 'pointer'
                    }}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    {t('nav.back') || 'Back'}
                </button>
            </div>
        );
    }

    return (
        <div>
            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div
                    className="modal-overlay"
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
                    onClick={cancelDelete}
                >
                    <div
                        className="modal-content"
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
                            {t('characters.deleteConfirm') || 'Delete Character?'}
                        </h3>
                        <p style={{ marginBottom: '24px', color: 'var(--text-secondary, #aaa)' }}>
                            {t('characters.deleteMessage') || `Are you sure you want to delete`} <strong>{deleteConfirm.name}</strong>?
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={cancelDelete}
                                className="btn btn-secondary"
                                style={{ padding: '10px 20px' }}
                            >
                                {t('actions.cancel') || 'Cancel'}
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="btn btn-danger"
                                style={{ padding: '10px 20px' }}
                            >
                                {t('actions.delete') || 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <header className="page-header">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/')}
                        className="btn btn-secondary"
                        style={{
                            background: 'var(--bg-elevated, #2a2a2a)',
                            color: 'var(--text-primary, #fff)',
                            border: '1px solid var(--border-primary, #333)',
                            borderRadius: '8px',
                            padding: '10px 20px',
                            cursor: 'pointer'
                        }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        {t('nav.back') || 'Back'}
                    </button>
                    <div>
                        <h1 className="page-title">{t('characters.title')}</h1>
                        <p className="page-subtitle">{characters.length} {t('characters.saved')}</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-auto">
                {characters.map(char => (
                    <CharacterCard
                        key={char.id}
                        character={char}
                        language={language}
                        t={t}
                        onDelete={handleDeleteCharacter}
                    />
                ))}
            </div>
        </div>
    );
}



function CharacterCard({ character, language, t, onDelete }: {
    character: CharacterSummary;
    language: string;
    t: (key: string) => string;
    onDelete: (id: string, name: string) => void;
}) {
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const isTouchDevice = useMediaQuery('(hover: none)');
    const [showDeleteButton, setShowDeleteButton] = useState(false);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const targetLink = isDesktop ? `/sheet/${character.id}` : `/builder/${character.id}`;

    // Always show delete button on touch devices, otherwise show on hover
    const shouldShowDelete = isTouchDevice || showDeleteButton;

    return (
        <div
            className="card card-interactive"
            onMouseEnter={() => !isTouchDevice && setShowDeleteButton(true)}
            onMouseLeave={() => !isTouchDevice && setShowDeleteButton(false)}
            style={{ position: 'relative' }}
        >
            {shouldShowDelete && (
                <button
                    type="button"
                    onClick={() => onDelete(character.id, character.name || 'Unnamed')}
                    className="btn btn-danger btn-sm"
                    style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        padding: '6px 10px',
                        fontSize: '12px',
                        zIndex: 100,
                        cursor: 'pointer'
                    }}
                    title={t('characters.delete') || 'Delete'}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                        <polyline points="3,6 5,6 21,6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                </button>
            )}
            <Link to={targetLink} style={{ textDecoration: 'none', color: 'inherit', display: 'block', position: 'relative', zIndex: 1 }}>
                <div className="card-header">
                    <h3 className="card-title">{character.name || 'Unnamed'}</h3>
                    <span className="tag tag-level">Lv {character.level}</span>
                </div>
                <div className="card-body">
                    <p className="text-secondary">
                        {ancestries.find(a => a.id === character.ancestryId)?.name || character.ancestryId} • {classes.find(c => c.id === character.classId)?.name || character.classId}
                    </p>
                </div>
                <div className="card-footer">
                    <span className="text-muted text-sm">
                        {t('characters.modified')}: {formatDate(character.updatedAt)}
                    </span>
                </div>
            </Link>
        </div>
    );
}
