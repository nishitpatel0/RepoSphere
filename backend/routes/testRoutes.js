const express = require("express");
const supabase = require("../config/supabase");

const router = express.Router();

router.get("/supabase", async (req, res) => {
  try {
    const { data, error } = await supabase.storage
      .from("repositories")
      .list();

    if (error) {
      return res.status(500).json({
        message: "Supabase connection failed",
        error: error.message
      });
    }

    res.status(200).json({
      message: "Supabase connected successfully",
      files: data
    });
  } catch (error) {
    res.status(500).json({
      message: "Supabase test failed",
      error: error.message
    });
  }
});

module.exports = router;