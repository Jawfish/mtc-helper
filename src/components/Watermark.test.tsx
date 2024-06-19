import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import Watermark from '@src/components/Watermark';
import { describe, it, expect } from 'vitest';
import { Process, useMTCStore } from '@src/store/MTCStore';

describe('Watermark', () => {
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
        useMTCStore.setState({ process: Process.Orochi });
        render(<Watermark version='1.0.0' />);
        expect(screen.getByText(/Current process: Orochi/)).toBeInTheDocument();
    });
});
