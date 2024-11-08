import {
    ChartColumn,
    ChartSpecificColumnType,
    ColumnTimeBucket,
    ColumnType,
    DataType,
} from '../types/answer-column.types';
import * as DateFormatting from './date-formatting';
import {
    getFormatPatternForBucket,
    showDateFinancialYearFormat,
} from './date-utils';
import {
    generateMapOptions,
    getBaseTypeFormatterInstanceExpensive,
    getDataFormatter,
    getFormatPattern,
} from './formatting-util';

jest.mock('./date-utils', () => ({
    getFormatPatternForBucket: jest.fn(),
    showDateFinancialYearFormat: jest.fn(),
    getCustomCalendarGuid: jest
        .fn()
        .mockReturnValue('7573c08b-753b-478b-84fd-6e702d481ff6'),
}));

describe('formatting utils', () => {
    const mockOptions = {
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
            DATE_SHORT: 'y',
        },
        quarter_of_year: 'Q{1}',
        tsDefinedCustomCalenders: {
            '43121d86-347a-4dbb-bea8-5e5bb899e427': {
                calendar: '7573c08b-753b-478b-84fd-6e702d481ff6',
                fiscal: 'bfa39848-ba4f-46d8-80fd-b695064e61b7',
                french: 'a7316e8d-d4dd-4eaf-9294-396db951b422',
            },
        },
        displayToCustomCalendarValueMap: {
            '1234567891': {
                v: {
                    s: 'start',
                    e: 'end',
                },
                d: 'custom Date',
            },
            '1234567892': {
                v: {
                    s: '1234567890',
                    e: 'end',
                },
            },
        },
    };
    test('getFormatPattern should call getFormatPatternForBucket with bucket and return pattern', () => {
        const column = {
            id: 'testId',
            name: 'test',
            type: ColumnType.MEASURE,
            chartSpecificColumnType: ChartSpecificColumnType.UNKNOWN,
            timeBucket: ColumnTimeBucket.YEARLY,
            dataType: DataType.DATE,
            calenderGuid: '12345',
        } as ChartColumn;

        expect(getFormatPattern(column)).toBe(undefined);
        expect(getFormatPatternForBucket).toHaveBeenCalledWith(
            column.timeBucket,
        );
    });
    test('should return date formatter if column is date', () => {
        const column = {
            id: 'testId',
            name: 'test',
            type: ColumnType.MEASURE,
            chartSpecificColumnType: ChartSpecificColumnType.UNKNOWN,
            timeBucket: ColumnTimeBucket.YEARLY,
            dataType: DataType.DATE,
            calenderGuid: '12345',
        } as ChartColumn;
        const options = { isMillisIncluded: true };

        const formatter = getBaseTypeFormatterInstanceExpensive(
            column,
            options,
        );

        expect(typeof formatter).toBe('function');
        const formattedDate = formatter(1234567890, mockOptions);
        expect(formattedDate).toBe('2009');
        const customFormattedDate = formatter(1234567891, mockOptions);
        const customFormattedDateWithoutDisplayValue = formatter(
            1234567892,
            mockOptions,
        );
        expect(customFormattedDateWithoutDisplayValue).toBe('2009');
        expect(customFormattedDate).toBe('custom Date');
        expect(showDateFinancialYearFormat).toHaveBeenCalledWith(column);
    });
    test('should return dateNum formatter if column is dateNum', () => {
        const column = {
            id: 'testId',
            name: 'test',
            type: ColumnType.ATTRIBUTE,
            chartSpecificColumnType: ChartSpecificColumnType.UNKNOWN,
            timeBucket: ColumnTimeBucket.HOUR_OF_DAY,
            dataType: DataType.INT64,
            calenderGuid: '12345',
        } as ChartColumn;
        const options = { isMillisIncluded: true };
        const formatter = getBaseTypeFormatterInstanceExpensive(
            column,
            options,
        );

        expect(typeof formatter).toBe('function');
        const formattedDate = formatter(1234567890, mockOptions);
        expect(formattedDate).toBe(1234567890);
        const customFormattedDate = formatter(1234567891, mockOptions);
        const customFormattedDateWithoutDisplayValue = formatter(
            1234567892,
            mockOptions,
        );
        expect(customFormattedDateWithoutDisplayValue).toBe(1234567892);
        expect(customFormattedDate).toBe('custom Date');
    });
    test('should return a default formatter for non-date types', () => {
        const column = {
            id: 'testId',
            name: 'test',
            type: ColumnType.MEASURE,
            chartSpecificColumnType: ChartSpecificColumnType.UNKNOWN,
            timeBucket: ColumnTimeBucket.HOUR_OF_DAY,
            dataType: DataType.INT64,
            calenderGuid: '12345',
        } as ChartColumn;
        const options = { isMillisIncluded: true };
        const formatter = getBaseTypeFormatterInstanceExpensive(
            column,
            options,
        );

        expect(formatter('test')).toBe('test');
    });
    test('getDataFormatter should return appropriate formatter based on column type', () => {
        const column = {
            id: 'testId',
            name: 'test',
            type: ColumnType.ATTRIBUTE,
            chartSpecificColumnType: ChartSpecificColumnType.UNKNOWN,
            timeBucket: ColumnTimeBucket.YEARLY,
            dataType: DataType.DATE,
            calenderGuid: '12345',
        } as ChartColumn;
        const options = { isMillisIncluded: true };

        const formatter = getDataFormatter(column, options);

        expect(typeof formatter).toBe('function');
        const formattedDate = formatter(1234567890, mockOptions);
        expect(formattedDate).toBe('2009');
        const customFormattedDate = formatter(1234567891, mockOptions);
        const customFormattedDateWithoutDisplayValue = formatter(
            1234567892,
            mockOptions,
        );
        expect(customFormattedDateWithoutDisplayValue).toBe('2009');
        expect(customFormattedDate).toBe('custom Date');
        expect(showDateFinancialYearFormat).toHaveBeenCalledWith(column);
    });
    test('generateMapOptions should return map options based on appConfig and column', () => {
        const column = {
            id: 'testId',
            name: 'test',
            type: ColumnType.ATTRIBUTE,
            chartSpecificColumnType: ChartSpecificColumnType.UNKNOWN,
            timeBucket: ColumnTimeBucket.YEARLY,
            dataType: DataType.DATE,
            calenderGuid: '12345',
        } as ChartColumn;

        const appConfig = {
            localeOptions: { locale: 'en-US', quarterStartMonth: 1 },
            dateFormatsConfig: {
                tsLocaleBasedDateFormats: 'MM-DD-YYYY',
                tsLocaleBasedStringsFormats: 'YYYY/MM/DD',
                tsDateConstants: {},
                tsDefinedCustomCalenders: {},
                DEFAULT_DATASOURCE_ID: 'source1',
            },
        };
        const data = [{ v: { s: 'key1' } }, { v: { s: 'key2' } }];

        const mapOptions = generateMapOptions(appConfig, column, data);

        expect(mapOptions.locale).toBe('en-US');
        expect(mapOptions.quarterStartMonth).toBe(1);
        expect(mapOptions.displayToCustomCalendarValueMap).toEqual({
            key1: data[0],
            key2: data[1],
        });
    });
    test('should have format pattern as DATETIME_SHORT_WITH_MILLIS when format pattern is null', () => {
        const column = {
            id: 'testId',
            name: 'test',
            type: ColumnType.VIRTUAL,
            chartSpecificColumnType: ChartSpecificColumnType.UNKNOWN,
            timeBucket: ColumnTimeBucket.MONTHLY,
            dataType: DataType.DATE_TIME,
            calenderGuid: '12345',
        } as ChartColumn;
        const options = { isMillisIncluded: true };
        const formatter = getBaseTypeFormatterInstanceExpensive(
            column,
            options,
        );
        expect(typeof formatter).toBe('function');
    });
    test('should correctly set format pattern for date-time column with and without milliseconds', () => {
        jest.spyOn(DateFormatting, 'formatDate').mockImplementation(jest.fn());
        const column = {
            id: 'testId',
            name: 'test',
            type: ColumnType.MEASURE,
            chartSpecificColumnType: ChartSpecificColumnType.UNKNOWN,
            timeBucket: ColumnTimeBucket.MONTHLY,
            dataType: DataType.DATE_TIME, // Indicates it's a date-time column
            calenderGuid: '12345',
        } as ChartColumn;

        const optionsWithMillis = { isMillisIncluded: true };
        const optionsWithoutMillis = { isMillisIncluded: false };

        const formatterWithMillis = getBaseTypeFormatterInstanceExpensive(
            column,
            optionsWithMillis,
        );
        const formatterWithoutMillis = getBaseTypeFormatterInstanceExpensive(
            column,
            optionsWithoutMillis,
        );

        expect(typeof formatterWithMillis).toBe('function');
        expect(typeof formatterWithoutMillis).toBe('function');

        // Mock dateFormatPresets to test the format patterns
        const dateFormatPresetsMock = {
            DATETIME_SHORT_WITH_MILLIS: 'DATETIME_SHORT_WITH_MILLIS',
            DATETIME_SHORT_WITH_SECONDS: 'DATETIME_SHORT_WITH_SECONDS',
        };

        // Mock formatted dates based on dateFormatPresets
        const formattedDateWithMillis = formatterWithMillis(
            1234567890,
            mockOptions,
        );
        expect(DateFormatting.formatDate).toHaveBeenCalledWith(
            1234567890,
            dateFormatPresetsMock.DATETIME_SHORT_WITH_MILLIS,
            true,
            {
                ...mockOptions,
                customCalendarOverridesFiscalOffset: true,
            },
        );
        const formattedDateWithoutMillis = formatterWithoutMillis(
            1234567890,
            mockOptions,
        );
        expect(DateFormatting.formatDate).toHaveBeenCalledWith(
            1234567890,
            dateFormatPresetsMock.DATETIME_SHORT_WITH_SECONDS,
            true,
            {
                ...mockOptions,
                customCalendarOverridesFiscalOffset: true,
            },
        );
        // expect(formattedDateWithoutMillis).toBe('MM/DD/YYYY HH:mm:ss'); // Expect pattern without millis
    });
});
