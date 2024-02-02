const express = require("express");
const router = express.Router();
const Profile = require("../models//profileModel"); // Assuming you have a Profile model

// Create a new profile
router.post("/", async (req, res) => {
  try {
    const patientData = req.body;
    let profileExists = await Profile.findOne({ email: patientData.email });
    if (profileExists) {
      const advice = provideMedicalAdvice(patientData);
      return res
        .status(400)
        .json({ advice, message: "Profile already exists" });
    } else {
      const newProfile = new Profile(patientData);
      const savedProfile = await newProfile.save();
      const advice = provideMedicalAdvice(patientData);
      res.status(201).json(savedProfile, advice);
    }
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

function provideMedicalAdvice(patientData) {
  const {
    address,
    email,
    phone,
    country,
    state,
    bloodGroup,
    height,
    weight,
    dob,
    gender,
    allergies,
    medications,
    surgeries,
    medicalHistory,
    emergencyContact,
    bloodPressure,
    cholesterolLevel,
    bloodSugarLevel,
  } = patientData;

  let medicalAdvice = {
    diseases: [],
    medications: [],
    condition: "",
    advice: "",
  };

  // Determine condition based on patient's weight
  if (weight > 100) {
    medicalAdvice.condition = "Overweight";
    medicalAdvice.advice =
      "Your weight is above the healthy range. It is recommended to consult with a dietitian to manage your weight.";
  }

  // Check for high blood pressure
  if (bloodPressure.systolic !== "" && bloodPressure.diastolic !== "") {
    const systolic = parseInt(bloodPressure.systolic);
    const diastolic = parseInt(bloodPressure.diastolic);
    if (systolic > 130 || diastolic > 80) {
      medicalAdvice.condition = "High Blood Pressure";
      medicalAdvice.advice =
        "Your blood pressure is high. Please consult with a healthcare professional for further evaluation and management.";
    }
  }

  // Add more conditions based on patient data

  return medicalAdvice;
}

module.exports = router;
