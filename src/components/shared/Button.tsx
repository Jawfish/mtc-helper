import { Button as ShadCNButton } from '@external/components/ui/button';
import clsx from 'clsx';
import 'react-tooltip/dist/react-tooltip.css';

type ButtonType =
    | 'default'
    | 'destructive'
    | 'ghost'
    | 'link'
    | 'outline'
    | 'secondary';

type Props = {
    onClick: () => void;
    children: React.ReactNode;
    tooltip?: string;
    disabled?: boolean;
    variant?: ButtonType;
};

export default function Button({
    onClick,
    children,
    tooltip,
    disabled = false,
    variant = 'default'
}: Props) {
    return (
        <ShadCNButton
            data-tooltip-id='mtc-helper-tooltip'
            data-tooltip-content={tooltip}
            variant={variant}
            onClick={onClick}
            disabled={disabled}
            className={clsx('border-0 cursor-pointer focus:!ring-mtc-primary', {
                'bg-mtc-primary hover:bg-mtc-primary-strong': variant === 'default'
            })}>
            {children}
        </ShadCNButton>
    );
}
