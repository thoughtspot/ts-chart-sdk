import { create } from '../main/logger';
import {
    AxisConfig,
    AxisType,
    ChartConfig,
    ChartConfigDimension,
    ChartConfigMode,
} from '../types/common.types';
import { QueryColumn } from '../types/ts-to-chart-event.types';

const logger = create('chart-config-utils');

/**
 * Fetch the query columns from the dimension config.
 * @param config - The dimension config.
 * @returns The query columns.
 */
export function fetchQueryColumnsFromDimensionConfig(
    config: AxisConfig,
): QueryColumn[] {
    const columns: QueryColumn[] = [];
    if (config.type === AxisType.FLAT) {
        columns.push(config.column);
    } else if (config.type === AxisType.MERGED) {
        columns.push(...config.columns);
    } else if (config.type === AxisType.DUAL) {
        columns.push(
            ...fetchQueryColumnsFromDimensionConfig(config.primary),
            ...fetchQueryColumnsFromDimensionConfig(config.secondary),
        );
    }
    return columns;
}

/**
 * Fetch the query columns from the chart config dimension.
 * @param dimension - The dimension.
 * @returns The query columns.
 */
export function fetchQueryColumnsFromDimension(
    dimension: ChartConfigDimension,
): QueryColumn[] {
    if (dimension.mode === ChartConfigMode.AXIS_DRIVEN) {
        // AxisDrivenDimension
        return (
            dimension.axes
                ?.map((axis) => fetchQueryColumnsFromDimensionConfig(axis))
                .flat() ?? []
        );
    }
    // ColumnDrivenDimension
    return dimension.columns ?? [];
}

/**
 * Fetch the query columns from the chart config.
 * @param chartConfig - The chart config.
 * @returns The query columns.
 */
export function fetchQueryColumns(chartConfig: ChartConfig): QueryColumn[] {
    return chartConfig.dimensions
        .map((dimension) => fetchQueryColumnsFromDimension(dimension))
        .flat();
}

export function validateChartConfig(chartConfig: ChartConfig): void {
    if (!chartConfig?.dimensions?.length) {
        const errorMessage =
            'The chart config is invalid. it does not have any dimensions';
        logger.error(errorMessage);
        throw new Error(errorMessage);
    }
    const currentConfigMode = chartConfig.dimensions[0].mode;
    if (!currentConfigMode) {
        logger.warn(
            'The chart config is missing mode property, assuming COLUMN_DRIVEN',
        );
    }
    const allDimensionsHaveSameMode = chartConfig.dimensions.every(
        (dimension) => dimension.mode === currentConfigMode,
    );
    if (!allDimensionsHaveSameMode) {
        const errorMessage =
            'The chart config is invalid. all dimensions must have the same mode';
        logger.error(errorMessage);
        throw new Error(errorMessage);
    }
}

export function validateAllChartConfigs(chartConfigList: ChartConfig[]): void {
    if (!chartConfigList?.length) {
        logger.warn(
            'The chart config is invalid. it does not have any chart configs',
        );
        return;
    }
    chartConfigList.forEach((chartConfig) => {
        validateChartConfig(chartConfig);
    });
}
