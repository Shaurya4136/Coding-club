const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const axios = require('axios');
require('dotenv').config();

const authRoutes = require('./routes/authroutes');
const profileRoutes = require('./routes/profileRoutes'); // dynamic profile route
const communityFeedRoutes = require('./routes/communityFeed');
const studentPostsRoutes = require('./routes/studentposts');
const clubHeadPostsRoutes = require('./routes/clubheadposts'); // <-- Added
const clubTeamRoutes = require('./routes/clubTeamRoutes.js');
const clubUserOverviewRoutes = require("./routes/clubUserOverview");
const app = express();

// ------------------------
// Body parser with size limit
// ------------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(cookieParser());

// ------------------------
// CORS setup
// ------------------------
app.use(cors({
  origin: 'http://localhost:3000', // your React frontend
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true,
}));

// ------------------------
// MongoDB connection
// ------------------------
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected successfully to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ------------------------
// Judge0 code execution
// ------------------------
const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com/submissions';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

app.post('/execute-code', async (req, res) => {
  const { code, language } = req.body;
  const languageMap = { python3: 71, javascript: 63, cpp: 54, java: 62 };
  const language_id = languageMap[language];

  if (!language_id) return res.status(400).json({ error: 'Unsupported language' });

  try {
    const response = await axios.post(
      `${JUDGE0_API_URL}?base64_encoded=false&wait=true`,
      { source_code: code, language_id },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
          'x-rapidapi-key': RAPIDAPI_KEY,
        },
      }
    );

    const { stdout, stderr } = response.data;
    res.json({ output: stderr || stdout });
  } catch (error) {
    res.status(500).json({ error: 'Failed to execute code' });
  }
});

// ------------------------
// Multer setup for file uploads (event posters)
// ------------------------
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // files stored in ./uploads

// ------------------------
// API Routes
// ------------------------
app.use('/auth', authRoutes);                  // Authentication
app.use('/api/profile', profileRoutes);       // Dynamic profile route (Student/Club/College)
app.use('/api/student-questions', studentPostsRoutes); 
app.use('/api/feed', communityFeedRoutes);     // Community feed
app.use("/api/clubheadposts", clubHeadPostsRoutes);
// app.use("/uploads", express.static("uploads"));
app.use("/api/club", clubTeamRoutes);
app.use("/api/club", clubUserOverviewRoutes); // ✅ ADD THIS


// ------------------------
// Root / test route
// ------------------------
app.get('/', (req, res) => res.send('Server is running'));

// ------------------------
// Start server
// ------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
