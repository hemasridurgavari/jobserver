const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

// ✅ Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, username, password } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !username || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check for existing user
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      const field = existingUser.email === email ? "Email" : "Username";
      return res.status(400).json({ error: `${field} already taken` });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with role based on email
    const user = new User({
      firstName,
      lastName,
      email,
      username,
      password: hashedPassword,
      role: email === "admin@gmail.com" ? "admin" : "user",
    });

    await user.save();
    res.status(201).json({ message: "User created successfully" });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Error signing up. Please try again later." });
  }
});

// ✅ Login Route
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });

    res.status(200).json({
      token,
      user: {
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

// ❌ Deprecated Route
router.post("/register", (_req, res) => {
  return res.status(410).json({ error: "Deprecated route. Use /signup instead." });
});

module.exports = router;



