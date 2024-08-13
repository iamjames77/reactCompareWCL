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
  const [targetID, setTargetID] = useState(null);
  const [otherTargetID, setOtherTargetID] = useState(null);
  const [otherSourceID, setOtherSourceID] = useState(null);
  const [otherSourceName, setOtherSourceName] = useState(null);
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
  const [DTGraphJSON, setDTGraphJSON] = useState(null);
  const [otherDTGraphJSON, setOtherDTGraphJSON] = useState(null);

  const [timeLength, setTimeLength] = useState(null);
  const [chartInterval, setChartInterval] = useState(null);
  const [chartLeft, setChartLeft] = useState(null);
  const [chartWidth, setChartWidth] = useState(null);

  const [masterAbilities, setMasterAbilities] = useState(null);
  const [masterNPCs, setMasterNPCs] = useState(null);
  const [friendlyNPCs, setFriendlyNPCs] = useState(null);
  const [enemyNPCs, setEnemyNPCs] = useState(null);
  const [otherFriendlyNPCs, setOtherFriendlyNPCs] = useState(null);
  const [otherEnemyNPCs, setOtherEnemyNPCs] = useState(null);
  const [buffTable, setBuffTable] = useState(null);
  const [otherBuffTable, setOtherBuffTable] = useState(null);
  const [globalBuffTable, setGlobalBuffTable] = useState(null);
  const [otherGlobalBuffTable, setOtherGlobalBuffTable] = useState(null);
  const [castTable, setCastTable] = useState(null);
  const [otherCastTable, setOtherCastTable] = useState(null);
  const [abilityTable, setAbilityTable] = useState(null);
  const [otherAbilityTable, setOtherAbilityTable] = useState(null);

  const [selectedEnemy, setSelectedEnemy] = useState(null);
  const [selectedBuff, setSelectedBuff] = useState(null);
  const [selectedOtherBuff, setSelectedOtherBuff] = useState(null);
  const [selectedCast, setSelectedCast] = useState(null);
  const [selectedOtherCast, setSelectedOtherCast] = useState(null);
  const [selectedEnemyCast, setSelectedEnemyCast] = useState(null);

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

  const getTableData = (r, f, s, t, ty,sT, eT, sA, sB, sgB, sC) => {
    API.get_table_data(r, f, s, t, ty,sT, eT).then(data => {
      if (data.errors) {
        console.log('123');
        setError(data.errors[0].message);
        return;
      }
      const sort_sB = data.data.reportData.report.self.data.auras.sort((a,b) => a.guid - b.guid);
      const sort_sgB = data.data.reportData.report.global.data.auras.sort((a,b) => a.guid - b.guid);
      const sort_sC = data.data.reportData.report.cast.data.entries.sort((a,b) => a.guid - b.guid);
      sA(data.data.reportData.report.abilities.data.entries);
      sB(sort_sB);
      sgB(sort_sgB);
      sC(sort_sC);
    })
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
  }, [reportID, fight, sourceID, targetID, type, startTime, endTime, notRenderGraph]);

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
  }, [otherReportID, otherFight, otherSourceID, otherTargetID, type, otherStartTime, otherEndTime, notRenderGraph]);

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
      setDTGraphJSON({
        name: sourceName,
        graph: DTData.find(item => item.id === 'Total'),
        time: endTime - startTime
      });
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
      setOtherDTGraphJSON({
        name: sourceName,
        graph: otherDTData.find(item => item.id === 'Total'),
        time: endTime - startTime
      });
    }
  },[otherDTData]);

  // Graph Render 안 하는 경우 시간 길이, 간격, 왼쪽 여백 설정
  useEffect(() => {
    if(notRenderGraph && startTime && endTime){
      setTimeLength(endTime - startTime);
      if (otherStartTime && otherEndTime){
        const newTimeLength = Math.max(endTime - startTime, otherEndTime - otherStartTime);
        setTimeLength(newTimeLength);
      }
      setChartInterval(100);
      setChartLeft(92);

    }
  }, [notRenderGraph, startTime, endTime, otherStartTime, otherEndTime, timeLength, chartInterval, chartLeft]);

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
      getTableData(reportID, fight, sourceID, sourceID, type, startTime, endTime, setAbilityTable, setBuffTable, setGlobalBuffTable, setCastTable);
    }
    else if ((sourceID === 'ALL')){
      setBuffTable(null);
      setGlobalBuffTable(null);
      setCastTable(null);
    }
  }, [reportID, fight, startTime, endTime, sourceID, type]);

  // Get Other Buff Data
  useEffect(() => {
    if (otherFight && otherStartTime && otherEndTime && otherSourceID && (otherSourceID !== 'ALL')) {
      getTableData(otherReportID, otherFight, otherSourceID, otherSourceID, type,otherStartTime, otherEndTime, setOtherAbilityTable, setOtherBuffTable, setOtherGlobalBuffTable, setOtherCastTable);
    }
    else if ((otherSourceID === 'ALL')){
      setOtherBuffTable(null);
      setOtherGlobalBuffTable(null);
      setOtherCastTable(null);
    }
  }, [reportID, otherFight, otherStartTime, otherEndTime, otherSourceID, type]);

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
              <SetSourceTarget ReportID={reportID} fightID={fight} SetError={setError} SetSourceID={setSourceID} SetSourceName={setSourceName} type={type} 
              npc={(type === 'Healing') ? friendlyNPCs : enemyNPCs} masterNPCs={masterNPCs} SetTargetID={setTargetID} existOnly={!otherFightIDoptions}/>
            )}
          </div>
          <div style={{width: otherFightIDoptions ? '50%' : '0%'}}>
            {otherStartTime && otherEndTime && (
              <SetSourceTarget ReportID={otherReportID} fightID={otherFight} SetError={setError} SetSourceID={setOtherSourceID} SetSourceName={setOtherSourceName} type ={type}
              npc={(type === 'Healing') ? otherFriendlyNPCs : otherEnemyNPCs} masterNPCs={masterNPCs} SetTargetID = {setOtherTargetID}/>
            )}
          </div>
        </div>
      </div>
      <div style= {{overflowX: 'auto', margin: 6}}>
        {myGraphJSON && (
          <ChartComponent myGraphJSON={myGraphJSON} otherGraphJSON={otherGraphJSON} myDTGraphJSON={DTGraphJSON} otherDTGraphJSON={otherDTGraphJSON} type={type} 
          SetTimeLength= {setTimeLength} setChartInterval={setChartInterval} setChartLeft={setChartLeft} setChartWidth={setChartWidth}
          abilityTable={abilityTable} otherAbilityTable={otherAbilityTable}/>
        )}
        {sourceID && enemyNPCs && (
          <Checkboxdown reportID = {reportID} fight={fight} sourceID={sourceID} sourceName={sourceName} enemyNPCs ={enemyNPCs} buff={buffTable} 
          globalBuff = {globalBuffTable} masterNPCs={masterNPCs} cast ={castTable}
          otherReportID = {otherReportID} otherFight = {otherFight} otherSourceID = {otherSourceID} otherSourceName = {otherSourceName}
          otherBuff = {otherBuffTable} otherGlobalBuff = {otherGlobalBuffTable} otherCast = {otherCastTable} 
          setSelectedEnemy={setSelectedEnemy} setSelectedBuff={setSelectedBuff} setSelectedCast={setSelectedCast}
          setSelectedOtherBuff = {setSelectedOtherBuff} setSelectedOtherCast = {setSelectedOtherCast} setSelectedEnemyCast={setSelectedEnemyCast}
          startTime={startTime} endTime={endTime}/>
        )}
        {timeLength && chartInterval && chartLeft && sourceID && (
          <Scaling timeLength={timeLength} chartInterval={chartInterval} chartLeft={chartLeft} chartWidth = {chartWidth}/>
        )}
        {chartLeft && selectedEnemy && sourceID && (
          <BossCast startTime = {startTime} endTime = {endTime} enemyTable = {selectedEnemy} enemyCastTable ={selectedEnemyCast} 
          chartLeft = {chartLeft} chartInterval={chartInterval} chartWidth ={chartWidth}/>
        )}
      </div>
    </div>
  );
}

export default App;