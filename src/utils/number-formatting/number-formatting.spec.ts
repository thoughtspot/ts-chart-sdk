import { initial } from 'lodash';
import {
    ColumnFormat,
    CurrencyFormatType,
    FormatType,
} from '../../types/answer-column.types';
import {
    CategoryType,
    FormatConfig,
    NegativeValueFormat,
    Unit,
} from '../../types/number-formatting.types';
import {
    formatNumberSafely,
    globalizeCurrencyFormatter,
    globalizeNumberFormatter,
    initializeGlobalize,
    sanitizeFormat,
} from '../globalize-Initializer/globalize-utils';
import * as globalizeUtils from '../globalize-Initializer/globalize-utils';
import {
    formatCurrencyWithCustomPattern,
    getFormattedValue,
} from './number-formatting';

describe('formatCurrencyWithCustomPattern', () => {
    beforeAll(() => {
        initializeGlobalize('en-US');
    });
    test('formats value with a custom pattern and currency symbol', () => {
        const value = 12345.678;
        const currencyCode = 'USD';
        const formatPattern = '#,##0.00';

        const result = formatCurrencyWithCustomPattern(
            value,
            currencyCode,
            formatPattern,
        );
        expect(result).toBe('$12,345.68');
    });
});

describe('getFormattedValue', () => {
    beforeAll(() => {
        initializeGlobalize('en-US');
    });
    const columnFormatConfig: ColumnFormat = {
        type: FormatType.CURRENCY,
        currencyFormat: {
            type: CurrencyFormatType.ISO_CODE,
            column: '',
            isoCode: 'USD',
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('uses Number Fromatting as default configuration when formatConfigProp &  columnFormatConfig are null', () => {
        const result = getFormattedValue(12345, {}, {} as ColumnFormat);
        expect(result).toBe('12.35K');
    });

    test('use Custom Formatting as default configuration when only formatConfigProp is null', () => {
        const result = getFormattedValue(12345, {}, columnFormatConfig);
        expect(result).toBe('$12.35K');
    });

    test('formats special values (NaN, Infinity)', () => {
        expect(getFormattedValue(NaN, {}, {} as ColumnFormat)).toBe('NaN');
        expect(getFormattedValue(Infinity, {}, {} as ColumnFormat)).toBe(
            'Infinity',
        );
        expect(getFormattedValue(-Infinity, {}, {} as ColumnFormat)).toBe(
            '-Infinity',
        );
    });

    test('formats number category values with units and trailing zeroes', () => {
        const formatConfig: FormatConfig = {
            category: CategoryType.Number,
            numberFormatConfig: {
                unit: Unit.Thousands,
                decimals: 2,
                toSeparateThousands: true,
                negativeValueFormat: NegativeValueFormat.PrefixDash,
            },
        };
        const result = getFormattedValue(
            -12345,
            formatConfig,
            {} as ColumnFormat,
        );
        expect(result).toBe('-12.35K'); // Update based on actual expected output
    });

    test('formats percentage values correctly', () => {
        const formatConfig: FormatConfig = {
            category: CategoryType.Percentage,
            percentageFormatConfig: { decimals: 2, removeTrailingZeroes: true },
        };
        const result = getFormattedValue(
            0.1234,
            formatConfig,
            {} as ColumnFormat,
        );
        expect(result).toBe('12.34%');
    });

    test('formats currency values with compact units', () => {
        const formatConfig: FormatConfig = {
            category: CategoryType.Currency,
            currencyFormatConfig: {
                locale: 'USD',
                toSeparateThousands: true,
            },
        };
        const result = getFormattedValue(
            12345.678,
            formatConfig,
            {} as ColumnFormat,
        );
        // eslint-disable-next-line security/detect-unsafe-regex
        expect(result).toMatch(/^\$\d+,\d+(\.\d+)?$/); // Update expected value
    });

    test('formats currency values with user Locale', () => {
        jest.spyOn(
            globalizeUtils,
            'getDefaultCurrencyCode',
        ).mockImplementationOnce(() => 'INR');
        const formatConfig: FormatConfig = {
            category: CategoryType.Currency,
            currencyFormatConfig: {
                unit: Unit.Thousands,
                decimals: 2,
                locale: CurrencyFormatType.USER_LOCALE,
                toSeparateThousands: true,
            },
        };
        const result = getFormattedValue(
            12345.678,
            formatConfig,
            {} as ColumnFormat,
        );
        expect(result).toMatch('₹12.35K'); // Update expected value
    });

    test('should normalize category to CategoryType.Number when it is a number', () => {
        // Mock formatConfig with category as a number
        const formatConfig: FormatConfig = {
            category: 12345 as any,
            numberFormatConfig: {
                unit: Unit.Thousands,
                decimals: 2,
                toSeparateThousands: true,
                negativeValueFormat: NegativeValueFormat.PrefixDash,
            },
        };

        const result = getFormattedValue(
            1000,
            formatConfig,
            {} as ColumnFormat,
        );

        expect(result).toBe('1.00K'); // Update based on actual expected output
    });

    test('falls back to default formatting for unsupported categories', () => {
        const formatConfig: FormatConfig = { category: 'Unknown' as any };
        const result = getFormattedValue(
            12345.678,
            formatConfig,
            {} as ColumnFormat,
        );
        expect(result).toBe('12,345.678'); // Update based on fallback behavior
    });

    test('formats custom pattern correctly', () => {
        const formatConfig: FormatConfig = {
            category: CategoryType.Custom,
            customFormatConfig: { format: '#,##0.00' },
        };
        const result = getFormattedValue(
            12345.678,
            formatConfig,
            {} as ColumnFormat,
        );
        expect(result).toBe('12,345.68'); // Update based on actual output
    });

    test('formats custom pattern with valid customColumn format', () => {
        const formatConfig: FormatConfig = {
            category: CategoryType.Custom,
            customFormatConfig: { format: '#,##0.00' },
        };
        const result = getFormattedValue(
            12345.678,
            formatConfig,
            columnFormatConfig,
        );
        expect(result).toBe('$12,345.68'); // Update based on actual output
    });

    test('logs error for invalid custom format patterns', () => {
        const formatConfig: FormatConfig = {
            category: CategoryType.Custom,
            customFormatConfig: { format: 'invalid-format' },
        };
        const consoleSpy = jest
            .spyOn(console, 'error')
            .mockImplementationOnce(() => undefined);
        getFormattedValue(12345.678, formatConfig, {} as ColumnFormat);
        expect(consoleSpy).toHaveBeenCalledWith(
            'Invalid custom format config passed:',
            formatConfig,
        );
        consoleSpy.mockRestore();
        jest.resetAllMocks();
    });

    test('handles currency formatting failure gracefully', () => {
        const formatConfig: FormatConfig = {
            category: CategoryType.Currency,
        };
        const consoleSpy = jest
            .spyOn(console, 'error')
            .mockImplementationOnce(() => undefined);
        jest.spyOn(
            globalizeUtils,
            'globalizeCurrencyFormatter',
        ).mockImplementationOnce(() => {
            throw new Error('Currency format error');
        });
        getFormattedValue(12345.678, formatConfig, {} as ColumnFormat);
        expect(consoleSpy).toHaveBeenCalledWith(
            'Corrupted format config passed, formatting using default config',
            formatConfig,
            new Error('Currency format error'),
        );
        consoleSpy.mockRestore();
        jest.resetAllMocks();
    });
});
