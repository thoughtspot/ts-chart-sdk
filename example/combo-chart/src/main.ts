/* eslint-disable no-restricted-syntax */
/**
 * @file Combo Chart Implementation from chart.js library
 *
 * @fileoverview
 *
 * @author Rohit Singh <rohit.singh@thoughtspot.com>
 *
 * Copyright: ThoughtSpot Inc. 2023
 */

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
    ValidationResponse,
    VisualProps,
} from '@thoughtspot/ts-chart-sdk';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import _, { find } from 'lodash';
import { htmlLegendPlugin } from './legend-plugin';

const logger = console;

Chart.register(ChartDataLabels);

let globalChartReference: Chart;

const visualPropKeyMap = ['datalabels', 'hideLegend'];

const availableColors = [
    '#FF0000',
    '#00FF00',
    '#0000FF',
    '#FFFF00',
    '#FF00FF',
    '#00FFFF',
    '#FF4500',
    '#8A2BE2',
    '#32CD32',
    '#1E90FF',
    '#FFD700',
    '#9932CC',
    '#8B0000',
    '#228B22',
    '#008080',
    '#FF6347',
    '#40E0D0',
    '#800080',
    '#2E8B57',
    '#FF8C00',
    '#8B4513',
    '#008B8B',
    '#FF69B4',
    '#7CFC00',
    '#4169E1',
    '#FF1493',
    '#ADFF2F',
    '#800000',
    '#20B2AA',
    '#F08080',
];

const COMBO_CHART_TYPE = {
    bar: 'bar',
    line: 'line',
    stack: 'bar-stack',
    scatter: 'scatter',
};

function getDataForColumn(column: ChartColumn, dataArr: DataPointsArray) {
    const idx = _.findIndex(dataArr.columns, colId => column.id === colId);
    return _.uniq(_.map(dataArr.dataValue, row => row[idx]));
}

function getSeriesDataForColumn(column: ChartColumn, dataArr: DataPointsArray) {
    const idx = _.findIndex(dataArr.columns, colId => column.id === colId);
    return _.uniq(_.map(dataArr.dataValue, row => row[idx]));
}

function getDataForColumnForSeries(
    column: ChartColumn,
    dataArr: DataPointsArray,
    col: any,
) {
    const idx = _.findIndex(dataArr.columns, colId => column.id === colId);
    return dataArr.dataValue
        .filter(item => item[2] === col)
        .map(row => row[idx]);
}

function getChartDataModel(
    configDimensions,
    dataArr: DataPointsArray,
    inputType,
) {
    const xAxisColumns = configDimensions?.[0].columns ?? [];
    const yAxisColumns = configDimensions?.[1].columns ?? [];
    const legend = configDimensions?.[2]?.columns[0] ?? [];
    const type = inputType.split('-')[0];
    const isStacked = inputType.split('-').length > 1;

    return {
        getLabels: () => getDataForColumn(xAxisColumns[0], dataArr),
        getDatasets: () => {
            if (!_.isEmpty(legend)) {
                return _.map(
                    getSeriesDataForColumn(legend, dataArr),
                    (col, idx) => {
                        return {
                            label: `${col}- ${inputType}`,
                            data: getDataForColumnForSeries(
                                yAxisColumns[0],
                                dataArr,
                                col,
                            ),
                            type: `${type}`,
                            // yAxisID: `${type}-y${idx.toString()}`,
                            stack: `${type}-x0${
                                isStacked ? '-stacked' : `y${idx.toString()}`
                            }`,
                            yPos: idx,
                            backgroundColor: '',
                            borderColor: '',
                            datalabels: {
                                anchor: 'end',
                            },
                        };
                    },
                );
            }
            return _.map(yAxisColumns, (col, idx) => {
                return {
                    label: `${col.name}- ${inputType}`,
                    data: getDataForColumn(col, dataArr),
                    // yAxisID: `${type}-y${idx.toString()}`,
                    stack: `${type}-x0${
                        isStacked ? '-stacked' : `y${idx.toString()}`
                    }`,
                    type: `${type}`,
                    backgroundColor: '',
                    borderColor: '',
                    yPos: idx,
                    datalabels: {
                        anchor: 'end',
                    },
                };
            });
        },

        getPointDetails: (xPos: number, yPos: number): PointVal[] => {
            console.log(type);
            if (!_.isEmpty(legend)) {
                return [
                    {
                        columnId: legend.id,
                        value: getDataForColumn(legend, dataArr)[yPos],
                    },
                    {
                        columnId: xAxisColumns[0].id,
                        value: getDataForColumn(xAxisColumns[0], dataArr)[xPos],
                    },
                    {
                        columnId: yAxisColumns[0].id,
                        value: getDataForColumn(yAxisColumns[0], dataArr)[xPos],
                    },
                ];
            }
            return [
                {
                    columnId: xAxisColumns[0].id,
                    value: getDataForColumn(xAxisColumns[0], dataArr)[xPos],
                },
                {
                    columnId: yAxisColumns[yPos].id,
                    value: getDataForColumn(yAxisColumns[yPos], dataArr)[xPos],
                },
            ];
        },
    };
}

