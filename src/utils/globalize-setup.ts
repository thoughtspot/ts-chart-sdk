/**
 * @file: Initialize Globalize
 *
 * @author Yashvardhan Nehra <yashvardhan.nehra@thoughtspot.com>
 *
 * Copyright: ThoughtSpot Inc. 2023
 */

/* eslint-disable import/no-extraneous-dependencies */
import enCaGregorian from 'cldr-data/main/en/ca-gregorian.json';
import enCurrencies from 'cldr-data/main/en/currencies.json';
import enNumbers from 'cldr-data/main/en/numbers.json';
import currencyData from 'cldr-data/supplemental/currencyData.json';
import supplemental from 'cldr-data/supplemental/likelySubtags.json';
import enpluralJson from 'cldr-data/supplemental/plurals.json';
import Globalize from 'globalize';
import _ from 'lodash';

let currentLocale: string;
let currentCurrencyFormat: any;
let supplementalCurrencyDataJson: any;

const getCountryCode = (locale: string) => {
    let parts = locale.split('_');
    if (parts.length === 2) {
        return parts[1];
    }
    parts = locale.split('-');
    if (parts.length === 2) {
        return parts[1];
    }
    return locale;
};

export const getDefaultCurrencyCode = () => {
    if (currentCurrencyFormat) return currentCurrencyFormat;
    const countryCode = getCountryCode(currentLocale);
    const regionData =
        supplementalCurrencyDataJson?.supplemental?.currencyData?.region[
            countryCode.toUpperCase()
        ];
    return Object.keys(regionData[regionData.length - 1])[0];
};

export const initializeGlobalize = (
    locale = 'en-gb',
    currencyFormat = null,
) => {
    Globalize.load(enNumbers);
    Globalize.load(enCaGregorian);
    Globalize.load(supplemental);
    Globalize.load(currencyData);
    Globalize.load(enpluralJson);
    Globalize.load(enCurrencies);
    currentLocale = locale;
    currentCurrencyFormat = currencyFormat;
    supplementalCurrencyDataJson = currencyData;
    Globalize.locale(locale);
};
