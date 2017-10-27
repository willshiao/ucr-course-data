'use strict'

module.exports = {
  dataDir: './data',

  db: {
    uri: 'mongodb://localhost/ucr-course',
    options: {
      useMongoClient: true
    }
  },

  auth: {
    type: 'cookie', // cookie or credentials
    cookies: [  // Required if auth.type == cookie
      {
        key: 'JSESSIONID',
        value: '',
        domain: 'registrationssb.ucr.edu',
        httpOnly: true,
        secure: true
      },
      {
        key: 'BIGipServer~Banner~banner-prod-regssb-pool_8080',
        value: '',
        domain: 'registrationssb.ucr.edu'
      }
    ],
    credentials: { // Required if auth.type == credentials
      username: '',
      password: ''
    },
    cookieDomain: 'https://registrationssb.ucr.edu'
  },

  catalog: {
    urls: {
      search: 'https://registrationssb.ucr.edu/StudentRegistrationSsb/ssb/searchResults/searchResults',
      prereqs: 'https://registrationssb.ucr.edu/StudentRegistrationSsb/ssb/searchResults/getSectionPrerequisites'
    },
    term: 201810,
    subjects: 'CS,MATH', // Comma-seperated. Can be blank.
    replaceUnknown: false // Replace unknown classes with 'UNKNOWN', not yet implemented
  },

  request: {
    default: { // Default settings, passed to request library
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36'
      }
    }
  },

  logger: {
    settings: {
      level: 'debug',
      prettyPrint: true,
      colorize: true,
      silent: false,
      timestamp: true
    }
  }
}
