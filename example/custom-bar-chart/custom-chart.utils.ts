/**
 * @file Custom Bar Chart Utils
 *
 * @fileoverview
 *
 * @author Yashvardhan Nehra <yashvardhan.nehra@thoughtspot.com>
 *
 * Copyright: ThoughtSpot Inc. 2024
 */

import {
    applicableConditionalFormatting,
    ChartSdkCustomStylingConfig,
    ConditionalFormatting,
    Operators,
    VisualProps,
} from '@thoughtspot/ts-chart-sdk';
import _ from 'lodash';

export const visualPropKeyMap = {
    0: 'color',
    1: 'accordion.Color2',
    2: 'accordion.datalabels',
};

export const availableColor = ['red', 'green', 'blue'];

/**
 * Determines the background color for a chart element based on custom styling
 * configurations, visual properties, and conditional formatting.
 *
 * This function first checks if a custom color palette is provided in the
 * `customStyleConfig`. If not, it falls back to default colors defined in
 * `visualProps` or a set of available colors. It also considers conditional
 * formatting rules to apply specific colors if certain conditions are met.
 *
 * @param {ChartSdkCustomStylingConfig} customStyleConfig - The custom styling configuration object.
 * @param {VisualProps} visualProps - The visual properties object containing styling details.
 * @param {any} idx - The index of the current dataset or chart element.
 * @param {any} dataArr - The array of data points used in the chart.
 * @param {any} CFforColumn - The conditional formatting rules applicable to the column.
 * @param {number} index - The index of the current data point within the dataset.
 * @param {any} colId - The identifier of the column being processed.
 * @returns {string} The determined background color as a string.
 */

export function getBackgroundColor(
    customStyleConfig: ChartSdkCustomStylingConfig,
    visualProps: VisualProps,
    idx: any,
    dataArr: any,
    CFforColumn: any,
    index: number,
    colId: any,
) {
    const color =
        customStyleConfig?.chartColorPalettes?.length &&
        customStyleConfig?.chartColorPalettes[0].colors.length > 0
            ? customStyleConfig?.chartColorPalettes[0].colors
            : _.get(visualProps, visualPropKeyMap?.[idx], availableColor[idx]);

    const applicableFormatting = applicableConditionalFormatting(
        index,
        colId,
        dataArr,
        CFforColumn,
    );
    let color2 = applicableFormatting?.solidBackgroundAttrs?.color;
    if (applicableFormatting?.plotAsBand) {
        color2 = null;
    }
    return color2 ?? color;
}

/**
 * Extracts plotlines and plotbands from the given conditional formatting rules.
 *
 * This function processes conditional formatting rules (e.g., thresholds, ranges)
 * applied to a chart column and generates plotlines and plotbands that can be used
 * to visually indicate these conditions on the chart. Plotlines are single lines
 * drawn at specific values, while plotbands are shaded areas between two values.
 *
 * @param {ConditionalFormatting | undefined} CFforColumn - The conditional formatting rules for the column.
 * @param {string} axisId - The identifier of the axis to which the plotlines/plotbands will be applied.
 * @returns {Object} An object containing arrays of plotlines and plotbands.
 */

export function getPlotLinesAndBandsFromConditionalFormatting(
    CFforColumn: ConditionalFormatting | undefined,
    axisId: string,
) {
    const plotlines: any = [];
    const plotbands: any = [];

    CFforColumn?.rows?.forEach((metric) => {
        const value = metric?.value ? parseFloat(metric.value) : null;

        const color = metric?.solidBackgroundAttrs?.color;
        if (metric?.operator === Operators.IsBetween) {
            const value1 = metric?.rangeValues?.min ?? null;
            const value2 = metric?.rangeValues?.max ?? null;
            if (value1 !== null && value2 !== null) {
                plotlines.push(
                    {
                        value: value1,
                        axisId,
                        color,
                        fill: metric?.plotAsBand,
                    },
                    {
                        value: value2,
                        axisId,
                        color,
                        fill: metric?.plotAsBand,
                    },
                );
                if (metric?.plotAsBand) {
                    plotbands.push({
                        from: value1,
                        to: value2,
                        axisId,
                        color,
                    });
                }
            }
        } else if (value !== null) {
            plotlines.push({
                value,
                axisId,
                color,
                fill: metric?.plotAsBand,
            });
        }
    });
    return { plotlines, plotbands };
}
