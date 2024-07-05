import type { Meta, StoryObj } from '@storybook/react';

import { globalStore } from '@src/store/globalStore';
import { orochiStore } from '@src/store/orochiStore';

import { OrochiDiff } from './OrochiDiff';

const meta: Meta<typeof OrochiDiff> = {
    title: 'Components/OrochiDiff',
    component: OrochiDiff,
    decorators: [
        Story => (
            <div style={{ height: '100vh', width: '100vw' }}>
                <Story />
            </div>
        )
    ],
    parameters: {
        layout: 'fullscreen'
    }
};

export default meta;
type Story = StoryObj<typeof OrochiDiff>;

const setupStores = (
    originalCode: string,
    editedCode: string,
    modelResponse: string,
    operatorResponse: string
) => {
    globalStore.setState({ process: 'Orochi' });
    orochiStore.setState({
        originalCode,
        editedCode,
        modelResponse,
        operatorResponse
    });
};

export const Default: Story = {
    decorators: [
        Story => {
            setupStores(
                'function greeting() {\n  console.log("Hello");\n}',
                'function greeting(name) {\n  console.log(`Hello, ${name}!`);\n}',
                'This is the original response.',
                'This is the edited response with some changes.'
            );

            return <Story />;
        }
    ]
};

export const Long: Story = {
    decorators: [
        Story => {
            setupStores(
                'function greeting() {\n  console.log("Hello");\n}'.repeat(10),
                'function greeting(name) {\n  console.log(`Hello, ${name}!`);\n}'.repeat(
                    10
                ),
                'This is the original response.'.repeat(10),
                'This is the edited response with some changes.'.repeat(10)
            );

            return <Story />;
        }
    ]
};

export const Complex: Story = {
    decorators: [
        Story => {
            setupStores(
                `
function calculateArea(shape, dimensions) {
  if (shape === 'rectangle') {
    return dimensions.width * dimensions.height;
  } else if (shape === 'circle') {
    return Math.PI * dimensions.radius ** 2;
  }
  return 0;
}`,
                `
function calculateArea(shape, dimensions) {
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
}`,
                'The original function calculates area for rectangles and circles.',
                'The updated function adds support for triangles and includes error handling for unsupported shapes.'
            );

            return <Story />;
        }
    ]
};

export const Minimal: Story = {
    decorators: [
        Story => {
            setupStores(
                'const greeting = "Hello, World!";',
                'const greeting = "Hello, Universe!";',
                'A simple greeting string.',
                'Updated the greeting to be more inclusive.'
            );

            return <Story />;
        }
    ]
};

export const NoChanges: Story = {
    decorators: [
        Story => {
            const code = `
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`;
            setupStores(
                code,
                code,
                'This function calculates the nth Fibonacci number recursively.',
                'The code remains the same, but we could optimize it using dynamic programming for better performance.'
            );

            return <Story />;
        }
    ]
};
