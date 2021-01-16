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
import { createSlice } from '@reduxjs/toolkit';
import type { AppDispatch, AppState } from '../app/store';
import { promptModal, confirmModal } from './modal';

type ScriptData = {
  inputs: Record<string, string>,
  outputs: Record<string, string>
};

type ScriptManagerState = {
  saving: boolean,
  running: boolean,
  dirty: boolean,
  openedScriptName: string,
  scriptContent: string,
  lastSaveScriptContent: string,
  consoleOutput: string,
  scripts: string[],
  data: Record<string, ScriptData>,
}

export const scriptManager = createSlice({
  name: 'scriptManager',
  initialState: {
    saving: false,
    running: false,
    dirty: false,
    openedScriptName: '',
    scriptContent: '',
    lastSaveScriptContent: '',
    consoleOutput: '',
    scripts: [],
    data: {},
  } as ScriptManagerState,
  reducers: {
    _runningScript: state => {
      state.running = true;
    },
    _ranScript: state => {
      state.running = false;
    },
    _setScripts: (state, action) => {
      state.scripts = action.payload;
    },
    _setScript: (state, action) => {
      state.openedScriptName = action.payload.name;
      state.scriptContent = action.payload.content;
      state.lastSaveScriptContent = action.payload.content;
      state.dirty = false;
      if (!state.data[action.payload.name]) {
        state.data[action.payload.name] = {
          inputs: {},
          outputs: {},
        };
      }
    },
    _savingScript: state => {
      state.saving = true;
    },
    _savedScript: state => {
      state.lastSaveScriptContent = state.scriptContent;
      state.saving = true;
      state.dirty = false;
    },
    consoleLog: (state, action) => {
      state.consoleOutput += `${action.payload}\n`;
    },
    consoleLogRaw: (state, action) => {
      state.consoleOutput += `${action.payload}`;
    },
    setScriptContent: (state, action) => {
      state.scriptContent = action.payload;
      state.dirty = state.lastSaveScriptContent !== action.payload;
    },
    setInput: (state, action) => {
      state.data[state.openedScriptName].inputs[action.payload.inputId] = action.payload.value;
    },
    setOutput: (state, action) => {
      state.data[state.openedScriptName].outputs[action.payload.outputId] = action.payload.value;
    },
  },
});

export const selectScripts = (state: AppState) => state.scriptManager.scripts;

export const getInputById = (state: AppState, inputId: number) => (
  state.scriptManager.data[state.scriptManager.openedScriptName]?.inputs?.[inputId] || ''
);

export const getOutputById = (state: AppState, outputId: number) => (
  state.scriptManager.data[state.scriptManager.openedScriptName]?.outputs?.[outputId] || ''
);

const {
  _runningScript,
  _ranScript,
  _setScripts,
  _setScript,
  _savingScript,
  _savedScript,
} = scriptManager.actions;

export const {
  setScriptContent,
  setInput,
  setOutput,
  consoleLog,
  consoleLogRaw,
} = scriptManager.actions;

export function openScript(scriptName: string) {
  return async (dispatch: AppDispatch, getState: () => AppState) => {
    const state = getState();
    if (state.scriptManager.dirty) {
      const result = await dispatch(confirmModal('Script not saved. Do you want to save your changes?'));
      if (result) {
        await dispatch(saveScript());
      } else if (result === null) {
        // Cancel pressed. Don't actually open the script.
        return;
      }
    }

    dispatch(_setScript({
      name: scriptName,
      content: await window.myAPI.getScript(scriptName),
    }));
  };
}

export function runScript() {
  return async (dispatch: AppDispatch, getState: () => AppState) => {
    const state = getState();
    dispatch(_runningScript());
    dispatch(consoleLog('Running...'));
    const scriptName = state.scriptManager.openedScriptName;
    const inputs = state.scriptManager.data[scriptName].inputs;
    const startTime = Date.now();
    await window.myAPI.runScript(scriptName, inputs);
    const elapsed = (Date.now() - startTime) / 1000;

    dispatch(_ranScript());
    dispatch(consoleLog(`Completed. Took ${elapsed} seconds`));
  };
}

export function stopScript() {
  return async () => {
    await window.myAPI.stopScript();
  };
}

export function saveScript() {
  return async (dispatch: AppDispatch, getState: () => AppState) => {
    const state = getState();
    dispatch(_savingScript());
    await window.myAPI.saveScript(state.scriptManager.openedScriptName, state.scriptManager.scriptContent);
    dispatch(_savedScript());
  };
}

export function refreshScripts() {
  return async (dispatch: AppDispatch, getState: () => AppState) => {
    const scriptList = await window.myAPI.getScriptList();
    await dispatch(_setScripts(scriptList));
    const openedScriptName = getState().scriptManager.openedScriptName;
    const openedFileRemoved = scriptList.findIndex(value => value === openedScriptName) === -1;
    // If current opened file was removed, open the first script if possible
    if (openedFileRemoved && scriptList[0]) {
      await dispatch(openScript(scriptList[0]));
    }
  };
}

export function newScript() {
  return async (dispatch: AppDispatch) => {
    const fileName = await dispatch(promptModal('What would you like to call this file?'));
    if (!fileName || fileName === true) {
      return;
    }
    await window.myAPI.newScript(fileName);
    await dispatch(refreshScripts());
    await dispatch(openScript(fileName));
  };
}

export function openScriptFileManager(scriptName: string) {
  return async () => {
    await window.myAPI.openScriptFileManager(scriptName);
  };
}

export default scriptManager.reducer;
