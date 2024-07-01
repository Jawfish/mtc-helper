export class ClipboardError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ClipboardError';
    }
}

export async function copyToClipboard(text: string | undefined): Promise<void> {
    if (!text) {
        throw new ClipboardError('No text to copy');
    }

    try {
        const cleanedText = text.replace(/&nbsp;/g, '').replace(/\u00A0/g, '');

        await navigator.clipboard.writeText(cleanedText);
    } catch (error) {
        throw new ClipboardError(`Error copying text to clipboard: ${error}`);
    }
}
