import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DesktopCharacterLayout } from '../components/desktop';
import { Character, createEmptyCharacter } from '../types';

const CharacterSheetPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [character, setCharacter] = useState<Character | null>(null);

    useEffect(() => {
        if (id) {
            // Load character from localStorage
            const saved = localStorage.getItem('pf2e-characters');
            if (saved) {
                const characters: Character[] = JSON.parse(saved);
                const found = characters.find((c) => c.id === id);
                if (found) {
                    setCharacter(found);
                    return;
                }
            }
        }

        // Create new character if not found
        const newChar = createEmptyCharacter();
        newChar.name = 'Unknown Adventurer';
        newChar.class = 'Fighter';
        newChar.ancestry = 'Human';
        newChar.level = 1;
        setCharacter(newChar);
    }, [id]);

    const handleCharacterUpdate = (updated: Character) => {
        setCharacter(updated);

        // Save to localStorage
        const saved = localStorage.getItem('pf2e-characters');
        const characters: Character[] = saved ? JSON.parse(saved) : [];
        const index = characters.findIndex((c) => c.id === updated.id);

        if (index >= 0) {
            characters[index] = updated;
        } else {
            characters.push(updated);
        }

        localStorage.setItem('pf2e-characters', JSON.stringify(characters));
    };

    const handleOpenSelection = (type: string) => {
        console.log('Open selection for:', type);
        // TODO: Open appropriate selection modal
    };

    if (!character) {
        return (
            <div className="desktop-layout" style={{ alignItems: 'center', justifyContent: 'center' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <DesktopCharacterLayout
            character={character}
            onCharacterUpdate={handleCharacterUpdate}
            onOpenSelection={handleOpenSelection}
        />
    );
};

export default CharacterSheetPage;
