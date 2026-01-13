import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { LanguageProvider } from './hooks/useLanguage'
import { ThemeProvider } from './contexts/ThemeContext'
import App from './App.tsx'
import './styles/index.css'
import './styles/desktop.css'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <ThemeProvider>
                <LanguageProvider>
                    <App />
                </LanguageProvider>
            </ThemeProvider>
        </BrowserRouter>
    </StrictMode>,
)
