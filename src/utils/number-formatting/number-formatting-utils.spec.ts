import {
    ColumnFormat,
    CurrencyFormat,
    CurrencyFormatType,
    FormatType,
} from '../../types/answer-column.types';
import {
    CategoryType,
    CurrencyFormatConfig,
    NegativeValueFormat,
    NumberFormatConfig,
    Unit,
} from '../../types/number-formatting.types';
import * as globalizeUtils from '../globalize-Initializer/globalize-utils';
import {
    defaultFormatConfig,
    formatNegativeValue,
    formatSpecialDataValue,
    getAutoUnit,
    getLocaleBasedStringFormats,
    getLocaleName,
    mapFormatterConfig,
    PROTO_TO_UNITS,
    setLocaleBasedStringFormats,
    UNITS_TO_DIVIDING_FACTOR,
} from './number-formatting-utils';

describe('formatNegativeValue', () => {
    it('should format with prefix dash', () => {
        const result = formatNegativeValue(
            '100',
            NegativeValueFormat.PrefixDash,
        );
        expect(result).toBe('-100');
    });

    it('should format with suffix dash', () => {
        const result = formatNegativeValue(
            '100',
            NegativeValueFormat.SuffixDash,
        );
        expect(result).toBe('100-');
    });

    it('should format with braces without dash', () => {
        const result = formatNegativeValue(
            '100',
            NegativeValueFormat.BracesNodash,
        );
        expect(result).toBe('(100)');
    });

    it('should default to prefix dash if no format is provided', () => {
        const result = formatNegativeValue('100');
        expect(result).toBe('-100');
    });

    it('should convert a numeric negative format to a string format', () => {
        // Case where negativeFormat is a number
        const negativeFormatNumber = 1; // For example, PrefixDash
        const formattedValue = '100.25'; // some sample value to format

        // Before mapping, negativeFormat should be a number
        let result = formatNegativeValue(
            formattedValue,
            negativeFormatNumber as number,
        );
        expect(result).toBe('-100.25'); // PrefixDash adds a '-' before the value

        // Case with a different number for negative format
        const negativeFormatNumber2 = 2; // For example, SuffixDash
        result = formatNegativeValue(formattedValue, negativeFormatNumber2);
        expect(result).toBe('100.25-'); // SuffixDash adds a '-' after the value
    });
});

describe('getAutoUnit', () => {
    it('should return Trillion for values above 1 Trillion', () => {
        const result = getAutoUnit(1e12);
        expect(result).toBe(Unit.Trillion);
    });

    it('should return Billion for values above 1 Billion', () => {
        const result = getAutoUnit(1e9);
        expect(result).toBe(Unit.Billion);
    });

    it('should return Million for values above 1 Million', () => {
        const result = getAutoUnit(1e6);
        expect(result).toBe(Unit.Million);
    });

    it('should return Thousands for values above 1 Thousand', () => {
        const result = getAutoUnit(1e3);
        expect(result).toBe(Unit.Thousands);
    });

    it('should return None for values below 1000', () => {
        const result = getAutoUnit(500);
        expect(result).toBe(Unit.None);
    });
});

describe('getLocaleName', () => {
    it('should return default locale if currency format is not ISO_CODE', () => {
        jest.spyOn(
            globalizeUtils,
            'getDefaultCurrencyCode',
        ).mockReturnValueOnce('GBP');
        const currencyFormat: CurrencyFormat = {
            type: CurrencyFormatType.USER_LOCALE,
            column: '',
            isoCode: '',
        };
        const result = getLocaleName(currencyFormat);
        expect(result).toBe('GBP'); // Default locale
    });

    it('should return ISO code if currency format is ISO_CODE', () => {
        const currencyFormat: CurrencyFormat = {
            type: CurrencyFormatType.ISO_CODE,
            column: '',
            isoCode: 'USD',
        };
        const result = getLocaleName(currencyFormat);
        expect(result).toBe('USD');
    });
});

describe('defaultFormatConfig', () => {
    it('should return custom format config for a pattern', () => {
        const columnFormatConfig: ColumnFormat = {
            type: FormatType.PATTERN,
            pattern: '###,###',
        };
        const result = defaultFormatConfig(columnFormatConfig);
        expect(result.category).toBe(CategoryType.Custom);
        expect(result.customFormatConfig?.format).toBe('###,###');
    });

    it('should return currency format config if currencyFormat is defined', () => {
        const columnFormatConfig: ColumnFormat = {
            type: FormatType.CURRENCY,
            currencyFormat: {
                type: CurrencyFormatType.ISO_CODE,
                column: '',
                isoCode: 'USD',
            },
        };
        const result = defaultFormatConfig(columnFormatConfig);
        expect(result.category).toBe(CategoryType.Currency);
        expect(result.currencyFormatConfig?.locale).toBe('USD');
    });

    it('should return number format config by default', () => {
        const result = defaultFormatConfig();
        expect(result.category).toBe(CategoryType.Number);
        expect(result.numberFormatConfig?.decimals).toBe(0);
    });
});

