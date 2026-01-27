import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import GuestList from './GuestList';
import api from '../lib/api';
import { BrowserRouter } from 'react-router-dom';

// Mock API
vi.mock('../lib/api', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn()
    }
}));

describe('GuestList', () => {
    it('renders guests after fetch', async () => {
        const mockGuests = [
            {
                id: 1,
                first_name: 'John',
                last_name: 'Doe',
                document_number: 'AB123456',
                guest_type: 'individual',
                document_type: 'passport',
                nationality_iso3: 'USA',
                arrival_date: '2023-01-01',
                submission_status: 'pending'
            }
        ];

        api.get.mockResolvedValue({ data: { guests: mockGuests } });

        render(
            <BrowserRouter>
                <GuestList />
            </BrowserRouter>
        );

        // Wait for guest to appear
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        // Use regex for partial matches
        expect(screen.getByText(/AB123456/)).toBeInTheDocument();
        expect(screen.getByText('pending')).toBeInTheDocument();
    });

    it('shows sent status correctly', async () => {
        const mockGuests = [
            {
                id: 2,
                first_name: 'Jane',
                last_name: 'Smith',
                document_number: 'XY987654',
                document_type: 'id_card',
                nationality_iso3: 'GBR',
                arrival_date: '2023-01-02',
                submission_status: 'sent'
            }
        ];

        api.get.mockResolvedValue({ data: { guests: mockGuests } });

        render(
            <BrowserRouter>
                <GuestList />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });

        const statusBadge = screen.getByText('sent');
        expect(statusBadge).toBeInTheDocument();
        expect(statusBadge).toHaveClass('bg-green-100');
    });
});
