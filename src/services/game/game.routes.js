const router = require('express').Router();
const { joinGame, startNewGame } = require('./game.service')


router.post('/new-game', startNewGame)
router.post('/join-game', joinGame)

module.exports = router;