import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from 'react';

interface AuthContextType {
	isAuthenticated: boolean;
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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [user, setUser] = useState<{
		email: string;
		customerId: string;
	} | null>(null);
	const [sessionToken, setSessionToken] = useState<string | null>(null);

	const logout = () => {
		localStorage.removeItem('sessionToken');
		localStorage.removeItem('user');
		setSessionToken(null);
		setUser(null);
		setIsAuthenticated(false);
	};

	// Load session from localStorage on mount
	useEffect(() => {
		const token = localStorage.getItem('sessionToken');
		const userStr = localStorage.getItem('user');

		if (token && userStr) {
			try {
				const userData = JSON.parse(userStr);
				setSessionToken(token);
				setUser(userData);
				setIsAuthenticated(true);
			} catch (error) {
				console.error('Error loading session:', error);
				logout();
			}
		}
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
			value={{ isAuthenticated, user, sessionToken, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};
