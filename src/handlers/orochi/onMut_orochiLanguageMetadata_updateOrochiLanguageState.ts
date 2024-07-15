import { MutHandler } from '@handlers/index';
import { selectResponseCodeElement } from '@lib/selectors';
import { orochiStore } from '@src/store/orochiStore';

const PYTHON_INDICATORS = [
    'Programming Language:Python',
    'Programming Language*Python'
];

const isPythonLanguage = (element: Element): boolean => {
    // Language is specified in the metadata submitted by the operator
    const hasPythonString = Array.from(element.querySelectorAll('div')).some(div =>
        PYTHON_INDICATORS.some(indicator => div.textContent?.includes(indicator))
    );
    if (hasPythonString) return true;

    // Response markdown code fence specifies ```python
    const responseCodeElement = selectResponseCodeElement();

    if (responseCodeElement?.classList.contains('language-python')) return true;

    // Tests section contains Python
    const testsSection = Array.from(document.querySelectorAll('div')).find(
        div => div.textContent === 'Tests*'
    )?.parentElement;
    if (testsSection?.textContent?.includes('Python')) return true;

    return false;
};

/**
 * This handler sets the language state to 'python' if the response is in Python. It
 * currently doesn't handle any other languages; they all default to 'unknown'.
 */
export const onMut_languageMetadata_updateLanguage: MutHandler = (target: Element) => {
    if (isPythonLanguage(target)) {
        orochiStore.setState({ language: 'python' });
    }
};
