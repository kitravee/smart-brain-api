const Clarifai = require("clarifai");
// const app = new Clarifai.App({
//   apiKey: process.env.API_CLARIFAI
// });
const app = new Clarifai.App({
  apiKey: "f5f66f3c2438492bbf93c0f21f9c727d",
});

const handleApiCall = (req, res) => {
  app.models
    .predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => res.status(400).json("unable to Work with API"));
};

const handleImageCount = (req, res, db) => {
  const { id } = req.body;
  db("users")
    .where("id", "=", id)
    .increment("entries", 1)
    .returning("entries")
    .then((entries) => {
      res.json(entries[0]);
    })
    .catch((err) => res.status(400).json("unable to get entries"));
};

const handleImageSave = (req, res, db) => {
  const { email, imageUrl, box } = req.body;
  console.log(box);
  db.insert({
    email: email,
    imageUrl: imageUrl,
    box: JSON.stringify(box),
  })
    .into("image")
    .then((fata) => {
      res.json("finish");
    })
    .catch((err) => res.status(400).json("unable to get entries"));
};

module.exports = {
  handleImageCount,
  handleApiCall,
  handleImageSave,
};
