/* eslint-disable simple-import-sort/imports */
import {
    ChartColumn,
    ChartConfig,
    ChartModel,
    ChartToTSEvent,
    CustomChartContext,
    DataPointsArray,
    Query,
    getChartContext,
} from '@thoughtspot/ts-chart-sdk';
import { PointOptionsObject } from 'highcharts';
import Highcharts from 'highcharts/es-modules/masters/highcharts.src';
import 'highcharts/es-modules/masters/modules/gantt.src';
import _ from 'lodash';

function getDataForColumn(column: ChartColumn, dataArr: DataPointsArray) {
    const idx = _.findIndex(dataArr.columns, (colId) => column.id === colId);
    return _.map(dataArr.dataValue, (row) => row[idx]);
}

function getParsedEvent(evt: any) {
    return {
        clientX: evt?.target?.plotX,
        clientY: evt?.target?.plotY,
    };
}

const getDataModel = (ctx: CustomChartContext) => {
    const chartModel = ctx.getChartModel();
    const columns = chartModel.columns;
    const dataArr = chartModel?.data?.[0].data as DataPointsArray;
    // create point from data
    const points = dataArr?.dataValue.map((row: any[], idx: number) => {
        return {
            id: `${row[0]} ${row[1]}`,
            parent: row[0],
            name: row[1],
            start: new Date(row[2]).getTime(),
            end: new Date(row[3]).getTime(),
            completed: {
                amount: row[4],
            },
            events: {
                mouseOver: (e) => {
                    ctx.emitEvent(ChartToTSEvent.ShowToolTip, {
                        event: getParsedEvent(e),
                        point: {
                            tuple: [
                                {
                                    columnId: columns[idx].id,
                                    value: row[1],
                                },
                            ],
                        },
                        customTooltipContent: [],
                    });
                },
                mouseOut: () => {
                    ctx.emitEvent(ChartToTSEvent.HideToolTip);
                },
            },
            dependency: `${row[0]} ${row[5]}`,
        } as PointOptionsObject;
    });

    // create projects from points & data
    const projects = _.uniq(getDataForColumn(columns[0], dataArr));
    const dataSeries = projects.map((project) => {
        const filteredPoints = points.filter(
            (point: any) => point.parent === project,
        );
        return {
            name: project,
            data: [
                ...filteredPoints,
                {
                    id: project,
                    name: project,
                },
            ],
        };
    });

    // get max and min date
    const maxDate = _.max([
        ...getDataForColumn(columns[2], dataArr),
        ...getDataForColumn(columns[3], dataArr),
    ]);
    const minDate = _.min([
        ...getDataForColumn(columns[2], dataArr),
        ...getDataForColumn(columns[3], dataArr),
    ]);

    return {
        dataSeries,
        maxDate,
        minDate,
    };
};

const renderChart = (ctx: any) => {
    const dataModel = getDataModel(ctx);

    console.log('dataModel:', dataModel);

    // THE CHART
    Highcharts.ganttChart('container', {
        title: {
            text: 'Gantt Chart with Progress Indicators',
            align: 'left',
        },
        tooltip: {
            enabled: false,
        },
        xAxis: {
            min: dataModel.minDate,
            max: dataModel.maxDate,
        },
        plotOptions: {
            series: {
                animation: false,
            },
        },
        accessibility: {
            point: {
                descriptionFormat:
                    '{yCategory}. ' +
                    '{#if completed}Task {(multiply completed.amount 100):.1f}% completed. {/if}' +
                    'Start {x:%Y-%m-%d}, end {x2:%Y-%m-%d}.',
            },
        },

        lang: {
            accessibility: {
                axis: {
                    xAxisDescriptionPlural:
                        'The chart has a two-part X axis showing time in both week numbers and days.',
                },
            },
        },

        series: dataModel.dataSeries,
    } as any);
    return Promise.resolve();
};

const init = async () => {
    const ctx = await getChartContext({
        getDefaultChartConfig: (chartModel: ChartModel): ChartConfig[] => {
            const columns = chartModel.columns;

            // Here we assume that the columns are always coming in the
            // following order.
            // [Project Name, Task, Start Date, End Date, Completion]

            // TBD: do basic validation here to ensure that the chart is
            // renderable
            if (columns.length < 4) {
                // not possible to plot a chart
                return [];
            }

            const chartConfig: ChartConfig = {
                key: 'default',
                dimensions: [
                    {
                        key: 'project-name',
                        columns: [columns[0]],
                    },
                    {
                        key: 'task',
                        columns: [columns[1]],
                    },
                    {
                        key: 'start-date',
                        columns: [columns[2]],
                    },
                    {
                        key: 'end-date',
                        columns: [columns[3]],
                    },
                    {
                        key: 'completion',
                        columns: columns[4] ? [columns[4]] : [],
                    },
                ],
            };
            return [chartConfig];
        },
        getQueriesFromChartConfig: (
            chartConfig: ChartConfig[],
        ): Array<Query> => {
            // map all the columns in the config to the query array
            return chartConfig.map(
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
        },
        renderChart: (context) => renderChart(context),
    });
    await renderChart(ctx);
};

init();
