/**
 * Pathfinder 2e Core Classes (Remastered)
 */

import type { ClassDef } from '../types';

export const classes: ClassDef[] = [
    {
        id: 'fighter',
        name: 'Fighter',
        nameIt: 'Guerriero',
        description: 'Fighting for honor, greed, loyalty, or simply the thrill of battle, you are an undisputed master of weaponry and combat techniques.',
        descriptionIt: 'Combattendo per onore, avidità, lealtà o semplicemente per il brivido della battaglia, sei un maestro indiscusso delle armi e delle tecniche di combattimento.',
        source: { book: 'Player Core', page: 140 },
        rarity: 'common',
        traits: [],
        keyAbility: ['str', 'dex'],
        hitPoints: 10,
        perception: 'expert',
        fortitude: 'expert',
        reflex: 'expert',
        will: 'trained',
        skills: {
            trained: ['Acrobatics', 'Athletics'],
            additionalTrainedSkills: 3
        },
        attacks: {
            simple: 'expert',
            martial: 'expert',
            advanced: 'trained',
            unarmed: 'expert'
        },
        defenses: {
            unarmored: 'trained',
            light: 'trained',
            medium: 'trained',
            heavy: 'trained'
        },
        classDC: 'trained',
        features: [
            {
                level: 1,
                name: 'Attack of Opportunity',
                nameIt: 'Attacco di Opportunità',
                description: 'You\'ve practiced reactions to strike when foes lower their guard. You can use Attack of Opportunity.',
                descriptionIt: 'Hai praticato reazioni per colpire quando i nemici abbassano la guardia. Puoi usare Attacco di Opportunità.'
            },
            {
                level: 1,
                name: 'Shield Block',
                nameIt: 'Blocco con Scudo',
                description: 'You gain the Shield Block reaction.',
                descriptionIt: 'Ottieni la reazione Blocco con Scudo.'
            }
        ]
    },
    {
        id: 'wizard',
        name: 'Wizard',
        nameIt: 'Mago',
        description: 'You study the secrets of arcane magic, seeking to understand its nature through careful study and experimentation.',
        descriptionIt: 'Studi i segreti della magia arcana, cercando di comprenderne la natura attraverso studio attento e sperimentazione.',
        source: { book: 'Player Core', page: 198 },
        rarity: 'common',
        traits: [],
        keyAbility: 'int',
        hitPoints: 6,
        perception: 'trained',
        fortitude: 'trained',
        reflex: 'trained',
        will: 'expert',
        skills: {
            trained: ['Arcana'],
            additionalTrainedSkills: 2
        },
        attacks: {
            simple: 'trained',
            martial: 'untrained',
            advanced: 'untrained',
            unarmed: 'trained'
        },
        defenses: {
            unarmored: 'trained',
            light: 'untrained',
            medium: 'untrained',
            heavy: 'untrained'
        },
        classDC: 'trained',
        spellcasting: {
            tradition: 'arcane',
            type: 'prepared',
            ability: 'int'
        },
        features: [
            {
                level: 1,
                name: 'Arcane Spellcasting',
                nameIt: 'Incantesimi Arcani',
                description: 'You can cast arcane spells using your spellbook and the Cast a Spell activity.',
                descriptionIt: 'Puoi lanciare incantesimi arcani usando il tuo libro degli incantesimi e l\'attività Lanciare un Incantesimo.'
            },
            {
                level: 1,
                name: 'Arcane School',
                nameIt: 'Scuola Arcana',
                description: 'You specialize in a school of magic, gaining a focus spell.',
                descriptionIt: 'Ti specializzi in una scuola di magia, ottenendo un incantesimo di focalizzazione.'
            }
        ]
    },
    {
        id: 'cleric',
        name: 'Cleric',
        nameIt: 'Chierico',
        description: 'Deities work their will upon the world in infinite ways, and you serve as one of their most stalwart mortal servants.',
        descriptionIt: 'Le divinità esercitano la loro volontà sul mondo in infiniti modi, e tu servi come uno dei loro più fedeli servitori mortali.',
        source: { book: 'Player Core', page: 118 },
        rarity: 'common',
        traits: [],
        keyAbility: 'wis',
        hitPoints: 8,
        perception: 'trained',
        fortitude: 'trained',
        reflex: 'trained',
        will: 'expert',
        skills: {
            trained: ['Religion'],
            additionalTrainedSkills: 2
        },
        attacks: {
            simple: 'trained',
            martial: 'untrained',
            advanced: 'untrained',
            unarmed: 'trained'
        },
        defenses: {
            unarmored: 'trained',
            light: 'trained',
            medium: 'untrained',
            heavy: 'untrained'
        },
        classDC: 'trained',
        spellcasting: {
            tradition: 'divine',
            type: 'prepared',
            ability: 'wis'
        },
        features: [
            {
                level: 1,
                name: 'Divine Spellcasting',
                nameIt: 'Incantesimi Divini',
                description: 'You can cast divine spells using the Cast a Spell activity.',
                descriptionIt: 'Puoi lanciare incantesimi divini usando l\'attività Lanciare un Incantesimo.'
            },
            {
                level: 1,
                name: 'Divine Font',
                nameIt: 'Fonte Divina',
                description: 'You gain additional heal or harm spells based on your deity.',
                descriptionIt: 'Ottieni incantesimi guarire o ferire aggiuntivi in base alla tua divinità.'
            }
        ]
    },
    {
        id: 'rogue',
        name: 'Rogue',
        nameIt: 'Ladro',
        description: 'You are skilled and opportunistic. Using your sharp wits and quick reactions, you take advantage of your opponents\' missteps.',
        descriptionIt: 'Sei abile e opportunista. Usando la tua arguzia e i tuoi riflessi rapidi, approfitti degli errori dei tuoi avversari.',
        source: { book: 'Player Core', page: 178 },
        rarity: 'common',
        traits: [],
        keyAbility: ['dex', 'int', 'cha'],
        hitPoints: 8,
        perception: 'expert',
        fortitude: 'trained',
        reflex: 'expert',
        will: 'expert',
        skills: {
            trained: ['Stealth'],
            additionalTrainedSkills: 7
        },
        attacks: {
            simple: 'trained',
            martial: 'trained',
            advanced: 'untrained',
            unarmed: 'trained'
        },
        defenses: {
            unarmored: 'trained',
            light: 'trained',
            medium: 'untrained',
            heavy: 'untrained'
        },
        classDC: 'trained',
        features: [
            {
                level: 1,
                name: 'Sneak Attack',
                nameIt: 'Attacco Furtivo',
                description: 'When your enemy can\'t properly defend themselves, you take advantage. Deal 1d6 extra precision damage to flat-footed creatures.',
                descriptionIt: 'Quando il tuo nemico non può difendersi adeguatamente, ne approfitti. Infliggi 1d6 danni di precisione extra alle creature colte alla sprovvista.'
            },
            {
                level: 1,
                name: 'Surprise Attack',
                nameIt: 'Attacco a Sorpresa',
                description: 'You strike first and hard. On the first round of combat, creatures that haven\'t acted are flat-footed to you.',
                descriptionIt: 'Colpisci per primo e duramente. Nel primo round di combattimento, le creature che non hanno ancora agito sono colte alla sprovvista nei tuoi confronti.'
            }
        ]
    },
    {
        id: 'bard',
        name: 'Bard',
        nameIt: 'Bardo',
        description: 'You are a master of artistry, a scholar of hidden secrets, and a captivating persuader.',
        descriptionIt: 'Sei un maestro dell\'arte, uno studioso di segreti nascosti e un persuasore affascinante.',
        source: { book: 'Player Core', page: 96 },
        rarity: 'common',
        traits: [],
        keyAbility: 'cha',
        hitPoints: 8,
        perception: 'expert',
        fortitude: 'trained',
        reflex: 'trained',
        will: 'expert',
        skills: {
            trained: ['Occultism', 'Performance'],
            additionalTrainedSkills: 4
        },
        attacks: {
            simple: 'trained',
            martial: 'trained',
            advanced: 'untrained',
            unarmed: 'trained'
        },
        defenses: {
            unarmored: 'trained',
            light: 'trained',
            medium: 'untrained',
            heavy: 'untrained'
        },
        classDC: 'trained',
        spellcasting: {
            tradition: 'occult',
            type: 'spontaneous',
            ability: 'cha'
        },
        features: [
            {
                level: 1,
                name: 'Occult Spellcasting',
                nameIt: 'Incantesimi Occulti',
                description: 'You can cast occult spells using the Cast a Spell activity.',
                descriptionIt: 'Puoi lanciare incantesimi occulti usando l\'attività Lanciare un Incantesimo.'
            },
            {
                level: 1,
                name: 'Composition Spells',
                nameIt: 'Composizioni',
                description: 'You can compose inspiring music or poems. You gain the Inspire Courage composition cantrip.',
                descriptionIt: 'Puoi comporre musica o poesie ispiratrici. Ottieni il trucchetto di composizione Ispirare Coraggio.'
            }
        ]
    },
    {
        id: 'ranger',
        name: 'Ranger',
        nameIt: 'Ranger',
        description: 'You are a master of weaponry and hunting techniques, unparalleled in the wild.',
        descriptionIt: 'Sei un maestro delle armi e delle tecniche di caccia, senza pari nella natura selvaggia.',
        source: { book: 'Player Core', page: 166 },
        rarity: 'common',
        traits: [],
        keyAbility: ['str', 'dex'],
        hitPoints: 10,
        perception: 'expert',
        fortitude: 'expert',
        reflex: 'expert',
        will: 'trained',
        skills: {
            trained: ['Nature', 'Survival'],
            additionalTrainedSkills: 4
        },
        attacks: {
            simple: 'trained',
            martial: 'trained',
            advanced: 'untrained',
            unarmed: 'trained'
        },
        defenses: {
            unarmored: 'trained',
            light: 'trained',
            medium: 'trained',
            heavy: 'untrained'
        },
        classDC: 'trained',
        features: [
            {
                level: 1,
                name: 'Hunt Prey',
                nameIt: 'Cacciare la Preda',
                description: 'You designate a single creature as your prey and focus your attacks on it.',
                descriptionIt: 'Designi una singola creatura come tua preda e concentri i tuoi attacchi su di essa.'
            },
            {
                level: 1,
                name: 'Hunter\'s Edge',
                nameIt: 'Vantaggio del Cacciatore',
                description: 'You have trained for challenges by adopting a hunter\'s edge.',
                descriptionIt: 'Ti sei allenato per le sfide adottando un vantaggio del cacciatore.'
            }
        ]
    },
    {
        id: 'druid',
        name: 'Druid',
        nameIt: 'Druido',
        description: 'The power of nature is impossible to resist. It can bring ruin to the stoutest fortress or cause even the most arid desert to bloom with life.',
        descriptionIt: 'Il potere della natura è impossibile da resistere. Può portare rovina alla fortezza più robusta o far fiorire anche il deserto più arido.',
        source: { book: 'Player Core', page: 130 },
        rarity: 'common',
        traits: [],
        keyAbility: 'wis',
        hitPoints: 8,
        perception: 'trained',
        fortitude: 'trained',
        reflex: 'trained',
        will: 'expert',
        skills: {
            trained: ['Nature'],
            additionalTrainedSkills: 2
        },
        attacks: {
            simple: 'trained',
            martial: 'untrained',
            advanced: 'untrained',
            unarmed: 'trained'
        },
        defenses: {
            unarmored: 'trained',
            light: 'trained',
            medium: 'trained',
            heavy: 'untrained'
        },
        classDC: 'trained',
        spellcasting: {
            tradition: 'primal',
            type: 'prepared',
            ability: 'wis'
        },
        features: [
            {
                level: 1,
                name: 'Primal Spellcasting',
                nameIt: 'Incantesimi Primevi',
                description: 'The power of the wild world flows through you. You can cast primal spells.',
                descriptionIt: 'Il potere del mondo selvaggio scorre attraverso di te. Puoi lanciare incantesimi primevi.'
            },
            {
                level: 1,
                name: 'Druidic Order',
                nameIt: 'Ordine Druidico',
                description: 'You have entered a druidic order, shaping your magic and granting you a focus spell.',
                descriptionIt: 'Sei entrato in un ordine druidico, che modella la tua magia e ti conferisce un incantesimo di focalizzazione.'
            }
        ]
    },
    {
        id: 'monk',
        name: 'Monk',
        nameIt: 'Monaco',
        description: 'The strength of your fist flows from your mind and spirit. You seek perfection through physical training.',
        descriptionIt: 'La forza del tuo pugno sgorga dalla tua mente e dal tuo spirito. Cerchi la perfezione attraverso l\'allenamento fisico.',
        source: { book: 'Player Core', page: 154 },
        rarity: 'common',
        traits: [],
        keyAbility: ['str', 'dex'],
        hitPoints: 10,
        perception: 'trained',
        fortitude: 'expert',
        reflex: 'expert',
        will: 'expert',
        skills: {
            trained: [],
            additionalTrainedSkills: 4
        },
        attacks: {
            simple: 'trained',
            martial: 'untrained',
            advanced: 'untrained',
            unarmed: 'expert'
        },
        defenses: {
            unarmored: 'expert',
            light: 'untrained',
            medium: 'untrained',
            heavy: 'untrained'
        },
        classDC: 'trained',
        features: [
            {
                level: 1,
                name: 'Flurry of Blows',
                nameIt: 'Raffica di Colpi',
                description: 'You can attack rapidly with fists, with flurry of blows.',
                descriptionIt: 'Puoi attaccare rapidamente con i pugni, con raffica di colpi.'
            },
            {
                level: 1,
                name: 'Powerful Fist',
                nameIt: 'Pugno Potente',
                description: 'You know how to wield your fists as deadly weapons. Your fist unarmed attacks deal 1d6 damage.',
                descriptionIt: 'Sai come usare i tuoi pugni come armi letali. I tuoi attacchi senz\'armi con i pugni infliggono 1d6 danni.'
            }
        ]
    },
    {
        id: 'champion',
        name: 'Champion',
        nameIt: 'Campione',
        description: 'You are an emissary of a deity, chosen to further their divine cause.',
        descriptionIt: 'Sei un emissario di una divinità, scelto per portare avanti la loro causa divina.',
        source: { book: 'Player Core', page: 106 },
        rarity: 'common',
        traits: [],
        keyAbility: ['str', 'dex'],
        hitPoints: 10,
        perception: 'trained',
        fortitude: 'expert',
        reflex: 'trained',
        will: 'expert',
        skills: {
            trained: ['Religion'],
            additionalTrainedSkills: 2
        },
        attacks: {
            simple: 'trained',
            martial: 'trained',
            advanced: 'untrained',
            unarmed: 'trained'
        },
        defenses: {
            unarmored: 'trained',
            light: 'trained',
            medium: 'trained',
            heavy: 'trained'
        },
        classDC: 'trained',
        features: [
            {
                level: 1,
                name: 'Champion\'s Reaction',
                nameIt: 'Reazione del Campione',
                description: 'Your cause grants you a special reaction. Guardians gain Glimpse of Redemption, Liberators gain Liberating Step.',
                descriptionIt: 'La tua causa ti conferisce una reazione speciale. I Guardiani ottengono Barlume di Redenzione, i Liberatori ottengono Passo Liberatore.'
            },
            {
                level: 1,
                name: 'Deity and Cause',
                nameIt: 'Divinità e Causa',
                description: 'You select a deity and cause that shapes your champion abilities.',
                descriptionIt: 'Selezioni una divinità e una causa che modella le tue abilità da campione.'
            }
        ]
    },
    {
        id: 'barbarian',
        name: 'Barbarian',
        nameIt: 'Barbaro',
        description: 'Rage consumes you in battle. You thrive on danger and throw yourself into the thick of every fight.',
        descriptionIt: 'La furia ti consuma in battaglia. Prosperi nel pericolo e ti getti nel vivo di ogni combattimento.',
        source: { book: 'Player Core', page: 86 },
        rarity: 'common',
        traits: [],
        keyAbility: 'str',
        hitPoints: 12,
        perception: 'expert',
        fortitude: 'expert',
        reflex: 'trained',
        will: 'expert',
        skills: {
            trained: ['Athletics'],
            additionalTrainedSkills: 3
        },
        attacks: {
            simple: 'trained',
            martial: 'trained',
            advanced: 'untrained',
            unarmed: 'trained'
        },
        defenses: {
            unarmored: 'trained',
            light: 'trained',
            medium: 'trained',
            heavy: 'untrained'
        },
        classDC: 'trained',
        features: [
            {
                level: 1,
                name: 'Rage',
                nameIt: 'Furia',
                description: 'You can enter a rage as a free action when you roll initiative. While raging, you deal additional damage and have temporary HP.',
                descriptionIt: 'Puoi entrare in furia come azione gratuita quando tiri per l\'iniziativa. Mentre sei in furia, infliggi danni aggiuntivi e hai PF temporanei.'
            },
            {
                level: 1,
                name: 'Instinct',
                nameIt: 'Istinto',
                description: 'You have a powerful instinct that shapes your rage and grants you unique abilities.',
                descriptionIt: 'Hai un potente istinto che modella la tua furia e ti conferisce abilità uniche.'
            }
        ]
    },
    {
        id: 'sorcerer',
        name: 'Sorcerer',
        nameIt: 'Stregone',
        description: 'You didn\'t choose to become a spellcaster—you were born one. Magic is in your blood.',
        descriptionIt: 'Non hai scelto di diventare un incantatore: sei nato tale. La magia è nel tuo sangue.',
        source: { book: 'Player Core', page: 188 },
        rarity: 'common',
        traits: [],
        keyAbility: 'cha',
        hitPoints: 6,
        perception: 'trained',
        fortitude: 'trained',
        reflex: 'trained',
        will: 'expert',
        skills: {
            trained: [],
            additionalTrainedSkills: 2
        },
        attacks: {
            simple: 'trained',
            martial: 'untrained',
            advanced: 'untrained',
            unarmed: 'trained'
        },
        defenses: {
            unarmored: 'trained',
            light: 'untrained',
            medium: 'untrained',
            heavy: 'untrained'
        },
        classDC: 'trained',
        spellcasting: {
            tradition: 'arcane', // depends on bloodline
            type: 'spontaneous',
            ability: 'cha'
        },
        features: [
            {
                level: 1,
                name: 'Bloodline',
                nameIt: 'Stirpe',
                description: 'You have a magical bloodline granting you a tradition, skills, focus spells, and blood magic effects.',
                descriptionIt: 'Hai una stirpe magica che ti conferisce una tradizione, abilità, incantesimi di focalizzazione ed effetti di magia del sangue.'
            },
            {
                level: 1,
                name: 'Spontaneous Spellcasting',
                nameIt: 'Incantesimi Spontanei',
                description: 'You cast spells spontaneously using your bloodline\'s tradition.',
                descriptionIt: 'Lanci incantesimi spontaneamente usando la tradizione della tua stirpe.'
            }
        ]
    },
    {
        id: 'witch',
        name: 'Witch',
        nameIt: 'Strega',
        description: 'You command powerful magic, granted by a mysterious patron that works through your familiar.',
        descriptionIt: 'Comandi una magia potente, concessa da un misterioso patrono che opera attraverso il tuo famiglio.',
        source: { book: 'Player Core 2', page: 152 },
        rarity: 'common',
        traits: [],
        keyAbility: 'int',
        hitPoints: 6,
        perception: 'trained',
        fortitude: 'trained',
        reflex: 'trained',
        will: 'expert',
        skills: {
            trained: [],
            additionalTrainedSkills: 3
        },
        attacks: {
            simple: 'trained',
            martial: 'untrained',
            advanced: 'untrained',
            unarmed: 'trained'
        },
        defenses: {
            unarmored: 'trained',
            light: 'untrained',
            medium: 'untrained',
            heavy: 'untrained'
        },
        classDC: 'trained',
        spellcasting: {
            tradition: 'occult', // depends on patron
            type: 'prepared',
            ability: 'int'
        },
        features: [
            {
                level: 1,
                name: 'Patron',
                nameIt: 'Patrono',
                description: 'You learned your magic from a mysterious entity known as your patron. Your patron grants you a tradition and a special cantrip.',
                descriptionIt: 'Hai imparato la tua magia da un\'entità misteriosa conosciuta come il tuo patrono. Il patrono ti conferisce una tradizione e un trucchetto speciale.'
            },
            {
                level: 1,
                name: 'Familiar',
                nameIt: 'Famiglio',
                description: 'Your patron has sent you a familiar, a creature that serves as a link to your patron and helps you cast spells.',
                descriptionIt: 'Il tuo patrono ti ha inviato un famiglio, una creatura che funge da collegamento con il patrono e ti aiuta a lanciare incantesimi.'
            }
        ]
    }
];

export function getClassById(id: string): ClassDef | undefined {
    return classes.find(c => c.id === id);
}

export function getAllClasses(): ClassDef[] {
    return classes;
}
