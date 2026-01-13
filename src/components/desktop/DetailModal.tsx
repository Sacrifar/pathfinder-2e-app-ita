import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';

interface DetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
}

export const DetailModal: React.FC<DetailModalProps> = ({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    actions,
}) => {
    const { t: _t } = useLanguage();  // Kept for future use

    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="detail-modal">
                <div className="modal-header">
                    <div className="modal-title-group">
                        <h2 className="modal-title">{title}</h2>
                        {subtitle && <span className="modal-subtitle">{subtitle}</span>}
                    </div>
                    <button className="modal-close" onClick={onClose} aria-label="Close">
                        ×
                    </button>
                </div>
                <div className="modal-content">
                    {children}
                </div>
                {actions && (
                    <div className="modal-footer">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
};

// Action Detail Content
interface ActionDetailProps {
    name: string;
    cost: string;
    description: string;
    traits: string[];
    skill?: string;
}

export const ActionDetailContent: React.FC<ActionDetailProps> = ({
    cost,
    description,
    traits,
    skill,
}) => {
    const { t } = useLanguage();

    return (
        <div className="action-detail-content">
            <div className="action-cost-display">
                <span className="cost-icon">{cost}</span>
            </div>
            <p className="action-full-description">{description}</p>
            {skill && (
                <div className="action-skill-info">
                    <span className="skill-label">{t('filters.skill') || 'Skill'}:</span>
                    <span className="skill-value">{skill}</span>
                </div>
            )}
            {traits.length > 0 && (
                <div className="action-traits-list">
                    <span className="traits-label">Traits:</span>
                    <div className="traits-container">
                        {traits.map(trait => (
                            <span key={trait} className="trait-badge">{trait}</span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Weapon Detail Content
interface WeaponDetailProps {
    name: string;
    attackBonus: number;
    damage: string;
    damageType: string;
    traits: string[];
    hands: number;
    category?: string;
}

export const WeaponDetailContent: React.FC<WeaponDetailProps> = ({
    attackBonus,
    damage,
    damageType,
    traits,
    hands,
    category,
}) => {
    const { t } = useLanguage();

    const formatMod = (n: number) => n >= 0 ? `+${n}` : `${n}`;

    return (
        <div className="weapon-detail-content">
            <div className="weapon-main-stats">
                <div className="stat-block attack">
                    <span className="stat-value">{formatMod(attackBonus)}</span>
                    <span className="stat-label">{t('stats.attack') || 'Attack'}</span>
                </div>
                <div className="stat-block damage">
                    <span className="stat-value">{damage}</span>
                    <span className="stat-label">{damageType}</span>
                </div>
            </div>
            <div className="weapon-info-grid">
                <div className="info-row">
                    <span className="info-label">{t('stats.hands') || 'Hands'}</span>
                    <span className="info-value">{hands}</span>
                </div>
                {category && (
                    <div className="info-row">
                        <span className="info-label">Category</span>
                        <span className="info-value">{category}</span>
                    </div>
                )}
            </div>
            {traits.length > 0 && (
                <div className="weapon-traits-section">
                    <span className="traits-label">Traits</span>
                    <div className="traits-container">
                        {traits.map(trait => (
                            <span key={trait} className="trait-badge">{trait}</span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Skill Detail Content
interface SkillDetailProps {
    name: string;
    modifier: number;
    proficiency: string;
    ability: string;
    actions?: { name: string; cost: string; description: string }[];
}

export const SkillDetailContent: React.FC<SkillDetailProps> = ({
    modifier,
    proficiency,
    ability,
    actions = [],
}) => {
    const { t } = useLanguage();

    const formatMod = (n: number) => n >= 0 ? `+${n}` : `${n}`;

    const getProfLabel = (prof: string) => {
        switch (prof) {
            case 'untrained': return 'U';
            case 'trained': return 'T';
            case 'expert': return 'E';
            case 'master': return 'M';
            case 'legendary': return 'L';
            default: return 'U';
        }
    };

    return (
        <div className="skill-detail-content">
            <div className="skill-main-display">
                <span className="skill-modifier-large">{formatMod(modifier)}</span>
                <span className="skill-proficiency-badge">{getProfLabel(proficiency)}</span>
            </div>
            <div className="skill-breakdown">
                <span className="ability-key">{ability.toUpperCase()}</span>
            </div>
            {actions.length > 0 && (
                <div className="skill-actions-section">
                    <h4>{t('tabs.actions') || 'Actions'}</h4>
                    <div className="skill-actions-list">
                        {actions.map(action => (
                            <div key={action.name} className="skill-action-item">
                                <span className="action-cost-mini">{action.cost}</span>
                                <span className="action-name">{action.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetailModal;
