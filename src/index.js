const pg = require('pg')
const knex = require('knex')
const Errors = require('./Errors')

pg.types.setTypeParser(20, 'text', parseInt)
pg.types.setTypeParser(1700, 'text', parseFloat)

module.exports.Errors = Errors

module.exports.createTransaction = knex => {
  return new Promise(resolve => {
    return knex.transaction(resolve)
  })
}

module.exports.getKnexClient = (postgres, { min, max } = {}, connOpts = {}) => {
  return knex({
    client: 'pg',
    connection: Object.assign({}, postgres, connOpts),
    pool: { min, max },
  })
}

module.exports.getPGClient = postgres => {
  const client = new pg.Client(postgres)
  client.connect()
  return client
}
