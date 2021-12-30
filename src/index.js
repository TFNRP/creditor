#!/usr/bin/env node

'use strict';

const fs = require('node:fs');
const np = require('node:path');
const mri = require('mri');
const Data = require('./structures/Data');
const Util = require('./util/Util');

const config = Util.getConfig();

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

  const result = Util.parseManifest(path, src);
  if (!result) return;

  const data = new Data(path);
  data.createField('id', np.basename(np.join(path, '..')).toLowerCase()).verifyType('string', 'undefined');
  data.createField('name', result.name ?? data.fields.id.value).verifyType('string', 'undefined');
  data.createField('contact', result.contact).verifyType('string', 'undefined');
  data
    .createField('author', result.author ?? config.defaultAuthor)
    .verifyType('string')
    .parseEmail();
  data.createField('version', result.version).verifyType('string', 'number', 'undefined');
  data.createField('description', result.description ?? result.about).verifyType('string', 'undefined');
  data.createField('usage', result.usage).verifyType('string', 'undefined');
  data.createField('download', result.download).verifyType('string', 'undefined').verifyUrl();
  data
    .createField('gta5mods', result['gta5-mods'] ?? result.gta5mods)
    .verifyType('string', 'undefined')
    .verifyUrl('gta5-mods.com');
  await data
    .createField('repository', result.repository)
    .verifyType('string', 'undefined')
    .verifyUrl('github.com', 'gitlab.com')
    .fetchRepositoryData();

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
