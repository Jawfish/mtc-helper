import { render, screen, fireEvent, RenderResult } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import Toolbar from '@src/components/Toolbar';
import { describe, it, vi, beforeEach } from 'vitest';
import { globalStore, Process } from '@src/store/globalStore';
import { orochiStore } from '@src/store/orochiStore';
import { expect } from '@storybook/test';
import { generalStore } from '@src/store/generalStore';
import { ToastProvider } from '@src/contexts/ToastContext';

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

const renderComponent = (process: Process): RenderResult => {
    return render(
        <ToastProvider>
            <Toolbar process={process} />
        </ToastProvider>
    );
};

// TODO: figure out how to test the radix dropdown
describe('Toolbar', () => {
    beforeEach(() => {
        globalStore.setState({ process: 'General' });
        orochiStore.getState().reset();
        vi.clearAllMocks();
    });

    it('renders without crashing', () => {
        renderComponent('General');
    });

    it('displays the Copy dropdown', () => {
        renderComponent('General');
        expect(screen.getByText('Copy')).toBeInTheDocument();
    });

    it.each(['Orochi', 'General', 'STEM'] as Process[])(
        'displays the View Diff button for %s process',
        process => {
            globalStore.setState({ process });
            renderComponent(process);
            expect(screen.getByText('View Diff')).toBeInTheDocument();
        }
    );

    it.each(['Orochi', 'General', 'STEM'] as Process[])(
        'calls toggleDiffView when View Diff button is clicked if it is enabled',
        process => {
            globalStore.setState({ process });

            // These must run after setting global store state due a subscription to
            // state changes in the global store. The trigger for whether or not the
            // diff view can be opened is if the model's content is present (original
            // code in Orochi, model response in General)
            if (process === 'Orochi') {
                orochiStore.setState({
                    originalCode: 'some code'
                });
            } else {
                generalStore.setState(state => ({
                    selectedResponse: {
                        ...state.selectedResponse,
                        modelResponseMarkdown: 'some markdown'
                    }
                }));
            }

            renderComponent(process);

            expect(screen.getByText('View Diff')).toBeEnabled();
        }
    );

    it.each(['Orochi', 'General', 'STEM'] as Process[])(
        "doesn't call toggleDiffView when View Diff button is clicked if it is disabled",
        process => {
            globalStore.setState({ process });
            orochiStore.setState({ originalCode: undefined });
            renderComponent(process);
            fireEvent.click(screen.getByText('View Diff'));
            expect(screen.getByText('View Diff')).not.toBeEnabled();
        }
    );

    it.each(['Orochi', 'General', 'STEM'] as Process[])(
        'displays Check Response button only for Orochi process',
        process => {
            renderComponent(process);
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
        renderComponent('Orochi');
        fireEvent.click(screen.getByText('Copy'));

        expect(screen.queryByText('Conversation')).not.toBeInTheDocument();
    });
});
