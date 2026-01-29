# Feat Implementation Tracking Document

**Created**: 2026-01-28
**Purpose**: Track implementation status of all class feats requiring special handling
**Total Classes**: 22+
**Total Tracked Feats**: 1,200+

---

## Summary Statistics

| Category | Count | Status |
|----------|-------|--------|
| **Classes with FULLY implemented complex feats** | 2 | ✅ Kineticist, Bard |
| **Classes with PARTIALLY implemented feats** | 3 | ⚠️ Champion, Cleric, Sorcerer |
| **Classes with NO implemented complex feats** | 16+ | ❌ See below |
| **Total complex feats needing implementation** | 1,100+ | 🔄 In Progress |

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Fully Implemented |
| ⚠️ | Partially Implemented |
| ❌ | Not Implemented |
| 🔧 | Has Special Utility/Component |
| 📝 | TODO Document Exists |
| 📊 | Simple FlatModifier Only |

---

## Class-by-Class Implementation Status

### ✅ FULLY IMPLEMENTED CLASSES

#### Kineticist (130 feats)
**Status**: ✅ FULLY IMPLEMENTED

**Implemented Systems**:
- ✅ Gate selection (elemental focus)
- ✅ Impulse selection at levels 1, 5, 9, 13, 17
- ✅ Junction system at levels 5, 9, 13, 17
- ✅ Elemental blast mechanics

**Files**:
- `src/components/desktop/KineticistImpulseBrowser.tsx`
- `src/components/desktop/KineticistJunctionBrowser.tsx`
- `src/components/desktop/ImpulsePanel.tsx`
- `src/data/classFeatures.ts` (Junction skills)

**Implementation Pattern**: Complete browser + panel + data integration

---

#### Bard (75 feats total)
**Status**: ✅ FULLY IMPLEMENTED

**All Muses Supported**:
- ✅ Polymath Muse (Polimata)
- ✅ Enigma Muse (Enigma)
- ✅ Maestro Muse (Maestro)
- ✅ Warrior Muse (Guerriero)
- ✅ Zoophonia Muse (Zoofonia)

**Implemented Complex Feats** (13 with dedicated utilities):
- ✅ Esoteric Polymath (Level 2) - Complete spellbook system
  - `src/utils/esotericPolymath.ts`
  - `src/components/desktop/EsotericPolymathModal.tsx`
  - Spellbook management, daily preparation, heightened spells

- ✅ Eclectic Skill (Level 8) - Special untrained skill mechanics
  - `src/utils/eclecticSkill.ts`
  - Trained-only checks, legendary Occultism → expert

- ✅ Bardic Lore (Level 1) - Special Lore skill creation
  - `src/utils/bardicLore.ts`
  - Intelligence-based Lore skill

- ✅ Versatile Performance (Level 1) - Performance-to-skill substitution
  - `src/utils/versatilePerformance.ts`
  - Performance-based skill substitution

- ✅ Versatile Signature (Level 4) - Daily signature spell change
  - `src/utils/versatileSignature.ts`
  - Spontaneous signature spell management

- ✅ Assured Knowledge (Level 6) - Guaranteed Recall Knowledge
  - `src/utils/assuredKnowledge.ts`
  - Automatic success mechanics

- ✅ True Hypercognition (Level 14) - Instant Recall Knowledge
  - `src/utils/trueHypercognition.ts`
  - 5x/day free action, daily usage tracking

- ✅ Deep Lore (Level 18) - Extra spells for repertoire
  - `src/utils/deepLore.ts`
  - `src/components/desktop/DeepLoreModal.tsx`
  - One extra spell per rank

- ✅ Enigma's Knowledge - Automatic Knowledge (1/round)
  - `src/utils/enigmasKnowledge.ts`
  - Per-round tracking

- ✅ Studious Capacity - Cast without slots (1/day)
  - `src/utils/studiousCapacity.ts`
  - Daily usage tracking

- ✅ Ultimate Polymath - All spells become signature
  - `src/utils/ultimatePolymath.ts`
  - Signature spell management

- ✅ Multifarious Muse - Multi-muse versatility
  - `src/utils/multifariousMuse.ts`

- ✅ Lingering Composition - Extends composition duration
  - `src/utils/lingeringComposition.ts`
  - `src/utils/activeCompositions.ts`

