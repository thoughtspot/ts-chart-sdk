import Globalize from 'globalize';
import {
    formatNumberSafely,
    getCountryCode,
    getCurrentCurrencyFormat,
    getDefaultCurrencyCode,
    getGlobalizeLocale,
    globalizeCurrencyFormatter,
    globalizeNumberFormatter,
    initializeGlobalize,
    loadCurrencyData,
    loadGlobalizeData,
    sanitizeFormat,
    setCurrentCurrencyFormat,
    setGlobalizeLocale,
    validateNumberFormat,
} from './globalize-utils';

describe('Initialize Globalize', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        initializeGlobalize('en-US');
    });

    describe('getCountryCode', () => {
        it('should extract country code from locale with underscore', () => {
            expect(getCountryCode('en_US')).toBe('US');
        });

        it('should extract country code from locale with hyphen', () => {
            expect(getCountryCode('en-US')).toBe('US');
        });

        it('should return the input locale if no delimiter is found', () => {
            expect(getCountryCode('en')).toBe('en');
        });
    });

    describe('getDefaultCurrencyCode', () => {
        it('should return the current currency format if set', () => {
            setCurrentCurrencyFormat('EUR');
            expect(getDefaultCurrencyCode()).toBe('EUR');
        });

        it('should return GBP if no currency data is found', () => {
            setCurrentCurrencyFormat(null);
            loadCurrencyData({});
            expect(getDefaultCurrencyCode()).toBe('GBP');
        });

        it('should retrieve the default currency code from supplemental data', () => {
            loadCurrencyData({
                supplemental: {
                    currencyData: {
                        region: {
                            US: [{ USD: {} }],
                        },
                    },
                },
            });
            setGlobalizeLocale('en-US');
            expect(getDefaultCurrencyCode()).toBe('USD');
        });
    });

    describe('setGlobalizeLocale', () => {
        it('should set the Globalize locale', () => {
            setGlobalizeLocale('fr-FR');
            expect(getGlobalizeLocale()).toBe('fr-FR');
        });
    });

    describe('getGlobalizeLocale', () => {
        it('should return the current locale', () => {
            expect(getGlobalizeLocale()).toBe('en-US');
        });
    });

    describe('setCurrentCurrencyFormat', () => {
        it('should set the current currency format', () => {
            setCurrentCurrencyFormat('JPY');
            expect(getCurrentCurrencyFormat()).toBe('JPY');
        });
    });

    describe('loadCurrencyData', () => {
        it('should load supplemental currency data', () => {
            const data = {
                supplemental: {
                    currencyData: {
                        region: {
                            US: [{ USD: {} }],
                        },
                    },
                },
            };
            setCurrentCurrencyFormat(null);
            loadCurrencyData(data);
            expect(getDefaultCurrencyCode()).toBe('USD');
        });
    });

    describe('loadGlobalizeData', () => {
        it('should load CLDR data', () => {
            jest.spyOn(Globalize, 'load').mockImplementationOnce((data) => {
                return data;
            });
            const data = { key: 'value' };
            loadGlobalizeData(data);
            expect(Globalize.load).toHaveBeenCalledWith(data);
            jest.clearAllMocks();
        });
    });

    describe('globalizeNumberFormatter', () => {
        it('should create a number formatter', () => {
            const formatter = globalizeNumberFormatter({
                minimumFractionDigits: 2,
            });
            expect(typeof formatter).toBe('function');
        });
    });

    describe('globalizeCurrencyFormatter', () => {
        it('should create a currency formatter', () => {
            const formatter = globalizeCurrencyFormatter('USD', {
                style: 'symbol',
            });
            expect(typeof formatter).toBe('function');
        });
    });

    describe('formatNumberSafely', () => {
        it('should format numbers safely', () => {
            const formattedNumber = formatNumberSafely(
                { maximumFractionDigits: 2, minimumFractionDigits: 2 },
                123.456,
            );
            expect(formattedNumber).toBe('123.46');
        });

        it('should return 0 for very small numbers', () => {
            jest.spyOn(Globalize, 'numberFormatter').mockImplementationOnce(
                () => {
                    throw new Error('Test Error');
                },
            );
            const formattedNumber = formatNumberSafely({}, 1e-8);
            expect(formattedNumber).toBe('0');
            jest.clearAllMocks();
        });

        it('should return the string representation for errors', () => {
            jest.spyOn(Globalize, 'numberFormatter').mockImplementationOnce(
                () => {
                    throw new Error('Test Error');
                },
            );
            const formattedNumber = formatNumberSafely({}, 123);
            expect(formattedNumber).toBe('123');
            jest.clearAllMocks();
        });
    });

    describe('sanitizeFormat', () => {
        it('should add zero before decimal point', () => {
            expect(sanitizeFormat('#.##')).toBe('0.##');
        });

        it('should add zero at the end if no decimal point', () => {
            expect(sanitizeFormat('#%')).toBe('0%');
        });

        it('should return the same format if no changes are needed', () => {
            expect(sanitizeFormat('0.##')).toBe('0.##');
        });
    });

    describe('validateNumberFormat', () => {
        it('should return true for valid number formats', () => {
            expect(validateNumberFormat('#.##')).toBe(true);
        });

        it('should return false for invalid number formats', () => {
            jest.spyOn(Globalize, 'numberFormatter').mockImplementation(() => {
                throw new Error('Test Error');
            });
            expect(validateNumberFormat('#.#')).toBe(false);
            jest.clearAllMocks();
        });
    });
});
