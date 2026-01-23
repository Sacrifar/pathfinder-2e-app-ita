import { Character } from '../types';

/**
 * Currency utility functions for Pathfinder 2e
 */

export interface Currency {
    cp: number;
    sp: number;
    gp: number;
    pp: number;
}

/**
 * Convert all currency to total gold pieces value
 */
export const currencyToGold = (currency: Currency): number => {
    return (
        (currency.pp || 0) * 100 + // 1 pp = 100 gp
        (currency.gp || 0) +
        (currency.sp || 0) * 0.1 + // 1 sp = 0.1 gp
        (currency.cp || 0) * 0.01   // 1 cp = 0.01 gp
    );
};

/**
 * Get character's total wealth in gold pieces
 */
export const getCharacterWealth = (character: Character): number => {
    return currencyToGold(character.currency);
};

/**
 * Check if character can afford a cost in gold pieces
 */
export const canAfford = (character: Character, costGp: number): boolean => {
    return getCharacterWealth(character) >= costGp;
};

/**
 * Deduct cost from character's currency
 * Converts costGp to pp/gp/sp/cp and deducts from highest denomination first
 * Returns updated currency, or null if insufficient funds
 */
export const deductCurrency = (character: Character, costGp: number): Currency | null => {
    const currentCurrency = character.currency;

    // Convert everything to copper for calculation
    const totalCp = Math.round(
        (currentCurrency.pp || 0) * 1000 + // 1 pp = 1000 cp
        (currentCurrency.gp || 0) * 100 +  // 1 gp = 100 cp
        (currentCurrency.sp || 0) * 10 +   // 1 sp = 10 cp
        (currentCurrency.cp || 0)
    );

    const costCp = Math.round(costGp * 100);

    if (totalCp < costCp) {
        return null; // Insufficient funds
    }

    const remainingCp = totalCp - costCp;

    // Convert back to pp/gp/sp/cp
    const newPp = Math.floor(remainingCp / 1000);
    const afterPp = remainingCp % 1000;
    const newGp = Math.floor(afterPp / 100);
    const afterGp = afterPp % 100;
    const newSp = Math.floor(afterGp / 10);
    const newCp = afterGp % 10;

    return {
        pp: newPp,
        gp: newGp,
        sp: newSp,
        cp: newCp,
    };
};

/**
 * Format currency for display
 */
export const formatCurrency = (currency: Currency): string => {
    const parts: string[] = [];
    if (currency.pp > 0) parts.push(`${currency.pp} pp`);
    if (currency.gp > 0) parts.push(`${currency.gp} gp`);
    if (currency.sp > 0) parts.push(`${currency.sp} sp`);
    if (currency.cp > 0) parts.push(`${currency.cp} cp`);
    return parts.length > 0 ? parts.join(', ') : '0 gp';
};

/**
 * Format gold price for display
 */
export const formatPrice = (priceGp: number): string => {
    if (priceGp >= 100) {
        const pp = Math.floor(priceGp / 100);
        const remainingGp = priceGp % 100;
        return remainingGp > 0 ? `${pp} pp, ${remainingGp} gp` : `${pp} pp`;
    } else if (priceGp >= 1) {
        const gp = Math.floor(priceGp);
        const sp = Math.round((priceGp - gp) * 10);
        return sp > 0 ? `${gp} gp, ${sp} sp` : `${gp} gp`;
    } else {
        const cp = Math.round(priceGp * 100);
        return `${cp} cp`;
    }
};
