import { describe, it, expect, beforeEach } from 'vitest';
import { orochiStore } from '@src/store/orochiStore';

import { onMut_languageMetadata_updateLanguage } from './onMut_orochiLanguageMetadata_updateOrochiLanguageState';

describe('handleLanguageMutation', () => {
    beforeEach(() => {
        orochiStore.getState().reset();
        document.body.innerHTML = '';
    });

    it('should set language to python when "Programming Language:Python" is present', () => {
        document.body.innerHTML = `
            <div>
                <div>Programming Language:Python</div>
            </div>
        `;
        onMut_languageMetadata_updateLanguage(document.body);
        // expect(orochiStore.setState).toHaveBeenCalledWith({ language: 'python' });
        expect(orochiStore.getState().language).toBe('python');
    });

    it('should set language to python when "Programming Language*Python" is present', () => {
        document.body.innerHTML = `
            <div>
                <div>Programming Language*Python</div>
            </div>
        `;
        onMut_languageMetadata_updateLanguage(document.body);
        // expect(orochiStore.setState).toHaveBeenCalledWith({ language: 'python' });
        expect(orochiStore.getState().language).toBe('python');
    });

    it('should set language to python when code element has "language-python" class', () => {
        document.body.innerHTML = `
            <div>
                <div class="rounded-xl bg-pink-100">
                    <pre>
                        <code class="language-python">print("Hello, World!")</code>
                    </pre>
                </div>
            </div>
        `;
        onMut_languageMetadata_updateLanguage(document.body);
        // expect(orochiStore.setState).toHaveBeenCalledWith({ language: 'python' });
        expect(orochiStore.getState().language).toBe('python');
    });

    it('should set language to python when Tests section contains "Python"', () => {
        document.body.innerHTML = `
            <div>
                <div>
                    <div>Tests*</div>
                    <div>This is a Python test</div>
                </div>
            </div>
        `;
        onMut_languageMetadata_updateLanguage(document.body);
        // expect(orochiStore.setState).toHaveBeenCalledWith({ language: 'python' });
        expect(orochiStore.getState().language).toBe('python');
    });

    it('should not set language when no Python indicators are present', () => {
        document.body.innerHTML = `
            <div>
                <div>Programming Language: JavaScript</div>
            </div>
        `;
        onMut_languageMetadata_updateLanguage(document.body);
        expect(orochiStore.getState().language).toBe('unknown');
    });

    it('should handle empty container', () => {
        document.body.innerHTML = '';
        onMut_languageMetadata_updateLanguage(document.body);
        expect(orochiStore.getState().language).toBe('unknown');
    });

    it('should handle container with unrelated content', () => {
        document.body.innerHTML = `
            <div>
                <div>Unrelated content</div>
                <div>More unrelated content</div>
            </div>
        `;
        onMut_languageMetadata_updateLanguage(document.body);
        expect(orochiStore.getState().language).toBe('unknown');
    });
});
