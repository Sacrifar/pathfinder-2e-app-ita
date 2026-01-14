/**
 * Class Specializations Data
 * Contains all class specialization options (Muses, Doctrines, Instincts, etc.)
 */

import { getClasses } from './pf2e-loader';
import type { LoadedClass } from './pf2e-loader';

export interface ClassSpecialization {
    id: string;
    name: string;
    nameIt?: string;
    className: string; // Use class name to match with LoadedClass
    description: string;
    source: string;
}

export interface ClassSpecializationType {
    id: string;
    name: string;
    nameIt?: string;
    className: string; // Use class name to match with LoadedClass
    tag: string;
    options: ClassSpecialization[];
}

// Cache for class ID mappings
let classIdMapping: Record<string, string> = {};
let classNameMapping: Record<string, string> = {};

/**
 * Build a mapping from class name to class ID and vice versa
 */
function buildClassMappings(): void {
    if (Object.keys(classIdMapping).length > 0) {
        return;
    }

    const classes = getClasses();
    for (const cls of classes) {
        const normalizedName = cls.name.toLowerCase().replace(/\s+/g, '');
        classIdMapping[normalizedName] = cls.id;
        classNameMapping[cls.id] = cls.name;
    }
}

/**
 * Get class ID by class name
 */
export function getClassIdByName(className: string): string | null {
    buildClassMappings();
    const normalizedName = className.toLowerCase().replace(/\s+/g, '');
    return classIdMapping[normalizedName] || null;
}

/**
 * Get class name by class ID
 */
export function getClassNameById(classId: string): string | null {
    buildClassMappings();
    return classNameMapping[classId] || null;
}

// Bard Muses
const BARD_MUSES: ClassSpecialization[] = [
    {
        id: 'muse_enigma',
        name: 'Enigma',
        nameIt: 'Enigma',
        className: 'Bard',
        description: 'Your muse is a mystery, driving you to uncover hidden secrets. You gain Bardic Lore feat and Sure Strike spell.',
        source: 'Player Core',
    },
    {
        id: 'muse_maestro',
        name: 'Maestro',
        nameIt: 'Maestro',
        className: 'Bard',
        description: 'Your muse is a performer of peerless skill. You gain Stunning Note feat and Inspire Courage spell.',
        source: 'Player Core',
    },
    {
        id: 'muse_polymath',
        name: 'Polymath',
        nameIt: 'Polimata',
        className: 'Bard',
        description: 'Your muse is a jack-of-all-trades. You gain Bardic Feat and Unseen Servant spell.',
        source: 'Player Core',
    },
    {
        id: 'muse_warrior',
        name: 'Warrior',
        nameIt: 'Guerriero',
        className: 'Bard',
        description: 'Your muse is a master of martial combat. You gain War Song feat and Fear spell.',
        source: 'Player Core',
    },
];

// Cleric Doctrines
const CLERIC_DOCTRINES: ClassSpecialization[] = [
    {
        id: 'doctrine_cloistered',
        name: 'Cloistered Cleric',
        nameIt: 'Chierico Chiuso',
        className: 'Cleric',
        description: 'You are a priest of the cloth, focusing on spellcasting and knowledge. You gain Divine spellcasting and advanced light/medium armor proficiency.',
        source: 'Player Core',
    },
    {
        id: 'doctrine_warpriest',
        name: 'Warpriest',
        nameIt: 'Guerriero Sacro',
        className: 'Cleric',
        description: 'You are a priest of the sword, focusing on martial combat. You gain martial weapon proficiency and advanced medium armor proficiency.',
        source: 'Player Core',
    },
];

