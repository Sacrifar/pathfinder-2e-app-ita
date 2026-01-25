/**
 * Export & Sharing Utilities for Pathfinder 2e Characters
 */

import { Character, migrateCharacter } from '../types';
import { ancestries, classes } from '../data';

/**
 * Export character as JSON file
 */
export function exportCharacterAsJSON(character: Character): void {
    const dataStr = JSON.stringify(character, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${character.name || 'character'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Import character from JSON file
 * Applies ID migration to handle old character formats
 */
export async function importCharacterFromJSON(file: File): Promise<Character> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const character = JSON.parse(e.target?.result as string) as Character;
                // Apply migration using the migrateCharacter utility
                const migratedCharacter = migrateCharacter(character);
                resolve(migratedCharacter);
            } catch (error) {
                reject(new Error('Invalid JSON file'));
            }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}

/**
 * Generate formatted stat block as text
 */
export function generateStatBlock(character: Character): string {
    const ancestry = ancestries.find(a => a.id === character.ancestryId);
    const cls = classes.find(c => c.id === character.classId);

    // Calculate modifiers
    const getMod = (score: number) => Math.floor((score - 10) / 2);
    const formatMod = (value: number) => value >= 0 ? `+${value}` : `${value}`;

    const strMod = formatMod(getMod(character.abilityScores.str));
    const dexMod = formatMod(getMod(character.abilityScores.dex));
    const conMod = formatMod(getMod(character.abilityScores.con));
    const intMod = formatMod(getMod(character.abilityScores.int));
    const wisMod = formatMod(getMod(character.abilityScores.wis));
    const chaMod = formatMod(getMod(character.abilityScores.cha));

    // Calculate HP
    const maxHP = (ancestry?.hitPoints || 0) + (cls?.hitPoints || 0) + getMod(character.abilityScores.con);

    // Calculate Perception
    const perceptionProf = character.perception === 'untrained' ? 'trained' : character.perception;
    const profBonus = perceptionProf === 'trained' ? 2 : perceptionProf === 'expert' ? 4 : perceptionProf === 'master' ? 6 : 8;
    const perception = formatMod(getMod(character.abilityScores.wis) + character.level + profBonus);

    // Calculate AC (basic)
    const ac = 10 + getMod(character.abilityScores.dex);

    // Calculate Saves
    const getSaveBonus = (save: string) => {
        const prof = character.saves[save as keyof typeof character.saves];
        const profValue = prof === 'trained' ? 2 : prof === 'expert' ? 4 : prof === 'master' ? 6 : prof === 'legendary' ? 8 : 0;
        const ability = save === 'fortitude' ? 'con' : save === 'reflex' ? 'dex' : 'wis';
        return formatMod(getMod(character.abilityScores[ability]) + character.level + profValue);
    };

    const fort = getSaveBonus('fortitude');
    const ref = getSaveBonus('reflex');
    const will = getSaveBonus('will');

    // Build stat block
    let statBlock = `**${character.name || 'Unnamed'}**\n`;
    statBlock += `Level ${character.level} ${ancestry?.name || ''} ${cls?.name || ''}\n\n`;
    statBlock += `**HP** ${character.hitPoints.current}/${maxHP}\n\n`;
    statBlock += `**AC** ${ac} **Perception** ${perception}\n\n`;
    statBlock += `**Fort** ${fort}   **Ref** ${ref}   **Will** ${will}\n\n`;
    statBlock += `**Str** ${strMod}   **Dex** ${dexMod}   **Con** ${conMod}\n`;
    statBlock += `**Int** ${intMod}   **Wis** ${wisMod}   **Cha** ${chaMod}\n\n`;
    statBlock += `**Speed** ${character.speed.land} feet\n\n`;

    // Items
    if (character.equipment.length > 0) {
        statBlock += `**Items**\n`;
        character.equipment.slice(0, 10).forEach(item => {
            statBlock += `• ${item.name} (Bulk ${item.bulk})\n`;
        });
    }

    return statBlock;
}

/**
 * Copy stat block to clipboard
 */
export async function copyStatBlockToClipboard(character: Character): Promise<void> {
    const statBlock = generateStatBlock(character);
    try {
        await navigator.clipboard.writeText(statBlock);
        return Promise.resolve();
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = statBlock;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            textArea.remove();
            return Promise.resolve();
        } catch (e) {
            textArea.remove();
            return Promise.reject(new Error('Failed to copy'));
        }
    }
}

/**
 * Generate shareable link with compressed character data
 */
export function generateShareableLink(character: Character): string {
    try {
        // Convert character to JSON string
        const jsonStr = JSON.stringify(character);
        // Encode to Base64
        const encoded = btoa(encodeURIComponent(jsonStr));
        // Generate URL
        const baseUrl = window.location.origin + window.location.pathname;
        return `${baseUrl}?share=${encoded}`;
    } catch (error) {
        console.error('Failed to generate share link:', error);
        return '';
    }
}

/**
 * Parse character from share link
 */
export function parseCharacterFromLink(): Character | null {
    const urlParams = new URLSearchParams(window.location.search);
    const shareData = urlParams.get('share');

    if (!shareData) return null;

    try {
        const jsonStr = decodeURIComponent(atob(shareData));
        return JSON.parse(jsonStr) as Character;
    } catch (error) {
        console.error('Failed to parse shared character:', error);
        return null;
    }
}

/**
 * Trigger print dialog for character sheet
 */
export function printCharacterSheet(): void {
    window.print();
}

/**
 * Save character to localStorage
 */
export function saveCharacterToStorage(character: Character): void {
    const saved = localStorage.getItem('pf2e-characters');
    let chars: Character[] = saved ? JSON.parse(saved) : [];

    const existingIndex = chars.findIndex(c => c.id === character.id);
    if (existingIndex >= 0) {
        chars[existingIndex] = character;
    } else {
        chars.push(character);
    }

    localStorage.setItem('pf2e-characters', JSON.stringify(chars));
}

/**
 * Cloud Sync - Re-exports GoogleDriveSync for backward compatibility
 * Use GoogleDriveSync directly for full functionality
 */
export { GoogleDriveSync as CloudSync } from './googleDriveSync';
