const express = require("express");
const File = require("../models/File");

const router = express.Router();

router.get("/repository/:repositoryId", async (req, res) => {
  try {
    const files = await File.find({
      repositoryId: req.params.repositoryId,
    }).sort({ createdAt: -1 });

    res.json(files);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch files",
      error: error.message,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { repositoryId, name, path, content, language } = req.body;

    if (!repositoryId || !name) {
      return res.status(400).json({
        message: "Repository ID and file name are required",
      });
    }

    const existingFile = await File.findOne({
      repositoryId,
      name,
      path: path || "",
    });

    if (existingFile) {
      return res.status(400).json({
        message: "File already exists",
      });
    }

    const file = await File.create({
      repositoryId,
      name,
      path: path || "",
      content: content || "",
      language: language || "",
    });

    res.status(201).json(file);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create file",
      error: error.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        message: "File not found",
      });
    }

    res.json(file);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch file",
      error: error.message,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, path, content, language } = req.body;

    const updatedFile = await File.findByIdAndUpdate(
      req.params.id,
      {
        ...(name !== undefined && { name }),
        ...(path !== undefined && { path }),
        ...(content !== undefined && { content }),
        ...(language !== undefined && { language }),
      },
      { new: true }
    );

    if (!updatedFile) {
      return res.status(404).json({
        message: "File not found",
      });
    }

    res.json(updatedFile);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update file",
      error: error.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deletedFile = await File.findByIdAndDelete(req.params.id);

    if (!deletedFile) {
      return res.status(404).json({
        message: "File not found",
      });
    }

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete file",
      error: error.message,
    });
  }
});

module.exports = router;