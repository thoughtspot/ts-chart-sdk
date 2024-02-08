import {
    ChartColumn,
    ChartConfigDimension,
    ChartModel,
    DataPointsArray,
    OpenContextMenuEventPayload,
    PointVal,
    RenderErrorEventPayload,
    ShowToolTipEventPayload,
    VisualProps,
    VisualPropsUpdateEventPayload,
} from '@thoughtspot/ts-chart-sdk';
import {
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import _ from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    ChartDataLabels,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
);

const numberFormatter = value => {
    if (value > 1000000000) {
        return (value / 1000000000).toFixed(2) + 'B';
    }
    if (value > 1000000) {
        return (value / 1000000).toFixed(2) + 'M';
    }
    if (value > 1000) {
        return (value / 1000).toFixed(2) + 'K';
    }
    return value;
};

interface LineChartProps {
    chartModel: ChartModel;
    emitShowToolTip: (args_0: ShowToolTipEventPayload) => Promise<void>;
    emitHideToolTip: () => Promise<void>;
    emitOpenContextMenu: (args: OpenContextMenuEventPayload) => Promise<void>;
    setOffVisualPropsUpdate: () => Promise<void>;
    setOnVisualPropsUpdate: (
        args: (payload: VisualPropsUpdateEventPayload) => void,
    ) => Promise<void>;
    chartRef: React.ForwardedRef<any>;
}

interface RenderChartProps {
    hasInitialized: boolean;
    chartModel: ChartModel | undefined;
    emitOpenContextMenu: (args: OpenContextMenuEventPayload) => Promise<void>;
    emitRenderStart: () => Promise<void>;
    emitRenderError: (args: RenderErrorEventPayload) => Promise<void>;
    emitRenderComplete: () => Promise<void>;
    setOffVisualPropsUpdate: () => Promise<void>;
    setOnVisualPropsUpdate: (
        args: (payload: VisualPropsUpdateEventPayload) => void,
    ) => Promise<void>;
    chartRef: React.MutableRefObject<null>;
    emitShowToolTip: (args_0: ShowToolTipEventPayload) => Promise<void>;
    emitHideToolTip: () => Promise<void>;
}

/**
 * Returns the data for a specific column from the data array.
 * @param {ChartColumn} column - The column to retrieve data for.
 * @param {DataPointsArray} dataArr - The array of data points.
 * @returns {any[]} An array containing the data for the specified column.
 */
const getDataForColumn = (column: ChartColumn, dataArr: DataPointsArray) => {
    const idx = _.findIndex(dataArr.columns, colId => column.id === colId);
    return _.map(dataArr.dataValue, row => row[idx]);
};

/**
 * Array containing available colors for the chart.
 * @type {string[]}
 */
const availableColor = ['red', 'blue', 'green'];

/**
 * A mapping of index to visual property key.
 * @type {Object}
 */
const visualPropKeyMap = {
    0: 'color',
    1: 'accordion.Color2',
    2: 'accordion.datalabels',
};

/**
 * Gets the data model for the chart's column.
 * @param {ChartConfigDimension[]} configDimensions - The configuration dimensions of the chart.
 * @param {DataPointsArray} dataArr - The array of data points.
 * @param {string} type - The type of the chart.
 * @param {VisualProps|undefined} visualProps - The visual properties of the chart.
 * @returns {Object} An object containing various data model functions for the chart.
 */
const getColumnDataModel = (
    configDimensions: ChartConfigDimension[],
    dataArr: DataPointsArray,
    type: string,
    visualProps: VisualProps | undefined,
) => {
    // this should be handled in a better way
    const xAxisColumns = configDimensions?.[0].columns ?? [];
    const yAxisColumns = configDimensions?.[1].columns ?? [];
    const allowLabels = _.get(visualProps, visualPropKeyMap[2], false);

    return {
        getAllowLabels: () => allowLabels,
        getLabels: () => getDataForColumn(xAxisColumns[0], dataArr),
        getDatasets: () =>
            _.map(yAxisColumns, (col, idx: number) => ({
                label: col.name,
                data: getDataForColumn(col, dataArr),
                yAxisID: `${type}-y${idx.toString()}`,
                type: `${type}`,
                backgroundColor: _.get(
                    visualProps,
                    visualPropKeyMap?.[idx],
                    availableColor[idx],
                ),
                borderColor: _.get(
                    visualProps,
                    visualPropKeyMap?.[idx],
                    availableColor[idx],
                ),
                datalabels: {
                    anchor: 'end',
                },
            })),
        getScales: () =>
            _.reduce(
                yAxisColumns,
                (obj: any, _val, idx: number) => {
                    // eslint-disable-next-line no-param-reassign
                    obj[`${type}-y${idx.toString()}`] = {
                        grid: {
                            display: true,
                        },
                        position: idx === 0 ? 'left' : 'right',
                        title: {
                            display: true,
                            text: `${_val.name}`,
                        },
                    };
                    return obj;
                },
                {},
            ),
        getPointDetails: (xPos: number, yPos: number): PointVal[] => [
            {
                columnId: xAxisColumns[0].id,
                value: getDataForColumn(xAxisColumns[0], dataArr)[xPos],
            },
            {
                columnId: yAxisColumns[yPos].id,
                value: getDataForColumn(yAxisColumns[yPos], dataArr)[xPos],
            },
        ],
    };
};

