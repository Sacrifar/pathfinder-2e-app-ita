/**
 * Pets & Companions Data
 * Definitions for Familiars, Animal Companions, and Eidolons
 */

import { PetAbility, PetAttack, Speed, Pet, FamiliarData, AnimalCompanionData, EidolonData } from '../types/character';

// ============ Familiar Abilities ============

export const familiarAbilities: PetAbility[] = [
    {
        id: 'fam-babble',
        name: 'Babble',
        nameIt: 'Borbottio',
        description: 'Your familiar can communicate with you and your allies. It can understand and speak languages you know.',
        descriptionIt: 'Il tuo famiglio può comunicare con te e i tuoi alleati. Può capire e parlare le lingue che conosci.',
        type: 'passive'
    },
    {
        id: 'fam-mage-hand',
        name: 'Mage Hand',
        nameIt: 'Mano del Mago',
        description: 'Your familiar can use mage hand at will as a 1-action spell with the concentrate trait.',
        descriptionIt: 'Il tuo famiglio può usare mano del mago a volontà come incantesimo di 1 azione con il tratto concentrarsi.',
        type: 'action',
        actionCost: 1
    },
    {
        id: 'fam-labrador',
        name: 'Labrador',
        nameIt: 'Labrador',
        description: 'Your familiar can deliver items to you or others within 30 feet.',
        descriptionIt: 'Il tuo famiglio può consegnare oggetti a te o ad altri entro 9 metri.',
        type: 'free'
    },
    {
        id: 'fam-draw-from-hat',
        name: 'Draw from Hat',
        nameIt: 'Estrarre dal Cappello',
        description: 'Your familiar can pull items from your hat or other container.',
        descriptionIt: 'Il tuo famiglio può estrarre oggetti dal tuo cappello o altro contenitore.',
        type: 'free'
    },
    {
        id: 'fam-embarrassing-secret',
        name: 'Embarrassing Secret',
        nameIt: 'Segreto Imbarazzante',
        description: 'Your familiar knows an embarrassing secret about a creature it can see. It can communicate this to you.',
        descriptionIt: 'Il tuo famiglio conosce un segreto imbarazzante su una creatura che può vedere. Può comunicartelo.',
        type: 'passive'
    },
    {
        id: 'fam-scent',
        name: 'Scent',
        nameIt: 'Olfatto',
        description: 'Your familiar gains imprecise smell with a range of 30 feet.',
        descriptionIt: 'Il tuo famiglio guadagna olfatto impreciso con portata di 9 metri.',
        type: 'passive'
    },
    {
        id: 'fam-skilled',
        name: 'Skilled',
        nameIt: 'Abile',
        description: 'Your familiar becomes trained in one skill of your choice.',
        descriptionIt: 'Il tuo famiglio diventa addestrato in un\'abilità a tua scelta.',
        type: 'passive'
    },
    {
        id: 'fam-quick-cache',
        name: 'Quick Cache',
        nameIt: 'Riposto Rapido',
        description: 'Your familiar can store up to 1 Bulk of items for you.',
        descriptionIt: 'Il tuo famiglio può immagazzinare fino a 1 Ingombro di oggetti per te.',
        type: 'passive'
    }
];

// ============ Animal Companion Types ============

interface AnimalCompanionTemplate {
    id: string;
    name: string;
    nameIt: string;
    size: 'tiny' | 'small' | 'medium' | 'large';
    speed: Speed;
    startingHP: number;
    baseAC: number;
    attacks: PetAttack[];
    specialAbilities: PetAbility[];
}