// Barbarian Instincts
const BARBARIAN_INSTINCTS: ClassSpecialization[] = [
    {
        id: 'instinct_animal',
        name: 'Animal Instinct',
        nameIt: 'Istinto Animale',
        className: 'Barbarian',
        description: 'Your rage comes from a bestial nature. You gain Animal Skin and a specialization in unarmed attacks.',
        source: 'Player Core 2',
    },
    {
        id: 'instinct_dragon',
        name: 'Dragon Instinct',
        nameIt: 'Istinto del Drago',
        className: 'Barbarian',
        description: 'Your rage channels the power of dragons. You gain Drag n\' Breath and focus on a dragon weapon group.',
        source: 'Player Core 2',
    },
    {
        id: 'instinct_elemental',
        name: 'Elemental Instinct',
        nameIt: 'Istinto Elementale',
        className: 'Barbarian',
        description: 'Your rage channels elemental fury. You gain Elemental Fury and focus on elemental attacks.',
        source: 'Player Core 2',
    },
    {
        id: 'instinct_fury',
        name: 'Fury Instinct',
        nameIt: 'Istinto della Furia',
        className: 'Barbarian',
        description: 'Your rage is pure, unbridled fury. You gain Furious Momentum.',
        source: 'Player Core 2',
    },
    {
        id: 'instinct_giant',
        name: 'Giant Instinct',
        nameIt: 'Istinto del Gigante',
        className: 'Barbarian',
        description: 'Your rage makes you powerful like a giant. You gain Titan\'s Stature and use larger weapons.',
        source: 'Player Core 2',
    },
    {
        id: 'instinct_spirit',
        name: 'Spirit Instinct',
        nameIt: 'Istinto dello Spirito',
        className: 'Barbarian',
        description: 'Your rage channels spiritual power. You gain Spirit Storm and focus on spirit damage.',
        source: 'Player Core 2',
    },
];

// Sorcerer Bloodlines
const SORCERER_BLOODLINES: ClassSpecialization[] = [
    {
        id: 'bloodline_aberrant',
        name: 'Aberrant',
        nameIt: 'Aberrante',
        className: 'Sorcerer',
        description: 'Your blood carries the corruption of aberrant creatures. You gain abnormal physical mutations.',
        source: 'Player Core 2',
    },
    {
        id: 'bloodline_angelic',
        name: 'Angelic',
        nameIt: 'Angelico',
        className: 'Sorcerer',
        description: 'Your blood carries the power of celestial beings. You gain healing and holy abilities.',
        source: 'Player Core 2',
    },
    {
        id: 'bloodline_demonic',
        name: 'Demonic',
        nameIt: 'Demoniaco',
        className: 'Sorcerer',
        description: 'Your blood carries the corruption of the Abyss. You gain destructive power.',
        source: 'Player Core 2',
    },
    {
        id: 'bloodline_draconic',
        name: 'Draconic',
        nameIt: 'Draconico',
        className: 'Sorcerer',
        description: 'Your blood carries the power of dragons. You gain draconic resistances and breath weapon.',
        source: 'Player Core 2',
    },
    {
        id: 'bloodline_elemental',
        name: 'Elemental',
        nameIt: 'Elementale',
        className: 'Sorcerer',
        description: 'Your blood carries the power of the elements. You gain elemental resistances.',
        source: 'Player Core 2',
    },
    {
        id: 'bloodline_fey',
        name: 'Fey',
        nameIt: 'Fatato',
        className: 'Sorcerer',
        description: 'Your blood carries the magic of the First World. You gain fey charms and illusions.',
        source: 'Player Core 2',
    },
];

// Champion Causes
const CHAMPION_CAUSES: ClassSpecialization[] = [
    {
        id: 'cause_liberation',
        name: 'Liberation',
        nameIt: 'Liberazione',
        className: 'Champion',
        description: 'You fight for freedom and against tyranny. You gain Liberating Step.',
        source: 'Player Core 2',
    },
    {
        id: 'cause_justice',
        name: 'Justice',
        nameIt: 'Giustizia',
        className: 'Champion',
        description: 'You fight for justice and retribution. You gain Retributive Strike.',
        source: 'Player Core 2',
    },
    {
        id: 'cause_redemption',
        name: 'Redemption',
        nameIt: 'Redenzione',
        className: 'Champion',
        description: 'You fight to redeem the wicked. You gain Glimpse of Redemption.',
        source: 'Player Core 2',
    },
];

// Druid Orders
const DRUID_ORDERS: ClassSpecialization[] = [
    {
        id: 'order_animal',
        name: 'Animal Order',
        nameIt: 'Ordine Animale',
        className: 'Druid',
        description: 'You focus on the animal kingdom. You gain an animal companion.',
        source: 'Player Core',
    },
    {
        id: 'order_leaf',
        name: 'Leaf Order',
        nameIt: 'Ordine della Foglia',
        className: 'Druid',
        description: 'You focus on plants and fungi. You gain Leaf magic.',
        source: 'Player Core',
    },
    {
        id: 'order_storm',
        name: 'Storm Order',
        nameIt: 'Ordine della Tempesta',
        className: 'Druid',
        description: 'You focus on weather and sky. You gain storm magic.',
        source: 'Player Core',
    },
    {
        id: 'order_wild',
        name: 'Untamed Order',
        nameIt: 'Ordine Selvaggio',
        className: 'Druid',
        description: 'You embrace the untamed wilderness. You gain powerful shapechanging.',
        source: 'Player Core',
    },
];

