import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';

export type TabId = 'weapons' | 'impulse' | 'defense' | 'gear' | 'resources' | 'spells' | 'pets' | 'details' | 'feats' | 'actions' | 'biography' | 'notes';

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
        { id: 'weapons', label: 'Weapons', show: true },
        { id: 'impulse', label: 'Impulses', show: hasImpulses },
        { id: 'defense', label: 'Defense', show: true },
        { id: 'gear', label: 'Gear', show: true },
        { id: 'resources', label: 'Resources', show: true },
        { id: 'spells', label: 'Spells', show: hasSpells },
        { id: 'pets', label: 'Pets', show: hasPets },
        { id: 'details', label: 'Details', show: true },
        { id: 'feats', label: 'Feats', show: true },
        { id: 'actions', label: 'Actions', show: true },
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
