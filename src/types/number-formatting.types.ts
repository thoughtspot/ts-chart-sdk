/**
 * @file: Number Formatting Types
 * @author Yashvardhan Nehra <yashvardhan.nehra@thoughtspot.com>
 *
 * Copyright: ThoughtSpot Inc. 2024
 */

import type { Maybe, Scalars } from './common.types';

export enum CategoryType {
    Currency = 'CURRENCY',
    Custom = 'CUSTOM',
    Number = 'NUMBER',
    Percentage = 'PERCENTAGE',
}

export enum Unit {
    Auto = 'AUTO',
    Billion = 'BILLION',
    Million = 'MILLION',
    None = 'NONE',
    Thousands = 'THOUSANDS',
    Trillion = 'TRILLION',
}

export enum NegativeValueFormat {
    BracesNodash = 'BRACES_NODASH',
    PrefixDash = 'PREFIX_DASH',
    SuffixDash = 'SUFFIX_DASH',
}

export type CurrencyFormatConfig = {
    __typename?: 'CurrencyFormatConfig';
    /** default to 2 */
    decimals?: Maybe<Scalars['Float']>;
    locale?: Maybe<Scalars['String']>;
    /** default to false */
    removeTrailingZeroes?: Maybe<Scalars['Boolean']>;
    /** default to true */
    toSeparateThousands?: Maybe<Scalars['Boolean']>;
    /** default is MILLION */
    unit?: Maybe<Unit>;
};

export type CustomFormatConfig = {
    __typename?: 'CustomFormatConfig';
    format?: Maybe<Scalars['String']>;
};

export type NumberFormatConfig = {
    __typename?: 'NumberFormatConfig';
    /** default to 2 */
    decimals?: Maybe<Scalars['Float']>;
    /** default to PREFIX_DASH */
    negativeValueFormat?: Maybe<NegativeValueFormat>;
    /** default to false */
    removeTrailingZeroes?: Maybe<Scalars['Boolean']>;
    /** default to true */
    toSeparateThousands?: Maybe<Scalars['Boolean']>;
    /** default is Auto */
    unit?: Maybe<Unit>;
};

export type PercentageFormatConfig = {
    __typename?: 'PercentageFormatConfig';
    /** default to 2 */
    decimals?: Maybe<Scalars['Float']>;
    /** default to false */
    removeTrailingZeroes?: Maybe<Scalars['Boolean']>;
};

export type FormatConfig = {
    __typename?: 'FormatConfig';
    category?: Maybe<CategoryType>;
    currencyFormatConfig?: Maybe<CurrencyFormatConfig>;
    customFormatConfig?: Maybe<CustomFormatConfig>;
    isCategoryEditable?: Maybe<Scalars['Boolean']>;
    numberFormatConfig?: Maybe<NumberFormatConfig>;
    percentageFormatConfig?: Maybe<PercentageFormatConfig>;
};
