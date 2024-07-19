import { useToast } from '@src/contexts/ToastContext';
import { useGlobalStore } from '@src/store/globalStore';
import { useOrochiStore } from '@src/store/orochiStore';
import { useGenericProcessStore } from '@src/store/genericProcessStore';
import { useCallback, useEffect, useState } from 'react';

const DIFF_VIEW_ERROR =
    'The original content must be viewed before a diff can be displayed.';

type UseDiffViewReturn = {
    diffViewOpen: boolean;
    canOpenDiffView: boolean;
    toggleDiffView: () => void;
};

export function useDiffView(): UseDiffViewReturn {
    const { process, diffViewOpen, toggleDiffView: storeToggle } = useGlobalStore();
    const [canOpenDiffView, setCanOpenDiffView] = useState<boolean>(false);
    const { notify } = useToast();
    const { modelResponseCode } = useOrochiStore();
    const { modelResponseMarkdown } = useGenericProcessStore();

    useEffect(() => {
        switch (process) {
            case 'Orochi':
                setCanOpenDiffView(!!modelResponseCode);
                break;
            default:
                setCanOpenDiffView(!!modelResponseMarkdown);
        }
    }, [process, modelResponseCode, modelResponseMarkdown]);

    const toggleDiffView = useCallback(() => {
        if (!canOpenDiffView) {
            notify(DIFF_VIEW_ERROR, 'error');

            return;
        }
        storeToggle();
    }, [notify, canOpenDiffView, storeToggle]);

    return { diffViewOpen, toggleDiffView, canOpenDiffView };
}
