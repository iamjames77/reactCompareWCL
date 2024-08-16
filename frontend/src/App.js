import './App.css';
import React, { useState, useEffect } from 'react';
import * as API from './get_api_data';
import ChartComponent from './ChartComponet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import SetBossType from './SetBossType';
import SetFightPhase from './SetFightPhase';
import SetSourceTarget from './SetSourceTarget';
import Scaling from './Scaling';
import Checkboxdown from './Checkboxdown';
import BossCast from './BossCast';
import specResource from './specResource';

function App() {
  const [inputMyValue, setInputMyValue] = useState('');
  const [inputOtherValue, setInputOtherValue] = useState('');
  const [notRenderGraph, setNotRenderGraph] = useState(false);

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
  const [spec, setSpec] = useState(null);
  const [targetID, setTargetID] = useState(null);
  const [otherTargetID, setOtherTargetID] = useState(null);
  const [otherSourceID, setOtherSourceID] = useState(null);
  const [otherSourceName, setOtherSourceName] = useState(null);
  const [otherSpec, setOtherSpec] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [DTData, setDTData] = useState(null);
  const [otherGraphData, setOtherGraphData] = useState(null);
  const [otherDTData, setOtherDTData] = useState(null);
  const [error, setError] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [otherStartTime, setOtherStartTime] = useState(null);
  const [otherEndTime, setOtherEndTime] = useState(null);

  const [myGraphJSON, setMyGraphJSON] = useState(null);
  const [otherGraphJSON, setOtherGraphJSON] = useState(null);
  const [resource, setResource] = useState(null);
  const [otherResource, setOtherResource] = useState(null);

  const [timeLength, setTimeLength] = useState(null);
  const [chartInterval, setChartInterval] = useState(100);
  const [chartLeft, setChartLeft] = useState(150);
  const [chartRight, setChartRight] = useState(20);
  const [chartWidth, setChartWidth] = useState(null);

  const [masterAbilities, setMasterAbilities] = useState(null);
  const [masterNPCs, setMasterNPCs] = useState(null);
  const [otherMasterAbilities, setOtherMasterAbilities] = useState(null);
  const [otherMasterNPCs, setOtherMasterNPCs] = useState(null);
  const [friendlyNPCs, setFriendlyNPCs] = useState(null);
  const [enemyNPCs, setEnemyNPCs] = useState(null);
  const [otherFriendlyNPCs, setOtherFriendlyNPCs] = useState(null);
  const [otherEnemyNPCs, setOtherEnemyNPCs] = useState(null);
  const [IDDict, setIDDict] = useState(null);
  const [otherIDDict, setOtherIDDict] = useState(null);
  const [buffTable, setBuffTable] = useState(null);
  const [otherBuffTable, setOtherBuffTable] = useState(null);
  const [globalBuffTable, setGlobalBuffTable] = useState(null);
  const [otherGlobalBuffTable, setOtherGlobalBuffTable] = useState(null);
  const [castTable, setCastTable] = useState(null);
  const [otherCastTable, setOtherCastTable] = useState(null);

  const [selectedBuff, setSelectedBuff] = useState(null);
  const [selectedOtherBuff, setSelectedOtherBuff] = useState(null);
  const [selectedCast, setSelectedCast] = useState(null);
  const [selectedOtherCast, setSelectedOtherCast] = useState(null);
  const [enemyCastTable, setEnemyCastTable] = useState({});
  const [enemyCastFilter, setEnemyCastFilter] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);
  const [selectedOtherResource, setSelectedOtherResource] = useState(null);

  // 입력 변경 시
  const myInputChange = (event) => {
    setInputMyValue(event.target.value);
  };

  const otherInputChange = (event) => {
    setInputOtherValue(event.target.value);
  }

  const notRenderGraphHandler = (event) => {
    setNotRenderGraph(event.target.checked);
  }

  // URL 입력 후 버튼 클릭 시
  const handleSubmit = () => {
    setReportID(inputMyValue);
    setOtherReportID(inputOtherValue);
  };

  useEffect(() => {
    if (name && otherReportID) {
      API.get_fight_data_with_encounterID(otherReportID, name).then(data => {
        if (data.errors) {
          console.log('90');
          setError(data.errors[0].message);
          return;
        }
        setOtherFightIDoptions(data.data.reportData.report.fights);
    });
  }
  }, [name, otherReportID]);

  const getGraphData = (r, f, s, t, ty, sT, eT, gD) => {
    API.get_graph_data(r, f, s, t, ty, sT, eT).then(data => {
      if (data.errors) {
        console.log('112');
        setError(data.errors[0].message);
        return;
      }
      gD(data.data.reportData.report.graph.data.series);
    });
  }

  const getTableData = (r, f, s, t, ty,sT, eT, sB, sgB, sC) => {
    API.get_table_data(r, f, s, t, ty,sT, eT).then(data => {
      if (data.errors) {
        console.log('123');
        setError(data.errors[0].message);
        return;
      }
      const sort_sB = data.data.reportData.report.self.data.auras.sort((a,b) => a.guid - b.guid);
      const sort_sgB = data.data.reportData.report.global.data.auras.sort((a,b) => a.guid - b.guid);
      const sort_sC = data.data.reportData.report.cast.data.entries.sort((a,b) => a.guid - b.guid);
      sB(sort_sB);
      sgB(sort_sgB);
      sC(sort_sC);
    })
  };

  const getResourceData = (r, f, s, sp, sT, eT,dt, bT, n, sR) => {
    API.get_resource_data(r, f, s, sp, sT, eT, dt, bT).then(data => {
      if (data.errors) {
        console.log('192');
        setError(data.errors[0].message);
        return;
      }
      let result ={};
      data.data.reportData.report.graph.data.series.forEach(item => {
        for (let j=0; j<item.data.length; j++){
          let key = item.data[j][0]
          let value = item.data[j][1]

          if(result[key]) {
            result[key] += value;
          }
          else{
            result[key] = value;
          }
        }
      });
      sR(prev => ({
        ...prev,
        [n]: result
      }));
    });
  };

  
  // Master Data
  useEffect(() => {
    if(reportID){
      API.get_master_data(reportID).then(data => {
        if (data.errors) {
          console.log(data.errors[0].message);
          setReportID(null);
          return;
        }
        setMasterAbilities(data.data.reportData.report.masterData.abilities)
        setMasterNPCs(data.data.reportData.report.masterData.npc);
      });
    }
  }, [reportID]);

  // Other Master Data
  useEffect(() => {
    if(otherReportID){
      API.get_master_data(otherReportID).then(data => {
        if (data.errors) {
          console.log(data.errors[0].message);
          setOtherReportID(null);
          return;
        }
        setOtherMasterAbilities(data.data.reportData.report.masterData.abilities)
        setOtherMasterNPCs(data.data.reportData.report.masterData.npc);
      });
    }
  }, [otherReportID]);

  useEffect(() => {
    setFightIDoptions(null);
    setMasterNPCs(null);
  }, [reportID])

  useEffect(() => {
    setOtherFightIDoptions(null);
    setOtherMasterNPCs(null);
  }, [otherReportID])

  useEffect(() => {
    setFight(null);
    setStartTime(null);
    setEndTime(null);
  }, [fightIDoptions]);

  useEffect(() => {
    setOtherFight(null);
    setOtherStartTime(null);
    setOtherEndTime(null);
  }, [otherFightIDoptions]);

  useEffect(() => {
    setSourceID(null);
    setTargetID(null);
    setIDDict(null);
    setEnemyCastTable({});
  }, [fight]);

  useEffect(() => {
    setOtherSourceID(null);
    setOtherTargetID(null);
    setOtherIDDict(null);
  }, [otherFight]);

  useEffect(() => {
    setMyGraphJSON(null);
  }, [sourceID]);

  useEffect(() => {
    setOtherGraphJSON(null);
  }, [otherSourceID]);
  
  // Graph Data
  useEffect(() => {
    if (reportID && fight && sourceID && type && startTime && endTime && !notRenderGraph) {
      getGraphData(reportID, fight, sourceID, targetID, type, startTime, endTime, setGraphData);
      if (type === 'Healing'){
        getGraphData(reportID, fight, 'ALL', 'ALL', 'DamageTaken', startTime, endTime, setDTData);
      }
    }
    else{
      setGraphData(null);
    }
  }, [startTime, endTime, sourceID, targetID, notRenderGraph, type]);

  // Resource Data
  useEffect(() => {
    if (reportID && fight && sourceID && startTime && endTime && spec && sourceID !== 'ALL') {
      specResource[spec.class][spec.spec].forEach(item => {
        const dtype = item.type;
        const spell = item.spell;
        const name = item.name;
        const byTarget = item.byTarget;
        getResourceData(reportID, fight, sourceID, spell, startTime, endTime, dtype, byTarget, name,setResource);
      });
    }
  }, [sourceID, startTime, endTime, spec]);

  // Other Graph Data
  useEffect(() => {
    if (otherReportID && otherFight && otherSourceID && otherTargetID && type && otherStartTime && otherEndTime && !notRenderGraph) {
      getGraphData(otherReportID, otherFight, otherSourceID, otherTargetID, type, otherStartTime, otherEndTime, setOtherGraphData);
      if(type === 'Healing'){
        getGraphData(otherReportID, otherFight, 'ALL', 'ALL', 'DamageTaken', otherStartTime, otherEndTime, setOtherDTData);
      }
    }
    else{
      setOtherGraphData(null);
    }
  }, [otherSourceID, otherTargetID, otherStartTime, otherEndTime, notRenderGraph, type]);

  // Resource Data
  useEffect(() => {
    if (otherReportID && otherFight && otherSourceID && otherStartTime && otherEndTime && otherSpec) {
      specResource[otherSpec.class][otherSpec.spec].forEach(item => {
        const dtype = item.type;
        const spell = item.spell;
        const name = item.name;
        const byTarget = item.byTarget;
        getResourceData(otherReportID, otherFight, otherSourceID, spell, otherStartTime, otherEndTime, dtype, byTarget, name, setOtherResource);
      });
    }
  }, [otherSourceID, otherStartTime, otherEndTime, otherSpec]);

  // Set Graph Data
  useEffect(() => {
    if (graphData) {
      setMyGraphJSON({
        id : sourceID,
        name: sourceName,
        graph: graphData,
        time: endTime - startTime
      });
    }
  }, [graphData]);

  // Set Damage Taken Data
  useEffect(() => {
    if (DTData) {
      setMyGraphJSON(prev => ({
        ...prev,
        DTGraph: DTData.find(item => item.id === 'Total')
      }));
    }
  },[DTData]);

  // Set Other Graph Data
  useEffect(() => {
    if (otherGraphData) {
      setOtherGraphJSON({
        name: otherSourceName,
        graph: otherGraphData,
        time: otherEndTime - otherStartTime
      });
    }
  }, [otherGraphData])

  // Set Other Damage Taken Data
  useEffect(() => {
    if (otherDTData) {
      setOtherGraphJSON(prev => ({
        ...prev,
        DTGraph: otherDTData.find(item => item.id === 'Total')
      }));
    }
  },[otherDTData]);

  //set Time Length
  useEffect(() => {
    if (startTime && endTime){
      let time = endTime - startTime;
      if (otherStartTime && otherEndTime){
        time = otherEndTime - otherStartTime > time ? otherEndTime - otherStartTime : time;
      }
      time = Math.ceil(time/1000) * 1000;
      setTimeLength(time);
      setChartWidth(time / 10);
    }
  }, [startTime, endTime, otherStartTime, otherEndTime]);

  // Get NPC data
  useEffect(() => {
    if (fight && startTime && endTime) {
      API.get_enemy_data(reportID, fight).then(data => {
        if (data.errors) {
          console.log('263');
          setError(data.errors[0].message);
          return;
        }
        setEnemyNPCs(data.data.reportData.report.fights[0].enemyNPCs);
      })
      API.get_friendly_data(reportID, fight).then(data => {
        if (data.errors) {
          console.log('271');
          setError(data.errors[0].message);
          return;
        }
        setFriendlyNPCs(data.data.reportData.report.fights[0].friendlyNPCs);
      })
    }
  }, [fight, startTime, endTime]);

  // Get Other NPC data
  useEffect(() => {
    if (otherFight && otherStartTime && otherEndTime) {
      API.get_enemy_data(otherReportID, otherFight).then(data => {
        if (data.errors) {
          console.log('285');
          setError(data.errors[0].message);
          return;
        }
        setOtherEnemyNPCs(data.data.reportData.report.fights[0].enemyNPCs);
      })
      API.get_friendly_data(otherReportID, otherFight).then(data => {
        if (data.errors) {
          console.log('293');
          setError(data.errors[0].message);
          return;
        }
        setOtherFriendlyNPCs(data.data.reportData.report.fights[0].friendlyNPCs);
      })
    }
  }, [otherFight, otherStartTime, otherEndTime]);

  // Get Table Data
  useEffect(() => {
    if (fight && startTime && endTime && sourceID && (sourceID !== 'ALL')) {
      getTableData(reportID, fight, sourceID, sourceID, type, startTime, endTime, setBuffTable, setGlobalBuffTable, setCastTable);
    }
    else if ((sourceID === 'ALL')){
      setBuffTable(null);
      setGlobalBuffTable(null);
      setCastTable(null);
    }
  }, [startTime, endTime, sourceID, type]);

  // Get Other Table Data
  useEffect(() => {
    if (otherFight && otherStartTime && otherEndTime && otherSourceID && (otherSourceID !== 'ALL')) {
      getTableData(otherReportID, otherFight, otherSourceID, otherSourceID, type,otherStartTime, otherEndTime, setOtherBuffTable, setOtherGlobalBuffTable, setOtherCastTable);
    }
    else {
      setOtherBuffTable(null);
      setOtherGlobalBuffTable(null);
      setOtherCastTable(null);
    }
  }, [otherStartTime, otherEndTime, otherSourceID, type]);

  useEffect(() => {
    if(IDDict && otherIDDict){
      console.log(IDDict);
      console.log(otherIDDict);
    }
  },[IDDict, otherIDDict]);

  return (
    <div className="App">
      <div className="App-header">
        <h1>CompareWCL</h1>
        <input className="myInput" type="text" value={inputMyValue} onChange={myInputChange} placeholder="Enter Your ReportID" />
        <input className="otherInput" type="text" value={inputOtherValue} onChange={otherInputChange} placeholder="Enter Other ReportID" />
        <button onClick={handleSubmit}><FontAwesomeIcon icon={faSearch} /></button>
        <label class="checkBox"> Not Render Graph
          <input type="checkbox" checked={notRenderGraph} onChange={notRenderGraphHandler}/>
        </label>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        {reportID && (
          <SetBossType ReportID={reportID} SetError={setError} SetName={setName} SetType={setType} SetFightIDOptions={setFightIDoptions} />
        )}
        <div style={{display:'flex'}}>
          <div style={{width: otherFightIDoptions ? '50%' : '100%'}}>
            {fightIDoptions && (
              <SetFightPhase ReportID={reportID} SetError={setError} FightIDOptions={fightIDoptions} SetFightID={setFight} SetStartTime={setStartTime} SetEndTime={setEndTime} existOnly={!otherFightIDoptions} />
            )}
          </div>
          <div style={{width: otherFightIDoptions ? '50%' : '0%'}}>
            {otherFightIDoptions && (
              <SetFightPhase ReportID={otherReportID} SetError={setError} FightIDOptions={otherFightIDoptions} SetFightID={setOtherFight} SetStartTime={setOtherStartTime} SetEndTime={setOtherEndTime} />
            )}
          </div>
        </div>
        <div style={{display:'flex'}}>
          <div style={{width: otherFightIDoptions ? '50%' : '100%'}}>
            {startTime && endTime && (
              <SetSourceTarget ReportID={reportID} fightID={fight} SetError={setError} SetSourceID={setSourceID} SetSourceName={setSourceName} SetSpec={setSpec} type={type} 
              friendlyNPC={friendlyNPCs} enemyNPC={enemyNPCs} masterNPCs={masterNPCs} SetTargetID={setTargetID} existOnly={!otherFightIDoptions} setIDDict={setIDDict}/>
            )}
          </div>
          <div style={{width: otherFightIDoptions ? '50%' : '0%'}}>
            {otherStartTime && otherEndTime && (
              <SetSourceTarget ReportID={otherReportID} fightID={otherFight} SetError={setError} SetSourceID={setOtherSourceID} SetSourceName={setOtherSourceName} SetSpec={setOtherSpec} type ={type}
              friendlyNPC={otherFriendlyNPCs} enemyNPC= {otherEnemyNPCs} masterNPCs={otherMasterNPCs} SetTargetID = {setOtherTargetID} setIDDict={setOtherIDDict}/>
            )}
          </div>
        </div>
      </div>
      <div style= {{overflowX: 'auto', margin: 6}}>
        {myGraphJSON && (
          <ChartComponent myGraphJSON={myGraphJSON} otherGraphJSON={otherGraphJSON} type={type} 
          timeLength= {timeLength} abilityTable={masterAbilities} otherAbilityTable={otherMasterAbilities}/>
        )}
        {sourceID && enemyNPCs && (
          <Checkboxdown reportID = {reportID} fight={fight} sourceID={sourceID} sourceName={sourceName} enemyNPCs ={enemyNPCs} buff={buffTable} 
          globalBuff = {globalBuffTable} masterNPCs={masterNPCs} cast ={castTable}
          otherReportID = {otherReportID} otherFight = {otherFight} otherSourceID = {otherSourceID} otherSourceName = {otherSourceName}
          otherBuff = {otherBuffTable} otherGlobalBuff = {otherGlobalBuffTable} otherCast = {otherCastTable} resource = {resource} otherResource = {otherResource}
          setSelectedBuff={setSelectedBuff} setSelectedCast={setSelectedCast}
          setSelectedOtherBuff = {setSelectedOtherBuff} setSelectedOtherCast = {setSelectedOtherCast} setEnemyCastTable = {setEnemyCastTable} SetEnemyCastFilter = {setEnemyCastFilter}
          setSelectedResource = {setSelectedResource} setSelectedOtherResource = {setSelectedOtherResource} startTime={startTime} endTime={endTime}/>
        )}
        {timeLength && chartInterval && chartLeft && sourceID && (
          <Scaling timeLength={timeLength} chartInterval={chartInterval} chartLeft={chartLeft} chartWidth = {chartWidth}/>
        )}
        {chartLeft && sourceID && IDDict && (Object.keys(enemyCastTable).length > 0)  && (
          <BossCast reportID = {reportID} fight ={fight} startTime = {startTime} endTime = {endTime} enemyCastTable ={enemyCastTable} enemyCastFilter = {enemyCastFilter}
          chartLeft = {chartLeft} chartInterval={chartInterval} chartRight = {chartRight} chartWidth ={chartWidth} SetError={setError} IDDict={IDDict}/>
        )}
        {chartLeft && otherSourceID && otherIDDict && enemyCastTable && (
          <BossCast reportID = {otherReportID} fight ={otherFight} startTime = {otherStartTime} endTime = {otherEndTime} enemyCastTable={enemyCastTable} enemyCastFilter = {enemyCastFilter}
          chartLeft = {chartLeft} chartInterval={chartInterval} chartRight = {chartRight} chartWidth ={chartWidth} SetError={setError} IDDict={otherIDDict}/>
        )}
      </div>
    </div>
  );
}

export default App;