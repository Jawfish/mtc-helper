import type { Meta, StoryObj } from '@storybook/react';

import Latex from './Latex';

const meta: Meta<typeof Latex> = {
    title: 'Components/Latex',
    component: Latex,
    argTypes: {
        content: { control: 'text' }
    }
};

export default meta;
type Story = StoryObj<typeof Latex>;

export const NoMath: Story = {
    args: {
        content: 'Content with no math'
    }
};

export const OnlyMath: Story = {
    args: {
        content:
            '$$f(x) = \\int_{-\\infty}^\\infty\\hat f(\\xi)\\,e^{2 \\pi i \\xi x}\\,d\\xi$$'
    }
};

// NOTE: the client requests that inline should use $$ instead of $.
export const InlineMath: Story = {
    args: {
        content: 'The quadratic formula is $$ax^2 + bx + c = 0$$.'
    }
};

export const LongContent: Story = {
    args: {
        content:
            "This is a long Latex content with inline math: $$E = mc^2$$. And here's a formula: \n$$\n\\frac{d}{dx}\\left( \\int_{0}^{x} f(u)\\,du\\right)=f(x)\n$$\n Here's another formula: \n$$\n\\int_{a}^{b} f'(x)\\,dx = f(b) - f(a)\n$$\n And some text after the formula."
    }
};

export const InvalidMath: Story = {
    args: {
        content: 'This is invalid LaTeX: $$\\frac{d}{dx$$'
    }
};
