import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ResponsiveLayout } from './layouts/ResponsiveLayout';
import { GlobalDiceDisplay } from './components/common/GlobalDiceDisplay';
import { DiceRollerProvider } from './hooks/useDiceRoller';

// Lazy load all page components for code splitting
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const CharacterListPage = lazy(() => import('./pages/CharacterListPage').then(m => ({ default: m.CharacterListPage })));
const CharacterBuilderPage = lazy(() => import('./pages/CharacterBuilderPage').then(m => ({ default: m.CharacterBuilderPage })));
const BrowsePage = lazy(() => import('./pages/BrowsePage').then(m => ({ default: m.BrowsePage })));
const CharacterSheetPage = lazy(() => import('./pages/CharacterSheetPage'));

// Loading fallback component
function PageLoader() {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontSize: '1.2rem',
            color: '#666'
        }}>
            Caricamento...
        </div>
    );
}

function App() {
    console.log('App component rendering');
    return (
        <DiceRollerProvider>
            <GlobalDiceDisplay />
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    {/* Desktop Character Sheet - fullscreen, no wrapper */}
                    <Route path="/sheet" element={<CharacterSheetPage />} />
                    <Route path="/sheet/:id" element={<CharacterSheetPage />} />

                    {/* Main app with responsive layout */}
                    <Route path="/*" element={
                        <ResponsiveLayout>
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/characters" element={<CharacterListPage />} />
                                <Route path="/builder" element={<CharacterBuilderPage />} />
                                <Route path="/builder/:characterId" element={<CharacterBuilderPage />} />
                                <Route path="/browse" element={<BrowsePage />} />
                                <Route path="/browse/:category" element={<BrowsePage />} />
                            </Routes>
                        </ResponsiveLayout>
                    } />
                </Routes>
            </Suspense>
        </DiceRollerProvider>
    );
}

export default App;

