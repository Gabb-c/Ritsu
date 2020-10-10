const { GameService } = require('../services/GameService')
const { Command } = require('../structures/Command')

module.exports = class Start extends Command {
  constructor(client) {
    super(client, {
      name: 'start',
      aliases: [],
      requiredPermissions: null,
      dev: false,
    })
  }

  async run({ message, args }) {
    const gameService = new GameService(message)
    gameService.init()
  }
}
