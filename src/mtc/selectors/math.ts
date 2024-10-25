import Logger from '@lib/logging';

export const prompt = (): HTMLDivElement | undefined => {
    const prompt =
        document.querySelector(
            '#__next > div > div.bg-app.box-border.flex.h-screen.w-full.flex-col.overflow-auto.px-4.pb-4 > div.bg-void.relative.box-border.flex.flex-auto.flex-col.overflow-auto.rounded-lg > div.flex.h-full.flex-col > div.fixed.top-0.left-0.z-\\[99\\].flex.h-screen.w-screen.items-center.justify-center.bg-\\[rgba\\(255\\,255\\,255\\,0\\.3\\)\\] > div > div.react-grid-layout.bg-weak-2.relative.box-border.h-full.overflow-auto > div:nth-child(3) > div.sc-jlRLRk.fmDTcj > div.whitespace-pre-wrap'
        ) || undefined;

    return prompt instanceof HTMLDivElement ? prompt : undefined;
};

export const scratchpad = (): HTMLTextAreaElement | undefined => {
    let scratchpad =
        document.querySelector(
            '#__next > div > div.bg-app.box-border.flex.h-screen.w-full.flex-col.overflow-auto.px-4.pb-4 > div.bg-void.relative.box-border.flex.flex-auto.flex-col.overflow-auto.rounded-lg > div.flex.h-full.flex-col > div.fixed.top-0.left-0.z-\\[99\\].flex.h-screen.w-screen.items-center.justify-center.bg-\\[rgba\\(255\\,255\\,255\\,0\\.3\\)\\] > div > div.react-grid-layout.bg-weak-2.relative.box-border.h-full.overflow-auto > div:nth-child(1) > div.relative.box-border.flex.h-full.flex-col.overflow-auto.rounded-lg.border.border-gray-400.bg-white.p-2\\.5.shadow-md > div:nth-child(1) > div > div:nth-child(2) > div > div.shrink-0 > div > textarea'
        ) || undefined;

    if (scratchpad === null || scratchpad === undefined) {
        scratchpad =
            document.querySelector(
                '#__next > div > div.bg-app.box-border.flex.h-screen.w-full.flex-col.overflow-auto.px-4.pb-4 > div.bg-void.relative.box-border.flex.flex-auto.flex-col.overflow-auto.rounded-lg > div.flex.h-full.flex-col > div.fixed.top-0.left-0.z-\\[99\\].flex.h-screen.w-screen.items-center.justify-center.bg-\\[rgba\\(255\\,255\\,255\\,0\\.3\\)\\] > div > div.react-grid-layout.bg-weak-2.relative.box-border.h-full.overflow-auto > div:nth-child(4) > div.relative.box-border.flex.h-full.flex-col.overflow-auto.rounded-lg.border.border-gray-400.bg-white.p-2\\.5.shadow-md > div:nth-child(1) > div > div:nth-child(2) > div > div.shrink-0 > div > textarea'
            ) || undefined;
    }

    return scratchpad instanceof HTMLTextAreaElement ? scratchpad : undefined;
};

export const finalAnswer = (): HTMLTextAreaElement | undefined => {
    let element =
        document.querySelector(
            '#__next > div > div.bg-app.box-border.flex.h-screen.w-full.flex-col.overflow-auto.px-4.pb-4 > div.bg-void.relative.box-border.flex.flex-auto.flex-col.overflow-auto.rounded-lg > div.flex.h-full.flex-col > div.fixed.top-0.left-0.z-\\[99\\].flex.h-screen.w-screen.items-center.justify-center.bg-\\[rgba\\(255\\,255\\,255\\,0\\.3\\)\\] > div > div.react-grid-layout.bg-weak-2.relative.box-border.h-full.overflow-auto > div:nth-child(1) > div.relative.box-border.flex.h-full.flex-col.overflow-auto.rounded-lg.border.border-gray-400.bg-white.p-2\\.5.shadow-md > div:nth-child(1) > div > div:nth-child(3) > div > div.shrink-0 > div > textarea'
        ) || undefined;

    if (element === null || element === undefined) {
        element =
            document.querySelector(
                '#__next > div > div.bg-app.box-border.flex.h-screen.w-full.flex-col.overflow-auto.px-4.pb-4 > div.bg-void.relative.box-border.flex.flex-auto.flex-col.overflow-auto.rounded-lg > div.flex.h-full.flex-col > div.fixed.top-0.left-0.z-\\[99\\].flex.h-screen.w-screen.items-center.justify-center.bg-\\[rgba\\(255\\,255\\,255\\,0\\.3\\)\\] > div > div.react-grid-layout.bg-weak-2.relative.box-border.h-full.overflow-auto > div:nth-child(4) > div.relative.box-border.flex.h-full.flex-col.overflow-auto.rounded-lg.border.border-gray-400.bg-white.p-2\\.5.shadow-md > div:nth-child(1) > div > div:nth-child(3) > div > div.shrink-0 > div > textarea'
            ) || undefined;
    }
    return element instanceof HTMLTextAreaElement ? element : undefined;
};
