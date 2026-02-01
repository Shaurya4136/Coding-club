// routes/clubheadposts.js
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const ClubHeadPost = require("../../models/ClubHeadPost");
const authenticateToken = require("../../middleware/authenticateToken");
const ClubHeadProfile = require("../../models/ClubHeadProfile");
const User = require("../../models/User");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const DEFAULT_AVATAR = "/default-avatar.png";

// -------------------- Helpers --------------------

const formatComments = async (comments) => {
  return await Promise.all(
    comments.map(async (c) => {
      const profile = await ClubHeadProfile.findOne({ userId: c.userId });
      const userInfo = await User.findById(c.userId);

      const finalProfile = {
        name:
          (profile?.name || userInfo?.name || "Unknown").trim() || "Unknown",
        avatar: profile?.avatar || DEFAULT_AVATAR,
        role: profile?.role || userInfo?.role || "ClubHead",
      };

      return {
        _id: c._id,
        comment: c.comment,
        dateCommented: c.dateCommented,
        timeCommented: c.timeCommented,
        userId: c.userId,
        profile: finalProfile,
        likes: Array.isArray(c.likes) ? c.likes : [], // ✅ ensure likes present
      };
    })
  );
};

const formatPost = async (p) => {
  const profile = await ClubHeadProfile.findOne({ userId: p.userId });
  const userInfo = await User.findById(p.userId);

  let image = null;
  if (p.image && p.image.data && p.image.data.length) {
    image = `data:${p.image.contentType};base64,${p.image.data.toString(
      "base64"
    )}`;
  }

  return {
    _id: p._id,
    title: p.title,
    content: p.content,
    postType: "clubhead", // ✅ force correct type
    image,
    pollOptions: p.pollOptions || [],
    pollVotes: p.pollVotes || {},
    datePosted: p.datePosted || new Date().toLocaleDateString(),
    timePosted: p.timePosted || new Date().toLocaleTimeString(),
    likes: Array.isArray(p.likes) ? p.likes : [],
    profile: {
      name: profile?.name || userInfo?.name || "Unknown",
      avatar: profile?.avatar || userInfo?.avatar || DEFAULT_AVATAR,
      role: profile?.role || userInfo?.role || "ClubHead",
    },
    comments: await formatComments(p.comments || []),
    userId: p.userId,
  };
};

// -------------------- Routes --------------------

