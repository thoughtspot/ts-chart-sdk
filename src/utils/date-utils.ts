import _ from 'lodash';
import { ChartColumn, ColumnTimeBucket } from '../types/answer-column.types';
import { bucketizationToDatePreset, timeBuckets } from './date-formatting';

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

export function getCustomCalendarGuid(
    name: string,
    datasourceId: string,
    datsourceIdToCustomCalendarMap: any,
) {
    return datsourceIdToCustomCalendarMap[datasourceId]
        ? datsourceIdToCustomCalendarMap[datasourceId][name]
        : undefined;
}
