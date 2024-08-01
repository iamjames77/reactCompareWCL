import logo from './logo.svg';
import './App.css';
import React, { useState } from 'react';

function App() {
  const [inputValue, setInputValue] = useState('');
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = () => {
    const urlPattern = /^https:\/\/www\.warcraftlogs\.com\/reports\/([a-zA-Z0-9]+)#fight=(\d+)&type=([a-zA-Z]+)&source=(\d+)$/;
    const match = inputValue.match(urlPattern);

    if (match) {
      const [_, reportId, fight, type, source] = match;

      fetch('/get_data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reportId, fight, type, source }),
      })
        .then(response => response.json())
        .then(data => setResponseData(data))
        .catch(err => setError('Error fetching data'));
      setError('');
    } else {
      setError('Invalid URL format');
      setResponseData(null);
    }
  };

  return (
    <div className="App">
      <input type="text" value={inputValue} onChange={handleChange} placeholder="Enter URL" />
      <button onClick={handleSubmit}>Parse URL</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {responseData && (
        <div>
          <p>Response: {JSON.stringify(responseData)}</p>
        </div>
      )}
    </div>
  );
}

export default App;
