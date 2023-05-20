/**
 * Copyright (C) 2020 Frank Weindel
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import {
  contextBridge,
  ipcRenderer,
  shell,
} from 'electron';

import {
  MainApi,
  MyApi,
  TheMainApi,
} from '../common/RendererApis';
import { asyncRpcSender } from '../common/AsyncRpc';

// eslint-disable-next-line no-console
console.log('process.env', process.env);

contextBridge.exposeInMainWorld<MyApi>('myAPI', {
  ...asyncRpcSender<TheMainApi>(ipcRenderer, 'toMain', {
    init: true,
    runScript: true,
    stopScript: true,
    saveScript: true,
    getScriptList: true,
    getScript: true,
    newScript: true,
    openScriptFileManager: true,
  }),
  on: (channel, listener) => {
    return ipcRenderer.on(channel, listener);
  },
});

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld<MainApi>(
  'api', {
    send: (channel, data) => {
      // whitelist channels
      const validChannels = ['toMain'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    receive: (channel, func) => {
      const validChannels = ['fromMain'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
  }
);

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
