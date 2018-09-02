const mongoose = require('mongoose')
const redis = require('redis')
const { promisify } = require('util')
const debug = require('debug')('project')

const redisUrl = 'redis://127.0.0.1:6379'
const client = redis.createClient(redisUrl)
client.hget = promisify(client.hget)
client.get = promisify(client.get)

const exec = mongoose.Query.prototype.exec

mongoose.Query.prototype.cache = function (opts = {}) {
  this.useCache = true
  this.hashKey = JSON.stringify(opts.hashKey || '')
  return this
}
mongoose.Query.prototype.exec = async function () {
  if (this.useCache) {
    const key = JSON.stringify({ ...this.getQuery(), collection: this.mongooseCollection.name })
    debug({key})
    const cache = await client.hget(this.hashKey, key)
    if (cache) {
      debug('using cache')
      const doc = JSON.parse(cache)
      if (Array.isArray(doc))
      return Array.isArray(doc)
        ? doc.map(item => new this.model(item))
        : new this.model(doc)
    }
    debug('caching')
    const result = await exec.apply(this, arguments)
    client.hset(this.hashKey, key, JSON.stringify(result))
    return result
  }
  return await exec.apply(this, arguments)
}

module.exports = {
  async clearHash (hashKey) {
    debug('deleting', hashKey)
    client.del(JSON.stringify(hashKey))
  }
}