import _ from 'lodash';
import { ChartColumn, ColumnTimeBucket } from '../types/answer-column.types';
import { bucketizationToDatePreset, timeBuckets } from './date-formatting';

/**
 * Retrieves the date format pattern associated with a specific time bucket.
 *
 * This function maps a `ColumnTimeBucket` value to its corresponding date format
 * pattern using a predefined configuration (`bucketizationToDatePreset`). It is used
 * to ensure that date formatting aligns with the granularity defined by the bucket type.
 *
 * @param bucket - The time bucket (`ColumnTimeBucket`) for which the format pattern is needed.
 *
 * @returns The date format pattern associated with the provided bucket, or `undefined`
 *          if no format pattern exists for the specified bucket.
 *
 * @example
 * const formatPattern = getFormatPatternForBucket(ColumnTimeBucket.DAY_OF_WEEK);
 */

export function getFormatPatternForBucket(bucket: ColumnTimeBucket): any {
    return bucketizationToDatePreset[
        ColumnTimeBucket[bucket] as keyof typeof bucketizationToDatePreset
    ];
}

export const getTimeBucket = (col: ChartColumn): string =>
    _.get(timeBuckets, ColumnTimeBucket[col.timeBucket], timeBuckets.NO_BUCKET);

export const showDateFinancialYearFormat = (col: ChartColumn) => {
    const supportedBucketizations = [timeBuckets.QUARTERLY, timeBuckets.YEARLY];
    const currentBucketization = getTimeBucket(col);
    return supportedBucketizations.some((supportedBucketization) => {
        return supportedBucketization === currentBucketization;
    });
};

/**
 * Retrieves the GUID (Globally Unique Identifier) for a custom calendar based on
 * the calendar name and data source ID.
 *
 * This function looks up a custom calendar GUID from a mapping that associates
 * data source IDs with calendar names. If the specified data source ID and calendar
 * name exist in the provided map, it returns the corresponding GUID; otherwise,
 * it returns `undefined`. This is used because we have some TS defined custom calender
 * such as fiscal, geogrian,etc. We apply some custom formatting for those.
 * to see where we are getting this refer-
 * @link AppConfig
 * @param name - The name of the custom calendar to look up.
 * @param datasourceId - The ID of the data source associated with the custom calendar.
 * @param datsourceIdToCustomCalendarMap - A mapping object where each data source ID
 *        maps to another object that associates calendar names with their GUIDs.
 *
 * @returns The GUID for the custom calendar associated with the given `name` and
 *          `datasourceId`, or `undefined` if no matching GUID is found.
 *
 * @example
 * const calendarGuid = getCustomCalendarGuid('fiscal', 'dataSource1', calendarMap);
 */

export function getCustomCalendarGuid(
    name: string,
    datasourceId: string,
    datsourceIdToCustomCalendarMap: any,
) {
    return datsourceIdToCustomCalendarMap[datasourceId]
        ? datsourceIdToCustomCalendarMap[datasourceId][name]
        : undefined;
}
