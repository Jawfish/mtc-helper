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
import { useLatexView } from '@hooks/useLatexView';
import { useDiffView } from '@hooks/useDiffView';
import { useGenericProcessStore } from '@src/store/genericProcessStore';
import { useGenericProcessActions } from '@hooks/useGenericProcessActions';
import { useWordCount } from '@hooks/useWordCount';

import Button from './shared/Button';

type Props = {
    process: Process;
};

export default function Toolbar({ process }: Props) {
    const { validateResponse } = useValidation();
    const { canOpenLatexView, toggleLatexView } = useLatexView();
    const { canOpenDiffView, toggleDiffView } = useDiffView();
    const { toggleWordCountView } = useWordCount();
    const genericProcessStore = useGenericProcessStore();

    const handleLatexPromptView = () => {
        genericProcessStore.setLatexContentType('prompt');
        toggleLatexView();
    };

    const handleLatexScratchpadView = () => {
        genericProcessStore.setLatexContentType('scratchpad');
        toggleLatexView();
    };

    const handleLatexFinalAnswerView = () => {
        genericProcessStore.setLatexContentType('final');
        toggleLatexView();
    };

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
            {process !== 'Math' && (
                <Button
                    tooltip='View the differences between the original and edited responses'
                    onClick={toggleDiffView}
                    disabled={!canOpenDiffView}>
                    View Diff
                </Button>
            )}
            {process === 'STEM' && (
                <Button
                    tooltip='Open a live-updating LaTeX preview of the edited response'
                    onClick={toggleLatexView}
                    disabled={!canOpenLatexView}>
                    View LaTeX
                </Button>
            )}
            {process === 'Math' && (
                <Button
                    tooltip='Open a live-updating LaTeX preview of the prompt'
                    onClick={handleLatexPromptView}>
                    View LaTeX (Prompt)
                </Button>
            )}
            {process === 'Math' && (
                <Button
                    tooltip='Open a live-updating LaTeX preview of the scratchpad'
                    onClick={handleLatexScratchpadView}>
                    View LaTeX (Scratchpad)
                </Button>
            )}
            {process === 'Math' && (
                <Button
                    tooltip='Open a live-updating LaTeX preview of the final answer'
                    onClick={handleLatexFinalAnswerView}>
                    View LaTeX (Final Answer)
                </Button>
            )}
            {process !== 'Orochi' && (
                <Button
                    tooltip='Toggle the word count sidebar'
                    onClick={toggleWordCountView}>
                    View Word Count
                </Button>
            )}
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
                className='min-w-36 z-[1300] text-mtc-primary'
                data-testid='dropdown-content'>
                {process === 'Orochi' && <OrochiDropdownItems />}
                <Item onClick={copyTaskId}>Task ID</Item>
                <Item onClick={copyOperatorEmail}>Email</Item>
                {process !== 'Orochi' && <GenericDropdownItems />}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

const OrochiDropdownItems = () => {
    const {
        copyOperatorCode,
        copyOriginalCode,
        copyTests,
        copyAllAsPython,
        copyPrompt
    } = useOrochiActions();
    const { language, modelResponseCode, operatorResponseCode, prompt, tests } =
        useOrochiStore();

    return (
        <>
            {language === 'python' && (
                <Item
                    onClick={copyAllAsPython}
                    disabled={!operatorResponseCode || !tests || !prompt}>
                    Conversation
                </Item>
            )}
            <Item
                onClick={copyPrompt}
                disabled={!prompt}>
                Prompt
            </Item>
            <Item
                onClick={copyOperatorCode}
                disabled={!operatorResponseCode}>
                Operator Code
            </Item>
            <Item
                onClick={copyOriginalCode}
                disabled={!modelResponseCode}>
                Model Code
            </Item>
            <Item
                onClick={copyTests}
                disabled={!tests}>
                Tests
            </Item>
        </>
    );
};

const GenericDropdownItems = () => {
    const { copyModelResponse, copyOperatorResponse, copyPrompt } =
        useGenericProcessActions();
    const { operatorResponseMarkdown, modelResponseMarkdown, prompt } =
        useGenericProcessStore();

    return (
        <>
            <Item
                onClick={copyPrompt}
                disabled={!prompt}>
                Prompt
            </Item>
            <Item
                onClick={copyOperatorResponse}
                disabled={!operatorResponseMarkdown}>
                Operator Response
            </Item>
            <Item
                onClick={copyModelResponse}
                disabled={!modelResponseMarkdown}>
                Model Response
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
