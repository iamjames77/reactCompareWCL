import './App.css';
import Dropdown from './dropdown';
import React, { useState, useEffect } from 'react';
import {get_data, get_fight_options, get_player_data, get_graph_data} from './get_api_data';
import ChartComponent from './ChartComponet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import DataProcessor from './DataProcessor';

function App() {
  const [inputMyValue, setInputMyValue] = useState('');
  const [reportId, setReportId] = useState(null);
  const [name, setName] = useState(null);
  const [fight, setFight] = useState(null);
  const [type, setType] = useState(null);
  const [source, setSource] = useState(null);
  const [sourceName, setSourceName] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [error, setError] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [myGraphJSON, setMyGraphJSON] = useState(null);


  // 입력 변경 시
  const inputChange = (event) => {
    setInputMyValue(event.target.value);
  };

  // URL 입력 후 버튼 클릭 시
  const handleSubmit = () => {
    setReportId(inputMyValue);
  };

  const getData = () => {
    get_data(reportId, fight, source).then(data => {
      if (data.errors) {
        setError(data.errors[0].message);
        return;
      }
      setResponseData(data);
    });
  }

  const getGraphData = () => {
    get_graph_data(reportId, fight, source, type, startTime, endTime).then(data => {
      if (data.errors) {
        setError(data.errors[0].message);
        return;
      }
      setGraphData(data);
    });
  }

  useEffect(() => {
    if (reportId && fight && source) {
      getData();
    }
  }, [reportId, fight, source]);

  useEffect(() => {
    if (reportId && fight && source && type && startTime && endTime) {
      getGraphData();
    }
    else{
      setGraphData(null);
    }
  }, [reportId, fight, source, type, startTime, endTime]);

  useEffect(() => {
    if (graphData) {
      setMyGraphJSON({
        name: sourceName,
        graph: graphData.data.reportData.report.graph.data.series,
        time: endTime - startTime
      });
    }
  }, [graphData])

  return (
    <div className="App">
      <div className="App-header">
        <h1>CompareWCL</h1>
        <div className = "inputURL">
          <input type="text" value={inputMyValue} onChange={inputChange} placeholder="Enter Your ReportId" />
          <button onClick={handleSubmit}><FontAwesomeIcon icon={faSearch} /></button>
          {myGraphJSON && (
            <input type="text" value={inputMyValue} onChange={inputChange} placeholder="Enter Your ReportId" />
          )}
        </div>
      </div>
      <div>
        {reportId && (
          <DataProcessor ReportId={reportId} setError={setError} SetName={setName} SetFight={setFight} SetType={setType} SetSource={setSource} SetSourceName={setSourceName}
          SetStartTime={setStartTime} SetEndTime={setEndTime}/>
        )}
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className= "graph">
        {myGraphJSON && (
          <ChartComponent myGraphJSON={myGraphJSON} type={type} />
        )}
      </div>
    </div>
  );
}

export default App;