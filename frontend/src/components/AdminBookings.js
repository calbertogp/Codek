import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/bookings');
      setBookings(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to fetch bookings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const deleteBooking = async (id) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await api.delete(`/bookings/${id}`);
        setBookings(bookings.filter(booking => booking._id !== id));
      } catch (error) {
        console.error('Error deleting booking:', error);
        setError('Failed to delete booking. Please try again.');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100';
      case 'cancelled':
        return 'bg-red-100';
      default:
        return '';
    }
  };

  if (loading) return <div>Loading bookings...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Bookings</h2>
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left">House</th>
            <th className="text-left">User</th>
            <th className="text-left">Check-in</th>
            <th className="text-left">Check-out</th>
            <th className="text-left">Status</th>
            <th className="text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking._id} className={getStatusColor(booking.status)}>
              <td>{booking.house ? booking.house.name : 'Deleted House'}</td>
              <td>{booking.user ? booking.user.username : 'N/A'}</td>
              <td>{new Date(booking.startDate).toLocaleDateString()}</td>
              <td>{new Date(booking.endDate).toLocaleDateString()}</td>
              <td>{booking.status}</td>
              <td>
                <button 
                  onClick={() => deleteBooking(booking._id)} 
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminBookings;