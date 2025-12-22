import { AppConfig, VisualProps } from '@thoughtspot/ts-chart-sdk';
import _ from 'lodash';

/**
 * Determines whether to use v1 schema based on flags
 * @param isChartSettingsV2Enabled - Whether Settings v2 is enabled
 * @param wantToSeeV1ToV2Conversion - Flag to force v1 schema visibility
 * @returns true if v1 schema should be used, false for v2
 */
const shouldUseV1Schema = (
    isChartSettingsV2Enabled: boolean,
    wantToSeeV1ToV2Conversion: boolean,
): boolean => {
    return wantToSeeV1ToV2Conversion || !isChartSettingsV2Enabled;
};

/**
 * Extracts color from visual props based on v1/v2 schema
 * @param visualProps - The visual properties object
 * @param isChartSettingsV2Enabled - Whether Settings v2 is enabled
 * @param wantToSeeV1ToV2Conversion - Flag to force v1 schema visibility
 * @param defaultValue - Default value if not found
 * @returns The color value
 */
export const getVisualPropColor = (
    visualProps: VisualProps | undefined,
    isChartSettingsV2Enabled: boolean,
    wantToSeeV1ToV2Conversion: boolean,
    defaultValue: string,
): string => {
    if (!visualProps) {
        return defaultValue;
    }

    const useV1 = shouldUseV1Schema(
        isChartSettingsV2Enabled,
        wantToSeeV1ToV2Conversion,
    );

    if (useV1) {
        const result = _.get(
            visualProps,
            'displaySettings.color',
            defaultValue,
        );
        // If the result is an empty object, return the default value instead
        if (_.isObject(result) && _.isEmpty(result)) {
            return defaultValue;
        }
        return result;
    }
    console.log('displayVisualProps', visualProps);
    console.log(
        'displayVisualProps.displayAccordion.color.color',
        visualProps,
        _.get(
            visualProps,
            'displayVisualProps.displayAccordion.color.color',
            defaultValue,
        ),
    );
    const result = _.get(
        visualProps,
        'displayVisualProps.displayAccordion.color.color',
        defaultValue,
    );
    // If the result is an empty object, return the default value instead
    if (_.isObject(result) && _.isEmpty(result)) {
        return defaultValue;
    }
    return result;
};

/**
 * Extracts data labels flag from visual props based on v1/v2 schema
 * @param visualProps - The visual properties object
 * @param isChartSettingsV2Enabled - Whether Settings v2 is enabled
 * @param wantToSeeV1ToV2Conversion - Flag to force v1 schema visibility
 * @param defaultValue - Default value if not found
 * @returns The data labels flag value
 */
export const getVisualPropDataLabels = (
    visualProps: VisualProps | undefined,
    isChartSettingsV2Enabled: boolean,
    wantToSeeV1ToV2Conversion: boolean,
    defaultValue: boolean,
): boolean => {
    if (!visualProps) {
        return defaultValue;
    }

    const useV1 = shouldUseV1Schema(
        isChartSettingsV2Enabled,
        wantToSeeV1ToV2Conversion,
    );

    if (useV1) {
        const result = _.get(
            visualProps,
            'dataLabels.datalabels',
            defaultValue,
        );
        // If the result is an empty object, return the default value instead
        if (_.isObject(result) && _.isEmpty(result)) {
            return defaultValue;
        }
        return result;
    }
    const result = _.get(
        visualProps,
        'dataLabelVisualProps.dataLabelAccordion.datalabels.datalabels',
        defaultValue,
    );
    // If the result is an empty object, return the default value instead
    if (_.isObject(result) && _.isEmpty(result)) {
        return defaultValue;
    }
    return result;
};

/**
 * Extracts show tooltip flag from visual props based on v1/v2 schema
 * @param visualProps - The visual properties object
 * @param isChartSettingsV2Enabled - Whether Settings v2 is enabled
 * @param wantToSeeV1ToV2Conversion - Flag to force v1 schema visibility
 * @param defaultValue - Default value if not found
 * @returns The show tooltip flag value
 */
export const getVisualPropShowTooltip = (
    visualProps: VisualProps | undefined,
    isChartSettingsV2Enabled: boolean,
    wantToSeeV1ToV2Conversion: boolean,
    defaultValue: boolean,
): boolean => {
    if (!visualProps) {
        return defaultValue;
    }

    const useV1 = shouldUseV1Schema(
        isChartSettingsV2Enabled,
        wantToSeeV1ToV2Conversion,
    );

    if (useV1) {
        const result = _.get(visualProps, 'tooltip.showTooltip', defaultValue);
        // If the result is an empty object, return the default value instead
        if (_.isObject(result) && _.isEmpty(result)) {
            return defaultValue;
        }
        return result;
    }
    const result = _.get(
        visualProps,
        'tooltipVisualProps.tooltipAccordion.showTooltip.showTooltip',
        defaultValue,
    );
    // If the result is an empty object, return the default value instead
    if (_.isObject(result) && _.isEmpty(result)) {
        return defaultValue;
    }
    return result;
};

/**
 * Extracts X axis name from visual props based on v1/v2 schema
 * @param visualProps - The visual properties object
 * @param isChartSettingsV2Enabled - Whether Settings v2 is enabled
 * @param wantToSeeV1ToV2Conversion - Flag to force v1 schema visibility
 * @param defaultValue - Default value if not found
 * @returns The X axis name
 */
