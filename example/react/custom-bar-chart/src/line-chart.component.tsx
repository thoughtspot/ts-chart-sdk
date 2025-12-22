import {
    AppConfig,
    ChartColumn,
    ChartConfigDimension,
    ChartModel,
    DataPointsArray,
    OpenContextMenuEventPayload,
    PointVal,
    RenderErrorEventPayload,
    ShowToolTipEventPayload,
    VisualProps,
    VisualPropsUpdateEventPayload,
} from '@thoughtspot/ts-chart-sdk';
import {
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import _ from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
    getVisualPropColor,
    getVisualPropColumnOpacity,
    getVisualPropDataLabels,
    getVisualPropLegendPosition,
    getVisualPropShowTooltip,
    getVisualPropXAxisName,
    getVisualPropYAxisName,
} from './visual-prop-extractors';

const logger = console;

ChartJS.register(
    CategoryScale,
    ChartDataLabels,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
);

const numberFormatter = (value) => {
    if (value > 1000000000) {
        return `${(value / 1000000000).toFixed(2)}B`;
    }
    if (value > 1000000) {
        return `${(value / 1000000).toFixed(2)}M`;
    }
    if (value > 1000) {
        return `${(value / 1000).toFixed(2)}K`;
    }
    return value;
};

interface LineChartProps {
    chartModel: ChartModel;
    emitShowToolTip: (args_0: ShowToolTipEventPayload) => Promise<void>;
    emitHideToolTip: () => Promise<void>;
    emitOpenContextMenu: (args: OpenContextMenuEventPayload) => Promise<void>;
    setOffVisualPropsUpdate: () => Promise<void>;
    setOnVisualPropsUpdate: (
        args: (payload: VisualPropsUpdateEventPayload) => void,
    ) => Promise<void>;
    chartRef: React.ForwardedRef<any>;
    appConfig?: AppConfig;
    wantToSeeV1ToV2Conversion: boolean;
}

interface RenderChartProps {
    hasInitialized: boolean;
    chartModel: ChartModel | undefined;
    emitOpenContextMenu: (args: OpenContextMenuEventPayload) => Promise<void>;
    emitRenderStart: () => Promise<void>;
    emitRenderError: (args: RenderErrorEventPayload) => Promise<void>;
    emitRenderComplete: () => Promise<void>;
    setOffVisualPropsUpdate: () => Promise<void>;
    setOnVisualPropsUpdate: (
        args: (payload: VisualPropsUpdateEventPayload) => void,
    ) => Promise<void>;
    chartRef: React.MutableRefObject<null>;
    emitShowToolTip: (args_0: ShowToolTipEventPayload) => Promise<void>;
    emitHideToolTip: () => Promise<void>;
    appConfig?: AppConfig;
    wantToSeeV1ToV2Conversion: boolean;
}

/**
 * Returns the data for a specific column from the data array.
 * @param {ChartColumn} column - The column to retrieve data for.
 * @param {DataPointsArray} dataArr - The array of data points.
 * @returns {any[]} An array containing the data for the specified column.
 */
const getDataForColumn = (column: ChartColumn, dataArr: DataPointsArray) => {
    const idx = _.findIndex(dataArr.columns, (colId) => column.id === colId);
    return _.map(dataArr.dataValue, (row) => row[idx]);
};

/**
 * Array containing available colors for the chart.
 * @type {string[]}
 */
const availableColor = ['red', 'blue', 'green'];

/**
 * Converts a color string to rgba format with the specified opacity.
 * Supports named colors (red, blue, green, etc.) and hex/rgb formats.
 *
 * @param color - Color string (named color, hex, or rgb)
 * @param opacity - Opacity value between 0 and 1
 * @returns RGBA color string
 */
