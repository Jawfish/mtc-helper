import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import Toolbar from '@src/components/Toolbar';
import { describe, it, vi, beforeEach, afterEach } from 'vitest';
import { globalStore } from '@src/store/globalStore';
import { orochiStore } from '@src/store/orochiStore';
import { expect } from '@storybook/test';

vi.mock('@hooks/useOrochiActions', () => ({
    useOrochiActions: () => ({
        copyEditedCode: vi.fn(),
        copyOriginalCode: vi.fn(),
        copyTests: vi.fn(),
        copyAllAsPython: vi.fn(),
        copyPrompt: vi.fn()
    })
}));

vi.mock('@hooks/useTask', () => ({
    useTask: () => ({
        copyOperatorEmail: vi.fn(),
        copyTaskId: vi.fn()
    })
}));

vi.mock('@hooks/useValidation', () => ({
    useValidation: () => ({
        validateResponse: vi.fn()
    })
}));

// TODO: figure out how to test the radix dropdown
describe('Toolbar', () => {
    const mockToggleDiffView = vi.fn();

    beforeEach(() => {
        globalStore.setState({ process: 'Unknown' });
        orochiStore.getState().reset();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders without crashing', () => {
        render(
            <Toolbar
                toggleDiffView={mockToggleDiffView}
                process='Unknown'
            />
        );
    });

    it('displays the Copy dropdown', () => {
        render(
            <Toolbar
                toggleDiffView={mockToggleDiffView}
                process='Unknown'
            />
        );
        expect(screen.getByText('Copy')).toBeInTheDocument();
    });

    it('displays the View Diff button', () => {
        render(
            <Toolbar
                toggleDiffView={mockToggleDiffView}
                process='Unknown'
            />
        );
        expect(screen.getByText('View Diff')).toBeInTheDocument();
    });

    it('calls toggleDiffView when View Diff button is clicked if it is enabled', () => {
        orochiStore.setState({ originalCode: 'some code' });
        render(
            <Toolbar
                toggleDiffView={mockToggleDiffView}
                process='Unknown'
            />
        );
        fireEvent.click(screen.getByText('View Diff'));
        expect(mockToggleDiffView).toHaveBeenCalledTimes(1);
    });

    it("doesn't call toggleDiffView when View Diff button is clicked if it is disabled", () => {
        orochiStore.setState({ originalCode: undefined });
        render(
            <Toolbar
                toggleDiffView={mockToggleDiffView}
                process='Unknown'
            />
        );
        fireEvent.click(screen.getByText('View Diff'));
        expect(mockToggleDiffView).not.toHaveBeenCalled();
    });

    it('displays Check Response button only for Orochi process', () => {
        const { rerender } = render(
            <Toolbar
                toggleDiffView={mockToggleDiffView}
                process='Unknown'
            />
        );
        expect(screen.queryByText('Check Response')).not.toBeInTheDocument();

        rerender(
            <Toolbar
                toggleDiffView={mockToggleDiffView}
                process='Orochi'
            />
        );
        expect(screen.getByText('Check Response')).toBeInTheDocument();
    });

    it('does not display Conversation option when language is not python', async () => {
        orochiStore.setState({ language: 'unknown' });
        render(
            <Toolbar
                toggleDiffView={mockToggleDiffView}
                process='Orochi'
            />
        );
        fireEvent.click(screen.getByText('Copy'));

        expect(screen.queryByText('Conversation')).not.toBeInTheDocument();
    });
});
