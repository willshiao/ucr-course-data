'use strict'

const cheerio = require('cheerio')
const config = require('config')
const tough = require('tough-cookie')
const rp = require('./request')

module.exports = {
  async getJar () {
    if (config.get('auth.type') === 'cookie') {
      const jar = rp.jar()
      config.get('auth.cookies').forEach((c) => {
        jar.setCookie(new tough.Cookie(c), config.get('auth.cookieDomain'))
      })
    } else if (config.get('auth.type') === 'credentials') {
      let jar = await this.login(config.get('auth.credentials'))
      jar = await this.fetchCookies(jar)
      // console.log(jar)
      return jar
    }
    throw new TypeError('Invalid authentication type')
  },

  async login ({ username, password }, extraSettings = {}) {
    const jar = rp.jar()

    const loginHtml = await rp({
      uri: 'https://auth.ucr.edu/cas/login?service=https://portal.ucr.edu/uPortal/Login',
      jar,
      ...extraSettings
    })
    const $ = cheerio.load(loginHtml)

    console.log('Jar (pre-login): ', jar)

    const formData = {
      lt: $('input[name="lt"]').val(),
      execution: $('input[name="execution"]').val()
    }
    console.log(formData)

    try {
      await rp({
        uri: 'https://auth.ucr.edu/cas/login?service=https://portal.ucr.edu/uPortal/Login',
        method: 'POST',
        jar,
        headers: {
          Referer: 'https://auth.ucr.edu/cas/login?service=https://portal.ucr.edu/uPortal/Login'
        },
        form: {
          ...formData,
          username,
          password,
          _eventId: 'submit',
          'submit.x': 0,
          'submit.y': 0,
          submit: 'LOGIN'
        },
        ...extraSettings
      })

      return jar
    } catch (e) {
      console.error(e.stack)
      return jar
    }
  },

  async fetchCookies (jar) {
    await rp({
      uri: 'https://registrationssb.ucr.edu/StudentRegistrationSsb/',
      headers: {
        Referer: 'https://portal.ucr.edu/uPortal/f/home-student/normal/render.uP'
      },
      jar
    })
    await rp({
      uri: 'https://registrationssb.ucr.edu/StudentRegistrationSsb/ssb/term/search?mode=search',
      method: 'POST',
      form: {
        term: config.get('catalog.term')
      },
      jar
    })
    return jar
  }
}
