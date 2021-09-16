const logger = require('../logger')


exports.handle_server_error = async (error, req) => {
  return new Promise(async (resolve, reject) => {
    try {
      let errorMessage = error.message !== '' ? JSON.stringify(error.message) : error.msg !== '' ? JSON.stringify(error.message) : 'Error not identified'
      logger.error(`Endpoint - ${req.originalUrl}[${req.method}]- Error : {message : ${errorMessage}, stack : ${JSON.stringify(error.stack)}}`)
      let errorObj;
      if (!error.errorType || error.errorType !== 'API.Error') {
        errorObj = {
          error: 'Internal Server Error',
          code: error.status ? parseInt(error.status) : 500,
          errorCode: "INTERNAL_SERVER_ERROR",
          message: error.message,
          Endpoint: req.originalUrl
        }
      }
      if (error.errorType && error.errorType === 'API.Error') {
        errorObj = {
          error: error.errorType,
          code: parseInt(error.ec.status),
          errorCode: error.ec.errorCode,
          message: error.msg,
          Endpoint: req.originalUrl
        }
      }
      return resolve(errorObj)
    } catch (error) {
      return reject({
        error: 'Internal Server Error',
        code: error.status ? parseInt(error.status) : 500,
        errorCode: "INTERNAL_SERVER_ERROR",
        message: error.message,
        Endpoint: req.originalUrl
      })
    }
  })
}

exports.buildSuccess = (payload) => {
  return { status: "SUCCESS", ...payload };
}

exports.buildFailed = (payload) => {
  return { status: "FAILED", ...payload };
}

exports.GAME_NOT_FOUND = {
  status: 503,
  errorCode: "GAME_NOT_FOUND",
  errorMessage: "Game not found right now",
}

exports.FINISHED_GAME = {
  status: 400,
  errorCode: "FINISHED_GAME",
  errorMessage: "Its a completed game!",
}

exports.INVALID_MOVE = {
  status: 400,
  errorCode: "INVALID_MOVE",
  errorMessage: "Move not possible",
}