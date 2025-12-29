import {
    AccordionVariant,
    AppConfig,
    ChartConfig,
    ChartModel,
    ColumnType,
    CustomChartContext,
    CustomChartContextProps,
    Query,
    SettingsElementType,
    useChartContext,
    VisualPropEditorDefinition,
} from '@thoughtspot/ts-chart-sdk';
import _ from 'lodash';
import React, { useEffect, useRef } from 'react';
import { wantToSeeV1ToV2Conversion } from './constants';
import { RenderChart } from './line-chart.component';
import {
    getAxisVizPropDefinition,
    getColumnOpacitySettingsDefinition,
    getDataLabelVizPropDefinition,
    getDisplayVizPropDefinition,
    getLegendVizPropDefinition,
    getTooltipVizPropDefinition,
} from './visual-prop-schemas-v2';

const logger = console;

/**
 * @type {CustomChartContextProps}
 * Represents the context chart props used in the application.
 */
const contextChartProps: Omit<CustomChartContextProps, 'renderChart'> = {
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
    getQueriesFromChartConfig: (chartConfig: ChartConfig[]): Array<Query> => {
        const queries = chartConfig.map(
            (config: ChartConfig): Query =>
                _.reduce(
                    config.dimensions,
                    (acc: Query, dimension) => ({
                        queryColumns: [
                            ...acc.queryColumns,
                            ...(dimension as any).columns,
                        ],
                    }),
                    {
                        queryColumns: [],
                    } as Query,
                ),
        );
        return queries;
    },
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
            ],
        },
    ],
    visualPropEditorDefinition: (
        currentState: ChartModel,
        ctx: CustomChartContext,
        activeColumnId?: string,
    ): VisualPropEditorDefinition => {
        // Extract appConfig from the context
        const appConfig = ctx.getAppConfig();
        // Extract chart settings v2 flag
        // to make this true/false pass isChartSettingsV2Enabled
        // in the query params.
        const isChartSettingsV2Enabled =
            appConfig?.initFlags?.isChartSettingsV2Enabled?.flagValue || false;

        /**
         * Function to get column name from chartConfig based on dimension key.
         * Returns the name of the first column in the specified dimension.
         *
         * @param dimensionKey - The key of the dimension ('x' for Custom X Axis, 'y' for Custom Y Axis)
         * @returns The column name or empty string if not found
         */
        const getColumnNameFromChartConfig = (dimensionKey: string): string => {
            const chartConfig = currentState.config?.chartConfig?.[0];
            if (!chartConfig) {
                return '';
            }
            const dimension = chartConfig.dimensions?.find(
                (dim) => dim.key === dimensionKey,
            );
            if (
                dimension &&
                'columns' in dimension &&
                dimension.columns &&
                dimension.columns.length > 0
            ) {
                return dimension.columns[0].name || '';
            }
            return '';
        };

        /**
         * Function to get Y axis columns (measure columns) from chartConfig.
         * Returns an array of columns from the Y axis dimension.
         *
         * @returns Array of column objects or empty array if not found
         */
        const getYAxisColumnsFromChartConfig = () => {
            const chartConfig = currentState.config?.chartConfig?.[0];
            if (!chartConfig) {
                return [];
            }
            const yDimension = chartConfig.dimensions?.find(
                (dim) => dim.key === 'y',
            );
            if (
                yDimension &&
                'columns' in yDimension &&
                yDimension.columns &&
                yDimension.columns.length > 0
            ) {
                return yDimension.columns;
            }
            return [];
        };

        // Return v1 schema if conversion flag is true or v2 is not enabled
        if (wantToSeeV1ToV2Conversion || !isChartSettingsV2Enabled) {
            // Get Y axis columns (measure columns) for column-level settings
            const yAxisColumns = getYAxisColumnsFromChartConfig();

            // Build column settings definition for each measure column
            const columnSettingsDefinition: {
                [columnId: string]: { elements: any[] };
            } = {};

            yAxisColumns.forEach((column) => {
                columnSettingsDefinition[column.id] = {
                    elements: [
                        {
                            key: 'opacity',
                            type: 'number',
                            defaultValue: 1,
                            label: 'Line Opacity',
                            inputValidation: {
                                range: '0-1',
                                rangeError: 'Opacity must be between 0 and 1',
                            },
                        },
                    ],
                };
            });

            return {
                elements: [
                    {
                        type: 'section',
                        key: 'displaySettings',
                        label: 'Display Settings',
                        children: [
                            {
                                key: 'color',
                                type: 'radio',
                                defaultValue: 'red',
                                values: ['red', 'green', 'yellow'],
                                label: 'Line Band Color',
                            },
                        ],
                    },
                    {
                        type: 'section',
                        key: 'dataLabels',
                        label: 'Data Labels',
                        children: [
                            {
                                key: 'datalabels',
                                type: 'toggle',
                                defaultValue: false,
                                label: 'Data Labels',
                            },
                        ],
                    },
                    {
                        type: 'section',
                        key: 'tooltip',
                        label: 'Tooltip',
                        children: [
                            {
                                key: 'showTooltip',
                                type: 'checkbox',
                                defaultValue: true,
                                label: 'Show Tooltip',
                            },
                        ],
                    },
                    {
                        type: 'section',
                        key: 'axisSettings',
                        label: 'Axis Settings',
                        children: [
                            {
                                type: 'text',
                                key: 'xAxisName',
                                label: 'X Axis Name',
                                defaultValue:
                                    getColumnNameFromChartConfig('x') || 'sdsd',
                            },
                            {
                                type: 'text',
                                key: 'yAxisName',
                                label: 'Y Axis Name',
                                defaultValue:
                                    getColumnNameFromChartConfig('y') || 'sdsd',
                            },
                        ],
                    },
                    {
                        type: 'section',
                        key: 'legendSettings',
                        label: 'Legend Settings',
                        children: [
                            {
                                type: 'dropdown',
                                key: 'legendPosition',
                                label: 'Legend Position',
                                defaultValue: 'top',
                                values: ['top', 'bottom', 'left', 'right'],
                            },
                        ],
                    },
                ],
                columnsVizPropDefinition: [
                    {
                        type: ColumnType.MEASURE,
                        columnSettingsDefinition,
                    },
                ],
            };
        }

        // Return v2 schema - convert v1 sections to v2 format
        // Get Y axis columns (measure columns) for column-level settings
        const yAxisColumns = getYAxisColumnsFromChartConfig();

        // Build column settings definition for each measure column (v2 format)
        const columnSettingsDefinitionV2: {
            [columnId: string]: { elements: any[] };
        } = {};

        yAxisColumns.forEach((column) => {
            columnSettingsDefinitionV2[column.id] = {
                elements: [getColumnOpacitySettingsDefinition()],
            };
        });

        return {
            // Display Settings: color radio button inside accordion
            displayVizPropDefinition: getDisplayVizPropDefinition(),
            // Data Labels: checkbox inside accordion
            dataLabelVizPropDefinition: getDataLabelVizPropDefinition(),
            // Tooltip: checkbox for showTooltip (inside accordion)
            tooltipVizPropDefinition: getTooltipVizPropDefinition(),
            // Axis Settings: text inputs inside accordion
            axisVizPropDefinition: getAxisVizPropDefinition(
                getColumnNameFromChartConfig,
            ),
            // Legend Settings: dropdown inside accordion
            legendVizPropDefinition: getLegendVizPropDefinition(),
            // Column level settings (v2 format)
            columnsVizPropDefinition: [
                {
                    type: ColumnType.MEASURE,
                    columnSettingsDefinition: columnSettingsDefinitionV2,
                },
            ],
        };
    },
};