function getDataModel(chartModel: ChartModel) {
    const xColumnDimension = chartModel.config?.chartConfig?.[0].dimensions.filter(
        dim => dim.key === 'x',
    )[0];
    // column chart model
    const columnChartModel = getChartDataModel(
        chartModel.config?.chartConfig?.[0].dimensions ?? [],
        chartModel.data?.[0].data ?? ([] as any),
        COMBO_CHART_TYPE.bar,
    );

    // line chart model
    const lineChartModel = getChartDataModel(
        [xColumnDimension, ...chartModel.config?.chartConfig?.[1].dimensions] ??
            [],
        chartModel.data?.[1].data ?? ([] as any),
        COMBO_CHART_TYPE.line,
    );

    // stacked chart model
    const stackedChartModel = getChartDataModel(
        [xColumnDimension, ...chartModel.config?.chartConfig?.[2].dimensions] ??
            [],
        chartModel.data?.[2].data ?? ([] as any),
        COMBO_CHART_TYPE.stack,
    );

    // scatter chart model
    const scatterChartModel = getChartDataModel(
        [xColumnDimension, ...chartModel.config?.chartConfig?.[3].dimensions] ??
            [],
        chartModel.data?.[3].data ?? ([] as any),
        COMBO_CHART_TYPE.scatter,
    );

    return {
        getLabels: columnChartModel.getLabels,
        getDatasets: () => {
            const dataSets = [
                ...columnChartModel.getDatasets(),
                ...lineChartModel.getDatasets(),
                ...stackedChartModel.getDatasets(),
                ...scatterChartModel.getDatasets(),
            ];
            dataSets.forEach((set, index) => {
                set.backgroundColor = availableColors[index % 30];
                set.borderColor = availableColors[index % 30];
            });
            return dataSets;
        },
        getPointDetails: (x, y, chartType?: any) => {
            if (chartType === COMBO_CHART_TYPE.bar) {
                return columnChartModel.getPointDetails(x, y);
            }
            if (chartType === COMBO_CHART_TYPE.line) {
                return lineChartModel.getPointDetails(x, y);
            }
            if (chartType === COMBO_CHART_TYPE.stack) {
                return stackedChartModel.getPointDetails(x, y);
            }
            if (chartType === COMBO_CHART_TYPE.scatter) {
                return scatterChartModel.getPointDetails(x, y);
            }
        },
    };
}

function getParsedEvent(evt: any) {
    return _.pick(evt.native, ['clientX', 'clientY']);
}

