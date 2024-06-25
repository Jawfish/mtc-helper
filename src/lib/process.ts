import { globalStore, Process } from '@src/store/globalStore';

import Logger from './logging';

/**
 * Returns the process based on the UUID found in the URL.
 */
export const getProcess = (url: string | undefined): Process => {
    if (!url) {
        return 'Unknown';
    }

    type ProcessUuidMap = Record<string, Process>;

    const processUuidMap: ProcessUuidMap = {
        'ddc93c48-e857-4ffb-a442-9b2b34ac3c83': 'Orochi',
        '1ba3bd1f-243e-46de-9f8f-eec133766f64': 'PANDA'
    };

    const [cleanUrl] = url.split('?');
    const [, , , , uuid] = cleanUrl.split('/');

    const process = processUuidMap[uuid];
    if (!process) {
        return 'Unknown';
    }

    return process;
};

export const updateProcess = (url: string | undefined) => {
    if (!url) {
        Logger.debug('URL is undefined');

        return;
    }

    try {
        const process = getProcess(url);
        Logger.debug(`URL observer: Process changed to ${process} using URL ${url}`);
        globalStore.setState({ process });
    } catch (e) {
        Logger.error(`Error updating process from URL: ${(e as Error).message}`);
    }
};
