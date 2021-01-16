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
import fs from 'fs';

/**
 * Check if a path exists and is a directory
 *
 * This will throw an error if the path exists and is not a directory
 *
 * @param {string} path Path to check
 * @return {boolean} true if it exists and is a directory, false if it doesn't exist
 */
export function dirExistsSync(path: string) {
  try {
    if (fs.statSync(path).isDirectory()) {
      return true;
    }
  } catch (err) {
    // If it just doesn't exist, then just return false
    if (err.code === 'ENOENT') {
      return false;
    }

    // Otherwise its something else, rethrow
    throw err;
  }
  throw new Error(`Path exists but isn't a directory: ${path}`);
}

/**
 * Ensures a path exists, and is a directory.
 *
 * Only works with one level of directory creation right now.
 *
 * This will throw an error if the directory could not be created.
 *
 * @param {string} path
 * @return {boolean} true if directory was newly created, false if it didn't need to be
 */
export function ensureDirSync(path: string) {
  if (dirExistsSync(path)) {
    return false;
  }
  fs.mkdirSync(path);
  return true;
}
