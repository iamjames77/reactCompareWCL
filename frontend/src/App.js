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
  const originalType = hashParams.has('type') ? hashParams.get('type') : null;
  const source = hashParams.has('source') ? hashParams.get('source') : null;

  const type = originalType === 'damage-done' ? 'DamageDone' : originalType === 'healing' ? 'Healing' : originalType === 'casts' ? 'Casts' : null;

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
  const [typeOptions, setTypeOptions] = useState(null);
  const [initialType, setInitialType] = useState(null);
  const [source, setSource] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState('');
  const [selectedName, setSelectedName] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  const inputChange = (event) => {
    setInputValue(event.target.value);
  };

  const setSelectedNameHandler = (selectedName) => {
    const selectedNameJson = JSON.parse(selectedName);
    setName(selectedNameJson);
    setFightIdOption(selectedNameJson);
  }

  const setFightIdOption = (data) => {
    const fightIdOptionList = getFightIdList(data);
    setFightOptions(fightIdOptionList);
  }

 const getFightIdList = (data) => {
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

  const setSelectedFightHandler = (selectedFight) => {
    const selectedFightJson = JSON.parse(selectedFight);
    setFight(selectedFightJson.id);
    setStartTime(selectedFightJson.startTime);
    setEndTime(selectedFightJson.endTime);
    setDTypeOption();
  }

  const setDTypeOption = () => {
    const dTypeList = [
      {value: JSON.stringify('DamageDone'), text: 'Damage Done'},
      {value: JSON.stringify('Healing'), text: 'Healing'},
      {value: JSON.stringify('Casts'), text: 'Casts'},
    ]
    setTypeOptions(dTypeList);
  }

  const setTypeHandler = (selectedType) => {
    setType(selectedType);
  }

 

  const getFightOptions = (reportId, fight, type) => {
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
              setFightIdOption(bossJson);
              setInitialFight(bossData.id);
              setStartTime(bossData.startTime);
              setEndTime(bossData.endTime);
            }
          });
        });
      }
      else{
        setInitialName(null)
      }
      if (type) {
        setDTypeOption();
        setInitialType(type);
      }
      else{
        setInitialType(null)
      }
    });
  }

  

  const handleSubmit = () => {
    const urlPattern = /^https:\/\/www\.warcraftlogs\.com\/reports\/([a-zA-Z0-9]+)#fight=(\d+)&type=([a-zA-Z]+)&source=(\d+)$/;
    const originalInputValue = inputValue;
    const url = new URL(inputValue);
    const { reportId, fight, type, source } = urlIsValid(url);
    setReportId(reportId);
    setFight(fight);
    setType(type);
    setSource(source);
    setNameOptions(null);
    setFightOptions(null);
    setTypeOptions(null);
    if(reportId == null){
      setError('Invalid URL format');
      setResponseData(null);
      return;
    } else if (fight === null || type === null || source == null) {
      getFightOptions(reportId, fight, type);
      setError('');
      setResponseData(null);
      return;
    }
    else {
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
          <Dropdown name='fight' options={fightOptions} onSelectValue={setSelectedFightHandler} getIcon={false} initialFight={initialFight}/>
        )}
        {typeOptions && (
          <Dropdown name='type' options={typeOptions} onSelectValue={setTypeHandler} getIcon={false} initialType={initialType}/>
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