const colorToRgba = (color: string, opacity: number): string => {
    // Fallback: try to parse common named colors
    const colorMap: { [key: string]: string } = {
        red: `rgba(255, 0, 0, ${opacity})`,
        green: `rgba(0, 128, 0, ${opacity})`,
        blue: `rgba(0, 0, 255, ${opacity})`,
        yellow: `rgba(255, 255, 0, ${opacity})`,
        orange: `rgba(255, 165, 0, ${opacity})`,
        purple: `rgba(128, 0, 128, ${opacity})`,
        pink: `rgba(255, 192, 203, ${opacity})`,
        black: `rgba(0, 0, 0, ${opacity})`,
        white: `rgba(255, 255, 255, ${opacity})`,
    };

    const lowerColor = color.toLowerCase();
    if (colorMap[lowerColor]) {
        return colorMap[lowerColor];
    }

    // If hex color, convert to rgba
    if (color.startsWith('#')) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    // Default fallback
    return `rgba(0, 0, 0, ${opacity})`;
};

/**
 * Gets the data model for the chart's column.
 * @param {ChartConfigDimension[]} configDimensions - The configuration dimensions of the chart.
 * @param {DataPointsArray} dataArr - The array of data points.
 * @param {string} type - The type of the chart.
 * @param {VisualProps|undefined} visualProps - The visual properties of the chart.
 * @param {AppConfig|undefined} appConfig - The app configuration.
 * @param {boolean} wantToSeeV1ToV2Conversion - Flag to control v1/v2 schema visibility.
 * @returns {Object} An object containing various data model functions for the chart.
 */
const getColumnDataModel = (
    configDimensions: ChartConfigDimension[],
    dataArr: DataPointsArray,
    type: string,
    visualProps: VisualProps | undefined,
    appConfig: AppConfig | undefined,
    wantToSeeV1ToV2Conversion: boolean,
) => {
    // Extract chart settings v2 flag from appConfig
    const isChartSettingsV2Enabled =
        appConfig?.initFlags?.isChartSettingsV2Enabled?.flagValue || true;
    // this should be handled in a better way
    const xAxisDimension = configDimensions?.[0];
    const yAxisDimension = configDimensions?.[1];
    const xAxisColumns =
        xAxisDimension && 'columns' in xAxisDimension
            ? xAxisDimension.columns ?? []
            : [];
    const yAxisColumns =
        yAxisDimension && 'columns' in yAxisDimension
            ? yAxisDimension.columns ?? []
            : [];
    // Extract default axis names from column names
    const defaultXAxisName =
        xAxisColumns.length > 0 ? xAxisColumns[0].name : '';
    const defaultYAxisName =
        yAxisColumns.length > 0 ? yAxisColumns[0].name : '';

    // Extract visual props using helper functions based on v1/v2 schema
    const allowLabels = getVisualPropDataLabels(
        visualProps,
        isChartSettingsV2Enabled,
        wantToSeeV1ToV2Conversion,
        false,
    );
    const showTooltip = getVisualPropShowTooltip(
        visualProps,
        isChartSettingsV2Enabled,
        wantToSeeV1ToV2Conversion,
        true,
    );
    const xAxisName = getVisualPropXAxisName(
        visualProps,
        isChartSettingsV2Enabled,
        wantToSeeV1ToV2Conversion,
        defaultXAxisName,
    );
    const yAxisName = getVisualPropYAxisName(
        visualProps,
        isChartSettingsV2Enabled,
        wantToSeeV1ToV2Conversion,
        defaultYAxisName,
    );
    const legendPosition = getVisualPropLegendPosition(
        visualProps,
        isChartSettingsV2Enabled,
        wantToSeeV1ToV2Conversion,
        'top',
    );

    return {
        getAllowLabels: () => allowLabels,
        getShowTooltip: () => showTooltip,
        getXAxisName: () => xAxisName,
        getYAxisName: () => yAxisName,
        getLegendPosition: () => legendPosition,
        getLabels: () => getDataForColumn(xAxisColumns[0], dataArr),
        getDatasets: () =>
            _.map(yAxisColumns, (col, idx: number) => {
                // Extract base color using helper function
                const baseColor = getVisualPropColor(
                    visualProps,
                    isChartSettingsV2Enabled,
                    wantToSeeV1ToV2Conversion,
                    availableColor[idx],
                );

                // Extract opacity from column visual props using helper
                // function
                const columnOpacity = getVisualPropColumnOpacity(
                    visualProps,
                    col.id,
                    isChartSettingsV2Enabled,
                    wantToSeeV1ToV2Conversion,
                    1, // Default opacity is 1 (fully opaque)
                );
                console.log('columnOpacity', columnOpacity);

                // Convert color to rgba format with opacity applied
                const borderColorWithOpacity = colorToRgba(
                    baseColor,
                    columnOpacity,
                );
                const backgroundColorWithOpacity = colorToRgba(
                    baseColor,
                    columnOpacity * 0.2, // Lighter background for fill areas
                );
                console.log(
                    'backgroundColorWithOpacity',
                    backgroundColorWithOpacity,
                );

                return {
                    label: col.name,
                    data: getDataForColumn(col, dataArr),
                    yAxisID: `${type}-y${idx.toString()}`,
                    type: `${type}`,
                    backgroundColor: backgroundColorWithOpacity,
                    borderColor: borderColorWithOpacity,
                    datalabels: {
                        anchor: 'end',
                    },
                };
            }),
        getScales: () => {
            const scales: any = {
                // Configure x-axis with custom name
                x: {
                    title: {
                        display: true,
                        text: xAxisName || xAxisColumns[0]?.name || '',
                    },
                },
            };
            // Configure y-axes with custom name
            return _.reduce(
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
                            // Use custom y-axis name or fallback to column name
                            text: yAxisName || _val.name,
                        },
                    };
                    return obj;
                },
                scales,
            );
        },
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
};

