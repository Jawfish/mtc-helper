import React, { useState } from 'react';
import { DiffMethod } from 'react-diff-viewer-continued';
import { useGlobalStore } from '@src/store/globalStore';
import useKeyPress from '@hooks/useKeyPress';

import Button from '../shared/Button';

import { DiffBackground, DiffForeground, DiffControls } from './DiffLayout';
import { DiffMethodSelector } from './DiffMethodSelector';
import { OrochiDiff } from './OrochiDiff';
import { PandaDiff } from './PandaDiff';
import { HighlightToggle } from './WordDiffToggle';

type DiffViewerProps = {
    toggleDiffView: () => void;
};

export const DiffViewer: React.FC<DiffViewerProps> = ({ toggleDiffView }) => {
    const { process } = useGlobalStore();
    const [diffMethod, setDiffMethod] = useState<DiffMethod>(
        process === 'PANDA' ? DiffMethod.WORDS : DiffMethod.LINES
    );
    const [disableWordDiff, setDisableWordDiff] = useState(false);

    useKeyPress('Escape', toggleDiffView);

    const handleHighlightToggle = (checked: boolean) => {
        setDisableWordDiff(!checked);
    };

    return (
        <DiffBackground onClick={toggleDiffView}>
            <DiffForeground>
                {process === 'Orochi' && (
                    <OrochiDiff
                        diffMethod={diffMethod}
                        disableWordDiff={disableWordDiff}
                    />
                )}
                {process === 'PANDA' && (
                    <PandaDiff
                        diffMethod={diffMethod}
                        disableWordDiff={disableWordDiff}
                    />
                )}
                <DiffControls>
                    <HighlightToggle
                        checked={!disableWordDiff}
                        onCheckedChange={handleHighlightToggle}
                    />
                    <DiffMethodSelector
                        value={diffMethod}
                        onChange={value => setDiffMethod(value as DiffMethod)}
                    />
                    <Button
                        onClick={toggleDiffView}
                        variant={'ghost'}
                        className='hover:text-red-800 border-0 cursor-pointer hover:bg-red-200 bg-mtc-faded text-mtc-primary !font-normal'>
                        Close
                    </Button>
                </DiffControls>
            </DiffForeground>
        </DiffBackground>
    );
};
