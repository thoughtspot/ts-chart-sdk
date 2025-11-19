/**
 * @file: Common Types
 * @fileoverview All commons types for the Custom Chart implementations
 * @author Chetan Agrawal <chetan.agrawal@thoughtspot.com>
 *
 * Copyright: ThoughtSpot Inc. 2023
 */

import { Action } from './actions.types';
import { ChartColumn } from './answer-column.types';
import type { ChartConfigEditorDefinition } from './configurator.types';
import type { VisualPropEditorDefinition } from './visual-prop.types';

/**
 * Defines types of features for which font can be customised with Custom style config used in TS.
 * @remarks
 * Use chartFeatureToFontGuid to get the guid for the feature and get the font face from guid
 * from customFontFaces
 */

export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;

export enum SortCategory {
    DEFAULT = 'DEFAULT',
    NONE = 'NONE',
    ALPHA = 'ALPHA',
    CUSTOM = 'CUSTOM',
}

export type Scalars = {
    ID: string;
    String: string;
    Boolean: boolean;
    Int: number;
    Float: number;
    FileUpload: unknown;
    GUID: string;
    JSON: {
        [key: string]: unknown;
    };
    JSONObject: unknown;
    Long: unknown;
};

export enum CustomizableChartFeature {
    X_AXIS_LABEL,
    X_AXIS_TITLE,
    Y_AXIS_LABEL,
    Y_AXIS_TITLE,
    TOOLTIP,
    SCATTER_CHART,
    PIE_CHART,
    LINE_CHART,
    COLUMN_CHART,
    BAR_CHART,
    AREA_CHART,
    TAIL_FEATURE,
}

/**
 * Enum to indicate the type of dimension config
 *
 * @version SDK: 2.6.0 | ThoughtSpot:
 * @group Chart Model
 */
export enum AxisType {
    FLAT = 'flat',
    MERGED = 'merged',
    DUAL = 'dual',
}

/**
 * Flat axis config: single column, unmodified.
 *
 * @version SDK: 2.6.0 | ThoughtSpot:
 * @group Chart Model
 */
export interface FlatAxis {
    type: AxisType.FLAT;
    /** Single column for this axis slot */
    column: ChartColumn;
}

/**
 * Merged axis config: multiple columns combined into one logical series.
 *
 * @version SDK: 2.6.0 | ThoughtSpot:
 * @group Chart Model
 */
export interface MergedAxis {
    type: AxisType.MERGED;
    /** Columns that are merged into one axis slot */
    columns: ChartColumn[];
}

/**
 * Dual axis config: primary and secondary axis, each can be flat or merged.
 *
 * @version SDK: 2.6.0 | ThoughtSpot:
 * @group Chart Model
 */
export interface DualAxis {
    type: AxisType.DUAL;
    /** Primary axis config (flat or merged) */
    primary: FlatAxis | MergedAxis;
    /** Secondary axis config (flat or merged) */
    secondary: FlatAxis | MergedAxis;
}

/**
 * Union of all supported axis types for a dimension.
 */
export type AxisConfig = FlatAxis | MergedAxis | DualAxis;

/**
 * Enum to indicate whether dimension config uses columns or structured config
 *
 * @version SDK: 2.6.0 | ThoughtSpot:
 * @group Chart Model
 */
export enum ChartConfigMode {
    COLUMN_DRIVEN = 'COLUMN_DRIVEN',
    AXIS_DRIVEN = 'AXIS_DRIVEN',
}

/**
 * Column driven dimension config: single column or multiple columns.
 *
 * @version SDK: 2.6.0 | ThoughtSpot:
 * @group Chart Model
 */
export interface ColumnDrivenChartConfigDimension {
    /**
     * Key for the dimension in the chart config
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    key: string;
    /**
     * Mode of the chart config
     *
     * @version SDK: 2.6.0 | ThoughtSpot:
     */
    mode?: ChartConfigMode.COLUMN_DRIVEN;
    /**
     * List of columns added for the dimension
     * If chart config mode is COLUMN_DRIVEN, this is required
     * @version SDK: 2.6.0 | ThoughtSpot:
     */
    columns: ChartColumn[];
}

