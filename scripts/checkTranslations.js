#!/usr/bin/env node
/**
 * Translation Coverage Checker
 *
 * This script analyzes the codebase to find missing Italian translations.
 * It checks:
 * - Ancestries
 * - Classes
 * - Heritages
 * - Backgrounds
 * - Spells
 * - Feats
 * - Class features
 *
 * Usage: node scripts/checkTranslations.js
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

/**
 * Read and parse a JSON file
 */
function readJsonFile(relativePath) {
    try {
        const fullPath = join(rootDir, relativePath);
        const content = readFileSync(fullPath, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`Error reading ${relativePath}:`, error.message);
        return null;
    }
}

/**
 * Count items with and without Italian translations
 */
function analyzeTranslations(items, categoryName) {
    let total = 0;
    let withTranslation = 0;
    let withoutTranslation = [];

    for (const item of items) {
        total++;
        if (item.nameIt || item.descriptionIt) {
            withTranslation++;
        } else {
            withoutTranslation.push(item.name || item.id);
        }
    }

    return {
        categoryName,
        total,
        withTranslation,
        coverage: total > 0 ? ((withTranslation / total) * 100).toFixed(1) : '0.0',
        missing: withoutTranslation,
    };
}

/**
 * Load all data from JSON files
 */
function loadAllData() {
    const data = {};

    // Load from pf2e-loader.ts equivalent
    // For this script, we'll read the translations.ts file directly
    const translationsPath = 'src/data/translations.ts';
    const translationsContent = readFileSync(join(rootDir, translationsPath), 'utf-8');

    // Extract translation counts from the file
    const ancestryMatches = translationsContent.match(/export const ancestryTranslations[^}]+}/s);
    const classMatches = translationsContent.match(/export const classTranslations[^}]+}/s);
    const heritageMatches = translationsContent.match(/export const heritageTranslations[^}]+}/s);
    const backgroundMatches = translationsContent.match(/export const backgroundTranslations[^}]+}/s);
    const spellMatches = translationsContent.match(/export const spellTranslations[^}]+}/s);
    const featMatches = translationsContent.match(/export const featTranslations[^}]+}/s);

    // Count entries
    const countEntries = (match) => {
        if (!match) return 0;
        const entries = match[0].match(/nameIt:/g);
        return entries ? entries.length : 0;
    };

    return {
        ancestries: countEntries(ancestryMatches),
        classes: countEntries(classMatches),
        heritages: countEntries(heritageMatches),
        backgrounds: countEntries(backgroundMatches),
        spells: countEntries(spellMatches),
        feats: countEntries(featMatches),
    };
}

/**
 * Count total items in each category from JSON files
 */
function countTotalItems() {
    const counts = {
        ancestries: 0,
        classes: 0,
        heritages: 0,
        backgrounds: 0,
        spells: 0,
        feats: 0,
    };

    // Count JSON files in each directory
    const fs = await import('fs');
    const path = await import('path');

    const countJsonFiles = (dir) => {
        try {
            const fullPath = path.join(rootDir, 'src/data/pf2e', dir);
            const files = fs.readdirSync(fullPath, { recursive: true });
            return files.filter(f => f.endsWith('.json')).length;
        } catch (error) {
            return 0;
        }
    };

    counts.ancestries = countJsonFiles('ancestries');
    counts.classes = countJsonFiles('classes');
    counts.heritages = countJsonFiles('heritages');
    counts.backgrounds = countJsonFiles('backgrounds');
    counts.spells = countJsonFiles('spells');
    counts.feats = countJsonFiles('feats');

    return counts;
}

/**
 * Main function
 */
async function main() {
    console.log('📊 Translation Coverage Report\n');
    console.log('=' .repeat(60));

    const translatedCounts = loadAllData();
    const totalCounts = await countTotalItems();

    const categories = [
        { name: 'Ancestries', key: 'ancestries' },
        { name: 'Classes', key: 'classes' },
        { name: 'Heritages', key: 'heritages' },
        { name: 'Backgrounds', key: 'backgrounds' },
        { name: 'Spells', key: 'spells' },
        { name: 'Feats', key: 'feats' },
    ];

    let totalItems = 0;
    let totalTranslated = 0;

    for (const category of categories) {
        const total = totalCounts[category.key];
        const translated = translatedCounts[category.key];
        const coverage = total > 0 ? ((translated / total) * 100).toFixed(1) : '0.0';
        const missing = total - translated;

        totalItems += total;
        totalTranslated += translated;

        const bar = '█'.repeat(Math.floor(coverage / 5)) + '░'.repeat(20 - Math.floor(coverage / 5));
        const status = coverage >= 80 ? '✅' : coverage >= 50 ? '⚠️ ' : '❌';

        console.log(`\n${status} ${category.name.padEnd(15)} ${bar} ${coverage}%`);
        console.log(`   Total: ${total} | Translated: ${translated} | Missing: ${missing}`);
    }

    const overallCoverage = totalItems > 0 ? ((totalTranslated / totalItems) * 100).toFixed(1) : '0.0';

    console.log('\n' + '='.repeat(60));
    console.log(`\n📈 Overall Coverage: ${overallCoverage}%`);
    console.log(`   Total items: ${totalItems}`);
    console.log(`   Translated: ${totalTranslated}`);
    console.log(`   Missing: ${totalItems - totalTranslated}`);

    console.log('\n💡 Priority Areas:');
    const lowCoverage = categories.filter(cat => {
        const coverage = totalCounts[cat.key] > 0
            ? ((translatedCounts[cat.key] / totalCounts[cat.key]) * 100)
            : 0;
        return coverage < 50;
    });

    if (lowCoverage.length > 0) {
        lowCoverage.forEach(cat => {
            const total = totalCounts[cat.key];
            const translated = translatedCounts[cat.key];
            const coverage = total > 0 ? ((translated / total) * 100).toFixed(1) : '0.0';
            console.log(`   - ${cat.name}: ${coverage}% (${total - translated} missing)`);
        });
    } else {
        console.log('   ✅ All categories have good coverage (>50%)');
    }

    console.log('\n' + '='.repeat(60));
}

main().catch(console.error);
