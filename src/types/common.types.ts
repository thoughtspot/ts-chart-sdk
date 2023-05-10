/**
 * @file: Common Types
 * @fileoverview All commons types for the Custom Chart implementations
 * @author Chetan Agrawal <chetan.agrawal@thoughtspot.com>
 *
 * Copyright: ThoughtSpot Inc. 2023
 */

import { ChartColumn, DataType } from './answer-column.types';

/**
 * List of Columns for a dimension in the Custom Chart Config.
 * Associated with the key defined in the chart config editor definition
 * Relates to ChartConfigSection
 *
 * @version SDK: 0.1 | ThoughtSpot:
 * @group Chart Model
 */
export interface ChartConfigDimension {
    /**
     * key fo the dimension in the chart config
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    key: string;
    /**
     * list of columns added for the dimension
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    columns: ChartColumn[];
}

/**
 * Custom Chart Config values stored in the metadata
 * Relates to ChartConfigEditorDefinition
 *
 * @version SDK: 0.1 | ThoughtSpot:
 * @group Chart Model
 */
export interface ChartConfig {
    /**
     * key of the custom chart config defined in the chart config editor definition
     * this is used to differentiate between different custom chart configurations
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
 * Data Array inteface to define each column data
 *
 * @version SDK: 0.1 | ThoughtSpot:
 * @group Chart Model
 */
export type DataArray = {
    /**
     * column id associated with the data array
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    columnId: string;
    /**
     * type of data
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    columnDataType: DataType;
    /**
     * The array of data values associated with the column
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    dataValue: any[];
};

/**
 * For each query defined by the user, a query data object is sent
 * in the following format
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
    data: DataArray[];

    /**
     * @hidden
     * @version SDK: 0.1 | ThoughtSpot:
     */
    completionRatio: number;
    /**
     * @hidden
     * @version SDK: 0.1 | ThoughtSpot:
     */
    samplingRatio: number;

    /**
     * number of rows of data fetched for the query
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
     * List of columns in the search query
     * They may or may not be part of the data query or chart config
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    columns: ChartColumn[];
    /**
     * Array of Datasets for each query
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    data?: QueryData[];
    sortInfo?: any; // TODO(chetan):
    visualProps?: VisualProps;
    config: {
        // chart config stored by chart developer
        chartConfig?: ChartConfig[];
    };
}

// Generic Validation Response
export type ValidationResponse = {
    isValid: boolean;
    validationErrorMessage?: string[];
};

/**
 * Custom Visual props is the stored metadata for the visual props definition
 * configured by the user in the visual prop editor
 * The JSON is defined by the visual prop types. See VisualPropEditorDefinition
 *
 * @group Chart Model
 * @version SDK: 0.1 | ThoughtSpot:
 */
export type VisualProps = JSON;

// Todo: this should be imported from custom style config package.
type CustomStylingConfig = any;

export interface AppConfig {
    styleConfig?: CustomStylingConfig;

    appOptions?: {
        isMobile?: boolean;
        isPrintMode?: boolean; // export mode on/off

        // runtime configurations
        isDebugMode?: boolean; // enables debug mode for logging
    };

    // locale related settings
    localeOptions?: {
        locale: string;
        quarterStartMonth: string;
        sessionTimezone: string;
    };

    // Idea: we might be able to map this to data and ask user to read data in a
    // certain way the transformations for point during context menu operations
    // need to be explored
    customCalendarConfig?: any; // this is to initialize custom calendar service
}
