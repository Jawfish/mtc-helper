import { MutHandler } from '@handlers/types';
import { orochiStore } from '@src/store/orochiStore';

export const handleScoreMutation: MutHandler = (_target: Element) => {
    const element =
        Array.from(document.querySelectorAll('span')).find(
            span => span.textContent?.trim() === 'Alignment %'
        )?.parentElement || null;

    if (!element) {
        return;
    }

    const content = element.textContent?.split(':')[1].trim();
    if (!content) {
        return;
    }

    const score = parseInt(content, 10);
    orochiStore.setState({ score });
};
