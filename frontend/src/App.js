import './App.css';
import Dropdown from './dropdown';
import React, { useState } from 'react';
import {get_data, get_fight_options} from './get_api_data';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

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

function splitByKey(data, key) {
  const result = {};
  const keySet = new Set();

  data.forEach(item => {
      const keyValue = item[key];
      if (item.difficulty === null){
        return;
      }

      if (!result[keyValue]) {
          result[keyValue] = [];
      }
      result[keyValue].push(item);
      keySet.add(keyValue);
  });

  return { groupedData: result, keyList: Array.from(keySet) };
}

function getKeyOptions(data, key){
  const {groupedData, keyList} = splitByKey(data, key);
  const keyOptions = keyList.map(key => {
    return {
      value: JSON.stringify(groupedData[key]),
      text: key,
    }
  });
  return keyOptions;
}

function App() {
  const [inputValue, setInputValue] = useState('');
  const [reportId, setReportId] = useState(null);
  const [fight, setFight] = useState(null);
  const [name, setName] = useState(null);
  const [initialName, setInitialName] = useState(null);
  const [nameOptions, setNameOptions] = useState(null);
  const [initialFight, setInitialFight] = useState(null);
  const [fightOptions, setFightOptions] = useState(null);
  const [type, setType] = useState(null);
  const [source, setSource] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState('');
  const [selectedName, setSelectedName] = useState(null);

  const inputChange = (event) => {
    setInputValue(event.target.value);
  };

  const setSelectedNameHandler = (selectedName) => {
    const selectedNameJson = JSON.parse(selectedName);
    setName(selectedNameJson);
    set_fightId_option(selectedNameJson);
  }

  const setSelectedFightHandler = (selectedFight) => {
    const selectedFightJson = JSON.parse(selectedFight);
    setFight(selectedFightJson.id);
  }

  const set_fightId_option = (data) => {
    const fightIdOptionList = get_fightId_list(data);
    setFightOptions(fightIdOptionList);
  }

  const get_fightId_list = (data) => {
    const killData = getKeyOptions(data, 'kill');
    const result = null;
    const fightIdOPtion = killData.map(kill => {
      const killJson = JSON.parse(kill.value);
      return killJson.map(killData => {
        if(killData.kill === true){
          return {
            value: JSON.stringify(killData),
            text: 'KILL'
          }
        }
        else{
          return {
            value: JSON.stringify(killData),
            text: killData.lastPhaseIsIntermission ? 'P' + killData.lastPhase + ' ' + killData.bossPercentage + '%' : 'l' + killData.lastPhase + ' ' + killData.bossPercentage + '%' 
          }
        }
      })
    });
    return fightIdOPtion.flat();
  }

  const getFightOptions = (reportId, fight) => {
    get_fight_options(reportId).then(data => {
      if (data.errors) {
        setError(data.errors[0].message);
        return;
      }
      const nameOptionsList = getKeyOptions(data.data.reportData.report.fights, 'name');
      const filternameOptionList = nameOptionsList.map(item => ({
        ...item,
        text: item.text.split(',')[0].trim()
      }));
      setNameOptions(filternameOptionList);
      if (fight) {
        filternameOptionList.forEach(boss => {
          const bossJson = JSON.parse(boss.value);
          bossJson.forEach(bossData => {
            if(bossData.id === parseInt(fight)){
              setInitialName(boss.text);
              set_fightId_option(bossJson);
              setInitialFight(bossData.id);
            }
          });
        });
      }
      else{
        setInitialName(null)
      }
    });
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
      getFightOptions(reportId, fight);
      setError('');
      setResponseData(null);
      return;
    }
    else if(type === null || source === null){
      setError('Invalid URL format');
      setResponseData(null);
      return;
    } else {
      get_data(reportId, fight, type, source).then(data => {
        if (data.errors) {
          setError(data.errors[0].message);
          return;
        }
        getFightOptions(reportId, fight);
        setResponseData(data);
        setError('');
      });
    }
  };

  return (
    <div className="App">
      <div className="App-header">
        <h1>CompareWCL</h1>
        <div className = "inputURL">
          <input type="text" value={inputValue} onChange={inputChange} placeholder="Enter URL" />
          <button onClick={handleSubmit}><FontAwesomeIcon icon={faSearch} /></button>
        </div>
      </div>
      <div className="select">
        {nameOptions && (
          <Dropdown name='boss' options={nameOptions} onSelectValue={setSelectedNameHandler} getIcon={true} initialText={initialName}/>
        )}
        {fightOptions && (
          <Dropdown name='fight' options={fightOptions} onSelectValue={setSelectedFightHandler} getIcon={false} initialValue={initialFight}/>
        )}
      </div>
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