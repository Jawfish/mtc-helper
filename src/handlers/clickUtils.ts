interface ElementRect {
    left: number;
    right: number;
    top: number;
    bottom: number;
    width: number;
    height: number;
}

export const getElementRect = (element: Element): ElementRect => {
    const rect = element.getBoundingClientRect();

    return {
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height
    };
};

export const isElementVisible = (element: Element): boolean => {
    const style = window.getComputedStyle(element);

    return !(
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        style.opacity === '0'
    );
};

export const isElementInViewport = (rect: ElementRect): boolean => {
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
};

export const isClickWithinElement = (event: MouseEvent, element: Element): boolean => {
    const rect = getElementRect(element);

    // Assume the click is within if dimensions are zero
    if (rect.width === 0 || rect.height === 0) return true;

    const isWithin =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

    return isWithin;
};
