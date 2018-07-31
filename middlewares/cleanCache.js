const { clearHash } = require("../services/cache");

module.exports = async (req, res, next) => {
    await next();

    // Removes the cache from redis.
    clearHash(req.user.id);
};
