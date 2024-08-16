import React, { useEffect, useState } from 'react';
import { get_hostility_table_data } from './get_api_data';
import './dropdown.css';
import ColorThief from 'colorthief';

function CheckBoxdown({reportID, fight, sourceID, sourceName, otherSourceName, masterNPCs, enemyNPCs, 
    buff, globalBuff, cast, otherBuff, otherGlobalBuff, otherCast,
    setSelectedEnemy, setSelectedBuff, setSelectedOtherBuff,setSelectedCast, setSelectedOtherCast, setEnemyCastTable, SetEnemyCastFilter,
    startTime,endTime
}) {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [externalBuff, setExternalBuff] = useState({});
    const [otherExternalBuff, setOtherExternalBuff] = useState({});
    const [buffFilter, setBuffFilter] = useState({});
    const [playerCastFilter, setPlayerCastFilter] = useState({});
    const [otherPlayerCastFilter, setOtherPlayerCastFilter] = useState({});
    const [castFilter, setCastFilter] = useState({});
    
    const [castTable, setCastTable] = useState(null);
    const [otherCastTable, setOtherCastTable] = useState(null);

    const [enemyCastFilter, setEnemyCastFilter] = useState({});
    const [enemyCast, setEnemyCast] = useState({});
    const [enemyCastLength, setEnemyCastLength] = useState(0);
    
    const handleToggle = (dropdown) => {
        setOpenDropdown(openDropdown === dropdown ? null : dropdown);
    };

    const handleCheckboxChange = (event, setCheckedItems) => {
        const checkbox  = event.target;
        const isChecked = checkbox.checked;
        const itemID = checkbox.id;

        setCheckedItems(prevState => ({
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

    const buffRenderCheckboxItems = (items) => {
        const result = items.map((item, index) => {
            return (
                <div key={index} className="checkbox-item">
                    <input type="checkbox" id={item.guid} name={item.name}
                    checked = {buffFilter[item.guid] || false}
                    onChange={(e)=> handleCheckboxChange(e, setBuffFilter)}/>
                    <a href ={'https://www.wowhead.com/spell=' + item.guid} target="_blank" rel="noreferrer">
                        <img src={`https://wow.zamimg.com/images/wow/icons/large/${item.abilityIcon}`} alt="" className="dropdown-icon"/>
                    </a>
                    <label htmlFor={item}>{item.name}</label>
                </div>
            );
        });
        return result
    };

    const castRenderCheckboxItems = (items) => {
        const result = items.map((item, index) => {
            return (
                <div key={index} className="checkbox-item">
                    <input type="checkbox" id={item.guid} name={item.name}
                    checked = {item['visibility'] || false}
                    onChange={(e)=> handleCheckboxChange(e, setCastFilter)}/>
                    <a href ={'https://www.wowhead.com/spell=' + item.guid} target="_blank" rel="noreferrer">
                        <img src={`https://wow.zamimg.com/images/wow/icons/large/${item.abilityIcon}`} alt="" className="dropdown-icon"/>
                    </a>
                    <label htmlFor={item}>{item.name}</label>
                </div>
            );
        });
        return result
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

    const getColorFromImage = async (imageSrc) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.src = imageSrc;
            img.onload = () => {
                const colorThief = new ColorThief();
                const color = colorThief.getColor(img);
                resolve(color);
            };
            img.onerror = () => {
                resolve([0, 0, 0]); // 오류 발생 시 기본 색상
            };
        });
    };

    //선택된 Buff 정보를 가져옴
    useEffect(() => {
        if(buffFilter && globalBuff) {
            const result = {};
            globalBuff.forEach((aura) => {
                if(buffFilter[aura.guid]) {
                    result[aura.guid] = {'name': aura.name, 'abilityIcon': aura.abilityIcon};
                }
            })
            setSelectedBuff(result);
        }
        if(buffFilter && otherGlobalBuff) {
            const result = {};
            otherGlobalBuff.forEach((aura) => {
                if(buffFilter[aura.guid]) {
                    result[aura.guid] = {'name': aura.name, 'abilityIcon': aura.abilityIcon};
                }
            })
            setSelectedOtherBuff(result);
        }
    }, [buffFilter]);

    //선택된 Cast 정보를 가져옴
    useEffect(() => {
        if(castFilter && cast) {
            const result = {};
            cast.forEach((ability) => {
                const iconColor = 'black';
                result[ability.guid] = {
                    'name': ability.name, 
                    'abilityIcon': ability.abilityIcon,
                    'iconColor': iconColor,
                    'visibility': castFilter[ability.guid] ? true : false
                };
            })
            setSelectedCast(result);
        }
        if(castFilter && otherCast) {
            const result = {};
            otherCast.forEach((ability) => {
                const iconColor = 'black';
                result[ability.guid] = {
                    'name': ability.name, 
                    'abilityIcon': ability.abilityIcon,
                    'iconColor': iconColor,
                    'visibility': castFilter[ability.guid] ? true : false
                };
            })
            setSelectedOtherCast(result);
        }
    }, [castFilter]);

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
                            console.log(color);
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

    useEffect(() => {
        if(enemyCast) {
            const ec = {};
            enemyNPCs.forEach((enemy) => {
                if(enemyCast[enemy.gameID] && enemyCast[enemy.gameID].visibility) {
                    ec[enemy.id] = enemyCast[enemy.gameID];
                }
            });
            setEnemyCastTable(ec);
        }
    }, [enemyCast]);

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

    //Global Buff 정보를 가져옴
    useEffect( () => {
        if(buff && globalBuff) {
            const result = globalBuff.map((aura) => {
                const findBuff = buff.find((buff) => buff.guid === aura.guid);
                if (!findBuff) {
                    return aura;
                }
            }).filter((aura) => aura !== undefined);
            setExternalBuff(result);
        }
    }, [buff, globalBuff]) 

    //otherGlobalBuff 정보를 가져옴
    useEffect( () => {
        if(otherBuff && otherGlobalBuff) {
            const result = otherGlobalBuff.map((aura) => {
                const findBuff = otherBuff.find((buff) => buff.guid === aura.guid);
                if (!findBuff) {
                    return aura;
                }
            }).filter((aura) => aura !== undefined);
            setOtherExternalBuff(result);
        }
    }, [otherBuff, otherGlobalBuff])

    
    //cast checkbox 초기화
    useEffect(() => {
        if(cast) {
            const initialCast = {};
            cast.forEach((ability) => {
                initialCast[ability.guid] = true;
            });
            setPlayerCastFilter(initialCast);
        }
    },[cast]);

    useEffect(() => {
        if(cast){
            const cs = {};
            cast.forEach((ability) => {
                cs[ability.guid] = {
                    'name': ability.name,
                    'abilityIcon': ability.abilityIcon,
                    'visibility': true
                }
            })
            setCastTable(cs);
        }
    }, [cast])

    //otherCast checkbox 초기화
    useEffect(() => {
        if(otherCast) {
            const initialCast = {};
            otherCast.forEach((ability) => {
                initialCast[ability.guid] = true;
            });
            setOtherPlayerCastFilter(initialCast);
        }
    },[otherCast]);

    useEffect(() => {
        if(otherCast){
            const ocs ={};
            otherCast.forEach((ability) => {
                ocs[ability.guid] = {
                    'name': ability.name,
                    'abilityIcon': ability.abilityIcon,
                    'visibility': true
                }
            })
            setOtherCastTable(ocs);
        }
    }, [otherCast])

    //castFilter 업데이트
    useEffect(() => {
        setCastFilter({...playerCastFilter, ...otherPlayerCastFilter});
    }, [playerCastFilter, otherPlayerCastFilter]);

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
                    {buffRenderCheckboxItems(buff)}
                    </>
                    {otherBuff && (
                        <>
                        <div className="checkbox-text">
                            {otherSourceName} Buff
                        </div>
                        {buffRenderCheckboxItems(otherBuff)}
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
                    {buffRenderCheckboxItems(externalBuff)}
                    </>
                    {otherGlobalBuff && (
                        <>
                        <div className="checkbox-text">
                            {otherSourceName} External Buff
                        </div>
                        {buffRenderCheckboxItems(otherExternalBuff)}
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
                    {cast && (
                    <>
                       <div className="checkbox-text">
                            {sourceName} Cast
                        </div>
                        {castRenderCheckboxItems(cast)}
                    </> 
                    )}
                    {otherCast && (
                    <>
                        <div className="checkbox-text">
                            {otherSourceName} Cast
                        </div>
                        {castRenderCheckboxItems(otherCast)}
                    </>
                    )}
                </div>
            )}
        </div>
    );
}

export default CheckBoxdown;
