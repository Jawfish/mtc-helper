import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { DiffViewer } from '@components/DiffViewer/DiffViewer';
import { describe, it, vi, beforeEach, afterEach } from 'vitest';
import { globalStore } from '@src/store/globalStore';
import { orochiStore } from '@src/store/orochiStore';
import { pandaStore } from '@src/store/pandaStore';
import { expect } from '@storybook/test';

vi.mock('@hooks/useKeyPress', () => ({
    default: vi.fn()
}));

describe('DiffViewer', () => {
    const mockToggleDiffView = vi.fn();

    beforeEach(() => {
        globalStore.setState({ process: 'Unknown' });
        orochiStore.setState({
            editedCode: 'edited code',
            originalCode: 'original code',
            editedResponse: 'edited response',
            originalResponse: 'original response'
        });
        pandaStore.setState({
            originalResponseMarkdown: 'original panda response'
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders without crashing', () => {
        render(<DiffViewer toggleDiffView={mockToggleDiffView} />);
    });

    it('displays the diff method selector', () => {
        render(<DiffViewer toggleDiffView={mockToggleDiffView} />);
        expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('displays the close button', () => {
        render(<DiffViewer toggleDiffView={mockToggleDiffView} />);
        expect(screen.getByText('Close')).toBeInTheDocument();
    });

    it('calls toggleDiffView when close button is clicked', () => {
        render(<DiffViewer toggleDiffView={mockToggleDiffView} />);
        fireEvent.click(screen.getByText('Close'));
        expect(mockToggleDiffView).toHaveBeenCalledTimes(1);
    });

    // TODO: figure out how to test Orochi diff (tab bar doesn't appear in DOM)
    // it('displays Orochi diff when process is Orochi', async () => {
    //     globalStore.setState({ process: 'Orochi' });
    //     render(<DiffViewer toggleDiffView={mockToggleDiffView} />);
    //     expect(screen.getByText('Code')).toBeInTheDocument();
    //     expect(screen.getByText('Full Response')).toBeInTheDocument();
    // });

    it('displays PANDA diff when process is PANDA', () => {
        globalStore.setState({ process: 'PANDA' });
        render(<DiffViewer toggleDiffView={mockToggleDiffView} />);
        expect(screen.queryByText('Code')).not.toBeInTheDocument();
        expect(screen.queryByText('Full Response')).not.toBeInTheDocument();
    });

    // TODO: figure out how to test radix select
    // it('changes diff method when selector is changed', () => {
    //     render(<DiffViewer toggleDiffView={mockToggleDiffView} />);
    //     fireEvent.click(screen.getByRole('combobox'));
    //     fireEvent.click(screen.getByText('Words'));
    //     expect(screen.getByRole('option', { name: 'Words' })).toHaveAttribute(
    //         'aria-selected',
    //         'true'
    //     );
    // });
});
