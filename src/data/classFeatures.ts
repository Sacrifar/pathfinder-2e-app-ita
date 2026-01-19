/**
 * Class Features Loader
 *
 * Loads class feature items like bloodlines, orders, mysteries, muses, instincts, etc.
 * These items often grant additional skills that are needed for dedication feats.
 */

import { LoadedFeat } from './pf2e-loader';

export interface ClassFeature {
    id: string;
    name: string;
    type: string;
    description: string;
    rules?: any[];
    traits?: string[];
    otherTags?: string[];
}

// Cache for loaded class features
let classFeaturesCache: Map<string, ClassFeature> | null = null;

/**
 * Load all class features from the pf2e data
 */
export function loadClassFeatures(): Map<string, ClassFeature> {
    if (classFeaturesCache) {
        return classFeaturesCache;
    }

    classFeaturesCache = new Map();

    // Load class features using Vite glob
    // @ts-ignore - Vite glob import
    const modules = import.meta.glob<{ default: unknown }>(
        '../data/pf2e/class-features/*.json',
        { eager: true }
    );

    for (const path in modules) {
        const module = modules[path];
        const raw = (module as { default?: any }).default || module;

        if (raw && raw.name && raw._id) {
            const feature: ClassFeature = {
                id: raw._id,
                name: raw.name,
                type: raw.type || 'classfeature',
                description: raw.system?.description?.value || raw.description || '',
                rules: raw.system?.rules,
                traits: raw.system?.traits?.value || [],
                otherTags: raw.system?.traits?.otherTags || [],
            };

            classFeaturesCache.set(feature.id, feature);

            // Also index by name for easier lookup
            const nameId = raw.name.toLowerCase().replace(/\s+/g, '-');
            classFeaturesCache.set(nameId, feature);
        }
    }

    return classFeaturesCache;
}

/**
 * Get a class feature by ID
 */
export function getClassFeatureById(id: string): ClassFeature | undefined {
    const features = loadClassFeatures();
    return features.get(id);
}

/**
 * Get a class feature by name
 */
export function getClassFeatureByName(name: string): ClassFeature | undefined {
    const features = loadClassFeatures();
    const nameId = name.toLowerCase().replace(/\s+/g, '-');
    return features.get(nameId);
}

/**
 * Extract skills granted by a class feature from its rules
 */
export function extractSkillsFromClassFeature(feature: ClassFeature): string[] {
    const skills: string[] = [];

    if (!feature.rules || !Array.isArray(feature.rules)) {
        return skills;
    }

    for (const rule of feature.rules) {
        if (rule.key === 'ActiveEffectLike' && rule.path && rule.mode === 'upgrade') {
            const skillMatch = rule.path.match(/system\.skills\.([^.\}]+)\.rank/);
            if (skillMatch && rule.value > 0) {
                const skillName = skillMatch[1];
                const capitalized = skillName.charAt(0).toUpperCase() + skillName.slice(1);
                if (!skills.includes(capitalized)) {
                    skills.push(capitalized);
                }
            }
        }
    }

    return skills;
}

/**
 * Parse skill from class feature description
 * Looks for patterns like "Order Skill Athletics" or "Bloodline Skills Diplomacy, Religion"
 */
export function parseSkillFromDescription(description: string): string[] {
    const skills: string[] = [];
    const desc = description.toLowerCase();

    // Pattern 1: "Order Skill Athletics"
    const orderSkillMatch = desc.match(/order skill\s+([a-z]+)/i);
    if (orderSkillMatch) {
        const skillName = orderSkillMatch[1];
        const capitalized = skillName.charAt(0).toUpperCase() + skillName.slice(1);
        skills.push(capitalized);
    }

    // Pattern 2: "Bloodline Skills X, Y"
    const bloodlineSkillsMatch = desc.match(/bloodline skills\s+([^\.<]+)/i);
    if (bloodlineSkillsMatch) {
        const skillsText = bloodlineSkillsMatch[1];
        // Split by comma
        const skillNames = skillsText.split(',').map(s => s.trim());
        for (const skillName of skillNames) {
            if (skillName && skillName.length > 0) {
                const capitalized = skillName.charAt(0).toUpperCase() + skillName.slice(1);
                skills.push(capitalized);
            }
        }
    }

    // Pattern 3: "Muse Skill X"
    const museSkillMatch = desc.match(/muse skill\s+([^\s<]+)/i);
    if (museSkillMatch) {
        const skillName = museSkillMatch[1];
        const capitalized = skillName.charAt(0).toUpperCase() + skillName.slice(1);
        skills.push(capitalized);
    }

    // Pattern 4: "Mystery Skill X"
    const mysterySkillMatch = desc.match(/mystery skill\s+([^\s<]+)/i);
    if (mysterySkillMatch) {
        const skillName = mysterySkillMatch[1];
        const capitalized = skillName.charAt(0).toUpperCase() + skillName.slice(1);
        skills.push(capitalized);
    }

    return skills;
}

