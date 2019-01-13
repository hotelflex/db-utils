const _ = require('lodash')
const moment = require('moment')
const { Model, transaction } = require('objection')
const Id = require('@hotelflex/id')
const Errors = require('./Errors')

class Op extends Model {
  static get tableName() {
    return 'operations'
  }
}

class PGModel extends Model {
  static configure(db) {
    this.knex(db)
    this.configured = true
  }

  $parseDatabaseJson(json) {
    const pJson = super.$parseDatabaseJson(json)
    pJson.createdAt = moment(pJson.createdAt).format('YYYY-MM-DDTHH:mm:ss')
    if (pJson.updatedAt)
      pJson.updatedAt = moment(pJson.updatedAt).format('YYYY-MM-DDTHH:mm:ss')
    return _.omitBy(pJson, _.isNil)
  }

  static async insertOp({ transactionId, operationId, messages = [] } = {}) {
    if (!this.configured)
      throw new Error('Model has not been connected to database.')
    transactionId = transactionId || Id.create()
    operationId = operationId || Id.create()

    const now = moment.utc().format('YYYY-MM-DDTHH:mm:ss')

    const op = {
      id: operationId,
      timestamp: now,
    }
    if (messages.length > 0) {
      const mStr = JSON.stringify(
        messages.map((m, i) => ({
          id: Id.create(),
          topic: m.topic,
          body: m.body,
          timestamp: now,
          operationId: Id.create(operationId + i),
          transactionId,
        })),
      )
      op.messages = mStr
      op.committed = false
    } else {
      op.committed = true
    }

    try {
      await Op.query(this.knex()).insert(op)
    } catch (err) {
      if (err.message.indexOf('operations_pkey') !== -1) {
        throw new Errors.DuplicateOperation()
      } else {
        throw new Errors.WriteFailure(err.message)
      }
    }

    return op
  }

  static async insert(
    data,
    { transactionId, operationId, messages = [] } = {},
  ) {
    if (!this.configured)
      throw new Error('Model has not been connected to database.')
    transactionId = transactionId || Id.create()
    operationId = operationId || Id.create()

    const now = moment.utc().format('YYYY-MM-DDTHH:mm:ss')

    data.version = 0
    data.createdAt = now
    const trx = await transaction.start(this.knex())

    const op = {
      id: operationId,
      timestamp: now,
    }
    if (messages.length > 0) {
      const mStr = JSON.stringify(
        messages.map((m, i) => ({
          id: Id.create(),
          topic: m.topic,
          body: m.body,
          timestamp: now,
          operationId: Id.create(operationId + i),
          transactionId,
        })),
      )
      op.messages = mStr
      op.committed = false
    } else {
      op.committed = true
    }

    try {
      await Op.query(trx).insert(op)

      const doc = await this.query(trx)
        .insert(data)
        .returning('*')

      await trx.commit()
      return doc
    } catch (err) {
      await trx.rollback()
      if (err.message.indexOf('operations_pkey') !== -1) {
        throw new Errors.DuplicateOperation()
      } else {
        throw new Errors.WriteFailure(err.message)
      }
    }
  }

  static async update(
    doc,
    data,
    { transactionId, operationId, messages = [] } = {},
  ) {
    if (!this.configured)
      throw new Error('Model has not been connected to database.')
    transactionId = transactionId || Id.create()
    operationId = operationId || Id.create()

    const now = moment.utc().format('YYYY-MM-DDTHH:mm:ss')

    data.version = doc.version + 1
    data.updatedAt = now
    const trx = await transaction.start(this.knex())

    const op = {
      id: operationId,
      timestamp: now,
    }
    if (messages.length > 0) {
      const mStr = JSON.stringify(
        messages.map((m, i) => ({
          id: Id.create(),
          topic: m.topic,
          body: m.body,
          timestamp: now,
          operationId: Id.create(operationId + i),
          transactionId,
        })),
      )
      op.messages = mStr
      op.committed = false
    } else {
      op.committed = true
    }

    try {
      await Op.query(trx).insert(op)

      const affectedRows = await this.query(trx)
        .update(data)
        .where({ id: doc.id, version: doc.version })
      if (affectedRows !== 1) throw Error('Version mismatch.')

      await trx.commit()
      return Object.assign({}, doc, data)
    } catch (err) {
      await trx.rollback()
      if (err.message.indexOf('operations_pkey') !== -1) {
        throw new Errors.DuplicateOperation()
      } else {
        throw new Errors.WriteFailure(err.message)
      }
    }
  }

  static async delete(id) {
    const affectedRows = await this.query().deleteById(id)
    if (affectedRows !== 1)
      throw Errors.WriteFailure(`Doc with id ${id} could not be deleted.`)
  }
}

module.exports = PGModel
