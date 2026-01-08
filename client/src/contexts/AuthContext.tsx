import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from 'react';

interface AuthContextType {
	isAuthenticated: boolean;
	isLoading: boolean;
	user: {
		email: string;
		customerId: string;
	} | null;
	sessionToken: string | null;
	login: (token: string, email: string, customerId: string) => void;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};

// Helper to safely get initial auth state from localStorage
const getInitialAuthState = () => {
	try {
		const token = localStorage.getItem('sessionToken');
		const userStr = localStorage.getItem('user');
		if (token && userStr) {
			const userData = JSON.parse(userStr);
			return {
				sessionToken: token,
				user: userData,
				isAuthenticated: true,
			};
		}
	} catch (error) {
		console.error('Error loading initial auth state:', error);
		localStorage.removeItem('sessionToken');
		localStorage.removeItem('user');
	}
	return {
		sessionToken: null,
		user: null,
		isAuthenticated: false,
	};
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	// Initialize state synchronously from localStorage to prevent race conditions
	const initialState = getInitialAuthState();
	
	const [isAuthenticated, setIsAuthenticated] = useState(initialState.isAuthenticated);
	const [user, setUser] = useState<{
		email: string;
		customerId: string;
	} | null>(initialState.user);
	const [sessionToken, setSessionToken] = useState<string | null>(initialState.sessionToken);
	const [isLoading, setIsLoading] = useState(true);

	const logout = () => {
		localStorage.removeItem('sessionToken');
		localStorage.removeItem('user');
		setSessionToken(null);
		setUser(null);
		setIsAuthenticated(false);
	};

	// Validate session on mount (check if token is still valid on server)
	useEffect(() => {
		const validateSession = async () => {
			if (!initialState.sessionToken) {
				setIsLoading(false);
				return;
			}

			try {
				// Verify the token is still valid on the server
				const response = await fetch(
					`${process.env.REACT_APP_API_URL}/api/dashboard`,
					{
						headers: {
							Authorization: `Bearer ${initialState.sessionToken}`,
						},
					}
				);

				if (!response.ok) {
					// Token is invalid, clear auth state
					console.log('Session token expired, logging out');
					logout();
				}
			} catch (error) {
				console.error('Error validating session:', error);
				// Keep user logged in on network errors (they'll get an error when they try to do something)
			} finally {
				setIsLoading(false);
			}
		};

		validateSession();
	}, []);

	const login = (token: string, email: string, customerId: string) => {
		const userData = { email, customerId };
		localStorage.setItem('sessionToken', token);
		localStorage.setItem('user', JSON.stringify(userData));
		setSessionToken(token);
		setUser(userData);
		setIsAuthenticated(true);
	};

	return (
		<AuthContext.Provider
			value={{ isAuthenticated, isLoading, user, sessionToken, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};
