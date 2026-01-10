import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Character, Proficiency } from '../../types';

interface WeaponDisplay {
    id: string;
    name: string;
    attackBonus: number;
    damage: string;
    damageType: string;
    traits: string[];
    hands: 1 | 2;
}

interface WeaponsPanelProps {
    character: Character;
    onAddWeapon: () => void;
}

export const WeaponsPanel: React.FC<WeaponsPanelProps> = ({
    character,
    onAddWeapon,
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

    // Calculate attack bonus for a weapon
    const calculateAttackBonus = (weaponCategory: string) => {
        const strMod = Math.floor((character.abilityScores.str - 10) / 2);
        const dexMod = Math.floor((character.abilityScores.dex - 10) / 2);

        // Find weapon proficiency
        const profEntry = character.weaponProficiencies.find(
            p => p.category === weaponCategory || p.category === 'all'
        );
        const proficiency = profEntry?.proficiency || 'untrained';
        const profBonus = getProficiencyBonus(proficiency, character.level || 1);

        // Use DEX for finesse/ranged, STR otherwise
        // For simplicity, we'll use the higher modifier
        const abilityMod = Math.max(strMod, dexMod);

        return abilityMod + profBonus;
    };

    // Mock weapons from equipment (in real app, we'd parse character.equipment)
    const equippedWeapons: WeaponDisplay[] = character.equipment
        .filter(item => item.wielded)
        .map(item => ({
            id: item.id,
            name: item.name,
            attackBonus: calculateAttackBonus('martial'), // Simplified
            damage: '1d8', // Would come from weapon data
            damageType: 'slashing',
            traits: [],
            hands: item.wielded?.hands || 1,
        }));

    const formatModifier = (value: number) => {
        return value >= 0 ? `+${value}` : `${value}`;
    };

    return (
        <div className="weapons-panel">
            <div className="panel-header">
                <h3>{t('tabs.weapons') || 'Weapons'}</h3>
                <button className="header-btn" onClick={onAddWeapon}>
                    + {t('actions.addWeapon') || 'Add Weapon'}
                </button>
            </div>

            {equippedWeapons.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">⚔️</div>
                    <p>{t('builder.noWeapons') || 'No weapons equipped.'}</p>
                    <p className="empty-state-hint">
                        {t('builder.addWeaponHint') || 'Add a weapon to calculate attack bonuses.'}
                    </p>
                </div>
            ) : (
                <div className="weapons-list">
                    {equippedWeapons.map(weapon => (
                        <div key={weapon.id} className="weapon-card">
                            <div className="weapon-header">
                                <span className="weapon-name">{weapon.name}</span>
                                <div className="weapon-traits">
                                    {weapon.traits.map(trait => (
                                        <span key={trait} className="weapon-trait">{trait}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="weapon-stats">
                                <div className="weapon-stat">
                                    <span className="weapon-stat-label">
                                        {t('stats.attack') || 'Attack'}
                                    </span>
                                    <span className="weapon-stat-value attack-bonus">
                                        {formatModifier(weapon.attackBonus)}
                                    </span>
                                </div>
                                <div className="weapon-stat">
                                    <span className="weapon-stat-label">
                                        {t('stats.damage') || 'Damage'}
                                    </span>
                                    <span className="weapon-stat-value">
                                        {weapon.damage} {weapon.damageType}
                                    </span>
                                </div>
                                <div className="weapon-stat">
                                    <span className="weapon-stat-label">
                                        {t('stats.hands') || 'Hands'}
                                    </span>
                                    <span className="weapon-stat-value">{weapon.hands}</span>
                                </div>
                            </div>
                            <div className="weapon-actions">
                                <button className="weapon-action-btn">
                                    {t('actions.strike') || 'Strike'}
                                </button>
                                <button className="weapon-action-btn">
                                    {t('actions.details') || 'Details'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Quick Attack Reference */}
            <div className="attack-reference">
                <h4>{t('reference.attackBonus') || 'Attack Bonus Reference'}</h4>
                <div className="reference-grid">
                    <div className="reference-item">
                        <span className="ref-label">STR mod</span>
                        <span className="ref-value">
                            {formatModifier(Math.floor((character.abilityScores.str - 10) / 2))}
                        </span>
                    </div>
                    <div className="reference-item">
                        <span className="ref-label">DEX mod</span>
                        <span className="ref-value">
                            {formatModifier(Math.floor((character.abilityScores.dex - 10) / 2))}
                        </span>
                    </div>
                    <div className="reference-item">
                        <span className="ref-label">{t('stats.level') || 'Level'}</span>
                        <span className="ref-value">{character.level || 1}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeaponsPanel;
