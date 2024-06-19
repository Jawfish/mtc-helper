import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Logger from '@lib/logging';

import { validatePython } from './validatePython';

vi.mock('@lib/logging');

describe('validatePython', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('warns about long lines', () => {
        const indent = '    ';
        const code = indent.concat('a'.repeat(241));
        const messages = validatePython(code);
        expect(messages.length).toBe(1);
        expect(messages[0]).toContain('suspiciously long');
        expect(Logger.debug).toHaveBeenCalledWith(
            expect.stringContaining('suspiciously long')
        );
    });

    it('warns about non-indented lines', () => {
        const code = 'not indented line';
        const messages = validatePython(code);
        expect(messages.length).toBe(1);
        expect(messages[0]).toContain('non-indented line');
        expect(Logger.debug).toHaveBeenCalledWith(
            expect.stringContaining('non-indented line')
        );
    });

    it('ignores indented lines', () => {
        const code = '    indented line';
        const messages = validatePython(code);
        expect(messages.length).toBe(0);
        expect(Logger.debug).not.toHaveBeenCalled();
    });

    it('warns about inline comments', () => {
        const code = '    code # inline comment';
        const messages = validatePython(code);
        expect(messages.length).toBe(1);
        expect(messages[0]).toContain('inline comment');
        expect(Logger.debug).toHaveBeenCalledWith(
            expect.stringContaining('inline comment')
        );
    });

    it('ignores empty lines', () => {
        const code = '\n\n    code\n\n';
        const messages = validatePython(code);
        expect(messages.length).toBe(0);
        expect(Logger.debug).not.toHaveBeenCalled();
    });

    it('ignores constants', () => {
        const code = 'CONSTANT_VALUE = 42';
        const messages = validatePython(code);
        expect(messages.length).toBe(0);
        expect(Logger.debug).not.toHaveBeenCalled();
    });

    it('ignores imports', () => {
        const code = 'import os\nfrom datetime import datetime';
        const messages = validatePython(code);
        expect(messages.length).toBe(0);
        expect(Logger.debug).not.toHaveBeenCalled();
    });

    it('ignores function and class definitions', () => {
        const code =
            'def function():\n    pass\n\nclass MyClass:\n    pass\n\n@decorator\ndef decorated():\n    pass\n\nasync def async_function():\n    pass';
        const messages = validatePython(code);
        expect(messages.length).toBe(0);
        expect(Logger.debug).not.toHaveBeenCalled();
    });

    it('ignores multiline function definitions', () => {
        const code =
            'def long_function(\n        param1: int,\n        param2: str\n) -> None:\n    pass';
        const messages = validatePython(code);
        expect(messages.length).toBe(0);
        expect(Logger.debug).not.toHaveBeenCalled();
    });

    it('handles multiple validation issues', () => {
        const code = `unindented\n    very_long_line${'a'.repeat(240)}\n    code # comment`;
        const messages = validatePython(code);
        expect(messages.length).toBe(3);
        expect(messages[0]).toContain('non-indented line');
        expect(messages[1]).toContain('suspiciously long');
        expect(messages[2]).toContain('inline comment');
        expect(Logger.debug).toHaveBeenCalledTimes(3);
    });

    it('ignores multiple constants on separate lines', () => {
        const code = 'CONSTANT_ONE = 1\nCONSTANT_TWO = 2\nCONSTANT_THREE = 3';
        const messages = validatePython(code);
        expect(messages.length).toBe(0);
        expect(Logger.debug).not.toHaveBeenCalled();
    });

    it('ignores nested function definitions', () => {
        const code = `
def outer_function():
    def inner_function():
        pass
    return inner_function
        `;
        const messages = validatePython(code);
        expect(messages.length).toBe(0);
        expect(Logger.debug).not.toHaveBeenCalled();
    });

    it('ignores list comprehensions and generator expressions', () => {
        const code = `
    squares = [x**2 for x in range(10)]
    even_squares = (x**2 for x in range(10) if x % 2 == 0)
        `;
        const messages = validatePython(code);
        expect(messages.length).toBe(0);
        expect(Logger.debug).not.toHaveBeenCalled();
    });

    it('ignores lambda functions', () => {
        const code = `
    square = lambda x: x**2
    result = (lambda x, y: x + y)(3, 4)
        `;
        const messages = validatePython(code);
        expect(messages.length).toBe(0);
        expect(Logger.debug).not.toHaveBeenCalled();
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
        const messages = validatePython(code);
        expect(messages.length).toBe(0);
        expect(Logger.debug).not.toHaveBeenCalled();
    });

    it('ignores with statements', () => {
        const code = `
with open('file.txt', 'r') as f:
    content = f.read()
        `;
        const messages = validatePython(code);
        expect(messages.length).toBe(0);
        expect(Logger.debug).not.toHaveBeenCalled();
    });

    it('ignores multiple decorators', () => {
        const code = `
@decorator1
@decorator2
@decorator3
def decorated_function():
    pass
        `;
        const messages = validatePython(code);
        expect(messages.length).toBe(0);
        expect(Logger.debug).not.toHaveBeenCalled();
    });
});
