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
import { ChildProcess } from 'child_process';
import isDev from 'electron-is-dev';
import path from 'path';
import ShellExec from './ShellExec';

const extraPath = isDev ? path.resolve(__dirname, '../../extra') : path.resolve(path.dirname(process.resourcesPath), 'extra');
// eslint-disable-next-line no-console
console.log('resourcesPath: ', path.dirname(process.resourcesPath));
// eslint-disable-next-line no-console
console.log('__dirname: ', __dirname);
// eslint-disable-next-line no-console
console.log('extraPath: ', extraPath);

const scriptHookPath = path.resolve(extraPath, 'scriptHook.js');

type RuntimeDetails = { path: string, version: string };

export default class ScriptRunner {
  runtimeDetails: false | RuntimeDetails

  async init(runtimePath) {
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

  static async tryDetectRuntime(path) {
    try {
      const result: { output: RuntimeDetails } = JSON.parse(
        await ShellExec.exec(
          path, ['-r', scriptHookPath, '-e', 'output = { path: process.argv[0], version: process.versions.node }', '{}']
        ).promise
      );
      return result.output;
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
      // eslint-disable-next-line no-await-in-loop
      runtimeDetails = await ScriptRunner.tryDetectRuntime(candidateList.shift());
    }

    // If we can't find it then we likely failed
    return runtimeDetails;
  }

  _runningChildProcess: ChildProcess | null = null;

  async runScript(scriptPath, inputs) {
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
      data.split('\n').forEach(item => {
        if (item !== '') {
          try {
            window.postMessage(JSON.parse(item), '*');
          } catch (e) {
            window.postMessage({ evt: 'error', data: e }, '*');
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
