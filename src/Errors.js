const util = require('util')

function DuplicateOperation(message) {
  Error.captureStackTrace(this, this.constructor)

  this.name = this.constructor.name
  this.message = message || ''
}

function WriteFailure(message) {
  Error.captureStackTrace(this, this.constructor)

  this.name = this.constructor.name
  this.message = message || ''
}

util.inherits(DuplicateOperation, Error)
util.inherits(WriteFailure, Error)

module.exports = {
  DuplicateOperation,
  WriteFailure,
}
