const _ = require('lodash')
const moment = require('moment')
const Id = require('@hotelflex/id')
const Errors = require('./Errors')

class MemoryModel {
  constructor() {
    this.opsT = {}
    this.docsT = {}
  }

  get ops() {
    return Object.keys(this.opsT).map(k => this.opsT[k])
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

    if (this.opsT[operationId]) throw new Errors.DuplicateOperation()
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

    this.opsT[op.id] = op
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

    if (this.opsT[operationId]) throw new Errors.DuplicateOperation()
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

    this.opsT[op.id] = op

    const cDoc = this.docsT[doc.id]
    const newDoc = Object.assign({}, cDoc, data)
    this.docsT[doc.id] = newDoc

    return newDoc
  }

  delete(id) {
    delete this.docsT[id]
  }

  reset() {
    this.opsT = {}
    this.docsT = {}
  }
}

module.exports = MemoryModel
