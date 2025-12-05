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
    USER_LOCALE = 'USER_LOCALE',
    COLUMN = 'COLUMN',
    ISO_CODE = 'ISO_CODE',
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
     * Column name property
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
    /**
     * The display name for the column based on point mentioned below.
     * This corresponds to the formatted name that we use in TS native charts to show column name.
     * 1. Weather it is a Measure Name /Measure Value column(since measureNameColumnAlias and
     * measureNameValueAlias are used to control name for
     * MN/MV column and these are handled on sdk side
     * will pass this as empty in that case unless its a userDefined through renaming).
     * 2. Weather we are applying some Aggrigation to the column such as SUM,MIN,MAX etc
     * that could be seen in {@link ColumnAggregationType}.
     * 3. Based on the Date Bucketization that we apply to a colum such as Daily,Weekly,Monthly etc
     * that can be seen in {@link ColumnTimeBucket}.
     * 4. Based on the weather the column is derived from the custom calender.
     * 5. This contains column's name with resolved dynamic values.
     * @example
     * "Sales for Q1 2024"
     */
    displayName?: string;

    /**
     * Column title with unresolved parameter placeholders.
     * Unlike displayName which shows resolved values (e.g., "Sales for Q1 2024"),
     * this contains the raw parameter tokens with their identifiers.
     *
     * Key uses:
     * - Serves as the default value for AXIS_RENAME_INPUT in VisualPropEditorDefinition
     * - Required by backend to determine which parameter is being used
     * - Used by components to preserve the template structure before parameter substitution
     *
     * @example
     * // dynamicTitle contains the unresolved placeholder:
     * "Sales for [${PARAMETER:491b359d-4282-4c66-8829-b24b05571098}]"
     *
     * // displayName contains the resolved value:
     * "Sales for Q1 2024"
     *
     * @version SDK: 2.7.1 | ThoughtSpot:
     */
    dynamicTitle?: string;

    /**
     * Whether this column shows growth percentage instead of actual values.
     * When true, the column displays percentage growth of the measure value.
     * Only applicable to measure columns.
     *
     * @version SDK: 2.7.5 | ThoughtSpot:
     */
    showGrowth?: boolean;

    /**
     * Whether aggregation is applied to this column.
     * Used to determine if the column supports aggregation type changes.
     * Only applicable to measure columns.
     *
     * @version SDK: 2.7.5 | ThoughtSpot:
     */
    isAggregateApplied?: boolean;
}
