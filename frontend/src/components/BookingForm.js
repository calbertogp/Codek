import React, { useState } from 'react';
import axios from 'axios';

const BookingForm = ({ houseId, onBookingComplete }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:3001/api/bookings', 
        { houseId, startDate, endDate },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      onBookingComplete(response.data);
    } catch (err) {
      setError('Booking failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="mb-4">
        <label htmlFor="startDate" className="block mb-2">Start Date:</label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="endDate" className="block mb-2">End Date:</label>
        <input
          type="date"
          id="endDate"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
        Book Now
      </button>
    </form>
  );
};

export default BookingForm;