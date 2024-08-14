# Integrate Map Charts through ts-chart-sdk

In this tutorial, we will walk you through the process of creating custom map charts using the Leaflet library and integrating them with the TS-Chart-SDK. By the end of this tutorial, you will be able to create interactive map charts that leverage ThoughtSpot's powerful capabilities, such as data drilling and embedding data into your application. Let's get started!

To integrate ThoughtSpot Chart SDK and complete these steps:

-   [Integrate Map Charts through ts-chart-sdk](#integrate-map-charts-through-ts-chart-sdk)
    -   [Setup Your Environment](#setup-your-environment)
    -   [Implementing Sample Leaflet Chart](#implementing-sample-leaflet-chart)
    -   [Intialize Chart Context](#intialize-chart-context)
        -   [getDefaultChartConfig (Doc)](#getdefaultchartconfig-doc)
        -   [getQueriesFromChartConfig (Doc)](#getqueriesfromchartconfig-doc)
        -   [renderChart (Doc)](#renderchart-doc)
    -   [Implement the renderChart function](#implement-the-renderchart-function)
    -   [Run the chart in the Playground](#run-the-chart-in-the-playground)
    -   [Create a Data Model from input data](#create-a-data-model-from-input-data)
    -   [Implementing the renderChart](#implementing-the-renderchart)
    -   [Integrate to thoughtspot](#integrate-to-thoughtspot)

## Setup Your Environment

-   For this you can refer to [setup your environment](../../README.md#set-up-your-environment) above section with the following changes:
    -   While creating folder name it with **map-chart**.
    -   Give project name as **custom-leaflet-charts** or you can directly us `npm create vite@latest custom-leaflet-chart -- --template vanilla-ts`
    -   Instead of highcharts install your chart library (which by luck in this case is leaflet) using command-`npm install --save leaflet`

## Implementing Sample Leaflet Chart

In this section we will be Rendering a sample leaflet chart in the application created from the preceding steps.

To implement the chart code in your application, complete these steps:

1. Delete the unwanted files from your project folder. These are metioned as follow-

```
/public [whole folder]
/src/counter.ts
/src/typescripts.svg
/src/style.css
```

2. Since, leaflet uses leaflet.css file for the proper styling and functionality of the maps we need to include it in our project. For this follow the following steps:

-   Go to [leaflet download page](https://leafletjs.com/download.html) download the latest .zip file
-   Extract the folder and copy leaflet.css file to leaflet folder.
-   Your project folder structure should look like this-

```bash
.
├── index.html
├── leaflet
     └── leaflet.css
```

3. Clear `main.ts` and rename it to `geo-charts.ts`. This step is not necessary but we advice this nomenclature of files.
4. Create `styles.css` in parent directry and copy the code snippet below.

```css
*,
:after,
:before {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
}

html {
    height: 100%;
}

body,
html,
#map {
    width: 105%;
    height: 110%;
}

body {
    position: relative;
    min-height: 100%;
    margin: 0;
    padding: 0;
    background-color: #f1f1f1;
}
```

4. Replace the content of `index.html` with the following snippet:

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>TS custom chart</title>
        <link rel="stylesheet" href="styles.css" />
        <link rel="stylesheet" href="./leaflet/leaflet.css" />
    </head>
    <body>
        <div style="width:99vw; height:95vh; position: relative;">
            <!-- <canvas id="chart" style="display:flex;"></canvas> -->
            <div id="map"></div>
        </div>
        <script type="module" src="./src/geo-charts.ts"></script>
    </body>
</html>
```

Chart Context is the main context object that helps in orchestrating ThoughtSpot APIs to render charts. It also acts as a core central point of all interactions on the charts.

5. We are creating this sample chart with the help GEOJson([GEOJson Documentation](https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.7)) that will be feed to leaflet ([can read about it hear](https://leafletjs.com/examples/geojson/)) using leaflet GEOJson example we have created a sample `geo-charts.js` to use it a get started with the leaflet. Here is the snippet-

```ts
var freeBus = {
    type: 'FeatureCollection',
    features: [
        {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: [
                    [-105.00341892242432, 39.75383843460583],
                    [-105.0008225440979, 39.751891803969535],
                ],
            },
            properties: {
                popupContent:
                    'This is a free bus line that will take you across downtown.',
                underConstruction: false,
            },
            id: 1,
        },
        {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: [
                    [-105.0008225440979, 39.751891803969535],
                    [-104.99820470809937, 39.74979664004068],
                ],
            },
            properties: {
                popupContent:
                    'This is a free bus line that will take you across downtown.',
                underConstruction: true,
            },
            id: 2,
        },
        {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: [
                    [-104.99820470809937, 39.74979664004068],
                    [-104.98689651489258, 39.741052354709055],
                ],
            },
            properties: {
                popupContent:
                    'This is a free bus line that will take you across downtown.',
                underConstruction: false,
            },
            id: 3,
        },
    ],
};

var lightRailStop = {
    type: 'FeatureCollection',
    features: [
        {
            type: 'Feature',
            properties: {
                popupContent: '18th & California Light Rail Stop',
            },
            geometry: {
                type: 'Point',
                coordinates: [-104.98999178409576, 39.74683938093904],
            },
        },
        {
            type: 'Feature',
            properties: {
                popupContent: '20th & Welton Light Rail Stop',
            },
            geometry: {
                type: 'Point',
                coordinates: [-104.98689115047453, 39.747924136466565],
            },
        },
    ],
};

var bicycleRental = {
    type: 'FeatureCollection',
    features: [
        {
            geometry: {
                type: 'Point',
                coordinates: [-104.9998241, 39.7471494],
            },
            type: 'Feature',
            properties: {
                popupContent:
                    'This is a B-Cycle Station. Come pick up a bike and pay by the hour. What a deal!',
            },
            id: 51,
        },
        {
            geometry: {
                type: 'Point',
                coordinates: [-104.9983545, 39.7502833],
            },
            type: 'Feature',
            properties: {
                popupContent:
                    'This is a B-Cycle Station. Come pick up a bike and pay by the hour. What a deal!',
            },
            id: 52,
        },
        {
            geometry: {
                type: 'Point',
                coordinates: [-104.9963919, 39.7444271],
            },
            type: 'Feature',
            properties: {
                popupContent:
                    'This is a B-Cycle Station. Come pick up a bike and pay by the hour. What a deal!',
            },
            id: 54,
        },
        {
            geometry: {
                type: 'Point',
                coordinates: [-104.9960754, 39.7498956],
            },
            type: 'Feature',
            properties: {
                popupContent:
                    'This is a B-Cycle Station. Come pick up a bike and pay by the hour. What a deal!',
            },
            id: 55,
        },
        {
            geometry: {
                type: 'Point',
                coordinates: [-104.9933717, 39.7477264],
            },
            type: 'Feature',
            properties: {
                popupContent:
                    'This is a B-Cycle Station. Come pick up a bike and pay by the hour. What a deal!',
            },
            id: 57,
        },
        {
            geometry: {
                type: 'Point',
                coordinates: [-104.9913392, 39.7432392],
            },
            type: 'Feature',
            properties: {
                popupContent:
                    'This is a B-Cycle Station. Come pick up a bike and pay by the hour. What a deal!',
            },
            id: 58,
        },
        {
            geometry: {
                type: 'Point',
                coordinates: [-104.9788452, 39.6933755],
            },
            type: 'Feature',
            properties: {
                popupContent:
                    'This is a B-Cycle Station. Come pick up a bike and pay by the hour. What a deal!',
            },
            id: 74,
        },
    ],
};

var campus = {
    type: 'Feature',
    properties: {
        popupContent: 'This is the Auraria West Campus',
        style: {
            weight: 2,
            color: '#999',
            opacity: 1,
            fillColor: '#B0DE5C',
            fillOpacity: 0.8,
        },
    },
    geometry: {
        type: 'MultiPolygon',
        coordinates: [
            [
                [
                    [-105.00432014465332, 39.74732195489861],
                    [-105.00715255737305, 39.7462000683517],
                    [-105.00921249389647, 39.74468219277038],
                    [-105.01067161560059, 39.74362625960105],
                    [-105.01195907592773, 39.74290029616054],
                    [-105.00989913940431, 39.74078835902781],
                    [-105.00758171081543, 39.74059036160317],
                    [-105.00346183776855, 39.74059036160317],
                    [-105.00097274780272, 39.74059036160317],
                    [-105.00062942504881, 39.74072235994946],
                    [-105.00020027160645, 39.74191033368865],
                    [-105.00071525573731, 39.74276830198601],
                    [-105.00097274780272, 39.74369225589818],
                    [-105.00097274780272, 39.74461619742136],
                    [-105.00123023986816, 39.74534214278395],
                    [-105.00183105468751, 39.74613407445653],
                    [-105.00432014465332, 39.74732195489861],
                ],
                [
                    [-105.00361204147337, 39.74354376414072],
                    [-105.00301122665405, 39.74278480127163],
                    [-105.00221729278564, 39.74316428375108],
                    [-105.00283956527711, 39.74390674342741],
                    [-105.00361204147337, 39.74354376414072],
                ],
            ],
            [
                [
                    [-105.00942707061768, 39.73989736613708],
                    [-105.00942707061768, 39.73910536278566],
                    [-105.00685214996338, 39.73923736397631],
                    [-105.00384807586671, 39.73910536278566],
                    [-105.00174522399902, 39.73903936209552],
                    [-105.00041484832764, 39.73910536278566],
                    [-105.00041484832764, 39.73979836621592],
                    [-105.00535011291504, 39.73986436617916],
                    [-105.00942707061768, 39.73989736613708],
                ],
            ],
        ],
    },
};

var coorsField = {
    type: 'Feature',
    properties: {
        popupContent: 'Coors Field',
    },
    geometry: {
        type: 'Point',
        coordinates: [-104.99404191970824, 39.756213909328125],
    },
};
const map = L.map('map').setView([39.74739, -105], 13); // this will give center and zoom level

const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map); // this is to add basic tilling currently we are using openstreetmap

const baseballIcon = L.icon({
    iconUrl: 'baseball-marker.png',
    iconSize: [32, 37],
    iconAnchor: [16, 37],
    popupAnchor: [0, -28],
});

function onEachFeature(feature: any, layer: any) {
    let popupContent = `<p>I started out as a GeoJSON ${feature.geometry.type}, but now I'm a Leaflet vector!</p>`;

    if (feature.properties && feature.properties.popupContent) {
        popupContent += feature.properties.popupContent;
    }

    layer.bindPopup(popupContent);
} // you can implement basic event trigger and popup that you want in onEachFeature.

/* global campus, bicycleRental, freeBus, coorsField */
const bicycleRentalLayer = L.geoJSON([bicycleRental as any, campus], {
    style(feature) {
        return feature?.properties && feature.properties.style;
    },

    onEachFeature,

    pointToLayer(feature, latlng) {
        return L.circleMarker(latlng, {
            radius: 8,
            fillColor: '#ff7800',
            color: '#000',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8,
        });
    },
}).addTo(map);

const freeBusLayer = L.geoJSON(freeBus as any, {
    filter(feature: any): boolean {
        if (feature.properties) {
            // If the property "underConstruction" exists and is true, return false (don't render features under construction)
            return feature.properties.underConstruction !== undefined
                ? !feature.properties.underConstruction
                : true;
        }
        return false;
    },

    onEachFeature,
}).addTo(map);

const coorsLayer = L.geoJSON(coorsField as any, {
    pointToLayer(feature, latlng) {
        return L.marker(latlng, { icon: baseballIcon });
    },

    onEachFeature,
}).addTo(map);
```

6. Your final folder structure should look like this:

```
.
├── index.html
├── leaflet
│   └── leaflet.css
├── package-lock.json
├── package.json
├── src
│   └── geo-charts.ts
├── styles.css
└── tsconfig.json
```

7. Now you can run this using `npm run dev` command in your project root directry

## Intialize Chart Context

Chart Context is the main context object that helps in orchestrating ThoughtSpot APIs to render charts. It also acts as a core central point of all interactions on the charts.

To initialize the chart context, call `getChartContext`

```js
(async () => {
  const ctx = await getChartContext({
      getDefaultChartConfig: (chartModel: ChartModel): ChartConfig[] => {
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
```

> NOTE:
> For more information about the chart context component, refer to the following documentation resources:
>
> -   [https://ts-chart-sdk-docs.vercel.app/types/CustomChartContextProps.html](https://ts-chart-sdk-docs.vercel.app/types/CustomChartContextProps.html)
> -   [https://github.com/thoughtspot/ts-chart-sdk/blob/main/src/main/custom-chart-context.ts#L40](https://github.com/thoughtspot/ts-chart-sdk/blob/main/src/main/custom-chart-context.ts#L40)
>     The custom chart context component must include the following mandatory properties to function:

-   [`getDefaultChartConfig (Doc)`](#getDefaultChartConfig-doc)
-   [`getQueriesFromChartConfig (Doc)`](#getQueriesFromChartConfig-doc)
-   [`renderChart (Doc)`](#getQueriesFromChartConfig-doc)

### getDefaultChartConfig (Doc)

This function takes in a [ChartModel](https://ts-chart-sdk-docs.vercel.app/interfaces/ChartModel.html) object and returns a well-formed point configuration definition.

Here we are creating geo map for US county data so we will get to column with one column as attribute and other as measure so we are classifying them as `x` and `y` labels.

To create a Leaflet version of the data set, the above-mentioned headers must be presented as columns from ThoughtSpot. The query on the ThoughtSpot Answer page should have all the above columns to plot a Geo chart.

### getQueriesFromChartConfig (Doc)

This method defines the data query that is required to fetch the data from ThoughtSpot to render the chart. For most use cases, you do not require the data outside of the columns listed in your chart.

This example maps all the columns in the configuration as an array of columns in the arguments.

### renderChart (Doc)

This `renderChart (Doc)` function is required to render the chart implemented in your code. This function ensures that every time `chartContext` tries to re-render the chart due to the changes in data or chart model, the chart rendered in your application is updated.

> **Note**:
> You can control render and re-render by implementing more granular control for the updates on data, visual props, or chart model.

Till now you will be seeing error on `renderChart` function. Let's implement this-

## Implement the renderChart function

To implement renderChart, complete the following steps:

1. Create a function and move all the leaflet code inside the `renderChart` function.

```jsx
    const renderChart = (ctx) => {
        const freeBusLayer = L.geoJSON(freeBus as any, {

        filter(feature: any): boolean {
            if (feature.properties) {
            // If the property "underConstruction" exists and is true, return false (don't render features under construction)
            return feature.properties.underConstruction !== undefined ? !feature.properties.underConstruction : true;
            }
            return false;
        },

        onEachFeature
        }).addTo(map);

        const coorsLayer = L.geoJSON(coorsField as any, {

        pointToLayer(feature, latlng) {
            return L.marker(latlng, {icon: baseballIcon});
        },

        onEachFeature
        }).addTo(map);
        return Promise.resolve();
};
```

1. Run the app and open console you and the check the message:`Chart context: intialization start`

## Run the chart in the Playground

To run the chart and test your implementation, you need a Playground.

1. Open the following link to test your implementation with predefined data sets:

[https://ts-chart-playground.vercel.app/](https://ts-chart-playground.vercel.app/)

> **NOTE**
>
> You can check out the playground code on the GitHub repository to your local environment and modify the data set to test your charts effectively.

2. Add the following details as shown in the following example:

-   App Url : `<your localhost url with port>`
-   Chart Model: `Gantt - 3 Attribute - 2 Date - 1 Measure`

## Create a Data Model from input data

The data model is unique to every chart. It defines how each point will be plotted on the chart. In this step we will deal with thoughtspot ChartModel to create dataModel and feed that dataModel to leaflet in `L.geoJSON()` in geojson format.
For this we will need a geojson which will have geometry configuration for all the counties of US.

Let's create dataModel with the following steps:

1. To get the GEOjson of all geometry of US you can import the `ADMIN_DIV_2-US.json` file from `exapmle/src/ADMIN_DIV_2-US.json`.
2. Import this file in `geo-charts.ts` using import `USjsonData from ./ADMIN_DIV_2-US.json'`.
3. To create dataModel implement a function name `getDataMdoel(chartModel:chartModel)` with following code snippet:

```ts
function getDataModel(chartModel: ChartModel) {
    const chartValue = chartModel.data?.[0].data.dataValue;
    const updatedNameCounties = chartValue?.map(([name, value]) => {
        const words = name.split(' ');
        if (words.length >= 2) {
            words.pop();
        }
        const updatedName = words.join(' ');
        return [updatedName, value];
    }); // remove last word from the county name to match it with USjsonData
    const USCountyData = USjsonData;
    const updatedCounties = updatedNameCounties?.map(
        (county: any[]) => county[0],
    );
    const filteredUSCountyData = USCountyData.features.filter(
        (feature: any) => {
            const idx = updatedCounties?.indexOf(
                feature.properties.NAME.toLowerCase(),
            );
            if (idx == -1) return false;
            if (idx !== undefined)
                feature.properties.XData = updatedNameCounties?.[idx][1] ?? 0;
            return true;
        },
    ); //XData will have value to show in respective counties. in this case it is Total poverty percentage.
    return filteredUSCountyData;
}
```

## Implementing the renderChart

In this section we will be setting up `renderChart` function with the chartModel context.

1. Clear the content inside the `renderChart` function.
2. Create a `render(ctx:CustomChartContext)` function which will deal with leaflet setup with the basic tile that we will taking from openstreetmap and passing dataModel in leaflet. Implement below code snippet for render function:

```ts
const render = (ctx: CustomChartContext) => {
    const chartModel = ctx.getChartModel();
    const dataModel = getDataModel(chartModel);
    let config = {
        minZoom: 1,
        maxZoom: 18,
    }; // zoom config for leaflet
    const geojsonFeature = {
        type: 'FeatureCollection',
        features: dataModel,
    }; // final geoJson we will passing to leaflet.
    // magnification with which the map will start
    const zoom = 3;
    // // co-ordinates
    const lat = 4.279353181890746; //lat of map tile center
    const lng = 50.809065488305514; // long of map tile center
    const map = L.map('map', config).setView([lat, lng], zoom);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map); // adding basic tile to map
    L.geoJSON(geojsonFeature as any, {
        style: {
            fillColor: '#000000',
            color: '#f20b0b',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.0,
        },
        onEachFeature: function (feature, layer) {
            layer.bindPopup(
                '<h1>' +
                    feature.properties.NAME +
                    '</h1><p>Total Poverty Percentage: ' +
                    feature.properties.XData +
                    '</p>',
                { closeButton: false, offset: L.point(0, -20) },
            );
            layer.on('mouseover', function (e) {
                e.target.setStyle({ fillOpacity: 0.8 });
                layer.openPopup();
            });
            layer.on('mouseout', function (e) {
                e.target.setStyle({ fillOpacity: 0.0 });
                layer.closePopup();
            });
        },
    }).addTo(map); // adding basic styling for map and popup feature.
    return;
};
```

3. In `renderChart` we will be calling render function and integrating it some custom `CharttoTSEvent` that will help in notifying ThoughtSpot different rendering stages. Copy the snippet below to implement it:

> NOTE:
> For more information about the ChartToTSEvents component, refer to the following documentation resources:
>
> -   [https://ts-chart-sdk-docs.vercel.app/interfaces/ChartToTSEventsPayloadMap.html](https://ts-chart-sdk-docs.vercel.app/interfaces/ChartToTSEventsPayloadMap.html)

```ts
const renderChart = async (ctx: CustomChartContext): Promise<void> => {
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
```

> NOTE:
> Link to file with the final changes can be found (here)[/src/geo-charts.ts].

## Integrate to thoughtspot

In this section we will be working on integrating your custom chart with thoughtspot. For integrating do the following steps->

1. Deploy this custom app on any hosting services currenly i am using ngrok to local take a url with ngrok you will get url `https://<random_string>.ngrok-free.app`
2. Redeploy the cluster with the correct flag settings.
3. Open thoughtspot go `admin` go to `chart customization` then go to `custom charts`
4. Click on `create charts` then name it. We are going with `custom-geo-map` for current example put the url where you deployed the app for example:`https://<random_string>.ngrok-free.app`.
    > NOTE:
    >
    > - This is for local development and to add charts to cluster this needs to be deployed to a service preferably vercel.
    > - Urls needs to be whitelisted in TS cluster please contact your TS admin to whitelist for the same.
