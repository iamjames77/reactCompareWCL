import React, { useEffect, useState } from 'react';
import { get_hostility_table_data, getColorFromImage } from './get_api_data';
import './dropdown.css';

function CheckBoxdown({reportID, fight, sourceID, sourceName, otherSourceName, masterNPCs, enemyNPCs, otherEnemyNPCs,buff, globalBuff, 
    cast, otherBuff, otherGlobalBuff, otherCast,
    cf, scf, ocf, socf, bf, sbf, obf, sobf,
    setEnemyCastTable, setOtherEnemyCastTable, SetEnemyCastFilter, SetOtherEnemyCastFilter, startTime, endTime
}) {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [externalBuff, setExternalBuff] = useState({});
    const [otherExternalBuff, setOtherExternalBuff] = useState({});

    const [enemyCastFilter, setEnemyCastFilter] = useState({});
    const [enemyCast, setEnemyCast] = useState({});
    const [enemyCastLength, setEnemyCastLength] = useState(0);
    
    const handleToggle = (dropdown) => {
        setOpenDropdown(openDropdown === dropdown ? null : dropdown);
    };

    const handleCheckboxChange = (event, setCheckedItems, setOtherCheckedItems) => {
        const checkbox  = event.target;
        const isChecked = checkbox.checked;
        const itemID = Number(checkbox.id);

        setCheckedItems(prevState => ({
            ...prevState,
            [itemID]: isChecked,
        }));
        setOtherCheckedItems(prevState => ({
            ...prevState,
            [itemID]: isChecked,
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
                    onChange={(e)=> handleCheckboxChange(e, sbf, sobf)}/>
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
                    onChange={(e)=> handleCheckboxChange(e, scf, socf)}/>
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
            if(enemyNPCs && masterNPCs) {
                const ec = {};
                const ecf = {};
                const promises = enemyNPCs.map(async (enemy) => {
                    if(!enemyCast[enemy.gameID]) {
                        const data = await get_hostility_table_data(reportID, fight, enemy.id, startTime, endTime);
                        const enemyINFO = masterNPCs.find((npc) => npc.gameID === enemy.gameID && npc.id === enemy.id)
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
    }, [enemyNPCs, masterNPCs]);

    //enemy Cast table 적용
    useEffect(() => {
        if((Object.keys(enemyCast).length >0)) {
            const ec = {};
            enemyNPCs.forEach((enemy) => {
                if(enemyCast[enemy.gameID] && enemyCast[enemy.gameID].visibility) {
                    ec[enemy.id] = enemyCast[enemy.gameID];
                }
            });
            setEnemyCastTable(ec);
        }
    }, [enemyCast]);

    //otherEnemy Cast table 적용
    useEffect(() => {
        if((Object.keys(enemyCast).length >0) && otherEnemyNPCs){
            const oec = {};
            otherEnemyNPCs.forEach((enemy) => {
                if(enemyCast[enemy.gameID] && enemyCast[enemy.gameID].visibility) {
                    oec[enemy.id] = enemyCast[enemy.gameID];
                }
            });
            setOtherEnemyCastTable(oec);
        }
    }, [enemyCast, otherEnemyNPCs]);

    //enemy Cast Filter 적용
    useEffect(() => {
        if(enemyCastFilter) {
            const ecf = {};
            enemyNPCs.forEach((enemy) => {
                if(enemyCastFilter[enemy.gameID]) {
                    ecf[enemy.id] = enemyCastFilter[enemy.gameID];
                }
            });
            SetEnemyCastFilter(ecf);
        }
    }, [enemyCastFilter]);

    //otherEnemy Cast Filter 적용
    useEffect(() => {
        if(enemyCastFilter && otherEnemyNPCs){
            const oecf = {};
            otherEnemyNPCs.forEach((enemy) => {
                if(enemyCastFilter[enemy.gameID]) {
                    oecf[enemy.id] = enemyCastFilter[enemy.gameID];
                }
            });
            SetOtherEnemyCastFilter(oecf);
        }
    }, [enemyCastFilter, otherEnemyNPCs]);

    //Global Buff 정보를 가져옴
    useEffect( () => {
        if(buff && globalBuff) {
            const result = {}
            Object.entries(globalBuff).forEach(([index, aura]) => {
                const findBuff = Object.entries(buff).find(([idx, ar]) => idx === index);
                if (!findBuff) {
                    result[index] = aura;
                }
            });
            setExternalBuff(result);
        }
    }, [buff, globalBuff]) 

    //otherGlobalBuff 정보를 가져옴
    useEffect( () => {
        if(otherBuff && otherGlobalBuff) {
            const result = Object.entries(otherGlobalBuff).map(([index, aura]) => {
                const findBuff = Object.entries(otherBuff).find(([idx, ar]) => idx === index);
                if (!findBuff) {
                    return aura;
                }
            }).filter((aura) => aura !== undefined);
            setOtherExternalBuff(result);
        }
    }, [otherBuff, otherGlobalBuff])

    useEffect(() => {
        console.log(externalBuff);
    }, [externalBuff]);
    
    //cast checkbox 초기화
    useEffect(() => {
        if(cast) {
        const initialCast = {};
        Object.entries(cast).forEach(([index, value]) => {
            initialCast[Number(index)] = true;
        });
        scf(initialCast);
        }
    },[cast]);

    //otherCast checkbox 초기화
    useEffect(() => {
        if(otherCast) {
            const initialCast = {};
            Object.entries(otherCast).forEach(([index, value]) => {
                initialCast[index] = true;
            });
            socf(initialCast);
        }
    },[otherCast]);

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
                        <div className= {`dropdown-header ${openDropdown === 'buff' ? 'open' : ''} ${sourceID === 'ALL' ? 'disabled' : ''}`} onClick={() => handleToggle('buff')}>
                            Buff Filter
                            <span className={`dropdown-arrow ${openDropdown === 'buff' ? 'open' : ''}`}>▼</span>
                        </div>
                    </div>
                </div>
                <div className="checkbox">
                    <div className="dropdown">
                        <div className={`dropdown-header ${openDropdown === 'globalBuff' ? 'open' : ''}  ${sourceID === 'ALL' ? 'disabled' : ''}`} onClick={() => handleToggle('globalBuff')}>
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
                <div className="checkbox-grid" style = {{height: Math.ceil(enemyNPCs.length / 4) * 45}}>
                    {enemyRenderCheckboxItems(enemyCast)}
                </div>
            )}
            {openDropdown === 'buff' &&  buff && (
                <div className="checkbox-grid" style = {{height: (Math.ceil(buff.length / 4) + 1)* 45 + 
                (otherBuff ? ((Math.ceil(otherBuff.length / 4) + 1)* 45): 0)}}>
                    <>
                    <div className="checkbox-text">
                        {sourceName} Buff
                    </div>
                    {buffRenderCheckboxItems(buff, bf)}
                    </>
                    {otherBuff && (
                        <>
                        <div className="checkbox-text">
                            {otherSourceName} Buff
                        </div>
                        {buffRenderCheckboxItems(otherBuff, obf)}
                        </>
                    )}
                </div>
            )}
            {openDropdown === 'globalBuff' &&  externalBuff && (
                <div className="checkbox-grid" style = {{height: (Math.ceil(externalBuff.length / 4) + 1)* 45 +
                (otherGlobalBuff ? ((Math.ceil(otherExternalBuff.length / 4) + 1)* 45): 0)}}>
                    <>
                    <div className="checkbox-text">
                        {sourceName} External Buff
                    </div>
                    {buffRenderCheckboxItems(externalBuff, bf)}
                    </>
                    {otherGlobalBuff && (
                        <>
                        <div className="checkbox-text">
                            {otherSourceName} External Buff
                        </div>
                        {buffRenderCheckboxItems(otherExternalBuff, obf)}
                        </>
                    )}
                </div>
            )}
            {openDropdown === 'cast' && (cast || enemyCast) && (
                <div className="checkbox-grid" style = {{height: 0 
                + (cast ?(Math.ceil(cast.length / 4) + 1) * 45 : 0)
                + (otherCast ?(Math.ceil(otherCast.length/4) + 1) * 45 : 0)
                + (enemyCast ? enemyCastLength : 0)}}>
                    {enemyCast && enemyNPCs && enemyNPCs.map((enemy) => {
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
                    {cast && cf && (
                    <>
                       <div className="checkbox-text">
                            {sourceName} Cast
                        </div>
                        {castRenderCheckboxItems(cast, cf)}
                    </> 
                    )}
                    {otherSourceName && (
                    <>
                        <div className="checkbox-text">
                            {otherSourceName} Cast
                        </div>
                        {castRenderCheckboxItems(otherCast, ocf)}
                    </>
                    )}
                </div>
            )}
        </div>
    );
}

export default CheckBoxdown;