export const getVisualPropXAxisName = (
    visualProps: VisualProps | undefined,
    isChartSettingsV2Enabled: boolean,
    wantToSeeV1ToV2Conversion: boolean,
    defaultValue: string,
): string => {
    if (!visualProps) {
        return defaultValue;
    }

    const useV1 = shouldUseV1Schema(
        isChartSettingsV2Enabled,
        wantToSeeV1ToV2Conversion,
    );

    if (useV1) {
        const result = _.get(
            visualProps,
            'axisSettings.xAxisName',
            defaultValue,
        );
        // If the result is an empty object, return the default value instead
        if (_.isObject(result) && _.isEmpty(result)) {
            return defaultValue;
        }
        return result;
    }
    const result = _.get(
        visualProps,
        'axisVisualProps.axisAccordion.xAxisName.xAxisName',
        defaultValue,
    );
    // If the result is an empty object, return the default value instead
    if (_.isObject(result) && _.isEmpty(result)) {
        return defaultValue;
    }
    return result;
};

/**
 * Extracts Y axis name from visual props based on v1/v2 schema
 * @param visualProps - The visual properties object
 * @param isChartSettingsV2Enabled - Whether Settings v2 is enabled
 * @param wantToSeeV1ToV2Conversion - Flag to force v1 schema visibility
 * @param defaultValue - Default value if not found
 * @returns The Y axis name
 */
export const getVisualPropYAxisName = (
    visualProps: VisualProps | undefined,
    isChartSettingsV2Enabled: boolean,
    wantToSeeV1ToV2Conversion: boolean,
    defaultValue: string,
): string => {
    if (!visualProps) {
        return defaultValue;
    }

    const useV1 = shouldUseV1Schema(
        isChartSettingsV2Enabled,
        wantToSeeV1ToV2Conversion,
    );

    if (useV1) {
        const result = _.get(
            visualProps,
            'axisSettings.yAxisName',
            defaultValue,
        );
        // If the result is an empty object, return the default value instead
        if (_.isObject(result) && _.isEmpty(result)) {
            return defaultValue;
        }
        return result;
    }
    const result = _.get(
        visualProps,
        'axisVisualProps.axisAccordion.yAxisName.yAxisName',
        defaultValue,
    );
    // If the result is an empty object, return the default value instead
    if (_.isObject(result) && _.isEmpty(result)) {
        return defaultValue;
    }
    return result;
};

/**
 * Extracts legend position from visual props based on v1/v2 schema
 * @param visualProps - The visual properties object
 * @param isChartSettingsV2Enabled - Whether Settings v2 is enabled
 * @param wantToSeeV1ToV2Conversion - Flag to force v1 schema visibility
 * @param defaultValue - Default value if not found
 * @returns The legend position
 */
export const getVisualPropLegendPosition = (
    visualProps: VisualProps | undefined,
    isChartSettingsV2Enabled: boolean,
    wantToSeeV1ToV2Conversion: boolean,
    defaultValue: string,
): string => {
    if (!visualProps) {
        return defaultValue;
    }

    const useV1 = shouldUseV1Schema(
        isChartSettingsV2Enabled,
        wantToSeeV1ToV2Conversion,
    );

    if (useV1) {
        const result = _.get(
            visualProps,
            'legendSettings.legendPosition',
            defaultValue,
        );
        // If the result is an empty object, return the default value instead
        if (_.isObject(result) && _.isEmpty(result)) {
            return defaultValue;
        }
        return result;
    }
    const result = _.get(
        visualProps,
        'legendVisualProps.legendAccordion.legendPosition.legendPosition',
        defaultValue,
    );
    // If the result is an empty object, return the default value instead
    if (_.isObject(result) && _.isEmpty(result)) {
        return defaultValue;
    }
    return result;
};

/**
 * Extracts column opacity from visual props based on v1/v2 schema
 * @param visualProps - The visual properties object
 * @param columnId - The column ID to get opacity for
 * @param isChartSettingsV2Enabled - Whether Settings v2 is enabled
 * @param wantToSeeV1ToV2Conversion - Flag to force v1 schema visibility
 * @param defaultValue - Default value if not found
 * @returns The column opacity value
 */
export const getVisualPropColumnOpacity = (
    visualProps: VisualProps | undefined,
    columnId: string,
    isChartSettingsV2Enabled: boolean,
    wantToSeeV1ToV2Conversion: boolean,
    defaultValue: number,
): number => {
    if (!visualProps) {
        return defaultValue;
    }

    const useV1 = shouldUseV1Schema(
        isChartSettingsV2Enabled,
        wantToSeeV1ToV2Conversion,
    );

    if (useV1) {
        const result = _.get(
            visualProps,
            `columnVisualProps.${columnId}.opacity`,
            defaultValue,
        );
        // If the result is an empty object, return the default value instead
        if (_.isObject(result) && _.isEmpty(result)) {
            return defaultValue;
        }
        return result;
    }
    // For v2, column opacity is in
    // columnVisualProps[columnId].columnOpacityAccordion.opacity
    console.log('columnVisualProps', visualProps);
    console.log(
        `columnVisualProps.${columnId}.columnOpacityAccordion.opacity.opacity`,
        _.get(
            visualProps,
            `columnVisualProps.${columnId}.columnOpacityAccordion.opacity.opacity`,
            defaultValue,
        ),
    );
    const result = _.get(
        visualProps,
        `columnVisualProps.${columnId}.columnOpacityAccordion.opacity.opacity`,
        defaultValue,
    );
    // If the result is an empty object, return the default value instead
    if (_.isObject(result) && _.isEmpty(result)) {
        return defaultValue;
    }
    return result;
};
