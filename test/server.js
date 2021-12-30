const path = require('node:path');

module.exports = {
  hostname: 'localhost',
  port: '3621',
  webPath: path.join(__dirname, '../html'),
  logLevel: 'debug',
};