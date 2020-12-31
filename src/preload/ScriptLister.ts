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
import os from 'os';
import path from 'path';
import {
  readFile,
  writeFile,
  readdir,
} from '../common/AsyncHelpers';
import {
  ensureDirSync,
} from '../common/FileHelpers';

const appHomeDir = path.join(os.homedir(), 'ScriptCaddy');
const scriptDir = path.join(appHomeDir, 'My Scripts');

// eslint-disable-next-line no-console
console.log('using appHome dir: ', appHomeDir);
// eslint-disable-next-line no-console
console.log('using script dir: ', scriptDir);

if (ensureDirSync(appHomeDir)) {
  // eslint-disable-next-line no-console
  console.log('Created appHome directory');
}

if (ensureDirSync(scriptDir)) {
  // eslint-disable-next-line no-console
  console.log('Created script directory');
}

export default class ScriptLister {
  /**
   * Return an array of javascript file names in the app_home
   *
   * @return {Promise<string[]>} Files
   */
  static async getScriptList() {
    return (await readdir(scriptDir, { withFileTypes: true }))
      .filter(file => file.isFile() && file.name.match(/.+\.js$/))
      .map(file => file.name);
  }

  static async loadScript(scriptName) {
    return readFile(this.getScriptPath(scriptName), 'utf8');
  }

  static async newScript(scriptName) {
    return writeFile(this.getScriptPath(scriptName), 'console.log("hello world");', 'utf8');
  }

  static async saveScript(scriptName, content) {
    return writeFile(this.getScriptPath(scriptName), content, 'utf8');
  }

  static getScriptPath(scriptName) {
    return path.resolve(scriptDir, scriptName);
  }

  static getScriptDir() {
    return scriptDir;
  }
}
