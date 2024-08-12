import React, { useEffect, useState } from 'react';
import { get_hostility_table_data } from './get_api_data';
import './dropdown.css';

function CheckBoxdown({reportID, fight, sourceID, sourceName, masterNPCs, enemyNPCs, buff, globalBuff, cast, setSelectedEnemy, setSelectedBuff, setSelectedCast, 
    startTime,endTime
}) {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [enemyNPCsInfo, setEnemyNPCsInfo] = useState([]);
    const [globalbuff, setGlobalbuff] = useState({});
    const [enemyFilter, setEnemyFilter] = useState({});
    const [buffFilter, setBuffFilter] = useState({});
    const [playerCastFilter, setPlayerCastFilter] = useState({});
    const [enemyCastFilter, setEnemyCastFilter] = useState({});
    const [castFilter, setCastFilter] = useState({});

    const [enemySelected, setEnemySelected] = useState(null);
    const [enemyCast, setEnemyCast] = useState([]);
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

    const enemyRenderCheckboxItems = (items) => {
        const result = items.map((item, index) => {
            return (
                <div key={index} className="checkbox-item">
                    <input type="checkbox" id={item.id} name={item.name} 
                    checked = {enemyFilter[item.id] || false}
                    onChange={(e) => handleCheckboxChange(e, setEnemyFilter)}/>
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
                    checked = {castFilter[item.guid] || false}
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

    //적 NPC 정보를 가져옴
    useEffect(() => {
        if(enemyFilter && enemyNPCsInfo) {
            const selected = Object.keys(enemyFilter).filter((key) => enemyFilter[key]);
            const result = selected.map( (id) => {
                return enemyNPCsInfo.find((npc) => npc.id === Number(id));
            })
            setEnemySelected(result);
            setSelectedEnemy(result);
        }
    }, [enemyFilter, enemyNPCsInfo]);

   //BOSS 타입인 경우 Check
    useEffect(() => {
        if(enemyNPCs && masterNPCs) {
            const initialEnemy = {};
            const enemyINFOs = [];
            enemyNPCs.forEach((enemy) => {
                const enemyINFO = masterNPCs.find((npc) => npc.gameID === enemy.gameID && npc.id === enemy.id)
                if (enemyINFO.subType === 'Boss') {
                    initialEnemy[enemyINFO.id] = true;
                }
                enemyINFOs.push(enemyINFO);
            });
            setEnemyFilter(initialEnemy);
            setEnemyNPCsInfo(enemyINFOs);
        }
    }, [enemyNPCs, masterNPCs]);

    //Global Buff 정보를 가져옴
    useEffect( () => {
        if(buff && globalBuff) {
            const result = globalBuff.map((aura) => {
                const findBuff = buff.find((buff) => buff.guid === aura.guid);
                if (!findBuff) {
                    return aura;
                }
            }).filter((aura) => aura !== undefined);
            setGlobalbuff(result);
        }
    }, [buff, globalBuff])

    //선택된 적들의 캐스트 정보를 가져옴
    useEffect(() => {
        if(enemySelected) {
            enemySelected.forEach((enemy) => {
                get_hostility_table_data(reportID, fight, enemy.id, startTime, endTime).then((data) => {
                    setEnemyCast((prev) => {
                        const castData = data.data.reportData.report.table.data.entries;
                        return prev.concat({'name': enemy.name, 'cast': castData});
                    });
                });
            });
        }
    }, [enemySelected]);

    //적 캐스트 길이 업데이트
    useEffect(() => {
        let castLength = 0;
        enemyCast.forEach((enemy) => {
            castLength += enemy.cast.length;
        });
        setEnemyCastLength(castLength);
    }, [enemyCast]);
    
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

    //enemyCast checkbox 초기화
    useEffect(() => {
        if(enemyCast){            
            const initialCast = {};
            enemyCast.forEach((enemy) => {
                enemy.cast.forEach((ability) => {
                    initialCast[ability.guid] = true;
                });
            });
            setEnemyCastFilter(initialCast);
        }
    })

    //castFilter 업데이트
    useEffect(() => {
        setCastFilter({...playerCastFilter, ...enemyCastFilter});
    }, [playerCastFilter, enemyCastFilter]);

    return (
        <div style={{position:'sticky', left:0}}>
            <div style={{display:'flex'}}>
                <div className="checkbox">
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
                            Self-Buff Filter
                            <span className={`dropdown-arrow ${openDropdown === 'buff' ? 'open' : ''}`}>▼</span>
                        </div>
                    </div>
                </div>
                <div className="checkbox">
                    <div className="dropdown">
                        <div className={`dropdown-header ${openDropdown === 'globalBuff' ? 'open' : ''}  ${sourceID === 'ALL' ? 'disabled' : ''}`} onClick={() => handleToggle('globalBuff')}>
                            Global Buff Filter
                            <span className={`dropdown-arrow ${openDropdown === 'globalBuff' ? 'open' : ''}`}>▼</span>
                        </div>
                    </div>
                </div>
                <div className="checkbox">
                    <div className="dropdown">
                        <div className={`dropdown-header ${openDropdown === 'cast' ? 'open' : ''}`} onClick={() => handleToggle('cast')}>
                            Cast Filter
                            <span className={`dropdown-arrow ${openDropdown === 'cast' ? 'open' : ''}`}>▼</span>
                        </div>
                    </div>
                </div>    
            </div>
            {openDropdown === 'enemyNPCs' && enemyNPCs && (
                <div className="checkbox-grid" style = {{height: Math.ceil(enemyNPCs.length / 4) * 45}}>
                    {enemyRenderCheckboxItems(enemyNPCsInfo)}
                </div>
            )}
            {openDropdown === 'buff' &&  buff && (
                <div className="checkbox-grid" style = {{height: Math.ceil(buff.length / 4) * 45}}>
                    {buffRenderCheckboxItems(buff)}
                </div>
            )}
            {openDropdown === 'globalBuff' &&  globalbuff && (
                <div className="checkbox-grid" style = {{height: Math.ceil(globalbuff.length / 4) * 45}}>
                    {buffRenderCheckboxItems(globalbuff)}
                </div>
            )}
            {openDropdown === 'cast' && (cast || enemyCast) && (
                <div className="checkbox-grid" style = {{height: 0 
                + (cast ?(Math.ceil(cast.length / 4) + 1) * 45 : 0) 
                + (enemyCast ?(Math.ceil(enemyCastLength/4) + 1) * 45 : 0)}}>
                    {enemyCast && (
                    <>
                        {enemyCast.map((enemy) => (
                            <>
                            <div className="checkbox-text">
                                {enemy.name}
                            </div>
                            {castRenderCheckboxItems(enemy.cast)}
                            </>
                        ))}
                    </>
                    )}
                    {cast && (
                    <>
                       <div className="checkbox-text">
                            Player Cast
                        </div>
                        {castRenderCheckboxItems(cast)}
                    </> 
                    )}
                </div>
            )}
        </div>
    );
}

export default CheckBoxdown;
