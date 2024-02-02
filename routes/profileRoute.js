const express = require("express");
const router = express.Router();
const Profile = require("../models//profileModel"); // Assuming you have a Profile model
const { protect } = require("../middlewares/userMiddleware");
router.post("/", protect, async (req, res) => {
  try {
    const patientData = req.body;
    const profileExists = await Profile.findOne({ email: patientData.email });

    if (profileExists) {
      const advice = generatePatientAdvice(patientData);
      return res
        .status(200)
        .json({ message: "Profile already exists", advice });
    } else {
      // Add userId to patientData
      patientData.userId = req.user._id;

      // Create new profile
      const newProfile = await Profile.create(patientData);
      const advice = generatePatientAdvice(patientData);

      return res.status(201).json({ advice, newProfile });
    }
  } catch (error) {
    console.error("Error creating profile:", error);
    return res.status(500).json({ message: "Internal server error" });
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
// Function to handle patient advice based on profile data
function generatePatientAdvice(profile) {
  // Initialize an object to store advice and scores
  const advice = {};

  // Extract relevant profile data
  const {
    bloodGroup,
    height,
    weight,
    allergies,
    medications,
    surgeries,
    bloodPressure,
    cholesterolLevel,
    bloodSugarLevel,
  } = profile;

  // Generate advice based on the patient's profile data
  // Example logic, you can extend and customize as needed

  // Blood group advice
  if (bloodGroup === "AB+") {
    advice.bloodGroupAdvice = "AB+ is a universal recipient blood type.";
  } else if (bloodGroup === "O-") {
    advice.bloodGroupAdvice = "O- is a universal donor blood type.";
  } else {
    advice.bloodGroupAdvice =
      "Maintain awareness of your blood type for potential transfusions.";
  }

  // Calculate BMI and provide advice based on weight and height
  const bmi = weight / (height / 100) ** 2;
  if (bmi < 18.5) {
    advice.bmiAdvice =
      "Your BMI indicates that you are underweight. Consider consulting a nutritionist.";
  } else if (bmi >= 25) {
    advice.bmiAdvice =
      "Your BMI indicates that you are overweight. Consider adopting a healthier lifestyle.";
  } else {
    advice.bmiAdvice =
      "Your BMI is within a healthy range. Keep up the good work!";
  }

  // Provide advice based on allergies
  if (allergies.length > 0) {
    advice.allergyAdvice =
      "Be cautious of allergens and ensure proper management of known allergies.";
  } else {
    advice.allergyAdvice =
      "No known allergies. Continue to maintain a healthy lifestyle.";
  }

  // Provide advice based on medications
  if (medications.length > 0) {
    advice.medicationAdvice = "Ensure compliance with prescribed medications.";
  } else {
    advice.medicationAdvice =
      "No medications currently prescribed. Stay healthy!";
  }

  // Provide advice based on past surgeries
  if (surgeries.length > 0) {
    advice.surgeryAdvice =
      "Follow post-operative care instructions and attend follow-up appointments.";
  } else {
    advice.surgeryAdvice =
      "No history of surgeries. Maintain overall well-being.";
  }

  // Calculate and provide scores for blood pressure, cholesterol, and blood sugar levels
  advice.bloodPressureScore =
    (bloodPressure.systolic + bloodPressure.diastolic) / 2;
  advice.cholesterolScore = cholesterolLevel.total;
  advice.bloodSugarScore =
    (bloodSugarLevel.fasting + bloodSugarLevel.postPrandial) / 2;

  // Return the advice object
  return advice;
}

module.exports = router;
