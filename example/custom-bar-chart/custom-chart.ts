/**
 * @file Custom Chart Implementation from chart.js library
 *
 * @fileoverview
 *
 * @author Chetan Agrawal <chetan.agrawal@thoughtspot.com>
 *
 * Copyright: ThoughtSpot Inc. 2023
 */

import { VisualPropEditorDefinition } from '@thoughtspot/ts-chart-sdk';
import {
    ChartColumn,
    ChartConfig,
    ChartModel,
    ChartToTSEvent,
    ColumnType,
    CustomChartContext,
    DataPointsArray,
    getChartContext,
    PointVal,
    Query,
    VisualProps,
} from '@thoughtspot/ts-chart-sdk';
import {
    ChartConfigEditorDefinition,
    CustomChartEditorDefinitionProps,
} from '@thoughtspot/ts-chart-sdk/src';
import Chart from 'chart.js/auto';
import { toDimension } from 'chart.js/dist/helpers/helpers.core';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import _ from 'lodash';

Chart.register(ChartDataLabels);

let globalChartReference: Chart;

const availableColor = ['red', 'green', 'blue'];

const visualPropKeyMap = {
    0: 'color',
    1: 'accordion.Color2',
    2: 'accordion.datalabels',
};

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

function getDataForColumn(column: ChartColumn, dataArr: DataPointsArray) {
    const idx = _.findIndex(dataArr.columns, colId => column.id === colId);
    return _.map(dataArr.dataValue, row => row[idx]);
}

