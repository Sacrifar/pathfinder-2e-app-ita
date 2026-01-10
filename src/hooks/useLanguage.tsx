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
        'builder.skillFeat': 'Skill Feat',
        'builder.generalFeat': 'General Feat',
        'builder.futureChoices': 'Future choices...',
        'builder.noWeapons': 'No weapons equipped. Add a weapon to get started.',
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
        'builder.skillFeat': 'Talento di Abilità',
        'builder.generalFeat': 'Talento Generale',
        'builder.futureChoices': 'Scelte future...',
        'builder.noWeapons': 'Nessuna arma equipaggiata. Aggiungi un\'arma per iniziare.',
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
