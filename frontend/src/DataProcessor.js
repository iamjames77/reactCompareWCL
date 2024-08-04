import React, { useState, useEffect } from 'react';
import {get_fight_options, get_player_data} from './get_api_data';
import Dropdown from './dropdown';
import specIconURL from './specIconURL';
import { text } from '@fortawesome/fontawesome-svg-core';

function DataProcessor({ReportId, setError, SetName, SetFight, SetType, SetSource, SetSourceName, SetStartTime, SetEndTime}) {
    const [reportId, setReportId] = useState(ReportId);
    const [name, setName] = useState(null);
    const [nameOptions, setNameOptions] = useState(null);
    const [nameReset, setNameReset] = useState(false);
    const [fight, setFight] = useState(null);
    const [fightOptions, setFightOptions] = useState(null);
    const [fightReset, setFightReset] = useState(false);
    const [type, setType] = useState(null);
    const [typeOptions, setTypeOptions] = useState(null);
    const [typeReset, setTypeReset] = useState(false);
    const [source, setSource] = useState(null);
    const [sourceName, setSourceName] = useState(null);
    const [SourceIdOptions, setSourceIdOptions] = useState(null);
    const [sourceReset, setSourceReset] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);

    useEffect(() => {
        if(reportId === null){
            setError('input a report id');
            return;
        }
       getFightOptions(reportId);
    }, [reportId]);

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

    // 보스 선택 처리
    const setSelectedNameHandler = (selectedName) => {
        const selectedNameJson = JSON.parse(selectedName);
        setName(selectedNameJson[0].name);
        SetName(selectedNameJson[0].name);
        setFightIdOption(selectedNameJson);
    }

    // 보스 선택시
    useEffect(() => {
        if(name != null){
          setNameReset(false);
          setFightReset(true);
          setTypeReset(true);
          setSourceReset(true);
        }
        setFight(null);
        SetFight(null);
    }, [name]);

    //fightId 옵션 설정
    const setFightIdOption = (data) => {
        const killData = getKeyOptions(data, 'kill');
        const fightIDOption = killData.map(kill => {
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
        setFightOptions(fightIDOption.flat().reverse());
    }
    
    //fight 처리
    const setSelectedFightHandler = (selectedFight) => {
        const selectedFightJson = JSON.parse(selectedFight);
        setFight(selectedFightJson.id);
        SetFight(selectedFightJson.id);
        setStartTime(selectedFightJson.startTime);
        SetStartTime(selectedFightJson.startTime);
        setEndTime(selectedFightJson.endTime);
        SetEndTime(selectedFightJson.endTime);
        setDTypeOption();
    }

    //fight 선택시
    useEffect(() => {
        if(fight != null){
          setFightReset(false);
          setTypeReset(true);
          setSourceReset(true);
        }
        setType(null);
        SetType(null);
      }, [fight]);

      // type option 설정
    const setDTypeOption = () => {
        const dTypeList = [
            {value: 'DamageDone', text: 'Damage Done'},
            {value: 'Healing', text: 'Healing'},
        ]
        setTypeOptions(dTypeList);
    }

    // type 처리
    const setTypeHandler = (selectedType) => {
        setType(selectedType);
        SetType(selectedType);
        setSourceOptions();
    }

    // type 선택시
    useEffect(() => {
        setSource(null);
        SetSource(null);
        setSourceName(null);
        SetSourceName(null);
        if(type != null){
            setTypeReset(false);
        }
        console.log('resetSource at type');
    }, [type]);

    // source option 설정
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
                const specIcon = specIconURL[JSONValue.type].find(spec => spec.spec === JSONValue.specs[0].spec).icon;
                return {
                    value: JSON.stringify(JSONValue),
                    text: item.text,
                    imageURL: specIcon
                };
            });
            const AllOption = {
                value: 'ALL',
                text: 'ALL',
                imageURL: null
            }
            setSourceIdOptions([AllOption, ...sourceOptionList]);
        });
    }

    // source 처리
    const setSourceHandler = (selectedSource) => {
        if (selectedSource === 'ALL'){
            setSource('ALL');
            setSourceName('ALL');
            SetSource('ALL');
            SetSourceName('ALL');
            return;
        }
        setSource(JSON.parse(selectedSource).id);
        setSourceName(JSON.parse(selectedSource).name);
        SetSource(JSON.parse(selectedSource).id);
        SetSourceName(JSON.parse(selectedSource).name);
    }

    // source 선택시
    useEffect(() => {
        console.log('source useEffect');
        if(source != null){
            setSourceReset(false);
        }
    }, [source]);

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

    const selectStyle = {
        width: '100%', /* 전체 너비 */
        display: 'flex',
        justifyContent: 'flex-start',
        gap: '10' + 'px',
    }
    

    return (
        <div style = {selectStyle}>
            {nameOptions && (
                <Dropdown name='boss' options={nameOptions} onSelectValue={setSelectedNameHandler} getIcon={true} isChange={nameReset}/>
            )}
            {fightOptions && (
                <Dropdown name='fight' options={fightOptions} onSelectValue={setSelectedFightHandler} getIcon={false} isChange={fightReset}/>
            )}
            {typeOptions && (
                <Dropdown name='type' options={typeOptions} onSelectValue={setTypeHandler} getIcon={false} isChange={typeReset}/>
            )}
            {SourceIdOptions && (
                <Dropdown name='source' options={SourceIdOptions} onSelectValue={setSourceHandler} getIcon={true} isChange={sourceReset}/>
            )}
      </div>
    )
}

export default DataProcessor;