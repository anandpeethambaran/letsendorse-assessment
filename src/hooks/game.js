const { INVALID_MOVE } = require("../utils/handleError");
const gameModel = require('../models/game.model');
const APIError = require('../utils/Error.class')

let computerVal, playerVal, board;

exports.makePlayerMove = (game, move, posX, posY) => {
  return new Promise(async (resolve, reject) => {
    try {
      let { lastPlayer } = game.data
      if ((lastPlayer && lastPlayer === move) || game.data.board[posX][posY] !== '') {
        throw new APIError(INVALID_MOVE)
      }
      if (!lastPlayer || (lastPlayer && lastPlayer !== move && game.data.board[posX][posY] === '')) {
        game.data["lastPlayer"] = move
        game.data.board[posX][posY] = move
        resolve(game)
      }
    } catch (error) {
      reject(error)
    }
  })
}

exports.makeComputerMove = (game, computerMove) => {
  return new Promise((resolve, reject) => {
    try {
      let { lastPlayer } = game.data
      if (lastPlayer && lastPlayer === computerMove) {
        throw new APIError(INVALID_MOVE)
      }
      board = game.data.board;
      computerVal = computerMove === 'X' ? 'X' : 'O'
      playerVal = computerMove === 'X' ? 'O' : 'X'
      let computerNext = computerMovement()
      if (computerNext) {
        game.data["lastPlayer"] = computerMove
        game.data.board = board
        resolve(game)
      }
    } catch (error) {
      reject(error)
    }
  })
}

function computerMovement() {
  let bestScore = -Infinity;
  let move;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i][j] == '') {
        board[i][j] = computerVal;
        let score = minimax(board, 0, false);
        board[i][j] = '';
        if (score > bestScore) {
          bestScore = score;
          move = { i, j };
        }
      }
    }
  }
  if (move) {
    board[move.i][move.j] = computerVal;
    return true
  }

}

let scores = {
  X: 10,
  O: -10,
  tie: 0
};

function minimax(board, depth, isMaximizing) {
  let result = checkWinner();
  if (result !== null) {
    return scores[result];
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] == '') {
          board[i][j] = computerVal;
          let score = minimax(board, depth + 1, false);
          board[i][j] = '';
          bestScore = Math.max(score, bestScore);
        }
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] == '') {
          board[i][j] = playerVal;
          let score = minimax(board, depth + 1, true);
          board[i][j] = '';
          bestScore = Math.min(score, bestScore);
        }
      }
    }
    return bestScore;
  }
}

function final(a, b, c) {
  return a == b && b == c && a != '';
}

function checkWinner() {
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
    return 'tie';
  } else {
    return winner;
  }
}