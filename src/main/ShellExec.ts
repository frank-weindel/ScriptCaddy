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
import { PromiseWithChild } from 'child_process';
import { execFile } from '../common/AsyncHelpers';

export default class ShellExec {
  /**
   *
   * @param {string} file
   * @param {string[]} args
   */
  static exec(file: string, args: string[]) {
    let execPromise: PromiseWithChild<{stdout: string, stderr: string}>;

    /**
     * @return {Promise<string>}
     */
    async function runExec() {
      let result: string;
      try {
        execPromise = execFile(file, args);
        result = (await execPromise).stdout;
      } catch (e) {
        if (e instanceof Error) {
          result = e.stack || 'No stack found';
        }
        result = `Unknown error: ${String(e)}`;
      }
      return result;
    }

    const runExecPromise = runExec();

    return {
      // @ts-ignore
      child: execPromise.child,
      promise: runExecPromise,
    };
  }
}
