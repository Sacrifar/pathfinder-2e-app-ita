# Exemplar Ikons - TODO

## Status
L'Exemplar non ha ancora le specializzazioni implementate.

## Issue
Il sistema dell'Exemplar richiede la selezione di **3 Ikons** (come il Commander con 3 tactics), non una singola specializzazione.

## Exemplar Features

### Divine Spark and Ikons
L'Exemplar ha un "Divine Spark" che può essere inserito in una delle sue Ikons per attivarne i poteri.

### Ikons System
Il giocatore deve selezionare **3 Ikons** al livello 1 da una lista di opzioni.

Each Ikon has:
- **Immanence** - Passive effect when spark is in the ikon
- **Transcendence** - Active ability that casts spark out

### Ikon Types
- **Body Ikons** - Physical traits (can't be stolen/disarmed)
- **Worn Ikons** - Items like shields, cloaks, etc.
- **Weapon Ikons** - Weapons (at least one should be a weapon)

### Available Ikons (19+ total)
Located in: `src/data/pf2e/class-features/`

#### Weapon Ikons
- Gleaming Blade (sword/knife)
- Barrow's Edge (axe/spear)
- Shadow Sheath (bow/crossbow)
- ... (and more)

#### Worn Ikons
- Mirrored Aegis (shield)
- Fetching Bangles (bangles)
- Gaze Sharp as Steel (glasses/visor)
- Horn of Plenty (cup/horn)
- Mortal Harvest (sickle/scythe)
- Noble Branch (staff/wand)
- Pelt of the Beast (cloak)
- Scar of the Survivor (mask)
- Skybearer's Belt (belt)
- ... (and more)

#### Body Ikons
- Bands of Imprisonment (wrists/fetter)
- Deft Hands
- Eye-Catching Spot (eye)
- Hands of the Wildling (hand)
- Skin Hard as Horn (skin)
- ... (and more)

## Requirements for Implementation

1. **Dedicated UI Component** for Exemplar Ikons selection
   - List of all available ikons (filtered by type)
   - Multi-select for 3 ikons
   - Visual indication of Body vs Worn vs Weapon ikons
   - Warning if no weapon ikon is selected

2. **Data Structure**
   - Import ikons from `class-features/*-ikon*.json` (or use `exemplar-ikon` tag)
   - Filter by type (body/worn/weapon)
   - Store 3 selected ikons vs all available ikons

3. **Interface**
   - Different from ClassSpecializationBrowser
   - Similar to Commander tactics selector
   - Allow selecting 3 ikons from available pool
   - Show immanence and transcendence effects for each ikon

## Files to Modify
- `src/data/classSpecializations.ts` - Add Exemplar data structure (or separate file)
- `src/components/desktop/` - Create ExemplarIkonSelector component
- `src/styles/desktop.css` - Add styles for ikon selector

## Reference
- Feature file: `src/data/pf2e/class-features/divine-spark-and-ikons.json`
- Individual ikons: Files with `exemplar-ikon` tag in `class-features/`

## Notes
- At least one ikon should be a weapon ikon (per rules)
- Each ikon has complex rules for Immanence and Transcendence
- Ikons can have runes etched on them like normal items
- Divine Spark can shift between ikons using Shift Immanence action
