const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const pool = require("../config/db");

/* CREATE POST */
router.post("/", auth, async (req, res, next) => {
  try {
    const { title, content, status, scheduled_for } = req.body;

    const { rows } = await pool.query(
      `INSERT INTO posts (title, slug, content, status, author_id, scheduled_for)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        title,
        title.toLowerCase().replace(/\s+/g, "-"),
        content,
        status,
        req.user.id,
        scheduled_for || null
      ]
    );

    res.status(201).json(rows[0]);

  } catch (err) {
    next(err);
  }
});

module.exports = router;