export const animalCompanionTemplates: AnimalCompanionTemplate[] = [
    {
        id: 'wolf',
        name: 'Wolf',
        nameIt: 'Lupo',
        size: 'medium',
        speed: { land: 40 },
        startingHP: 8,
        baseAC: 18,
        attacks: [
            {
                name: 'Jaws',
                actionCost: 1,
                attackBonus: 7,
                damage: '1d8+3',
                damageType: 'piercing',
                traits: ['agile']
            }
        ],
        specialAbilities: [
            {
                id: 'ac-wolf-scent',
                name: 'Scent',
                nameIt: 'Olfatto',
                description: 'Imprecise scent 30 feet.',
                descriptionIt: 'Olfatto impreciso 9 metri.',
                type: 'passive'
            },
            {
                id: 'ac-wolf-pack-attack',
                name: 'Pack Attack',
                nameIt: 'Attacco di Branco',
                description: 'Deal 1d4 extra damage to a creature if at least one ally threatens the target.',
                descriptionIt: 'Infliggi 1d4 danni extra a una creatura se almeno un alleato minaccia il bersaglio.',
                type: 'passive'
            }
        ]
    },
    {
        id: 'bear',
        name: 'Bear',
        nameIt: 'Orso',
        size: 'large',
        speed: { land: 35, swim: 20 },
        startingHP: 10,
        baseAC: 17,
        attacks: [
            {
                name: 'Jaws',
                actionCost: 1,
                attackBonus: 7,
                damage: '2d6+3',
                damageType: 'piercing',
                traits: ['reach-10']
            },
            {
                name: 'Claws',
                actionCost: 1,
                attackBonus: 7,
                damage: '2d4+3',
                damageType: 'slashing',
                traits: ['agile']
            }
        ],
        specialAbilities: [
            {
                id: 'ac-bear-scent',
                name: 'Scent',
                nameIt: 'Olfatto',
                description: 'Imprecise scent 30 feet.',
                descriptionIt: 'Olfatto impreciso 9 metri.',
                type: 'passive'
            },
            {
                id: 'ac-bear-cub-enclosure',
                name: 'Cub Enclosure',
                nameIt: 'Recinto per Orsacchiotti',
                description: 'A Large bear can serve as a mount for a Medium or smaller creature.',
                descriptionIt: 'Un orso Grande può servire come cavalcatura per una creatura Media o più piccola.',
                type: 'passive'
            }
        ]
    },
    {
        id: 'bird',
        name: 'Bird',
        nameIt: 'Uccello',
        size: 'small',
        speed: { land: 10, fly: 40 },
        startingHP: 6,
        baseAC: 19,
        attacks: [
            {
                name: 'Beak',
                actionCost: 1,
                attackBonus: 8,
                damage: '1d6+1',
                damageType: 'piercing',
                traits: ['finesse']
            }
        ],
        specialAbilities: [
            {
                id: 'ac-bird-flight',
                name: 'Flight',
                nameIt: 'Volo',
                description: 'Can fly at its full fly speed.',
                descriptionIt: 'Può volare alla sua massima velocità di volo.',
                type: 'passive'
            },
            {
                id: 'ac-bird-scavenger',
                name: 'Scavenger',
                nameIt: 'Spazzino',
                description: 'Can forage for food in urban environments.',
                descriptionIt: 'Può cercare cibo in ambienti urbani.',
                type: 'passive'
            }
        ]
    },
    {
        id: 'cat',
        name: 'Cat',
        nameIt: 'Gatto',
        size: 'small',
        speed: { land: 30 },
        startingHP: 6,
        baseAC: 20,
        attacks: [
            {
                name: 'Claws',
                actionCost: 1,
                attackBonus: 8,
                damage: '1d4+1',
                damageType: 'slashing',
                traits: ['agile', 'finesse']
            }
        ],
        specialAbilities: [
            {
                id: 'ac-cat-quiet',
                name: 'Quiet',
                nameIt: 'Silenzioso',
                description: 'Your cat companion gains a +2 circumstance bonus to Stealth checks.',
                descriptionIt: 'Il tuo gatto guadagna un bonus circostanziale di +2 ai tiri per nascondersi.',
                type: 'passive'
            },
            {
                id: 'ac-cat-scent',
                name: 'Scent',
                nameIt: 'Olfatto',
                description: 'Imprecise scent 30 feet.',
                descriptionIt: 'Olfatto impreciso 9 metri.',
                type: 'passive'
            }
        ]
    },
    {
        id: 'horse',
        name: 'Horse',
        nameIt: 'Cavallo',
        size: 'large',
        speed: { land: 40 },
        startingHP: 8,
        baseAC: 18,
        attacks: [
            {
                name: 'Hooves',
                actionCost: 1,
                attackBonus: 7,
                damage: '1d6+3',
                damageType: 'bludgeoning',
                traits: []
            }
        ],
        specialAbilities: [
            {
                id: 'ac-horse-mount',
                name: 'Mount',
                nameIt: 'Cavalcatura',
                description: 'Can serve as a mount for a Medium or smaller creature.',
                descriptionIt: 'Può servire come cavalcatura per una creatura Media o più piccola.',
                type: 'passive'
            },
            {
                id: 'ac-horse-gallop',
                name: 'Gallop',
                nameIt: 'Galoppo',
                description: 'Can move at twice its speed with a -2 penalty to AC.',
                descriptionIt: 'Può muoversi al doppio della sua velocità con una penalità di -2 alla CA.',
                type: 'action',
                actionCost: 2
            }
        ]
    },
    {
        id: 'snake',
        name: 'Snake',
        nameIt: 'Serpente',
        size: 'small',
        speed: { land: 20, swim: 20, climb: 20 },
        startingHP: 6,
        baseAC: 19,
        attacks: [
            {
                name: 'Fangs',
                actionCost: 1,
                attackBonus: 8,
                damage: '1d4+1',
                damageType: 'piercing',
                traits: ['finesse', 'grapple']
            }
        ],
        specialAbilities: [
            {
                id: 'ac-snake-scent',
                name: 'Scent',
                nameIt: 'Olfatto',
                description: 'Imprecise scent 30 feet.',
                descriptionIt: 'Olfatto impreciso 9 metri.',
                type: 'passive'
            },
            {
                id: 'ac-snake-venom',
                name: 'Venomous',
                nameIt: 'Velenoso',
                description: 'On a critical hit, the snake applies its venom (1d6 poison damage, onset 1 minute, 3 rounds).',
                descriptionIt: 'Su un colpo critico, il serpente applica il suo veleno (1d6 danni avvelenati, insorgenza 1 minuto, 3 round).',
                type: 'passive'
            }
        ]
    }
];

