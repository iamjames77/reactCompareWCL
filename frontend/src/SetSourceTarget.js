import React, { useState, useEffect} from 'react';
import Dropdown from './dropdown';
import {get_player_data, getKeyOptions} from './get_api_data';
import specIconURL from './specIconURL';

function SetSourceTarget({ReportID, fightID, SetError, SetSourceID, SetTargetID, SetSourceName, type, npc, masterNPCs, existOnly}) {
    const [sourceIDOptions, setSourceIDOptions] = useState(null);
    const [targetIDOptions, setTargetIDOptions] = useState(null);
    const [initialTargetID, setInitialTargetID] = useState(null);

    useEffect(() => {
        if(fightID){
            setSourceOptions();
        }
        else{
            setSourceIDOptions(null);
            setTargetIDOptions(null);
            SetSourceID(null);
            SetTargetID(null);
            SetError('');
        }
    }, [ReportID, fightID]);

    const setSourceOptions = () => {
        if(ReportID && fightID){
            get_player_data(ReportID, fightID).then(data => {
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
                    const JSONValue = JSON.parse(item.value)[0];
                    const specIcon = specIconURL[JSONValue.type].find(spec => spec.spec === JSONValue.specs[0].spec).icon;
                    return {
                        value: JSON.stringify(JSONValue),
                        text: item.text,
                        imageURL: specIcon,
                        roles: item.roles
                    };
                });
                const AllOption = {
                    value: 'ALL',
                    text: 'ALL',
                    imageURL: 'https://wow.zamimg.com/images/wow/icons/large/ui_greenflag.jpg',
                    roles: 'All'
                }
                setSourceIDOptions([AllOption, ...sourceOptionList]);
                SetError('');
            });
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
                SetSourceID('ALL');
                SetSourceName(specIconList);
                return;
            }
            const selectedSourceJson = JSON.parse(selectedSource);
            SetSourceID(selectedSourceJson.id);
            SetSourceName(selectedSourceJson.name);
        }
    }


    useEffect(()=>{
        if (type === 'Healing' && sourceIDOptions){
            const targetList = sourceIDOptions
            if(npc){
                const npcList = npc.map(item => {
                    const npcINFO = masterNPCs.find(_npc => _npc.gameID === item.gameID);
                    return {
                        value: JSON.stringify({id: item.id}),
                        text: npcINFO.name,
                    }
                });
                targetList.push(...npcList);
            }
            setTargetIDOptions(targetList);
        }
        else if (type === 'DamageDone' && npc){
            const targetList = npc.map(item => {
                const npcINFO = masterNPCs.find(_npc => _npc.gameID === item.gameID);
                return {
                    value: JSON.stringify({id: item.id}),
                    text: npcINFO.name,
                }
            });
            const AllOption = {
                value: 'ALL',
                text: 'ALL',
                imageURL: 'https://wow.zamimg.com/images/wow/icons/large/ui_greenflag.jpg'
            }
            setTargetIDOptions([AllOption, ...targetList]);
        }
        setInitialTargetID('ALL');
    }, [type, npc, sourceIDOptions])

    const setTargetHandler = (selectedTarget) => {
        if(selectedTarget){
            if(selectedTarget === 'ALL'){
                SetTargetID('ALL');
                return;
            }
            const selectedTargetJson = JSON.parse(selectedTarget);
            SetTargetID(selectedTargetJson.id);
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
            {sourceIDOptions && (
                <div style={{...dropdownStyle, marginRight: existOnly? '6px' : '3px'}}>
                    <Dropdown name='source' options={sourceIDOptions} onSelectValue={setSourceHandler} getIcon={true}/>
                </div>
            )}
            {targetIDOptions && (
                <div style={{...dropdownStyle, marginLeft: existOnly? '6px': '3px'}}>
                    <Dropdown name='target' options={targetIDOptions} onSelectValue={setTargetHandler} initialOption={initialTargetID}getIcon={true}/>
                </div>
            )}
      </div>
    )
}

export default SetSourceTarget;