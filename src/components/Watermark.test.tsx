import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import Watermark from '@src/components/Watermark';
import { describe, it, beforeEach, afterEach } from 'vitest';
import { globalStore } from '@src/store/globalStore';
import { expect } from '@storybook/test';

describe('Watermark', () => {
    beforeEach(() => {
        globalStore.setState({ process: 'Unknown' });
    });

    afterEach(() => {
        globalStore.setState({ process: 'Unknown' });
    });

    it('renders without crashing', () => {
        render(<Watermark version='1.0.0' />);
    });

    it('displays the correct version', () => {
        render(<Watermark version='1.0.0' />);
        expect(screen.getByText(/MTC Helper version 1.0.0/)).toBeInTheDocument();
    });

    it('displays unknown process when none is set', () => {
        render(<Watermark version='1.0.0' />);
        expect(screen.getByText(/Current process: Unknown/)).toBeInTheDocument();
    });

    it('displays the current process when one is set', () => {
        globalStore.setState({ process: 'Orochi' });
        render(<Watermark version='1.0.0' />);
        expect(screen.getByText(/Current process: Orochi/)).toBeInTheDocument();
    });

    it('renders with different versions', () => {
        render(<Watermark version='2.0.0' />);
        expect(screen.getByText(/MTC Helper version 2.0.0/)).toBeInTheDocument();
    });

    it('updates when the process state changes', () => {
        const { rerender } = render(<Watermark version='1.0.0' />);
        expect(screen.getByText(/Current process: Unknown/)).toBeInTheDocument();

        globalStore.setState({ process: 'General' });
        rerender(<Watermark version='1.0.0' />);
        expect(screen.getByText(/Current process: General/)).toBeInTheDocument();
    });
});
