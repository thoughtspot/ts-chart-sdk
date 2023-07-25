import {
    ChartColumn,
    ChartContext,
    ChartModel,
    DataPointsArray,
    OpenContextMenuEventPayload,
    PointVal,
    VisualProps,
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
import React, { useContext, useRef } from 'react';
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

function getDataForColumn(column: ChartColumn, dataArr: DataPointsArray) {
    const idx = _.findIndex(dataArr.columns, (colId) => column.id === colId);
    return _.map(dataArr.dataValue, (row) => row[idx]);
}

const availableColor = ['red', 'green', 'blue'];

const visualPropKeyMap = {
    0: 'color',
    1: 'accordion.Color2',
};

function getColumnDataModel(
    configDimensions: any,
    dataArr: DataPointsArray,
    type: string,
    visualProps: VisualProps,
) {
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
}

function getDataModel(chartModel: ChartModel, visualProps: any) {
    // column chart model
    const columnChartModel = getColumnDataModel(
        chartModel.config?.chartConfig?.[0].dimensions ?? [],
        chartModel.data?.[0].data ?? [],
        'line',
        chartModel.visualProps,
    );

    return columnChartModel;
}

function getParsedEvent(evt: any) {
    return _.pick(evt.native, ['clientX', 'clientY']);
}

function renderChart(
    chartModel: ChartModel,
    onOpenContextMenu: (args: [OpenContextMenuEventPayload]) => Promise<void>,
    chartRef: any,
) {
    const visualProps = chartModel.visualProps;
    const dataModel = getDataModel(chartModel, visualProps);
    const data = {
        labels: dataModel.getLabels(),
        datasets: dataModel.getDatasets() as any,
    };
    return (
        <Line
            data={data}
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
                    const dataX = activeElement.index;
                    const dataY = activeElement.datasetIndex;

                    console.log(
                        'ChartPoint',
                        dataX,
                        dataY,
                        dataModel.getPointDetails(dataX, dataY),
                    );
                    onOpenContextMenu({
                        event: getParsedEvent(e),
                        clickedPoint: {
                            tuple: dataModel.getPointDetails(dataX, dataY),
                        },
                    });
                },
            }}
        />
    );
}

const App = () => {
    const chartRef = useRef();
    const { chartModel, hasInitialized, emitOpenContextMenu } =
        useContext(ChartContext);

    if (!hasInitialized || !chartModel) {
        return <div>Loading...</div>;
    }

    return (
        <div
            data-testid="line-chart"
            style={{ width: '99vw', height: '95vh', position: 'relative' }}
        >
            {renderChart(
                chartModel as ChartModel,
                emitOpenContextMenu,
                chartRef,
            )}
        </div>
    );
};

export default App;
