import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ancestries, getHeritagesForAncestry, classes, backgrounds } from '../data';
import type { Character } from '../types';
import { createEmptyCharacter } from '../types';
import { useLanguage, useLocalizedName, useLocalizedDescription } from '../hooks/useLanguage';
import { calculateMaxHP } from '../utils/pf2e-math';

type WizardStep = 'ancestry' | 'heritage' | 'background' | 'class' | 'abilities' | 'summary';

export function CharacterBuilderPage() {
    const { characterId } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const getName = useLocalizedName();
    const getDescription = useLocalizedDescription();

    const STEPS: { id: WizardStep; labelKey: string }[] = [
        { id: 'ancestry', labelKey: 'builder.ancestry' },
        { id: 'heritage', labelKey: 'builder.heritage' },
        { id: 'background', labelKey: 'builder.background' },
        { id: 'class', labelKey: 'builder.class' },
        { id: 'abilities', labelKey: 'builder.abilities' },
        { id: 'summary', labelKey: 'builder.summary' },
    ];

    const [currentStep, setCurrentStep] = useState<WizardStep>('ancestry');
    const [character, setCharacter] = useState<Character>(createEmptyCharacter);

    // Load existing character if editing
    useEffect(() => {
        if (characterId) {
            const saved = localStorage.getItem('pf2e-characters');
            if (saved) {
                const chars = JSON.parse(saved) as Character[];
                const found = chars.find(c => c.id === characterId);
                if (found) {
                    setCharacter(found);
                }
            }
        }
    }, [characterId]);

    const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

    const goToStep = (step: WizardStep) => {
        setCurrentStep(step);
    };

    const nextStep = () => {
        const nextIndex = currentStepIndex + 1;
        if (nextIndex < STEPS.length) {
            setCurrentStep(STEPS[nextIndex].id);
        }
    };

    const prevStep = () => {
        const prevIndex = currentStepIndex - 1;
        if (prevIndex >= 0) {
            setCurrentStep(STEPS[prevIndex].id);
        }
    };

    const updateCharacter = (updates: Partial<Character>) => {
        setCharacter(prev => ({ ...prev, ...updates, updatedAt: new Date().toISOString() }));
    };

    const saveCharacter = () => {
        const saved = localStorage.getItem('pf2e-characters');
        let chars: Character[] = saved ? JSON.parse(saved) : [];

        // Calculate and set HP if not already set
        const maxHP = calculateMaxHP(character);
        const characterToSave: Character = {
            ...character,
            hitPoints: {
                max: maxHP,
                current: character.hitPoints.current || maxHP,
                temporary: character.hitPoints.temporary || 0,
            },
        };

        const existingIndex = chars.findIndex(c => c.id === character.id);
        if (existingIndex >= 0) {
            chars[existingIndex] = characterToSave;
        } else {
            chars.push(characterToSave);
        }

        localStorage.setItem('pf2e-characters', JSON.stringify(chars));
        navigate('/characters');
    };

    return (
        <div className="character-builder">
            {/* Progress Stepper */}
            <div className="stepper mb-6" style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 'var(--space-1)',
                overflowX: 'auto',
                paddingBottom: 'var(--space-2)'
            }}>
                {STEPS.map((step, index) => (
                    <button
                        key={step.id}
                        onClick={() => goToStep(step.id)}
                        className={`stepper-item ${currentStep === step.id ? 'active' : ''} ${index < currentStepIndex ? 'completed' : ''
                            }`}
                        style={{
                            flex: 1,
                            minWidth: '80px',
                            padding: 'var(--space-3)',
                            background: currentStep === step.id
                                ? 'var(--accent)'
                                : index < currentStepIndex
                                    ? 'rgba(139, 0, 0, 0.3)'
                                    : 'var(--bg-tertiary)',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            color: currentStep === step.id ? 'white' : 'var(--text-secondary)',
                            fontSize: 'var(--font-size-xs)',
                            fontWeight: 'var(--font-weight-medium)',
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)'
                        }}
                    >
                        <span style={{ display: 'block', marginBottom: '2px' }}>{index + 1}</span>
                        <span>{t(step.labelKey)}</span>
                    </button>
                ))}
            </div>

            {/* Step Content */}
            <div className="step-content" style={{ minHeight: '400px' }}>
                {currentStep === 'ancestry' && (
                    <AncestryStep
                        character={character}
                        onSelect={(ancestryId) => {
                            updateCharacter({ ancestryId, heritageId: '' });
                            nextStep();
                        }}
                        t={t}
                        getName={getName}
                        getDescription={getDescription}
                    />
                )}
                {currentStep === 'heritage' && (
                    <HeritageStep
                        character={character}
                        onSelect={(heritageId) => {
                            updateCharacter({ heritageId });
                            nextStep();
                        }}
                        t={t}
                        getName={getName}
                        getDescription={getDescription}
                    />
                )}
                {currentStep === 'background' && (
                    <BackgroundStep
                        character={character}
                        onSelect={(backgroundId) => {
                            updateCharacter({ backgroundId });
                            nextStep();
                        }}
                        t={t}
                        getName={getName}
                        getDescription={getDescription}
                    />
                )}
                {currentStep === 'class' && (
                    <ClassStep
                        character={character}
                        onSelect={(classId) => {
                            updateCharacter({ classId });
                            nextStep();
                        }}
                        t={t}
                        getName={getName}
                        getDescription={getDescription}
                    />
                )}
                {currentStep === 'abilities' && (
                    <AbilitiesStep
                        character={character}
                        onUpdate={updateCharacter}
                        onNext={nextStep}
                        t={t}
                    />
                )}
                {currentStep === 'summary' && (
                    <SummaryStep
                        character={character}
                        onUpdate={updateCharacter}
                        onSave={saveCharacter}
                        t={t}
                        getName={getName}
                    />
                )}
            </div>

            {/* Navigation Footer */}
            <div className="step-navigation mt-6 flex justify-between">
                <button
                    onClick={prevStep}
                    disabled={currentStepIndex === 0}
                    className="btn btn-secondary"
                >
                    {t('builder.back')}
                </button>
                {currentStep !== 'summary' && (
                    <button
                        onClick={nextStep}
                        className="btn btn-primary"
                    >
                        {t('builder.next')}
                    </button>
                )}
            </div>
        </div>
    );
}

