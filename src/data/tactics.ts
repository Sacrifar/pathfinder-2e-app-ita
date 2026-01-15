/**
 * Commander Tactics Data
 * Gestisce il caricamento e il filtraggio delle tattiche del Commander
 */

import { getActions, type LoadedAction } from './pf2e-loader';

export interface LoadedTactic extends LoadedAction {
    tacticTier: 'basic' | 'expert' | 'master' | 'legendary';
    tacticCategory: 'mobility' | 'offensive';
}

/**
 * Ottiene tutte le tattiche del Commander
 * Filtra le azioni che hanno i trait "commander" e "tactic"
 */
export function getTactics(): LoadedTactic[] {
    const allActions = getActions();

    return allActions
        .filter(action => {
            const traits = action.traits || [];
            return traits.includes('commander') && traits.includes('tactic');
        })
        .map(action => {
            // Determina il tier dalla proprietà otherTags
            const otherTags = action.otherTags || [];
            let tacticTier: LoadedTactic['tacticTier'] = 'basic';

            if (otherTags.includes('commander-expert-tactic')) {
                tacticTier = 'expert';
            } else if (otherTags.includes('commander-master-tactic')) {
                tacticTier = 'master';
            } else if (otherTags.includes('commander-legendary-tactic')) {
                tacticTier = 'legendary';
            }

            // Determina la categoria dalla proprietà category
            const category = action.category || 'offensive';
            const tacticCategory: LoadedTactic['tacticCategory'] =
                category === 'mobility' ? 'mobility' : 'offensive';

            return {
                ...action,
                tacticTier,
                tacticCategory,
            };
        })
        .sort((a, b) => {
            // Ordina per tier, poi per categoria, poi per nome
            const tierOrder = { basic: 0, expert: 1, master: 2, legendary: 3 };
            const tierDiff = tierOrder[a.tacticTier] - tierOrder[b.tacticTier];
            if (tierDiff !== 0) return tierDiff;

            const categoryDiff = a.tacticCategory.localeCompare(b.tacticCategory);
            if (categoryDiff !== 0) return categoryDiff;

            return a.name.localeCompare(b.name);
        });
}

/**
 * Ottiene tattiche filtrate per tier
 */
export function getTacticsByTier(tier: LoadedTactic['tacticTier']): LoadedTactic[] {
    return getTactics().filter(tactic => tactic.tacticTier === tier);
}

/**
 * Ottiene tattiche filtrate per categoria
 */
export function getTacticsByCategory(category: LoadedTactic['tacticCategory']): LoadedTactic[] {
    return getTactics().filter(tactic => tactic.tacticCategory === category);
}

/**
 * Ottiene tattiche disponibili per un determinato livello
 * Basic: Level 1+
 * Expert: Level 7+
 * Master: Level 15+
 * Legendary: Level 19+
 */
export function getTacticsByLevel(level: number): LoadedTactic[] {
    const tactics = getTactics();

    return tactics.filter(tactic => {
        switch (tactic.tacticTier) {
            case 'basic':
                return level >= 1;
            case 'expert':
                return level >= 7;
            case 'master':
                return level >= 15;
            case 'legendary':
                return level >= 19;
            default:
                return false;
        }
    });
}

/**
 * Ottiene una tattica per ID
 */
export function getTacticById(id: string): LoadedTactic | undefined {
    return getTactics().find(tactic => tactic.id === id);
}
