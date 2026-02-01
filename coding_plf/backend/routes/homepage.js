const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const authenticateToken = require("./../middleware/authenticateToken");
const HomePage = require("../models/HomePage");
const cloudinary = require("../config/cloudinary");

/* =========================
   COLLEGE GUARD
========================= */
const allowCollege = (req, res, next) => {
  if (req.user.role?.toLowerCase() !== "college") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

/* =========================
   CLOUDINARY UPLOAD
========================= */
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "homepage",
    resource_type: "auto",
  },
});
const upload = multer({ storage });

router.post(
  "/upload",
  authenticateToken,
  allowCollege,
  upload.single("file"),
  (req, res) => {
    res.json({ url: req.file.path });
  }
);

/* =========================
   PUBLIC – PUBLISHED ONLY
========================= */
router.get("/", async (req, res) => {
  const page = await HomePage.findOne({ status: "published" });
  res.json(page || {});
});

/* =========================
   ADMIN – DRAFT + PUBLISHED
========================= */
router.get(
  "/admin",
  authenticateToken,
  allowCollege,
  async (req, res) => {
    const page = (await HomePage.findOne()) || {};
    res.json(page);
  }
);

/* =========================
   SAVE / UPDATE (DRAFT | PUBLISH)
========================= */
router.put(
  "/",
  authenticateToken,
  allowCollege,
  async (req, res) => {
    // Prevent empty publish
    if (
      req.body.status === "published" &&
      (!req.body.hero?.title || !req.body.welcome?.content)
    ) {
      return res.status(400).json({
        message: "Hero title & Welcome content required to publish",
      });
    }

    const page = await HomePage.findOneAndUpdate(
      {},
      req.body,
      { upsert: true, new: true }
    );

    res.json({ success: true, page });
  }
);

module.exports = router;