/**
 * Data Validation Layer
 *
 * Validates referential integrity between different data structures:
 * - Class IDs referenced in progressions, granted feats, and granted spells
 * - Feat IDs referenced in class granted feats
 * - Spell IDs referenced in class granted spells
 *
 * Provides warnings in development mode for broken references.
 */

import { getClasses, getFeats, getSpells } from './pf2e-loader';
import { isValidClassId, getClassNameById, getAllClassMetadata } from './classMetadata';
import type { ClassProgression } from './classProgressions';
import type { ClassSpecializationGrantedFeats } from './classGrantedFeats';
import type { ClassGrantedSpells } from './classGrantedSpells';

export interface ValidationIssue {
    severity: 'error' | 'warning';
    category: 'class' | 'feat' | 'spell' | 'progression';
    message: string;
    details?: Record<string, unknown>;
}

export interface ValidationResult {
    valid: boolean;
    issues: ValidationIssue[];
}

/**
 * Validate class progression data
 */
export function validateClassProgressions(
    progressions: Record<string, ClassProgression>
): ValidationResult {
    const issues: ValidationIssue[] = [];

    for (const [classId, progression] of Object.entries(progressions)) {
        // Validate class ID exists
        if (!isValidClassId(classId)) {
            issues.push({
                severity: 'error',
                category: 'class',
                message: `Invalid class ID in progressions: ${classId}`,
                details: { classId, hasProgression: true },
            });
            continue;
        }

        const className = getClassNameById(classId);

        // Validate proficiency arrays have correct length (20 levels)
        const validateArray = (arr: number[] | undefined, name: string) => {
            if (arr && arr.length !== 20) {
                issues.push({
                    severity: 'error',
                    category: 'progression',
                    message: `${className}: ${name} array must have 20 elements (has ${arr.length})`,
                    details: { classId, className, arrayName: name, length: arr.length },
                });
            }
        };

        // Validate armor proficiencies
        validateArray(progression.armorProficiencies.light, 'light armor');
        validateArray(progression.armorProficiencies.medium, 'medium armor');
        validateArray(progression.armorProficiencies.heavy, 'heavy armor');
        validateArray(progression.armorProficiencies.unarmored, 'unarmored');

        // Validate weapon proficiencies
        validateArray(progression.weaponProficiencies.simple, 'simple weapons');
        validateArray(progression.weaponProficiencies.martial, 'martial weapons');
        validateArray(progression.weaponProficiencies.unarmed, 'unarmed');
        if (progression.weaponProficiencies.advanced) {
            validateArray(progression.weaponProficiencies.advanced, 'advanced weapons');
        }

        // Validate saving throws
        if (progression.savingThrows) {
            validateArray(progression.savingThrows.fortitude, 'fortitude');
            validateArray(progression.savingThrows.reflex, 'reflex');
            validateArray(progression.savingThrows.will, 'will');
        }

        // Validate perception
        if (progression.perception) {
            validateArray(progression.perception, 'perception');
        }

        // Validate feat progression levels
        if (progression.featProgression) {
            const validateFeatLevels = (levels: number[] | undefined, name: string) => {
                if (levels) {
                    const invalidLevels = levels.filter(l => l < 1 || l > 20);
                    if (invalidLevels.length > 0) {
                        issues.push({
                            severity: 'error',
                            category: 'progression',
                            message: `${className}: ${name} contains invalid levels: ${invalidLevels.join(', ')}`,
                            details: { classId, className, featType: name, invalidLevels },
                        });
                    }
                }
            };

            validateFeatLevels(progression.featProgression.classFeats, 'class feats');
            validateFeatLevels(progression.featProgression.generalFeats, 'general feats');
            validateFeatLevels(progression.featProgression.skillFeats, 'skill feats');
            validateFeatLevels(progression.featProgression.skillIncreases, 'skill increases');
            validateFeatLevels(progression.featProgression.ancestryFeats, 'ancestry feats');
        }

        // Validate hit points
        if (progression.hitPointsPerLevel !== undefined) {
            const validHp = [4, 6, 8, 10, 12];
            if (!validHp.includes(progression.hitPointsPerLevel)) {
                issues.push({
                    severity: 'warning',
                    category: 'progression',
                    message: `${className}: Unusual HP per level: ${progression.hitPointsPerLevel}`,
                    details: { classId, className, hp: progression.hitPointsPerLevel },
                });
            }
        }
    }

    return {
        valid: issues.filter(i => i.severity === 'error').length === 0,
        issues,
    };
}

/**
 * Validate class granted feats data
 */
export function validateClassGrantedFeats(
    grantedFeats: ClassSpecializationGrantedFeats[]
): ValidationResult {
    const issues: ValidationIssue[] = [];
    const allFeats = getFeats();
    const featIdSet = new Set(allFeats.map(f => f.id));

    for (const classFeats of grantedFeats) {
        // Validate class ID exists
        if (!isValidClassId(classFeats.classId)) {
            issues.push({
                severity: 'error',
                category: 'class',
                message: `Invalid class ID in granted feats: ${classFeats.classId}`,
                details: { classId: classFeats.classId },
            });
            continue;
        }

        const className = getClassNameById(classFeats.classId);

        // Validate feat IDs exist
        for (const [specializationId, feats] of Object.entries(classFeats.grantedFeats)) {
            for (const feat of feats) {
                if (!featIdSet.has(feat.featId)) {
                    issues.push({
                        severity: 'error',
                        category: 'feat',
                        message: `${className} (${specializationId}): Referenced feat does not exist: ${feat.featId}`,
                        details: {
                            classId: classFeats.classId,
                            className,
                            specializationId,
                            featId: feat.featId,
                        },
                    });
                }

                // Validate level is within valid range
                if (feat.grantedAtLevel < 1 || feat.grantedAtLevel > 20) {
                    issues.push({
                        severity: 'error',
                        category: 'feat',
                        message: `${className} (${specializationId}): Invalid grant level for ${feat.featId}: ${feat.grantedAtLevel}`,
                        details: {
                            classId: classFeats.classId,
                            className,
                            specializationId,
                            featId: feat.featId,
                            grantedAtLevel: feat.grantedAtLevel,
                        },
                    });
                }
            }
        }
    }

    return {
        valid: issues.filter(i => i.severity === 'error').length === 0,
        issues,
    };
}

