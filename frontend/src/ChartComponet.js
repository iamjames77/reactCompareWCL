import React, { useEffect, useState, useRef } from 'react';
import Highcharts, { time } from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import './dropdown.css';

function ChartComponent({myGraphJSON, otherGraphJSON, type, SetTimeLength, setChartInterval, setChartLeft, setChartWidth, 
    myDTGraphJSON, otherDTGraphJSON, abilityTable, otherAbilityTable}) {
    const [myGraphData, setMyGraphData] = useState(null);
    const [otherGraphData, setOtherGraphData] = useState(null);
    const [graph, setGraph] = useState({});
    const [otherGraph, setOtherGraph] = useState({});
    const [graphData, setGraphData] = useState(null);
    const [dataType, setDataType] = useState(null);
    const [timeLength, setTimeLength] = useState(0);
    const [chart, setChart] = useState(null);
    const [graphStyle, setGraphStyle] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [chartSeries, setChartSeries] = useState(null);
    const [chartFilter, setChartFilter] = useState(null);
    const [isChartReady, setIsChartReady] = useState(false);
    const [componentSeries, setComponentSeries] = useState({});
    const [otherComponentSeries, setOtherComponentSeries] = useState({});
    const chartRef = useRef(null);

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

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const toggleSeriesVisibility = (name, scS) => {
        scS(prev => ({
            ...prev,
            [name]: {
                ...prev[name],
                visible: !prev[name].visible
            }
        }));
    };

    const renderTableItems = (items, cS, scS) => {
        const result = items.map((item, index) => {
            return (
                <div key={index} className="checkbox-item">
                    <input type="checkbox" id={item.name} name={item.name}
                    checked = {cS[item.name].visible}
                    onChange={()=> toggleSeriesVisibility(item.name, scS)}/>
                    <img src={item.img} alt="" className="dropdown-icon"/>
                    <label htmlFor={item}>{item.name}</label>
                </div>
            );
        });
        return result
    };

    // Load data initially
    useEffect(() => {
        if (myGraphJSON && (myGraphJSON.id === 'ALL' || abilityTable)) {
            const id = myGraphJSON.id;
            const name = myGraphJSON.name;
            const graph = myGraphJSON.graph;
            const myTimeLength = myGraphJSON.time;
            setGraph(prev => ({
                ...prev,
                ['id']: id,
                ['name']: name,
                ['graph']: graph,
            }));
            const newComponentSeries = {};
            Object.entries(graph).forEach(([key, data]) => {
                let img;
                if(id !== 'ALL'){
                    const find = abilityTable.find(ability => ability.name === data.name)
                    if(find){
                        img = `https://wow.zamimg.com/images/wow/icons/large/${find['abilityIcon']}`
                    }
                    else {
                        img = undefined;
                    }
                } else{
                    img = name[data.name];
                }
                console.log(data.name);
                console.log(img);
                newComponentSeries[data.name] = {
                    visible: data.id === 'Total' ? true : false,
                    img: img,
                };
            });
            setComponentSeries(prev => ({
                ...prev,
                ...newComponentSeries
            }));
            if (myDTGraphJSON){
                const myDTGraph = myDTGraphJSON.graph;
                setGraph(prev => ({
                    ...prev,
                    ['DTGraph']: myDTGraph
                }));
                setComponentSeries(prev => ({
                    ...prev,
                    ['Damage Taken']: {'visible': false, 'img': undefined}
                }));
            }
            setDataType(type);
            const newTimeLength = Math.ceil(myTimeLength/1000) * 1000;
            setTimeLength(newTimeLength);
            SetTimeLength(newTimeLength);
            setIsChartReady(false)
        }
    }, [myGraphJSON, abilityTable, myDTGraphJSON ,type]);

    useEffect(() => {
        console.log(componentSeries);
    }, [componentSeries]);

    useEffect(() => {
        let isEmpty = true;
        for (let key in graph) {
            if (graph.hasOwnProperty(key)) {
                isEmpty = false;
                break; // 첫 번째 키를 찾은 즉시 루프를 종료
            }
        }
        if(!isEmpty && componentSeries && type){
            const mySeries = Object.entries(graph.graph).map( ([key,data]) => {
                return ({
                    name: `${data.name}`,
                    data: data.data.map((value, index) => [index * data.pointInterval, value]),
                    visible: componentSeries[data.name].visible,
                    img: componentSeries[data.name].img
                })
            }).filter(result => result !== undefined);
            if(graph.DTGraph && (type === 'Healing')){
                const myDTGraph = graph.DTGraph;
                const myDTGraphData = {
                    name: `Damage Taken`,
                    data: myDTGraph.data.map((value, index) => [index * myDTGraph.pointInterval, value]),
                    visible: componentSeries['Damage Taken'].visible,
                    img: componentSeries['Damage Taken'].img
                }
                mySeries.push(myDTGraphData);
            }
            setMyGraphData(mySeries);
        }
    }, [graph, componentSeries]);

    useEffect(() => {
        if (otherGraphJSON && (otherGraphJSON.id === 'ALL' || otherAbilityTable)){
            const id = otherGraphJSON.id;
            const name = otherGraphJSON.name;
            const graph = otherGraphJSON.graph;
            const otherTimeLength = otherGraphJSON.time;
            setOtherGraph(prev => ({
                ...prev,
                ['id']: id,
                ['name']: name,
                ['graph']: graph,
            }));
            Object.entries(graph).forEach(([key, data]) => {
                let img;
                if(id !== 'ALL'){
                    const find = otherAbilityTable.find(ability => ability.name === data.name)
                    if(find){
                        img = `https://wow.zamimg.com/images/wow/icons/large/${find['abilityIcon']}`
                    }
                    else {
                        img = undefined;
                    }
                } else{
                    img = name[data.name];
                }
                setOtherComponentSeries(prev => ({
                    ...prev,
                    [data.name]: {'visible':data.id === 'Total' ? true : false, 'img': img}
                }))
            });
            if (otherDTGraphJSON){
                const otherDTGraph = otherDTGraphJSON.graph;
                setOtherGraph(prev => ({
                    ...prev,
                    ['DTGraph']: otherDTGraph
                }));
                setOtherComponentSeries(prev => ({
                    ...prev,
                    ['Damage Taken']: {'visible': false, 'img': undefined}
                }));
            }
            if(timeLength < otherTimeLength){
                const newTimeLength = Math.ceil(otherTimeLength/1000) * 1000;
                setTimeLength(newTimeLength);
                SetTimeLength(newTimeLength);
            }
            setIsChartReady(false);
        }
    }, [otherGraphJSON, otherAbilityTable, otherDTGraphJSON]);

    useEffect(() => {
        let isEmpty = true;
        for (let key in otherGraph) {
            if (otherGraph.hasOwnProperty(key)) {
                isEmpty = false;
                break; // 첫 번째 키를 찾은 즉시 루프를 종료
            }
        }
        if(!isEmpty && otherComponentSeries && type){
            const otherSeries = Object.entries(otherGraph.graph).map( ([key,data]) => {
                return ({
                    name: `${data.name}`,
                    data: data.data.map((value, index) => [index * data.pointInterval, value]),
                    visible: otherComponentSeries[data.name].visible,
                    img: otherComponentSeries[data.name].img
                })
            }).filter(result => result !== undefined);
            if(otherGraph.DTGraph && (type === 'Healing')){
                const otherDTGraph = otherGraph.DTGraph;
                const otherDTGraphData = {
                    name: `Damage Taken`,
                    data: otherDTGraph.data.map((value, index) => [index * otherDTGraph.pointInterval, value]),
                    visible: otherComponentSeries['Damage Taken'].visible,
                    img: otherComponentSeries['Damage Taken'].img
                }
                otherSeries.push(otherDTGraphData);
            }
            setOtherGraphData(otherSeries);
        }
    }, [otherGraph, otherComponentSeries]);


    useEffect(() => {
        if(myGraphData){
            const newGraphData = JSON.parse(JSON.stringify(myGraphData));
            if (otherGraphData){
                newGraphData.push(...otherGraphData);
            }
            setGraphData(newGraphData);
        }
    }, [myGraphData, otherGraphData]);

    useEffect(() => {
        if (isChartReady) {
            const ch = chartRef.current.chart;
            const plotLeft = ch.plotLeft;
            setChartInterval(ch.plotWidth / timeLength * 1000);
            setChartWidth(ch.plotWidth + (ch.marginRight || 0));
            setChartLeft(plotLeft);
            const ticks=  ch.xAxis[0].ticks;
            const tickPos = Object.entries(ticks).map(([key, value]) => {
                return(value.mark.pathArray[0][1]);
            });
            const filter = {};
            const result = ch.series.map((element) => {
                console.log(element.userOptions);
                filter[element.userOptions.name] = element.visible;
                return {
                    name: element.userOptions.name,
                    img: element.userOptions.img,
                }
            });
            setChartFilter(filter);
            setChartSeries(result);
        }
    },[isChartReady]);

    useEffect(() => {
        const checkChartReady = () => {
          if (chartRef.current && chartRef.current.chart &&
            chartRef.current.chart.xAxis &&
            chartRef.current.chart.xAxis[0].ticks &&
            chartRef.current.chart.xAxis[0].ticks[0].mark &&
            chartRef.current.chart.xAxis[0].ticks[0].mark.pathArray[0][1]
          ) {
            setIsChartReady(true);
          } else {
            // chart 객체가 아직 준비되지 않았다면 짧은 지연 후 다시 확인
            setTimeout(checkChartReady, 100);
          }
        };
    
        if(!isChartReady){
            checkChartReady();
        }
      }, [isChartReady]);

    useEffect(() => {
        if (graphData && dataType && timeLength) {
            const dType = dataType === 'Healing' ? 'Hps' : 'Dps';
            const tickPositions = generateTickPositions(timeLength, 1000);
            const container = {
                chart: {
                    type: 'line',
                    width: timeLength / 10,
                    marginLeft: 150,
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
                series: graphData
            };
            setChart(container);
        }
    }, [graphData, dataType, timeLength]);

    useEffect(() => {
        if(timeLength>0){
            setGraphStyle({
                width: `${(timeLength/10)}px`,
                overflowX: 'auto',
            })
        }
    }, [timeLength]);

    useEffect(() => {
        if(chart){
            console.log('chart changed');
        }
    }, [chart]);
    
    return (
        <>
            <div style={{position:'sticky', left:0}}>
                <div style={{display:'flex', width:'100%', marginBottom:6}}>
                    <div className="checkbox left">
                        <div className= "dropdown">
                            <div className= {`dropdown-header ${isOpen ? 'open' : ''}`} onClick={handleToggle}>
                                Enemy Filter
                                <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
                            </div>
                        </div>
                    </div>
                </div>
                {isOpen && chartSeries &&(
                    <div className="checkbox-grid" style = {{height: Math.ceil(chartSeries.length / 4) * 45}}>
                        {renderTableItems(chartSeries, componentSeries, setComponentSeries)}
                    </div>
                )}
            </div>
            <div style={graphStyle}>
                <HighchartsReact containerProps={{ style: {width:'100%' } }} highcharts={Highcharts} options={chart} ref={chartRef}/>
            </div>
        </>
    );
};

export default ChartComponent;
