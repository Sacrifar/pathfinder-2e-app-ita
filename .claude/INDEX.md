# .claude/ Directory Index

Questa cartella contiene agent skills, script di automazione e documentazione per lo sviluppo del progetto Pathfinder 2E App.

## 📚 Documentazione

### [README.md](README.md) - Guida Completa Agent Skills
Documentazione principale degli agent skills con:
- Descrizione dettagliata di tutti i 12 skills
- Quando usare ciascuno skill
- Esempi di invocazione
- Best practices
- Guide per estendere gli skills

**Start here** se non conosci gli agent skills.

### [QUICKREF.md](QUICKREF.md) - Riferimento Rapido
Carta di riferimento veloce con:
- Tabella riassuntiva skills
- Task comuni e workflow
- Template richieste
- Shortcuts
- Troubleshooting rapido

**Use this** durante lo sviluppo quotidiano.

### [examples.md](examples.md) - Esempi Pratici
9 scenari reali di utilizzo degli skills:
1. Aggiungere nuova arma
2. Implementare nuova classe
3. Aggiungere UI browse
4. Fixare bug calcolo
5. Supportare feat complessi
6. Ottimizzare bundle
7. Workflow completo feature
8. Aggiungere condizione
9. Preparare release

**Reference this** quando inizi un nuovo task.

### [WORKSPACE.md](WORKSPACE.md) - Setup Workspace
Guida completa setup ambiente di sviluppo:
- Quick setup automatico
- Estensioni VSCode raccomandate
- Configurazioni workspace
- Task e debug configuration
- Snippet personalizzati
- Troubleshooting

**Follow this** al primo setup del progetto.

### [SUMMARY.md](SUMMARY.md) - Riepilogo Implementazione
Overview dell'implementazione degli agent skills:
- Cosa sono gli agent skills
- File creati
- Come funzionano
- Workflow tipici
- Metriche di successo

**Read this** per capire l'architettura del sistema.

## 🛠 File Operativi

### [agent-skills.json](agent-skills.json) - Definizioni Skills
File JSON con le definizioni di tutti i 12 agent skills.
Utilizzato dal Claude Agent SDK per eseguire i task automatizzati.

**Skills disponibili:**
- `add-pf2e-content` - Aggiungere contenuto di gioco
- `create-browser-component` - Creare componenti browser
- `add-translations` - Gestire traduzioni
- `create-math-tests` - Creare test utilities
- `validate-character-recalculation` - Validare calcoli
- `add-class-progression` - Aggiungere classi
- `create-modal-component` - Creare modali
- `optimize-bundle` - Ottimizzare build
- `add-feat-processing` - Feat processing
- `debug-character-issue` - Debug problemi
- `validate-json-data` - Validare dati
- `add-condition-support` - Aggiungere condizioni

### [validate.js](validate.js) - Script Validazione Dati
Script Node.js per validare i file JSON dei dati PF2E.

**Usage:**
```bash
npm run validate:data
# oppure
node .claude/validate.js
```

**Controlla:**
- Sintassi JSON corretta
- Campi required presenti
- ID duplicati
- Struttura per tipo di contenuto

## 🚀 Setup Scripts

### [setup-vscode.sh](setup-vscode.sh) - Setup VSCode (Linux/macOS)
Script Bash per configurare automaticamente VSCode workspace.

**Usage:**
```bash
chmod +x .claude/setup-vscode.sh
./.claude/setup-vscode.sh
```

**Crea:**
- `.vscode/settings.json`
- `.vscode/tasks.json`
- `.vscode/launch.json`
- `.vscode/extensions.json`
- `.vscode/pathfinder2e.code-snippets`

### [setup-vscode.ps1](setup-vscode.ps1) - Setup VSCode (Windows)
Script PowerShell per Windows con stesse funzionalità dello script Bash.

**Usage:**
```powershell
.\.claude\setup-vscode.ps1
```

## 🎯 Quick Start

### Primo Setup
```bash
# 1. Setup workspace VSCode
./.claude/setup-vscode.sh  # oppure setup-vscode.ps1 su Windows

# 2. Installa dipendenze
npm install

# 3. Valida dati
npm run validate:data

# 4. Avvia dev server
npm run dev
```

### Uso Quotidiano

**Consulta riferimento rapido:**
```bash
cat .claude/QUICKREF.md
```

**Valida modifiche ai dati:**
```bash
npm run validate:data
```

**Trova esempi per task specifici:**
```bash
grep -A 20 "Scenario [numero]" .claude/examples.md
```

## 📖 Come Navigare

```
Nuovo al progetto?
  → Leggi SUMMARY.md per overview
  → Segui WORKSPACE.md per setup
  → Esplora QUICKREF.md per skills

Sviluppo quotidiano?
  → Usa QUICKREF.md per task comuni
  → Consulta examples.md per scenari complessi
  → Esegui validate.js prima dei commit

Aggiungere nuovo skill?
  → Modifica agent-skills.json
  → Documenta in README.md
  → Aggiungi esempio in examples.md
  → Aggiorna QUICKREF.md
```

## 🔗 Collegamenti Utili

| Documento | Quando Usarlo |
|-----------|---------------|
| README.md | Primo approccio agli skills |
| QUICKREF.md | Durante sviluppo quotidiano |
| examples.md | Quando inizi task complesso |
| WORKSPACE.md | Setup iniziale ambiente |
| SUMMARY.md | Capire architettura sistema |

## 📝 Manutenzione

Questi file vanno aggiornati quando:
- Si aggiungono nuovi agent skills
- Cambiano i pattern di sviluppo
- Si modificano le configurazioni raccomandate
- Si scoprono nuovi workflow utili

## ❓ Supporto

Per problemi o domande:
1. Consulta QUICKREF.md sezione Troubleshooting
2. Controlla examples.md per scenari simili
3. Leggi WORKSPACE.md per problemi di configurazione
4. Apri issue su GitHub

---

**Versione:** 1.0
**Ultimo aggiornamento:** 2026-01-24
**Contenuto:** 7 file documentazione + 3 file operativi
**Maintainer:** Development Team