**Simple Feats** (40+ with helper functions):
- ✅ All composition feats handled via JSON `FlatModifier` rules
- ✅ `src/utils/bardSimpleFeats.ts` - 20+ helper functions

**UI Components**:
- ✅ DeepLoreModal - Extra spell selection per rank
- ✅ EsotericPolymathModal - Polymath spellbook management
- ✅ Active composition tracking in `src/utils/activeCompositions.ts`
- ✅ Bonus visualization via `src/utils/activeFeatBonuses.ts`

**Daily Usage Tracking**:
- ✅ `character.dailyFeatUses.studiousCapacity`
- ✅ `character.dailyFeatUses.trueHypercognition`
- ✅ ISO date-based reset system

**Italian Translations**: ✅ Complete

---

### ⚠️ PARTIALLY IMPLEMENTED CLASSES

#### Champion (80 feats)
**Status**: ⚠️ PARTIALLY IMPLEMENTED

**Implemented**:
- ✅ Devotion spells via `src/data/devotionSpellSources.ts`
  - Champion dedication focus spells
  - Advanced devotion spells

**Not Implemented**:
- ❌ Reaction abilities (Retributive Strike, etc.)
- ❌ Aura mechanics
- ❌ Cause-specific features
- ❌ Touch of corruption mechanics

**Missing**: ~70 complex feats

---

#### Cleric (74 feats)
**Status**: ⚠️ PARTIALLY IMPLEMENTED

**Implemented**:
- ✅ Devotion spells via `src/data/devotionSpellSources.ts`
  - Domain spells
  - Channel energy basics

**Not Implemented**:
- ❌ Domain ability mechanics
- ❌ Channel energy variants
- ❌ Divine font options
- ❌ Font spell management

**Missing**: ~60 complex feats

---

#### Sorcerer (50 feats)
**Status**: ⚠️ PARTIALLY IMPLEMENTED

**Implemented**:
- ✅ Basic bloodline focus in `src/utils/focusCalculator.ts`

**Not Implemented**:
- ❌ Bloodline ability progression
- ❌ Bloodline spell management
- ❌ Feat-specific bloodline powers
- ❌ Dragon/Sylvan/other bloodline mechanics

**Missing**: ~40 complex feats

---

### ❌ NOT IMPLEMENTED CLASSES

#### Alchemist (65 feats)
**Status**: ❌ NOT IMPLEMENTED

**Missing Features**:
- ❌ Alchemical bomb system
- ❌ Elixir creation and management
- ❌ Research field mechanics
- ❌ Alchemical familiar (Level 4)
- ❌ Perpetual infusions
- ❌ Quick alchemy

**Complexity**: HIGH (requires item creation system)

**Estimated Effort**: 40-60 hours

---

#### Barbarian (80 feats)
**Status**: ❌ NOT IMPLEMENTED

**Missing Features**:
- ❌ Rage mechanics (duration, effects, totem restrictions)
- ❌ Spirit totem abilities
- ❌ Instinct feature progression
- ❌ Fury/Animal/Spirit totem mechanics
- ❌ Rage damage calculations

**Complexity**: MEDIUM-HIGH

**Estimated Effort**: 30-40 hours

---

#### Druid (83 feats)
**Status**: ❌ NOT IMPLEMENTED

**Missing Features**:
- ❌ Wild shape system (polymorph mechanics)
- ❌ Order/Instinct abilities
- ❌ Storm spell effects
- ❌ Plant order healing
- ❌ Animal order companion mechanics

**Complexity**: HIGH (requires polymorph system)

**Estimated Effort**: 40-50 hours

---

#### Fighter (72 feats)
**Status**: ❌ NOT IMPLEMENTED

**Missing Features**:
- ❌ Combat stance management
- ❌ Weapon specialization progression
- ❌ Advanced weapon techniques
- ❌ Reaction abilities (Attack of Opportunity, etc.)
- ❌ Flexibility mechanics

**Complexity**: MEDIUM

**Estimated Effort**: 20-30 hours

---

#### Investigator (45 feats)
**Status**: ❌ NOT IMPLEMENTED

**Missing Features**:
- ❌ Devise a Stratagem mechanics
- ❌ Pursuit mode abilities
- ❌ Methodology features
- ❌ Forensic medicine usage
- ❌ Clue gathering system

**Complexity**: MEDIUM-HIGH

**Estimated Effort**: 25-35 hours

---

#### Magus (51 feats)
**Status**: ❌ NOT IMPLEMENTED

