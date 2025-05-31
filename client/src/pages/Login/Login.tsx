import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

const Login: React.FC = () => {
	const [email, setEmail] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState<{
		type: 'success' | 'error' | 'demo';
		text: string;
		demoLink?: string;
	} | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setMessage(null);

		try {
			const response = await fetch(
				`${process.env.REACT_APP_API_URL}/api/auth/send-magic-link`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ email }),
				}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to send login link');
			}

			setMessage({
				type: 'success',
				text: 'Check your email for the login link!',
			});

			// For demo purposes, show the link
			if (data.demoLink) {
				setMessage({
					type: 'demo',
					text: 'Demo Mode - In production, this would be sent via email',
					demoLink: data.demoLink,
				});
			}

			setEmail('');
		} catch (error: any) {
			setMessage({
				type: 'error',
				text:
					error.message || 'Something went wrong. Please try again.',
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='login-page'>
			<div className='login-container'>
				<h1>Welcome Back</h1>
				<p className='login-subtitle'>
					Sign in to manage your Positive Postcards subscription
				</p>

				<form onSubmit={handleSubmit} className='login-form'>
					<div className='form-group'>
						<label htmlFor='email'>Email Address</label>
						<input
							type='email'
							id='email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder='Enter your email'
							required
							className='form-input'
							disabled={isLoading}
						/>
					</div>

					<button
						type='submit'
						className='login-button'
						disabled={isLoading || !email}>
						{isLoading ? 'Sending...' : 'Send Login Link'}
					</button>
				</form>

				{message && (
					<div className={`message message-${message.type}`}>
						{message.type === 'demo' ? (
							<div>
								<p>{message.text}:</p>
								<a
									href={message.demoLink}
									className='demo-link'>
									Click here to login
								</a>
							</div>
						) : (
							message.text
						)}
					</div>
				)}

				<div className='login-help'>
					<p>
						No account yet?{' '}
						<Link to='/'>Start your subscription</Link>
					</p>
					<p className='security-note'>
						🔒 We use secure magic links - no passwords needed!
					</p>
				</div>
			</div>
		</div>
	);
};

export default Login;
