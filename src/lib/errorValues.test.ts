import { describe, it, expect, vi } from 'vitest';

import {
    v,
    vv,
    good,
    retry,
    withTimeout
} from './errorValues';

describe('errorValues', () => {
    describe('v', () => {
        it('should return data for successful execution', () => {
            const [data, err] = v(() => 'success');
            expect(data).toEqual('success');
            expect(err).toBeNull();
        });

        it('should return error for failed execution', () => {
            const [data, err] = v(() => {
                throw new Error('test error');
            });
            expect(data).toBeNull();
            expect(err).toBeInstanceOf(Error);
            expect(err?.message).toBe('test error');
        });

        it('should wrap non-Error throws', () => {
            const [data, err] = v(() => {
                throw 'string error';
            });
            expect(data).toBeNull();
            expect(err).toBeInstanceOf(Error);
            expect(err?.message).toBe('string error');
        });
    });

    describe('vv', () => {
        it('should return data for resolved promise', async () => {
            const testFn = async (testParam: string) => {
                return testParam;
            };
            const [data, err] = await vv(testFn('success'));
            expect(data).toEqual('success');
            expect(err).toBeNull();
        });

        it('should return error for rejected promise', async () => {
            const [data, err] = await vv(Promise.reject(new Error('test error')));
            expect(data).toBeNull();
            expect(err).toBeInstanceOf(Error);
            expect(err?.message).toBe('test error');
        });

        it('should wrap non-Error rejections', async () => {
            const [data, err] = await vv(Promise.reject('string error'));
            expect(data).toBeNull();
            expect(err).toBeInstanceOf(Error);
            expect(err?.message).toBe('string error');
        });
    });

    describe('good', () => {
        it('should return true for successful results', () => {
            expect(good(['success', null])).toBe(true);
        });

        it('should return false for failed results', () => {
            expect(good([null, new Error('test')])).toBe(false);
        });
    });

    describe('retry', () => {
        it('should return result on successful attempt', async () => {
            const operation = vi.fn().mockResolvedValueOnce('success');
            const [data, err] = await retry(operation, 3, 100);
            expect(data).toEqual('success');
            expect(err).toBeNull();
            expect(operation).toHaveBeenCalledTimes(1);
        });

        it('should retry on failure and succeed eventually', async () => {
            const operation = vi
                .fn()
                .mockRejectedValueOnce(new Error('fail1'))
                .mockRejectedValueOnce(new Error('fail2'))
                .mockResolvedValueOnce('success');
            const [data, err] = await retry(operation, 3, 100);
            expect(data).toEqual('success');
            expect(err).toBeNull();
            expect(operation).toHaveBeenCalledTimes(3);
        });

        it('should return error after max retries', async () => {
            const operation = vi.fn().mockRejectedValue(new Error('test error'));
            const [data, err] = await retry(operation, 3, 100);
            expect(data).toBeNull();
            expect(err).toBeInstanceOf(Error);
            expect(err?.message).toBe('test error');
            expect(operation).toHaveBeenCalledTimes(3);
        });
    });

    describe('withTimeout', () => {
        it('should resolve if promise completes before timeout', async () => {
            const promise = new Promise(resolve =>
                setTimeout(() => resolve('success'), 50)
            );
            const [data, err] = await withTimeout(promise, 100);
            expect(data).toEqual('success');
            expect(err).toBeNull();
        });

        it('should return error if promise times out', async () => {
            const promise = new Promise(resolve =>
                setTimeout(() => resolve('success'), 200)
            );
            const [data, err] = await withTimeout(promise, 100);
            expect(data).toBeNull();
            expect(err).toBeInstanceOf(Error);
            expect(err?.message).toBe('Operation timed out after 100ms');
        });
    });
});
