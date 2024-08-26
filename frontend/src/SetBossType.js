import React, { useState, useEffect } from 'react';
import {get_fight_options, getKeyOptions} from './get_api_data';
import Dropdown from './dropdown';

function SetBossType({report, setReport, SetError, type, setType, setEncounterID}) {
    const [initialName, setInitialName] = useState(null);
    const [initialType, setInitialType] = useState(type);
    const [typeOptions, setTypeOptions] = useState(null);

    useEffect(() => {
        SetError('');
        if(report.reportID){
            getNameOptions(report.reportID, report.fight);
            setReport(prevState => ({
                ...prevState,
                fightIDOptions: null,
            }));
        }
    }, [report.reportID]);

    useEffect(() => {
        if(type){
            setDTypeOption(type);
        }
    }, [type]);

    const getNameOptions = (reportID, fight) => {
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
                    dict[item.id] = items.value[0].encounterID; 
                })
                return({
                    ...items,
                    text: name,
                    optID: items.value[0].encounterID,
                    imageURL: `https://assets.rpglogs.com/img/warcraft/bosses/${items.value[0].encounterID}-icon.jpg`,
                })
            });
            setInitialName(dict[fight]);
            setReport(prevState => ({
                ...prevState,
                nameOptions: filternameOptionList,
            }));
        });
    }
    
    // 보스 선택 처리
    const setSelectedNameHandler = (selectedName) => {
        if (selectedName){
            setReport(prevState => ({
                ...prevState,
                fightIDOptions: selectedName
            }));
            setEncounterID(selectedName[0].encounterID);
        }
    }

    // type option 설정
    const setDTypeOption = (type) => {
        const dTypeList = [
            {value: 'DamageDone', text: 'Damage Done', optID: 'DamageDone'},
            {value: 'Healing', text: 'Healing', optID: 'Healing'},
        ]
        setInitialType(type);
        setTypeOptions(dTypeList);
    }

    // type 처리
    const setTypeHandler = (selectedType) => {
        setType(selectedType);
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
            {report.nameOptions && (
                <div style = {dropdownStyle}>
                    <Dropdown name='boss' options={report.nameOptions} onSelectValue={setSelectedNameHandler} getIcon={true} initialOption={initialName}/>
                </div>
            )}
            {report.nameOptions && typeOptions && (
                <div style = {dropdownStyle}>
                    <Dropdown name='type' options={typeOptions} onSelectValue={setTypeHandler} getIcon={false} initialOption={initialType}/>
                </div>
            )}
      </div>
    )
}

export default SetBossType;