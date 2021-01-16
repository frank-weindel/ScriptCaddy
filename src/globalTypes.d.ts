/**
 * Override official electron ContextBridge to support a generic
 */
declare namespace Electron {
  interface ContextBridge extends NodeJS.EventEmitter {
    exposeInMainWorld<T = Record<string, any>>(apiKey: string, api: T): void;
  }
}
