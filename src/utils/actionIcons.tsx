/**
 * Action Icons Constants
 * Maps action costs to their corresponding icon paths
 */

export const ACTION_ICONS = {
    single: '/src/data/Azioni/action_single.png',
    double: '/src/data/Azioni/action_double.png',
    triple: '/src/data/Azioni/action_triple.png',
    free: '/src/data/Azioni/action_free.png',
    reaction: '/src/data/Azioni/action_reaction.png',
} as const;

/**
 * Equipment Icons Constants
 * Maps equipment types to their corresponding icon paths
 */
export const EQUIPMENT_ICONS = {
    armor: '/src/data/Azioni/armor_small.png',
    shield: '/src/data/Azioni/icon_shield.png',
    shieldHardness: '/src/data/Azioni/icon_shield_hardness.png',
    shieldHealth: '/src/data/Azioni/icon_shield_health.png',
} as const;

/**
 * Get action icon path for a given cost
 */
export function getActionIconPath(cost: '1' | '2' | '3' | 'free' | 'reaction'): string {
    switch (cost) {
        case '1': return ACTION_ICONS.single;
        case '2': return ACTION_ICONS.double;
        case '3': return ACTION_ICONS.triple;
        case 'free': return ACTION_ICONS.free;
        case 'reaction': return ACTION_ICONS.reaction;
    }
}

/**
 * Component to display action icon
 */
export function ActionIcon({ cost, className = '' }: { cost: '1' | '2' | '3' | 'free' | 'reaction'; className?: string }) {
    return (
        <img
            src={getActionIconPath(cost)}
            alt={cost}
            className={`action-icon ${className}`}
            style={{ width: '20px', height: '20px', verticalAlign: 'middle' }}
        />
    );
}

/**
 * Component to display feat action icon (handles passive feats too)
 */
export function FeatActionIcon({ actionType, actionCost, className = '' }: {
    actionType: 'passive' | 'free' | 'reaction' | 'action';
    actionCost: number | null;
    className?: string;
}) {
    let cost: '1' | '2' | '3' | 'free' | 'reaction' = 'free';

    if (actionType === 'passive') {
        return (
            <span className={`feat-action-icon passive ${className}`} style={{ fontSize: '18px' }}>
                ◈
            </span>
        );
    }

    if (actionType === 'reaction') {
        cost = 'reaction';
    } else if (actionType === 'free') {
        cost = 'free';
    } else if (actionCost === 1) {
        cost = '1';
    } else if (actionCost === 2) {
        cost = '2';
    } else if (actionCost === 3) {
        cost = '3';
    }

    return <ActionIcon cost={cost} className={className} />;
}

/**
 * Component to display equipment icon
 */
export function EquipmentIcon({ type, className = '' }: { type: 'armor' | 'shield' | 'shieldHardness' | 'shieldHealth'; className?: string }) {
    return (
        <img
            src={EQUIPMENT_ICONS[type]}
            alt={type}
            className={`equipment-icon ${className}`}
            style={{ width: '20px', height: '20px', verticalAlign: 'text-bottom', display: 'inline-flex' }}
        />
    );
}
