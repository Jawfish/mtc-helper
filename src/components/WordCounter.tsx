import { useWordCount } from '@hooks/useWordCount';

import { Toggle } from './Toggle';

type Props = {
    type:
        | 'operator'
        | 'model (selected)'
        | 'selection'
        | 'prompt'
        | 'model (unselected)';
    children: React.ReactNode;
};

const WordCount = ({ type, children }: Props) => (
    <span className='whitespace-nowrap'>
        {children ? children : '?'} {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
);

export const WordCounter = () => {
    const {
        operatorWordCount,
        selectionWordCount,
        unselectedModelWordCount,
        selectedModelWordCount,
        promptWordCount,
        ignoreListNumbers,
        toggleIgnoreListNumbers
    } = useWordCount();

    return (
        <div className='flex flex-col fixed top-0 left-0 gap-3 bg-mtc-faded/90 rounded-br-lg shadow-md p-3 w-auto z-[800] text-mtc-primary-strong'>
            <div className='flex gap-3 flex-row justify-center items-center'>
                <WordCount type='prompt'>{promptWordCount}</WordCount>
                <WordCount type='operator'>{operatorWordCount}</WordCount>
                <WordCount type='model (selected)'>{selectedModelWordCount}</WordCount>
                <WordCount type='model (unselected)'>
                    {unselectedModelWordCount}
                </WordCount>
                <WordCount type='selection'>{selectionWordCount}</WordCount>
                <Toggle
                    variant='strong'
                    onCheckedChange={toggleIgnoreListNumbers}
                    checked={ignoreListNumbers}>
                    Ignore List Numbers
                </Toggle>
            </div>
        </div>
    );
};
