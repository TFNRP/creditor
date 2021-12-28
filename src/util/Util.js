'use strict';

const fs = require('node:fs');
const path = require('node:path');
const lua = require('luaparse');
const yaml = require('yaml');
const Constants = require('./Constants');

class Util extends null {
  static parseManifest(src) {
    const parsed = lua.parse(src, {
      comments: false,
      luaVersion: '5.1',
    });
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

  static getConfig() {
    for (const file of ['.creditor.yaml', '.creditor.yml']) {
      const p = path.join(process.cwd(), file);
      if (fs.existsSync(p)) return yaml.parse(p);
    }
    return Constants.DefaultConfig;
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
