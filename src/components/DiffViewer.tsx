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
import { useGlobalStore } from '@src/store/globalStore';
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectValue,
    SelectItem
} from '@src/external/components/ui/select';
import { usePandaStore } from '@src/store/pandaStore';
import { useOrochiStore } from '@src/store/orochiStore';

import Button from './shared/Button';

type Props = {
    toggleDiffView: () => void;
};

export default function DiffViewer({ toggleDiffView }: Props) {
    const { process } = useGlobalStore();
    const [diffMethod, setDiffMethod] = useState(
        process === 'PANDA' ? DiffMethod.WORDS : DiffMethod.LINES
    );

    useKeyPress('Escape', toggleDiffView);

    function handleSelectChange(value: string) {
        setDiffMethod(value as DiffMethod);
    }

    return (
        <DiffBackground>
            <DiffForeground>
                {process === 'Orochi' && <OrochiDiff diffMethod={diffMethod} />}
                {process === 'PANDA' && <PandaDiff diffMethod={diffMethod} />}
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
                                value={DiffMethod.LINES}
                                defaultChecked={process === 'Orochi'}>
                                Lines
                            </SelectItem>
                            <SelectItem
                                className='hover:bg-mtc-faded text-mtc-primary'
                                value={DiffMethod.WORDS}
                                defaultChecked={process === 'PANDA'}>
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
                        onClick={toggleDiffView}
                        variant='destructive'>
                        Close
                    </Button>
                </DiffControls>
            </DiffForeground>
        </DiffBackground>
    );
}

function DiffForeground({ children }: { children: React.ReactNode }) {
    return (
        <div className='relative flex w-[90%] max-w-[116rem] flex-col rounded-md bg-white shadow-lg'>
            {children}
        </div>
    );
}

function DiffBackground({ children }: { children: React.ReactNode }) {
    return (
        <div className='fixed left-0 top-0 flex size-full items-center justify-center bg-black/20 z-[900]'>
            {children}
        </div>
    );
}

function DiffControls({ children }: { children: React.ReactNode }) {
    return <div className='my-4 flex justify-center gap-4'>{children}</div>;
}

function OrochiDiff({ diffMethod }: { diffMethod: DiffMethod }) {
    const [activeTab, setActiveTab] = useState(0);

    const { editedCode, originalCode, editedResponse, originalResponse } =
        useOrochiStore();

    if (!editedCode || !originalCode || !editedResponse || !originalResponse) {
        return null;
    }

    return (
        <Tabs
            defaultValue={`tab-${activeTab}`}
            onValueChange={value => setActiveTab(parseInt(value.split('-')[1]))}>
            <TabsList className='flex justify-start gap-0 p-0 shadow bg-mtc-faded mb-2 rounded-none rounded-t-md'>
                <TabsTrigger
                    value='tab-0'
                    className={clsx(
                        'border-none h-full rounded-none shadow-none',
                        'data-[state=active]:bg-mtc-primary data-[state=active]:text-white',
                        'bg-mtc-faded text-mtc-primary cursor-pointer',
                        'rounded-tl-md'
                    )}>
                    Code
                </TabsTrigger>
                <TabsTrigger
                    value='tab-1'
                    className={clsx(
                        'border-none h-full rounded-none shadow-none',
                        'data-[state=active]:bg-mtc-primary data-[state=active]:text-white',
                        'bg-mtc-faded text-mtc-primary cursor-pointer'
                    )}>
                    Full Response
                </TabsTrigger>
            </TabsList>
            <TabsContent value='tab-0'>
                <DiffContainer>
                    <ReactDiffViewer
                        oldValue={originalCode}
                        newValue={editedCode}
                        splitView={true}
                        compareMethod={diffMethod}
                    />
                </DiffContainer>
            </TabsContent>
            <TabsContent value='tab-1'>
                <DiffContainer>
                    <ReactDiffViewer
                        oldValue={originalResponse}
                        newValue={editedResponse}
                        splitView={true}
                        compareMethod={diffMethod}
                    />
                </DiffContainer>
            </TabsContent>
        </Tabs>
    );
}

function PandaDiff({ diffMethod }: { diffMethod: DiffMethod }) {
    const [activeTab, setActiveTab] = useState(0);
    const {
        editedResponsePlaintext,
        originalResponsePlaintext,
        editedResponseMarkdown,
        originalResponseMarkdown
    } = usePandaStore();

    return (
        <Tabs
            defaultValue={`tab-${activeTab}`}
            onValueChange={value => setActiveTab(parseInt(value.split('-')[1]))}>
            <TabsList className='flex justify-start gap-0 p-0 shadow bg-mtc-faded mb-2 rounded-none rounded-t-md'>
                <TabsTrigger
                    value='tab-0'
                    className={clsx(
                        'border-none h-full rounded-none shadow-none',
                        'data-[state=active]:bg-mtc-primary data-[state=active]:text-white',
                        'bg-mtc-faded text-mtc-primary cursor-pointer',
                        'rounded-tl-md'
                    )}>
                    Plaintext
                </TabsTrigger>
                <TabsTrigger
                    value='tab-1'
                    className={clsx(
                        'border-none h-full rounded-none shadow-none',
                        'data-[state=active]:bg-mtc-primary data-[state=active]:text-white',
                        'bg-mtc-faded text-mtc-primary cursor-pointer'
                    )}>
                    Markdown
                </TabsTrigger>
            </TabsList>
            <TabsContent value='tab-0'>
                <DiffContainer>
                    <ReactDiffViewer
                        oldValue={originalResponsePlaintext}
                        newValue={editedResponsePlaintext}
                        splitView={true}
                        compareMethod={diffMethod}
                        extraLinesSurroundingDiff={0}
                    />
                </DiffContainer>
            </TabsContent>
            <TabsContent value='tab-1'>
                <DiffContainer>
                    <ReactDiffViewer
                        oldValue={originalResponseMarkdown}
                        newValue={editedResponseMarkdown}
                        splitView={true}
                        compareMethod={diffMethod}
                        extraLinesSurroundingDiff={0}
                    />
                </DiffContainer>
            </TabsContent>
        </Tabs>
    );
}

function DiffContainer({
    roundTop = false,
    children
}: {
    roundTop?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className={clsx(roundTop && 'overflow-x-hidden rounded-t-md')}>
            <div className='overflow-auto max-h-[80vh]'>{children}</div>
        </div>
    );
}
