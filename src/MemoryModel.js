const _ = require('lodash')
const moment = require('moment')
const Id = require('@hotelflex/id')
const Errors = require('./Errors')

let opsT = {}

class MemoryModel {
  constructor() {
    this.docsT = {}
  }

  static get ops() {
    return Object.keys(opsT).map(k => opsT[k])
  }

  static insertOp(opts = {}) {
    const transactionId = opts.transactionId || Id.create()
    const operationId = opts.operationId || Id.create()
    const messages = opts.messages || []
    const now = moment.utc().format('YYYY-MM-DDTHH:mm:ss')

    if (opsT[operationId]) throw new Errors.DuplicateOperation()

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

    opsT[op.id] = op
    return op
  }

  get docs() {
    return Object.keys(this.docsT).map(k => this.docsT[k])
  }

  insert(data, opts = {}) {
    const transactionId = opts.transactionId || Id.create()
    const operationId = opts.operationId || Id.create()
    const messages = opts.messages || []
    const now = moment.utc().format('YYYY-MM-DDTHH:mm:ss')

    data.version = 0
    data.createdAt = now

    if (opsT[operationId]) throw new Errors.DuplicateOperation()
    if (this.docsT[data.id]) throw new Errors.WriteFailure()

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

    opsT[op.id] = op
    this.docsT[data.id] = data

    return data
  }

  update(doc, data, opts = {}) {
    const transactionId = opts.transactionId || Id.create()
    const operationId = opts.operationId || Id.create()
    const messages = opts.messages || []
    const now = moment.utc().format('YYYY-MM-DDTHH:mm:ss')

    data.version = doc.version + 1
    data.updatedAt = now

    if (opsT[operationId]) throw new Errors.DuplicateOperation()
    if (!this.docsT[doc.id]) throw new Errors.WriteFailure()

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

    opsT[op.id] = op

    const newDoc = Object.assign({}, doc, data)
    this.docsT[doc.id] = newDoc
    return newDoc
  }

  delete(id) {
    delete this.docsT[id]
  }

  reset() {
    opsT = {}
    this.docsT = {}
  }
}

module.exports = MemoryModel
