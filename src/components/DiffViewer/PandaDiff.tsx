import React, { useState } from 'react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';
import { usePandaStore } from '@src/store/pandaStore';

import { DiffTabs } from './DiffTabs';
import { DiffContainer } from './DiffLayout';

type PandaDiffProps = {
    diffMethod: DiffMethod;
    disableWordDiff: boolean;
};

export const PandaDiff: React.FC<PandaDiffProps> = ({
    diffMethod,
    disableWordDiff
}) => {
    const [activeTab, setActiveTab] = useState(0);
    const {
        editedResponsePlaintext,
        originalResponsePlaintext,
        editedResponseMarkdown,
        originalResponseMarkdown
    } = usePandaStore();

    const tabs = [
        {
            label: 'Plaintext',
            content: (
                <ReactDiffViewer
                    oldValue={originalResponsePlaintext}
                    newValue={editedResponsePlaintext}
                    splitView={true}
                    compareMethod={diffMethod}
                    extraLinesSurroundingDiff={0}
                    disableWordDiff={disableWordDiff}
                />
            )
        },
        {
            label: 'Markdown',
            content: (
                <ReactDiffViewer
                    oldValue={originalResponseMarkdown}
                    newValue={editedResponseMarkdown}
                    splitView={true}
                    compareMethod={diffMethod}
                    extraLinesSurroundingDiff={0}
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
