export type UserRole = 'player' | 'group_admin' | 'platform_admin';

export interface MockUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export const mockUsers: MockUser[] = [
  {
    id: 'user-1',
    email: 'jugador@example.com',
    name: 'Carlos Rodríguez',
    role: 'player',
  },
  {
    id: 'user-2',
    email: 'admin-grupo@example.com',
    name: 'María González',
    role: 'group_admin',
  },
  {
    id: 'user-3',
    email: 'admin@prode.com',
    name: 'Super Admin',
    role: 'platform_admin',
  },
];

// Current logged-in user (change this to test different roles)
export const getCurrentUser = (): MockUser => {
  // Default: player
  return mockUsers[0];
};

export const getUserById = (id: string): MockUser | undefined => {
  return mockUsers.find(user => user.id === id);
};

export const getUserByEmail = (email: string): MockUser | undefined => {
  return mockUsers.find(user => user.email === email);
};
