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
 * Checks if the response code element is missing a language class, indicating that the
 * operator did not specify the language in the opening of the markdown code fence.
 */
export const responseCodeMissingLanguage = (element: Element | null) => {
    const hasLanguageClass = Array.from(element?.classList || []).some(className =>
        className.startsWith('language-')
    );

    return !hasLanguageClass;
};

/**
 * This handler sets the language state to 'python' if the response is in Python. It
 * currently doesn't handle any other languages; they all default to 'unknown'.
 */
export const handleLanguageMutation: MutHandler = (target: Element) => {
    if (isPythonLanguage(target)) {
        orochiStore.setState({ language: 'python' });
    }
};