/**
 * Axis driven dimension config: multiple axes, each can be flat or merged.
 *
 * @version SDK: 2.6.0 | ThoughtSpot:
 * @group Chart Model
 */
export interface AxisDrivenChartConfigDimension {
    /**
     * Key for the dimension in the chart config
     *
     * @version SDK: 2.6.0 | ThoughtSpot:
     */
    key: string;
    /**
     * Mode of the chart config
     *
     * @version SDK: 2.6.0 | ThoughtSpot:
     */
    mode: ChartConfigMode.AXIS_DRIVEN;
    /**
     * Axis config of the dimension
     *
     * @version SDK: 2.6.0 | ThoughtSpot:
     */
    axes: AxisConfig[];
}

/**
 * List of Columns for a dimension in the Custom Chart Config.
 * Associated with the key defined in the chart config editor definition
 * Relates to ChartConfigSection
 *
 * @version SDK: 0.1 | ThoughtSpot:
 * @group Chart Model
 */
export type ChartConfigDimension =
    | ColumnDrivenChartConfigDimension
    | AxisDrivenChartConfigDimension;

/**
 * Custom Chart Config values stored in the metadata
 * Relates to ChartConfigEditorDefinition
 *
 * @version SDK: 0.1 | ThoughtSpot:
 * @group Chart Model
 */
