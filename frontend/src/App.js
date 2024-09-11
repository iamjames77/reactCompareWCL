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
import BossCastTimeLine from './BossCastTimeLine';
import specResource from './specResource';
import BuffsTimeLine from './BuffsTimeLine';
import CastsTimeLine from './CastsTimeLine';

function App() {
  const [inputMyValue, setInputMyValue] = useState('');
  const [inputOtherValue, setInputOtherValue] = useState('');
  const [notRenderGraph, setNotRenderGraph] = useState(false);

  const initialstate = {
    reportID: null, 
    encounterID:null, type: null, masterAbilities: null, masterNPCs: null,
    fight: null,  fightIDOptions:null, 
    source: null, target: null,  phase: null
  }

  const [report, setReport] = useState({});
  const [otherReport, setOtherReport] = useState({});
  const [type, setType] = useState(null);
  const [encounterID, setEncounterID] = useState(null);
  const [error, setError] = useState('');

  const [timeLength, setTimeLength] = useState(null);
  const [chartInterval, setChartInterval] = useState(100);
  const [chartLeft, setChartLeft] = useState(150);
  const [chartRight, setChartRight] = useState(20);
  const [chartWidth, setChartWidth] = useState(null);

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

  function parseWarcraftLogsInput(input, sR, sT) {
    let reportId = null;
    let fight = null;
    let source = null;
    let target = null;
    let type = null;
    let phase = null;

    // 정규 표현식 패턴: "reports/" 뒤에 오는 식별자 추출
    const pattern = /\/reports\/([a-zA-Z0-9]+)/;
    const urlPattern = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9.-]+)(\/reports\/[a-zA-Z0-9]+)/;

    try {
        // 먼저 URL 객체로 처리 시도
        const url = new URL(input);
        const match = url.pathname.match(pattern);
        reportId = match ? match[1] : null;

        if (url.hash) {
            const paramsString = url.hash.substring(1); // "#" 제거
            const params = new URLSearchParams(paramsString);

            fight = params.get('fight');
            source = params.get('source');
            target = params.get('target');
            type = params.get('type');
            phase = params.get('phase');
        }
    } catch (e) {
        // URL 객체로 처리 실패 시 수동으로 분석
        if (urlPattern.test(input)) {
            const match = input.match(pattern);
            reportId = match ? match[1] : null;

            const hashIndex = input.indexOf('#');
            if (hashIndex > -1) {
                const paramsString = input.slice(hashIndex + 1);
                const params = new URLSearchParams(paramsString);

                fight = params.get('fight');
                source = params.get('source');
                target = params.get('target');
                type = params.get('type');
                phase = params.get('phase');
            }
        } else if (/^[a-zA-Z0-9]+$/.test(input)) {
            // 단순 reportID일 경우
            reportId = input;
        }
    }
    
    if(type === 'healing'){
      type = 'Healing';
    } else {
      type = 'DamageDone';
    }
    sR(prevState => ({
      ...prevState,
      reportID: reportId,
      fight: Number(fight),
      source: source,
      target: target,
      initialphase: phase
    }));
    if(sT){
      sT(type);
    }
  }

  // URL 입력 후 버튼 클릭 시
  const handleSubmit = () => {
    parseWarcraftLogsInput(inputMyValue, setReport, setType);
    parseWarcraftLogsInput(inputOtherValue, setOtherReport);
    setEncounterID(null);
  };

  useEffect(() => {
    console.log(encounterID);
    if (encounterID && otherReport.reportID) {
      API.get_fight_data_with_encounterID(otherReport.reportID, encounterID).then(data => {
        if (data.errors) {
          console.log('90');
          setError(data.errors[0].message);
          return;
        }
        setOtherReport(prevState => ({
          ...prevState,
          fightIDOptions: data.data.reportData.report.fights
        }));
    });
  }
  }, [encounterID, otherReport.reportID]);
  // graph Data
  const getGraphData = async (r, f, s, t, ty, sT, eT, sN, sR) => {
    const fetch = async (r, f, s, t, ty, sT, eT) => {
      const data = await API.get_graph_data(r, f, s, t, ty, sT, eT);
      if (data.errors) {
        console.log('112');
        setError(data.errors[0].message);
        return;
      }
      return (data.data.reportData.report.graph.data.series);
    }

    const fetchResult = async (r, f, s, t, ty, sT, eT, sN) => {
      const graph = await fetch(r, f, s, t, ty, sT, eT);
      let result = {
        id: s,
        name: sN,
        graph: graph,
        time: eT - sT
      }
      const gf = {};
      graph.forEach(item => {
        gf[item.name] = item.name === 'Total' ? true : false;
      });
      if (ty === 'Healing'){
        const dtgraph = await fetch(r, f, 'ALL', 'ALL', 'DamageTaken', sT, eT);
        result = {...result, DTGraph: dtgraph.find(item => item.id === 'Total')};
        gf['Damage Taken'] = false;
      }
      return {result, gf};
    }
    const gD = (await fetchResult(r, f, s, t, ty, sT, eT, sN)).result;
    const gF = (await fetchResult(r, f, s, t, ty, sT, eT, sN)).gf;
    sR(prevState => ({
      ...prevState,
      graphData: gD,
      graphFilter: gF
    })
    )
  }
  // Table Data
  const getTableData = (r, f, s, t, ty,sT, eT, sR) => {
    API.get_table_data(r, f, s, t, ty,sT, eT).then(async data => {
      if (data.errors) {
        console.log('123');
        setError(data.errors[0].message);
        return;
      }
      const sort_sB = await addColor(data.data.reportData.report.self.data.auras.sort((a,b) => a.guid - b.guid));
      const sort_sgB = await addColor(data.data.reportData.report.global.data.auras.sort((a,b) => a.guid - b.guid));
      const sort_sC = await addColor(data.data.reportData.report.cast.data.entries.sort((a,b) => a.guid - b.guid));
      sR(prevState => ({
        ...prevState,
        buffTable: sort_sB,
        globalBuffTable: sort_sgB,
        buffFilter: {},
        castTable: sort_sC,
        castFilter: {}
      }));
    })
  };
  // Add Color
  const addColor = async (data) => {
    const D = {};
    const promises = Object.values(data).map( async (ability) => {
      const color = await API.getColorFromImage(`https://wow.zamimg.com/images/wow/icons/large/${ability.abilityIcon}`);
      D[ability.guid] = {
        'name': ability.name,
        'abilityIcon': ability.abilityIcon,
        'iconColor': color
      }
    })
    await Promise.all(promises);
    return D;
  }
  // Resource Data
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
        resource: {...prev.resource, [n]: result}
      }));
    });
  };
  // Master Data
  const getMasterData = (r, sR) => {
    API.get_master_data(r).then(data => {
      if(data.errors){
        console.log(data.errors[0].message);
        return;
      }
      sR(prevState => ({
        ...prevState,
        masterAbilities: data.data.reportData.report.masterData.abilities,
        masterNPCs: data.data.reportData.report.masterData.npc
      }));
    });
  };

  const getNPCdata = async (r, f, sR) => {
    const eD = await API.get_enemy_data(r, f);
    if (eD.errors) {
      console.log('222');
      setError(eD.errors[0].message);
      return;
    }
    const fD = await API.get_friendly_data(r, f);
    if (fD.errors) {
      console.log('230');
      setError(fD.errors[0].message);
      return;
    }
    sR(prevState => ({
      ...prevState,
      enemyNPCs: eD.data.reportData.report.fights[0].enemyNPCs,
      friendlyNPCs: fD.data.reportData.report.fights[0].friendlyNPCs
    }));
  }

  const handleRefresh = () => {
    window.location.reload();
  };
  
  // Master Data
  useEffect(() => {
    if(report.reportID){
      getMasterData(report.reportID, setReport);
    }
  }, [report.reportID]);

  // Get NPC data
  useEffect(() => {
    if (report.fight){
      getNPCdata(report.reportID, report.fight, setReport);
    }
  }, [report.fight]);

  // Other Master Data
  useEffect(() => {
    if(otherReport.reportID){
      getMasterData(otherReport.reportID, setOtherReport);
    }
  }, [otherReport.reportID]);

  // Other NPC Data
  useEffect(() => {
    if (otherReport.fight){
      getNPCdata(otherReport.reportID, otherReport.fight, setOtherReport);
    }
  }, [otherReport.fight]);
  
  // Graph Data
  useEffect(() => {    
    if (report.reportID && report.fight && report.source && report.target && type && report.startTime && report.endTime && !notRenderGraph){
      getGraphData(report.reportID, report.fight, report.source, report.target, type, report.startTime, report.endTime, report.sourceName, setReport);
    }
    else{
      setReport(prevState => ({
        ...prevState,
        graphData: null
      }));
    }
  }, [report.startTime, report.endTime, report.source, report.target, notRenderGraph, type]);

  // Other Graph Data
  useEffect(() => {
    if (otherReport.reportID && otherReport.fight && otherReport.source && otherReport.target && otherReport.startTime && otherReport.endTime && !notRenderGraph){
      getGraphData(otherReport.reportID, otherReport.fight, otherReport.source, otherReport.target, type, otherReport.startTime, otherReport.endTime, otherReport.sourceName, setOtherReport);
    }
    else{
      setOtherReport(prevState => ({
        ...prevState,
        graphData: null
      }));
    }
  }, [otherReport.startTIme, otherReport.endTime, otherReport.source, otherReport.target, notRenderGraph, type]);

  // Resource Data
  useEffect(() => {
    console.log(report);
    if (report.reportID && report.fight && report.source && report.startTime && report.endTime && report.spec && report.source !== 'ALL') {
      specResource[report.class][report.spec[0].spec].forEach(item => {
        const dtype = item.type;
        const spell = item.spell;
        const name = item.name;
        const byTarget = item.byTarget;
        getResourceData(report.reportID, report.fight, report.source, spell, report.startTime, report.endTime, dtype, byTarget, name, setReport);
      });
    }
  }, [report.source, report.startTime, report.endTime, report.class, report.spec]);
  // Resource Data
  useEffect(() => {
    console.log(otherReport);
    if (otherReport.reportID && otherReport.fight && otherReport.source && otherReport.startTime && otherReport.endTime && otherReport.spec && otherReport.source !== 'ALL') {
      specResource[otherReport.class][otherReport.spec[0].spec].forEach(item => {
        const dtype = item.type;
        const spell = item.spell;
        const name = item.name;
        const byTarget = item.byTarget;
        getResourceData(otherReport.reportID, otherReport.fight, otherReport.source, spell, otherReport.startTime, otherReport.endTime, dtype, byTarget, name, setOtherReport);
      });
    }
  }, [otherReport.source, otherReport.startTime, otherReport.endTime, otherReport.class, otherReport.spec]);

  //set Time Length
  useEffect(() => {
    if (report.startTime && report.endTime){
      let time = report.endTime - report.startTime;
      if (otherReport.startTime && otherReport.endTime){
        time = otherReport.endTime - otherReport.startTime > time ? otherReport.endTime - otherReport.startTime : time;
      }
      time = Math.ceil(time/1000) * 1000;
      setTimeLength(time);
      setChartWidth(time / 10);
    }
  }, [report.startTime, report.endTime, otherReport.startTime, otherReport.endTime]);

  // Get Table Data
  useEffect(() => {
    if (report.fight && report.startTime && report.endTime && report.source && (report.source !== 'ALL')) {
      getTableData(report.reportID, report.fight, report.source, report.source, type, report.startTime, report.endTime, setReport);
    }
  }, [report.startTime, report.endTime, report.source, type]);

  // Get Other Table Data
  useEffect(() => {
    if (otherReport.fight && otherReport.startTime && otherReport.endTime && otherReport.source && (otherReport.source !== 'ALL')) {
      getTableData(otherReport.reportID, otherReport.fight, otherReport.source, otherReport.source, type, otherReport.startTime, otherReport.endTime, setOtherReport);
    }
  }, [otherReport.startTime, otherReport.endTime, otherReport.source, type]);

  useEffect(() => {
    console.log('tbfZN6Jxjycq9D8v');
    console.log('JAjWZM1xHPyVd8g9');
  }, []);

  useEffect(() => {
    console.log(report)
  }, [report]);

  useEffect(() => {
    console.log(otherReport)
  }, [otherReport]);

  return (
    <div className="App">
      <div className="App-header">
        <h1 onClick={handleRefresh} style={{ cursor: 'pointer' }}>WCL Helper</h1>
        <input className="myInput" type="text" value={inputMyValue} onChange={myInputChange} placeholder="Enter Your ReportID" />
        <input className="otherInput" type="text" value={inputOtherValue} onChange={otherInputChange} placeholder="Enter Other ReportID" />
        <button onClick={handleSubmit}><FontAwesomeIcon icon={faSearch} /></button>
        <label class="checkBox"> Not Render Graph
          <input type="checkbox" checked={notRenderGraph} onChange={notRenderGraphHandler}/>
        </label>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        {report.reportID && (
          <SetBossType report={report} SetError={setError} setReport={setReport} type={type} setType={setType} setEncounterID = {setEncounterID}/>
        )}
        <div style={{display:'flex'}}>
          <div style={{width: otherReport.reportID ? '50%' : '100%'}}>
            {report.fightIDOptions && (
              <SetFightPhase report={report} SetError={setError} setReport={setReport} existOnly={!otherReport.reportID} />
            )}
          </div>
          <div style={{width: otherReport.reportID ? '50%' : '0%'}}>
            {otherReport.fightIDOptions && (
              <SetFightPhase report={otherReport} SetError={setError} setReport={setOtherReport} existOnly={!otherReport.reportID} />
            )}
          </div>          
        
        </div>
        <div style={{display:'flex'}}>
          
          <div style={{width: otherReport.reportID ? '50%' : '100%'}}>
            {report.startTime && report.endTime && (
              <SetSourceTarget report={report} SetError={setError} setReport={setReport} type={type} existOnly={!otherReport.reportID}/>
            )}
          </div>
          <div style={{width: otherReport.reportID ? '50%' : '0%'}}>
            {otherReport.startTime && otherReport.endTime && (
              <SetSourceTarget report={otherReport} SetError={setError} setReport={setOtherReport} type={type}/>
            )}
          </div>
        </div>
      </div>
      <div className={`custom-horizontal-scrollbar ${report.graphData ? 'show' : 'hide'}`} style= {{overflowX: 'scroll', margin: 6}}>
        {report.graphData && (
          <ChartComponent R={report} oR={otherReport} type={type} sr={setReport} sor={setOtherReport}
          timeLength= {timeLength} abilityTable={report.masterAbilities} otherAbilityTable={otherReport.masterAbilities}/>
        )}
        
        {report.source && report.enemyNPCs && (
          <Checkboxdown R = {report} oR = {otherReport} sR = {setReport} sOR = {setOtherReport}/>
        )}
        {timeLength && chartInterval && chartLeft && report.source && (
          <Scaling timeLength={timeLength} chartInterval={chartInterval} chartLeft={chartLeft} chartWidth = {chartWidth}/>
        )}
        {chartLeft && report.source && report.IDDict && report.enemyCastTable && report.startTime && report.endTime && (
          <BossCastTimeLine report = {report} chartLeft = {chartLeft} chartInterval={chartInterval} chartRight = {chartRight} chartWidth ={chartWidth} SetError={setError}/>
        )}
        {chartLeft && otherReport.source && otherReport.IDDict && otherReport.enemyCastTable && (
          <BossCastTimeLine report = {otherReport} chartLeft = {chartLeft} chartInterval={chartInterval} chartRight = {chartRight} chartWidth ={chartWidth} SetError={setError}/>
        )}
        {chartLeft && report.source && report.IDDict && report.buffFilter && report.globalBuffTable && (Object.keys(report.buffFilter).length > 0) &&(
          <BuffsTimeLine report={report} chartLeft = {chartLeft} chartInterval={chartInterval} chartRight = {chartRight} chartWidth ={chartWidth} SetError={setError}/>
        )}
        {chartLeft && otherReport.source && otherReport.IDDict && otherReport.buffFilter && otherReport.globalBuffTable && (Object.keys(otherReport.buffFilter).length > 0) &&(
          <BuffsTimeLine report = {otherReport} chartLeft = {chartLeft} chartInterval={chartInterval} chartRight = {chartRight} chartWidth ={chartWidth} SetError={setError}/>
        )}
        {chartLeft && report.source && report.IDDict && report.castTable && (Object.keys(report.castFilter).length > 0) && (
          <CastsTimeLine report = {report} chartLeft = {chartLeft} chartInterval={chartInterval} chartRight = {chartRight} chartWidth ={chartWidth} SetError={setError}/>
        )}
        {chartLeft && otherReport.source && otherReport.IDDict && otherReport.castTable&&(Object.keys(otherReport.CastFilter).length > 0) && (
          <CastsTimeLine report = {otherReport} chartLeft = {chartLeft} chartInterval={chartInterval} chartRight = {chartRight} chartWidth ={chartWidth} SetError={setError}/>
        )}
      </div>
    </div>
  );
}

export default App;