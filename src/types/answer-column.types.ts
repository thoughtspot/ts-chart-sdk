import type { Maybe } from './common.types';
import { ConditionalFormatting } from './conditional-formatting.types';
import { FormatConfig } from './number-formatting.types';

export enum ColumnType {
    UNKNOWN,
    MEASURE,
    ATTRIBUTE,
    // Virtual columns that are measure name/value columns
    VIRTUAL,
}

/**
 * When the column is generated for the chart for creating views,
 * on top of measure columns from the worksheet which are part of answer query.
 */
export enum ChartSpecificColumnType {
    UNKNOWN,
    MEASURE_NAMES,
    MEASURE_VALUES,
}

/**
 * Defines type of the data associated with a column
 */
export enum DataType {
    UNKNOWN,
    // Boolean data type
    BOOL,
    // string data types
    CHAR,
    // Numeric data types
    INT32,
    INT64,
    FLOAT,
    DOUBLE,
    // Date type attributes
    DATE,
    DATE_TIME,
    TIME,
    // Miscellaneous
    MAX_TYPE,
}

export enum ColumnTimeBucket {
    NO_BUCKET,
    DAILY,
    WEEKLY,
    MONTHLY,
    QUARTERLY,
    YEARLY,
    HOURLY,
    AUTO,
    HOUR_OF_DAY,
    DAY_OF_WEEK,
    DAY_OF_MONTH,
    DAY_OF_QUARTER,
    DAY_OF_YEAR,
    WEEK_OF_MONTH,
    WEEK_OF_QUARTER,
    WEEK_OF_YEAR,
    MONTH_OF_QUARTER,
    MONTH_OF_YEAR,
    QUARTER_OF_YEAR,
}

/**
 * Enum values for column format type defined in the worksheet
 *
 * @version SDK: 0.1 | ThoughtSpot:
 */
export enum FormatType {
    NONE,
    PATTERN,
    PERCENTAGE,
    CURRENCY,
}

/**
 * Type of currency formatting defined in the worksheet
 *
 * @version SDK: 0.1 | ThoughtSpot:
 */
export enum CurrencyFormatType {
    USER_LOCALE,
    COLUMN,
    ISO_CODE,
}

/**
 * Type of aggregations applied on the column data
 *
 * @version SDK: 0.1 | ThoughtSpot:
 */
export enum ColumnAggregationType {
    AGGREGATE,
    AGGREGATE_DISTINCT,
    APPROX_AGGR_DISTINCT,
    APPROX_AGGR_DISTINCT_MERGE,
    APPROX_COUNT_DISTINCT,
    AVERAGE,
    COUNT,
    COUNT_DISTINCT,
    CUMULATIVE_AVERAGE,
    CUMULATIVE_COUNT,
    CUMULATIVE_MAX,
    CUMULATIVE_MIN,
    CUMULATIVE_SUM,
    GROWTH,
    MAX,
    MEDIAN,
    MIN,
    MOVING_AVERAGE,
    MOVING_COUNT,
    MOVING_MAX,
    MOVING_MIN,
    MOVING_SUM,
    NONE,
    PERCENTILE,
    RANK,
    RANK_PERCENTILE,
    SQL_BOOL_AGGREGATE_OP,
    SQL_DATE_AGGREGATE_OP,
    SQL_DATE_TIME_AGGREGATE_OP,
    SQL_DOUBLE_AGGREGATE_OP,
    SQL_INT_AGGREGATE_OP,
    SQL_STRING_AGGREGATE_OP,
    SQL_TIME_AGGREGATE_OP,
    STD_DEVIATION,
    SUM,
    TABLE_AGGR,
    VARIANCE,
}

/**
 * Currency format for the column defined in the worksheet
 *
 * @version SDK: 0.1 | ThoughtSpot:
 */
export interface CurrencyFormat {
    type: CurrencyFormatType;
    /**
     * column ID of the column in case of currency formatted by a column
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    column: string;
    /**
     * ISO code for the currency types
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    isoCode: string;
}

/**
 * Defines the type for column formatting in the worksheet and related details.
 * Based on the type of formatting, the pattern and currency formats are defined.
 *
 * @version SDK: 0.1 | ThoughtSpot:
 */
export interface ColumnFormat {
    type: FormatType;
    /**
     * Pattern to define the number formatting style
     *
     * @optional
     * @version SDK: 0.1 | ThoughtSpot:
     */
    pattern?: string;
    /**
     * Currency format details
     *
     * @optional
     * @version SDK: 0.1 | ThoughtSpot:
     */
    currencyFormat?: CurrencyFormat;
}

export interface ChartColumn {
    /**
     * Column ID
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    id: string;
    /**
     * Column name
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    name: string;
    /**
     * Type of column if attribute or measure
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    type: ColumnType;

    /**
     * Type of the time-based aggregation
     * when the column data is of type Date, Datetime, Time
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    timeBucket: ColumnTimeBucket;

    /**
     * Type of data for the column
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    dataType: DataType;

    // // worksheet level formatting
    // // (TBD make this more cleaner during export)
    // /**
    //  * @deprecated
    //  * @hidden To be removed and merged with the format
    //  * @version SDK: 0.1 | ThoughtSpot:
    //  */
    // formatPattern?: string
    // /**
    //  * @deprecated
    //  * @hidden To be removed and merged with the format
    //  */
    // formatType?: FormatType

    /**
     * Formatting for the columns defined in the worksheet
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    format?: ColumnFormat;

    /**
     * Column Properties of the columns
     *
     * @version SDK: 0.0.2-alpha.15 | ThoughtSpot:
     */
    columnProperties?: {
        conditionalFormatting?: Maybe<ConditionalFormatting>;
        numberFormatting?: Maybe<FormatConfig>;
    };

    /**
     * Aggregation applied on the column data
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    aggregationType?: ColumnAggregationType;

    /**
     * Custom sort order defined for the column to sort charts in a specific order
     * Defined in worksheet
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    customOrder?: Array<string>;

    /**
     * Guid of Custom calender for the column if defined in worksheet else null
     *
     * @version SDK: 0.1 | ThoughtSpot: sdcwdc
     */
    calenderGuid?: string;

    /**
     * Type of arbitrary column, can be measure names or measure values
     * also, unknown if regular column
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    chartSpecificColumnType: ChartSpecificColumnType;
}
