const router = require('express').Router();
const { joinGame, startNewGame, makeMovement } = require('./game.service')


router.post('/new-game', startNewGame)
router.get('/join-game/:id', joinGame)
router.post('/movement/:id', makeMovement)

module.exports = router;