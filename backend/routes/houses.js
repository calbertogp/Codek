const express = require('express');
const House = require('../models/House');
const Booking = require('../models/Booking');
const User = require('../models/User');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const router = express.Router();

// Get all houses (for admin) or assigned houses (for regular users)
router.get('/', auth, async (req, res) => {
  try {
    let houses;
    if (req.user.role === 'admin') {
      houses = await House.find();
    } else {
      const user = await User.findById(req.user.id).populate('assignedHouses');
      houses = user.assignedHouses;
    }
    res.json(houses);
  } catch (error) {
    console.error('Error fetching houses:', error);
    res.status(500).json({ message: 'Error fetching houses' });
  }
});

// Get a single house by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const house = await House.findById(req.params.id);
    if (!house) {
      return res.status(404).json({ message: 'House not found' });
    }
    res.json(house);
  } catch (error) {
    console.error('Error fetching house:', error);
    res.status(500).json({ message: 'Error fetching house' });
  }
});

// Add a new house (admin only)
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const house = new House(req.body);
    await house.save();
    res.status(201).json(house);
  } catch (error) {
    console.error('Error creating house:', error);
    res.status(500).json({ message: 'Error creating house' });
  }
});

// Update a house (admin only)
router.put('/:id', auth, isAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    const house = await House.findByIdAndUpdate(
      req.params.id, 
      { name, description },
      { new: true, runValidators: true }
    );
    if (!house) {
      return res.status(404).json({ message: 'House not found' });
    }
    res.json(house);
  } catch (error) {
    console.error('Error updating house:', error);
    res.status(500).json({ message: 'Error updating house' });
  }
});

// Delete a house (admin only)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const house = await House.findById(req.params.id);
    if (!house) {
      return res.status(404).json({ message: 'House not found' });
    }

    // Check for active bookings
    const activeBookings = await Booking.find({ 
      house: req.params.id,
      endDate: { $gte: new Date() }
    });

    if (activeBookings.length > 0) {
      return res.status(400).json({ message: 'Cannot delete house with active bookings' });
    }

    // Delete associated past bookings
    await Booking.deleteMany({ house: req.params.id });

    // Delete the house
    await House.findByIdAndDelete(req.params.id);
    console.log('House and associated past bookings deleted successfully:', req.params.id);
    res.json({ message: 'House and associated past bookings deleted successfully' });
  } catch (error) {
    console.error('Error deleting house:', error);
    res.status(500).json({ message: 'Error deleting house' });
  }
});

module.exports = router;