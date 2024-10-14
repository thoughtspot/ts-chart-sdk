/* eslint-disable import/no-extraneous-dependencies */
import Globalize from 'globalize';
import _ from 'lodash';
import {
    CategoryType,
    FormatConfig,
    Unit,
} from '../../types/number-formatting.types';
import { initializeGlobalize } from '../globalize-setup';
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

initializeGlobalize();

export const getFormattedValue = (
    value: string | number,
    formatConfigProp: FormatConfig,
): string => {
    let formatConfig = _.cloneDeep(formatConfigProp);
    if (_.isNil(formatConfig)) {
        formatConfig = defaultFormatConfig();
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
                minimumFractionDigits:
                    formatterConfigMap.shouldRemoveTrailingZeros
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
                configDetails.locale || 'USD',
                {
                    style: 'symbol',
                    maximumFractionDigits: formatterConfigMap.decimalDetails,
                    minimumFractionDigits:
                        formatterConfigMap.shouldRemoveTrailingZeros
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
            // console.log(e);
            //         _logger.error(
            // 'Corrupted format config passed, formatting using default config',
            // formatConfig,
            //             e,
            //         );
        }
    }

    return formatNumberSafely(
        {
            style: 'decimal',
        },
        floatValue as any,
    );
};
