import { editor } from 'monaco-editor';

declare global {
    interface Window {
        scriptInjected?: boolean;
        monaco: {
            editor: ReturnType<typeof editor.create> & {
                getEditors: () => readonly ICodeEditor[];
                __listenerAttached?: boolean;
            };
        };
    }
}
