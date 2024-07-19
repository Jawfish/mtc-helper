import type { Meta, StoryObj } from '@storybook/react';

import { DiffMethod } from 'react-diff-viewer-continued';
import { fn } from '@storybook/test';
import { globalStore } from '@src/store/globalStore';
import { orochiStore } from '@src/store/orochiStore';
import { genericProcessStore } from '@src/store/genericProcessStore';
import { ToastProvider } from '@src/contexts/ToastContext';

import { DiffViewer } from './DiffViewer';

const meta: Meta<typeof DiffViewer> = {
    title: 'Components/DiffViewer',
    component: DiffViewer,
    decorators: [
        Story => (
            <ToastProvider>
                <div style={{ height: '100vh', width: '100vw' }}>
                    <Story />
                </div>
            </ToastProvider>
        )
    ],
    parameters: {
        layout: 'fullscreen'
    },
    argTypes: {
        diffMethod: {
            control: { type: 'select' },
            options: Object.values(DiffMethod)
        },
        disableWordDiff: {
            control: 'boolean'
        }
    }
};

export default meta;
type Story = StoryObj<typeof DiffViewer>;

const setupStores = (
    process: 'Orochi' | 'Generic' | 'STEM',
    modelResponse: string,
    operatorResponse: string,
    modelResponseCode?: string,
    operatorResponseCode?: string
) => {
    globalStore.setState({ process });
    if (process === 'Orochi') {
        orochiStore.setState({
            modelResponseCode: modelResponseCode || modelResponse,
            operatorResponseCode: operatorResponseCode || operatorResponse,
            modelResponse,
            operatorResponse
        });
    } else {
        genericProcessStore.setState({
            modelResponseMarkdown: modelResponse,
            operatorResponseMarkdown: operatorResponse
        });
    }
};

export const OrochiDiffShort: Story = {
    args: {
        toggleDiffView: fn().mockName('toggleDiffView')
    },
    decorators: [
        Story => {
            setupStores(
                'Orochi',
                'This is the original response.\nfunction greeting() {\n  console.log("Hello");\n}',
                'This is the edited response with some changes.\nfunction greeting(name) {\n  console.log(`Hello, ${name}!`);\n}',
                'function greeting() {\n  console.log("Hello");\n}',
                'function greeting(name) {\n  console.log(`Hello, ${name}!`);\n}'
            );

            return <Story />;
        }
    ]
};

export const OrochiDiffLong: Story = {
    args: {
        toggleDiffView: fn().mockName('toggleDiffView')
    },
    decorators: [
        Story => {
            setupStores(
                'Orochi',
                'This is the original response.\n\n'.repeat(25),
                'This is the edited response with some changes.\n\n'.repeat(25),
                'function greeting() {\n  console.log("Hello");\n}\n\n'.repeat(25),
                'function greeting(name) {\n  console.log(`Hello, ${name}!`);\n}\n\n'.repeat(
                    25
                )
            );

            return <Story />;
        }
    ]
};

export const GenericDiffShort: Story = {
    args: {
        toggleDiffView: fn().mockName('toggleDiffView')
    },
    decorators: [
        Story => {
            setupStores(
                'Generic',
                'This is the original response.',
                'This is the edited response with some changes.'
            );

            return <Story />;
        }
    ]
};

export const GenericDiffMarkdown: Story = {
    args: {
        toggleDiffView: fn().mockName('toggleDiffView')
    },
    decorators: [
        Story => {
            setupStores(
                'Generic',
                '# Title\nBaragraph Bith **bold** and *bitalic* bext.\n\n- Item 1\n- Bitem 2',
                '# Title\nParagraph with **bold** and *italic* text.\n\n- Item 1\n- Item 2'
            );

            return <Story />;
        }
    ]
};

export const GenericDiffLong: Story = {
    args: {
        toggleDiffView: fn().mockName('toggleDiffView')
    },
    decorators: [
        Story => {
            setupStores(
                'Generic',
                'This is the original response.\n\n'.repeat(25),
                'This is the edited response with some changes.\n\n'.repeat(25)
            );

            return <Story />;
        }
    ]
};

export const GenericDiffRTL: Story = {
    args: {
        toggleDiffView: fn().mockName('toggleDiffView')
    },
    decorators: [
        Story => {
            setupStores(
                'Generic',
                '10. بريتوريا (العاصمة التنفيذية) بلومفونتين (العاصمة القضائية) كيب تاون (العاصمة التشريعية)، جنوب أفريقيا ',
                '10. بريتوريا، جنوب أفريقيا'
            );

            return <Story />;
        }
    ]
};

export const STEMDiff: Story = {
    args: {
        toggleDiffView: fn().mockName('toggleDiffView')
    },
    decorators: [
        Story => {
            setupStores(
                'STEM',
                'This is the edited response with some changes.',
                `Here is the mathematical expression 3*9 written in LaTeX:
\`\`\`
$3 \\times 9$
\`\`\``
            );

            return <Story />;
        }
    ]
};

export const EmptyDiff: Story = {
    args: {
        toggleDiffView: fn().mockName('toggleDiffView')
    },
    decorators: [
        Story => {
            setupStores('Generic', '', '');

            return <Story />;
        }
    ]
};

export const DifferentDiffMethod: Story = {
    args: {
        toggleDiffView: fn().mockName('toggleDiffView')
    },
    decorators: [
        Story => {
            setupStores(
                'Generic',
                '# Original Heading\n\nThis is the original content.',
                '# Modified Heading\n\nThis is the modified content with some changes.'
            );

            return <Story />;
        }
    ]
};

export const WordDiffDisabled: Story = {
    args: {
        toggleDiffView: fn().mockName('toggleDiffView')
    },
    decorators: [
        Story => {
            setupStores(
                'Generic',
                '# Original Heading\n\nThis is the original content.',
                '# Modified Heading\n\nThis is the modified content with some changes.'
            );

            return <Story />;
        }
    ]
};

export const OrochiComplex: Story = {
    args: {
        toggleDiffView: fn().mockName('toggleDiffView')
    },
    decorators: [
        Story => {
            setupStores(
                'Orochi',
                'Placeholder without code (not representative of MTC).',
                'Placeholder without code (also not representative of MTC).',
                `function calculateArea(shape, dimensions) {
  if (shape === 'rectangle') {
    return dimensions.width * dimensions.height;
  } else if (shape === 'circle') {
    return Math.PI * dimensions.radius ** 2;
  }
  return 0;
}`,
                `function calculateArea(shape, dimensions) {
  switch (shape) {
    case 'rectangle':
      return dimensions.width * dimensions.height;
    case 'circle':
      return Math.PI * dimensions.radius ** 2;
    case 'triangle':
      return 0.5 * dimensions.base * dimensions.height;
    default:
      throw new Error('Unsupported shape');
  }
}`
            );

            return <Story />;
        }
    ]
};
