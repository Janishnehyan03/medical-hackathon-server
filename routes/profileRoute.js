const express = require("express");
const router = express.Router();
const Profile = require("../models//profileModel"); // Assuming you have a Profile model
const { protect } = require("../middlewares/userMiddleware");

async function generatePatientAdvice(profile) {
  try {
    const advice = {};

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

    // Blood group advice
    advice.bloodGroupAdvice = getBloodGroupAdvice(bloodGroup);

    // BMI advice
    advice.bmiAdvice = getBMIAdvice(weight, height);

    // Allergy advice
    advice.allergyAdvice = getAllergyAdvice(allergies);

    // Surgery advice
    advice.surgeryAdvice = getSurgeryAdvice(surgeries);

    // Calculate disease scores based on thresholds
    advice.bloodPressureScore = calculateBloodPressureScore(bloodPressure);
    advice.cholesterolScore = calculateCholesterolScore(cholesterolLevel);
    advice.bloodSugarScore = calculateBloodSugarScore(bloodSugarLevel);

    // Suggested diets based on health issues
    advice.suggestedDiets = getSuggestedDiets(advice);

    // Return the advice object
    return advice;
  } catch (error) {
    console.error("Error generating patient advice:", error);
    throw error;
  }
}

// Functions to generate personalized advice

function getBloodGroupAdvice(bloodGroup) {
  if (bloodGroup === "AB+") {
    return "AB+ is a universal recipient blood type.";
  } else if (bloodGroup === "O-") {
    return "O- is a universal donor blood type.";
  } else {
    return "Maintain awareness of your blood type for potential transfusions.";
  }
}

function getBMIAdvice(weight, height) {
  const bmi = weight / (height / 100) ** 2;
  if (bmi < 18.5) {
    return "Your BMI indicates that you are underweight. Consider consulting a nutritionist.";
  } else if (bmi >= 25) {
    return "Your BMI indicates that you are overweight. Consider adopting a healthier lifestyle.";
  } else {
    return "Your BMI is within a healthy range. Keep up the good work!";
  }
}

function getAllergyAdvice(allergies) {
  if (allergies.length > 0) {
    return "Be cautious of allergens and ensure proper management of known allergies.";
  } else {
    return "No known allergies. Continue to maintain a healthy lifestyle.";
  }
}

function getSurgeryAdvice(surgeries) {
  if (surgeries.length > 0) {
    return "Follow post-operative care instructions and attend follow-up appointments.";
  } else {
    return "No history of surgeries. Maintain overall well-being.";
  }
}

function calculateBloodPressureScore(bloodPressure) {
  const { systolic, diastolic } = bloodPressure;
  const meanPressure = (systolic + 2 * diastolic) / 3;
  if (meanPressure > 140) {
    return 2; // High blood pressure
  } else if (meanPressure < 90) {
    return 1; // Low blood pressure
  } else {
    return 0; // Normal blood pressure
  }
}

function calculateCholesterolScore(cholesterolLevel) {
  const { total } = cholesterolLevel;
  if (total > 200) {
    return 2; // High cholesterol
  } else {
    return 0; // Normal cholesterol
  }
}

function calculateBloodSugarScore(bloodSugarLevel) {
  const { fasting, postPrandial } = bloodSugarLevel;
  const meanSugarLevel = (fasting + postPrandial) / 2;
  if (meanSugarLevel > 120) {
    return 2; // High blood sugar
  } else if (meanSugarLevel < 80) {
    return 1; // Low blood sugar
  } else {
    return 0; // Normal blood sugar
  }
}

function getSuggestedDiets(advice) {
  const suggestedDiets = [];

  // Add diets based on health issues
  if (advice.bloodPressureScore === 2) {
    suggestedDiets.push("Low-sodium diet");
  }
  if (advice.cholesterolScore === 2) {
    suggestedDiets.push("Low-cholesterol diet");
  }
  if (advice.bloodSugarScore === 2) {
    suggestedDiets.push("Low-carb diet");
  }

  // Add general healthy diet
  suggestedDiets.push("Balanced diet with fruits and vegetables");

  return suggestedDiets;
}

router.post("/", protect, async (req, res) => {
  try {
    const patientData = req.body;
    const profileExists = await Profile.findOne({ email: patientData.email });

    if (profileExists) {
      // update the profile if exists
      await Profile.findOneAndUpdate(
        { email: patientData.email },
        patientData,
        { new: true }
      );
      const advice = await generatePatientAdvice(req.body);
      return res.status(201).json({ advice });
    } else {
      let user = await Profile.findOne({ email: patientData.email });
      patientData.userId = user._id;
      const newProfile = await Profile.create(patientData);
      const advice = await generatePatientAdvice(req.body);

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
    const profiles = await Profile.find().populate("userId");
    res.json({ results: profiles.length, profiles });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single profile
router.post("/my-data", protect, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a profile
router.patch("/:id", async (req, res) => {
  if (req.body._id) {
    delete req.body._id;
  }
  for (let p in req.body) {
    res.profile[p] = req.body[p];
  }
  try {
    const updatedProfile = await res.profile.save();
    res.json(updatedProfile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a profile
router.delete("/:id", async (req, res) => {
  try {
    await Profile.findByIdAndDelete(req.params.id);
    res.json({ message: "Profile deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
