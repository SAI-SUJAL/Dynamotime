// TimeZoneConverter.js
import React, { useState, useEffect } from 'react';
import { FaTimes, FaSearch, FaArrowUp, FaCopy, FaArrowDown } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment-timezone';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './TimeZoneConverter.css';

const TimeZoneConverter = () => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedTimezones, setSelectedTimezones] = useState(() => {
    const storedTimezones = JSON.parse(localStorage.getItem('selectedTimezones'));
    return storedTimezones || [
      { timezone: 'UTC', currentTime: moment().tz('UTC').format('YYYY-MM-DD HH:mm:ss'), sliderValue: moment().tz('UTC').hours() },
      { timezone: 'Asia/Kolkata', currentTime: moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'), sliderValue: moment().tz('Asia/Kolkata').hours() },
    ];
  });
  const [date, setDate] = useState(() => {
    const storedDate = localStorage.getItem('selectedDate');
    return storedDate ? new Date(storedDate) : new Date();
  });
  const [showShareableLink, setShowShareableLink] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [userPoints, setUserPoints] = useState(0); // State for user points
   // State for dark mode

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(prevMode => {
      const newMode = !prevMode;
      if (newMode) {
        setUserPoints(prevPoints => prevPoints + 10); // Reward 10 points for enabling dark mode
      } else {
        setUserPoints(prevPoints => prevPoints - 5); // Deduct 5 points for disabling dark mode
      }
      return newMode;
    });
  };

  // Apply dark mode styles to the body
  useEffect(() => {
    const body = document.querySelector('body');
    if (darkMode) {
      body.classList.add('dark-mode'); // Add dark mode class to body
    } else {
      body.classList.remove('dark-mode'); // Remove dark mode class from body
    }
  }, [darkMode]);

  // Update local storage when selectedTimezones or date change
  useEffect(() => {
    localStorage.setItem('selectedTimezones', JSON.stringify(selectedTimezones));
  }, [selectedTimezones]);

  useEffect(() => {
    localStorage.setItem('selectedDate', date.toISOString());
  }, [date]);

  const handleInputChange = (e) => {
    const userInput = e.target.value;
    setInput(userInput);
    if (userInput.trim() !== '') {
      const filteredTimezones = moment.tz.names().filter((timezone) => timezone.toLowerCase().includes(userInput.toLowerCase()));
      setSuggestions(filteredTimezones);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectTimeZone = (timezone) => {
    setInput('');
    const currentTime = moment().tz(timezone).format('YYYY-MM-DD HH:mm:ss');
    setSelectedTimezones((prev) => [...prev, { timezone, currentTime, sliderValue: moment().tz(timezone).hours() }]);
    setSuggestions([]);
    setUserPoints(prevPoints => prevPoints + 10); // Increment points by 10 for adding a new time zone
  };

  const handleDeleteTimeZone = (index) => {
    setSelectedTimezones((prev) => prev.filter((_, i) => i !== index));
    setUserPoints(prevPoints => prevPoints - 5); // Deduct 5 points for deleting a time zone
  };

  const handleSliderChange = (index, value) => {
    setSelectedTimezones((prev) => {
      const diff = value - prev[index].sliderValue;
      const updatedTimezones = prev.map((timezone) => ({
        ...timezone,
        sliderValue: timezone.sliderValue + diff,
        currentTime: moment(timezone.currentTime)
          .tz(timezone.timezone)
          .add(diff, 'hours')
          .format('YYYY-MM-DD HH:mm:ss'),
      }));
      setUserPoints(prevPoints => prevPoints + 5);
      return updatedTimezones;
    });
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
    setSelectedTimezones((prev) =>
      prev.map((timezone) => ({
        ...timezone,
        currentTime: moment(timezone.currentTime)
          .tz(timezone.timezone)
          .date(newDate.getDate()) // Update the date
          .month(newDate.getMonth())
          .year(newDate.getFullYear())
          .format('YYYY-MM-DD HH:mm:ss'),
      }))
    );
    // Update suggestions based on the new date

    updateSuggestions(newDate);
  };

  // Function to update suggestions based on the selected date
  const updateSuggestions = (selectedDate) => {
    const updatedSuggestions = suggestions.map((timezone) => {
      const currentTime = moment(selectedDate).tz(timezone).format('YYYY-MM-DD HH:mm:ss');
      return { timezone, currentTime };
    });
    setSuggestions(updatedSuggestions);
  };
  const handleReverseTimezones = () => {
    setSelectedTimezones((prev) => [...prev].reverse());
  };


  

  const handleScheduleMeet = () => {
    if (selectedTimezones.length === 0) {
      alert("Please add time zones first.");
      return;
    }

    const meetingLink = `https://meet.google.com/new?startTime=${moment(selectedTimezones[0].currentTime).tz('UTC').format('YYYY-MM-DDTHH:mm:ss')}`;
    window.open(meetingLink, '_blank');
    setUserPoints(prevPoints => prevPoints + 20); // Increment points by 20 for scheduling a meeting
  };
  
  const handleCopyShareableLink = () => {
    const link = getShareableLink();
    if (link) {
      navigator.clipboard.writeText(link);
      setShowShareableLink(false);
    }
    setUserPoints(prevPoints => prevPoints + 10);
  };
  
  const getShareableLink = () => {
    if (selectedTimezones.length === 0) {
      // No time zones added, return default link
      return `${window.location.origin}`;
    }
  
    const timezonesQueryString = selectedTimezones.map((tz) => `${tz.timezone}:${moment(tz.currentTime).format('HH:mm:ss')}`).join(',');
    const shareableUrl = `${window.location.origin}?date=${moment(date).format('YYYY-MM-DD')}&timezones=${timezonesQueryString}`;
   
    return shareableUrl;
  };
  
  
  
  const formatSliderLabel = (hour) => {
    const labels = ['12am', '3am', '6am', '9am', '12pm', '3pm', '6pm', '9pm'];
    return labels[hour];
  };

  const sliderLabelPositions = [0, 3, 6, 9, 12, 15, 18, 21].map((hour) => `calc(${(hour * 100) / 23}% - 24px)`);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(selectedTimezones);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSelectedTimezones(items);
    setUserPoints(prevPoints => prevPoints + 30);
  };

  return (
    <div className={`time-zone-converter ${darkMode ? 'dark-mode' : ''}`}>
      <div className="controls">
      <div className="points-display">
          <span>Points: {userPoints}</span>
        </div>
        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Search for a time zone..."
            value={input}
            onChange={handleInputChange}
          />
          <FaSearch className="search-icon" />
        </div>
        <div className="date-picker-wrapper">
          <DatePicker
            selected={date}
            onChange={handleDateChange}
            className="form-control"
          />
        </div>
        <button className={`btn ${darkMode ? 'light-mode' : ''}`} onClick={handleReverseTimezones}>
          <FaArrowUp /><FaArrowDown /> Reverse Timezones
        </button>
        <button className={`btn ${darkMode ? 'light-mode' : ''}`} onClick={toggleDarkMode}>
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button className={`btn ${darkMode ? 'light-mode' : ''}`} onClick={handleScheduleMeet}>
          Schedule Meet
        </button>
        <button className={`btn ${darkMode ? 'light-mode' : ''}`} onClick={() => setShowShareableLink(true)}>
          Shareable Link
        </button>
      </div>
      <div className="suggestions">
        {suggestions.map((timezone) => (
          <div
            key={timezone}
            className="suggestions-item"
            onClick={() => handleSelectTimeZone(timezone)}
          >
            {timezone}
          </div>
        ))}
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="timezones">
          {(provided) => (
            <div className="time-zones" {...provided.droppableProps} ref={provided.innerRef}>
              {selectedTimezones.map((suggestion, index) => (
                <Draggable key={index} draggableId={`timezone-${index}`} index={index}>
                  {(provided) => (
                    <div
                      className="selected-timezone"
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      ref={provided.innerRef}
                    >
                      <div className="selected-timezone-info">
                        <b>Location:</b> {suggestion.timezone}<br />
                        <b>Date:</b> {moment(suggestion.currentTime).format('YYYY-MM-DD')}<br />
                        <b>Time:</b> {moment(suggestion.currentTime).format('HH:mm:ss')}
                      </div>
                      <div className="slider-container">
                        {sliderLabelPositions.map((position, hour) => (
                          <div key={hour} className="slider-label" style={{ left: position }}>
                            {formatSliderLabel(hour)}
                          </div>
                        ))}
                        <input
                          type="range"
                          min={0}
                          max={23}
                          step={1}
                          value={suggestion.sliderValue}
                          onChange={(e) => handleSliderChange(index, parseInt(e.target.value))}
                          className="slider"
                        />
                      </div>
                      <FaTimes
                        className="selected-timezone-delete"
                        onClick={() => handleDeleteTimeZone(index)}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      {showShareableLink && (
        <div className="shareable-link-container">
          <div className="shareable-link-modal">
            <h3>Shareable Link</h3>
            <div className="shareable-link">
              <a href={getShareableLink()} target="_blank" rel="noreferrer">
                {getShareableLink()}
              </a>
              <button className={`btn ${darkMode ? 'light-mode' : ''}`} onClick={handleCopyShareableLink}>
                <FaCopy /> Copy
              </button>
            </div>
            <button className={`btn ${darkMode ? 'light-mode' : ''}`} onClick={() => setShowShareableLink(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeZoneConverter;
