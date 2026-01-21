import { Routes, Route } from 'react-router-dom';
import { ResponsiveLayout } from './layouts/ResponsiveLayout';
import { HomePage } from './pages/HomePage';
import { CharacterListPage } from './pages/CharacterListPage';
import { CharacterBuilderPage } from './pages/CharacterBuilderPage';
import { BrowsePage } from './pages/BrowsePage';
import CharacterSheetPage from './pages/CharacterSheetPage';
import { GlobalDiceDisplay } from './components/common/GlobalDiceDisplay';
import { DiceRollerProvider } from './hooks/useDiceRoller';

function App() {
    console.log('App component rendering');
    return (
        <DiceRollerProvider>
            <GlobalDiceDisplay />
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
        </DiceRollerProvider>
    );
}

export default App;

