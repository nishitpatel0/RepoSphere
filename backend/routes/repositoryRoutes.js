const express = require("express");
const Repository = require("../models/Repository");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      name,
      description,
      language,
      visibility,
      initializeReadme,
      owner,
    } = req.body;

    if (!name || !owner) {
      return res.status(400).json({
        message: "Repository name and owner are required",
      });
    }

    const existingRepository = await Repository.findOne({
      name,
      owner,
    });

    if (existingRepository) {
      return res.status(400).json({
        message: "Repository with this name already exists",
      });
    }

    const repository = new Repository({
      name,
      description,
      language,
      visibility,
      initializeReadme,
      owner,
    });

    await repository.save();

    res.status(201).json({
      message: "Repository created successfully",
      repository,
    });
  } catch (error) {
    res.status(500).json({
      message: "Repository creation failed",
      error: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const filter = req.query.owner
      ? { owner: req.query.owner }
      : {};

    const repositories = await Repository.find(filter).sort({
      createdAt: -1,
    });

    res.status(200).json({
      repositories,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch repositories",
      error: error.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const repository = await Repository.findById(req.params.id);

    if (!repository) {
      return res.status(404).json({
        message: "Repository not found",
      });
    }

    res.status(200).json({
      repository,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch repository",
      error: error.message,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const {
      name,
      description,
      language,
      visibility,
      initializeReadme,
    } = req.body;

    const repository = await Repository.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        language,
        visibility,
        initializeReadme,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!repository) {
      return res.status(404).json({
        message: "Repository not found",
      });
    }

    res.status(200).json({
      message: "Repository updated successfully",
      repository,
    });
  } catch (error) {
    res.status(500).json({
      message: "Repository update failed",
      error: error.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const repository = await Repository.findByIdAndDelete(req.params.id);

    if (!repository) {
      return res.status(404).json({
        message: "Repository not found",
      });
    }

    res.status(200).json({
      message: "Repository deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Repository deletion failed",
      error: error.message,
    });
  }
});

module.exports = router;