/**
 * Italian translations for PF2e data loaded from JSON
 * Maps English names to Italian translations
 */

// Ancestry name translations
export const ancestryTranslations: Record<string, { nameIt: string; descriptionIt?: string }> = {
    'Human': { nameIt: 'Umano' },
    'Elf': { nameIt: 'Elfo' },
    'Dwarf': { nameIt: 'Nano' },
    'Gnome': { nameIt: 'Gnomo' },
    'Goblin': { nameIt: 'Goblin' },
    'Halfling': { nameIt: 'Halfling' },
    'Leshy': { nameIt: 'Leshy' },
    'Orc': { nameIt: 'Orco' },
    'Catfolk': { nameIt: 'Felinide' },
    'Kobold': { nameIt: 'Coboldo' },
    'Lizardfolk': { nameIt: 'Lucertoloide' },
    'Ratfolk': { nameIt: 'Rattoide' },
    'Tengu': { nameIt: 'Tengu' },
    'Kitsune': { nameIt: 'Kitsune' },
    'Android': { nameIt: 'Androide' },
    'Automaton': { nameIt: 'Automa' },
    'Sprite': { nameIt: 'Spiritello' },
    'Strix': { nameIt: 'Strix' },
    'Fetchling': { nameIt: 'Fetchling' },
    'Fleshwarp': { nameIt: 'Carnedeforme' },
    'Nagaji': { nameIt: 'Nagaji' },
    'Vanara': { nameIt: 'Vanara' },
    'Vishkanya': { nameIt: 'Vishkanya' },
    'Azarketi': { nameIt: 'Azarketi' },
    'Anadi': { nameIt: 'Anadi' },
    'Conrasu': { nameIt: 'Conrasu' },
    'Goloma': { nameIt: 'Goloma' },
    'Grippli': { nameIt: 'Grippli' },
    'Shisk': { nameIt: 'Shisk' },
    'Skeleton': { nameIt: 'Scheletro' },
    'Poppet': { nameIt: 'Bambola' },
    'Ghoran': { nameIt: 'Ghoran' },
    'Kashrishi': { nameIt: 'Kashrishi' },
    'Hobgoblin': { nameIt: 'Hobgoblin' },
};

// Class name translations
export const classTranslations: Record<string, { nameIt: string; descriptionIt?: string }> = {
    'Fighter': { nameIt: 'Guerriero' },
    'Wizard': { nameIt: 'Mago' },
    'Cleric': { nameIt: 'Chierico' },
    'Rogue': { nameIt: 'Ladro' },
    'Ranger': { nameIt: 'Ranger' },
    'Bard': { nameIt: 'Bardo' },
    'Druid': { nameIt: 'Druido' },
    'Monk': { nameIt: 'Monaco' },
    'Champion': { nameIt: 'Campione' },
    'Barbarian': { nameIt: 'Barbaro' },
    'Sorcerer': { nameIt: 'Stregone' },
    'Witch': { nameIt: 'Strega' },
    'Alchemist': { nameIt: 'Alchimista' },
    'Investigator': { nameIt: 'Investigatore' },
    'Oracle': { nameIt: 'Oracolo' },
    'Swashbuckler': { nameIt: 'Spadaccino' },
    'Magus': { nameIt: 'Magus' },
    'Summoner': { nameIt: 'Evocatore' },
    'Psychic': { nameIt: 'Psichico' },
    'Thaumaturge': { nameIt: 'Taumaturgo' },
    'Inventor': { nameIt: 'Inventore' },
    'Gunslinger': { nameIt: 'Pistolero' },
    'Kineticist': { nameIt: 'Cineticista' },
    'Animist': { nameIt: 'Animista' },
    'Commander': { nameIt: 'Comandante' },
    'Exemplar': { nameIt: 'Esemplare' },
    'Guardian': { nameIt: 'Guardiano' },
};

