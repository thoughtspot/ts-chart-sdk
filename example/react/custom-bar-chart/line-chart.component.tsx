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
import _ from 'lodash';
import React, { useEffect, useMemo } from 'react';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
);

interface LineChartProps {
    chartModel: ChartModel;
    emitOpenContextMenu: (args: [OpenContextMenuEventPayload]) => Promise<void>;
    chartRef: React.ForwardedRef<any>;
}

interface RenderChartProps {
    hasInitialized: boolean;
    chartModel: ChartModel | undefined;
    emitOpenContextMenu: (args: [OpenContextMenuEventPayload]) => Promise<void>;
    emitRenderStart: (args: []) => Promise<void>;
    emitRenderError: (args: [RenderErrorEventPayload]) => Promise<void>;
    emitRenderComplete: (args: []) => Promise<void>;
    chartRef: React.ForwardedRef<any>;
}

const getDataForColumn = (column: ChartColumn, dataArr: DataPointsArray) => {
    const idx = _.findIndex(dataArr.columns, (colId) => column.id === colId);
    return _.map(dataArr.dataValue, (row) => row[idx]);
};

const availableColor = ['red', 'green', 'blue'];

const visualPropKeyMap = {
    0: 'color',
    1: 'accordion.Color2',
};

const getColumnDataModel = (
    configDimensions: ChartConfigDimension[],
    dataArr: DataPointsArray,
    type: string,
    visualProps: VisualProps | undefined,
) => {
    // this should be handled in a better way
    const xAxisColumns = configDimensions?.[0].columns ?? [];
    const yAxisColumns = configDimensions?.[1].columns ?? [];

    return {
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

const getParsedEvent = (evt: any) => {
    return _.pick(evt.native, ['clientX', 'clientY']);
};

export const LineChart = ({
    chartModel,
    chartRef,
    emitOpenContextMenu,
}: LineChartProps) => {
    const dataModel = useMemo(() => {
        console.log("LineChart", chartModel?.visualProps);
        // column chart model
        const columnChartModel = getColumnDataModel(
            chartModel.config?.chartConfig?.[0].dimensions ?? [],
            chartModel.data?.[0].data as DataPointsArray,
            'line',
            chartModel?.visualProps,
        );

        return columnChartModel;
    }, [chartModel.config, chartModel.data, chartModel.visualProps]);
    // useEffect(() => {
    //     onVizPropUpdate((vizProp) => {
    //         // do viz porp updat and chang stat
    //     });
    //     // TODO: off event for this above function
    // }, []);
    console.log('render');
    return (
        <Line
            data={{
                labels: dataModel.getLabels(),
                datasets: dataModel.getDatasets() as any,
            }}
            ref={chartRef}
            options={{
                scales: dataModel.getScales(),
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
                    emitOpenContextMenu([
                        {
                            event: getParsedEvent(e),
                            clickedPoint: {
                                tuple: dataModel.getPointDetails(dataX, dataY),
                            },
                        },
                    ]);
                },
            }}
        />
    );
};

export const RenderChart = ({
    chartRef,
    hasInitialized,
    chartModel,
    emitRenderStart,
    emitRenderComplete,
    emitOpenContextMenu,
}: RenderChartProps) => {
    useEffect(() => {
        if (hasInitialized) {
            emitRenderComplete([]);
        }
    }, [hasInitialized]);

    if (!hasInitialized || !chartModel) {
        console.log(hasInitialized);
        console.log(chartModel);
        return <div>Loading...</div>;
    }

    emitRenderStart([]);

    // add an error boundry to trigger render error
    return (
        <LineChart
            chartModel={chartModel}
            chartRef={chartRef}
            emitOpenContextMenu={emitOpenContextMenu}
        />
    );
};
