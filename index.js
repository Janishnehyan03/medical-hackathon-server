// Import required modules
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();

// routes
const userRoute = require("./routes/userRoute");
const profileRoute = require("./routes/profileRoute");

// Initialize Express app
const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(morgan("dev")); // Log HTTP requests
app.use(
  cors({
    origin: true,
    credentials: true,
  })
); // Enable Cross-Origin Resource Sharing
app.use(bodyParser.json());

// Routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Connect to MongoDB using Mongoose
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
  });

//   routes
app.use("/api/users", userRoute);
app.use("/api/profiles", profileRoute);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
