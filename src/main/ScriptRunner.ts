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
// import { app } from 'electron';
import { ChildProcess } from 'child_process';
import path from 'path';
import ShellExec from './ShellExec';
import { app } from 'electron';

const extraPath = app.isPackaged ? path.resolve(app.getAppPath(), '.webpack/renderer/assets/extra') : path.resolve(__dirname, '../../.webpack/renderer/assets/extra');
// eslint-disable-next-line no-console
console.log('resourcesPath: ', path.dirname(process.resourcesPath));
console.log('appPath: ', app.getAppPath());
// eslint-disable-next-line no-console
console.log('__dirname: ', __dirname);
// eslint-disable-next-line no-console
console.log('extraPath: ', extraPath);

const scriptHookPath = path.resolve(extraPath, 'scriptHook.js');

type RuntimeDetails = { path: string, version: string };

interface ScriptRunnerOptions {
  onScriptEvent: (data: any) => void;
}

export default class ScriptRunner {
  runtimeDetails: false | RuntimeDetails

  constructor(private options: ScriptRunnerOptions) {
    this.runtimeDetails = false;
  }

  async init(runtimePath: string | undefined) {
    // eslint-disable-next-line no-console
    console.log('Initializing script runner for platform: ', process.platform);
    if (runtimePath) {
      // eslint-disable-next-line no-console
      console.log('Trying to use preconfigured runtime path: ', runtimePath);
      this.runtimeDetails = await ScriptRunner.tryDetectRuntime(runtimePath);
    }
    if (!this.runtimeDetails) {
      this.runtimeDetails = await ScriptRunner.detectRuntime();
    }
    if (this.runtimeDetails) {
      // eslint-disable-next-line no-console
      console.log('Using node runtime: ', this.runtimeDetails.path, ', version: ', this.runtimeDetails.version);
      return true;
    }
    // eslint-disable-next-line no-console
    console.error('Failed to detect node runtime. The application will not function');
    return false;
  }

  static async tryDetectRuntime(path: string) {
    try {
      const abc = await ShellExec.exec(
        path, ['-r', scriptHookPath, '-e', 'outputs.path = process.argv[0]; outputs.version = process.versions.node', '{}']
      ).promise;
      const result: { outputs: RuntimeDetails } = JSON.parse(
        abc
      );
      return result.outputs;
    } catch (e) {
      return false;
    }
  }

  static async detectRuntime() {
    const candidates = {
      nix: [
        '/usr/local/bin/node',
      ],
      windows: [
        'C:\\Program Files\\nodejs\\node.exe',
      ],
    };

    let candidateList: string[];
    if (process.platform === 'win32') {
      candidateList = candidates.windows;
    } else {
      candidateList = candidates.nix;
    }

    // First try to detect it from the environment
    let runtimeDetails = await ScriptRunner.tryDetectRuntime('node');

    // Then try each candidate for the platform, one at a time
    while (candidateList.length && !runtimeDetails) {
      const candidate = candidateList.shift();
      // eslint-disable-next-line no-await-in-loop
      runtimeDetails = candidate ? await ScriptRunner.tryDetectRuntime(candidate) : false;
    }

    // If we can't find it then we likely failed
    return runtimeDetails;
  }

  _runningChildProcess: ChildProcess | null = null;

  async runScript(scriptPath: string, inputs: Record<string | number, string>) {
    if (this._runningChildProcess) {
      throw new Error('Already running a process');
    }
    if (!this.runtimeDetails) {
      throw new Error('Runtime was never detected');
    }
    const result = ShellExec.exec(this.runtimeDetails.path, ['-r', scriptHookPath, scriptPath, JSON.stringify(inputs)]);
    this._runningChildProcess = result.child;
    if (!result.child.stdout) {
      throw new Error('Missing stdout');
    }
    result.child.stdout.on('data', data => {
      data.split('\n').forEach((item: string) => {
        if (item !== '') {
          try {
            this.options.onScriptEvent(JSON.parse(item));
          } catch (e) {
            this.options.onScriptEvent({ evt: 'error', data: e });
          }
        }
      });
    });
    const output = await result.promise;
    this._runningChildProcess = null;
    return output;
  }

  async stopScript() {
    if (this._runningChildProcess) {
      this._runningChildProcess.kill();
    }
  }
}
