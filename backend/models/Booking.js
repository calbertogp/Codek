const mongoose = require('mongoose');
const moment = require('moment');

const bookingSchema = new mongoose.Schema({
  house: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'House',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'confirmed'
  }
}, {
  timestamps: true
});

bookingSchema.index({ house: 1, startDate: 1, endDate: 1 });

bookingSchema.pre('validate', function(next) {
  const startDate = moment(this.startDate).utc().startOf('day');
  const endDate = moment(this.endDate).utc().endOf('day');

  console.log('Validating booking:');
  console.log('Start date:', startDate.format('YYYY-MM-DD dddd HH:mm:ss'));
  console.log('End date:', endDate.format('YYYY-MM-DD dddd HH:mm:ss'));

  if (startDate.isSameOrAfter(endDate)) {
    console.log('Validation failed: End date must be after start date');
    this.invalidate('endDate', 'End date must be after start date');
  }

  if (startDate.day() !== 2) { // Tuesday = 2 in moment.js
    console.log('Validation failed: Check-in must be on a Tuesday');
    this.invalidate('startDate', 'Check-in must be on a Tuesday');
  }

  if (endDate.day() !== 1) { // Monday = 1 in moment.js
    console.log('Validation failed: Check-out must be on a Monday');
    this.invalidate('endDate', 'Check-out must be on a Monday');
  }

  const durationInDays = endDate.diff(startDate, 'days');
  if (durationInDays !== 6) { // Exactly 7 days (6 nights)
    console.log('Validation failed: Booking must be exactly one week long');
    this.invalidate('endDate', 'Booking must be exactly one week long');
  }

  next();
});

bookingSchema.statics.checkAvailability = async function(houseId, startDate, endDate) {
  const start = moment(startDate).utc().startOf('day');
  const end = moment(endDate).utc().endOf('day');

  console.log('Checking availability:');
  console.log('House ID:', houseId);
  console.log('Start date:', start.format('YYYY-MM-DD dddd HH:mm:ss'));
  console.log('End date:', end.format('YYYY-MM-DD dddd HH:mm:ss'));

  const conflictingBooking = await this.findOne({
    house: houseId,
    status: { $ne: 'cancelled' },
    $or: [
      { startDate: { $lt: end.toDate() }, endDate: { $gt: start.toDate() } },
      { startDate: { $gte: start.toDate(), $lt: end.toDate() } },
      { endDate: { $gt: start.toDate(), $lte: end.toDate() } }
    ]
  });

  console.log('Conflicting booking found:', !!conflictingBooking);

  return !conflictingBooking;
};

module.exports = mongoose.model('Booking', bookingSchema);