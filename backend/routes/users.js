const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const bcrypt = require('bcryptjs');

// Get all users (admin only)
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('assignedHouses', 'name');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get a single user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Delete a user (admin only)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent deleting the last admin user
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last admin user' });
      }
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// Add a new user (admin only)
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this username or email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword, role, credits: 0 });
    await user.save();
    res.status(201).json({ message: 'User created successfully', user: { id: user._id, username, email, role } });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Update a user (admin only)
router.put('/:id', auth, isAdmin, async (req, res) => {
  try {
    const { username, email, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, role },
      { new: true }
    ).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Assign houses to a user (admin only)
router.post('/:userId/assign-houses', auth, isAdmin, async (req, res) => {
  try {
    const { houseIds } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: { assignedHouses: houseIds } },
      { new: true }
    ).populate('assignedHouses', 'name');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Houses assigned successfully', user });
  } catch (error) {
    console.error('Error assigning houses:', error);
    res.status(500).json({ message: 'Error assigning houses' });
  }
});

// Assign a single house to a user (admin only)
router.post('/:userId/assign-house', auth, isAdmin, async (req, res) => {
  try {
    const { houseId } = req.body;
    console.log('Assigning house:', houseId, 'to user:', req.params.userId);
    const user = await User.findById(req.params.userId);
    if (!user) {
      console.log('User not found:', req.params.userId);
      return res.status(404).json({ message: 'User not found' });
    }
    if (!user.assignedHouses.includes(houseId)) {
      user.assignedHouses.push(houseId);
      await user.save();
      console.log('House assigned successfully');
    } else {
      console.log('House already assigned to user');
    }
    const updatedUser = await User.findById(req.params.userId).populate('assignedHouses', 'name');
    res.json({ message: 'House assigned successfully', user: updatedUser });
  } catch (error) {
    console.error('Error assigning house:', error);
    res.status(500).json({ message: 'Error assigning house', error: error.message });
  }
});

// Remove a single house from a user (admin only)
router.post('/:userId/remove-house', auth, isAdmin, async (req, res) => {
  try {
    const { houseId } = req.body;
    console.log('Removing house:', houseId, 'from user:', req.params.userId);
    const user = await User.findById(req.params.userId);
    if (!user) {
      console.log('User not found:', req.params.userId);
      return res.status(404).json({ message: 'User not found' });
    }
    user.assignedHouses = user.assignedHouses.filter(id => id.toString() !== houseId);
    await user.save();
    console.log('House removed successfully');
    const updatedUser = await User.findById(req.params.userId).populate('assignedHouses', 'name');
    res.json({ message: 'House removed successfully', user: updatedUser });
  } catch (error) {
    console.error('Error removing house:', error);
    res.status(500).json({ message: 'Error removing house', error: error.message });
  }
});

// Add credits to a user (admin only)
router.post('/:userId/credits', auth, isAdmin, async (req, res) => {
  try {
    const { credits } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.credits += parseInt(credits);
    await user.save();
    res.json({ message: 'Credits added successfully', user });
  } catch (error) {
    console.error('Error adding credits:', error);
    res.status(500).json({ message: 'Error adding credits', error: error.message });
  }
});

// Get user's credits
router.get('/:userId/credits', auth, async (req, res) => {
  try {
    console.log('Fetching credits for user:', req.params.userId);
    const user = await User.findById(req.params.userId);
    if (!user) {
      console.log('User not found:', req.params.userId);
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('Credits fetched successfully:', user.credits);
    res.json({ credits: user.credits });
  } catch (error) {
    console.error('Error fetching credits:', error);
    res.status(500).json({ message: 'Error fetching credits', error: error.message });
  }
});

module.exports = router;