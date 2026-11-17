const mongoose = require("mongoose");

const repositorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    language: {
      type: String,
      default: "",
      trim: true,
    },

    visibility: {
      type: String,
      enum: ["Public", "Private"],
      default: "Public",
    },

    initializeReadme: {
      type: Boolean,
      default: false,
    },

    owner: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Repository", repositorySchema);