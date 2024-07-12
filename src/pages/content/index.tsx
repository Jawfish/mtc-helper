import './style.css';
import { createRoot } from 'react-dom/client';
import Toasts from '@src/components/Toasts';
import { Tooltip } from 'react-tooltip';
import { DiffViewer } from '@components/DiffViewer/DiffViewer';
import { useDiffView } from '@hooks/useDiffView';
import { ToastProvider } from '@src/contexts/ToastContext';
import Toolbar from '@components/Toolbar';
import { useGlobalStore } from '@src/store/globalStore';
import { useLatexView } from '@hooks/useLatexView';
import LatexViewer from '@components/Latex/LatexViewer';
import useAppObserver from '@hooks/useAppObserver';
import { clickHandlers, mutHandlers } from '@handlers/index';
import useMonacoObserver from '@hooks/useMonacoObserver';
import useTitleObserver from '@hooks/useTitleObserver';
import { Sidebar } from '@components/Sidebar';
import useClickObserver from '@hooks/useClickObserver';

const div = document.createElement('div');
div.id = 'mtc-helper-root';
document.body.appendChild(div);

const rootContainer = document.querySelector('#mtc-helper-root');
if (!rootContainer) throw new Error("Can't find Content root element");
const root = createRoot(rootContainer);

const App = () => {
    useAppObserver(mutHandlers);
    useClickObserver(clickHandlers);
    useMonacoObserver();
    useTitleObserver();

    const { diffViewOpen } = useDiffView();
    const { latexViewOpen } = useLatexView();
    const { taskIsOpen, process } = useGlobalStore();

    if (!taskIsOpen) return null;

    return (
        <>
            <Tooltip
                id='mtc-helper-tooltip'
                className='z-[1100] shadow text-base'
                variant='light'
                opacity={1}
                offset={10}
                delayShow={500}
                border={'1px solid lightgray'}
                openEvents={{ focus: false, mouseover: true, mouseenter: true }}
            />
            <Toasts />
            <Toolbar process={process} />
            {diffViewOpen && <DiffViewer />}
            {latexViewOpen && <LatexViewer />}
            {process !== 'Orochi' && <Sidebar />}
        </>
    );
};

root.render(
    <ToastProvider>
        <App />
    </ToastProvider>
);
