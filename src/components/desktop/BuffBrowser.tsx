import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Buff, BonusType, BonusSelector, AbilityName } from '../../types';
import '../../styles/desktop.css';

interface BuffBrowserProps {
    onClose: () => void;
    onAddBuff: (buff: Buff) => void;
}

// Common presets for quick selection
const BUFF_PRESETS: Omit<Buff, 'id'>[] = [
    { name: 'Inspire Courage (+1)', bonus: 1, type: 'status', selector: 'attack', duration: 1 },
    { name: 'Inspire Courage (+2)', bonus: 2, type: 'status', selector: 'attack', duration: 1 },
    { name: 'Shield Block', bonus: 0, type: 'circumstance', selector: 'ac', duration: 1 },
    { name: 'Bless', bonus: 1, type: 'status', selector: 'attack', duration: 3 },
    { name: 'Power Attack', bonus: 2, type: 'circumstance', selector: 'damage' },
    { name: 'Mage Armor', bonus: 1, type: 'item', selector: 'ac', source: 'Spell', duration: 1 },
    { name: 'Heroism', bonus: 1, type: 'circumstance', selector: 'all-saves', source: 'Spell', duration: 1 },
];

const ALL_SELECTORS: { value: BonusSelector; label: string }[] = [
    { value: 'ac', label: 'Armor Class (AC)' },
    { value: 'fortitude', label: 'Fortitude Save' },
    { value: 'reflex', label: 'Reflex Save' },
    { value: 'will', label: 'Will Save' },
    { value: 'all-saves', label: 'All Saves' },
    { value: 'perception', label: 'Perception' },
    { value: 'attack', label: 'Attack Rolls' },
    { value: 'damage', label: 'Damage Rolls' },
    { value: 'speed', label: 'Speed' },
    { value: 'skill-*', label: 'All Skills' },
    { value: 'ability-*', label: 'All Abilities' },
];

const ABILITY_SELECTORS: { value: BonusSelector; label: string }[] = [
    { value: 'ability-str', label: 'Strength' },
    { value: 'ability-dex', label: 'Dexterity' },
    { value: 'ability-con', label: 'Constitution' },
    { value: 'ability-int', label: 'Intelligence' },
    { value: 'ability-wis', label: 'Wisdom' },
    { value: 'ability-cha', label: 'Charisma' },
];

export const BuffBrowser: React.FC<BuffBrowserProps> = ({
    onClose,
    onAddBuff,
}) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'preset' | 'custom'>('preset');

    // Custom buff form state
    const [customBuff, setCustomBuff] = useState<{
        name: string;
        bonus: number;
        type: BonusType;
        selector: BonusSelector;
        duration: string;
        source: string;
    }>({
        name: '',
        bonus: 1,
        type: 'status',
        selector: 'attack',
        duration: '',
        source: '',
    });

    const handleAddPreset = (preset: Omit<Buff, 'id'>) => {
        onAddBuff({
            ...preset,
            id: crypto.randomUUID(),
        });
        onClose();
    };

    const handleAddCustom = () => {
        if (!customBuff.name.trim()) return;

        const newBuff: Buff = {
            id: crypto.randomUUID(),
            name: customBuff.name.trim(),
            bonus: customBuff.bonus,
            type: customBuff.type,
            selector: customBuff.selector,
            duration: customBuff.duration ? parseInt(customBuff.duration) : undefined,
            source: customBuff.source.trim() || undefined,
        };

        onAddBuff(newBuff);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="feat-browser-modal buff-browser-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{t('browser.addBuff') || 'Add Buff'}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="browser-content">
                    {/* Tab Navigation */}
                    <div className="buff-tabs">
                        <button
                            className={`buff-tab ${activeTab === 'preset' ? 'active' : ''}`}
                            onClick={() => setActiveTab('preset')}
                        >
                            {t('buff.presets') || 'Presets'}
                        </button>
                        <button
                            className={`buff-tab ${activeTab === 'custom' ? 'active' : ''}`}
                            onClick={() => setActiveTab('custom')}
                        >
                            {t('buff.custom') || 'Custom Buff'}
                        </button>
                    </div>

                    {/* Presets Tab */}
                    {activeTab === 'preset' && (
                        <div className="buff-presets-list">
                            {BUFF_PRESETS.map(preset => (
                                <div
                                    key={preset.name}
                                    className="buff-preset-card"
                                    onClick={() => handleAddPreset(preset)}
                                >
                                    <div className="preset-header">
                                        <span className="preset-name">{preset.name}</span>
                                        <span className={`preset-value ${preset.bonus >= 0 ? 'positive' : 'negative'}`}>
                                            {preset.bonus >= 0 ? '+' : ''}{preset.bonus}
                                        </span>
                                    </div>
                                    <div className="preset-details">
                                        <span className="preset-type">{preset.type}</span>
                                        <span className="preset-selector">{preset.selector}</span>
                                        {preset.duration && (
                                            <span className="preset-duration">{preset.duration}r</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Custom Buff Tab */}
                    {activeTab === 'custom' && (
                        <div className="custom-buff-form">
                            <div className="form-group">
                                <label>{t('buff.name') || 'Buff Name'}</label>
                                <input
                                    type="text"
                                    value={customBuff.name}
                                    onChange={e => setCustomBuff({ ...customBuff, name: e.target.value })}
                                    placeholder={t('buff.namePlaceholder') || 'e.g., Divine Blessing'}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>{t('buff.bonus') || 'Bonus Value'}</label>
                                    <input
                                        type="number"
                                        value={customBuff.bonus}
                                        onChange={e => setCustomBuff({ ...customBuff, bonus: parseInt(e.target.value) || 0 })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>{t('buff.type') || 'Bonus Type'}</label>
                                    <select
                                        value={customBuff.type}
                                        onChange={e => setCustomBuff({ ...customBuff, type: e.target.value as BonusType })}
                                    >
                                        <option value="status">Status</option>
                                        <option value="circumstance">Circumstance</option>
                                        <option value="item">Item</option>
                                        <option value="penalty">Penalty</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>{t('buff.appliesTo') || 'Applies To'}</label>
                                <select
                                    value={customBuff.selector}
                                    onChange={e => setCustomBuff({ ...customBuff, selector: e.target.value as BonusSelector })}
                                >
                                    {ALL_SELECTORS.map(sel => (
                                        <option key={sel.value} value={sel.value}>{sel.label}</option>
                                    ))}
                                    <optgroup label="Abilities">
                                        {ABILITY_SELECTORS.map(sel => (
                                            <option key={sel.value} value={sel.value}>{sel.label}</option>
                                        ))}
                                    </optgroup>
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>{t('buff.duration') || 'Duration (rounds)'}</label>
                                    <input
                                        type="number"
                                        value={customBuff.duration}
                                        onChange={e => setCustomBuff({ ...customBuff, duration: e.target.value })}
                                        placeholder={t('buff.permanent') || 'Leave empty for permanent'}
                                        min={1}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>{t('buff.source') || 'Source (optional)'}</label>
                                    <input
                                        type="text"
                                        value={customBuff.source}
                                        onChange={e => setCustomBuff({ ...customBuff, source: e.target.value })}
                                        placeholder={t('buff.sourcePlaceholder') || 'e.g., Bardic Performance'}
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button className="secondary-btn" onClick={onClose}>
                                    {t('actions.cancel') || 'Cancel'}
                                </button>
                                <button
                                    className="add-btn"
                                    onClick={handleAddCustom}
                                    disabled={!customBuff.name.trim()}
                                >
                                    {t('actions.addBuff') || 'Add Buff'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
