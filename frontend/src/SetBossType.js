import React, { useState, useEffect } from 'react';
import {get_fight_options, get_player_data} from './get_api_data';
import Dropdown from './dropdown';

function SetBossType({ReportID, SetError, SetName, SetType, SetFightIDOptions}) {
    const [reportID, setReportID] = useState(ReportID);
    const [name, setName] = useState(null);
    const [nameOptions, setNameOptions] = useState(null);
    const [type, setType] = useState(null);
    const [initialType, setInitialType] = useState(false);
    const [typeOptions, setTypeOptions] = useState(null);

    useEffect(() => {
        if(reportID === null){
            SetError('input a report id');
            return;
        }
       getNameOptions(reportID);
    }, [reportID]);

    const getNameOptions = (reportID) => {
        get_fight_options(reportID).then(data => {
          if (data.errors) {
            SetError(data.errors[0].message);
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
        if (selectedName){
            const selectedNameJson = JSON.parse(selectedName);
            setName(selectedNameJson[0].encounterID);
            SetName(selectedNameJson[0].encounterID);
            SetFightIDOptions(selectedNameJson);
            setDTypeOption();
        }
    }

    // type option 설정
    const setDTypeOption = () => {
        const dTypeList = [
            {value: 'DamageDone', text: 'Damage Done'},
            {value: 'Healing', text: 'Healing'},
        ]
        setTypeOptions(dTypeList);
        setInitialType(dTypeList[0].text);
    }

    // type 처리
    const setTypeHandler = (selectedType) => {
        setType(selectedType);
        SetType(selectedType);
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
        width: 'calc(50% - 12px)', /* 전체 너비 */
        margin: '6px',
    }

    return (
        <div style = {selectStyle}>
            {nameOptions && (
                <div style = {dropdownStyle}>
                    <Dropdown name='boss' options={nameOptions} onSelectValue={setSelectedNameHandler} getIcon={true}/>
                </div>
            )}
            {typeOptions && (
                <div style = {dropdownStyle}>
                    <Dropdown name='type' options={typeOptions} onSelectValue={setTypeHandler} getIcon={false} initialOption={initialType}/>
                </div>
            )}
      </div>
    )
}

export default SetBossType;