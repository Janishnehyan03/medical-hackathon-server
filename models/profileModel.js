const mongoose = require("mongoose");

// Define the schema for the Profile model
const profileSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  bloodGroup: {
    type: String,
  },
  height: {
    type: Number,
  },
  weight: {
    type: Number,
  },
  otherBasicDetails: {
    type: String,
  },
  dob: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: true,
  },
  allergies: {
    type: [String],
  },
  medications: {
    type: [String],
  },
  surgeries: {
    type: [String],
  },
  medicalHistory: {
    type: String,
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phoneNumber: String,
  },
});

// Create and export the Profile model
const Profile = mongoose.model("Profile", profileSchema);
module.exports = Profile;