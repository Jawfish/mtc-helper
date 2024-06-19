import * as global from './global';
import * as orochi from './orochi';
import * as panda from './panda';

/**
 * Handlers that satisfy this type will be  called by the MutationObserver on each
 * mutation where target.nodeType === Node.ELEMENT_NODE.
 *
 * The imported files should ONLY contain handlers that implement this type. They are
 * all exported as arrays below so that they can be passed to the MutationObserver. This
 * is so that they can automatically be treated as handlers once defined.
 *
 * These originally had selectors injected as an argument to help with testing. Given a
 * choice between mocking selectors and mocking the DOM, a mocked DOM that is structured
 * like the real DOM is more useful than fake selectors.
 *
 * TODO: look into creating selectors local to the mutation rather than the entire
 * document.
 */
export type MutHandler = (target: Element) => void;

export const addMtcHelperAttributeToElement = (element: Element) => {
    element.setAttribute('data-mtc-helper', 'true');
};

export const elementHasMtcHelperAttribute = (element: Element) => {
    return Boolean(element.attributes.getNamedItem('data-mtc-helper'));
};

export const standardizeNewlines = (text: string | undefined) => {
    if (!text) {
        return undefined;
    }

    const lines: string[] = text.split('\n');

    return lines
        .map(line => line.trim().replaceAll(/(\r\n|\r|\n)+/g, ''))
        .filter(line => line.length > 0)
        .join('\n');
};

export const globalHandlers = [...Object.values(global)];
export const orochiHandlers = [...Object.values(orochi)];
export const pandaHandlers = [...Object.values(panda)];
