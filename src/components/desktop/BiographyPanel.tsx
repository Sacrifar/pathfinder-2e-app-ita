/**
 * BiographyPanel Component
 * Character biography, appearance, and personality details
 */

import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Character, CharacterBiography } from '../../types';
import { getDeityById } from '../../data/deities';

interface BiographyPanelProps {
    character: Character;
    onBiographyUpdate: (biography: CharacterBiography) => void;
    onDeitySelect?: () => void;
}

export const BiographyPanel: React.FC<BiographyPanelProps> = ({
    character,
    onBiographyUpdate,
    onDeitySelect,
}) => {
    const { t, language } = useLanguage();
    const biography = character.biography || {};
    const deity = character.deityId ? getDeityById(character.deityId) : null;

    const updateField = (field: keyof CharacterBiography, value: string) => {
        const updated = { ...biography, [field]: value };
        onBiographyUpdate(updated);
    };

    return (
        <div className="biography-panel">
            <div className="panel-header">
                <h3>👤 {t('biography.title') || 'Biography & Appearance'}</h3>
            </div>

            {/* Avatar Section */}
            <div className="avatar-section">
                <div className="avatar-container">
                    {biography.avatarUrl ? (
                        <img
                            src={biography.avatarUrl}
                            alt={character.name}
                            className="avatar-image"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="avatar-placeholder">
                            <span className="avatar-placeholder-text">{character.name.charAt(0).toUpperCase()}</span>
                        </div>
                    )}
                </div>
                <div className="avatar-controls">
                    <input
                        type="text"
                        placeholder={t('biography.avatarUrl') || 'Image URL...'}
                        value={biography.avatarUrl || ''}
                        onChange={(e) => updateField('avatarUrl', e.target.value)}
                        className="avatar-url-input"
                    />
                </div>
            </div>

            {/* Deity */}
            <div className="bio-section deity-section">
                <div className="deity-field">
                    <label>{t('deity.selectDeity') || 'Deity'}</label>
                    {deity ? (
                        <div className="deity-display">
                            <span className="deity-name">
                                {language === 'it' && deity.nameIt ? deity.nameIt : deity.name}
                            </span>
                            <span className="deity-font-badge">
                                {deity.font === 'heal' && '✚'}
                                {deity.font === 'harm' && '✝'}
                                {deity.font === 'both' && '✚✝'}
                            </span>
                            {onDeitySelect && (
                                <button
                                    className="change-deity-btn"
                                    onClick={onDeitySelect}
                                >
                                    {t('actions.change') || 'Change'}
                                </button>
                            )}
                        </div>
                    ) : (
                        <button
                            className="select-deity-btn"
                            onClick={onDeitySelect}
                        >
                            + {t('deity.select') || 'Select Deity'}
                        </button>
                    )}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="bio-section quick-stats">
                <h4>{t('biography.quickStats') || 'Quick Stats'}</h4>
                <div className="quick-stats-grid">
                    <div className="stat-field">
                        <label>{t('biography.age') || 'Age'}</label>
                        <input
                            type="text"
                            placeholder="25"
                            value={biography.age || ''}
                            onChange={(e) => updateField('age', e.target.value)}
                        />
                    </div>
                    <div className="stat-field">
                        <label>{t('biography.gender') || 'Gender'}</label>
                        <input
                            type="text"
                            placeholder={t('biography.genderPlaceholder') || 'Male, Female, Non-binary...'}
                            value={biography.gender || ''}
                            onChange={(e) => updateField('gender', e.target.value)}
                        />
                    </div>
                    <div className="stat-field">
                        <label>{t('biography.pronouns') || 'Pronouns'}</label>
                        <input
                            type="text"
                            placeholder="he/him, she/her, they/them..."
                            value={biography.pronouns || ''}
                            onChange={(e) => updateField('pronouns', e.target.value)}
                        />
                    </div>
                    <div className="stat-field">
                        <label>{t('biography.height') || 'Height'}</label>
                        <input
                            type="text"
                            placeholder={language === 'it' ? "1,75 m" : "5'9\""}
                            value={biography.height || ''}
                            onChange={(e) => updateField('height', e.target.value)}
                        />
                    </div>
                    <div className="stat-field">
                        <label>{t('biography.weight') || 'Weight'}</label>
                        <input
                            type="text"
                            placeholder={language === 'it' ? "70 kg" : "154 lbs"}
                            value={biography.weight || ''}
                            onChange={(e) => updateField('weight', e.target.value)}
                        />
                    </div>
                    <div className="stat-field">
                        <label>{t('biography.ethnicity') || 'Ethnicity'}</label>
                        <input
                            type="text"
                            placeholder={t('biography.ethnicityPlaceholder') || 'Human, Elf, Dwarf...'}
                            value={biography.ethnicity || ''}
                            onChange={(e) => updateField('ethnicity', e.target.value)}
                        />
                    </div>
                    <div className="stat-field full-width">
                        <label>{t('biography.nationality') || 'Nationality'}</label>
                        <input
                            type="text"
                            placeholder={t('biography.nationalityPlaceholder') || 'Chelish, Taldan, Varisian...'}
                            value={biography.nationality || ''}
                            onChange={(e) => updateField('nationality', e.target.value)}
                        />
                    </div>
                    <div className="stat-field full-width">
                        <label>{t('biography.birthplace') || 'Birthplace'}</label>
                        <input
                            type="text"
                            placeholder={t('biography.birthplacePlaceholder') || 'Magnimar, Sandpoint, Westcrown...'}
                            value={biography.birthplace || ''}
                            onChange={(e) => updateField('birthplace', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Appearance */}
            <div className="bio-section">
                <h4>{t('biography.appearance') || 'Physical Appearance'}</h4>
                <textarea
                    className="bio-textarea"
                    placeholder={t('biography.appearancePlaceholder') || 'Describe your character\'s physical appearance... Hair color, eye color, distinguishing features, clothing style, etc.'}
                    value={biography.appearance || ''}
                    onChange={(e) => updateField('appearance', e.target.value)}
                    rows={4}
                />
            </div>

            {/* Personality */}
            <div className="bio-section">
                <h4>{t('biography.personality') || 'Personality & Attitude'}</h4>
                <textarea
                    className="bio-textarea"
                    placeholder={t('biography.personalityPlaceholder') || 'Describe your character\'s personality... Traits, mannerisms, how they interact with others, etc.'}
                    value={biography.attitude || ''}
                    onChange={(e) => updateField('attitude', e.target.value)}
                    rows={4}
                />
            </div>

            {/* Beliefs */}
            <div className="bio-section">
                <h4>{t('biography.beliefs') || 'Beliefs & Philosophy'}</h4>
                <textarea
                    className="bio-textarea"
                    placeholder={t('biography.beliefsPlaceholder') || 'Describe your character\'s beliefs... Religious views, philosophy, moral code, etc.'}
                    value={biography.beliefs || ''}
                    onChange={(e) => updateField('beliefs', e.target.value)}
                    rows={3}
                />
            </div>

            {/* Likes & Dislikes */}
            <div className="bio-section likes-dislikes">
                <div className="likes-field">
                    <h4>{t('biography.likes') || 'Likes'}</h4>
                    <textarea
                        className="bio-textarea"
                        placeholder={t('biography.likesPlaceholder') || 'What does your character enjoy?'}
                        value={biography.likes || ''}
                        onChange={(e) => updateField('likes', e.target.value)}
                        rows={2}
                    />
                </div>
                <div className="dislikes-field">
                    <h4>{t('biography.dislikes') || 'Dislikes'}</h4>
                    <textarea
                        className="bio-textarea"
                        placeholder={t('biography.dislikesPlaceholder') || 'What does your character hate or fear?'}
                        value={biography.dislikes || ''}
                        onChange={(e) => updateField('dislikes', e.target.value)}
                        rows={2}
                    />
                </div>
            </div>

            {/* Catchphrases */}
            <div className="bio-section">
                <h4>{t('biography.catchphrases') || 'Memorable Quotes'}</h4>
                <textarea
                    className="bio-textarea"
                    placeholder={t('biography.catchphrasesPlaceholder') || 'Famous quotes, catchphrases, or things your character often says...'}
                    value={biography.catchphrases || ''}
                    onChange={(e) => updateField('catchphrases', e.target.value)}
                    rows={3}
                />
            </div>
        </div>
    );
};

export default BiographyPanel;
