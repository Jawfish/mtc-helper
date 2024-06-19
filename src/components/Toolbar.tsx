import { copyToClipboard, determineWarnings, isPython } from '@src/lib/helpers';
import { ResponseContent, useContentStore } from '@src/store/ContentStore';
import Logger from '@src/lib/logging';
import { Process, useMTCStore } from '@src/store/MTCStore';
import { IToastContext, useToast } from '@src/contexts/ToastContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@src/external/components/ui/dropdown-menu';
import { Button as ShadButton } from '@src/external/components/ui/button';
import { ChevronDown } from 'lucide-react';

import Button from './shared/Button';

type Props = {
    diffViewOpen: boolean;
    taskIdElementSelector: () => HTMLDivElement | undefined;
    setDiffViewOpen: (open: boolean) => void;
};

type CopyValue =
    | 'All'
    | 'Prompt'
    | 'Edited Code'
    | 'Original Code'
    | 'Tests'
    | 'Task ID'
    | 'Email';

export default function Toolbar({
    diffViewOpen,
    setDiffViewOpen,
    taskIdElementSelector
}: Props) {
    const toastContext = useToast();
    const process = useMTCStore(state => state.process);
    const { orochiCode, orochiPrompt, orochiOperatorNotes, orochiTests } =
        useContentStore();

    return (
        <div className='flex flex-col fixed top-0 left-1/2 -translate-x-1/2 gap-3 bg-mtc-faded/90 rounded-b-lg shadow-md p-3 w-auto z-[800]'>
            <div className='flex gap-3 flex-row justify-center items-center '>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <ShadButton
                            className='bg-white border-mtc-primary text-mtc-primary border rounded-md shadow-none focus:!ring-mtc-primary cursor-pointer flex gap-3'
                            variant={'outline'}>
                            <span>Copy Content</span>
                            <ChevronDown size={16} className='p-0' strokeWidth={2} />
                        </ShadButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className='w-36 z-[1300] text-mtc-primary '>
                        {isPython() && (
                            <>
                                <DropdownMenuItem
                                    className='hover:!bg-mtc-faded hover:!text-mtc-primary-strong'
                                    onClick={() =>
                                        handleCopySelectChange('All', {
                                            orochiPrompt,
                                            orochiCode,
                                            orochiTests,
                                            orochiReason: orochiOperatorNotes,
                                            toastContext,
                                            taskIdElementSelector
                                        })
                                    }>
                                    All
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className='hover:!bg-mtc-faded hover:!text-mtc-primary-strong'
                                    onClick={() =>
                                        handleCopySelectChange('Prompt', {
                                            orochiPrompt,
                                            orochiCode,
                                            orochiTests,
                                            orochiReason: orochiOperatorNotes,
                                            toastContext,
                                            taskIdElementSelector
                                        })
                                    }>
                                    Prompt
                                </DropdownMenuItem>
                            </>
                        )}
                        {process === Process.Orochi && (
                            <>
                                <DropdownMenuItem
                                    className='hover:!bg-mtc-faded hover:!text-mtc-primary-strong'
                                    onClick={() =>
                                        handleCopySelectChange('Edited Code', {
                                            orochiPrompt,
                                            orochiCode,
                                            orochiTests,
                                            orochiReason: orochiOperatorNotes,
                                            toastContext,
                                            taskIdElementSelector
                                        })
                                    }>
                                    Edited Code
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className='hover:!bg-mtc-faded hover:!text-mtc-primary-strong'
                                    onClick={() =>
                                        handleCopySelectChange('Original Code', {
                                            orochiPrompt,
                                            orochiCode,
                                            orochiTests,
                                            orochiReason: orochiOperatorNotes,
                                            toastContext,
                                            taskIdElementSelector
                                        })
                                    }>
                                    Original Code
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className='hover:!bg-mtc-faded hover:!text-mtc-primary-strong'
                                    onClick={() =>
                                        handleCopySelectChange('Tests', {
                                            orochiPrompt,
                                            orochiCode,
                                            orochiTests,
                                            orochiReason: orochiOperatorNotes,
                                            toastContext,
                                            taskIdElementSelector
                                        })
                                    }>
                                    Tests
                                </DropdownMenuItem>
                            </>
                        )}
                        <DropdownMenuItem
                            className='hover:!bg-mtc-faded hover:!text-mtc-primary-strong'
                            onClick={() =>
                                handleCopySelectChange('Task ID', {
                                    orochiPrompt,
                                    orochiCode,
                                    orochiTests,
                                    orochiReason: orochiOperatorNotes,
                                    toastContext,
                                    taskIdElementSelector
                                })
                            }>
                            Task ID
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className='hover:!bg-mtc-faded hover:!text-mtc-primary-strong'
                            onClick={() =>
                                handleCopySelectChange('Email', {
                                    orochiPrompt,
                                    orochiCode,
                                    orochiTests,
                                    orochiReason: orochiOperatorNotes,
                                    toastContext,
                                    taskIdElementSelector
                                })
                            }>
                            Email
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                {process === Process.Orochi && (
                    <Button
                        tooltip='Check the edited response for common issues'
                        onClick={() => {
                            const messages = handleCheckResponseClicked(
                                orochiCode.edited
                            ).join('\n');
                            if (messages == 'No issues detected.') {
                                sendSuccessMessage(messages, toastContext);
                            } else {
                                // TODO: show nicer non-native alert
                                alert(messages);
                            }
                        }}>
                        Check Response
                    </Button>
                )}
                <Button
                    tooltip='View the differences between the original and edited responses'
                    onClick={() =>
                        handleOpenDiffViewClicked(
                            process,
                            setDiffViewOpen,
                            diffViewOpen,
                            toastContext
                        )
                    }>
                    View Diff
                </Button>
                {/* TODO: show metadata, click to copy */}
            </div>
        </div>
    );
}

