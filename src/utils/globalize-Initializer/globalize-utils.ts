/**
 * @file: Initialize Globalize
 *
 * @author Yashvardhan Nehra <yashvardhan.nehra@thoughtspot.com>
 *
 * Copyright: ThoughtSpot Inc. 2024
 */

/* eslint-disable import/no-extraneous-dependencies */
import enCaGregorian from 'cldr-data/main/en/ca-gregorian.json';
import enCurrencies from 'cldr-data/main/en/currencies.json';
import enNumbers from 'cldr-data/main/en/numbers.json';
import currencyData from 'cldr-data/supplemental/currencyData.json';
import supplemental from 'cldr-data/supplemental/likelySubtags.json';
import enpluralJson from 'cldr-data/supplemental/plurals.json';
import Globalize from 'globalize/dist/globalize-runtime';
import _ from 'lodash';
import { create } from '../../main/logger';

const logger = create('globalize-initializer');

let currentLocale: string;
let currentCurrencyFormat: any;
let supplementalCurrencyDataJson: any;

/**
 * Extracts the country code from a locale string.
 *
 * @param locale - The locale string (e.g., 'en-US', 'en_US').
 * @returns The country code (e.g., 'US') or the input locale if no delimiter is found.
 */
export const getCountryCode = (locale: string): string => {
    let parts = locale.split('_'); //  // Split by '_'
    if (parts.length === 2) {
        return parts[1].toUpperCase();
    }
    parts = locale.split('-'); //  // Split by '-'
    if (parts.length === 2) {
        return parts[1].toUpperCase();
    }
    return locale;
};

/**
 * Retrieves the default currency code for the current locale.
 *
 * @returns The default currency code (e.g., 'USD') or GBP if not found.
 */
export const getDefaultCurrencyCode = (): string => {
    if (currentCurrencyFormat) {
        return currentCurrencyFormat;
    }

    const countryCode = getCountryCode(currentLocale);
    const regionData =
        supplementalCurrencyDataJson?.supplemental?.currencyData?.region[
            countryCode.toUpperCase()
        ];
    if (!regionData || regionData.length === 0) {
        logger.warn('No currency data found for country:', countryCode);
        return 'GBP';
    }
    return Object.keys(regionData[regionData.length - 1])[0];
};

/**
 * Sets the current locale for Globalize and updates the global state.
 *
 * @param locale - The locale string to set (e.g., 'en-US').
 */
export const setGlobalizeLocale = (locale: string): void => {
    Globalize.locale(locale);
    currentLocale = locale;
};

/**
 * Retrieves the current locale set in Globalize.
 *
 * @returns The current locale string (e.g., 'en-US').
 */
export const getGlobalizeLocale = () => currentLocale;

/**
 * Updates the current currency format.
 *
 * @param currencyFormat - The currency format to set.
 */
export const setCurrentCurrencyFormat = (currencyFormat: any): void => {
    currentCurrencyFormat = currencyFormat;
};

/**
 * Retrieves the current currency format.
 *
 * @returns The current currency format.
 */
export const getCurrentCurrencyFormat = () => currentCurrencyFormat;

/**
 * Loads supplemental currency data for Globalize.
 *
 * @param data - The supplemental currency data to load.
 */
export const loadCurrencyData = (data: any) => {
    supplementalCurrencyDataJson = data;
};

/**
 * Loads CLDR data into Globalize.
 *
 * @param data - The CLDR data to load.
 */
export const loadGlobalizeData = (data: any) => {
    Globalize.load(data);
};

/**
 * Initializes Globalize with CLDR data and sets the default locale.
 *
 * @param locale - The locale to initialize Globalize with (default: 'en-GB').
 */
export const initGlobalize = (locale = 'en-GB') => {
    loadGlobalizeData(enNumbers);
    loadGlobalizeData(enCaGregorian);
    loadGlobalizeData(supplemental);
    loadGlobalizeData(currencyData);
    loadGlobalizeData(enpluralJson);
    loadGlobalizeData(enCurrencies);

    loadCurrencyData(currencyData);

    setGlobalizeLocale(locale);
};

/**
 * Creates a number formatter with the given options.
 *
 * @param format - The Globalize number formatter options.
 * @returns A formatter function for numbers.
 */
export function globalizeNumberFormatter(
    format: Globalize.NumberFormatterOptions,
): (num: number) => string {
    return Globalize.numberFormatter(format);
}

/**
 * Creates a currency formatter with the given options.
 *
 * @param currencyCode - The ISO currency code (e.g., 'USD').
 * @param format - The Globalize currency formatter options.
 * @returns A formatter function for currency values.
 */
export function globalizeCurrencyFormatter(
    currencyCode: string,
    format: Globalize.CurrencyFormatterOptions,
): (num: number) => string {
    return Globalize.currencyFormatter(currencyCode, format);
}

/**
 * Formats a number using Globalize, handling errors gracefully.
 *
 * @param format - Globalize number formatter options.
 * @param num - The number to format.
 * @returns The formatted number as a string.
 */
export function formatNumberSafely<
    FormatOptions extends Globalize.NumberFormatterOptions,
>(format: FormatOptions, num: number): string {
    try {
        const formatter = globalizeNumberFormatter(format);
        const formattedNumber = formatter(num);
        return formattedNumber;
    } catch (e) {
        logger.error('Error formatting pattern: ', format, num, e);
        if (Math.abs(num) < 1e-7) {
            return '0';
        }
        return String(num);
    }
}

/**
 * Sanitizes a number format to ensure compatibility with Globalize.
 *
 * @param format - The raw format string (e.g., '#.##').
 * @returns A sanitized format string (e.g., '0.##').
 */
export const sanitizeFormat = (format: string): string => {
    // Globalize needs to have a zero before the decimal point
    // or at the end of format if no decimal point
    let sanitizedFormat = format.replace(/#\./, '0.');
    if (!sanitizedFormat.includes('.')) {
        sanitizedFormat = sanitizedFormat.replace(/#(%?)$/, '0$1');
    }
    return sanitizedFormat;
};

/**
 * Validates if a given number format is compatible with Globalize.
 *
 * @param format - The raw format string.
 * @returns True if the format is valid; otherwise, false.
 */
export const validateNumberFormat = (format: string): boolean => {
    try {
        Globalize.numberFormatter({
            ...({ raw: sanitizeFormat(format) } as any),
        })(123); // Test the formatter with a dummy value
    } catch (e) {
        logger.error('Invalid number format:', format, e);
        return false;
    }
    return true;
};