type LocalizationProps = {
    t: (key: string) => string;
    getName: (entity: { name: string; nameIt?: string }) => string;
    getDescription: (entity: { description: string; descriptionIt?: string }) => string;
};

// Ancestry Selection Step
function AncestryStep({ character, onSelect, t, getName, getDescription }: {
    character: Character;
    onSelect: (id: string) => void;
} & LocalizationProps) {
    const [search, setSearch] = useState('');
    const filtered = ancestries.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.nameIt?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <h2 className="page-title mb-4">{t('builder.chooseAncestry')}</h2>

            <div className="search-input mb-4">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    type="text"
                    placeholder={t('builder.searchAncestry')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ width: '100%' }}
                />
            </div>

            <div className="grid grid-2">
                {filtered.map(ancestry => (
                    <SelectableCard
                        key={ancestry.id}
                        selected={character.ancestryId === ancestry.id}
                        onClick={() => onSelect(ancestry.id)}
                        title={getName(ancestry)}
                        subtitle={ancestry.name}
                        badges={[
                            `HP ${ancestry.hitPoints}`,
                            ancestry.size,
                            `Speed ${ancestry.speed}`
                        ]}
                        description={getDescription(ancestry)}
                    />
                ))}
            </div>
        </div>
    );
}

// Heritage Selection Step
function HeritageStep({ character, onSelect, t, getName, getDescription }: {
    character: Character;
    onSelect: (id: string) => void;
} & LocalizationProps) {
    const selectedAncestry = ancestries.find(a => a.id === character.ancestryId);
    const availableHeritages = getHeritagesForAncestry(character.ancestryId);

    if (!selectedAncestry) {
        return <p>Select an ancestry first</p>;
    }

    if (availableHeritages.length === 0) {
        return (
            <div>
                <h2 className="page-title mb-4">{t('builder.noHeritage.title')}</h2>
                <p className="text-secondary mb-4">
                    {t('builder.noHeritage.desc')}
                </p>
                <button onClick={() => onSelect('')} className="btn btn-primary">
                    {t('builder.continue')}
                </button>
            </div>
        );
    }

    return (
        <div>
            <h2 className="page-title mb-4">
                {t('builder.chooseHeritage')} {getName(selectedAncestry)}
            </h2>

            <div className="grid grid-2">
                {availableHeritages.map(heritage => (
                    <SelectableCard
                        key={heritage.id}
                        selected={character.heritageId === heritage.id}
                        onClick={() => onSelect(heritage.id)}
                        title={getName(heritage)}
                        subtitle={heritage.name}
                        badges={heritage.traits}
                        description={getDescription(heritage)}
                    />
                ))}
            </div>
        </div>
    );
}

