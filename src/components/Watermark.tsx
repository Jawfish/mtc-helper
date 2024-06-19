import { globalStore } from '@src/store/globalStore';

interface WatermarkProps {
    version: string;
}

const Watermark = ({ version }: WatermarkProps) => {
    const { process } = globalStore.getState();

    return (
        <div className='absolute bottom-0 left-0 z-50 text-sm text-gray-300'>
            <div>MTC Helper version {version}g</div>
            <div>Current process: {process}</div>
        </div>
    );
};

export default Watermark;
