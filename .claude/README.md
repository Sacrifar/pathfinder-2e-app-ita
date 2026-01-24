# Claude Agent Skills per Pathfinder 2E App

Questo progetto include agent skills personalizzati per automatizzare task di sviluppo comuni nell'app Pathfinder 2E.

## Setup

Gli agent skills sono definiti in `.claude/agent-skills.json` e vengono automaticamente rilevati dal Claude Agent SDK.

## Skills Disponibili

### 1. **add-pf2e-content**
Aggiunge nuovo contenuto di gioco (armi, incantesimi, talenti, ecc.) seguendo il formato FoundryVTT JSON.

**Quando usarlo:**
- Aggiungere nuove armi, armature o equipaggiamento
- Aggiungere nuovi incantesimi
- Aggiungere nuovi talenti o capacità
- Aggiungere nuove ancestry, heritage o background

**Esempio:**
```
Aggiungi l'arma "Spada Bastarda" con le seguenti stats:
- Danni: 1d8 slashing
- Traits: two-hand d12, versatile P
- Gruppo: Sword
```

### 2. **create-browser-component**
Crea un nuovo componente browser seguendo il pattern stabilito (sidebar + pannello dettagli).

**Quando usarlo:**
- Creare browser per nuove categorie di contenuto
- Aggiungere nuove UI per esplorare dati di gioco

**Esempio:**
```
Crea un browser per le divinità (Deities) che mostri nome, allineamento, domini e arma preferita.
```

### 3. **add-translations**
Aggiunge o aggiorna traduzioni italiane per contenuto di gioco o UI.

**Quando usarlo:**
- Tradurre nuovo contenuto di gioco
- Aggiungere traduzioni UI mancanti
- Aggiornare traduzioni esistenti

**Esempio:**
```
Aggiungi traduzioni italiane per:
- "Fighter" -> "Guerriero"
- "Barbarian" -> "Barbaro"
- "Choose a weapon" -> "Scegli un'arma"
```

### 4. **create-math-tests**
Crea test unitari completi per utilities matematiche di PF2E.

**Quando usarlo:**
- Aggiungere test coverage per utilities matematiche
- Validare calcoli di proficiency, bonus, penalità
- Test di regressione per bug fix

**Esempio:**
```
Crea test completi per pf2e-math.ts includendo:
- Tutti i rank di proficiency (0-4)
- Tutti i livelli (1-20)
- Scenari ABP on/off
```

### 5. **validate-character-recalculation**
Testa e valida la logica di ricalcolo del personaggio per edge cases.

**Quando usarlo:**
- Dopo modifiche al sistema di ricalcolo
- Per validare nuove classi o archetipi
- Debug di problemi di calcolo

**Esempio:**
```
Valida il ricalcolo per un Fighter livello 1-20 con archetipo Wizard Dedication.
```

### 6. **add-class-progression**
Aggiunge o aggiorna la progressione di livello e le feature delle classi.

**Quando usarlo:**
- Aggiungere nuove classi
- Aggiornare class features esistenti
- Aggiungere specializzazioni (subclassi)

**Esempio:**
```
Aggiungi la classe Inventor con:
- Progressione 1-20
- Feature: Overdrive, Explode, ecc.
- Specializzazioni: Armor, Weapon, Construct
```

### 7. **create-modal-component**
Crea un nuovo componente modale seguendo i pattern stabiliti.

**Quando usarlo:**
- Aggiungere nuove UI modali
- Creare dialog per scelte del personaggio
- Aggiungere form di configurazione

**Esempio:**
```
Crea una modale per selezionare ikon di Exemplar (body/worn/weapon types).
```

### 8. **optimize-bundle**
Analizza e ottimizza la dimensione del bundle Vite e chunk splitting.

**Quando usarlo:**
- Bundle troppo grande (>1MB)
- Performance lenta in produzione
- Dopo aggiunta di dipendenze pesanti

**Esempio:**
```
Analizza il bundle corrente e ottimizza chunk splitting per ridurre dimensione.
```

### 9. **add-feat-processing**
Aggiunge supporto per nuovi tipi di feat choice nel sistema di processing.

**Quando usarlo:**
- Supportare nuovi tipi di scelte nei talenti
- Aggiungere logica per talenti complessi
- Estendere il sistema di dedication/archetype