/**
 * Get all skills granted by a class feature (from rules or description)
 */
export function getClassFeatureSkills(featureId: string): string[] {
    const feature = getClassFeatureById(featureId);
    if (!feature) {
        return [];
    }

    // First try to extract from rules
    const skills = extractSkillsFromClassFeature(feature);

    // If no skills found in rules, try parsing from description
    if (skills.length === 0) {
        const descSkills = parseSkillFromDescription(feature.description);
        skills.push(...descSkills);
    }

    return skills;
}

/**
 * Check if a feature is a specific type (bloodline, order, mystery, etc.)
 */
export function getFeatureType(feature: ClassFeature): string | null {
    if (feature.otherTags) {
        for (const tag of feature.otherTags) {
            if (tag.includes('bloodline')) return 'bloodline';
            if (tag.includes('order')) return 'order';
            if (tag.includes('mystery')) return 'mystery';
            if (tag.includes('muse')) return 'muse';
            if (tag.includes('instinct')) return 'instinct';
            if (tag.includes('patron')) return 'patron';
        }
    }

    // Try to detect from name
    const nameLower = feature.name.toLowerCase();
    if (nameLower.includes('bloodline')) return 'bloodline';
    if (nameLower.includes('order')) return 'order';
    if (nameLower.includes('mystery')) return 'mystery';
    if (nameLower.includes('muse')) return 'muse';
    if (nameLower.includes('instinct')) return 'instinct';
    if (nameLower.includes('patron')) return 'patron';

    return null;
}

/**
 * Get skills from kineticist gate junctions
 * Reads the gate features and extracts skills based on the selected junctions
 */
export function getKineticistJunctionSkills(
    gateId: string,
    elementType: string,
    junctionType: string
): string[] {
    console.log(`[JunctionSkills] getKineticistJunctionSkills(${gateId}, ${elementType}, ${junctionType})`);

    const feature = getClassFeatureById(gateId);
    if (!feature) {
        console.log(`[JunctionSkills] Feature not found for gateId: ${gateId}`);
        return [];
    }
    if (!feature.rules) {
        console.log(`[JunctionSkills] No rules found for feature: ${feature.name}`);
        return [];
    }

    console.log(`[JunctionSkills] Feature: ${feature.name}, rules count: ${feature.rules.length}`);

    const skills: string[] = [];

    // Find the junction skill rule for this gate
    for (const rule of feature.rules) {
        console.log(`[JunctionSkills] Checking rule:`, rule.key, rule.path);

        if (rule.key === 'ActiveEffectLike' &&
            rule.path &&
            rule.path.startsWith('system.skills.') &&
            rule.path.endsWith('.rank') &&
            rule.mode === 'upgrade' &&
            rule.value > 0) {

            console.log(`[JunctionSkills] Found skill rule: ${rule.path}, predicate:`, rule.predicate);

            // Check if this rule applies to the selected junction type
            const predicate = rule.predicate;
            if (predicate && Array.isArray(predicate)) {
                // Look for predicate like "junction:air:skill"
                const junctionPredicate = predicate.find((p: any) =>
                    typeof p === 'string' && p.includes(`junction:${elementType}:${junctionType}`)
                );

                console.log(`[JunctionSkills] Looking for predicate with "junction:${elementType}:${junctionType}"`);
                console.log(`[JunctionSkills] Found junctionPredicate:`, junctionPredicate);

                if (junctionPredicate) {
                    // Extract skill name from path (e.g., "system.skills.stealth.rank" -> "Stealth")
                    const skillMatch = rule.path.match(/system\.skills\.([^.\}]+)\.rank/);
                    if (skillMatch) {
                        const skillName = skillMatch[1];
                        const capitalized = skillName.charAt(0).toUpperCase() + skillName.slice(1);
                        if (!skills.includes(capitalized)) {
                            console.log(`[JunctionSkills] Adding skill: ${capitalized}`);
                            skills.push(capitalized);
                        }
                    }
                }
            }
        }
    }

    console.log(`[JunctionSkills] Returning skills:`, skills);
    return skills;
}