**Missing Features**:
- ❌ Spellstrike system (spell + attack combo)
- ❌ Spellshot mechanics
- ❌ Hybrid study abilities
- ❌ Magus focus pool
- ❌ Counteract mechanics

**Complexity**: HIGH (requires attack-spell integration)

**Estimated Effort**: 35-45 hours

---

#### Monk (126 feats)
**Status**: ❌ NOT IMPLEMENTED

**Missing Features**:
- ❌ Ki pool management
- ❌ Flurry of blows calculation
- ❌ Stance selection and switching
- ❌ Style feat combos
- ❌ Ki strike abilities
- ❌ Monk weapons progression

**Complexity**: HIGH (requires resource pool + stance system)

**Estimated Effort**: 40-50 hours

---

#### Oracle (37 feats)
**Status**: ❌ NOT IMPLEMENTED

**Missing Features**:
- ❌ Mystery class features
- ❌ Curse progression mechanics
- ❌ Revelation abilities
- ❌ Curse effects and management
- ❌ Divine curse variants

**Complexity**: MEDIUM-HIGH

**Estimated Effort**: 25-35 hours

---

#### Psychic (43 feats)
**Status**: ❌ NOT IMPLEMENTED

**Missing Features**:
- ❌ Mind psi pool (can be recharged)
- ❌ Conscious mind abilities
- ❌ Psychic spellcasting mechanics
- ❌ Unconscious manifestation effects
- ❌ Amp usage

**Complexity**: MEDIUM-HIGH

**Estimated Effort**: 30-40 hours

---

#### Ranger (78 feats)
**Status**: ❌ NOT IMPLEMENTED

**Missing Features**:
- ❌ Hunt prey mechanics
- ❌ Animal companion system
- ❌ Hunter's edge abilities
- ❌ Precision damage calculation
- ❌ Masterful hunter techniques

**Complexity**: HIGH (requires companion system)

**Estimated Effort**: 35-45 hours

---

#### Rogue (87 feats)
**Status**: ❌ NOT IMPLEMENTED

**Missing Features**:
- ❌ Sneak attack damage calculation
- ❌ Racket abilities
- ❌ Thievery/Trick techniques
- ❌ Rogue's racket edge
- ❌ Surprise attack mechanics

**Complexity**: MEDIUM

**Estimated Effort**: 25-35 hours

---

#### Swashbuckler (62 feats)
**Status**: ❌ NOT IMPLEMENTED

**Missing Features**:
- ❌ Panache point system
- ❌ Style feats (use-based)
- ❌ Finisher mechanics
- ❌ Brave enter effect
- ❌ Charmed life usage

**Complexity**: MEDIUM-HIGH

**Estimated Effort**: 30-40 hours

---

#### Thaumaturge (38 feats)
**Status**: ❌ NOT IMPLEMENTED

**Missing Features**:
- ❌ Implement selection and management
- ❌ Esoterica pool
- ❌ Exploit vulnerability mechanics
- ❌ Implement-specific abilities
- ❌ Pierce veil system

**Complexity**: MEDIUM-HIGH

**Estimated Effort**: 30-40 hours

---

#### Wizard (31 feats)
**Status**: ❌ NOT IMPLEMENTED

**Missing Features**:
- ❌ Spellbook management (not just repertoire)
- ❌ Arcane school powers
- ❌ School spell slots
- ❌ Arcane thesis abilities
- ❌ Focus pool integration

**Complexity**: MEDIUM-HIGH

**Estimated Effort**: 25-35 hours

---

### 📝 CLASSES WITH EXISTING TODOs

#### Commander (39 feats)
**Status**: ❌ NOT IMPLEMENTED (TODO exists)

**Missing Features**:
- ❌ Tactics selection system (3 daily from 33)
- ❌ Tactical command usage
- ❌ Banner mechanics
- ❌ Squad tactics

**Complexity**: HIGH (multi-select daily system)

**Estimated Effort**: 40-50 hours

**See**: [TODO-COMMANDER.md](TODO-COMMANDER.md)

---

#### Exemplar (47 feats)
**Status**: ❌ NOT IMPLEMENTED (TODO exists)

**Missing Features**:
- ❌ Ikon selection (3 from body/worn/weapon)
- ❌ Must include at least 1 weapon ikon
- ❌ Ikons progression
- ❌ Awe abilities

**Complexity**: HIGH (multi-select constraint system)

