import React, { useState, useRef } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Character, EquippedItem, ShieldCustomization, ShieldRunes } from '../../types';
import { getArmor, getShields, getGear, getWeapons, LoadedArmor, LoadedShield, LoadedGear, LoadedWeapon } from '../../data/pf2e-loader';
import { getEquippedArmorDisplayName } from '../../utils/armorName';
import { getEquippedShieldDisplayName } from '../../utils/shieldName';
import { DetailModal } from './DetailModal';
import { cleanDescriptionForDisplay } from '../../data/pf2e-loader';
import { getShieldStatsWithReinforcing } from '../../data/shieldRunes';

type SelectedItem = { data: LoadedWeapon; type: 'weapon' } | { data: LoadedArmor; type: 'armor' } | { data: LoadedShield; type: 'shield' } | { data: LoadedGear; type: 'gear' };

interface GearPanelProps {
    character: Character;
    onAddGear: () => void;
    onCharacterUpdate: (character: Character) => void;
}

type InventorySection = 'worn' | 'ready' | 'stowed';

interface DragState {
    itemId: string | null;
    sourceSection: InventorySection | null;
    sourceContainerId: string | null;
}

export const GearPanel: React.FC<GearPanelProps> = ({
    character,
    onAddGear,
    onCharacterUpdate,
}) => {
    const { t } = useLanguage();
    const [editingCurrency, setEditingCurrency] = useState(false);
    const [expandedContainers, setExpandedContainers] = useState<Set<string>>(new Set());
    const [dragState, setDragState] = useState<DragState>({
        itemId: null,
        sourceSection: null,
        sourceContainerId: null,
    });
    const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);
    const dragCounter = useRef(0);
    const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);

    // Load all armor, shield and gear data
    const allArmor = getArmor();
    const allShields = getShields();
    const allGear = getGear();

    // Safety defaults for potentially undefined properties
    const equipment = character.equipment || [];
    const currency = character.currency || { cp: 0, sp: 0, gp: 0, pp: 0 };

    // Identify containers - first check isContainer property, fallback to name matching for backward compatibility
    const containers = equipment.filter(item => item.isContainer || item.name?.toLowerCase().includes('backpack') || item.name?.toLowerCase().includes('pouch') || item.name?.toLowerCase().includes('bag of'));

    // Calculate bulk limits
    const strMod = Math.floor(((character.abilityScores?.str ?? 10) - 10) / 2);
    const maxBulk = 5 + strMod;
    const encumberedBulk = maxBulk - 5;

    // Find all worn containers that provide bulk reduction
    // For backpacks: must be worn. For magical containers: always work (held or worn)
    const containersWithReduction = equipment
        .filter(item => {
            const gearData = allGear.find(g => g.id === item.id);
            if (!gearData?.bulkReduction || gearData.bulkReduction <= 0) return false;

            // Check if this is a container (from gear data or item properties)
            const isContainer = gearData?.isContainer || item.isContainer ||
                              item.name?.toLowerCase().includes('backpack') ||
                              item.name?.toLowerCase().includes('pouch') ||
                              item.name?.toLowerCase().includes('bag of');
            if (!isContainer) return false;

            // Magical containers (high reduction like 25) don't need to be worn
            // Regular containers (like backpack) must be worn
            const isMagical = gearData.bulkReduction >= 10;
            return isMagical || item.worn;
        })
        .map(container => {
            const gearData = allGear.find(g => g.id === container.id);
            return {
                container,
                bulkReduction: gearData?.bulkReduction || 0,
            };
        });

    // Calculate current bulk from equipment
    // For each container with bulk reduction, apply reduction to items inside
    let totalBulkReduction = 0;

    for (const { container, bulkReduction } of containersWithReduction) {
        const itemsInContainer = equipment.filter(item => item.containerId === container.id);
        const bulkInContainer = itemsInContainer.reduce((total, item) => total + (item.bulk || 0) * (item.quantity ?? 1), 0);
        const reduction = Math.min(bulkReduction, bulkInContainer);
        totalBulkReduction += reduction;
    }

    // Calculate bulk: sum all items, subtract reduction
    const rawBulk = equipment.reduce((total, item) => total + (item.bulk || 0) * (item.quantity ?? 1), 0);
    const currentBulk = Math.max(0, rawBulk - totalBulkReduction);
    const isEncumbered = currentBulk > encumberedBulk;
    const isOverloaded = currentBulk > maxBulk;

    // Section classification
    const getItemSection = (item: EquippedItem): InventorySection => {
        if (item.wielded) return 'worn';
        if (item.worn || item.invested) return 'worn';
        if (item.containerId) return 'stowed';
        return 'ready';
    };

    // Filter items by section (excluding weapons with wielded property for weapons panel)
    const wornItems = equipment.filter(item => getItemSection(item) === 'worn' && !item.wielded);
    const readyItems = equipment.filter(item => getItemSection(item) === 'ready' && !item.containerId);
    const getContainerItems = (containerId: string) =>
        equipment.filter(item => item.containerId === containerId);

    // Toggle container expansion
    const toggleContainer = (containerId: string) => {
        const newExpanded = new Set(expandedContainers);
        if (newExpanded.has(containerId)) {
            newExpanded.delete(containerId);
        } else {
            newExpanded.add(containerId);
        }
        setExpandedContainers(newExpanded);
    };

    // Calculate container used bulk
    const getContainerUsedBulk = (containerId: string): number => {
        return getContainerItems(containerId).reduce((total, item) => total + (item.bulk || 0) * (item.quantity ?? 1), 0);
    };

    // ===== Drag and Drop Handlers =====
    const handleDragStart = (e: React.DragEvent, item: EquippedItem, section: InventorySection) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', item.id);
        setDragState({
            itemId: item.id,
            sourceSection: section,
            sourceContainerId: item.containerId || null,
        });
        // Add dragging class after a tiny delay for visual feedback
        setTimeout(() => {
            const el = e.target as HTMLElement;
            el.classList.add('dragging');
        }, 0);
    };

    const handleDragEnd = (e: React.DragEvent) => {
        const el = e.target as HTMLElement;
        el.classList.remove('dragging');
        setDragState({ itemId: null, sourceSection: null, sourceContainerId: null });
        setDragOverTarget(null);
        dragCounter.current = 0;
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDragEnter = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        dragCounter.current++;
        setDragOverTarget(targetId);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        dragCounter.current--;
        if (dragCounter.current === 0) {
            setDragOverTarget(null);
        }
    };

    const handleDrop = (e: React.DragEvent, targetSection: InventorySection, targetContainerId?: string) => {
        e.preventDefault();
        dragCounter.current = 0;
        setDragOverTarget(null);

        const draggedItemId = dragState.itemId;
        if (!draggedItemId) return;

        // Find the item
        const itemIndex = equipment.findIndex(item => item.id === draggedItemId);
        if (itemIndex === -1) return;

        const item = equipment[itemIndex];
        const updatedItem = { ...item };

        // Update item properties based on target section
        switch (targetSection) {
            case 'worn':
                updatedItem.worn = true;
                updatedItem.containerId = undefined;
                break;
            case 'ready':
                updatedItem.worn = false;
                updatedItem.containerId = undefined;
                break;
            case 'stowed':
                updatedItem.worn = false;
                updatedItem.containerId = targetContainerId;
                break;
        }

        // Create new equipment array
        const newEquipment = [...equipment];
        newEquipment[itemIndex] = updatedItem;

        // Update character
        onCharacterUpdate({
            ...character,
            equipment: newEquipment,
        });

        setDragState({ itemId: null, sourceSection: null, sourceContainerId: null });
    };

    // Move item out of container
    const moveOutOfContainer = (itemId: string) => {
        const itemIndex = equipment.findIndex(item => item.id === itemId);
        if (itemIndex === -1) return;

        const newEquipment = [...equipment];
        newEquipment[itemIndex] = {
            ...newEquipment[itemIndex],
            containerId: undefined,
        };

        onCharacterUpdate({
            ...character,
            equipment: newEquipment,
        });
    };

    // Currency handlers
    const updateCurrency = (type: 'cp' | 'sp' | 'gp' | 'pp', value: number) => {
        onCharacterUpdate({
            ...character,
            currency: {
                ...currency,
                [type]: Math.max(0, value)
            }
        });
    };

    const adjustCurrency = (type: 'cp' | 'sp' | 'gp' | 'pp', delta: number) => {
        updateCurrency(type, currency[type] + delta);
    };

    // Container delete handler
    const deleteContainer = (containerId: string) => {
        const containerItems = getContainerItems(containerId);

        if (containerItems.length > 0) {
            // Container has items - warn user
            const confirmed = confirm(
                `This container contains ${containerItems.length} item(s). These items will be moved to your inventory. Continue?`
            );
            if (!confirmed) return;

            // Move items out of container first
            const newEquipment = equipment.map(item => {
                if (item.containerId === containerId) {
                    return { ...item, containerId: undefined };
                }
                return item;
            }).filter(item => item.id !== containerId);

            onCharacterUpdate({
                ...character,
                equipment: newEquipment,
            });
        } else {
            // Container is empty - delete directly
            const confirmed = confirm(
                'Delete this container?'
            );
            if (!confirmed) return;

            const newEquipment = equipment.filter(item => item.id !== containerId);
            onCharacterUpdate({
                ...character,
                equipment: newEquipment,
            });
        }
    };

    // Item quantity handlers
    const adjustItemQuantity = (itemId: string, delta: number) => {
        const itemIndex = equipment.findIndex(item => item.id === itemId);
        if (itemIndex === -1) return;

        const item = equipment[itemIndex];
        const currentQuantity = item.quantity ?? 1;
        const newQuantity = Math.max(0, currentQuantity + delta);

        if (newQuantity === 0) {
            // Remove item when quantity reaches 0
            const newEquipment = equipment.filter(i => i.id !== itemId);
            onCharacterUpdate({
                ...character,
                equipment: newEquipment,
            });
        } else {
            // Update quantity
            const newEquipment = [...equipment];
            newEquipment[itemIndex] = {
                ...newEquipment[itemIndex],
                quantity: newQuantity,
            };
            onCharacterUpdate({
                ...character,
                equipment: newEquipment,
            });
        }
    };

    // Currency conversion
    const convertUp = (from: 'cp' | 'sp' | 'gp', to: 'sp' | 'gp' | 'pp') => {
        const rate = 10;
        if (currency[from] >= rate) {
            onCharacterUpdate({
                ...character,
                currency: {
                    ...currency,
                    [from]: currency[from] - rate,
                    [to]: currency[to] + 1
                }
            });
        }
    };

    const convertDown = (from: 'sp' | 'gp' | 'pp', to: 'cp' | 'sp' | 'gp') => {
        const rate = 10;
        if (currency[from] >= 1) {
            onCharacterUpdate({
                ...character,
                currency: {
                    ...currency,
                    [from]: currency[from] - 1,
                    [to]: currency[to] + rate
                }
            });
        }
    };

    // Calculate total wealth in GP
    const totalWealth =
        currency.cp / 100 +
        currency.sp / 10 +
        currency.gp +
        currency.pp * 10;

    // Check if an item is armor or shield
    const isArmorOrShield = (itemId: string): boolean => {
        return allArmor.some(a => a.id === itemId) || allShields.some(s => s.id === itemId);
    };

    // Load all weapons data
    const allWeapons = getWeapons();

    // Get item data by id
    const getItemData = (itemId: string) => {
        const weapon = allWeapons.find(w => w.id === itemId);
        if (weapon) return { data: weapon, type: 'weapon' as const };
        const armor = allArmor.find(a => a.id === itemId);
        if (armor) return { data: armor, type: 'armor' as const };
        const shield = allShields.find(s => s.id === itemId);
        if (shield) return { data: shield, type: 'shield' as const };
        const gear = allGear.find(g => g.id === itemId);
        if (gear) return { data: gear, type: 'gear' as const };
        return null;
    };

    // Handle item click to show description
    const handleItemClick = (itemId: string) => {
        const itemData = getItemData(itemId);
        if (itemData) {
            setSelectedItem(itemData);
        }
    };

    // Restore weapon/armor/shield to equipped slot
    const handleRestoreToDefense = () => {
        if (!selectedItem) return;

        const currentEquipment = character.equipment || [];

        if (selectedItem.type === 'weapon') {
            // Restore the weapon to wielded state
            const weapon = selectedItem.data as LoadedWeapon;

            // Check if weapon is already wielded
            const weaponInEquipment = currentEquipment.find(item => item.id === weapon.id);
            if (weaponInEquipment?.wielded) {
                // Already wielded, nothing to do
                setSelectedItem(null);
                return;
            }

            onCharacterUpdate({
                ...character,
                equipment: currentEquipment.map(item =>
                    item.id === weapon.id
                        ? { ...item, wielded: { hands: weapon.hands as 1 | 2 } }
                        : item
                ),
            });
            setSelectedItem(null);
        } else if (selectedItem.type === 'armor') {
            // Check if there's already an equipped armor
            if (character.equippedArmor && character.equippedArmor !== selectedItem.data.id) {
                alert(t('gear.armorAlreadyEquipped'));
                return;
            }

            // Restore the armor to Defense slot
            const armor = selectedItem.data as LoadedArmor;

            // Get the equipment entry to check for runes
            const armorEquipment = currentEquipment.find(e => e.id === armor.id);
            const armorRunes = armorEquipment?.runes as { potencyRune?: number; resilientRune?: number; propertyRunes?: string[] } | undefined;
            const armorCustomization = armorEquipment?.customization as any;

            onCharacterUpdate({
                ...character,
                equippedArmor: armor.id,
                equipment: currentEquipment.filter(item => item.id !== armor.id),  // Remove from inventory
                armorClass: {
                    ...character.armorClass,
                    acBonus: armor.acBonus,
                    itemBonus: armorRunes?.potencyRune || 0,  // Apply potency rune bonus to AC
                    dexCap: armorCustomization?.dexCapOverride ?? armor.dexCap,
                }
            });
            setSelectedItem(null);
        } else if (selectedItem.type === 'shield') {
            // Check if there's already an equipped shield
            if (character.equippedShield && character.equippedShield !== selectedItem.data.id) {
                alert(t('gear.shieldAlreadyEquipped'));
                return;
            }

            // Restore the shield to Defense slot
            const shield = selectedItem.data as LoadedShield;

            // Get the equipment entry to check for runes and customization
            const shieldEquipment = currentEquipment.find(e => e.id === shield.id);
            const shieldRunes = shieldEquipment?.runes as ShieldRunes | undefined;
            const customization = shieldEquipment?.customization as ShieldCustomization | undefined;
            const reinforcingRune = shieldRunes?.reinforcingRune;

            let maxHp = shield.maxHp;
            let currentHp = shield.hp;

            // Apply reinforcing rune HP bonus if exists
            if (reinforcingRune) {
                const stats = getShieldStatsWithReinforcing(shield.hardness, shield.maxHp, reinforcingRune);
                maxHp = stats.maxHP;
                currentHp = customization?.currentHP ?? maxHp;
            }

            onCharacterUpdate({
                ...character,
                equippedShield: shield.id,
                equipment: currentEquipment.filter(item => item.id !== shield.id),  // Remove from inventory
                shieldState: {
                    currentHp: currentHp,
                    raised: false
                }
            });
            setSelectedItem(null);
        }
    };

    // Swap armor/shield with Defense slot
    const handleSwapWithDefense = () => {
        if (!selectedItem) return;

        const currentEquipment = character.equipment || [];

        if (selectedItem.type === 'armor') {
            const armor = selectedItem.data as LoadedArmor;

            // Get the equipment entry to check for runes
            const armorEquipment = currentEquipment.find(e => e.id === armor.id);
            const armorRunes = armorEquipment?.runes as { potencyRune?: number; resilientRune?: number; propertyRunes?: string[] } | undefined;
            const armorCustomization = armorEquipment?.customization as any;

            onCharacterUpdate({
                ...character,
                equippedArmor: armor.id,
                equipment: currentEquipment.filter(item => item.id !== armor.id),  // Remove from inventory
                armorClass: {
                    ...character.armorClass,
                    acBonus: armor.acBonus,
                    itemBonus: armorRunes?.potencyRune || 0,  // Apply potency rune bonus to AC
                    dexCap: armorCustomization?.dexCapOverride ?? armor.dexCap,
                }
            });
            setSelectedItem(null);
        } else if (selectedItem.type === 'shield') {
            const shield = selectedItem.data as LoadedShield;

            // Get the equipment entry to check for runes and customization
            const shieldEquipment = currentEquipment.find(e => e.id === shield.id);
            const shieldRunes = shieldEquipment?.runes as ShieldRunes | undefined;
            const customization = shieldEquipment?.customization as ShieldCustomization | undefined;
            const reinforcingRune = shieldRunes?.reinforcingRune;

            let maxHp = shield.maxHp;
            let currentHp = shield.hp;

            // Apply reinforcing rune HP bonus if exists
            if (reinforcingRune) {
                const stats = getShieldStatsWithReinforcing(shield.hardness, shield.maxHp, reinforcingRune);
                maxHp = stats.maxHP;
                currentHp = customization?.currentHP ?? maxHp;
            }

            onCharacterUpdate({
                ...character,
                equippedShield: shield.id,
                equipment: currentEquipment.filter(item => item.id !== shield.id),  // Remove from inventory
                shieldState: {
                    currentHp: currentHp,
                    raised: false
                }
            });
            setSelectedItem(null);
        }
    };

    // Get the display name for an item (with rune enhancements for armor/shields)
    const getItemDisplayName = (item: EquippedItem): string => {
        const armorData = allArmor.find(a => a.id === item.id);
        const shieldData = allShields.find(s => s.id === item.id);

        // Check for custom name first
        const customization = item.customization as any;
        if (customization?.customName) {
            return customization.customName;
        }

        // Use enhanced name for armor
        if (armorData) {
            return getEquippedArmorDisplayName(item, armorData.name, { language: t('language') as 'en' | 'it' });
        }

        // Use enhanced name for shield
        if (shieldData) {
            return getEquippedShieldDisplayName(item, shieldData.name, { language: t('language') as 'en' | 'it' });
        }

        return item.name;
    };

    // Render a single gear item
    const renderGearItem = (item: EquippedItem, section: InventorySection, inContainer = false) => {
        const isDragging = dragState.itemId === item.id;
        const isContainer = item.isContainer || item.name?.toLowerCase().includes('backpack') || item.name?.toLowerCase().includes('pouch') || item.name?.toLowerCase().includes('bag of');
        const isArmor = isArmorOrShield(item.id);
        const displayName = getItemDisplayName(item);
        const quantity = item.quantity ?? 1;

        return (
            <div
                key={item.id}
                className={`gear-item ${isContainer ? 'container' : ''} ${isDragging ? 'dragging' : ''}`}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, item, section)}
                onDragEnd={handleDragEnd}
                onClick={() => handleItemClick(item.id)}
            >
                <div className="gear-info">
                    <span className="gear-drag-handle">⋮⋮</span>
                    <span className="gear-name">
                        {item.invested && <span className="invested-dot">●</span>}
                        {isContainer && <span className="container-icon">📦</span>}
                        {displayName}
                    </span>
                    <span className="gear-bulk">
                        {item.bulk > 0 ? `${item.bulk}B` : 'L'}
                    </span>
                </div>
                <div className="gear-actions">
                    {!isContainer && (
                        <div className="gear-quantity">
                            <button
                                className="quantity-btn minus"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    adjustItemQuantity(item.id, -1);
                                }}
                                title={quantity === 1 ? "Remove item" : "Decrease quantity"}
                            >
                                −
                            </button>
                            <span className="quantity-value">{quantity}</span>
                            <button
                                className="quantity-btn plus"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    adjustItemQuantity(item.id, 1);
                                }}
                                title="Increase quantity"
                            >
                                +
                            </button>
                        </div>
                    )}
                    {item.worn && (
                        <span className="gear-status worn">{t('status.worn') || 'Worn'}</span>
                    )}
                    {inContainer && (
                        <button
                            className="gear-remove-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                moveOutOfContainer(item.id);
                            }}
                            title="Remove from container"
                        >
                            ↑
                        </button>
                    )}
                </div>
            </div>
        );
    };

    // Render a container with its contents
    const renderContainer = (container: EquippedItem) => {
        const isExpanded = expandedContainers.has(container.id);
        const containerItems = getContainerItems(container.id);
        const usedBulk = getContainerUsedBulk(container.id);
        const capacity = container.capacity || 4; // Default capacity
        const isDragOver = dragOverTarget === `container-${container.id}`;

        return (
            <div key={container.id} className="container-section">
                <div
                    className={`container-header ${isExpanded ? 'expanded' : ''}`}
                >
                    <div
                        className="container-info"
                        onClick={() => toggleContainer(container.id)}
                    >
                        <span className="container-toggle">{isExpanded ? '▼' : '▶'}</span>
                        <span className="container-icon">📦</span>
                        <span className="container-name">{container.name}</span>
                    </div>
                    <div className="container-capacity">
                        <span className={usedBulk > capacity ? 'over-capacity' : ''}>
                            {usedBulk}/{capacity}B
                        </span>
                        <button
                            className="container-delete-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteContainer(container.id);
                            }}
                            title="Elimina contenitore"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {isExpanded && (
                    <div
                        className={`container-contents ${isDragOver ? 'drag-over' : ''}`}
                        onDragOver={handleDragOver}
                        onDragEnter={(e) => handleDragEnter(e, `container-${container.id}`)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, 'stowed', container.id)}
                    >
                        {containerItems.length === 0 ? (
                            <div className="container-empty">
                                {t('builder.dropHere') || 'Drop items here'}
                            </div>
                        ) : (
                            containerItems.map(item => renderGearItem(item, 'stowed', true))
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="gear-panel">
            <div className="panel-header">
                <h3>{t('tabs.gear') || 'Gear'}</h3>
                <button className="header-btn" onClick={onAddGear}>
                    + {t('actions.addGear') || 'Add Gear'}
                </button>
            </div>

            {/* Bulk Tracker */}
            <div className="bulk-tracker">
                <div className="bulk-header">
                    <span className="bulk-label">{t('stats.bulk') || 'Bulk'}</span>
                    <span className={`bulk-value ${isOverloaded ? 'overloaded' : isEncumbered ? 'encumbered' : ''}`}>
                        {currentBulk} / {maxBulk}
                        {totalBulkReduction > 0 && (
                            <span className="bulk-reduction" title="Container reduction">
                                (-{totalBulkReduction})
                            </span>
                        )}
                    </span>
                </div>
                <div className="bulk-bar">
                    <div
                        className={`bulk-fill ${isOverloaded ? 'overloaded' : isEncumbered ? 'encumbered' : ''}`}
                        style={{ width: `${Math.min((currentBulk / maxBulk) * 100, 100)}%` }}
                    />
                    <div
                        className="bulk-encumbered-marker"
                        style={{ left: `${(encumberedBulk / maxBulk) * 100}%` }}
                    />
                </div>
                {isEncumbered && !isOverloaded && (
                    <span className="bulk-warning">{t('status.encumbered') || 'Encumbered'}</span>
                )}
                {isOverloaded && (
                    <span className="bulk-danger">{t('status.overloaded') || 'Overloaded'}</span>
                )}
            </div>

            {/* Currency Section */}
            <div className="currency-section">
                <div className="currency-header">
                    <span className="currency-label">{t('stats.currency') || 'Currency'}</span>
                    <button
                        className="edit-currency-btn"
                        onClick={() => setEditingCurrency(!editingCurrency)}
                    >
                        {editingCurrency ? '✓' : '✎'}
                    </button>
                </div>

                <div className="currency-total">
                    Total: {totalWealth.toFixed(2)} gp
                </div>

                <div className="currency-grid">
                    {(['pp', 'gp', 'sp', 'cp'] as const).map(type => (
                        <div key={type} className="currency-item">
                            <span className={`currency-type ${type}`}>{type.toUpperCase()}</span>
                            {editingCurrency ? (
                                <div className="currency-controls">
                                    <button
                                        className="currency-btn minus"
                                        onClick={() => adjustCurrency(type, -1)}
                                        disabled={currency[type] <= 0}
                                    >
                                        −
                                    </button>
                                    <input
                                        type="number"
                                        className="currency-input"
                                        value={currency[type]}
                                        onChange={(e) => updateCurrency(type, parseInt(e.target.value) || 0)}
                                        min={0}
                                    />
                                    <button
                                        className="currency-btn plus"
                                        onClick={() => adjustCurrency(type, 1)}
                                    >
                                        +
                                    </button>
                                </div>
                            ) : (
                                <span className="currency-amount">{currency[type]}</span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Currency Conversion */}
                {editingCurrency && (
                    <div className="currency-conversion">
                        <span className="conversion-label">Convert:</span>
                        <div className="conversion-buttons">
                            <button
                                className="convert-btn"
                                onClick={() => convertUp('cp', 'sp')}
                                disabled={currency.cp < 10}
                                title="10 CP → 1 SP"
                            >
                                10cp→1sp
                            </button>
                            <button
                                className="convert-btn"
                                onClick={() => convertUp('sp', 'gp')}
                                disabled={currency.sp < 10}
                                title="10 SP → 1 GP"
                            >
                                10sp→1gp
                            </button>
                            <button
                                className="convert-btn"
                                onClick={() => convertUp('gp', 'pp')}
                                disabled={currency.gp < 10}
                                title="10 GP → 1 PP"
                            >
                                10gp→1pp
                            </button>
                        </div>
                        <div className="conversion-buttons">
                            <button
                                className="convert-btn"
                                onClick={() => convertDown('sp', 'cp')}
                                disabled={currency.sp < 1}
                                title="1 SP → 10 CP"
                            >
                                1sp→10cp
                            </button>
                            <button
                                className="convert-btn"
                                onClick={() => convertDown('gp', 'sp')}
                                disabled={currency.gp < 1}
                                title="1 GP → 10 SP"
                            >
                                1gp→10sp
                            </button>
                            <button
                                className="convert-btn"
                                onClick={() => convertDown('pp', 'gp')}
                                disabled={currency.pp < 1}
                                title="1 PP → 10 GP"
                            >
                                1pp→10gp
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Invested Items */}
            <div className="invested-tracker">
                <span className="invested-label">{t('stats.invested') || 'Invested'}</span>
                <span className="invested-value">
                    {equipment.filter(i => i.invested).length} / 10
                </span>
            </div>

            {/* Worn Section */}
            <div className="inventory-section">
                <div className="section-header">
                    <h4>👤 {t('inventory.worn') || 'Worn'}</h4>
                    <span className="section-count">{wornItems.length}</span>
                </div>
                <div
                    className={`section-content ${dragOverTarget === 'worn' ? 'drag-over' : ''}`}
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => handleDragEnter(e, 'worn')}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'worn')}
                >
                    {wornItems.length === 0 ? (
                        <div className="section-empty">{t('inventory.dropWorn') || 'Drop worn items here'}</div>
                    ) : (
                        wornItems.map(item => renderGearItem(item, 'worn'))
                    )}
                </div>
            </div>

            {/* Ready Section */}
            <div className="inventory-section">
                <div className="section-header">
                    <h4>✋ {t('inventory.ready') || 'Ready'}</h4>
                    <span className="section-count">{readyItems.length}</span>
                </div>
                <div
                    className={`section-content ${dragOverTarget === 'ready' ? 'drag-over' : ''}`}
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => handleDragEnter(e, 'ready')}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'ready')}
                >
                    {readyItems.length === 0 ? (
                        <div className="section-empty">{t('inventory.dropReady') || 'Drop ready items here'}</div>
                    ) : (
                        readyItems.map(item => renderGearItem(item, 'ready'))
                    )}
                </div>
            </div>

            {/* Containers Section */}
            {containers.length > 0 && (
                <div className="inventory-section">
                    <div className="section-header">
                        <h4>🎒 {t('inventory.stowed') || 'Stowed'}</h4>
                        <span className="section-count">{containers.length}</span>
                    </div>
                    <div className="containers-list">
                        {containers.map(container => renderContainer(container))}
                    </div>
                </div>
            )}

            {/* Empty State - only show if ALL lists are empty */}
            {equipment.length === 0 && (
                <div className="empty-state">
                    <div className="empty-state-icon">🎒</div>
                    <p>{t('builder.noGear') || 'No gear in inventory.'}</p>
                    <p className="empty-state-hint">
                        {t('builder.addGearHint') || 'Add equipment, consumables, and treasure.'}
                    </p>
                </div>
            )}

            {/* Item Detail Modal */}
            {selectedItem && (
                <DetailModal
                    isOpen={!!selectedItem}
                    onClose={() => setSelectedItem(null)}
                    title={selectedItem.data.name}
                    subtitle={`${selectedItem.data.rarity} • Level ${selectedItem.data.level}`}
                    actions={(selectedItem.type === 'armor' || selectedItem.type === 'shield' || selectedItem.type === 'weapon') ? (
                        <div className="modal-actions-gear">
                            <button
                                className="restore-btn"
                                onClick={handleRestoreToDefense}
                                title={
                                    selectedItem.type === 'weapon' ? (t('actions.wield') || 'Wield') :
                                    selectedItem.type === 'armor' ? t('gear.restoreToDefense') :
                                    t('gear.restoreToDefense')
                                }
                            >
                                {selectedItem.type === 'weapon' ? (t('actions.wield') || 'Wield') : t('gear.restore')} ↺
                            </button>
                            {selectedItem.type !== 'weapon' && (
                                <button
                                    className="swap-btn"
                                    onClick={handleSwapWithDefense}
                                    title={selectedItem.type === 'armor' ? t('gear.swapWithDefense') : t('gear.swapWithDefense')}
                                >
                                    {t('gear.swap')} ⇄
                                </button>
                            )}
                        </div>
                    ) : undefined}
                >
                    <div className="item-detail-content">
                        {selectedItem.data.traits && selectedItem.data.traits.length > 0 && (
                            <div className="item-traits">
                                {selectedItem.data.traits.map(trait => (
                                    <span key={trait} className="trait-badge">{trait}</span>
                                ))}
                            </div>
                        )}
                        <p className="item-description">
                            {cleanDescriptionForDisplay(selectedItem.data.description)}
                        </p>
                        {'priceGp' in selectedItem.data && selectedItem.data.priceGp > 0 && (
                            <div className="item-price">
                                Price: {selectedItem.data.priceGp} gp
                            </div>
                        )}
                        {'bulk' in selectedItem.data && (
                            <div className="item-bulk">
                                Bulk: {selectedItem.data.bulk > 0 ? `${selectedItem.data.bulk}B` : 'L'}
                            </div>
                        )}
                    </div>
                </DetailModal>
            )}
        </div>
    );
};

export default GearPanel;
