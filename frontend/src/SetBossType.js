import React, { useState, useEffect } from 'react';
import {get_fight_options, getKeyOptions} from './get_api_data';
import Dropdown from './dropdown';

function SetBossType({report, setReport, SetError, setEncounterID, fightPhase, setFightPhase}) {
    const [nameOptions, setNameOptions] = useState(null);
    const [initialName, setInitialName] = useState(null);
    const [initialType, setInitialType] = useState(report.type);
    const [typeOptions, setTypeOptions] = useState(null);

    useEffect(() => {
        SetError('');
        if((!fightPhase.options) && report.reportID){
            getNameOptions(report.reportID);
        }
        
    }, [report]);

    const getNameOptions = (reportID) => {
        console.log(reportID)
        get_fight_options(reportID).then(data => {
          if (data.errors) {
            console.log('28')
            SetError(data.errors[0].message);
            return;
          }
          SetError('');
          const nameOptionsList = getKeyOptions(data.data.reportData.report.fights, 'name');
          const dict = {};
          const filternameOptionList = nameOptionsList.map(items => {
            const name = items.text.split(',')[0].trim();
            console.log(items)
            items.value.forEach(item =>{
                dict[item.id] = items.value[0].encounterID; 
            })
            return({
                ...items,
                text: name,
                optID: items.value[0].encounterID,
                imageURL: `https://assets.rpglogs.com/img/warcraft/bosses/${items.value[0].encounterID}-icon.jpg`,
            })
          });
          setInitialName(dict[report.fight]);
          setNameOptions(filternameOptionList);  
        });
    }
    
    // 보스 선택 처리
    const setSelectedNameHandler = (selectedName) => {
        if (selectedName){
            setEncounterID(selectedName[0].encounterID);
            setFightPhase(prevState => ({
                ...prevState,
                options: selectedName
            }));
        }
    }

    // type option 설정
    const setDTypeOption = () => {
        const dTypeList = [
            {value: 'DamageDone', text: 'Damage Done', optID: 'damage-done'},
            {value: 'Healing', text: 'Healing', optID: 'healing'},
        ]
        setTypeOptions(dTypeList);
    }

    // type 처리
    const setTypeHandler = (selectedType) => {
        setReport(prevState => ({
            ...prevState,
            type: selectedType
        }));
    }

    const selectStyle = {
        width: '100%', /* 전체 너비 */
        display: 'flex',
        justifyContent: 'flex-start',
    }

    const dropdownStyle = {
        width: 'calc(50% - 12px)', /* 전체 너비 */
        margin: '6px',
    }

    return (
        <div style = {selectStyle}>
            {nameOptions && typeOptions &&(
                <div style = {dropdownStyle}>
                    <Dropdown name='boss' options={nameOptions} onSelectValue={setSelectedNameHandler} getIcon={true} initialOption={initialName}/>
                </div>
            )}
            {nameOptions && typeOptions && (
                <div style = {dropdownStyle}>
                    <Dropdown name='type' options={typeOptions} onSelectValue={setTypeHandler} getIcon={false} initialOption={initialType}/>
                </div>
            )}
      </div>
    )
}

export default SetBossType;