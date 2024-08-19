import React, { useEffect, useState, useRef } from 'react';
import Highcharts, { time } from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import './dropdown.css';

function ChartComponent({gd, ogd, type, timeLength, abilityTable, otherAbilityTable, gf, ogf, sgf, sogf}) {
    const [graph, setGraph] = useState({});
    const [otherGraph, setOtherGraph] = useState({});
    const [chart, setChart] = useState(null);
    const [graphStyle, setGraphStyle] = useState(null);
    const [isOpen, setIsOpen] = useState(null);
    const [imageDict, setImageDict] = useState({});
    const [otherImageDict, setOtherImageDict] = useState({});
    const [expanded, setExpanded] = useState(true);

    // Helper functions
    const millisecondsToMinutesAndSeconds = (ms) => {
        const totalSeconds = ms / 1000;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
    };

    const formatNumber = (num) => {
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`;
        } else if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K`;
        }
        return num.toString();
    };

    const generateTickPositions = (maxTime, interval) => {
        let positions = [];
        for (let time = 0; time <= maxTime; time += interval) {
            positions.push(time);
        }
        return positions;
    };

    const handleToggle = (t) => {
        setIsOpen(isOpen === t ? null : t);
    };

    const toggleSeriesVisibility = (name, gf,sgf) => {
        sgf({...gf, [name]: !gf[name]});
    };

    const setSeries = (gd, sG, at, sid, gf, Name) => {
        const cs = {};
        const series = Object.entries(gd.graph).map(([key, data]) => {
            let img;
            if (gd.id !== 'ALL'){
                const find = at.find(ability => ability.gameID === data.guid);
                if(find){
                    img = `https://wow.zamimg.com/images/wow/icons/large/${find['icon']}`;
                }
                else {
                    img = undefined;
                }
            }
            else{
                img = gd.name[data.name];
            }
            cs[key] = {name: data.name, img: img, id: data.guid};
            return {
                name: `${Name} ${data.name}`,
                data: data.data.map((value, index) => [index * data.pointInterval, value]),
                visible: gf[data.name]
            }
        });
        if(gd.DTGraph && (type === 'Healing')){
            series.push({
                name: `${Name} Damage Taken`,
                data: gd.DTGraph.data.map((value, index) => [index * gd.DTGraph.pointInterval, value]),
                visible: gf['Damage Taken']
            });
            cs[series.length - 1] = {name: 'Damage Taken', img: undefined, id: undefined};
        }
        sid(cs);
        sG(series);
    };

    const renderTableItems = (imgDict, gf, sgf) => {
        const result = Object.entries(imgDict).map(([index, item]) => {
            return (
                <div key={index} className="checkbox-item">
                    <input type="checkbox" id={index} name={item.name}
                    checked = {gf[item.name]}
                    onChange={()=> toggleSeriesVisibility(item.name, gf, sgf)}/>
                    <a href={item.id ? 'https://www.wowhead.com/spell=' + item.id : '#'} target={item.id ? "_blank" : "_self"}  rel="noreferrer">
                        <img src={item.img} alt="" className="dropdown-icon"/>
                    </a>
                    <label htmlFor={index}>{item.name}</label>
                </div>
            );
        });
        return result
    };

    // Load data initially
    useEffect(() => {
        if (gd && (Object.keys(gf).length > 0) && (gd.id === 'ALL' || abilityTable)) {
            setSeries(gd, setGraph, abilityTable, setImageDict, gf, (gd.id === 'ALL' ? 'My' : gd.name));
        }
    }, [gd, abilityTable, gf]);

    useEffect(() => {
        if (ogd && (Object.keys(ogf).length > 0)&& (ogd.id === 'ALL' || otherAbilityTable)) {
            setSeries(ogd, setOtherGraph, otherAbilityTable, setOtherImageDict, ogf, (ogd.id === 'ALL' ? 'Other' : ogd.name));
        }
    }, [ogd, otherAbilityTable, ogf]);

    useEffect(() => {
        if (Object.keys(graph).length > 0 && timeLength) {
            const dType = type === 'Healing' ? 'Hps' : 'Dps';
            const tickPositions = expanded ? generateTickPositions(timeLength, 1000) : generateTickPositions(timeLength, 10000);
            const container = {
                chart: {
                    type: 'line',
                    width: expanded ? timeLength / 10 + 170 : null,
                    marginLeft: expanded ? 150 : null, 
                    marginRight: expanded ? 20 : null,
                },
                title: {
                    text: `${dType} Graph`
                },
                xAxis: {
                    type: 'linear',
                    title: {
                        text: 'Time'
                    },
                    min: 0,
                    max: timeLength,
                    tickPositions: tickPositions,
                    labels: {
                        formatter: function () {
                            return millisecondsToMinutesAndSeconds(this.value);
                        }
                    }
                },
                yAxis: {
                    title: {
                        text: dType
                    },
                    labels: {
                        formatter: function () {
                            return formatNumber(this.value);
                        }
                    },
                    min: 0
                },
                tooltip: {
                    formatter: function () {
                        const elapsedTime = this.x;
                        const timeStr = millisecondsToMinutesAndSeconds(elapsedTime);
                        return `<b>Time: ${timeStr}</b><br/>${this.series.name}: ${formatNumber(this.y)}`;
                    }
                },
                legend: {
                    enabled: false
                },
                series: Object.keys(otherGraph).length > 0 ? [...graph, ...otherGraph] : graph,
            };
            setChart(container);
        }
    }, [graph, otherGraph, expanded]);

    useEffect(() => {
        if(timeLength){
            if (expanded){
                setGraphStyle({
                    width: `${(timeLength/10) + 170}px`,
                    overflowX: 'auto',
                })
            } else {
                setGraphStyle({
                    width: '100%',
                    position: 'sticky',
                    left: 0,
                })
            }
        }
    }, [timeLength, expanded]);
    
    return (
        <>
            <div style={{position:'sticky', left:0, marginBottom: 6}}>
                <div style={{display:'flex', width:'100%'}}>
                    {(gd && Object.keys(graph).length > 0) && (
                        <div className="chartbox left">
                            <div className= "dropdown">
                                <div className= {`dropdown-header ${isOpen === 'my' ? 'open' : ''}`} onClick={() => handleToggle('my')}>
                                    My Report Filter
                                    <span className={`dropdown-arrow ${isOpen === 'my' ? 'open' : ''}`}>▼</span>
                                </div>
                            </div>
                        </div>
                    )}
                    {(ogd && Object.keys(otherGraph).length > 0) && (
                        <div className="chartbox" style= {{marginLeft:3}}>
                            <div className= "dropdown">
                                <div className= {`dropdown-header ${isOpen === 'other' ? 'open' : ''}`} onClick={() => handleToggle('other')}>
                                    Other Report Filter
                                    <span className={`dropdown-arrow ${isOpen === 'other' ? 'open' : ''}`}>▼</span>
                                </div>
                            </div>
                        </div>
                    )}
                    {(gd && Object.keys(graph).length > 0) && (
                        <div className="checkbox-item" style={{color:'white'}}>
                            <input type="checkbox" id="all" name="all" checked={expanded} onChange={()=> setExpanded(!expanded)}/>
                            <label htmlFor="all">Expand</label>
                        </div>
                    )}
                </div>
                {(isOpen === 'my') &&(
                    <div className="checkbox-grid" style = {{height: Math.ceil(Object.keys(imageDict).length / 4) * 45}}>
                        {renderTableItems(imageDict, gf, sgf)}
                    </div>
                )}
                {(isOpen === 'other') &&(
                    <div className="checkbox-grid" style = {{height: Math.ceil(Object.keys(otherImageDict).length / 4) * 45}}>
                        {renderTableItems(otherImageDict, ogf, sogf)}
                    </div>
                )}
            </div>
            {chart && (
                <div style={graphStyle}>
                    <HighchartsReact containerProps={{ style: {width:'100%' } }} highcharts={Highcharts} options={chart}/>
                </div>    
            )}
            
        </>
    );
};

export default ChartComponent;
