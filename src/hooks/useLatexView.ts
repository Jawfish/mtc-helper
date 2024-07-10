import { useEffect, useState } from 'react';
import { useGlobalStore } from '@src/store/globalStore';
import { useGeneralStore } from '@src/store/generalStore';

type UseLatexViewReturn = {
    latexViewOpen: boolean;
    canOpenLatexView: boolean;
    toggleLatexView: () => void;
};

export function useLatexView(): UseLatexViewReturn {
    const { latexViewOpen, toggleLatexView } = useGlobalStore();
    const { operatorResponseMarkdown } = useGeneralStore().selectedResponse;
    const [canOpenLatexView, setCanOpenLatexView] = useState<boolean>(false);

    useEffect(() => {
        setCanOpenLatexView(!!operatorResponseMarkdown);
    }, [operatorResponseMarkdown]);

    return { latexViewOpen, canOpenLatexView, toggleLatexView };
}
