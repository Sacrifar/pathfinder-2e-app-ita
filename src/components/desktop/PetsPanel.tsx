import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Character, Pet, PetType, Proficiency } from '../../types/character';
import {
    createFamiliar,
    createAnimalCompanion,
    createEidolon,
    getFamiliarAbilities,
    getAnimalCompanionTemplates,
    getEidolonTemplates,
} from '../../data/pets';
import { getAbilityModifier } from '../../utils/pf2e-math';
import { calculateFamiliarStats, calculateCompanionStats, calculateEidolonStats } from '../../utils/petStats';

interface PetsPanelProps {
    character: Character;
    onCharacterUpdate: (character: Character) => void;
}

export const PetsPanel: React.FC<PetsPanelProps> = ({
    character,
    onCharacterUpdate,
}) => {
    const { t, language } = useLanguage();
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedPetType, setSelectedPetType] = useState<PetType | null>(null);
    const [editingPet, setEditingPet] = useState<Pet | null>(null);
    const [newPetName, setNewPetName] = useState('');
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [selectedAbilities, setSelectedAbilities] = useState<string[]>([]);

    const pets = character.pets || [];
    const conMod = getAbilityModifier(character.abilityScores.con);

    // Helper functions at component level
    const getLocalizedSize = (size: string) => {
        return t(`pets.size.${size}`) || size;
    };

    const getLocalizedProficiency = (prof: Proficiency) => {
        return t(`pets.proficiency.${prof}`) || prof;
    };

    const handleAddPet = () => {
        setShowAddModal(true);
        setSelectedPetType(null);
        setNewPetName('');
        setSelectedTemplateId('');
        setSelectedAbilities([]);
    };

    const handleDeletePet = (petId: string) => {
        const updatedPets = pets.filter(p => p.id !== petId);
        console.log('Deleting pet:', petId, 'Remaining pets:', updatedPets.length);
        onCharacterUpdate({
            ...character,
            pets: updatedPets,
        });
    };

    const handleEditPet = (pet: Pet) => {
        setEditingPet(pet);
        if (pet.type === 'familiar') {
            const data = pet.data as any;
            setSelectedAbilities(data.selectedAbilities || []);
        }
    };

    const handlePetHPChange = (petId: string, change: number) => {
        const updatedPets = pets.map(p => {
            if (p.id !== petId) return p;

            if (p.type === 'familiar') return p; // Familiars don't have HP

            const data = p.data as any;
            const newHP = Math.max(0, Math.min(data.hitPoints.max, data.hitPoints.current + change));

            return {
                ...p,
                data: {
                    ...data,
                    hitPoints: {
                        ...data.hitPoints,
                        current: newHP,
                    },
                },
            };
        });
        onCharacterUpdate({ ...character, pets: updatedPets });
    };

    const handleToggleSharesHP = (pet: Pet) => {
        if (pet.type !== 'eidolon') return;

        const updatedPets = pets.map(p => {
            if (p.id !== pet.id) return p;

            const data = p.data as any;
            return {
                ...p,
                data: {
                    ...data,
                    sharesHP: !data.sharesHP,
                },
            };
        });
        onCharacterUpdate({ ...character, pets: updatedPets });
    };

    const handleConfirmAddPet = () => {
        if (!selectedPetType || !newPetName.trim()) return;

        let newPet: Pet;

        try {
            switch (selectedPetType) {
                case 'familiar':
                    newPet = createFamiliar(newPetName.trim(), selectedAbilities);
                    break;
                case 'animal-companion':
                    if (!selectedTemplateId) return;
                    newPet = createAnimalCompanion(newPetName.trim(), selectedTemplateId, character.level, conMod);
                    break;
                case 'eidolon':
                    if (!selectedTemplateId) return;
                    newPet = createEidolon(newPetName.trim(), selectedTemplateId, character.level, conMod);
                    break;
                default:
                    return;
            }

            onCharacterUpdate({
                ...character,
                pets: [...pets, newPet],
            });

            setShowAddModal(false);
            setNewPetName('');
            setSelectedPetType(null);
            setSelectedTemplateId('');
            setSelectedAbilities([]);
        } catch (error) {
            console.error('Error creating pet:', error);
        }
    };

    const handleAddFamiliarAbility = (abilityId: string) => {
        if (selectedAbilities.includes(abilityId)) {
            setSelectedAbilities(selectedAbilities.filter(id => id !== abilityId));
        } else if (selectedAbilities.length < 2) {
            setSelectedAbilities([...selectedAbilities, abilityId]);
        }
    };

    const handleSaveFamiliarAbilities = () => {
        if (!editingPet || editingPet.type !== 'familiar') return;

        const updatedPets = pets.map(p => {
            if (p.id !== editingPet.id) return p;

            const data = p.data as any;
            return {
                ...p,
                data: {
                    ...data,
                    selectedAbilities,
                },
            };
        });

        onCharacterUpdate({ ...character, pets: updatedPets });
        setEditingPet(null);
    };

    const renderPetCard = (pet: Pet) => {
        const isFamiliar = pet.type === 'familiar';
        const isAnimalCompanion = pet.type === 'animal-companion';
        const isEidolon = pet.type === 'eidolon';

        // Calculate stats dynamically based on master's stats
        const familiarStats = useMemo(() => {
            if (isFamiliar) {
                return calculateFamiliarStats(pet as any, character);
            }
            return null;
        }, [isFamiliar, pet, character]);

        const companionStats = useMemo(() => {
            if (isAnimalCompanion) {
                return calculateCompanionStats(pet as any, character);
            }
            return null;
        }, [isAnimalCompanion, pet, character]);

        const eidolonStats = useMemo(() => {
            if (isEidolon) {
                return calculateEidolonStats(pet as any, character);
            }
            return null;
        }, [isEidolon, pet, character]);

        return (
            <div
                key={pet.id}
                className="card pet-card"
                style={{
                    background: 'var(--bg-elevated, #1a1a1a)',
                    border: '1px solid var(--border-primary, #333)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '16px',
                }}
            >
                {/* Pet Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                    paddingBottom: '12px',
                    borderBottom: '1px solid var(--border-primary, #333)',
                }}>
                    <div>
                        <h3 style={{
                            margin: 0,
                            fontSize: '18px',
                            color: 'var(--text-primary, #fff)',
                        }}>
                            {pet.name}
                        </h3>
                        <div style={{
                            fontSize: '13px',
                            color: 'var(--text-secondary, #888)',
                            marginTop: '4px',
                        }}>
                            {pet.type === 'familiar' && (t('pets.familiar') || 'Familiar')}
                            {pet.type === 'animal-companion' && (t('pets.animalCompanion') || 'Animal Companion')}
                            {pet.type === 'eidolon' && (t('pets.eidolon') || 'Eidolon')}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            className="btn-icon"
                            onClick={() => handleEditPet(pet)}
                            title={t('pets.edit') || 'Edit'}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-secondary, #888)',
                                cursor: 'pointer',
                                padding: '4px 8px',
                            }}
                        >
                            ✎
                        </button>
                        <button
                            type="button"
                            className="btn-icon"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                e.nativeEvent.stopImmediatePropagation();
                                console.log('Delete button clicked for pet:', pet.id);
                                handleDeletePet(pet.id);
                            }}
                            title={t('pets.delete') || 'Delete'}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--color-danger, #dc2626)',
                                cursor: 'pointer',
                                padding: '4px 8px',
                                fontSize: '20px',
                                lineHeight: '1',
                                pointerEvents: 'auto',
                            }}
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Familiar View */}
                {isFamiliar && familiarStats && (
                    <div className="familiar-view">
                        <div style={{ marginBottom: '12px' }}>
                            <h4 style={{
                                margin: '0 0 8px 0',
                                fontSize: '14px',
                                color: 'var(--text-secondary, #888)',
                            }}>
                                {t('pets.familiar.abilities') || 'Familiar Abilities'}
                            </h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {(pet.data as any).selectedAbilities.map((abilityId: string) => {
                                    const ability = getFamiliarAbilities().find(a => a.id === abilityId);
                                    if (!ability) return null;
                                    return (
                                        <span
                                            key={abilityId}
                                            style={{
                                                background: 'var(--bg-secondary, #2a2a2a)',
                                                border: '1px solid var(--border-primary, #333)',
                                                borderRadius: '6px',
                                                padding: '6px 12px',
                                                fontSize: '13px',
                                                color: 'var(--text-primary, #fff)',
                                            }}
                                        >
                                            {language === 'it' && ability.nameIt ? ability.nameIt : ability.name}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                        <div style={{
                            fontSize: '12px',
                            color: 'var(--text-secondary, #888)',
                            lineHeight: '1.5',
                        }}>
                            <div>🎯 {t('pets.perception') || 'Perception'}: {familiarStats.perception}</div>
                            <div>🛡️ {t('pets.ac') || 'AC'}: {familiarStats.ac}</div>
                            <div>❤️ {t('pets.hp') || 'HP'}: {familiarStats.hp}</div>
                            <div>🎲 {t('pets.fortitude') || 'Fortitude'}: {familiarStats.saves.fortitude}</div>
                            <div>⚡ {t('pets.reflex') || 'Reflex'}: {familiarStats.saves.reflex}</div>
                            <div>🧠 {t('pets.will') || 'Will'}: {familiarStats.saves.will}</div>
                            <div>👁️ {t('pets.stealth') || 'Stealth'}: {familiarStats.stealth}</div>
                            <div>🏃 {t('pets.speed') || 'Speed'}: 25 feet</div>
                        </div>
                    </div>
                )}

                {/* Animal Companion View */}
                {isAnimalCompanion && companionStats && (
                    <div className="animal-companion-view">
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                            gap: '12px',
                            marginBottom: '12px',
                        }}>
                            <div style={{
                                background: 'var(--bg-secondary, #2a2a2a)',
                                border: '1px solid var(--border-primary, #333)',
                                borderRadius: '8px',
                                padding: '12px',
                                textAlign: 'center',
                            }}>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary, #888)', marginBottom: '4px' }}>
                                    {t('pets.level') || 'Level'}
                                </div>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary, #fff)' }}>
                                    {(pet.data as any).level}
                                </div>
                            </div>
                            <div style={{
                                background: 'var(--bg-secondary, #2a2a2a)',
                                border: '1px solid var(--border-primary, #333)',
                                borderRadius: '8px',
                                padding: '12px',
                                textAlign: 'center',
                            }}>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary, #888)', marginBottom: '4px' }}>
                                    {t('pets.hp') || 'HP'}
                                </div>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary, #fff)' }}>
                                    {companionStats.hitPoints?.current || (pet.data as any).hitPoints.current} / {companionStats.hitPoints?.max || (pet.data as any).hitPoints.max}
                                </div>
                            </div>
                            <div style={{
                                background: 'var(--bg-secondary, #2a2a2a)',
                                border: '1px solid var(--border-primary, #333)',
                                borderRadius: '8px',
                                padding: '12px',
                                textAlign: 'center',
                            }}>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary, #888)', marginBottom: '4px' }}>
                                    {t('pets.ac') || 'AC'}
                                </div>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary, #fff)' }}>
                                    {companionStats.armorClass || (pet.data as any).armorClass}
                                </div>
                            </div>
                        </div>

                        {/* HP Controls */}
                        <div style={{
                            display: 'flex',
                            gap: '8px',
                            marginBottom: '12px',
                        }}>
                            <button
                                onClick={() => handlePetHPChange(pet.id, -1)}
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    background: 'var(--bg-secondary, #2a2a2a)',
                                    border: '1px solid var(--border-primary, #333)',
                                    borderRadius: '6px',
                                    color: 'var(--text-primary, #fff)',
                                    cursor: 'pointer',
                                }}
                            >
                                −1 HP
                            </button>
                            <button
                                onClick={() => handlePetHPChange(pet.id, 1)}
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    background: 'var(--bg-secondary, #2a2a2a)',
                                    border: '1px solid var(--border-primary, #333)',
                                    borderRadius: '6px',
                                    color: 'var(--text-primary, #fff)',
                                    cursor: 'pointer',
                                }}
                            >
                                +1 HP
                            </button>
                        </div>

                        {/* Stats */}
                        <div style={{
                            background: 'var(--bg-secondary, #2a2a2a)',
                            border: '1px solid var(--border-primary, #333)',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '12px',
                        }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '8px',
                                fontSize: '12px',
                            }}>
                                <div style={{ color: 'var(--text-secondary, #888)' }}>
                                    {getLocalizedSize((pet.data as any).size)}
                                </div>
                                <div style={{ color: 'var(--text-secondary, #888)' }}>
                                    {t('pets.perception') || 'Perception'}: {(pet.data as any).perception}
                                </div>
                                <div style={{ color: 'var(--text-secondary, #888)' }}>
                                    Fort: {getLocalizedProficiency((pet.data as any).Fortitude)}
                                </div>
                                <div style={{ color: 'var(--text-secondary, #888)' }}>
                                    Ref: {getLocalizedProficiency((pet.data as any).reflex)}
                                </div>
                                <div style={{ color: 'var(--text-secondary, #888)' }}>
                                    Will: {getLocalizedProficiency((pet.data as any).will)}
                                </div>
                                <div style={{ color: 'var(--text-secondary, #888)' }}>
                                    {t('pets.speed') || 'Speed'}: {(pet.data as any).speed.land} ft
                                </div>
                            </div>
                        </div>

                        {/* Attacks */}
                        <div>
                            <h4 style={{
                                margin: '0 0 8px 0',
                                fontSize: '14px',
                                color: 'var(--text-secondary, #888)',
                            }}>
                                {t('pets.attacks') || 'Attacks'}
                            </h4>
                            {(pet.data as any).attacks.map((attack: any, idx: number) => (
                                <div
                                    key={idx}
                                    style={{
                                        background: 'var(--bg-secondary, #2a2a2a)',
                                        border: '1px solid var(--border-primary, #333)',
                                        borderRadius: '6px',
                                        padding: '8px 12px',
                                        marginBottom: '6px',
                                        fontSize: '13px',
                                    }}
                                >
                                    <div style={{ color: 'var(--text-primary, #fff)', fontWeight: 'bold' }}>
                                        {attack.name} {attack.actionCost ? `[${attack.actionCost}]` : ''}
                                    </div>
                                    <div style={{ color: 'var(--text-secondary, #888)', fontSize: '12px' }}>
                                        +{attack.attackBonus} • {attack.damage} {attack.damageType}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Eidolon View */}
                {isEidolon && eidolonStats && (
                    <div className="eidolon-view">
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                            gap: '12px',
                            marginBottom: '12px',
                        }}>
                            <div style={{
                                background: 'var(--bg-secondary, #2a2a2a)',
                                border: '1px solid var(--border-primary, #333)',
                                borderRadius: '8px',
                                padding: '12px',
                                textAlign: 'center',
                            }}>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary, #888)', marginBottom: '4px' }}>
                                    {t('pets.level') || 'Level'}
                                </div>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary, #fff)' }}>
                                    {(pet.data as any).level}
                                </div>
                            </div>
                            <div style={{
                                background: 'var(--bg-secondary, #2a2a2a)',
                                border: '1px solid var(--border-primary, #333)',
                                borderRadius: '8px',
                                padding: '12px',
                                textAlign: 'center',
                            }}>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary, #888)', marginBottom: '4px' }}>
                                    {t('pets.hp') || 'HP'}
                                </div>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary, #fff)' }}>
                                    {eidolonStats.hitPoints?.current || (pet.data as any).hitPoints.current} / {eidolonStats.hitPoints?.max || (pet.data as any).hitPoints.max}
                                </div>
                            </div>
                            <div style={{
                                background: 'var(--bg-secondary, #2a2a2a)',
                                border: '1px solid var(--border-primary, #333)',
                                borderRadius: '8px',
                                padding: '12px',
                                textAlign: 'center',
                            }}>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary, #888)', marginBottom: '4px' }}>
                                    {t('pets.eidolan.evolutionPoints') || 'EP'}
                                </div>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary, #fff)' }}>
                                    {(pet.data as any).evolutionPoints}
                                </div>
                            </div>
                        </div>

                        {/* Shares HP Toggle */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '12px',
                            padding: '12px',
                            background: 'var(--bg-secondary, #2a2a2a)',
                            border: '1px solid var(--border-primary, #333)',
                            borderRadius: '8px',
                        }}>
                            <input
                                type="checkbox"
                                id={`shares-hp-${pet.id}`}
                                checked={(pet.data as any).sharesHP || false}
                                onChange={() => handleToggleSharesHP(pet)}
                                style={{
                                    width: '18px',
                                    height: '18px',
                                    cursor: 'pointer',
                                }}
                            />
                            <label
                                htmlFor={`shares-hp-${pet.id}`}
                                style={{
                                    margin: 0,
                                    fontSize: '13px',
                                    color: 'var(--text-primary, #fff)',
                                    cursor: 'pointer',
                                }}
                            >
                                {t('pets.eidolon.sharesHP') || 'Shares HP with Summoner'}
                            </label>
                        </div>

                        {/* HP Controls (if not sharing) */}
                        {!(pet.data as any).sharesHP && (
                            <div style={{
                                display: 'flex',
                                gap: '8px',
                                marginBottom: '12px',
                            }}>
                                <button
                                    onClick={() => handlePetHPChange(pet.id, -1)}
                                    style={{
                                        flex: 1,
                                        padding: '8px',
                                        background: 'var(--bg-secondary, #2a2a2a)',
                                        border: '1px solid var(--border-primary, #333)',
                                        borderRadius: '6px',
                                        color: 'var(--text-primary, #fff)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    −1 HP
                                </button>
                                <button
                                    onClick={() => handlePetHPChange(pet.id, 1)}
                                    style={{
                                        flex: 1,
                                        padding: '8px',
                                        background: 'var(--bg-secondary, #2a2a2a)',
                                        border: '1px solid var(--border-primary, #333)',
                                        borderRadius: '6px',
                                        color: 'var(--text-primary, #fff)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    +1 HP
                                </button>
                            </div>
                        )}

                        {/* Stats */}
                        <div style={{
                            background: 'var(--bg-secondary, #2a2a2a)',
                            border: '1px solid var(--border-primary, #333)',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '12px',
                        }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '8px',
                                fontSize: '12px',
                            }}>
                                <div style={{ color: 'var(--text-secondary, #888)' }}>
                                    {getLocalizedSize((pet.data as any).size)}
                                </div>
                                <div style={{ color: 'var(--text-secondary, #888)' }}>
                                    AC: {(pet.data as any).armorClass}
                                </div>
                                <div style={{ color: 'var(--text-secondary, #888)' }}>
                                    {t('pets.perception') || 'Perception'}: {(pet.data as any).perception}
                                </div>
                                <div style={{ color: 'var(--text-secondary, #888)' }}>
                                    Fort: {getLocalizedProficiency((pet.data as any).saves.fortitude)}
                                </div>
                                <div style={{ color: 'var(--text-secondary, #888)' }}>
                                    Ref: {getLocalizedProficiency((pet.data as any).saves.reflex)}
                                </div>
                                <div style={{ color: 'var(--text-secondary, #888)' }}>
                                    Will: {getLocalizedProficiency((pet.data as any).saves.will)}
                                </div>
                            </div>
                        </div>

                        {/* Attacks */}
                        <div>
                            <h4 style={{
                                margin: '0 0 8px 0',
                                fontSize: '14px',
                                color: 'var(--text-secondary, #888)',
                            }}>
                                {t('pets.attacks') || 'Attacks'}
                            </h4>
                            {(pet.data as any).attacks.map((attack: any, idx: number) => (
                                <div
                                    key={idx}
                                    style={{
                                        background: 'var(--bg-secondary, #2a2a2a)',
                                        border: '1px solid var(--border-primary, #333)',
                                        borderRadius: '6px',
                                        padding: '8px 12px',
                                        marginBottom: '6px',
                                        fontSize: '13px',
                                    }}
                                >
                                    <div style={{ color: 'var(--text-primary, #fff)', fontWeight: 'bold' }}>
                                        {attack.name} {attack.actionCost ? `[${attack.actionCost}]` : ''}
                                    </div>
                                    <div style={{ color: 'var(--text-secondary, #888)', fontSize: '12px' }}>
                                        +{attack.attackBonus} • {attack.damage} {attack.damageType}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="pets-panel">
            <div className="panel-header">
                <h3>{t('pets.title') || 'Pets & Companions'}</h3>
                <button className="btn btn-primary btn-sm" onClick={handleAddPet}>
                    + {t('pets.add') || 'Add Pet'}
                </button>
            </div>

            {pets.length === 0 ? (
                <div className="empty-state-small">
                    <p>{t('pets.empty') || 'No pets or companions yet.'}</p>
                </div>
            ) : (
                <div className="pets-list">
                    {pets.map(renderPetCard)}
                </div>
            )}

            {/* Add Pet Modal */}
            {showAddModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                    }}
                    onClick={() => setShowAddModal(false)}
                >
                    <div
                        style={{
                            background: 'var(--bg-elevated, #1a1a1a)',
                            borderRadius: '12px',
                            padding: '24px',
                            maxWidth: '500px',
                            width: '90%',
                            maxHeight: '80vh',
                            overflowY: 'auto',
                            border: '1px solid var(--border-primary, #333)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{
                            margin: '0 0 20px 0',
                            color: 'var(--text-primary, #fff)',
                        }}>
                            {t('pets.selectType') || 'Select Pet Type'}
                        </h3>

                        {!selectedPetType ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <button
                                    onClick={() => setSelectedPetType('familiar')}
                                    style={{
                                        padding: '16px',
                                        background: 'var(--bg-secondary, #2a2a2a)',
                                        border: '1px solid var(--border-primary, #333)',
                                        borderRadius: '8px',
                                        color: 'var(--text-primary, #fff)',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                    }}
                                >
                                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                                        {t('pets.familiar') || 'Familiar'}
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary, #888)', marginTop: '4px' }}>
                                        A magical minion that gains abilities based on your spellcasting.
                                    </div>
                                </button>
                                <button
                                    onClick={() => setSelectedPetType('animal-companion')}
                                    style={{
                                        padding: '16px',
                                        background: 'var(--bg-secondary, #2a2a2a)',
                                        border: '1px solid var(--border-primary, #333)',
                                        borderRadius: '8px',
                                        color: 'var(--text-primary, #fff)',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                    }}
                                >
                                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                                        {t('pets.animalCompanion') || 'Animal Companion'}
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary, #888)', marginTop: '4px' }}>
                                        A loyal creature that fights alongside you.
                                    </div>
                                </button>
                                <button
                                    onClick={() => setSelectedPetType('eidolon')}
                                    style={{
                                        padding: '16px',
                                        background: 'var(--bg-secondary, #2a2a2a)',
                                        border: '1px solid var(--border-primary, #333)',
                                        borderRadius: '8px',
                                        color: 'var(--text-primary, #fff)',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                    }}
                                >
                                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                                        {t('pets.eidolon') || 'Eidolon'}
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary, #888)', marginTop: '4px' }}>
                                        A powerful otherworldly ally bound to a summoner.
                                    </div>
                                </button>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    style={{
                                        padding: '12px',
                                        background: 'var(--bg-elevated, #1a1a1a)',
                                        border: '1px solid var(--border-primary, #333)',
                                        borderRadius: '8px',
                                        color: 'var(--text-secondary, #888)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {t('actions.cancel') || 'Cancel'}
                                </button>
                            </div>
                        ) : (
                            <div>
                                <button
                                    onClick={() => setSelectedPetType(null)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-secondary, #888)',
                                        cursor: 'pointer',
                                        marginBottom: '16px',
                                        fontSize: '13px',
                                    }}
                                >
                                    ← {t('actions.cancel') || 'Cancel'}
                                </button>

                                {/* Pet Name Input */}
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{
                                        color: 'var(--text-secondary, #888)',
                                        display: 'block',
                                        marginBottom: '6px',
                                        fontSize: '13px',
                                    }}>
                                        {t('character.name') || 'Name'}
                                    </label>
                                    <input
                                        type="text"
                                        value={newPetName}
                                        onChange={(e) => setNewPetName(e.target.value)}
                                        placeholder={t('pets.enterName') || 'Enter name...'}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            background: 'var(--bg-secondary, #2a2a2a)',
                                            border: '1px solid var(--border-primary, #333)',
                                            borderRadius: '6px',
                                            color: 'var(--text-primary, #fff)',
                                            fontSize: '14px',
                                            boxSizing: 'border-box',
                                        }}
                                    />
                                </div>

                                {/* Familiar Ability Selection */}
                                {selectedPetType === 'familiar' && (
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{
                                            color: 'var(--text-secondary, #888)',
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontSize: '13px',
                                        }}>
                                            {t('pets.familiar.selectAbilities') || 'Select up to 2 abilities'}
                                        </label>
                                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                            {getFamiliarAbilities().map(ability => (
                                                <div
                                                    key={ability.id}
                                                    onClick={() => handleAddFamiliarAbility(ability.id)}
                                                    style={{
                                                        padding: '10px 12px',
                                                        marginBottom: '6px',
                                                        background: selectedAbilities.includes(ability.id)
                                                            ? 'var(--color-primary, #3b82f6)'
                                                            : 'var(--bg-secondary, #2a2a2a)',
                                                        border: '1px solid var(--border-primary, #333)',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        opacity: (!selectedAbilities.includes(ability.id) && selectedAbilities.length >= 2) ? 0.5 : 1,
                                                    }}
                                                >
                                                    <div style={{
                                                        fontSize: '14px',
                                                        fontWeight: 'bold',
                                                        color: 'var(--text-primary, #fff)',
                                                    }}>
                                                        {language === 'it' && ability.nameIt ? ability.nameIt : ability.name}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '12px',
                                                        color: 'var(--text-secondary, #888)',
                                                        marginTop: '4px',
                                                    }}>
                                                        {language === 'it' && ability.descriptionIt ? ability.descriptionIt : ability.description}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Animal Companion Template Selection */}
                                {selectedPetType === 'animal-companion' && (
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{
                                            color: 'var(--text-secondary, #888)',
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontSize: '13px',
                                        }}>
                                            {t('pets.animal.companionType') || 'Companion Type'}
                                        </label>
                                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                            {getAnimalCompanionTemplates().map(template => (
                                                <div
                                                    key={template.id}
                                                    onClick={() => setSelectedTemplateId(template.id)}
                                                    style={{
                                                        padding: '12px',
                                                        marginBottom: '6px',
                                                        background: selectedTemplateId === template.id
                                                            ? 'var(--color-primary, #3b82f6)'
                                                            : 'var(--bg-secondary, #2a2a2a)',
                                                        border: '1px solid var(--border-primary, #333)',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    <div style={{
                                                        fontSize: '14px',
                                                        fontWeight: 'bold',
                                                        color: 'var(--text-primary, #fff)',
                                                    }}>
                                                        {language === 'it' ? template.nameIt : template.name}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '12px',
                                                        color: 'var(--text-secondary, #888)',
                                                        marginTop: '4px',
                                                    }}>
                                                        {getLocalizedSize(template.size)} • {t('pets.hp') || 'HP'}: {template.startingHP} • AC: {template.baseAC}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Eidolon Template Selection */}
                                {selectedPetType === 'eidolon' && (
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{
                                            color: 'var(--text-secondary, #888)',
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontSize: '13px',
                                        }}>
                                            {t('pets.type') || 'Eidolon Type'}
                                        </label>
                                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                            {getEidolonTemplates().map(template => (
                                                <div
                                                    key={template.id}
                                                    onClick={() => setSelectedTemplateId(template.id)}
                                                    style={{
                                                        padding: '12px',
                                                        marginBottom: '6px',
                                                        background: selectedTemplateId === template.id
                                                            ? 'var(--color-primary, #3b82f6)'
                                                            : 'var(--bg-secondary, #2a2a2a)',
                                                        border: '1px solid var(--border-primary, #333)',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    <div style={{
                                                        fontSize: '14px',
                                                        fontWeight: 'bold',
                                                        color: 'var(--text-primary, #fff)',
                                                    }}>
                                                        {language === 'it' ? template.nameIt : template.name}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '12px',
                                                        color: 'var(--text-secondary, #888)',
                                                        marginTop: '4px',
                                                    }}>
                                                        {getLocalizedSize(template.size)} • {t('pets.hp') || 'HP'}: {template.startingHP} • AC: {template.baseAC}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        style={{
                                            flex: 1,
                                            padding: '10px 20px',
                                            background: 'var(--bg-elevated, #1a1a1a)',
                                            color: 'var(--text-primary, #fff)',
                                            border: '1px solid var(--border-primary, #333)',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {t('actions.cancel') || 'Cancel'}
                                    </button>
                                    <button
                                        onClick={handleConfirmAddPet}
                                        disabled={!newPetName.trim() || (selectedPetType !== 'familiar' && !selectedTemplateId) || (selectedPetType === 'familiar' && selectedAbilities.length === 0)}
                                        style={{
                                            flex: 1,
                                            padding: '10px 20px',
                                            background: 'var(--color-primary, #3b82f6)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            opacity: (!newPetName.trim() || (selectedPetType !== 'familiar' && !selectedTemplateId) || (selectedPetType === 'familiar' && selectedAbilities.length === 0)) ? 0.5 : 1,
                                        }}
                                    >
                                        {t('actions.add') || 'Add'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Edit Pet Modal */}
            {editingPet && editingPet.type === 'familiar' && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                    }}
                    onClick={() => setEditingPet(null)}
                >
                    <div
                        style={{
                            background: 'var(--bg-elevated, #1a1a1a)',
                            borderRadius: '12px',
                            padding: '24px',
                            maxWidth: '500px',
                            width: '90%',
                            maxHeight: '80vh',
                            overflowY: 'auto',
                            border: '1px solid var(--border-primary, #333)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{
                            margin: '0 0 20px 0',
                            color: 'var(--text-primary, #fff)',
                        }}>
                            {t('pets.familiar.abilities') || 'Familiar Abilities'}
                        </h3>

                        <div style={{ marginBottom: '16px' }}>
                            <div style={{
                                fontSize: '12px',
                                color: 'var(--text-secondary, #888)',
                                marginBottom: '8px',
                            }}>
                                {t('pets.familiar.selectAbilities') || 'Select up to 2 abilities'} ({selectedAbilities.length}/2)
                            </div>
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {getFamiliarAbilities().map(ability => (
                                    <div
                                        key={ability.id}
                                        onClick={() => {
                                            if (selectedAbilities.includes(ability.id)) {
                                                setSelectedAbilities(selectedAbilities.filter(id => id !== ability.id));
                                            } else if (selectedAbilities.length < 2) {
                                                setSelectedAbilities([...selectedAbilities, ability.id]);
                                            }
                                        }}
                                        style={{
                                            padding: '12px',
                                            marginBottom: '6px',
                                            background: selectedAbilities.includes(ability.id)
                                                ? 'var(--color-primary, #3b82f6)'
                                                : 'var(--bg-secondary, #2a2a2a)',
                                            border: '1px solid var(--border-primary, #333)',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            opacity: (!selectedAbilities.includes(ability.id) && selectedAbilities.length >= 2) ? 0.5 : 1,
                                        }}
                                    >
                                        <div style={{
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            color: 'var(--text-primary, #fff)',
                                        }}>
                                            {language === 'it' && ability.nameIt ? ability.nameIt : ability.name}
                                        </div>
                                        <div style={{
                                            fontSize: '12px',
                                            color: 'var(--text-secondary, #888)',
                                            marginTop: '4px',
                                        }}>
                                            {language === 'it' && ability.descriptionIt ? ability.descriptionIt : ability.description}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => {
                                    setEditingPet(null);
                                    setSelectedAbilities([]);
                                }}
                                style={{
                                    flex: 1,
                                    padding: '10px 20px',
                                    background: 'var(--bg-elevated, #1a1a1a)',
                                    color: 'var(--text-primary, #fff)',
                                    border: '1px solid var(--border-primary, #333)',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                }}
                            >
                                {t('actions.cancel') || 'Cancel'}
                            </button>
                            <button
                                onClick={handleSaveFamiliarAbilities}
                                disabled={selectedAbilities.length === 0}
                                style={{
                                    flex: 1,
                                    padding: '10px 20px',
                                    background: 'var(--color-primary, #3b82f6)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    opacity: selectedAbilities.length === 0 ? 0.5 : 1,
                                }}
                            >
                                {t('actions.apply') || 'Apply'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PetsPanel;