// ============ Eidolon Types ============

interface EidolonTemplate {
    id: string;
    name: string;
    nameIt: string;
    size: 'medium' | 'large';
    speed: Speed;
    startingHP: number;
    baseAC: number;
    attacks: PetAttack[];
    evolutionPoints: number;
}

export const eidolonTemplates: EidolonTemplate[] = [
    {
        id: 'angel',
        name: 'Angel',
        nameIt: 'Angelo',
        size: 'medium',
        speed: { land: 25, fly: 50 },
        startingHP: 10,
        baseAC: 18,
        attacks: [
            {
                name: 'Glowing Strike',
                actionCost: 1,
                attackBonus: 8,
                damage: '1d8+3',
                damageType: 'holy',
                traits: ['holy']
            },
            {
                name: 'Divine Lance',
                actionCost: 2,
                attackBonus: 8,
                damage: '2d6',
                damageType: 'holy',
                traits: ['holy', 'range-60']
            }
        ],
        evolutionPoints: 5
    },
    {
        id: 'demon',
        name: 'Demon',
        nameIt: 'Demone',
        size: 'large',
        speed: { land: 30 },
        startingHP: 12,
        baseAC: 17,
        attacks: [
            {
                name: 'Claws',
                actionCost: 1,
                attackBonus: 7,
                damage: '2d6+3',
                damageType: 'slashing',
                traits: ['chaotic']
            },
            {
                name: 'Gore',
                actionCost: 1,
                attackBonus: 7,
                damage: '2d8+3',
                damageType: 'piercing',
                traits: ['chaotic']
            }
        ],
        evolutionPoints: 5
    },
    {
        id: 'elemental',
        name: 'Elemental',
        nameIt: 'Elementale',
        size: 'medium',
        speed: { land: 25, fly: 50, earth: 25 },
        startingHP: 10,
        baseAC: 17,
        attacks: [
            {
                name: 'Elemental Fist',
                actionCost: 1,
                attackBonus: 7,
                damage: '2d4+3',
                damageType: 'bludgeoning',
                traits: ['nonlethal']
            }
        ],
        evolutionPoints: 5
    },
    {
        id: 'phantom',
        name: 'Phantom',
        nameIt: 'Fantasma',
        size: 'medium',
        speed: { land: 25, fly: 30, incorporeal: 30 },
        startingHP: 9,
        baseAC: 18,
        attacks: [
            {
                name: 'Ghostly Touch',
                actionCost: 1,
                attackBonus: 8,
                damage: '1d8+3',
                damageType: 'negative',
                traits: ['incorporeal']
            }
        ],
        evolutionPoints: 5
    },
    {
        id: 'dragon',
        name: 'Dragon',
        nameIt: 'Drago',
        size: 'large',
        speed: { land: 35, fly: 50 },
        startingHP: 12,
        baseAC: 18,
        attacks: [
            {
                name: 'Jaws',
                actionCost: 1,
                attackBonus: 7,
                damage: '2d8+3',
                damageType: 'piercing',
                traits: ['reach-10']
            },
            {
                name: 'Claws',
                actionCost: 1,
                attackBonus: 7,
                damage: '2d6+3',
                damageType: 'slashing',
                traits: ['agile']
            }
        ],
        evolutionPoints: 5
    }
];

