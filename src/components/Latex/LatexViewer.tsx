import React, { useState } from 'react';
import { Rnd } from 'react-rnd';
import { useGeneralStore } from '@src/store/generalStore';
import Logger from '@lib/logging';

import Latex from './Latex';

const LatexViewer = () => {
    const { operatorResponseMarkdown } = useGeneralStore();
    const initialSize = { width: 600, height: 480 };

    const calculateCenterPosition = () => {
        const centerX = window.innerWidth / 2 - initialSize.width / 2;
        const centerY = window.innerHeight / 2 - initialSize.height / 2;

        return { x: centerX, y: centerY };
    };

    const [size, setSize] = useState(initialSize);
    const [position, setPosition] = useState(calculateCenterPosition);

    Logger.debug('Rendering LaTeX viewer');

    return (
        <div className='pointer-events-none fixed inset-0 size-full z-[9997] '>
            <Rnd
                size={size}
                position={position}
                onDragStop={(e, d) => {
                    setPosition({ x: d.x, y: d.y });
                }}
                onResize={(e, direction, ref, delta, position) => {
                    setSize({
                        width: ref.offsetWidth,
                        height: ref.offsetHeight
                    });
                    setPosition(position);
                }}
                minWidth={200}
                minHeight={100}
                bounds='parent'
                enableResizing={{
                    top: true,
                    right: true,
                    bottom: true,
                    left: true,
                    topRight: true,
                    bottomRight: true,
                    bottomLeft: true,
                    topLeft: true
                }}
                className='pointer-events-auto flex flex-col rounded-md shadow-xl cursor-move z-[9998] bg-white shadow-mtc-faded border border-solid border-mtc-primary'>
                <div className='size-full overflow-auto'>
                    <div className='p-4'>
                        <Latex content={operatorResponseMarkdown || ''} />
                    </div>
                </div>
            </Rnd>
        </div>
    );
};

export default LatexViewer;