**Esempio:**
```
Aggiungi supporto per feat choice "Grant Formula" che aggiunge formule all'inventor.
```

### 10. **debug-character-issue**
Debug e fix di problemi di calcolo o visualizzazione del personaggio.

**Quando usarlo:**
- Bug nei calcoli del personaggio
- Valori visualizzati incorretti
- Feature non applicate correttamente

**Esempio:**
```
Debug: HP non calcolati correttamente per Barbarian con Constitution 18.
```

### 11. **validate-json-data**
Valida i file JSON dei dati di FoundryVTT per correttezza e completezza.

**Quando usarlo:**
- Dopo aggiunta di nuovi file JSON
- Prima di commit di dati di gioco
- Per trovare duplicati o errori strutturali

**Esempio:**
```
Valida tutti i file JSON in src/data/pf2e/equipment/ per struttura corretta.
```

### 12. **add-condition-support**
Aggiunge una nuova condizione con calcoli di modifier appropriati.

**Quando usarlo:**
- Aggiungere nuove condizioni di gioco
- Implementare penalità/bonus da condizioni
- Estendere il sistema di modifiers

**Esempio:**
```
Aggiungi la condizione "Dazzled" con penalità -1 a Perception e attacchi basati su vista.
```

## Come Usare gli Skills

### Nel Codice

Gli agent skills possono essere invocati dal Claude Agent SDK:

```typescript
import { Agent } from '@anthropic-ai/agent-sdk';

const agent = new Agent({
  skillsPath: '.claude/agent-skills.json'
});

await agent.run('add-pf2e-content', {
  prompt: 'Aggiungi la spada Katana...'
});
```

### Con Claude Code CLI

Gli skills sono automaticamente disponibili quando si lavora con Claude Code:

```bash
claude-code "Usa lo skill add-pf2e-content per aggiungere la Katana"
```

### Direttamente con Claude

Quando chatti con Claude nel contesto di questo progetto, puoi fare riferimento agli skills:

```
"Voglio aggiungere una nuova arma. Usa l'agent skill appropriato."
```

Claude riconoscerà l'agent skill `add-pf2e-content` e seguirà le istruzioni definite.

## Struttura degli Skills

Ogni skill include:

- **id**: Identificatore unico
- **name**: Nome descrittivo
- **description**: Breve descrizione dello scopo
- **prompt**: Istruzioni dettagliate per Claude su come eseguire il task
- **instructions**: Checklist di passi da seguire

## Best Practices

1. **Specificità**: Quando invochi uno skill, fornisci dettagli specifici
2. **Validazione**: Usa `validate-json-data` prima di commit
3. **Testing**: Usa `create-math-tests` per coverage
4. **Traduzioni**: Aggiungi sempre traduzioni italiane con `add-translations`
5. **Debug**: Usa `debug-character-issue` per problemi specifici invece di fix manuali

## Estendere gli Skills

Per aggiungere nuovi skills, modifica `.claude/agent-skills.json`:

```json
{
  "id": "nuovo-skill",
  "name": "Nome Skill",
  "description": "Breve descrizione",
  "prompt": "Istruzioni dettagliate...",
  "instructions": [
    "Passo 1",
    "Passo 2"
  ]
}
```

## Skills per Task Comuni

| Task | Skill da Usare |
|------|----------------|
| Aggiungere arma | `add-pf2e-content` |
| Aggiungere classe | `add-class-progression` |
| Creare UI browse | `create-browser-component` |
| Tradurre contenuto | `add-translations` |
| Fixare bug calcolo | `debug-character-issue` |
| Ottimizzare build | `optimize-bundle` |
| Aggiungere test | `create-math-tests` |
| Validare dati | `validate-json-data` |

## Troubleshooting

### Skill non trovato
Verifica che `.claude/agent-skills.json` esista e sia valido JSON.

### Skill non esegue correttamente
Controlla che il prompt includa tutti i dettagli necessari.

### Conflitti con modifiche manuali
Gli skills lavorano meglio su base code pulita. Committa modifiche prima di usare skills.

## Contribuire

Per migliorare gli skills:
1. Identifica pattern ripetitivi nel workflow
2. Aggiungi nuovo skill in `agent-skills.json`
3. Testa lo skill con casi reali
4. Documenta in questo README
5. Commit con messaggio descrittivo
