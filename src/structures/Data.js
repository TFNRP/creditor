'use strict';

const Field = require('./Field');

class Data {
  constructor(path) {
    this.path = path;
    this.fields = {};
  }

  createField(name, value) {
    this.fields[name] = new Field(this, name, value);
    return this.fields[name];
  }

  toJSON() {
    const json = {};
    for (const key of Object.keys(this.fields)) {
      json[key] = this.fields[key].value;
    }
    return json;
  }
}

module.exports = Data;
