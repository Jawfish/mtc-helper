import { MutHandler } from '@handlers/types';
import { orochiStore } from '@src/store/orochiStore';

const PYTHON_INDICATORS = [
    'Programming Language:Python',
    'Programming Language*Python'
];

const isPythonLanguage = (element: Element): boolean => {
    const hasPythonString = Array.from(element.querySelectorAll('div')).some(div =>
        PYTHON_INDICATORS.some(indicator => div.textContent?.includes(indicator))
    );
    if (hasPythonString) return true;

    const responseCodeElement = document.querySelector(
        'div.rounded-xl.bg-pink-100 pre code'
    );
    if (responseCodeElement?.classList.contains('language-python')) return true;

    const testsSection = Array.from(element.querySelectorAll('div')).find(
        div => div.textContent === 'Tests*'
    )?.parentElement;
    if (testsSection?.textContent?.includes('Python')) return true;

    return false;
};

export const handleLanguageMutation: MutHandler = (target: Element) => {
    if (isPythonLanguage(target)) {
        orochiStore.setState({ language: 'python' });
    }
};
