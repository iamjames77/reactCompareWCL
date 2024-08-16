import React from 'react';

function Scaling({timeLength, chartInterval, chartLeft, chartWidth}) {
    const totalSeconds = (timeLength / 1000);
    const component = [];

    const secondsToMinutesAndSeconds = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
    };
    
    for (let i =0; i<=totalSeconds; i++){
        component.push(
        <div>
            <div style={{left: i * chartInterval + chartLeft - 15, position: 'absolute', color:'white', fontSize: 19}}>
            {secondsToMinutesAndSeconds(i)}
            </div>
            <br/>
            <div style={{left: i * chartInterval + chartLeft, position: 'absolute', height:'15px', width: '1px', backgroundColor: 'white'}} className='mark'/>
        </div>
        );
    }
    
    return (
        <div style = {{marginTop:4, marginBottom:2}}>
            <div style={{position: 'relative', display:'flex', width: '100%', height: '34px'}} className='scaling'>
                {component}
            </div>
            <hr style={{margin: 0, border:0, marginLeft: chartLeft, backgroundColor:'white', height:'1px', width: chartWidth}}/>
        </div>
    );
}

export default Scaling;