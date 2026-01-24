# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Last Updated**: 2026-01-24
**Last Commit**: [Current commit with agent skills]

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
├── contexts/            # React contexts (ThemeContext)
├── pages/              # Route-level pages
├── data/               # Game data and loaders
│   ├── pf2e/          # FoundryVTT JSON files (ancestries, classes, equipment, etc.)
│   ├── pf2e-loader.ts # Data transformation layer
│   └── index.ts       # Barrel exports with translations
├── types/             # TypeScript type definitions
├── hooks/             # Custom React hooks
└── utils/             # Utility functions
```

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

**Commander** (`TODO-COMMANDER.md`):
- Requires selecting 3 tactics daily from a pool (33 total)
- Cannot use standard single-specialization selector
- Tactics located in `src/data/pf2e/actions/class/commander/`
- Needs dedicated multi-select component

**Exemplar** (`TODO-EXEMPLAR.md`):
- Requires selecting 3 Ikons (body/worn/weapon types)
- Similar to Commander, needs multi-select UI
- Ikons in `src/data/pf2e/class-features/` with `exemplar-ikon` tag
- Must include at least one weapon ikon

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

## Testing

Vitest is configured but test coverage is minimal. When adding tests:
- Place `.test.ts` or `.spec.ts` files alongside source files
- Run `npm test` for watch mode
- Use `npm test -- --run` for CI mode

## Build Configuration

Vite config includes:
- Manual chunk splitting for React vendor bundle
- Port 5173 with host exposure
- File watching with 1000ms debounce interval
- Optimized dependencies pre-bundling
