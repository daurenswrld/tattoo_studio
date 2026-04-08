import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Calendar = ({ selectedDate, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1));
  };

  const renderDays = () => {
    const days = [];
    const totalDays = daysInMonth(year, month);
    const startDay = (firstDayOfMonth(year, month) + 6) % 7; // Adjust for Monday start

    // Empty spots for previous month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar__day calendar__day--empty"></div>);
    }

    // Days of the month
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i);
      const isToday = new Date().toDateString() === date.toDateString();
      const isPast = date < new Date().setHours(0, 0, 0, 0);
      const isSelected = selectedDate?.toDateString() === date.toDateString();

      days.push(
        <button
          key={i}
          disabled={isPast}
          onClick={() => onDateSelect(date)}
          className={`calendar__day ${isToday ? 'calendar__day--today' : ''} ${isSelected ? 'calendar__day--selected' : ''} ${isPast ? 'calendar__day--past' : ''}`}
        >
          {i}
        </button>
      );
    }

    return days;
  };

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div className="calendar">
      <div className="calendar__header">
        <h3 className="calendar__month-year">
          {monthNames[month]} {year}
        </h3>
        <div className="calendar__nav">
          <button onClick={handlePrevMonth} className="calendar__nav-btn">
            <ChevronLeft size={20} />
          </button>
          <button onClick={handleNextMonth} className="calendar__nav-btn">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      <div className="calendar__weekdays">
        {weekDays.map(day => (
          <div key={day} className="calendar__weekday">{day}</div>
        ))}
      </div>
      
      <div className="calendar__grid">
        {renderDays()}
      </div>
    </div>
  );
};

export default Calendar;
