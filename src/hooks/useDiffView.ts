import Logger from '@lib/logging';
import { useToast } from '@src/contexts/ToastContext';
import { Process, useGlobalStore } from '@src/store/globalStore';
import { useOrochiStore } from '@src/store/orochiStore';
import { usePandaStore } from '@src/store/pandaStore';
import { useCallback, useState } from 'react';

export function useDiffView() {
    const { process } = useGlobalStore();
    const { notify } = useToast();
    const [diffViewOpen, setDiffViewOpen] = useState(false);
    const orochiState = useOrochiStore();
    const pandaState = usePandaStore();

    const canOpenDiffView = useCallback(
        (currentProcess: Process) => {
            const canOpenOrochiDiff =
                currentProcess === 'Orochi' &&
                orochiState.originalResponse &&
                orochiState.editedResponse;
            const canOpenPandaDiff =
                currentProcess === 'PANDA' &&
                pandaState.originalResponsePlaintext &&
                pandaState.editedResponsePlaintext;

            return canOpenOrochiDiff || canOpenPandaDiff;
        },
        [orochiState, pandaState]
    );

    const toggleDiffView = useCallback(() => {
        if (!canOpenDiffView(process)) {
            notify(
                'The original content must be viewed before a diff can be displayed.',
                'error'
            );

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
