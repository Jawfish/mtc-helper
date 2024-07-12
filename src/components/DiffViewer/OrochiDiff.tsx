import { useState } from 'react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';
import { useOrochiStore } from '@src/store/orochiStore';

import { DiffTabs } from './DiffTabs';
import { DiffContainer } from './DiffLayout';

type OrochiDiffProps = {
    diffMethod: DiffMethod;
    disableWordDiff: boolean;
};

export const OrochiDiff = ({ diffMethod, disableWordDiff }: OrochiDiffProps) => {
    const [activeTab, setActiveTab] = useState(0);
    const { operatorResponseCode, modelResponseCode, operatorResponse, modelResponse } =
        useOrochiStore();

    const tabs = [
        {
            label: 'Code',
            content: (
                <ReactDiffViewer
                    oldValue={modelResponseCode}
                    newValue={operatorResponseCode}
                    splitView={true}
                    compareMethod={diffMethod}
                    disableWordDiff={disableWordDiff}
                />
            )
        },
        {
            label: 'Full Response',
            content: (
                <ReactDiffViewer
                    oldValue={modelResponse}
                    newValue={operatorResponse}
                    splitView={true}
                    compareMethod={diffMethod}
                />
            )
        }
    ];

    return (
        <DiffTabs
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            containerComponent={DiffContainer}
        />
    );
};
