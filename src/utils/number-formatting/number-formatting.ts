/**
 * @file: Number Formatting Utils
 *
 * @author Yashvardhan Nehra <yashvardhan.nehra@thoughtspot.com>
 *
 * Copyright: ThoughtSpot Inc. 2024
 */
import _ from 'lodash';
import {
    ColumnFormat,
    CurrencyFormat,
    CurrencyFormatType,
} from '../../types/answer-column.types';
import {
    CategoryType,
    FormatConfig,
    Unit,
} from '../../types/number-formatting.types';
import {
    formatNumberSafely,
    getDefaultCurrencyCode,
    globalizeCurrencyFormatter,
    globalizeNumberFormatter,
    sanitizeFormat,
    validateNumberFormat,
} from '../globalize-setup';
import {
    defaultFormatConfig,
    formatNegativeValue,
    formatSpecialDataValue,
    getLocaleName,
    mapFormatterConfig,
    UNITS_TO_DIVIDING_FACTOR,
    UNITS_TO_SUFFIX,
} from './formatting-utils';

const CURRENCY_CODE_EXTRACTOR_REGEX = /[\d.,]+/g;

/**
 * Formats a number with a custom pattern and combines it with a currency symbol.
 *
 * @param value - The numeric value to format.
 * @param currencyCode - The ISO currency code (e.g., 'USD').
 * @param formatPattern - The custom format pattern (e.g., '#,##0.00').
 * @returns The formatted value with the currency symbol.
 */
const formatCurrencyWithCustomPattern = (
    value: number,
    currencyCode: string,
    formatPattern: string,
): string => {
    // Sanitize the custom format pattern
    const sanitizedPattern = sanitizeFormat(formatPattern);

    // Create a custom number formatter
    const customFormatter = globalizeNumberFormatter({
        ...({ raw: sanitizedPattern } as any),
    });

    const formattedValue = customFormatter(value);

    const currencyFormatter = globalizeCurrencyFormatter(currencyCode, {
        style: 'symbol',
    });

    const currencySymbol = currencyFormatter(0).replace(
        CURRENCY_CODE_EXTRACTOR_REGEX,
        '',
    ); // Extract the currency symbol

    // Combine the custom formatted value with the currency symbol
    return `${currencySymbol}${formattedValue}`;
};

/**
 * Formats a value based on the provided format configuration and column settings.
 *
 * @param value - The value to format (can be a string or number).
 * @param formatConfigProp - The format configuration for the value.
 * @param columnFormatConfig - The column-specific formatting settings.
 * @returns The formatted value as a string.
 */
