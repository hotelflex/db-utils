const pg = require('pg')
pg.types.setTypeParser(20, 'text', parseInt)

const knex = require('knex')
const PGModel = require('./PGModel')
const MemoryModel = require('./MemoryModel')
const Errors = require('./Errors')

function createDbPool(postgres, { min, max } = {}) {
  return knex({
    client: 'pg',
    connection: postgres,
    pool: { min, max },
  })
}

function createDbConn(postgres) {
  const client = pg.Client(postgres)
  client.connect()
  return client
  return knex({
    client: 'pg',
    connection: postgres,
  })
}

module.exports = {
  createDbPool,
  createDbConn,
  PGModel,
  MemoryModel,
  Errors,
}
