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
import { Scrip } from '../common/types';
import JavascriptParser from './parsers/JavascriptParser';

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

const parser = new JavascriptParser();

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

  static async loadScript(scriptName: string): Promise<Scrip> {
    const fileContents = await readFile(this.getScriptPath(scriptName), 'utf8');
    return parser.parse(fileContents);
  }

  static async newScript(scriptName: string) {
    return writeFile(this.getScriptPath(scriptName), parser.compose({
      scriptBody: 'console.log("hello world");',
      scriptConfigBody: JSON.stringify([
        {
          type: 'input',
          label: 'Input',
          id: 'default',
        },
        {
          type: 'output',
          label: 'Output 1',
          id: 'default',
        },
      ], null, 2),
    }), 'utf8');
  }

  static async saveScript(scriptName: string, scrip: Scrip) {
    return writeFile(this.getScriptPath(scriptName), parser.compose(scrip), 'utf8');
  }

  static getScriptPath(scriptName: string) {
    return path.resolve(scriptDir, scriptName);
  }

  static getScriptDir() {
    return scriptDir;
  }
}
