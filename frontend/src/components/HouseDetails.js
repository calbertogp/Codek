import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import BookingCalendar from './BookingCalendar';
import 'react-datepicker/dist/react-datepicker.css';
import './BookingCalendar.css';

const HouseDetails = () => {
  const [house, setHouse] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [bookingMessage, setBookingMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [calendarKey, setCalendarKey] = useState(0);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const { id } = useParams();

  const fetchHouseDetails = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      const headers = { Authorization: `Bearer ${token}` };
      
      const houseResponse = await axios.get(`http://localhost:3001/api/houses/${id}`, { headers });
      setHouse(houseResponse.data);
      
      setError(null);
    } catch (error) {
      console.error('Error fetching house details:', error);
      setError('Failed to fetch house details. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchHouseDetails();
  }, [fetchHouseDetails]);

  const handleStartDateChange = (date) => {
    const tuesday = moment(date).day(2);
    setStartDate(tuesday.toDate());
    setEndDate(tuesday.clone().add(6, 'days').toDate());
    setCalendarDate(tuesday.toDate());
  };

  const handleEndDateChange = (date) => {
    const monday = moment(date).day(1);
    if (monday.isSameOrAfter(moment(startDate).add(6, 'days'))) {
      setEndDate(monday.toDate());
    }
  };

  const handleBooking = async () => {
    if (!startDate || !endDate) {
      setBookingMessage('Please select both start and end dates.');
      return;
    }

    const startMoment = moment(startDate).utc().startOf('day');
    const endMoment = moment(endDate).utc().endOf('day');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setBookingMessage('You must be logged in to book.');
        return;
      }

      const bookingData = {
        houseId: house._id,
        startDate: startMoment.toISOString(),
        endDate: endMoment.toISOString()
      };

      await axios.post('http://localhost:3001/api/bookings', bookingData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setBookingMessage('Booking successful!');
      setStartDate(null);
      setEndDate(null);

      // Refresh the calendar
      setCalendarKey(prevKey => prevKey + 1);
    } catch (error) {
      console.error('Booking error:', error);
      setBookingMessage(`Booking failed: ${error.response?.data?.message || error.message}`);
    }
  };

  if (loading) return <div>Loading house details...</div>;
  if (error) return <div>{error}</div>;
  if (!house) return <div>House not found.</div>;

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">{house.name}</h2>
      <p className="mb-4">{house.description}</p>
      
      <div className="mb-4" style={{ height: 500 }}>
        <BookingCalendar key={calendarKey} houseId={id} initialDate={calendarDate} />
      </div>
      
      <div className="mb-4 flex justify-between">
        <div className="w-[48%]">
          <DatePicker
            selected={startDate}
            onChange={handleStartDateChange}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            placeholderText="Select check-in date (Tuesday)"
            filterDate={date => moment(date).day() === 2}
            className="w-full p-2 border rounded"
            calendarClassName="solid-calendar"
            popperClassName="datepicker-popper"
            popperPlacement="bottom-start"
          />
        </div>
        <div className="w-[48%]">
          <DatePicker
            selected={endDate}
            onChange={handleEndDateChange}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate ? moment(startDate).add(6, 'days').toDate() : null}
            placeholderText="Select check-out date (Monday)"
            filterDate={date => moment(date).day() === 1}
            className="w-full p-2 border rounded"
            calendarClassName="solid-calendar"
            popperClassName="datepicker-popper"
            popperPlacement="bottom-start"
          />
        </div>
      </div>
      <div className="flex justify-center mt-4">
        <button 
          onClick={handleBooking}
          className="bg-blue-500 text-white px-6 py-2 rounded"
        >
          Book Now
        </button>
      </div>
      {bookingMessage && <p className="mt-2 text-center">{bookingMessage}</p>}
    </div>
  );
};

export default HouseDetails;