// GET all posts by all Club Heads
router.get("/", authenticateToken, async (req, res) => {
  try {
    const posts = await ClubHeadPost.find().sort({ createdAt: -1 });

    posts.forEach((p) => {
      console.log(
        "Fetched from DB ->",
        p.image ? p.image.contentType : null,
        p.image?.data?.length
      );
    });

    const formatted = await Promise.all(posts.map(formatPost));
    res.json(formatted);
  } catch (err) {
    console.error("Fetch all posts error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// GET posts by logged-in Club Head
router.get("/mine", authenticateToken, async (req, res) => {
  try {
    const loggedUserId =
      (req.user.id || req.user.userId || req.user._id).toString();
    const posts = await ClubHeadPost.find({ userId: loggedUserId }).sort({
      createdAt: -1,
    });

    const formatted = await Promise.all(posts.map(formatPost));
    res.json(formatted);
  } catch (err) {
    console.error("Fetch my posts error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Add new post
router.post(
  "/",
  authenticateToken,
  upload.single("poster"),
  async (req, res) => {
    try {
      console.log("req.body:", req.body);
      console.log("req.file:", req.file);

      let { title, content, postType, datePosted, pollOptions } = req.body;

      if (typeof pollOptions === "string") {
        try {
          pollOptions = JSON.parse(pollOptions);
        } catch {
          pollOptions = [];
        }
      }

      const loggedUserId =
        (req.user.id || req.user.userId || req.user._id).toString();

      const newPost = new ClubHeadPost({
        userId: loggedUserId,
        title,
        content,
        postType,
        pollOptions: pollOptions || [],
        datePosted: datePosted || new Date().toLocaleDateString(),
        timePosted: new Date().toLocaleTimeString(),
        comments: [],
      });

      if (req.file) {
        console.log(
          "Saving image:",
          req.file.originalname,
          req.file.mimetype,
          req.file.size
        );
        newPost.image = {
          data: req.file.buffer,
          contentType: req.file.mimetype,
        };
      } else {
        console.log("No image uploaded in this request");
      }

      await newPost.save();
      res.json(await formatPost(newPost));
    } catch (err) {
      console.error("Add post error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// Update post
router.put("/:id", authenticateToken, upload.single("poster"), async (req, res) => {
  try {
    const loggedUserId =
      (req.user.id || req.user.userId || req.user._id).toString();

    let updateFields = {
      title: req.body.title,
      content: req.body.content,
      postType: req.body.postType,
      pollOptions: req.body.pollOptions,
    };

    if (req.file) {
      updateFields.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    const updated = await ClubHeadPost.findOneAndUpdate(
      { _id: req.params.id, userId: loggedUserId },
      updateFields,
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Post not found" });
    res.json(await formatPost(updated));
  } catch (err) {
    console.error("Update post error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete post
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const loggedUserId =
      (req.user.id || req.user.userId || req.user._id).toString();

    await ClubHeadPost.findOneAndDelete({
      _id: req.params.id,
      userId: loggedUserId,
    });
    res.json({ message: "Post deleted" });
  } catch (err) {
    console.error("Delete post error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// -------------------- Comments --------------------

// Add comment to a post
router.post("/:id/comments", authenticateToken, async (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment?.trim())
      return res.status(400).json({ error: "Comment cannot be empty" });

    const post = await ClubHeadPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const loggedUserId =
      (req.user.id || req.user.userId || req.user._id).toString();
    const userId = new mongoose.Types.ObjectId(loggedUserId);

    console.log("➡️ Comment request from:", req.user.role, loggedUserId);

    const newComment = {
      userId,
      comment,
      dateCommented: new Date().toLocaleDateString(),
      timeCommented: new Date().toLocaleTimeString(),
      likes: [],
    };

    post.comments.push(newComment);
    await post.save();

    res.json(await formatPost(post));
  } catch (err) {
    console.error("Add comment error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all comments by logged-in user
router.get("/comments/mine", authenticateToken, async (req, res) => {
  try {
    const loggedUserId =
      (req.user.id || req.user.userId || req.user._id).toString();
    const userId = new mongoose.Types.ObjectId(loggedUserId);

    const posts = await ClubHeadPost.find({ "comments.userId": userId });

    const myComments = [];

    posts.forEach((p) => {
      p.comments.forEach((c) => {
        if (c.userId && c.userId.equals(userId)) {
          myComments.push({
            _id: c._id,
            text: c.comment,
            postId: p._id,
          });
        }
      });
    });

    res.json(myComments);
  } catch (err) {
    console.error("Fetch my comments error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update comment
router.put("/comments/:commentId", authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim())
      return res.status(400).json({ error: "Comment cannot be empty" });

    const post = await ClubHeadPost.findOne({
      "comments._id": req.params.commentId,
    });
    if (!post) return res.status(404).json({ error: "Comment not found" });

    const loggedUserId =
      (req.user.id || req.user.userId || req.user._id).toString();

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    if (comment.userId.toString() !== loggedUserId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    comment.comment = text;
    await post.save();

    res.json(await formatPost(post));
  } catch (err) {
    console.error("Update comment error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete comment
// Delete comment
router.delete("/comments/:commentId", authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;

    // Find the post that contains this comment
    const post = await ClubHeadPost.findOne({ "comments._id": commentId });
    if (!post) return res.status(404).json({ error: "Comment not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    const loggedUserId =
      (req.user.id || req.user.userId || req.user._id).toString();

    const commentUserId = comment.userId
      ? comment.userId.toString()
      : null;
    const postOwnerId = post.userId ? post.userId.toString() : null;

    const isCommentOwner = commentUserId === loggedUserId;
    const isPostOwner = postOwnerId === loggedUserId;
    const isAdminOrCollege =
      req.user.role === "Club Head" || req.user.role === "Admin";

    console.log("🗑️ ClubHeadPost delete comment debug:", {
      commentId,
      loggedUserId,
      commentUserId,
      postOwnerId,
      role: req.user.role,
      isCommentOwner,
      isPostOwner,
      isAdminOrCollege,
    });

    // ✅ allow: comment owner OR post owner OR admin/college
    if (!isCommentOwner && !isPostOwner && !isAdminOrCollege) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    comment.remove();
    await post.save();

    res.json({ message: "Comment deleted" });
  } catch (err) {
    console.error("Delete comment error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// ✅ Like/unlike a clubhead post
router.put("/:id/like", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const loggedUserId =
      (req.user.id || req.user.userId || req.user._id).toString();

    const post = await ClubHeadPost.findById(id);
    if (!post) return res.status(404).json({ error: "Club post not found" });

    if (!Array.isArray(post.likes)) post.likes = [];

    const alreadyLiked = post.likes.some(
      (uid) => uid.toString() === loggedUserId
    );

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (uid) => uid.toString() !== loggedUserId
      );
    } else {
      post.likes.push(loggedUserId);
    }

    await post.save();

    res.json({
      postId: post._id,
      likes: post.likes,
    });
  } catch (err) {
    console.error("Like clubhead post error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Like/unlike a comment on a ClubHead post
router.put(
  "/:postId/comments/:commentId/like",
  authenticateToken,
  async (req, res) => {
    try {
      const { postId, commentId } = req.params;
      const loggedUserId =
        (req.user.id || req.user.userId || req.user._id).toString();

      const post = await ClubHeadPost.findById(postId);
      if (!post) return res.status(404).json({ error: "Post not found" });

      const comment = post.comments.id(commentId);
      if (!comment) return res.status(404).json({ error: "Comment not found" });

      if (!Array.isArray(comment.likes)) comment.likes = [];

      const alreadyLiked = comment.likes.some(
        (uid) => uid.toString() === loggedUserId
      );

      if (alreadyLiked) {
        comment.likes = comment.likes.filter(
          (uid) => uid.toString() !== loggedUserId
        );
      } else {
        comment.likes.push(loggedUserId);
      }

      await post.save();

      return res.json({ commentId: comment._id, likes: comment.likes });
    } catch (err) {
      console.error("Like comment error:", err);
      if (!res.headersSent) res.status(500).json({ error: "Server error" });
    }
  }
);

// Poll vote
router.put("/:id/vote", authenticateToken, async (req, res) => {
  try {
    const { option } = req.body;
    const post = await ClubHeadPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (!post.pollVotes[option]) post.pollVotes[option] = [];
    const loggedUserId =
      (req.user.id || req.user.userId || req.user._id).toString();

    Object.keys(post.pollVotes).forEach((opt) => {
      post.pollVotes[opt] = post.pollVotes[opt].filter(
        (id) => id.toString() !== loggedUserId
      );
    });

    post.pollVotes[option].push(loggedUserId);
    await post.save();

    res.json(await formatPost(post));
  } catch (err) {
    console.error("Poll vote error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
