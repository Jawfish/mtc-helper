// These rules are not appropriate for this component since it is the modal background.
// The non-apparent interactivity here actually increases accessibility since it is a
// common pattern to close modals by clicking outside of them.
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

import useKeyPress from '@hooks/useKeyPress';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@src/external/components/ui/tabs';
import { useState } from 'react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';
import clsx from 'clsx';
import { ResponseContent, useContentStore } from '@src/store/ContentStore';
import { Process, useMTCStore } from '@src/store/MTCStore';
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectValue,
    SelectItem
} from '@src/external/components/ui/select';

import Button from './shared/Button';

interface Props {
    setDiffViewOpen: (open: boolean) => void;
}

export default function DiffViewer({ setDiffViewOpen }: Props) {
    const [activeTab, setActiveTab] = useState(0);
    const [disableWordDiff, setDisableWordDiff] = useState(false);
    const { orochiCode, orochiResponse, pandaOriginalResponse, pandaEditedResponse } =
        useContentStore();
    const process = useMTCStore(state => state.process);
    const [diffMethod, setDiffMethod] = useState(
        process === Process.PANDA ? DiffMethod.WORDS : DiffMethod.LINES
    );

    useKeyPress('Escape', () => setDiffViewOpen(false));

    function handleDiffBackgroundClicked(e: React.MouseEvent) {
        if (e.target === e.currentTarget) {
            setDiffViewOpen(false);
        }
    }

    // Create an array of the ContentItems that can be mapped over and filter out
    // any objects that don't have any edited or original content. This is a bit of a
    // hacky way to do this, but it works for now.

    // TODO: no, for real, this is actually stupid
    const pandaResponseObj: ResponseContent = {
        edited: pandaEditedResponse,
        original: pandaOriginalResponse
    };
    const contents = Object.entries({
        orochiCode,
        orochiResponse,
        pandaResponseObj
    }).filter(([, content]) => content.edited || content.original);

    const count = contents.length;

    function handleSelectChange(value: string) {
        if (value === 'None') {
            setDiffMethod(DiffMethod.LINES);
            setDisableWordDiff(true);
        } else {
            setDiffMethod(value as DiffMethod);
            setDisableWordDiff(false);
        }
    }

    return (
        <DiffBackground onClick={handleDiffBackgroundClicked}>
            <DiffForeground>
                <Tabs
                    defaultValue={`tab-${activeTab}`}
                    onValueChange={value =>
                        setActiveTab(parseInt(value.split('-')[1]))
                    }>
                    {count > 1 && (
                        <TabsList className='flex justify-start gap-0 p-0 shadow bg-mtc-faded mb-2 rounded-none rounded-t-md'>
                            {contents.map(([contentKey, _], index) => (
                                <TabsTrigger
                                    key={contentKey}
                                    value={`tab-${index}`}
                                    className={clsx(
                                        'border-none h-full rounded-none shadow-none',
                                        'data-[state=active]:bg-mtc-primary data-[state=active]:text-white',
                                        'bg-mtc-faded text-mtc-primary cursor-pointer',
                                        { 'rounded-tl-md': index === 0 }
                                    )}>
                                    {`Tab ${index + 1}`}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    )}
                    {contents.map(([contentKey, contentItem], index) => (
                        <TabsContent
                            key={contentKey}
                            value={`tab-${index}`}
                            className='overflow-auto max-h-[80vh] mt-0 rounded-t-md'>
                            {/* TODO: split the markdown parse handling. Also, fix the fact that adding markdown to the original response is hardcoded for PANDA */}
                            <ReactDiffViewer
                                oldValue={contentItem.original}
                                newValue={contentItem.edited}
                                splitView={true}
                                disableWordDiff={disableWordDiff}
                                compareMethod={diffMethod}
                                extraLinesSurroundingDiff={
                                    process === Process.PANDA ? 0 : 1
                                }
                            />
                        </TabsContent>
                    ))}

                    <DiffControls>
                        <Select
                            onValueChange={value => handleSelectChange(value)}
                            defaultValue={diffMethod}>
                            <SelectTrigger className='shadow-none border-solid border rounded-md border-mtc-primary bg-white text-mtc-primary w-36 focus:ring-mtc-primary'>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className='z-[1300] bg-white text-mtc-primary'>
                                <SelectItem
                                    className='hover:bg-mtc-faded text-mtc-primary'
                                    value='None'>
                                    None
                                </SelectItem>
                                <SelectItem
                                    className='hover:bg-mtc-faded text-mtc-primary'
                                    value={DiffMethod.LINES}
                                    defaultChecked={process === Process.Orochi}>
                                    Lines
                                </SelectItem>
                                <SelectItem
                                    className='hover:bg-mtc-faded text-mtc-primary'
                                    value={DiffMethod.WORDS}
                                    defaultChecked={process === Process.PANDA}>
                                    Words
                                </SelectItem>
                                <SelectItem
                                    className='hover:bg-mtc-faded text-mtc-primary'
                                    value={DiffMethod.SENTENCES}>
                                    Sentences
                                </SelectItem>
                                <SelectItem
                                    className='hover:bg-mtc-faded text-mtc-primary'
                                    value={DiffMethod.CHARS}>
                                    Characters
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            onClick={() => setDiffViewOpen(false)}
                            variant='destructive'>
                            Close
                        </Button>
                    </DiffControls>
                </Tabs>
            </DiffForeground>
        </DiffBackground>
    );
}

function DiffForeground({ children }: { children: React.ReactNode }) {
    return (
        <div className='relative flex  w-[90%] flex-col rounded-md bg-white shadow-lg'>
            {children}
        </div>
    );
}

function DiffBackground({
    children,
    onClick
}: {
    children: React.ReactNode;
    onClick: (e: React.MouseEvent) => void;
}) {
    return (
        <div
            className='fixed left-0 top-0 flex size-full items-center justify-center bg-black/20 z-[900]'
            onClick={onClick}>
            {children}
        </div>
    );
}

function DiffControls({ children }: { children: React.ReactNode }) {
    return <div className='my-4 flex justify-center gap-4'>{children}</div>;
}
