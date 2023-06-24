import _ from 'lodash';
import {
    SyntheticEvent, useEffect, useState,
} from 'react';

export const ChartComponent = ({
    appUrl,
    chartModelName,
    iFrameRef,
    triggerInitFlow
}: any) => {
    // used to refresh the iframe.
    const [counter, setCounter] = useState(0);

    // default width and height
    const width = 800;
    const height = 600;

    const onIFrameLoadCallback = async (
        evt: SyntheticEvent<HTMLIFrameElement, Event>,
    ) => {
        console.log(`IFrame ready: `, evt);
        triggerInitFlow();
    };

    const onIFrameErrorCallback = (
        e: SyntheticEvent<HTMLIFrameElement, Event>,
    ): void => {
        console.error('Error in rendering application', e);
    };

    useEffect(() => {
        console.log('iframe refresh');
        setCounter(counter+1);
    }, [appUrl, chartModelName])

    return (
        <div
            style={{
                display: 'flex',
                flex: '1 1 auto',
                border: '1px solid black',
            }}
        >
            <iframe
                key={counter}
                src={appUrl}
                name="frame1"
                width={width}
                height={height}
                ref={ref => {
                    iFrameRef.current = ref;
                }}
                onLoad={onIFrameLoadCallback}
                onError={onIFrameErrorCallback}
                style={{
                    resize: 'both',
                    overflow: 'auto',
                    display: 'flex',
                    flex: '1 1 auto',
                }}
            />
        </div>
    );
};
