const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

exports.protect = async (req, res, next) => {
  try {
    if (!req.body.token) {
      return res.status(401).json({
        error: "No token provided",
      });
    }

    // Verify the JWT token
    const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET);

    // Find the user by the decoded user ID
    const user = await User.findById(decoded.userId);

    // If user not found, token is invalid
    if (!user) {
      return res.status(401).json({
        error: "Invalid token",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(400).json({
      error,
    });
  }
};
