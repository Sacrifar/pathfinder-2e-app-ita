/**
 * Translation Coverage Checker
 *
 * Analyzes translation coverage for all game content and provides
 * a report of missing Italian translations.
 *
 * Usage in dev console:
 * ```
 * import { checkTranslationCoverage } from './data/translationChecker';
 * checkTranslationCoverage();
 * ```
 */

import {
    getAncestries,
    getClasses,
    getHeritages,
    getBackgrounds,
    getSpells,
    getFeats,
    getActions,
} from './pf2e-loader';

export interface TranslationCoverageReport {
    categoryName: string;
    total: number;
    withNameTranslation: number;
    withDescriptionTranslation: number;
    namesCoverage: number;
    descriptionsCoverage: number;
    missingNames: string[];
    missingDescriptions: string[];
}

/**
 * Check translation coverage for a category of items
 */
function analyzeCategory<T extends { name: string; nameIt?: string; descriptionIt?: string }>(
    items: T[],
    categoryName: string
): TranslationCoverageReport {
    const total = items.length;
    let withNameTranslation = 0;
    let withDescriptionTranslation = 0;
    const missingNames: string[] = [];
    const missingDescriptions: string[] = [];

    for (const item of items) {
        if (item.nameIt) {
            withNameTranslation++;
        } else {
            missingNames.push(item.name);
        }

        if (item.descriptionIt) {
            withDescriptionTranslation++;
        } else {
            missingDescriptions.push(item.name);
        }
    }

    return {
        categoryName,
        total,
        withNameTranslation,
        withDescriptionTranslation,
        namesCoverage: total > 0 ? (withNameTranslation / total) * 100 : 0,
        descriptionsCoverage: total > 0 ? (withDescriptionTranslation / total) * 100 : 0,
        missingNames,
        missingDescriptions,
    };
}

/**
 * Generate a full translation coverage report
 */
export function getTranslationCoverageReport(): TranslationCoverageReport[] {
    return [
        analyzeCategory(getAncestries(), 'Ancestries'),
        analyzeCategory(getClasses(), 'Classes'),
        analyzeCategory(getHeritages(), 'Heritages'),
        analyzeCategory(getBackgrounds(), 'Backgrounds'),
        analyzeCategory(getSpells(), 'Spells'),
        analyzeCategory(getFeats(), 'Feats'),
        analyzeCategory(getActions(), 'Actions'),
    ];
}

/**
 * Print translation coverage report to console
 */
export function checkTranslationCoverage(): void {
    console.log('📊 Translation Coverage Report');
    console.log('='.repeat(70));

    const reports = getTranslationCoverageReport();

    let totalItems = 0;
    let totalNamesTranslated = 0;
    let totalDescriptionsTranslated = 0;

    for (const report of reports) {
        totalItems += report.total;
        totalNamesTranslated += report.withNameTranslation;
        totalDescriptionsTranslated += report.withDescriptionTranslation;

        const nameBar = '█'.repeat(Math.floor(report.namesCoverage / 5)) +
                       '░'.repeat(20 - Math.floor(report.namesCoverage / 5));
        const descBar = '█'.repeat(Math.floor(report.descriptionsCoverage / 5)) +
                        '░'.repeat(20 - Math.floor(report.descriptionsCoverage / 5));

        const nameStatus = report.namesCoverage >= 80 ? '✅' :
                          report.namesCoverage >= 50 ? '⚠️ ' : '❌';
        const descStatus = report.descriptionsCoverage >= 80 ? '✅' :
                          report.descriptionsCoverage >= 50 ? '⚠️ ' : '❌';

        console.log(`\n${report.categoryName.padEnd(15)} (${report.total} items)`);
        console.log(`  ${nameStatus} Names:        ${nameBar} ${report.namesCoverage.toFixed(1)}%`);
        console.log(`  ${descStatus} Descriptions: ${descBar} ${report.descriptionsCoverage.toFixed(1)}%`);

        if (report.namesCoverage < 100) {
            const sampleMissing = report.missingNames.slice(0, 3);
            console.log(`     Missing names: ${sampleMissing.join(', ')}${report.missingNames.length > 3 ? '...' : ''}`);
        }
    }

    const overallNamesCoverage = totalItems > 0 ? (totalNamesTranslated / totalItems) * 100 : 0;
    const overallDescsCoverage = totalItems > 0 ? (totalDescriptionsTranslated / totalItems) * 100 : 0;

    console.log('\n' + '='.repeat(70));
    console.log('\n📈 Overall Coverage:');
    console.log(`   Names:        ${overallNamesCoverage.toFixed(1)}% (${totalNamesTranslated}/${totalItems})`);
    console.log(`   Descriptions: ${overallDescsCoverage.toFixed(1)}% (${totalDescriptionsTranslated}/${totalItems})`);

    console.log('\n💡 Priority Areas (Names < 50%):');
    const lowCoverage = reports.filter(r => r.namesCoverage < 50);

    if (lowCoverage.length > 0) {
        lowCoverage.forEach(report => {
            console.log(`   - ${report.categoryName}: ${report.namesCoverage.toFixed(1)}% (${report.total - report.withNameTranslation} missing)`);
        });
    } else {
        console.log('   ✅ All categories have good name coverage (≥50%)');
    }

    console.log('\n' + '='.repeat(70));
}

/**
 * Get items missing translations for a specific category
 */
export function getMissingTranslations(categoryName: string): {
    missingNames: string[];
    missingDescriptions: string[];
} {
    const reports = getTranslationCoverageReport();
    const report = reports.find(r => r.categoryName.toLowerCase() === categoryName.toLowerCase());

    if (!report) {
        return { missingNames: [], missingDescriptions: [] };
    }

    return {
        missingNames: report.missingNames,
        missingDescriptions: report.missingDescriptions,
    };
}

/**
 * Export missing translations as a JSON file (for translation tools)
 */
export function exportMissingTranslations(): Record<string, { names: string[]; descriptions: string[] }> {
    const reports = getTranslationCoverageReport();
    const result: Record<string, { names: string[]; descriptions: string[] }> = {};

    for (const report of reports) {
        if (report.missingNames.length > 0 || report.missingDescriptions.length > 0) {
            result[report.categoryName] = {
                names: report.missingNames,
                descriptions: report.missingDescriptions,
            };
        }
    }

    return result;
}

// Make available in dev console
if (import.meta.env.DEV) {
    (window as any).checkTranslationCoverage = checkTranslationCoverage;
    (window as any).getMissingTranslations = getMissingTranslations;
    (window as any).exportMissingTranslations = exportMissingTranslations;

    console.log('💡 Translation checker available:');
    console.log('   - checkTranslationCoverage() - Show coverage report');
    console.log('   - getMissingTranslations("Spells") - Get missing translations for a category');
    console.log('   - exportMissingTranslations() - Export all missing translations');
}
