# Workspace Setup Guide

Guida completa per configurare l'ambiente di sviluppo per il progetto Pathfinder 2E App.

## Quick Setup (Raccomandato)

**Setup automatico in 1 comando:**

```bash
# Linux/macOS
./.claude/setup-vscode.sh

# Windows PowerShell
.\.claude\setup-vscode.ps1
```

Questi script creano automaticamente la configurazione `.vscode/` ottimale per il progetto.

**Oppure:** Segui la guida completa sotto per configurazione manuale e dettagli.

---

## Editor Consigliato

**Visual Studio Code** (VSCode) è l'editor consigliato per questo progetto.

## Estensioni VSCode Consigliate

### Essenziali

1. **ESLint** (`dbaeumer.vscode-eslint`)
   - Linting JavaScript/TypeScript in tempo reale
   - Auto-fix on save configurabile

2. **TypeScript Vue Plugin (Volar)** (`Vue.volar`)
   - Supporto TypeScript migliorato
   - Type checking in tempo reale

3. **Prettier - Code formatter** (`esbenp.prettier-vscode`)
   - Formattazione codice consistente
   - Auto-format on save

4. **Path Intellisense** (`christian-kohler.path-intellisense`)
   - Autocompletamento percorsi file
   - Supporto path alias `@/*`

### Utilità React

5. **ES7+ React/Redux/React-Native snippets** (`dsznajder.es7-react-js-snippets`)
   - Snippet per componenti React
   - Shortcuts: `rafce`, `rfc`, `useS`, `useE`, ecc.

6. **Auto Rename Tag** (`formulahendry.auto-rename-tag`)
   - Rinomina automatica tag JSX/HTML

7. **Bracket Pair Colorizer** (built-in VSCode)
   - Colori bracket per leggibilità

### Testing & Quality

8. **Vitest** (`ZixuanChen.vitest-explorer`)
   - Test explorer per Vitest
   - Run/debug test da UI

9. **Error Lens** (`usernamehw.errorlens`)
   - Mostra errori inline nel codice
   - Evidenziazione immediata problemi

10. **Import Cost** (`wix.vscode-import-cost`)
    - Mostra dimensione import
    - Utile per ottimizzazione bundle

### Git & Collaboration

11. **GitLens** (`eamodio.gitlens`)
    - Git history e blame inline
    - Advanced git features

12. **Git Graph** (`mhutchie.git-graph`)
    - Visualizzazione grafico git
    - Gestione branch visuale

### JSON & Data

13. **JSON Tools** (`eriklynd.json-tools`)
    - Formattazione e minify JSON
    - Validazione JSON schema

14. **YAML** (`redhat.vscode-yaml`)
    - Supporto YAML per configurazioni

### Markdown

15. **Markdown All in One** (`yzhang.markdown-all-in-one`)
    - Shortcuts e preview markdown
    - Auto-generazione TOC

16. **Markdown Preview Enhanced** (`shd101wyy.markdown-preview-enhanced`)
    - Preview markdown avanzato

### Claude AI

17. **Claude Code** (`anthropic.claude-code`)
    - Integrazione Claude AI nell'editor
    - Agent skills support

## Configurazione Workspace VSCode

Crea `.vscode/settings.json` nella root del progetto:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "files.eol": "\n",
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.git": true
  },
  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true,
    "**/node_modules": true,
    "**/dist": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "eslint.workingDirectories": [
    {
      "mode": "auto"
    }
  ],
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[jsonc]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "path-intellisense.mappings": {
    "@": "${workspaceRoot}/src"
  }
}
```

## Task VSCode

Crea `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "dev",
      "type": "npm",
      "script": "dev",
      "problemMatcher": [],
      "isBackground": true,
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "build",
      "type": "npm",
      "script": "build",
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "problemMatcher": ["$tsc"]
    },
    {
      "label": "lint",
      "type": "npm",
      "script": "lint",
      "problemMatcher": ["$eslint-stylish"]
    },
    {
      "label": "test",
      "type": "npm",
      "script": "test",
      "group": {
        "kind": "test",
        "isDefault": true
      },
      "isBackground": true,
      "problemMatcher": []
    },
    {
      "label": "validate:data",
      "type": "npm",
      "script": "validate:data",
      "problemMatcher": []
    },
    {
      "label": "Full Validation",
      "dependsOn": ["lint", "validate:data", "test"],
      "dependsOrder": "sequence",
      "problemMatcher": []
    }
  ]
}
```

**Uso Task:**
- `Ctrl+Shift+B` (Windows/Linux) o `Cmd+Shift+B` (Mac) per build
- `Ctrl+Shift+P` → "Tasks: Run Task" per altri task

## Debug Configuration

Crea `.vscode/launch.json` per debugging:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome against localhost",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src",
      "sourceMaps": true,
      "sourceMapPathOverrides": {
        "@/*": "${webRoot}/*"
      }
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Vitest Current File",
      "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
      "args": ["run", "${relativeFile}"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Validate Data",
      "program": "${workspaceFolder}/.claude/validate.js",
      "console": "integratedTerminal"
    }
  ]
}
```

