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
        return _.get(visualProps, 'displaySettings.color', defaultValue);
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
    return _.get(
        visualProps,
        'displayVisualProps.displayAccordion.color.color',
        defaultValue,
    );
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
        return _.get(visualProps, 'dataLabels.datalabels', defaultValue);
    }
    return _.get(
        visualProps,
        'dataLabelVisualProps.dataLabelAccordion.datalabels.datalabels',
        defaultValue,
    );
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
        return _.get(visualProps, 'tooltip.showTooltip', defaultValue);
    }
    return _.get(
        visualProps,
        'tooltipVisualProps.tooltipAccordion.showTooltip.showTooltip',
        defaultValue,
    );
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
        return _.get(visualProps, 'axisSettings.xAxisName', defaultValue);
    }
    return _.get(
        visualProps,
        'axisVisualProps.axisAccordion.xAxisName.xAxisName',
        defaultValue,
    );
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
        return _.get(visualProps, 'axisSettings.yAxisName', defaultValue);
    }
    return _.get(
        visualProps,
        'axisVisualProps.axisAccordion.yAxisName.yAxisName',
        defaultValue,
    );
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
        return _.get(
            visualProps,
            'legendSettings.legendPosition',
            defaultValue,
        );
    }
    return _.get(
        visualProps,
        'legendVisualProps.legendAccordion.legendPosition.legendPosition',
        defaultValue,
    );
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
        return _.get(
            visualProps,
            `columnVisualProps.${columnId}.opacity`,
            defaultValue,
        );
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
    return _.get(
        visualProps,
        `columnVisualProps.${columnId}.columnOpacityAccordion.opacity.opacity`,
        defaultValue,
    );
};