/**
 * Parses the event to extract required properties.
 * @param {any} evt - The event object to parse.
 * @returns {Object} An object containing the parsed properties from the event.
 */
const getParsedEvent = (evt: any) => {
    return _.pick(evt.native, ['clientX', 'clientY']);
};

/**
 * Represents a line chart component.
 * @param {LineChartProps} props - The props for the LineChart component.
 * @returns {JSX.Element} A React component representing the line chart.
 */
export const LineChart = ({
    chartModel,
    chartRef,
    emitShowToolTip,
    emitHideToolTip,
    emitOpenContextMenu,
    setOnVisualPropsUpdate,
    setOffVisualPropsUpdate,
    appConfig,
    wantToSeeV1ToV2Conversion,
}: LineChartProps) => {
    // Log appConfig when it's available
    useEffect(() => {
        if (appConfig) {
            logger.log('AppConfig in LineChart:', appConfig);
        }
    }, [appConfig]);
    const [visualProp, setVisualProp] = useState(chartModel?.visualProps);
    const dataModel = useMemo(() => {
        const columnChartModel = getColumnDataModel(
            chartModel.config?.chartConfig?.[0].dimensions ?? [],
            chartModel.data?.[0].data as DataPointsArray,
            'line',
            visualProp,
            appConfig,
            wantToSeeV1ToV2Conversion,
        );

        return columnChartModel;
    }, [
        chartModel.config,
        chartModel.data,
        visualProp,
        appConfig,
        wantToSeeV1ToV2Conversion,
    ]);

    useEffect(() => {
        setOnVisualPropsUpdate(({ visualProps }) => {
            setVisualProp(visualProps);
            return {
                triggerRenderChart: true,
            };
        });
    }, []);

    const handleMouseOver = useCallback(
        (e: any) => {
            if (!e.chart) {
                return;
            }
            const elements = e.chart.getActiveElements();
            if (elements.length > 0) {
                const activeElement = elements[0];
                const dataX = activeElement?.index;
                const dataY = activeElement?.datasetIndex;
                if (!_.isNil(dataX) && !_.isNil(dataY)) {
                    // Only show tooltip if the setting is enabled
                    if (dataModel.getShowTooltip()) {
                        const point = dataModel.getPointDetails(dataX, dataY);
                        emitShowToolTip({
                            event: getParsedEvent(e),
                            point: {
                                tuple: point,
                            },
                            customTooltipContent: [],
                        });
                    }
                }
            } else {
                emitHideToolTip();
            }
        },
        [dataModel],
    );
    const onHoverLegend = useCallback(
        (e, item, legend) => {
            // Only show tooltip if the setting is enabled
            if (dataModel.getShowTooltip()) {
                emitShowToolTip({
                    event: getParsedEvent(e),
                    customTooltipContent: [
                        `<div><h3><a href="http://google.com">google</a>${item.text}</h3></div>`,
                    ],
                });
            }
        },
        [dataModel],
    );
    return (
        <Line
            data={{
                labels: dataModel.getLabels(),
                datasets: dataModel.getDatasets() as any,
            }}
            ref={chartRef}
            options={{
                animation: {
                    duration: 0,
                },
                scales: dataModel.getScales(),
                plugins: {
                    tooltip: {
                        enabled: false,
                    },
                    legend: {
                        position: dataModel.getLegendPosition() as
                            | 'top'
                            | 'bottom'
                            | 'left'
                            | 'right',
                        onHover: onHoverLegend,
                        onLeave: () => {
                            emitHideToolTip();
                        },
                    },
                    // Change options for ALL labels of THIS CHART
                    datalabels: {
                        display: dataModel.getAllowLabels() ? 'auto' : false,
                        formatter: (value) => numberFormatter(value),
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
                },
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'point',
                    intersect: true,
                },
                onClick: (e: any) => {
                    const activeElement = e.chart.getActiveElements()[0];
                    const dataX = activeElement?.index;
                    const dataY = activeElement.datasetIndex;

                    logger.info(
                        'ChartPoint',
                        dataX,
                        dataY,
                        dataModel.getPointDetails(dataX, dataY),
                    );
                    emitOpenContextMenu({
                        event: getParsedEvent(e),
                        clickedPoint: {
                            tuple: dataModel.getPointDetails(dataX, dataY),
                        },
                    });
                },
                onHover: (event) => {
                    if (event.type === 'mousemove') {
                        handleMouseOver(event);
                    }
                    if (event.type === 'mouseout') {
                        emitHideToolTip();
                    }
                },
            }}
            onMouseOut={emitHideToolTip}
        />
    );
};

