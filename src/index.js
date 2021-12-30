#!/usr/bin/env node

'use strict';

const fs = require('node:fs');
const np = require('node:path');
const mri = require('mri');
const Data = require('./structures/Data');
const Config = require('./util/Config');
const Util = require('./util/Util');

const config = new Config(Util.getConfig());

const parsed = mri(process.argv.slice(2));
const args = {
  directory: parsed.directory ?? parsed.d ?? config.directory,
  output: parsed.output ?? parsed.o ?? config.output,
};
if (!args.output) throw new Error('--output is a required parameter.');

const directory = args.directory
  ? np.isAbsolute(args.directory)
    ? args.directory
    : np.join(process.cwd(), args.directory)
  : process.cwd();
if (np.extname(args.output) === np.basename(args.output)) {
  throw new Error('No output file location addressed in --output');
}
const outputDir = np.join(np.isAbsolute(args.output) ? args.output : np.join(process.cwd(), args.output), '..');
const outputFile = np.basename(args.output);
if (!fs.existsSync(directory)) throw new Error(`Path does not exist "${directory}"`);
if (!fs.statSync(directory).isDirectory()) throw new Error(`Path must be a directory "${directory}"`);
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const json = [];
const recurse = async path => {
  const basename = np.basename(path);
  if (basename[0] === '.') return;
  const ent = fs.statSync(path);
  if (ent.isDirectory()) {
    for (const name of fs.readdirSync(path)) await recurse(np.join(path, name));
    return;
  }
  if (!ent.isFile() || !Util.isManifest(basename)) return;
  const src = fs.readFileSync(path, { encoding: 'utf-8', flag: 'r' });
  if (src === '') {
    console.info(`Empty manifest file found at "${path}"`);
    return;
  }

  const manifest = Util.parseManifest(path, src);
  if (!manifest) return;

  const data = new Data(path);
  for (const type of ['default', 'custom']) {
    for (const fieldData of config.fields[type]) {
      const value =
        typeof fieldData.value === 'string' ? eval(fieldData.value) : fieldData.value({ manifest, config, data, path });
      const field = data.createField(fieldData.name, value);
      for (const handle of fieldData.handles) {
        for (const key in handle) {
          if (!field[key]) throw new TypeError(`Invalid handle "${key}".`);
          if (typeof field[key] !== 'function') throw new TypeError(`Handles must point to a function, got "${key}".`);
          await field[key](...handle[key]);
        }
      }
    }
  }

  json.push(data.toJSON());
};

recurse(directory)
  .then(() => {
    fs.writeFileSync(np.join(outputDir, outputFile), JSON.stringify(json), {
      encoding: 'utf-8',
      flag: 'w',
    });
  })
  .catch(e => {
    throw e;
  });
