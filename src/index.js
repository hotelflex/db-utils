const pg = require('pg');

pg.types.setTypeParser(20, 'text', parseInt);
pg.types.setTypeParser(1700, 'text', parseFloat);

module.exports.getPGClient = (config) => {
  const client = new pg.Client(config);
  client.connect();
  return client;
}
