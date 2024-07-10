import React from 'react';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@src/external/components/ui/tabs';
import clsx from 'clsx';

type Tab = {
    label: string;
    content: React.ReactNode;
};

type DiffTabsProps = {
    tabs: Tab[];
    activeTab: number;
    setActiveTab: (index: number) => void;
    containerComponent: React.ComponentType<
        React.PropsWithChildren<{ roundTop?: boolean }>
    >;
};

export const DiffTabs = ({
    tabs,
    activeTab,
    setActiveTab,
    containerComponent: ContainerComponent
}: DiffTabsProps) => (
    <Tabs
        defaultValue={`tab-${activeTab}`}
        onValueChange={value => setActiveTab(parseInt(value.split('-')[1]))}>
        <TabsList className='flex justify-start gap-0 p-0 shadow bg-mtc-faded mb-2 rounded-none rounded-t-md'>
            {tabs.map((tab, index) => (
                <TabsTrigger
                    key={index}
                    value={`tab-${index}`}
                    className={clsx(
                        'border-none h-full rounded-none shadow-none',
                        'data-[state=active]:bg-mtc-primary data-[state=active]:text-white',
                        'bg-mtc-faded text-mtc-primary cursor-pointer',
                        index === 0 && 'rounded-tl-md'
                    )}>
                    {tab.label}
                </TabsTrigger>
            ))}
        </TabsList>
        {tabs.map((tab, index) => (
            <TabsContent
                key={index}
                value={`tab-${index}`}>
                <ContainerComponent>{tab.content}</ContainerComponent>
            </TabsContent>
        ))}
    </Tabs>
);
