import { render, RenderResult, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { DiffViewer } from '@components/DiffViewer/DiffViewer';
import { describe, it, vi, beforeEach, afterEach } from 'vitest';
import { globalStore, Process } from '@src/store/globalStore';
import { orochiStore } from '@src/store/orochiStore';
import { generalStore } from '@src/store/generalStore';
import { expect } from '@storybook/test';
import { ToastProvider } from '@src/contexts/ToastContext';

const renderComponent = (): RenderResult => {
    return render(
        <ToastProvider>
            <DiffViewer />
        </ToastProvider>
    );
};

describe('DiffViewer', () => {
    beforeEach(() => {
        globalStore.setState({ process: 'General' });
        orochiStore.setState({
            operatorResponseCode: 'edited code',
            modelResponseCode: 'original code',
            operatorResponse: 'edited response',
            modelResponse: 'original response'
        });
        generalStore.setState({
            modelResponseMarkdown: 'original general response'
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it.each(['General', 'STEM', 'Orochi'] as Process[])(
        'displays the diff for the %s process without crashing',
        process => {
            globalStore.setState({ process });
            renderComponent();
        }
    );

    it('displays the diff method selector', () => {
        renderComponent();
        expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('displays the close button', () => {
        renderComponent();
        expect(screen.getByText('Close')).toBeInTheDocument();
    });
});
