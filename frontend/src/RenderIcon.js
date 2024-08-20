import React, { useState, useEffect } from 'react';
import IconColor from './IconColor';

function RenderIcon({sc, scf, Name, chartWidth, chartLeft, chartRight, chartInterval, startTime, endTime, IDDict}){

    const tooltip = (timestamp, name, source, target, type, endCast) => {
        const Minute = Math.floor((timestamp % 3600000) / 60000) < 10 ? `0${Math.floor((timestamp % 3600000) / 60000)}` : Math.floor((timestamp % 3600000) / 60000);
        const Second = Math.floor((timestamp % 60000) / 1000) < 10? `0${Math.floor((timestamp % 60000) / 1000)}` : Math.floor((timestamp % 60000) / 1000);
        const miliSecond = Math.floor(timestamp % 1000) < 10 ? `00${Math.floor(timestamp % 1000)}` : Math.floor(timestamp % 1000) < 100 ? `0${Math.floor(timestamp % 1000)}` : Math.floor(timestamp % 1000);
        if (endCast){
            const endMinute = Math.floor((endCast % 3600000) / 60000) < 10 ? `0${Math.floor((endCast % 3600000) / 60000)}` : Math.floor((endCast % 3600000) / 60000);
            const endSecond = Math.floor((endCast % 60000) / 1000) < 10? `0${Math.floor((endCast % 60000) / 1000)}` : Math.floor((endCast % 60000) / 1000);
            const endMiliSecond = Math.floor(endCast % 1000) < 100 ? `00${Math.floor(endCast % 1000)}` : Math.floor(endCast % 1000) < 100 ? `0${Math.floor(endCast % 1000)}` : Math.floor(endCast % 1000);
            return (type === 'cast'? `${Minute}:${Second}:${miliSecond}\r\n${IDDict[source]} begin casting ${name}\r\n${endMinute}:${endSecond}:${endMiliSecond}\r\n${IDDict[source]} cast ${name}` + ((target === -1) ? '' : ` on ${IDDict[target]}`)
        : `${Minute}:${Second}:${miliSecond}\r\n${IDDict[source]} ${type} ${name}\r\n${endMinute}:${endSecond}:${endMiliSecond}\r\n${IDDict[source]} removebuff ${name}` + ((target === -1) ? '' : ` on ${IDDict[target]}`));
        }
        return`${Minute}:${Second}:${miliSecond}\r\n${IDDict[source]} ${type} ${name}` + ((target === -1) ? '' : ` on ${IDDict[target]}`);
    }

    return (
        <div className='bar' style={{width:chartWidth + chartLeft + chartRight}}>
            <div style = {{width: chartLeft, height:'100%'}}>
                <div className='bar-text'>
                    {Name}
                </div>
            </div>
            <div style = {{width: chartWidth, height:'100%'}}>
                <>
                    {Object.entries(sc).map(([key, value],index ,array) => {
                        let success = false;
                        let i = 1;
                        const type = value.type;
                        if(type === 'begincast'){
                            while(array[index + i] && (array[index+ i][1].timestamp - value.timestamp) < 5000){
                                if(array[index + i][1].abilityGameID === value.abilityGameID){
                                    if(array[index + i][1].type === 'cast'){
                                        success = true;
                                        array[index + i][1].hide = true;
                                        break;
                                    }
                                    else if(array[index + i][1].type === 'begincast'){
                                        break;
                                    }
                                }
                                i++;
                            }
                        }
                        const fail = (type == 'begincast') && !success;

                        let bufftype = false;
                        let stack = 0;
                        let buffend = false;
                        if(type === 'applybuff' || type === 'refreshbuff'|| type === 'removebuff'|| 
                            type === 'removebuffstack'|| type === 'applybuffstack'){
                            bufftype = true;  
                            if((type === 'removebuffstack'|| type === 'applybuffstack')){
                                stack = value.stack;
                            }
                            if(type === 'applybuffstack' && array[index + 1] && array[index + 1][1].type === 'refreshbuff'
                                && array[index + 1][1].timestamp === value.timestamp){
                                    i++;
                                    array[index + 1][1].hide = true;
                                }

                            if ((type === 'applybuff' || type === 'refreshbuff') && array[index + 1] && array[index + 1][1].type === 'removebuffstack'){
                                stack = array[index + 1][1].stack + 1;    
                            }
                            if (type === 'applybuff' && array[index + 1] && array[index + 1][1].type === 'applybuffstack'){
                                stack = array[index + 1][1].stack - 1;
                            }                            
                            if(!array[index+1]){
                                buffend = true;
                            }
                            else if (array[index+1][1] && array[index+1][1].type === 'removebuff'){
                                buffend = true;
                            }
                        }
                            
                        if((type === 'cast' && value.hide)|| (type === 'removebuff') || (type === 'refreshbuff' && value.hide)){
                            return;
                        }
                        return (
                                <div className={`timeline-bar ${scf[value.abilityGameID] ? '' : 'hidden'}`} style={{left: chartLeft + (value.timestamp - startTime) / 1000 * chartInterval - 17, height: '100%', width: 34, position: 'absolute', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                    <a href ={'https://www.wowhead.com/spell=' + value.abilityGameID} target="_blank" rel="noreferrer">
                                        <img src={`https://wow.zamimg.com/images/wow/icons/large/${value.icon}`} alt="" className={`bar-img ${fail ? 'failed' : ''}`}/>
                                    </a>
                                    {success && value.color && (
                                        <div style={{position: 'absolute', display: 'flex',justifyContent:'center', alignItems: 'center', height: 34,
                                            left: 34, width: (array[index+i][1].timestamp - value.timestamp) / 1000 * chartInterval - 17, backgroundColor: `rgb(${value?.color[0]},${value?.color[1]},${value?.color[2]}`}}/>
                                    )}
                                    {bufftype && value.color &&(
                                        <div style={{position: 'absolute', display: 'flex',justifyContent:'center', alignItems: 'center', height: 34,
                                            left: 34, width:(array[index+i]? ((array[index+i][1].timestamp - value.timestamp) / 1000 * chartInterval - 34)
                                            : (endTime - value.timestamp) / 1000 * chartInterval - 17), color: 'white',
                                            backgroundColor: `rgb(${value?.color[0]},${value?.color[1]},${value?.color[2]}`}}>
                                                {stack > 0 && (stack)}
                                            </div>
                                    )}
                                    <span className="tooltip-text">{tooltip(value.timestamp - startTime, value.name, value.sourceID, value.targetID, type, 
                                        success ? array[index + i].timestamp : (buffend ? (array[index + 1] ? array[index +1].timestamp : endTime - value.timestamp): null))}</span>
                                </div>
                        );
                    })}
                </>
            </div>
        </div>
    );
}

export default RenderIcon;