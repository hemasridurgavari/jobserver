const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
const Job = require('./models/Job');

const app = express();
app.use(cors());
app.use(express.json());

// ------------------------ MongoDB Connection ------------------------
mongoose.connect('mongodb+srv://hemasridurgavari:rD5k8aHQVV9u8XXC@cluster0.fztmr4r.mongodb.net/jobportal?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ------------------------ Signup Route ------------------------
app.post('/signup', async (req, res) => {
  const { firstName, lastName, username, email, password } = req.body;

  if (!firstName || !lastName || !username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (!email.endsWith('@gmail.com')) {
    return res.status(400).json({ error: "Email must end with @gmail.com" });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({ error: "Username or email already exists" });
    }

    // 🔐 Assign role based on email and username
    const role = (email === "admin@gmail.com" && username === "admin") ? "admin" : "user";

    const newUser = new User({ firstName, lastName, username, email, password, role });
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ error: "Signup failed" });
  }
});

// ------------------------ Login Route ------------------------
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, password });
    if (user) {
      res.json({
        message: "Login successful",
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// ------------------------ Forgot Password Route ------------------------
app.post('/forgot-password', async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  if (!email || !newPassword || !confirmPassword) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// ------------------------ Post Job Route ------------------------
app.post('/post-job', async (req, res) => {
  const { title, type, category, description, company, location, logo } = req.body;

  if (!title || !type || !category || !description || !company || !location) {
    return res.status(400).json({ error: "All fields except logo are required" });
  }

  try {
    const newJob = new Job({ title, type, category, description, company, location, logo });
    await newJob.save();
    res.status(201).json({ message: "Job posted successfully" });
  } catch (err) {
    console.error("Post Job Error:", err);
    res.status(500).json({ error: "Failed to post job" });
  }
});

// ------------------------ Get All Jobs Route ------------------------
app.get('/jobs', async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json(jobs);
  } catch (err) {
    console.error("Fetch Jobs Error:", err);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// ------------------------ Start Server ------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));





