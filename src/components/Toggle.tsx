import React from 'react';
import { Checkbox } from '@src/external/components/ui/checkbox';

type Props = {
    children: React.ReactNode;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    variant?: 'strong' | 'soft';
};

export const Toggle = ({ children, checked, onCheckedChange, variant }: Props) => (
    <div className='flex items-center gap-2'>
        <Checkbox
            id='diff-highlight-enabled'
            className='border-mtc-primary bg-mtc-faded data-[state=checked]:bg-mtc-primary data-[state=checked]:border-mtc-primary-strong size-5 rounded-md cursor-pointer flex items-center justify-center'
            checked={checked}
            onCheckedChange={onCheckedChange}
        />
        <label
            htmlFor='diff-highlight-enabled'
            className={`${variant === 'soft' ? 'text-mtc-primary' : 'text-mtc-primary-strong'} text-sm`}>
            {children}
        </label>
    </div>
);
