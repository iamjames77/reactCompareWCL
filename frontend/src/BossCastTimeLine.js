import React, { useState, useEffect } from 'react';
import { get_hostility_event_data } from './get_api_data';
import './castBar.css';
import RenderIcon from './RenderIcon';

function BossCastTimeLine({report, SetError, chartLeft, chartInterval, chartRight, chartWidth}) {
    const [enemyCast, setEnemyCast] = useState({});

    const getHostilityEventData = async (id, nT) => {
        const fetchEventData = async (id, nT) => {
            const data = await get_hostility_event_data(report.reportID, report.fight, id, nT, report.endTime);
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
        const getEventData = async () => {
            const events = {};
            if(report.enemyCastTable){
                const fetchEventData = async(ect) => {
                    const promises = Object.entries(ect).map(async ([id, castTable]) => {
                        if(castTable.visibility){
                            const event = await getHostilityEventData(Number(id), report.startTime);
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
                await fetchEventData(report.enemyCastTable);
                setEnemyCast(events);
            }
        };
        getEventData();
    },[report.enemyCastTable, report.startTime, report.endTime]);

    return (
        <div>
            {
            (Object.getOwnPropertyNames(enemyCast).length > 0) && Object.entries(enemyCast).map(([id, enemy]) => (
                report.enemyCastFilter[id] && (
                <RenderIcon 
                    sc={enemy} 
                    scf={report.enemyCastFilter[id]} 
                    Name={report.IDDict[id]}
                    chartWidth={chartWidth} 
                    chartLeft={chartLeft} 
                    chartRight={chartRight} 
                    chartInterval={chartInterval} 
                    startTime={report.startTime}
                    endTime={report.endTime}
                    IDDict={report.IDDict}
                />
                )
            ))
            }
        </div>
    );
}

export default BossCastTimeLine;
