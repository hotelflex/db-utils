const knex = require('knex')

const createDbPool = (postgres, { min, max } = {}) =>
  knex({
    client: 'pg',
    pool: { min, max },
    postgres,
  })

const ensureDatabaseExists = async postgres => {
  const dbName = postgres.database

  const db = knex({
    client: 'pg',
    connection: Object.assign({}, postgres, { database: 'postgres' }),
    pool: { min: 1, max: 1 },
  })
  try {
    const { rowCount } = await db.raw(
      `SELECT 1 AS result FROM pg_database WHERE datname='${dbName}'`,
    )

    if (rowCount === 0) await db.raw(`CREATE DATABASE ${dbName}`)
  } finally {
    db.destroy()
  }
}

const ensureTableExists = async (tableName, tableSchema, db) => {
  const exists = await db.schema.hasTable(tableName)
  if (!exists) return db.schema.createTable(tableName, tableSchema)
}

module.exports = {
  createDbPool,
  ensureDatabaseExists,
  ensureTableExists,
}
