# Code Modularity Guide

**Last Updated**: 2026-01-26

This guide explains the new modular systems for managing class-related data and translations.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Class Metadata System](#class-metadata-system)
3. [Data Validation](#data-validation)
4. [Translation Coverage](#translation-coverage)
5. [Adding New Content](#adding-new-content)
6. [Best Practices](#best-practices)

---

## Overview

The codebase has been refactored to eliminate hardcoded Foundry IDs and improve maintainability. The new system provides:

- **Automatic ID mapping** - Use class names instead of UUIDs
- **Validation layer** - Catch broken references early
- **Translation tracking** - Monitor translation coverage
- **Reusable patterns** - Standard feat progressions, helpers

---

## Class Metadata System

### Core Files

| File | Purpose |
|------|---------|
| `classMetadata.ts` | Auto-maps class names ↔ Foundry IDs |
| `classProgressionsBuilder.ts` | Builder pattern for progressions |
| `classGrantedFeats.ts` | Class-granted feats (uses names) |
| `classGrantedSpells.ts` | Class-granted spells (uses names) |
| `classSpecializationRules.ts` | Level-based specialization rules |

### Usage Examples

#### Get Class ID from Name

```typescript
import { getClassIdByName } from '@/data/classMetadata';

const bardId = getClassIdByName('Bard'); // → '3gweRQ5gn7szIWAv'
const invalidId = getClassIdByName('NonExistent'); // → undefined
```

#### Use Standard Feat Progression

```typescript
import { STANDARD_FEAT_PROGRESSION } from '@/data/classMetadata';

const progression = {
    armorProficiencies: { /* ... */ },
    featProgression: STANDARD_FEAT_PROGRESSION, // Most classes use this
};

// STANDARD_FEAT_PROGRESSION = {
//     classFeats: [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
//     generalFeats: [3, 7, 11, 15, 19],
//     skillFeats: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
//     skillIncreases: [3, 5, 7, 9, 11, 13, 15, 17, 19],
//     ancestryFeats: [1, 5, 9, 13, 17],
// }
```

#### Create Proficiency Arrays

```typescript
import { fillArray, setFromLevel } from '@/data/classMetadata';

// Trained at level 1, Expert at level 7
const lightArmor = setFromLevel(fillArray(20, 1), 6, 2);
// Result: [1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
//         Level 1-6: Trained (1), Level 7-20: Expert (2)
```

---

## Data Validation

### Automatic Validation (Development Mode)

Validation runs automatically when you start the dev server:

```bash
npm run dev
```

Check the browser console for validation results:

```
🔍 Running data validation checks...
✅ All data valid
```

Or if there are issues:

```
🔍 Data Validation Issues
❌ 2 Errors
  [feat] Bard (muse_enigma): Referenced feat does not exist: invalid-feat-id
  [progression] Alchemist: light armor array must have 20 elements (has 19)
```

### Manual Validation

```typescript
import { validateAllData, logValidationIssues } from '@/data/dataValidator';
import { classProgressions } from '@/data/classProgressions';
import { CLASS_GRANTED_FEATS } from '@/data/classGrantedFeats';
import { CLASS_GRANTED_SPELLS } from '@/data/classGrantedSpells';

const result = validateAllData({
    progressions: classProgressions,
    grantedFeats: CLASS_GRANTED_FEATS,
    grantedSpells: CLASS_GRANTED_SPELLS,
});

logValidationIssues(result);
// Logs errors and warnings to console
```

### Validation Checks

The validator checks:

- ✅ Class IDs exist in loaded data
- ✅ Feat IDs referenced in granted feats exist
- ✅ Spell IDs referenced in granted spells exist
- ✅ Proficiency arrays have 20 elements (levels 1-20)
- ✅ Proficiency values are 0-4 (untrained to legendary)
- ✅ Grant levels are 1-20
- ✅ HP per level is valid (4, 6, 8, 10, 12)

---

## Translation Coverage

### Dev Console Commands

Open the browser console in dev mode and use:

```javascript
// Show full coverage report
checkTranslationCoverage()

// Example output:
// 📊 Translation Coverage Report
// ==========================================
//
// Ancestries      (42 items)
//   ✅ Names:        ████████████████████ 100.0%
//   ✅ Descriptions: ███████████████░░░░░ 75.2%
//
// Spells          (1247 items)
//   ❌ Names:        ░░░░░░░░░░░░░░░░░░░░ 0.2%
//   ❌ Descriptions: ░░░░░░░░░░░░░░░░░░░░ 0.0%
```

```javascript
// Get missing translations for a specific category
getMissingTranslations('Spells')

// Returns:
// {
//   missingNames: ['Fireball', 'Magic Missile', ...],
//   missingDescriptions: ['Fireball', 'Magic Missile', ...]
// }
```

```javascript
// Export all missing translations as JSON
const missing = exportMissingTranslations()
console.log(JSON.stringify(missing, null, 2))

// Can be saved and sent to translators
```

---

## Adding New Content

### Adding a New Class

**Step 1:** Add JSON file

```bash
# Add class JSON file
src/data/pf2e/classes/warrior.json
```

**Step 2:** Add progression (if custom)

```typescript
// src/data/classProgressions.ts
'Warrior': {
    armorProficiencies: {
        light: fillArray(20, 1),
        medium: fillArray(20, 1),
        heavy: setFromLevel(fillArray(20, 1), 6, 2), // Expert at 7
        unarmored: fillArray(20, 1),
    },
    weaponProficiencies: {
        simple: fillArray(20, 1),
        martial: setFromLevel(fillArray(20, 1), 4, 2), // Expert at 5
        unarmed: fillArray(20, 1),
    },
    featProgression: STANDARD_FEAT_PROGRESSION, // Use standard pattern
    hitPointsPerLevel: 10,
}
```

**Step 3:** Add granted feats (if any)

```typescript
// src/data/classGrantedFeats.ts
{
    className: 'Warrior', // ✅ Use name, not ID!
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

**Step 4:** Add translations

```typescript
// src/data/translations.ts
export const classTranslations = {
    // ...
    'Warrior': {
        nameIt: 'Guerriero',
        descriptionIt: 'Un combattente esperto...'
    }
};
```

**Step 5:** Validate

```bash
npm run dev
# Check console for validation results
```

### Adding Class Specialization Rules

For classes with level-specific specializations (like Kineticist gates):

```typescript
// src/data/classSpecializationRules.ts
{
    className: 'Wizard',
    rules: [
        {
            specializationTypeId: 'advanced_school',
            minLevel: 10, // Available from level 10
        },
        {
            specializationTypeId: 'basic_school',
            maxLevel: 9, // Only available up to level 9
        }
    ]
}
```

Then components can use:

```typescript
import { filterSpecializationsByLevel } from '@/data/classSpecializationRules';

const filtered = filterSpecializationsByLevel(allTypes, classId, level);
// Automatically filters based on rules
```

---

## Best Practices

### ✅ DO

- Use `getClassIdByName('ClassName')` instead of hardcoding IDs
- Use `STANDARD_FEAT_PROGRESSION` for classes with standard feat progressions
- Use `fillArray` and `setFromLevel` helpers for proficiency arrays
- Define class-specific logic in data files, not components
- Run `checkTranslationCoverage()` before adding new content
- Check console for validation warnings in dev mode

### ❌ DON'T

- Don't hardcode Foundry IDs (`'XwfcJuskrhI9GIjX'`)
- Don't duplicate feat progression arrays across classes
- Don't put class-specific logic in components
- Don't create arrays manually (`[1,1,1,1,...]`) - use helpers
- Don't skip validation when adding new content

### Code Review Checklist

When adding new class-related data:

- [ ] Used class names instead of IDs?
- [ ] Used `STANDARD_FEAT_PROGRESSION` if applicable?
- [ ] Used `fillArray` and `setFromLevel` for proficiencies?
- [ ] Added Italian translations?
- [ ] Checked validation output?
- [ ] No hardcoded magic numbers?

---

## Migration Guide

### Old Pattern → New Pattern

#### Class IDs

```typescript
// ❌ Old: Hardcoded ID
'XwfcJuskrhI9GIjX': { /* Alchemist */ }

// ✅ New: Class name
'Alchemist': { /* ... */ }
```

#### Feat Progressions

```typescript
// ❌ Old: Duplicated arrays
featProgression: {
    classFeats: [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
    generalFeats: [3, 7, 11, 15, 19],
    skillFeats: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
    skillIncreases: [3, 5, 7, 9, 11, 13, 15, 17, 19],
    ancestryFeats: [1, 5, 9, 13, 17],
}

// ✅ New: Reusable pattern
featProgression: STANDARD_FEAT_PROGRESSION
```

#### Proficiency Arrays

```typescript
// ❌ Old: Manual array
light: [1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2]

// ✅ New: Helper functions
light: setFromLevel(fillArray(20, 1), 6, 2)
// Trained (1) at level 1, Expert (2) from level 7
```

#### Class-Specific Logic

```typescript
// ❌ Old: Logic in component
if (classId === 'RggQN3bX5SEcsffR') {
    const GATES_THRESHOLD_LEVELS = [5, 9, 13, 17];
    // ... complex filtering logic
}

// ✅ New: Logic in data layer
const filtered = filterSpecializationsByLevel(allTypes, classId, level);
```

---

## Troubleshooting

### Validation Errors

**Error:** `Class "ClassName" not found`

**Solution:** Make sure the class JSON file exists and the class name matches exactly (case-sensitive).

---

**Error:** `Referenced feat does not exist: feat-id`

**Solution:** Check that the feat ID is correct and the feat exists in the loaded data. Use the dev console to verify:

```javascript
import { getFeats } from '@/data/pf2e-loader';
const feats = getFeats();
console.log(feats.find(f => f.id === 'feat-id'));
```

---

**Error:** `Array must have 20 elements (has X)`

**Solution:** Proficiency arrays must have exactly 20 elements (levels 1-20). Use helpers:

```typescript
// ✅ Correct
fillArray(20, 1) // Creates array of 20 elements

// ❌ Wrong
[1,1,1] // Only 3 elements
```

---

### Translation Coverage Issues

**Problem:** `checkTranslationCoverage` not defined

**Solution:** Make sure you're running in dev mode (`npm run dev`) and check the browser console, not terminal.

---

**Problem:** Coverage shows 0% but translations exist

**Solution:** Check that translation keys match exactly (case-sensitive) and are in the correct format:

```typescript
// ✅ Correct
'Fireball': {
    nameIt: 'Palla di Fuoco',
    descriptionIt: '...'
}

// ❌ Wrong (lowercase)
'fireball': { ... }
```

---

## Additional Resources

- **Main Documentation**: See `CLAUDE.md` for overall architecture
- **Data Validation**: See `src/data/dataValidator.ts` for validation logic
- **Translation System**: See `src/data/translations.ts` for translation patterns
- **Class Progressions**: See `src/data/classProgressions.ts` for examples

---

**Questions?** Check the console for validation warnings or use the dev console commands for debugging.
