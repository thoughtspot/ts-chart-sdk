import _ from 'lodash';
import { CustomChartContext } from '../main/custom-chart-context';
import {
    ChartColumn,
    ColumnAggregationType,
    ColumnTimeBucket,
    ColumnType,
    DataType,
} from '../types/answer-column.types';
import {
    CustomCalendarDate,
    dateFormatPresets,
    formatDate,
    formatDateNum,
    getCustomCalendarGuidFromColumn,
    getCustomCalendarValueFromEpoch,
    getDisplayString,
    getEffectiveDateNumDataType,
    hasCustomCalendar,
    isDateColumn,
    isDateNumColumn,
    isDateTimeColumn,
} from './date-formatting';
import {
    getCustomCalendarGuid,
    getFormatPatternForBucket,
    showDateFinancialYearFormat,
} from './date-utils';

interface FormatOptionsType {
    isMillisIncluded: boolean;
}

const getBucketization = (col: ChartColumn) => col.timeBucket;
/**
 * Retrieves the format pattern for a given column based on its bucketization or custom format.
 *
 * This function first checks the column's bucketization and attempts to retrieve a format pattern
 * using `getFormatPatternForBucket`. If no format pattern is found for the bucketization, it falls
 * back to the column's custom format pattern (if available).
 *
 * @param col - The column to retrieve the format pattern for, represented as a `ChartColumn`.
 * @returns The format pattern as a string, either derived from the bucketization or the column's custom format.
 */
export const getFormatPattern = (col: ChartColumn): string =>
    getFormatPatternForBucket(getBucketization(col)) || col.format?.pattern;

/**
 * Retrieves a formatter function for a column based on its type (e.g., date, date_number).
 *
 * This function returns a specialized formatter based on the column's type and format pattern.
 * It first checks if the column is a date column and applies the appropriate date format,
 * considering options like whether the fiscal year or milliseconds are included. If the column is
 * a date number column, it applies date number formatting. For other types of columns, it returns
 * the raw data value without formatting.
 *
 * @param col - The column for which the formatter is to be created, represented as a `ChartColumn`.
 * @param options - The formatting options, including locale, fiscal settings, and custom calendar information.
 *
 * @returns A function that formats a data value based on the column type and format pattern.
 *          This returned function takes in the data value and optional additional options.
 *
 * @example
 *
 * const dateFormatter = getBaseTypeFormatterInstance(column, options);
 * const formattedValue = dateFormatter(dataValue, options);
 * For more info in column
 * @link ChartColumn
 * To see how options are feched see src/example/custom-bar-chart
 */
