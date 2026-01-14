/**
 * Utility per lazy loading dei dati JSON
 * Carica i dati solo quando necessario
 */

// Cache per i dati già caricati
const dataCache = new Map<string, any>();

/**
 * Carica dinamicamente i dati di una classe
 */
export async function lazyLoadClassData(classId: string): Promise<any> {
    const cacheKey = `class-${classId}`;
    if (dataCache.has(cacheKey)) {
        return dataCache.get(cacheKey);
    }

    try {
        const module = await import(`../data/classes/${classId}.json`);
        dataCache.set(cacheKey, module.default);
        return module.default;
    } catch (error) {
        console.error(`Failed to load class data for ${classId}:`, error);
        return null;
    }
}

/**
 * Carica dinamicamente i dati di un'ancestry
 */
export async function lazyLoadAncestryData(ancestryId: string): Promise<any> {
    const cacheKey = `ancestry-${ancestryId}`;
    if (dataCache.has(cacheKey)) {
        return dataCache.get(cacheKey);
    }

    try {
        const module = await import(`../data/ancestries/${ancestryId}.json`);
        dataCache.set(cacheKey, module.default);
        return module.default;
    } catch (error) {
        console.error(`Failed to load ancestry data for ${ancestryId}:`, error);
        return null;
    }
}

/**
 * Carica dinamicamente i dati di una heritage
 */
export async function lazyLoadHeritageData(ancestryId: string, heritageId: string): Promise<any> {
    const cacheKey = `heritage-${ancestryId}-${heritageId}`;
    if (dataCache.has(cacheKey)) {
        return dataCache.get(cacheKey);
    }

    try {
        const module = await import(`../data/heritages/${ancestryId}/${heritageId}.json`);
        dataCache.set(cacheKey, module.default);
        return module.default;
    } catch (error) {
        console.error(`Failed to load heritage data for ${heritageId}:`, error);
        return null;
    }
}

/**
 * Carica dinamicamente i feat per livello
 */
export async function lazyLoadFeatsForLevel(level: number): Promise<any[]> {
    const cacheKey = `feats-level-${level}`;
    if (dataCache.has(cacheKey)) {
        return dataCache.get(cacheKey);
    }

    try {
        const { getFeats } = await import('../data/pf2e-loader');
        const allFeats = getFeats();
        const levelFeats = allFeats.filter(f => f.level === level);
        dataCache.set(cacheKey, levelFeats);
        return levelFeats;
    } catch (error) {
        console.error(`Failed to load feats for level ${level}:`, error);
        return [];
    }
}

/**
 * Svuota la cache (utile per liberare memoria)
 */
export function clearDataCache() {
    dataCache.clear();
}

/**
 * Pre-carica dati comuni in background
 */
export function preloadCommonData() {
    // Pre-carica le classi più comuni
    const commonClasses = ['fighter', 'wizard', 'cleric', 'rogue'];
    commonClasses.forEach(classId => {
        lazyLoadClassData(classId).catch(() => {});
    });
}