// Heritage translations (common ones)
export const heritageTranslations: Record<string, { nameIt: string }> = {
    // Human
    'Skilled Human': { nameIt: 'Umano Esperto' },
    'Versatile Human': { nameIt: 'Umano Versatile' },
    'Wintertouched Human': { nameIt: 'Umano Toccato dall\'Inverno' },
    // Elf
    'Cavern Elf': { nameIt: 'Elfo delle Caverne' },
    'Woodland Elf': { nameIt: 'Elfo dei Boschi' },
    'Ancient Elf': { nameIt: 'Elfo Antico' },
    'Seer Elf': { nameIt: 'Elfo Veggente' },
    'Whisper Elf': { nameIt: 'Elfo Sussurrante' },
    // Dwarf
    'Ancient-Blooded Dwarf': { nameIt: 'Nano dal Sangue Antico' },
    'Forge Dwarf': { nameIt: 'Nano della Forgia' },
    'Forge-Blessed Dwarf': { nameIt: 'Nano Benedetto dalla Fucina' },
    'Rock Dwarf': { nameIt: 'Nano della Roccia' },
    'Strong-Blooded Dwarf': { nameIt: 'Nano dal Sangue Forte' },
    // Gnome
    'Chameleon Gnome': { nameIt: 'Gnomo Camaleonte' },
    'Fey-Touched Gnome': { nameIt: 'Gnomo Toccato dai Fatati' },
    'Sensate Gnome': { nameIt: 'Gnomo Sensitivo' },
    'Umbral Gnome': { nameIt: 'Gnomo Umbrale' },
    'Vivacious Gnome': { nameIt: 'Gnomo Vivace' },
    'Wellspring Gnome': { nameIt: 'Gnomo della Sorgente' },
    // Goblin
    'Charhide Goblin': { nameIt: 'Goblin Pellecarbone' },
    'Dokkaebi Goblin': { nameIt: 'Goblin Dokkaebi' },
    'Irongut Goblin': { nameIt: 'Goblin Stomaco di Ferro' },
    'Razortooth Goblin': { nameIt: 'Goblin Denti Affilati' },
    'Snow Goblin': { nameIt: 'Goblin delle Nevi' },
    'Unbreakable Goblin': { nameIt: 'Goblin Infrangibile' },
    // Halfling
    'Gutsy Halfling': { nameIt: 'Halfling Coraggioso' },
    'Hillock Halfling': { nameIt: 'Halfling delle Colline' },
    'Nomadic Halfling': { nameIt: 'Halfling Nomade' },
    'Twilight Halfling': { nameIt: 'Halfling del Crepuscolo' },
    'Wildwood Halfling': { nameIt: 'Halfling dei Boschi Selvatici' },
    // Leshy
    'Fungus Leshy': { nameIt: 'Leshy Fungo' },
    'Gourd Leshy': { nameIt: 'Leshy Zucca' },
    'Leaf Leshy': { nameIt: 'Leshy Foglia' },
    'Vine Leshy': { nameIt: 'Leshy Liana' },
    'Root Leshy': { nameIt: 'Leshy Radice' },
    // Orc
    'Badlands Orc': { nameIt: 'Orco delle Lande Desolate' },
    'Deep Orc': { nameIt: 'Orco delle Profondità' },
    'Hold-Scarred Orc': { nameIt: 'Orco Segnato dalla Fortezza' },
    'Rainfall Orc': { nameIt: 'Orco della Pioggia' },
    // Catfolk
    'Liminal Catfolk': { nameIt: 'Felino Liminale' },
    // Centaur
    'Budding Speaker Centaur': { nameIt: 'Centauro Oratore Nascente' },
    // Conrasu
    'Rite of Invocation': { nameIt: 'Rito dell\'Invocazione' },
    // Automaton
    'Mage Automaton': { nameIt: 'Automaton Mago' },
    // Minotaur
    'Ghost Bull Minotaur': { nameIt: 'Minotauro Toro Fantasma' },
    // Shisk
    'Spellkeeper Shisk': { nameIt: 'Shisk Custode di Incantesimi' },
    // Kholo
    'Witch Kholo': { nameIt: 'Kholo Strega' },
    // Lizardfolk
    'Makari Lizardfolk': { nameIt: 'Lizardfolk Makari' },
    // Dragonet
    'Homing Drake': { nameIt: 'Drake Homing' },
    // Samsaran
    'Oracular Samsaran': { nameIt: 'Samsaran Oracolare' },
    // Versatile Heritages
    'Talos': { nameIt: 'Talos' },
    // Yaoguai
    'Born of Elements': { nameIt: 'Nato dagli Elementi' },
    'Born of Celestial': { nameIt: 'Nato dal Celeste' },
    // Yaksha
    'Respite of Loam and Leaf': { nameIt: 'Refugio di Terra e Foglia' },
};

