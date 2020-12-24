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
import watch from 'node-watch';

import ScriptLister from './ScriptLister';
import ScriptRunner from './ScriptRunner';

// eslint-disable-next-line no-console
console.log('process.env', process.env);

const scriptRunner = new ScriptRunner();
(async () => {
  // @ts-ignore
  await watch(ScriptLister.getScriptDir(), {}, (evt, name) => {
    // eslint-disable-next-line no-console
    console.log('%s changed.', evt, name);
    window.postMessage({ evt: 'update', name }, '*');
  });
})();

contextBridge.exposeInMainWorld('myAPI', {
  init: async runtimePath => {
    return scriptRunner.init(runtimePath);
  },
  runScript: async (scriptName, inputs) => {
    const scriptPath = ScriptLister.getScriptPath(scriptName);
    // const escapedScriptPath = scriptPath.replace(/["]/g, '\\"').replace(/\n/g, '\\n').replace(/\\/g, '\\\\');
    return scriptRunner.runScript(scriptPath, inputs);
  },
  stopScript: async () => {
    return scriptRunner.stopScript();
  },
  saveScript: async (scriptName, content) => {
    return ScriptLister.saveScript(scriptName, content);
  },
  getScriptList: async () => {
    return ScriptLister.getScriptList();
  },
  getScript: async scriptName => {
    return ScriptLister.loadScript(scriptName);
  },
  newScript: async scriptName => {
    return ScriptLister.newScript(scriptName);
  },
  eval: code => {
    // eslint-disable-next-line no-eval
    return eval(code);
  },
  openScriptFileManager: scriptName => {
    const scriptPath = ScriptLister.getScriptPath(scriptName);
    shell.showItemInFolder(scriptPath);
  },
  on: (channel, listener) => {
    return ipcRenderer.on(channel, listener);
  },
});

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
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
