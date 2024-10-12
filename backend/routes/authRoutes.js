const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Middleware to check if user is authenticated
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const user = await User.findOne({ $or: [{ username }, { email: username }] });
    if (!user) {
      console.log('Login attempt with non-existent username/email:', username);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Login attempt with incorrect password for user:', username);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Create and sign JWT
    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    console.log('User logged in:', { username: user.username, email: user.email, role: user.role, userId: user._id });
    
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Get user info route
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      console.log('User not found for id:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('User info retrieved:', { username: user.username, email: user.email, userId: user._id });
    res.json(user);
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;