// Background translations
export const backgroundTranslations: Record<string, { nameIt: string; descriptionIt?: string }> = {
    'Acolyte': { nameIt: 'Accolito' },
    'Artisan': { nameIt: 'Artigiano' },
    'Artist': { nameIt: 'Artista' },
    'Barkeep': { nameIt: 'Oste' },
    'Charlatan': { nameIt: 'Ciarlatano' },
    'Criminal': { nameIt: 'Criminale' },
    'Detective': { nameIt: 'Detective' },
    'Entertainer': { nameIt: 'Intrattenitore' },
    'Farmhand': { nameIt: 'Bracciante' },
    'Field Medic': { nameIt: 'Medico da Campo' },
    'Fortune Teller': { nameIt: 'Indovino' },
    'Gambler': { nameIt: 'Giocatore d\'Azzardo' },
    'Gladiator': { nameIt: 'Gladiatore' },
    'Guard': { nameIt: 'Guardia' },
    'Herbalist': { nameIt: 'Erborista' },
    'Hermit': { nameIt: 'Eremita' },
    'Hunter': { nameIt: 'Cacciatore' },
    'Laborer': { nameIt: 'Lavoratore' },
    'Merchant': { nameIt: 'Mercante' },
    'Noble': { nameIt: 'Nobile' },
    'Nomad': { nameIt: 'Nomade' },
    'Prisoner': { nameIt: 'Prigioniero' },
    'Sailor': { nameIt: 'Marinaio' },
    'Scholar': { nameIt: 'Studioso' },
    'Scout': { nameIt: 'Esploratore' },
    'Street Urchin': { nameIt: 'Monello di Strada' },
    'Tinker': { nameIt: 'Stagnino' },
    'Warrior': { nameIt: 'Guerriero' },
};

// Spell translations (common class-specific spells)
export const spellTranslations: Record<string, { nameIt: string; descriptionIt?: string }> = {
    // Bard composition spells
    'Counter Performance': { nameIt: 'Controperformance', descriptionIt: 'La tua performance protegge te e i tuoi alleati. Tira un tiro di Performance per usare il risultato migliore tra il tuo tiro salvezza e quello dei tuoi alleati.' },
    'Courageous Anthem': { nameIt: 'Inno Coraggioso', descriptionIt: 'Ispiri te stesso e i tuoi alleati con parole o melodie di incoraggiamento. Tu e tutti gli alleati nell\'area guadagnate un bonus di stato di +1 ai tiri per colpire, ai danni e ai tiri salvezza contro la paura.' },
    // TODO: Add more spell translations as needed
};

