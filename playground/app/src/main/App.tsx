import { useCallback, useEffect, useRef, useState } from 'react';
import { ChartComponent } from '../components/chart.component';
import { Form } from '../components/form.component';

let processEvent = (event: any) => {
    event?.ports[0]?.postMessage({
        hasError: false,
    });
};

window.addEventListener('message', (ev: any) => {
    if (ev.data.source !== 'ts-chart-sdk') {
        return;
    }
    console.log('TS-Playground: Message Received', ev);
    processEvent(ev);
});

function App() {
    const iFrameWindow = useRef<HTMLIFrameElement>();
    const [appUrl, setAppUrl] = useState('');
    const [chartModel, setChartModel] = useState({});
    const [chartModelName, setChartModelName] = useState({});
    const [logs, updatedLogs] = useState([]);

    const triggerChartRender = () => {
        const payload = {
            eventType: 'TriggerRenderChart',
            payload: {},
            source: 'ts-host-app',
        };

        const channel = new MessageChannel();
        channel.port1.onmessage = (res: any) => {
            channel.port1.close();
        };
        iFrameWindow.current?.contentWindow?.postMessage(payload, appUrl, [
            channel.port2,
        ]);
    };

    const triggerInitializeComplete = () => {
        const payload = {
            eventType: 'InitializeComplete',
            payload: {},
            source: 'ts-host-app',
        };

        const channel = new MessageChannel();
        channel.port1.onmessage = (res: any) => {
            channel.port1.close();
            triggerChartRender();
        };
        iFrameWindow.current?.contentWindow?.postMessage(payload, appUrl, [
            channel.port2,
        ]);
    };

    const updateChartModel = (res: any) => {
        const payload = {
            eventType: 'ChartModelUpdate',
            payload: {
                chartModel: {
                    ...chartModel,
                    config: {
                        chartConfig: res.data.defaultChartConfig,
                    },
                },
            },
            source: 'ts-host-app',
        };

        const channel = new MessageChannel();
        channel.port1.onmessage = (res: any) => {
            channel.port1.close();
            triggerInitializeComplete();
        };
        iFrameWindow.current?.contentWindow?.postMessage(payload, appUrl, [
            channel.port2,
        ]);
    };

    const initChart = useCallback(() => {
        const payload = {
            eventType: 'Initialize',
            payload: {
                componentId: 'TS-Playground',
                chartModel: chartModel,
                hostUrl: window.location.href,
            },
            source: 'ts-host-app',
        };

        const channel = new MessageChannel();
        channel.port1.onmessage = (res: any) => {
            channel.port1.close();

            updateChartModel(res);
        };
        iFrameWindow.current?.contentWindow?.postMessage(payload, appUrl, [
            channel.port2,
        ]);
    }, [appUrl, chartModel, iFrameWindow.current]);

    useEffect(() => {
        processEvent = (event: any) => {
            event?.ports[0]?.postMessage({
                hasError: false,
            });
        };
    }, [iFrameWindow.current]);

    return (
        <>
            <h1 className="text-2xl font-bold underline p-3">
                @thoughtspot/ts-chart-sdk Playground (ALPHA)
            </h1>
            <div className="flex min-h-screen">
                <div className="w-1/4 bg-gray-200 p-4">
                    {' '}
                    {/* Left Sidebar */}
                    <div id="left-panel">
                        <Form
                            updateChart={(
                                appUrl: string,
                                model: any,
                                modelName: string,
                            ) => {
                                setChartModel(model);
                                setChartModelName(modelName);
                                setAppUrl(appUrl);
                            }}
                        />
                    </div>
                    <div className="event-log"></div>
                </div>
                <div className="w-3/4 p-4">
                    {/* Center Content */}
                    <div className="chart-container">
                        <div className="chart">
                            <ChartComponent
                                appUrl={appUrl}
                                iFrameRef={iFrameWindow}
                                chartModelName={chartModelName}
                                triggerInitFlow={() => {
                                    initChart();
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default App;
