/**
 * Type declarations for @3d-dice/dice-box
 */

declare module '@3d-dice/dice-box' {
  export interface DieResult {
    value: number;
    sides: number;
    vector?: {
      x: number;
      y: number;
      z: number;
    };
  }

  // Roll result object as returned by getRollResults() and onRollComplete
  // This matches the format expected by parseFinalResults in dice-parser-interface
  export interface RollResult {
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

  export interface DiceBoxConfig {
    id?: string;
    assetPath: string;
    container?: string | HTMLElement;
    gravity?: number;
    mass?: number;
    friction?: number;
    restitution?: number;
    angularDamping?: number;
    linearDamping?: number;
    spinForce?: number;
    throwForce?: number;
    startingHeight?: number;
    settleTimeout?: number;
    offscreen?: boolean;
    delay?: number;
    lightIntensity?: number;
    enableShadows?: boolean;
    shadowTransparency?: number;
    theme?: string;
    preloadThemes?: string[];
    externalThemes?: Record<string, string>;
    themeColor?: string;
    scale?: number;
    suspendSimulation?: boolean;
    origin?: string;
    onBeforeRoll?: () => void;
    onDieComplete?: (dieResult: DieResult) => void;
    onRollComplete?: (rollResult: RollResult[]) => void;
    onRemoveComplete?: (dieResult: DieResult) => void;
    onThemeConfigLoaded?: (config: unknown) => void;
    onThemeLoaded?: (config: unknown) => void;
  }

  export default class DiceBox {
    constructor(config: DiceBoxConfig);
    init(): Promise<void>;
    roll(notation: string | object): Promise<void>;
    clear(): Promise<void>;
    hide(): Promise<void>;
    show(): Promise<void>;
    updateConfig(config: Partial<DiceBoxConfig>): void;
    addTheme(themeConfig: unknown): void;
    getRollResults(): RollResult[];
    // Callback properties that can be set after initialization
    onDieComplete?: (dieResult: DieResult) => void;
    onRollComplete?: (rollResult: RollResult[]) => void;
    onRemoveComplete?: (dieResult: DieResult) => void;
    onThemeConfigLoaded?: (config: unknown) => void;
    onThemeLoaded?: (config: unknown) => void;
  }
}
