import {
    ChartConfigDimension,
    ChartConfigMode,
    DimensionConfig,
    DimensionType,
} from '../types/common.types';
import { QueryColumn } from '../types/ts-to-chart-event.types';

/**
 * Fetch the query columns from the dimension config.
 * @param config - The dimension config.
 * @returns The query columns.
 */
export function fetchQueryColumnsFromDimensionConfig(
    config: DimensionConfig,
): QueryColumn[] {
    const columns: QueryColumn[] = [];
    if (config.type === DimensionType.FLAT) {
        columns.push(config.column);
    } else if (config.type === DimensionType.MERGED) {
        columns.push(...config.columns);
    } else if (config.type === DimensionType.DUAL) {
        columns.push(
            ...fetchQueryColumnsFromDimensionConfig(config.primary),
            ...fetchQueryColumnsFromDimensionConfig(config.secondary),
        );
    }
    return columns;
}

/**
 * Fetch the query columns from the dimension config.
 * @param dimension - The dimension config.
 * @returns The query columns.
 */
export function fetchQueryColumns(
    dimension: ChartConfigDimension,
): QueryColumn[] {
    if (dimension.mode === ChartConfigMode.CONFIG_DRIVEN) {
        return dimension.config
            .map((config) => fetchQueryColumnsFromDimensionConfig(config))
            .flat();
    }
    return dimension.columns;
}
