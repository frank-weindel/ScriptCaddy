import {
  IpcRenderer,
  IpcRendererEvent,
  NativeTheme,
} from 'electron';

interface OnThemeChangeMessage {
  msg: 'onThemeChange',
  themeSource: NativeTheme['themeSource'],
}

interface OnInitCompleteMessage {
  msg: 'onInitComplete'
}

export type Message = OnThemeChangeMessage | OnInitCompleteMessage;

export interface MainApi {
  send: (channel: string, data: Message) => void,
  receive: (channel: string, func: (...args: any[]) => void) => void
}

export interface MyApi {
  init(runtimePath?: string): Promise<boolean>;
  runScript: (scriptName: string, inputs: Record<string, string>) => Promise<string>,
  stopScript: () => Promise<void>,
  saveScript: (scriptName: string, content: string) => Promise<void>,
  getScriptList: () => Promise<string[]>,
  getScript: (scriptName: string) => Promise<string>,
  newScript: (scriptName: string) => Promise<void>,
  openScriptFileManager: (scriptName: string) => void,
  on: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) => IpcRenderer
}
