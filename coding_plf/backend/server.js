const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

/* ROUTES */
const authRoutes = require("./routes/authroutes");
const profileRoutes = require("./routes/profileRoutes");
const communityFeedRoutes = require("./routes/communityFeed");
const studentPostsRoutes = require("./routes/studentposts");
const clubHeadPostsRoutes = require("./routes/club head profile/clubheadposts");
const clubTeamRoutes = require("./routes/club head profile/clubTeamRoutes");
const clubUserOverviewRoutes = require("./routes/club head profile/clubUserOverview");
const collegeRoutes = require("./routes/college profile"); // ✅ ONLY ONCE
// const homepage = require("./routes/homepage");
const compilerRoutes = require("./routes/compiler");


const app = express();
const server = http.createServer(app);

/* ================= CORS ================= */
app.use(
  cors({
    origin: [
    "http://localhost:3000", // local dev
    "https://coding-club-frontend-dy6w.onrender.com" // deployed frontend
  ], // deployed frontend,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cache-Control"],
  })
);
app.options("*", cors());

/* ================= SOCKET ================= */
const io = new Server(server, {
  cors: { origin: "http://localhost:3000" },
});

app.use((req, _, next) => {
  req.io = io;
  next();
});

/* ================= MIDDLEWARE ================= */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ================= DB ================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(console.error);

/* ================= ROUTES ================= */
app.use("/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/feed", communityFeedRoutes);
app.use("/api/student-questions", studentPostsRoutes);
app.use("/api/clubheadposts", clubHeadPostsRoutes);
app.use("/api/club", clubTeamRoutes);
app.use("/api/club", clubUserOverviewRoutes);
app.use("/api/college", collegeRoutes);
// app.use("/api/homepage", require("./routes/homepage"));
app.use("/api/compiler", compilerRoutes);
app.use("/api/contact", require("./routes/contact"));

/* ================= START ================= */
server.listen(5000, () =>
  console.log("🚀 Server running on http://localhost:5000")
);
