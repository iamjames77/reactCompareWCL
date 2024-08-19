import React, { useState, useEffect } from 'react';
import { get_buffs_event_data } from './get_api_data';
import './castBar.css';
import RenderIcon from './RenderIcon';

function BuffsTimeLine({reportID, fight, startTime, endTime, SetError, sourceID, table, filter, chartLeft, chartInterval, chartRight, chartWidth, IDDict}) {
    const [data, setData] = useState({});
    const [gotBuffList, setGotBuffList] = useState({});

    const getBuffData = async (id, abilityID, nT) => {
        const fetchEventData = async (id, abilityID, nT) => {
            const data = await get_buffs_event_data(reportID, fight, sourceID, abilityID, nT, endTime);
            if (data.errors) {
                console.log('28');
                SetError(data.errors[0].message);
                return [];
            }
            SetError('');
            console.log(data);
            let result = data.data;
            const nextTime = data.nextPageTimestamp;
            if (nextTime) {
                const nextResult = await fetchEventData(id, nextTime);  // 재귀적으로 다음 페이지를 호출
                result = result.concat(nextResult);
            }
            return result;
        };

        return await fetchEventData(id, abilityID, nT);
    };

    useEffect(() => {
        const get_event_data = async () => {
            if(table && filter){
                const fetchEventData = async(filter) => {
                    Object.keys(filter).forEach(async (abilityID) => {
                        if(!gotBuffList[abilityID]){
                            console.log(sourceID, abilityID, startTime);
                            const event = await getBuffData(sourceID, abilityID, startTime);
                            if(!table[abilityID]){
                                console.log(abilityID);
                            }   
                            const result = event.map(e => ({
                                ...e,
                                name : table[e.abilityGameID]?.name,
                                icon : table[e.abilityGameID]?.abilityIcon,
                                color : table[e.abilityGameID]?.iconColor,
                            }));
                            console.log(result);
                            setData(prevState => ({
                                ...prevState,
                                [abilityID]: result,
                            }));
                            setGotBuffList(prevState => ({
                                ...prevState,
                                [abilityID]: true,
                            }));
                        }
                    });
                }
                await fetchEventData(filter);
            }
        }
        get_event_data();
    },[table, filter]);

    useEffect(() => {
        if(Object.keys(data).length > 0){
            console.log('data', data);
        }
    },[data]);

    useEffect(() => {
        console.log('gotBuffList', gotBuffList);
    },[gotBuffList]);

    useEffect(() => {
        console.log('filter', filter);
    }  ,[filter]);

    return (
        <div>
            {
            (Object.keys(data).length > 0) && (Object.entries(data)).map(([index, value]) =>{
                console.log(value);
                if(filter[index] === false){
                    return;
                }
                return(
                <RenderIcon 
                    sc = {value}
                    scf={filter}
                    Name = {`${IDDict[sourceID]} ${value[0]?.name}`}
                    chartLeft={chartLeft}
                    chartInterval={chartInterval}
                    chartRight={chartRight}
                    chartWidth={chartWidth}
                    startTime={startTime}
                    endTime = {endTime}
                    IDDict={IDDict}
                />)
            })
            }
        </div>
    );
}

export default BuffsTimeLine;
