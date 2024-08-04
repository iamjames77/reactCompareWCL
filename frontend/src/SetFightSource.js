import React, { useState, useEffect } from 'react';
import {get_fight_options, get_player_data} from './get_api_data';
import Dropdown from './dropdown';
import specIconURL from './specIconURL';

function SetFightSource({ReportID, SetError, FightIDOptions, SetFightID, SetSourceID, SetSourceName, SetStartTime, SetEndTime}) {
    const [fightID, setFightID] = useState(null);
    const [fightIDOptions, setFightIDOptions] = useState(null);
    const [InitialFightID, setInitialFightID] = useState(null);
    const [sourceID, setSourceID] = useState(null);
    const [sourceName, setSourceName] = useState(null);
    const [sourceIDOptions, setSourceIDOptions] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);

    useEffect(() => {
        preprocessingFightOption(FightIDOptions);
    }, [FightIDOptions]);

    useEffect(() => {
        if(fightID){
            setSourceOptions();
        }
    }, [fightID]);

    const preprocessingFightOption = (data) => {
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
        setFightIDOptions(fightIDOption.flat().reverse());
        setInitialFightID(fightIDOption[0].text);
    }

    const setFightHandler = (selectedFight) => {
        if(selectedFight){
            const selectedFightJson = JSON.parse(selectedFight);
            setFightID(selectedFightJson.id);
            SetFightID(selectedFightJson.id);
            setStartTime(selectedFightJson.startTime);
            SetStartTime(selectedFightJson.startTime);
            setEndTime(selectedFightJson.endTime);
            SetEndTime(selectedFightJson.endTime);
        }
    }

    const setSourceOptions = () => {
        get_player_data(ReportID, fightID).then(data => {
            if (data.errors) {
                console.log(ReportID);
                SetError(data.errors[0].message);
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
            setSourceIDOptions([AllOption, ...sourceOptionList]);
        });
    }

    const setSourceHandler = (selectedSource) => {
        if(selectedSource){
            if (selectedSource === 'ALL'){
                setSourceID('ALL');
                SetSourceID('ALL');
                setSourceName('ALL');
                SetSourceName('ALL');
                return;
            }
            const selectedSourceJson = JSON.parse(selectedSource);
            setSourceID(selectedSourceJson.id);
            SetSourceID(selectedSourceJson.id);
            setSourceName(selectedSourceJson.name);
            SetSourceName(selectedSourceJson.name);
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

    const selectStyle = {
        width: '100%', /* 전체 너비 */
        display: 'flex',
        justifyContent: 'flex-start',
    }

    const dropdownStyle = {
        width: 'calc(50% - 9px)', /* 전체 너비 */
        margin: '6px',
    }

    return (
        <div style={selectStyle}>
            {fightIDOptions && (
                <div style={{...dropdownStyle, marginRight: '3px'}}>
                    <Dropdown name="Fight" options={fightIDOptions} onSelectValue={setFightHandler} getIcon={false}/>
                </div>
            )}
            {sourceIDOptions && (
                <div style={{...dropdownStyle, marginLeft: '3px'}}>
                    <Dropdown name="Source" options={sourceIDOptions} onSelectValue={setSourceHandler} getIcon={true}/>
                </div>
            )}
        </div>
    )
}

export default SetFightSource;