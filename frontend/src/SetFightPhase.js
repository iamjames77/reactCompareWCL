import React, { useState, useEffect } from 'react';
import {get_phase_info, getKeyOptions} from './get_api_data';
import Dropdown from './dropdown';

function SetFightPhase({ReportID, SetError, FightIDOptions, SetFightID, SetStartTime, SetEndTime, existOnly}) {
    const [fightID, setFightID] = useState(null);
    const [fightIDOptions, setFightIDOptions] = useState(null);
    const [InitialFightID, setInitialFightID] = useState(null);
    const [sourceID, setSourceID] = useState(null);
    const [sourceName, setSourceName] = useState(null);
    const [fightstartTime, setFightStartTime] = useState(null);
    const [fightendTime, setFightEndTime] = useState(null);
    const [sourceIDOptions, setSourceIDOptions] = useState(null);
    const [encounterID, setEncounterID] = useState(null);
    const [phaseList, setPhaseList] = useState(null);
    const [phaseIDOptions, setPhaseIDOptions] = useState(null);
    const [initialPhaseID, setInitialPhaseID] = useState(null);

    useEffect(() => {
        preprocessingFightOption(FightIDOptions);
    }, [FightIDOptions]);

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
        const flatfightIDOption = fightIDOption.flat().reverse();
        setFightIDOptions(flatfightIDOption);
        setFightID(null);
        SetFightID(null);
        if(!flatfightIDOption){
            console.log('No fight data');
            SetError('No fight data');
            return;
        }
        setInitialFightID('KILL');
        SetError('');
    }
    
    const setFightHandler = (selectedFight) => {
        if(selectedFight){
            const selectedFightJson = JSON.parse(selectedFight);
            setFightID(selectedFightJson.id);
            SetFightID(selectedFightJson.id);
            setFightStartTime(selectedFightJson.startTime);
            setFightEndTime(selectedFightJson.endTime);
            setEncounterID(selectedFightJson.encounterID);
            setPhaseList(selectedFightJson.phaseTransitions);
        }
    }

    useEffect(() => {
        if(fightID){
            setPhaseOptions();
        }
    }, [fightID]);

    const setPhaseOptions= () => {
        get_phase_info(ReportID).then(data => {
            if (data.errors) {
                console.log('setPhaseOptions');
                SetError(data.errors[0].message);
                return;
            }
            const result = [];
            result.push({
                value: JSON.stringify({startTime: fightstartTime, endTIme:fightendTime}),
                text: 'All Phases',
            })
            if(phaseList){
                const phaseInfo = phaseList.map(item1 =>{
                const phaseData = data.data.reportData.report.phases.find(item2 => 
                    item2.encounterID === encounterID).phases.find(item3 => item3.id === item1.id);
                if (phaseData){
                    return {...item1, ...phaseData};
                }
                return item1;
                }).filter(item => item !== undefined);
                const ObjectPhaseInfo = Object.values(phaseInfo);
            
                for (let i= 0; i< ObjectPhaseInfo.length; i++){
                    if (i === ObjectPhaseInfo.length -1) {
                        result.push({
                            value: JSON.stringify({startTime: ObjectPhaseInfo[i].startTime, endTIme:fightendTime}),
                            text: ObjectPhaseInfo[i].name,
                        });
                    }
                    else{
                        result.push({
                            value: JSON.stringify({startTime: ObjectPhaseInfo[i].startTime, endTIme:ObjectPhaseInfo[i+1].startTime}),
                            text: ObjectPhaseInfo[i].name,
                        });
                    }
                }            
            }

            setPhaseIDOptions(result);
            setInitialPhaseID(result[0].text);
            SetError('');
        });
    }

    const setPhaseHandler = (selectedPhase) => {
        if(selectedPhase){
            const selectedPhaseJson = JSON.parse(selectedPhase);
            SetStartTime(selectedPhaseJson.startTime);
            SetEndTime(selectedPhaseJson.endTIme);
        }
    }

    const selectStyle = {
        width: '100%', /* 전체 너비 */
        display: 'flex',
        justifyContent: 'flex-start',
    }

    const dropdownStyle = {
        width: existOnly ? 'calc(50% - 12px)' : 'calc(50% - 9px)', /* 전체 너비 */
        margin: '6px',
    }

    return (
        <div style={selectStyle}>
            {fightIDOptions && (
                <div style={{...dropdownStyle, marginRight: existOnly? '6px' : '3px'}}>
                    <Dropdown name="Fight" options={fightIDOptions} onSelectValue={setFightHandler} getIcon={false} initialOption={InitialFightID}/>
                </div>
            )}
            {phaseIDOptions && (
                <div style={{...dropdownStyle, marginLeft: existOnly?'6px': '3px'}}>
                    <Dropdown name="Phase" options={phaseIDOptions} onSelectValue={setPhaseHandler} getIcon={false} initialOption={initialPhaseID}/>
                </div>
            )}
        </div>
    )
}

export default SetFightPhase;