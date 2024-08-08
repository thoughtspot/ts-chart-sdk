/**
 * @file: Date Formatting Utils
 *
 * @author Yashvardhan Nehra <yashvardhan.nehra@thoughtspot.com>
 *
 * Copyright: ThoughtSpot Inc. 2023
 */

import _ from 'lodash';
import { DateTime } from 'luxon';
import {
    ChartColumn,
    ColumnTimeBucket,
    ColumnType,
    DataType,
} from '../types/answer-column.types';

export interface CustomCalendarDate {
    v: {
        s: number;
        e: number;
    };
    d: string;
}

export const isDateColumn = (col: ChartColumn) =>
    DataType[col.dataType] === 'DATE' || DataType[col.dataType] === 'DATE_TIME';

export const isAttribute = (col: ChartColumn) =>
    col.type === ColumnType.ATTRIBUTE;

export const getCustomCalendarGuidFromColumn = (col: ChartColumn) =>
    col.calenderGuid;

const isDateNumTimeBucket = (col: ChartColumn): boolean => {
    return [
        ColumnTimeBucket.HOUR_OF_DAY,
        ColumnTimeBucket.DAY_OF_WEEK,
        ColumnTimeBucket.DAY_OF_MONTH,
        ColumnTimeBucket.DAY_OF_QUARTER,
        ColumnTimeBucket.DAY_OF_YEAR,
        ColumnTimeBucket.WEEK_OF_MONTH,
        ColumnTimeBucket.WEEK_OF_QUARTER,
        ColumnTimeBucket.WEEK_OF_YEAR,
        ColumnTimeBucket.MONTH_OF_QUARTER,
        ColumnTimeBucket.MONTH_OF_YEAR,
        ColumnTimeBucket.QUARTER_OF_YEAR,
    ].includes(col.timeBucket);
};
export const isDateNumColumn = (col: ChartColumn): boolean => {
    return isAttribute(col) && isDateNumTimeBucket(col);
};

export const isDateFamilyColumn = (col: ChartColumn): boolean => {
    return isDateColumn(col) || isDateNumColumn(col);
};

export const isTimeColumn = (col: ChartColumn) => {
    return DataType[col.dataType] === 'TIME';
};

/**
 * Determines if the given column has a custom calendar.
 *
 * @param col - The chart column to check.
 * @returns True if the column is a date family column and has a custom calendar GUID, false otherwise.
 */
export const hasCustomCalendar = (col: ChartColumn): boolean =>
    isDateFamilyColumn(col) && !!getCustomCalendarGuidFromColumn(col);

/**
 * Retrieves the start epoch from a custom calendar date.
 *
 * @param date - The custom calendar date object.
 * @returns The start epoch time if present, null otherwise.
 */
export function getStartEpoch(date: CustomCalendarDate): number | null {
    if (_.has(date, 'v') && _.has(date.v, 's')) {
        return date.v.s;
    }
    return null;
}

export function getDisplayString(date: CustomCalendarDate): string | null {
    if (_.has(date, 'd')) {
        return date.d;
    }
    return null;
}

/**
 * Formats the date value based on the column's properties and custom calendar settings.
 *
 * @param dataValue - The date value to format.
 * @param col - The chart column.
 * @returns The formatted date string.
 */
export function dateFormatter(dataValue: any, col: ChartColumn) {
    if (hasCustomCalendar(col)) {
        if (getDisplayString(dataValue)) {
            return getDisplayString(dataValue);
        }
        const startEpoch = getStartEpoch(dataValue);
        return startEpoch !== null
            ? DateTime.fromMillis(startEpoch * 1000).toFormat('dd-MM-yyyy')
            : null;
    }
    return DateTime.fromMillis(dataValue * 1000).toFormat('dd-MM-yyyy');
}
