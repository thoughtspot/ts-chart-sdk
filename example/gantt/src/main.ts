/* eslint-disable simple-import-sort/imports */
import {
    ChartConfig,
    ChartModel,
    Query,
    getChartContext,
} from '@thoughtspot/ts-chart-sdk';
import Highcharts from 'highcharts/es-modules/masters/highcharts.src';
import 'highcharts/es-modules/masters/modules/gantt.src';
import _ from 'lodash';

const getDataModel = (chartModel: any) => {
    const dataArr = chartModel.data[0].data;

    // create point from data
    const points = dataArr[0].dataValue.map((_val: string, idx: number) => {
        return {
            id: `${dataArr[0].dataValue[idx]} ${dataArr[1].dataValue[idx]}`,
            parent: dataArr[0].dataValue[idx],
            name: dataArr[1].dataValue[idx],
            start: new Date(dataArr[2].dataValue[idx]).getTime(),
            end: new Date(dataArr[3].dataValue[idx]).getTime(),
            completed: {
                amount: dataArr[4].dataValue[idx],
            },
            dependency: `${dataArr[0].dataValue[idx]} ${dataArr[5].dataValue[idx]}`,
        };
    });

    // create projects from points & data
    const projects = _.uniq(dataArr[0].dataValue);
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
    const maxDate = _.max([...dataArr[2].dataValue, ...dataArr[3].dataValue]);
    const minDate = _.min([...dataArr[2].dataValue, ...dataArr[3].dataValue]);

    return {
        dataSeries,
        maxDate,
        minDate,
    };
};

const renderChart = (ctx: any) => {
    const chartModel = ctx.getChartModel();
    console.log('chartModel:', chartModel);
    console.log('data:', chartModel.data);

    const dataModel = getDataModel(chartModel);

    console.log('dataModel:', dataModel);

    // THE CHART
    Highcharts.ganttChart('container', {
        title: {
            text: 'Gantt Chart with Progress Indicators',
            align: 'left',
        },

        xAxis: {
            min: dataModel.minDate,
            max: dataModel.maxDate,
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

            // TBD: do basic validation here to ensure that the chart is renderable
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
};

init();
