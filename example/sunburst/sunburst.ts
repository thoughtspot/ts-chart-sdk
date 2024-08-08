/* eslint-disable simple-import-sort/imports */
/**
 * @file Custom Chart Implementation from chart.js library
 *
 * @fileoverview
 *
 * @author Chetan Agrawal <chetan.agrawal@thoughtspot.com>
 *
 * Copyright: ThoughtSpot Inc. 2023
 */

import Highcharts from 'highcharts/es-modules/masters/highcharts.src';
import 'highcharts/es-modules/masters/modules/sunburst.src';

import _ from 'lodash';
import {
    ChartColumn,
    ChartConfig,
    ChartModel,
    ChartToTSEvent,
    ColumnType,
    CustomChartContext,
    DataPointsArray,
    getChartContext,
    Query,
} from '@thoughtspot/ts-chart-sdk';
import { PointOptionsObject } from 'highcharts';

function getDataForColumn(
    column: ChartColumn,
    dataArr: DataPointsArray | undefined,
) {
    const idx = _.findIndex(dataArr?.columns, (colId) => column.id === colId);
    return _.map(dataArr?.dataValue, (row) => row[idx]);
}

function getDataModel(chartModel: ChartModel) {
    const configDimensions =
        chartModel.config?.chartConfig?.[0].dimensions ?? [];
    const dataArr = chartModel.data?.[0].data ?? undefined;

    // this should be handled in a better way
    const xAxisColumns = configDimensions?.[0].columns ?? [];
    const yAxisColumns = configDimensions?.[1].columns ?? [];

    const dataMap: Record<string, PointOptionsObject> = {};
    const yAxisColData = getDataForColumn(yAxisColumns[0], dataArr);
    dataArr?.dataValue.forEach((_dataRow, idx) => {
        let parent = '';
        xAxisColumns.forEach((xCol, dataRowIdx) => {
            const colData = getDataForColumn(xCol, dataArr);
            const currentId =
                dataRowIdx === 0
                    ? _.kebabCase(`${colData[idx]}`)
                    : _.kebabCase(`${parent}-${colData[idx]}`);
            dataMap[currentId] = {
                parent,
                id: currentId,
                name: colData[idx],
            };
            if (dataRowIdx === xAxisColumns.length - 1) {
                dataMap[currentId].value = yAxisColData[idx];
            }
            parent = currentId;
        });
    });

    return {
        values: _.values(dataMap),
    };
}

function render(ctx: CustomChartContext) {
    const chartModel = ctx.getChartModel();
    const dataModel = getDataModel(chartModel);

    try {
        const chart = Highcharts.chart({
            chart: {
                renderTo: 'chart',
            },

            // Let the center circle be transparent
            colors: ['transparent'].concat(
                Highcharts.getOptions().colors as Array<any>,
            ),
            plotOptions: {
                series: {
                    animation: false,
                },
            },
            series: [
                {
                    type: 'sunburst',
                    turboThreshold: dataModel.values.length,
                    data: dataModel.values,
                    name: 'Root',
                    allowDrillToNode: true,
                    borderRadius: 3,
                    cursor: 'pointer',
                    dataLabels: {
                        format: '{point.name}',
                        filter: {
                            property: 'innerArcLength',
                            operator: '>',
                            value: 16,
                        },
                    },
                    levels: [
                        {
                            level: 1,
                            colorByPoint: true,
                            dataLabels: {
                                filter: {
                                    property: 'outerArcLength',
                                    operator: '>',
                                    value: 64,
                                },
                            },
                        },
                        {
                            level: 2,
                            colorVariation: {
                                key: 'brightness',
                                to: -0.5,
                            },
                        },
                        {
                            level: 3,
                            colorVariation: {
                                key: 'brightness',
                                to: 0.5,
                            },
                        },
                        {
                            level: 4,
                            colorVariation: {
                                key: 'brightness',
                                to: -0.5,
                            },
                        },
                    ],
                },
            ],
        });
    } catch (e) {
        console.error('renderfailed', e);
        throw e;
    }
}

const renderChart = async (ctx: CustomChartContext): Promise<void> => {
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

const init = async () => {
    const ctx = await getChartContext({
        getDefaultChartConfig: (chartModel: ChartModel): ChartConfig[] => {
            const cols = chartModel.columns;

            const measureColumns = _.filter(
                cols,
                (col) => col.type === ColumnType.MEASURE,
            );

            const attributeColumns = _.filter(
                cols,
                (col) => col.type === ColumnType.ATTRIBUTE,
            );

            const axisConfig: ChartConfig = {
                key: 'default',
                dimensions: [
                    {
                        key: 'segments',
                        columns: [...attributeColumns],
                    },
                    {
                        key: 'values',
                        columns: measureColumns.slice(0, 1),
                    },
                ],
            };
            return [axisConfig];
        },
        getQueriesFromChartConfig: (chartConfig: ChartConfig[]): Array<Query> =>
            chartConfig.map(
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
            ),
        renderChart: (ctx) => renderChart(ctx),
    });

    renderChart(ctx);
};

await init();
