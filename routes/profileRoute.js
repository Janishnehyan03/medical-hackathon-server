const express = require("express");
const router = express.Router();
const Profile = require("../models//profileModel"); // Assuming you have a Profile model

// Create a new profile
router.post("/", async (req, res) => {
  try {
    const profile = new Profile(req.body);
    await profile.save();
    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all profiles
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find();
    res.json({ results: profiles.length, profiles });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single profile
router.get("/:id", getProfile, (req, res) => {
  res.json(res.profile);
});

// Update a profile
router.patch("/:id", getProfile, async (req, res) => {
  if (req.body.address != null) {
    res.profile.address = req.body.address;
  }
  if (req.body.email != null) {
    res.profile.email = req.body.email;
  }
  // Update other fields similarly

  try {
    const updatedProfile = await res.profile.save();
    res.json(updatedProfile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a profile
router.delete("/:id", getProfile, async (req, res) => {
  try {
    await res.profile.remove();
    res.json({ message: "Profile deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Middleware to get profile by ID
async function getProfile(req, res, next) {
  let profile;
  try {
    profile = await Profile.findById(req.params.id);
    if (profile == null) {
      return res.status(404).json({ message: "Profile not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

  res.profile = profile;
  next();
}

module.exports = router;
