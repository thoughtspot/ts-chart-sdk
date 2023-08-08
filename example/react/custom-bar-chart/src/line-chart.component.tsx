import {
    ChartColumn,
    ChartConfigDimension,
    ChartModel,
    DataPointsArray,
    OpenContextMenuEventPayload,
    PointVal,
    RenderErrorEventPayload,
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
import React, { useEffect, useMemo, useState } from 'react';
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

interface LineChartProps {
    chartModel: ChartModel;
    emitOpenContextMenu: (args: OpenContextMenuEventPayload) => Promise<void>;
    onVisualPropsUpdate: (
        args: (payload: VisualPropsUpdateEventPayload) => void,
    ) => Promise<void>;
    offVisualPropsUpdate: () => Promise<void>;
    chartRef: React.ForwardedRef<any>;
}

interface RenderChartProps {
    hasInitialized: boolean;
    chartModel: ChartModel | undefined;
    emitOpenContextMenu: (args: OpenContextMenuEventPayload) => Promise<void>;
    emitRenderStart: () => Promise<void>;
    emitRenderError: (args: RenderErrorEventPayload) => Promise<void>;
    emitRenderComplete: () => Promise<void>;
    offVisualPropsUpdate: () => Promise<void>;
    onVisualPropsUpdate: (
        args: (payload: VisualPropsUpdateEventPayload) => void,
    ) => Promise<void>;
    chartRef: React.ForwardedRef<any>;
}

/**
 * Returns the data for a specific column from the data array.
 * @param {ChartColumn} column - The column to retrieve data for.
 * @param {DataPointsArray} dataArr - The array of data points.
 * @returns {any[]} An array containing the data for the specified column.
 */
const getDataForColumn = (column: ChartColumn, dataArr: DataPointsArray) => {
    const idx = _.findIndex(dataArr.columns, (colId) => column.id === colId);
    return _.map(dataArr.dataValue, (row) => row[idx]);
};

/**
 * Array containing available colors for the chart.
 * @type {string[]}
 */
const availableColor = ['red', 'green', 'blue'];

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
    emitOpenContextMenu,
    onVisualPropsUpdate,
    offVisualPropsUpdate,
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
    }, [chartModel.config, chartModel.data]);

    useEffect(() => {
        onVisualPropsUpdate(({ visualProps }) => {
            setVisualProp(visualProps);
            return {
                triggerRenderChart: true,
            };
        });
        return () => {
            // Call the offVisual Prop Update.
            offVisualPropsUpdate();
        };
    }, []);
    return (
        <Line
            data={{
                labels: dataModel.getLabels(),
                datasets: dataModel.getDatasets() as any,
            }}
            ref={chartRef}
            options={{
                scales: dataModel.getScales(),
                plugins: {
                    // Change options for ALL labels of THIS CHART
                    datalabels: {
                        display: dataModel.getAllowLabels(),
                        color: 'blue',
                        labels: {
                            title: {
                                font: {
                                    weight: 'bold',
                                },
                            },
                            value: {
                                color: 'green',
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
            }}
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
    offVisualPropsUpdate,
    onVisualPropsUpdate,
}: RenderChartProps) => {
    useEffect(() => {
        if (hasInitialized) {
            emitRenderStart();
            emitRenderComplete();
        }
    }, [hasInitialized]);

    if (!hasInitialized || !chartModel) {
        return <div>Loading...</div>;
    }

    // add an error boundry to trigger render error
    return (
        <LineChart
            chartModel={chartModel}
            chartRef={chartRef}
            emitOpenContextMenu={emitOpenContextMenu}
            offVisualPropsUpdate={offVisualPropsUpdate}
            onVisualPropsUpdate={onVisualPropsUpdate}
        />
    );
};
