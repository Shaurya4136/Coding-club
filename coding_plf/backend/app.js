const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authroutes');
const cors = require('cors');

const app = express();
connectDB();

const cors = require('cors');
app.use(cors());


app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

module.exports = app;
