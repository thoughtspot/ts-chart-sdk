/**
 * @file Custom Chart Implementation from chart.js library
 *
 * @fileoverview
 *
 * @author Chetan Agrawal <chetan.agrawal@thoughtspot.com>
 *
 * Copyright: ThoughtSpot Inc. 2023
 */

import Chart from 'chart.js/auto';
import _ from 'lodash';
import {
    CustomChartContext,
    getChartContext,
    ChartColumn,
    ChartToTSEvent,
    ChartModel,
    ChartConfig,
    ColumnType,
    DataArray,
    PointVal,
    Query,
} from '../../src';

function getDataForColumn(column: ChartColumn, dataArr: DataArray[]) {
    const colId = column.id;
    const idx = _.findIndex(dataArr, (dataObj: any) => dataObj.columnId === colId);
    return dataArr[idx].dataValue;
}

function getDataModel(chartModel: ChartModel) {
    const configDimensions = chartModel.config?.chartConfig?.[0].dimensions ?? [];
    const dataArr = chartModel.data?.[0].data ?? [];

    // this should be handled in a better way
    const xAxisColumns = configDimensions?.[0].columns ?? [];
    const yAxisColumns = configDimensions?.[1].columns ?? [];

    return {
        getLabels: () => getDataForColumn(xAxisColumns[0], dataArr),
        getDatasets: () => _.map(yAxisColumns, (col, idx) => ({
            label: col.name,
            data: getDataForColumn(col, dataArr),
            yAxisID: `y${idx.toString()}`,
        })),
        getScales: () => _.reduce(
            yAxisColumns,
            (obj: any, _val, idx) => {
                obj[`y${idx.toString()}`] = {
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

function getParsedEvent(evt: any) {
    return _.pick(evt.native, [
        'x',
        'y',
        'clientX',
        'clientY',
        'pageX',
        'pageY',
        'screenX',
        'screenY',
    ]);
}

function render(ctx: CustomChartContext) {
    const chartModel = ctx.getChartModel();
    const dataModel = getDataModel(chartModel);

    try {
        const chart = new Chart(document.getElementById('chart') as any, {
            type: 'bar',
            data: {
                labels: dataModel.getLabels(),
                datasets: dataModel.getDatasets(),
            },
            options: {
                scales: dataModel.getScales(),
                // responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'point',
                    intersect: true,
                },
                onClick: (e: any) => {
                    // console.log(e);
                    // console.log(e.chart.getActiveElements()[0]);
                    const activeElement = e.chart.getActiveElements()[0];
                    const dataX = activeElement.index;
                    const dataY = activeElement.datasetIndex;
                    // const canvasPosition = getRelativePosition(e, e.chart);

                    console.log(
                        'ChartPoint',
                        dataX,
                        dataY,
                        dataModel.getPointDetails(dataX, dataY),
                    );
                    ctx.emitEvent(ChartToTSEvent.OpenContextMenu, {
                        event: getParsedEvent(e),
                        clickedPoint: {
                            tuple: dataModel.getPointDetails(dataX, dataY),
                        },
                    });
                },
            },
        });
    } catch (e) {
        console.error('renderfailed', e);
        throw e;
    }
}

const renderChart = async (ctx: CustomChartContext):Promise<void> => {
    try {
        ctx.emitEvent(ChartToTSEvent.RenderStart, null);
        render(ctx);
    } catch (e) {
        ctx.emitEvent(ChartToTSEvent.RenderError, {
            hasError: true,
            error: e,
        });
    } finally {
        ctx.emitEvent(ChartToTSEvent.RenderComplete, null);
    }
};

(async () => {
    const ctx = await getChartContext({
        getDefaultChartConfig: (chartModel: ChartModel): ChartConfig[] => {
            const cols = chartModel.columns;

            const measureColumns = _.filter(cols, (col) => col.type === ColumnType.MEASURE);

            const attributeColumns = _.filter(cols, (col) => col.type === ColumnType.ATTRIBUTE);

            const axisConfig: ChartConfig = {
                key: 'default',
                dimensions: [
                    {
                        key: 'x',
                        columns: [attributeColumns[0]],
                    },
                    {
                        key: 'y',
                        columns: measureColumns.slice(0, 2),
                    },
                ],
            };
            return [axisConfig];
        },
        getQueriesFromChartConfig: (
            chartConfig: ChartConfig[],
        ): Array<Query> => chartConfig.map((config: ChartConfig): Query => _.reduce(
            config.dimensions,
            (acc: Query, dimension) => ({
                queryColumns: [...acc.queryColumns, ...dimension.columns],
            }),
            {
                queryColumns: [],
            } as Query,
        )),
        renderChart: (ctx) => renderChart(ctx),
    });

    renderChart(ctx);
})();
