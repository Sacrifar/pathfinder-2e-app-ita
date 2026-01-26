/**
 * Development Mode Validation
 *
 * This file runs data validation checks automatically when the app starts
 * in development mode. It helps catch data integrity issues early.
 *
 * Validation checks include:
 * - Class IDs in progressions, granted feats, and granted spells
 * - Feat IDs referenced in granted feats
 * - Spell IDs referenced in granted spells
 * - Proficiency array lengths and values
 */

import {
    validateAllData,
    logValidationIssues,
    getValidationSummary,
} from './dataValidator';
import { classProgressions } from './classProgressions';
import { CLASS_GRANTED_FEATS } from './classGrantedFeats';
import { CLASS_GRANTED_SPELLS } from './classGrantedSpells';

/**
 * Run all validation checks and log results to console
 * Only runs in development mode
 */
export function runDevValidation(): void {
    if (!import.meta.env.DEV) {
        return; // Skip validation in production
    }

    console.log('🔍 Running data validation checks...');

    try {
        const result = validateAllData({
            progressions: classProgressions,
            grantedFeats: CLASS_GRANTED_FEATS,
            grantedSpells: CLASS_GRANTED_SPELLS,
        });

        // Log validation issues
        logValidationIssues(result);

        // Log summary
        const summary = getValidationSummary(result);
        if (result.valid) {
            console.log(`✅ ${summary}`);
        } else {
            console.error(`❌ Validation failed: ${summary}`);
        }
    } catch (error) {
        console.error('❌ Validation error:', error);
    }
}

/**
 * Initialize validation on module load (dev mode only)
 * This ensures validation runs as early as possible
 */
if (import.meta.env.DEV) {
    // Run validation after a short delay to ensure all data is loaded
    setTimeout(() => {
        runDevValidation();
    }, 100);
}
