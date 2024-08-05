import React from 'react';

function Scaling({timeLength, chartInterval, chartLeft}) {
    const totalSeconds = (timeLength / 1000);
    const component = [];

    const secondsToMinutesAndSeconds = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
    };

    for (let i =0; i<totalSeconds; i++){
        component.push(
        <div>
            <div style={{left: i * chartInterval + chartLeft - 15, position: 'absolute', color:'white'}}>
            {secondsToMinutesAndSeconds(i)}
            </div>
            <br/>
            <div style={{left: i * chartInterval + chartLeft, position: 'absolute', height:'15px', width: '1px', backgroundColor: 'white'}} className='mark'/>
        </div>
        );
    }
    
    return (
        <div>
            <div style={{position: 'relative', display:'flex', width: '100%', height: '30px'}} className='scaling'>
                {component}
            </div>
            <hr style={{marginLeft: chartLeft,backgroundColr:'white', height:'1px', width: chartInterval * timeLength / 1000}}/>
        </div>
    );
}

export default Scaling;