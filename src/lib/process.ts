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
        '01031f59-fb94-4484-bcee-58df8b66787a': 'General',
        '1ba3bd1f-243e-46de-9f8f-eec133766f64': 'General',
        'b10050a9-254d-4af8-b343-913b06475de2': 'General',
        'ddc93c48-e857-4ffb-a442-9b2b34ac3c83': 'Orochi'
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
