# Esempi Pratici di Utilizzo degli Agent Skills

Questa guida mostra esempi concreti di come usare gli agent skills in scenari reali di sviluppo.

## Scenario 1: Aggiungere una Nuova Arma

**Obiettivo**: Aggiungere la Katana al gioco con statistiche complete e traduzioni.

### Passo 1: Usare `add-pf2e-content`

```
Usa lo skill add-pf2e-content per aggiungere:

Nome: Katana
Tipo: Martial Weapon
Categoria: Advanced
Danni: 1d6 slashing
Bulk: 1
Prezzo: 2 gp
Mani: 1
Gruppo: Sword
Traits: deadly d8, two-hand d10, versatile P

Descrizione inglese:
"The katana is a curved, single-edged sword traditionally used by samurai."

Descrizione italiana:
"La katana è una spada curva a lama singola tradizionalmente usata dai samurai."
```

**Claude eseguirà:**
1. Crea file `src/data/pf2e/equipment/katana.json`
2. Compila tutti i campi richiesti nel formato FoundryVTT
3. Aggiunge traduzioni in `src/data/translations.ts`
4. Verifica che il glob pattern in `pf2e-loader.ts` carichi il file
5. Testa che l'arma appaia nel WeaponBrowser

### Passo 2: Validare i Dati

```
Usa lo skill validate-json-data per validare tutti i file in src/data/pf2e/equipment/
```

## Scenario 2: Implementare una Nuova Classe

**Obiettivo**: Aggiungere la classe Inventor con progressione completa.

### Passo 1: Usare `add-class-progression`

```
Usa lo skill add-class-progression per aggiungere Inventor:

HP: 8 per livello
Perception: Trained
Fortitude: Expert
Reflex: Expert
Will: Trained

Proficienze iniziali:
- Armi semplici: Trained
- Armi da guerra: Trained (nessuna)
- Armature leggere: Trained
- Armature medie: Trained

Abilità: 3 + Int modifier

Ability Boosts: livelli 1, 5, 10, 15, 20

Feature per livello:
1: Ancestry and Background, Initial Proficiencies, Overdrive, Innovation, Explode, Peerless Inventor
2: Inventor Feat, Skill Feat
3: General Feat, Skill Increase, Reconfigured Research
4: Inventor Feat, Skill Feat
5: Ability Boosts, Ancestry Feat, Inventor Weapon Expertise, Skill Increase
[continua fino a livello 20]

Specializzazioni (Innovation):
- Armor Innovation
- Construct Innovation
- Weapon Innovation
```

### Passo 2: Aggiungere Traduzioni

```
Usa lo skill add-translations per Inventor:

Inventor -> Inventore
Overdrive -> Sovraccarico
Innovation -> Innovazione
Explode -> Esplosione
Peerless Inventor -> Inventore Impareggiabile
Armor Innovation -> Innovazione Armatura
Construct Innovation -> Innovazione Costrutto
Weapon Innovation -> Innovazione Arma
```

### Passo 3: Creare Test

```
Usa lo skill validate-character-recalculation per testare:

Crea personaggio Inventore livello 1-20 con:
- Ancestry: Human
- Background: Scholar
- Innovation: Weapon Innovation
- Verifica progressione HP
- Verifica proficienze
- Verifica feature grants
```

## Scenario 3: Aggiungere UI per Browse Divinità

**Obiettivo**: Creare un browser per esplorare le divinità del gioco.

### Passo 1: Preparare i Dati

```
Usa lo skill add-pf2e-content per aggiungere file JSON delle divinità in src/data/pf2e/deities/
```

### Passo 2: Creare il Browser

```
Usa lo skill create-browser-component per creare DeityBrowser:

Campi da mostrare:
- Nome (con traduzione italiana)
- Allineamento
- Domini
- Arma divina favorita
- Aree di interesse
- Follower alignment restrictions
- Divine Font

Layout:
- Sidebar sinistra: lista divinità con ricerca
- Pannello destro: dettagli divinità selezionata
- Filtri: per allineamento, domini

Integrazione:
- Usare in BrowsePage con rotta /browse/deities
- Lazy loading in ResponsiveLayout
```

