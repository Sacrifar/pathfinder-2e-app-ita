import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Character, Proficiency } from '../../types';

interface DefensePanelProps {
    character: Character;
    ac: number;
}

export const DefensePanel: React.FC<DefensePanelProps> = ({
    character,
    ac,
}) => {
    const { t } = useLanguage();

    // Get proficiency bonus
    const getProficiencyBonus = (prof: Proficiency, level: number) => {
        switch (prof) {
            case 'trained': return 2 + level;
            case 'expert': return 4 + level;
            case 'master': return 6 + level;
            case 'legendary': return 8 + level;
            default: return 0;
        }
    };

    const getProficiencyLabel = (prof: Proficiency): string => {
        switch (prof) {
            case 'untrained': return 'U';
            case 'trained': return 'T';
            case 'expert': return 'E';
            case 'master': return 'M';
            case 'legendary': return 'L';
        }
    };

    const getProficiencyColor = (prof: Proficiency): string => {
        switch (prof) {
            case 'untrained': return 'var(--prof-untrained)';
            case 'trained': return 'var(--prof-trained)';
            case 'expert': return 'var(--prof-expert)';
            case 'master': return 'var(--prof-master)';
            case 'legendary': return 'var(--prof-legendary)';
        }
    };

    // Calculate saving throws
    const getSaveMod = (save: 'fortitude' | 'reflex' | 'will') => {
        const abilityMap = { fortitude: 'con', reflex: 'dex', will: 'wis' } as const;
        const ability = abilityMap[save];
        const abilityScore = character.abilityScores[ability];
        const abilityMod = Math.floor((abilityScore - 10) / 2);
        const profBonus = getProficiencyBonus(character.saves[save], character.level || 1);
        return abilityMod + profBonus;
    };

    const formatModifier = (value: number) => {
        return value >= 0 ? `+${value}` : `${value}`;
    };

    // AC breakdown
    const dexMod = Math.floor((character.abilityScores.dex - 10) / 2);
    const dexCap = character.armorClass.dexCap ?? 99;
    const effectiveDex = Math.min(dexMod, dexCap);
    const armorProfBonus = getProficiencyBonus(character.armorClass.proficiency, character.level || 1);
    const itemBonus = character.armorClass.itemBonus || 0;

    const saves = [
        { id: 'fortitude', label: t('saves.fortitude') || 'Fortitude', mod: getSaveMod('fortitude'), prof: character.saves.fortitude, ability: 'CON' },
        { id: 'reflex', label: t('saves.reflex') || 'Reflex', mod: getSaveMod('reflex'), prof: character.saves.reflex, ability: 'DEX' },
        { id: 'will', label: t('saves.will') || 'Will', mod: getSaveMod('will'), prof: character.saves.will, ability: 'WIS' },
    ];

    return (
        <div className="defense-panel">
            <div className="panel-header">
                <h3>{t('tabs.defense') || 'Defense'}</h3>
            </div>

            {/* AC Section */}
            <div className="defense-section">
                <h4>{t('stats.armorClass') || 'Armor Class'}</h4>
                <div className="ac-display">
                    <div className="ac-total">
                        <span className="ac-value">{ac}</span>
                        <span className="ac-label">AC</span>
                    </div>
                    <div className="ac-breakdown">
                        <div className="breakdown-item">
                            <span className="breakdown-label">{t('stats.base') || 'Base'}</span>
                            <span className="breakdown-value">10</span>
                        </div>
                        <div className="breakdown-item">
                            <span className="breakdown-label">DEX</span>
                            <span className="breakdown-value">
                                {formatModifier(effectiveDex)}
                                {dexCap < 99 && <span className="dex-cap"> (cap {dexCap})</span>}
                            </span>
                        </div>
                        <div className="breakdown-item">
                            <span className="breakdown-label">{t('stats.proficiency') || 'Prof'}</span>
                            <span className="breakdown-value" style={{ color: getProficiencyColor(character.armorClass.proficiency) }}>
                                {formatModifier(armorProfBonus)} ({getProficiencyLabel(character.armorClass.proficiency)})
                            </span>
                        </div>
                        {itemBonus > 0 && (
                            <div className="breakdown-item">
                                <span className="breakdown-label">{t('stats.armor') || 'Armor'}</span>
                                <span className="breakdown-value">{formatModifier(itemBonus)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Saving Throws */}
            <div className="defense-section">
                <h4>{t('stats.savingThrows') || 'Saving Throws'}</h4>
                <div className="saves-grid">
                    {saves.map(save => (
                        <div key={save.id} className="save-card">
                            <div className="save-header">
                                <span className="save-name">{save.label}</span>
                                <span
                                    className="save-prof"
                                    style={{ color: getProficiencyColor(save.prof) }}
                                >
                                    {getProficiencyLabel(save.prof)}
                                </span>
                            </div>
                            <div className="save-modifier">
                                {formatModifier(save.mod)}
                            </div>
                            <div className="save-ability">{save.ability}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Resistances & Immunities (placeholder) */}
            <div className="defense-section">
                <h4>{t('stats.resistances') || 'Resistances & Immunities'}</h4>
                <div className="empty-resistances">
                    <span className="text-muted">{t('builder.noResistances') || 'None'}</span>
                </div>
            </div>
        </div>
    );
};

export default DefensePanel;
