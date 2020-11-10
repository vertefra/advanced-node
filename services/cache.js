const mongoose = require('mongoose')
const redis = require('redis')
const util = require('util')

const redisUrs = 'redis://127.0.0.1:6379'
const client = redis.createClient(redisUrs)

client.get = util.promisify(client.get)

// storing a copy of exec from query in const exec

// exec it's the mongoose method that executes a query
// We will tweak it in order to let it check if, for that 
// query, there is already a result ready

const exec = mongoose.Query.prototype.exec

mongoose.Query.prototype.exec = async function () {
  const key = JSON.stringify({
    ...this.getFilter(),
    collection: this.mongooseCollection.name,
  })

  // check if key exists in redis if so return it other issue the query and store
  // the result in redis

  // The returned value could be an object or an array in case of multiple results.
  // Also, all the results stored in redis are stringify JSON and we need to 
  // Hidrate them when retrieved

  const cacheValue = await client.get(key)

  if (cacheValue) {
    // reassign all the property as object to the model creating a new modelDocument
    const doc = JSON.parse(cacheValue)

  
    // map function will hydrate all the values from the array
    console.log('cache')
    return Array.isArray(doc)
      ? doc.map(d => new this.model(d)) // it's not a simple object but we need to reconvert it to mongoose model
      : new this.model(doc)         
  }

  console.log('Mongo')

  const res = await exec.apply(this, arguments)

  client.set(key, JSON.stringify(res))

  return res
}
