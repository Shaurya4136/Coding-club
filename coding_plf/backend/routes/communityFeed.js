const express = require("express");
const router = express.Router();
const StudentQuestion = require("../models/Studentpost");
const authenticateToken = require("../middleware/authenticateToken");
const StudentProfile = require("../models/StudentProfil");
const ClubHeadPost = require("../models/ClubHeadPost");
const ClubHeadProfile = require("../models/ClubHeadProfile");

// ---------- Helpers ----------
const formatPost = (post) => {
  const user = post.user || {};
  return {
    _id: post._id,
    description: post.description,
    image: post.image,
    datePosted: post.createdAt,
    tags: post.tags || [],
    profile: {
      name: user.name || "Unknown",
      role: user.role || "Club",
      avatar: user.avatar || "/default-avatar.png",
    },
    comments: post.comments || [],
  };
};

const formatQuestion = async (q) => {
  const qProfile = await StudentProfile.findOne({ userId: q.userId._id });

  const questionOwner = {
    _id: q.userId._id,
    name: q.userId.name,
    role: q.userId.role,
    avatar: qProfile?.avatar || "/default-avatar.png",
  };

  const answersWithAvatars = await Promise.all(
    (q.answers || []).map(async (a) => {
      const aProfile = await StudentProfile.findOne({ userId: a.userId._id });

      // ⭐ map nested replies for each answer
      const replies = await Promise.all(
        (a.replies || []).map(async (r) => {
          const rProfile = await StudentProfile.findOne({ userId: r.userId._id });

          return {
            _id: r._id,
            comment: r.reply, // DB field is `reply`, we expose it as `comment`
            likes: Array.isArray(r.likes) ? r.likes : [],
            userId: r.userId._id,
            profile: {
              _id: r.userId._id,
              name: r.userId.name,
              role: r.userId.role,
              avatar: rProfile?.avatar || "/default-avatar.png",
            },
            dateCommented: r.dateReplied,
            timeCommented: r.timeReplied,
          };
        })
      );

      return {
        _id: a._id,
        answer: a.answer,
        likes: Array.isArray(a.likes) ? a.likes : [],
        profile: {
          _id: a.userId._id,
          name: a.userId.name,
          role: a.userId.role,
          avatar: aProfile?.avatar || "/default-avatar.png",
        },
        createdAt:
          a.dateAnswered && a.timeAnswered
            ? new Date(`${a.dateAnswered}T${a.timeAnswered}`)
            : new Date(),
        userId: a.userId._id,
        dateAnswered: a.dateAnswered,
        timeAnswered: a.timeAnswered,
        replies, // ⭐ nested replies included here
      };
    })
  );

  return {
    _id: q._id,
    question: q.question,
    content: q.question,
    datePosted: q.datePosted,
    timePosted: q.timePosted,
    tags: q.tags,
    likes: q.likes || [],
    profile: questionOwner,
    answers: answersWithAvatars,
    postType: "student", // ⭐ so feed knows it's a student post
  };
};

// ⭐ NEW: safe helper to read logged user id in all routes
const getLoggedUserId = (user) =>
  (user?._id || user?.id || user?.userId || "").toString();

// ---------- Routes ----------

