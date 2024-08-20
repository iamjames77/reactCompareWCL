import React, { useState, useEffect } from 'react';
import {get_fight_options, getKeyOptions} from './get_api_data';
import Dropdown from './dropdown';

function SetBossType({ReportID, SetError, SetName, SetType, SetFightIDOptions, initialFight, initialTy}) {
    const [reportID, setReportID] = useState(ReportID);
    const [nameOptions, setNameOptions] = useState(null);
    const [initialName, setInitialName] = useState(null);
    const [initialType, setInitialType] = useState(false);
    const [typeOptions, setTypeOptions] = useState(null);

    useEffect(() => {
        setReportID(ReportID);
    },[ReportID]);

    useEffect(() => {
        if(reportID === null){
            console.log('reportID is null');
            SetError('input a report id');
            return;
        }
        setNameOptions(null);
        SetError('');
        getNameOptions(reportID);
        setDTypeOption();
    }, [reportID]);

    const getNameOptions = (reportID) => {
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
            items.value.forEach(item =>{
                dict[item.id] = name; 
            })
            return({
                ...items,
                text: name,
                optID: name,
                imageURL: `https://assets.rpglogs.com/img/warcraft/bosses/${items.value[0].encounterID}-icon.jpg`,
            })
          });
          if(initialFight){
            setInitialName(dict[initialFight]);
          }
          setNameOptions(filternameOptionList);  
        });
    }

    // 보스 선택 처리
    const setSelectedNameHandler = (selectedName) => {
        if (selectedName){
            const selectedNameJson = selectedName;
            SetName(selectedNameJson[0].encounterID);
            SetFightIDOptions(selectedNameJson);
        }
    }

    // type option 설정
    const setDTypeOption = () => {
        const dTypeList = [
            {value: 'DamageDone', text: 'Damage Done', optID: 'DamageDone'},
            {value: 'Healing', text: 'Healing', optID: 'Healing'},
        ]
        setTypeOptions(dTypeList);
        if(initialTy && (initialTy === 'DamageDone' || initialTy === 'Healing')){
            setInitialType(initialTy);
        }else{
            setInitialType(dTypeList[0].value);
        }
    }

    // type 처리
    const setTypeHandler = (selectedType) => {
        SetType(selectedType);
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