// Ranger Hunter's Edges
const RANGER_EDGES: ClassSpecialization[] = [
    {
        id: 'edge_flurry',
        name: 'Flurry',
        nameIt: 'Fitta',
        className: 'Ranger',
        description: 'You strike with multiple attacks. You gain Hunted Shot.',
        source: 'Player Core',
    },
    {
        id: 'edge_outwit',
        name: 'Outwit',
        nameIt: 'Suppianto',
        className: 'Ranger',
        description: 'You outsmart your prey. You gain Preview and bonuses to Recall Knowledge.',
        source: 'Player Core',
    },
    {
        id: 'edge_precision',
        name: 'Precision',
        nameIt: 'Precisione',
        className: 'Ranger',
        description: 'You strike with deadly precision. You gain Hunted Prey and precision damage.',
        source: 'Player Core',
    },
];

// Rogue Rackets
const ROGUE_RACKETS: ClassSpecialization[] = [
    {
        id: 'racket_scoundrel',
        name: 'Scoundrel',
        nameIt: 'Canaglia',
        className: 'Rogue',
        description: 'You use dirty tactics and misdirection. You gain Deceptive Sneak.',
        source: 'Player Core',
    },
    {
        id: 'racket_ruffian',
        name: 'Ruffian',
        nameIt: 'Rissoso',
        className: 'Rogue',
        description: 'You use brute force and intimidation. You gain Brutal Beating.',
        source: 'Player Core',
    },
    {
        id: 'racket_thief',
        name: 'Thief',
        nameIt: 'Ladro',
        className: 'Rogue',
        description: 'You are a master of stealth and larceny. You gain Steal Spell.',
        source: 'Player Core',
    },
];

// Oracle Mysteries
const ORACLE_MYSTRIES: ClassSpecialization[] = [
    {
        id: 'mystery_ancestors',
        name: 'Ancestors',
        nameIt: 'Antenati',
        className: 'Oracle',
        description: 'You draw power from your lineage. You gain connection to the spirits of your ancestors.',
        source: 'Player Core 2',
    },
    {
        id: 'mystery_battle',
        name: 'Battle',
        nameIt: 'Battaglia',
        className: 'Oracle',
        description: 'You draw power from conflict. You gain martial prowess and battlefield insight.',
        source: 'Player Core 2',
    },
    {
        id: 'mystery_flames',
        name: 'Flames',
        nameIt: 'Fiamme',
        className: 'Oracle',
        description: 'You draw power from fire. You gain fire resistance and flame revelations.',
        source: 'Player Core 2',
    },
    {
        id: 'mystery_life',
        name: 'Life',
        nameIt: 'Vita',
        className: 'Oracle',
        description: 'You draw power from life force. You gain healing abilities and life sight.',
        source: 'Player Core 2',
    },
];

// Investigator Methodologies
const INVESTIGATOR_METHODOLOGIES: ClassSpecialization[] = [
    {
        id: 'method_alchemy',
        name: 'Alchemical Sciences',
        nameIt: 'Scienze Alchemiche',
        className: 'Investigator',
        description: 'You use alchemy to solve crimes. You gain alactical items and formulas.',
        source: 'Player Core 2',
    },
    {
        id: 'method_empiricism',
        name: 'Empiricism',
        nameIt: 'Empirismo',
        className: 'Investigator',
        description: 'You rely on practical experience. You gain Recall Knowledge abilities.',
        source: 'Player Core 2',
    },
    {
        id: 'method_forensic',
        name: 'Forensic Medicine',
        nameIt: 'Medicina Forense',
        className: 'Investigator',
        description: 'You use medical knowledge. You gain Medicine abilities and autopsy.',
        source: 'Player Core 2',
    },
];

