/**
 * Bulk Calculator for Pathfinder 2e
 * Calculates total bulk considering containers, coin weight, and strength-based limits
 */

import { Character, EquippedItem } from '../types/character';
import { getAbilityModifier } from './pf2e-math';

export interface BulkCalculationResult {
    totalBulk: number;          // Total bulk carried
    maxBulk: number;            // Maximum bulk before encumbered
    encumberedLevel: 'normal' | 'encumbered' | 'overburdened';
    itemsByContainer: Array<{
        container: EquippedItem | null;  // null = not in any container
        items: EquippedItem[];
        bulk: number;
    }>;
}

/**
 * Calculate the total bulk a character is carrying
 * Takes into account:
 * - Item bulk
 * - Container bulk reduction (backpack, etc.)
 * - Coin weight (1000 coins = 1 Bulk)
 * - Container capacity limits
 */
export function calculateBulk(character: Character, inventory: EquippedItem[]): BulkCalculationResult {
    const strMod = getAbilityModifier(character.abilityScores.str);
    const maxBulk = strMod + 5; // Max bulk before encumbered

    // Group items by container
    const itemsByContainer = new Map<string | 'root', EquippedItem[]>();
    const containers = new Map<string, EquippedItem>();

    // First, identify all containers
    for (const item of inventory) {
        if (item.isContainer) {
            containers.set(item.id, item);
            itemsByContainer.set(item.id, []);
        }
    }

    // Add "root" container (items not in any container)
    itemsByContainer.set('root', []);

    // Group items by their container
    for (const item of inventory) {
        if (item.isContainer) continue; // Containers themselves are handled separately

        const containerId = item.containerId || 'root';
        if (!itemsByContainer.has(containerId)) {
            itemsByContainer.set(containerId, []);
        }
        itemsByContainer.get(containerId)!.push(item);
    }

    // Calculate bulk for each container
    const result: BulkCalculationResult = {
        totalBulk: 0,
        maxBulk,
        encumberedLevel: 'normal',
        itemsByContainer: [],
    };

    // Process root items (not in any container)
    const rootItems = itemsByContainer.get('root') || [];
    let rootBulk = 0;
    for (const item of rootItems) {
        rootBulk += getItemBulk(item);
    }
    result.totalBulk += rootBulk;
    result.itemsByContainer.push({
        container: null,
        items: rootItems,
        bulk: rootBulk,
    });

    // Process each container
    for (const [containerId, items] of itemsByContainer) {
        if (containerId === 'root') continue; // Already processed

        const container = containers.get(containerId);
        if (!container) continue;

        let containerBulk = getItemBulk(container); // Container's own weight
        let itemsBulk = 0;

        // Calculate bulk reduction for this container
        const bulkReduction = container.bulkReduction || 0;

        for (const item of items) {
            const itemBulk = getItemBulk(item);
            // Reduce bulk if container provides reduction
            itemsBulk += Math.max(0, itemBulk - bulkReduction);
        }

        // Check if container capacity is exceeded
        const capacity = container.capacity || 999; // Default high capacity
        const _effectiveBulk = Math.min(containerBulk + itemsBulk, containerBulk + capacity);

        containerBulk += Math.min(itemsBulk, capacity);
        result.totalBulk += containerBulk;

        result.itemsByContainer.push({
            container,
            items,
            bulk: containerBulk,
        });
    }

    // Determine encumbered level
    if (result.totalBulk > maxBulk + 1) {
        result.encumberedLevel = 'overburdened';
    } else if (result.totalBulk > maxBulk) {
        result.encumberedLevel = 'encumbered';
    }

    return result;
}

/**
 * Get the effective bulk of an item
 * Coins have special weight: 1000 coins = 1 Bulk
 */
function getItemBulk(item: EquippedItem): number {
    // Check if item is coins (based on name or type)
    if (item.name.toLowerCase().includes('coin') || item.name.toLowerCase().includes('moneta')) {
        // Coins are typically tracked separately, but if in inventory:
        // Assuming item.bulk represents number of coins for coin items
        // 1000 coins = 1 Bulk
        return (item.bulk || 0) / 1000;
    }

    // Light items (less than 1 Bulk) may be negligible
    // Items with bulk < 0.1 are considered negligible
    const bulk = item.bulk || 0;
    return bulk < 0.1 ? 0 : bulk;
}

/**
 * Get the bulk limit for a given strength score
 */
export function getMaxBulk(strengthScore: number): number {
    const strMod = Math.floor((strengthScore - 10) / 2);
    return strMod + 5;
}

/**
 * Check if adding an item would exceed bulk limits
 */
export function canAddItem(
    character: Character,
    inventory: EquippedItem[],
    itemToAdd: EquippedItem,
    targetContainerId?: string
): { canAdd: boolean; currentBulk: number; newBulk: number; maxBulk: number } {
    const current = calculateBulk(character, inventory);
    const itemBulk = getItemBulk(itemToAdd);

    // Simulate adding the item
    let newBulk = current.totalBulk + itemBulk;

    // If targeting a container, check container capacity
    if (targetContainerId) {
        const container = inventory.find(i => i.id === targetContainerId);
        if (container && container.capacity) {
            // Calculate current bulk in this container
            const itemsInContainer = inventory.filter(i => i.containerId === targetContainerId);
            const containerBulk = itemsInContainer.reduce((sum, i) => {
                const reduction = container.bulkReduction || 0;
                return sum + Math.max(0, getItemBulk(i) - reduction);
            }, 0);

            if (containerBulk + itemBulk > container.capacity) {
                return {
                    canAdd: false,
                    currentBulk: current.totalBulk,
                    newBulk: current.totalBulk,
                    maxBulk: current.maxBulk,
                };
            }
        }
    }

    return {
        canAdd: newBulk <= current.maxBulk + 1, // Allow slight overage
        currentBulk: current.totalBulk,
        newBulk,
        maxBulk: current.maxBulk,
    };
}

/**
 * Format bulk for display (handles fractions like "1/2", "L" for light)
 */
export function formatBulk(bulk: number): string {
    if (bulk === 0) return 'L'; // Light
    if (bulk < 1) {
        // Convert to fraction (e.g., 0.5 -> "1/2")
        const fraction = Math.round(bulk * 10) / 10;
        if (fraction === 0.1) return '1/10';
        if (fraction === 0.2) return '1/5';
        if (fraction === 0.25) return '1/4';
        if (fraction === 0.3) return '1/3';
        if (fraction === 0.4) return '2/5';
        if (fraction === 0.5) return '1/2';
        if (fraction === 0.6) return '3/5';
        if (fraction === 0.7) return '7/10';
        if (fraction === 0.75) return '3/4';
        return fraction.toString();
    }
    return bulk.toString();
}

/**
 * Get items that are containers from the inventory
 */
export function getContainers(inventory: EquippedItem[]): EquippedItem[] {
    return inventory.filter(item => item.isContainer);
}

/**
 * Get items inside a specific container
 */
export function getItemsInContainer(inventory: EquippedItem[], containerId: string): EquippedItem[] {
    return inventory.filter(item => item.containerId === containerId);
}

/**
 * Move an item to a different container (or out of any container)
 */
export function moveItemToContainer(
    inventory: EquippedItem[],
    itemId: string,
    targetContainerId: string | null
): EquippedItem[] {
    return inventory.map(item => {
        if (item.id === itemId) {
            return {
                ...item,
                containerId: targetContainerId || undefined,
            };
        }
        return item;
    });
}
