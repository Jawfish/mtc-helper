import { describe, expect, it } from 'vitest';

import { adjustLatexDelimiters } from './Latex';

describe('Converting $$-wrapped in-line LaTeX to $-wrapped LaTeX', () => {
    it('replaces $$ with $ when the LaTeX is in-line', () => {
        const input = 'The quadratic formula is $$ax^2 + bx + c = 0$$.';
        const expected = 'The quadratic formula is $ax^2 + bx + c = 0$.';
        expect(adjustLatexDelimiters(input)).toBe(expected);
    });

    it('does not replace $$ with $ when the LaTeX is on its own line', () => {
        const input = 'The quadratic formula is\n$$\nax^2 + bx + c = 0\n$$\n.';
        expect(adjustLatexDelimiters(input)).toBe(input);
    });

    it('replaces multiple instances of $$ with $ in a single line', () => {
        const input =
            'The quadratic formula is $$ax^2 + bx + c = 0$$. $$f(x) = mx + b$$.';
        const expected =
            'The quadratic formula is $ax^2 + bx + c = 0$. $f(x) = mx + b$.';
        expect(adjustLatexDelimiters(input)).toBe(expected);
    });
});
