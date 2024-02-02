// Import required modules
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel"); // Assuming you have a User model
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, username, password, confirmPassword } =
      req.body;

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Check if password and confirmPassword match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create a new user
    const newUser = new User({
      firstName,
      lastName,
      username,
      password: hashedPassword,
      confirmPassword: hashedPassword, // You might not need confirmPassword stored in the database
    });

    // Save the user to the database
    await newUser.save();

    // Generate a JWT token
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Send the token as a cookie in the response
    res.cookie("token", token, {
      httpOnly: true,
      // Add other cookie options as needed, such as secure: true for HTTPS
    });

    res
      .status(201)
      .json({ message: "User registered successfully", token, newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User login route
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user by username
    const user = await User.findOne({ username });

    // Check if the user exists
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "11h",
    });
    res.cookie("token", token, {
      httpOnly: true,
      // Add other cookie options as needed, such as secure: true for HTTPS
    });
    res.status(200).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/checkLoggedIn", async (req, res) => {
  try {
    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer")
    ) {
      return res.status(401).json({
        error: "No token provided",
      });
    }

    // Extract the token
    const token = req.headers.authorization
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: "Invalid token",
      });
    }
    res.status(200).json({
      user: {
        _id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    // Handle errors
    res.status(400).json({
      error,
    });
  }
});

module.exports = router;
