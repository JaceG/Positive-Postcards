import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Dashboard.css';

interface Subscription {
	id: string;
	status: string;
	current_period_start: number;
	current_period_end: number;
	cancel_at_period_end: boolean;
	pause_collection?: {
		behavior: string;
		resumes_at?: number;
	};
	items: {
		data: Array<{
			price: {
				unit_amount: number;
				currency: string;
				recurring: {
					interval: string;
				};
			};
		}>;
	};
}

const Dashboard: React.FC = () => {
	const navigate = useNavigate();
	const { user, sessionToken, logout } = useAuth();
	const [loading, setLoading] = useState(true);
	const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
	const [showPauseModal, setShowPauseModal] = useState(false);
	const [pauseDate, setPauseDate] = useState('');
	const [selectedSubscription, setSelectedSubscription] = useState<
		string | null
	>(null);

	const fetchDashboardData = useCallback(async () => {
		try {
			const response = await fetch(
				`${process.env.REACT_APP_API_URL}/api/dashboard`,
				{
					headers: {
						Authorization: `Bearer ${sessionToken}`,
					},
				}
			);

			if (!response.ok) {
				if (response.status === 401) {
					logout();
					navigate('/login');
					return;
				}
				throw new Error('Failed to fetch dashboard data');
			}

			const data = await response.json();
			setSubscriptions(data.subscriptions || []);
		} catch (error) {
			console.error('Error fetching dashboard:', error);
		} finally {
			setLoading(false);
		}
	}, [sessionToken, navigate, logout]);

	useEffect(() => {
		if (!sessionToken) {
			navigate('/login');
			return;
		}

		fetchDashboardData();
	}, [sessionToken, navigate, logout, fetchDashboardData]);

	const handleBillingPortal = async () => {
		try {
			const response = await fetch(
				`${process.env.REACT_APP_API_URL}/api/create-portal-session`,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${sessionToken}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						returnUrl: window.location.href,
					}),
				}
			);

			const data = await response.json();
			if (data.url) {
				window.location.href = data.url;
			}
		} catch (error) {
			console.error('Error creating portal session:', error);
		}
	};

	const handlePauseSubscription = async () => {
		if (!selectedSubscription) return;

		try {
			const response = await fetch(
				`${process.env.REACT_APP_API_URL}/api/subscription/pause`,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${sessionToken}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						subscriptionId: selectedSubscription,
						resumeDate: pauseDate || undefined,
					}),
				}
			);

			if (response.ok) {
				setShowPauseModal(false);
				fetchDashboardData();
			}
		} catch (error) {
			console.error('Error pausing subscription:', error);
		}
	};

	const handleResumeSubscription = async (subscriptionId: string) => {
		try {
			const response = await fetch(
				`${process.env.REACT_APP_API_URL}/api/subscription/resume`,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${sessionToken}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ subscriptionId }),
				}
			);

			if (response.ok) {
				fetchDashboardData();
			}
		} catch (error) {
			console.error('Error resuming subscription:', error);
		}
	};

	const formatDate = (timestamp: number) => {
		return new Date(timestamp * 1000).toLocaleDateString('en-US', {
			month: 'long',
			day: 'numeric',
			year: 'numeric',
		});
	};

	const getSubscriptionStatus = (subscription: Subscription) => {
		if (subscription.cancel_at_period_end) {
			return { label: 'Canceling', class: 'status-canceling' };
		}
		if (subscription.pause_collection) {
			return { label: 'Paused', class: 'status-paused' };
		}
		if (subscription.status === 'active') {
			return { label: 'Active', class: 'status-active' };
		}
		return { label: subscription.status, class: 'status-inactive' };
	};

	if (loading) {
		return (
			<div className='dashboard-loading'>
				<div className='spinner'></div>
			</div>
		);
	}

	return (
		<div className='dashboard-page'>
			<div className='dashboard-header'>
				<div className='header-content'>
					<h1>My Dashboard</h1>
					<div className='header-actions'>
						<button onClick={logout} className='logout-button'>
							Logout
						</button>
					</div>
				</div>
			</div>

			<div className='dashboard-container'>
				<div className='welcome-section'>
					<h2>Welcome back, {user?.email}!</h2>
					<p>Manage your Positive Postcards subscriptions below</p>
				</div>

				{subscriptions.length === 0 ? (
					<div className='no-subscriptions'>
						<p>You don't have any active subscriptions yet.</p>
						<button
							onClick={() => navigate('/')}
							className='cta-button'>
							Start Your Journey
						</button>
					</div>
				) : (
					<div className='subscriptions-grid'>
						{subscriptions.map((subscription) => {
							const status = getSubscriptionStatus(subscription);
							const price = subscription.items.data[0]?.price;

							return (
								<div
									key={subscription.id}
									className='subscription-card'>
									<div className='subscription-header'>
										<h3>Positive Postcards Subscription</h3>
										<span
											className={`status-badge ${status.class}`}>
											{status.label}
										</span>
									</div>

									<div className='subscription-details'>
										<div className='detail-row'>
											<span>Plan:</span>
											<span>
												$
												{(
													price.unit_amount / 100
												).toFixed(2)}{' '}
												/ {price.recurring.interval}
											</span>
										</div>
										<div className='detail-row'>
											<span>Next billing date:</span>
											<span>
												{formatDate(
													subscription.current_period_end
												)}
											</span>
										</div>
										{subscription.pause_collection
											?.resumes_at && (
											<div className='detail-row'>
												<span>Resumes on:</span>
												<span>
													{formatDate(
														subscription
															.pause_collection
															.resumes_at
													)}
												</span>
											</div>
										)}
									</div>

									<div className='subscription-actions'>
										{subscription.pause_collection ? (
											<button
												onClick={() =>
													handleResumeSubscription(
														subscription.id
													)
												}
												className='action-button resume'>
												Resume Subscription
											</button>
										) : (
											!subscription.cancel_at_period_end && (
												<button
													onClick={() => {
														setSelectedSubscription(
															subscription.id
														);
														setShowPauseModal(true);
													}}
													className='action-button pause'>
													Pause Subscription
												</button>
											)
										)}
										<button
											onClick={handleBillingPortal}
											className='action-button portal'>
											Manage Billing
										</button>
									</div>
								</div>
							);
						})}
					</div>
				)}

				<div className='billing-portal-section'>
					<h3>Billing & Payment</h3>
					<p>Access Stripe's secure billing portal to:</p>
					<ul>
						<li>Update payment method</li>
						<li>View billing history & download invoices</li>
						<li>Cancel subscription</li>
						<li>Update billing address</li>
					</ul>
					<button
						onClick={handleBillingPortal}
						className='portal-button'>
						Open Billing Portal
					</button>
				</div>
			</div>

			{showPauseModal && (
				<div
					className='modal-overlay'
					onClick={() => setShowPauseModal(false)}>
					<div
						className='modal-content'
						onClick={(e) => e.stopPropagation()}>
						<h3>Pause Subscription</h3>
						<p>
							Going on vacation? You can pause your subscription
							and resume it later.
						</p>

						<div className='form-group'>
							<label>Resume date (optional):</label>
							<input
								type='date'
								value={pauseDate}
								onChange={(e) => setPauseDate(e.target.value)}
								min={new Date().toISOString().split('T')[0]}
								className='date-input'
							/>
							<small>Leave empty to resume manually</small>
						</div>

						<div className='modal-actions'>
							<button
								onClick={handlePauseSubscription}
								className='confirm-button'>
								Pause Subscription
							</button>
							<button
								onClick={() => setShowPauseModal(false)}
								className='cancel-button'>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Dashboard;
