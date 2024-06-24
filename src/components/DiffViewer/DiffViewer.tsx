import React, { useState } from 'react';
import { DiffMethod } from 'react-diff-viewer-continued';
import { useGlobalStore } from '@src/store/globalStore';
import useKeyPress from '@hooks/useKeyPress';

import Button from '../shared/Button';

import { DiffBackground, DiffForeground, DiffControls } from './DiffLayout';
import { DiffMethodSelector } from './DiffMethodSelector';
import { OrochiDiff } from './OrochiDiff';
import { PandaDiff } from './PandaDiff';

type DiffViewerProps = {
    toggleDiffView: () => void;
};

export const DiffViewer: React.FC<DiffViewerProps> = ({ toggleDiffView }) => {
    const { process } = useGlobalStore();
    const [diffMethod, setDiffMethod] = useState<DiffMethod>(
        process === 'PANDA' ? DiffMethod.WORDS : DiffMethod.LINES
    );

    useKeyPress('Escape', toggleDiffView);

    return (
        <DiffBackground>
            <DiffForeground>
                {process === 'Orochi' && <OrochiDiff diffMethod={diffMethod} />}
                {process === 'PANDA' && <PandaDiff diffMethod={diffMethod} />}
                <DiffControls>
                    <DiffMethodSelector
                        value={diffMethod}
                        onChange={value => setDiffMethod(value as DiffMethod)}
                    />
                    <Button
                        onClick={toggleDiffView}
                        variant='destructive'>
                        Close
                    </Button>
                </DiffControls>
            </DiffForeground>
        </DiffBackground>
    );
};
