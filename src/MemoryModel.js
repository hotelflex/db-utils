const _ = require('lodash')
const moment = require('moment')
const Id = require('@hotelflex/id')
const Errors = require('./Errors')

class MemoryModel {
  static configure() {
    this.ops = {}
    this.table = {}
  }

  get docs() {
    return Object.keys(this.table).map(k => this.table[k])
  }

  get ops() {
    return Object.keys(this.ops).map(k => this.ops[k])
  }

  insert(data, opts = {}) {
    const transactionId = opts.transactionId || Id.create()
    const operationId = opts.operationId || Id.create()
    const messages = opts.messages || []
    const now = moment.utc().format('YYYY-MM-DDTHH:mm:ss')

    data.version = 0
    data.createdAt = now

    if (this.opts[operationId]) throw new Errors.DuplicateOperation()
    if (this.table[data.id]) throw new Errors.WriteFailure()

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

    this.ops[op.id] = op
    this.docs[doc.id] = data

    return data
  }

  update(doc, data, opts = {}) {
    const transactionId = opts.transactionId || Id.create()
    const operationId = opts.operationId || Id.create()
    const messages = opts.messages || []
    const now = moment.utc().format('YYYY-MM-DDTHH:mm:ss')

    data.version = doc.version + 1
    data.updatedAt = now

    if (this.opts[operationId]) throw new Errors.DuplicateOperation()
    if (!this.table[data.id]) throw new Errors.WriteFailure()

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

    this.ops[op.id] = op

    const newDoc = Object.assign({}, doc, data)
    this.docs[doc.id] = newDoc

    return newDoc
  }

  delete(id) {
    delete this.docs[id]
  }
}

module.exports = MemoryModel
