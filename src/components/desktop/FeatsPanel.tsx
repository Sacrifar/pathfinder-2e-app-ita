import React from 'react';
import { useLanguage, useLocalizedName } from '../../hooks/useLanguage';
import { Character, CharacterFeat } from '../../types';

interface FeatsPanelProps {
    character: Character;
    onFeatClick: (feat: CharacterFeat) => void;
}

interface FeatGroup {
    source: CharacterFeat['source'];
    label: string;
    feats: CharacterFeat[];
}

export const FeatsPanel: React.FC<FeatsPanelProps> = ({
    character,
    onFeatClick,
}) => {
    const { t } = useLanguage();

    // Group feats by source
    const groupFeats = (): FeatGroup[] => {
        const groups: Record<CharacterFeat['source'], CharacterFeat[]> = {
            ancestry: [],
            class: [],
            general: [],
            skill: [],
            bonus: [],
        };

        character.feats.forEach(feat => {
            groups[feat.source].push(feat);
        });

        return [
            { source: 'ancestry', label: t('feats.ancestry') || 'Ancestry Feats', feats: groups.ancestry },
            { source: 'class', label: t('feats.class') || 'Class Feats', feats: groups.class },
            { source: 'general', label: t('feats.general') || 'General Feats', feats: groups.general },
            { source: 'skill', label: t('feats.skill') || 'Skill Feats', feats: groups.skill },
            { source: 'bonus', label: t('feats.bonus') || 'Bonus Feats', feats: groups.bonus },
        ].filter(group => group.feats.length > 0);
    };

    const featGroups = groupFeats();
    const totalFeats = character.feats.length;

    const getSourceColor = (source: CharacterFeat['source']): string => {
        switch (source) {
            case 'ancestry': return 'var(--desktop-accent-orange)';
            case 'class': return 'var(--desktop-accent-red)';
            case 'general': return 'var(--desktop-text-secondary)';
            case 'skill': return 'var(--desktop-accent-blue)';
            case 'bonus': return 'var(--desktop-accent-green)';
        }
    };

    return (
        <div className="feats-panel">
            <div className="panel-header">
                <h3>{t('tabs.feats') || 'Feats'}</h3>
                <span className="feat-count">{totalFeats} {t('feats.total') || 'total'}</span>
            </div>

            {totalFeats === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📜</div>
                    <p>{t('builder.noFeats') || 'No feats selected yet.'}</p>
                    <p className="empty-state-hint">
                        {t('builder.addFeatHint') || 'Select feats from the build sidebar.'}
                    </p>
                </div>
            ) : (
                <div className="feat-groups">
                    {featGroups.map(group => (
                        <div key={group.source} className="feat-group">
                            <div
                                className="feat-group-header"
                                style={{ borderLeftColor: getSourceColor(group.source) }}
                            >
                                <span className="group-name">{group.label}</span>
                                <span className="group-count">{group.feats.length}</span>
                            </div>
                            <div className="feat-list">
                                {group.feats
                                    .sort((a, b) => a.level - b.level)
                                    .map(feat => (
                                        <div
                                            key={feat.featId}
                                            className="feat-item"
                                            onClick={() => onFeatClick(feat)}
                                        >
                                            <span className="feat-level">Lv {feat.level}</span>
                                            <span className="feat-name">{feat.featId}</span>
                                            {feat.choices && feat.choices.length > 0 && (
                                                <span className="feat-choices">
                                                    ({feat.choices.join(', ')})
                                                </span>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FeatsPanel;