// Background Selection Step
function BackgroundStep({ character, onSelect, t, getName, getDescription }: {
    character: Character;
    onSelect: (id: string) => void;
} & LocalizationProps) {
    const [search, setSearch] = useState('');
    const filtered = backgrounds.filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.nameIt?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <h2 className="page-title mb-4">{t('builder.chooseBackground')}</h2>

            <div className="search-input mb-4">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    type="text"
                    placeholder={t('builder.searchBackground')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ width: '100%' }}
                />
            </div>

            <div className="grid grid-2">
                {filtered.map(bg => (
                    <SelectableCard
                        key={bg.id}
                        selected={character.backgroundId === bg.id}
                        onClick={() => onSelect(bg.id)}
                        title={getName(bg)}
                        subtitle={bg.name}
                        badges={bg.trainedSkills}
                        description={getDescription(bg)}
                    />
                ))}
            </div>
        </div>
    );
}

// Class Selection Step
function ClassStep({ character, onSelect, t, getName, getDescription }: {
    character: Character;
    onSelect: (id: string) => void;
} & LocalizationProps) {
    const [search, setSearch] = useState('');
    const filtered = classes.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.nameIt?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <h2 className="page-title mb-4">{t('builder.chooseClass')}</h2>

            <div className="search-input mb-4">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    type="text"
                    placeholder={t('builder.searchClass')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ width: '100%' }}
                />
            </div>

            <div className="grid grid-2">
                {filtered.map(cls => (
                    <SelectableCard
                        key={cls.id}
                        selected={character.classId === cls.id}
                        onClick={() => onSelect(cls.id)}
                        title={getName(cls)}
                        subtitle={cls.name}
                        badges={[
                            `HP ${cls.hitPoints}`,
                            Array.isArray(cls.keyAbility) ? cls.keyAbility.join('/').toUpperCase() : cls.keyAbility.toUpperCase(),
                            cls.spellcasting ? cls.spellcasting.tradition : 'Martial'
                        ]}
                        description={getDescription(cls)}
                    />
                ))}
            </div>
        </div>
    );
}

// Abilities Step
function AbilitiesStep({ character, onUpdate, onNext, t }: {
    character: Character;
    onUpdate: (updates: Partial<Character>) => void;
    onNext: () => void;
    t: (key: string) => string;
}) {
    const abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;

    const getModifier = (score: number) => {
        const mod = Math.floor((score - 10) / 2);
        return mod >= 0 ? `+${mod}` : `${mod}`;
    };

    const updateAbility = (ability: typeof abilities[number], value: number) => {
        onUpdate({
            abilityScores: {
                ...character.abilityScores,
                [ability]: Math.max(8, Math.min(18, value))
            }
        });
    };

    return (
        <div>
            <h2 className="page-title mb-4">{t('builder.abilityScores')}</h2>
            <p className="text-secondary mb-4">
                {t('builder.abilityScoresDesc')}
            </p>

            <div className="grid grid-2 mb-6">
                {abilities.map(ability => (
                    <div key={ability} className="card" style={{ textAlign: 'center' }}>
                        <div className="stat-label">{t(`ability.${ability}`)}</div>
                        <div className="flex items-center justify-center gap-3 mt-2">
                            <button
                                onClick={() => updateAbility(ability, character.abilityScores[ability] - 1)}
                                className="btn btn-secondary btn-icon"
                                disabled={character.abilityScores[ability] <= 8}
                            >
                                −
                            </button>
                            <span className="stat-value" style={{ minWidth: '40px' }}>
                                {character.abilityScores[ability]}
                            </span>
                            <button
                                onClick={() => updateAbility(ability, character.abilityScores[ability] + 1)}
                                className="btn btn-secondary btn-icon"
                                disabled={character.abilityScores[ability] >= 18}
                            >
                                +
                            </button>
                        </div>
                        <div className="stat-modifier mt-2">
                            {t('builder.modifier')}: {getModifier(character.abilityScores[ability])}
                        </div>
                    </div>
                ))}
            </div>

            <button onClick={onNext} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                {t('builder.continue')}
            </button>
        </div>
    );
}

