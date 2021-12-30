'use strict';

const fs = require('node:fs');
const path = require('node:path');
const lua = require('luaparse');
const yaml = require('yaml');
const Constants = require('./Constants');

class Util extends null {
  static parseManifest(file, src) {
    if (path.extname(file) === '.lua') return Util.parseLua(file, src);
    return Util.parseYaml(file, src);
  }

  static parseLua(file, src) {
    let parsed;
    try {
      parsed = lua.parse(src, {
        comments: false,
        luaVersion: '5.1',
      });
    } catch (e) {
      console.error(`${e.name}: ${e.message} whilst parsing ${path.relative(process.cwd(), file)}`);
      return null;
    }
    const object = {};
    for (const item of parsed.body) {
      switch (item.type) {
        case 'CallStatement': {
          switch (item.expression.type) {
            case 'StringCallExpression': {
              switch (item.expression.base.type) {
                case 'StringCallExpression': {
                  if (
                    item.expression.base.base.type === 'Identifier' &&
                    item.expression.argument.type === 'StringLiteral' &&
                    item.expression.base.argument.type === 'StringLiteral'
                  ) {
                    if (!object[item.expression.base.base.name]) object[item.expression.base.base.name] = {};
                    if (
                      ["'", '"'].includes(Util.arrayAt(item.expression.base.argument.raw, 0)) &&
                      ["'", '"'].includes(Util.arrayAt(item.expression.base.argument.raw, -1))
                    ) {
                      item.expression.base.argument.raw = item.expression.base.argument.raw.slice(1, -1);
                    }
                    if (
                      ["'", '"'].includes(Util.arrayAt(item.expression.argument.raw, 0)) &&
                      ["'", '"'].includes(Util.arrayAt(item.expression.argument.raw, -1))
                    ) {
                      item.expression.argument.raw = item.expression.argument.raw.slice(1, -1);
                    }
                    object[item.expression.base.base.name] = item.expression.argument.raw;
                  }
                  break;
                }
                case 'Identifier': {
                  if (item.expression.argument.type === 'StringLiteral') {
                    if (!object[item.expression.base.name]) object[item.expression.base.name] = {};
                    if (
                      ["'", '"'].includes(Util.arrayAt(item.expression.argument.raw, 0)) &&
                      ["'", '"'].includes(Util.arrayAt(item.expression.argument.raw, -1))
                    ) {
                      item.expression.argument.raw = item.expression.argument.raw.slice(1, -1);
                    }
                    object[item.expression.base.name] = item.expression.argument.raw;
                  }
                  break;
                }
              }
              break;
            }

            case 'TableCallExpression': {
              if (
                item.expression.base.type === 'Identifier' &&
                item.expression.arguments.type === 'TableConstructorExpression'
              ) {
                if (!object[item.expression.base.name]) object[item.expression.base.name] = {};
                for (const field of item.expression.arguments.fields) {
                  switch (field.type) {
                    case 'TableValue': {
                      if (field.value.type === 'StringLiteral') {
                        if (
                          ["'", '"'].includes(Util.arrayAt(field.value.raw, 0)) &&
                          ["'", '"'].includes(Util.arrayAt(field.value.raw, -1))
                        ) {
                          field.value.raw = field.value.raw.slice(1, -1);
                        }

                        object[item.expression.base.name] = field.value.raw;
                      }
                      break;
                    }
                  }
                }
              }
              break;
            }
          }
          break;
        }
      }
    }

    return object;
  }

  static parseYaml(file, src) {
    let data;
    try {
      data = yaml.parse(src);
    } catch (e) {
      console.error(
        `YamlError: ${e.message}${
          e.source?.resolved?.value ? ` near "${e.source.resolved.value}"` : ''
        } whilst parsing ${path.relative(process.cwd(), file)}`,
      );
      return null;
    }
    return data;
  }

  static getConfig() {
    var filepath;
    if (['.creditor.yaml', '.creditor.yml'].some(p => fs.existsSync((filepath = path.join(process.cwd(), p))))) {
      const data = Util.parseYaml(filepath);
      if (data) return data;
    }
    if (['.creditor.json', '.creditor.js'].some(p => fs.existsSync((filepath = path.join(process.cwd(), p))))) {
      return require(filepath);
    }
    return Constants.DefaultConfig;
  }

  static isManifest(filename) {
    if (/^(fx)?manifest(.+)?\.((lua)|(ya?ml))$/i.test(filename) || filename === '__resource.lua') return true;
    return false;
  }

  // Polyfill for Array.prototype.at
  static arrayAt(array, n) {
    n = Math.trunc(n) || 0;
    if (n < 0) n += array.length;
    if (n < 0 || n >= array.length) return undefined;
    return array[n];
  }
}

module.exports = Util;
