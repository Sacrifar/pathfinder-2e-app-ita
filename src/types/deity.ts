/**
 * Deity Types for Pathfinder 2e
 */

import { Alignment } from './character';

export type DeityFont = 'heal' | 'harm' | 'both' | 'none';

export interface Deity {
    id: string;
    name: string;
    nameIt?: string;
    alignment: Alignment;
    source: string;  // e.g., "Core Rulebook", "Lost Omens: Gods & Magic"
    categories: string[];  // e.g., ["Core Deities", "Gods of Golarion"]

    // Divine mechanics
    font: DeityFont;
    domains: string[];  // e.g., ["Fire", "Healing", "Sun"]
    alternateDomains?: string[];  // Domains that can replace primary domains
    favoredWeapon: {
        id: string;
        name: string;
        nameIt?: string;
    };
    skill?: {
        id: string;
        name: string;
        nameIt?: string;
    };

    // Edicts & Anathema (roleplay guidance)
    edicts?: string[];
    anathema?: string[];

    // Description
    description?: string;
    descriptionIt?: string;

    // Worshiper info
    followers?: string;  // Typical worshippers
    areasOfWorship?: string[];  // Geographic areas
}

export interface DeityCompatibility {
    compatible: boolean;
    reason?: string;  // Why incompatible (e.g., "Alignment too different")
}
