import React, { useState } from 'react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';
import { useGeneralStore } from '@src/store/generalStore';

import { DiffTabs } from './DiffTabs';
import { DiffContainer } from './DiffLayout';

type Props = {
    diffMethod: DiffMethod;
    disableWordDiff: boolean;
};

export const GeneralDiff: React.FC<Props> = ({ diffMethod, disableWordDiff }) => {
    const [activeTab, setActiveTab] = useState(0);
    const { editedResponseMarkdown, originalResponseMarkdown } = useGeneralStore();

    const tabs = [
        {
            label: 'Markdown',
            content: (
                <ReactDiffViewer
                    oldValue={originalResponseMarkdown}
                    newValue={editedResponseMarkdown}
                    splitView={true}
                    compareMethod={diffMethod}
                    extraLinesSurroundingDiff={0}
                    disableWordDiff={disableWordDiff}
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