/**
 * Validate class granted spells data
 */
export function validateClassGrantedSpells(
    grantedSpells: Record<string, ClassGrantedSpells>
): ValidationResult {
    const issues: ValidationIssue[] = [];
    const allSpells = getSpells();
    const spellIdSet = new Set(allSpells.map(s => s.id));

    for (const [classId, spells] of Object.entries(grantedSpells)) {
        // Validate class ID exists
        if (!isValidClassId(classId)) {
            issues.push({
                severity: 'error',
                category: 'class',
                message: `Invalid class ID in granted spells: ${classId}`,
                details: { classId },
            });
            continue;
        }

        const className = getClassNameById(classId);

        // Validate focus spells
        if (spells.focusSpells) {
            for (const spell of spells.focusSpells) {
                if (!spellIdSet.has(spell.spellId)) {
                    issues.push({
                        severity: 'error',
                        category: 'spell',
                        message: `${className}: Referenced focus spell does not exist: ${spell.spellId}`,
                        details: {
                            classId,
                            className,
                            spellId: spell.spellId,
                            spellType: spell.spellType,
                        },
                    });
                }

                // Validate level
                if (spell.grantedAtLevel < 1 || spell.grantedAtLevel > 20) {
                    issues.push({
                        severity: 'error',
                        category: 'spell',
                        message: `${className}: Invalid grant level for spell ${spell.spellId}: ${spell.grantedAtLevel}`,
                        details: {
                            classId,
                            className,
                            spellId: spell.spellId,
                            grantedAtLevel: spell.grantedAtLevel,
                        },
                    });
                }
            }
        }

        // Validate cantrips
        if (spells.cantrips) {
            for (const spell of spells.cantrips) {
                if (!spellIdSet.has(spell.spellId)) {
                    issues.push({
                        severity: 'error',
                        category: 'spell',
                        message: `${className}: Referenced cantrip does not exist: ${spell.spellId}`,
                        details: {
                            classId,
                            className,
                            spellId: spell.spellId,
                            spellType: spell.spellType,
                        },
                    });
                }
            }
        }

        // Validate regular spells
        if (spells.spells) {
            for (const spell of spells.spells) {
                if (!spellIdSet.has(spell.spellId)) {
                    issues.push({
                        severity: 'error',
                        category: 'spell',
                        message: `${className}: Referenced spell does not exist: ${spell.spellId}`,
                        details: {
                            classId,
                            className,
                            spellId: spell.spellId,
                            spellType: spell.spellType,
                        },
                    });
                }
            }
        }
    }

    return {
        valid: issues.filter(i => i.severity === 'error').length === 0,
        issues,
    };
}

/**
 * Validate all data structures
 */
export function validateAllData(options?: {
    progressions?: Record<string, ClassProgression>;
    grantedFeats?: ClassSpecializationGrantedFeats[];
    grantedSpells?: Record<string, ClassGrantedSpells>;
}): ValidationResult {
    const allIssues: ValidationIssue[] = [];

    if (options?.progressions) {
        const result = validateClassProgressions(options.progressions);
        allIssues.push(...result.issues);
    }

    if (options?.grantedFeats) {
        const result = validateClassGrantedFeats(options.grantedFeats);
        allIssues.push(...result.issues);
    }

    if (options?.grantedSpells) {
        const result = validateClassGrantedSpells(options.grantedSpells);
        allIssues.push(...result.issues);
    }

    return {
        valid: allIssues.filter(i => i.severity === 'error').length === 0,
        issues: allIssues,
    };
}

/**
 * Log validation issues to console (development mode only)
 */
export function logValidationIssues(result: ValidationResult): void {
    if (import.meta.env.DEV && result.issues.length > 0) {
        console.group('🔍 Data Validation Issues');

        const errors = result.issues.filter(i => i.severity === 'error');
        const warnings = result.issues.filter(i => i.severity === 'warning');

        if (errors.length > 0) {
            console.group(`❌ ${errors.length} Errors`);
            errors.forEach(issue => {
                console.error(`[${issue.category}] ${issue.message}`, issue.details);
            });
            console.groupEnd();
        }

        if (warnings.length > 0) {
            console.group(`⚠️  ${warnings.length} Warnings`);
            warnings.forEach(issue => {
                console.warn(`[${issue.category}] ${issue.message}`, issue.details);
            });
            console.groupEnd();
        }

        console.groupEnd();
    }
}

/**
 * Get validation summary
 */
export function getValidationSummary(result: ValidationResult): string {
    const errors = result.issues.filter(i => i.severity === 'error').length;
    const warnings = result.issues.filter(i => i.severity === 'warning').length;

    if (errors === 0 && warnings === 0) {
        return '✓ All data valid';
    }

    const parts: string[] = [];
    if (errors > 0) parts.push(`${errors} error${errors > 1 ? 's' : ''}`);
    if (warnings > 0) parts.push(`${warnings} warning${warnings > 1 ? 's' : ''}`);

    return parts.join(', ');
}
