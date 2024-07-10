import React, { useState } from 'react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';
import { useGeneralStore } from '@src/store/generalStore';
import { isRTL } from '@lib/textProcessing';

import { DiffTabs } from './DiffTabs';
import { DiffContainer } from './DiffLayout';

type Props = {
    diffMethod: DiffMethod;
    disableWordDiff: boolean;
};

type Direction = 'ltr' | 'rtl';

export const GeneralDiff: React.FC<Props> = ({ diffMethod, disableWordDiff }) => {
    const [activeTab, setActiveTab] = useState(0);
    const store = useGeneralStore();
    const {
        operatorResponseMarkdown: editedMarkdown,
        modelResponseMarkdown: modelResponseMarkdown
    } = store.selectedResponse;

    const direction: Direction = isRTL(modelResponseMarkdown!) ? 'rtl' : 'ltr';

    const tabs = [
        {
            label: 'Markdown',
            content: (
                <ReactDiffViewer
                    oldValue={modelResponseMarkdown}
                    newValue={editedMarkdown}
                    splitView={true}
                    compareMethod={diffMethod}
                    extraLinesSurroundingDiff={0}
                    disableWordDiff={disableWordDiff}
                    styles={{
                        contentText: {
                            direction,
                            textAlign: direction === 'rtl' ? 'right' : 'left'
                        }
                    }}
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
