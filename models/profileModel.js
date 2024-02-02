const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    // required: true,
  },
  address: {
    type: String,
    // required: true,
  },
  email: {
    type: String,
    // required: true,
    unique: true,
  },
  phone: {
    type: String,
    // required: true,
  },
  country: {
    type: String,
    // required: true,
  },
  state: {
    type: String,
    // required: true,
  },
  bloodGroup: String,
  height: Number,
  weight: Number,
  dob: {
    type: Date,
    // required: true,
  },
  gender: {
    type: String,
    // enum: ["male", "female", "other"],
    // required: true,
  },
  allergies: [
    {
      type: String,
      // enum: [
      //   "peanuts",
      //   "penicillin",
      //   "shellfish",
      //   "latex",
      //   "pollen",
      //   "dust",
      //   "pets",
      //   "other",
      // ],
      lowercase: true,
    },
  ],
  medications: [
    {
      type: String,
      // enum: [
      //   "aspirin",
      //   "ibuprofen",
      //   "acetaminophen",
      //   "antibiotics",
      //   "antidepressants",
      //   "insulin",
      //   "other",
      // ],
      lowercase: true,
    },
  ],
  surgeries: [
    {
      type: String,
      // enum: [
      //   "appendectomy",
      //   "tonsillectomy",
      //   "hernia repair",
      //   "knee replacement",
      //   "hip replacement",
      //   "lasik surgery",
      //   "other",
      // ],
      lowercase: true,
    },
  ],
  medicalHistory: String,

  bloodPressure: {
    systolic: Number,
    diastolic: Number,
  },
  cholesterolLevel: {
    total: Number,
    hdl: Number,
    ldl: Number,
  },
  bloodSugarLevel: {
    fasting: Number,
    postPrandial: Number,
  },
});

const Profile = mongoose.model("Profile", profileSchema);
module.exports = Profile;
