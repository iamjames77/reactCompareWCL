import React, { useState, useEffect } from 'react';
import { get_hostility_event_data } from './get_api_data';
import './castBar.css';
import RenderIcon from './RenderIcon';

function BossCast({reportID, fight, startTime, endTime, SetError, enemyCastTable, enemyCastFilter, chartLeft, chartInterval, chartRight, chartWidth, IDDict}) {
    const [enemyCast, setEnemyCast] = useState({});

    const getHostilityEventData = async (id, nT) => {
        const fetchEventData = async (id, nT) => {
            const data = await get_hostility_event_data(reportID, fight, id, nT, endTime);
            if (data.errors) {
                console.log('28');
                SetError(data.errors[0].message);
                return [];
            }
            SetError('');
            let result = data.data.reportData.report.events.data;
            const nextTime = data.data.reportData.report.events.nextPageTimestamp;
            if (nextTime) {
                const nextResult = await fetchEventData(id, nextTime);  // 재귀적으로 다음 페이지를 호출
                result = result.concat(nextResult);
            }
            return result;
        };

        return await fetchEventData(id, nT);
    };

    useEffect(() => {
        if(enemyCastFilter){
            console.log(enemyCastFilter);
        }
    }   ,[enemyCastFilter]);

    useEffect(() => {
        const getEventData = async () => {
            const events = {};
            if(enemyCastTable){
                const fetchEventData = async(ect) => {
                    const promises = Object.entries(ect).map(async ([id, castTable]) => {
                        if(castTable.visibility){
                            const event = await getHostilityEventData(Number(id), startTime);
                            events[id] = event.map(e => ({
                                ...e,
                                name : castTable.cast[e.abilityGameID]?.name,
                                icon : castTable.cast[e.abilityGameID]?.abilityIcon,
                                color : castTable.cast[e.abilityGameID]?.iconColor,
                            }));
                        }
                    });
                    await Promise.all(promises);
                };
                await fetchEventData(enemyCastTable);
                setEnemyCast(events);
                console.log(events);
            }
        };
        getEventData();
    },[enemyCastTable]);

    useEffect(() => {
        console.log(enemyCast);
        if(Object.getOwnPropertyNames(enemyCast).length > 0){
            console.log(enemyCast);
        }
    },[enemyCast]);

    return (
        <div>
            {
            (Object.getOwnPropertyNames(enemyCast).length > 0) && Object.entries(enemyCast).map(([id, enemy]) => (
                <RenderIcon 
                    key={id}
                    sc={enemy} 
                    scf={enemyCastFilter[id]} 
                    sID={id}
                    chartWidth={chartWidth} 
                    chartLeft={chartLeft} 
                    chartRight={chartRight} 
                    chartInterval={chartInterval} 
                    startTime={startTime} 
                    IDDict={IDDict}
                />
            ))
            }
        </div>
    );
}

export default BossCast;
