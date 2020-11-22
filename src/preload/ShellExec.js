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
const { execFile } = require('../common/AsyncHelpers');

class ShellExec {
  /**
   *
   * @param {string} file
   * @param {string[]} args
   */
  static exec(file, args) {
    /**
     * @type {import('child_process').PromiseWithChild<{stdout: string, stderr: string}>}
     */
    let execPromise;

    /**
     * @return {Promise<string>}
     */
    async function runExec() {
      let result;
      try {
        execPromise = execFile(file, args);
        result = (await execPromise).stdout;
      } catch (e) {
        result = e.stack;
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

module.exports = ShellExec;
