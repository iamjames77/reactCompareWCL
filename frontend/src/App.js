import logo from './logo.svg';
import './App.css';
import React, { useState } from 'react';

function get_data(reportId, fight, type, source) {
  return fetch('/get_data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reportId, fight, type, source }),
  })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      return data;
    }
    )
    .catch(err => console.error('Error fetching data'));
}

function urlIsValid(url) {
  const pathSegments = url.pathname.split('/');
  const reportId = pathSegments.length > 2 ? pathSegments[2] : null;

  const hashParams = new URLSearchParams(url.hash.substring(1));

  // 각 파라미터 값 추출
  const fight = hashParams.has('fight') ? hashParams.get('fight') : null;
  const type = hashParams.has('type') ? hashParams.get('type') : null;
  const source = hashParams.has('source') ? hashParams.get('source') : null;

  return {
    reportId,
    fight,
    type,
    source,
  }
}


function App() {
  const [inputValue, setInputValue] = useState('');
  const [reportId, setReportId] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [fight, setFight] = useState(null);
  const [type, setType] = useState(null);
  const [source, setSource] = useState
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState('');

  const inputChange = (event) => {
    setInputValue(event.target.value);
  };

  const difficultyChange = (event) => {
    setDifficulty(event.target.value);
  }

  const handleSubmit = () => {
    const urlPattern = /^https:\/\/www\.warcraftlogs\.com\/reports\/([a-zA-Z0-9]+)#fight=(\d+)&type=([a-zA-Z]+)&source=(\d+)$/;
    const url = new URL(inputValue);
    const { reportId, fight, type, source } = urlIsValid(url);
    setReportId(reportId);
    setFight(fight);
    setType(type);
    setSource(source);
    if(reportId == null){
      setError('Invalid URL format');
      setResponseData(null);
      return;
    } else if (fight === null) {
      setError('Invalid URL format');
      setResponseData(null);
      return;
    }
    else if(type === null || source === null){
      setError('Invalid URL format');
      setResponseData(null);
      return;
    } else {
      get_data(reportId, fight, type, source).then(data => {
        setResponseData(data);
        setError('');
      });
    }
  };

  return (
    <div className="App">
      <input type="text" value={inputValue} onChange={inputChange} placeholder="Enter URL" />
      <button onClick={handleSubmit}>Parse URL</button>
      {!fight && (
        <select id = "difficulty" value={difficulty} onChange={difficultyChange}>
          <option value=""
      )}
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
