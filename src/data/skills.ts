export interface SkillDefinition {
    id: string;
    name: string;
    nameIt: string;
    ability: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
    armorPenalty?: boolean;
}

export const skills: SkillDefinition[] = [
    { id: 'acrobatics', name: 'Acrobatics', nameIt: 'Acrobazia', ability: 'dex', armorPenalty: true },
    { id: 'arcana', name: 'Arcana', nameIt: 'Arcano', ability: 'int' },
    { id: 'athletics', name: 'Athletics', nameIt: 'Atletica', ability: 'str', armorPenalty: true },
    { id: 'crafting', name: 'Crafting', nameIt: 'Artigianato', ability: 'int' },
    { id: 'deception', name: 'Deception', nameIt: 'Inganno', ability: 'cha' },
    { id: 'diplomacy', name: 'Diplomacy', nameIt: 'Diplomazia', ability: 'cha' },
    { id: 'intimidation', name: 'Intimidation', nameIt: 'Intimidazione', ability: 'cha' },
    { id: 'lore', name: 'Lore', nameIt: 'Conoscenza', ability: 'int' }, // Generic Lore, mostly for layout
    { id: 'medicine', name: 'Medicine', nameIt: 'Medicina', ability: 'wis' },
    { id: 'nature', name: 'Nature', nameIt: 'Natura', ability: 'wis' },
    { id: 'occultism', name: 'Occultism', nameIt: 'Occultismo', ability: 'int' },
    { id: 'performance', name: 'Performance', nameIt: 'Esibizione', ability: 'cha' },
    { id: 'religion', name: 'Religion', nameIt: 'Religione', ability: 'wis' },
    { id: 'society', name: 'Society', nameIt: 'Società', ability: 'int' },
    { id: 'stealth', name: 'Stealth', nameIt: 'Furtività', ability: 'dex', armorPenalty: true },
    { id: 'survival', name: 'Survival', nameIt: 'Sopravvivenza', ability: 'wis' },
    { id: 'thievery', name: 'Thievery', nameIt: 'Furto', ability: 'dex', armorPenalty: true },
];
