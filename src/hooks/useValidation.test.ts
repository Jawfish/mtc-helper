import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { useValidation } from '@hooks/useValidation';
import * as helpers from '@lib/textProcessing';
import { useToast } from '@src/contexts/ToastContext';
import { orochiStore } from '@src/store/orochiStore';

vi.mock('@src/contexts/ToastContext', () => {
    const mockNotify = vi.fn();

    return {
        ToastContext: {
            Provider: ({ children }: { children: React.ReactNode }) => children
        },
        useToast: () => ({ notify: mockNotify })
    };
});

describe('response validation', () => {
    afterEach(() => {
        orochiStore.getState().reset();
        vi.clearAllMocks();
        vi.resetAllMocks();
    });

    it('returns functions for validating a full response and validating code by itself', () => {
        const { result } = renderHook(() => useValidation());
        expect(typeof result.current.validateResponse).toBe('function');
        expect(typeof result.current.validateCode).toBe('function');
    });

    it('indicates when code could not be found', () => {
        const { result } = renderHook(() => useValidation());
        const messages = result.current.validateCode(undefined);
        expect(messages).toEqual(['No code found.']);
    });

    it('does not indicate code could not be found if it is present', () => {
        orochiStore.setState({ operatorResponseCode: 'some code' });
        const { result } = renderHook(() => useValidation());
        const messages = result.current.validateCode('some code');
        expect(messages).toEqual([]);
    });

    it('detects markdown fence closing issues', () => {
        vi.spyOn(helpers, 'codeContainsMarkdownFence').mockReturnValue(true);
        const { result } = renderHook(() => useValidation());
        const messages = result.current.validateCode('some code```');
        expect(messages).toContain(
            'Code block appears to be improperly opened or closed.'
        );
    });

    it('detects markdown fence opening issues', () => {
        vi.spyOn(helpers, 'codeContainsMarkdownFence').mockReturnValue(true);
        const { result } = renderHook(() => useValidation());
        const messages = result.current.validateCode('```some code');
        expect(messages).toContain(
            'Code block appears to be improperly opened or closed.'
        );
    });

    it('detects markdown fence issues when code contains multiple lines', () => {
        vi.spyOn(helpers, 'codeContainsMarkdownFence').mockReturnValue(true);
        const { result } = renderHook(() => useValidation());
        const messages = result.current.validateCode('some code\n\na```');
        expect(messages).toContain(
            'Code block appears to be improperly opened or closed.'
        );
    });

    it('detects HTML in code', () => {
        vi.spyOn(helpers, 'codeContainsHtml').mockReturnValue(true);
        const { result } = renderHook(() => useValidation());
        const messages = result.current.validateCode('<div>some html</div>');
        expect(messages).toContain('The bot response appears to contain HTML.');
    });

    it('notifies with success when no issues are found', async () => {
        orochiStore.setState({
            operatorResponseCode: 'def valid_python():',
            language: 'python'
        });

        const { result } = renderHook(() => useValidation());

        await act(async () => {
            result.current.validateResponse();
        });
        const mockNotify = vi.mocked(useToast().notify);
        expect(mockNotify).toHaveBeenCalledWith('No issues detected.', 'success');
    });
});

