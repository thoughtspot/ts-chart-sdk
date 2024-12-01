/**
 * @file: Formatting Utils
 *
 * @author Yashvardhan Nehra <yashvardhan.nehra@thoughtspot.com>
 *
 * Copyright: ThoughtSpot Inc. 2023
 */

/* eslint-disable no-param-reassign */
/* eslint-disable import/no-extraneous-dependencies */
import Globalize from 'globalize';
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
import { getDefaultCurrencyCode } from '../globalize-setup';

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

const strings = {
    NULL_VALUE_PLACEHOLDER_LABEL: '{Null}',
    EMPTY_VALUE_PLACEHOLDER_LABEL: '{Empty}',
};

export const UNITS_TO_SUFFIX: Record<Unit, string> = {
    [Unit.None]: '',
    [Unit.Thousands]: 'K',
    [Unit.Million]: 'M',
    [Unit.Billion]: 'B',
    [Unit.Trillion]: 'T',
    [Unit.Auto]: '',
};

const DEFAULT_DECIMAL_PRECISION = 2;

export function formatNumberSafely<
    FormatOptions extends Globalize.NumberFormatterOptions
>(format: FormatOptions, num: number): string {
    try {
        const formattedNumber = Globalize.numberFormatter(format)(num);
        return formattedNumber;
    } catch (e) {
        if (Math.abs(num) < 1e-7) {
            return '0';
        }
        return String(num);
    }
}

export const formatNegativeValue = (
    formattedValue: string,
    negativeFormat?: Maybe<NegativeValueFormat>,
): string => {
    if (typeof negativeFormat === 'number') {
        negativeFormat = PROTO_TO_NEGATIVE_VALUE_FORMAT[negativeFormat];
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
export const getLocaleName = (currencyFormat: CurrencyFormat): string => {
    let locale = null;
    if (currencyFormat.type === CurrencyFormatType.ISO_CODE) {
        locale = currencyFormat.isoCode;
    } else if (currencyFormat.type === CurrencyFormatType.USER_LOCALE) {
        locale = getDefaultCurrencyCode();
    }
    return locale;
};

export const defaultFormatConfig = (
    columnFormatConfig: ColumnFormat,
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
export const mapFormatterConfig = (
    absFloatValue: number,
    configDetails: NumberFormatConfig | CurrencyFormatConfig,
): FormatterConfig => {
    if (typeof configDetails.unit === 'number') {
        configDetails.unit = PROTO_TO_UNITS[configDetails.unit];
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
 * This checks if the value is of special type like NaN, Infinity, etc
 *
 * @param value - the value to format
 * @returns {*} - formatted value if it was a special case and null if it wasn't
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
    // {Empty} placeholder is set for empty string or no characters
    // other than spaces.
    if (value === '') {
        return strings.EMPTY_VALUE_PLACEHOLDER_LABEL;
    }
    if (value instanceof Array) {
        if (!value.length || value[0] === null || value[0] === undefined) {
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
