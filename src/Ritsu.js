const { Client, Collection } = require('discord.js')
const { readdir } = require('fs')
const connect = require('./db')
const { log } = require('./utils/Logger')
const { I18nService } = require('./services/i18nService')
const { createServer } = require('http')
const { prometheusMetrics } = require('./utils/prometheusMetrics')
const { init } = require('@sentry/node')
const { join } = require('path')

/**
 * Ritsu Client
 * @class
 * @param {String} token - Discord Token
 * @param {Object} options - Client Options (such as prefix)
 */
module.exports.Ritsu = class Ritsu extends Client {
  constructor(token, options) {
    super(token, options)
    this.token = token
    this.prefix = options.prefix
    this.owners = [
      '722539264067240097',
      '326123612153053184',
      '565951284373487637',
    ]
    this.commands = new Collection()
    this.aliases = new Collection()
    this.prometheus = prometheusMetrics
    this.promServer = createServer((req, res) => {
      if (req.url != null) {
        if (req.url === '/metrics') {
          res.writeHead(200, {
            'Content-Type': this.prometheus.register.contentType,
          })
          res.write(this.prometheus.register.metrics())
        }
      }
      res.end()
    })
  }

  async start() {
    this.loadListeners()
    log('Loaded Listeners', 'MAIN', false)
    this.loadCommands()
    log('Loaded Commands', 'MAIN', false)
    connect()

    this.loadLocales()
    log('Loaded Locales', 'MAIN', false)

    this.login(this.token).then(() => {
      log(
        `Logged in ${this.user.tag}! Ready to serve ${this.guilds.cache.size} guilds.`,
        'MAIN',
        false
      )
    })
  }

  async loadLocales() {
    const i18n = new I18nService()
    await i18n.loadLocales()
  }

  async startSentry() {
    init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      release: process.env.VERSION,
    })
  }

  loadCommands() {
    readdir(join(__dirname, '/commands'), (err, files) => {
      if (err) console.error(err)
      files.forEach((category) => {
        readdir(join(__dirname, '/commands/', category), (err, cmd) => {
          if (err) return console.log(err)
          cmd.forEach((cmd) => {
            const command = new (require(join(
              __dirname,
              '/commands/',
              category,
              cmd
            )))(this)
            command.dir = `./src/commands/${category}/${cmd}`
            this.commands.set(command.name, command)
            command.aliases.forEach((a) => this.aliases.set(a, command.name))
          })
        })
      })
    })
  }

  loadListeners() {
    readdir(join(__dirname, '/listeners'), (err, files) => {
      if (err) console.error(err)
      files.forEach(async (em) => {
        const Event = require(join(__dirname, '/listeners/', em))
        const eventa = new Event(this)
        const name = em.split('.')[0]
        super.on(name, (...args) => eventa.run(...args))
      })
    })
  }
}
