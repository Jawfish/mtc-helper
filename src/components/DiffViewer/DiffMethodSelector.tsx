import React from 'react';
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
    onChange: (value: string) => void;
};

export const DiffMethodSelector: React.FC<DiffMethodSelectorProps> = ({
    value,
    onChange
}) => (
    <Select
        onValueChange={onChange}
        defaultValue={value}>
        <SelectTrigger className='shadow-none border-solid border rounded-md border-mtc-primary bg-white text-mtc-primary w-36 focus:ring-mtc-primary'>
            <SelectValue />
        </SelectTrigger>
        <SelectContent className='z-[1300] bg-white text-mtc-primary'>
            {Object.values(DiffMethod).map(method => (
                <SelectItem
                    key={method}
                    className='hover:bg-mtc-faded text-mtc-primary'
                    value={method}>
                    {method.charAt(0).toUpperCase() + method.slice(1).toLowerCase()}
                </SelectItem>
            ))}
        </SelectContent>
    </Select>
);
