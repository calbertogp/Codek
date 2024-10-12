import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/bookings/user', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setBookings(response.data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };
    fetchBookings();
  }, []);

  const cancelBooking = async (bookingId) => {
    try {
      await axios.delete(`http://localhost:3001/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setBookings(bookings.filter(booking => booking._id !== bookingId));
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  return (
    <div>
      <h2>Your Bookings</h2>
      {bookings.map(booking => (
        <div key={booking._id}>
          <p>House: {booking.house.name}</p>
          <p>From: {new Date(booking.startDate).toLocaleDateString()}</p>
          <p>To: {new Date(booking.endDate).toLocaleDateString()}</p>
          <button onClick={() => cancelBooking(booking._id)}>Cancel Booking</button>
        </div>
      ))}
    </div>
  );
};

export default UserBookings;