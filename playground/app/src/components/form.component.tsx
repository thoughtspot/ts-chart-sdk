import React, { useState } from 'react';
import barModel from '../mock-data/mock-chart.json';
import sunburstSmallModel from '../mock-data/sunburst-small.json';
import sunburstModel from '../mock-data/sunburst.json';
import ganttModel from '../mock-data/mock-gantt.json';

const MODELS:any = {
    'Small - 1 Attribute - 3 Measure': barModel,
    'Large - 3 Attribute - 1 Measure': sunburstModel,
    'Small - 3 Attribute - 1 Measure': sunburstSmallModel,
    'Gantt - 3 Attribute - 2 Date - 1 Measure': ganttModel,
}

export const Form = ({
    updateChart,
}: any) => {
    const [appUrl, setAppUrl] = useState('');
    const [model, selectModel] = useState('');

    const handleTextInputChange = (event:any) => {
        setAppUrl(event.target.value);
    };

    const handleDropdownChange = (event:any) => {
        selectModel(event.target.value);
    };

    const handleSubmit = (event:any) => {
        event.preventDefault();
        // Perform actions with the collected form data here
        updateChart(appUrl, MODELS[model], model);
    };

    return (
        <form className="max-w-sm mx-auto p-4 bg-gray-100">
            <div className="mb-4">
                <label htmlFor="text-input" className="block font-medium mb-1">
                    App URL:
                </label>
                <input
                    type="text"
                    id="text-input"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={appUrl}
                    onChange={handleTextInputChange}
                />
            </div>
            <div className="mb-4">
                <label htmlFor="dropdown" className="block font-medium mb-1">
                    Select Chart Model:
                </label>
                <select
                    id="dropdown"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={model}
                    onChange={handleDropdownChange}
                >
                    <option value="">Select an option</option>
                    {
                        Object.keys(MODELS).map((key)=> {
                            return (<option value={key}>{key}</option>);
                        })
                    }
                </select>
            </div>
            <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md"
                onClick={handleSubmit}
            >
                Apply
            </button>
        </form>
    );
};