function getColumnDataModel(
    configDimensions,
    dataArr: DataPointsArray,
    type,
    visualProps: VisualProps,
) {
    // this should be handled in a better way
    const xAxisColumns = configDimensions?.[0].columns ?? [];
    const yAxisColumns = configDimensions?.[1].columns ?? [];

    return {
        getLabels: () => getDataForColumn(xAxisColumns[0], dataArr),
        getDatasets: () =>
            _.map(yAxisColumns, (col, idx) => ({
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
                            text: _val.name,
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

function getDataModel(chartModel: ChartModel) {
    // column chart model
    const columnChartModel = getColumnDataModel(
        chartModel.config?.chartConfig?.[0].dimensions ?? [],
        chartModel.data?.[0].data ?? [],
        'bar',
        chartModel.visualProps,
    );

    return columnChartModel;
}

function getParsedEvent(evt: any) {
    return _.pick(evt.native, ['clientX', 'clientY']);
}

function downloadChartAsPNG() {
    const imageLink = document.createElement('a');
    const canvas = document.getElementById('chart') as any;
    imageLink.download = 'bar-chart.png';
    imageLink.href = canvas.toDataURL('image/png', 1);
    imageLink.click();
}

function render(ctx: CustomChartContext) {
    const chartModel = ctx.getChartModel();
    const dataModel = getDataModel(chartModel);
    const allowLabels = _.get(
        chartModel.visualProps,
        visualPropKeyMap[2],
        false,
    );
    const labelColor = _.get(
        chartModel.visualProps,
        visualPropKeyMap[1],
        'blue',
    );
    if (!dataModel) {
        return;
    }

    try {
        const canvas = document.getElementById('chart') as any;
        // clear canvas.
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

        globalChartReference = new Chart(canvas as any, {
            type: 'bar',
            data: {
                labels: dataModel.getLabels(),
                datasets: dataModel.getDatasets() as any,
            },
            options: {
                animation: {
                    duration: 0,
                },
                scales: dataModel.getScales(),
                plugins: {
                    // Change options for ALL labels of THIS CHART
                    datalabels: {
                        display: allowLabels,
                        color: labelColor,
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
                // responsive: true,
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
                    ctx.emitEvent(ChartToTSEvent.OpenContextMenu, {
                        event: getParsedEvent(e),
                        clickedPoint: {
                            tuple: dataModel.getPointDetails(dataX, dataY),
                        },
                        customActions: [
                            {
                                id: 'custom-action-1',
                                label: 'Custom user action 1',
                                icon: '',
                                onClick: (...arg) => {
                                    console.log(
                                        'custom action 1 triggered',
                                        arg,
                                    );
                                },
                            },
                            {
                                id: 'download-chart',
                                label: 'Download chart',
                                icon: '',
                                onClick: () => {
                                    downloadChartAsPNG();
                                },
                            },
                        ],
                    });
                },
            },
        });
    } catch (e) {
        console.error('renderfailed', e);
        throw e;
    }
}

const renderChart = async (ctx: CustomChartContext): Promise<void> => {
    if (globalChartReference) {
        globalChartReference.destroy();
    }
    try {
        ctx.emitEvent(ChartToTSEvent.RenderStart);
        render(ctx);
    } catch (e) {
        ctx.emitEvent(ChartToTSEvent.RenderError, {
            hasError: true,
            error: e,
        });
    } finally {
        ctx.emitEvent(ChartToTSEvent.RenderComplete);
    }
};

(async () => {
    const ctx = await getChartContext({
        getDefaultChartConfig: (chartModel: ChartModel): ChartConfig[] => {
            const cols = chartModel.columns;

            const measureColumns = _.filter(
                cols,
                col => col.type === ColumnType.MEASURE,
            );

            const attributeColumns = _.filter(
                cols,
                col => col.type === ColumnType.ATTRIBUTE,
            );

            const axisConfig: ChartConfig = {
                key: 'column',
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
        ): Array<Query> => {
            const queries = chartConfig.map(
                (config: ChartConfig): Query =>
                    _.reduce(
                        config.dimensions,
                        (acc: Query, dimension) => ({
                            queryColumns: [
                                ...acc.queryColumns,
                                ...dimension.columns,
                            ],
                        }),
                        {
                            queryColumns: [],
                        } as Query,
                    ),
            );
            return queries;
        },
        renderChart: ctx => renderChart(ctx),
        chartConfigEditorDefinition: (
            configInfo: CustomChartEditorDefinitionProps,
        ): ChartConfigEditorDefinition[] => {
            const {
                chartModel,
                updatedChartConfig,
                updatedVisualProps,
            } = configInfo;

            const yColumns = updatedChartConfig?.[0]?.dimensions.find(
                dimension => dimension.key === 'y' && dimension.columns,
            );

            const config = [
                {
                    key: 'column',
                    label: 'Custom Column',
                    descriptionText:
                        'X Axis can only have attributes, Y Axis can only have measures, Color can only have attributes. ' +
                        'Should have just 1 column in Y axis with colors columns.',
                    columnSections: [
                        {
                            key: 'x',
                            label: 'Custom X Axis',
                            allowAttributeColumns: true,
                            allowMeasureColumns: false,
                            allowTimeSeriesColumns: true,
                            maxColumnCount: 1,
                        },
                        {
                            key: 'y',
                            label: 'Custom Y Axis',
                            allowAttributeColumns: false,
                            allowMeasureColumns: true,
                            allowTimeSeriesColumns: false,
                        },
                    ],
                },
            ];
            if (yColumns?.columns.length) {
                for (let i = 0; i < yColumns.columns.length; i++) {
                    config[0].columnSections.push({
                        key: `layers${i}`,
                        label: `Measures layer${i}`,
                        allowAttributeColumns: false,
                        allowMeasureColumns: true,
                        allowTimeSeriesColumns: false,
                    });
                }
            }
            return config;
        },
        visualPropEditorDefinition: (
            visualInfo: CustomChartEditorDefinitionProps,
        ): VisualPropEditorDefinition => {
            const {
                chartModel,
                updatedVisualProps,
                updatedChartConfig,
            } = visualInfo;
            const elements = [
                {
                    key: 'color',
                    type: 'radio',
                    defaultValue: 'red',
                    values: ['red', 'green', 'yellow'],
                    label: 'Colors',
                },
                {
                    type: 'section',
                    key: 'accordion',
                    label: 'Accordion',
                    children: [
                        {
                            key: 'datalabels',
                            type: 'toggle',
                            defaultValue: false,
                            label: 'Data Labels',
                        },
                    ],
                },
            ];
            if (updatedVisualProps?.length !== 0) {
                if (updatedVisualProps?.accordion?.datalabels) {
                    elements[1].children?.push({
                        key: 'Color2',
                        type: 'radio',
                        defaultValue: 'blue',
                        values: ['blue', 'white', 'red'],
                        label: 'Color2',
                    });
                }
            } else {
                if (chartModel?.visualProps?.accordion?.datalabels) {
                    elements[1].children?.push({
                        key: 'Color2',
                        type: 'radio',
                        defaultValue: 'blue',
                        values: ['blue', 'white', 'red'],
                        label: 'Color2',
                    });
                }
            }

            return { elements };
        },
    });

    renderChart(ctx);
})();
