/**
 * Type declarations for @3d-dice/dice-parser-interface
 */

declare module '@3d-dice/dice-parser-interface' {
  export interface DiceRollResult {
    qty: number;
    sides: number;
    mods: Array<{
      type: string;
      target?: {
        type: string;
        mod: unknown;
        value: {
          type: string;
          value: number;
        };
      };
    }>;
    rolls: Array<{
      sides: number;
      groupId: number | string;
      rollId: number | string;
      theme?: string;
      value: number;
    }>;
    groupId: number | string;
    value: number;
  }

  export interface ParsedNotation {
    die: {
      type: string;
      value: number;
    };
    count: {
      type: string;
      value: number;
      success: null;
      successes: number;
      failures: number;
      valid: boolean;
      order: number;
    };
    type: string;
    mods: unknown[];
    root: boolean;
    label: string;
  }

  export interface ParsedRollResult {
    count: {
      type: string;
      value: number;
      success: null;
      successes: number;
      failures: number;
      valid: boolean;
      order: number;
    };
    die: {
      type: string;
      value: number;
      success: null;
      successes: number;
      failures: number;
      valid: boolean;
      order: number;
    };
    rolls: Array<{
      critical: string | null;
      die: number;
      matched: boolean;
      order: number;
      roll: number;
      success: null;
      successes: number;
      failures: number;
      type: string;
      valid: boolean;
      value: number;
      reroll?: boolean;
    }>;
    success: null;
    successes: number;
    failures: number;
    type: string;
    valid: boolean;
    value: number;
    order: number;
    matched: boolean;
  }

  export default class DiceParser {
    constructor();

    /**
     * Parse a dice notation string into a structured format
     * @param notation - Dice notation string (e.g., "2d6+3", "4d6!")
     * @returns Parsed notation object
     */
    parseNotation(notation: string): ParsedNotation;

    /**
     * Handle rerolls for dice that need to be re-rolled
     * @param rollResults - Array of dice roll results from dice-box
     * @returns Array of dice objects that need to be re-rolled
     */
    handleRerolls(rollResults: DiceRollResult[]): Array<{
      groupId: number | string;
      rollId: number | string;
      sides: number;
      qty: number;
    }>;

    /**
     * Parse the final results from a completed dice roll
     * @param rollResults - Array of dice roll results from dice-box
     * @returns Computed final results with total value
     */
    parseFinalResults(rollResults: DiceRollResult[]): ParsedRollResult;
  }
}
