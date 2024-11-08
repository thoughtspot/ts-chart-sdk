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

export const getFormatPattern = (col: ChartColumn): string =>
    getFormatPatternForBucket(getBucketization(col)) || col.format?.pattern;

export function getBaseTypeFormatterInstanceExpensive(
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
export const getDataFormatter = (
    col: ChartColumn,
    options: FormatOptionsType,
    aggrTypeOverride?: ColumnAggregationType,
) => {
    // TODO: number formatter for column based on column type based on
    // aggregation type

    return getBaseTypeFormatterInstanceExpensive(col, options);
};

export const generateMapOptions = (
    appConfig: any,
    col: ChartColumn,
    data: any,
): any => {
    let customCalenderMap = {};

    if (
        getCustomCalendarGuidFromColumn(col) !== null &&
        getCustomCalendarGuidFromColumn(col) !== undefined &&
        getCustomCalendarGuidFromColumn(col) !== ''
    ) {
        for (let i = 0; i < data.length; i++) {
            customCalenderMap = {
                ...customCalenderMap,
                [data[i].v.s]: data[i],
            };
        }
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
