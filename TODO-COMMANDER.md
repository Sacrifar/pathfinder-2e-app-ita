# Commander Tactics - TODO

## Status
Il Commander non ha ancora le specializzazioni implementate.

## Issue
Il sistema del Commander è troppo complesso per essere rappresentato come una semplice selezione di specializzazione come le altre classi.

## Commander Features

### Tactics System
Il Commander prepara **3 tattiche al giorno** da un folio di opzioni. Non è una selezione singola ma un sistema di preparazione giornaliera.

### Available Tactics (33 total)
Located in: `src/data/pf2e/actions/class/commander/`

#### Categories
- **Mobility Tactics** - Movement and positioning
- **Offensive Tactics** - Combat maneuvers and attacks

#### Tiers
- **Basic Tactics** (Level 1)
- **Expert Tactics** (Level 6+)
- **Master Tactics** (Level 10+)
- **Legendary Tactics** (Level 16+)

### Sample Tactics
- Alley-Oop (expert)
- Defensive Retreat (mobility)
- Piranha Assault
- Double Team
- Pincer Attack
- Protective Screen
- ... (33 total)

## Requirements for Implementation

1. **Dedicated UI Component** for Commander Tactics selection
   - List of all available tactics (filtered by tier)
   - Multi-select for 3 tactics to prepare
   - Ability to change prepared tactics daily

2. **Data Structure**
   - Import tactics from `actions/class/commander/*.json`
   - Filter by tier (basic/expert/master/legendary)
   - Store prepared tactics vs known tactics

3. **Interface**
   - Different from ClassSpecializationBrowser
   - More like a spellbook or feat selection interface
   - Allow selecting 3 tactics from available pool

## Files to Modify
- `src/data/classSpecializations.ts` - Add Commander data
- `src/components/desktop/` - Create CommanderTacticsSelector component
- `src/styles/desktop.css` - Add styles for tactics selector

## Reference
- Feature file: `src/data/pf2e/class-features/tactics.json`
- Actions folder: `src/data/pf2e/actions/class/commander/`