## Scenario 4: Fixare Bug di Calcolo HP

**Obiettivo**: HP del Barbaro non calcolati correttamente con Constitution 18.

### Usare `debug-character-issue`

```
Usa lo skill debug-character-issue:

Problema:
- Classe: Barbarian
- Livello: 5
- Constitution: 18 (modifier +4)
- HP atteso: 12 (base) + 7 (favored class) + 4*5 (con mod) = 39
- HP calcolato: 35 (mancano 4 HP)

Steps per debug:
1. Verifica calcolo base HP in characterRecalculator.ts
2. Controlla se Con modifier applicato correttamente
3. Verifica Barbarian HP bonus per livello
4. Traccia recalculateHP() per carattere test
5. Identifica dove mancano i 4 HP
6. Fix il calcolo
7. Crea test di regressione
```

## Scenario 5: Aggiungere Supporto per Feat Complessi

**Obiettivo**: Supportare feat che garantiscono formule agli Inventor.

### Usare `add-feat-processing`

```
Usa lo skill add-feat-processing per aggiungere supporto feat choice tipo "Grant Formula":

Esempio feat: "Basic Alchemy"
- Scelta: type: "grant-formula", filter: "alchemical-item level:1"
- Effetto: aggiunge formule al character.formulas array
- UI: modale selezione formula con filtri

Passi:
1. Estendi FeatChoice type per includere "grant-formula"
2. Aggiungi parsing in extractFeatChoices()
3. Aggiungi apply logic in applyFeatChoices()
4. Crea FormulaSelectionModal component
5. Aggiorna character.formulas in recalculation
6. Testa con feat "Basic Alchemy"
```

## Scenario 6: Ottimizzare Bundle Troppo Grande

**Obiettivo**: Il bundle è 1.5MB, troppo grande per performance ottimali.

### Usare `optimize-bundle`

```
Usa lo skill optimize-bundle:

Analizza il bundle corrente e identifica:
1. Quali chunks superano 500kb
2. Dipendenze duplicate
3. Opportunità per lazy loading aggiuntivo
4. Librerie che potrebbero essere sostituite con alternative più leggere

Ottimizzazioni suggerite:
- Split pf2e-loader in chunks per categoria (weapons, spells, etc.)
- Lazy load translation maps per lingua
- Verifica che tutti desktop panels siano lazy loaded
- Considera dynamic import per utils pesanti (featChoices.ts)

Misura impatto e reporta dimensioni prima/dopo.
```

## Scenario 7: Workflow Completo - Nuova Feature

**Obiettivo**: Implementare supporto completo per Animal Companions.

### Workflow Multi-Skill

#### Fase 1: Dati
```
1. Usa add-pf2e-content per aggiungere JSON companion types
2. Usa add-translations per traduzioni companion
3. Usa validate-json-data per verificare struttura
```

#### Fase 2: Logica
```
4. Usa add-feat-processing per feat "Animal Companion"
5. Aggiungi manualmente petStats.ts logic per companion progression
6. Usa create-math-tests per testare companion stats
```

#### Fase 3: UI
```
7. Usa create-modal-component per CompanionSelectionModal
8. Usa create-browser-component per CompanionBrowser
9. Aggiungi CompanionPanel al character sheet
```

#### Fase 4: Testing
```
10. Usa validate-character-recalculation per testare Ranger con companion
11. Usa debug-character-issue per fix eventuali bug
12. Test manuale completo
```

#### Fase 5: Ottimizzazione
```
13. Usa optimize-bundle se necessario
14. Review performance
15. Commit e PR
```

## Scenario 8: Aggiungere Condizione con Penalità

**Obiettivo**: Implementare condizione "Dazzled" con penalità appropriate.

### Usare `add-condition-support`

