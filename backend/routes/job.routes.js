const express = require("express");
const router = express.Router();
const Job = require("../models/Job.model");

// ✅ Create a New Job
router.post("/", async (req, res) => {
  try {
    const { title, company, type, location, logo, category, description, applyLink } = req.body;

    if (!title || !company || !type || !location || !category || !description) {
      return res.status(400).json({ error: "All required fields must be filled" });
    }

    const job = new Job({
      title,
      company,
      type,
      location,
      logo,
      category,
      description,
      applyLink,
    });

    await job.save();
    res.status(201).json({ message: "Job created successfully" });

  } catch (err) {
    console.error("❌ Job creation error:", err);
    res.status(500).json({ error: "Failed to create job. Please try again." });
  }
});

// ✅ Get All Jobs or by Category
router.get("/", async (req, res) => {
  try {
    const category = req.query.category;
    const filter = category ? { category } : {};

    const jobs = await Job.find(filter).sort({ createdAt: -1 });
    res.status(200).json(jobs);

  } catch (err) {
    console.error("❌ Job fetch error:", err);
    res.status(500).json({ error: "Failed to fetch jobs. Please try again." });
  }
});

// ✅ Update a Job by ID
router.put("/:id", async (req, res) => {
  try {
    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedJob) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.status(200).json({ message: "Job updated successfully", job: updatedJob });
  } catch (err) {
    console.error("❌ Job update error:", err);
    res.status(500).json({ error: "Failed to update job. Please try again." });
  }
});

// ✅ Delete a Job by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedJob = await Job.findByIdAndDelete(req.params.id);

    if (!deletedJob) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.status(200).json({ message: "Job deleted successfully" });
  } catch (err) {
    console.error("❌ Job deletion error:", err);
    res.status(500).json({ error: "Failed to delete job. Please try again." });
  }
});

module.exports = router;



