/**
 * @file: Number Formatting Utils
 *
 * @author Yashvardhan Nehra <yashvardhan.nehra@thoughtspot.com>
 *
 * Copyright: ThoughtSpot Inc. 2023
 */

/* eslint-disable import/no-extraneous-dependencies */
import Globalize from 'globalize';
import _ from 'lodash';
import { ColumnFormat } from '../../types/answer-column.types';
import {
    CategoryType,
    FormatConfig,
    Unit,
} from '../../types/number-formatting.types';
import { getDefaultCurrencyCode } from '../globalize-setup';
import {
    defaultFormatConfig,
    formatNegativeValue,
    formatNumberSafely,
    formatSpecialDataValue,
    mapFormatterConfig,
    UNITS_TO_DIVIDING_FACTOR,
    UNITS_TO_SUFFIX,
} from './formatting-utils';

const CURRENCY_CODE_EXTRACTOR_REGEX = /[\d.,]+/g;

const sanitizeFormat = (format: string) => {
    // Globalize needs to have a zero before the decimal point
    // or at the end of format if no decimal point
    let sanitizedFormat = format.replace(/#\./, '0.');
    if (!sanitizedFormat.includes('.')) {
        sanitizedFormat = sanitizedFormat.replace(/#(%?)$/, '0$1');
    }
    return sanitizedFormat;
};

const validateNumberFormat = (format: string) => {
    try {
        Globalize.numberFormatter({
            ...({ raw: sanitizeFormat(format) } as any),
        })(123);
    } catch (e) {
        console.log('Format pattern validator error', format, e);
        return false;
    }
    return true;
};

const formatCurrencyWithCustomPattern = (
    value: number,
    currencyCode: string,
    formatPattern: string,
): string => {
    // Format the value with the custom pattern
    const sanitizedPattern = sanitizeFormat(formatPattern);
    const customFormatter = Globalize.numberFormatter({
        ...({ raw: sanitizedPattern } as any),
    });

    const formattedValue = customFormatter(value);

    // Format the currency symbol
    const currencyFormatter = Globalize.currencyFormatter(currencyCode, {
        style: 'symbol',
    });

    const currencySymbol = currencyFormatter(0).replace(
        CURRENCY_CODE_EXTRACTOR_REGEX,
        '',
    ); // Extract the currency symbol

    // Combine the custom formatted value with the currency symbol
    return `${currencySymbol}${formattedValue}`;
};

export const getFormattedValue = (
    value: string | number,
    formatConfigProp: FormatConfig,
    columnFormatConfig: ColumnFormat,
): string => {
    let formatConfig = _.cloneDeep(formatConfigProp);
    if (_.isNil(formatConfig)) {
        formatConfig = defaultFormatConfig(columnFormatConfig);
    }

    if (typeof formatConfig.category === 'number') {
        formatConfig.category = CategoryType.Number;
    }
    const specialVal = formatSpecialDataValue(value);
    if (specialVal) {
        return specialVal;
    }
    const floatValue = parseFloat(value.toString()); // converts string value into number, x.00 into 0
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
        const absFormattedValue = !_.isNil(absFloatValue)
            ? `${formattedValue}${suffix}`
            : formattedValue;
        if (absFloatValue && absFloatValue !== floatValue) {
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
        try {
            const formatter = Globalize.currencyFormatter(
                configDetails.locale || getDefaultCurrencyCode(),
                {
                    style: 'symbol',
                    maximumFractionDigits: formatterConfigMap.decimalDetails,
                    minimumFractionDigits: formatterConfigMap.shouldRemoveTrailingZeros
                        ? 0
                        : formatterConfigMap.decimalDetails,
                    useGrouping: configDetails.toSeparateThousands || false,
                },
            );
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
    /**
     * Empty check of the formatPAttern is done to avoid the mis-formatting
    * of the value in the case of CURRENCY_FROM_COLUMN as in that case it
    does not have * formatPattern
     */
    if (formatConfig.category === CategoryType.Custom) {
        const formatPattern = formatConfig.customFormatConfig?.format;
        const currencyCode = columnFormatConfig.currencyFormat?.isoCode;
        if (!_.isNil(formatPattern)) {
            const sanitizedPattern = sanitizeFormat(formatPattern);
            if (!_.isNil(currencyCode)) {
                if (validateNumberFormat(sanitizedPattern)) {
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
                console.debug(
                    'Corrupted format config passed, formatting using default config',
                    formatConfig,
                );

                return formatNumberSafely(
                    {
                        style: 'decimal',
                    },
                    floatValue as any,
                );
            }
            if (validateNumberFormat(sanitizedPattern)) {
                return formatNumberSafely(
                    {
                        style: 'decimal',
                        raw: sanitizedPattern,
                    },
                    floatValue as any,
                );
            }
        }
    }

    return formatNumberSafely(
        {
            style: 'decimal',
        },
        floatValue as any,
    );
};
