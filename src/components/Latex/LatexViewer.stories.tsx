import type { Meta, StoryObj } from '@storybook/react';

import React from 'react';
import { generalStore } from '@src/store/generalStore';

import LatexViewer from './LatexViewer';

const meta: Meta<typeof LatexViewer> = {
    title: 'Components/LatexViewer',
    component: LatexViewer,
    decorators: [
        Story => (
            <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
                <Story />
            </div>
        )
    ],
    argTypes: {
        content: {
            control: 'text',
            description: 'The LaTeX content to be rendered'
        }
    }
};

export default meta;

type Story = StoryObj<typeof LatexViewer>;

const LatexViewerWithStore: React.FC<{ content: string }> = ({ content }) => {
    React.useEffect(() => {
        generalStore.setState(state => ({
            ...state,
            selectedResponse: {
                ...state.selectedResponse,
                operatorResponseMarkdown: content
            }
        }));
    }, [content]);

    return <LatexViewer />;
};

const Template: Story = {
    render: args => (
        <LatexViewerWithStore
            content={''}
            {...args}
        />
    )
};

export const Default: Story = {
    ...Template,
    args: {
        content: 'This is a default LaTeX content with an equation: $$E = mc^2$$'
    }
};

export const LongContent: Story = {
    ...Template,
    args: {
        content: `
    This is a long LaTeX content with multiple equations:
    $$\\frac{d}{dx}\\left( \\int_{0}^{x} f(u)\\,du\\right)=f(x)$$
    And here's another one:
    $$\\int_{a}^{b} f'(x)\\,dx = f(b) - f(a)$$`
    }
};

export const ComplexMath: Story = {
    ...Template,
    args: {
        content: `
    Here's a more complex mathematical expression:
    $$\\sum_{n=1}^\\infty \\frac{1}{n^2} = \\frac{\\pi^2}{6}$$
    And another one:
    $$\\oint_C \\mathbf{B} \\cdot d\\mathbf{l} = \\mu_0 \\left(I_{\\text{enc}} + \\varepsilon_0 \\frac{d\\Phi_E}{dt}\\right)$$
  `
    }
};

export const Markdown: Story = {
    ...Template,
    args: {
        content: `
    This story demonstrates a mix of text and LaTeX:
    Regular text can be mixed with inline equations like $$a^2 + b^2 = c^2$$.
    Or you can have block equations:
    $$\\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t}$$
    Followed by more text and another equation:
    $$\\nabla \\cdot \\mathbf{E} = \\frac{\\rho}{\\varepsilon_0}$$
    *Let's evaluate the student's work!*
    1. **Correct**: $$1$$ point
    2. **Correct**: $$1$$ point
    3. **Incorrect**
    4. **Incorrect**
    5. **Correct**: $$1$$ point
    In total, that's $$\\boxed{3}$$ out of $$5\\, .$$
    *There is room for improvement!*
  `
    }
};