## Estensioni Raccomandate

Crea `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "christian-kohler.path-intellisense",
    "dsznajder.es7-react-js-snippets",
    "formulahendry.auto-rename-tag",
    "zixuanchen.vitest-explorer",
    "usernamehw.errorlens",
    "wix.vscode-import-cost",
    "eamodio.gitlens",
    "mhutchie.git-graph",
    "eriklynd.json-tools",
    "yzhang.markdown-all-in-one",
    "anthropic.claude-code"
  ],
  "unwantedRecommendations": []
}
```

## Snippet Personalizzati

Crea `.vscode/snippets.code-snippets`:

```json
{
  "React Component with TypeScript": {
    "prefix": "rfc-ts",
    "body": [
      "interface ${1:ComponentName}Props {",
      "  $2",
      "}",
      "",
      "export function ${1:ComponentName}({ $3 }: ${1:ComponentName}Props) {",
      "  return (",
      "    <div>",
      "      $0",
      "    </div>",
      "  );",
      "}"
    ],
    "description": "React Function Component with TypeScript"
  },
  "PF2E Loaded Data Type": {
    "prefix": "pf2e-loaded",
    "body": [
      "interface Loaded${1:TypeName} {",
      "  _id: string;",
      "  name: string;",
      "  type: string;",
      "  img?: string;",
      "  system: ${2:System};",
      "}"
    ],
    "description": "PF2E Loaded data type interface"
  },
  "Agent Skill Definition": {
    "prefix": "agent-skill",
    "body": [
      "{",
      "  \"id\": \"${1:skill-id}\",",
      "  \"name\": \"${2:Skill Name}\",",
      "  \"description\": \"${3:Brief description}\",",
      "  \"prompt\": \"${4:Detailed prompt...}\",",
      "  \"instructions\": [",
      "    \"${5:Step 1}\",",
      "    \"${6:Step 2}\"",
      "  ]",
      "}"
    ],
    "description": "Agent skill definition"
  }
}
```

## Keyboard Shortcuts Raccomandati

Crea `.vscode/keybindings.json` (opzionale):

```json
[
  {
    "key": "ctrl+shift+v",
    "command": "workbench.action.tasks.runTask",
    "args": "validate:data"
  },
  {
    "key": "ctrl+shift+t",
    "command": "workbench.action.tasks.runTask",
    "args": "test"
  }
]
```

## Setup Iniziale

### 1. Clone e Installazione

```bash
# Clone repository
git clone https://github.com/Sacrifar/pathfinder-2e-app-ita.git
cd pathfinder-2e-app-ita

# Installa dipendenze
npm install

# Verifica setup
npm run lint
npm test
npm run validate:data
```

### 2. Configurazione VSCode

**Metodo A: Setup Automatico (Raccomandato)**

```bash
# Linux/macOS
./.claude/setup-vscode.sh

# Windows PowerShell
.\.claude\setup-vscode.ps1
```

Poi apri il progetto:
```bash
code .
```

**Metodo B: Configurazione Manuale**

Apri il progetto in VSCode:
```bash
code .
```

Crea manualmente i file in `.vscode/` seguendo i template in questa guida (vedi sezioni "Configurazione Workspace VSCode", "Task VSCode", ecc.).

VSCode chiederà di installare le estensioni raccomandate - **accetta**.

### 3. Verifica Configurazione

1. Apri un file `.ts` o `.tsx`
2. Verifica che ESLint mostri errori/warning
3. Salva il file - dovrebbe auto-formattarsi
4. Premi `Ctrl+Shift+P` → "Tasks: Run Task" → Verifica task disponibili

### 4. Avvia Dev Server

```bash
npm run dev
```

Apri http://localhost:5173

## Struttura Workspace

```
pathfinder-2e-app-ita/
├── .vscode/              # Configurazioni VSCode
│   ├── settings.json     # Impostazioni workspace
│   ├── tasks.json        # Task npm
│   ├── launch.json       # Debug configs
│   ├── extensions.json   # Estensioni raccomandate
│   └── snippets.code-snippets  # Snippet personalizzati
├── .claude/              # Agent skills e documentazione
│   ├── agent-skills.json
│   ├── README.md
│   ├── QUICKREF.md
│   ├── WORKSPACE.md
│   ├── validate.js
│   ├── setup-vscode.sh     # Setup script per Linux/macOS
│   └── setup-vscode.ps1    # Setup script per Windows
├── src/                  # Codice sorgente
├── public/               # Asset statici
├── dist/                 # Build output (gitignored)
├── node_modules/         # Dipendenze (gitignored)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── CLAUDE.md
```

