/* eslint-disable import/no-extraneous-dependencies */
import enCaGregorian from 'cldr-data/main/en/ca-gregorian.json';
import enCurrencies from 'cldr-data/main/en/currencies.json';
import enNumbers from 'cldr-data/main/en/numbers.json';
import currencyData from 'cldr-data/supplemental/currencyData.json';
import supplemental from 'cldr-data/supplemental/likelySubtags.json';
import enpluralJson from 'cldr-data/supplemental/plurals.json';
import Globalize from 'globalize';

export const initializeGlobalize = () => {
    Globalize.load(enNumbers);
    Globalize.load(enCaGregorian);
    Globalize.load(supplemental);
    Globalize.load(currencyData);
    Globalize.load(enpluralJson);
    Globalize.load(enCurrencies);

    Globalize.locale('en-US');
};
