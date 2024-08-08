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

import 'highcharts/modules/solid-gauge';
import Highcharts, { Chart } from 'highcharts';
import highchartsMore from 'highcharts/highcharts-more';

import _ from 'lodash';

highchartsMore(Highcharts);

let globalChartReference: Chart;

const DEFAULT_COLOR = '#2E75F0';

interface VizPropModel {
    bands?: Array<{
        start?: number;
        end?: number;
        color?: string;
    }>;
    min?: number;
    max?: number;
    target?: number;
    'dial-color'?: string;
    'target-color'?: string;
}

const BAND_THICKNESS = '20%';

const numberFormatter = (value: number): string => {
    if (value > 1000 * 1000 * 1000 * 1000) {
        return `${(value / 1000000000000).toFixed(2)}T`;
    }
    if (value > 1000 * 1000 * 1000) {
        return `${(value / 1000000000).toFixed(2)}B`;
    }
    if (value > 1000 * 1000) {
        return `${(value / 1000000).toFixed(2)}M`;
    }
    if (value > 1000) {
        return `${(value / 1000).toFixed(2)}K`;
    }
    return `${value.toFixed(2)}`;
};

const getColumnIdListByKey = (
    chartConfig: ChartConfig,
    key: string,
): string[] => {
    const dimension = _.find(chartConfig.dimensions, (dim) => dim.key === key);
    if (dimension) {
        return dimension.columns.map((col) => col.id);
    }
    return [];
};

const getDataModel = (chartModel: ChartModel) => {
    const chartConfig = chartModel.config?.chartConfig?.[0] ?? ({} as any);
    const columnsList = chartModel.data?.[0].data.columns;
    const dataValue = chartModel.data?.[0].data.dataValue;

    const dataMap = _.reduce(
        dataValue,
        (acc: any, dataArr: any) => {
            const point = _.reduce(
                columnsList,
                (acc: any, col: any, idx: number) => {
                    acc[col] = dataArr[idx];
                    return acc;
                },
                {},
            );
            acc.push(point);
            return acc;
        },
        [],
    );
    const value = dataMap[0][getColumnIdListByKey(chartConfig, 'value')[0]];
    const minValue =
        dataMap[0][getColumnIdListByKey(chartConfig, 'min-value')[0]];
    const maxValue =
        dataMap[0][getColumnIdListByKey(chartConfig, 'max-value')[0]];
    const targetValue =
        dataMap[0][getColumnIdListByKey(chartConfig, 'target-value')[0]];
    const columnName = chartModel.columns.find(
        (col) => col.id === getColumnIdListByKey(chartConfig, 'value')[0],
    )?.name;
    return {
        dataPoint: dataMap[0],
        value,
        minValue,
        maxValue,
        targetValue,
        columnName,
    };
};

const getMinValue = (dataModel: any, chartModel: ChartModel) => {
    if (dataModel.minValue) {
        return dataModel.value < dataModel.minValue
            ? dataModel.value
            : dataModel.minValue;
    }
    const vizProps = chartModel.visualProps as VizPropModel;
    if (!_.isNil(vizProps.min)) {
        return dataModel.value < vizProps.min ? dataModel.value : vizProps.min;
    }
    return dataModel.value < 0 ? dataModel.value * 1.3 : 0; // default 30% less than the data value
};

const getMaxValue = (dataModel: any, chartModel: ChartModel) => {
    if (dataModel.maxValue) {
        return dataModel.value > dataModel.maxValue
            ? dataModel.value
            : dataModel.maxValue;
    }
    const vizProps = chartModel.visualProps as VizPropModel;
    if (!_.isNil(vizProps?.max)) {
        return dataModel.value > vizProps.max ? dataModel.value : vizProps.max;
    }
    return dataModel.value > 0 ? dataModel.value * 1.3 : 0; // default 30% more than the data value
};

const getTargetValue = (dataModel: any, chartModel: ChartModel) => {
    if (dataModel.targetValue) {
        return dataModel.targetValue;
    }
    const vizProps = chartModel.visualProps as VizPropModel;
    if (!_.isNil(vizProps?.target)) {
        return vizProps.target;
    }
    return null;
};

