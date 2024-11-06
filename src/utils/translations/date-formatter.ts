import _ from 'lodash';

export const dateFormats: any = {
    DATE_SHORT: 'dd/MM/yyyy',
    DATE_SHORT_2_DIGIT_YEAR: 'dd/MM/yy',
    DATE_SHORT_WITH_HOUR: 'dd/MM/yyyy hh a',
    DATE_SHORT_WITH_HOUR_WITHOUT_YEAR: 'dd/MM hh a',
    DATE_SHORT_WITH_HOUR_24: 'dd/MM/yy HH',
    DATE_SHORT_WITH_HOUR_24_WITHOUT_YEAR: 'dd/MM HH',
    DATETIME_SHORT: 'dd/MM/yyyy hh:mm a',
    DATETIME_SHORT_WITHOUT_YEAR: 'dd/MM hh:mm a',
    DATETIME_24_SHORT: 'dd/MM/yy HH:mm',
    DATETIME_24_SHORT_WITH_MILLIS: 'dd/MM/yyyy HH:mm:ss.S',
    DATETIME_24_SHORT_WITH_MILLIS_WITHOUT_YEAR: 'dd/MM HH:mm:ss.S',
    DATETIME_SHORT_WITH_SECONDS: 'dd/MM/yyyy HH:mm:ss',
    DATETIME_SHORT_WITH_SECONDS_WITHOUT_YEAR: 'dd/MM HH:mm:ss',
    DATETIME_SHORT_WITH_MILLIS: 'MM/dd/yyyy HH:mm:ss.S',
    DATETIME_SHORT_WITH_MILLIS_WITHOUT_YEAR: 'MM/dd HH:mm:ss.S',
    QUARTER_WITH_YEAR: "'Q'q yyyy",
    QUARTER_WITH_2_DIGIT_YEAR: "'Q'q yy",
    DEFAULT_TIME_FORMAT: 'dd MMM, yyyy hh:mm:ss a ZZZZ',
    MONTH_WITH_YEAR: 'MMM yyyy',
    MONTH_WITH_DAY_AND_YEAR: 'dd MMM, yyyy',
    MONTH_WITH_2_DIGIT_YEAR: 'MMM yy',
    DAY_WITH_MONTH: 'dd MMM',
    DAY_WITH_MONTH_NUM: 'dd/MM',
    QUARTER: "'Q'q",
    MONTH_ONLY: 'MMM',
    DATETIME_WITH_SHORT_OFFSET: 'dd/MM/yyyy HH:mm:ss ZZZZ',
};

// TODO: discuss the current working.

export function updateDateFormats(obj: any) {
    _.merge(dateFormats, obj);
}