// Magus Hybrid Studies
const MAGUS_HYBRID_STUDIES: ClassSpecialization[] = [
    {
        id: 'study_sparkling_targe',
        name: 'Sparkling Targe',
        nameIt: 'Rinforziatore Scintillante',
        className: 'Magus',
        description: 'You combine spell and shield. You gain shield-based spell combat.',
        source: 'Secrets of Magic',
    },
    {
        id: 'study_starlit_span',
        name: 'Starlit Span',
        nameIt: 'Campitura Stellata',
        className: 'Magus',
        description: 'You combine spell and ranged attacks. You gain ranged spell strikes.',
        source: 'Secrets of Magic',
    },
    {
        id: 'study_twisting_tree',
        name: 'Twisting Tree',
        nameIt: 'Albero Tortuoso',
        className: 'Magus',
        description: 'You combine spell and staff. You gain staff-based spell combat.',
        source: 'Secrets of Magic',
    },
];

// Witch Lessons
const WITCH_LESSONS: ClassSpecialization[] = [
    {
        id: 'lesson_protection',
        name: 'Protection',
        nameIt: 'Protezione',
        className: 'Witch',
        description: 'You learn protective magic. You gain protection abilities and spells.',
        source: 'Player Core',
    },
    {
        id: 'lesson_vengeance',
        name: 'Vengeance',
        nameIt: 'Vendetta',
        className: 'Witch',
        description: 'You learn vengeful magic. You gain offensive hexes.',
        source: 'Player Core',
    },
    {
        id: 'lesson_life',
        name: 'Life',
        nameIt: 'Vita',
        className: 'Witch',
        description: 'You learn healing magic. You gain healing hexes.',
        source: 'Player Core',
    },
];

// Gunslinger Ways
const GUNSLINGER_WAYS: ClassSpecialization[] = [
    {
        id: 'way_drifter',
        name: 'Way of the Drifter',
        nameIt: 'Via del Vagabondo',
        className: 'Gunslinger',
        description: 'You are a wandering gunslinger. You gain versatility with different firearms.',
        source: 'Guns & Gears',
    },
    {
        id: 'way_pistolero',
        name: 'Way of the Pistolero',
        nameIt: 'Via del Pistolero',
        className: 'Gunslinger',
        description: 'You specialize in one-handed firearms. You gain pistol techniques.',
        source: 'Guns & Gears',
    },
    {
        id: 'way_sniper',
        name: 'Way of the Sniper',
        nameIt: 'Via del Cecchino',
        className: 'Gunslinger',
        description: 'You specialize in long-range firearms. You gain sniping abilities.',
        source: 'Guns & Gears',
    },
];

// Swashbuckler Styles
const SWASHBUCKLER_STYLES: ClassSpecialization[] = [
    {
        id: 'style_braggart',
        name: 'Braggart',
        nameIt: 'Fanfarone',
        className: 'Swashbuckler',
        description: 'You boast and intimidate. You gain intimidation-based panache.',
        source: 'Player Core 2',
    },
    {
        id: 'style_fencer',
        name: 'Fencer',
        nameIt: 'Schermitore',
        className: 'Swashbuckler',
        description: 'You use precise fencing techniques. You gain precise strikes.',
        source: 'Player Core 2',
    },
    {
        id: 'style_gymnast',
        name: 'Gymnast',
        nameIt: 'Ginnasta',
        className: 'Swashbuckler',
        description: 'You use acrobatic moves. You gain movement-based panache.',
        source: 'Player Core 2',
    },
];

