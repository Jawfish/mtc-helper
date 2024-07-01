import { Process } from '@src/store/globalStore';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@src/external/components/ui/dropdown-menu';
import { Button as ShadButton } from '@src/external/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { useOrochiActions } from '@hooks/useOrochiActions';
import { useTask } from '@hooks/useTask';
import { useValidation } from '@hooks/useValidation';
import { useOrochiStore } from '@src/store/orochiStore';
import { DropdownMenuItemProps } from '@radix-ui/react-dropdown-menu';
import { useGeneralStore } from '@src/store/generalStore';

import Button from './shared/Button';

namespace Toolbar {
    export interface Props {
        toggleDiffView: () => void;
        process: Process;
    }
}

export default function Toolbar({ toggleDiffView, process }: Toolbar.Props) {
    const { validateResponse } = useValidation();
    const { originalCode } = useOrochiStore();
    const { originalResponseMarkdown } = useGeneralStore();

    return (
        <ToolbarContainer>
            <Dropdown process={process} />
            {process === 'Orochi' && (
                <Button
                    tooltip='Check the edited response for common issues'
                    onClick={validateResponse}>
                    Check Response
                </Button>
            )}
            {(process === 'Orochi' || process === 'General') && (
                <Button
                    tooltip='View the differences between the original and edited responses'
                    onClick={toggleDiffView}
                    disabled={
                        process === 'Orochi' ? !originalCode : !originalResponseMarkdown
                    }>
                    View Diff
                </Button>
            )}
            {/* TODO: show metadata, click to copy */}
        </ToolbarContainer>
    );
}

const ToolbarContainer = ({ children }: { children: React.ReactNode }) => (
    <div className='flex flex-col fixed top-0 left-1/2 -translate-x-1/2 gap-3 bg-mtc-faded/90 rounded-b-lg shadow-md p-3 w-auto z-[800]'>
        <ToolbarInner>{children}</ToolbarInner>
    </div>
);

const ToolbarInner = ({ children }: { children: React.ReactNode }) => (
    <div className='flex gap-3 flex-row justify-center items-center '>{children}</div>
);

const Dropdown = ({ process }: { process: Process }) => {
    const { copyOperatorEmail, copyTaskId } = useTask();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {/* NOTE: this needs to be a React.forwardRef component due to the use of asChild */}
                <ShadButton
                    className='bg-white border-mtc-primary text-mtc-primary border rounded-md shadow-none focus:!ring-mtc-primary cursor-pointer flex gap-3 !font-normal hover:!text-mtc-primary hover:!bg-mtc-faded'
                    variant={'outline'}
                    data-testid='dropdown-trigger'>
                    <span>Copy</span>
                    <ChevronDown
                        size={16}
                        className='p-0'
                        strokeWidth={2}
                    />
                </ShadButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className='w-36 z-[1300] text-mtc-primary'
                data-testid='dropdown-content'>
                {process === 'Orochi' && <OrochiDropdownItems />}
                <Item onClick={copyTaskId}>Task ID</Item>
                <Item onClick={copyOperatorEmail}>Email</Item>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

const OrochiDropdownItems = () => {
    const { copyEditedCode, copyOriginalCode, copyTests, copyAllAsPython, copyPrompt } =
        useOrochiActions();
    const { language, originalCode, editedCode, prompt, tests } = useOrochiStore();

    return (
        <>
            {language === 'python' && (
                <Item
                    onClick={copyAllAsPython}
                    disabled={!editedCode || !tests || !prompt}>
                    Conversation
                </Item>
            )}
            <Item
                onClick={copyPrompt}
                disabled={!prompt}>
                Prompt
            </Item>
            <Item
                onClick={copyEditedCode}
                disabled={!editedCode}>
                Edited Code
            </Item>
            <Item
                onClick={copyOriginalCode}
                disabled={!originalCode}>
                Original Code
            </Item>
            <Item
                onClick={copyTests}
                disabled={!tests}>
                Tests
            </Item>
        </>
    );
};

const Item = ({ onClick, children, disabled = false }: DropdownMenuItemProps) => (
    <DropdownMenuItem
        className='hover:!bg-mtc-faded hover:!text-mtc-primary-strong'
        onClick={onClick}
        disabled={disabled}>
        {children}
    </DropdownMenuItem>
);
