# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Last Updated**: 2026-01-28
**Last Commit**: 5f2dbc36 (feat: Implement initial PF2e character sheet and builder with data loading, spell management, and dice rolling)

## Project Overview

Pathfinder 2E character builder and sheet application with Italian translations. Built with React + TypeScript + Vite, featuring a desktop-focused UI for character creation and management.

## Development Commands

```bash
npm run dev           # Start dev server (port 5173)
npm run build         # TypeScript check + Vite build
npm run lint          # Run ESLint
npm test              # Run Vitest tests
npm run preview       # Preview production build
npm run validate:data # Validate PF2E JSON data files
```

## Agent Skills

This project includes custom Claude agent skills for automating common development tasks. Skills are defined in `.claude/agent-skills.json`.

**Quick Reference**: See `.claude/QUICKREF.md` for fast lookup of available skills.

**Available Skills** (12 total):
- `add-pf2e-content` - Add game content (weapons, spells, feats, etc.)
- `create-browser-component` - Create new browser UI components
- `add-translations` - Add/update Italian translations
- `create-math-tests` - Create comprehensive math utility tests
- `validate-character-recalculation` - Validate character calculation logic
- `add-class-progression` - Add/update class progressions
- `create-modal-component` - Create new modal components
- `optimize-bundle` - Analyze and optimize bundle size
- `add-feat-processing` - Add feat choice processing support
- `debug-character-issue` - Debug character calculation issues
- `validate-json-data` - Validate PF2E JSON data structure
- `add-condition-support` - Add new conditions with modifiers

**Documentation**:
- `.claude/README.md` - Complete guide to all skills
- `.claude/examples.md` - Practical usage examples
- `.claude/QUICKREF.md` - Quick reference card
- `.claude/validate.js` - JSON validation script

**Common Workflows**:

```bash
# Add new weapon
Use: add-pf2e-content → add-translations → validate-json-data

# Add new class
Use: add-class-progression → add-translations → validate-character-recalculation

# Create new browse UI
Use: create-browser-component → add-translations

# Pre-release checks
Use: validate-json-data → validate-character-recalculation → optimize-bundle
```

## Architecture

### Routing Structure

The app uses React Router with two routing contexts:
- **Fullscreen routes** (`/sheet`, `/sheet/:id`): Desktop character sheet without layout wrapper
- **Main app routes** (all others): Wrapped in `ResponsiveLayout`

Main pages:
- `/` - HomePage
- `/characters` - CharacterListPage
- `/builder` - CharacterBuilderPage
- `/builder/:characterId` - Edit existing character
- `/browse` - BrowsePage for browsing PF2E content
- `/browse/:category` - Category-specific browse

### Data Loading System

**Critical Pattern**: All PF2E game data is loaded from JSON files using Vite's glob imports in `src/data/pf2e-loader.ts`:

```typescript
// Example pattern from pf2e-loader.ts
const equipmentModules = import.meta.glob<{ default: unknown }>(
    './pf2e/equipment/*.json',
    { eager: true }
);
```

- **Source**: `src/data/pf2e/` contains FoundryVTT-format JSON files
- **Loader**: `pf2e-loader.ts` transforms raw data into typed interfaces
- **Barrel**: `src/data/index.ts` re-exports with Italian translations
- **Manual Data**: Class progressions, specializations, tactics in separate `.ts` files

### Class Modularity System (New!)

**Recent Update (2026-01-26)**: The codebase now uses a modular system for class-related data to eliminate hardcoded Foundry IDs and improve maintainability.

**Key Files:**

1. **`classMetadata.ts`** - Auto-generates mappings between class names and Foundry IDs
   ```typescript
   import { getClassIdByName, STANDARD_FEAT_PROGRESSION } from '@/data/classMetadata';

   const bardId = getClassIdByName('Bard'); // Auto-converts 'Bard' → Foundry ID
   ```

2. **`classProgressionsBuilder.ts`** - Builder pattern for defining progressions
   ```typescript
   import { createClassProgressions } from '@/data/classProgressionsBuilder';

   const progressions = createClassProgressions({
       'Alchemist': {
           armorProficiencies: { /* ... */ },
           featProgression: STANDARD_FEAT_PROGRESSION, // Reusable pattern
       }
   });
   ```

3. **`classGrantedFeats.ts`** & **`classGrantedSpells.ts`** - Use class names instead of IDs
   ```typescript
   // Now uses human-readable class names
   export const CLASS_GRANTED_FEATS_BY_NAME = [
       {
           className: 'Bard', // ✅ Readable!
           grantedFeats: { /* ... */ }
       }
   ];
   // Auto-converted to Foundry IDs at runtime
   ```

