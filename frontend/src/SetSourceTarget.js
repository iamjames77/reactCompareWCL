import React, { useState, useEffect} from 'react';
import Dropdown from './dropdown';
import {get_player_data, getKeyOptions} from './get_api_data';
import specIconURL from './specIconURL';

function SetSourceTarget({report, SetError, setReport, type, existOnly}) {
    const [sourceIDOptions, setSourceIDOptions] = useState(null);
    const [targetIDOptions, setTargetIDOptions] = useState(null);
    const [alternateTargetID, setAlternateTargetID] = useState(null);

    useEffect(() => {
        if(report.fight){
            setSourceOptions();
        }
    }, [report.reportID, report.fight]);

    const setSourceOptions = async () => {
        if(report.reportID && report.fight){
            const data = await get_player_data(report.reportID, report.fight);
            if (data.errors) {
                console.log('28')
                SetError(data.errors[0].message);
                return;
            }
            const tankList = getKeyOptions(data.data.reportData.report.playerDetails.data.playerDetails.tanks, 'name').map(item => ({
                ...item,
                roles: 'tank'
                }));
            const healerList = getKeyOptions(data.data.reportData.report.playerDetails.data.playerDetails.healers, 'name').map(item => ({
                ...item,
                roles: 'healer'
                }));
            const dpsList = getKeyOptions(data.data.reportData.report.playerDetails.data.playerDetails.dps, 'name').map(item => ({
                ...item,
                roles: 'dps'
                }));
            const sourceList = tankList.concat(healerList).concat(dpsList);
            const sourceOptionList = sourceList.map(item => {
                const JSONValue = item.value[0];
                const specIcon = specIconURL[JSONValue.type].find(spec => spec.spec === JSONValue.specs[0].spec).icon;
                return {
                    value: JSONValue,
                    text: item.text,
                    imageURL: specIcon,
                    roles: item.roles,
                    optID: JSONValue.id
                };
            });
            const AllOption = {
                value: 'ALL',
                text: 'ALL',
                imageURL: 'https://wow.zamimg.com/images/wow/icons/large/ui_greenflag.jpg',
                roles: 'All',
                optID: 'ALL'
            }
            setSourceIDOptions([AllOption, ...sourceOptionList]);
            SetError('');
        }
        else{
            setSourceIDOptions(null);
            SetError('');
        }
    }

    const setSourceHandler = (selectedSource) => {
        if(selectedSource){
            if (selectedSource === 'ALL'){
                const specIconList = {};
                sourceIDOptions.forEach((item)=> {
                    if(item.text !== 'ALL'){
                        specIconList[item.text] = item.imageURL;
                    }
                })
                setReport(prevState => ({
                    ...prevState,
                    source: 'ALL',
                    sourceName: specIconList,
                    class: 'ALL',
                    spec: 'ALL',
                }));
                return;
            }
            setReport(prevState => ({
                ...prevState,
                source: Number(selectedSource.id),
                sourceName: selectedSource.name,
                class: selectedSource.type,
                spec: selectedSource.specs,
            }));
        }
    }


    useEffect(()=>{
        if (sourceIDOptions && report.masterNPCs && report.friendlyNPCs && report.enemyNPCs){
            const friendlyList = sourceIDOptions
            const npcList = report.friendlyNPCs.map(item => {
                const npcINFO = report.masterNPCs.find(npc => npc.gameID === item.gameID);
                return {
                    value: {id: item.id},
                    text: npcINFO.name,
                }
            });
            friendlyList.push(...npcList);
            const enemyList = report.enemyNPCs.map(item => {
                const npcINFO = report.masterNPCs.find(npc => npc.gameID === item.gameID);
                return {
                    value: {id: item.id},
                    text: npcINFO.name,
                    optID: item.id
                }
            });
            const AllOption = {
                value: 'ALL',
                text: 'ALL',
                imageURL: 'https://wow.zamimg.com/images/wow/icons/large/ui_greenflag.jpg',
                optID: 'ALL'
            }
            if(type === 'Healing'){
                setTargetIDOptions(friendlyList);
            }
            else {
                setTargetIDOptions([AllOption, ...enemyList]);
            }
            const dict = {}
            friendlyList.forEach(item => {
                if(item.value !== 'ALL'){
                    dict[item.value.id] = item.text;
                }
            });
            enemyList.forEach(item => {
                dict[item.value.id] = item.text;
            });
            setReport(prevState => ({
                ...prevState,
                IDDict: dict,
            }));
        }
        else{
            setTargetIDOptions(null);
        }
        setAlternateTargetID('ALL');
    }, [type, report.friendlyNPCs, report.enemyNPCs, report.masterNPCs, sourceIDOptions]);

    const setTargetHandler = (selectedTarget) => {
        if(selectedTarget){
            if(selectedTarget === 'ALL'){
                setReport(prevState => ({
                    ...prevState,
                    target: 'ALL',
                }));
                return;
            }
            setReport(prevState => ({
                ...prevState,
                target: selectedTarget.id,
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
        <div style = {selectStyle}>
            {sourceIDOptions && targetIDOptions && (
                <div style={{...dropdownStyle, marginRight: existOnly? '6px' : '3px'}}>
                    <Dropdown name='source' options={sourceIDOptions} onSelectValue={setSourceHandler} initialOption={Number(report.source)} getIcon={true}/>
                </div>
            )}
            {targetIDOptions && sourceIDOptions && (
                <div style={{...dropdownStyle, marginLeft: existOnly? '6px': '3px'}}>
                    <Dropdown name='target' options={targetIDOptions} onSelectValue={setTargetHandler} initialOption={Number(report.target)} alternateOption={alternateTargetID} getIcon={true}/>
                </div>
            )}
      </div>
    )
}

export default SetSourceTarget;