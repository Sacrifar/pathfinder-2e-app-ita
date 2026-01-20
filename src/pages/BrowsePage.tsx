import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ancestries, classes, backgrounds } from '../data';
import { useLanguage, useLocalizedName, useLocalizedDescription } from '../hooks/useLanguage';

type BrowseCategory = 'ancestries' | 'classes' | 'backgrounds' | 'feats' | 'spells' | 'equipment';

export function BrowsePage() {
    const { category } = useParams<{ category?: string }>();
    const { t } = useLanguage();
    const getName = useLocalizedName();
    const getDescription = useLocalizedDescription();

    const CATEGORIES: { id: BrowseCategory; labelKey: string }[] = [
        { id: 'ancestries', labelKey: 'browse.ancestries' },
        { id: 'classes', labelKey: 'browse.classes' },
        { id: 'backgrounds', labelKey: 'browse.backgrounds' },
        { id: 'feats', labelKey: 'browse.feats' },
        { id: 'spells', labelKey: 'browse.spells' },
        { id: 'equipment', labelKey: 'browse.equipment' },
    ];

    const [activeCategory, setActiveCategory] = useState<BrowseCategory>(
        (category as BrowseCategory) || 'ancestries'
    );
    const [search, setSearch] = useState('');
    const [selectedItem, setSelectedItem] = useState<string | null>(null);

    const renderContent = () => {
        switch (activeCategory) {
            case 'ancestries':
                return <AncestriesBrowser search={search} selectedId={selectedItem} onSelect={setSelectedItem} t={t} getName={getName} getDescription={getDescription} />;
            case 'classes':
                return <ClassesBrowser search={search} selectedId={selectedItem} onSelect={setSelectedItem} t={t} getName={getName} getDescription={getDescription} />;
            case 'backgrounds':
                return <BackgroundsBrowser search={search} selectedId={selectedItem} onSelect={setSelectedItem} t={t} getName={getName} getDescription={getDescription} />;
            default:
                return (
                    <div className="empty-state">
                        <div className="empty-state-icon">🚧</div>
                        <h3 className="empty-state-title">{t('browse.underConstruction')}</h3>
                        <p className="empty-state-description">
                            {t('browse.comingSoon')}
                        </p>
                    </div>
                );
        }
    };

    return (
        <div className="browse-page">
            <header className="page-header">
                <h1 className="page-title">{t('browse.title')}</h1>
                <p className="page-subtitle">{t('browse.subtitle')}</p>
            </header>

            {/* Category Tabs */}
            <div className="category-tabs" style={{
                display: 'flex',
                gap: 'var(--space-2)',
                marginBottom: 'var(--space-4)',
                overflowX: 'auto',
                paddingBottom: 'var(--space-2)'
            }}>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => {
                            setActiveCategory(cat.id);
                            setSelectedItem(null);
                        }}
                        className={`btn ${activeCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ whiteSpace: 'nowrap' }}
                    >
                        {t(cat.labelKey)}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="search-input mb-4">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    type="text"
                    placeholder={t('builder.search')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ width: '100%' }}
                />
            </div>

            {/* Content */}
            {renderContent()}
        </div>
    );
}

type LocalizationProps = {
    t: (key: string) => string;
    getName: (entity: { name: string; nameIt?: string }) => string;
    getDescription: (entity: { description: string; descriptionIt?: string }) => string;
};

// Ancestries Browser
function AncestriesBrowser({ search, selectedId, onSelect, t, getName, getDescription }: {
    search: string;
    selectedId: string | null;
    onSelect: (id: string | null) => void;
} & LocalizationProps) {
    const filtered = ancestries.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.nameIt?.toLowerCase().includes(search.toLowerCase())
    );

    const selectedAncestry = ancestries.find(a => a.id === selectedId);

    return (
        <div className="browser-layout" style={{
            display: 'grid',
            gridTemplateColumns: selectedId ? '1fr 1fr' : '1fr',
            gap: 'var(--space-4)'
        }}>
            {/* List */}
            <div className="browser-list">
                {filtered.map(ancestry => (
                    <button
                        key={ancestry.id}
                        onClick={() => onSelect(ancestry.id === selectedId ? null : ancestry.id)}
                        className={`card card-interactive mb-2 ${selectedId === ancestry.id ? 'selected' : ''}`}
                        style={{
                            width: '100%',
                            textAlign: 'left',
                            border: selectedId === ancestry.id ? '2px solid var(--accent)' : undefined
                        }}
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="card-title" style={{ fontSize: 'var(--font-size-base)' }}>
                                    {getName(ancestry)}
                                </h3>
                                <span className="text-sm text-muted">{ancestry.name}</span>
                            </div>
                            <span className="tag tag-primary">HP {ancestry.hitPoints}</span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Detail Panel */}
            {selectedAncestry && (
                <div className="browser-detail card" style={{ position: 'sticky', top: 'var(--space-4)' }}>
                    <h2 className="card-title" style={{ fontSize: 'var(--font-size-2xl)' }}>
                        {getName(selectedAncestry)}
                    </h2>
                    <p className="text-muted mb-4">{selectedAncestry.name}</p>

                    <div className="flex gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
                        <span className="tag tag-primary">HP {selectedAncestry.hitPoints}</span>
                        <span className="tag">{selectedAncestry.size}</span>
                        <span className="tag">Speed {selectedAncestry.speed}</span>
                        {selectedAncestry.traits.map(trait => (
                            <span key={trait} className="trait trait-common">{trait}</span>
                        ))}
                    </div>

                    <p className="mb-4">{getDescription(selectedAncestry)}</p>

                    <h3 className="font-semibold mb-2">{t('builder.abilityBoosts')}</h3>
                    <div className="flex gap-2 mb-4">
                        {selectedAncestry.abilityBoosts.map((boost, i) => (
                            <span key={i} className="tag tag-success">+{boost.toUpperCase()}</span>
                        ))}
                    </div>

                    {selectedAncestry.abilityFlaws.length > 0 && (
                        <>
                            <h3 className="font-semibold mb-2">{t('builder.abilityFlaws')}</h3>
                            <div className="flex gap-2 mb-4">
                                {selectedAncestry.abilityFlaws.map((flaw, i) => (
                                    <span key={i} className="tag tag-error">-{flaw.toUpperCase()}</span>
                                ))}
                            </div>
                        </>
                    )}

                    <h3 className="font-semibold mb-2">{t('browse.features')}</h3>
                    {selectedAncestry.features.map((feature, i) => (
                        <div key={i} className="card mb-2" style={{ background: 'var(--bg-tertiary)' }}>
                            <h4 className="font-medium">{getName(feature)}</h4>
                            <p className="text-sm text-secondary">
                                {getDescription(feature)}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Classes Browser
function ClassesBrowser({ search, selectedId, onSelect, t, getName, getDescription }: {
    search: string;
    selectedId: string | null;
    onSelect: (id: string | null) => void;
} & LocalizationProps) {
    const filtered = classes.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.nameIt?.toLowerCase().includes(search.toLowerCase())
    );

    const selectedClass = classes.find(c => c.id === selectedId);

    return (
        <div className="browser-layout" style={{
            display: 'grid',
            gridTemplateColumns: selectedId ? '1fr 1fr' : '1fr',
            gap: 'var(--space-4)'
        }}>
            {/* List */}
            <div className="browser-list">
                {filtered.map(cls => (
                    <button
                        key={cls.id}
                        onClick={() => onSelect(cls.id === selectedId ? null : cls.id)}
                        className={`card card-interactive mb-2 ${selectedId === cls.id ? 'selected' : ''}`}
                        style={{
                            width: '100%',
                            textAlign: 'left',
                            border: selectedId === cls.id ? '2px solid var(--accent)' : undefined
                        }}
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="card-title" style={{ fontSize: 'var(--font-size-base)' }}>
                                    {getName(cls)}
                                </h3>
                                <span className="text-sm text-muted">{cls.name}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="tag tag-primary">HP {cls.hitPoints}</span>
                                {cls.spellcasting && (
                                    <span className="tag tag-info">{cls.spellcasting.tradition}</span>
                                )}
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Detail Panel */}
            {selectedClass && (
                <div className="browser-detail card" style={{ position: 'sticky', top: 'var(--space-4)' }}>
                    <h2 className="card-title" style={{ fontSize: 'var(--font-size-2xl)' }}>
                        {getName(selectedClass)}
                    </h2>
                    <p className="text-muted mb-4">{selectedClass.name}</p>

                    <div className="flex gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
                        <span className="tag tag-primary">HP {selectedClass.hitPoints}</span>
                        <span className="tag">
                            {Array.isArray(selectedClass.keyAbility)
                                ? selectedClass.keyAbility.join('/').toUpperCase()
                                : String(selectedClass.keyAbility).toUpperCase()}
                        </span>
                        {selectedClass.spellcasting && (
                            <span className="trait trait-uncommon">{selectedClass.spellcasting.tradition}</span>
                        )}
                    </div>

                    <p className="mb-4">{getDescription(selectedClass)}</p>

                    <h3 className="font-semibold mb-2">{t('browse.proficiencies')}</h3>
                    <div className="grid grid-2 mb-4" style={{ gap: 'var(--space-2)' }}>
                        <div className="stat-card">
                            <span className="stat-label">{t('browse.perception')}</span>
                            <span className="text-sm">{selectedClass.perception}</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-label">{t('browse.fortitude')}</span>
                            <span className="text-sm">{selectedClass.fortitude}</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-label">{t('browse.reflex')}</span>
                            <span className="text-sm">{selectedClass.reflex}</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-label">{t('browse.will')}</span>
                            <span className="text-sm">{selectedClass.will}</span>
                        </div>
                    </div>

                    <h3 className="font-semibold mb-2">{t('browse.classFeatures')}</h3>
                    {selectedClass.features.map((feature, i) => (
                        <div key={i} className="card mb-2" style={{ background: 'var(--bg-tertiary)' }}>
                            <div className="flex justify-between items-center mb-1">
                                <h4 className="font-medium">{getName(feature)}</h4>
                                <span className="tag tag-level">Lv {feature.level}</span>
                            </div>
                            <p className="text-sm text-secondary">
                                {getDescription(feature)}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Backgrounds Browser
function BackgroundsBrowser({ search, selectedId, onSelect, t, getName, getDescription }: {
    search: string;
    selectedId: string | null;
    onSelect: (id: string | null) => void;
} & LocalizationProps) {
    const filtered = backgrounds.filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.nameIt?.toLowerCase().includes(search.toLowerCase())
    );

    const selectedBackground = backgrounds.find(b => b.id === selectedId);

    return (
        <div className="browser-layout" style={{
            display: 'grid',
            gridTemplateColumns: selectedId ? '1fr 1fr' : '1fr',
            gap: 'var(--space-4)'
        }}>
            {/* List */}
            <div className="browser-list">
                {filtered.map(bg => (
                    <button
                        key={bg.id}
                        onClick={() => onSelect(bg.id === selectedId ? null : bg.id)}
                        className={`card card-interactive mb-2 ${selectedId === bg.id ? 'selected' : ''}`}
                        style={{
                            width: '100%',
                            textAlign: 'left',
                            border: selectedId === bg.id ? '2px solid var(--accent)' : undefined
                        }}
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="card-title" style={{ fontSize: 'var(--font-size-base)' }}>
                                    {getName(bg)}
                                </h3>
                                <span className="text-sm text-muted">{bg.name}</span>
                            </div>
                            <div className="flex gap-1">
                                {bg.trainedSkills.slice(0, 1).map(skill => (
                                    <span key={skill} className="tag">{skill}</span>
                                ))}
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Detail Panel */}
            {selectedBackground && (
                <div className="browser-detail card" style={{ position: 'sticky', top: 'var(--space-4)' }}>
                    <h2 className="card-title" style={{ fontSize: 'var(--font-size-2xl)' }}>
                        {getName(selectedBackground)}
                    </h2>
                    <p className="text-muted mb-4">{selectedBackground.name}</p>

                    <p className="mb-4">{getDescription(selectedBackground)}</p>

                    <h3 className="font-semibold mb-2">{t('builder.abilityBoosts')}</h3>
                    <div className="flex gap-2 mb-4">
                        {selectedBackground.abilityBoosts.map((boost, i) => (
                            <span key={i} className="tag tag-success">+{boost.toUpperCase()}</span>
                        ))}
                    </div>

                    <h3 className="font-semibold mb-2">{t('browse.skillTraining')}</h3>
                    <div className="flex gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
                        {selectedBackground.trainedSkills.map(skill => (
                            <span key={skill} className="tag">{skill}</span>
                        ))}
                        <span className="tag tag-info">{selectedBackground.trainedLore}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
