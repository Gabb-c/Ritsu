const p = require('phin')

// TODO: Send this to the backend (Mio)
module.exports.ThemesMoeService = class ThemesMoeService {
  constructor() {}

  /**
   * Get animes from the user MAL animelist
   * @param {String} username
   */

  async getAnimesByMal(username) {
    const tmRes = await p({
      method: 'GET',
      url: `https://themes.moe/api/mal/${username}`,
      parse: 'json',
    })

    if (tmRes.statusCode === 200) {
      if (tmRes.body.length > 0) {
        return tmRes.body
      } else {
        return false
      }
    } else {
      throw `themes.moe returned a ${tmRes.statusCode} [${tmRes.statusMessage}] status code/message!`
    }
  }
  /**
   * Get animes from user Anilist animelist.
   * @param {String} username
   */
  async getAnimesByAnilist(username) {
    const tmRes = await p({
      method: 'GET',
      url: `https://themes.moe/api/anilist/${username}`,
      parse: 'json',
    })
    if (tmRes.statusCode === 200) {
      if (tmRes.body.length > 0) {
        return tmRes.body
      } else {
        return false
      }
    } else {
      throw `themes.moe returned a ${tmRes.statusCode} [${tmRes.statusMessage}] status code/message!`
    }
  }
}
