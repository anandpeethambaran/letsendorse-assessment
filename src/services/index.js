const games = require('./game/game.routes')


module.exports = (app) => {
  app.use('/game', games);
}