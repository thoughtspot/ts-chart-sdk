/**
 * @file: Formatting Utils
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
import { Maybe } from '../../types/common.types';
import {
    CategoryType,
    CurrencyFormatConfig,
    FormatConfig,
    NegativeValueFormat,
    NumberFormatConfig,
    Unit,
} from '../../types/number-formatting.types';
import { getDefaultCurrencyCode } from '../globalize-Initializer/globalize-utils';

interface FormatterConfig {
    unitDetails: Unit;
    decimalDetails: number;
    shouldRemoveTrailingZeros: boolean;
}

export const PROTO_TO_NEGATIVE_VALUE_FORMAT = {
    1: NegativeValueFormat.PrefixDash,
    2: NegativeValueFormat.SuffixDash,
    3: NegativeValueFormat.BracesNodash,
};

/**
 * Constants for unit conversions and suffixes.
 */
export const UNITS_TO_DIVIDING_FACTOR: Record<Unit, number> = {
    [Unit.None]: 1,
    [Unit.Thousands]: 1000,
    [Unit.Million]: 1000 * 1000,
    [Unit.Billion]: 1000 * 1000 * 1000,
    [Unit.Trillion]: 1000 * 1000 * 1000 * 1000,
    [Unit.Auto]: 1,
};

export const PROTO_TO_UNITS = {
    1: Unit.None,
    2: Unit.Thousands,
    3: Unit.Million,
    4: Unit.Billion,
    5: Unit.Trillion,
    6: Unit.Auto,
};

/**
 * Default strings for placeholders.
 */
let strings: Record<string, string> = {
    NULL_VALUE_PLACEHOLDER_LABEL: '{Null}',
    EMPTY_VALUE_PLACEHOLDER_LABEL: '{Empty}',
};

export const setLocaleBasedStringFormats = (
    tsLocaleBasedStringsFormats?: Record<string, string>,
) => {
    if (tsLocaleBasedStringsFormats) {
        strings = tsLocaleBasedStringsFormats;
    }
};

export const getLocaleBasedStringFormats = () => strings;

export const UNITS_TO_SUFFIX: Record<Unit, string> = {
    [Unit.None]: '',
    [Unit.Thousands]: 'K',
    [Unit.Million]: 'M',
    [Unit.Billion]: 'B',
    [Unit.Trillion]: 'T',
    [Unit.Auto]: '',
};

const DEFAULT_DECIMAL_PRECISION = 2;

/**
 * Formats negative values according to the specified format.
 *
 * @param formattedValue - The formatted value to modify.
 * @param negativeFormat - The desired negative value format.
 * @returns The formatted negative value.
 */
export const formatNegativeValue = (
    formattedValue: string,
    negativeFormat?: Maybe<NegativeValueFormat> | number,
): string => {
    if (typeof negativeFormat === 'number') {
        // eslint-disable-next-line no-param-reassign
        negativeFormat =
            PROTO_TO_NEGATIVE_VALUE_FORMAT[
                negativeFormat as keyof typeof PROTO_TO_NEGATIVE_VALUE_FORMAT
            ];
    }
    switch (negativeFormat) {
        case NegativeValueFormat.PrefixDash:
            return `-${formattedValue}`;
        case NegativeValueFormat.SuffixDash:
            return `${formattedValue}-`;
        case NegativeValueFormat.BracesNodash:
            return `(${formattedValue})`;
        default:
            return `-${formattedValue}`;
    }
};

/**
 * Determines the appropriate unit for auto-scaling values.
 *
 * @param value - The numeric value to evaluate.
 * @returns The appropriate unit (e.g., Thousand, Million, etc.).
 */
export const getAutoUnit = (value: number): Unit => {
    if (value >= UNITS_TO_DIVIDING_FACTOR[Unit.Trillion]) {
        return Unit.Trillion;
    }
    if (value >= UNITS_TO_DIVIDING_FACTOR[Unit.Billion]) {
        return Unit.Billion;
    }
    if (value >= UNITS_TO_DIVIDING_FACTOR[Unit.Million]) {
        return Unit.Million;
    }
    if (value >= UNITS_TO_DIVIDING_FACTOR[Unit.Thousands]) {
        return Unit.Thousands;
    }
    return Unit.None;
};

/**
 * Retrieves the locale name based on the provided currency format.
 *
 * @param currencyFormat - The currency format configuration.
 * @returns The locale name as a string.
 */
