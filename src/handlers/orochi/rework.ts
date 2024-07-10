import { orochiStore } from '@src/store/orochiStore';
import { MutHandler } from '@handlers/index';

/**
 * This handler retrieves the rework status from the DOM.
 */
export const handleReturnTargetMutation: MutHandler = (_target: Element) => {
    const element =
        Array.from(document.querySelectorAll('button')).find(
            button => button.textContent === 'Send case to'
        )?.parentElement?.parentElement || undefined;

    if (!element) {
        return;
    }

    const rework = element.textContent?.includes('Rework (Same Operator)');
    if (rework === undefined) {
        return;
    }

    orochiStore.setState({ rework });
};
