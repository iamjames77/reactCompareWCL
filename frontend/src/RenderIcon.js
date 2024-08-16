import React, { useState, useEffect } from 'react';
import IconColor from './IconColor';

function RenderIcon({sc, scf, sID, chartWidth, chartLeft, chartRight, chartInterval, startTime, IDDict}){

    const tooltip = (timestamp, name, source, target, endCast) => {
        const Minute = Math.floor((timestamp % 3600000) / 60000) < 10 ? `0${Math.floor((timestamp % 3600000) / 60000)}` : Math.floor((timestamp % 3600000) / 60000);
        const Second = Math.floor((timestamp % 60000) / 1000) < 10? `0${Math.floor((timestamp % 60000) / 1000)}` : Math.floor((timestamp % 60000) / 1000);
        const miliSecond = Math.floor(timestamp % 1000) < 100 ? `00${Math.floor(timestamp % 1000)}` : Math.floor(timestamp % 1000) < 100 ? `0${Math.floor(timestamp % 1000)}` : Math.floor(timestamp % 1000);
        if (endCast){
            const endMinute = Math.floor((endCast % 3600000) / 60000) < 10 ? `0${Math.floor((endCast % 3600000) / 60000)}` : Math.floor((endCast % 3600000) / 60000);
            const endSecond = Math.floor((endCast % 60000) / 1000) < 10? `0${Math.floor((endCast % 60000) / 1000)}` : Math.floor((endCast % 60000) / 1000);
            const endMiliSecond = Math.floor(endCast % 1000) < 100 ? `00${Math.floor(endCast % 1000)}` : Math.floor(endCast % 1000) < 100 ? `0${Math.floor(endCast % 1000)}` : Math.floor(endCast % 1000);
            return `${Minute}:${Second}:${miliSecond}\r\n${IDDict[source]} begin casting ${name}\r\n${endMinute}:${endSecond}:${endMiliSecond}\r\n${IDDict[source]} cast ${name}` + ((target === -1) ? '' : ` on ${IDDict[target]}`);
        }
        return`${Minute}:${Second}:${miliSecond}\r\n${IDDict[source]} cast ${name}` + ((target === -1) ? '' : ` on ${IDDict[target]}`);
    }
    useEffect(() => {
        console.log(sc);
    }, [sc]);

    useEffect(() => {
        console.log(scf);
    }, [scf]);
    return (
        <div className='bar' style={{width:chartWidth + chartLeft + chartRight}}>
            <div style = {{width: chartLeft, height:'100%'}}>
                <div className='bar-text'>
                    {IDDict[sID]}
                </div>
            </div>
            <div style = {{width: chartWidth, height:'100%'}}>
                <>
                    {Object.entries(sc).map(([key, value],index ,array) => {
                        const type = value.type;
                        if(type === 'cast'){
                            if (array[index-1] && array[index-1][1].id === value.id && array[index-1][1].type === 'begincast'){
                                return;
                            }
                            return (
                                <div className={`timeline-bar`} style={{left: chartLeft + (value.timestamp - startTime) / 1000 * chartInterval - 20, height: '100%', width: 40, position: 'absolute', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                    <a href ={'https://www.wowhead.com/spell=' + value.abilityGameID} target="_blank" rel="noreferrer">
                                        <img src={`https://wow.zamimg.com/images/wow/icons/large/${value.icon}`} alt="" className="bar-img"/>
                                    </a>
                                    <span className="tooltip-text">{tooltip(value.timestamp - startTime, value.name, value.sourceID, value.targetID )}</span>
                                </div>
                            )
                        }
                        else if(type === 'begincast'){
                            if(array[index+1] && array[index+1][1].id === value.id && array[index+1][1].type === 'cast'){
                                return (
                                    <>
                                        <div className='timeline-bar' style={{left: chartLeft + (value.timestamp - startTime) / 1000 * chartInterval - 15, height: '100%', width: 30, position: 'absolute', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                            <a href ={'https://www.wowhead.com/spell=' + value.abilityGameID} target="_blank" rel="noreferrer">
                                                <img src={`https://wow.zamimg.com/images/wow/icons/large/${value.icon}`} alt="" className="bar-img"/>
                                            </a>
                                            <div style={{position: 'absolute', display: 'flex',justifyContent:'center', alignItems: 'center', height: 30,
                                            left: 30, width: (array[index+1][1].timestamp - value.timestamp) / 1000 * chartInterval - 15, backgroundColor: `rgb(${value.color[0]},${value.color[1]},${value.color[2]}`}}>
                                            </div>
                                            <span className="tooltip-text">{tooltip(value.timestamp - startTime, value.name, value.sourceID, value.targetID, array[index+1][1].timestamp - startTime)}</span>                                                
                                        </div>
                                        
                                    </>
                                )
                            }
                        }
                    })}
                </>
            </div>
        </div>
    );
}

export default RenderIcon;