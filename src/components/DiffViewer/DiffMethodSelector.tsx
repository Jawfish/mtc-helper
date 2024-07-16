import { DiffMethod } from 'react-diff-viewer-continued';
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectValue,
    SelectItem
} from '@src/external/components/ui/select';

type DiffMethodSelectorProps = {
    value: DiffMethod;
    onChange: (value: DiffMethod) => void;
};

const diffMethodOptions = [
    { value: DiffMethod.CHARS, label: 'Characters' },
    { value: DiffMethod.WORDS, label: 'Words' },
    { value: DiffMethod.LINES, label: 'Lines' },
    { value: DiffMethod.SENTENCES, label: 'Sentences' }
];

export const DiffMethodSelector = ({ value, onChange }: DiffMethodSelectorProps) => (
    <Select
        onValueChange={newValue => onChange(newValue as DiffMethod)}
        defaultValue={value}>
        <SelectTrigger className='shadow-none border-solid border rounded-md border-mtc-primary bg-white !text-mtc-primary w-36 focus:!ring-mtc-primary'>
            <SelectValue />
        </SelectTrigger>
        <SelectContent className='z-[1300] bg-white text-mtc-primary'>
            {diffMethodOptions.map(({ value, label }) => (
                <SelectItem
                    key={value}
                    // TODO: figure out how to not need to make these important
                    className='hover:!bg-mtc-faded hover:!text-mtc-primary-strong'
                    value={value}>
                    {label}
                </SelectItem>
            ))}
        </SelectContent>
    </Select>
);