```
Usa lo skill add-condition-support per aggiungere "Dazzled":

Effetti PF2E:
- Penalità -1 a Perception checks
- Penalità -1 ad attacchi basati su vista
- Tutti i nemici sono concealed (20% miss chance)

Implementazione:
1. Crea JSON in src/data/pf2e/conditionitems/dazzled.json
2. Aggiungi calcolo penalità in conditionModifiers.ts:
   - getConditionPerceptionPenalty() return -1 if dazzled
   - Nota sul miss chance (non calcolato automaticamente)
3. Traduzioni:
   - Dazzled -> Abbagliato
   - Descrizione completa in italiano
4. Test nel character sheet che penalità appaiano
```

## Scenario 9: Preparare Release

**Obiettivo**: Preparare app per rilascio produzione.

### Checklist con Skills

```
1. validate-json-data: Valida tutti i file JSON per errori
2. create-math-tests: Assicura coverage test >80% per utils
3. validate-character-recalculation: Test tutte le classi 1-20
4. optimize-bundle: Ottimizza bundle <1MB se possibile
5. add-translations: Verifica tutte le traduzioni complete
6. debug-character-issue: Fix tutti i bug noti

Poi:
- npm run lint (no errors)
- npm run build (successful)
- npm test (all pass)
- npm run preview (test manuale)
```

## Best Practices

### 1. Chain Skills per Task Complessi
Usa multiple skills in sequenza per task articolati:
```
add-pf2e-content → add-translations → validate-json-data → create-math-tests
```

### 2. Valida Sempre
Dopo ogni modifica ai dati:
```
validate-json-data + validate-character-recalculation
```

### 3. Test-Driven con Skills
```
1. create-math-tests (scrivi test che falliscono)
2. Implementa feature
3. validate-character-recalculation
4. debug-character-issue (se necessario)
```

### 4. Documentazione
Dopo uso di skills, documenta:
- Quali skills usati
- Parametri forniti
- Risultati ottenuti
- Issues incontrati

### 5. Iterazione
Gli skills supportano iterazione:
```
add-pf2e-content (v1) →
validate-json-data (trova errori) →
add-pf2e-content (fix errori) →
validate-json-data (ok) →
add-translations
```

## Tips & Tricks

### Usa Skills in Git Commits

```bash
# Dopo uso di add-pf2e-content
git commit -m "feat(data): add Katana weapon [via add-pf2e-content skill]"

# Dopo optimize-bundle
git commit -m "perf(build): optimize bundle size -200kb [via optimize-bundle skill]"
```

### Combina con Git Hooks

Crea pre-commit hook che usa `validate-json-data`:
```bash
#!/bin/bash
echo "Validating PF2E data..."
claude-code "usa validate-json-data per validare tutti i file JSON modificati"
```

### Crea Task List

Per task complessi, crea checklist e usa skills per ogni step:
```markdown
- [ ] add-pf2e-content: Aggiungi classe Thaumaturge
- [ ] add-class-progression: Progressione 1-20
- [ ] add-translations: Traduzioni feature
- [ ] create-modal-component: Implement selection UI
- [ ] validate-character-recalculation: Test progressione
- [ ] create-math-tests: Test calcoli Thaumaturge
```

### Debug con Context

Quando usi `debug-character-issue`, fornisci massimo contesto:
```
Usa debug-character-issue:

Character state completo:
{
  "id": "char-123",
  "name": "Test Barbarian",
  "level": 5,
  "classId": "barbarian",
  "abilityScores": { "con": 18, ... },
  ...
}

Problema: HP = 35, atteso 39
Step di recalcolo da tracciare: recalculateHP()
```

## Conclusione

Gli agent skills sono strumenti potenti per automatizzare task ripetitivi e assicurare consistenza. Usali regolarmente nel tuo workflow di sviluppo per:

- ✅ Ridurre errori manuali
- ✅ Aumentare velocità sviluppo
- ✅ Mantenere qualità codice
- ✅ Documentare pattern
- ✅ Facilitare onboarding nuovi contributor
