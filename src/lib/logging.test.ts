/* eslint-disable no-console */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import Logger from './logging';

describe('Logger', () => {
    beforeEach(() => {
        // Mock console methods
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'debug').mockImplementation(() => {});
        vi.spyOn(console, 'info').mockImplementation(() => {});
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should log messages with the correct prefix and style', () => {
        Logger.log('Test log message');
        expect(console.log).toHaveBeenCalledWith(
            '%c[MTC Helper]',
            'color: blue; font-weight: bold;',
            'Test log message'
        );
    });

    it('should debug messages with the correct prefix and style', () => {
        Logger.debug('Test debug message');
        expect(console.debug).toHaveBeenCalledWith(
            '%c[MTC Helper]',
            'color: black; font-weight: bold;',
            'Test debug message'
        );
    });

    it('should info messages with the correct prefix and style', () => {
        Logger.info('Test info message');
        expect(console.info).toHaveBeenCalledWith(
            '%c[MTC Helper]',
            'color: blue; font-weight: bold;',
            'Test info message'
        );
    });

    it('should warn messages with the correct prefix and style', () => {
        Logger.warn('Test warn message');
        expect(console.warn).toHaveBeenCalledWith(
            '%c[MTC Helper]',
            'color: orange; font-weight: bold;',
            'Test warn message'
        );
    });

    it('should error messages with the correct prefix and style', () => {
        Logger.error('Test error message');
        expect(console.error).toHaveBeenCalledWith(
            '%c[MTC Helper]',
            'color: red; font-weight: bold;',
            'Test error message'
        );
    });

    it('should handle multiple arguments', () => {
        Logger.log('Message', 123, { key: 'value' });
        expect(console.log).toHaveBeenCalledWith(
            '%c[MTC Helper]',
            'color: blue; font-weight: bold;',
            'Message',
            123,
            { key: 'value' }
        );
    });
});