export interface ChartConfig {
    /**
     * Key of the custom chart config defined in the chart config editor definition
     * This is used to differentiate between different custom chart configurations
     * within the same chart
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    key: string;
    /**
     * Details of columns for each dimension
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    dimensions: ChartConfigDimension[];
}

/**
 * Data Points Array interface to define data for each row and column.
 * Data is ordered as per the columns in the query and the rows are sorted
 * as per the search query.
 *
 * @version SDK: 0.1 | ThoughtSpot:
 * @group Chart Model
 */
export type DataPointsArray = {
    /**
     * Array of column IDs ordered as per the data query
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    columns: string[];

    /**
     * Array of rows of data ordered by the columns
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    dataValue: any[][];
};

/**
 * For each query defined by the user, a query data object is sent
 * in this format.
 *
 * @version SDK: 0.1 | ThoughtSpot:
 * @group Chart Model
 */
export type QueryData = {
    /**
     * Data Array for each column
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    data: DataPointsArray;

    /**
     * @hidden
     * @version SDK: 0.1 | ThoughtSpot:
     */
    completionRatio?: number;
    /**
     * @hidden
     * @version SDK: 0.1 | ThoughtSpot:
     */
    samplingRatio?: number;

    /**
     * Number of rows of data fetched for the query
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    totalRowCount: number;
};

/**
 *
 * @group Chart Model
 * @version SDK: 0.1 | ThoughtSpot:
 */
export interface ChartModel {
    /**
     * Unique identifier for the chart
     *
     * @version SDK: 2.7.2 | ThoughtSpot:
     */
    id?: string;
    /**
     * List of columns in the search query
     * They may or may not be part of the data query or chart config
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    columns: ChartColumn[];
    /**
     * Array of datasets for each query
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    data?: QueryData[];
    /**
     * Sort info for the chart
     *
     * @version SDK: 2.3.0 | ThoughtSpot:
     */
    sortInfo?: SortInfo[];
    visualProps?: VisualProps;
    config: {
        // chart config stored by chart developer
        chartConfig?: ChartConfig[];
    };
}

// Validation Response for valid config or visual props
export type SuccessValidationResponse = {
    chartConfigEditorDefinition: ChartConfigEditorDefinition[];
    visualPropEditorDefinition: VisualPropEditorDefinition;
    customVisualProps?: VisualProps;
};

export type VisualPropError = {
    propElementKey: string;
    propElementType: string;
    value: unknown;
};

/**
 * Represents a validation error message with its translation key.
 * This type is used to provide localized error messages for validation failures.
 *
 * @example
 * ```typescript
 * const validationError: ValidationErrorMessage = {
 *   errorMessage: "Field is required",
 *   errorTranslation: "REQUIRED_FIELD_ERROR"
 * };
 * ```
 *
 * @property errorTranslation - The translation key that will be used to look up the translated error message
 * @property errorMessage - The default error message that will be shown if translation is not available
 */
export type ValidationErrorMessage = {
    errorTranslation: string;
    errorMessage: string;
};

// Generic Validation Response
export type ValidationResponse = {
    isValid: boolean;
    validationErrorMessage?: string[] | ValidationErrorMessage[];
    visualPropError?: VisualPropError;
};

/**
 * Custom Visual props is the stored metadata for the visual props definition
 * configured by the user in the visual prop editor
 * The object is defined by the visual prop types. See VisualPropEditorDefinition.
 * If there is any local state specific to charts needs to be maintained on save answer, store it
 * in VisualProps, with visualProps.clientState variable. The clientState variable should be a
 * string, preferrably a result of JSON.stringify(<yourlocalClientState>).
 * @remark
 * only values stored in clientSate variable will be preserved on changing the
 * visualPropeditorDefinition, any other variable store would not be preserved
 * @group Chart Model
 * @version SDK: 0.1 | ThoughtSpot:
 */
export type VisualProps = unknown;

/**
 * Sort info for the chart
 *
 * @version SDK: 2.3.0 | ThoughtSpot:
 */
export type SortInfo = {
    /**
     * Category of the sort
     * DEFAULT: Order defined in the worksheet
     * NONE: No sort
     * ALPHA: Alpha sort
     * CUSTOM: Order defined at answer level by the user
     *
     * @version SDK: 2.3.0 | ThoughtSpot:
     */
    category: SortCategory;
    /**
     * Column id
     *
     * @version SDK: 2.3.0 | ThoughtSpot:
     */
    columnId: string;
    /**
     * Sort ascending
     *
     * @version SDK: 2.3.0 | ThoughtSpot:
     */
    sortAscending: boolean;
    /**
     * Whether the sort is user sorted
     *
     * @version SDK: 2.3.0 | ThoughtSpot:
     */
    isUserSorted?: boolean;
    /**
     * Order of the column
     *
     * @version SDK: 2.3.0 | ThoughtSpot:
     */
    order?: number;
    /**
     * Custom order
     * When category is CUSTOM, this will be the custom order of the column
     *
     * @version SDK: 2.3.0 | ThoughtSpot:
     */
    customOrder?: string[];
};

/**
 *  Font Faces type from TS.
 *  guid will be null in case of default Font types
 *  If a custom Font is added in Dev section on TS this guid can be used to Match
 *  the Font Face That needs to be applied to @link CustomizableChartFeature
 */

export type TSFontFace = {
    guid: string | null;
    family?: string;
    format?: string;
    url?: string;
    weight?: string;
    style?: string;
    size?: string;
    unicodeRange?: string;
    variant?: string;
    stretch?: string;
    color?: string;
};

/**
 * Used for Custom color pallete and Custom font for charts defined in Style customisations
 * inside thoughtspot admin or developer section
 *
 */

export type ChartSdkCustomStylingConfig = {
    appBackground?: {
        color?: string;
    };
    appPanelColor?: {
        color?: string;
    };
    chartColorPalettes?: Array<{ colors: Array<string> }>;
    numColorPalettes?: number;
    disableColorRotation?: boolean;
    chartFeatureToFontGuid?: Record<CustomizableChartFeature, string>;
    fontFaces?: Array<TSFontFace>;
};

/**
 * Defines a set of standardized date and datetime format strings used for
 * displaying dates and times in various formats. Each format string represents
 * a specific date or time pattern that can be used for localized display purposes.
 */

export interface DateFormats {
    DATE_SHORT: string;
    DATE_SHORT_2_DIGIT_YEAR: string;
    DATE_SHORT_WITH_HOUR: string;
    DATE_SHORT_WITH_HOUR_WITHOUT_YEAR: string;
    DATE_SHORT_WITH_HOUR_24: string;
    DATE_SHORT_WITH_HOUR_24_WITHOUT_YEAR: string;
    DATETIME_SHORT: string;
    DATETIME_SHORT_WITHOUT_YEAR: string;
    DATETIME_24_SHORT: string;
    DATETIME_24_SHORT_WITH_MILLIS: string;
    DATETIME_24_SHORT_WITH_MILLIS_WITHOUT_YEAR: string;
    DATETIME_SHORT_WITH_SECONDS: string;
    DATETIME_SHORT_WITH_SECONDS_WITHOUT_YEAR: string;
    DATETIME_SHORT_WITH_MILLIS: string;
    DATETIME_SHORT_WITH_MILLIS_WITHOUT_YEAR: string;
    QUARTER_WITH_YEAR: string;
    QUARTER_WITH_2_DIGIT_YEAR: string;
    DEFAULT_TIME_FORMAT: string;
    MONTH_WITH_YEAR: string;
    MONTH_WITH_DAY_AND_YEAR: string;
    MONTH_WITH_2_DIGIT_YEAR: string;
    DAY_WITH_MONTH: string;
    DAY_WITH_MONTH_NUM: string;
    QUARTER: string;
    MONTH_ONLY: string;
    DATETIME_WITH_SHORT_OFFSET: string;
}

/**
 * Configuration object for date formats and settings in the Chart SDK.
 * Provides locale-specific date and string formats, constants, and custom calendars.
 *
 * @type ChartSdkDateFormatsConfig
 *
 * @property tsLocaleBasedDateFormats - Optional. A record mapping locale identifiers to date format settings,
 *   each represented by a `DateFormats` object.
 * @property tsLocaleBasedStringsFormats - Optional. A record mapping locale identifiers to localized string
 *   formats, where each format is represented by a string.
 * @property tsDateConstants - Optional. A record mapping string keys to date-related constants, often used
 *   for standard date patterns or other fixed date-related values(mostly used to identify the case
 *   for backend proccessed date in case of MONTH_OF_YEAR,DAY_OF_WEEK).
 * @property tsDefinedCustomCalenders - Optional. Custom calendar configurations, which have GUID of TS defined Custom calenders.
 * @property defaultDataSourceId - Optional. The data source identifier for the date formats, used
 *   to specify the primary data source for TS defined custom calenders.
 */

export type ChartSdkDateFormatsConfig = {
    tsLocaleBasedDateFormats?: Record<string, DateFormats>;
    tsLocaleBasedStringsFormats?: Record<string, string>;
    tsDateConstants?: Record<string, string>;
    tsDefinedCustomCalenders?: any;
    defaultDataSourceId?: string;
};

/**
 * Query performance metrics passed from the host application (blink-v2)
 * to custom charts for observability and monitoring purposes.
 */
export interface QueryMetrics {
    /**
     * Query execution time in milliseconds
     */
    queryTimingMs?: number;
    /**
     * Whether the query result was served from cache
     */
    isCacheHit?: boolean;
    /**
     * Total number of rows returned by the query
     */
    totalRowCount?: number;
    /**
     * Number of queries executed
     */
    queriesCount?: number;
    /**
     * Timestamp when metrics were captured
     */
    timestamp?: number;
}

export interface AppConfig {
    styleConfig?: ChartSdkCustomStylingConfig;
    dateFormatsConfig?: ChartSdkDateFormatsConfig;
    /**
     * these represent the custom css styles passed in the ts-embed-sdk (customization.style) in init event call. This mainly includes the customCssUrl, customCssVariables and rules_UNSTABLE.
     * @type {Record<string, string | number>}
     * @example
     * {
        customCSSUrl: "https://cdn.jsdelivr.net/gh/thoughtspot/custom-css-demo/css-variables.css",
        // direct overrides declared within the Visual Embed SDK code
        customCSS: {
            // ThoughtSpot variables declared inline
            variables: {
            "--ts-var-button--secondary-background": "#F0EBFF",
            "--ts-var-button--secondary--hover-background": "#E3D9FC",
            "--ts-var-root-background": "#F7F5FF",
            },
            // CSS selectors declared inline, with syntax for declaring multiple CSS properties
            rules_UNSTABLE: {
            '{selector1}' : {
                "{css-property-name}" : "{value}!important",
                "{css-property-name2}" : "{value}!important"
            },
            '{selector2}'...
            }
        },
        },
     * }
     */
    embedCssStyles?: Record<string, string | number>;
    appOptions?: {
        isMobile?: boolean;
        isPrintMode?: boolean; // export mode on/off
        isLiveboardContext?: boolean; // if chart renders in liveboard context
        // runtime configurations
        isDebugMode?: boolean; // enables debug mode for logging
        /**
         * Query performance metrics for observability
         * Passed from blink-v2 to track query execution timing and caching.
         * @version SDK: 2.7.3 | ThoughtSpot:
         */
        queryMetrics?: QueryMetrics;
    };
    /**
     * Release version of ThoughtSpot custom chart is getting rendered upon.
     */
    releaseVersion?: string;
    // locale related settings
    localeOptions?: {
        locale: string;
        currencyLocale: string;
        quarterStartMonth: string;
        sessionTimezone: string;
    };

    /**
     * App url for the custom chart application where the chart app is hosted.
     * This helps the chart developer to access app artifacts relative to this url.
     * There can be different build systems that developers may have used and different ways
     * to host the same. This helps in resolving the same.
     */
    appUrl?: string;

    // Idea: we might be able to map this to data and ask user to read data in a
    // certain way the transformations for point during context menu operations
    // need to be explored
    /**
     * @hidden
     */
    customCalendarConfig?: any; // this is to initialize custom calendar service

    /**
     * Unique identifier for the customer. This can be used as a way to maintain licensing by the
     * third party developer
     */
    chartAppAccessToken?: string;
    /**
     * Array of configuration flags required during chart initialization.
     * Each flag object can contain different configuration settings that control
     * various features and behaviors of the chart.
     *
     * @example
     * initFlags: {
     *   "CHART_SETTINGS_V2": {
     *     flagId: "CHART_SETTINGS_V2",
     *     flagValue: true
     *   },
     *   "CUSTOM_FEATURE_ENABLED": {
     *     flagId: "CUSTOM_FEATURE_ENABLED",
     *     flagValue: false
     *   }
     * }
     */
    initFlags?: Record<string, { flagId: string; flagValue: boolean }>;
    /**
     * Object containing the placeholders for invalid data in TS.
     * This can be used to replace invalid value in TS with custom values in charts vizualization
     * Currently we support it for null and empty
     */
    invalidValuePlaceholders?: {
        nullPlaceholder: string;
        emptyPlaceholder: string;
    };
}

/**
 * @description Configuration interface for controlling the visibility and behavior of actions in a custom chart.
 * This interface allows control over which actions are disabled, hidden, or visible
 * in the Answer Actions(3dot menu)/ context menu actions.
 *
 * @export
 * @interface VisualConfig
 */
export interface VisualConfig {
    /**
     * Array of actions that should be disabled (grayed out) in the custom chart.
     * These actions will be visible but not interactive.
     */
    customChartDisabledActions?: Action[];

    /**
     * Tooltip message for why certain actions are disabled.
     *
     */
    customChartDisabledActionReason?: string;

    /**
     * Array of actions that should be completely hidden from the custom chart's UI.
     * These actions will not be visible to users. Define either this or visibleActions.
     */
    customChartHiddenActions?: Action[];

    /**
     * Array of actions that should be explicitly visible in the custom chart.
     * Use this to specify which actions should be shown in the UI. Define either this or Hidden
     * Actions
     */
    customChartVisibleActions?: Action[];
}

export interface VisualPropsChangeInfo {
    path: string;
    value: unknown;
}
