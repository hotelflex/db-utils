class DuplicateOperation extends Error {
  constructor() {
    super()

    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

class WriteFailure extends Error {
  constructor() {
    super()

    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = {
  DuplicateOperation,
  WriteFailure,
}