4. **`classSpecializationRules.ts`** - Centralized specialization availability rules
   ```typescript
   import { filterSpecializationsByLevel } from '@/data/classSpecializationRules';

   // Replaces hardcoded class-specific logic in components
   const filteredTypes = filterSpecializationsByLevel(allTypes, classId, level);
   ```

5. **`dataValidator.ts`** - Validates referential integrity
   ```typescript
   import { validateAllData, logValidationIssues } from '@/data/dataValidator';

   // Validates class/feat/spell IDs, proficiency arrays, etc.
   const result = validateAllData({ progressions, grantedFeats, grantedSpells });
   logValidationIssues(result); // Logs errors/warnings in dev mode
   ```

6. **`devValidation.ts`** - Automatic validation in development
   - Runs automatically when dev server starts
   - Validates all data structures
   - Logs warnings for broken references

7. **`translationChecker.ts`** - Translation coverage analysis
   ```javascript
   // Available in dev console:
   checkTranslationCoverage()        // Show full coverage report
   getMissingTranslations('Spells')  // Get missing translations for category
   exportMissingTranslations()       // Export all missing translations
   ```

**Pattern: Adding a New Class**

Old way (hardcoded IDs):
```typescript
// ❌ Had to find Foundry ID manually
'XwfcJuskrhI9GIjX': { // What class is this??
    armorProficiencies: { /* ... */ }
}
```

New way (class names):
```typescript
// ✅ Readable and maintainable
'Warrior': {
    armorProficiencies: { /* ... */ },
    featProgression: STANDARD_FEAT_PROGRESSION // Reusable!
}
```

**Pattern: Adding Class-Granted Feats**

```typescript
// classGrantedFeats.ts
{
    className: 'Warrior', // ✅ Use class name
    grantedFeats: {
        'warrior_stance': [{
            featId: 'warrior-stance',
            grantedAtLevel: 1,
            source: 'class',
            slotType: 'class',
        }]
    }
}
```

**Pattern: Adding Specialization Rules**

```typescript
// classSpecializationRules.ts
{
    className: 'Wizard',
    rules: [
        {
            specializationTypeId: 'advanced_school',
            minLevel: 10, // Only available from level 10+
        }
    ]
}
```

**Benefits:**
- ✅ No hardcoded Foundry IDs
- ✅ Automatic validation in dev mode
- ✅ Reusable feat progression patterns
- ✅ Class-specific logic in data layer (not components)
- ✅ Translation coverage tracking
- ✅ 100% backward compatible

### Feat-Specific Systems Pattern

When implementing feats that require complex UI or state management (like spellbook management, daily preparations, etc.), follow this pattern:

**Structure:**
1. **Utility Module** (`src/utils/[featName].ts`) - Pure functions for feat logic
2. **Modal Component** (`src/components/desktop/[FeatName]Modal.tsx`) - UI for feat management
3. **Dedicated Styles** (`src/styles/[feat-name].css`) - Feat-specific styles

**Example: Esoteric Polymath System**

The Esoteric Polymath feat (Bard) demonstrates this pattern:
```typescript
// src/utils/esotericPolymath.ts
export function hasEsotericPolymath(character: Character): boolean { /* ... */ }
export function initializeEsotericPolymathSpellbook(character: Character): Character { /* ... */ }
export function setEsotericPolymathDailyPreparation(character: Character, spellId: string | null): Character { /* ... */ }
export function getEsotericPolymathAvailableSpells(character: Character) { /* ... */ }
```

**Key Principles:**
- All state updates return new Character objects (immutability)
- Utility functions are pure and testable
- Modal component only handles UI state (search, filters, tabs)
- Integration with existing spellcasting system (heightened spells, signature spells)

**Pattern: Adding a New Feat-Specific System**

1. Create utility module in `src/utils/[featName].ts`
2. Create modal component in `src/components/desktop/[FeatName]Modal.tsx`
3. Add styles in `src/styles/[feat-name].css`
4. Integrate with existing character recalculation system
5. Add translations to `src/data/translations.ts`

### Devotion Spell System

**Devotion spells** are focus spells granted by archetype dedication feats and class feats. The system uses a centralized database pattern:

**Key File:** `src/data/devotionSpellSources.ts`

```typescript
export const DEVOTION_SPELL_SOURCES: Record<string, DevotionSpellSource> = {
    'blessed-one-dedication': {
        featId: 'blessed-one-dedication',
        featName: 'Blessed One Dedication',
        featNameIt: 'Dedicazione Benedetto',
        grantsFocusPoint: true,
        devotionSpell: {
            spellId: 'zNN9212H2FGfM7VS', // Lay on Hands
            tradition: 'divine',
            keyAbility: 'cha',
        },
    },
    // ... more feats
};
```

