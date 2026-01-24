#!/usr/bin/env node

/**
 * Validation script for PF2E data files
 * Uses the same validation logic as the validate-json-data agent skill
 * Can be run in CI/CD or manually
 */

import { readdir, readFile } from 'fs/promises';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PF2E_DATA_DIR = join(__dirname, '../src/data/pf2e');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Required fields for different content types
const SCHEMA_REQUIREMENTS = {
  weapon: ['_id', 'name', 'type', 'system'],
  armor: ['_id', 'name', 'type', 'system'],
  equipment: ['_id', 'name', 'type', 'system'],
  spell: ['_id', 'name', 'type', 'system'],
  feat: ['_id', 'name', 'type', 'system'],
  action: ['_id', 'name', 'type', 'system'],
  ancestry: ['_id', 'name', 'type', 'system'],
  heritage: ['_id', 'name', 'type', 'system'],
  background: ['_id', 'name', 'type', 'system'],
  class: ['_id', 'name', 'type', 'system'],
  condition: ['_id', 'name', 'type', 'system'],
};

class ValidationError {
  constructor(file, message, severity = 'error') {
    this.file = file;
    this.message = message;
    this.severity = severity;
  }

  toString() {
    const color = this.severity === 'error' ? 'red' : 'yellow';
    const prefix = this.severity === 'error' ? '❌' : '⚠️';
    return `${prefix} ${this.file}: ${this.message}`;
  }
}

