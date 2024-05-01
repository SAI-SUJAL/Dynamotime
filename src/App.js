import React from 'react';
import './App.css';
//import { SearchInput, DatePickerWrapper, TimezoneSuggestions, SelectedTimezone, ShareableLinkModal, Button, DarkModeToggle, MeetButton } from './TimezoneComponents';
import 'bootstrap/dist/css/bootstrap.min.css';
import TimeZoneConverter from './components/TimeZoneConverter';


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>DynamoTime</h1>
      </header>
      <div className="content">
        <TimeZoneConverter/>
      </div>
    
        <p><b>By Sai Sujal Shamarthi @2024 All Rights Reserved.</b></p>
    
    </div>
  );
}

export default App;
