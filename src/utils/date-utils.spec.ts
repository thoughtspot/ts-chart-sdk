import { ChartColumn, ColumnTimeBucket } from '../types/answer-column.types';
import {
    getCustomCalendarGuid,
    getFormatPatternForBucket,
    showDateFinancialYearFormat,
} from './date-utils'; // Adjust path

describe('getFormatPatternForBucket', () => {
    const mockDatasourceIdToCustomCalendarMap = {
        datasource1: {
            fiscal: 'guid-123',
            custom: 'guid-456',
        },
        datasource2: {
            fiscal: 'guid-789',
        },
    };

    test('should return correct format pattern for YEARLY bucket', () => {
        const result = getFormatPatternForBucket(ColumnTimeBucket.YEARLY);
        expect(result).toBe('yyyy');
    });

    test('should return correct format pattern for MONTHLY bucket', () => {
        const result = getFormatPatternForBucket(ColumnTimeBucket.MONTHLY);
        expect(result).toBe('MONTH_WITH_YEAR');
    });

    test('should return correct format pattern for WEEKLY bucket', () => {
        const result = getFormatPatternForBucket(ColumnTimeBucket.WEEKLY);
        expect(result).toBe('DATE_SHORT');
    });

    test('should handle undefined input gracefully', () => {
        const result = getFormatPatternForBucket(undefined as any);
        expect(result).toBeUndefined();
    });

    test('should return true for QUARTERLY time bucket', () => {
        const col = { timeBucket: ColumnTimeBucket.QUARTERLY } as ChartColumn;
        const result = showDateFinancialYearFormat(col);

        expect(result).toBe(true);
    });

    test('should return true for YEARLY time bucket', () => {
        const col = { timeBucket: ColumnTimeBucket.YEARLY } as ChartColumn;
        const result = showDateFinancialYearFormat(col);
        expect(result).toBe(true);
    });

    test('should return true for MONTLY time bucket', () => {
        const col = { timeBucket: ColumnTimeBucket.MONTHLY } as ChartColumn;
        const result = showDateFinancialYearFormat(col);
        expect(result).toBe(false);
    });
    test('should return the custom calendar GUID when datasourceId and name are valid', () => {
        const datasourceId = 'datasource1';
        const name = 'fiscal';

        const result = getCustomCalendarGuid(
            name,
            datasourceId,
            mockDatasourceIdToCustomCalendarMap,
        );

        expect(result).toBe('guid-123');
    });
    test('should return undefined when the datasourceId is valid but the name does not exist', () => {
        const datasourceId = 'datasource1';
        const name = 'nonexistent';

        const result = getCustomCalendarGuid(
            name,
            datasourceId,
            mockDatasourceIdToCustomCalendarMap,
        );

        expect(result).toBeUndefined();
    });
    test('should return undefined when the datasourceId does not exist in the map', () => {
        const datasourceId = 'nonexistentDatasource';
        const name = 'fiscal';

        const result = getCustomCalendarGuid(
            name,
            datasourceId,
            mockDatasourceIdToCustomCalendarMap,
        );

        expect(result).toBeUndefined();
    });
});