function render(ctx: CustomChartContext) {
    const chartModel = ctx.getChartModel();
    const dataModel = getDataModel(chartModel);
    const allowLabels = _.get(
        chartModel.visualProps,
        visualPropKeyMap[0],
        false,
    );
    const allowLegends = _.get(
        chartModel.visualProps,
        visualPropKeyMap[1],
        true,
    );
    if (!dataModel) {
        return;
    }

    try {
        const canvas = document.getElementById('chart') as any;
        const legend = document.getElementById('legend');
        const chartWrapper = document.getElementById('chartWrapper');
        if (allowLegends) {
            legend.style.display = 'unset';
            chartWrapper.style.width = '85%';
        } else {
            legend.style.display = 'none';
            chartWrapper.style.width = '100%';
        }
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
                plugins: {
                    // Change options for ALL labels of THIS CHART
                    datalabels: {
                        display: allowLabels ? 'auto' : false,
                        color: 'blue',
                        textStrokeColor: 'white',
                        textStrokeWidth: 5,
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
                    legend: {
                        display: false,
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
                    if (!activeElement) {
                        ctx.emitEvent(ChartToTSEvent.CloseContextMenu);
                        return;
                    }
                    const dataX = activeElement?.index;
                    let {
                        type: chartType,
                        stack,
                        yPos,
                    } = activeElement?.element.$datalabels[0].$context.dataset;
                    const dataY = yPos;
                    if (stack.includes('stack')) {
                        chartType = 'bar-stack';
                    }
                    logger.info(
                        'ChartPoint',
                        dataX,
                        dataY,
                        dataModel.getPointDetails(dataX, dataY),
                    );
                    ctx.emitEvent(ChartToTSEvent.OpenContextMenu, {
                        event: getParsedEvent(e),
                        clickedPoint: {
                            tuple: dataModel.getPointDetails(
                                dataX,
                                dataY,
                                chartType,
                            ),
                        },
                    });
                },
            },

            plugins: [htmlLegendPlugin],
        });
    } catch (e) {
        logger.error('renderfailed', e);
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
    // populate it for multiple configs, need to populate common x-axis config
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

            const axisConfig: ChartConfig[] = [
                {
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
                },
                {
                    key: 'line',
                    dimensions: [
                        {
                            key: 'y',
                            columns: measureColumns.slice(0, 2),
                        },
                    ],
                },
                {
                    key: 'stacked-column',
                    dimensions: [
                        {
                            key: 'y',
                            columns: measureColumns.slice(0, 2),
                        },
                    ],
                },
                {
                    key: 'scatter',
                    dimensions: [
                        {
                            key: 'y',
                            columns: measureColumns.slice(0, 2),
                        },
                    ],
                },
            ];
            return axisConfig;
        },
        getQueriesFromChartConfig: (
            chartConfig: ChartConfig[],
        ): Array<Query> => {
            const xAxisColumn = chartConfig[0].dimensions.filter(
                col => col.key === 'x',
            )[0].columns;
            const queries = chartConfig.map(
                (config: ChartConfig): Query =>
                    _.reduce(
                        config.dimensions,
                        (acc: Query, dimension) => {
                            // we want to avoid adding x axis columns multiple
                            // times.
                            if (dimension.key === 'x') {
                                return acc;
                            }
                            return {
                                queryColumns: [
                                    ...acc.queryColumns,
                                    ...dimension.columns,
                                ],
                            };
                        },
                        {
                            queryColumns: [xAxisColumn[0]],
                        } as Query,
                    ),
            );
            return queries;
        },
        renderChart: ctx => renderChart(ctx),
        chartConfigEditorDefinition: [
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
                    {
                        key: 'legend',
                        label: 'Slice with color',
                        allowAttributeColumns: true,
                        allowMeasureColumns: false,
                        allowTimeSeriesColumns: false,
                    },
                ],
            },
            {
                key: 'line',
                label: 'Custom Line',
                descriptionText:
                    'X Axis can only have attributes, Y Axis can only have measures, Color can only have attributes. ' +
                    'Should have just 1 column in Y axis with colors columns.',
                columnSections: [
                    {
                        key: 'y',
                        label: 'Custom Y Axis',
                        allowAttributeColumns: false,
                        allowMeasureColumns: true,
                        allowTimeSeriesColumns: false,
                    },
                    {
                        key: 'legend',
                        label: 'Slice with color',
                        allowAttributeColumns: true,
                        allowMeasureColumns: false,
                        allowTimeSeriesColumns: false,
                    },
                ],
            },
            {
                key: 'stacked-column',
                label: 'Custom Stacked Column',
                descriptionText:
                    'X Axis can only have attributes, Y Axis can only have measures, Color can only have attributes. ' +
                    'Should have just 1 column in Y axis with colors columns.',
                columnSections: [
                    {
                        key: 'y',
                        label: 'Custom Y Axis',
                        allowAttributeColumns: false,
                        allowMeasureColumns: true,
                        allowTimeSeriesColumns: false,
                    },
                    {
                        key: 'legend',
                        label: 'Slice with color',
                        allowAttributeColumns: true,
                        allowMeasureColumns: false,
                        allowTimeSeriesColumns: false,
                    },
                ],
            },
            {
                key: 'scatter',
                label: 'Custom Scatter',
                descriptionText:
                    'X Axis can only have attributes, Y Axis can only have measures, Color can only have attributes. ' +
                    'Should have just 1 column in Y axis with colors columns.',
                columnSections: [
                    {
                        key: 'y',
                        label: 'Custom Y Axis',
                        allowAttributeColumns: false,
                        allowMeasureColumns: true,
                        allowTimeSeriesColumns: false,
                    },
                    {
                        key: 'legend',
                        label: 'Slice with color',
                        allowAttributeColumns: true,
                        allowMeasureColumns: false,
                        allowTimeSeriesColumns: false,
                    },
                ],
            },
        ],
        visualPropEditorDefinition: {
            elements: [
                {
                    key: 'datalabels',
                    type: 'toggle',
                    defaultValue: false,
                    label: 'Data Labels',
                },
                {
                    key: 'hideLegend',
                    type: 'toggle',
                    defaultValue: true,
                    label: 'Legends',
                },
            ],
        },
        validateConfig: (updatedConfig, chartModel): ValidationResponse => {
            if (updatedConfig.length <= 0) {
                return {
                    isValid: false,
                    validationErrorMessage: ['invalid config. no config found'],
                };
            }
            // assuming 0 is x dimension
            const xAxisDimensions = updatedConfig[0];
            const yAxisDimensions = updatedConfig
                .map(config => ({
                    type: config.key,
                    dimensions: config.dimensions,
                }))
                .map(item => {
                    const filteredColumns = item.dimensions.filter(
                        column => column.key === 'y',
                    );
                    return { axis: filteredColumns[0], type: item.type };
                });

            const legendValidation = () => {
                const res = {
                    isValid: true,
                    errorMessage: undefined,
                };

                for (const chart of updatedConfig) {
                    const legend = chart.dimensions.find(
                        dim => dim.key === 'legend',
                    );

                    if (legend && legend.columns.length > 0) {
                        // Check if "y" axis column is not empty
                        const yDimension = chart.dimensions.find(
                            dim => dim.key === 'y',
                        );

                        if (yDimension) {
                            if (yDimension.columns.length === 0) {
                                res.isValid = false;
                                res.errorMessage = `Invalid config. Y axis column should not be empty for ${chart.key} chart while slicing with an attribute`;
                                return res;
                            }
                            if (yDimension.columns.length > 1) {
                                res.isValid = false;
                                res.errorMessage = `Invalid config. Y axis column should not be more than 1 for ${chart.key} chart while slicing with an attribute`;
                                return res;
                            }
                        }
                    }
                }
                return res;
            };

            const xAxisValidation = () => {
                if (xAxisDimensions.dimensions[0].columns.length === 0) {
                    return {
                        isValid: false,
                        errorMessage:
                            'Invalid config. X axis columns cannot be empty',
                    };
                }
                return {
                    isValid: true,
                };
            };

            const yAxisValidation = () => {
                if (
                    find(
                        yAxisDimensions,
                        axis => axis.axis.columns.length !== 0,
                    )
                ) {
                    return { isValid: true };
                }
                return {
                    isValid: false,
                    errorMessage:
                        'Invalid config. Y axis column cannot be empty (need one y-axis column for any of the chart type)',
                };
            };

            if (
                !xAxisValidation().isValid ||
                !yAxisValidation().isValid ||
                !legendValidation().isValid
            ) {
                return {
                    isValid: false,
                    validationErrorMessage: [
                        xAxisValidation().errorMessage ||
                            yAxisValidation().errorMessage ||
                            legendValidation().errorMessage,
                    ],
                };
            }
            return {
                isValid: true,
            };
        },
    });

    renderChart(ctx);
})();
