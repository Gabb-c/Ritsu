const { MessageEmbed } = require('discord.js')
const { Users } = require('../../models/User')
const { Command } = require('../../structures/Command')
const { Constants } = require('../../utils/constants')

module.exports = class Leaderboard extends Command {
  constructor(client) {
    super(client, {
      name: 'leaderboard',
      aliases: ['rank', 'scoreboard', 'top'],
      description: 'Show the global leaderboard/rank.',
      requiredPermissions: null,
      dev: false,
    })
    this.client = client
  }
  /**
   * Run
   * @param {Object} run
   * @param {Message} run.message
   */
  async run({ message }, guild, t) {
    const embed = new MessageEmbed()
    embed.setAuthor(
      t('commands:leaderboard.embedAuthor'),
      message.author.displayAvatarURL()
    )
    embed.setColor(Constants.EMBED_COLOR)
    // Take all users from the database of won matches and use only 10 of them.
    await Users.find()
      .sort({ level: -1 })
      .limit(10)
      .then((results) => {
        for (const result in results) {
          const user = this.client.users.cache.get(results[result]._id)
          let fakeResult = parseInt(result)
          const rankNumber = fakeResult + 1
          if (user) {
            embed.addField(
              `${rankNumber}.${user.tag}`,
              `
            Level: **${results[result].level}**
            Won Matches: **${results[result].wonMatches}**
            `,
              true
            )
          }
        }
      })
    message.channel.send(embed)
  }
}
