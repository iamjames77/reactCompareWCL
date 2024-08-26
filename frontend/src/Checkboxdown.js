import React, { useEffect, useState } from 'react';
import { get_hostility_table_data, getColorFromImage } from './get_api_data';
import './dropdown.css';

function CheckBoxdown({R, oR, sR, sOR}) {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [externalBuff, setExternalBuff] = useState({});
    const [otherExternalBuff, setOtherExternalBuff] = useState({});

    const [enemyCastFilter, setEnemyCastFilter] = useState({});
    const [enemyCast, setEnemyCast] = useState({});
    const [enemyCastLength, setEnemyCastLength] = useState(0);
    
    const handleToggle = (dropdown) => {
        setOpenDropdown(openDropdown === dropdown ? null : dropdown);
    };

    const handleBuffboxChange = (event, setReport, setOtherReport) => {
        const checkbox  = event.target;
        const isChecked = checkbox.checked;
        const itemID = Number(checkbox.id);

        setReport(prevState => ({
            ...prevState,
            buffFilter: {
                ...prevState.buffFilter,
                [itemID]: isChecked,
            },
        }));

        setOtherReport(prevState => ({
            ...prevState,
            buffFilter: {
                ...prevState.buffFilter,
                [itemID]: isChecked,
            },
        }));
    };

    const handleCastboxChange = (event, setReport, setOtherReport) => {
        const checkbox  = event.target;
        const isChecked = checkbox.checked;
        const itemID = Number(checkbox.id);

        setReport(prevState => ({
            ...prevState,
            castFilter: {
                ...prevState.castFilter,
                [itemID]: isChecked,
            },
        }));

        setOtherReport(prevState => ({
            ...prevState,
            castFilter: {
                ...prevState.castFilter,
                [itemID]: isChecked,
            },
        }));
    };

    const handleEnemy = (event, len) => {
        const checkbox = event.target;
        const isChecked = checkbox.checked;
        const itemID = checkbox.id;
        setEnemyCast(prevState => ({
            ...prevState,
            [itemID]: {
                ...prevState[itemID],
                visibility: isChecked,
            },
        }));
        if(isChecked){
            setEnemyCastLength(prev => prev + 45 * (Math.ceil(len/4) + 1));
        }
        else{
            setEnemyCastLength(prev => prev - 45 * (Math.ceil(len/4) + 1));
        }
    };

    const handleEnemyCast = (event, gameID) => {
        const checkbox = event.target;
        const isChecked = checkbox.checked;
        const itemID = Number(checkbox.id);

        setEnemyCastFilter(prevState => ({
            ...prevState,
            [gameID]: {
                ...prevState[gameID],
                [itemID]: isChecked,
            },
        }));
    };

    const enemyRenderCheckboxItems = (items) => {
        const result = Object.entries(items).map(([index, item]) => {
            return (
                <div key={item.id} className="checkbox-item">
                    <input type="checkbox" id={index} name={item.name} 
                    checked = {item.visibility || false}
                    onChange={(e) => handleEnemy(e, item.cast.length)}/>
                    <label htmlFor={item}>{item.name}</label>
                </div>
            );
        });
        return result;
    };

    const enemyCastRender = (enemyCast, gameID) => {
        const result = Object.entries(enemyCast).map(([index, item]) => {
            return (
                <div key={index} className="checkbox-item">
                    <input type="checkbox" id={index}
                    checked = {enemyCastFilter[gameID][index] || false}
                    onChange={(e)=> handleEnemyCast(e, gameID)}/>
                    <a href ={'https://www.wowhead.com/spell=' + index} target="_blank" rel="noreferrer">
                        <img src={`https://wow.zamimg.com/images/wow/icons/large/${item.abilityIcon}`} alt="" className="dropdown-icon"/>
                    </a>
                    <label htmlFor={item}>{item.name}</label>
                </div>
            );
        })
        return result;
    };

    const buffRenderCheckboxItems = (items, bF) => {
        const result = Object.entries(items).map(([index, item]) => {
            return (
                <div key={index} className="checkbox-item">
                    <input type="checkbox" id={index}
                    checked = {bF[index] || false}
                    onChange={(e)=> handleBuffboxChange(e, sR, sOR)}/>
                    <a href ={'https://www.wowhead.com/spell=' + index} target="_blank" rel="noreferrer">
                        <img src={`https://wow.zamimg.com/images/wow/icons/large/${item.abilityIcon}`} alt="" className="dropdown-icon"/>
                    </a>
                    <label htmlFor={item}>{item.name}</label>
                </div>
            );
        });
        return result
    };

    const castRenderCheckboxItems = (items, cF) => {
        const result = Object.entries(items).map(([index, item]) => {
            return (
                <div key={index} className="checkbox-item">
                    <input type="checkbox" id={index}
                    checked = {cF[Number(index)] || false}
                    onChange={(e)=> handleCastboxChange(e, sR, sOR)}/>
                    <a href ={'https://www.wowhead.com/spell=' + index} target="_blank" rel="noreferrer">
                        <img src={`https://wow.zamimg.com/images/wow/icons/large/${item.abilityIcon}`} alt="" className="dropdown-icon"/>
                    </a>
                    <label htmlFor={item}>{item.name}</label>
                </div>
            );
        });
        return result
    };

   //BOSS 타입인 경우 Check
    useEffect(() => {
        const fetchEnemyTable = async () => {
            if(R.enemyNPCs && R.masterNPCs) {
                const ec = {};
                const ecf = {};
                const promises = R.enemyNPCs.map(async (enemy) => {
                    if(!enemyCast[enemy.gameID]) {
                        const data = await get_hostility_table_data(R.reportID, R.fight, enemy.id, R.startTime, R.endTime);
                        const enemyINFO = R.masterNPCs.find((npc) => npc.gameID === enemy.gameID && npc.id === enemy.id)
                        const castData = data.data.reportData.report.table.data.entries
                        const cD = {};
                        Object.values(castData).forEach(async (ability) => {
                            const color = await getColorFromImage(`https://wow.zamimg.com/images/wow/icons/large/${ability.abilityIcon}`);
                            cD[ability.guid] = {
                                'name': ability.name,
                                'abilityIcon': ability.abilityIcon,
                                'iconColor': color,
                            }
                        });
                        if(enemyINFO && enemyINFO.subType === 'Boss') {
                            setEnemyCastLength(prev => prev + 45 * (Math.ceil(castData.length/4) + 1));
                        }
                        ec[enemy.gameID]={
                            'name': enemyINFO.name, 
                            'cast': cD, 
                            'visibility': (enemyINFO && enemyINFO.subType === 'Boss'),
                        };
                        const cF = {};
                        Object.values(castData).forEach((ability) => {
                            cF[ability.guid] = true;
                        });
                        ecf[enemy.gameID] = cF;
                    }
                });

                await Promise.all(promises);
                setEnemyCast(prevState => ({
                    ...prevState,
                    ...ec,
                }));
                setEnemyCastFilter(prevState => ({
                    ...prevState,
                    ...ecf,
                }));
            }
        };

        fetchEnemyTable();
    }, [R.enemyNPCs, R.masterNPCs]);

    //enemy Cast table 적용
    useEffect(() => {
        if((Object.keys(enemyCast).length >0)) {
            const ec = {};
            R.enemyNPCs.forEach((enemy) => {
                if(enemyCast[enemy.gameID] && enemyCast[enemy.gameID].visibility) {
                    ec[enemy.id] = enemyCast[enemy.gameID];
                }
            });
            sR(prevState => ({
                ...prevState,
                enemyCastTable: ec,
            }));
        }
    }, [enemyCast]);

    //otherEnemy Cast table 적용
    useEffect(() => {
        if((Object.keys(enemyCast).length >0) && oR.enemyNPCs){
            const oec = {};
            oR.enemyNPCs.forEach((enemy) => {
                if(enemyCast[enemy.gameID] && enemyCast[enemy.gameID].visibility) {
                    oec[enemy.id] = enemyCast[enemy.gameID];
                }
            });
            sOR(prevState => ({
                ...prevState,
                enemyCastTable: oec,
            }));
        }
    }, [enemyCast, oR.enemyNPCs]);

    //enemy Cast Filter 적용
    useEffect(() => {
        if(enemyCastFilter) {
            const ecf = {};
            R.enemyNPCs.forEach((enemy) => {
                if(enemyCastFilter[enemy.gameID]) {
                    ecf[enemy.id] = enemyCastFilter[enemy.gameID];
                }
            });
            sR(prevState => ({
                ...prevState,
                enemyCastFilter: ecf,
            }));
        }
    }, [enemyCastFilter]);

    //otherEnemy Cast Filter 적용
    useEffect(() => {
        if(enemyCastFilter && oR.enemyNPCs){
            const oecf = {};
            oR.enemyNPCs.forEach((enemy) => {
                if(enemyCastFilter[enemy.gameID]) {
                    oecf[enemy.id] = enemyCastFilter[enemy.gameID];
                }
            });
            sOR(prevState => ({
                ...prevState,
                enemyCastFilter: oecf,
            }));
        }
    }, [enemyCastFilter, oR.enemyNPCs]);

    //Global Buff 정보를 가져옴
    useEffect( () => {
        if(R.buffTable && R.globalBuffTable) {
            const result = {}
            Object.entries(R.globalBuffTable).forEach(([index, aura]) => {
                const findBuff = Object.entries(R.buffTable).find(([idx, ar]) => idx === index);
                if (!findBuff) {
                    result[index] = aura;
                }
            });
            setExternalBuff(result);
        }
    }, [R.buffTable, R.globalBuffTable]) 

    //otherGlobalBuff 정보를 가져옴
    useEffect( () => {
        if(oR.buffTable && oR.globalBuffTable) {
            const result = Object.entries(oR.globalBuffTable).map(([index, aura]) => {
                const findBuff = Object.entries(oR.buffTable).find(([idx, ar]) => idx === index);
                if (!findBuff) {
                    return aura;
                }
            }).filter((aura) => aura !== undefined);
            setOtherExternalBuff(result);
        }
    }, [oR.buffTable, oR.globalBuffTable])
    
    //cast checkbox 초기화
    useEffect(() => {
        if(R.castTable) {
            const initialCast = {};
            Object.entries(R.castTable).forEach(([index, value]) => {
                initialCast[Number(index)] = true;
            });
            sR(prevState => ({
                ...prevState,
                castFilter: initialCast,
            }));
        }
    },[R.castTable]);

    //otherCast checkbox 초기화
    useEffect(() => {
        if(oR.castTable) {
            const initialCast = {};
            Object.entries(oR.castTable).forEach(([index, value]) => {
                initialCast[index] = true;
            });
            sOR(prevState => ({
                ...prevState,
                castFilter: initialCast,
            }));
        }
    },[oR.castTable]);

    return (
        <div style={{position:'sticky', left:0}}>
            <div style={{display:'flex'}}>
                <div className="checkbox left">
                    <div className= "dropdown">
                        <div className= {`dropdown-header ${openDropdown === 'enemyNPCs' ? 'open' : ''}`} onClick={() => handleToggle('enemyNPCs')}>
                            Enemy Filter
                            <span className={`dropdown-arrow ${openDropdown === 'enemyNPCs' ? 'open' : ''}`}>▼</span>
                        </div>
                    </div>
                </div>
                <div className="checkbox">
                    <div className="dropdown">
                        <div className= {`dropdown-header ${openDropdown === 'buff' ? 'open' : ''} ${R.source === 'ALL' ? 'disabled' : ''}`} onClick={() => handleToggle('buff')}>
                            Buff Filter
                            <span className={`dropdown-arrow ${openDropdown === 'buff' ? 'open' : ''}`}>▼</span>
                        </div>
                    </div>
                </div>
                <div className="checkbox">
                    <div className="dropdown">
                        <div className={`dropdown-header ${openDropdown === 'globalBuff' ? 'open' : ''}  ${R.source === 'ALL' ? 'disabled' : ''}`} onClick={() => handleToggle('globalBuff')}>
                            External Buff Filter
                            <span className={`dropdown-arrow ${openDropdown === 'globalBuff' ? 'open' : ''}`}>▼</span>
                        </div>
                    </div>
                </div>
                <div className="checkbox right">
                    <div className="dropdown">
                        <div className={`dropdown-header ${openDropdown === 'cast' ? 'open' : ''}`} onClick={() => handleToggle('cast')}>
                            Cast Filter
                            <span className={`dropdown-arrow ${openDropdown === 'cast' ? 'open' : ''}`}>▼</span>
                        </div>
                    </div>
                </div>    
            </div>
            {(openDropdown === 'enemyNPCs') && enemyCast && (
                <div className="checkbox-grid" style = {{height: Math.ceil(R.enemyNPCs.length / 4) * 45}}>
                    {enemyRenderCheckboxItems(enemyCast)}
                </div>
            )}
            {openDropdown === 'buff' &&  R.buffTable && (
                <div className="checkbox-grid" style = {{height: (Math.ceil(R.buffTable.length / 4) + 1)* 45 + 
                (oR.buffTable ? ((Math.ceil(oR.buffTable.length / 4) + 1)* 45): 0)}}>
                    <>
                    <div className="checkbox-text">
                        {R.sourceName} Buff
                    </div>
                    {buffRenderCheckboxItems(R.buffTable, R.buffFilter)}
                    </>
                    {oR.buffTable && (
                        <>
                        <div className="checkbox-text">
                            {oR.sourceName} Buff
                        </div>
                        {buffRenderCheckboxItems(oR.buffTable, oR.buffFilter)}
                        </>
                    )}
                </div>
            )}
            {openDropdown === 'globalBuff' &&  externalBuff && (
                <div className="checkbox-grid" style = {{height: (Math.ceil(externalBuff.length / 4) + 1)* 45 +
                (oR.globalBuffTable ? ((Math.ceil(otherExternalBuff.length / 4) + 1)* 45): 0)}}>
                    <>
                    <div className="checkbox-text">
                        {R.sourceName} External Buff
                    </div>
                    {buffRenderCheckboxItems(externalBuff, R.buffFilter)}
                    </>
                    {oR.globalBuffTable && (
                        <>
                        <div className="checkbox-text">
                            {oR.sourceName} External Buff
                        </div>
                        {buffRenderCheckboxItems(otherExternalBuff, oR.buffFilter)}
                        </>
                    )}
                </div>
            )}
            {openDropdown === 'cast' && (R.castTable || enemyCast) && (
                <div className="checkbox-grid" style = {{height: 0 
                + (R.castTable ?(Math.ceil(R.castTable.length / 4) + 1) * 45 : 0)
                + (oR.castTable ?(Math.ceil(oR.castTable.length/4) + 1) * 45 : 0)
                + (enemyCast ? enemyCastLength : 0)}}>
                    {enemyCast && R.enemyNPCs && R.enemyNPCs.map((enemy) => {
                        if(enemyCast[enemy.gameID] && enemyCast[enemy.gameID].visibility) {
                            return (
                                <>
                                    <div className="checkbox-text">
                                        {enemyCast[enemy.gameID].name} Cast
                                    </div>
                                    {enemyCastRender(enemyCast[enemy.gameID].cast, enemy.gameID)}
                                </>
                            )
                        }
                    })}
                    {R.castTable && R.castFilter && (
                    <>
                       <div className="checkbox-text">
                            {R.sourceName} Cast
                        </div>
                        {castRenderCheckboxItems(R.castTable, R.castFilter)}
                    </> 
                    )}
                    {oR.castTable && oR.castFilter && (
                    <>
                        <div className="checkbox-text">
                            {oR.sourceName} Cast
                        </div>
                        {castRenderCheckboxItems(oR.castTable, oR.castFilter)}
                    </>
                    )}
                </div>
            )}
        </div>
    );
}

export default CheckBoxdown;
