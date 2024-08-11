import React, { useEffect, useState } from 'react';
import './dropdown.css';

function CheckBoxdown({sourceID, masterAbilities, masterNPCs, enemyNPCs, buff, globalBuff, cast, startTime, endTime}) {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [enemyNPCsInfo, setEnemyNPCsInfo] = useState([]);
    const [globalbuff, setGlobalbuff] = useState({});
    const [enemyFilter, setEnemyFilter] = useState({});
    const [buffFilter, setBuffFilter] = useState({});

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
            console.log(item);
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
                    <img src={`https://wow.zamimg.com/images/wow/icons/large/${item.abilityIcon}`} alt="" className="dropdown-icon"/>
                    <label htmlFor={item}>{item.name}</label>
                </div>
            );
        });
        return result
    };

    useEffect(() => {
        console.log(buffFilter);
    }, [buffFilter]);

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
            console.log(initialEnemy);
            console.log(enemyINFOs)
            setEnemyFilter(initialEnemy);
            setEnemyNPCsInfo(enemyINFOs);
        }
    }, [enemyNPCs, masterNPCs]);

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
                <div className="checkbox right">
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
        </div>
    );
}

export default CheckBoxdown;