**Estimated Effort**: 35-45 hours

**See**: [TODO-EXEMPLAR.md](TODO-EXEMPLAR.md)

---

### 🔧 OTHER CLASSES (Not Fully Analyzed)

The following classes exist but require detailed analysis:

- **Animist**: Spirit medium mechanics, apotheosis
- **Gunslinger**: Reload system, firearm targeting, way tricks
- **Inventor**: Innovation system, modification, override
- **Summoner**: Eidolon management, evolution feats, tandem actions
- **Guardian**: Defense aegis, shield mechanics, bulwark
- **Witch**: Patron mechanics, hex system, lessons

---

## Common Implementation Patterns

### Pattern 1: Resource Pool Systems
**Used by**: Monk, Psychic, Swashbuckler, Magus
**Requirements**:
- Resource tracking (ki, psi, panache)
- Recharge mechanics
- Ability cost management
- UI for resource display

**Example**: Ki pool for Monk
```typescript
// src/utils/kiPool.ts
export function getKiPoolMax(character: Character): number;
export function getCurrentKi(character: Character): number;
export function spendKi(character: Character, amount: number): Character;
export function regainKi(character: Character, amount: number): Character;
```

### Pattern 2: Selection/Choice Systems
**Used by**: Commander, Exemplar, Kineticist
**Requirements**:
- Multi-selection UI
- Daily reselection
- Constraint validation (e.g., must select weapon)
- Browser components for selection

**Example**: Kineticist Impulse Browser
```typescript
// src/components/desktop/KineticistImpulseBrowser.tsx
// Handles impulse selection with level constraints
```

### Pattern 3: Spell System Extensions
**Used by**: Bard, Magus, Wizard, Psychic
**Requirements**:
- Spellbook/repertoire modifications
- Signature spell management
- Special casting mechanics
- Daily preparation changes

**Example**: Esoteric Polymath
```typescript
// src/utils/esotericPolymath.ts
// Handles spellbook, daily preparation, heightened spells
```

### Pattern 4: Conditional Mechanics
**Used by**: Barbarian, Champion, Fighter
**Requirements**:
- State tracking (raging, hunted prey, etc.)
- Conditional bonuses based on state
- Duration management
- Trigger condition validation

### Pattern 5: Companion/Minion Systems
**Used by**: Ranger, Druid, Summoner, Alchemist
**Requirements**:
- Companion stat blocks
- Companion action tracking
- Companion progression
- UI for companion management

---

## Implementation Priority Matrix

### Tier 1: Core Mechanics (Must Have)
These feats are fundamental to class identity:

| Class | Feat | Level | Complexity | Priority |
|-------|------|-------|------------|----------|
| Bard | Eclectic Skill | 8 | Medium | HIGH |
| Bard | Bardic Lore | 1 | Medium | HIGH |
| Barbarian | Rage mechanics | 1 | High | HIGH |
| Monk | Ki Pool | 1 | High | HIGH |
| Ranger | Hunt Prey | 1 | Medium | HIGH |
| Rogue | Sneak Attack | 1 | Medium | HIGH |
| Sorcerer | Bloodline Abilities | 1 | High | HIGH |
| Wizard | Arcane School | 1 | Medium | HIGH |

### Tier 2: Significant Features (Should Have)
Important class-defining features:

| Class | Feat | Level | Complexity | Priority |
|-------|------|-------|------------|----------|
| Fighter | Weapon Supremacy | 6 | Medium | MEDIUM |
| Magus | Spellstrike | 1 | High | MEDIUM |
| Cleric | Domain Abilities | 1 | Medium | MEDIUM |
| Champion | Reaction Strikes | 1 | Medium | MEDIUM |
| Druid | Wild Shape | 1 | High | MEDIUM |
| Alchemist | Quick Alchemy | 1 | High | MEDIUM |

### Tier 3: Advanced Options (Nice to Have)
Higher-level and specialized features:

| Class | Feat | Level | Complexity | Priority |
|-------|------|-------|------------|----------|
| Commander | Tactics System | 1 | High | LOW |
| Exemplar | Ikon Selection | 1 | High | LOW |
| Swashbuckler | Panache System | 1 | Medium | LOW |
| Investigator | Devise Stratagem | 1 | Medium | LOW |

---

## Cross-Class Dependencies

Some systems are shared across multiple classes:

### Shared Systems to Implement First:

