const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const House = require('../models/House');
const User = require('../models/User');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const { sendBookingConfirmation } = require('../utils/emailService');
const moment = require('moment');

// Create a new booking
router.post('/', auth, async (req, res) => {
  console.log('Received booking request:', req.body);
  try {
    const { houseId, startDate, endDate } = req.body;
    
    const startMoment = moment(startDate).utc().startOf('day');
    const endMoment = moment(endDate).utc().endOf('day');

    // Calculate number of weeks
    const weeks = Math.ceil(endMoment.diff(startMoment, 'weeks', true));

    // Check if user has enough credits (skip for admins)
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin' && user.credits < weeks) {
      return res.status(400).json({ message: 'Not enough credits for this booking' });
    }

    console.log('Checking availability for house:', houseId);
    console.log('Start date:', startMoment.format('YYYY-MM-DD dddd HH:mm:ss'));
    console.log('End date:', endMoment.format('YYYY-MM-DD dddd HH:mm:ss'));
    
    const isAvailable = await Booking.checkAvailability(houseId, startMoment.toDate(), endMoment.toDate());
    if (!isAvailable) {
      console.log('Dates not available for house:', houseId);
      return res.status(400).json({ message: 'These dates are not available' });
    }

    console.log('Creating new booking');
    const booking = new Booking({
      house: houseId,
      user: req.user.id,
      startDate: startMoment.toDate(),
      endDate: endMoment.toDate(),
      status: 'confirmed'
    });
    
    await booking.save();
    console.log('Booking saved:', booking);

    // Deduct credits (skip for admins)
    if (user.role !== 'admin') {
      user.credits -= weeks;
      await user.save();
    }

    console.log('Fetching house and user details');
    const house = await House.findById(houseId);

    console.log('Sending confirmation email');
    await sendBookingConfirmation(user.email, {
      houseName: house.name,
      startDate: startMoment.format('MMMM D, YYYY'),
      endDate: endMoment.format('MMMM D, YYYY')
    });

    console.log('Booking process completed successfully');
    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Error creating booking', error: error.message });
  }
});

// Get bookings for a specific house
router.get('/house/:houseId', auth, async (req, res) => {
  console.log('Fetching bookings for house:', req.params.houseId);
  try {
    const bookings = await Booking.find({ 
      house: req.params.houseId,
      status: { $ne: 'cancelled' } // Exclude cancelled bookings
    });
    console.log('Active bookings found:', bookings.length);
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
});

// Get bookings for the authenticated user
router.get('/user', auth, async (req, res) => {
  console.log('Fetching bookings for user:', req.user.id);
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('house', 'name')
      .sort({ startDate: 1 });
    
    console.log('User bookings found:', bookings.length);
    console.log('Bookings details:', JSON.stringify(bookings, null, 2));
    
    if (bookings.length === 0) {
      console.log('No bookings found for user');
    } else {
      console.log('First booking house name:', bookings[0].house ? bookings[0].house.name : 'House name not available');
    }

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ message: 'Error fetching user bookings', error: error.message });
  }
});

// Cancel a booking
router.patch('/:id/cancel', auth, async (req, res) => {
  console.log('Cancelling booking:', req.params.id);
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!booking) {
      console.log('Booking not found or unauthorized:', req.params.id);
      return res.status(404).json({ message: 'Booking not found or unauthorized' });
    }

    if (booking.status === 'cancelled') {
      console.log('Booking is already cancelled:', req.params.id);
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Refund credits (skip for admins)
    const user = await User.findById(booking.user);
    if (user.role !== 'admin') {
      const startMoment = moment(booking.startDate);
      const endMoment = moment(booking.endDate);
      const weeks = Math.ceil(endMoment.diff(startMoment, 'weeks', true));
      
      user.credits += weeks;
      await user.save();
      console.log('Credits refunded:', weeks);
    }

    console.log('Booking cancelled successfully:', req.params.id);

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Error cancelling booking', error: error.message });
  }
});

// Get all bookings (admin only)
router.get('/', auth, isAdmin, async (req, res) => {
  console.log('Fetching all bookings (admin only)');
  try {
    const bookings = await Booking.find()
      .populate('house', 'name')
      .populate('user', 'username')
      .select('house user startDate endDate status');
    console.log('Total bookings found:', bookings.length);
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    res.status(500).json({ message: 'Error fetching all bookings', error: error.message });
  }
});

// Delete a booking (admin only)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    await Booking.findByIdAndDelete(req.params.id);
    console.log('Booking deleted successfully:', req.params.id);
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: 'Error deleting booking' });
  }
});

module.exports = router;