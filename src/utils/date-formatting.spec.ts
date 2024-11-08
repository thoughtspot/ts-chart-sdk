/**
 * @file: Date Formatting Spec
 *
 * @author Yashvardhan Nehra <yashvardhan.nehra@thoughtspot.com>
 *
 * Copyright: ThoughtSpot Inc. 2023
 */

import { DateTime } from 'luxon';
import {
    ChartColumn,
    ChartSpecificColumnType,
    ColumnTimeBucket,
    ColumnType,
    DataType,
} from '../types/answer-column.types';
import {
    assignQuarterValueToString,
    CustomCalendarDate,
    dateNumTypes,
    formatDate,
    formatDateNum,
    formatDateTime,
    getCustomCalendarGuidFromColumn,
    getCustomCalendarValueFromEpoch,
    getDisplayString,
    getEffectiveDateNumDataType,
    getMonthOfYear,
    getOrdinalSuffixedValue,
    getSpecialFormatData,
    getStartEpoch,
    hasCustomCalendar,
    isAttribute,
    isDateColumn,
    isDateFamilyColumn,
    isDateNumColumn,
    isDateTimeColumn,
    isTimeColumn,
    sanitizeDate,
    useQuarterStart,
} from './date-formatting';
import * as DateFormatting from './date-formatting';

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
    const options = {
        quarterStartMonth: 1,
        tsLocaleBasedStringsFormats: {
            null_value_placeholder_label: '{Null}',
            empty_value_placeholder_label: '{Empty}',
            other_value_placeholder_label: '{Other}',
            unavailabe_column_sample_value: '{Unavailable}',
            weekOfDay: {
                Friday: 'Friday',
                Monday: 'Monday',
                Saturday: 'Saturday',
                Sunday: 'Sunday',
                Thursday: 'Thursday',
                Tuesday: 'Tuesday',
                Wednesday: 'Wednesday',
            },
            monthOfYear: {
                April: 'April',
                August: 'August',
                December: 'December',
                February: 'February',
                January: 'January',
                July: 'July',
                June: 'June',
                March: 'March',
                May: 'May',
                November: 'November',
                October: 'October',
                September: 'September',
            },
            quarter_of_year: 'Q{1}',
        },
        tsDateConstants: {
            day_in_month_format: 'e',
            day_in_quarter_format: 'e',
            day_in_year_format: 'j',
            day_of_week_format: 'e',
            month_in_quarter_format: 'm',
            month_in_year_format: 'm',
            special_value_unavailable: 'N/A',
            week_in_year_format: 'V',
        },
        tsLocaleBasedDateFormats: {
            DATE_SHORT: 'MM/dd/yyyy',
        },
        quarter_of_year: 'Q{1}',
        tsDefinedCustomCalenders: {
            '43121d86-347a-4dbb-bea8-5e5bb899e427': {
                calendar: '7573c08b-753b-478b-84fd-6e702d481ff6',
                fiscal: 'bfa39848-ba4f-46d8-80fd-b695064e61b7',
                french: 'a7316e8d-d4dd-4eaf-9294-396db951b422',
            },
        },
    };
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

    test('should return false for columns with dataType other than DATE_TIME', () => {
        col.dataType = DataType.DATE;
        expect(isDateTimeColumn(col)).toBe(false);
        col.dataType = DataType.INT64;
        expect(isDateTimeColumn(col)).toBe(false);
        col.dataType = DataType.DATE_TIME;
        expect(isDateTimeColumn(col)).toBe(true);
    });
    test('should return DATE_NUM_DAY_OF_WEEK for ColumnTimeBucket.DAY_OF_WEEK', () => {
        const column = {
            timeBucket: ColumnTimeBucket.DAY_OF_WEEK,
        } as ChartColumn;
        expect(getEffectiveDateNumDataType(column)).toBe(
            dateNumTypes.DATE_NUM_DAY_OF_WEEK,
        );
    });

    test('should return DATE_NUM_DAY_IN_MONTH for ColumnTimeBucket.DAY_OF_MONTH', () => {
        const column = {
            timeBucket: ColumnTimeBucket.DAY_OF_MONTH,
        } as ChartColumn;
        expect(getEffectiveDateNumDataType(column)).toBe(
            dateNumTypes.DATE_NUM_DAY_IN_MONTH,
        );
    });

    test('should return DATE_NUM_DAY_IN_QUARTER for ColumnTimeBucket.DAY_OF_QUARTER', () => {
        const column = {
            timeBucket: ColumnTimeBucket.DAY_OF_QUARTER,
        } as ChartColumn;
        expect(getEffectiveDateNumDataType(column)).toBe(
            dateNumTypes.DATE_NUM_DAY_IN_QUARTER,
        );
    });

    test('should return DATE_NUM_DAY_IN_YEAR for ColumnTimeBucket.DAY_OF_YEAR', () => {
        const column = {
            timeBucket: ColumnTimeBucket.DAY_OF_YEAR,
        } as ChartColumn;
        expect(getEffectiveDateNumDataType(column)).toBe(
            dateNumTypes.DATE_NUM_DAY_IN_YEAR,
        );
    });

    test('should return DATE_NUM_WEEK_IN_MONTH for ColumnTimeBucket.WEEK_OF_MONTH', () => {
        const column = {
            timeBucket: ColumnTimeBucket.WEEK_OF_MONTH,
        } as ChartColumn;
        expect(getEffectiveDateNumDataType(column)).toBe(
            dateNumTypes.DATE_NUM_WEEK_IN_MONTH,
        );
    });

    test('should return DATE_NUM_WEEK_IN_QUARTER for ColumnTimeBucket.WEEK_OF_QUARTER', () => {
        const column = {
            timeBucket: ColumnTimeBucket.WEEK_OF_QUARTER,
        } as ChartColumn;
        expect(getEffectiveDateNumDataType(column)).toBe(
            dateNumTypes.DATE_NUM_WEEK_IN_QUARTER,
        );
    });

    test('should return DATE_NUM_WEEK_IN_YEAR for ColumnTimeBucket.WEEK_OF_YEAR', () => {
        const column = {
            timeBucket: ColumnTimeBucket.WEEK_OF_YEAR,
        } as ChartColumn;
        expect(getEffectiveDateNumDataType(column)).toBe(
            dateNumTypes.DATE_NUM_WEEK_IN_YEAR,
        );
    });

    test('should return DATE_NUM_MONTH_IN_QUARTER for ColumnTimeBucket.MONTH_OF_QUARTER', () => {
        const column = {
            timeBucket: ColumnTimeBucket.MONTH_OF_QUARTER,
        } as ChartColumn;
        expect(getEffectiveDateNumDataType(column)).toBe(
            dateNumTypes.DATE_NUM_MONTH_IN_QUARTER,
        );
    });

    test('should return DATE_NUM_MONTH_IN_YEAR for ColumnTimeBucket.MONTH_OF_YEAR', () => {
        const column = {
            timeBucket: ColumnTimeBucket.MONTH_OF_YEAR,
        } as ChartColumn;
        expect(getEffectiveDateNumDataType(column)).toBe(
            dateNumTypes.DATE_NUM_MONTH_IN_YEAR,
        );
    });

    test('should return DATE_NUM_QUARTER_IN_YEAR for ColumnTimeBucket.QUARTER_OF_YEAR', () => {
        const column = {
            timeBucket: ColumnTimeBucket.QUARTER_OF_YEAR,
        } as ChartColumn;
        expect(getEffectiveDateNumDataType(column)).toBe(
            dateNumTypes.DATE_NUM_QUARTER_IN_YEAR,
        );
    });
    test('should replace placeholder with value', () => {
        const result = assignQuarterValueToString('Q{1}', '1');
        expect(result).toBe('Q1');
    });
    test('should return correct month for normal case', () => {
        const monthOfYear = {
            January: 'Jan',
            February: 'Feb',
            March: 'Mar',
            April: 'Apr',
            May: 'May',
            June: 'Jun',
            July: 'Jul',
            August: 'Aug',
            September: 'Sep',
            October: 'oct',
            November: 'Nov',
            December: 'Dec',
        };
        const result = getMonthOfYear(1, 1, monthOfYear);
        expect(result).toBe('Jan');
    });
    test('should return the value from displayToCustomCalendarValueMap if custom calendar exists and dateEpoch is present', () => {
        const dateEpoch = 1234567890;
        const displayToCustomCalendarValueMap = {
            1234567890: {
                v: {
                    s: '1234567890',
                    e: '1234567890',
                },
                d: 'Custom Date Value',
            },
        };
        col.dataType = DataType.DATE;
        const result = getCustomCalendarValueFromEpoch(
            col,
            dateEpoch,
            displayToCustomCalendarValueMap,
        );
        expect(result).toEqual({
            v: { s: '1234567890', e: '1234567890' },
            d: 'Custom Date Value',
        });
    });
    test('should return null_value_placeholder_label if value matches null_value_placeholder_label', () => {
        const result = getSpecialFormatData('{Null}', options);
        expect(result).toBe('{Null}');
    });

    test('should return empty_value_placeholder_label if value matches empty_value_placeholder_label', () => {
        const result = getSpecialFormatData('{Empty}', options);
        expect(result).toBe('{Empty}');
    });

    test('should return unavailabe_column_sample_value if value matches special_value_unavailable', () => {
        const result = getSpecialFormatData('N/A', options);
        expect(result).toBe('{Unavailable}');
    });

    test('should return empty_value_placeholder_label if value is an empty string', () => {
        const result = getSpecialFormatData('', options);
        expect(result).toBe('{Empty}');
    });

    test('should return null if value does not match any special condtestion', () => {
        const result = getSpecialFormatData('Some other value', options);
        expect(result).toBeNull();
    });
    test('should return special value if getSpecialFormatData provides it', () => {
        const result = sanitizeDate('{Null}', 'yyyy', options);
        expect(result).toBe('{Null}');
    });
    test('should return parsed integer if inputDate is a numeric string', () => {
        const result = sanitizeDate('12345', 'MM/dd/yyyy', options);
        expect(result).toBe(12345);
    });
    test('should parse date if inputDate is a non-numeric string', () => {
        const result = sanitizeDate('12/25/2022', 'DATE_SHORT', options);
        expect(result).toEqual(new Date(2022, 11, 25));
    });
    test('should return "Invalid Date" for an invalid epochMillis', () => {
        const result = formatDateTime(NaN, 'MM-dd-yyyy', false, options);
        expect(result).toBe('Invalid DateTime');
    });
    test('should return a formatted date string for a valid epochMillis with default options', () => {
        const epochMillis = 1043452800; // January 25, 2003
        const expectedDate = '01-25-2003';
        const luxonDate = DateTime.fromMillis(epochMillis * 1000);

        jest.spyOn(DateTime, 'fromMillis').mockReturnValue(luxonDate);
        jest.spyOn(luxonDate, 'toLocaleString').mockReturnValue(expectedDate);

        const result = formatDateTime(
            epochMillis,
            'MM-dd-yyyy',
            false,
            options,
        );
        expect(result).toBe(expectedDate);
    });
    test('should apply fiscal year format when quarterStartMonth is not default and useSystemCalendar is false', () => {
        const epochMillis = 1043452800; // January 25, 2003
        options.quarterStartMonth = 4; // Custom fiscal year
        const expectedDate = 'FY 2003';
        const luxonDate = DateTime.fromMillis(epochMillis * 1000);
        jest.spyOn(DateFormatting, 'useQuarterStart').mockReturnValue(
            luxonDate,
        );
        jest.spyOn(luxonDate, 'toFormat').mockReturnValue(expectedDate);
        const result = formatDateTime(epochMillis, 'yyyy', false, options);
        expect(result).toBe(expectedDate);
        expect(useQuarterStart).toHaveBeenCalledWith(
            luxonDate,
            options.quarterStartMonth,
        );
    });
    test('should replace unsupported "qqq" with fiscal quarter format', () => {
        const epochMillis = 1043452800; // January 25, 2003
        const format = 'qqq yyyy';
        const expectedFormat = "'Q'q yyyy";
        const luxonDate = DateTime.fromMillis(epochMillis * 1000);
        jest.spyOn(DateFormatting, 'useQuarterStart').mockReturnValue(
            luxonDate,
        );
        jest.spyOn(luxonDate, 'toFormat').mockReturnValue('Q1 2003');

        const result = formatDateTime(epochMillis, format, true, options);
        expect(result).toBe('Q1 2003');
        expect(luxonDate.toFormat).toHaveBeenCalledWith(expectedFormat);
    });
    test('should return the correct ordinal suffix for numbers ending in 1', () => {
        expect(getOrdinalSuffixedValue(1)).toBe('1st');
        expect(getOrdinalSuffixedValue(21)).toBe('21st');
        expect(getOrdinalSuffixedValue('1')).toBe('1st'); // Test with string input
        expect(getOrdinalSuffixedValue('21')).toBe('21st');
    });

    test('should return the correct ordinal suffix for numbers ending in 2', () => {
        expect(getOrdinalSuffixedValue(2)).toBe('2nd');
        expect(getOrdinalSuffixedValue(22)).toBe('22nd');
        expect(getOrdinalSuffixedValue('2')).toBe('2nd'); // Test with string input
        expect(getOrdinalSuffixedValue('22')).toBe('22nd');
    });

    test('should return the correct ordinal suffix for numbers ending in 3', () => {
        expect(getOrdinalSuffixedValue(3)).toBe('3rd');
        expect(getOrdinalSuffixedValue(23)).toBe('23rd');
        expect(getOrdinalSuffixedValue('3')).toBe('3rd'); // Test with string input
        expect(getOrdinalSuffixedValue('23')).toBe('23rd');
    });

    test('should return the correct ordinal suffix for all other numbers', () => {
        expect(getOrdinalSuffixedValue(4)).toBe('4th');
        expect(getOrdinalSuffixedValue(11)).toBe('11th');
        expect(getOrdinalSuffixedValue(100)).toBe('100th');
        expect(getOrdinalSuffixedValue(112)).toBe('112th');
        expect(getOrdinalSuffixedValue('4')).toBe('4th');
        expect(getOrdinalSuffixedValue('11')).toBe('11th');
        expect(getOrdinalSuffixedValue('100')).toBe('100th');
        expect(getOrdinalSuffixedValue('112')).toBe('112th');
    });

    test('should handle negative numbers correctly', () => {
        expect(getOrdinalSuffixedValue(-1)).toBe('-1th');
        expect(getOrdinalSuffixedValue(-11)).toBe('-11th');
        expect(getOrdinalSuffixedValue('-1')).toBe('-1th');
        expect(getOrdinalSuffixedValue('-11')).toBe('-11th');
    });
    test('should return special format data if applicable', () => {
        jest.spyOn(DateFormatting, 'getSpecialFormatData').mockReturnValue(
            'Special Format',
        );
        const result = formatDateNum(undefined, '{Null}', '', options);
        expect(result).toBe('{Null}');
    });
    test('should return value as string for absolute day, month, quarter, and year types', () => {
        const result = formatDateNum('DATE_NUM_ABS_DAY', 123, '', options);
        expect(result).toBe('123');
    });
    test("should return ordinal suffixed value for day of month when format doesn't match", () => {
        const result = formatDateNum('DATE_NUM_DAY_IN_MONTH', 2, '', options);
        expect(result).toBe('2nd day of month');
    });
    test('should return formatted date for day of week', () => {
        const result = formatDateNum('DATE_NUM_DAY_OF_WEEK', 1, 'e', options);
        expect(result).toBe('Monday');
    });
    test('should return formatted month name for month in year', () => {
        const result = formatDateNum('DATE_NUM_MONTH_IN_YEAR', 1, 'm', options);
        expect(result).toBe('April');
    });
    test('should return ordinal suffixed value for week of year', () => {
        const result = formatDateNum('DATE_NUM_WEEK_IN_YEAR', 2, '', options);
        expect(result).toBe('2nd week of year');
    });
    test('should handle special cases for quarter value', () => {
        const result = formatDateNum(
            'DATE_NUM_QUARTER_IN_YEAR',
            1,
            '',
            options,
        );
        expect(result).toBe('Q1');
    });
    test('should return value for unhandled cases', () => {
        const result = formatDateNum('UNKNOWN_TYPE', 999, '', options);
        expect(result).toBe(999);
    });
    test('should return special placeholder values if input matches', () => {
        const resultEmpty = formatDate('{Empty}', 'DD-MM-YYYY', true, options);
        expect(resultEmpty).toBe('{Empty}');

        const resultOther = formatDate('{Other}', 'DD-MM-YYYY', true, options);
        expect(resultOther).toBe('{Other}');
    });
    it('should return null placeholder if the sanitized date is invalid', () => {
        const result = formatDate('{Null}', 'DD-MM-YYYY', true, options);
        expect(result).toBe('{Null}');
    });
});