1. **Resource Pool System**
   - Needed by: Monk, Psychic, Swashbuckler, Magus, Champion
   - Create generic resource pool framework

2. **Stance/System Selector**
   - Needed by: Monk, Fighter, Barbarian
   - Create generic stance selection UI

3. **Companion/Minion System**
   - Needed by: Ranger, Druid, Summoner, Alchemist
   - Create companion management framework

4. **Spellbook System**
   - Needed by: Wizard, Alchemist (formula book)
   - Extend Esoteric Polymath pattern

5. **Polymorph/Wild Shape System**
   - Needed by: Druid, various spell effects
   - Create polymorph framework

---

## Effort Estimation Summary

| Tier | Classes | Feats | Hours |
|------|---------|-------|-------|
| **Tier 1 (High Priority)** | 8 classes | ~100 feats | ~200-250 hours |
| **Tier 2 (Medium Priority)** | 6 classes | ~80 feats | ~150-200 hours |
| **Tier 3 (Low Priority)** | 8+ classes | ~200+ feats | ~300-400 hours |
| **Shared Systems** | N/A | N/A | ~50-80 hours |
| **TOTAL** | 22+ classes | 1,200+ feats | ~700-930 hours |

---

## Next Steps

1. **Implement shared systems first** (resource pools, companions)
2. **Prioritize Tier 1 feats** for core class functionality
3. **Create detailed TODOs** for each remaining class (following TODO-BARD-FEATS.md pattern)
4. **Set up testing infrastructure** for feat validation
5. **Establish translation workflow** for Italian translations

---

## Related Documents

- [TODO-COMMANDER.md](TODO-COMMANDER.md) - Commander class implementation
- [TODO-EXEMPLAR.md](TODO-EXEMPLAR.md) - Exemplar class implementation
- [CLAUDE.md](CLAUDE.md) - Project overview and patterns

---

## Heritage Feats Status

**Overall Status**: ✅ MOSTLY IMPLEMENTED

Most heritage feats use basic `FlatModifier` rules and work through the existing feat processing system in `src/utils/featChoices.ts`.

**Potential Exceptions** (may need special handling):
- Heritage feats with complex choice systems (totem spirits, etc.)
- Heritage feats that grant multiple selectable abilities
- Heritage feats with daily preparation mechanics

---

## Archetype Feats Status

**Overall Status**: ⚠️ PARTIALLY IMPLEMENTED

**Currently Implemented**:
- ✅ Basic archetype dedication feats (via `featChoices.ts`)
- ✅ Proficiency grants from dedications
- ✅ Devotion spells (via `devotionSpellSources.ts`)

**Missing Implementation** (50+ archetypes with ~500 feats):

### Archetypes Requiring Complex Mechanics

| Archetype | Missing Mechanics | Complexity |
|-----------|------------------|------------|
| **Alchemist** | Advanced alchemy, perpetual infusions, formula book | HIGH |
| **Animal Trainer** | Companion system | HIGH |
| **Armorer** | Advanced armor modifications | MEDIUM |
| **Assassin** | Death strike mechanics | MEDIUM |
| **Bastion** | Shield ally mechanics | MEDIUM |
| **Bruiser** | Two-handed weapon specializations | MEDIUM |
| **Cavalier** | Mount mechanics | MEDIUM |
| **Champion (archetype)** | Aura mechanics, divine abilities | MEDIUM-HIGH |
| **Chevalier** | Mounted combat | MEDIUM |
| **Clothier** | Advanced clothing enchantments | LOW-MEDIUM |
| **Dragon Disciple** | Dragon mechanics, breath weapon | HIGH |
| **Duelist** | Dueling mechanics, parry | MEDIUM |
| **Elemental Channeler** | Elemental spell variants | MEDIUM |
| **Eldritch Archer** | Spellshot mechanics | HIGH |
| **Evolutionist** | Mutagen evolution | MEDIUM-HIGH |
| **Fey Dedication** | Fey magic, trick | MEDIUM |
| **Fighter (archetype)** | Combat stances, weapon techniques | MEDIUM |
| **Gunslinger (archetype)** | Reload system, firearm targeting | HIGH |
| **Hellknight** | Order-specific mechanics | MEDIUM-HIGH |
| **Impulse Rider** | Kineticist impulses | HIGH |
| **Inventor (archetype)** | Innovation system, modifications | HIGH |
| **Knight-Vigilant** | Guardian's defense | MEDIUM |
| **Martial Artist** | Advanced unarmed combat, ki | MEDIUM-HIGH |
| **Monk (archetype)** | Ki pool, stances, flurry | HIGH |
| **Necromancer** | Undead mechanics | MEDIUM-HIGH |
| **Phantom** | Phantom companion | HIGH |
| **Pirate** | Sea-faring mechanics | LOW-MEDIUM |
| **Polymath** | Knowledge skills, abilities | MEDIUM |
| **Ranger (archetype)** | Hunt prey, animal companion | HIGH |
| **Rogue (archetype)** | Sneak attack, racket | MEDIUM-HIGH |
| **Savage Barbarian** | Rage mechanics | MEDIUM |
| **Scout** | Exploration mechanics | LOW-MEDIUM |
| **Shadowdancer** | Shadow magic, teleport | HIGH |
| **Sniper** | Ranged weapon specializations | MEDIUM |
| **Spellshot (archetype)** | Spellshot mechanics | HIGH |
| **Swashbuckler (archetype)** | Panache system, finishers | HIGH |
| **Thaumaturge (archetype)** | Implement system, esoterica | HIGH |
| **Thrill-Seeker** | Risk mechanics | MEDIUM |
| **Trickster** | Trick mechanics | MEDIUM |
| **Vigilante** | Secret identity mechanics | MEDIUM |
| **Werewolf** | Lycanthropy mechanics | HIGH |
| **Witch (archetype)** | Patron mechanics, hexes | HIGH |