/**
 * Get all kineticist junction skills for a character
 * Maps gate IDs to junction types and extracts skills
 */
export function getAllKineticistJunctionSkills(
    character: any
): string[] {
    if (!character.kineticistJunctions) {
        console.log('[JunctionSkills] No kineticistJunctions found');
        return [];
    }

    const allSkills: string[] = [];

    console.log('[JunctionSkills] Processing kineticist junctions for character level', character.level, ':', character.kineticistJunctions);

    // Process each level's junctions
    for (const [levelStr, levelData] of Object.entries(character.kineticistJunctions)) {
        if (levelStr === 'baseJunctions') continue;

        const level = parseInt(levelStr, 10);
        // Only process junctions at or below the character's current level
        if (level > character.level) {
            console.log(`[JunctionSkills] Level ${levelStr}: Skipping (above character level ${character.level})`);
            continue;
        }

        const junctionData = levelData as any;
        console.log(`[JunctionSkills] Level ${levelStr}:`, junctionData);

        if (!junctionData.junctionIds || !Array.isArray(junctionData.junctionIds)) {
            console.log(`[JunctionSkills] Level ${levelStr}: No junctionIds`);
            continue;
        }

        // Get the gate for this level
        const gateId = junctionData.gateId;
        console.log(`[JunctionSkills] Level ${levelStr}: gateId = ${gateId}`);
        if (!gateId) continue;

        // Process each junction selected for this gate
        for (const junctionId of junctionData.junctionIds) {
            console.log(`[JunctionSkills] Processing junction: ${junctionId}`);

            // Extract junction type (e.g., "air_gate_skill_junction" -> "skill", "air_gate_aura_junction" -> "aura")
            const parts = junctionId.split('_');
            // The junction type is the third part: "ELEMENT_GATE_JUNCTIONTYPE_junction"
            const junctionType = parts[2]; // "skill", "aura", "impulse", etc.
            const elementType = parts[0]; // "air", "earth", etc.
            console.log(`[JunctionSkills] Extracted elementType: ${elementType}, junctionType: ${junctionType}`);

            // Get skills for this junction
            const skills = getKineticistJunctionSkills(gateId, elementType, junctionType);
            console.log(`[JunctionSkills] Skills found for ${gateId} (${elementType}:${junctionType}):`, skills);
            allSkills.push(...skills);
        }
    }

    console.log('[JunctionSkills] Final allSkills:', allSkills);
    return allSkills;
}

/**
 * Get granted feats from kineticist gate junctions
 * Reads the gate features and extracts feat UUIDs based on the selected junctions
 */