// ============ Eidolon Evolutions ============

export const eidolonEvolutions: PetAbility[] = [
    {
        id: 'evo-resistance-energy',
        name: 'Energy Resistance',
        nameIt: 'Resistenza agli Elementi',
        description: 'Gain resistance 5 to acid, cold, electricity, or fire.',
        descriptionIt: 'Guadagna resistenza 5 ad acido, freddo, elettricità o fuoco.',
        type: 'passive'
    },
    {
        id: 'evo-telepathy',
        name: 'Telepathy',
        nameIt: 'Telepatia',
        description: 'Communicate telepathically with any creature within 100 feet that knows a language.',
        descriptionIt: 'Comunica telepaticamente con qualsiasi creatura entro 30 metri che conosca una lingua.',
        type: 'passive'
    },
    {
        id: 'evo-athletics',
        name: 'Athletic',
        nameIt: 'Atletico',
        description: '+2 competence bonus to Athletics checks.',
        descriptionIt: '+2 bonus di competenza ai tiri di Atletica.',
        type: 'passive'
    },
    {
        id: 'evo-acrobatics',
        name: 'Acrobatic',
        nameIt: 'Acrobatico',
        description: '+2 competence bonus to Acrobatics checks.',
        descriptionIt: '+2 bonus di competenza ai tiri di Acrobazia.',
        type: 'passive'
    },
    {
        id: 'evo-weapon-finesse',
        name: 'Weapon Finesse',
        nameIt: 'Finezza Arma',
        description: 'Use Dex modifier instead of Str for attack rolls with one melee weapon.',
        descriptionIt: 'Usa il modificatore di Des invece di For per i tiri di attacco con un\'arma corpo a corpo.',
        type: 'passive'
    },
    {
        id: 'evo-power-attack',
        name: 'Power Attack',
        nameIt: 'Attacco Potente',
        description: '2 actions. Make a melee Strike. This counts as two attacks for your multiple attack penalty.',
        descriptionIt: '2 azioni. Effettua un Colpo corpo a corpo. Questo conta come due attacchi per la tua penalità di attacco multiplo.',
        type: 'action',
        actionCost: 2
    }
];

// ============ Utility Functions ============

/**
 * Calculate stats for an animal companion based on master's level
 */
export function calculateAnimalCompanionStats(
    template: AnimalCompanionTemplate,
    masterLevel: number,
    conMod: number
): Omit<AnimalCompanionData, 'companionType'> {
    const companionLevel = Math.max(1, masterLevel - 1);
    const hp = template.startingHP + companionLevel * 8 + conMod;
    const acBonus = Math.floor(companionLevel / 4);

    return {
        size: template.size,
        level: companionLevel,
        hitPoints: {
            current: hp,
            max: hp
        },
        armorClass: template.baseAC + acBonus,
        attacks: template.attacks.map(a => ({
            ...a,
            attackBonus: a.attackBonus + companionLevel
        })),
        specialAbilities: template.specialAbilities,
        perception: 5 + companionLevel,
        Fortitude: 'expert',
        reflex: 'expert',
        will: 'trained',
        speed: template.speed
    };
}

/**
 * Calculate stats for an eidolon based on summoner's level
 */
