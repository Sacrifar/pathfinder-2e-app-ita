import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Character, Proficiency } from '../../types';

interface SpellsPanelProps {
    character: Character;
    onCastSpell: (spellId: string) => void;
    onAddSpell: () => void;
}

export const SpellsPanel: React.FC<SpellsPanelProps> = ({
    character,
    onCastSpell,
    onAddSpell,
}) => {
    const { t } = useLanguage();

    // Check if character has spellcasting
    if (!character.spellcasting) {
        return (
            <div className="spells-panel">
                <div className="empty-state">
                    <div className="empty-state-icon">✨</div>
                    <p>{t('builder.noSpellcasting') || 'This character is not a spellcaster.'}</p>
                </div>
            </div>
        );
    }

    const { spellcasting } = character;

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

    // Calculate spell attack and DC
    const keyAbilityScore = character.abilityScores[spellcasting.keyAbility];
    const keyMod = Math.floor((keyAbilityScore - 10) / 2);
    const profBonus = getProficiencyBonus(spellcasting.proficiency, character.level || 1);
    const spellAttack = keyMod + profBonus;
    const spellDC = 10 + keyMod + profBonus;

    const formatModifier = (value: number) => {
        return value >= 0 ? `+${value}` : `${value}`;
    };

    // Spell slots display
    const slotLevels = Object.keys(spellcasting.spellSlots || {}).map(Number).sort((a, b) => a - b);

    return (
        <div className="spells-panel">
            <div className="panel-header">
                <h3>{t('tabs.spells') || 'Spells'}</h3>
                <button className="header-btn" onClick={onAddSpell}>
                    + {t('actions.addSpell') || 'Add Spell'}
                </button>
            </div>

            {/* Spellcasting Info */}
            <div className="spellcasting-info">
                <div className="spell-stat">
                    <span className="spell-stat-label">{t('stats.tradition') || 'Tradition'}</span>
                    <span className="spell-stat-value tradition-badge">
                        {spellcasting.tradition}
                    </span>
                </div>
                <div className="spell-stat">
                    <span className="spell-stat-label">{t('stats.spellAttack') || 'Spell Attack'}</span>
                    <span className="spell-stat-value">{formatModifier(spellAttack)}</span>
                </div>
                <div className="spell-stat">
                    <span className="spell-stat-label">{t('stats.spellDC') || 'Spell DC'}</span>
                    <span className="spell-stat-value">{spellDC}</span>
                </div>
            </div>

            {/* Focus Points */}
            {spellcasting.focusPool && (
                <div className="focus-pool">
                    <span className="focus-label">{t('stats.focusPoints') || 'Focus Points'}</span>
                    <div className="focus-pips">
                        {Array.from({ length: spellcasting.focusPool.max }, (_, i) => (
                            <div
                                key={i}
                                className={`focus-pip ${i < spellcasting.focusPool!.current ? 'filled' : 'empty'}`}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Spell Slots */}
            <div className="spell-slots-section">
                <h4>{t('stats.spellSlots') || 'Spell Slots'}</h4>
                <div className="spell-slots-grid">
                    {slotLevels.map(level => {
                        const slot = spellcasting.spellSlots[level];
                        const remaining = slot.max - slot.used;
                        return (
                            <div key={level} className="spell-slot-row">
                                <span className="slot-level">
                                    {level === 0 ? 'Cantrip' : `${t('stats.rank') || 'Rank'} ${level}`}
                                </span>
                                <div className="slot-pips">
                                    {Array.from({ length: slot.max }, (_, i) => (
                                        <div
                                            key={i}
                                            className={`slot-pip ${i < remaining ? 'available' : 'used'}`}
                                        />
                                    ))}
                                </div>
                                <span className="slot-count">{remaining}/{slot.max}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Known Spells */}
            <div className="known-spells-section">
                <h4>{t('stats.knownSpells') || 'Known Spells'}</h4>
                {spellcasting.knownSpells.length === 0 ? (
                    <p className="text-muted">{t('builder.noSpellsKnown') || 'No spells known yet.'}</p>
                ) : (
                    <div className="spells-list">
                        {spellcasting.knownSpells.map(spellId => (
                            <div key={spellId} className="spell-item">
                                <span className="spell-name">{spellId}</span>
                                <button
                                    className="spell-cast-btn"
                                    onClick={() => onCastSpell(spellId)}
                                >
                                    {t('actions.cast') || 'Cast'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SpellsPanel;
