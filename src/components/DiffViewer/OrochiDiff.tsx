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
    const { editedCode, originalCode, operatorResponse, modelResponse } =
        useOrochiStore();

    if (!editedCode || !originalCode || !operatorResponse || !modelResponse) {
        return undefined;
    }

    const tabs = [
        {
            label: 'Code',
            content: (
                <ReactDiffViewer
                    oldValue={originalCode}
                    newValue={editedCode}
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