/**
 * The main application component.
 * @function
 * @name App
 * @returns {React.FC} - The main application functional component.
 */
const App: React.FC = () => {
    const ref = useRef(null);

    const {
        appConfig,
        chartModel,
        TSChartContext,
        hasInitialized,
        emitOpenContextMenu,
        emitRenderStart,
        emitRenderError,
        emitRenderComplete,
        setOnVisualPropsUpdate,
        setOffVisualPropsUpdate,
        emitShowToolTip,
        emitHideToolTip,
    } = useChartContext(contextChartProps);

    useEffect(() => {
        logger.info(chartModel?.visualProps);
    }, [chartModel?.visualProps]);
    return (
        <div
            data-testid="line-chart"
            style={{ width: '99vw', height: '95vh', position: 'relative' }}
        >
            <TSChartContext>
                <RenderChart
                    chartRef={ref}
                    chartModel={chartModel}
                    hasInitialized={hasInitialized}
                    emitRenderStart={emitRenderStart}
                    emitRenderError={emitRenderError}
                    emitRenderComplete={emitRenderComplete}
                    emitOpenContextMenu={emitOpenContextMenu}
                    setOnVisualPropsUpdate={setOnVisualPropsUpdate}
                    setOffVisualPropsUpdate={setOffVisualPropsUpdate}
                    emitShowToolTip={emitShowToolTip}
                    emitHideToolTip={emitHideToolTip}
                    appConfig={appConfig}
                    wantToSeeV1ToV2Conversion={wantToSeeV1ToV2Conversion}
                />
            </TSChartContext>
        </div>
    );
};

export default App;
