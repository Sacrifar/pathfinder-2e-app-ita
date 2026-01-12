import { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Character, Proficiency } from '../../types';
import { EquipmentBrowser } from './EquipmentBrowser';
import { LoadedArmor, LoadedShield, getArmor, getShields } from '../../data/pf2e-loader';

interface DefensePanelProps {
    character: Character;
    ac: number;
    onCharacterUpdate: (character: Character) => void;
}

export const DefensePanel: React.FC<DefensePanelProps> = ({
    character,
    ac,
    onCharacterUpdate,
}) => {
    const { t } = useLanguage();
    const [showBrowser, setShowBrowser] = useState(false);
    const [browserTab, setBrowserTab] = useState<'armor' | 'shield'>('armor');

    // Resolve equipped items
    const equippedArmor = useMemo(() => {
        if (!character.equippedArmor) return null;
        return getArmor().find(a => a.id === character.equippedArmor);
    }, [character.equippedArmor]);

    const equippedShield = useMemo(() => {
        if (!character.equippedShield) return null;
        return getShields().find(s => s.id === character.equippedShield);
    }, [character.equippedShield]);

    const handleEquipArmor = (armor: LoadedArmor) => {
        onCharacterUpdate({
            ...character,
            equippedArmor: armor.id,
            armorClass: {
                ...character.armorClass,
                itemBonus: armor.acBonus,
                dexCap: armor.dexCap,
                // checkPenalty: armor.checkPenalty // Not stored in AC currently
            }
        });
        setShowBrowser(false);
    };

    const handleEquipShield = (shield: LoadedShield) => {
        onCharacterUpdate({
            ...character,
            equippedShield: shield.id,
            shieldState: {
                currentHp: shield.hp,
                raised: false
            }
        });
        setShowBrowser(false);
    };

    const handleUnequipArmor = () => {
        onCharacterUpdate({
            ...character,
            equippedArmor: undefined,
            armorClass: {
                ...character.armorClass,
                itemBonus: 0,
                dexCap: 99
            }
        });
    };

    const handleUnequipShield = () => {
        onCharacterUpdate({
            ...character,
            equippedShield: undefined,
            shieldState: undefined
        });
    };

    // Toggle Raise Shield action (+2 AC)
    const handleToggleRaiseShield = () => {
        if (!character.shieldState) return;
        onCharacterUpdate({
            ...character,
            shieldState: {
                ...character.shieldState,
                raised: !character.shieldState.raised
            }
        });
    };

    // Damage shield (reduce HP)
    const handleDamageShield = (damage: number) => {
        if (!character.shieldState || !equippedShield) return;
        const newHp = Math.max(0, character.shieldState.currentHp - damage);
        onCharacterUpdate({
            ...character,
            shieldState: {
                ...character.shieldState,
                currentHp: newHp
            }
        });
    };

    // Repair shield (restore HP)
    const handleRepairShield = (amount: number) => {
        if (!character.shieldState || !equippedShield) return;
        const newHp = Math.min(equippedShield.maxHp, character.shieldState.currentHp + amount);
        onCharacterUpdate({
            ...character,
            shieldState: {
                ...character.shieldState,
                currentHp: newHp
            }
        });
    };

    // Get shield state values
    const shieldCurrentHp = character.shieldState?.currentHp ?? equippedShield?.hp ?? 0;
    const shieldMaxHp = equippedShield?.maxHp ?? 0;
    const shieldBrokenThreshold = Math.floor(shieldMaxHp / 2);
    const isShieldBroken = shieldCurrentHp <= shieldBrokenThreshold && shieldMaxHp > 0;
    const isShieldDestroyed = shieldCurrentHp <= 0 && shieldMaxHp > 0;
    const isShieldRaised = character.shieldState?.raised ?? false;

    const openBrowser = (tab: 'armor' | 'shield') => {
        setBrowserTab(tab);
        setShowBrowser(true);
    };

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

                <div className="equipment-slots">
                    {/* Armor Slot */}
                    <div className="equipment-slot">
                        <div className="slot-header">
                            <span className="slot-label"><span style={{ marginRight: 6 }}>👕</span> {t('equipment.armor') || 'Armor'}</span>
                            {equippedArmor && <span className="slot-stats">+{equippedArmor.acBonus} AC</span>}
                        </div>
                        <div className="slot-content">
                            {equippedArmor ? (
                                <div className="equipped-item-wrapper">
                                    <div className="equipped-item" onClick={() => openBrowser('armor')}>
                                        <span className="item-name">{equippedArmor.name}</span>
                                        <span className="item-details">{equippedArmor.category} • Dex Cap: {equippedArmor.dexCap === 99 ? '-' : equippedArmor.dexCap}</span>
                                    </div>
                                    <button className="unequip-btn" onClick={handleUnequipArmor} title={t('actions.unequip') || 'Unequip'}>
                                        ×
                                    </button>
                                </div>
                            ) : (
                                <button className="equip-btn" onClick={() => openBrowser('armor')}>
                                    {t('actions.equipArmor') || 'Equip Armor'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Shield Slot */}
                    <div className={`equipment-slot ${isShieldRaised ? 'shield-raised' : ''} ${isShieldBroken ? 'shield-broken' : ''} ${isShieldDestroyed ? 'shield-destroyed' : ''}`}>
                        <div className="slot-header">
                            <span className="slot-label"><span style={{ marginRight: 6 }}>🛡️</span> {t('equipment.shield') || 'Shield'}</span>
                            {equippedShield && (
                                <span className="slot-stats">
                                    Hardness {equippedShield.hardness}
                                    {isShieldRaised && <span className="raised-badge">+2 AC</span>}
                                </span>
                            )}
                        </div>
                        <div className="slot-content">
                            {equippedShield ? (
                                <div className="shield-slot-content">
                                    <div className="equipped-item-wrapper">
                                        <div className="equipped-item" onClick={() => openBrowser('shield')}>
                                            <span className={`item-name ${isShieldDestroyed ? 'destroyed' : ''}`}>
                                                {equippedShield.name}
                                                {isShieldBroken && !isShieldDestroyed && <span className="status-badge broken">Broken</span>}
                                                {isShieldDestroyed && <span className="status-badge destroyed">Destroyed</span>}
                                            </span>
                                        </div>
                                        <button className="unequip-btn" onClick={handleUnequipShield} title={t('actions.unequip') || 'Unequip'}>
                                            ×
                                        </button>
                                    </div>

                                    {/* Shield HP Bar */}
                                    <div className="shield-hp-section">
                                        <div className="shield-hp-header">
                                            <span>HP: {shieldCurrentHp}/{shieldMaxHp}</span>
                                            <span className="broken-threshold">BT {shieldBrokenThreshold}</span>
                                        </div>
                                        <div className="shield-hp-bar">
                                            <div
                                                className={`shield-hp-fill ${isShieldBroken ? 'broken' : ''} ${isShieldDestroyed ? 'destroyed' : ''}`}
                                                style={{ width: `${(shieldCurrentHp / shieldMaxHp) * 100}%` }}
                                            />
                                        </div>
                                        <div className="shield-hp-controls">
                                            <button
                                                className="hp-btn damage"
                                                onClick={() => handleDamageShield(1)}
                                                disabled={isShieldDestroyed}
                                                title="Take 1 damage"
                                            >
                                                −1
                                            </button>
                                            <button
                                                className="hp-btn damage"
                                                onClick={() => handleDamageShield(5)}
                                                disabled={isShieldDestroyed}
                                                title="Take 5 damage"
                                            >
                                                −5
                                            </button>
                                            <button
                                                className="hp-btn repair"
                                                onClick={() => handleRepairShield(5)}
                                                disabled={shieldCurrentHp >= shieldMaxHp}
                                                title="Repair 5 HP"
                                            >
                                                +5
                                            </button>
                                            <button
                                                className="hp-btn repair full"
                                                onClick={() => handleRepairShield(shieldMaxHp)}
                                                disabled={shieldCurrentHp >= shieldMaxHp}
                                                title="Fully repair"
                                            >
                                                Full
                                            </button>
                                        </div>
                                    </div>

                                    {/* Raise Shield Button */}
                                    <button
                                        className={`raise-shield-btn ${isShieldRaised ? 'raised' : ''}`}
                                        onClick={handleToggleRaiseShield}
                                        disabled={isShieldBroken || isShieldDestroyed}
                                        title={isShieldRaised ? 'Lower Shield' : 'Raise Shield (+2 AC)'}
                                    >
                                        {isShieldRaised ? '🛡️ Shield Raised (+2 AC)' : '⬆️ Raise Shield'}
                                    </button>
                                </div>
                            ) : (
                                <button className="equip-btn" onClick={() => openBrowser('shield')}>
                                    {t('actions.equipShield') || 'Equip Shield'}
                                </button>
                            )}
                        </div>
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


            {
                showBrowser && (
                    <EquipmentBrowser
                        onClose={() => setShowBrowser(false)}
                        onEquipArmor={handleEquipArmor}
                        onEquipShield={handleEquipShield}
                        initialTab={browserTab}
                    />
                )
            }
        </div >
    );
};

export default DefensePanel;
