import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import Toolbar from '@src/components/Toolbar';
import { describe, it, vi, beforeEach } from 'vitest';
import { globalStore, Process } from '@src/store/globalStore';
import { orochiStore } from '@src/store/orochiStore';
import { expect } from '@storybook/test';
import { pandaStore } from '@src/store/pandaStore';

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

    it.each(['Orochi', 'PANDA'] as Process[])(
        'displays the View Diff button for %s process',
        process => {
            globalStore.setState({ process });
            render(
                <Toolbar
                    toggleDiffView={mockToggleDiffView}
                    process={process}
                />
            );
            expect(screen.getByText('View Diff')).toBeInTheDocument();
        }
    );

    it.each(['Orochi', 'PANDA'] as Process[])(
        'calls toggleDiffView when View Diff button is clicked if it is enabled',
        process => {
            globalStore.setState({ process });

            // These must run after setting global store state due a subscription to state
            // changes in the global store
            if (process === 'Orochi') {
                orochiStore.setState({ originalCode: 'some code' });
            } else if (process === 'PANDA') {
                pandaStore.setState({ originalResponseMarkdown: 'some markdown' });
            }

            render(
                <Toolbar
                    toggleDiffView={mockToggleDiffView}
                    process={process}
                />
            );
            fireEvent.click(screen.getByText('View Diff'));

            expect(screen.getByText('View Diff')).toBeEnabled();
            expect(mockToggleDiffView).toHaveBeenCalledTimes(1);
        }
    );

    it.each(['Orochi', 'PANDA'] as Process[])(
        "doesn't call toggleDiffView when View Diff button is clicked if it is disabled",
        process => {
            globalStore.setState({ process });
            orochiStore.setState({ originalCode: undefined });
            render(
                <Toolbar
                    toggleDiffView={mockToggleDiffView}
                    process={process}
                />
            );
            fireEvent.click(screen.getByText('View Diff'));
            expect(screen.getByText('View Diff')).not.toBeEnabled();
            expect(mockToggleDiffView).not.toHaveBeenCalled();
        }
    );

    it.each(['Orochi', 'PANDA', 'Unknown'] as Process[])(
        'displays Check Response button only for Orochi process',
        process => {
            render(
                <Toolbar
                    toggleDiffView={mockToggleDiffView}
                    process={process}
                />
            );
            if (process === 'Orochi') {
                expect(screen.getByText('Check Response')).toBeInTheDocument();
            } else {
                expect(screen.queryByText('Check Response')).not.toBeInTheDocument();
            }
        }
    );

    // TODO: the dropdown is not visible to screen.getByText or .toBeInTheDocument
    // it('only displays the Conversation option in the Orochi process', () => {
    //     globalStore.setState({ process: 'Orochi' });
    //     orochiStore.setState({ language: 'python' });
    //     render(
    //         <Toolbar
    //             toggleDiffView={mockToggleDiffView}
    //             process='Orochi'
    //         />
    //     );
    //     fireEvent.click(screen.getByText('Copy'));

    //     expect(screen.getByText('Conversation')).toBeInTheDocument();
    // });

    it('does not display Conversation option when language is not python', () => {
        globalStore.setState({ process: 'Orochi' });
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