describe('validating python', () => {
    beforeEach(() => {
        orochiStore.setState({ language: 'python' });
    });

    afterEach(() => {
        orochiStore.getState().reset();
        vi.clearAllMocks();
        vi.resetAllMocks();
    });

    it('warns about long lines', () => {
        const indent = '    ';
        const code = indent.concat('a'.repeat(241));

        const { result } = renderHook(() => useValidation());
        const messages = result.current.validateCode(code);

        expect(messages.length).toBe(1);
        expect(messages[0]).toContain('suspiciously long');
    });

    it('warns about non-indented lines', () => {
        const code = 'not indented line';

        const { result } = renderHook(() => useValidation());
        const messages = result.current.validateCode(code);

        expect(messages.length).toBe(1);
        expect(messages[0]).toContain('non-indented line');
    });

    it('ignores indented lines', () => {
        const code = '    indented line';

        const { result } = renderHook(() => useValidation());
        const messages = result.current.validateCode(code);

        expect(messages.length).toBe(0);
    });

    it('warns about inline comments', () => {
        const code = '    code # inline comment';

        const { result } = renderHook(() => useValidation());
        const messages = result.current.validateCode(code);

        expect(messages.length).toBe(1);
        expect(messages[0]).toContain('inline comment');
    });

    it('ignores empty lines', () => {
        const code = '\n\n    code\n\n';

        const { result } = renderHook(() => useValidation());
        const messages = result.current.validateCode(code);

        expect(messages.length).toBe(0);
    });

    it('ignores constants', () => {
        const code = 'CONSTANT_VALUE = 42';

        const { result } = renderHook(() => useValidation());
        const messages = result.current.validateCode(code);

        expect(messages.length).toBe(0);
    });

    it('ignores imports', () => {
        const code = 'import os\nfrom datetime import datetime';

        const { result } = renderHook(() => useValidation());
        const messages = result.current.validateCode(code);

        expect(messages.length).toBe(0);
    });

    it('ignores function and class definitions', () => {
        const code =
            'def function():\n    pass\n\nclass MyClass:\n    pass\n\n@decorator\ndef decorated():\n    pass\n\nasync def async_function():\n    pass';

        const { result } = renderHook(() => useValidation());
        const messages = result.current.validateCode(code);

        expect(messages.length).toBe(0);
    });

    it('ignores multiline function definitions', () => {
        const code =
            'def long_function(\n        param1: int,\n        param2: str\n) -> None:\n    pass';

        const { result } = renderHook(() => useValidation());
        const messages = result.current.validateCode(code);

        expect(messages.length).toBe(0);
    });

    it('handles multiple validation issues', () => {
        const code = `unindented\n    very_long_line${'a'.repeat(240)}\n    code # comment`;

        const { result } = renderHook(() => useValidation());
        const messages = result.current.validateCode(code);

        expect(messages.length).toBe(3);
        expect(messages[0]).toContain('non-indented line');
        expect(messages[1]).toContain('suspiciously long');
        expect(messages[2]).toContain('inline comment');
    });

    it('ignores multiple constants on separate lines', () => {
        const code = 'CONSTANT_ONE = 1\nCONSTANT_TWO = 2\nCONSTANT_THREE = 3';

        const { result } = renderHook(() => useValidation());
        const messages = result.current.validateCode(code);

        expect(messages.length).toBe(0);
    });

    it('ignores nested function definitions', () => {
        const code = `
def outer_function():
    def inner_function():
        pass
    return inner_function
        `;

        const { result } = renderHook(() => useValidation());
        const messages = result.current.validateCode(code);

        expect(messages.length).toBe(0);
    });

    it('ignores list comprehensions and generator expressions', () => {
        const code = `
    squares = [x**2 for x in range(10)]
    even_squares = (x**2 for x in range(10) if x % 2 == 0)
        `;

        const { result } = renderHook(() => useValidation());
        const messages = result.current.validateCode(code);

        expect(messages.length).toBe(0);
    });

    it('ignores lambda functions', () => {
        const code = `
    square = lambda x: x**2
    result = (lambda x, y: x + y)(3, 4)
        `;

        const { result } = renderHook(() => useValidation());
        const messages = result.current.validateCode(code);

        expect(messages.length).toBe(0);
    });

    it('ignores try/except blocks', () => {
        const code = `
try:
    risky_operation()
except Exception as e:
    handle_error(e)
finally:
    cleanup()
        `;

        const { result } = renderHook(() => useValidation());
        const messages = result.current.validateCode(code);

        expect(messages.length).toBe(0);
    });

    it('ignores with statements', () => {
        const code = `
with open('file.txt', 'r') as f:
    content = f.read()
        `;

        const { result } = renderHook(() => useValidation());
        const messages = result.current.validateCode(code);

        expect(messages.length).toBe(0);
    });

    it('ignores multiple decorators', () => {
        const code = `
@decorator1
@decorator2
@decorator3
def decorated_function():
    pass
        `;

        const { result } = renderHook(() => useValidation());
        const messages = result.current.validateCode(code);

        expect(messages.length).toBe(0);
    });
});