class Validator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.idsMap = new Map();
    this.filesProcessed = 0;
  }

  addError(file, message) {
    this.errors.push(new ValidationError(file, message, 'error'));
  }

  addWarning(file, message) {
    this.warnings.push(new ValidationError(file, message, 'warning'));
  }

  async validateDirectory(dirPath, category) {
    const files = await readdir(dirPath, { withFileTypes: true });

    for (const file of files) {
      const fullPath = join(dirPath, file.name);

      if (file.isDirectory()) {
        await this.validateDirectory(fullPath, file.name);
      } else if (file.name.endsWith('.json')) {
        await this.validateFile(fullPath, category);
      }
    }
  }

  async validateFile(filePath, category) {
    this.filesProcessed++;
    const relativePath = relative(PF2E_DATA_DIR, filePath);

    try {
      const content = await readFile(filePath, 'utf-8');

      // Validate JSON syntax
      let data;
      try {
        data = JSON.parse(content);
      } catch (parseError) {
        this.addError(relativePath, `Invalid JSON syntax: ${parseError.message}`);
        return;
      }

      // Validate required fields
      const requirements = SCHEMA_REQUIREMENTS[category] || SCHEMA_REQUIREMENTS.equipment;
      for (const field of requirements) {
        if (!data[field]) {
          this.addError(relativePath, `Missing required field: ${field}`);
        }
      }

      // Validate _id uniqueness
      if (data._id) {
        if (this.idsMap.has(data._id)) {
          this.addError(
            relativePath,
            `Duplicate _id "${data._id}" (also in ${this.idsMap.get(data._id)})`
          );
        } else {
          this.idsMap.set(data._id, relativePath);
        }
      }

      // Validate name field
      if (data.name && typeof data.name !== 'string') {
        this.addError(relativePath, `Field "name" must be a string`);
      }

      // Validate type field
      if (data.type && typeof data.type !== 'string') {
        this.addError(relativePath, `Field "type" must be a string`);
      }

      // Validate system object
      if (data.system && typeof data.system !== 'object') {
        this.addError(relativePath, `Field "system" must be an object`);
      }

      // Check for empty name
      if (data.name === '') {
        this.addWarning(relativePath, 'Empty name field');
      }

      // Check for missing image
      if (!data.img) {
        this.addWarning(relativePath, 'Missing img field (optional but recommended)');
      }

      // Validate image path format if present
      if (data.img && !data.img.startsWith('systems/') && !data.img.startsWith('icons/')) {
        this.addWarning(
          relativePath,
          `Image path "${data.img}" doesn't follow standard format (systems/ or icons/)`
        );
      }

      // Category-specific validations
      if (category === 'weapon' && data.system) {
        this.validateWeapon(relativePath, data);
      } else if (category === 'spell' && data.system) {
        this.validateSpell(relativePath, data);
      } else if (category === 'feat' && data.system) {
        this.validateFeat(relativePath, data);
      }

    } catch (error) {
      this.addError(relativePath, `Failed to read file: ${error.message}`);
    }
  }

  validateWeapon(file, data) {
    const sys = data.system;

    if (!sys.damage) {
      this.addError(file, 'Weapon missing system.damage');
    }

    if (!sys.range && !sys.traits?.value?.includes('melee')) {
      this.addWarning(file, 'Weapon missing range specification');
    }

    if (sys.damage?.die && !['d4', 'd6', 'd8', 'd10', 'd12'].includes(sys.damage.die)) {
      this.addWarning(file, `Unusual damage die: ${sys.damage.die}`);
    }
  }

  validateSpell(file, data) {
    const sys = data.system;

    if (sys.level?.value === undefined) {
      this.addError(file, 'Spell missing system.level.value');
    }

    if (!sys.traditions?.value || sys.traditions.value.length === 0) {
      this.addWarning(file, 'Spell has no traditions specified');
    }

    if (!sys.school?.value) {
      this.addWarning(file, 'Spell missing school');
    }
  }

  validateFeat(file, data) {
    const sys = data.system;

    if (sys.level?.value === undefined) {
      this.addError(file, 'Feat missing system.level.value');
    }

    if (!sys.featType?.value) {
      this.addWarning(file, 'Feat missing featType');
    }

    if (!sys.traits?.value || sys.traits.value.length === 0) {
      this.addWarning(file, 'Feat has no traits specified');
    }
  }

  printReport() {
    console.log('\n' + '='.repeat(80));
    log('PF2E DATA VALIDATION REPORT', 'cyan');
    console.log('='.repeat(80) + '\n');

    log(`📁 Files processed: ${this.filesProcessed}`, 'blue');
    log(`🔑 Unique IDs found: ${this.idsMap.size}`, 'blue');
    console.log();

    if (this.errors.length === 0 && this.warnings.length === 0) {
      log('✅ All validations passed! No errors or warnings found.', 'green');
    } else {
      if (this.errors.length > 0) {
        log(`\n❌ ERRORS (${this.errors.length}):`, 'red');
        console.log('─'.repeat(80));
        this.errors.forEach(error => {
          log(error.toString(), 'red');
        });
      }

      if (this.warnings.length > 0) {
        log(`\n⚠️  WARNINGS (${this.warnings.length}):`, 'yellow');
        console.log('─'.repeat(80));
        this.warnings.forEach(warning => {
          log(warning.toString(), 'yellow');
        });
      }
    }

    console.log('\n' + '='.repeat(80));

    const exitCode = this.errors.length > 0 ? 1 : 0;
    if (exitCode === 0) {
      log('✅ Validation complete: PASSED', 'green');
    } else {
      log('❌ Validation complete: FAILED', 'red');
    }
    console.log('='.repeat(80) + '\n');

    return exitCode;
  }
}

async function main() {
  log('\n🔍 Starting PF2E data validation...', 'cyan');
  log(`📂 Data directory: ${PF2E_DATA_DIR}\n`, 'blue');

  const validator = new Validator();

  try {
    // Check if data directory exists
    try {
      await readdir(PF2E_DATA_DIR);
    } catch (error) {
      log(`❌ Cannot access data directory: ${PF2E_DATA_DIR}`, 'red');
      process.exit(1);
    }

    // Validate all subdirectories
    const categories = await readdir(PF2E_DATA_DIR, { withFileTypes: true });

    for (const category of categories) {
      if (category.isDirectory()) {
        const categoryPath = join(PF2E_DATA_DIR, category.name);
        log(`  Validating ${category.name}...`, 'blue');
        await validator.validateDirectory(categoryPath, category.name);
      }
    }

    // Print report and exit
    const exitCode = validator.printReport();
    process.exit(exitCode);

  } catch (error) {
    log(`\n❌ Fatal error during validation: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { Validator, ValidationError };
