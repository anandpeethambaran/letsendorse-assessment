module.exports = class APIError extends Error {
  constructor(ec, msg) {
    super(`${ec.errorCode}: ${msg}`);
    this.errorType = "API.Error";
    this.ec = ec;
    this.msg = msg ? msg : ec.errorMessage;
  }
}