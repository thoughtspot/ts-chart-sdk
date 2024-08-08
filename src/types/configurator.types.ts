/**
 * @file Column Configuration Definition
 * @fileoverview
 * Developers will use this to define the axis configuration that any
 * creator of the chart can use it to define the expected chart configuration.
 *
 * This will also be validated with the overall expectation
 * of the chart developer using validate flow.
 *
 * Developers are expected to use this to define the data queries
 * required for the chart.
 * @author Chetan Agrawal <chetan.agrawal@thoughtspot.com>
 *
 * Copyright: ThoughtSpot Inc. 2023
 */

import { CustomChartContext } from '../main/custom-chart-context';
import { ChartModel } from './common.types';
/**
 *
 * @group Chart Configuration Editor
 */
export interface ChartConfigSection {
    /**
     * Key to persist the columns
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    key: string;
    /**
     * i18n'ed string to show the section label on the config editor
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    label: string;

    /**
     * In the UI, the following values will only prevent dropping unnecessary
     * columns on the section config or prevent users from opening a drop-down in case of
     * multiple queries. Developers must validate this flow.
     */

    /**
     * Number of columns allowed in the section
     *
     * @default Number.POSITIVE_INFINITY
     * @version SDK: 0.1 | ThoughtSpot:
     */
    maxColumnCount?: number;
    /**
     * Allow Numeric Columns on the Section
     *
     * @default true
     * @version SDK: 0.1 | ThoughtSpot:
     */
    allowMeasureColumns?: boolean;
    /**
     * Allow Attribute/Dimensional Columns on the Section
     * Example: strings, dates, etc
     *
     * @default true
     * @version SDK: 0.1 | ThoughtSpot:
     */
    allowAttributeColumns?: boolean;
    /**
     * Allow Date and Time based Columns on the Section
     *
     * @default true
     * @hidden Not exposing this now to define more clearly
     * @version SDK: 0.1 | ThoughtSpot:
     */
    allowTimeSeriesColumns?: boolean;
    /**
     * Allow measure name Column on the Section
     *
     * @default true
     * @version SDK: 0.1 | ThoughtSpot:
     */
    allowMeasureNameColumn?: boolean;
    /**
     * Allow measure value Column on the Section
     *
     * @default true
     * @version SDK: 0.1 | ThoughtSpot:
     */
    allowMeasureValueColumn?: boolean;
}

/**
 *
 * @group Chart Configuration Editor
 */
export interface ChartConfigEditorDefinition {
    /**
     * Key to store the chart config
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    key: string;
    /**
     * i18n'ed string to show the editor header for the chart config
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    label?: string;
    /**
     * i18n'ed string to show the editor description for the chart config
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    descriptionText?: string;
    /**
     * Defines all the column sections for the chart config
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    columnSections: ChartConfigSection[];
}

export type ConfigEditorDefinitionSetter = (
    currentState: ChartModel,
    ctx: CustomChartContext,
) => ChartConfigEditorDefinition[];