// TODO: this is very stupid because everything that calls it has to pass all state
// even if it's irrelevant to the copy operation
const handleCopySelectChange = (
    value: string,
    {
        orochiPrompt,
        orochiCode,
        orochiTests,
        orochiReason,
        toastContext,
        taskIdElementSelector
    }: {
        orochiPrompt: string | undefined;
        orochiCode: ResponseContent;
        orochiTests: string | undefined;
        orochiReason: string | undefined;
        toastContext: IToastContext | undefined;
        taskIdElementSelector: () => HTMLDivElement | undefined;
    }
) => {
    switch (value) {
        case 'All':
            copyAll(
                orochiPrompt,
                orochiCode.edited,
                orochiTests,
                orochiReason,
                toastContext
            );
            break;
        case 'Prompt':
            copyContent(
                'Prompt',
                orochiPrompt,
                message => sendSuccessMessage(message, toastContext),
                message => sendErrorMessage(message, toastContext)
            );
            break;
        case 'Edited Code':
            copyContent(
                'Edited Code',
                orochiCode.edited,
                message => sendSuccessMessage(message, toastContext),
                message => sendErrorMessage(message, toastContext)
            );
            break;
        case 'Original Code':
            copyContent(
                'Original Code',
                orochiCode.original,
                message => sendSuccessMessage(message, toastContext),
                message => sendErrorMessage(message, toastContext)
            );
            break;
        case 'Tests':
            copyContent(
                'Tests',
                orochiTests,
                message => sendSuccessMessage(message, toastContext),
                message => sendErrorMessage(message, toastContext)
            );
            break;
        case 'Task ID':
            handleCopyTaskIdClicked(toastContext, taskIdElementSelector);
            break;
        case 'Email':
            handleCopyEmailClicked(toastContext);
            break;
        default:
            break;
    }
};

