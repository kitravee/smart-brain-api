const jwt = require("jsonwebtoken");
const redis = require("redis");
//setup Redis:
const redisClient = redis.createClient(process.env.REDIS_URI);

const handleSignin = (req, res, db, bcrypt) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return Promise.reject("incorrect form submission");
  }
  return db
    .select("email", "hash")
    .from("login")
    .where("email", "=", req.body.email)
    .then((data) => {
      const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
      if (isValid) {
        return db
          .select("*")
          .from("users")
          .where("email", "=", req.body.email)
          .then((user) => user[0])
          .catch((err) => Promise.reject("unable to get user"));
      } else {
        res.status(400).json("wrong credential");
      }
    })
    .catch((err) => Promise.reject("wrong credential"));
};

const getAuthTokenId = (req, res) => {
  const { authorization } = req.headers;
  return redisClient.get(authorization, (err, reply) => {
    if (err || !reply) {
      return res.status(400).json("Unauthorized");
    }
    return res.json({ id: reply });
  });
};
//JWT_SECRET
const signToken = (email) => {
  const jwtPayload = { email };
  return jwt.sign(jwtPayload, "JWT_SECRET", { expiresIn: "2 days" });
};

const setToken = (key, value) => {
  // console.log("setToken");
  // redisClient.get(key, redis.print);
  return Promise.resolve(redisClient.set(key, value));
};
const createSessions = (user) => {
  // JWT Token, return user data
  const { email, id } = user;
  const token = signToken(email);
  return setToken(token, id)
    .then(() => ({
      success: "true",
      userId: id,
      token,
    }))
    .catch(console.log);
};

const SigninAuthentication = (db, bcrypt) => (req, res) => {
  const { authorization } = req.headers;
  return authorization
    ? getAuthTokenId(req, res)
    : handleSignin(req, res, db, bcrypt)
        .then((data) =>
          data.id && data.email ? createSessions(data) : Promise.reject(data)
        )
        .then((session) => res.json(session))
        .catch((err) => res.status(400).json(err));
};

module.exports = {
  SigninAuthentication,
  redisClient,
};
