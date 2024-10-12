import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';

const Home = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [activeReservations, setActiveReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchActiveReservations();
    }
  }, [isAuthenticated]);

  const fetchActiveReservations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/bookings/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const activeBookings = response.data.filter(booking => 
        new Date(booking.endDate) >= new Date() && booking.status !== 'cancelled'
      );
      setActiveReservations(activeBookings);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError('Failed to fetch your reservations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to Kasavas</h1>
        <p className="text-xl">Here you will be able to book and manage your home!</p>
      </div>

      {isAuthenticated && (
        <div className="w-full max-w-2xl">
          <h2 className="text-2xl font-bold mb-4">Your Active Reservations</h2>
          {loading && <p>Loading your reservations...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && activeReservations.length === 0 && (
            <p>You have no active reservations.</p>
          )}
          {activeReservations.length > 0 && (
            <ul className="bg-white shadow-md rounded-lg divide-y divide-gray-200">
              {activeReservations.map(reservation => (
                <li key={reservation._id} className="p-4">
                  <h3 className="font-semibold">{reservation.house.name}</h3>
                  <p>Check-in: {new Date(reservation.startDate).toLocaleDateString()}</p>
                  <p>Check-out: {new Date(reservation.endDate).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;