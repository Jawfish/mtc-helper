import { describe, it, expect, vi, beforeEach } from 'vitest';
import { orochiStore } from '@src/store/orochiStore';

import { handleUsefulMetadataSection } from './usefulMetadata';

describe('handleUsefulMetadataSection', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        orochiStore.getState().reset();
        document.body.innerHTML = '';
    });

    it('should set operatorNotes, conversationTitle, and errorLabels when all elements are present', () => {
        document.body.innerHTML = `
<div>
  <div>
    <div>Conversations > Title</div>
    <div>
      <div>
        <p>some_title</p>
      </div>
    </div>
  </div>
  <div>
    <div>Conversations > Error Labels</div>
    <div>
      <div>
        <p>Dependency Error,Fails Unit Test</p>
      </div>
    </div>
  </div>
  <div>
    <div>Conversations > Operator Notes</div>
    <div>
      <div>
        <ol>
          <li>Removed the use of external libraries.</li>
          <li>Improved Validation.</li>
        </ol>
      </div>
    </div>
  </div>
</div>`;

        handleUsefulMetadataSection(document.body);

        expect(orochiStore.getState().errorLabels?.trim()).toBe(
            'Dependency Error,Fails Unit Test'
        );
        expect(orochiStore.getState().conversationTitle?.trim()).toBe('some_title');
        expect(orochiStore.getState().operatorNotes?.trim()).toContain(
            '- Removed the use of external libraries.'
        );
        expect(orochiStore.getState().operatorNotes?.trim()).toContain(
            '- Improved Validation.'
        );
    });

    it('should handle empty document body', () => {
        document.body.innerHTML = '';
        handleUsefulMetadataSection(document.body);
        expect(orochiStore.getState().errorLabels).toBeNull();
        expect(orochiStore.getState().conversationTitle).toBeNull();
        expect(orochiStore.getState().operatorNotes).toBeNull();
    });

    it('should handle missing elements', () => {
        document.body.innerHTML = `
      <div>
        <div>
          <div>Conversations > Title</div>
          <div>
            <div>
              <p>some_title</p>
            </div>
          </div>
        </div>
      </div>`;

        handleUsefulMetadataSection(document.body);

        expect(orochiStore.getState().errorLabels).toBeNull();
        expect(orochiStore.getState().conversationTitle?.trim()).toBe('some_title');
        expect(orochiStore.getState().operatorNotes).toBeNull();
    });

    it('should handle malformed HTML structure', () => {
        document.body.innerHTML = `
      <div>
        <div>Conversations > Title</div>
        <p>some_title</p>
      </div>`;

        handleUsefulMetadataSection(document.body);

        expect(orochiStore.getState().errorLabels).toBeNull();
        expect(orochiStore.getState().conversationTitle).toBeNull();
        expect(orochiStore.getState().operatorNotes).toBeNull();
    });
});
