import React, { useState, useEffect } from 'react';
import { get_casts_event_data } from './get_api_data';
import './castBar.css';
import RenderIcon from './RenderIcon';
import { color } from 'highcharts';

function CastsTimeLine({reportID, fight, startTime, endTime, SetError, sourceID, table, filter, chartLeft, chartInterval, chartRight, chartWidth, IDDict}) {
    const [data, setData] = useState({});

    const getCastData = async (id, nT) => {
        const fetchEventData = async (id, nT) => {
            const data = await get_casts_event_data(reportID, fight, id, nT, endTime);
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
        const get_event_data = async () => {
            if(sourceID && Object.keys(table).length > 0){
                const fetchEventData = async(id) => {
                    const event = await getCastData(id, startTime);
                    const result = event.map(e => {
                        if(table[e.abilityGameID]){
                            return{
                            ...e,
                            name : table[e.abilityGameID]?.name,
                            icon : table[e.abilityGameID]?.abilityIcon,
                            color : table[e.abilityGameID]?.iconColor,
                            }
                        }
                        else {
                            return{
                            ...e,
                            name : 'Unknown',
                            icon : null,
                            color : [0, 0, 0]
                            }
                        }
                    });
                    return result;
                }
                const events = await fetchEventData(sourceID);
                setData(events);
            }
        }
        get_event_data();
    },[sourceID]);

    return (
        <div>
            {
            (Object.keys(data).length > 0) && (
                <RenderIcon 
                    sc={data}
                    scf={filter}
                    Name={IDDict[sourceID]}
                    chartLeft={chartLeft}
                    chartInterval={chartInterval}
                    chartRight={chartRight}
                    chartWidth={chartWidth}
                    startTime={startTime}
                    endTime={endTime}
                    IDDict={IDDict}
                />
                )
            }
        </div>
    );
}

export default CastsTimeLine;