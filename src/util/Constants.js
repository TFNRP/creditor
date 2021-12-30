'use strict';

const np = require('node:path');

exports.DefaultConfig = {
  fields: {
    default: [
      {
        name: 'id',
        value: ({ path }) => np.basename(np.join(path, '..')).toLowerCase(),
        handles: [{ verifyType: ['string', 'undefined'] }],
      },
      {
        name: 'name',
        value: ({ manifest, data }) => manifest.name ?? data.fields.id.value,
        handles: [{ verifyType: ['string', 'undefined'] }],
      },
      {
        name: 'contact',
        value: ({ manifest }) => manifest.contact,
        handles: [{ verifyType: ['string', 'undefined'] }],
      },
      {
        name: 'author',
        value: ({ manifest, config }) => manifest.author ?? config.defaultauthor,
        handles: [{ verifyType: ['string', 'undefined'] }, 'parseEmail'],
      },
      {
        name: 'version',
        value: ({ manifest }) => manifest.version,
        handles: [{ verifyType: ['string', 'number', 'undefined'] }],
      },
      {
        name: 'description',
        value: ({ manifest }) => manifest.description ?? manifest.about,
        handles: [{ verifyType: ['string', 'undefined'] }],
      },
      {
        name: 'usage',
        value: ({ manifest }) => manifest.usage,
        handles: [{ verifyType: ['string', 'undefined'] }],
      },
      {
        name: 'download',
        value: ({ manifest }) => manifest.download,
        handles: [{ verifyType: ['string', 'undefined'] }, 'verifyUrl'],
      },
      {
        name: 'gta5mods',
        value: ({ manifest }) => manifest['gta5-mods'] ?? manifest.gta5mods,
        handles: [{ verifyType: ['string', 'undefined'] }, { verifyUrl: 'gta5-mods.com' }],
      },
      {
        name: 'private',
        value: ({ manifest }) => manifest.private,
        handles: [{ verifyType: ['string', 'boolean', 'undefined'] }],
      },
      {
        name: 'repository',
        value: ({ manifest, data }) => (data.fields.private.value ? null : manifest.repository),
        handles: [
          { verifyType: ['string', 'undefined'] },
          { verifyUrl: ['github.com', 'gitlab.com'] },
          'fetchRepositoryData',
        ],
      },
    ],
    custom: [],
    remove: [],
  },
};
