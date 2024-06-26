import { describe, it, expect, vi, beforeEach } from 'vitest';
import { orochiStore } from '@src/store/orochiStore';

import { handleUselessMetadataSection } from './uselessMetadata';

describe('handleUselessMetadataSection', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        orochiStore.getState().reset();
        document.body.innerHTML = '';
    });

    it('should remove the metadata section when present', () => {
        document.body.innerHTML = `
            <div>
                <h4><span>Metadata info</span></h4>
                <p>Some useless metadata</p>
            </div>
        `;

        handleUselessMetadataSection(document.body);

        expect(document.body.innerHTML.trim()).toBe('');
    });

    it('should not remove anything when metadata section is not present', () => {
        document.body.innerHTML = `
            <div>
                <h4><span>Some other info</span></h4>
                <p>Some content</p>
            </div>
        `;

        handleUselessMetadataSection(document.body);

        expect(document.body.innerHTML.trim()).not.toBe('');
    });

    it('should not remove anything when metadataRemoved is true', () => {
        document.body.innerHTML = `
            <div>
                <h4><span>Metadata info</span></h4>
                <p>Some useless metadata</p>
            </div>
        `;

        orochiStore.setState({ metadataRemoved: true });

        handleUselessMetadataSection(document.body);

        expect(document.body.innerHTML.trim()).not.toBe('');
    });

    it('should handle malformed HTML structure', () => {
        document.body.innerHTML = `
            <div>
                <h4>Metadata info</h4>
                <p>Some useless metadata</p>
            </div>
        `;

        handleUselessMetadataSection(document.body);

        expect(document.body.innerHTML.trim()).not.toBe('');
    });
});
