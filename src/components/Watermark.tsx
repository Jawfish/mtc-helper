import { useMTCStore } from '@src/store/MTCStore';

interface WatermarkProps {
    version: string;
}

const Watermark = ({ version }: WatermarkProps) => {
    const process = useMTCStore(state => state.process);

    return (
        <div className='absolute bottom-0 left-0 z-50 text-sm text-gray-300'>
            <div>MTC Helper version {version}c</div>
            <div>Current process: {process}</div>
        </div>
    );
};

export default Watermark;