## Workflow Raccomandato

### Sviluppo Quotidiano

1. **Avvia dev server**
   ```bash
   npm run dev
   ```

2. **Lavora su feature/fix**
   - Scrivi codice
   - Auto-format on save
   - ESLint inline feedback

3. **Test in watch mode** (finestra separata)
   ```bash
   npm test
   ```

4. **Valida prima di commit**
   ```bash
   npm run lint
   npm run validate:data
   npm test -- --run
   ```

5. **Commit e push**
   ```bash
   git add .
   git commit -m "feat: description"
   git push
   ```

### Con Agent Skills

1. **Consulta quick reference**
   ```bash
   cat .claude/QUICKREF.md
   ```

2. **Usa skill appropriato**
   - Invoca skill tramite Claude Code
   - Oppure segui pattern manualmente

3. **Valida risultati**
   ```bash
   npm run validate:data
   ```

## Troubleshooting

### ESLint non funziona

1. Verifica estensione installata
2. Reload VSCode: `Ctrl+Shift+P` → "Developer: Reload Window"
3. Check output: `Ctrl+Shift+U` → seleziona "ESLint"

### TypeScript errors non mostrati

1. Verifica `typescript.tsdk` in settings.json
2. Seleziona versione workspace: `Ctrl+Shift+P` → "TypeScript: Select TypeScript Version" → "Use Workspace Version"

### Path alias `@/*` non risolto

1. Verifica `tsconfig.json` ha `paths` configurato
2. Verifica `path-intellisense.mappings` in settings.json
3. Reload VSCode

### Prettier non formatta

1. Verifica `editor.defaultFormatter` in settings.json
2. Verifica `editor.formatOnSave` = true
3. Seleziona manualmente: `Ctrl+Shift+P` → "Format Document With..." → "Prettier"

### Hot Module Replacement (HMR) lento

1. Chiudi altri progetti VSCode aperti
2. Escludi `node_modules` e `dist` da file watchers
3. Aumenta limite file watch:
   ```bash
   # Linux
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

## Ottimizzazioni Performance

### VSCode Performance

1. **Disabilita estensioni non necessarie** per questo progetto
2. **Escludi cartelle** da search/watch (già in settings.json)
3. **Usa workspace** invece di finestra singola
4. **Chiudi file** non in uso (tab limit)

### Build Performance

1. **Use Node v18+** per performance ottimali
2. **SSD storage** per node_modules
3. **Sufficiente RAM** (minimo 8GB, raccomandato 16GB)

## Risorse Utili

### Documentazione Progetto

- `.claude/README.md` - Agent skills guide
- `.claude/QUICKREF.md` - Quick reference
- `.claude/examples.md` - Esempi pratici
- `CLAUDE.md` - Project overview

### Shortcuts VSCode Utili

| Shortcut | Azione |
|----------|--------|
| `Ctrl+P` | Quick open file |
| `Ctrl+Shift+P` | Command palette |
| `Ctrl+B` | Toggle sidebar |
| `Ctrl+J` | Toggle panel |
| `Ctrl+`` | Toggle terminal |
| `Ctrl+Shift+F` | Global search |
| `Ctrl+Shift+H` | Global replace |
| `Alt+Up/Down` | Move line |
| `Shift+Alt+Up/Down` | Copy line |
| `Ctrl+/` | Toggle comment |
| `F2` | Rename symbol |
| `F12` | Go to definition |
| `Ctrl+Shift+O` | Go to symbol |

### Links Esterni

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Vitest Docs](https://vitest.dev/)
- [Pathfinder 2E Rules](https://2e.aonprd.com/)

## Multi-Platform Setup

### Windows

```powershell
# Git Bash o PowerShell
git clone https://github.com/Sacrifar/pathfinder-2e-app-ita.git
cd pathfinder-2e-app-ita
npm install
npm run dev
```

### macOS

```bash
# Assicurati di avere Node.js installato (brew install node)
git clone https://github.com/Sacrifar/pathfinder-2e-app-ita.git
cd pathfinder-2e-app-ita
npm install
npm run dev
```

### Linux

```bash
# Debian/Ubuntu
sudo apt install nodejs npm
git clone https://github.com/Sacrifar/pathfinder-2e-app-ita.git
cd pathfinder-2e-app-ita
npm install
npm run dev
```

## Conclusioni

Questo workspace è ottimizzato per:
- ✅ Sviluppo React + TypeScript
- ✅ Linting e formattazione automatica
- ✅ Testing con Vitest
- ✅ Debug in Chrome
- ✅ Agent skills Claude
- ✅ Validazione dati PF2E
- ✅ Git workflow efficiente

Segui questa guida per un setup ottimale e un workflow produttivo! 🚀

---

**Versione:** 1.0
**Ultimo aggiornamento:** 2026-01-24
**Maintainer:** Development Team
