const express = require("express");
const app = express();
const cors = require("cors");
const bcrypt = require("bcryptjs");
const knex = require("knex");
const morgan = require("morgan");
const register = require("./controllers/register");
const signin = require("./controllers/signin");
const profile = require("./controllers/profile");
const image = require("./controllers/image");
const signout = require("./controllers/signout");
const auth = require("./controllers/authorization");

const db = knex({
  client: "pg",
  connection: process.env.POSTGRES_URI,
});

// const whitelist = ["http://localhost:3001"];
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
// };

app.use(morgan("combined"));
// app.use(cors(corsOptions));
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("It is working");
});

app.post("/signin", signin.SigninAuthentication(db, bcrypt));

app.post("/register", (req, res) => {
  register.handleRegister(req, res, db, bcrypt);
});

//:id get by using req.params
app.get("/profile/:id", auth.requireAuth, (req, res) => {
  profile.handleProfileGet(req, res, db);
});

app.post("/profile/:id", auth.requireAuth, (req, res) => {
  profile.handleProfileUpdate(req, res, db);
});

app.put("/image", auth.requireAuth, (req, res) => {
  image.handleImageCount(req, res, db);
});

app.post("/imagesave", auth.requireAuth, (req, res) => {
  image.handleImageSave(req, res, db);
});

app.post("/imageurl", auth.requireAuth, (req, res) => {
  image.handleApiCall(req, res);
});

app.post("/signout", auth.requireAuth, (req, res) => {
  signout.handleSignout(req, res);
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`app is running`);
});

/*
/--> res = this is working
/signin -> POST = sucess/fail
/register --> POST = user
/profile/:userId --> GET = user
/image -->
*/
