import React, { useState, useEffect } from 'react';
import { get_buffs_event_data } from './get_api_data';
import './castBar.css';
import RenderIcon from './RenderIcon';

function BuffsTimeLine({report, SetError, chartLeft, chartInterval, chartRight, chartWidth}) {
    const [data, setData] = useState({});
    const [gotBuffList, setGotBuffList] = useState({});

    const getBuffData = async (id, abilityID, nT) => {
        const fetchEventData = async (id, abilityID, nT) => {
            const data = await get_buffs_event_data(report.reportID, report.fight, report.source, abilityID, nT, report.endTime);
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
            if(report.globalBuffTable && report.buffFilter){
                const fetchEventData = async(filter) => {
                    Object.keys(filter).forEach(async (abilityID) => {
                        if(!gotBuffList[abilityID]){
                            console.log(report.source, abilityID, report.startTime);
                            const event = await getBuffData(report.source, abilityID, report.startTime);
                            if(!report.globalBuffTable[abilityID]){
                                console.log(abilityID);
                            }   
                            const result = event.map(e => ({
                                ...e,
                                name : report.globalBuffTable[e.abilityGameID]?.name,
                                icon : report.globalBuffTable[e.abilityGameID]?.abilityIcon,
                                color : report.globalBuffTable[e.abilityGameID]?.iconColor,
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
                await fetchEventData(report.buffFilter);
            }
        }
        get_event_data();
    },[report.globalBuffTable, report.buffFilter]);

    useEffect(() => {
        if(Object.keys(data).length > 0){
            console.log('data', data);
        }
    },[data]);

    useEffect(() => {
        console.log('gotBuffList', gotBuffList);
    },[gotBuffList]);

    useEffect(() => {
        console.log('filter', report.buffFilter);
    }  ,[report.buffFilter]);

    return (
        <div>
            {
            (Object.keys(data).length > 0) && (Object.entries(data)).map(([index, value]) =>{
                console.log(value);
                if(report.buffFilter[index] === false){
                    return;
                }
                return(
                <RenderIcon 
                    sc = {value}
                    scf={report.buffFilter}
                    Name = {`${report.IDDict[report.source]} ${value[0]?.name}`}
                    chartLeft={chartLeft}
                    chartInterval={chartInterval}
                    chartRight={chartRight}
                    chartWidth={chartWidth}
                    startTime={report.startTime}
                    endTime = {report.endTime}
                    IDDict={report.IDDict}
                />)
            })
            }
        </div>
    );
}

export default BuffsTimeLine;
