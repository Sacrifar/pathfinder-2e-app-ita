/**
 * Class Specializations Data
 * Contains all class specialization options (Muses, Doctrines, Instincts, etc.)
 */

import { getClasses } from './pf2e-loader';

// Import specialization JSON files from pf2e data
import bomberData from './pf2e/class-features/bomber.json';
import chirurgeonData from './pf2e/class-features/chirurgeon.json';
import mutagenistData from './pf2e/class-features/mutagenist.json';
import toxicologistData from './pf2e/class-features/toxicologist.json';

import distantGraspData from './pf2e/class-features/the-distant-grasp.json';
import infiniteEyeData from './pf2e/class-features/the-infinite-eye.json';
import oscillatingWaveData from './pf2e/class-features/the-oscillating-wave.json';
import silentWhisperData from './pf2e/class-features/the-silent-whisper.json';
import tangibleDreamData from './pf2e/class-features/the-tangible-dream.json';
import unboundStepData from './pf2e/class-features/the-unbound-step.json';

import airGateData from './pf2e/class-features/air-gate.json';
import earthGateData from './pf2e/class-features/earth-gate.json';
import fireGateData from './pf2e/class-features/fire-gate.json';
import metalGateData from './pf2e/class-features/metal-gate.json';
import waterGateData from './pf2e/class-features/water-gate.json';
import woodGateData from './pf2e/class-features/wood-gate.json';

import armorInnovationData from './pf2e/class-features/armor-innovation.json';
import constructInnovationData from './pf2e/class-features/construct-innovation.json';
import weaponInnovationData from './pf2e/class-features/weapon-innovation.json';

import amuletData from './pf2e/class-features/amulet.json';
import bellData from './pf2e/class-features/bell.json';
import chaliceData from './pf2e/class-features/chalice.json';
import lanternData from './pf2e/class-features/lantern.json';
import mirrorData from './pf2e/class-features/mirror.json';
import regaliaData from './pf2e/class-features/regalia.json';
import tomeData from './pf2e/class-features/tome.json';
import wandData from './pf2e/class-features/wand.json';
import weaponData from './pf2e/class-features/weapon.json';

import _arcaneSchoolData from './pf2e/class-features/arcane-school.json';
import elementalSchoolData from './pf2e/class-features/elemental-school.json';
import schoolOfArsGrammaticaData from './pf2e/class-features/school-of-ars-grammatica.json';
import schoolOfBattleMagicData from './pf2e/class-features/school-of-battle-magic.json';
import schoolOfCivicWizardryData from './pf2e/class-features/school-of-civic-wizardry.json';
import schoolOfGatesData from './pf2e/class-features/school-of-gates.json';
import schoolOfKalistradeData from './pf2e/class-features/school-of-kalistrade.json';
import schoolOfMagicalTechnologiesData from './pf2e/class-features/school-of-magical-technologies.json';
import schoolOfMentalismData from './pf2e/class-features/school-of-mentalism.json';
import schoolOfProteanFormData from './pf2e/class-features/school-of-protean-form.json';
import schoolOfRedMantisMagicData from './pf2e/class-features/red-mantis-magic-school.json';
import schoolOfRootedWisdomData from './pf2e/class-features/school-of-rooted-wisdom.json';
import schoolOfTheBoundaryData from './pf2e/class-features/school-of-the-boundary.json';
import schoolOfTheReclamationData from './pf2e/class-features/school-of-the-reclamation.json';
import schoolOfUnifiedMagicalTheoryData from './pf2e/class-features/school-of-unified-magical-theory.json';

import _arcaneThesisData from './pf2e/class-features/arcane-thesis.json';
import experimentalSpellshapingData from './pf2e/class-features/experimental-spellshaping.json';
import improvedFamiliarAttunementData from './pf2e/class-features/improved-familiar-attunement.json';
import spellBlendingData from './pf2e/class-features/spell-blending.json';
import spellSubstitutionData from './pf2e/class-features/spell-substitution.json';
import staffNexusData from './pf2e/class-features/staff-nexus.json';

