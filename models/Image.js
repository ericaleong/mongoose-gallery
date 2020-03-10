const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    id: Number,
    title: String,
    source: String,
    fileName: String,
    attribution: {
      source: String,
      credit: String,
      url: String
    }
  }
);

module.exports = mongoose.model('Image', imageSchema);