/**
 * Represents a chart renderer component.
 * @param {RenderChartProps} props - The props for the RenderChart component.
 * @returns {JSX.Element} A React component for rendering the chart.
 */
export const RenderChart = ({
    chartRef,
    hasInitialized,
    chartModel,
    emitRenderStart,
    emitRenderError,
    emitRenderComplete,
    emitOpenContextMenu,
    emitShowToolTip,
    emitHideToolTip,
    setOffVisualPropsUpdate,
    setOnVisualPropsUpdate,
    appConfig,
    wantToSeeV1ToV2Conversion,
}: RenderChartProps) => {
    useEffect(() => {
        if (hasInitialized) {
            // TODO Use afterrender from chart.js
            emitRenderStart();
        }
    }, [hasInitialized]);

    useEffect(() => {
        if (chartRef?.current) {
            emitRenderComplete();
        }
    }, [chartRef?.current]);

    if (!hasInitialized || !chartModel) {
        return <div>Loading...</div>;
    }

    // add an error boundry to trigger render error
    return (
        <LineChart
            chartModel={chartModel}
            chartRef={chartRef}
            emitOpenContextMenu={emitOpenContextMenu}
            setOffVisualPropsUpdate={setOffVisualPropsUpdate}
            setOnVisualPropsUpdate={setOnVisualPropsUpdate}
            emitShowToolTip={emitShowToolTip}
            emitHideToolTip={emitHideToolTip}
            appConfig={appConfig}
            wantToSeeV1ToV2Conversion={wantToSeeV1ToV2Conversion}
        />
    );
};
