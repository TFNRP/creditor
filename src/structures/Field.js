'use strict';

const np = require('node:path');
const { URL } = require('node:url');
const fetch = require('node-fetch');

/** Helper class for field data */
class Field {
  constructor(data, name, value) {
    this.data = data;
    this.name = name;
    this.value = value;
  }

  verifyType(...expected) {
    const type = typeof (this.value ?? undefined);
    if (!expected.includes(type)) {
      console.warn(
        `Expected ${expected.join(', ')} for field ${this.name}, got "${type}" for "${np.relative(
          process.cwd(),
          this.data.path,
        )}"`,
      );
      this.value = null;
    }
    return this;
  }

  verifyUrl(...hostname) {
    if (typeof this.value === 'string') {
      let url;
      try {
        url = new URL(/^https?:\/\//i.test(this.value) ? this.value : `https://${this.value}`);
        if (hostname.length > 0 && !hostname.includes(url.hostname.replace(/^www\./i, ''))) {
          console.warn(`Manifest contains incorrect ${this.name} url "${np.relative(process.cwd(), this.data.path)}"`);
        }
        this.value = `https://${url.hostname}${url.pathname}`;
      } catch (e) {
        if (e.code === 'ERR_INVALID_URL') {
          console.error(
            `Manifest contains invalid url in field ${this.name} "${np.relative(process.cwd(), this.data.path)}"`,
          );
        } else {
          console.error(e);
          process.exit(1);
        }
      }
    }
    return this;
  }

  async fetchRepositoryData() {
    if (this.value) {
      this.value = { url: this.value };
      const url = new URL(this.value.url);
      switch (url.hostname.replace(/^www\./i, '')) {
        case 'github.com': {
          const res = await fetch(`https://api.github.com/repos${url.pathname}`, {
            method: 'get',
          });
          if (res.status === 200) {
            const data = await res.json();
            if (data.license) this.value.license = data.license.name;
            if (data.owner) this.owner = data.owner.login;
            if (!this.data.fields.name.value) this.data.fields.name.value = data.name;
          }
          break;
        }
      }
    }
    return this;
  }

  parseEmail() {
    if (typeof this.value === 'string' && !this.data.fields.contact.value) {
      const matched = this.value.match(/<(\w+@\w+\.\w+)>/i) ?? this.value.match(/(\w+@\w+\.\w+)/i);
      if (matched) {
        if (matched.index === 0) this.value = this.value.slice(matched[0].length).trim();
        else this.value = this.value.slice(0, matched.index).trim();
        this.data.fields.contact.value = matched[1];
      }
    }
    return this;
  }
}

module.exports = Field;
