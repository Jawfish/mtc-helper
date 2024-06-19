import { fn } from '@storybook/test';

import * as actual from './useTask';

export * from './useTask';

export const useTask = fn(actual.useTask).mockReturnValue({
    copyOperatorEmail: fn().mockName('copyOperatorEmail'),
    copyTaskId: fn().mockName('copyTaskId'),
    operatorEmail: 'mocked operator email',
    taskId: 'mocked task ID'
});
