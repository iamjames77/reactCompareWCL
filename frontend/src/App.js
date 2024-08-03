import './App.css';
import Dropdown from './dropdown';
import React, { useState } from 'react';
import {get_data, get_fight_options, get_player_data} from './get_api_data';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import specIconURL from './specIconURL';

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
  const [nameOptions, setNameOptions] = useState(null);
  const [fightOptions, setFightOptions] = useState(null);
  const [type, setType] = useState(null);
  const [typeOptions, setTypeOptions] = useState(null);
  const [source, setSource] = useState(null);
  const [SourceIdOptions, setSourceIdOptions] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  const inputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = () => {
    const reportId = inputValue;
    setReportId(reportId);
    if(reportId == null){
      setError('Input reportId');
      setResponseData(null);
      return;
    } else {
      getFightOptions(reportId);
      setError('');
      setResponseData(null);
      return;
    }
  };

  const getFightOptions = (reportId) => {
    get_fight_options(reportId).then(data => {
      if (data.errors) {
        setError(data.errors[0].message);
        return;
      }
      const nameOptionsList = getKeyOptions(data.data.reportData.report.fights, 'name');
      const filternameOptionList = nameOptionsList.map(item => ({
        ...item,
        text: item.text.split(',')[0].trim(),
        imageURL: `https://assets.rpglogs.com/img/warcraft/bosses/${JSON.parse(item.value)[0].encounterID}-icon.jpg`,
      }));
      setNameOptions(filternameOptionList);  
    });
  }

  const setSelectedNameHandler = (selectedName) => {
    const selectedNameJson = JSON.parse(selectedName);
    setName(selectedNameJson[0].name);
    setFightIdOption(selectedNameJson);
  }

  const setFightIdOption = (data) => {
    const killData = getKeyOptions(data, 'kill');
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
    setFightOptions(fightIdOPtion.flat().reverse());
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
    ]
    setTypeOptions(dTypeList);
  }

  const setTypeHandler = (selectedType) => {
    setType(selectedType);
    setSourceOptions();
  }

  const setSourceOptions = () => {
    get_player_data(reportId, fight).then(data => {
      if (data.errors) {
        setError(data.errors[0].message);
        return;
      }
      const tankList = getKeyOptions(data.data.reportData.report.playerDetails.data.playerDetails.tanks, 'name');
      const healerList = getKeyOptions(data.data.reportData.report.playerDetails.data.playerDetails.healers, 'name');
      const dpsList = getKeyOptions(data.data.reportData.report.playerDetails.data.playerDetails.dps, 'name');
      const sourceList = tankList.concat(healerList).concat(dpsList);
      const sourceOptionList = sourceList.map(item => {
        const JSONValue = JSON.parse(item.value)[0];
        console.log(JSONValue);
        const specIcon = specIconURL[JSONValue.type].find(spec => spec.spec === JSONValue.specs[0].spec).icon;
        return {
          value: JSON.stringify(JSONValue),
          text: item.text,
          imageURL: specIcon
        };
      });
      console.log(sourceOptionList);
      setSourceIdOptions(sourceOptionList);
    });
  }

  const setSourceHandler = (selectedSource) => {
    setSource(JSON.parse(selectedSource).id);
  }

  const getData = () => {
    get_data(reportId, fight, source).then(data => {
      if (data.errors) {
        setError(data.errors[0].message);
        return;
      }
      setResponseData(data);
    });
  }

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
        {console.log(source)}
        {nameOptions && (
          <Dropdown name='boss' options={nameOptions} onSelectValue={setSelectedNameHandler} getIcon={true}/>
        )}
        {fightOptions && (
          <Dropdown name='fight' options={fightOptions} onSelectValue={setSelectedFightHandler} getIcon={false}/>
        )}
        {typeOptions && (
          <Dropdown name='type' options={typeOptions} onSelectValue={setTypeHandler} getIcon={false}/>
        )}
        {SourceIdOptions && (
          <Dropdown name='source' options={SourceIdOptions} onSelectValue={setSourceHandler} getIcon={true}/>
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