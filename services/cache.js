const mongoose = require('mongoose')
const redis = require('redis')
const { promisify } = require('util')
const debug = require('debug')('project')

const redisUrl = 'redis://127.0.0.1:6379'
const client = redis.createClient(redisUrl)
client.get = promisify(client.get)

const exec = mongoose.Query.prototype.exec

mongoose.Query.prototype.cache = function () {
  this.useCache = true
  return this
}
mongoose.Query.prototype.exec = async function () {
  if (this.useCache) {
    debug('Attemping to cache/ use cache')
    const key = JSON.stringify({ ...this.getQuery(), collection: this.mongooseCollection.name })
    const cache = await client.get(key)
    if (cache) {
      const doc = JSON.parse(cache)
      if (Array.isArray(doc))
      return Array.isArray(doc)
      ? doc.map(item => new this.model(item))
      : new this.model(doc)
    }

    const result = await exec.apply(this, arguments)
    client.set(key, JSON.stringify(result))
    return result
  }
  debug('not using cache')
  return await exec.apply(this, arguments)
}