const sendSuccessMessage = (
    message: string,
    toastContext: IToastContext | undefined
) => {
    Logger.debug(message);
    toastContext?.notify(message, 'success');
};

const sendInfoMessage = (message: string, toastContext: IToastContext | undefined) => {
    Logger.debug(message);
    toastContext?.notify(message, 'info');
};

const sendWarningMessage = (
    message: string,
    toastContext: IToastContext | undefined
) => {
    Logger.debug(message);
    toastContext?.notify(message, 'warning');
};

const sendErrorMessage = (message: string, toastContext: IToastContext | undefined) => {
    Logger.debug(message);
    toastContext?.notify(message, 'error');
};

const handleCopyTaskIdClicked = (
    toastContext: IToastContext | undefined,
    taskIdElementSelector: () => HTMLDivElement | undefined
) => {
    Logger.debug('Task ID button clicked');

    let uuid = taskIdElementSelector()?.getAttribute('title');

    const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

    if (!uuid || !uuidRegex.test(uuid)) {
        const err =
            'Task ID could not be found in a row from the task list. This may happen if the task list in the background updates and the task you are working on moves to the next page.';
        sendErrorMessage(err, toastContext);
        uuid = err;
    } else {
        copyToClipboard(uuid);
        toastContext?.notify('Task ID copied', 'success');
    }
};

const copyContent = (
    contentName: string | undefined = 'Content',
    content: string | undefined,
    onSuccess: (message: string) => void,
    onFailure: (message: string) => void
) => {
    try {
        if (!content) {
            const err = `${contentName} could not be found`;
            onFailure(err);
            content = err;
        } else {
            onSuccess(`${contentName} copied`);
        }
        copyToClipboard(content);
    } catch (err) {
        onFailure(
            `Error copying ${contentName.toLowerCase()}: ${(err as Error).message}`
        );
    }
};

const copyAll = (
    prompt: string | undefined,
    code: string | undefined,
    tests: string | undefined,
    reason: string | undefined,
    toastContext: IToastContext | undefined
) => {
    Logger.debug('Copy task button clicked');

    const errors = Array<string>();

    if (!prompt) {
        const err = 'Prompt could not be found';
        prompt = err;
        errors.push(err);
    }

    if (!code) {
        const err = 'Code could not be found';
        code = err;
        errors.push(err);
    }

    if (!tests) {
        const err = 'Tests could not be found';
        tests = err;
        errors.push(err);
    }

    if (!reason) {
        const err = 'Operator reason could not be found';
        reason = err;
        errors.push(err);
    }

    try {
        copyTaskToClipboard(prompt, code, tests, reason);

        if (errors.length === 4) {
            const message = errors.join(', ');
            throw new Error(`${message}`);
        }

        if (errors.length > 0) {
            const message = errors.join(', ');
            sendWarningMessage(`Task copied with errors: ${message}`, toastContext);
        } else {
            sendSuccessMessage('Task copied', toastContext);
        }
    } catch (err) {
        sendErrorMessage(`Error copying task: ${(err as Error).message}`, toastContext);
    }
};

const getTextFromElement = (element: HTMLElement | undefined) => {
    let text = '';

    if (!element) {
        return text;
    }

    element.childNodes.forEach(child => {
        if (child.nodeType === Node.ELEMENT_NODE) {
            text += getTextFromElement(child as HTMLElement);

            return;
        }
        if (child.nodeType === Node.TEXT_NODE) {
            switch (element.tagName) {
                case 'P':
                    text += `${child.nodeValue}`;
                    break;
                case 'LI':
                    text += `- ${child.nodeValue}`;
                    break;
                case 'CODE':
                    text += `\`${child.nodeValue}\``;
                    break;
                case 'H1':
                    text += `# ${child.nodeValue}`;
                    break;
                case 'H2':
                    text += `## ${child.nodeValue}`;
                    break;
                case 'H3':
                    text += `### ${child.nodeValue}`;
                    break;
                case 'H4':
                    text += `#### ${child.nodeValue}`;
                    break;
                case 'H5':
                    text += `##### ${child.nodeValue}`;
                    break;
                case 'H6':
                    text += `###### ${child.nodeValue}`;
                    break;
                case 'STRONG':
                    text += `**${child.nodeValue}**`;
                    break;
                case 'EM':
                    text += `*${child.nodeValue}*`;
                    break;
                default:
                    text += child.nodeValue;
            }
        }
    });

    return text;
};

