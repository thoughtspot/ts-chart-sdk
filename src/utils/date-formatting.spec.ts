/**
 * @file: Date Formatting Spec
 *
 * @author Yashvardhan Nehra <yashvardhan.nehra@thoughtspot.com>
 *
 * Copyright: ThoughtSpot Inc. 2023
 */

import {
    ChartColumn,
    ChartSpecificColumnType,
    ColumnTimeBucket,
    ColumnType,
    DataType,
} from '../types/answer-column.types';
import {
    CustomCalendarDate,
    dateFormatter,
    getCustomCalendarGuidFromColumn,
    getDisplayString,
    getStartEpoch,
    hasCustomCalendar,
    isAttribute,
    isDateColumn,
    isDateFamilyColumn,
    isDateNumColumn,
    isTimeColumn,
} from './date-formatting';

describe('date-formatting', () => {
    let col: ChartColumn;
    beforeEach(() => {
        col = {
            id: 'testId',
            name: 'test',
            type: ColumnType.MEASURE,
            chartSpecificColumnType: ChartSpecificColumnType.UNKNOWN,
            timeBucket: ColumnTimeBucket.AUTO,
            dataType: DataType.UNKNOWN,
            calenderGuid: '12345',
        };
    });
    test('isDateColumn should return true for DATE data type', () => {
        col.dataType = DataType.DATE;
        expect(isDateColumn(col)).toBe(true);
    });

    test('isDateColumn should return true for DATE_TIME data type', () => {
        col.dataType = DataType.DATE_TIME;
        expect(isDateColumn(col)).toBe(true);
    });

    test('isAttribute should return true for ATTRIBUTE column type', () => {
        col.type = ColumnType.ATTRIBUTE;
        expect(isAttribute(col)).toBe(true);
    });

    test('isAttribute should return false for non-ATTRIBUTE column type', () => {
        col.type = ColumnType.MEASURE;
        expect(isAttribute(col)).toBe(false);
    });

    test('getCustomCalendarGuidFromColumn should return the calendarGuid', () => {
        col.calenderGuid = '12345';
        expect(getCustomCalendarGuidFromColumn(col)).toBe('12345');
    });

    test('isDateNumColumn should return true for ATTRIBUTE type with specific time buckets', () => {
        col.type = ColumnType.ATTRIBUTE;
        col.timeBucket = ColumnTimeBucket.HOUR_OF_DAY;
        expect(isDateNumColumn(col)).toBe(true);
    });

    test('isDateNumColumn should return false for non-ATTRIBUTE type', () => {
        col.type = ColumnType.MEASURE;
        col.timeBucket = ColumnTimeBucket.DAY_OF_WEEK;
        expect(isDateNumColumn(col)).toBe(false);
    });

    test('isDateFamilyColumn should return true for DATE data type', () => {
        col.dataType = DataType.DATE;
        expect(isDateFamilyColumn(col)).toBe(true);
    });

    test('isDateFamilyColumn should return true for DATE_NUM column', () => {
        col.type = ColumnType.ATTRIBUTE;
        col.timeBucket = ColumnTimeBucket.DAY_OF_WEEK;
        expect(isDateFamilyColumn(col)).toBe(true);
    });

    test('isTimeColumn should return true for TIME data type', () => {
        col.dataType = DataType.TIME;
        expect(isTimeColumn(col)).toBe(true);
    });

    test('hasCustomCalendar should return true for date family columns with custom calendar', () => {
        col.dataType = DataType.DATE;
        col.calenderGuid = '12345';
        expect(hasCustomCalendar(col)).toBe(true);
    });

    test('getStartEpoch should return the start epoch from CustomCalendarDate', () => {
        const date = {
            v: { s: 12345, e: 12346 },
            d: 'Custom_Date',
        } as CustomCalendarDate;
        expect(getStartEpoch(date)).toBe(date.v.s);
    });

    test('getStartEpoch should return null if start epoch is not present', () => {
        const date = { v: {}, d: '01-07-2021' } as CustomCalendarDate;
        expect(getStartEpoch(date)).toBe(null);
    });

    test('getDisplayString should return display string if present', () => {
        const date = { v: { s: 1625097600, e: 1625184000 }, d: '01-07-2021' };
        expect(getDisplayString(date)).toBe('01-07-2021');
    });

    test('getDisplayString should return null if display string is not present', () => {
        const date = {
            v: { s: 1625097600, e: 1625184000 },
        } as CustomCalendarDate;
        expect(getDisplayString(date)).toBe(null);
    });

    test('dateFormatter should return custom calendar display string if present', () => {
        const dataValue = {
            v: { s: 1625097600, e: 1625184000 },
            d: '01-07-2021',
        } as CustomCalendarDate;
        col.dataType = DataType.DATE;
        col.calenderGuid = '12345';
        expect(dateFormatter(dataValue, col)).toBe('01-07-2021');
    });

    test('dateFormatter should return formatted date from start epoch if custom calendar display string is not present', () => {
        const dataValue = {
            v: { s: 1625097600, e: 1625184000 },
        } as CustomCalendarDate;
        col.dataType = DataType.DATE;
        col.calenderGuid = '12345';
        expect(dateFormatter(dataValue, col)).toBe('01-07-2021');
    });

    test('dateFormatter should return null if start epoch is not present', () => {
        const dataValue = { v: { e: 1625184000 } } as CustomCalendarDate;
        col.dataType = DataType.DATE;
        col.calenderGuid = '12345';
        expect(dateFormatter(dataValue, col)).toBe(null);
    });

    test('dateFormatter should return formatted date for non-custom calendar column', () => {
        const dataValue = 1625097600;
        col.dataType = DataType.DATE;
        col.calenderGuid = undefined;
        expect(dateFormatter(dataValue, col)).toBe('01-07-2021');
    });
    test('dateFormatter should format the date based on custom calendar', () => {
        col.dataType = DataType.DATE;
        col.calenderGuid = '12345';
        const date = {
            v: { s: 12345, e: 12346 },
            d: 'Custom_Date',
        } as CustomCalendarDate;
        expect(dateFormatter(date, col)).toBe(date.d);
    });
});
