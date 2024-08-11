import React, { useState, useEffect } from 'react';
import BossName from './BossName';

function BossCast({fight, startTime, endTime, BossData, BossCast, chartLeft, chartInterval}) {
    const [BossID, setBossID] = useState(BossData[0].id);

    useEffect(() => {
        console.log(BossData);
        console.log(BossCast);
    }, [BossData, BossCast, chartLeft, chartInterval]);

    return (
        <div>
            <div style={{position: 'relative', display:'flex', width: '100%', height: '40px', marginTop:2, marginBottom:2}} className='scaling'>
                <div style = {{positiion : 'absolute', width: chartLeft, height:'100%', backgroundColor:'white'}}>
                    {BossName[BossData[0].gameID]}
                </div>
            </div>
        </div>
    );
}

export default BossCast;