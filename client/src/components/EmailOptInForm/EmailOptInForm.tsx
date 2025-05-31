import React, { useState } from 'react';
import { paymentAPI } from '../../utils/api';
import './EmailOptInForm.css';

interface EmailOptInFormProps {
	onClose?: () => void;
}

const EmailOptInForm: React.FC<EmailOptInFormProps> = ({ onClose }) => {
	const [email, setEmail] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [error, setError] = useState('');

	const validateEmail = (email: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		if (!validateEmail(email)) {
			setError('Please enter a valid email address');
			return;
		}

		setIsSubmitting(true);

		try {
			// Call the backend API
			const response = await fetch(
				`${process.env.REACT_APP_API_URL}/api/email-optin`,
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
				throw new Error(data.error || 'Failed to subscribe');
			}

			// Also save locally for demo purposes
			const savedEmails = JSON.parse(
				localStorage.getItem('promoEmailList') || '[]'
			);
			if (!savedEmails.includes(email)) {
				savedEmails.push(email);
				localStorage.setItem(
					'promoEmailList',
					JSON.stringify(savedEmails)
				);
			}

			setIsSubmitted(true);
			setEmail('');

			// Auto-close after 3 seconds
			setTimeout(() => {
				onClose?.();
			}, 3000);
		} catch (err: any) {
			setError(err.message || 'Something went wrong. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isSubmitted) {
		return (
			<div className='email-optin-form success'>
				<div className='success-content'>
					<div className='success-icon'>✅</div>
					<h3>You're In!</h3>
					<p>
						We'll notify you about exclusive offers and special
						deals.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className='email-optin-form'>
			<button className='close-btn' onClick={onClose} aria-label='Close'>
				×
			</button>
			<div className='optin-content'>
				<h3>Don't Miss Future Deals! 🎁</h3>
				<p>
					That offer has expired, but we have more coming!
					<br />
					Get notified about exclusive discounts and special
					promotions.
				</p>
				<form onSubmit={handleSubmit}>
					<div className='form-group'>
						<input
							type='email'
							placeholder='Enter your email address'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className='email-input'
							disabled={isSubmitting}
						/>
						<button
							type='submit'
							className='submit-btn'
							disabled={isSubmitting || !email}>
							{isSubmitting ? 'Joining...' : 'Notify Me'}
						</button>
					</div>
					{error && <div className='error-message'>{error}</div>}
				</form>
				<p className='privacy-note'>
					We respect your privacy. Unsubscribe anytime.
				</p>
			</div>
		</div>
	);
};

export default EmailOptInForm;
