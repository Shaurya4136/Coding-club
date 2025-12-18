// controllers/clubProfileController.js
const ClubProfile = require('../models/ClubHeadProfile');

// Get Club Profile by ID
const getClubProfile = async (req, res) => {
  try {
    const profile = await ClubProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found.' });
    }
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create Club Profile
const createClubProfile = async (req, res) => {
  const { name, email, bio, foundedDate, activities, avatar } = req.body;

  try {
    const newProfile = new ClubProfile({ name, email, bio, foundedDate, activities, avatar });
    await newProfile.save();
    res.status(201).json(newProfile);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
};

// Update Club Profile
const updateClubProfile = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedProfile = await ClubProfile.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedProfile) {
      return res.status(404).json({ message: 'Profile not found.' });
    }

    res.status(200).json(updatedProfile);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
};

module.exports = { getClubProfile, updateClubProfile, createClubProfile };
