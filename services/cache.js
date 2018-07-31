/**
 * Service used to create a key before the mongodb execute the query.
 */

const mongoose = require("mongoose");
const redis = require("redis");
const util = require("util");

const redisUrl = "redis://127.0.01:6379";
const client = redis.createClient(redisUrl);
client.hget = util.promisify(client.hget);

// Original exec function
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(options = {}) {
    const useCache = true;

    this.cacheKey = JSON.stringify(options.key || "");

    // Makes the .cache() channeble. Ex.: .cache().limit(10).sort()
    return this;
};

mongoose.Query.prototype.exec = async function() {
    // Execute the original exec function without caching.
    if (!this.useCache) {
        exec.apply(this, arguments);
    }

    const key = JSON.stringify(
        // Create a key used to save the data on Redis.
        Object.assign({}, this.getQuery(), { collection: this.mongooseCollection.name })
    );

    const cacheValue = await client.hget(this.cacheKey, key);

    if (cacheValue) {
        console.log("SERVING FROM THE CACHE.");
        const doc = JSON.parse(cacheValue);

        // We have to handle both cases where the redis returns a single
        // Object or a Array of Objects.
        return Array.isArray(doc) ? doc.map(d => new this.model(d)) : new this.model(doc);
    }

    console.log("SERVING FROM THE MONGODB.");
    // Exec the normal function.
    const result = await exec.apply(this, arguments);

    client.hset(this.cacheKey, key, JSON.stringify(result));

    return result;
};

module.exports = {
    clearHash(hashKey) {
        client.del(JSON.stringify(hashKey));
    }
};