// Feat translations (Bard feats)
export const featTranslations: Record<string, { nameIt: string; descriptionIt?: string }> = {
    'Bardic Lore': { nameIt: 'Tradizione Bardica', descriptionIt: 'I tuoi studi ti rendono informato su ogni argomento. Sei addestrato nella Tradizione Bardica, una speciale abilità di Lore che può essere usata solo per Ricordare Conoscenza, ma su qualsiasi argomento. Se hai competenza leggendaria in Occultismo, ottieni competenza esperta nella Tradizione Bardica, ma non puoi aumentare il tuo grado di competenza nella Tradizione Bardica con altri mezzi.' },
    'Eclectic Skill': { nameIt: 'Abilità Eclettica', descriptionIt: 'Le tue ampie esperienze si traducono in una gamma di abilità. Il tuo bonus di competenza per i tiri di abilità non addestrate è pari al tuo livello. Puoi tentare qualsiasi tiro di abilità che normalmente richiede di essere addestrato, anche se sei non addestrato. Se hai competenza leggendaria in Occultismo, puoi tentare qualsiasi tiro di abilità che normalmente richiede competenza esperta, anche se sei non addestrato o addestrato.' },
    'Versatile Performance': { nameIt: 'Performance Versatile', descriptionIt: 'Puoi fare affidamento alla grandezza delle tue esibizioni piuttosto che alle abilità sociali ordinarie. Puoi usare Performance al posto di Diplomazia per Fare Bella Figura, al posto di Intimidazione per Demoralizzare e al posto di Inganno per Impersonare. Inoltre, puoi usare il tuo grado di competenza in Performance per soddisfare i prerequisiti dei talenti di abilità che richiedono un particolare grado di competenza in Inganno, Diplomazia o Intimidazione.' },
    'Versatile Signature': { nameIt: 'Firma Versatile', descriptionIt: 'Mentre la maggior parte dei bardi è nota per certe performance e incantesimi signature, tu sei sempre in grado di modificare il tuo repertoire disponibile. Durante i tuoi preparativi giornalieri, puoi cambiare uno dei tuoi incantesimi firma con un incantesimo diverso di quel rango dal tuo repertoire.' },
    'Assured Knowledge': { nameIt: 'Conoscenza Assicurata', descriptionIt: 'Puoi ottenere informazioni con sicurezza. Ogni volta che usi Ricordare Conoscenza con qualsiasi abilità (inclusa la Tradizione Bardica), puoi rinunciare a tirare il dado per ottenere invece un risultato di 10 + il tuo bonus di competenza (non applicare altri bonus, penalità o modificatori). Finché sei esperto in un\'abilità, soddisfi i prerequisiti del talento di abilità Conoscenza Automatica in quell\'abilità, anche se non hai il talento Sicurezza in quell\'abilità.' },
    'Deep Lore': { nameIt: 'Tradizione Profonda', descriptionIt: 'Il tuo repertoire è vasto, contenente molti più incantesimi del solito. Aggiungi un incantesimo al tuo repertoire per ogni rango di incantesimo che puoi lanciare.' },
    'Ultimate Polymath': { nameIt: 'Polimath Finale', descriptionIt: 'Puoi lanciare flessibilmente tutti i tuoi incantesimi, concedendo una gamma vertiginosa di opzioni possibili. Tutti gli incantesimi nel tuo repertoire sono incantesimi firma per te.' },
    'True Hypercognition': { nameIt: 'Ipercognizione Vera', descriptionIt: 'La tua mente lavora a un ritmo incredibile. Usi istantaneamente fino a cinque azioni Ricordare Conoscenza. Se hai abilità speciali o azioni gratuite che si attiverebbero normalmente quando usi Ricordare Conoscenza, non puoi usarle per queste azioni.' },
    'Studious Capacity': { nameIt: 'Capacità di Studio', descriptionIt: 'Il tuo continuo studio della magia occulta ha aumentato la tua capacità magica, permettendoti di lanciare incantesimi anche quando sembra impossibile. Puoi lanciare un incantesimo al giorno anche dopo aver esaurito gli slot di incantesimi del rango appropriato, ma non puoi usare questa abilità per lanciare un incantesimo del tuo rango di incantesimo più alto.' },
    'Enigma\'s Knowledge': { nameIt: 'Conoscenza dell\'Enigma', descriptionIt: 'La tua muse ti sussurra conoscenza in tutti i momenti giusti. Ottieni i benefici del talento di abilità Conoscenza Automatica con qualsiasi abilità che puoi usare per Ricordare Conoscenza. Come da clausola speciale nel talento Conoscenza Automatica, puoi comunque usarlo solo una volta per round.' },
    'Multifarious Muse': { nameIt: 'Muse Multiple', descriptionIt: 'La tua muse non rientra in una singola etichetta. Scegli un tipo di muse diverso dal tuo. Ottieni un talento di 1° livello che richiede quel muse, e la tua muse è ora anche una muse di quel tipo, permettendoti di prendere talenti con l\'altro muse come prerequisito. Non ottieni nessun altro effetto del muse scelto. Speciale: Puoi prendere questo talento più volte. Ogni volta che lo fai, devi scegliere un tipo di muse diverso dal tuo.' },
    'Lingering Composition': { nameIt: 'Composizione Persistente', descriptionIt: 'Aggiungendo un tocco di classe, rendi le tue composizioni più durevoli. Impari l\'incantesimo focus Composizione Persistente.' },
    // Additional simple Bard feats (JSON-handled, utility functions for validation)
    'Well-Versed': { nameIt: 'Esperto Performances', descriptionIt: 'Sei resiliente alle influenze performative non tue. Ottieni un bonus di circostanza di +1 ai tiri salvezza contro gli effetti con i tratti uditivi, illusione, linguistico, sonico o visivo.' },
    'Martial Performance': { nameIt: 'Performance Marziale', descriptionIt: 'Le tue performance militari ispirano abilità marziali. La tua competenza con le armi da lanciare aumenta.' },
    'Zoophonic Communication': { nameIt: 'Comunicazione Zoofonica', descriptionIt: 'Puoi usare la Performance per comunicare con gli animali e con creature simili.' },
    'Hymn of Healing': { nameIt: 'Inno di Guarigione', descriptionIt: 'I tuoi inni curativi donano salute ai tuoi alleati.' },
    'Combat Reading': { nameIt: 'Lettura in Combattimento', descriptionIt: 'Puoi analizzare i tuoi avversari in combattimento per trovarne i punti deboli.' },
    'Courageous Advance': { nameIt: 'Avanzata Coraggiosa', descriptionIt: 'I tuoi inni ispirano coraggio nei tuoi alleati, permettendo loro di avanzare con sicurezza.' },
    'In Tune': { nameIt: 'In Sintonia', descriptionIt: 'Il tuo orecchio musicale è acuto. Puoi identificare la magia usando Performance.' },
    'Melodious Spell': { nameIt: 'Incantesimo Melodioso', descriptionIt: 'Puoi lanciare incantesimi somatici suonando o usando uno strumento musicale.' },
    'Rallying Anthem': { nameIt: 'Inno di Incoraggiamento', descriptionIt: 'Il tuo inno raduna i tuoi alleati e li prepara per la battaglia.' },
    'Triple Time': { nameIt: 'Tempo Tripla', descriptionIt: 'Il tuo ritmo può essere tre volte più veloce o tre volte più lento.' },
    'Zoophonic Composition': { nameIt: 'Composizione Zoofonica', descriptionIt: 'Puoi comunicare con gli animali attraverso una composizione musicale.' },
    'Defensive Coordination': { nameIt: 'Coordinazione Difensiva', descriptionIt: 'I tuoi inni aiutano i tuoi alleati a proteggersi e coordinarsi in combattimento.' },
    'Dirge of Doom': { nameIt: 'Canto del Fato', descriptionIt: 'La tua performance funerea crea un\'atmosfera inquietante che demoralizza i nemici.' },
    'Educate Allies': { nameIt: 'Educa gli Alleati', descriptionIt: 'Puoi insegnare ai tuoi alleati usando i tuoi inni.' },
    'Harmonize': { nameIt: 'Armonia', descriptionIt: 'I tuoi inni possono armonizzare gli effetti dannosi per proteggere i tuoi alleati.' },
    'Song of Marching': { nameIt: 'Cordo Marziale', descriptionIt: 'Il tuo ritmo mantiene i tuoi alleati in movimento durante i viaggi.' },
    'Accompany': { nameIt: 'Accompagnamento', descriptionIt: 'Puoi accompagnare le performance di un altro bardo per migliorare gli effetti.' },
    'Call and Response': { nameIt: 'Chiamata e Risposta', descriptionIt: 'Puoi creare una performance interattiva con un altro bardo per effetti potenziati.' },
    'Fortissimo Composition': { nameIt: 'Composizione Fortissima', descriptionIt: 'Puoi eseguire una composizione con volume incredibile per effetti amplificati.' },
    'Reflexive Courage': { nameIt: 'Coraggio Riflesso', descriptionIt: 'Il tuo coraggio si attiva istantaneamente quando i tuoi alleati sono minacciati.' },
    'Vigorous Anthem': { nameIt: 'Inno Vigoroso', descriptionIt: 'Il tuo inno guarisce e protegge i tuoi alleati con vitalità.' },
    'Resounding Finale': { nameIt: 'Finale Risuonante', descriptionIt: 'La tua performance finale lascia un\'impressione duratura che potenti i tuoi alleati.' },
    'Eternal Composition': { nameIt: 'Composizione Eterna', descriptionIt: 'La tua composizione può continuare indefinitamente senza dissiparsi.' },
};

// Special skill translations
export const skillTranslations: Record<string, { nameIt: string; descriptionIt?: string }> = {
    'Bardic Lore': { nameIt: 'Tradizione Bardica', descriptionIt: 'Una speciale abilità di Lore utilizzabile solo per Ricordare Conoscenza, ma su qualsiasi argomento.' },
};

/**
 * Get Italian translation for an entity
 */
export function getItTranslation(
    type: 'ancestry' | 'class' | 'heritage' | 'background' | 'spell' | 'feat' | 'skill',
    name: string
): { nameIt?: string; descriptionIt?: string } {
    switch (type) {
        case 'ancestry':
            return ancestryTranslations[name] || {};
        case 'class':
            return classTranslations[name] || {};
        case 'heritage':
            return heritageTranslations[name] || {};
        case 'background':
            return backgroundTranslations[name] || {};
        case 'spell':
            return spellTranslations[name] || {};
        case 'feat':
            return featTranslations[name] || {};
        case 'skill':
            return skillTranslations[name] || {};
        default:
            return {};
    }
}
