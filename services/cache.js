const mongoose = require('mongoose')
const redis = require('redis')
const util = require('util')

const redisUrs = 'redis://127.0.0.1:6379'
const client = redis.createClient(redisUrs)

client.get = util.promisify(client.get)

// storing a copy of exect from query in cosnt exec

const exec = mongoose.Query.prototype.exec

mongoose.Query.prototype.exec = async function () {
  const key = JSON.stringify({
    ...this.getFilter(),
    collection: this.mongooseCollection.name,
  })

  // check if key exists in redis if so return it other issue the query and store
  // the result in redis

  const cacheValue = await client.get(key)

  if (cacheValue) {
    // reassign all the property as object to the model creating a new modelDocument
    const doc = JSON.parse(cacheValue)

    // checking if the returning value is an array or an object to define the conversion

    // map function will hydrate all the values from the array
    console.log('cache')
    return Array.isArray(doc)
      ? doc.map(d => new this.model(d))
      : new this.model(doc)
  }

  console.log('Mongo')

  const res = await exec.apply(this, arguments)

  client.set(key, JSON.stringify(res))

  return res
}
