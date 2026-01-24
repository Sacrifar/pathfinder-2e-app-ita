# Setup VSCode workspace configuration for Windows
# Creates .vscode/ folder with recommended settings

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$VsCodeDir = Join-Path $ProjectRoot ".vscode"

Write-Host "🔧 Setting up VSCode workspace configuration..." -ForegroundColor Cyan
Write-Host ""

# Create .vscode directory if it doesn't exist
if (Test-Path $VsCodeDir) {
    Write-Host "⚠️  .vscode/ directory already exists." -ForegroundColor Yellow
    $response = Read-Host "Do you want to overwrite existing files? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Host "❌ Cancelled. No files were modified." -ForegroundColor Red
        exit 0
    }
} else {
    New-Item -ItemType Directory -Path $VsCodeDir | Out-Null
    Write-Host "📁 Created .vscode/ directory" -ForegroundColor Green
}

# Create settings.json
$settingsContent = @'
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
    "**/.DS_Store": true
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
'@
Set-Content -Path (Join-Path $VsCodeDir "settings.json") -Value $settingsContent
Write-Host "✅ Created settings.json" -ForegroundColor Green

# Create tasks.json
$tasksContent = @'
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
'@
Set-Content -Path (Join-Path $VsCodeDir "tasks.json") -Value $tasksContent
Write-Host "✅ Created tasks.json" -ForegroundColor Green

# Create launch.json
$launchContent = @'
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
'@
Set-Content -Path (Join-Path $VsCodeDir "launch.json") -Value $launchContent
Write-Host "✅ Created launch.json" -ForegroundColor Green

# Create extensions.json
$extensionsContent = @'
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
'@
Set-Content -Path (Join-Path $VsCodeDir "extensions.json") -Value $extensionsContent
Write-Host "✅ Created extensions.json" -ForegroundColor Green

# Create snippets
$snippetsContent = @'
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
  },
  "Vitest Test Suite": {
    "prefix": "vtest",
    "body": [
      "import { describe, it, expect } from 'vitest';",
      "import { ${1:functionName} } from './${2:fileName}';",
      "",
      "describe('${1:functionName}', () => {",
      "  it('${3:should do something}', () => {",
      "    const result = ${1:functionName}($4);",
      "    expect(result).toBe($5);",
      "  });",
      "});"
    ],
    "description": "Vitest test suite"
  }
}
'@
Set-Content -Path (Join-Path $VsCodeDir "pathfinder2e.code-snippets") -Value $snippetsContent
Write-Host "✅ Created pathfinder2e.code-snippets" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 VSCode workspace setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Reload VSCode window (Ctrl+Shift+P → Developer: Reload Window)"
Write-Host "  2. Install recommended extensions when prompted"
Write-Host "  3. Start dev server: npm run dev"
Write-Host ""
Write-Host "📚 For more info, see .claude/WORKSPACE.md"
