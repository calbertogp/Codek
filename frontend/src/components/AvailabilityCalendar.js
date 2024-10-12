import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const CustomToolbar = ({ label, onNavigate }) => (
  <div className="rbc-toolbar">
    <span className="rbc-btn-group">
      <button type="button" onClick={() => onNavigate('PREV')}>Back</button>
      <button type="button" onClick={() => onNavigate('TODAY')}>Today</button>
      <button type="button" onClick={() => onNavigate('NEXT')}>Next</button>
    </span>
    <span className="rbc-toolbar-label">{label}</span>
  </div>
);

const AvailabilityCalendar = ({ bookings }) => {
  const events = bookings.map(booking => ({
    start: new Date(booking.startDate),
    end: new Date(booking.endDate),
    title: 'Booked'
  }));

  return (
    <div style={{ height: 400 }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        view="month"
        views={['month']}
        components={{
          toolbar: CustomToolbar,
        }}
      />
    </div>
  );
};

export default AvailabilityCalendar;