const copyTaskToClipboard = (
    prompt: string,
    code: string,
    tests: string,
    operatorReason: string
) => {
    const formattedText = `
"""
${prompt}
"""

################################# REASON #################################

"""
${operatorReason}
"""

################################ RESPONSE ################################

${code}

################################# TESTS ##################################

${tests}`;

    copyToClipboard(formattedText);
};

export function handleCopyEmailClicked(toastContext: IToastContext | undefined) {
    const element = document.querySelector(
        '.MuiTypography-root.MuiTypography-body2.MuiTypography-noWrap'
    );
    // TODO: transient notification if element is not found (and a success notification if it is
    // found and copied successfully)
    if (element) {
        const modifiedText = `${element.textContent}invisible.email`;
        copyToClipboard(modifiedText);
        toastContext?.notify('Email copied', 'success');
    } else {
        toastContext?.notify('Email could not be found', 'error');
    }
}

export function handleCheckResponseClicked(code: string | undefined): string[] {
    Logger.debug('Check button clicked');

    // TODO: transient notification if no code is found
    if (!code) {
        return ['No code found.'];
    }

    const messages = determineWarnings(code);
    if (messages.length === 0) {
        return ['No issues detected.'];
    }

    return messages;
}

// TODO this and everything below it is a mess
const handleOpenDiffViewClicked = (
    process: Process,
    setDiffViewOpen: (open: boolean) => void,
    diffViewOpen: boolean,
    toastContext: IToastContext | undefined
) => {
    Logger.debug('View Diff button clicked');

    if (process === Process.Orochi && canOpenOrochiDiffView(toastContext)) {
        setDiffViewOpen(!diffViewOpen);
        Logger.debug(`Setting diff view open to ${!diffViewOpen}`);
    } else if (process === Process.PANDA && canOpenPandaDiffView(toastContext)) {
        setDiffViewOpen(!diffViewOpen);
        Logger.debug(`Setting diff view open to ${!diffViewOpen}`);
    }
};

const canOpenOrochiDiffView = (toastContext: IToastContext | undefined) => {
    const { orochiResponse } = useContentStore.getState();

    if (!orochiResponse.original) {
        Logger.debug('Tried to view diff with no original response content');
        if (toastContext) {
            toastContext.notify(
                'The original content must be viewed before a diff can be displayed.',
                'error'
            );
        } else {
            Logger.error('No alert context found');
        }

        return false;
    }
    if (!orochiResponse.edited) {
        Logger.debug('Tried to view diff with no edited response content');
        if (toastContext) {
            toastContext.notify('No content found.', 'error');
        }

        return false;
    }

    return true;
};

const canOpenPandaDiffView = (toastContext: IToastContext | undefined) => {
    const { pandaEditedResponse } = useContentStore.getState();
    const { pandaOriginalResponse } = useContentStore.getState();

    if (!pandaOriginalResponse) {
        Logger.debug('Tried to view diff with no original response content');
        if (toastContext) {
            toastContext.notify(
                'The original content must be viewed before a diff can be displayed.',
                'error'
            );
        } else {
            Logger.error('No alert context found');
        }

        return false;
    }
    if (!pandaEditedResponse) {
        Logger.debug('Tried to view diff with no edited response content');
        if (toastContext) {
            toastContext.notify('No content found.', 'error');
        }

        return false;
    }

    return true;
};