/**
 * Parses the event to extract required properties.
 * @param {any} evt - The event object to parse.
 * @returns {Object} An object containing the parsed properties from the event.
 */
const getParsedEvent = (evt: any) => {
    return _.pick(evt.native, ['clientX', 'clientY']);
};

/**
 * Represents a line chart component.
 * @param {LineChartProps} props - The props for the LineChart component.
 * @returns {JSX.Element} A React component representing the line chart.
 */
export const LineChart = ({
    chartModel,
    chartRef,
    emitShowToolTip,
    emitHideToolTip,
    emitOpenContextMenu,
    setOnVisualPropsUpdate,
    setOffVisualPropsUpdate,
}: LineChartProps) => {
    const [visualProp, setVisualProp] = useState(chartModel?.visualProps);
    const dataModel = useMemo(() => {
        const columnChartModel = getColumnDataModel(
            chartModel.config?.chartConfig?.[0].dimensions ?? [],
            chartModel.data?.[0].data as DataPointsArray,
            'line',
            visualProp,
        );

        return columnChartModel;
    }, [chartModel.config, chartModel.data, visualProp]);

    useEffect(() => {
        setOnVisualPropsUpdate(({ visualProps }) => {
            setVisualProp(visualProps);
            return {
                triggerRenderChart: true,
            };
        });
    }, []);

    const handleMouseOver = useCallback(
        (e: any) => {
            if (!e.chart) {
                return;
            }
            const elements = e.chart.getActiveElements();
            if (elements.length > 0) {
                const activeElement = elements[0];
                const dataX = activeElement?.index;
                const dataY = activeElement?.datasetIndex;
                if (!_.isNil(dataX) && !_.isNil(dataY)) {
                    const point = dataModel.getPointDetails(dataX, dataY);
                    emitShowToolTip({
                        event: getParsedEvent(e),
                        point: {
                            tuple: point,
                        },
                        customTooltipContent: [],
                    });
                }
            } else {
                emitHideToolTip();
            }
        },
        [dataModel],
    );
    const onHoverLegend = useCallback((e, item, legend) => {
        emitShowToolTip({
            event: getParsedEvent(e),
            customTooltipContent: [
                `<div><h3><a href="http://google.com">google</a>${item.text}</h3></div>`,
            ],
        });
    }, []);
    return (
        <Line
            data={{
                labels: dataModel.getLabels(),
                datasets: dataModel.getDatasets() as any,
            }}
            ref={chartRef}
            options={{
                animation: {
                    duration: 0,
                },
                scales: dataModel.getScales(),
                plugins: {
                    tooltip: {
                        enabled: false,
                    },
                    legend: {
                        onHover: onHoverLegend,
                        onLeave: () => {
                            emitHideToolTip();
                        },
                    },
                    // Change options for ALL labels of THIS CHART
                    datalabels: {
                        display: dataModel.getAllowLabels() ? 'auto' : false,
                        formatter: value => numberFormatter(value),
                        color: 'blue',
                        textStrokeColor: 'white',
                        textStrokeWidth: 5,
                        labels: {
                            title: {
                                font: {
                                    weight: 'bold',
                                },
                            },
                            value: {
                                color: 'black',
                            },
                        },
                    },
                },
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'point',
                    intersect: true,
                },
                onClick: (e: any) => {
                    const activeElement = e.chart.getActiveElements()[0];
                    const dataX = activeElement?.index;
                    const dataY = activeElement.datasetIndex;

                    console.log(
                        'ChartPoint',
                        dataX,
                        dataY,
                        dataModel.getPointDetails(dataX, dataY),
                    );
                    emitOpenContextMenu({
                        event: getParsedEvent(e),
                        clickedPoint: {
                            tuple: dataModel.getPointDetails(dataX, dataY),
                        },
                    });
                },
                onHover: event => {
                    if (event.type === 'mousemove') {
                        handleMouseOver(event);
                    }
                    if (event.type === 'mouseout') {
                        emitHideToolTip();
                    }
                },
            }}
            onMouseOut={emitHideToolTip}
        />
    );
};

/**
 * Represents a chart renderer component.
 * @param {RenderChartProps} props - The props for the RenderChart component.
 * @returns {JSX.Element} A React component for rendering the chart.
 */
export const RenderChart = ({
    chartRef,
    hasInitialized,
    chartModel,
    emitRenderStart,
    emitRenderComplete,
    emitOpenContextMenu,
    emitShowToolTip,
    emitHideToolTip,
    setOffVisualPropsUpdate,
    setOnVisualPropsUpdate,
}: RenderChartProps) => {
    useEffect(() => {
        if (hasInitialized) {
            // TODO Use afterrender from chart.js
            emitRenderStart();
        }
    }, [hasInitialized]);

    useEffect(() => {
        if (chartRef?.current) {
            emitRenderComplete();
        }
    }, [chartRef?.current]);

    if (!hasInitialized || !chartModel) {
        return <div>Loading...</div>;
    }

    // add an error boundry to trigger render error
    return (
        <LineChart
            chartModel={chartModel}
            chartRef={chartRef}
            emitOpenContextMenu={emitOpenContextMenu}
            setOffVisualPropsUpdate={setOffVisualPropsUpdate}
            setOnVisualPropsUpdate={setOnVisualPropsUpdate}
            emitShowToolTip={emitShowToolTip}
            emitHideToolTip={emitHideToolTip}
        />
    );
};
