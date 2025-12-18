// Import required modules
const express = require('express');
const router = express.Router(); // Initialize the router
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust the path as necessary

// Registration endpoint
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // Save the new user to the database
    await newUser.save();

    // Generate a JWT token for the new user
    const token = jwt.sign({ userId: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Determine the redirect URL based on the user's role
    let redirectUrl;
    switch (newUser.role) {
      case 'Student':
        redirectUrl = '/student-community';
        break;
      case 'Club Head':
        redirectUrl = '/club-community';
        break;
      case 'College':
        redirectUrl = '/college-community';
        break;
      default:
        redirectUrl = '/';
    }

    // Send a success response with the token and redirect URL
    res.status(201).json({ success: true, token, redirectUrl });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check role
    if (user.role !== role) {
      return res.status(403).json({ message: 'Access denied for this role' });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Determine the redirect URL based on the user's role
    let redirectUrl;
    switch (user.role) {
      case 'Student':
        redirectUrl = '/student-community';
        break;
      case 'Club Head':
        redirectUrl = '/club-community';
        break;
      case 'College':
        redirectUrl = '/college-community';
        break;
      default:
        redirectUrl = '/';
    }

    // Send response with token and redirect URL
    res.json({ success: true, token, redirectUrl });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export the router
module.exports = router;
