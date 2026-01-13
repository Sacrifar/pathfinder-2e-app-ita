/**
 * CraftingPanel Component
 * Manages Formula Book, Crafting Projects, and Daily Items (Alchemist)
 */

import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Character } from '../../types/character';
import { getGear } from '../../data/pf2e-loader';

interface CraftingPanelProps {
    character: Character;
    onCharacterUpdate: (character: Character) => void;
}

export const CraftingPanel: React.FC<CraftingPanelProps> = ({
    character,
    onCharacterUpdate,
}) => {
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState<'formulas' | 'projects' | 'daily'>('formulas');
    const [showAddFormula, setShowAddFormula] = useState(false);
    const [showNewProject, setShowNewProject] = useState(false);
    const [selectedFormulaId, setSelectedFormulaId] = useState('');
    const [projectCost, setProjectCost] = useState('');

    // Get crafting proficiency
    const craftingSkill = character.skills?.find(s => s.name.toLowerCase() === 'crafting');
    const craftingProficiency = craftingSkill?.proficiency || 'untrained';
    const level = character.level || 1;

    // Calculate proficiency bonus
    const getProficiencyBonus = (prof: string): number => {
        if (prof === 'untrained') return 0;
        if (prof === 'trained') return 2 + Math.floor(level / 2);
        if (prof === 'expert') return 4 + Math.floor(level / 2);
        if (prof === 'master') return 6 + Math.floor(level / 2);
        if (prof === 'legendary') return 8 + Math.floor(level / 2);
        return 0;
    };

    const proficiencyBonus = getProficiencyBonus(craftingProficiency);

    // Calculate cost reduction per day of crafting
    // Trained: 5 sp, Expert: 6 sp, Master: 7 sp, Legendary: 8 sp
    const getDailyReduction = (): number => {
        if (craftingProficiency === 'trained') return 5;
        if (craftingProficiency === 'expert') return 6;
        if (craftingProficiency === 'master') return 7;
        if (craftingProficiency === 'legendary') return 8;
        return 0;
    };

    const dailyReduction = getDailyReduction();

    // Get all available gear items for formula selection
    const allGear = useMemo(() => getGear(), []);

    // Get character's formulas
    const formulas = character.formulas || [];
    const craftingProjects = character.crafting?.projects || [];
    const dailyItems = character.crafting?.dailyItems || [];

    // Get available formulas (items character doesn't have yet)
    const availableFormulas = allGear.filter(item => !formulas.includes(item.id));

    // Add formula to character's formula book
    const handleAddFormula = (formulaId: string) => {
        const updatedFormulas = [...formulas, formulaId];
        onCharacterUpdate({
            ...character,
            formulas: updatedFormulas,
        });
        setShowAddFormula(false);
    };

    // Remove formula from character's formula book
    const handleRemoveFormula = (formulaId: string) => {
        const updatedFormulas = formulas.filter(id => id !== formulaId);
        onCharacterUpdate({
            ...character,
            formulas: updatedFormulas,
        });
    };

    // Start a new crafting project
    const handleStartProject = () => {
        if (!selectedFormulaId || !projectCost) return;

        const formula = allGear.find(item => item.id === selectedFormulaId);
        if (!formula) return;

        const targetValue = parseFloat(projectCost);
        if (isNaN(targetValue) || targetValue <= 0) return;

        const newProject = {
            id: `project_${Date.now()}`,
            name: language === 'it' && formula.nameIt ? formula.nameIt : formula.name,
            targetValue: Math.ceil(targetValue * 10), // Convert gp to sp
            progress: 0,
            daysSpent: 0,
            isFinished: false,
        };

        const updatedProjects = [...craftingProjects, newProject];
        onCharacterUpdate({
            ...character,
            crafting: {
                ...character.crafting,
                projects: updatedProjects,
            },
        });

        setShowNewProject(false);
        setSelectedFormulaId('');
        setProjectCost('');
    };

    // Add a day of work to a project
    const handleAddDay = (projectId: string) => {
        const updatedProjects = craftingProjects.map(project => {
            if (project.id === projectId && !project.isFinished) {
                return {
                    ...project,
                    progress: Math.min(project.targetValue, project.progress + dailyReduction * 10),
                    daysSpent: project.daysSpent + 1,
                    isFinished: (project.progress + dailyReduction * 10) >= project.targetValue,
                };
            }
            return project;
        });

        onCharacterUpdate({
            ...character,
            crafting: {
                ...character.crafting,
                projects: updatedProjects,
            },
        });
    };

    // Complete a finished project and add to inventory
    const handleCompleteProject = (projectId: string) => {
        const project = craftingProjects.find(p => p.id === projectId);
        if (!project || !project.isFinished) return;

        // Find the formula to get item details
        const formula = allGear.find(item => item.name === project.name || item.nameIt === project.name);
        if (!formula) return;

        // Calculate gold cost (targetValue is in sp, convert to gp)
        const goldCost = project.targetValue / 100;

        // TODO: Check if character has enough gold
        // For now, just add to inventory (simplified)
        const updatedProjects = craftingProjects.filter(p => p.id !== projectId);

        onCharacterUpdate({
            ...character,
            crafting: {
                ...character.crafting,
                projects: updatedProjects,
            },
            // TODO: Add item to inventory
        });

        alert(t('crafting.projectCompleted'));
    };

    // Add daily item (for Alchemist)
    const handleAddDailyItem = (itemId: string) => {
        const existing = dailyItems.find(d => d.id === itemId);
        if (existing) {
            // Increment quantity
            const updatedDailyItems = dailyItems.map(d =>
                d.id === itemId ? { ...d, quantity: d.quantity + 1 } : d
            );
            onCharacterUpdate({
                ...character,
                crafting: {
                    ...character.crafting,
                    dailyItems: updatedDailyItems,
                },
            });
        } else {
            // Add new item
            const updatedDailyItems = [...dailyItems, { id: itemId, quantity: 1 }];
            onCharacterUpdate({
                ...character,
                crafting: {
                    ...character.crafting,
                    dailyItems: updatedDailyItems,
                },
            });
        }
    };

    // Remove daily item
    const handleRemoveDailyItem = (itemId: string) => {
        const existing = dailyItems.find(d => d.id === itemId);
        if (existing && existing.quantity > 1) {
            // Decrement quantity
            const updatedDailyItems = dailyItems.map(d =>
                d.id === itemId ? { ...d, quantity: d.quantity - 1 } : d
            );
            onCharacterUpdate({
                ...character,
                crafting: {
                    ...character.crafting,
                    dailyItems: updatedDailyItems,
                },
            });
        } else {
            // Remove item
            const updatedDailyItems = dailyItems.filter(d => d.id !== itemId);
            onCharacterUpdate({
                ...character,
                crafting: {
                    ...character.crafting,
                    dailyItems: updatedDailyItems,
                },
            });
        }
    };

    return (
        <div className="crafting-panel">
            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '20px',
                borderBottom: '1px solid var(--border-primary, #333)',
            }}>
                <button
                    onClick={() => setActiveTab('formulas')}
                    style={{
                        padding: '10px 20px',
                        background: 'none',
                        border: 'none',
                        color: activeTab === 'formulas' ? 'var(--color-primary, #3b82f6)' : 'var(--text-secondary, #888)',
                        borderBottom: activeTab === 'formulas' ? '2px solid var(--color-primary, #3b82f6)' : 'none',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'formulas' ? 'bold' : 'normal',
                    }}
                >
                    {t('crafting.formulas')}
                </button>
                <button
                    onClick={() => setActiveTab('projects')}
                    style={{
                        padding: '10px 20px',
                        background: 'none',
                        border: 'none',
                        color: activeTab === 'projects' ? 'var(--color-primary, #3b82f6)' : 'var(--text-secondary, #888)',
                        borderBottom: activeTab === 'projects' ? '2px solid var(--color-primary, #3b82f6)' : 'none',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'projects' ? 'bold' : 'normal',
                    }}
                >
                    {t('crafting.projects')}
                </button>
                <button
                    onClick={() => setActiveTab('daily')}
                    style={{
                        padding: '10px 20px',
                        background: 'none',
                        border: 'none',
                        color: activeTab === 'daily' ? 'var(--color-primary, #3b82f6)' : 'var(--text-secondary, #888)',
                        borderBottom: activeTab === 'daily' ? '2px solid var(--color-primary, #3b82f6)' : 'none',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'daily' ? 'bold' : 'normal',
                    }}
                >
                    {t('crafting.dailyItems')}
                </button>
            </div>

            {/* Formulas Tab */}
            {activeTab === 'formulas' && (
                <div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px',
                    }}>
                        <h3 style={{ margin: 0, color: 'var(--text-primary, #fff)' }}>
                            {t('crafting.formulas')}
                        </h3>
                        <button
                            onClick={() => setShowAddFormula(true)}
                            style={{
                                padding: '8px 16px',
                                background: 'var(--color-primary, #3b82f6)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                            }}
                        >
                            + {t('crafting.addFormula')}
                        </button>
                    </div>

                    {formulas.length === 0 ? (
                        <div style={{
                            padding: '40px',
                            textAlign: 'center',
                            color: 'var(--text-secondary, #888)',
                        }}>
                            {t('crafting.emptyFormulas')}
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                            gap: '12px',
                        }}>
                            {formulas.map(formulaId => {
                                const formula = allGear.find(item => item.id === formulaId);
                                if (!formula) return null;

                                return (
                                    <div
                                        key={formulaId}
                                        style={{
                                            background: 'var(--bg-secondary, #2a2a2a)',
                                            border: '1px solid var(--border-primary, #333)',
                                            borderRadius: '8px',
                                            padding: '12px',
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'start',
                                            marginBottom: '8px',
                                        }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{
                                                    color: 'var(--text-primary, #fff)',
                                                    fontWeight: 'bold',
                                                    marginBottom: '4px',
                                                }}>
                                                    {language === 'it' && formula.nameIt ? formula.nameIt : formula.name}
                                                </div>
                                                <div style={{
                                                    fontSize: '12px',
                                                    color: 'var(--text-secondary, #888)',
                                                }}>
                                                    {t('crafting.level')}: {formula.level} | {t('crafting.price')}: {formula.priceGp.toFixed(2)} gp
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveFormula(formulaId)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: 'var(--color-danger, #dc2626)',
                                                    cursor: 'pointer',
                                                    fontSize: '18px',
                                                    lineHeight: '1',
                                                }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Projects Tab */}
            {activeTab === 'projects' && (
                <div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px',
                    }}>
                        <h3 style={{ margin: 0, color: 'var(--text-primary, #fff)' }}>
                            {t('crafting.projects')}
                        </h3>
                        <button
                            onClick={() => setShowNewProject(true)}
                            style={{
                                padding: '8px 16px',
                                background: 'var(--color-primary, #3b82f6)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                            }}
                        >
                            + {t('crafting.newProject')}
                        </button>
                    </div>

                    <div style={{
                        background: 'var(--bg-secondary, #2a2a2a)',
                        border: '1px solid var(--border-primary, #333)',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '20px',
                    }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary, #888)' }}>
                            {t('crafting.proficiencyBonus')}: +{proficiencyBonus} | {t('crafting.costReduction')}: {dailyReduction} gp/day
                        </div>
                    </div>

                    {craftingProjects.length === 0 ? (
                        <div style={{
                            padding: '40px',
                            textAlign: 'center',
                            color: 'var(--text-secondary, #888)',
                        }}>
                            {t('crafting.emptyProjects')}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {craftingProjects.map(project => {
                                const progressPercent = (project.progress / project.targetValue) * 100;

                                return (
                                    <div
                                        key={project.id}
                                        style={{
                                            background: 'var(--bg-secondary, #2a2a2a)',
                                            border: '1px solid var(--border-primary, #333)',
                                            borderRadius: '8px',
                                            padding: '16px',
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '12px',
                                        }}>
                                            <div style={{
                                                color: 'var(--text-primary, #fff)',
                                                fontWeight: 'bold',
                                                fontSize: '16px',
                                            }}>
                                                {project.name}
                                            </div>
                                            {project.isFinished && (
                                                <span style={{
                                                    padding: '4px 12px',
                                                    background: 'var(--color-success, #10b981)',
                                                    color: 'white',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                }}>
                                                    {t('crafting.complete')}
                                                </span>
                                            )}
                                        </div>

                                        {/* Progress bar */}
                                        <div style={{
                                            width: '100%',
                                            height: '8px',
                                            background: 'var(--bg-elevated, #1a1a1a)',
                                            borderRadius: '4px',
                                            overflow: 'hidden',
                                            marginBottom: '8px',
                                        }}>
                                            <div
                                                style={{
                                                    width: `${progressPercent}%`,
                                                    height: '100%',
                                                    background: project.isFinished
                                                        ? 'var(--color-success, #10b981)'
                                                        : 'var(--color-primary, #3b82f6)',
                                                    transition: 'width 0.3s ease',
                                                }}
                                            />
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontSize: '12px',
                                            color: 'var(--text-secondary, #888)',
                                            marginBottom: '12px',
                                        }}>
                                            <span>{project.progress} / {project.targetValue} sp</span>
                                            <span>{t('crafting.daysSpent')}: {project.daysSpent}</span>
                                        </div>

                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {!project.isFinished ? (
                                                <button
                                                    onClick={() => handleAddDay(project.id)}
                                                    style={{
                                                        flex: 1,
                                                        padding: '8px',
                                                        background: 'var(--color-primary, #3b82f6)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    + {t('crafting.addDay')}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleCompleteProject(project.id)}
                                                    style={{
                                                        flex: 1,
                                                        padding: '8px',
                                                        background: 'var(--color-success, #10b981)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    {t('crafting.collectItem')}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Daily Items Tab */}
            {activeTab === 'daily' && (
                <div>
                    <h3 style={{ margin: '0 0 20px 0', color: 'var(--text-primary, #fff)' }}>
                        {t('crafting.dailyItems')}
                    </h3>

                    {dailyItems.length === 0 ? (
                        <div style={{
                            padding: '40px',
                            textAlign: 'center',
                            color: 'var(--text-secondary, #888)',
                        }}>
                            {t('crafting.emptyDailyItems')}
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '12px',
                        }}>
                            {dailyItems.map(dailyItem => {
                                const item = allGear.find(i => i.id === dailyItem.id);
                                if (!item) return null;

                                return (
                                    <div
                                        key={dailyItem.id}
                                        style={{
                                            background: 'var(--bg-secondary, #2a2a2a)',
                                            border: '1px solid var(--border-primary, #333)',
                                            borderRadius: '8px',
                                            padding: '12px',
                                        }}
                                    >
                                        <div style={{
                                            color: 'var(--text-primary, #fff)',
                                            fontWeight: 'bold',
                                            marginBottom: '8px',
                                        }}>
                                            {language === 'it' && item.nameIt ? item.nameIt : item.name}
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        }}>
                                            <span style={{
                                                fontSize: '14px',
                                                color: 'var(--text-secondary, #888)',
                                            }}>
                                                ×{dailyItem.quantity}
                                            </span>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <button
                                                    onClick={() => handleAddDailyItem(dailyItem.id)}
                                                    style={{
                                                        width: '28px',
                                                        height: '28px',
                                                        background: 'var(--color-primary, #3b82f6)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '16px',
                                                    }}
                                                >
                                                    +
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveDailyItem(dailyItem.id)}
                                                    style={{
                                                        width: '28px',
                                                        height: '28px',
                                                        background: 'var(--color-danger, #dc2626)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '16px',
                                                    }}
                                                >
                                                    −
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Add Formula Modal */}
            {showAddFormula && (
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
                    onClick={() => setShowAddFormula(false)}
                >
                    <div
                        style={{
                            background: 'var(--bg-elevated, #1a1a1a)',
                            borderRadius: '12px',
                            padding: '24px',
                            maxWidth: '600px',
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
                            {t('crafting.addFormula')}
                        </h3>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '8px',
                        }}>
                            {availableFormulas.slice(0, 50).map(formula => (
                                <div
                                    key={formula.id}
                                    onClick={() => handleAddFormula(formula.id)}
                                    style={{
                                        padding: '12px',
                                        background: 'var(--bg-secondary, #2a2a2a)',
                                        border: '1px solid var(--border-primary, #333)',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <div style={{
                                        color: 'var(--text-primary, #fff)',
                                        fontSize: '14px',
                                    }}>
                                        {language === 'it' && formula.nameIt ? formula.nameIt : formula.name}
                                    </div>
                                    <div style={{
                                        fontSize: '12px',
                                        color: 'var(--text-secondary, #888)',
                                        marginTop: '4px',
                                    }}>
                                        {t('crafting.level')}: {formula.level}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowAddFormula(false)}
                            style={{
                                marginTop: '20px',
                                width: '100%',
                                padding: '10px',
                                background: 'var(--bg-elevated, #1a1a1a)',
                                color: 'var(--text-primary, #fff)',
                                border: '1px solid var(--border-primary, #333)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                            }}
                        >
                            {t('actions.cancel')}
                        </button>
                    </div>
                </div>
            )}

            {/* New Project Modal */}
            {showNewProject && (
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
                    onClick={() => setShowNewProject(false)}
                >
                    <div
                        style={{
                            background: 'var(--bg-elevated, #1a1a1a)',
                            borderRadius: '12px',
                            padding: '24px',
                            maxWidth: '500px',
                            width: '90%',
                            border: '1px solid var(--border-primary, #333)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{
                            margin: '0 0 20px 0',
                            color: 'var(--text-primary, #fff)',
                        }}>
                            {t('crafting.newProject')}
                        </h3>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: 'var(--text-secondary, #888)',
                            }}>
                                {t('crafting.formulas')}
                            </label>
                            <select
                                value={selectedFormulaId}
                                onChange={(e) => setSelectedFormulaId(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    background: 'var(--bg-secondary, #2a2a2a)',
                                    border: '1px solid var(--border-primary, #333)',
                                    borderRadius: '6px',
                                    color: 'var(--text-primary, #fff)',
                                    fontSize: '14px',
                                }}
                            >
                                <option value="">{t('actions.select')}...</option>
                                {formulas.map(formulaId => {
                                    const formula = allGear.find(item => item.id === formulaId);
                                    if (!formula) return null;
                                    return (
                                        <option key={formulaId} value={formulaId}>
                                            {language === 'it' && formula.nameIt ? formula.nameIt : formula.name}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: 'var(--text-secondary, #888)',
                            }}>
                                {t('crafting.targetValue')} (gp)
                            </label>
                            <input
                                type="number"
                                value={projectCost}
                                onChange={(e) => setProjectCost(e.target.value)}
                                placeholder="10.0"
                                step="0.1"
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    background: 'var(--bg-secondary, #2a2a2a)',
                                    border: '1px solid var(--border-primary, #333)',
                                    borderRadius: '6px',
                                    color: 'var(--text-primary, #fff)',
                                    fontSize: '14px',
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setShowNewProject(false)}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    background: 'var(--bg-elevated, #1a1a1a)',
                                    color: 'var(--text-primary, #fff)',
                                    border: '1px solid var(--border-primary, #333)',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                }}
                            >
                                {t('actions.cancel')}
                            </button>
                            <button
                                onClick={handleStartProject}
                                disabled={!selectedFormulaId || !projectCost}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    background: 'var(--color-primary, #3b82f6)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    opacity: (!selectedFormulaId || !projectCost) ? 0.5 : 1,
                                }}
                            >
                                {t('crafting.startProject')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CraftingPanel;
