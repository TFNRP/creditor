'use strict';

/** Wrapper class for config data */
class Config {
  constructor(options) {
    this.defaultauthor = options.defaultauthor ?? null;
    this.directory = options.directory ?? null;
    this.output = options.output ?? null;
    this.fields = {
      /**
       * Default fields
       * @type {Array<Field>}
       */
      default: [],
      /**
       * Custom fields from the user
       * @type {Array<Field>}
       */
      custom: [],
      /**
       * Fields to discard before use
       * @type {Array<string>}
       */
      remove: [],
    };

    let fieldIds = {};
    for (const type of ['default', 'custom']) {
      for (const field of options.fields[type]) {
        const validatd = Config.validateField(field);
        if (fieldIds[validatd.name]) {
          this.fields[type][fieldIds[validatd.name]] = validatd;
        } else {
          fieldIds[validatd.name] = this.fields[type].push(validatd) - 1;
        }
      }
    }
    for (const remove of options.fields.remove) {
      if (typeof remove !== 'string') throw new TypeError(`remove expected type string, got "${typeof remove}".`);
      if (fieldIds[remove]) {
        for (const type of ['default', 'custom']) {
          if (this.fields[type][fieldIds[remove]]) {
            this.fields[type].splice(fieldIds[remove], 1);
            break;
          }
        }
      }
    }
  }

  /**
   * Validate field data
   * @param {Field} field The field data to validate
   * @returns {Field}
   */
  static validateField(field) {
    if (typeof field.name !== 'string') {
      throw new TypeError(`field.name expected type string, got "${typeof field.name}".`);
    }
    if (!/^[a-z0-9_-]+$/i.test(field.name)) {
      throw new TypeError(`field.name must comply with the following pattern: /^[a-z0-9_-]+$/i`);
    }
    if (typeof field.value === 'undefined' || field.value === null) field.value = `manifest['${field.name}']`;
    if (!['string', 'function'].includes(typeof field.value)) {
      throw new TypeError(`field.value expected type string or function, got "${typeof field.value}".`);
    }
    if (!Array.isArray(field.handles) && typeof field.handles !== 'undefined' && field.handles !== null) {
      throw new TypeError(`field.handles expected type array, undefined or null, got "${typeof field.handles}".`);
    }
    if (field.handles) {
      for (let i = 0; i < field.handles.length; i++) {
        const handle = field.handles[i];
        if (typeof handle === 'string') {
          field.handles[i] = { [handle]: [] };
        } else if (typeof handle === 'object' && handle !== null) {
          for (const key in handle) {
            // @ts-ignore
            if (typeof handle[key] === 'string') handle[key] = [handle[key]];
            if (!Array.isArray(handle[key])) {
              throw new TypeError(`field.handles[${i}].${key} expected type array, got "${typeof handle[key]}".`);
            }
          }
        } else {
          throw new TypeError(`field.handles[${i}] expected type string or object, got "${typeof handle}".`);
        }
      }
    }

    return field;
  }
}

/**
 * Field data
 * @typedef {Object} Field
 * @property {string} name
 * @property {string|function} value
 * @property {Array<Handler>|undefined|null} handles
 */

/**
 * @typedef {Object<string, Array<string>>} Handler
 */

module.exports = Config;
