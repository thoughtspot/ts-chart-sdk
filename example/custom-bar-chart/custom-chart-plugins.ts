/**
 * @file Custom Bar Chart Plugins
 *
 * @fileoverview
 *
 * @author Yashvardhan Nehra <yashvardhan.nehra@thoughtspot.com>
 *
 * Copyright: ThoughtSpot Inc. 2024
 */

/**
 * Creates a custom Chart.js plugin to draw plotlines on the chart.
 *
 * The plugin iterates over the datasets in the chart and draws horizontal
 * lines at specified values on the y-axis. These plotlines are typically
 * used to highlight specific threshold values or boundaries defined by
 * conditional formatting.
 *
 * @param {Object} dataModel - The data model containing the datasets with plotlines.
 * @returns {Object} The plugin configuration object for Chart.js.
 */

export function createPlotlinePlugin(dataModel) {
    return {
        id: 'cfPlotlinePlugin',
        beforeDraw(chart) {
            const ctx = chart.ctx;
            dataModel.getDatasets().forEach((dataset) => {
                const plotlines = dataset.plotlines;
                const axisId = dataset.yAxisID;
                plotlines?.forEach((plotline) => {
                    const yScale = chart.scales[axisId];
                    const yValue = yScale.getPixelForValue(plotline.value);
                    ctx.strokeStyle = plotline.color || 'white';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(chart.chartArea.left, yValue);
                    ctx.lineTo(chart.chartArea.right, yValue);
                    ctx.stroke();
                });
            });
        },
    };
}

/**
 * Creates a custom Chart.js plugin to draw plotbands on the chart.
 *
 * The plugin iterates over the datasets in the chart and draws shaded
 * areas (plotbands) between specified values on the y-axis. These plotbands
 * are typically used to highlight ranges of values defined by conditional
 * formatting.
 *
 * @param {Object} dataModel - The data model containing the datasets with plotbands.
 * @returns {Object} The plugin configuration object for Chart.js.
 */

export function createPlotbandPlugin(dataModel) {
    return {
        id: 'cfPlotbandPlugin',
        beforeDraw(chart) {
            const ctx = chart.ctx;
            const chartArea = chart.chartArea;
            dataModel.getDatasets().forEach((dataset) => {
                const plotbands = dataset.plotbands;
                const axisId = dataset.yAxisID;
                plotbands?.forEach((plotband) => {
                    const yScale = chart.scales[axisId];
                    const yValueFrom = yScale.getPixelForValue(plotband.from);
                    const yValueTo = yScale.getPixelForValue(plotband.to);

                    ctx.fillStyle = plotband.color || 'white';
                    ctx.beginPath();
                    ctx.moveTo(chartArea.left, yValueFrom);
                    ctx.lineTo(chartArea.right, yValueFrom);
                    ctx.lineTo(chartArea.right, yValueTo);
                    ctx.lineTo(chartArea.left, yValueTo);
                    ctx.closePath();
                    ctx.fill();
                });
            });
        },
    };
}
