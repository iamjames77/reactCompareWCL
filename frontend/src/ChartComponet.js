import React, { useEffect, useState, useRef } from 'react';
import Highcharts, { time } from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import Scaling from './Scaling';
import { parse } from '@fortawesome/fontawesome-svg-core';

function ChartComponent({myGraphJSON, otherGraphJSON, type, SetTimeLength, SetChartInterval, SetChartLeft}) {
    const [myGraphData, setMyGraphData] = useState(null);
    const [otherGraphData, setOtherGraphData] = useState(null);
    const [graphData, setGraphData] = useState(null);
    const [dataType, setDataType] = useState(null);
    const [timeLength, setTimeLength] = useState(0);
    const [chart, setChart] = useState(null);
    const [chartInterval, setChartInterval] = useState(0);
    const [chartLeft, setChartLeft] = useState(0);
    const [graphStyle, setGraphStyle] = useState(null);
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

    // Load data initially
    useEffect(() => {
        if (myGraphJSON) {
            const name = myGraphJSON.name;
            const graph = myGraphJSON.graph;
            const myTimeLength = myGraphJSON.time;
            const mySeries = Object.entries(graph).map( ([key,data]) => {
                return ({
                    name: `${data.name}`,
                    data: data.data.map((value, index) => [index * data.pointInterval, value]),
                })   
            }).filter(result => result !== undefined);
            setMyGraphData(mySeries);
            setDataType(type);
            if(timeLength < myTimeLength){
                const newTimeLength = Math.ceil(myTimeLength/1000) * 1000;
                setTimeLength(newTimeLength);
                SetTimeLength(newTimeLength);
            }
        }
    }, [myGraphJSON ,type]);

    useEffect(() => {
        if (otherGraphJSON){
            const name = otherGraphJSON.name;
            const graph = otherGraphJSON.graph;
            const otherTimeLength = otherGraphJSON.time;
            const otherSeries = Object.entries(graph).map( ([key,data]) => {
                return ({
                    name: `other${data.name}`,
                    data: data.data.map((value, index) => [index * data.pointInterval, value]),
                })
            }).filter(result => result !== undefined);
            setOtherGraphData(otherSeries);
            if(timeLength < otherTimeLength){
                const newTimeLength = Math.ceil(otherTimeLength/1000) * 1000;
                setTimeLength(newTimeLength);
                SetTimeLength(newTimeLength);
            }
        }
    }, [otherGraphJSON]);

    useEffect(() => {
        if(myGraphData){
            setGraphData(myGraphData);
            if(otherGraphData){
                const newGraph = myGraphData.concat(otherGraphData);
                setGraphData(newGraph);
            }
        }
    }, [myGraphData, otherGraphData]);

    useEffect(() => {
        if (chartRef.current.chart) {
            const ch = chartRef.current.chart;
            const plotLeft = ch.plotLeft;
            setChartInterval(ch.plotWidth / timeLength * 1000);
            SetChartInterval(ch.plotWidth / timeLength * 1000);
            setChartLeft(plotLeft);
            SetChartLeft(plotLeft);
        }
    });

    useEffect(() => {
        if (graphData && dataType && timeLength) {
            const dType = dataType === 'Healing' ? 'Hps' : 'Dps';
            const tickPositions = generateTickPositions(timeLength, 1000);
            const container = {
                chart: {
                    type: 'area',
                    reflow: false,
                    width: timeLength / 10
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
                series: graphData
            };
            setChart(container);
        }
    }, [graphData, dataType, timeLength]);

    useEffect(() => {
        if(timeLength>0){
            setGraphStyle({
                width: `${(timeLength/10)}px`,
                overflowX: 'auto'
            })
        }
    }, [timeLength]);

    return (
        <div style={graphStyle}>
             <HighchartsReact containerProps={{ style: {width:'100%' } }} highcharts={Highcharts} options={chart} ref={chartRef}/>
        </div>
    );
};

export default ChartComponent;
