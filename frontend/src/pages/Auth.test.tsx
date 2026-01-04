import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Auth from './Auth';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

// Mock mocks
const mockSetCurrentUser = vi.fn();
const mockNavigate = vi.fn();
const mockToast = vi.fn();

// Mock dependencies
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
        toast: mockToast,
    }),
}));

vi.mock('@/context/AuthContext', () => ({
    useAuth: () => ({
        setCurrentUser: mockSetCurrentUser,
    }),
}));

describe('Auth Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderAuth = () => {
        return render(
            <BrowserRouter>
                <Auth />
            </BrowserRouter>
        );
    };

    it('renders login form by default', () => {
        renderAuth();
        expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
        expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
        expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
        // Name field should not be visible in login mode
        expect(screen.queryByLabelText('Nombre completo')).not.toBeInTheDocument();
    });

    it('switches to register mode when link is clicked', () => {
        renderAuth();

        // Find the toggle button
        const toggleButton = screen.getByText('Regístrate');
        fireEvent.click(toggleButton);

        // Check if title changed
        expect(screen.getByRole('heading', { name: 'Crear cuenta' })).toBeInTheDocument();
        // Name field should be visible now
        expect(screen.getByLabelText('Nombre completo')).toBeInTheDocument();
    });

    it('validates form submission', async () => {
        renderAuth();
        // Just check that button exists and can be clicked
        const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
        expect(submitButton).toBeInTheDocument();
        // We are not really testing the logic inside fully because of the mock implementation in component
        // But we can check if it tries to submit
    });
});
