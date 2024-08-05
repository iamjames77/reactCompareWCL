import './App.css';
import Dropdown from './dropdown';
import React, { useState, useEffect } from 'react';
import {get_data, get_fight_options, get_player_data, get_graph_data, get_fight_data_with_encounterID} from './get_api_data';
import ChartComponent from './ChartComponet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import SetBossType from './SetBossType';
import SetFightPhase from './SetFightPhase';
import SetSource from './SetSource';
import Scaling from './Scaling';

function App() {
  const [inputMyValue, setInputMyValue] = useState('');
  const [inputOtherValue, setInputOtherValue] = useState('');
  const [renderGraph, setRenderGraph] = useState(false);

  const [reportID, setReportID] = useState(null);
  const [otherReportID, setOtherReportID] = useState(null);

  const [name, setName] = useState(null);
  const [fight, setFight] = useState(null);
  const [otherFight, setOtherFight] = useState(null);
  const [fightIDoptions, setFightIDoptions] = useState(null);
  const [otherFightIDoptions, setOtherFightIDoptions] = useState(null);
  const [type, setType] = useState(null);
  const [sourceID, setSourceID] = useState(null);
  const [sourceName, setSourceName] = useState(null);
  const [otherSourceID, setOtherSourceID] = useState(null);
  const [otherSourceName, setOtherSourceName] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [otherGraphData, setOtherGraphData] = useState(null);
  const [error, setError] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [otherStartTime, setOtherStartTime] = useState(null);
  const [otherEndTime, setOtherEndTime] = useState(null);

  const [responseData, setResponseData] = useState(null);
  const [otherResponseData, setOtherResponseData] = useState(null);
  const [myGraphJSON, setMyGraphJSON] = useState(null);
  const [otherGraphJSON, setOtherGraphJSON] = useState(null);

  const [timeLength, setTimeLength] = useState(null);
  const [chartInterval, setChartInterval] = useState(null);
  const [chartLeft, setChartLeft] = useState(null);

  // 입력 변경 시
  const myInputChange = (event) => {
    setInputMyValue(event.target.value);
  };

  const otherInputChange = (event) => {
    setInputOtherValue(event.target.value);
  }

  const renderGraphHandler = (event) => {
    setRenderGraph(event.target.checked);
  }

  // URL 입력 후 버튼 클릭 시
  const handleSubmit = () => {
    setReportID(inputMyValue);
    setOtherReportID(inputOtherValue);
  };

  useEffect(() => {
    if (name && otherReportID) {
      get_fight_data_with_encounterID(otherReportID, name).then(data => {
        if (data.errors) {
          setError(data.errors[0].message);
          return;
        }
        setOtherFightIDoptions(data.data.reportData.report.fights);
    });
  }
  }, [name, otherReportID]);

  const getData = (r, f, s, rD) => {
    get_data(r,f,s).then(data => {
      if (data.errors) {
        setError(data.errors[0].message);
        return;
      }
      rD(data);
    });
  }

  const getGraphData = (r,f,s,t,sT,eT, gD) => {
    get_graph_data(r, f, s, t, sT, eT).then(data => {
      if (data.errors) {
        setError(data.errors[0].message);
        return;
      }
      gD(data);
    });
  }

  useEffect(() => {
    if (reportID && fight && sourceID) {
      getData(reportID, fight, sourceID, setResponseData);
    }
  }, [reportID, fight, sourceID]);

  useEffect(() => {
    if (otherReportID && otherFight && otherSourceID) {
      getData(otherReportID, otherFight, otherSourceID, setOtherResponseData);
    }
  }, [otherReportID, otherFight, otherSourceID]);

  useEffect(() => {
    if (reportID && fight && sourceID && type && startTime && endTime && !renderGraph) {
      getGraphData(reportID, fight, sourceID, type, startTime, endTime, setGraphData);
    }
    else{
      setGraphData(null);
    }
  }, [reportID, fight, sourceID, type, startTime, endTime, renderGraph]);

  useEffect(() => {
    if (otherReportID && otherFight && otherSourceID && type && otherStartTime && otherEndTime && !renderGraph) {
      getGraphData(otherReportID, otherFight, otherSourceID, type, otherStartTime, otherEndTime, setOtherGraphData);
    }
    else{
      setOtherGraphData(null);
    }
  }, [otherReportID, otherFight, otherSourceID, type, otherStartTime, otherEndTime, renderGraph]);

  useEffect(() => {
    if (graphData) {
      setMyGraphJSON({
        name: sourceName,
        graph: graphData.data.reportData.report.graph.data.series,
        time: endTime - startTime
      });
    }
  }, [graphData])

  useEffect(() => {
    if (otherGraphData) {
      setOtherGraphJSON({
        name: otherSourceName,
        graph: otherGraphData.data.reportData.report.graph.data.series,
        time: otherEndTime - otherStartTime
      });
    }
  }, [otherGraphData])

  useEffect(() => {
    if(renderGraph && startTime && endTime){
      setTimeLength(endTime - startTime);
      if (otherStartTime && otherEndTime){
        const newTimeLength = Math.max(endTime - startTime, otherEndTime - otherStartTime);
        setTimeLength(newTimeLength);
      }
      setChartInterval(100);
      setChartLeft(92);

    }
  }, [renderGraph, startTime, endTime, otherStartTime, otherEndTime, timeLength, chartInterval, chartLeft]);

  return (
    <div className="App">
      <div className="App-header">
        <h1>CompareWCL</h1>
        <input className="myInput" type="text" value={inputMyValue} onChange={myInputChange} placeholder="Enter Your ReportID" />
        <input className="otherInput" type="text" value={inputOtherValue} onChange={otherInputChange} placeholder="Enter Other ReportID" />
        <button onClick={handleSubmit}><FontAwesomeIcon icon={faSearch} /></button>
        <label class="checkBox"> Not Render Graph
          <input type="checkbox" checked={renderGraph} onChange={renderGraphHandler}/>
        </label>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        {reportID && (
          <SetBossType ReportID={reportID} SetError={setError} SetName={setName} SetType={setType} SetFightIDOptions={setFightIDoptions}/>
        )}
        <div style={{display:'flex'}}>
          <div style={{width:'50%'}}>
            {fightIDoptions && (
              <SetFightPhase ReportID={reportID} SetError={setError} FightIDOptions={fightIDoptions} SetFightID={setFight} SetStartTime={setStartTime} SetEndTime={setEndTime}/>
            )}
          </div>
          <div style={{width:'50%'}}>
            {otherFightIDoptions && (
              <SetFightPhase ReportID={otherReportID} SetError={setError} FightIDOptions={otherFightIDoptions} SetFightID={setOtherFight} SetStartTime={setOtherStartTime} SetEndTime={setOtherEndTime}/>
            )}
          </div>
        </div>
        <div style={{display:'flex'}}>
          <div style={{width:'50%'}}>
            {startTime && endTime && (
              <SetSource ReportID={reportID} fightID={fight} SetError={setError} SetSourceID={setSourceID} SetSourceName={setSourceName}/>
            )}
          </div>
          <div style={{width:'50%'}}>
            {otherStartTime && otherEndTime && (
              <SetSource ReportID={otherReportID} fightID={otherFight} SetError={setError} SetSourceID={setOtherSourceID} SetSourceName={setOtherSourceName}/>
            )}
          </div>
        </div>
      </div>
      <div className= "graph">
        {myGraphJSON && (
          <ChartComponent myGraphJSON={myGraphJSON} otherGraphJSON={otherGraphJSON} type={type} SetTimeLength= {setTimeLength} SetChartInterval={setChartInterval} SetChartLeft={setChartLeft}/>
        )}
        {timeLength && chartInterval && chartLeft && sourceID &&(
          <Scaling timeLength={timeLength} chartInterval={chartInterval} chartLeft={chartLeft}/>
        )}
      </div>
      <div>
        {console.log(myGraphJSON)}
        {responseData && console.log(responseData)}
      </div>
    </div>
  );
}

export default App;