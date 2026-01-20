import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';

export type TabId = 'weapons' | 'impulse' | 'defense' | 'gear' | 'resources' | 'spells' | 'pets' | 'details' | 'feats' | 'actions';

interface CharacterTabsProps {
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
    hasSpells?: boolean;
    hasPets?: boolean;
    hasImpulses?: boolean;
}

export const CharacterTabs: React.FC<CharacterTabsProps> = ({
    activeTab,
    onTabChange,
    hasSpells = false,
    hasPets = false,
    hasImpulses = false,
}) => {
    const { t } = useLanguage();

    const tabs: { id: TabId; label: string; show: boolean }[] = [
        { id: 'weapons', label: t('tabs.weapons') || 'Weapons', show: true },
        { id: 'impulse', label: t('tabs.impulse') || 'Impulse', show: hasImpulses },
        { id: 'defense', label: t('tabs.defense') || 'Defense', show: true },
        { id: 'gear', label: t('tabs.gear') || 'Gear', show: true },
        { id: 'resources', label: t('tabs.resources') || 'Resources', show: true },
        { id: 'spells', label: t('tabs.spells') || 'Spells', show: hasSpells },
        { id: 'pets', label: t('tabs.pets') || 'Pets', show: hasPets },
        { id: 'details', label: t('tabs.details') || 'Details', show: true },
        { id: 'feats', label: t('tabs.feats') || 'Feats', show: true },
        { id: 'actions', label: t('tabs.actions') || 'Actions', show: true },
    ];

    return (
        <div className="character-tabs">
            {tabs
                .filter((tab) => tab.show)
                .map((tab) => (
                    <button
                        key={tab.id}
                        className={`character-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => onTabChange(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
        </div>
    );
};

export default CharacterTabs;
