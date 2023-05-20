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
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AppDispatch, AppState } from '../app/store';
import { promptModal, confirmModal } from './modal';

type IOElement = {
  type: 'input' | 'output',
  label: string,
  id: string | number,
};

type IOConfig = IOElement[];

export type IOFieldSetValue = {
  element: IOElement,
  value: string
};

type ScriptData = {
  inputs: Record<string | number, string>,
  outputs: Record<string | number, string>,
  consoleOutput: string,
};

type ScriptManagerState = {
  saving: boolean,
  running: boolean,
  scriptBodyDirty: boolean,
  scriptConfigBodyDirty: boolean,
  openedScriptName: string,
  scriptBody: string,
  scriptConfigBody: string,
  scriptConfig: IOConfig,
  scriptConfigError: string | null,
  lastSaveScriptBody: string,
  lastSaveScriptConfigBody: string,
  consoleOutput: string,
  scripts: string[],
  data: Record<string, ScriptData>,
}

export const scriptManager = createSlice({
  name: 'scriptManager',
  initialState: {
    saving: false,
    running: false,
    scriptBodyDirty: false,
    scriptConfigBodyDirty: false,
    openedScriptName: '',
    scriptBody: '',
    scriptConfigBody: '',
    scriptConfig: [],
    scriptConfigError: null,
    lastSaveScriptBody: '',
    lastSaveScriptConfigBody: '',
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
    _initScript: (state, action: PayloadAction<{name: string, scriptBody: string, scriptConfigBody: string}>) => {
      state.openedScriptName = action.payload.name;
      state.lastSaveScriptBody = action.payload.scriptBody;
      state.lastSaveScriptConfigBody = action.payload.scriptConfigBody;

      if (!state.data[action.payload.name]) {
        state.data[action.payload.name] = {
          inputs: {},
          outputs: {},
          consoleOutput: '',
        };
      }
    },
    _savingScript: state => {
      state.saving = true;
    },
    _savedScript: state => {
      state.saving = false;
      state.lastSaveScriptBody = state.scriptBody;
      state.scriptBodyDirty = false;
      state.lastSaveScriptConfigBody = state.scriptConfigBody;
      state.scriptConfigBodyDirty = false;
    },
    consoleLog: (state, action) => {
      state.consoleOutput += `${action.payload}\n`;
    },
    consoleLogRaw: (state, action) => {
      state.consoleOutput += `${action.payload}`;
    },
    setScriptBody: (state, action) => {
      state.scriptBody = action.payload;
      state.scriptBodyDirty = state.lastSaveScriptBody !== action.payload;
    },
    setIOValue: (state, action: PayloadAction<IOFieldSetValue>) => {
      const element = action.payload.element;
      if (element.type === 'input') {
        state.data[state.openedScriptName].inputs[element.id] = action.payload.value;
      } else {
        state.data[state.openedScriptName].outputs[element.id] = action.payload.value;
      }
    },
    setScriptConfigBody: (state, action: PayloadAction<string>) => {
      state.scriptConfigBody = action.payload;
      state.scriptConfigBodyDirty = state.lastSaveScriptConfigBody !== action.payload;
      try {
        state.scriptConfig = JSON.parse(action.payload);
        state.scriptConfigError = null;
      } catch (e) {
        if (e instanceof Error) {
          state.scriptConfigError = e.message;
        } else {
          state.scriptConfigError = `Unknown error: ${String(e)}`;
        }
        state.scriptConfig = [];
      }
    },
  },
});

export const isScriptDirty = (state: AppState) => state.scriptManager.scriptBodyDirty || state.scriptManager.scriptConfigBodyDirty;

export const selectScripts = (state: AppState) => state.scriptManager.scripts;

export const getInputs = (state: AppState) => (
  state.scriptManager.data[state.scriptManager.openedScriptName]?.inputs || {}
);

export const getOutputs = (state: AppState) => (
  state.scriptManager.data[state.scriptManager.openedScriptName]?.outputs || {}
);

export const getInputById = (state: AppState, inputId: number) => (
  state.scriptManager.data[state.scriptManager.openedScriptName]?.inputs?.[inputId] || ''
);

export const getOutputById = (state: AppState, outputId: number) => (
  state.scriptManager.data[state.scriptManager.openedScriptName]?.outputs?.[outputId] || ''
);

export const getScriptConfigBody = (state: AppState) => (
  state.scriptManager.scriptConfigBody || ''
);

export const getScriptConfig = (state: AppState) => (
  state.scriptManager.scriptConfig
);

const {
  _runningScript,
  _ranScript,
  _setScripts,
  _initScript,
  _savingScript,
  _savedScript,
} = scriptManager.actions;

export const {
  setScriptBody,
  setIOValue,
  setScriptConfigBody,
  consoleLog,
  consoleLogRaw,
} = scriptManager.actions;

export function openScript(scriptName: string) {
  return async (dispatch: AppDispatch, getState: () => AppState) => {
    const state = getState();
    if (isScriptDirty(state)) {
      const result = await dispatch(confirmModal('Script not saved. Do you want to save your changes?'));
      if (result) {
        await dispatch(saveScript());
      } else if (result === null) {
        // Cancel pressed. Don't actually open the script.
        return;
      }
    }

    const scrip = await window.myAPI.getScript(scriptName);

    dispatch(_initScript({
      name: scriptName,
      scriptBody: scrip.scriptBody,
      scriptConfigBody: scrip.scriptConfigBody,
    }));
    dispatch(setScriptBody(scrip.scriptBody));
    dispatch(setScriptConfigBody(scrip.scriptConfigBody));
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
    const ioConfig = getScriptConfigBody(state);
    await window.myAPI.saveScript(state.scriptManager.openedScriptName, {
      scriptBody: state.scriptManager.scriptBody,
      scriptConfigBody: ioConfig,
    });
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
