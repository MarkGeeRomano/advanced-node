const { Buffer } = require('safe-buffer')
const Keygrip = require('keygrip')
const { cookieKey } = require('../../config/keys')

module.exports = ({ _id }) => {
  const sessionObject = { passport: { user: _id.toString() } }
  const session = Buffer.from(JSON.stringify(sessionObject)).toString('base64')
  const keygrip = new Keygrip([cookieKey])
  const sig = keygrip.sign('session=' + sessionString)

  return { session, sig }
}