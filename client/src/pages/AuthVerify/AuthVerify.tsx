import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './AuthVerify.css';

const AuthVerify: React.FC = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const { login } = useAuth();
	const [status, setStatus] = useState<'verifying' | 'success' | 'error'>(
		'verifying'
	);
	const [error, setError] = useState<string>('');

	useEffect(() => {
		const verifyToken = async () => {
			const token = searchParams.get('token');

			if (!token) {
				setStatus('error');
				setError('No verification token found');
				return;
			}

			try {
				const response = await fetch(
					`${process.env.REACT_APP_API_URL}/api/auth/verify?token=${token}`
				);
				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.error || 'Failed to verify token');
				}

				// Log the user in
				login(data.sessionToken, data.email, data.customerId);
				setStatus('success');

				// Redirect to dashboard after a short delay
				setTimeout(() => {
					navigate('/dashboard');
				}, 2000);
			} catch (error: any) {
				setStatus('error');
				setError(error.message || 'Something went wrong');
			}
		};

		verifyToken();
	}, [searchParams, navigate, login]);

	return (
		<div className='auth-verify-page'>
			<div className='auth-verify-container'>
				{status === 'verifying' && (
					<>
						<div className='spinner'></div>
						<h2>Verifying your login...</h2>
						<p>Please wait a moment</p>
					</>
				)}

				{status === 'success' && (
					<>
						<div className='success-icon'>✅</div>
						<h2>Success!</h2>
						<p>
							You're now logged in. Redirecting to your
							dashboard...
						</p>
					</>
				)}

				{status === 'error' && (
					<>
						<div className='error-icon'>❌</div>
						<h2>Verification Failed</h2>
						<p>{error}</p>
						<button
							onClick={() => navigate('/login')}
							className='retry-button'>
							Try Again
						</button>
					</>
				)}
			</div>
		</div>
	);
};

export default AuthVerify;
