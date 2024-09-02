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
    ChartColumn,
    ChartConfig,
    ChartModel,
    ChartSdkCustomStylingConfig,
    ChartToTSEvent,
    ColumnType,
    ConditionalFormatting,
    CustomChartContext,
    DataPointsArray,
    dateFormatter,
    getCfForColumn,
    getChartContext,
    isDateColumn,
    isDateNumColumn,
    Operators,
    PointVal,
    Query,
    ValidationResponse,
    VisualPropEditorDefinition,
    VisualProps,
} from '@thoughtspot/ts-chart-sdk';
import { ChartConfigEditorDefinition } from '@thoughtspot/ts-chart-sdk/src';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import _ from 'lodash';

export const visualPropKeyMap = {
    0: 'color',
    1: 'accordion.Color2',
    2: 'accordion.datalabels',
};

export const availableColor = ['red', 'green', 'blue'];

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
