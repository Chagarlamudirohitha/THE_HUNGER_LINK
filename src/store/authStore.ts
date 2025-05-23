import { create } from 'zustand';
import { User, Donor, NGO } from '../types';
import { apiService } from '../services/apiService';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  user: User | Donor | NGO | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User>, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const useAuthStore = create<AuthState>(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiService.login(email, password);
          if (!response.success) {
            throw new Error(response.message || 'Invalid credentials');
          }
          
          set({
            isAuthenticated: true,
            user: response.user,
            isLoading: false,
            error: null
          });
          
          // Store user data in session storage for persistence
          sessionStorage.setItem('currentUser', JSON.stringify(response.user));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          console.error('Login error:', errorMessage);
          set({ 
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
            user: null
          });
        }
      },

      register: async (userData: Partial<User>, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Create new user with all required data
          const newUser = {
            ...userData,
            password
          };
          
          // Save user through API
          const response = await apiService.register(newUser);
          
          if (!response.success) {
            throw new Error(response.message || 'Failed to register user');
          }
          
          // Set the state with the new user data
          set({
            isAuthenticated: true,
            user: response.user,
            isLoading: false,
            error: null
          });
          
          // Store user data in session storage
          sessionStorage.setItem('currentUser', JSON.stringify(response.user));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred during registration';
          console.error('Registration error:', errorMessage);
          set({ 
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
            user: null
          });
        }
      },

      logout: () => {
        // Clear all storage
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        sessionStorage.removeItem('currentUser');
        
        // Reset state
        set({ 
          isAuthenticated: false, 
          user: null,
          error: null,
          isLoading: false
        });
      },

      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
    }
  )
);

// Initialize auth state from storage
const initializeAuth = () => {
  try {
    console.log('Initializing auth state...');
    const storedUser = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    
    if (storedUser && isAuthenticated) {
      const user = JSON.parse(storedUser);
      console.log('Found user in storage:', user);
      
      useAuthStore.setState({ 
        isAuthenticated: true, 
        user,
        error: null,
        isLoading: false
      });
      console.log('Auth state initialized with user');
    } else {
      console.log('No user found in storage');
      useAuthStore.setState({ 
        isAuthenticated: false,
        user: null,
        error: null,
        isLoading: false 
      });
    }
  } catch (error) {
    console.error('Error initializing auth:', error);
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    useAuthStore.setState({ 
      isAuthenticated: false, 
      user: null,
      error: null,
      isLoading: false
    });
  }
};

// Call initialization
initializeAuth();

export default useAuthStore;