import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { CharacterSummary } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { useMediaQuery } from '../hooks/useMediaQuery';

export function CharacterListPage() {
    const { t, language } = useLanguage();
    const [characters, setCharacters] = useState<CharacterSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load characters from localStorage
        const savedCharacters = localStorage.getItem('pf2e-characters');
        if (savedCharacters) {
            try {
                const parsed = JSON.parse(savedCharacters);
                setCharacters(parsed);
            } catch {
                console.error('Failed to parse saved characters');
            }
        }
        setLoading(false);
    }, []);

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
                <Link to="/builder" className="btn btn-primary btn-lg">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="16" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                    {t('characters.create')}
                </Link>
            </div>
        );
    }

    return (
        <div>
            <header className="page-header">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="page-title">{t('characters.title')}</h1>
                        <p className="page-subtitle">{characters.length} {t('characters.saved')}</p>
                    </div>
                    <Link to="/builder" className="btn btn-primary">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="16" />
                            <line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
                        {t('nav.new')}
                    </Link>
                </div>
            </header>

            <div className="grid grid-auto">
                {characters.map(char => (
                    <CharacterCard key={char.id} character={char} language={language} t={t} />
                ))}
            </div>
        </div>
    );
}



function CharacterCard({ character, language, t }: {
    character: CharacterSummary;
    language: string;
    t: (key: string) => string;
}) {
    const isDesktop = useMediaQuery('(min-width: 768px)');

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const targetLink = isDesktop ? `/sheet/${character.id}` : `/builder/${character.id}`;

    return (
        <Link to={targetLink} className="card card-interactive">
            <div className="card-header">
                <h3 className="card-title">{character.name || 'Unnamed'}</h3>
                <span className="tag tag-level">Lv {character.level}</span>
            </div>
            <div className="card-body">
                <p className="text-secondary">
                    {character.ancestryId} • {character.classId}
                </p>
            </div>
            <div className="card-footer">
                <span className="text-muted text-sm">
                    {t('characters.modified')}: {formatDate(character.updatedAt)}
                </span>
            </div>
        </Link>
    );
}
