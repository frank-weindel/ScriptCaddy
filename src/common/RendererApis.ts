import {
  IpcRenderer,
  IpcRendererEvent,
  NativeTheme,
} from 'electron';
import { Scrip } from './types';

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

export interface MyApi extends TheMainApi {
  on: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) => IpcRenderer
}


export interface TheMainApi {
  init(runtimePath?: string): Promise<boolean>;
  runScript: (scriptName: string, inputs: Record<string, string>) => Promise<string>,
  stopScript: () => Promise<void>,
  saveScript: (scriptName: string, scrip: Scrip) => Promise<void>,
  getScriptList: () => Promise<string[]>,
  getScript: (scriptName: string) => Promise<Scrip>,
  newScript: (scriptName: string) => Promise<void>,
  openScriptFileManager: (scriptName: string) => void,
}