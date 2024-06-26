import Logger from '@lib/logging';
import { useToast } from '@src/contexts/ToastContext';
import { Process, useGlobalStore } from '@src/store/globalStore';
import { useOrochiStore } from '@src/store/orochiStore';
import { useGeneralStore } from '@src/store/generalStore';
import { useCallback, useState } from 'react';

const DIFF_VIEW_ERROR =
    'The original content must be viewed before a diff can be displayed.';

type UseDiffViewReturn = {
    diffViewOpen: boolean;
    toggleDiffView: () => void;
};

export function useDiffView(): UseDiffViewReturn {
    const { process } = useGlobalStore();
    const { notify } = useToast();
    const [diffViewOpen, setDiffViewOpen] = useState(false);
    const orochiState = useOrochiStore();
    const generalState = useGeneralStore();

    const canOpenDiffView = useCallback(
        (currentProcess: Process) => {
            const canOpenOrochiDiff =
                currentProcess === 'Orochi' &&
                orochiState.originalResponse &&
                orochiState.editedResponse;
            const canOpenGeneralDiff =
                currentProcess === 'General' &&
                generalState.selectedResponse.originalMarkdown;

            return canOpenOrochiDiff || canOpenGeneralDiff;
        },
        [orochiState, generalState]
    );

    const toggleDiffView = useCallback(() => {
        if (!canOpenDiffView(process)) {
            notify(DIFF_VIEW_ERROR, 'error');

            return;
        }
        setDiffViewOpen(prev => {
            const newDiffViewOpen = !prev;
            Logger.debug(`Diff view toggled ${newDiffViewOpen ? 'on' : 'off'}`);

            return newDiffViewOpen;
        });
    }, [process, canOpenDiffView, notify]);

    return { diffViewOpen, toggleDiffView };
}
