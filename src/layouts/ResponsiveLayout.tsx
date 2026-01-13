import { ReactNode } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useLanguage } from '../hooks/useLanguage';

// Icons as simple SVG components
const HomeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
);

const UsersIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const PlusCircleIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
);

const BookOpenIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
);

// Reserved for future hamburger menu
// const MenuIcon = () => (
//     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//         <line x1="3" y1="12" x2="21" y2="12" />
//         <line x1="3" y1="6" x2="21" y2="6" />
//         <line x1="3" y1="18" x2="21" y2="18" />
//     </svg>
// );

const GlobeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
);

interface NavItem {
    path: string;
    labelKey: string;
    icon: ReactNode;
}

const navItems: NavItem[] = [
    { path: '/', labelKey: 'nav.home', icon: <HomeIcon /> },
    { path: '/characters', labelKey: 'nav.characters', icon: <UsersIcon /> },
    { path: '/builder', labelKey: 'nav.new', icon: <PlusCircleIcon /> },
    { path: '/browse', labelKey: 'nav.browse', icon: <BookOpenIcon /> },
];

interface ResponsiveLayoutProps {
    children: ReactNode;
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const location = useLocation();
    const { language, toggleLanguage, t } = useLanguage();

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    // Check if we're on the home page or characters page - render without sidebar/navigation
    const isHomePage = location.pathname === '/';
    const isCharactersPage = location.pathname === '/characters';

    if (isHomePage || isCharactersPage) {
        // Full-screen page without sidebar
        return (
            <div className="app-container app-fullscreen">
                <main className="main-content main-content-fullscreen">
                    {children}
                </main>
            </div>
        );
    }

    if (isDesktop) {
        // Desktop Layout with Sidebar
        return (
            <div className="app-container">
                <aside className="main-sidebar">
                    <div className="sidebar-header">
                        <Link to="/" className="sidebar-logo">
                            Pathfinder 2e
                        </Link>
                    </div>
                    <nav className="sidebar-nav">
                        {navItems.map(item => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                            >
                                {item.icon}
                                <span>{t(item.labelKey)}</span>
                            </Link>
                        ))}
                    </nav>
                    <div className="sidebar-footer" style={{
                        padding: 'var(--space-4)',
                        borderTop: '1px solid var(--border-primary)',
                        marginTop: 'auto'
                    }}>
                        <button
                            onClick={toggleLanguage}
                            className="btn btn-ghost"
                            style={{
                                width: '100%',
                                justifyContent: 'flex-start',
                                gap: 'var(--space-3)'
                            }}
                        >
                            <GlobeIcon />
                            <span>{language === 'en' ? '🇬🇧 English' : '🇮🇹 Italiano'}</span>
                        </button>
                    </div>
                </aside>
                <main className="main-content">
                    {children}
                </main>
            </div>
        );
    }

    // Mobile Layout with Bottom Navigation
    return (
        <div className="app-container">
            <header className="mobile-header">
                <Link to="/" className="sidebar-logo" style={{ fontSize: 'var(--font-size-lg)' }}>
                    PF2e Builder
                </Link>
                <button
                    onClick={toggleLanguage}
                    className="btn btn-ghost btn-icon"
                    title={language === 'en' ? 'Switch to Italian' : 'Passa a Inglese'}
                >
                    <span style={{ fontSize: '1.2rem' }}>{language === 'en' ? '🇬🇧' : '🇮🇹'}</span>
                </button>
            </header>
            <main className="main-content">
                {children}
            </main>
            <nav className="mobile-nav">
                {navItems.map(item => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`mobile-nav-item ${isActive(item.path) ? 'active' : ''}`}
                    >
                        {item.icon}
                        <span>{t(item.labelKey)}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
}