const render = (ctx: CustomChartContext) => {
    const chartModel = ctx.getChartModel();
    const appConfig = ctx.getAppConfig();
    const isPrintMode = appConfig.appOptions?.isPrintMode;
    const vizProps = chartModel.visualProps as VizPropModel;
    const dataModel = getDataModel(chartModel);

    let minValue = getMinValue(dataModel, chartModel);
    let maxValue = getMaxValue(dataModel, chartModel);
    const targetValue = getTargetValue(dataModel, chartModel);
    if (!!targetValue && maxValue < targetValue) {
        maxValue = targetValue;
    }
    if (!!targetValue && minValue > targetValue) {
        minValue = targetValue;
    }

    const gaugeColor =
        ((vizProps as any)['gauge-color'] as string) ?? DEFAULT_COLOR;

    const plotBands = _.map(vizProps?.bands ?? [], (band) => ({
        from: band.start,
        to: band.end,
        color: band.color ?? DEFAULT_COLOR,
        thickness: BAND_THICKNESS,
    }));

    Highcharts.chart('container', {
        chart: {
            type: 'gauge',
        },

        title: {
            text: '',
        },

        pane: {
            startAngle: -90,
            endAngle: 90,
            background: null,
            center: ['50%', '75%'],
            size: '90%',
        },

        // the value axis
        yAxis: {
            min: minValue,
            max: maxValue,
            tickPixelInterval: 72,
            tickPosition: 'outside',
            tickColor: '#000000',
            tickLength: 5,
            tickWidth: 0,
            minorTickInterval: null,
            labels: {
                distance: 30,
                style: {
                    fontSize: '14px',
                },
                formatter(): string {
                    return numberFormatter((this as any).value);
                },
            },
            lineWidth: 0,
            plotBands: [
                {
                    from: minValue,
                    to: maxValue,
                    color: gaugeColor ?? DEFAULT_COLOR,
                    thickness: BAND_THICKNESS,
                },
                ...(plotBands ?? []),
            ],
        },
        series: _.compact([
            {
                name: dataModel.columnName,
                data: [dataModel.value],
                tooltip: {
                    valueSuffix: '',
                    hideDelay: 100,
                    showDelay: 0,
                    followPointer: true,
                    pointFormatter(): string {
                        const self = this as any;
                        return `${
                            self.series.name
                        }: <b>${self.y.toLocaleString()}</b><br/>`;
                    },
                },
                animation: !isPrintMode,
                dataLabels: {
                    formatter(_options: any): string {
                        return `${
                            (this as any).point.series.name
                        }: ${numberFormatter((this as any).y)}`;
                    },
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
                    backgroundColor: vizProps['dial-color'] ?? DEFAULT_COLOR,
                    baseWidth: 12,
                    baseLength: '0%',
                    rearLength: '0%',
                },
                pivot: {
                    borderColor: vizProps['dial-color'] ?? DEFAULT_COLOR,
                    radius: 6,
                },
            },
            targetValue
                ? {
                      data: [targetValue],
                      name: 'Target',
                      type: 'gauge',
                      dataLabels: {
                          format: 'Target: {y}',
                      },
                      animation: !isPrintMode,
                      tooltip: {
                          enabled: true,
                          hideDelay: 100,
                          showDelay: 0,
                          followPointer: true,
                          pointFormatter(): string {
                              const self = this as any;
                              return `${
                                  self.series.name
                              }: <b>${self.y.toLocaleString()}</b><br/>`;
                          },
                      },
                      dial: {
                          baseLength: '100%',
                          backgroundColor:
                              vizProps['target-color'] ?? DEFAULT_COLOR,
                          radius: '105%',
                          rearLength: '-70%',
                      },
                  }
                : null,
        ]),
    } as any);
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

            const measureColumns = _.filter(
                cols,
                (col) => col.type === ColumnType.MEASURE,
            );

            if (measureColumns.length < 0) {
                // not possible to plot a chart
                return [];
            }

            const axisConfig: ChartConfig = {
                key: 'gauge',
                dimensions: [
                    {
                        key: 'value',
                        columns: measureColumns.slice(0, 1),
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
        renderChart: (context: CustomChartContext) => renderChart(context),
        chartConfigEditorDefinition: [
            {
                key: 'gauge',
                label: 'Gauge',
                columnSections: [
                    {
                        key: 'value',
                        label: 'Value',
                        allowAttributeColumns: false,
                        allowMeasureColumns: true,
                        allowTimeSeriesColumns: false,
                        maxColumnCount: 1,
                    },

                    {
                        key: 'min-value',
                        label: 'Minimum value (optional)',
                        allowAttributeColumns: false,
                        allowMeasureColumns: true,
                        allowTimeSeriesColumns: false,
                        maxColumnCount: 1,
                    },

                    {
                        key: 'max-value',
                        label: 'Maximum value (optional)',
                        allowAttributeColumns: false,
                        allowMeasureColumns: true,
                        allowTimeSeriesColumns: false,
                        maxColumnCount: 1,
                    },

                    {
                        key: 'target-value',
                        label: 'Target value (optional)',
                        allowAttributeColumns: false,
                        allowMeasureColumns: true,
                        allowTimeSeriesColumns: false,
                        maxColumnCount: 1,
                    },
                ],
            },
        ],
        visualPropEditorDefinition: {
            elements: [
                {
                    key: 'bands',
                    type: 'section',
                    label: 'Plot bands (optional)',
                    children: [
                        {
                            type: 'section',
                            key: 'band1',
                            label: 'Band 1',
                            children: [
                                {
                                    key: 'color',
                                    type: 'colorpicker',
                                    label: 'Color',
                                },
                                {
                                    key: 'start',
                                    type: 'number',
                                    label: 'Start value',
                                },
                                {
                                    key: 'end',
                                    type: 'number',
                                    label: 'End value',
                                },
                            ],
                        },
                        {
                            type: 'section',
                            key: 'band2',
                            label: 'Band 2',
                            children: [
                                {
                                    key: 'color',
                                    type: 'colorpicker',
                                    label: 'Color',
                                },
                                {
                                    key: 'start',
                                    type: 'number',
                                    label: 'Start value',
                                },
                                {
                                    key: 'end',
                                    type: 'number',
                                    label: 'End value',
                                },
                            ],
                        },
                        {
                            type: 'section',
                            label: 'Band 3',
                            key: 'band3',
                            children: [
                                {
                                    key: 'color',
                                    type: 'colorpicker',
                                    label: 'Color',
                                },
                                {
                                    key: 'start',
                                    type: 'number',
                                    label: 'Start value',
                                },
                                {
                                    key: 'end',
                                    type: 'number',
                                    label: 'End value',
                                },
                            ],
                        },
                    ],
                },
                {
                    key: 'min',
                    type: 'number',
                    label: 'Minimum value',
                },
                {
                    key: 'max',
                    type: 'number',
                    label: 'Maximum value',
                },
                {
                    key: 'target',
                    type: 'number',
                    label: 'Target value',
                },
                {
                    key: 'gauge-color',
                    label: 'Gauge color',
                    type: 'colorpicker',
                    defaultValue: DEFAULT_COLOR,
                },
                {
                    key: 'dial-color',
                    label: 'Dial color',
                    type: 'colorpicker',
                    defaultValue: DEFAULT_COLOR,
                },
                {
                    key: 'target-color',
                    label: 'Target color',
                    type: 'colorpicker',
                    defaultValue: DEFAULT_COLOR,
                },
            ],
        },
        validateConfig: (
            updatedConfig: ChartConfig[],
            _chartModel: ChartModel,
        ) => {
            if (updatedConfig.length === 0) {
                return {
                    isValid: false,
                    error: 'Please select at least one measure',
                };
            }
            const chartConfig = updatedConfig[0];
            const valueColumns = getColumnIdListByKey(chartConfig, 'value');
            if (valueColumns.length === 0) {
                return {
                    isValid: false,
                    error: 'Please select at least one measure',
                };
            }
            return {
                isValid: true,
            };
        },
    });
    await renderChart(ctx);
};

init();
