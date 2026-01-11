import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { createEmptyCharacter } from '../types';
import type { Character } from '../types';

export function HomePage() {
    const navigate = useNavigate();
    const { t, language, toggleLanguage } = useLanguage();

    const handleCreateCharacter = () => {
        // Create a new empty character
        const newCharacter = createEmptyCharacter();

        // Save it to localStorage
        const saved = localStorage.getItem('pf2e-characters');
        const chars: Character[] = saved ? JSON.parse(saved) : [];
        chars.push(newCharacter);
        localStorage.setItem('pf2e-characters', JSON.stringify(chars));

        // Navigate directly to the character sheet
        navigate(`/sheet/${newCharacter.id}`);
    };

    return (
        <div className="home-page home-page-minimal">
            {/* Hero Section - Centered */}
            <section className="hero-minimal">
                <h1 className="hero-title">
                    {t('home.title')}
                </h1>
                <p className="hero-subtitle">
                    {t('home.subtitle')}
                </p>

                <div className="hero-buttons">
                    <button onClick={handleCreateCharacter} className="btn btn-primary btn-xl">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 24, height: 24 }}>
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="16" />
                            <line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
                        {t('home.createCharacter') || 'Crea Personaggio'}
                    </button>
                    <button onClick={() => navigate('/characters')} className="btn btn-secondary btn-xl">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 24, height: 24 }}>
                            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        {t('home.loadCharacter') || 'Carica Personaggio'}
                    </button>
                </div>
            </section>

            {/* Language Toggle - Bottom */}
            <div className="language-toggle-container">
                <button
                    className="btn btn-ghost language-toggle-btn"
                    onClick={toggleLanguage}
                >
                    <span className="language-flag">{language === 'en' ? '🇬🇧' : '🇮🇹'}</span>
                    <span className="language-label">
                        {language === 'en' ? 'English' : 'Italiano'}
                    </span>
                </button>
            </div>
        </div>
    );
}

