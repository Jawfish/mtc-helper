import { ButtonProps, Button as ShadCNButton } from '@external/components/ui/button';
import clsx from 'clsx';
import 'react-tooltip/dist/react-tooltip.css';

namespace Button {
    export interface Props extends ButtonProps {
        tooltip?: string;
    }
}

export default function Button({ tooltip, ...props }: Button.Props) {
    return (
        <ShadCNButton
            data-tooltip-id='mtc-helper-tooltip'
            data-tooltip-content={tooltip}
            className={clsx(
                '!font-normal border-0 cursor-pointer focus:!ring-mtc-primary',
                {
                    'bg-mtc-primary hover:bg-mtc-primary-strong':
                        props.variant === 'default'
                }
            )}
            {...props}
        />
    );
}
