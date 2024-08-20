import React, { useState, useEffect} from 'react';
import Dropdown from './dropdown';
import {get_player_data, getKeyOptions} from './get_api_data';
import specIconURL from './specIconURL';

function SetSourceTarget({ReportID, fightID, SetError, SetSourceID, SetTargetID, SetSourceName, SetSpec, type, friendlyNPC, enemyNPC,masterNPCs, existOnly,
    setIDDict, initialSID, initialTID
}) {
    const [sourceIDOptions, setSourceIDOptions] = useState(null);
    const [targetIDOptions, setTargetIDOptions] = useState(null);
    const [initialSourceID, setInitialSourceID] = useState(null);
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

    const setSourceOptions = async () => {
        if(ReportID && fightID){
            const data = await get_player_data(ReportID, fightID)
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
            if(initialSID){
                setInitialSourceID(Number(initialSID));
            }
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
                SetSpec('ALL');
                return;
            }
            SetSourceID(selectedSource.id);
            SetSourceName(selectedSource.name);
            SetSpec({'class': selectedSource.type, 'spec': selectedSource.specs[0].spec});
        }
    }


    useEffect(()=>{
        if (sourceIDOptions && masterNPCs && friendlyNPC && enemyNPC){
            const friendlyList = sourceIDOptions
            const npcList = friendlyNPC.map(item => {
                const npcINFO = masterNPCs.find(npc => npc.gameID === item.gameID);
                return {
                    value: {id: item.id},
                    text: npcINFO.name,
                }
            });
            friendlyList.push(...npcList);
            const enemyList = enemyNPC.map(item => {
                const npcINFO = masterNPCs.find(npc => npc.gameID === item.gameID);
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
            setIDDict(dict);
        }
        else{
            setTargetIDOptions(null);
        }
        setInitialTargetID('ALL');
    }, [type, friendlyNPC, enemyNPC,sourceIDOptions, masterNPCs])

    const setTargetHandler = (selectedTarget) => {
        if(selectedTarget){
            if(selectedTarget === 'ALL'){
                SetTargetID('ALL');
                return;
            }
            const selectedTargetJson = selectedTarget;
            if(initialTID){
                setInitialTargetID(Number(initialTID));
            } else {
                setInitialTargetID(selectedTargetJson.id);
            }
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
                    <Dropdown name='source' options={sourceIDOptions} onSelectValue={setSourceHandler} initialOption={initialSourceID} getIcon={true}/>
                </div>
            )}
            {targetIDOptions && sourceIDOptions && (
                <div style={{...dropdownStyle, marginLeft: existOnly? '6px': '3px'}}>
                    <Dropdown name='target' options={targetIDOptions} onSelectValue={setTargetHandler} initialOption={initialTargetID} getIcon={true}/>
                </div>
            )}
      </div>
    )
}

export default SetSourceTarget;