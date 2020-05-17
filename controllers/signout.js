const redis = require("redis");

const redisClient = redis.createClient(process.env.REDIS_URI);

const handleSignout = (req, res) => {
  const { authorization } = req.headers;
  return redisClient.del(authorization, (err, reply) => {
    if (err || !reply) {
      return res.status(400).json("Unauthorized");
    }
    return res.status(200).json("Deleted Successfully");
  });
};

module.exports = {
  handleSignout,
};
