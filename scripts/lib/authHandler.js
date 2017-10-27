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
      return jar
    }
    throw new TypeError('Invalid authentication type')
  },

  async login ({ username, password }, extraSettings = {}) {
    const jar = rp.jar()

    const loginHtml = await rp({
      uri: 'https://auth.ucr.edu/cas/login?service=http://rspaceportal.ucr.edu/rspaceportal/portal_api.process_login?p_entry=1',
      jar,
      ...extraSettings
    })
    const $ = cheerio.load(loginHtml)

    const formData = {
      lt: $('input[name="lt"]').val(),
      execution: $('input[name="execution"]').val()
    }
    console.log(formData)

    const loginRequest = await rp({
      uri: 'https://auth.ucr.edu/cas/login?service=http://rspaceportal.ucr.edu/rspaceportal/portal_api.process_login?p_entry=1',
      method: 'POST',
      jar,
      headers: {
        Referer: 'https://auth.ucr.edu/cas/login?service=http://rspaceportal.ucr.edu/rspaceportal/portal_api.process_login?p_entry=1'
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

    console.log(jar)

    return jar
  },

  async fetchCookies (jar) {
    await rp({
      uri: 'https://registrationssb.ucr.edu/StudentRegistrationSsb/',
      jar
    })
    // await rp({
    //   uri: 'https://registrationssb.ucr.edu/robots.txt',
    //   jar,
    // });
    return jar
  }
}