export const getLocaleName = (currencyFormat: CurrencyFormat): string => {
    if (currencyFormat.type === CurrencyFormatType.ISO_CODE) {
        return currencyFormat.isoCode;
    }

    const locale = getDefaultCurrencyCode();
    return locale;
};

/**
 * Generates a default format configuration based on the column settings.
 *
 * @param columnFormatConfig - The column-specific formatting settings.
 * @returns The default format configuration.
 */
export const defaultFormatConfig = (
    columnFormatConfig?: ColumnFormat,
): FormatConfig => {
    if (columnFormatConfig?.pattern) {
        return {
            __typename: 'FormatConfig',
            category: CategoryType.Custom,
            isCategoryEditable: true,
            customFormatConfig: {
                __typename: 'CustomFormatConfig',
                format: columnFormatConfig?.pattern,
            },
        };
    }
    if (columnFormatConfig?.currencyFormat) {
        const locale = getLocaleName(columnFormatConfig?.currencyFormat);
        const currencyFormatConfig: CurrencyFormatConfig = {
            __typename: 'CurrencyFormatConfig',
            decimals: 0,
            locale,
            removeTrailingZeroes: false,
            toSeparateThousands: true,
            unit: Unit.Auto,
        };
        const formatConfig: FormatConfig = {
            __typename: 'FormatConfig',
            category: CategoryType.Currency,
            isCategoryEditable: true,
            currencyFormatConfig,
        };
        return formatConfig;
    }
    const numberFormatConfig: NumberFormatConfig = {
        __typename: 'NumberFormatConfig',
        decimals: 0,
        negativeValueFormat: NegativeValueFormat.PrefixDash,
        removeTrailingZeroes: false,
        toSeparateThousands: true,
        unit: Unit.Auto,
    };
    const formatConfig: FormatConfig = {
        __typename: 'FormatConfig',
        category: CategoryType.Number,
        isCategoryEditable: true,
        numberFormatConfig,
        percentageFormatConfig: null,
    };
    return formatConfig;
};

/**
 * Maps configuration details to a formatter configuration object.
 *
 * @param absFloatValue - The absolute value of the number being formatted.
 * @param configDetails - The number or currency format configuration.
 * @returns A mapped formatter configuration.
 */
export const mapFormatterConfig = (
    absFloatValue: number,
    configDetails: NumberFormatConfig | CurrencyFormatConfig,
): FormatterConfig => {
    if (typeof configDetails.unit === 'number') {
        // eslint-disable-next-line no-param-reassign
        configDetails.unit =
            PROTO_TO_UNITS[configDetails.unit as keyof typeof PROTO_TO_UNITS];
    }
    const isAutoFormatted = configDetails.unit === Unit.Auto;
    let unitDetails = configDetails.unit || Unit.Auto;
    let decimalDetails = configDetails.decimals || 0;

    if (isAutoFormatted) {
        unitDetails = getAutoUnit(absFloatValue);
        if (unitDetails !== Unit.None) {
            decimalDetails = DEFAULT_DECIMAL_PRECISION;
        }
    }
    const shouldRemoveTrailingZeros =
        configDetails.removeTrailingZeroes || isAutoFormatted;
    return {
        unitDetails,
        decimalDetails,
        shouldRemoveTrailingZeros,
    };
};

/**
 * Handles formatting of special data values (e.g., null, empty, NaN, Infinity).
 *
 * @param value - The value to check and format.
 * @returns A formatted special value or null if not applicable.
 */
export function formatSpecialDataValue(value: any) {
    if (
        value === strings.NULL_VALUE_PLACEHOLDER_LABEL ||
        value === strings.EMPTY_VALUE_PLACEHOLDER_LABEL
    ) {
        return value;
    }

    if (value === null || value === undefined) {
        return strings.NULL_VALUE_PLACEHOLDER_LABEL;
    }

    if (value === Infinity || value === -Infinity || _.isNaN(value)) {
        return value.toString();
    }
    // {Empty} placeholder is set for empty string or no characters
    // other than spaces.
    if (value === '') {
        return strings.EMPTY_VALUE_PLACEHOLDER_LABEL;
    }
    if (value instanceof Array) {
        if (_.isEmpty(value) || _.isNil(value[0])) {
            return strings.NULL_VALUE_PLACEHOLDER_LABEL;
        }

        switch (value[0]) {
            case 'NaN':
                return 'NaN';
            case 'Infinity':
                return 'Infinity';
            default:
                return null;
        }
    }

    return null;
}
