import _ from 'lodash';
import { CustomChartContextProps } from '../../main/custom-chart-context';
import { ColumnType } from '../../types/answer-column.types';
import { ChartConfig, ChartModel } from '../../types/common.types';
import { Query } from '../../types/ts-to-chart-event.types';

export const contextChartProps: CustomChartContextProps = {
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
                        values: ['blue', 'white', 'red'],
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
    renderChart: (cx) => {
        return Promise.resolve();
    },
};
