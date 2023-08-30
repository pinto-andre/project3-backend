const router = require("express").Router();
const mongoose = require("mongoose");
const fileUploader = require("../config/cloudinary.config");

/* Requiring all models */
const Band = require("../models/Band.model");
const Review = require("../models/Review.model");
const User = require("../models/User.model");

/* POST Route that creates a new band */
router.post("/bands", fileUploader.single("band-picture"), async (req, res) => {
  const { name, description, genres, missing, label, artists, founder } =
    req.body;

  try {
    let response = await Band.create({
      name,
      img: req.file.path,
      description,
      genres,
      missing,
      label,
      artists,
      founder,
    });
    res.json(response);
  } catch (error) {
    res.json(error);
  }
});

/* GET Route that lists all the bands */
router.get("/bands", async (req, res) => {
  try {
    let allBands = await Band.find().populate("artists");
    res.json(allBands);
  } catch (error) {
    res.json(error);
  }
});

/* GET Route that display info about a specific band */
router.get("/bands/:bandId", async (req, res) => {
  const { bandId } = req.params;

  try {
    let foundBand = await Band.findById(bandId).populate(
      "reviews artists founder"
    );
    await foundBand.populate({
      path: "reviews",
      populate: {
        path: "user",
        model: "User",
      },
    });
    res.json(foundBand);
  } catch (error) {
    res.json(error);
  }
});

/* PUT Route to update info of a Band */
router.put(
  "/bands/:bandId",
  fileUploader.single("band-picture"),
  async (req, res) => {
    const { bandId } = req.params;
    const { name, description, genres, missing, label, artists } = req.body;
    try {
      let updateBand = await Band.findByIdAndUpdate(
        bandId,
        {
          name,
          img: req.file.path,
          description,
          genres,
          missing,
          label,
          artists,
        },
        { new: true }
      );
      res.json(updateBand);
    } catch (error) {
      res.json(error);
    }
  }
);

/* DELETE Route to delete a band */
router.delete("/bands/:bandId", async (req, res) => {
  const { bandId } = req.params;
  try {
    await Band.findByIdAndDelete(bandId);
    res.json({ message: "Band deleted" });
  } catch (error) {
    res.json(error);
  }
});

/* REVIEWS ROUTES */

/* POST Route for creating a review */
router.post(
  "/bands/:bandId/review",
  fileUploader.single('review-picture'),
  async (req, res) => {
    const { bandId } = req.params;
    const { content, user } = req.body;
    try {
      const band = await Band.findById(bandId);
      const newReview = await Review.create({
        content,
        img: req.file.path,
        user,
        band,
      });
      const reviewUser = await User.findById(req.session.currentUser._id);
      const userId = reviewUser._id;
      const updateBand = await Band.findByIdAndUpdate(bandId, {
        $push: { reviews: newReview },
      });
      const updateUser = await User.findByIdAndUpdate(userId, {
        $push: { reviews: newReview },

      });
      res.json(newReview);
      
    } catch (error) { 
      res.json(error);
    }
  }
);

module.exports = router;