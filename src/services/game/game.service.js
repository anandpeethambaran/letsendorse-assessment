const logger = require('../../logger');
const { handle_server_error, buildSuccess, GAME_NOT_FOUND, FINISHED_GAME } = require('../../utils/handleError');
const game = require('../../models/game.model')
const APIError = require('../../utils/Error.class');
const { makePlayerMove, makeComputerMove } = require('../../hooks/game');


exports.startNewGame = async (req, res) => {
  logger.info(`Endpoint - ${req.originalUrl} [${req.method}]`)
  try {
    let { host, challenger, type } = req.body
    if (type === "COMPUTER") {
      challenger = "COMPUTER"
    }
    let gameId = await check_and_create_unique_id();
    let board = [
      ['', '', ''],
      ['', '', ''],
      ['', '', '']
    ];
    let gameData = {
      host,
      challenger,
      gameId,
      type,
      data: {
        board
      }
    }
    let newGame = new game(gameData)
    await newGame.save();
    return res.status(200).json(buildSuccess({ message: 'new game created', game: gameData }));
  } catch (error) {
    let serverError = await handle_server_error(error, req);
    return res.status(serverError.code).json(serverError);
  }
}

exports.joinGame = async (req, res) => {
  logger.info(`Endpoint - ${req.originalUrl} [${req.method}]`)
  try {
    let { id } = req.params
    let gameData = await game.findOne({ gameId: id })
    if (!gameData) {
      throw new APIError(GAME_NOT_FOUND)
    }
    return res.status(200).json(buildSuccess({ game: gameData }))
  } catch (error) {
    let serverError = await handle_server_error(error, req);
    return res.status(serverError.code).json(serverError);
  }
}

exports.makeMovement = async (req, res) => {
  logger.info(`Endpoint - ${req.originalUrl} [${req.method}]`)
  try {
    let { id } = req.params
    let { posX, posY, move } = req.body
    posX = parseInt(posX)
    posY = parseInt(posY)
    let gameData = await game.findOne({ gameId: id })
    if (!gameData) {
      throw new APIError(GAME_NOT_FOUND)
    }
    if (gameData.data && gameData.data.winner) {
      throw new APIError(FINISHED_GAME)
    }
    let change = await makePlayerMove(gameData, move, posX, posY)
    gameData = change
    if (gameData.type === "COMPUTER" && checkFieldsLeft(gameData.data.board)) {
      let computerMove = move === 'X' ? 'O' : 'X'
      let computerChange = await makeComputerMove(gameData, computerMove)
      gameData = computerChange
    }
    let updateObj = {
      data: gameData.data
    }
    let result = await checkWinner(gameData.data.board);
    if (result !== null) {
      updateObj.data['winner'] = result
      updateObj["winner"] = result !== 'tie' ? `${result} wins the game` : `Game tie!`
    }
    await game.updateOne({ gameId: id }, { data: updateObj.data })
    gameData['data'] = updateObj.data
    return res.status(200).json(buildSuccess({ game: gameData }))
  } catch (error) {
    let serverError = await handle_server_error(error, req);
    return res.status(serverError.code).json(serverError);
  }
}

const check_and_create_unique_id = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let id = Math.floor(Math.random() * 90000) + 10000;
      let count = await game.countDocuments({ gameId: id })
      if (count !== 0) {
        check_and_create_unique_id()
      } else {
        return resolve(id)
      }
    } catch (error) {
      reject(error)
    }
  })
}

function checkFieldsLeft(board) {
  let openSpots = 0;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i][j] == '') {
        openSpots++;
      }
    }
  }
  if (openSpots !== 0) {
    return true
  }
  return false
}

const final = (a, b, c) => {
  return a == b && b == c && a != '';
}

const checkWinner = (board) => {
  return new Promise(async (resolve, reject) => {
    try {
      let winner = null;

      for (let i = 0; i < 3; i++) {
        if (final(board[i][0], board[i][1], board[i][2])) {
          winner = board[i][0];
        }
      }

      for (let i = 0; i < 3; i++) {
        if (final(board[0][i], board[1][i], board[2][i])) {
          winner = board[0][i];
        }
      }

      if (final(board[0][0], board[1][1], board[2][2])) {
        winner = board[0][0];
      }
      if (final(board[2][0], board[1][1], board[0][2])) {
        winner = board[2][0];
      }

      let openSpots = 0;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (board[i][j] == '') {
            openSpots++;
          }
        }
      }

      if (winner == null && openSpots == 0) {
        resolve('tie');
      } else {
        resolve(winner);
      }
    } catch (error) {
      reject(error)
    }
  })

}