**Estimated Effort**: 400-600 hours for all archetype feats

**Priority**: MEDIUM (implement after core classes)

---

## General Feats Status

**Overall Status**: ✅ MOSTLY IMPLEMENTED

Most general feats use basic `FlatModifier` rules and work through the existing feat processing system.

**Potential Exceptions** (may need special handling):
- **Feats with complex choice systems** (e.g., multiple item selections)
- **Feats with daily preparation mechanics** (e.g., certain skill-related bonuses)
- **Feats that grant special abilities** (e.g., Loremaster's etude, Incredible Investiture)

---

## Skill Feats Status

**Overall Status**: ✅ MOSTLY IMPLEMENTED

Most skill feats work through the existing skill system in `src/utils/characterRecalculator.ts`.

**Implemented Complex Skill Feats**:
- ✅ Eclectic Skill (Bard) - special untrained skill bonus
- ✅ Versatile Performance (Bard) - Performance-based skill substitution
- ✅ Bardic Lore (Bard) - special Lore skill
- ✅ Assured Knowledge (Bard) - guaranteed Recall Knowledge
- ✅ True Hypercognition (Bard) - instant Recall Knowledge
- ✅ Deep Lore (Bard) - extra spells for repertoire
- ✅ Enigma's Knowledge (Bard) - automatic Knowledge
- ✅ Studious Capacity (Bard) - cast without slots

**Potential Exceptions** (may need special handling):
- Skill feats with complex conditional bonuses
- Skill feats that grant special abilities (not just modifiers)
- Skill feats with daily usage limits
- Skill feats that interact with other systems (exploration, downtime)

---

## Specific Feat Implementation Details

### Bard - Fully Detailed Analysis

**Status**: ✅ FULLY IMPLEMENTED

**All 75 Bard feats implemented**:

**Complex Feats** (13 with dedicated utilities):
- `esoteric-polymath` - Complete spellbook system
  - `src/utils/esotericPolymath.ts`
  - `src/components/desktop/EsotericPolymathModal.tsx`
  - Spellbook management, daily preparation, heightened spells

- `eclectic-skill` - Untrained skill bonus with special rules
  - `src/utils/eclecticSkill.ts`
  - Special skill mechanics, trained-only checks, legendary Occultism → expert

- `versatile-performance` - Performance-to-skill substitution
  - `src/utils/versatilePerformance.ts`
  - Performance-based skill substitution

- `versatile-signature` - Daily signature spell change
  - `src/utils/versatileSignature.ts`
  - Spontaneous signature spell management

- `assured-knowledge` - Guaranteed Recall Knowledge
  - `src/utils/assuredKnowledge.ts`
  - Automatic success mechanics

- `true-hypercognition` - Instant Recall Knowledge (5x/day)
  - `src/utils/trueHypercognition.ts`
  - Daily usage tracking, free action Recall Knowledge

- `deep-lore` - Extra spells for repertoire
  - `src/utils/deepLore.ts`
  - `src/components/desktop/DeepLoreModal.tsx`
  - One extra spell per rank

- `enigmas-knowledge` - Automatic Knowledge (1/round)
  - `src/utils/enigmasKnowledge.ts`
  - Per-round tracking

- `studious-capacity` - Cast without slots (1/day)
  - `src/utils/studiousCapacity.ts`
  - Daily usage tracking

- `bardic-lore` - Special Lore skill based on Intelligence
  - `src/utils/bardicLore.ts`
  - Lore skill creation and management

- `ultimate-polymath` - All spells become signature
  - `src/utils/ultimatePolymath.ts`
  - Signature spell management

- `multifarious-muse` - Multi-muse versatility
  - `src/utils/multifariousMuse.ts`

- `lingering-composition` - Extends composition duration
  - `src/utils/lingeringComposition.ts`
  - `src/utils/activeCompositions.ts`

**Simple Feats** (40+ with helper functions):
- `src/utils/bardSimpleFeats.ts` - 20+ helper functions
- All composition feats handled via JSON `FlatModifier` rules

**UI Components**:
- DeepLoreModal - Extra spell selection per rank
- EsotericPolymathModal - Polymath spellbook management
- Active composition tracking
- Bonus visualization in headers

**All Five Muses Supported** (100% complete with all feats):
- ✅ Polymath (Polimata) - Esoteric Polymath, Eclectic Skill, Versatile Performance/Signature
- ✅ Enigma (Enigma) - Bardic Lore, Enigma's Knowledge, Deep Lore, Studious Capacity
- ✅ Maestro (Maestro) - Lingering Composition, focus spells
- ✅ Warrior (Guerriero) - Martial Performance, Song of Strength, Courageous Advance/Assault, Triumphant Inspiration, Reflexive Courage, Defensive Coordination (7 feats)
- ✅ Zoophonia (Zoofonia) - Zoophonic Communication, Bestial Snarling, Zoophonic Composition, Ears of the Forest, Songbird's Call, Chorus Companion, Musical Summons, Pack Performance (8 feats)

**Muse System Files**:
- `src/data/classSpecializations.ts` - All 5 muses defined (muse_enigma, muse_maestro, muse_polymath, muse_warrior, muse_zoophonia)
- `src/data/classGrantedFeats.ts` - Muse-specific granted feats at level 1
- `src/data/classGrantedSpells.ts` - Muse-specific granted spells (Sure Strike, Soothe, Unseen Servant, Fear, Summon Animal)
- `src/utils/bardSimpleFeats.ts` - Helper functions for ALL muse feats (Warrior: 7 feats, Zoophonia: 8 feats)

---

### Kineticist - Fully Detailed Analysis

**Status**: ✅ FULLY IMPLEMENTED

**Implemented Systems**:
- ✅ Gate selection (elemental focus)
- ✅ Impulse selection at levels 1, 5, 9, 13, 17
- ✅ Junction system at levels 5, 9, 13, 17
- ✅ Elemental blast mechanics

**Files**:
- `src/components/desktop/KineticistImpulseBrowser.tsx`
- `src/components/desktop/KineticistJunctionBrowser.tsx`
- `src/components/desktop/ImpulsePanel.tsx`
- `src/data/classFeatures.ts` (Junction skills)

**Implementation Pattern**: Complete browser + panel + data integration

---

## Detailed Implementation Priority

### Tier 1: Core Mechanics (Must Implement)

| Class | Feat/Feature | Level | Complexity | Priority | Est. Hours |
|-------|-------------|-------|------------|----------|------------|
| **Alchemist** | Quick Alchemy | 1 | HIGH | CRITICAL | 30-40 |
| **Alchemist** | Bomb System | 1 | HIGH | CRITICAL | 30-40 |
| **Barbarian** | Rage | 1 | HIGH | CRITICAL | 25-35 |
| **Monk** | Ki Pool | 1 | HIGH | CRITICAL | 30-40 |
| **Ranger** | Hunt Prey | 1 | MEDIUM | CRITICAL | 20-30 |
| **Rogue** | Sneak Attack | 1 | MEDIUM | CRITICAL | 20-30 |
| **Sorcerer** | Bloodline | 1 | HIGH | CRITICAL | 30-40 |
| **Wizard** | Spellbook | 1 | MEDIUM | CRITICAL | 25-35 |

### Tier 2: Significant Features (Should Implement)

| Class | Feat/Feature | Level | Complexity | Priority | Est. Hours |
|-------|-------------|-------|------------|----------|------------|
| **Fighter** | Weapon Specialization | 6 | MEDIUM | HIGH | 20-30 |
| **Magus** | Spellstrike | 1 | HIGH | HIGH | 35-45 |
| **Cleric** | Domain Abilities | 1 | MEDIUM | HIGH | 25-35 |
| **Champion** | Aura Mechanics | 1 | MEDIUM | HIGH | 20-30 |
| **Druid** | Wild Shape | 1 | HIGH | HIGH | 40-50 |
| **Investigator** | Devise a Stratagem | 1 | MEDIUM | HIGH | 25-35 |

### Tier 3: Advanced Options (Nice to Have)

| Class | Feat/Feature | Level | Complexity | Priority | Est. Hours |
|-------|-------------|-------|------------|----------|------------|
| **Commander** | Tactics System | 1 | HIGH | MEDIUM | 40-50 |
| **Exemplar** | Ikon Selection | 1 | HIGH | MEDIUM | 35-45 |
| **Swashbuckler** | Panache System | 1 | MEDIUM | MEDIUM | 30-40 |
| **Psychic** | Mind Pool | 1 | MEDIUM | MEDIUM | 25-35 |

---

## Implementation Effort Summary

| Category | Classes/Archetypes | Feats | Est. Hours |
|----------|-------------------|-------|------------|
| **Tier 1 (Critical)** | 8 classes | ~100 feats | 200-250 hours |
| **Tier 2 (High Priority)** | 6 classes | ~80 feats | 150-200 hours |
| **Tier 3 (Medium Priority)** | 8+ classes | ~200+ feats | 300-400 hours |
| **Shared Systems** | N/A | N/A | 50-80 hours |
| **Archetype Feats** | 50+ archetypes | ~500 feats | 400-600 hours |
| **TOTAL** | 22+ classes | 1,100+ feats | **1,100-1,570 hours** |

---

## Shared Systems to Implement First

### 1. Generic Resource Pool System
**Needed by**: Monk (ki), Psychic (psi), Swashbuckler (panache), Magus (arcane pool), Barbarian (rage rounds)

**Requirements**:
- Resource tracking (current/max)
- Recharge mechanics
- Ability cost management
- UI for resource display
- Daily reset functionality

**Estimated Effort**: 25-35 hours

### 2. Stance/System Selector
**Needed by**: Monk (stances), Fighter (combat stances), Barbarian (totems)

**Requirements**:
- Multi-selection UI with constraints
- Daily reselection capability
- Browser components for selection
- Validation rules

**Estimated Effort**: 30-40 hours

### 3. Companion/Minion System
**Needed by**: Ranger, Druid, Summoner, Alchemist (familiar), Phantom

**Requirements**:
- Companion stat blocks
- Companion action tracking
- Companion progression
- UI for companion management

**Estimated Effort**: 40-50 hours

### 4. Spellbook/Formula Book System
**Needed by**: Wizard, Alchemist

**Requirements**:
- Separate from repertoire
- Book management UI
- Daily preparation changes
- Formula learning

**Estimated Effort**: 30-40 hours
**Pattern**: Extend Esoteric Polymath implementation

### 5. Polymorph/Wild Shape System
**Needed by**: Druid, various spell effects

**Requirements**:
- Polymorph framework
- Stat block replacement
- Duration management
- Ability replacement

**Estimated Effort**: 35-45 hours

---

## Change Log

| Date | Change |
|------|--------|
| 2026-01-28 | Initial document created with all class analysis |
| 2026-01-28 | Added heritage, archetype, general, and skill feat status |
| 2026-01-28 | Added detailed Bard implementation analysis |
| 2026-01-28 | Added shared systems priority breakdown |
| 2026-01-29 | **BARD COMPLETED** - All 75 feats fully implemented with all three muses (Polymath, Enigma, Maestro) |
| 2026-01-29 | **BARD MUSES COMPLETED** - Added Warrior (Guerriero) and Zoophonia (Zoofonia) muses for full 5-muse support |
| 2026-01-29 | **BARD MUSE FEATS COMPLETED** - All Warrior and Zoophonia muse feats now have helper functions in bardSimpleFeats.ts (15 total feats across both muses) |
