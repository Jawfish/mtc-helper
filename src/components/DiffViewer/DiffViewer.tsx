import { useState } from 'react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';
import { useGlobalStore } from '@src/store/globalStore';
import useKeyPress from '@hooks/useKeyPress';
import { useDiffView } from '@hooks/useDiffView';
import Button from '@components/shared/Button';
import { Toggle } from '@components/Toggle';
import { useGenericProcessStore } from '@src/store/genericProcessStore';
import { useOrochiStore } from '@src/store/orochiStore';
import { isRTL } from '@lib/textProcessing';

import { DiffMethodSelector } from './DiffMethodSelector';
import {
    DiffBackground,
    DiffForeground,
    DiffControls,
    DiffContainer
} from './DiffLayout';

export const DiffViewer = () => {
    const { process } = useGlobalStore();
    const { toggleDiffView } = useDiffView();
    const [diffMethod, setDiffMethod] = useState<DiffMethod>(
        process === 'Generic' ? DiffMethod.WORDS : DiffMethod.LINES
    );
    const [disableWordDiff, setDisableWordDiff] = useState(false);
    const [codeOnly, setCodeOnly] = useState(true);

    const genericProcessStore = useGenericProcessStore();
    const orochiStore = useOrochiStore();

    useKeyPress('Escape', toggleDiffView);

    return (
        <DiffBackground onClick={toggleDiffView}>
            <DiffForeground>
                {process !== 'Generic' && (
                    <Diff
                        diffMethod={diffMethod}
                        disableWordDiff={disableWordDiff}
                        operatorResponse={
                            codeOnly
                                ? orochiStore.operatorResponseCode!
                                : orochiStore.operatorResponse!
                        }
                        modelResponse={
                            codeOnly
                                ? orochiStore.modelResponseCode!
                                : orochiStore.modelResponse!
                        }
                    />
                )}
                {process !== 'Orochi' && (
                    <Diff
                        diffMethod={diffMethod}
                        disableWordDiff={disableWordDiff}
                        operatorResponse={genericProcessStore.operatorResponseMarkdown!}
                        modelResponse={genericProcessStore.modelResponseMarkdown!}
                    />
                )}
                <DiffControls>
                    {process === 'Orochi' && (
                        <Toggle
                            checked={codeOnly}
                            onCheckedChange={() => setCodeOnly(!codeOnly)}>
                            Code Only
                        </Toggle>
                    )}
                    <Toggle
                        checked={!disableWordDiff}
                        onCheckedChange={() => setDisableWordDiff(!disableWordDiff)}>
                        Highlight
                    </Toggle>
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

type Direction = 'ltr' | 'rtl';

type Props = {
    diffMethod: DiffMethod;
    disableWordDiff: boolean;
    modelResponse: string;
    operatorResponse: string;
};

const Diff = ({
    diffMethod,
    disableWordDiff,
    modelResponse,
    operatorResponse
}: Props) => {
    const direction: Direction = isRTL(modelResponse!) ? 'rtl' : 'ltr';

    return (
        <DiffContainer>
            <ReactDiffViewer
                oldValue={modelResponse}
                newValue={operatorResponse}
                splitView={true}
                compareMethod={diffMethod}
                disableWordDiff={disableWordDiff}
                extraLinesSurroundingDiff={0}
                styles={{
                    contentText: {
                        direction,
                        textAlign: direction === 'rtl' ? 'right' : 'left'
                    }
                }}
            />
        </DiffContainer>
    );
};
