import React, { useState, useEffect } from 'react';
import {get_phase_info, getKeyOptions} from './get_api_data';
import Dropdown from './dropdown';

function SetFightPhase({report, SetError, setReport, existOnly}) {
    const [fightIDOptions, setFightIDOptions] = useState(null);
    const [InitialFightID, setInitialFightID] = useState(null);
    const [alternateFightID, setAlternateFightID] = useState(null);
    const [fightstartTime, setFightStartTime] = useState(null);
    const [fightendTime, setFightEndTime] = useState(null);
    const [encounterID, setEncounterID] = useState(null);
    const [phaseList, setPhaseList] = useState(null);
    const [phaseIDOptions, setPhaseIDOptions] = useState(null);
    const [initialPhaseID, setInitialPhaseID] = useState(null);
    const [alternatePhaseID, setAlternatePhaseID] = useState(null);

    useEffect(() => {
        preprocessingFightOption(report.fightIDOptions);
    }, [report.fightIDOptions]);

    const preprocessingFightOption = (data) => {
        const killData = getKeyOptions(data, 'kill');
        let killID = null;
        const fightIDOption = killData.map(kill => {
          const killJson = kill.value;
          return killJson.map(killData => {
            if(killData.kill === true){
                killID = killData.id;
              return {
                value: killData,
                text: 'KILL',
                optID: killData.id,
              }
            }
            else{
              return {
                value: killData,
                text: killData.lastPhaseIsIntermission ? 'P' + killData.lastPhase + ' ' + killData.bossPercentage + '%' : 'l' + killData.lastPhase + ' ' + killData.bossPercentage + '%',
                optID: killData.id,
                }
            }
          })
        });
        const flatfightIDOption = fightIDOption.flat().reverse();
        setFightIDOptions(flatfightIDOption);
        if(!flatfightIDOption){
            console.log('No fight data');
            SetError('No fight data');
            return;
        }
        if(report.fight){
            setInitialFightID(Number(report.fight));
        } 
        setAlternateFightID(killID);
        SetError('');
    }
    
    const setFightHandler = (selectedFight) => {
        if(selectedFight){
            setReport(prevState => ({
                ...prevState,
                fight: selectedFight.id,
            }));
            setFightStartTime(selectedFight.startTime);
            setFightEndTime(selectedFight.endTime);
            setEncounterID(selectedFight.encounterID);
            setPhaseList(selectedFight.phaseTransitions);
        }
    }

    useEffect(() => {
        if(phaseList){
            setPhaseOptions();
        }
    }, [report.phase, phaseList]);

    const setPhaseOptions= async () => {
        const data = await get_phase_info(report.reportID)
        if (data.errors) {
            console.log('setPhaseOptions');
            SetError(data.errors[0].message);
            return;
        }
        const result = [];
        result.push({
            value: {startTime: fightstartTime, endTIme:fightendTime},
            text: 'All Phases',
            optID: 'All Phases',
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
                        value: {startTime: ObjectPhaseInfo[i].startTime, endTIme:fightendTime},
                        text: ObjectPhaseInfo[i].name,
                        optID: ObjectPhaseInfo[i].id,
                    });
                }
                else{
                    result.push({
                        value: {startTime: ObjectPhaseInfo[i].startTime, endTIme:ObjectPhaseInfo[i+1].startTime},
                        text: ObjectPhaseInfo[i].name,
                        optID: ObjectPhaseInfo[i].id,
                    });
                }
            }            
        }
        setPhaseIDOptions(result);
        if(report.phase){
            setInitialPhaseID(Number(report.phase));
        }
        else{
            setInitialPhaseID(null);
        }
        setAlternatePhaseID(result[0].optID);
        SetError('');
    }

    const setPhaseHandler = (selectedPhase) => {
        if(selectedPhase){
            setReport(prevState => ({
                ...prevState,
                startTime: selectedPhase.startTime,
                endTime: selectedPhase.endTIme,
            }));
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
                    <Dropdown name="Fight" options={fightIDOptions} onSelectValue={setFightHandler} getIcon={false} initialOption={InitialFightID} alternateOption={alternateFightID}/>
                </div>
            )}
            {phaseIDOptions && fightIDOptions &&(
                <div style={{...dropdownStyle, marginLeft: existOnly?'6px': '3px'}}>
                    <Dropdown name="Phase" options={phaseIDOptions} onSelectValue={setPhaseHandler} getIcon={false} initialOption={initialPhaseID} alternateOption={alternatePhaseID}/>
                </div>
            )}
        </div>
    )
}

export default SetFightPhase;