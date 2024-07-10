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
            editedCode: 'edited code',
            originalCode: 'original code',
            operatorResponse: 'edited response',
            modelResponse: 'original response'
        });
        generalStore.setState(state => ({
            ...state,
            selectedResponse: {
                ...state.selectedResponse,
                modelResponseMarkdown: 'original general response'
            }
        }));
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders without crashing', () => {
        renderComponent();
    });

    it('displays the diff method selector', () => {
        renderComponent();
        expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('displays the close button', () => {
        renderComponent();
        expect(screen.getByText('Close')).toBeInTheDocument();
    });

    it.each(['General', 'STEM'] as Process[])(
        'displays General diff when process is not Orochi',
        process => {
            globalStore.setState({ process });
            renderComponent();
            expect(screen.queryByText('Code')).not.toBeInTheDocument();
            expect(screen.queryByText('Full Response')).not.toBeInTheDocument();
            // "Markdown" is the name of the default tab
            expect(screen.queryByText('Markdown')).toBeInTheDocument();
        }
    );

    it('displays Orochi diff when process is Orochi', async () => {
        globalStore.setState({ process: 'Orochi' });
        renderComponent();
        expect(screen.getByText('Code')).toBeInTheDocument();
        expect(screen.getByText('Full Response')).toBeInTheDocument();
    });

    // TODO: figure out how to test radix select
    // it('changes diff method when selector is changed', () => {
    //     render(<DiffViewer  />);
    //     fireEvent.click(screen.getByRole('combobox'));
    //     fireEvent.click(screen.getByText('Words'));
    //     expect(screen.getByRole('option', { name: 'Words' })).toHaveAttribute(
    //         'aria-selected',
    //         'true'
    //     );
    // });
});
