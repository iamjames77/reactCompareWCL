import React, { useState, useEffect} from 'react';
import Dropdown from './dropdown';
import {get_player_data, getKeyOptions} from './get_api_data';
import specIconURL from './specIconURL';

function SetSource({ReportID, fightID, SetError, SetSourceID, SetSourceName}) {
    const [sourceIDOptions, setSourceIDOptions] = useState(null);

    useEffect(() => {
        setSourceOptions();
    }, [ReportID, fightID]);

    const setSourceOptions = () => {
        get_player_data(ReportID, fightID).then(data => {
            if (data.errors) {
                console.log(ReportID);
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
                    imageURL: specIcon
                };
            });
            const AllOption = {
                value: 'ALL',
                text: 'ALL',
                imageURL: 'https://wow.zamimg.com/images/wow/icons/large/ui_greenflag.jpg'
            }
            setSourceIDOptions([AllOption, ...sourceOptionList]);
            SetError('');
        });
    }

    const setSourceHandler = (selectedSource) => {
        if(selectedSource){
            if (selectedSource === 'ALL'){
                SetSourceID('ALL');
                SetSourceName('ALL');
                return;
            }
            const selectedSourceJson = JSON.parse(selectedSource);
            SetSourceID(selectedSourceJson.id);
            SetSourceName(selectedSourceJson.name);
        }
    }

    const selectStyle = {
        width: '100%', /* 전체 너비 */
        display: 'flex',
        justifyContent: 'flex-start',
    }

    const dropdownStyle = {
        width: 'calc(100% - 12px)', /* 전체 너비 */
        margin: '6px',
    }

    return (
        <div style = {selectStyle}>
            {sourceIDOptions && (
                <div style = {dropdownStyle}>
                    <Dropdown name='source' options={sourceIDOptions} onSelectValue={setSourceHandler} getIcon={true}/>
                </div>
            )}
      </div>
    )
}

export default SetSource;