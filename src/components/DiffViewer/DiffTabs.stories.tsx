import type { Meta, StoryObj } from '@storybook/react';

import React from 'react';

import { DiffTabs } from './DiffTabs';

const meta: Meta<typeof DiffTabs> = {
    title: 'Components/DiffTabs',
    component: DiffTabs,
    parameters: {
        layout: 'centered'
    }
};

export default meta;
type Story = StoryObj<typeof DiffTabs>;

const MockContainer: React.FC<React.PropsWithChildren<{ roundTop?: boolean }>> = ({
    children
}) => <div className='border p-4 rounded-b-md'>{children}</div>;

const BasicTabs = [
    { label: 'Tab 1', content: <div>Content for Tab 1</div> },
    { label: 'Tab 2', content: <div>Content for Tab 2</div> }
];

const CodeTabs = [
    {
        label: 'JavaScript',
        content: (
            <pre>
                <code>
                    {`function greet(name) {
  console.log(\`Hello, \${name}!\`);
}`}
                </code>
            </pre>
        )
    },
    {
        label: 'Python',
        content: (
            <pre>
                <code>
                    {`def greet(name):
    print(f"Hello, {name}!")
`}
                </code>
            </pre>
        )
    }
];

const LongContentTabs = [
    {
        label: 'Long Text',
        content: (
            <div style={{ height: '200px', overflow: 'auto' }}>
                {Array(20).fill('This is a long content tab. ').join('')}
            </div>
        )
    },
    { label: 'Short Text', content: <div>This is a short content tab.</div> }
];

export const Default: Story = {
    args: {
        tabs: BasicTabs,
        activeTab: 0,
        setActiveTab: () => {},
        containerComponent: MockContainer
    }
};

export const LongContent: Story = {
    args: {
        ...Default.args,
        tabs: LongContentTabs
    }
};

export const ManyTabs: Story = {
    args: {
        ...Default.args,
        tabs: [
            { label: 'Tab 1', content: <div>Content 1</div> },
            { label: 'Tab 2', content: <div>Content 2</div> },
            { label: 'Tab 3', content: <div>Content 3</div> },
            { label: 'Tab 4', content: <div>Content 4</div> },
            { label: 'Tab 5', content: <div>Content 5</div> }
        ]
    }
};

export const ActiveSecondTab: Story = {
    args: {
        ...Default.args,
        activeTab: 1
    }
};

export const CustomContainer: Story = {
    args: {
        ...Default.args,
        containerComponent: ({ children }) => (
            <div className='border-2 border-blue-500 p-4 rounded-md bg-gray-100'>
                {children}
            </div>
        )
    }
};
