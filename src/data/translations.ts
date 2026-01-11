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
    'Rock Dwarf': { nameIt: 'Nano della Roccia' },
    'Forge Dwarf': { nameIt: 'Nano della Forgia' },
    'Strong-Blooded Dwarf': { nameIt: 'Nano dal Sangue Forte' },
    'Ancient-Blooded Dwarf': { nameIt: 'Nano dal Sangue Antico' },
    // Gnome
    'Chameleon Gnome': { nameIt: 'Gnomo Camaleonte' },
    'Fey-Touched Gnome': { nameIt: 'Gnomo Toccato dai Fatati' },
    'Sensate Gnome': { nameIt: 'Gnomo Sensitivo' },
    'Umbral Gnome': { nameIt: 'Gnomo Umbrale' },
    'Wellspring Gnome': { nameIt: 'Gnomo della Sorgente' },
    // Goblin
    'Charhide Goblin': { nameIt: 'Goblin Pellecarbone' },
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

/**
 * Get Italian translation for an entity
 */
export function getItTranslation(
    type: 'ancestry' | 'class' | 'heritage' | 'background',
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
        default:
            return {};
    }
}
