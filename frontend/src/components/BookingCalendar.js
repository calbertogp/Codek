import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './BookingCalendar.css';

const localizer = momentLocalizer(moment);

const CustomToolbar = ({ label, onNavigate, onView }) => {
  return (
    <div className="rbc-toolbar">
      <span className="rbc-btn-group">
        <button type="button" onClick={() => onNavigate('PREV')}>&lt;</button>
        <button type="button" onClick={() => onNavigate('TODAY')}>Today</button>
        <button type="button" onClick={() => onNavigate('NEXT')}>&gt;</button>
      </span>
      <span className="rbc-toolbar-label">{label}</span>
    </div>
  );
};

const BookingCalendar = ({ houseId, initialDate }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(initialDate || new Date());

  useEffect(() => {
    const fetchBookings = async () => {
      if (!houseId) return;
      
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const response = await axios.get(`http://localhost:3001/api/bookings/house/${houseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setBookings(response.data.map(booking => ({
          start: new Date(booking.startDate),
          end: moment(booking.endDate).endOf('day').toDate(), // Ensure the end date includes the full day
          title: 'Booked'
        })));
        setError(null);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setError('Failed to fetch bookings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [houseId]);

  useEffect(() => {
    if (initialDate) {
      setCurrentDate(initialDate);
    }
  }, [initialDate]);

  const handleNavigate = (newDate) => {
    setCurrentDate(newDate);
  };

  if (loading) return <div>Loading calendar...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="booking-calendar" style={{ height: '500px' }}>
      <Calendar
        localizer={localizer}
        events={bookings}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        view="month"
        views={['month']}
        date={currentDate}
        onNavigate={handleNavigate}
        components={{
          toolbar: CustomToolbar,
        }}
      />
    </div>
  );
};

export default BookingCalendar;