// ---------- GET combined feed (students + clubs) ----------
router.get("/all", authenticateToken, async (req, res) => {
  try {
    // 🧩 STUDENT POSTS
    const studentPosts = await StudentQuestion.find()
      .populate("userId", "name role avatar")
      .populate("answers.userId", "name role avatar")
      .populate("answers.replies.userId", "name role avatar") // ⭐ NEW
      .sort({ datePosted: -1, timePosted: -1 });

    const formattedStudents = await Promise.all(
      studentPosts.map((q) => formatQuestion(q))
    );

    // 🧩 CLUBHEAD POSTS
    const clubPosts = await ClubHeadPost.find()
      .populate("userId", "name role avatar")
      .populate("comments.userId", "name role avatar")
      .populate("comments.replies.userId", "name role avatar") // ⭐ NEW
      .sort({ createdAt: -1 });

    const formattedClub = await Promise.all(
      clubPosts.map(async (p) => {
        const profile = await ClubHeadProfile.findOne({ userId: p.userId._id });
        const imageUrl =
          p.image?.data && p.image?.contentType
            ? `data:${p.image.contentType};base64,${Buffer.from(
                p.image.data
              ).toString("base64")}`
            : null;

        const commentsWithLikes = (p.comments || []).map((c) => {
          const replies = (c.replies || []).map((r) => ({
            _id: r._id,
            comment: r.comment,
            likes: Array.isArray(r.likes) ? r.likes : [],
            userId: r.userId?._id,
            profile: {
              _id: r.userId?._id,
              name: r.userId?.name || "Unknown User",
              role: r.userId?.role || "Member",
              avatar: r.userId?.avatar || "/default-avatar.png",
            },
            dateCommented: r.dateCommented,
            timeCommented: r.timeCommented,
          }));

          return {
            _id: c._id,
            comment: c.comment,
            likes: Array.isArray(c.likes) ? c.likes : [],
            userId: c.userId?._id,
            profile: {
              _id: c.userId?._id,
              name: c.userId?.name || "Unknown User",
              role: c.userId?.role || "Member",
              avatar: c.userId?.avatar || "/default-avatar.png",
            },
            dateCommented: c.dateCommented,
            timeCommented: c.timeCommented,
            replies, // ⭐ nested replies here
          };
        });

        return {
          _id: p._id,
          title: p.title,
          content: p.content,
          image: imageUrl,
          datePosted: p.createdAt?.toISOString(),
          postType: "clubhead",
          likes: Array.isArray(p.likes) ? p.likes : [],
          pollOptions: p.pollOptions || [],
          pollVotes: p.pollVotes || {},
          tags: p.tags || [],
          profile: {
            _id: p.userId._id,
            name: profile?.name || p.userId?.name || "Unknown",
            role: profile?.role || p.userId?.role || "ClubHead",
            avatar:
              profile?.avatar || p.userId?.avatar || "/default-avatar.png",
          },
          comments: commentsWithLikes,
        };
      })
    );

    const combinedFeed = [...formattedStudents, ...formattedClub].sort(
      (a, b) => new Date(b.datePosted) - new Date(a.datePosted)
    );

    res.json(combinedFeed);
  } catch (err) {
    console.error("❌ Fetch combined feed error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// ---------- ClubHead comment replies (add/edit/delete/like) ----------
router.post(
  "/:postId/comments/:commentId/replies",
  authenticateToken,
  async (req, res) => {
    try {
      const { postId, commentId } = req.params;
      const { comment } = req.body;
      const userId = req.user._id;

      if (!comment?.trim()) {
        return res.status(400).json({ message: "Reply cannot be empty" });
      }

      const post = await ClubHeadPost.findById(postId)
        .populate("userId", "name role avatar")
        .populate("comments.userId", "name role avatar")
        .populate("comments.replies.userId", "name role avatar");

      if (!post)
        return res.status(404).json({ message: "Club post not found" });

      const parentComment = post.comments.id(commentId);
      if (!parentComment) {
        return res
          .status(404)
          .json({ message: "Parent comment not found" });
      }

      const now = new Date();
      const [date, timeRaw] = now.toISOString().split("T");
      const time = timeRaw.split(".")[0];

      parentComment.replies.push({
        userId,
        comment,
        dateCommented: date,
        timeCommented: time,
        likes: [],
      });

      await post.save();

      const populated = await ClubHeadPost.findById(postId)
        .populate("userId", "name role avatar")
        .populate("comments.userId", "name role avatar")
        .populate("comments.replies.userId", "name role avatar");

      return res.json(populated);
    } catch (err) {
      console.error("Add reply (club comment) error:", err);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

router.put(
  "/:postId/comments/:commentId/replies/:replyId",
  authenticateToken,
  async (req, res) => {
    try {
      const { postId, commentId, replyId } = req.params;
      const { comment } = req.body;
      const userId = req.user._id.toString();

      if (!comment?.trim()) {
        return res.status(400).json({ message: "Reply text is required" });
      }

      const post = await ClubHeadPost.findById(postId);
      if (!post)
        return res.status(404).json({ message: "Club post not found" });

      const parentComment = post.comments.id(commentId);
      if (!parentComment)
        return res
          .status(404)
          .json({ message: "Parent comment not found" });

      const reply = parentComment.replies.id(replyId);
      if (!reply)
        return res.status(404).json({ message: "Reply not found" });

      if (reply.userId.toString() !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      reply.comment = comment;
      reply.updatedAt = new Date();

      await post.save();

      const populated = await ClubHeadPost.findById(postId)
        .populate("userId", "name role avatar")
        .populate("comments.userId", "name role avatar")
        .populate("comments.replies.userId", "name role avatar");

      return res.json({ message: "Reply updated", post: populated });
    } catch (err) {
      console.error("Edit reply (club comment) error:", err);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

router.delete(
  "/:postId/comments/:commentId/replies/:replyId",
  authenticateToken,
  async (req, res) => {
    try {
      const { postId, commentId, replyId } = req.params;
      const userId = req.user._id.toString();

      const post = await ClubHeadPost.findById(postId);
      if (!post)
        return res.status(404).json({ message: "Club post not found" });

      const parentComment = post.comments.id(commentId);
      if (!parentComment)
        return res
          .status(404)
          .json({ message: "Parent comment not found" });

      const reply = parentComment.replies.id(replyId);
      if (!reply)
        return res.status(404).json({ message: "Reply not found" });

      if (reply.userId.toString() !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      parentComment.replies.pull(replyId);

      await post.save();

      const populated = await ClubHeadPost.findById(postId)
        .populate("userId", "name role avatar")
        .populate("comments.userId", "name role avatar")
        .populate("comments.replies.userId", "name role avatar");

      return res.json({ message: "Reply deleted", post: populated });
    } catch (err) {
      console.error("Delete reply (club comment) error:", err);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

router.put(
  "/:postId/comments/:commentId/replies/:replyId/like",
  authenticateToken,
  async (req, res) => {
    try {
      const { postId, commentId, replyId } = req.params;
      const userId = req.user._id;

      const post = await ClubHeadPost.findById(postId);
      if (!post)
        return res.status(404).json({ message: "Club post not found" });

      const parentComment = post.comments.id(commentId);
      if (!parentComment)
        return res
          .status(404)
          .json({ message: "Parent comment not found" });

      const reply = parentComment.replies.id(replyId);
      if (!reply)
        return res.status(404).json({ message: "Reply not found" });

      if (!Array.isArray(reply.likes)) reply.likes = [];

      const alreadyLiked = reply.likes.some(
        (id) => id.toString() === userId.toString()
      );

      if (alreadyLiked) {
        reply.likes = reply.likes.filter(
          (id) => id.toString() !== userId.toString()
        );
      } else {
        reply.likes.push(userId);
      }

      await post.save();

      const populated = await ClubHeadPost.findById(postId)
        .populate("userId", "name role avatar")
        .populate("comments.userId", "name role avatar")
        .populate("comments.replies.userId", "name role avatar");

      return res.json(populated);
    } catch (err) {
      console.error("Like reply (club comment) error:", err);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

// ---------- Student answer replies (add/edit/delete/like) ----------
router.post(
  "/:questionId/answers/:answerId/replies",
  authenticateToken,
  async (req, res) => {
    try {
      const { questionId, answerId } = req.params;
      const { comment } = req.body;
      const userId = req.user._id;

      if (!comment?.trim()) {
        return res.status(400).json({ message: "Reply cannot be empty" });
      }

      const question = await StudentQuestion.findById(questionId)
        .populate("userId", "name role avatar")
        .populate("answers.userId", "name role avatar")
        .populate("answers.replies.userId", "name role avatar");

      if (!question)
        return res.status(404).json({ message: "Question not found" });

      const answer = question.answers.id(answerId);
      if (!answer)
        return res.status(404).json({ message: "Answer not found" });

      const now = new Date();
      const [date, timeRaw] = now.toISOString().split("T");
      const time = timeRaw.split(".")[0];

      // note: schema uses `reply` field
      answer.replies.push({
        userId,
        reply: comment,
        dateReplied: date,
        timeReplied: time,
        likes: [],
      });

      await question.save();

      const populated = await StudentQuestion.findById(questionId)
        .populate("userId", "name role avatar")
        .populate("answers.userId", "name role avatar")
        .populate("answers.replies.userId", "name role avatar");

      return res.json(await formatQuestion(populated));
    } catch (err) {
      console.error("Add reply (student answer) error:", err);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

router.put(
  "/:questionId/answers/:answerId/replies/:replyId",
  authenticateToken,
  async (req, res) => {
    try {
      const { questionId, answerId, replyId } = req.params;
      const { comment } = req.body;
      const userId = req.user._id.toString();

      if (!comment?.trim()) {
        return res.status(400).json({ message: "Reply text is required" });
      }

      const question = await StudentQuestion.findById(questionId);
      if (!question)
        return res.status(404).json({ message: "Question not found" });

      const answer = question.answers.id(answerId);
      if (!answer)
        return res.status(404).json({ message: "Answer not found" });

      const reply = answer.replies.id(replyId);
      if (!reply)
        return res.status(404).json({ message: "Reply not found" });

      if (reply.userId.toString() !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      reply.reply = comment;
      reply.updatedAt = new Date();

      await question.save();

      const populated = await StudentQuestion.findById(questionId)
        .populate("userId", "name role avatar")
        .populate("answers.userId", "name role avatar")
        .populate("answers.replies.userId", "name role avatar");

      return res.json(await formatQuestion(populated));
    } catch (err) {
      console.error("Edit reply (student answer) error:", err);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

router.delete(
  "/:questionId/answers/:answerId/replies/:replyId",
  authenticateToken,
  async (req, res) => {
    try {
      const { questionId, answerId, replyId } = req.params;
      const userId = req.user._id.toString();

      const question = await StudentQuestion.findById(questionId);
      if (!question)
        return res.status(404).json({ message: "Question not found" });

      const answer = question.answers.id(answerId);
      if (!answer)
        return res.status(404).json({ message: "Answer not found" });

      const reply = answer.replies.id(replyId);
      if (!reply)
        return res.status(404).json({ message: "Reply not found" });

      if (reply.userId.toString() !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      answer.replies.pull(replyId);

      await question.save();

      const populated = await StudentQuestion.findById(questionId)
        .populate("userId", "name role avatar")
        .populate("answers.userId", "name role avatar")
        .populate("answers.replies.userId", "name role avatar");

      return res.json(await formatQuestion(populated));
    } catch (err) {
      console.error("Delete reply (student answer) error:", err);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

router.put(
  "/:questionId/answers/:answerId/replies/:replyId/like",
  authenticateToken,
  async (req, res) => {
    try {
      const { questionId, answerId, replyId } = req.params;
      const userId = req.user._id;

      const question = await StudentQuestion.findById(questionId);
      if (!question)
        return res.status(404).json({ message: "Question not found" });

      const answer = question.answers.id(answerId);
      if (!answer)
        return res.status(404).json({ message: "Answer not found" });

      const reply = answer.replies.id(replyId);
      if (!reply)
        return res.status(404).json({ message: "Reply not found" });

      if (!Array.isArray(reply.likes)) reply.likes = [];

      const alreadyLiked = reply.likes.some(
        (id) => id.toString() === userId.toString()
      );

      if (alreadyLiked) {
        reply.likes = reply.likes.filter(
          (id) => id.toString() !== userId.toString()
        );
      } else {
        reply.likes.push(userId);
      }

      await question.save();

      const populated = await StudentQuestion.findById(questionId)
        .populate("userId", "name role avatar")
        .populate("answers.userId", "name role avatar")
        .populate("answers.replies.userId", "name role avatar");

      return res.json(await formatQuestion(populated));
    } catch (err) {
      console.error("Like reply (student answer) error:", err);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

// ---------- Add comment/answer ----------
router.post("/:postId/comments", authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { comment } = req.body;
    const { _id: rawUserId, role } = req.user;

    if (!comment?.trim())
      return res
        .status(400)
        .json({ message: "Comment cannot be empty" });

    const userId = rawUserId;

    const now = new Date();

    if (role === "Student") {
      // Handle Student's answer
      const question = await StudentQuestion.findById(postId);
      if (!question)
        return res
          .status(404)
          .json({ message: "Student post not found" });

      question.answers.push({
        userId,
        answer: comment,
        dateAnswered: now.toISOString().split("T")[0],
        timeAnswered: now.toISOString().split("T")[1].split(".")[0],
        likes: [],
      });

      await question.save();

      const populated = await StudentQuestion.findById(postId)
        .populate("userId", "name role avatar")
        .populate("answers.userId", "name role avatar")
        .populate("answers.replies.userId", "name role avatar");

      return res.json(await formatQuestion(populated));
    }

    if (role === "club head" || role === "ClubHead") {
      // Handle ClubHead comment
      const post = await ClubHeadPost.findById(postId);
      if (!post)
        return res
          .status(404)
          .json({ message: "Club post not found" });

      post.comments.push({
        userId,
        comment,
        dateCommented: now.toISOString().split("T")[0],
        timeCommented: now.toISOString().split("T")[1].split(".")[0],
      });

      await post.save();
      return res.json(post);
    }

    return res
      .status(403)
      .json({ message: "Invalid role for commenting" });
  } catch (err) {
    console.error("Add comment error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// ---------- Edit comment/answer ----------
router.put(
  "/:postId/comments/:commentId",
  authenticateToken,
  async (req, res) => {
    const { postId, commentId } = req.params;
    const { comment } = req.body;
    const loggedUserId = getLoggedUserId(req.user);

    console.log("✏️ Edit request:", {
      postId,
      commentId,
      comment,
      loggedUserId,
    });

    if (!comment || !comment.trim()) {
      return res
        .status(400)
        .json({ message: "Comment text is required" });
    }

    try {
      // 1️⃣ Try StudentQuestion → answers[]
      let question = await StudentQuestion.findById(postId);
      if (question) {
        const answer = question.answers.id(commentId);

        if (!answer) {
          console.log("⚠️ Answer not found in StudentQuestion", {
            postId,
            commentId,
          });
          return res
            .status(404)
            .json({ message: "Answer not found" });
        }

        const answerOwnerId = answer.userId?.toString();
        const questionOwnerId = question.userId?.toString();
        const isAnswerOwner = answerOwnerId === loggedUserId;
        const isQuestionOwner = questionOwnerId === loggedUserId;
        const isAdminOrCollege =
          req.user.role === "College" || req.user.role === "Admin";

        if (!isAnswerOwner && !isQuestionOwner && !isAdminOrCollege) {
          console.log("⛔ Not authorized to edit this answer", {
            loggedUserId,
          });
          return res
            .status(403)
            .json({ message: "Not authorized" });
        }

        answer.answer = comment;
        await question.save();

        console.log("✅ Student answer updated");
        return res.json({ message: "Updated successfully", post: question });
      }

      // 2️⃣ Otherwise, try ClubHeadPost → comments[]
      let clubPost = await ClubHeadPost.findById(postId);
      if (!clubPost) {
        console.log(
          "❌ No StudentQuestion or ClubHeadPost found for postId",
          postId
        );
        return res.status(404).json({ message: "Post not found" });
      }

      const comm = clubPost.comments.id(commentId);
      if (!comm) {
        console.log("⚠️ Comment not found in ClubHeadPost", {
          postId,
          commentId,
        });
        return res
          .status(404)
          .json({ message: "Comment not found" });
      }

      const commentOwnerId = comm.userId?.toString();
      const postOwnerId = clubPost.userId?.toString();
      const isCommentOwner = commentOwnerId === loggedUserId;
      const isPostOwner = postOwnerId === loggedUserId;
      const isAdminOrCollege =
        req.user.role === "College" || req.user.role === "Admin";

      if (!isCommentOwner && !isPostOwner && !isAdminOrCollege) {
        console.log("⛔ Not authorized to edit this comment", {
          loggedUserId,
        });
        return res
          .status(403)
          .json({ message: "Not authorized" });
      }

      comm.comment = comment;
      await clubPost.save();

      console.log("✅ ClubHead comment updated");
      return res.json({ message: "Updated successfully", post: clubPost });
    } catch (err) {
      console.error("Edit comment error:", err);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

// ---------- NEW: delete STUDENT answers ----------
// ---------- delete STUDENT answers (safe) ----------
router.delete(
  "/:postId/answers/:answerId",
  authenticateToken,
  async (req, res) => {
    try {
      const { postId, answerId } = req.params;
      const loggedUserId = getLoggedUserId(req.user);
      const role = req.user.role;

      if (!loggedUserId) {
        return res
          .status(401)
          .json({ message: "Invalid user in token" });
      }

      const question = await StudentQuestion.findById(postId);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      const answer = question.answers.id(answerId);
      if (!answer) {
        return res.status(404).json({ message: "Answer not found" });
      }

      const answerOwnerId = answer.userId?.toString();
      const questionOwnerId = question.userId?.toString();
      const isAnswerOwner = answerOwnerId === loggedUserId;
      const isQuestionOwner = questionOwnerId === loggedUserId;
      const isAdminOrCollege = role === "College" || role === "Admin";

      if (!isAnswerOwner && !isQuestionOwner && !isAdminOrCollege) {
        return res.status(403).json({ message: "Not authorized" });
      }

      // ✅ use pull instead of answer.remove() to avoid weird edge cases
      question.answers.pull(answerId);
      await question.save();

      return res.json({ message: "Answer deleted" });
    } catch (err) {
      console.error("Delete answer error:", err);
      return res
        .status(500)
        .json({ message: "Server Error", error: err.message });
    }
  }
);


// ---------- FIXED: Delete comment/answer (ClubHead comments branch here) ----------
// ---------- Delete comment/answer (Student answers + ClubHead comments, safe) ----------
router.delete(
  "/:postId/comments/:commentId",
  authenticateToken,
  async (req, res) => {
    try {
      const { postId, commentId } = req.params;
      const loggedUserId = getLoggedUserId(req.user);
      const role = req.user.role;

      if (!loggedUserId) {
        console.error("Delete comment error: invalid req.user:", req.user);
        return res.status(401).json({ message: "Invalid user in token" });
      }

      // 1️⃣ Try StudentQuestion → answers[] (for old calls that still use /comments)
      let question = await StudentQuestion.findById(postId);
      if (question) {
        const answer = question.answers.id(commentId);
        if (!answer) {
          return res.status(404).json({ message: "Answer not found" });
        }

        const answerOwnerId = answer.userId?.toString();
        const questionOwnerId = question.userId?.toString();
        const isAnswerOwner = answerOwnerId === loggedUserId;
        const isQuestionOwner = questionOwnerId === loggedUserId;
        const isAdminOrCollege = role === "College" || role === "Admin";

        if (!isAnswerOwner && !isQuestionOwner && !isAdminOrCollege) {
          return res.status(403).json({ message: "Not authorized" });
        }

        // ✅ again, use pull instead of answer.remove()
        question.answers.pull(commentId);
        await question.save();

        return res.json({ message: "Answer deleted" });
      }

      // 2️⃣ Otherwise, ClubHeadPost → comments[]
      const clubPost = await ClubHeadPost.findById(postId);
      if (!clubPost) {
        return res.status(404).json({ message: "Club post not found" });
      }

      const comment = clubPost.comments.id(commentId);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      const commentOwnerId = comment.userId?.toString();
      const postOwnerId = clubPost.userId?.toString();
      const isCommentOwner = commentOwnerId === loggedUserId;
      const isPostOwner = postOwnerId === loggedUserId;
      const isAdminOrCollege = role === "College" || role === "Admin";

      if (!isCommentOwner && !isPostOwner && !isAdminOrCollege) {
        return res.status(403).json({ message: "Not authorized" });
      }

      clubPost.comments.pull(commentId);
      await clubPost.save();

      return res.json({ message: "Comment deleted" });
    } catch (err) {
      console.error("Delete comment error:", err);
      return res
        .status(500)
        .json({ message: "Server Error", error: err.message });
    }
  }
);


// ---------- Like Post (Student or ClubHead) ----------
router.put("/:postId/like", authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    // Try StudentQuestion first
    let post = await StudentQuestion.findById(postId);
    if (post) {
      if (!Array.isArray(post.likes)) post.likes = [];

      const alreadyLiked = post.likes.some(
        (id) => id.toString() === userId.toString()
      );
      if (alreadyLiked) {
        post.likes = post.likes.filter(
          (id) => id.toString() !== userId.toString()
        );
      } else {
        post.likes.push(userId);
      }

      await post.save();

      const populated = await StudentQuestion.findById(postId)
        .populate("userId", "name role avatar")
        .populate("answers.userId", "name role avatar")
        .populate("answers.replies.userId", "name role avatar");

      return res.json({
        post: await formatQuestion(populated),
      });
    }

    // Otherwise, try ClubHeadPost
    post = await ClubHeadPost.findById(postId);
    if (!post)
      return res.status(404).json({ message: "Post not found" });

    if (!Array.isArray(post.likes)) post.likes = [];

    const alreadyLiked = post.likes.some(
      (id) => id.toString() === userId.toString()
    );
    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      post.likes.push(userId);
    }

    await post.save();

    const populatedClub = await ClubHeadPost.findById(postId)
      .populate("userId", "name role avatar")
      .populate("comments.userId", "name role avatar");

    return res.json(populatedClub);
  } catch (err) {
    console.error("Like Post error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// ---------- Like ClubHead Comment ----------
router.put(
  "/:postId/comments/:commentId/like",
  authenticateToken,
  async (req, res) => {
    try {
      const { postId, commentId } = req.params;
      const userId = req.user._id;

      const post = await ClubHeadPost.findById(postId);
      if (!post)
        return res
          .status(404)
          .json({ message: "Club post not found" });

      const comment = post.comments.id(commentId);
      if (!comment)
        return res
          .status(404)
          .json({ message: "Comment not found" });

      if (!Array.isArray(comment.likes)) comment.likes = [];

      const alreadyLiked = comment.likes.some(
        (id) => id.toString() === userId.toString()
      );
      if (alreadyLiked) {
        comment.likes = comment.likes.filter(
          (id) => id.toString() !== userId.toString()
        );
      } else {
        comment.likes.push(userId);
      }

      await post.save();

      const populated = await ClubHeadPost.findById(postId)
        .populate("userId", "name role avatar")
        .populate("comments.userId", "name role avatar");

      return res.json(populated);
    } catch (err) {
      console.error("Like Comment error:", err);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

// ---------- Like Student answers ----------
router.put(
  "/:questionId/answers/:answerId/like",
  authenticateToken,
  async (req, res) => {
    try {
      const { questionId, answerId } = req.params;
      const userId = req.user._id;

      const question = await StudentQuestion.findById(questionId);
      if (!question)
        return res.status(404).json({ message: "Question not found" });

      const answer = question.answers.id(answerId);
      if (!answer)
        return res.status(404).json({ message: "Answer not found" });

      if (answer.likes.includes(userId)) answer.likes.pull(userId);
      else answer.likes.push(userId);

      await question.save();

      const populated = await StudentQuestion.findById(questionId)
        .populate("userId", "name role")
        .populate("answers.userId", "name role")
        .populate("answers.replies.userId", "name role");

      res.json(await formatQuestion(populated));
    } catch (err) {
      console.error("Like answer error:", err);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

module.exports = router;
