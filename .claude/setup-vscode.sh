#!/bin/bash

# Setup VSCode workspace configuration
# Creates .vscode/ folder with recommended settings

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
VSCODE_DIR="$PROJECT_ROOT/.vscode"

echo "🔧 Setting up VSCode workspace configuration..."
echo ""

# Create .vscode directory if it doesn't exist
if [ -d "$VSCODE_DIR" ]; then
    echo "⚠️  .vscode/ directory already exists."
    read -p "Do you want to overwrite existing files? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Cancelled. No files were modified."
        exit 0
    fi
else
    mkdir -p "$VSCODE_DIR"
    echo "📁 Created .vscode/ directory"
fi

# Create settings.json
cat > "$VSCODE_DIR/settings.json" <<'EOF'
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
EOF
echo "✅ Created settings.json"

# Create tasks.json
cat > "$VSCODE_DIR/tasks.json" <<'EOF'
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
EOF
echo "✅ Created tasks.json"

# Create launch.json
cat > "$VSCODE_DIR/launch.json" <<'EOF'
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
EOF
echo "✅ Created launch.json"

# Create extensions.json
cat > "$VSCODE_DIR/extensions.json" <<'EOF'
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
EOF
echo "✅ Created extensions.json"

# Create snippets
cat > "$VSCODE_DIR/pathfinder2e.code-snippets" <<'EOF'
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
EOF
echo "✅ Created pathfinder2e.code-snippets"

echo ""
echo "🎉 VSCode workspace setup complete!"
echo ""
echo "Next steps:"
echo "  1. Reload VSCode window (Ctrl+Shift+P → Developer: Reload Window)"
echo "  2. Install recommended extensions when prompted"
echo "  3. Start dev server: npm run dev"
echo ""
echo "📚 For more info, see .claude/WORKSPACE.md"
