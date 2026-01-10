import { Link } from 'react-router-dom';
import { classes, ancestries } from '../data';
import { useLanguage, useLocalizedName, useLocalizedDescription } from '../hooks/useLanguage';

export function HomePage() {
    const { t } = useLanguage();
    const getName = useLocalizedName();
    const getDescription = useLocalizedDescription();

    // Pick a few featured items
    const featuredClasses = classes.slice(0, 4);
    const featuredAncestries = ancestries.slice(0, 4);

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero" style={{
                textAlign: 'center',
                padding: 'var(--space-12) 0',
                marginBottom: 'var(--space-8)'
            }}>
                <h1 className="page-title" style={{ fontSize: 'var(--font-size-5xl)' }}>
                    {t('home.title')}
                </h1>
                <p style={{
                    fontSize: 'var(--font-size-xl)',
                    color: 'var(--text-secondary)',
                    maxWidth: '600px',
                    margin: '0 auto var(--space-8)'
                }}>
                    {t('home.subtitle')}
                </p>
                <div className="flex justify-center gap-4" style={{ flexWrap: 'wrap' }}>
                    <Link to="/builder" className="btn btn-primary btn-lg">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="16" />
                            <line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
                        {t('home.newCharacter')}
                    </Link>
                    <Link to="/characters" className="btn btn-secondary btn-lg">
                        {t('home.myCharacters')}
                    </Link>
                </div>
            </section>

            {/* Quick Stats */}
            <section className="quick-stats" style={{ marginBottom: 'var(--space-8)' }}>
                <div className="grid grid-3" style={{ gap: 'var(--space-4)' }}>
                    <div className="stat-card">
                        <span className="stat-value">{classes.length}</span>
                        <span className="stat-label">{t('home.classes')}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{ancestries.length}</span>
                        <span className="stat-label">{t('home.ancestries')}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">20+</span>
                        <span className="stat-label">{t('home.backgrounds')}</span>
                    </div>
                </div>
            </section>

            {/* Featured Classes */}
            <section style={{ marginBottom: 'var(--space-8)' }}>
                <div className="flex justify-between items-center mb-4">
                    <h2 style={{ fontSize: 'var(--font-size-2xl)' }}>{t('home.classes')}</h2>
                    <Link to="/browse/classes" className="btn btn-ghost btn-sm">
                        {t('home.viewAll')}
                    </Link>
                </div>
                <div className="grid grid-2">
                    {featuredClasses.map(cls => (
                        <ClassCard key={cls.id} cls={cls} getName={getName} getDescription={getDescription} />
                    ))}
                </div>
            </section>

            {/* Featured Ancestries */}
            <section style={{ marginBottom: 'var(--space-8)' }}>
                <div className="flex justify-between items-center mb-4">
                    <h2 style={{ fontSize: 'var(--font-size-2xl)' }}>{t('home.ancestries')}</h2>
                    <Link to="/browse/ancestries" className="btn btn-ghost btn-sm">
                        {t('home.viewAll')}
                    </Link>
                </div>
                <div className="grid grid-2">
                    {featuredAncestries.map(ancestry => (
                        <AncestryCard key={ancestry.id} ancestry={ancestry} getName={getName} getDescription={getDescription} />
                    ))}
                </div>
            </section>

            {/* Features */}
            <section style={{ marginBottom: 'var(--space-8)' }}>
                <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-4)' }}>
                    {t('home.features')}
                </h2>
                <div className="grid grid-3">
                    <FeatureCard
                        title={t('home.feature.wizard')}
                        description={t('home.feature.wizardDesc')}
                        icon="✨"
                    />
                    <FeatureCard
                        title={t('home.feature.responsive')}
                        description={t('home.feature.responsiveDesc')}
                        icon="📱"
                    />
                    <FeatureCard
                        title={t('home.feature.bilingual')}
                        description={t('home.feature.bilingualDesc')}
                        icon="🌐"
                    />
                </div>
            </section>
        </div>
    );
}

// Class Card Component
function ClassCard({ cls, getName, getDescription }: {
    cls: typeof classes[0];
    getName: (entity: { name: string; nameIt?: string }) => string;
    getDescription: (entity: { description: string; descriptionIt?: string }) => string;
}) {
    return (
        <div className="card card-interactive">
            <div className="card-header">
                <div>
                    <h3 className="card-title">{getName(cls)}</h3>
                    <p className="card-subtitle">{cls.name}</p>
                </div>
                <span className="tag tag-primary">HP {cls.hitPoints}</span>
            </div>
            <p className="card-body line-clamp-2">
                {getDescription(cls)}
            </p>
            <div className="card-footer flex gap-2" style={{ flexWrap: 'wrap' }}>
                {cls.spellcasting && (
                    <span className="trait trait-uncommon">
                        {cls.spellcasting.tradition}
                    </span>
                )}
                <span className="tag">
                    {Array.isArray(cls.keyAbility)
                        ? cls.keyAbility.join('/').toUpperCase()
                        : cls.keyAbility.toUpperCase()}
                </span>
            </div>
        </div>
    );
}

// Ancestry Card Component
function AncestryCard({ ancestry, getName, getDescription }: {
    ancestry: typeof ancestries[0];
    getName: (entity: { name: string; nameIt?: string }) => string;
    getDescription: (entity: { description: string; descriptionIt?: string }) => string;
}) {
    return (
        <div className="card card-interactive">
            <div className="card-header">
                <div>
                    <h3 className="card-title">{getName(ancestry)}</h3>
                    <p className="card-subtitle">{ancestry.name}</p>
                </div>
                <span className="tag tag-primary">HP {ancestry.hitPoints}</span>
            </div>
            <p className="card-body line-clamp-2">
                {getDescription(ancestry)}
            </p>
            <div className="card-footer flex gap-2" style={{ flexWrap: 'wrap' }}>
                <span className="tag">{ancestry.size}</span>
                <span className="tag">Speed {ancestry.speed}</span>
                {ancestry.features.slice(0, 1).map((f, i) => (
                    <span key={i} className="trait trait-common">
                        {getName(f)}
                    </span>
                ))}
            </div>
        </div>
    );
}

// Feature Card Component
function FeatureCard({ title, description, icon }: {
    title: string;
    description: string;
    icon: string;
}) {
    return (
        <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-3)' }}>{icon}</div>
            <h3 className="card-title" style={{ marginBottom: 'var(--space-2)' }}>{title}</h3>
            <p className="text-secondary text-sm">{description}</p>
        </div>
    );
}