**Pattern: Adding a New Devotion Spell Source**

```typescript
'your-feat-slug': {
    featId: 'your-feat-slug', // IMPORTANT: Use slug, NOT Foundry _id
    featName: 'Your Feat Name',
    featNameIt: 'Nome del Tuo Talento',
    grantsFocusPoint: true,
    devotionSpell: {
        spellId: 'spell-id-from-pf2e-data',
        tradition: 'divine', // or 'arcane', 'occult', 'primal'
        keyAbility: 'cha', // or 'str', 'dex', 'con', 'int', 'wis'
    },
},
```

**Integration Points:**
- `spellcastingInitializer.ts` - Initializes spellcasting for archetype feats
- `characterRecalculator.ts` - Adds devotion spells to focusSpells
- Feat browser - Displays devotion spell info when selecting feat

### Builder Mode Architecture

**Critical Pattern**: The character sheet functions as both a character sheet AND a character builder. Users can change levels up/down, add/remove feats, and change selections freely.

**Key Principles (from [featChoices.ts](src/utils/featChoices.ts)):**

1. **Level Changes** (e.g., 10 → 5):
   - ALL feat choices remain in `character.feats[]`
   - ALL selections (deity, bloodline, skill choices) remain in `character.feat[x].choices[]`
   - `recalculateCharacter()` simply doesn't apply effects above current level
   - User can go back UP to level 10 and all choices are preserved

2. **Choice Changes** (e.g., Stealth → Thievery in Rogue Dedication):
   - The feat is REPLACED with updated choices in `handleSelectFeat()`
   - `recalculateCharacter()` rebuilds ALL skills from scratch (untrained base)
   - Then applies ONLY effects from CURRENT feats in `character.feats[]`
   - Old choice effects are automatically gone (feat was replaced)

3. **Feat Removal** (e.g., Rogue Dedication → Fighter Dedication):
   - `handleRemoveFeat()` removes the feat from `character.feats[]`
   - `recalculateCharacter()` is called
   - Removed feat effects are NOT applied (feat is gone)

**RULE**: All recalculation is FROM SCRATCH, not incremental updates!
- `recalculateSkills()` starts with all untrained
- Then applies class/background skills
- Then applies CURRENT feat effects only
- Old feat effects are gone because old feats are gone

**NEVER** remove choices/feats based on level - only recalculate effects!

### Translation System

Components expect both English and Italian fields:
- `name` / `nameIt`
- `description` / `descriptionIt`

Translation mappings in `src/data/translations.ts` are applied via wrapper functions in `index.ts`.

### Component Organization

```
src/
├── components/
│   ├── common/          # Shared components (DiceBox, RichTextEditor, VirtualList)
│   └── desktop/         # Desktop UI (browsers, panels, modals)
│       # Browsers: AncestryBrowser, BackgroundBrowser, ClassBrowser, DeityBrowser, FeatBrowser, etc.
│       # Panels: ActionsPanel, BiographyPanel, CraftingPanel, DefensePanel, FeatsPanel, GearPanel, etc.
│       # Modals: AbilityBoostModal, ArmorOptionsModal, DetailModal, SkillTrainingModal, etc.
├── contexts/            # React contexts (ThemeContext, LanguageContext)
├── pages/              # Route-level pages
├── data/               # Game data and loaders
│   ├── pf2e/          # FoundryVTT JSON files (ancestries, backgrounds, classes, equipment, etc.)
│   ├── pf2e-loader.ts # Data transformation layer
│   └── index.ts       # Barrel exports with translations
├── types/             # TypeScript type definitions
├── hooks/             # Custom React hooks (useLanguage, useMediaQuery)
└── utils/             # Utility functions
```

### Language System

The app has a comprehensive bilingual system (English/Italian):

- **Hook**: `useLanguage()` from `src/hooks/useLanguage.tsx` provides `language`, `setLanguage`, `toggleLanguage()`, and `t(key)` translation function
- **Context**: `LanguageProvider` wraps the app and persists language preference to localStorage
- **Helper Hooks**:
  - `useLocalizedName()` - Get localized name from entity (name/nameIt)
  - `useLocalizedDescription()` - Get localized description (description/descriptionIt)
- **Usage Pattern**: All UI text should use `t('key')` for consistent localization

### Game Data Categories