export function getBaseTypeFormatterInstance(
    col: ChartColumn,
    options: FormatOptionsType,
): any {
    let formatPattern = getFormatPattern(col);
    // TODO: add numberic formatter if the col is numeric.
    if (isDateColumn(col)) {
        const showFinancialFormat = showDateFinancialYearFormat(col);
        const isDateTime = isDateTimeColumn(col);

        if (!formatPattern) {
            if (isDateTime) {
                if (options.isMillisIncluded) {
                    formatPattern =
                        dateFormatPresets.DATETIME_SHORT_WITH_MILLIS;
                } else {
                    formatPattern =
                        dateFormatPresets.DATETIME_SHORT_WITH_SECONDS;
                }
            }
        }
        return (dataValue: any, options?: any) => {
            const customCalendarValueFromEpoch: CustomCalendarDate =
                getCustomCalendarValueFromEpoch(
                    col,
                    dataValue,
                    options?.displayToCustomCalendarValueMap,
                );
            const customCalendarDisplayStr = getDisplayString(
                customCalendarValueFromEpoch,
            );
            if (customCalendarDisplayStr) {
                return customCalendarDisplayStr;
            }
            const customCalendarOverridesFiscalOffset =
                hasCustomCalendar(col) &&
                getCustomCalendarGuidFromColumn(col) !==
                    getCustomCalendarGuid(
                        'fiscal',
                        options.defaultDataSourceId,
                        options.tsDefinedCustomCalenders,
                    );
            const optionsWithFiscalOffset = {
                ...options,
                customCalendarOverridesFiscalOffset:
                    !!customCalendarOverridesFiscalOffset,
            };
            return formatDate(
                dataValue,
                formatPattern,
                !showFinancialFormat,
                optionsWithFiscalOffset,
            );
        };
    }
    if (isDateNumColumn(col)) {
        return (dataValue: any, options?: any) => {
            const customCalendarValueFromEpoch: CustomCalendarDate =
                getCustomCalendarValueFromEpoch(
                    col,
                    dataValue,
                    options?.displayToCustomCalendarValueMap,
                );
            const customCalendarDisplayStr = getDisplayString(
                customCalendarValueFromEpoch,
            );
            if (customCalendarValueFromEpoch && customCalendarDisplayStr) {
                return customCalendarDisplayStr;
            }
            return formatDateNum(
                getEffectiveDateNumDataType(col),
                dataValue,
                formatPattern,
                options,
            );
        };
    }
    return (dataValue: any) => {
        return dataValue;
    };
}
/**
 * Retrieves the appropriate data formatter function for a specified column,
 * based on its type, format options, and an optional aggregation type override.
 *
 *
 * @param col - The column for which the formatter is to be created, represented as a `ChartColumn`.
 * @param options - The formatting options, including settings such as locale, custom calendars, and date constants.
 * @param aggrTypeOverride - Optional override for the column's aggregation type (e.g., `SUM`, `AVERAGE`),
 *                            which could affect formatting behavior in future implementations.
 *
 * @returns A function to format data values based on the column type, format pattern, and options.
 *          This returned function can be used to format individual data values within the column.
 *
 * @example
 * const formatter = getDataFormatter(column, formatOptions, 'SUM');
 * const formattedValue = formatter(dataValue);
 */
export const getDataFormatter = (
    col: ChartColumn,
    options: FormatOptionsType,
    aggrTypeOverride?: ColumnAggregationType,
) => {
    // TODO: number formatter for column based on column type based on
    // aggregation type

    return getBaseTypeFormatterInstance(col, options);
};

/**
 * Generates a configuration object with formatting and locale-based options for date handling,
 * including custom calendar mapping for a specific column.
 *
 * This function builds an options object that includes locale settings, quarter start month,
 * date formats, and a custom calendar map, which is populated when the column contains a
 * custom calendar GUID. The custom calendar map links display values to custom calendar data
 * for date formatting needs.
 *
 * @param appConfig - The application configuration containing locale, date format settings,
 *                    and custom calendar definitions.
 * @param col - The column to check for a custom calendar GUID, represented as a `ChartColumn`.
 * @param data - The dataset, used to populate the custom calendar map if a custom calendar
 *               GUID is associated with the column.
 *
 * @returns An options object with locale and date formatting details, including a custom
 *          calendar map if applicable.
 *
 * @example
 * const mapOptions = generateMapOptions(appConfig, column, data);
 * const locale = mapOptions.locale;
 */

export const generateMapOptions = (
    appConfig: any,
    col: ChartColumn,
    data: any,
): any => {
    let customCalenderMap = {};

    if (!_.isEmpty(getCustomCalendarGuidFromColumn(col))) {
        customCalenderMap = data.reduce(
            (customCalenderMapAcc: any, dataValue: any) => {
                return {
                    ...customCalenderMapAcc,
                    [dataValue.v.s]: dataValue,
                };
            },
            {},
        );
    }
    return {
        locale: appConfig?.localeOptions?.locale,
        quarterStartMonth: appConfig?.localeOptions?.quarterStartMonth,
        tsLocaleBasedDateFormats:
            appConfig?.dateFormatsConfig?.tsLocaleBasedDateFormats,
        tsLocaleBasedStringsFormats:
            appConfig?.dateFormatsConfig?.tsLocaleBasedStringsFormats,
        tsDateConstants: appConfig?.dateFormatsConfig?.tsDateConstants,
        tsDefinedCustomCalenders:
            appConfig?.dateFormatsConfig?.tsDefinedCustomCalenders,
        defaultDataSourceId: appConfig?.dateFormatsConfig?.defaultDataSourceId,
        displayToCustomCalendarValueMap: customCalenderMap,
    };
};
