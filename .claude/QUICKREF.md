# Agent Skills Quick Reference

Riferimento rapido per gli agent skills del progetto Pathfinder 2E App.

## 📋 Lista Skills

| Skill ID | Quando Usarlo | Tempo Tipico |
|----------|---------------|--------------|
| `add-pf2e-content` | Aggiungere armi, spell, feat, ecc. | 2-5 min |
| `create-browser-component` | Creare UI per browse contenuto | 10-15 min |
| `add-translations` | Aggiungere traduzioni IT | 1-3 min |
| `create-math-tests` | Testare utilities matematiche | 5-10 min |
| `validate-character-recalculation` | Testare calcoli personaggio | 10-20 min |
| `add-class-progression` | Aggiungere classe completa | 20-30 min |
| `create-modal-component` | Creare nuova modale | 5-10 min |
| `optimize-bundle` | Ottimizzare dimensione build | 10-15 min |
| `add-feat-processing` | Supportare nuovi feat types | 15-25 min |
| `debug-character-issue` | Fix bug calcoli | 5-20 min |
| `validate-json-data` | Validare dati JSON | 2-5 min |
| `add-condition-support` | Aggiungere condizione | 5-10 min |

## 🎯 Task Comuni

### Aggiungere Contenuto
```bash
# Arma/Armatura/Equipaggiamento
add-pf2e-content + add-translations + validate-json-data

# Spell
add-pf2e-content + add-translations + validate-json-data

# Feat
add-pf2e-content + add-translations + add-feat-processing (se necessario)

# Condizione
add-condition-support + add-translations
```

### Nuova Classe
```bash
add-class-progression + add-translations + validate-character-recalculation + create-math-tests
```

### Nuova UI
```bash
create-browser-component + create-modal-component (se necessario)
```

### Bug Fix
```bash
debug-character-issue + create-math-tests (regression test)
```

### Pre-Release
```bash
validate-json-data + validate-character-recalculation + optimize-bundle + create-math-tests
```

## 💡 Tips Veloci

### Validazione Automatica
Aggiungi a `.git/hooks/pre-commit`:
```bash
#!/bin/bash
npm run validate:data || exit 1
```

### Combo Skills Frequenti

**Nuovo contenuto completo:**
```
add-pf2e-content → add-translations → validate-json-data
```

**Nuova feature UI:**
```
create-modal-component → create-browser-component → add-translations
```

**Quality assurance:**
```
validate-json-data → create-math-tests → validate-character-recalculation
```

**Performance check:**
```
optimize-bundle → validate-character-recalculation
```

## 🚀 Comandi Rapidi

```bash
# Validare tutti i dati
npm run validate:data

# Test completi
npm test

# Build ottimizzato
npm run build

# Preview produzione
npm run preview
```

## 📝 Template Richieste

### add-pf2e-content
```
Usa add-pf2e-content per aggiungere:
Nome: [nome]
Tipo: [weapon/armor/spell/feat/etc]
[Specifiche tecniche...]
Descrizione EN: [...]
Descrizione IT: [...]
```

### create-browser-component
```
Usa create-browser-component per [ContentType]Browser:
Campi: [lista campi]
Filtri: [lista filtri]
Layout: [descrizione]
```

### add-translations
```
Usa add-translations:
[English] -> [Italiano]
[English 2] -> [Italiano 2]
```

### debug-character-issue
```
Usa debug-character-issue:
Problema: [descrizione]
Atteso: [valore]
Ottenuto: [valore]
Character: [info base]
```

## ⚡ Shortcuts

### Workflow Completo Nuova Feature
1. `add-pf2e-content` → dati base
2. `add-translations` → traduzioni
3. `create-modal-component` o `create-browser-component` → UI
4. `add-feat-processing` → logica (se feat)
5. `create-math-tests` → test
6. `validate-character-recalculation` → validazione
7. `validate-json-data` → check finale

### Debug Rapido
1. `debug-character-issue` → identifica problema
2. Fix manuale
3. `create-math-tests` → regression test
4. `validate-character-recalculation` → verifica fix

### Pre-Commit Checklist
- [ ] `validate-json-data`
- [ ] `npm run lint`
- [ ] `npm test`
- [ ] `npm run build`

## 🎨 Colori Console

Gli script di validazione usano colori:
- 🔵 Blu: Info
- 🟢 Verde: Success
- 🟡 Giallo: Warning
- 🔴 Rosso: Error
- 🔷 Cyan: Headers

## 📊 Metriche Target

| Metrica | Target | Check con |
|---------|--------|-----------|
| Bundle size | < 1MB | `optimize-bundle` |
| Test coverage | > 80% | `create-math-tests` |
| JSON validità | 100% | `validate-json-data` |
| Traduzioni | 100% | `add-translations` |
| Build time | < 30s | `npm run build` |

## 🔧 Troubleshooting

### Skill non esegue
✅ Verifica `.claude/agent-skills.json` valido
✅ Fornisci dettagli completi nel prompt
✅ Check che file necessari esistano

### Validazione fallisce
✅ `validate-json-data` per dettagli
✅ Check formato JSON con JSONLint
✅ Verifica campi required presenti

### Build troppo grande
✅ `optimize-bundle` analizza chunks
✅ Check lazy loading components
✅ Verifica dipendenze duplicate

### Test falliscono
✅ `validate-character-recalculation` per calcoli
✅ `create-math-tests` per math utils
✅ Check test logs per dettagli

## 📚 Documenti Correlati

- `README.md` - Guida completa skills
- `examples.md` - Esempi pratici
- `agent-skills.json` - Definizioni skills
- `validate.js` - Script validazione

## 🆘 Aiuto

Per info su skill specifico:
```bash
# Leggi la sezione dello skill in README.md
cat .claude/README.md | grep -A 20 "### add-pf2e-content"
```

Per esempi di uso:
```bash
# Cerca negli esempi
cat .claude/examples.md | grep -A 30 "Scenario [numero]"
```

---

**Versione:** 1.0
**Ultimo aggiornamento:** 2026-01-24
**Maintainer:** Development Team
