/**
 * @file Custom Bar Chart Plugins
 *
 * @fileoverview
 *
 * @author Yashvardhan Nehra <yashvardhan.nehra@thoughtspot.com>
 *
 * Copyright: ThoughtSpot Inc. 2024
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
                    ctx.strokeStyle = plotline.color;
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

                    ctx.fillStyle = plotband.color;
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
