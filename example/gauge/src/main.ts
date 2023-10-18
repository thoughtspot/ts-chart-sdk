/* eslint-disable simple-import-sort/imports */
import {
    ChartConfig,
    ChartModel,
    Query,
    getChartContext,
    ChartToTSEvent,
    ColumnType,
    CustomChartContext,
} from '@thoughtspot/ts-chart-sdk';
import Highcharts, { Chart } from 'highcharts';
import highchartsMore from 'highcharts/highcharts-more';
import _ from 'lodash';

highchartsMore(Highcharts);

let globalChartReference: Chart;

const getDataModel = (chartModel: ChartModel) => {
    const dataValue = chartModel.data[0].data.dataValue[0];
    const columnName = chartModel.columns[0].name;
    return {
        dataValue,
        columnName,
    };
};

const render = (ctx: any) => {
    const chartModel = ctx.getChartModel();
    const dataModel = getDataModel(chartModel);
    const minRange = 0;
    // TODO: Considering max range to be 30% more than the data value, need to
    // change this logic
    const maxRange = dataModel.dataValue[0] * 1.3;
    const { min = minRange, max = maxRange } = chartModel?.visualProps;

    Highcharts.chart('container', {
        chart: {
            type: 'gauge',
            plotBackgroundColor: null,
            plotBackgroundImage: null,
            plotBorderWidth: 0,
            plotShadow: false,
            height: '20%',
        },

        title: {
            text: '',
        },

        pane: {
            startAngle: -90,
            endAngle: 90,
            background: null,
            center: ['50%', '75%'],
            size: '110%',
        },

        // the value axis
        yAxis: {
            min,
            max,
            tickPixelInterval: 72,
            tickPosition: 'inside',
            tickColor:
                Highcharts.defaultOptions.chart.backgroundColor || '#FFFFFF',
            tickLength: 20,
            tickWidth: 2,
            minorTickInterval: null,
            labels: {
                distance: 20,
                style: {
                    fontSize: '14px',
                },
            },
            lineWidth: 0,
            plotBands: [
                {
                    from: 0,
                    to: max,
                    color: '#55BF3B', // green
                    thickness: 20,
                },
            ],
        },

        series: [
            {
                name: dataModel.columnName,
                data: dataModel.dataValue,
                tooltip: {
                    valueSuffix: '',
                },
                dataLabels: {
                    format: `{y} ${dataModel.columnName}`,
                    borderWidth: 0,
                    color:
                        (Highcharts.defaultOptions.title &&
                            Highcharts.defaultOptions.title.style &&
                            Highcharts.defaultOptions.title.style.color) ||
                        '#333333',
                    style: {
                        fontSize: '16px',
                    },
                },
                dial: {
                    radius: '80%',
                    backgroundColor: 'gray',
                    baseWidth: 12,
                    baseLength: '0%',
                    rearLength: '0%',
                },
                pivot: {
                    backgroundColor: 'gray',
                    radius: 6,
                },
            },
        ],
    });
};

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

const init = async () => {
    const ctx = await getChartContext({
        getDefaultChartConfig: (chartModel: ChartModel): ChartConfig[] => {
            const cols = chartModel.columns;
            if (cols.length > 1) {
                // not possible to plot a chart
                return [];
            }

            const measureColumns = _.filter(
                cols,
                col => col.type === ColumnType.MEASURE,
            );

            const axisConfig: ChartConfig = {
                key: 'column',
                dimensions: [
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
        renderChart: context => renderChart(context),
        visualPropEditorDefinition: {
            elements: [
                {
                    key: 'min',
                    type: 'number',
                    defaultValue: 0,
                    label: 'Min',
                },
                {
                    key: 'max',
                    type: 'number',
                    defaultValue: 200,
                    label: 'Max',
                },
            ],
        },
    });
    await renderChart(ctx);
};

init();
