import React, { useState, useEffect } from 'react';
import { get_hostility_event_data } from './get_api_data';
import './castBar.css';

function BossCast({reportID, fight, startTime, endTime, enemyTable, enemyCastTable, chartLeft, chartInterval, chartWidth}) {

    const renderEnemy = (enemy) => {
        return (
            <div className='bar' style={{width:chartWidth + chartLeft}}>
                <div style = {{width: chartLeft, height:'100%'}}>
                    <div className='bar-text'>
                        {enemy.name}
                    </div>
                </div>
            </div>
        );
    }
    useEffect(() => {
        if(enemyTable){
            enemyTable.forEach((enemy) => {
                console.log(enemy);
            });
        }
    },[enemyTable]);

    return (
        <div>
            {enemyTable.map((enemy) => (
                renderEnemy(enemy))
            )}
        </div>
    );
}

export default BossCast;