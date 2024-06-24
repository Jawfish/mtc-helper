import './style.css';
import { createRoot } from 'react-dom/client';
import Watermark from '@src/components/Watermark';
import Toasts from '@src/components/Toasts';
import { Tooltip } from 'react-tooltip';
import { DiffViewer } from '@components/DiffViewer/DiffViewer';
import { useDiffView } from '@hooks/useDiffView';
import { initializeObservers } from '@lib/init';
import { ToastProvider } from '@src/contexts/ToastContext';
import Toolbar from '@components/Toolbar';
import { useGlobalStore } from '@src/store/globalStore';

const div = document.createElement('div');
div.id = 'mtc-helper-root';
document.body.appendChild(div);

const rootContainer = document.querySelector('#mtc-helper-root');
if (!rootContainer) throw new Error("Can't find Content root element");
const root = createRoot(rootContainer);

const App = () => {
    const { diffViewOpen, toggleDiffView } = useDiffView();
    const { taskIsOpen: taskOpen, process } = useGlobalStore();

    if (!taskOpen) return <Watermark version='1.0.0' />;

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
            <Toolbar
                toggleDiffView={toggleDiffView}
                process={process}
            />
            {diffViewOpen && <DiffViewer toggleDiffView={toggleDiffView} />}
            <Watermark version='1.0.0' />
        </>
    );
};

root.render(
    <ToastProvider>
        <App />
    </ToastProvider>
);

initializeObservers();