PF2E game data is loaded from JSON files in `src/data/pf2e/`:
- **ancestries/** - All ancestries and heritages
- **backgrounds/** - 200+ backgrounds for character creation
- **classes/** - All character classes with features
- **equipment/** - Weapons, armor, shields, gear
- **feats/** - All feat categories (ancestry, class, general, skill)
- **spells/** - All spells by tradition
- **actions/** - Class actions and abilities
- **class-features/** - Special features and abilities
- **conditions/** - Status conditions
- **deities/** - All deities with domains

### Key Type Patterns

See `src/types/character.ts` for core types:
- `AbilityName`: `'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'`
- `Proficiency`: `'untrained' | 'trained' | 'expert' | 'master' | 'legendary'`
- Character state includes ability scores, skills, feats, equipment, etc.

### Path Aliases

TypeScript is configured with path alias `@/*` mapping to `src/*`:
```typescript
import { getWeapons } from '@/data';
```

## Known Limitations

### Excluded from TypeScript Compilation

Per `tsconfig.json`, these directories are excluded:
- `src/data/module/`
- `src/data/scripts/`
- `src/data/util/`

These are legacy or unused code. Avoid importing from these paths.

### Pending Class Features

Two classes require special selection UI (see TODO files):

**Commander** ([TODO-COMMANDER.md](TODO-COMMANDER.md)):
- Requires selecting 3 tactics daily from a pool (33 total)
- Cannot use standard single-specialization selector
- Tactics located in `src/data/pf2e/actions/class/commander/`
- Needs dedicated multi-select component with tier/category filtering

**Exemplar** ([TODO-EXEMPLAR.md](TODO-EXEMPLAR.md)):
- Requires selecting 3 Ikons (body/worn/weapon types)
- Similar to Commander, needs multi-select UI
- Ikons in `src/data/pf2e/class-features/` with `exemplar-ikon` tag
- Must include at least one weapon ikon

### Other Known Limitations
- Some advanced class features (like kineticist impulses) have specialized browser components
- Multiclass archetype support is partially implemented
- Vehicle and mount mechanics are not yet implemented

## Data File Patterns

### Adding New Game Content

1. **JSON Data**: Add FoundryVTT-format JSON to appropriate `src/data/pf2e/` subdirectory
2. **Loader**: Update glob pattern in `pf2e-loader.ts` if adding new category
3. **Types**: Define TypeScript interfaces for loaded data structure
4. **Translations**: Add Italian translations to `translations.ts`
5. **Export**: Add barrel export in `index.ts`

### Class Progressions

Class features and level-up progressions are manually defined in:
- `src/data/classProgressions.ts` - Feature grants by level
- `src/data/classSpecializations.ts` - Subclasses, orders, muses, etc.
- `src/data/classFeatures.ts` - Feature definitions
- `src/data/classResourceTemplates.ts` - Focus pools, spell slots, etc.

## Recently Implemented Features

### Esoteric Polymath System (Latest: 2026-01-28)
- **Complete feat-specific system** for Bard's Esoteric Polymath feat
- **Modal component** ([EsotericPolymathModal.tsx](src/components/desktop/EsotericPolymathModal.tsx)) for spellbook and daily preparation management
- **Utility module** ([esotericPolymath.ts](src/utils/esotericPolymath.ts)) with pure functions for feat logic
- **Spellbook management** - Occult spells learned via Occultism skill
- **Daily preparation selection** - Choose one spell from spellbook each day
- **Signature spell integration** - Daily preparation becomes signature spell for spontaneous casters
- **Heightened spell support** - Automatic heightened version management for all slot levels

### Skill Increase Modal (2026-01-28)
- **Specialized modal** ([SkillIncreaseModal.tsx](src/components/desktop/SkillIncreaseModal.tsx)) for skill proficiency selection
- **Level-based limits** - Maximum proficiency based on character level (expert at level 7+, master at 15+)
- **Visual progression** - Shows current proficiency → next proficiency with badges
- **Filtered display** - Only shows skills that can be increased

### Devotion Spell System (2026-01-28)
- **Centralized database** ([devotionSpellSources.ts](src/data/devotionSpellSources.ts)) for archetype and class feats that grant focus spells
- **Automatic spellcasting initialization** for non-spellcaster archetypes
- **Focus point management** integration with feat grants
- **Supports multiple traditions** - divine, occult, primal, arcane
- **Key ability handling** for spell DC/attack calculations

### Backgrounds (Latest: 2026-01-25)
- **200+ backgrounds** loaded from `src/data/pf2e/backgrounds/*.json`
- Integrated into character creation flow
- Provides ability boosts, trained skills, and feat choices
- Fully translated with Italian names and descriptions

### Desktop Character Sheet Layout
- **Dedicated panels** for all character aspects: WeaponsPanel, DefensePanel, GearPanel, SpellsPanel, FeatsPanel, ActionsPanel, etc.
- **Drag-and-drop inventory** system with containers (backpacks, bags)
- **Bulk tracking** with container reduction (magical containers provide bulk reduction)
- **Investment system** - 10 invested item limit with toggle UI
- **Spell-granting items** with configuration UI for selecting spells and tracking daily uses
- **Damage breakdown** with detailed MAP (Multiple Attack Penalty) display and elemental dice coloring

### Weapon/Armor/Shield Customization
- **Fundamental runes** (potency, striking, resilient) with automatic bonuses
- **Property runes** for weapons and armor
- **Material overrides** (cold iron, silver, adamantine, etc.)
- **Custom names** and advanced customization options
- **Shield HP tracking** with reinforcing rune support

### Comprehensive Browser Components
- Browser components for all content categories: ancestries, backgrounds, classes, deities, feats, spells, equipment
- Filterable and searchable interfaces
- Modal-based selection with detailed descriptions

### Language Hook
- `useLanguage()` hook provides bilingual support throughout the app
- Translation keys organized by feature area
- Helper functions for localized names and descriptions

## Testing

Vitest is configured but test coverage is minimal. When adding tests:
- Place `.test.ts` or `.spec.ts` files alongside source files
- Run `npm test` for watch mode
- Use `npm test -- --run` for CI mode

## Build Configuration

Vite config ([vite.config.ts](vite.config.ts)):
- Manual chunk splitting for React vendor bundle optimization
- Port 5173 with host exposure for network testing
- File watching with 1000ms debounce interval
- Optimized dependencies pre-bundling
- TypeScript strict mode enabled
- ESLint with TypeScript rules configured

## Key Utilities

**Character Management:**
- `src/utils/characterRecalculator.ts` - Recalculates all character stats on equipment/investment changes
- `src/utils/featChoices.ts` - Parses feat choices from FoundryVTT JSON and applies dedication benefits
- `src/utils/archetypeDedication.ts` - Handles archetype dedication feat processing and initialization
- `src/utils/spellcastingInitializer.ts` - Initializes spellcasting data for class and archetype feats

**Spell Systems:**
- `src/utils/spellHeightening.ts` - Calculates heightened spell effects for spontaneous casters
- `src/utils/esotericPolymath.ts` - Esoteric Polymath feat spellbook and daily preparation management
- `src/data/devotionSpellSources.ts` - Database of feats that grant devotion spells (focus spells)

**Item Management:**
- `src/utils/currency.ts` - Currency conversion and display helpers
- `src/utils/weaponName.ts` - Enhanced weapon naming with rune information
- `src/utils/armorName.ts` - Enhanced armor naming with rune information
- `src/utils/shieldName.ts` - Enhanced shield naming with rune information
- `src/data/shieldRunes.ts` - Shield reinforcing rune calculations
- `src/data/spellGrantingItems.ts` - Spell-granting item definitions and configurations

## UI Patterns

### Modal Components

**Standard Detail Modals:**
- All detail modals extend `DetailModal` with title, subtitle, and custom content
- Modal actions (restore, swap, equip) should use consistent button patterns
- Use `isOpen` prop for controlled modal state

**Selection Modals** (e.g., SkillIncreaseModal):
- Use `modal-overlay` wrapper with click-to-close
- Use `selection-modal` class for the modal container
- Include `modal-header`, `modal-content`, `modal-footer` structure
- Apply/disabled states for selection buttons

**Feat-Specific Modals** (e.g., EsotericPolymathModal):
- Use tabbed interface for multiple views (spellbook, daily preparation)
- Include inline browser components for adding/removing items
- Show counts and badges for state indicators
- Always provide clear button for closing/canceling actions

**Available Modals:**
- `AbilityBoostModal` - Ability score selection
- `ArmorOptionsModal` - Armor customization
- `DetailModal` - Base class for item/spell/feat details
- `EsotericPolymathModal` - Esoteric Polymath spellbook management
- `SkillIncreaseModal` - Skill proficiency selection
- `SkillTrainingModal` - Initial skill training

### Browser Components
- All browser components follow the pattern: search bar + filter + item grid + detail view
- Items should display: name (localized), level, traits, and brief description
- Selection updates parent state through callback props

### Panel Components
- Desktop panels receive `character` and `onCharacterUpdate` props
- Always create new character objects when updating (immutability)
- Use `recalculateCharacter()` for stat-affecting changes (investment, equipment)
