import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export type Language = 'en' | 'it';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    toggleLanguage: () => void;
    t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
    en: {
        // Navigation
        'nav.home': 'Home',
        'nav.characters': 'Characters',
        'nav.new': 'New',
        'nav.browse': 'Browse',

        // Home Page
        'home.title': 'Pathfinder 2e',
        'home.subtitle': 'Create and manage your Pathfinder Second Edition characters',
        'home.newCharacter': 'New Character',
        'home.myCharacters': 'My Characters',
        'home.createCharacter': 'Create Character',
        'home.loadCharacter': 'Load Character',
        'home.classes': 'Classes',
        'home.ancestries': 'Ancestries',
        'home.backgrounds': 'Backgrounds',
        'home.viewAll': 'View all →',
        'home.features': 'Features',
        'home.feature.wizard': 'Guided Creation',
        'home.feature.wizardDesc': 'Step-by-step wizard to create complete characters',
        'home.feature.responsive': 'Responsive',
        'home.feature.responsiveDesc': 'Works perfectly on PC and mobile devices',
        'home.feature.bilingual': 'Bilingual',
        'home.feature.bilingualDesc': 'Interface available in English and Italian',

        // Character List
        'characters.title': 'My Characters',
        'characters.saved': 'saved characters',
        'characters.empty.title': 'No Characters',
        'characters.empty.description': 'You haven\'t created any characters yet. Start by creating your first hero!',
        'characters.create': 'Create Character',
        'characters.modified': 'Modified',

        // Character Builder
        'builder.choose': 'Choose',
        'builder.ancestry': 'Ancestry',
        'builder.heritage': 'Heritage',
        'builder.background': 'Background',
        'builder.class': 'Class',
        'builder.secondaryClass': 'Secondary Class',
        'builder.notSelected': 'Not Selected',
        'builder.abilities': 'Abilities',
        'builder.summary': 'Summary',
        'builder.search': 'Search...',
        'builder.searchAncestry': 'Search ancestry...',
        'builder.searchBackground': 'Search background...',
        'builder.searchClass': 'Search class...',
        'builder.chooseAncestry': 'Choose Ancestry',
        'builder.chooseHeritage': 'Choose Heritage for',
        'builder.noHeritage.title': 'No Heritage Available',
        'builder.noHeritage.desc': 'There are no specific heritages for this ancestry. You can proceed to the next step.',
        'builder.chooseBackground': 'Choose Background',
        'builder.chooseClass': 'Choose Class',
        'builder.abilityScores': 'Ability Scores',
        'builder.abilityScoresDesc': 'Assign your character\'s base scores. You can use values between 8 and 18.',
        'builder.modifier': 'Modifier',
        'builder.characterSummary': 'Character Summary',
        'builder.characterName': 'Character Name',
        'builder.enterName': 'Enter name...',
        'builder.abilityBoosts': 'Ability Boosts',
        'builder.abilityFlaws': 'Ability Flaws',
        'builder.hitPoints': 'Hit Points',
        'builder.speed': 'Speed',
        'builder.level': 'Level',
        'builder.save': '💾 Save Character',
        'builder.next': 'Next →',
        'builder.back': '← Back',
        'builder.continue': 'Continue →',
        'builder.skillTraining': 'Skill Training',
        'builder.classSkillSlots': 'Class Skill Slots',
        'builder.intBonus': 'INT Bonus',
        'builder.totalSlots': 'Total Slots',
        'builder.selected': 'Selected',
        'builder.autoTrainedSkills': 'Class-Trained Skills',
        'builder.chooseSkills': 'Choose Additional Skills',
        'builder.levelUpBoosts': 'Level-Up Boosts',
        'builder.skillIncrease': 'Skill Increase',
        'builder.generalFeat': 'General Feat',
        'builder.skillFeat': 'Skill Feat',

        // Abilities
        'ability.str': 'Strength',
        'ability.dex': 'Dexterity',
        'ability.con': 'Constitution',
        'ability.int': 'Intelligence',
        'ability.wis': 'Wisdom',
        'ability.cha': 'Charisma',

        // Browse
        'browse.title': 'Browse Content',
        'browse.subtitle': 'Explore ancestries, classes, feats and more',
        'browse.ancestries': 'Ancestries',
        'browse.classes': 'Classes',
        'browse.backgrounds': 'Backgrounds',
        'browse.feats': 'Feats',
        'browse.spells': 'Spells',
        'browse.equipment': 'Equipment',
        'browse.underConstruction': 'Under Construction',
        'browse.comingSoon': 'This section will be available soon!',
        'browse.features': 'Features',
        'browse.proficiencies': 'Proficiencies',
        'browse.perception': 'Perception',
        'browse.fortitude': 'Fortitude',
        'browse.reflex': 'Reflex',
        'browse.will': 'Will',
        'browse.classFeatures': 'Class Features',
        'browse.skillTraining': 'Skill Training',

        // Common
        'common.hp': 'HP',
        'common.speed': 'Speed',
        'common.size': 'Size',
        'common.martial': 'Martial',

        // Desktop Layout
        'nav.menu': 'Menu',
        'character.unnamed': 'Unknown Adventurer',
        'character.noClass': 'No Class',
        'character.level': 'Level',
        'actions.rest': 'Rest',
        'actions.addCondition': 'Add Condition',
        'actions.addCustomBuff': 'Add Custom Buff',
        'actions.addWeapon': 'Add Weapon',
        'actions.cancel': 'Cancel',
        'actions.apply': 'Apply',
        'actions.select': 'Select',
        'actions.close': 'Close',

        // Stats
        'stats.speed': 'Speed',
        'stats.size': 'Size',
        'stats.perception': 'Perception',
        'stats.heroPoints': 'Hero Points',
        'stats.classDC': 'Class DC',

        // Tabs
        'tabs.weapons': 'Weapons',
        'tabs.defense': 'Defense',
        'tabs.gear': 'Gear',
        'tabs.spells': 'Spells',
        'tabs.pets': 'Pets',
        'tabs.details': 'Details',
        'tabs.feats': 'Feats',
        'tabs.actions': 'Actions',

        // Builder Desktop
        'builder.ancestryFeat': 'Ancestry Feat',
        'builder.classFeat': 'Class Feat',
        'builder.archetypeFeat': 'Archetype Feat',
        'builder.abilityBoost': 'Ability Boost',
        'builder.futureChoices': 'Future choices...',
        'builder.noWeapons': 'No weapons equipped. Add a weapon to get started.',
        'builder.addWeaponHint': 'Add a weapon to calculate attack bonuses.',
        'builder.noGear': 'No gear in inventory.',
        'builder.addGearHint': 'Add equipment, consumables, and treasure.',
        'builder.noSpellcasting': 'This character is not a spellcaster.',
        'builder.noSpellsKnown': 'No spells known yet.',
        'builder.noFeats': 'No feats selected yet.',
        'builder.addFeatHint': 'Select feats from the build sidebar.',
        'builder.noNotes': 'No notes yet.',
        'builder.noResistances': 'None',

        // Stats Extended
        'stats.armorClass': 'Armor Class',
        'stats.attack': 'Attack',
        'stats.damage': 'Damage',
        'stats.hands': 'Hands',
        'stats.bulk': 'Bulk',
        'stats.currency': 'Currency',
        'stats.invested': 'Invested',
        'stats.base': 'Base',
        'stats.proficiency': 'Prof',
        'stats.armor': 'Armor',
        'stats.savingThrows': 'Saving Throws',
        'stats.resistances': 'Resistances & Immunities',
        'stats.level': 'Level',
        'stats.tradition': 'Tradition',
        'stats.spellAttack': 'Spell Attack',
        'stats.spellDC': 'Spell DC',
        'stats.focusPoints': 'Focus Points',
        'stats.spellSlots': 'Spell Slots',
        'stats.rank': 'Rank',
        'stats.knownSpells': 'Known Spells',

        // Saves
        'saves.fortitude': 'Fortitude',
        'saves.reflex': 'Reflex',
        'saves.will': 'Will',

        // Actions Extended
        'actions.strike': 'Strike',
        'actions.details': 'Details',
        'actions.addGear': 'Add Gear',
        'actions.addSpell': 'Add Spell',
        'actions.cast': 'Cast',
        'actions.action': 'Action',
        'actions.actions': 'Actions',
        'actions.free': 'Free',
        'actions.reaction': 'Reaction',

        // Filters
        'filters.all': 'All',
        'filters.skill': 'Skill',

        // Status
        'status.encumbered': 'Encumbered',
        'status.overloaded': 'Overloaded',
        'status.worn': 'Worn',

        // Feats Categories
        'feats.ancestry': 'Ancestry Feats',
        'feats.class': 'Class Feats',
        'feats.general': 'General Feats',
        'feats.skill': 'Skill Feats',
        'feats.bonus': 'Bonus Feats',
        'feats.total': 'total',

        // Reference
        'reference.attackBonus': 'Attack Bonus Reference',

        // Character
        'character.name': 'Name',
        'character.player': 'Player',
        'character.notes': 'Notes',

        // Equipment
        'equipment.armor': 'Armor',
        'equipment.shield': 'Shield',
        'actions.equipArmor': 'Equip Armor',
        'actions.equipShield': 'Equip Shield',
        'actions.equip': 'Equip',
        'actions.unequip': 'Unequip',
        'browser.equipment': 'Equipment Browser',
        'browser.search': 'Search...',
        'browser.selectItem': 'Select an item to view details',

        // Pets & Companions
        'pets.title': 'Pets & Companions',
        'pets.empty': 'No pets or companions yet. Add a familiar, animal companion, or eidolon to your character.',
        'pets.add': 'Add Pet',
        'pets.type': 'Type',
        'pets.level': 'Level',
        'pets.hp': 'HP',
        'pets.ac': 'AC',
        'pets.perception': 'Perception',
        'pets.saves': 'Saves',
        'pets.speed': 'Speed',
        'pets.attacks': 'Attacks',
        'pets.abilities': 'Abilities',
        'pets.evolutions': 'Evolutions',
        'pets.notes': 'Notes',
        'pets.edit': 'Edit',
        'pets.delete': 'Delete',
        'pets.confirmDelete': 'Are you sure you want to remove this pet?',
        'pets.familiar': 'Familiar',
        'pets.animalCompanion': 'Animal Companion',
        'pets.eidolon': 'Eidolon',
        'pets.selectType': 'Select Pet Type',
        'pets.enterName': 'Enter name...',
        'pets.animal.companionType': 'Companion Type',
        'pets.animal.size': 'Size',
        'pets.eidolon.evolutionPoints': 'Evolution Points',
        'pets.eidolon.sharesHP': 'Shares HP with Summoner',
        'pets.familiar.abilities': 'Familiar Abilities',
        'pets.familiar.selectAbilities': 'Select up to 2 abilities',
        'pets.familiar.addAbility': 'Add Ability',
        'pets.stats': 'Stats',
        'pets.masterLevel': 'Master Level',
        'pets.conMod': 'CON Mod',
        'pets.actions.petActions': 'Pet Actions',
        'pets.actions.familiarAbility': 'Use Familiar Ability',
        'pets.actions.companionAttack': 'Companion Attack',
        'pets.actions.eidolanEvolution': 'Use Evolution',
        'pets.size.tiny': 'Tiny',
        'pets.size.small': 'Small',
        'pets.size.medium': 'Medium',
        'pets.size.large': 'Large',
        'pets.proficiency.untrained': 'Untrained',
        'pets.proficiency.trained': 'Trained',
        'pets.proficiency.expert': 'Expert',
        'pets.proficiency.master': 'Master',
        'pets.proficiency.legendary': 'Legendary',

        // Crafting & Formula Book
        'crafting.title': 'Crafting',
        'crafting.formulas': 'Formula Book',
        'crafting.projects': 'Crafting Projects',
        'crafting.dailyItems': 'Daily Items',
        'crafting.addFormula': 'Add Formula',
        'crafting.newProject': 'New Project',
        'crafting.startProject': 'Start Crafting',
        'crafting.daysSpent': 'Days Spent',
        'crafting.progress': 'Progress',
        'crafting.targetValue': 'Cost (sp)',
        'crafting.complete': 'Complete',
        'crafting.collectItem': 'Collect Item',
        'crafting.addDay': 'Add Day of Work',
        'crafting.bulk': 'Bulk',
        'crafting.price': 'Price',
        'crafting.level': 'Level',
        'crafting.craftingSuccess': 'Crafting Success!',
        'crafting.craftingError': 'Crafting Error',
        'crafting.notEnoughGold': 'Not enough gold to complete crafting',
        'crafting.projectCompleted': 'Project completed! Item added to inventory.',
        'crafting.emptyFormulas': 'No formulas learned yet.',
        'crafting.emptyProjects': 'No active crafting projects.',
        'crafting.emptyDailyItems': 'No daily items created.',
        'crafting.formulaAdded': 'Formula added to book.',
        'crafting.formulaRemoved': 'Formula removed from book.',
        'crafting.confirmComplete': 'Complete this project? This will deduct the required gold.',
        'crafting.proficiencyBonus': 'Proficiency Bonus',
        'crafting.costReduction': 'Cost Reduction per Day',

        // Container System
        'inventory.containers': 'Containers',
        'inventory.root': 'Root Inventory',
        'inventory.moveToContainer': 'Move to Container',
        'inventory.removeFromContainer': 'Remove from Container',
        'inventory.bulkUsed': 'Bulk Used',
        'inventory.bulkMax': 'Max Bulk',
        'inventory.encumbered': 'Encumbered',
        'inventory.lightItems': 'Light Items',
        'inventory.capacity': 'Capacity',
        'inventory.bulkReduction': 'Bulk Reduction',
        'inventory.selectContainer': 'Select Container',

        // Tooltip & Calculation Breakdown
        'tooltip.base': 'Base',
        'tooltip.ability': 'Ability',
        'tooltip.proficiency': 'Proficiency',
        'tooltip.item': 'Item',
        'tooltip.buff': 'Buff',
        'tooltip.penalty': 'Penalty',
        'tooltip.total': 'Total',
        'theme.dark': 'Dark Mode',
        'theme.light': 'Light Mode',

        // Variant Rules
        'menu.variantRules': 'Variant Rules',
        'menu.configureVariantRules': 'Configure Variant Rules',
        'menu.activeVariantRules': 'active',
    },
    it: {
        // Navigation
        'nav.home': 'Home',
        'nav.characters': 'Personaggi',
        'nav.new': 'Nuovo',
        'nav.browse': 'Sfoglia',

        // Home Page
        'home.title': 'Pathfinder 2e',
        'home.subtitle': 'Crea e gestisci i tuoi personaggi per Pathfinder Second Edition',
        'home.newCharacter': 'Nuovo Personaggio',
        'home.myCharacters': 'I Miei Personaggi',
        'home.createCharacter': 'Crea Personaggio',
        'home.loadCharacter': 'Carica Personaggio',
        'home.classes': 'Classi',
        'home.ancestries': 'Stirpi',
        'home.backgrounds': 'Background',
        'home.viewAll': 'Vedi tutte →',
        'home.features': 'Funzionalità',
        'home.feature.wizard': 'Creazione Guidata',
        'home.feature.wizardDesc': 'Wizard passo-passo per creare personaggi completi',
        'home.feature.responsive': 'Responsive',
        'home.feature.responsiveDesc': 'Funziona perfettamente su PC e dispositivi mobili',
        'home.feature.bilingual': 'Bilingue',
        'home.feature.bilingualDesc': 'Interfaccia disponibile in italiano e inglese',

        // Character List
        'characters.title': 'I Miei Personaggi',
        'characters.saved': 'personaggi salvati',
        'characters.empty.title': 'Nessun Personaggio',
        'characters.empty.description': 'Non hai ancora creato nessun personaggio. Inizia creando il tuo primo eroe!',
        'characters.create': 'Crea Personaggio',
        'characters.modified': 'Modificato',

        // Character Builder
        'builder.choose': 'Scegli',
        'builder.ancestry': 'Stirpe',
        'builder.heritage': 'Retaggio',
        'builder.background': 'Background',
        'builder.class': 'Classe',
        'builder.secondaryClass': 'Classe Secondaria',
        'builder.notSelected': 'Non Selezionato',
        'builder.abilities': 'Caratteristiche',
        'builder.summary': 'Riepilogo',
        'builder.search': 'Cerca...',
        'builder.searchAncestry': 'Cerca stirpe...',
        'builder.searchBackground': 'Cerca background...',
        'builder.searchClass': 'Cerca classe...',
        'builder.chooseAncestry': 'Scegli la Stirpe',
        'builder.chooseHeritage': 'Scegli il Retaggio per',
        'builder.noHeritage.title': 'Nessun Retaggio Disponibile',
        'builder.noHeritage.desc': 'Non ci sono retaggi specifici per questa stirpe. Puoi procedere al passo successivo.',
        'builder.chooseBackground': 'Scegli il Background',
        'builder.chooseClass': 'Scegli la Classe',
        'builder.abilityScores': 'Punteggi di Caratteristica',
        'builder.abilityScoresDesc': 'Assegna i punteggi base del tuo personaggio. Puoi usare valori tra 8 e 18.',
        'builder.modifier': 'Modificatore',
        'builder.characterSummary': 'Riepilogo Personaggio',
        'builder.characterName': 'Nome del Personaggio',
        'builder.enterName': 'Inserisci il nome...',
        'builder.abilityBoosts': 'Incrementi di Caratteristica',
        'builder.abilityFlaws': 'Difetti di Caratteristica',
        'builder.hitPoints': 'Punti Ferita',
        'builder.speed': 'Velocità',
        'builder.level': 'Livello',
        'builder.save': '💾 Salva Personaggio',
        'builder.next': 'Avanti →',
        'builder.back': '← Indietro',
        'builder.continue': 'Continua →',
        'builder.skillTraining': 'Addestramento Abilità',
        'builder.classSkillSlots': 'Slot Abilità Classe',
        'builder.intBonus': 'Bonus INT',
        'builder.totalSlots': 'Slot Totali',
        'builder.selected': 'Selezionate',
        'builder.autoTrainedSkills': 'Abilità dalla Classe',
        'builder.chooseSkills': 'Scegli Abilità Aggiuntive',
        'builder.levelUpBoosts': 'Incrementi di Livello',
        'builder.skillIncrease': 'Aumento Abilità',
        'builder.generalFeat': 'Talento Generale',
        'builder.skillFeat': 'Talento di Abilità',

        // Abilities
        'ability.str': 'Forza',
        'ability.dex': 'Destrezza',
        'ability.con': 'Costituzione',
        'ability.int': 'Intelligenza',
        'ability.wis': 'Saggezza',
        'ability.cha': 'Carisma',

        // Browse
        'browse.title': 'Sfoglia Contenuti',
        'browse.subtitle': 'Esplora stirpi, classi, talenti e altro',
        'browse.ancestries': 'Stirpi',
        'browse.classes': 'Classi',
        'browse.backgrounds': 'Background',
        'browse.feats': 'Talenti',
        'browse.spells': 'Incantesimi',
        'browse.equipment': 'Equipaggiamento',
        'browse.underConstruction': 'In Costruzione',
        'browse.comingSoon': 'Questa sezione sarà disponibile presto!',
        'browse.features': 'Caratteristiche',
        'browse.proficiencies': 'Competenze',
        'browse.perception': 'Percezione',
        'browse.fortitude': 'Tempra',
        'browse.reflex': 'Riflessi',
        'browse.will': 'Volontà',
        'browse.classFeatures': 'Caratteristiche di Classe',
        'browse.skillTraining': 'Addestramento Abilità',

        // Common
        'common.hp': 'PF',
        'common.speed': 'Velocità',
        'common.size': 'Taglia',
        'common.martial': 'Marziale',

        // Desktop Layout
        'nav.menu': 'Menu',
        'character.unnamed': 'Avventuriero Sconosciuto',
        'character.noClass': 'Nessuna Classe',
        'character.level': 'Livello',
        'actions.rest': 'Riposo',
        'actions.addCondition': 'Aggiungi Condizione',
        'actions.addCustomBuff': 'Aggiungi Bonus',
        'actions.addWeapon': 'Aggiungi Arma',
        'actions.cancel': 'Annulla',
        'actions.apply': 'Applica',
        'actions.select': 'Seleziona',
        'actions.close': 'Chiudi',

        // Stats
        'stats.speed': 'Velocità',
        'stats.size': 'Taglia',
        'stats.perception': 'Percezione',
        'stats.heroPoints': 'Punti Eroe',
        'stats.classDC': 'CD di Classe',

        // Tabs
        'tabs.weapons': 'Armi',
        'tabs.defense': 'Difesa',
        'tabs.gear': 'Equipaggiamento',
        'tabs.spells': 'Incantesimi',
        'tabs.pets': 'Compagni',
        'tabs.details': 'Dettagli',
        'tabs.feats': 'Talenti',
        'tabs.actions': 'Azioni',

        // Builder Desktop
        'builder.ancestryFeat': 'Talento di Stirpe',
        'builder.classFeat': 'Talento di Classe',
        'builder.archetypeFeat': 'Talento di Archetipo',
        'builder.abilityBoost': 'Incremento di Caratteristica',
        'builder.futureChoices': 'Scelte future...',
        'builder.noWeapons': 'Nessuna arma equipaggiata. Aggiungi un\'arma per iniziare.',
        'builder.addWeaponHint': 'Aggiungi un\'arma per calcolare i bonus d\'attacco.',
        'builder.noGear': 'Nessun equipaggiamento nell\'inventario.',
        'builder.addGearHint': 'Aggiungi equipaggiamento, consumabili e tesori.',
        'builder.noSpellcasting': 'Questo personaggio non è un incantatore.',
        'builder.noSpellsKnown': 'Nessun incantesimo conosciuto.',
        'builder.noFeats': 'Nessun talento selezionato.',
        'builder.addFeatHint': 'Seleziona i talenti dalla barra laterale.',
        'builder.noNotes': 'Nessuna nota.',
        'builder.noResistances': 'Nessuna',

        // Stats Extended
        'stats.armorClass': 'Classe Armatura',
        'stats.attack': 'Attacco',
        'stats.damage': 'Danni',
        'stats.hands': 'Mani',
        'stats.bulk': 'Ingombro',
        'stats.currency': 'Valuta',
        'stats.invested': 'Investiti',
        'stats.base': 'Base',
        'stats.proficiency': 'Comp',
        'stats.armor': 'Armatura',
        'stats.savingThrows': 'Tiri Salvezza',
        'stats.resistances': 'Resistenze e Immunità',
        'stats.level': 'Livello',
        'stats.tradition': 'Tradizione',
        'stats.spellAttack': 'Attacco Incantesimo',
        'stats.spellDC': 'CD Incantesimo',
        'stats.focusPoints': 'Punti Focalizzazione',
        'stats.spellSlots': 'Slot Incantesimo',
        'stats.rank': 'Grado',
        'stats.knownSpells': 'Incantesimi Conosciuti',

        // Saves
        'saves.fortitude': 'Tempra',
        'saves.reflex': 'Riflessi',
        'saves.will': 'Volontà',

        // Actions Extended
        'actions.strike': 'Colpire',
        'actions.details': 'Dettagli',
        'actions.addGear': 'Aggiungi Equip.',
        'actions.addSpell': 'Aggiungi Incantesimo',
        'actions.cast': 'Lancia',
        'actions.action': 'Azione',
        'actions.actions': 'Azioni',
        'actions.free': 'Gratuita',
        'actions.reaction': 'Reazione',

        // Filters
        'filters.all': 'Tutti',
        'filters.skill': 'Abilità',

        // Status
        'status.encumbered': 'Ingombrato',
        'status.overloaded': 'Sovraccarico',
        'status.worn': 'Indossato',

        // Feats Categories
        'feats.ancestry': 'Talenti di Stirpe',
        'feats.class': 'Talenti di Classe',
        'feats.general': 'Talenti Generali',
        'feats.skill': 'Talenti di Abilità',
        'feats.bonus': 'Talenti Bonus',
        'feats.total': 'totali',

        // Reference
        'reference.attackBonus': 'Riferimento Bonus Attacco',

        // Character
        'character.name': 'Nome',
        'character.player': 'Giocatore',
        'character.notes': 'Note',

        // Equipment
        'equipment.armor': 'Armatura',
        'equipment.shield': 'Scudo',
        'actions.equipArmor': 'Equipaggia Armatura',
        'actions.equipShield': 'Equipaggia Scudo',
        'actions.equip': 'Equipaggia',
        'actions.unequip': 'Rimuovi',
        'browser.equipment': 'Browser Equipaggiamento',
        'browser.search': 'Cerca...',
        'browser.selectItem': 'Seleziona un oggetto per vedere i dettagli',

        // Pets & Companions
        'pets.title': 'Famigli & Compagni',
        'pets.empty': 'Nessun famiglio o compagno ancora. Aggiungi un famiglio, compagno animale o eidolon al tuo personaggio.',
        'pets.add': 'Aggiungi Famiglio',
        'pets.type': 'Tipo',
        'pets.level': 'Livello',
        'pets.hp': 'PF',
        'pets.ac': 'CA',
        'pets.perception': 'Percezione',
        'pets.saves': 'Tiri Salvezza',
        'pets.speed': 'Velocità',
        'pets.attacks': 'Attacchi',
        'pets.abilities': 'Abilità',
        'pets.evolutions': 'Evoluzioni',
        'pets.notes': 'Note',
        'pets.edit': 'Modifica',
        'pets.delete': 'Elimina',
        'pets.confirmDelete': 'Sei sicuro di voler rimuovere questo famiglio?',
        'pets.familiar': 'Famiglio',
        'pets.animalCompanion': 'Compagno Animale',
        'pets.eidolon': 'Eidolon',
        'pets.selectType': 'Seleziona Tipo Famiglio',
        'pets.enterName': 'Inserisci il nome...',
        'pets.animal.companionType': 'Tipo Compagno',
        'pets.animal.size': 'Taglia',
        'pets.eidolon.evolutionPoints': 'Punti Evoluzione',
        'pets.eidolon.sharesHP': 'Condivide PF con l\'Invocatore',
        'pets.familiar.abilities': 'Abilità del Famiglio',
        'pets.familiar.selectAbilities': 'Seleziona fino a 2 abilità',
        'pets.familiar.addAbility': 'Aggiungi Abilità',
        'pets.stats': 'Statistiche',
        'pets.masterLevel': 'Livello Padrone',
        'pets.conMod': 'Mod COST',
        'pets.actions.petActions': 'Azioni Famiglio',
        'pets.actions.familiarAbility': 'Usa Abilità Famiglio',
        'pets.actions.companionAttack': 'Attacco Compagno',
        'pets.actions.eidolanEvolution': 'Usa Evoluzione',
        'pets.size.tiny': 'Minuscolo',
        'pets.size.small': 'Piccolo',
        'pets.size.medium': 'Medio',
        'pets.size.large': 'Grande',
        'pets.proficiency.untrained': 'Non Addestrato',
        'pets.proficiency.trained': 'Addestrato',
        'pets.proficiency.expert': 'Esperto',
        'pets.proficiency.master': 'Maestro',
        'pets.proficiency.legendary': 'Leggendario',

        // Crafting & Formula Book
        'crafting.title': 'Creazione',
        'crafting.formulas': 'Libro delle Formule',
        'crafting.projects': 'Progetti di Creazione',
        'crafting.dailyItems': 'Item Giornalieri',
        'crafting.addFormula': 'Aggiungi Formula',
        'crafting.newProject': 'Nuovo Progetto',
        'crafting.startProject': 'Inizia Creazione',
        'crafting.daysSpent': 'Giorni Lavorati',
        'crafting.progress': 'Progresso',
        'crafting.targetValue': 'Costo (pm)',
        'crafting.complete': 'Completa',
        'crafting.collectItem': 'Raccogli Oggetto',
        'crafting.addDay': 'Aggiungi Giorno di Lavoro',
        'crafting.bulk': 'Ingombro',
        'crafting.price': 'Prezzo',
        'crafting.level': 'Livello',
        'crafting.craftingSuccess': 'Creazione Riuscita!',
        'crafting.craftingError': 'Errore di Creazione',
        'crafting.notEnoughGold': 'Oro insufficiente per completare la creazione',
        'crafting.projectCompleted': 'Progetto completato! Oggetto aggiunto all\'inventario.',
        'crafting.emptyFormulas': 'Nessuna formula appresa ancora.',
        'crafting.emptyProjects': 'Nessun progetto di creazione attivo.',
        'crafting.emptyDailyItems': 'Nessun item giornaliero creato.',
        'crafting.formulaAdded': 'Formula aggiunta al libro.',
        'crafting.formulaRemoved': 'Formula rimossa dal libro.',
        'crafting.confirmComplete': 'Completare questo progetto? Questo dedurrà l\'oro necessario.',
        'crafting.proficiencyBonus': 'Bonus Competenza',
        'crafting.costReduction': 'Riduzione Costo per Giorno',

        // Container System
        'inventory.containers': 'Contenitori',
        'inventory.root': 'Inventario Principale',
        'inventory.moveToContainer': 'Sposta nel Contenitore',
        'inventory.removeFromContainer': 'Rimuovi dal Contenitore',
        'inventory.bulkUsed': 'Ingombro Usato',
        'inventory.bulkMax': 'Massimo Ingombro',
        'inventory.encumbered': 'Ingombrato',
        'inventory.lightItems': 'Oggetti Leggeri',
        'inventory.capacity': 'Capacità',
        'inventory.bulkReduction': 'Riduzione Ingombro',
        'inventory.selectContainer': 'Seleziona Contenitore',

        // Tooltip & Calculation Breakdown
        'tooltip.base': 'Base',
        'tooltip.ability': 'Caratteristica',
        'tooltip.proficiency': 'Competenza',
        'tooltip.item': 'Oggetto',
        'tooltip.buff': 'Buff',
        'tooltip.penalty': 'Penalità',
        'tooltip.total': 'Totale',
        'theme.dark': 'Modalità Scura',
        'theme.light': 'Modalità Chiara',

        // Variant Rules
        'menu.variantRules': 'Regole Varianti',
        'menu.configureVariantRules': 'Configura Regole Varianti',
        'menu.activeVariantRules': 'attive',
    }
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>(() => {
        const saved = localStorage.getItem('pf2e-language');
        return (saved as Language) || 'en';
    });

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('pf2e-language', lang);
    }, []);

    const toggleLanguage = useCallback(() => {
        setLanguage(language === 'en' ? 'it' : 'en');
    }, [language, setLanguage]);

    const t = useCallback((key: string): string => {
        return translations[language][key] || key;
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

// Helper to get localized name from entity (name/nameIt)
export function useLocalizedName() {
    const { language } = useLanguage();
    return useCallback((entity: { name: string; nameIt?: string }) => {
        return language === 'it' && entity.nameIt ? entity.nameIt : entity.name;
    }, [language]);
}

// Helper to get localized description from entity
export function useLocalizedDescription() {
    const { language } = useLanguage();
    return useCallback((entity: { description: string; descriptionIt?: string }) => {
        return language === 'it' && entity.descriptionIt ? entity.descriptionIt : entity.description;
    }, [language]);
}