// All class specializations by class name (not ID)
export const CLASS_SPECIALIZATIONS_BY_NAME: Record<string, ClassSpecializationType[]> = {
    'Bard': [
        {
            id: 'bard_muses',
            name: 'Muse',
            nameIt: 'Musa',
            className: 'Bard',
            tag: 'bard-muse',
            options: BARD_MUSES,
        },
    ],
    'Cleric': [
        {
            id: 'cleric_doctrines',
            name: 'Doctrine',
            nameIt: 'Dottrina',
            className: 'Cleric',
            tag: 'cleric-doctrine',
            options: CLERIC_DOCTRINES,
        },
    ],
    'Barbarian': [
        {
            id: 'barbarian_instincts',
            name: 'Instinct',
            nameIt: 'Istinto',
            className: 'Barbarian',
            tag: 'barbarian-instinct',
            options: BARBARIAN_INSTINCTS,
        },
    ],
    'Sorcerer': [
        {
            id: 'sorcerer_bloodlines',
            name: 'Bloodline',
            nameIt: 'Sangue',
            className: 'Sorcerer',
            tag: 'sorcerer-bloodline',
            options: SORCERER_BLOODLINES,
        },
    ],
    'Champion': [
        {
            id: 'champion_causes',
            name: 'Cause',
            nameIt: 'Causa',
            className: 'Champion',
            tag: 'champion-cause',
            options: CHAMPION_CAUSES,
        },
    ],
    'Druid': [
        {
            id: 'druid_orders',
            name: 'Order',
            nameIt: 'Ordine',
            className: 'Druid',
            tag: 'druid-order',
            options: DRUID_ORDERS,
        },
    ],
    'Ranger': [
        {
            id: 'ranger_edges',
            name: "Hunter's Edge",
            nameIt: 'Vantaggio del Cacciatore',
            className: 'Ranger',
            tag: 'ranger-hunters-edge',
            options: RANGER_EDGES,
        },
    ],
    'Rogue': [
        {
            id: 'rogue_rackets',
            name: 'Racket',
            nameIt: 'Specializzazione',
            className: 'Rogue',
            tag: 'rogue-racket',
            options: ROGUE_RACKETS,
        },
    ],
    'Oracle': [
        {
            id: 'oracle_mysteries',
            name: 'Mystery',
            nameIt: 'Mistero',
            className: 'Oracle',
            tag: 'oracle-mystery',
            options: ORACLE_MYSTRIES,
        },
    ],
    'Investigator': [
        {
            id: 'investigator_methodologies',
            name: 'Methodology',
            nameIt: 'Metodologia',
            className: 'Investigator',
            tag: 'investigator-methodology',
            options: INVESTIGATOR_METHODOLOGIES,
        },
    ],
    'Magus': [
        {
            id: 'magus_hybrid_studies',
            name: 'Hybrid Study',
            nameIt: 'Studio Ibrido',
            className: 'Magus',
            tag: 'magus-hybrid-study',
            options: MAGUS_HYBRID_STUDIES,
        },
    ],
    'Witch': [
        {
            id: 'witch_lessons',
            name: 'Lesson',
            nameIt: 'Lezione',
            className: 'Witch',
            tag: 'witch-lesson',
            options: WITCH_LESSONS,
        },
    ],
    'Gunslinger': [
        {
            id: 'gunslinger_ways',
            name: 'Way',
            nameIt: 'Via',
            className: 'Gunslinger',
            tag: 'gunslinger-way',
            options: GUNSLINGER_WAYS,
        },
    ],
    'Swashbuckler': [
        {
            id: 'swashbuckler_styles',
            name: 'Style',
            nameIt: 'Stile',
            className: 'Swashbuckler',
            tag: 'swashbuckler-style',
            options: SWASHBUCKLER_STYLES,
        },
    ],
};

// Classes that don't have specializations or have complex/unsupported systems
const CLASSES_WITHOUT_SPECIALIZATIONS = [
    'Fighter',
    'Monk',
    // Newer classes without simple specializations or insufficient data
    'Exemplar', // Insufficient data in current source files
    'Commander', // Insufficient data in current source files
    'Guardian', // Insufficient data in current source files
    'Animist', // Insufficient data in current source files
];

/**
 * Get specializations for a specific class by ID
 */
export function getSpecializationsForClass(classId: string): ClassSpecializationType[] {
    const className = getClassNameById(classId);
    if (!className) return [];
    return CLASS_SPECIALIZATIONS_BY_NAME[className] || [];
}

/**
 * Check if a class has specializations by ID
 */
export function classHasSpecializations(classId: string): boolean {
    const className = getClassNameById(classId);
    if (!className) return false;
    return className in CLASS_SPECIALIZATIONS_BY_NAME;
}

/**
 * Get specialization by ID
 */
export function getSpecializationById(specializationId: string): ClassSpecialization | null {
    for (const className in CLASS_SPECIALIZATIONS_BY_NAME) {
        for (const specType of CLASS_SPECIALIZATIONS_BY_NAME[className]) {
            const found = specType.options.find(opt => opt.id === specializationId);
            if (found) return found;
        }
    }
    return null;
}

/**
 * Get a default specialization for a class by class ID
 * Returns the first (most common) specialization for each class
 */
export function getDefaultSpecializationForClass(classId: string): string | null {
    const specializations = getSpecializationsForClass(classId);
    if (specializations.length === 0 || specializations[0].options.length === 0) {
        return null;
    }
    // Return the first specialization option (usually the most common/basic one)
    return specializations[0].options[0].id;
}