import angelEidolonData from './pf2e/class-features/angel-eidolon.json';
import angerPhantomEidolonData from './pf2e/class-features/anger-phantom-eidolon.json';
import beastEidolonData from './pf2e/class-features/beast-eidolon.json';
import constructEidolonData from './pf2e/class-features/construct-eidolon.json';
import demonEidolonData from './pf2e/class-features/demon-eidolon.json';
import devotionPhantomEidolonData from './pf2e/class-features/devotion-phantom-eidolon.json';
import dragonEidolonData from './pf2e/class-features/dragon-eidolon.json';
import elementalEidolonData from './pf2e/class-features/elemental-eidolon.json';
import feyEidolonData from './pf2e/class-features/fey-eidolon.json';
import plantEidolonData from './pf2e/class-features/plant-eidolon.json';
import psychopompEidolonData from './pf2e/class-features/psychopomp-eidolon.json';
import undeadEidolonData from './pf2e/class-features/undead-eidolon.json';

import liturgistData from './pf2e/class-features/liturgist.json';
import mediumData from './pf2e/class-features/medium.json';
import seerData from './pf2e/class-features/seer.json';
import shamanData from './pf2e/class-features/shaman.json';

/**
 * Convert Foundry VTT feat data to ClassSpecialization format
 */
function convertFoundryFeatToSpecialization(
    data: any,
    className: string,
    source: string
): ClassSpecialization {
    return {
        id: data._id || data.name.toLowerCase().replace(/\s+/g, '-'),
        name: data.name,
        nameIt: '', // Italian translations not available in Foundry data
        className: className,
        description: data.system?.description?.value?.replace(/<[^>]*>/g, '').substring(0, 200) || '',
        source: source,
    };
}

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
    maxSelections?: number; // For classes that allow multiple selections (e.g., Kineticist Dual Gate = 2)
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
    {
        id: 'muse_zoophonia',
        name: 'Zoophonia',
        nameIt: 'Zoofonia',
        className: 'Bard',
        description: 'Your muse is a master of animal communication. You gain Zoophonic Communication feat and Summon Animal spell.',
        source: 'Howl of the Wild',
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

// Alchemist Research Fields - loaded from Foundry VTT data
const ALCHEMIST_RESEARCH_FIELDS: ClassSpecialization[] = [
    convertFoundryFeatToSpecialization(bomberData, 'Alchemist', 'Player Core 2'),
    convertFoundryFeatToSpecialization(chirurgeonData, 'Alchemist', 'Player Core 2'),
    convertFoundryFeatToSpecialization(mutagenistData, 'Alchemist', 'Player Core 2'),
    convertFoundryFeatToSpecialization(toxicologistData, 'Alchemist', 'Player Core 2'),
];

// Psychic Conscious Minds - loaded from Foundry VTT data
const PSYCHIC_CONSCIOUS_MINDS: ClassSpecialization[] = [
    convertFoundryFeatToSpecialization(distantGraspData, 'Psychic', 'Dark Archive'),
    convertFoundryFeatToSpecialization(infiniteEyeData, 'Psychic', 'Dark Archive'),
    convertFoundryFeatToSpecialization(oscillatingWaveData, 'Psychic', 'Dark Archive'),
    convertFoundryFeatToSpecialization(silentWhisperData, 'Psychic', 'Dark Archive'),
    convertFoundryFeatToSpecialization(tangibleDreamData, 'Psychic', 'Dark Archive'),
    convertFoundryFeatToSpecialization(unboundStepData, 'Psychic', 'Dark Archive'),
];

// Kineticist Gates - loaded from Foundry VTT data
const KINETICIST_SINGLE_GATES: ClassSpecialization[] = [
    convertFoundryFeatToSpecialization(airGateData, 'Kineticist', 'Rage of Elements'),
    convertFoundryFeatToSpecialization(earthGateData, 'Kineticist', 'Rage of Elements'),
    convertFoundryFeatToSpecialization(fireGateData, 'Kineticist', 'Rage of Elements'),
    convertFoundryFeatToSpecialization(metalGateData, 'Kineticist', 'Rage of Elements'),
    convertFoundryFeatToSpecialization(waterGateData, 'Kineticist', 'Rage of Elements'),
    convertFoundryFeatToSpecialization(woodGateData, 'Kineticist', 'Rage of Elements'),
];

// Dual Gate uses same options as single gate
const KINETICIST_DUAL_GATES: ClassSpecialization[] = KINETICIST_SINGLE_GATES;

// Kineticist Gate's Threshold Options
const KINETICIST_GATES_THRESHOLD: ClassSpecialization[] = [
    {
        id: 'expand_the_portal',
        name: 'Expand the Portal',
        nameIt: 'Espandi il Portale',
        className: 'Kineticist',
        description: 'Choose a junction from your current element(s).',
        source: 'Rage of Elements',
    },
    {
        id: 'fork_the_path',
        name: 'Fork the Path',
        nameIt: 'Dividi il Sentiero',
        className: 'Kineticist',
        description: 'Choose a new element and gain 1 impulse feat from that element.',
        source: 'Rage of Elements',
    },
];

// Kineticist Junctions - these are chosen with "Expand the Portal" option
const KINETICIST_JUNCTIONS: Record<string, ClassSpecialization[]> = {
    'air': [
        // Base junction (automatically gained with Single Gate)
        {
            id: 'air_impulse_junction',
            name: 'Air Impulse Junction',
            nameIt: 'Air Impulse Junction',
            className: 'Kineticist',
            description: 'Base junction gained with Single Gate. Unlocks your elemental impulses.',
            source: 'Rage of Elements',
        },
        // Gate's Threshold junctions (levels 5, 9, 13, 17)
        {
            id: 'air_gate_aura_junction',
            name: 'Air Gate Junction: Aura Junction',
            nameIt: 'Air Gate Junction: Aura Junction',
            className: 'Kineticist',
            description: 'Impulses that create persistent auras or emanations.',
            source: 'Rage of Elements',
        },
        {
            id: 'air_gate_critical_blast',
            name: 'Air Gate Junction: Critical Blast',
            nameIt: 'Air Gate Junction: Critical Blast',
            className: 'Kineticist',
            description: 'Impulses that modify your blast on a critical hit.',
            source: 'Rage of Elements',
        },
        {
            id: 'air_gate_elemental_resistance',
            name: 'Air Gate Junction: Elemental Resistance',
            nameIt: 'Air Gate Junction: Elemental Resistance',
            className: 'Kineticist',
            description: 'Impulses that provide resistance to your element.',
            source: 'Rage of Elements',
        },
        {
            id: 'air_gate_skill_junction',
            name: 'Air Gate Junction: Skill Junction',
            nameIt: 'Air Gate Junction: Skill Junction',
            className: 'Kineticist',
            description: 'Impulses that enhance skills or skill checks.',
            source: 'Rage of Elements',
        },
    ],
    'earth': [
        // Base junction (automatically gained with Single Gate)
        {
            id: 'earth_impulse_junction',
            name: 'Earth Impulse Junction',
            nameIt: 'Earth Impulse Junction',
            className: 'Kineticist',
            description: 'Base junction gained with Single Gate. Unlocks your elemental impulses.',
            source: 'Rage of Elements',
        },
        // Gate's Threshold junctions (levels 5, 9, 13, 17)
        {
            id: 'earth_gate_aura_junction',
            name: 'Earth Gate Junction: Aura Junction',
            nameIt: 'Earth Gate Junction: Aura Junction',
            className: 'Kineticist',
            description: 'Impulses that create persistent auras or emanations.',
            source: 'Rage of Elements',
        },
        {
            id: 'earth_gate_critical_blast',
            name: 'Earth Gate Junction: Critical Blast',
            nameIt: 'Earth Gate Junction: Critical Blast',
            className: 'Kineticist',
            description: 'Impulses that modify your blast on a critical hit.',
            source: 'Rage of Elements',
        },
        {
            id: 'earth_gate_elemental_resistance',
            name: 'Earth Gate Junction: Elemental Resistance',
            nameIt: 'Earth Gate Junction: Elemental Resistance',
            className: 'Kineticist',
            description: 'Impulses that provide resistance to your element.',
            source: 'Rage of Elements',
        },
        {
            id: 'earth_gate_skill_junction',
            name: 'Earth Gate Junction: Skill Junction',
            nameIt: 'Earth Gate Junction: Skill Junction',
            className: 'Kineticist',
            description: 'Impulses that enhance skills or skill checks.',
            source: 'Rage of Elements',
        },
    ],
    'fire': [
        // Base junction (automatically gained with Single Gate)
        {
            id: 'fire_impulse_junction',
            name: 'Fire Impulse Junction',
            nameIt: 'Fire Impulse Junction',
            className: 'Kineticist',
            description: 'Base junction gained with Single Gate. Unlocks your elemental impulses.',
            source: 'Rage of Elements',
        },
        // Gate's Threshold junctions (levels 5, 9, 13, 17)
        {
            id: 'fire_gate_aura_junction',
            name: 'Fire Gate Junction: Aura Junction',
            nameIt: 'Fire Gate Junction: Aura Junction',
            className: 'Kineticist',
            description: 'Impulses that create persistent auras or emanations.',
            source: 'Rage of Elements',
        },
        {
            id: 'fire_gate_critical_blast',
            name: 'Fire Gate Junction: Critical Blast',
            nameIt: 'Fire Gate Junction: Critical Blast',
            className: 'Kineticist',
            description: 'Impulses that modify your blast on a critical hit.',
            source: 'Rage of Elements',
        },
        {
            id: 'fire_gate_elemental_resistance',
            name: 'Fire Gate Junction: Elemental Resistance',
            nameIt: 'Fire Gate Junction: Elemental Resistance',
            className: 'Kineticist',
            description: 'Impulses that provide resistance to your element.',
            source: 'Rage of Elements',
        },
        {
            id: 'fire_gate_skill_junction',
            name: 'Fire Gate Junction: Skill Junction',
            nameIt: 'Fire Gate Junction: Skill Junction',
            className: 'Kineticist',
            description: 'Impulses that enhance skills or skill checks.',
            source: 'Rage of Elements',
        },
    ],
    'metal': [
        // Base junction (automatically gained with Single Gate)
        {
            id: 'metal_impulse_junction',
            name: 'Metal Impulse Junction',
            nameIt: 'Metal Impulse Junction',
            className: 'Kineticist',
            description: 'Base junction gained with Single Gate. Unlocks your elemental impulses.',
            source: 'Rage of Elements',
        },
        // Gate's Threshold junctions (levels 5, 9, 13, 17)
        {
            id: 'metal_gate_aura_junction',
            name: 'Metal Gate Junction: Aura Junction',
            nameIt: 'Metal Gate Junction: Aura Junction',
            className: 'Kineticist',
            description: 'Impulses that create persistent auras or emanations.',
            source: 'Rage of Elements',
        },
        {
            id: 'metal_gate_critical_blast',
            name: 'Metal Gate Junction: Critical Blast',
            nameIt: 'Metal Gate Junction: Critical Blast',
            className: 'Kineticist',
            description: 'Impulses that modify your blast on a critical hit.',
            source: 'Rage of Elements',
        },
        {
            id: 'metal_gate_elemental_resistance',
            name: 'Metal Gate Junction: Elemental Resistance',
            nameIt: 'Metal Gate Junction: Elemental Resistance',
            className: 'Kineticist',
            description: 'Impulses that provide resistance to your element.',
            source: 'Rage of Elements',
        },
        {
            id: 'metal_gate_skill_junction',
            name: 'Metal Gate Junction: Skill Junction',
            nameIt: 'Metal Gate Junction: Skill Junction',
            className: 'Kineticist',
            description: 'Impulses that enhance skills or skill checks.',
            source: 'Rage of Elements',
        },
    ],
    'water': [
        // Base junction (automatically gained with Single Gate)
        {
            id: 'water_impulse_junction',
            name: 'Water Impulse Junction',
            nameIt: 'Water Impulse Junction',
            className: 'Kineticist',
            description: 'Base junction gained with Single Gate. Unlocks your elemental impulses.',
            source: 'Rage of Elements',
        },
        // Gate's Threshold junctions (levels 5, 9, 13, 17)
        {
            id: 'water_gate_aura_junction',
            name: 'Water Gate Junction: Aura Junction',
            nameIt: 'Water Gate Junction: Aura Junction',
            className: 'Kineticist',
            description: 'Impulses that create persistent auras or emanations.',
            source: 'Rage of Elements',
        },
        {
            id: 'water_gate_critical_blast',
            name: 'Water Gate Junction: Critical Blast',
            nameIt: 'Water Gate Junction: Critical Blast',
            className: 'Kineticist',
            description: 'Impulses that modify your blast on a critical hit.',
            source: 'Rage of Elements',
        },
        {
            id: 'water_gate_elemental_resistance',
            name: 'Water Gate Junction: Elemental Resistance',
            nameIt: 'Water Gate Junction: Elemental Resistance',
            className: 'Kineticist',
            description: 'Impulses that provide resistance to your element.',
            source: 'Rage of Elements',
        },
        {
            id: 'water_gate_skill_junction',
            name: 'Water Gate Junction: Skill Junction',
            nameIt: 'Water Gate Junction: Skill Junction',
            className: 'Kineticist',
            description: 'Impulses that enhance skills or skill checks.',
            source: 'Rage of Elements',
        },
    ],
    'wood': [
        // Base junction (automatically gained with Single Gate)
        {
            id: 'wood_impulse_junction',
            name: 'Wood Impulse Junction',
            nameIt: 'Wood Impulse Junction',
            className: 'Kineticist',
            description: 'Base junction gained with Single Gate. Unlocks your elemental impulses.',
            source: 'Rage of Elements',
        },
        // Gate's Threshold junctions (levels 5, 9, 13, 17)
        {
            id: 'wood_gate_aura_junction',
            name: 'Wood Gate Junction: Aura Junction',
            nameIt: 'Wood Gate Junction: Aura Junction',
            className: 'Kineticist',
            description: 'Impulses that create persistent auras or emanations.',
            source: 'Rage of Elements',
        },
        {
            id: 'wood_gate_critical_blast',
            name: 'Wood Gate Junction: Critical Blast',
            nameIt: 'Wood Gate Junction: Critical Blast',
            className: 'Kineticist',
            description: 'Impulses that modify your blast on a critical hit.',
            source: 'Rage of Elements',
        },
        {
            id: 'wood_gate_elemental_resistance',
            name: 'Wood Gate Junction: Elemental Resistance',
            nameIt: 'Wood Gate Junction: Elemental Resistance',
            className: 'Kineticist',
            description: 'Impulses that provide resistance to your element.',
            source: 'Rage of Elements',
        },
        {
            id: 'wood_gate_skill_junction',
            name: 'Wood Gate Junction: Skill Junction',
            nameIt: 'Wood Gate Junction: Skill Junction',
            className: 'Kineticist',
            description: 'Impulses that enhance skills or skill checks.',
            source: 'Rage of Elements',
        },
    ],
};

// Get the base junction for an element (automatically gained with Single Gate)
export function getBaseJunctionForElement(element: string): string | null {
    const junctions = KINETICIST_JUNCTIONS[element];
    if (junctions && junctions.length > 0) {
        return junctions[0].id; // First junction is the base one (Element Impulse Junction)
    }
    return null;
}

// Inventor Innovations - loaded from Foundry VTT data
const INVENTOR_INNOVATIONS: ClassSpecialization[] = [
    convertFoundryFeatToSpecialization(armorInnovationData, 'Inventor', 'Guns & Gears'),
    convertFoundryFeatToSpecialization(constructInnovationData, 'Inventor', 'Guns & Gears'),
    convertFoundryFeatToSpecialization(weaponInnovationData, 'Inventor', 'Guns & Gears'),
];

// Thaumaturge Implements - loaded from Foundry VTT data
const THAUMATURGE_IMPLEMENTS: ClassSpecialization[] = [
    convertFoundryFeatToSpecialization(amuletData, 'Thaumaturge', 'Dark Archive'),
    convertFoundryFeatToSpecialization(bellData, 'Thaumaturge', 'Dark Archive'),
    convertFoundryFeatToSpecialization(chaliceData, 'Thaumaturge', 'Dark Archive'),
    convertFoundryFeatToSpecialization(lanternData, 'Thaumaturge', 'Dark Archive'),
    convertFoundryFeatToSpecialization(mirrorData, 'Thaumaturge', 'Dark Archive'),
    convertFoundryFeatToSpecialization(regaliaData, 'Thaumaturge', 'Dark Archive'),
    convertFoundryFeatToSpecialization(tomeData, 'Thaumaturge', 'Dark Archive'),
    convertFoundryFeatToSpecialization(wandData, 'Thaumaturge', 'Dark Archive'),
    convertFoundryFeatToSpecialization(weaponData, 'Thaumaturge', 'Dark Archive'),
];

// Wizard Arcane Schools - loaded from Foundry VTT data
const WIZARD_ARCANE_SCHOOLS: ClassSpecialization[] = [
    convertFoundryFeatToSpecialization(elementalSchoolData, 'Wizard', 'Rage of Elements'),
    convertFoundryFeatToSpecialization(schoolOfArsGrammaticaData, 'Wizard', 'Dark Archive'),
    convertFoundryFeatToSpecialization(schoolOfBattleMagicData, 'Wizard', 'Player Core'),
    convertFoundryFeatToSpecialization(schoolOfCivicWizardryData, 'Wizard', 'Player Core'),
    convertFoundryFeatToSpecialization(schoolOfGatesData, 'Wizard', 'Dark Archive'),
    convertFoundryFeatToSpecialization(schoolOfKalistradeData, 'Wizard', 'Player Core'),
    convertFoundryFeatToSpecialization(schoolOfMagicalTechnologiesData, 'Wizard', 'Guns & Gears'),
    convertFoundryFeatToSpecialization(schoolOfMentalismData, 'Wizard', 'Player Core'),
    convertFoundryFeatToSpecialization(schoolOfProteanFormData, 'Wizard', 'Dark Archive'),
    convertFoundryFeatToSpecialization(schoolOfRedMantisMagicData, 'Wizard', 'Player Core'),
    convertFoundryFeatToSpecialization(schoolOfRootedWisdomData, 'Wizard', 'Player Core'),
    convertFoundryFeatToSpecialization(schoolOfTheBoundaryData, 'Wizard', 'Dark Archive'),
    convertFoundryFeatToSpecialization(schoolOfTheReclamationData, 'Wizard', 'Dark Archive'),
    convertFoundryFeatToSpecialization(schoolOfUnifiedMagicalTheoryData, 'Wizard', 'Player Core'),
];

// Wizard Arcane Theses - loaded from Foundry VTT data
const WIZARD_ARCANE_THESES: ClassSpecialization[] = [
    convertFoundryFeatToSpecialization(experimentalSpellshapingData, 'Wizard', 'Player Core'),
    convertFoundryFeatToSpecialization(improvedFamiliarAttunementData, 'Wizard', 'Player Core'),
    convertFoundryFeatToSpecialization(spellBlendingData, 'Wizard', 'Player Core'),
    convertFoundryFeatToSpecialization(spellSubstitutionData, 'Wizard', 'Player Core'),
    convertFoundryFeatToSpecialization(staffNexusData, 'Wizard', 'Player Core'),
];

// Summoner Eidolons - loaded from Foundry VTT data
const SUMMONER_EIDOLONS: ClassSpecialization[] = [
    convertFoundryFeatToSpecialization(angelEidolonData, 'Summoner', 'Secrets of Magic'),
    convertFoundryFeatToSpecialization(angerPhantomEidolonData, 'Summoner', 'Secrets of Magic'),
    convertFoundryFeatToSpecialization(beastEidolonData, 'Summoner', 'Secrets of Magic'),
    convertFoundryFeatToSpecialization(constructEidolonData, 'Summoner', 'Secrets of Magic'),
    convertFoundryFeatToSpecialization(demonEidolonData, 'Summoner', 'Secrets of Magic'),
    convertFoundryFeatToSpecialization(devotionPhantomEidolonData, 'Summoner', 'Secrets of Magic'),
    convertFoundryFeatToSpecialization(dragonEidolonData, 'Summoner', 'Secrets of Magic'),
    convertFoundryFeatToSpecialization(elementalEidolonData, 'Summoner', 'Rage of Elements'),
    convertFoundryFeatToSpecialization(feyEidolonData, 'Summoner', 'Secrets of Magic'),
    convertFoundryFeatToSpecialization(plantEidolonData, 'Summoner', 'Secrets of Magic'),
    convertFoundryFeatToSpecialization(psychopompEidolonData, 'Summoner', 'Secrets of Magic'),
    convertFoundryFeatToSpecialization(undeadEidolonData, 'Summoner', 'Book of the Dead'),
];

// Animist Animistic Practices - loaded from Foundry VTT data
const ANIMIST_ANIMISTIC_PRACTICES: ClassSpecialization[] = [
    convertFoundryFeatToSpecialization(liturgistData, 'Animist', 'War of Immortals'),
    convertFoundryFeatToSpecialization(mediumData, 'Animist', 'War of Immortals'),
    convertFoundryFeatToSpecialization(seerData, 'Animist', 'War of Immortals'),
    convertFoundryFeatToSpecialization(shamanData, 'Animist', 'War of Immortals'),
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
    'Alchemist': [
        {
            id: 'alchemist_research_fields',
            name: 'Research Field',
            nameIt: 'Campo di Ricerca',
            className: 'Alchemist',
            tag: 'alchemist-research-field',
            options: ALCHEMIST_RESEARCH_FIELDS,
        },
    ],
    'Psychic': [
        {
            id: 'psychic_conscious_minds',
            name: 'Conscious Mind',
            nameIt: 'Mente Cosciente',
            className: 'Psychic',
            tag: 'psychic-conscious-mind',
            options: PSYCHIC_CONSCIOUS_MINDS,
        },
    ],
    'Kineticist': [
        {
            id: 'kineticist_single_gate',
            name: 'Single Gate',
            nameIt: 'Cancello Singolo',
            className: 'Kineticist',
            tag: 'kineticist-single-gate',
            options: KINETICIST_SINGLE_GATES,
            maxSelections: 1,
        },
        {
            id: 'kineticist_dual_gate',
            name: 'Dual Gate',
            nameIt: 'Doppio Cancello',
            className: 'Kineticist',
            tag: 'kineticist-dual-gate',
            options: KINETICIST_DUAL_GATES,
            maxSelections: 2,
        },
        {
            id: 'kineticist_gates_threshold',
            name: "Gate's Threshold",
            nameIt: "Soglia del Cancello",
            className: 'Kineticist',
            tag: 'kineticist-gates-threshold',
            options: KINETICIST_GATES_THRESHOLD,
            maxSelections: 1,
        },
    ],
    'Inventor': [
        {
            id: 'inventor_innovations',
            name: 'Innovation',
            nameIt: 'Innovazione',
            className: 'Inventor',
            tag: 'inventor-innovation',
            options: INVENTOR_INNOVATIONS,
        },
    ],
    'Thaumaturge': [
        {
            id: 'thaumaturge_implements',
            name: 'Implement',
            nameIt: 'Strumento',
            className: 'Thaumaturge',
            tag: 'thaumaturge-implement',
            options: THAUMATURGE_IMPLEMENTS,
        },
    ],
    'Wizard': [
        {
            id: 'wizard_arcane_schools',
            name: 'Arcane School',
            nameIt: 'Scuola Arcana',
            className: 'Wizard',
            tag: 'wizard-arcane-school',
            options: WIZARD_ARCANE_SCHOOLS,
        },
        {
            id: 'wizard_arcane_theses',
            name: 'Arcane Thesis',
            nameIt: 'Tesi Arcana',
            className: 'Wizard',
            tag: 'wizard-arcane-thesis',
            options: WIZARD_ARCANE_THESES,
        },
    ],
    'Summoner': [
        {
            id: 'summoner_eidolons',
            name: 'Eidolon',
            nameIt: 'Eidolon',
            className: 'Summoner',
            tag: 'summoner-eidolon',
            options: SUMMONER_EIDOLONS,
        },
    ],
    'Animist': [
        {
            id: 'animist_animistic_practices',
            name: 'Animistic Practice',
            nameIt: 'Pratica Animistica',
            className: 'Animist',
            tag: 'animist-animistic-practice',
            options: ANIMIST_ANIMISTIC_PRACTICES,
        },
    ],
};

// Classes that don't have specializations or have complex/unsupported systems
const _CLASSES_WITHOUT_SPECIALIZATIONS = [
    'Fighter', // No specialization by design
    'Monk', // No specialization by design
    'Guardian', // No specialization by design
    // Newer classes without simple specializations or insufficient data
    'Exemplar', // Requires multi-select system (3 ikons) - see TODO-EXEMPLAR.md
    'Commander', // Requires multi-select system (3 tactics) - see TODO-COMMANDER.md
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

/**
 * Map Kineticist gate IDs to their element traits
 */
export function getKineticistElementFromGateId(gateId: string): string | null {
    // First, try to get the specialization and use its name
    const spec = getSpecializationById(gateId);
    if (spec) {
        const elementMap: Record<string, string> = {
            'air': 'air',
            'earth': 'earth',
            'fire': 'fire',
            'metal': 'metal',
            'water': 'water',
            'wood': 'wood',
        };

        // Check both name and nameIt for element keywords
        const nameToCheck = (spec.nameIt || spec.name).toLowerCase();
        for (const [element, trait] of Object.entries(elementMap)) {
            if (nameToCheck.includes(element)) {
                return trait;
            }
        }
    }

    // Fallback: try to match by element name in the ID
    const elementMap: Record<string, string> = {
        'air': 'air',
        'earth': 'earth',
        'fire': 'fire',
        'metal': 'metal',
        'water': 'water',
        'wood': 'wood',
    };

    const lowerId = gateId.toLowerCase();
    for (const [element, trait] of Object.entries(elementMap)) {
        if (lowerId.includes(element)) {
            return trait;
        }
    }

    return null;
}

/**
 * Get junctions for a specific Kineticist element
 */
export function getKineticistJunctionsForElement(element: string): ClassSpecialization[] {
    return KINETICIST_JUNCTIONS[element] || [];
}
