// models/Job.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: String,
  type: String,
  category: String,
  description: String,
  company: String,
  location: String,
  logo: String,
  postedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Job', jobSchema);

