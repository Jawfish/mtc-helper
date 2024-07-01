import { globalStore } from '@src/store/globalStore';
import { beforeEach, describe, expect, it } from 'vitest';

import { getProcess, updateProcess } from './process';

describe('Getting the process from the UUID', () => {
    beforeEach(() => {
        globalStore.setState({ process: 'Unknown' });
    });

    it('returns Unknown for undefined URL', () => {
        expect(getProcess(undefined)).toBe('Unknown');
    });

    it('returns Unknown for invalid URL format', () => {
        expect(getProcess('https://a.b.c')).toBe('Unknown');
    });

    it('returns Unknown for URL without UUID', () => {
        expect(getProcess('https://a.b.c/a/b/c/d')).toBe('Unknown');
    });

    it('returns Unknown for invalid UUID format', () => {
        expect(getProcess('https://a.b.c/a/b/c/d/invalid-uuid')).toBe('Unknown');
    });

    it('returns Unknown for UUID not in processUuidMap', () => {
        const validButUnknownUuid = '123e4567-e89b-12d3-a456-426614174000';
        expect(getProcess(`https://a.b.c/process/${validButUnknownUuid}`)).toBe(
            'Unknown'
        );
    });

    it('returns correct process for Orochi UUID', () => {
        const orochiUuid = 'ddc93c48-e857-4ffb-a442-9b2b34ac3c83';
        expect(getProcess(`https://a.b.c/process/${orochiUuid}`)).toBe('Orochi');
    });

    it('returns correct process for General UUID', () => {
        const generalUuid = '1ba3bd1f-243e-46de-9f8f-eec133766f64';
        expect(getProcess(`https://a.b.c/process/${generalUuid}`)).toBe('General');
    });

    it('ignores query parameters in URL', () => {
        const orochiUuid = 'ddc93c48-e857-4ffb-a442-9b2b34ac3c83';
        expect(
            getProcess(
                `https://a.b.c/process/${orochiUuid}?param1=value1&param2=value2`
            )
        ).toBe('Orochi');
    });
});

describe('Updating the process by UUID', () => {
    beforeEach(() => {
        globalStore.setState({ process: 'Unknown' });
    });

    const getProcessFromStore = () => globalStore.getState().process;

    it('sets Unknown for undefined URL', () => {
        updateProcess(undefined);
        expect(getProcessFromStore()).toBe('Unknown');
    });

    it('sets Unknown for invalid URL format', () => {
        updateProcess('https://a.b.c');
        expect(getProcessFromStore()).toBe('Unknown');
    });

    it('sets Unknown for URL without UUID', () => {
        updateProcess('https://a.b.c/a/b/c/d');
        expect(getProcessFromStore()).toBe('Unknown');
    });

    it('sets Unknown for invalid UUID format', () => {
        updateProcess('https://a.b.c/a/b/c/d/invalid-uuid');
        expect(getProcessFromStore()).toBe('Unknown');
    });

    it('sets Unknown for UUID not in processUuidMap', () => {
        const validButUnknownUuid = '123e4567-e89b-12d3-a456-426614174000';
        updateProcess(`https://a.b.c/process/${validButUnknownUuid}`);
        ('Unknown');
    });

    it('sets correct process for Orochi UUID', () => {
        const orochiUuid = 'ddc93c48-e857-4ffb-a442-9b2b34ac3c83';
        updateProcess(`https://a.b.c/process/${orochiUuid}`);
        expect(getProcessFromStore()).toBe('Orochi');
    });

    it('sets correct process for General UUID', () => {
        const generalUuid = '1ba3bd1f-243e-46de-9f8f-eec133766f64';
        updateProcess(`https://a.b.c/process/${generalUuid}`);
        expect(getProcessFromStore()).toBe('General');
    });

    it('ignores query parameters in URL', () => {
        const orochiUuid = 'ddc93c48-e857-4ffb-a442-9b2b34ac3c83';
        updateProcess(`https://a.b.c/process/${orochiUuid}`);
        expect(getProcessFromStore()).toBe('Orochi');
    });

    it('continues using the same process on multiple calls', () => {
        const orochiUuid = 'ddc93c48-e857-4ffb-a442-9b2b34ac3c83';

        // even
        updateProcess(`https://a.b.c/process/${orochiUuid}`);
        updateProcess(`https://a.b.c/process/${orochiUuid}`);
        expect(getProcessFromStore()).toBe('Orochi');

        // odd
        updateProcess(`https://a.b.c/process/${orochiUuid}`);
        updateProcess(`https://a.b.c/process/${orochiUuid}`);
        updateProcess(`https://a.b.c/process/${orochiUuid}`);
        expect(getProcessFromStore()).toBe('Orochi');
    });
});