describe('mapFormatterConfig', () => {
    it('should return correct formatter config for a number format', () => {
        const absFloatValue = 1000;
        const configDetails: NumberFormatConfig = {
            decimals: 2,
            negativeValueFormat: NegativeValueFormat.PrefixDash,
            removeTrailingZeroes: false,
            toSeparateThousands: true,
            unit: Unit.Million,
        };

        const result = mapFormatterConfig(absFloatValue, configDetails);
        expect(result.unitDetails).toBe(Unit.Million); // Unit: Million
        expect(result.decimalDetails).toBe(2);
        expect(result.shouldRemoveTrailingZeros).toBe(false);
    });

    it('should return auto unit and decimal precision for large value', () => {
        const absFloatValue = 1e9; // 1 Billion
        const configDetails: NumberFormatConfig = {
            decimals: 0,
            negativeValueFormat: NegativeValueFormat.PrefixDash,
            removeTrailingZeroes: false,
            toSeparateThousands: true,
            unit: Unit.Auto, // Auto
        };

        const result = mapFormatterConfig(absFloatValue, configDetails);
        expect(result.unitDetails).toBe(Unit.Billion);
        expect(result.decimalDetails).toBe(2); // Default decimal precision for auto
    });

    it('should return correct config for currency formatting', () => {
        const absFloatValue = 1000;
        const configDetails: CurrencyFormatConfig = {
            decimals: 2,
            locale: 'en',
            removeTrailingZeroes: false,
            toSeparateThousands: true,
            unit: Unit.Auto,
        };

        const result = mapFormatterConfig(absFloatValue, configDetails);
        expect(result.unitDetails).toBe(Unit.Thousands); // Automatically chosen unit
        expect(result.decimalDetails).toBe(2);
    });

    it('should correctly map valid unit numbers to the corresponding unit', () => {
        const input = { unit: 1 };
        const result = mapFormatterConfig(1000, input);

        // Assert that the unit has been correctly mapped to the corresponding
        // value in PROTO_TO_UNITS
        expect(result.unitDetails).toBe(PROTO_TO_UNITS[1]);
    });
});

describe('formatSpecialDataValue', () => {
    it('should return {Null} for {Null} values', () => {
        const result = formatSpecialDataValue('{Null}');
        expect(result).toBe('{Null}');
    });

    it('should return {Null} for null values', () => {
        const result = formatSpecialDataValue(null);
        expect(result).toBe('{Null}');
    });

    it('should return {Empty} for empty string', () => {
        const result = formatSpecialDataValue('');
        expect(result).toBe('{Empty}');
    });

    it('should return {Null} for undefined values', () => {
        const result = formatSpecialDataValue(undefined);
        expect(result).toBe('{Null}');
    });

    it('should return NaN for string "NaN"', () => {
        const result = formatSpecialDataValue(['NaN']);
        expect(result).toBe('NaN');
    });

    it('should return {Null} for empty array', () => {
        const result = formatSpecialDataValue([]);
        expect(result).toBe('{Null}');
    });

    it('should return Null for array', () => {
        const result = formatSpecialDataValue(['Test']);
        expect(result).toBe(null);
    });

    it('should return Infinity for string "Infinity"', () => {
        const result = formatSpecialDataValue(['Infinity']);
        expect(result).toBe('Infinity');
    });

    it('should return null for non-special values', () => {
        const result = formatSpecialDataValue('Test');
        expect(result).toBeNull();
    });

    it('should return Infinity for Infinity', () => {
        const result = formatSpecialDataValue(Infinity);
        expect(result).toBe('Infinity');
    });
});

describe('Unit constants', () => {
    it('should map unit to correct dividing factor', () => {
        expect(UNITS_TO_DIVIDING_FACTOR[Unit.Thousands]).toBe(1000);
        expect(UNITS_TO_DIVIDING_FACTOR[Unit.Million]).toBe(1000000);
        expect(UNITS_TO_DIVIDING_FACTOR[Unit.Billion]).toBe(1000000000);
    });

    it('should map proto to correct unit', () => {
        expect(PROTO_TO_UNITS[1]).toBe(Unit.None);
        expect(PROTO_TO_UNITS[2]).toBe(Unit.Thousands);
        expect(PROTO_TO_UNITS[3]).toBe(Unit.Million);
    });
});

describe('Locale String Formats', () => {
    const strings: Record<string, string> = {
        NULL_VALUE_PLACEHOLDER_LABEL: '{Null}',
        EMPTY_VALUE_PLACEHOLDER_LABEL: '{Empty}',
    };

    it('should return an default object if setLocaleBasedStringFormats is not called', () => {
        const result = getLocaleBasedStringFormats();
        expect(result).toEqual(strings);
    });

    it('should set and get locale-based string formats correctly', () => {
        const testLocaleStrings = {
            greeting: 'Hello',
            farewell: 'Goodbye',
        };

        setLocaleBasedStringFormats(testLocaleStrings);

        const result = getLocaleBasedStringFormats();

        expect(result).toEqual(testLocaleStrings);
    });

    it('should update the string formats when setLocaleBasedStringFormats is called multiple times', () => {
        const firstSet = { greeting: 'Hola' };
        const secondSet = { greeting: 'Bonjour' };

        // Set first locale-based string formats
        setLocaleBasedStringFormats(firstSet);
        expect(getLocaleBasedStringFormats()).toEqual(firstSet);

        // Set second locale-based string formats
        setLocaleBasedStringFormats(secondSet);
        expect(getLocaleBasedStringFormats()).toEqual(secondSet);
    });
});