export function getKineticistJunctionGrantedFeats(
    gateId: string,
    elementType: string,
    junctionType: string
): string[] {
    console.log(`[JunctionFeats] getKineticistJunctionGrantedFeats(${gateId}, ${elementType}, ${junctionType})`);

    const feature = getClassFeatureById(gateId);
    if (!feature) {
        console.log(`[JunctionFeats] Feature not found for gateId: ${gateId}`);
        return [];
    }
    if (!feature.rules) {
        console.log(`[JunctionFeats] No rules found for feature: ${feature.name}`);
        return [];
    }

    console.log(`[JunctionFeats] Feature: ${feature.name}, rules count: ${feature.rules.length}`);

    const grantedFeats: string[] = [];

    // Find GrantItem rules for this gate's junctions
    for (const rule of feature.rules) {
        if (rule.key === 'GrantItem' && rule.uuid && !rule.uuid.includes('{')) {
            // Skip UUIDs that are references to choice values
            console.log(`[JunctionFeats] Found GrantItem rule: ${rule.uuid}, predicate:`, rule.predicate);

            // Check if this rule applies to the selected junction type
            const predicate = rule.predicate;
            if (predicate && Array.isArray(predicate)) {
                // Look for predicate like "junction:air:skill"
                const junctionPredicate = predicate.find((p: any) =>
                    typeof p === 'string' && p.includes(`junction:${elementType}:${junctionType}`)
                );

                console.log(`[JunctionFeats] Looking for predicate with "junction:${elementType}:${junctionType}"`);
                console.log(`[JunctionFeats] Found junctionPredicate:`, junctionPredicate);

                if (junctionPredicate) {
                    // Extract feat name from UUID (e.g., "Compendium.pf2e.feats-srd.Item.Experienced Smuggler" -> "Experienced Smuggler")
                    const featNameMatch = rule.uuid.match(/\.Item\.(.+)$/);
                    if (featNameMatch) {
                        const featName = featNameMatch[1];
                        if (!grantedFeats.includes(featName)) {
                            console.log(`[JunctionFeats] Adding granted feat: ${featName}`);
                            grantedFeats.push(featName);
                        }
                    }
                }
            }
        }
    }

    console.log(`[JunctionFeats] Returning granted feats:`, grantedFeats);
    return grantedFeats;
}

/**
 * Get all kineticist junction granted feats for a character
 * Maps gate IDs to junction types and extracts granted feat names
 */
export function getAllKineticistJunctionGrantedFeats(
    character: any
): string[] {
    if (!character.kineticistJunctions) {
        console.log('[JunctionFeats] No kineticistJunctions found');
        return [];
    }

    const allFeats: string[] = [];

    console.log('[JunctionFeats] Processing kineticist junctions for feats:', character.kineticistJunctions);

    // Process each level's junctions
    for (const [levelStr, levelData] of Object.entries(character.kineticistJunctions)) {
        if (levelStr === 'baseJunctions') continue;

        const level = parseInt(levelStr, 10);
        // Only process junctions at or below the character's current level
        if (level > character.level) {
            console.log(`[JunctionFeats] Level ${levelStr}: Skipping (above character level ${character.level})`);
            continue;
        }

        const junctionData = levelData as any;
        console.log(`[JunctionFeats] Level ${levelStr}:`, junctionData);

        if (!junctionData.junctionIds || !Array.isArray(junctionData.junctionIds)) {
            console.log(`[JunctionFeats] Level ${levelStr}: No junctionIds`);
            continue;
        }

        // Get the gate for this level
        const gateId = junctionData.gateId;
        console.log(`[JunctionFeats] Level ${levelStr}: gateId = ${gateId}`);
        if (!gateId) continue;

        // Process each junction selected for this gate
        for (const junctionId of junctionData.junctionIds) {
            console.log(`[JunctionFeats] Processing junction: ${junctionId}`);

            // Extract junction type (e.g., "air_gate_skill_junction" -> "skill", "air_gate_aura_junction" -> "aura")
            const parts = junctionId.split('_');
            // The junction type is the third part: "ELEMENT_GATE_JUNCTIONTYPE_junction"
            const junctionType = parts[2]; // "skill", "aura", "impulse", etc.
            const elementType = parts[0]; // "air", "earth", etc.
            console.log(`[JunctionFeats] Extracted elementType: ${elementType}, junctionType: ${junctionType}`);

            // Get granted feats for this junction
            const feats = getKineticistJunctionGrantedFeats(gateId, elementType, junctionType);
            console.log(`[JunctionFeats] Feats found for ${gateId} (${elementType}:${junctionType}):`, feats);
            allFeats.push(...feats);
        }
    }

    console.log('[JunctionFeats] Final allFeats:', allFeats);
    return allFeats;
}
