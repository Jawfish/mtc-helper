import { useContentStore } from '@src/store/ContentStore';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from '@radix-ui/react-dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { Button as ShadButton } from '@src/external/components/ui/button';

export default function OrochiMetadata() {
    const { orochiConversationTitle, orochiErrorLabels, orochiOperatorNotes } =
        useContentStore();

    const handleCopy = (text: string | undefined) => {
        if (!text) {
            return;
        }

        navigator.clipboard.writeText(text);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <ShadButton
                    className='bg-white border-mtc-primary text-mtc-primary border rounded-none !rounded-bl-md shadow-none focus:!ring-mtc-primary cursor-pointer flex gap-3'
                    variant={'outline'}>
                    <span>Metadata</span>
                    <ChevronDown size={16} className='p-0' strokeWidth={2} />
                </ShadButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-36 z-[1300] text-mtc-primary '>
                <DropdownMenuItem
                    className='hover:!bg-mtc-faded hover:!text-mtc-primary-strong'
                    onSelect={() => handleCopy(orochiConversationTitle)}>
                    {orochiConversationTitle}
                </DropdownMenuItem>
                <DropdownMenuItem
                    className='hover:!bg-mtc-faded hover:!text-mtc-primary-strong'
                    onSelect={() => handleCopy(orochiErrorLabels)}>
                    {orochiErrorLabels}
                </DropdownMenuItem>
                <DropdownMenuItem
                    className='hover:!bg-mtc-faded hover:!text-mtc-primary-strong'
                    onSelect={() => handleCopy(orochiOperatorNotes)}>
                    {orochiOperatorNotes}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
