import {
  ChartConfig,
  ChartModel,
  ChartToTSEvent,
  ColumnType,
  CustomChartContext,
  getChartContext,
  Query,
} from '@thoughtspot/ts-chart-sdk';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import Chart from 'chart.js/auto';
import _ from 'lodash';
import USjsonData from './ADMIN_DIV_2-US.json'
import L from 'leaflet';

Chart.register(ChartDataLabels);
function getDataModel(chartModel: ChartModel) {
  const dataModel=chartModel.data?.[0].data.dataValue;
  const updatedCounties= dataModel?.map(([name, value]) => {
    const words = name.split(' ');
    if (words.length >= 2) {
      words.pop();
    }
    const updatedName = words.join(' ');
    return [updatedName, value];
  });
  console.log(updatedCounties)
  return updatedCounties;
}
let globalChartReference: Chart;
const render = (ctx: CustomChartContext) => {
  const chartModel = ctx.getChartModel();
  const dataModel = getDataModel(chartModel);
  console.log(dataModel)
  const USCountyData = USjsonData;
  console.log(USCountyData)
  const updatedCounties = dataModel?.map((county: any[]) => county[0]);
  console.log(updatedCounties)
  const filteredUSCountyData = USCountyData.features.filter((feature: any) => {
    const idx=updatedCounties?.indexOf(feature.properties.NAME.toLowerCase());
    if(idx==-1) return false
    if(idx!==undefined) feature.properties.XData= dataModel?.[idx][1]??0;
    return true;
  });
  console.log(filteredUSCountyData)
  let config = {
    minZoom: 1,
    maxZoom: 18,
  };
  const geojsonFeature={
    "type": "FeatureCollection",
    "features": filteredUSCountyData
  }
  console.log(geojsonFeature);
  // magnification with which the map will start
  const zoom = 3;
  // // co-ordinates
  const lat = 4.279353181890746;
  const lng = 50.809065488305514;
  const map = L.map("map", config).setView([lat, lng], zoom);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  L.geoJSON(geojsonFeature as any,{
    style:{
        fillColor: "#000000",
        color: "#f20b0b",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.00
    },
    onEachFeature: function (feature, layer) {
      layer.bindPopup('<h1>'+feature.properties.NAME+'</h1><p>Total Poverty Percentage: '+feature.properties.XData+'</p>',{closeButton: false, offset: L.point(0, -20)});
      layer.on('mouseover', function(e) {e.target.setStyle({fillOpacity: 0.8})
      layer.openPopup(); 
    });
      layer.on('mouseout', function(e) { e.target.setStyle({fillOpacity: 0.0});layer.closePopup(); });
    }}).addTo(map) 
  return;
}

const renderChart = async (ctx: CustomChartContext): Promise<void> => {
  if (globalChartReference) {
      globalChartReference.destroy();
  }
  try {
      ctx.emitEvent(ChartToTSEvent.RenderStart);
      render(ctx);
  } catch (e) {
      ctx.emitEvent(ChartToTSEvent.RenderError, {
          hasError: true,
          error: e,
      });
  } finally {
      ctx.emitEvent(ChartToTSEvent.RenderComplete);
  }
};

(async () => {
  const ctx = await getChartContext({
      getDefaultChartConfig: (chartModel: ChartModel): ChartConfig[] => {
          console.log(chartModel)
          const cols = chartModel.columns;

          const measureColumns = _.filter(
              cols,
              (col) => col.type === ColumnType.MEASURE,
          );

          const attributeColumns = _.filter(
              cols,
              (col) => col.type === ColumnType.ATTRIBUTE,
          );

          const axisConfig: ChartConfig = {
              key: 'column',
              dimensions: [
                  {
                      key: 'x',
                      columns: [attributeColumns[0]],
                  },
                  {
                      key: 'y',
                      columns: measureColumns.slice(0, 2),
                  },
              ],
          };
          return [axisConfig];
      },
      getQueriesFromChartConfig: (
          chartConfig: ChartConfig[],
      ): Array<Query> => {
          const queries = chartConfig.map(
              (config: ChartConfig): Query =>
                  _.reduce(
                      config.dimensions,
                      (acc: Query, dimension) => ({
                          queryColumns: [
                              ...acc.queryColumns,
                              ...dimension.columns,
                          ],
                      }),
                      {
                          queryColumns: [],
                      } as Query,
                  ),
          );
          return queries;
      },
      renderChart: (ctx) => renderChart(ctx),
  });

  renderChart(ctx);
})();