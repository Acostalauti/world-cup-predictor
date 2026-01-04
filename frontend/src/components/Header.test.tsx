import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from './Header';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

describe('Header', () => {
    const renderHeader = (props = {}) => {
        return render(
            <BrowserRouter>
                <Header {...props} />
            </BrowserRouter>
        );
    };

    it('renders application title', () => {
        renderHeader();
        expect(screen.getByText('Prode Mundial')).toBeInTheDocument();
    });

    it('displays correct username when provided', () => {
        renderHeader({ userName: 'TestUser' });
        expect(screen.getByText('TestUser')).toBeInTheDocument();
    });

    it('calls onLogout when logout is clicked', async () => {
        const user = userEvent.setup();
        const handleLogout = vi.fn();
        renderHeader({ onLogout: handleLogout });

        // Open dropdown
        const userButton = screen.getByText('Usuario'); // Default name
        await user.click(userButton);

        // Click logout
        const logoutButton = await screen.findByText('Cerrar sesión');
        await user.click(logoutButton);

        expect(handleLogout).toHaveBeenCalledTimes(1);
    });
});
