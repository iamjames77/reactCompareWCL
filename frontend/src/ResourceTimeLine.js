import React from 'react';
import './castBar.css';

function ResourceTimeLine({ report, SetError, chartLeft, chartInterval, chartRight, chartWidth }) {
    const st = report.startTime;
    return Object.entries(report.resource).map(([key, timeline]) => {
        return (
            <div className='bar' style={{ width: chartWidth + chartLeft + chartRight }}>
                <div style={{ width: chartLeft, height: '100%', display: 'flex', alignItems: 'center' }}>
                    <div className='bar-text'>
                        {report.sourceName + ' ' + key}
                    </div>
                </div>
                <div style={{ width: chartWidth, height: '100%', position: 'relative' }}>
                    <>
                        {Object.entries(timeline).map(([time, stack], index, array) => {
                            return (
                                <div 
                                    style={{ 
                                        left:(time - st) / 1000 * chartInterval - 5, 
                                        position: 'absolute', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        height: '100%' 
                                    }}
                                    key={time}
                                >
                                    <div className='bar-text' style={{ fontSize: 19 }}>
                                        {stack}
                                    </div>
                                </div>
                            )
                        })}
                    </>
                </div>
            </div>
        );
    });
}

export default ResourceTimeLine;