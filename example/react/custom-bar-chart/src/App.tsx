import {
    ChartConfig,
    ChartModel,
    ColumnType,
    CustomChartContextProps,
    Query,
    useChartContext,
} from '@thoughtspot/ts-chart-sdk';
import _ from 'lodash';
import React, { useEffect, useRef } from 'react';
import { RenderChart } from './line-chart.component';

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
    visualPropEditorDefinition: {
        elements: [
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
                        key: 'Color2',
                        type: 'radio',
                        defaultValue: 'blue',
                        values: ['blue', 'black', 'red'],
                        label: 'Color2',
                    },
                    {
                        key: 'datalabels',
                        type: 'toggle',
                        defaultValue: false,
                        label: 'Data Labels',
                    },
                ],
            },
        ],
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
        console.log(chartModel?.visualProps);
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
                />
            </TSChartContext>
        </div>
    );
};

export default App;
