function DuplicateOperation(message) {
  Error.captureStackTrace(this, this.constructor)

  this.name = this.constructor.name
  this.message = message
}

function WriteFailure(message) {
  Error.captureStackTrace(this, this.constructor)

  this.name = this.constructor.name
  this.message = message
}

require('util').inherits(module.exports, Error)

module.exports = {
  DuplicateOperation,
  WriteFailure,
}