export const getFormattedValue = (
    value: string | number,
    formatConfigProp: FormatConfig,
    columnFormatConfig: ColumnFormat,
): string => {
    let formatConfig = _.cloneDeep(formatConfigProp);

    // Use default configuration if none is provided
    if (_.isNil(formatConfig)) {
        formatConfig = defaultFormatConfig(columnFormatConfig);
    }
    // Normalize category to a proper type
    if (typeof formatConfig.category === 'number') {
        formatConfig.category = CategoryType.Number;
    }

    // Handle special data values (e.g., NaN, Infinity)
    const specialVal = formatSpecialDataValue(value);
    if (specialVal) {
        return specialVal;
    }

    // Convert value to a float
    const floatValue = parseFloat(value.toString());
    const absFloatValue = Math.abs(floatValue);

    if (formatConfig.category === CategoryType.Number) {
        const configDetails = formatConfig.numberFormatConfig || {};
        const formatterConfigMap = mapFormatterConfig(
            absFloatValue,
            configDetails,
        );
        const compactValue =
            absFloatValue /
            UNITS_TO_DIVIDING_FACTOR[formatterConfigMap.unitDetails as Unit];
        const suffix = UNITS_TO_SUFFIX[formatterConfigMap.unitDetails];
        const formattedValue = formatNumberSafely(
            {
                style: 'decimal',
                maximumFractionDigits: formatterConfigMap.decimalDetails,
                minimumFractionDigits: formatterConfigMap.shouldRemoveTrailingZeros
                    ? 0
                    : formatterConfigMap.decimalDetails,
                useGrouping: configDetails.toSeparateThousands || false,
            },
            compactValue,
        );
        const absFormattedValue = `${formattedValue}${suffix}`;

        if (absFloatValue !== floatValue) {
            return formatNegativeValue(
                absFormattedValue,
                configDetails.negativeValueFormat,
            );
        }
        return absFormattedValue;
    }

    if (formatConfig.category === CategoryType.Percentage) {
        const configDetails = formatConfig.percentageFormatConfig;
        const decimalDetails = configDetails?.decimals || 0;
        return formatNumberSafely(
            {
                style: 'percent',
                maximumFractionDigits: decimalDetails,
                minimumFractionDigits: configDetails?.removeTrailingZeroes
                    ? 0
                    : decimalDetails,
            },
            floatValue,
        );
    }

    if (formatConfig.category === CategoryType.Currency) {
        const configDetails = formatConfig.currencyFormatConfig || {};
        const formatterConfigMap = mapFormatterConfig(
            absFloatValue,
            configDetails,
        );
        const compactValue =
            floatValue /
            UNITS_TO_DIVIDING_FACTOR[formatterConfigMap.unitDetails];

        let locale = configDetails.locale || getDefaultCurrencyCode();
        if (locale === CurrencyFormatType.USER_LOCALE) {
            locale = getLocaleName({
                type: locale,
            } as CurrencyFormat);
        }
        try {
            const formatter = globalizeCurrencyFormatter(locale, {
                style: 'symbol',
                maximumFractionDigits: formatterConfigMap.decimalDetails,
                minimumFractionDigits: formatterConfigMap.shouldRemoveTrailingZeros
                    ? 0
                    : formatterConfigMap.decimalDetails,
                useGrouping: configDetails.toSeparateThousands || false,
            });

            const formattedValue = formatter(compactValue);
            const currencyCode = formattedValue.replace(
                CURRENCY_CODE_EXTRACTOR_REGEX,
                '',
            );
            /**
             * When we format the value in Millions, Billions etc,
             * we have to handle the scenario of the unit suffix, currencycode and the formatted
             * value We test the presence of numeric character with the help of regex and then
             * we append the apt suffix and currencyCode to the formatted value
             */
            const suffix = !_.isNil(floatValue)
                ? UNITS_TO_SUFFIX[formatterConfigMap.unitDetails]
                : '';
            if (/[0-9]$/.test(formattedValue.charAt(0))) {
                return `${formattedValue.replace(
                    currencyCode,
                    '',
                )}${suffix}${currencyCode}`;
            }
            return `${formattedValue}${suffix}`;
        } catch (e) {
            console.error(
                'Corrupted format config passed, formatting using default config',
                formatConfig,
                e,
            );
        }
    }

    if (formatConfig.category === CategoryType.Custom) {
        const formatPattern = formatConfig.customFormatConfig?.format;
        const currencyCode = columnFormatConfig.currencyFormat?.isoCode;
        if (
            !_.isNil(formatPattern) &&
            validateNumberFormat(sanitizeFormat(formatPattern))
        ) {
            const sanitizedPattern = sanitizeFormat(formatPattern);
            if (!_.isNil(currencyCode)) {
                /**
                 * Globalize does not consider format pattern while formatting the currency,
                 * only the currency specific rules are considered, so need to combine. That's
                 * what we do in this formatCurrency method
                 */
                const formattedValueWithLocaleAndPattern = formatCurrencyWithCustomPattern(
                    floatValue,
                    currencyCode,
                    formatPattern,
                );
                return `${formattedValueWithLocaleAndPattern}`;
            }
            return formatNumberSafely(
                {
                    style: 'decimal',
                    raw: sanitizedPattern,
                },
                floatValue as any,
            );
        }
        console.error('Invalid custom format config passed:', formatConfig);
    }

    // Default fallback: Decimal formatting
    return formatNumberSafely(
        {
            style: 'decimal',
        },
        floatValue as any,
    );
};
