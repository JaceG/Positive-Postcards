import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import './CheckoutSuccess.css';

const CheckoutSuccess: React.FC = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { subscriptionId, email } = location.state || {};

	useEffect(() => {
		// If no state, redirect to home
		if (!subscriptionId) {
			navigate('/');
		}
	}, [subscriptionId, navigate]);

	if (!subscriptionId) {
		return null;
	}

	return (
		<div className='success-page'>
			<div className='success-container'>
				<div className='success-icon'>
					<svg
						width='80'
						height='80'
						viewBox='0 0 80 80'
						fill='none'
						xmlns='http://www.w3.org/2000/svg'>
						<circle cx='40' cy='40' r='40' fill='#4CAF50' />
						<path
							d='M55 30L35 50L25 40'
							stroke='white'
							strokeWidth='4'
							strokeLinecap='round'
							strokeLinejoin='round'
						/>
					</svg>
				</div>

				<h1>Welcome to Positive Postcards!</h1>

				<div className='success-message'>
					<p>Your subscription has been successfully created.</p>
					<p>
						We've sent a confirmation email to{' '}
						<strong>{email}</strong>
					</p>
				</div>

				<div className='success-details'>
					<h2>What happens next?</h2>
					<ul>
						<li>
							✉️ Your first postcard will be mailed within 2-3
							business days
						</li>
						<li>
							📬 You'll receive a new postcard every day
							thereafter
						</li>
						<li>
							💳 Your subscription will automatically renew based
							on your selected plan
						</li>
						<li>
							📧 Check your email for order details and tracking
							information
						</li>
					</ul>
				</div>

				<div className='success-actions'>
					<Link to='/' className='btn btn-primary'>
						Return to Home
					</Link>
					<p className='subscription-id'>
						Subscription ID: {subscriptionId}
					</p>
				</div>

				<div className='success-footer'>
					<p>
						Questions? Contact us at{' '}
						<a href='mailto:support@positivepostcards.com'>
							support@positivepostcards.com
						</a>
					</p>
				</div>
			</div>
		</div>
	);
};

export default CheckoutSuccess;
