import { Selector } from '@mtc/MutationHandler';

/**
 * Select the Orochi prompt element.
 * @returns The Orochi prompt element if found, otherwise `undefined`.
 */
export const prompt: Selector = () =>
    document.querySelector('div.rounded-xl.bg-indigo-100 p.whitespace-pre-wrap')
        ?.parentElement || undefined;

/**
 * Select the Orochi test header element.
 * @returns The Orochi test header element if found, otherwise `undefined`.
 */
export const testHeader: Selector = () =>
    document.querySelector(
        '#__next > div > div.bg-app.box-border.flex.h-screen.w-full.flex-col.overflow-auto.px-4.pb-4 > div.bg-void.relative.box-border.flex.flex-auto.flex-col.overflow-auto.rounded-lg > div.flex.h-full.flex-col > div.fixed.top-0.left-0.z-\\[99\\].flex.h-screen.w-screen.items-center.justify-center.bg-\\[rgba\\(255\\,255\\,255\\,0\\.3\\)\\] > div > div.react-grid-layout.bg-weak-2.relative.box-border.h-full.overflow-auto > div:nth-child(3) > div.relative.box-border.flex.h-full.flex-col.overflow-auto.rounded-lg.border.border-gray-400.bg-white.p-2\\.5.shadow-md > div:nth-child(1) > div.border-r-6.mt-2.mb-2.rounded-md.border.border-solid.border-gray-300.pl-4.pt-2.pb-2.pr-4.shadow-sm > div:nth-child(6) > div > div.shrink-0 > div > div'
    ) || undefined;

/**
 * Select the language metadata that appears after the conversation score is
 * saved.
 * @returns The language metadata element if found, otherwise `undefined`.
 */
export const languageMetadata: Selector = () =>
    document.querySelector(
        '#__next > div > div.bg-app.box-border.flex.h-screen.w-full.flex-col.overflow-auto.px-4.pb-4 > div.bg-void.relative.box-border.flex.flex-auto.flex-col.overflow-auto.rounded-lg > div.flex.h-full.flex-col > div.fixed.top-0.left-0.z-\\[99\\].flex.h-screen.w-screen.items-center.justify-center.bg-\\[rgba\\(255\\,255\\,255\\,0\\.3\\)\\] > div > div.react-grid-layout.bg-weak-2.relative.box-border.h-full.overflow-auto > div:nth-child(3) > div.relative.box-border.flex.h-full.flex-col.overflow-auto.rounded-lg.border.border-gray-400.bg-white.p-2\\.5.shadow-md > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > div'
    ) || undefined;

/**
 * Select the response code element from the response section. This is the code that
 * shows before a QA clicks the edit button.
 * @returns The response code element if found, otherwise `undefined`.
 */
export const operatorResponseCode: Selector = () =>
    document.querySelector('div.rounded-xl.bg-pink-100 pre code') || undefined;

/**
 * Selects the operator's non-editable, non-raw response; the response that is shown in
 * the box with rounded corners with a light blue background. This response is an HTML
 * rendering of the operator's response, not the markdown.
 */
export const nonEditableOperatorResponse = (): HTMLDivElement | undefined => {
    const taskElements = Array.from(document.querySelectorAll('div.rounded-xl'));

    return taskElements.length >= 2 && taskElements[1] instanceof HTMLDivElement
        ? taskElements[1]
        : undefined;
};

/**
 * Selects the useless empty metadata section with the non-functioning save button that
 * apepars at the bottom of a response while editing it.
 */
export const uselessMetadataSection = (): HTMLDivElement | undefined => {
    const h4Elements = Array.from(document.querySelectorAll('h4'));
    const metadataElement = h4Elements.find(h4 => {
        const span = h4.querySelector('span');

        return span && span.textContent === 'Metadata info';
    });

    return metadataElement?.parentElement instanceof HTMLDivElement
        ? metadataElement.parentElement
        : undefined;
};

/**
 * Selects the useful metadata section with content like the operator notes,
 * conversation title, and error labels.
 */
const usefulMetadataSection = () => {
    const conversationTitleElement = Array.from(document.querySelectorAll('div')).find(
        div => div.textContent === 'Conversations > Title'
    );

    return conversationTitleElement?.parentElement?.parentElement || undefined;
};

/**
 * @returns The operator notes element if found, otherwise `undefined`.
 */
export const operatorNotes = () =>
    usefulMetadataSection()?.children[2]?.children[1]?.lastElementChild || undefined;

/**
 * @returns The conversation title element if found, otherwise `undefined`.
 */
export const conversationTitle = () =>
    usefulMetadataSection()?.children[0]?.children[1]?.lastElementChild || undefined;

/**
 * @returns The error labels element if found, otherwise `undefined`.
 * */
export const errorLabels = () =>
    usefulMetadataSection()?.children[1]?.children[1]?.lastElementChild || undefined;
