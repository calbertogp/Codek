import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import AvailabilityCalendar from './AvailabilityCalendar';

const UserDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [calendarKey, setCalendarKey] = useState(0);

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      console.log('Sending request to fetch user bookings');
      const response = await axios.get('http://localhost:3001/api/bookings/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Response received:', response.data);
      setBookings(response.data);
      setError(null);
      setCalendarKey(prev => prev + 1); // Force calendar update
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        setError(`Failed to fetch your bookings. Server responded with: ${error.response.data.message}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        setError('Failed to fetch your bookings. No response received from server.');
      } else {
        setError(`Failed to fetch your bookings. ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      console.log('Sending request to cancel booking:', bookingId);
      await axios.patch(`http://localhost:3001/api/bookings/${bookingId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Booking cancelled successfully');
      fetchUserBookings(); // Refresh the bookings list and update calendar
    } catch (error) {
      console.error('Error cancelling booking:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        setError(`Failed to cancel booking. Server responded with: ${error.response.data.message}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        setError('Failed to cancel booking. No response received from server.');
      } else {
        setError(`Failed to cancel booking. ${error.message}`);
      }
    }
  };

  if (loading) return <div>Loading your bookings...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Your Bookings</h2>
      {bookings.length === 0 ? (
        <p>You don't have any bookings yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="border p-4 rounded shadow">
              <h3 className="text-xl font-semibold">{booking.house ? booking.house.name : 'Unknown House'}</h3>
              <p>Check-in: {moment(booking.startDate).format('MMMM D, YYYY')}</p>
              <p>Check-out: {moment(booking.endDate).format('MMMM D, YYYY')}</p>
              <p>Status: {booking.status || 'N/A'}</p>
              {booking.status !== 'cancelled' && (
                <button 
                  onClick={() => cancelBooking(booking._id)}
                  className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {bookings.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Availability Calendar</h3>
          <AvailabilityCalendar 
            houseId={bookings[0].house._id}
            key={calendarKey}
            bookings={bookings}
          />
        </div>
      )}
    </div>
  );
};

export default UserDashboard;