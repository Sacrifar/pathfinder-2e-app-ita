/**
 * Prebuild Data Script
 * 
 * Compiles all PF2e JSON data into a single TypeScript file at build time.
 * This eliminates the need for individual JSON file loading at runtime,
 * significantly reducing bundle size and improving startup performance.
 * 
 * Usage: npx ts-node scripts/prebuild-data.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../src/data/pf2e');
const OUTPUT_FILE = path.join(__dirname, '../src/data/compiled-pf2e-data.ts');

// Data categories to compile with their paths
const CATEGORIES = {
    equipment: 'equipment/*.json',
    actions: 'actions/**/*.json',
    spells: 'spells/**/*.json',
    feats: 'feats/**/*.json',
    conditions: 'conditions/*.json',
    ancestries: 'ancestries/*.json',
    heritages: 'heritages/**/*.json',
    classes: 'classes/*.json',
    classFeatures: 'class-features/*.json',
} as const;

// For simple pattern matching
function matchesPattern(filePath: string, pattern: string): boolean {
    const normalizedPath = filePath.replace(/\\/g, '/');
    const patternParts = pattern.split('/');
    const pathParts = normalizedPath.split('/');

    let patternIdx = 0;
    let pathIdx = 0;

    while (patternIdx < patternParts.length && pathIdx < pathParts.length) {
        const pp = patternParts[patternIdx];

        if (pp === '**') {
            // Match zero or more directories
            patternIdx++;
            if (patternIdx >= patternParts.length) return true;

            // Try to match the rest of the pattern
            while (pathIdx < pathParts.length) {
                if (matchesPattern(pathParts.slice(pathIdx).join('/'), patternParts.slice(patternIdx).join('/'))) {
                    return true;
                }
                pathIdx++;
            }
            return false;
        } else if (pp === '*') {
            // Match any single component
            patternIdx++;
            pathIdx++;
        } else if (pp.includes('*')) {
            // Glob pattern like *.json
            const regex = new RegExp('^' + pp.replace(/\*/g, '.*') + '$');
            if (!regex.test(pathParts[pathIdx])) return false;
            patternIdx++;
            pathIdx++;
        } else {
            if (pp !== pathParts[pathIdx]) return false;
            patternIdx++;
            pathIdx++;
        }
    }

    return patternIdx >= patternParts.length && pathIdx >= pathParts.length;
}

// Get all JSON files from a directory recursively
function getJsonFiles(dir: string): string[] {
    const files: string[] = [];

    if (!fs.existsSync(dir)) {
        return files;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            files.push(...getJsonFiles(fullPath));
        } else if (entry.name.endsWith('.json') && !entry.name.includes('_folders')) {
            files.push(fullPath);
        }
    }

    return files;
}

// Filter files based on glob pattern
function filterFiles(baseDir: string, files: string[], pattern: string): string[] {
    return files.filter(file => {
        const relativePath = path.relative(baseDir, file).replace(/\\/g, '/');
        return matchesPattern(relativePath, pattern);
    });
}

// Load and validate JSON file
function loadJson(filePath: string): any | null {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
    } catch (e) {
        console.warn(`Failed to load ${filePath}: ${e}`);
        return null;
    }
}

// Strip HTML tags from text (simple version)
function stripHtml(html: string): string {
    if (!html) return '';
    return html
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
}

// Main function
async function main() {
    console.log('🔧 Prebuilding PF2e data...\n');

    // Get all JSON files
    const allFiles = getJsonFiles(DATA_DIR);
    console.log(`Found ${allFiles.length} total JSON files`);

    // Collect items by category
    const compiledData: Record<string, any[]> = {};

    for (const [category, pattern] of Object.entries(CATEGORIES)) {
        const categoryFiles = filterFiles(DATA_DIR, allFiles, pattern);
        console.log(`\n📁 ${category}: ${categoryFiles.length} files`);

        const items: any[] = [];

        for (const file of categoryFiles) {
            const data = loadJson(file);
            if (data && data._id && data.name) {
                // Store only essential data to reduce size
                items.push({
                    _id: data._id,
                    name: data.name,
                    type: data.type,
                    img: data.img,
                    system: data.system,
                });
            }
        }

        compiledData[category] = items;
        console.log(`   ✓ Loaded ${items.length} items`);
    }

    // Generate TypeScript output
    console.log('\n📝 Generating compiled-pf2e-data.ts...');

    const output = `/**
 * Compiled PF2e Data
 * 
 * This file is AUTO-GENERATED by scripts/prebuild-data.ts
 * Do not edit manually!
 * 
 * Generated at: ${new Date().toISOString()}
 */

// Raw data types
export interface RawPF2eItem {
    _id: string;
    name: string;
    type: string;
    img?: string;
    system: Record<string, unknown>;
}

// Compiled data by category
${Object.entries(compiledData).map(([category, items]) => {
        return `export const ${category}Data: RawPF2eItem[] = ${JSON.stringify(items, null, 0)};`;
    }).join('\n\n')}

// Export all data
export const allCompiledData = {
${Object.keys(compiledData).map(cat => `    ${cat}: ${cat}Data,`).join('\n')}
};
`;

    fs.writeFileSync(OUTPUT_FILE, output, 'utf-8');

    // Calculate sizes
    const outputSize = fs.statSync(OUTPUT_FILE).size;
    const outputSizeMB = (outputSize / (1024 * 1024)).toFixed(2);

    console.log(`\n✅ Done! Generated ${OUTPUT_FILE}`);
    console.log(`   File size: ${outputSizeMB} MB`);

    // Count total items
    const totalItems = Object.values(compiledData).reduce((sum, items) => sum + items.length, 0);
    console.log(`   Total items: ${totalItems}`);
}

main().catch(console.error);
