import React, { useState, useEffect } from 'react';
import { get_casts_event_data } from './get_api_data';
import './castBar.css';
import RenderIcon from './RenderIcon';
import { color } from 'highcharts';

function CastsTimeLine({report, SetError, chartLeft, chartInterval, chartRight, chartWidth}) {
    const [data, setData] = useState({});

    const getCastData = async (id, nT) => {
        const fetchEventData = async (id, nT) => {
            const data = await get_casts_event_data(report.reportID, report.fight, id, nT, report.endTime);
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
            if(report.source && Object.keys(report.castTable).length > 0){
                const fetchEventData = async(id) => {
                    const event = await getCastData(id, report.startTime);
                    const result = event.map(e => {
                        if(report.castTable[e.abilityGameID]){
                            return{
                            ...e,
                            name : report.castTable[e.abilityGameID]?.name,
                            icon : report.castTable[e.abilityGameID]?.abilityIcon,
                            color : report.castTable[e.abilityGameID]?.iconColor,
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
                if(report.source !== 'ALL'){
                    const events = await fetchEventData(report.source);
                    setData(events);
                }
            }
        }
        get_event_data();
    },[report.source]);

    return (
        <div>
            {
            (Object.keys(data).length > 0) && (
                <RenderIcon 
                    sc={data}
                    scf={report.castFilter}
                    Name={report.IDDict[report.source]}
                    chartLeft={chartLeft}
                    chartInterval={chartInterval}
                    chartRight={chartRight}
                    chartWidth={chartWidth}
                    startTime={report.startTime}
                    endTime={report.endTime}
                    IDDict={report.IDDict}
                />
                )
            }
        </div>
    );
}

export default CastsTimeLine;