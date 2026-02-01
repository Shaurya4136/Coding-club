const express = require("express");
const HomepageCMS = require("../../models/HomepageCMS");
const authenticateToken = require("../../middleware/authenticateToken");
const router = express.Router();

/* ======================================================
   🔐 ONLY COLLEGE / ADMIN
====================================================== */
const allowCMS = (req, res, next) => {
  if (!["College", "Admin"].includes(req.user.role)) {
    return res.status(403).json({ message: "CMS access denied" });
  }
  next();
};

/* ======================================================
   🌍 PUBLIC HOMEPAGE (USED BY HomePage.jsx)
====================================================== */
router.get("/public", async (_, res) => {
  const page = await HomepageCMS.findOne({ status: "published" });
  res.json(page || {});
});

/* ======================================================
   🧠 CMS ADMIN FETCH
====================================================== */
router.get("/admin", authenticateToken, allowCMS, async (_, res) => {
  let page = await HomepageCMS.findOne();
  if (!page) page = await HomepageCMS.create({});
  res.json(page);
});

/* ======================================================
   💾 SAVE / PUBLISH
====================================================== */
router.put("/admin", authenticateToken, allowCMS, async (req, res) => {
  const updated = await HomepageCMS.findOneAndUpdate(
    {},
    req.body,
    { upsert: true, new: true }
  );
  res.json(updated);
});

/* ======================================================
   ➕ ADD ITEM (FEATURE / EVENT)
====================================================== */
router.post(
  "/section/:section/item",
  authenticateToken,
  allowCMS,
  async (req, res) => {
    const page = await HomepageCMS.findOne();
    page[req.params.section].items.push(req.body);
    await page.save();
    res.json(page);
  }
);

/* ======================================================
   ✏️ UPDATE ITEM
====================================================== */
router.put(
  "/section/:section/item/:id",
  authenticateToken,
  allowCMS,
  async (req, res) => {
    const page = await HomepageCMS.findOne();
    const item = page[req.params.section].items.id(req.params.id);
    Object.assign(item, req.body);
    await page.save();
    res.json(page);
  }
);

/* ======================================================
   ❌ DELETE ITEM
====================================================== */
router.delete(
  "/section/:section/item/:id",
  authenticateToken,
  allowCMS,
  async (req, res) => {
    const page = await HomepageCMS.findOne();
    page[req.params.section].items =
      page[req.params.section].items.filter(
        (i) => i._id.toString() !== req.params.id
      );
    await page.save();
    res.json(page);
  }
);

module.exports = router;