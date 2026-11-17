const express = require("express");
const Commit = require("../models/Commit");

const router = express.Router();


// CREATE COMMIT
// POST /api/commits

router.post("/", async (req, res) => {
  try {
    const { message, repository, author, files } = req.body;

    if (!message || !repository || !author) {
      return res.status(400).json({
        message: "Message, repository and author are required"
      });
    }

    const commit = new Commit({
      message,
      repository,
      author,
      files: files || []
    });

    await commit.save();

    const populatedCommit = await Commit.findById(commit._id)
      .populate("repository", "name description language")
      .populate("author", "username email")
      .populate("files");

    res.status(201).json({
      message: "Commit created successfully",
      commit: populatedCommit
    });

  } catch (error) {
    res.status(500).json({
      message: "Commit creation failed",
      error: error.message
    });
  }
});


// GET ALL COMMITS OF REPOSITORY
// GET /api/commits/repository/:repositoryId

router.get("/repository/:repositoryId", async (req, res) => {
  try {
    const commits = await Commit.find({
      repository: req.params.repositoryId
    })
      .populate("author", "username email")
      .populate("files")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Repository commits fetched successfully",
      commits
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch commits",
      error: error.message
    });
  }
});


// GET SINGLE COMMIT
// GET /api/commits/:id

router.get("/:id", async (req, res) => {
  try {
    const commit = await Commit.findById(req.params.id)
      .populate("repository", "name description language")
      .populate("author", "username email")
      .populate("files");

    if (!commit) {
      return res.status(404).json({
        message: "Commit not found"
      });
    }

    res.status(200).json({
      commit
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch commit",
      error: error.message
    });
  }
});


module.exports = router;