export function calculateEidolonStats(
    template: EidolonTemplate,
    summonerLevel: number,
    conMod: number
): Omit<EidolonData, 'type'> {
    const hp = template.startingHP + summonerLevel * 8 + conMod;
    const acBonus = Math.floor(summonerLevel / 4);

    return {
        size: template.size,
        level: summonerLevel,
        hitPoints: {
            current: hp,
            max: hp
        },
        sharesHP: false, // Can be toggled by feat
        armorClass: template.baseAC + acBonus,
        attacks: template.attacks.map(a => ({
            ...a,
            attackBonus: a.attackBonus + summonerLevel
        })),
        evolutionPoints: template.evolutionPoints + Math.floor(summonerLevel / 2),
        selectedEvolutions: [],
        perception: 5 + summonerLevel,
        saves: {
            fortitude: 'expert',
            reflex: 'expert',
            will: 'expert'
        },
        speed: template.speed,
        actTogetherUsed: false
    };
}

/**
 * Create a new familiar pet
 */
export function createFamiliar(name: string, selectedAbilities: string[] = []): Pet {
    return {
        id: crypto.randomUUID(),
        name,
        type: 'familiar',
        data: {
            abilities: familiarAbilities,
            selectedAbilities: selectedAbilities.slice(0, 2) // Start with 2 abilities
        } as FamiliarData
    };
}

/**
 * Create a new animal companion pet
 */
export function createAnimalCompanion(
    name: string,
    templateId: string,
    masterLevel: number,
    conMod: number
): Pet {
    const template = animalCompanionTemplates.find(t => t.id === templateId);
    if (!template) {
        throw new Error(`Animal companion template "${templateId}" not found`);
    }

    const stats = calculateAnimalCompanionStats(template, masterLevel, conMod);

    return {
        id: crypto.randomUUID(),
        name,
        type: 'animal-companion',
        data: {
            companionType: templateId,
            ...stats
        } as AnimalCompanionData
    };
}

/**
 * Create a new eidolon pet
 */
export function createEidolon(
    name: string,
    templateId: string,
    summonerLevel: number,
    conMod: number
): Pet {
    const template = eidolonTemplates.find(t => t.id === templateId);
    if (!template) {
        throw new Error(`Eidolon template "${templateId}" not found`);
    }

    const stats = calculateEidolonStats(template, summonerLevel, conMod);

    return {
        id: crypto.randomUUID(),
        name,
        type: 'eidolon',
        data: {
            type: templateId,
            ...stats
        } as EidolonData
    };
}

/**
 * Scale pet stats when master levels up
 */
export function scalePetOnLevelUp(pet: Pet, newMasterLevel: number, conMod: number): Pet {
    if (pet.type === 'animal-companion') {
        const data = pet.data as AnimalCompanionData;
        const template = animalCompanionTemplates.find(t => t.id === data.companionType);
        if (template) {
            const newStats = calculateAnimalCompanionStats(template, newMasterLevel, conMod);
            // Preserve current HP ratio
            const hpRatio = data.hitPoints.current / data.hitPoints.max;
            newStats.hitPoints.current = Math.round(newStats.hitPoints.max * hpRatio);

            return {
                ...pet,
                data: {
                    ...data,
                    ...newStats
                }
            };
        }
    } else if (pet.type === 'eidolon') {
        const data = pet.data as EidolonData;
        const template = eidolonTemplates.find(t => t.id === data.type);
        if (template) {
            const newStats = calculateEidolonStats(template, newMasterLevel, conMod);
            // Preserve current HP ratio and selected evolutions
            const hpRatio = data.hitPoints.current / data.hitPoints.max;
            newStats.hitPoints.current = Math.round(newStats.hitPoints.max * hpRatio);
            newStats.selectedEvolutions = data.selectedEvolutions;

            return {
                ...pet,
                data: {
                    ...data,
                    ...newStats
                }
            };
        }
    }

    return pet;
}

// ============ Getters ============

export function getFamiliarAbilities(): PetAbility[] {
    return familiarAbilities;
}

export function getAnimalCompanionTemplates(): AnimalCompanionTemplate[] {
    return animalCompanionTemplates;
}

export function getEidolonTemplates(): EidolonTemplate[] {
    return eidolonTemplates;
}

export function getEidolonEvolutions(): PetAbility[] {
    return eidolonEvolutions;
}

export function getAnimalCompanionById(id: string): AnimalCompanionTemplate | undefined {
    return animalCompanionTemplates.find(t => t.id === id);
}

export function getEidolonById(id: string): EidolonTemplate | undefined {
    return eidolonTemplates.find(t => t.id === id);
}
