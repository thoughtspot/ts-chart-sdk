/**
 * @file Visual Prop Utilities V2 for Custom Bar Chart
 *
 * @fileoverview
 * Contains helper functions to extract visual prop values from V2 structure
 *
 * @author Chetan Agrawal <chetan.agrawal@thoughtspot.com>
 *
 * Copyright: ThoughtSpot Inc. 2023
 */

import _ from 'lodash';

/**
 * Interface for extracted V2 visual props
 */
export interface ExtractedV2VisualProps {
    color: string;
    datalabels: boolean;
    legendPosition: string;
    xAxisName: string;
    yAxisName: string;
    tooltipConfig: {
        columnIds: string[];
    };
}

/**
 * Helper function to safely get a value from nested V2 visual prop structure
 * @param visualProps - The visual props object
 * @param path - The path to the property (dot notation)
 * @param defaultValue - Default value if path doesn't exist
 * @returns The value at the path or default value
 */
export function getV2VisualPropValue(
    visualProps: any,
    path: string,
    defaultValue?: any,
) {
    return _.get(visualProps, path, defaultValue);
}

/**
 * Helper to extract the first axis name from nested structure
 * Used for tab-based axis settings where settings are nested under field ID
 * @param visualProps - The visual props object
 * @param section - The section name (e.g., 'axisVisualProps')
 * @returns The first matching axis name or empty string
 */
function getFirstAxisNameFromNested(visualProps: any, section: string): string {
    const axisProps = getV2VisualPropValue(visualProps, section, {});
    const fieldIds = Object.keys(axisProps);
    if (fieldIds.length === 0) return '';

    // Get the first field's settings
    const firstFieldSettings = axisProps[fieldIds[0]];
    return firstFieldSettings?.['axis-name'] || '';
}

/**
 * Extracts all V2 visual props from the nested structure
 *
 * V2 Visual Props Structure:
 * {
 *   displayVisualProps: {
 *     displayAccordion: {
 *       color: { color: 'red' | 'green' | 'yellow' }
 *     }
 *   },
 *   dataLabelVisualProps: {
 *     dataLabelAccordion: {
 *       datalabels: { datalabels: boolean }
 *     }
 *   },
 *   legendVisualProps: {
 *     legendAccordion: {
 *       legendPosition: { legendPosition: 'top' | 'bottom' | 'left' | 'right' }
 *     }
 *   },
 *   axisVisualProps: {
 *     // Nested structure - settings stored under field ID
 *     '${fieldId}': {
 *       'axis-name': string,
 *       'show-axis-title': boolean,
 *       'axis-min': number,
 *       'axis-max': number
 *     }
 *   },
 *   tooltipVisualProps: {
 *     tooltipAccordion: {
 *       tooltipconfig1: {
 *         tooltipconfig1: { columnIds: string[] }
 *       }
 *     }
 *   }
 * }
 *
 * @param visualProps - The visual props object from chart model
 * @returns Extracted visual props with proper defaults
 */
export function extractV2VisualProps(visualProps: any): ExtractedV2VisualProps {
    return {
        // Display Settings - Color selection
        color: getV2VisualPropValue(
            visualProps,
            'displayVisualProps.displayAccordion.color.color',
            'red',
        ),
        // Data Labels - Toggle for showing/hiding data labels
        datalabels: getV2VisualPropValue(
            visualProps,
            'dataLabelVisualProps.dataLabelAccordion.datalabels.datalabels',
            false,
        ),
        // Legend Settings - Position of the legend
        legendPosition: getV2VisualPropValue(
            visualProps,
            'legendVisualProps.legendAccordion.legendPosition.legendPosition',
            'top',
        ),
        // Axis Settings - These are now nested under field IDs
        // We'll extract the first axis name found (for backward compatibility)
        xAxisName: getFirstAxisNameFromNested(visualProps, 'axisVisualProps'),
        yAxisName: getFirstAxisNameFromNested(visualProps, 'axisVisualProps'),
        // Tooltip Settings - Column IDs to show in tooltip
        tooltipConfig: getV2VisualPropValue(
            visualProps,
            'tooltipVisualProps.tooltipAccordion.tooltipconfig1.tooltipconfig1',
            { columnIds: [] },
        ),
    };
}

/**
 * Gets axis visual props for a specific field/column
 * Storage structure: axisVisualProps[fieldId][settingKey] = value
 * @param visualProps - The visual props object
 * @param fieldId - The field/column ID
 * @returns Axis visual props for the specific field
 */
export function getAxisVisualPropsForField(visualProps: any, fieldId: string) {
    const fieldSettings = getV2VisualPropValue(
        visualProps,
        `axisVisualProps.${fieldId}`,
        {},
    );

    return {
        axisName: fieldSettings['axis-name'] || '',
        showAxisTitle: fieldSettings['show-axis-title'] !== false,
        axisMin: fieldSettings['axis-min'],
        axisMax: fieldSettings['axis-max'],
    };
}

/**
 * Gets column-specific visual props from V2 structure
 * @param visualProps - The visual props object
 * @param columnId - The column ID to get props for
 * @returns Column-specific visual props
 */
export function getColumnVisualProps(visualProps: any, columnId: string) {
    const columnProps = getV2VisualPropValue(
        visualProps,
        `columnVisualProps.${columnId}`,
        {},
    );

    return {
        columnSettings: getV2VisualPropValue(
            columnProps,
            'columnAccordion.columnSettings',
            {},
        ),
    };
}