// Summary Step
function SummaryStep({ character, onUpdate, onSave, t, getName }: {
    character: Character;
    onUpdate: (updates: Partial<Character>) => void;
    onSave: () => void;
    t: (key: string) => string;
    getName: (entity: { name: string; nameIt?: string }) => string;
}) {
    const selectedAncestry = ancestries.find(a => a.id === character.ancestryId);
    const selectedClass = classes.find(c => c.id === character.classId);
    const selectedBackground = backgrounds.find(b => b.id === character.backgroundId);

    return (
        <div>
            <h2 className="page-title mb-4">{t('builder.characterSummary')}</h2>

            {/* Character Name */}
            <div className="card mb-4">
                <label className="stat-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                    {t('builder.characterName')}
                </label>
                <input
                    type="text"
                    value={character.name}
                    onChange={(e) => onUpdate({ name: e.target.value })}
                    placeholder={t('builder.enterName')}
                    style={{ width: '100%', fontSize: 'var(--font-size-xl)' }}
                />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-3 mb-4">
                <div className="stat-card">
                    <span className="stat-label">{t('builder.ancestry')}</span>
                    <span className="stat-value" style={{ fontSize: 'var(--font-size-lg)' }}>
                        {selectedAncestry ? getName(selectedAncestry) : '—'}
                    </span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">{t('builder.class')}</span>
                    <span className="stat-value" style={{ fontSize: 'var(--font-size-lg)' }}>
                        {selectedClass ? getName(selectedClass) : '—'}
                    </span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">{t('builder.background')}</span>
                    <span className="stat-value" style={{ fontSize: 'var(--font-size-lg)' }}>
                        {selectedBackground ? getName(selectedBackground) : '—'}
                    </span>
                </div>
            </div>

            {/* Ability Scores */}
            <div className="card mb-4">
                <h3 className="card-title mb-4">{t('builder.abilityScores')}</h3>
                <div className="grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)', gap: 'var(--space-2)' }}>
                    {Object.entries(character.abilityScores).map(([ability, score]) => (
                        <div key={ability} className="stat-card">
                            <span className="stat-label">{ability.toUpperCase()}</span>
                            <span className="stat-value">{score}</span>
                            <span className="stat-modifier">
                                {Math.floor((score - 10) / 2) >= 0 ? '+' : ''}
                                {Math.floor((score - 10) / 2)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Calculated Stats */}
            <div className="grid grid-3 mb-6">
                <div className="stat-card">
                    <span className="stat-label">{t('builder.hitPoints')}</span>
                    <span className="stat-value">
                        {(selectedAncestry?.hitPoints || 0) +
                            (selectedClass?.hitPoints || 0) +
                            Math.floor((character.abilityScores.con - 10) / 2)}
                    </span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">{t('builder.speed')}</span>
                    <span className="stat-value">{selectedAncestry?.speed || 25}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">{t('builder.level')}</span>
                    <span className="stat-value">{character.level}</span>
                </div>
            </div>

            {/* Save Button */}
            <button onClick={onSave} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                {t('builder.save')}
            </button>
        </div>
    );
}

// Reusable Selectable Card
function SelectableCard({
    selected,
    onClick,
    title,
    subtitle,
    badges,
    description
}: {
    selected: boolean;
    onClick: () => void;
    title: string;
    subtitle?: string;
    badges: string[];
    description: string;
}) {
    return (
        <button
            onClick={onClick}
            className={`card card-interactive ${selected ? 'selected' : ''}`}
            style={{
                textAlign: 'left',
                width: '100%',
                border: selected ? '2px solid var(--accent)' : '1px solid var(--border-primary)',
                boxShadow: selected ? 'var(--shadow-glow)' : undefined
            }}
        >
            <div className="card-header">
                <div>
                    <h3 className="card-title">{title}</h3>
                    {subtitle && subtitle !== title && <p className="card-subtitle">{subtitle}</p>}
                </div>
            </div>
            <p className="card-body line-clamp-2 text-sm">{description}</p>
            <div className="card-footer flex gap-2" style={{ flexWrap: 'wrap' }}>
                {badges.filter(Boolean).map((badge, i) => (
                    <span key={i} className="tag">{badge}</span>
                ))}
            </div>
        </button>
    );
}
