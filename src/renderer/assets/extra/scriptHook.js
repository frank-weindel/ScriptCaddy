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
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Writable } = require('stream');

// Original writes
const ogStdoutWrite = process.stdout.write.bind(process.stdout);
// const ogStderrWrite = process.stderr.write.bind(process.stderr);

class OutputCapture extends Writable {
  constructor(type) {
    super();
    this.type = type;
    this.output = [];
  }

  // eslint-disable-next-line class-methods-use-this
  _write(chunk, encoding, callback) {
    ogStdoutWrite(`${JSON.stringify({
      evt: this.type,
      data: chunk.toString('utf8'),
    })}\n`);
    callback();
  }
}

// Establish the global inputs and outputs
// global.inputs = JSON.parse(process.argv[2] || process.argv[1]);
// global.outputs = {};

Object.defineProperty(global, 'inputs', {
  value: JSON.parse(process.argv[2] || process.argv[1]),
  writable: false,
});

Object.defineProperty(global, 'outputs', {
  value: {},
  writable: false,
});

Object.defineProperty(global, 'input', {
  get() {
    return global.inputs.default;
  },
  set(v) {
    global.inputs.default = v;
  },
});

Object.defineProperty(global, 'output', {
  get() {
    return global.outputs.default;
  },
  set(v) {
    global.outputs.default = v;
  },
});

const stdoutCapture = new OutputCapture('stdout');
const stderrCapture = new OutputCapture('stderr');

// Hook stdout and stderr and capture their outputs
process.stdout.write = stdoutCapture.write.bind(stdoutCapture);
process.stderr.write = stderrCapture.write.bind(stderrCapture);

// Write out captured output on exit
process.on('exit', () => {
  ogStdoutWrite(`${JSON.stringify({
    evt: 'final',
    outputs: global.outputs,
  })}\n`);
});
