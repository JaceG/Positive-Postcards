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
				id: string;
				unit_amount: number;
				currency: string;
				recurring: {
					interval: string;
					interval_count?: number;
				};
				nickname?: string;
			};
		}>;
	};
}

interface Plan {
	id: string;
	name: string;
	price: number;
	interval: string;
	duration: number;
	description: string;
	popular: boolean;
	savings?: string;
	features: string[];
	stripePriceId: string | null;
	pricePerMonth?: number;
}

interface PlanChangePreview {
	changeType: 'upgrade' | 'downgrade';
	currentPrice: number;
	newPrice: number;
	priceDifference: number;
	amountDueNow: number;
	subtotal: number;
	total: number;
	nextBillingDate: string;
	lineItems: Array<{
		description: string;
		amount: number;
		proration: boolean;
	}>;
}

const Dashboard: React.FC = () => {
	const navigate = useNavigate();
	const { user, sessionToken, logout, isLoading: authLoading } = useAuth();
	const [loading, setLoading] = useState(true);
	const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
	const [showPauseModal, setShowPauseModal] = useState(false);
	const [pauseDate, setPauseDate] = useState('');
	const [selectedSubscription, setSelectedSubscription] = useState<
		string | null
	>(null);
	
	// Plan management state
	const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
	const [showPlanModal, setShowPlanModal] = useState(false);
	const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
	const [planChangePreview, setPlanChangePreview] = useState<PlanChangePreview | null>(null);
	const [changingPlan, setChangingPlan] = useState(false);
	const [planError, setPlanError] = useState<string | null>(null);

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

	const fetchAvailablePlans = useCallback(async () => {
		try {
			const response = await fetch(
				`${process.env.REACT_APP_API_URL}/api/subscription/plans`,
				{
					headers: {
						Authorization: `Bearer ${sessionToken}`,
					},
				}
			);

			if (response.ok) {
				const data = await response.json();
				setAvailablePlans(data.plans || []);
			}
		} catch (error) {
			console.error('Error fetching plans:', error);
		}
	}, [sessionToken]);

	useEffect(() => {
		// Wait for auth state to load before checking session
		if (authLoading) {
			return;
		}
		
		if (!sessionToken) {
			navigate('/login');
			return;
		}

		fetchDashboardData();
		fetchAvailablePlans();
	}, [authLoading, sessionToken, navigate, logout, fetchDashboardData, fetchAvailablePlans]);

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

	// Plan change functions
	const handleOpenPlanModal = (subscription: Subscription) => {
		setSelectedSubscription(subscription.id);
		setShowPlanModal(true);
		setPlanChangePreview(null);
		setSelectedPlan(null);
		setPlanError(null);
	};

	const handleSelectPlan = async (plan: Plan) => {
		if (!selectedSubscription || !plan.stripePriceId) return;
		
		setSelectedPlan(plan);
		setPlanError(null);
		
		try {
			const response = await fetch(
				`${process.env.REACT_APP_API_URL}/api/subscription/preview-change`,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${sessionToken}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						subscriptionId: selectedSubscription,
						newPriceId: plan.stripePriceId,
					}),
				}
			);

			if (response.ok) {
				const data = await response.json();
				setPlanChangePreview(data.preview);
			} else {
				const error = await response.json();
				setPlanError(error.error || 'Failed to preview plan change');
			}
		} catch (error) {
			console.error('Error previewing plan change:', error);
			setPlanError('Failed to preview plan change');
		}
	};

	const handleConfirmPlanChange = async () => {
		if (!selectedSubscription || !selectedPlan?.stripePriceId) return;
		
		setChangingPlan(true);
		setPlanError(null);
		
		try {
			const response = await fetch(
				`${process.env.REACT_APP_API_URL}/api/subscription/change-plan`,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${sessionToken}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						subscriptionId: selectedSubscription,
						newPriceId: selectedPlan.stripePriceId,
					}),
				}
			);

			if (response.ok) {
				setShowPlanModal(false);
				setSelectedPlan(null);
				setPlanChangePreview(null);
				fetchDashboardData();
			} else {
				const error = await response.json();
				setPlanError(error.error || 'Failed to change plan');
			}
		} catch (error) {
			console.error('Error changing plan:', error);
			setPlanError('Failed to change plan');
		} finally {
			setChangingPlan(false);
		}
	};

	const handleReactivateSubscription = async (subscriptionId: string) => {
		try {
			const response = await fetch(
				`${process.env.REACT_APP_API_URL}/api/subscription/reactivate`,
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
			console.error('Error reactivating subscription:', error);
		}
	};

	const getCurrentPlanId = (subscription: Subscription): string => {
		const price = subscription.items.data[0]?.price;
		if (price?.nickname) return price.nickname;
		if (price?.recurring?.interval === 'year') return 'annual';
		if (price?.recurring?.interval_count === 3) return 'quarterly';
		return 'monthly';
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

	if (authLoading || loading) {
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
										{subscription.cancel_at_period_end ? (
											<button
												onClick={() =>
													handleReactivateSubscription(
														subscription.id
													)
												}
												className='action-button reactivate'>
												Reactivate Subscription
											</button>
										) : subscription.pause_collection ? (
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
											<>
												<button
													onClick={() =>
														handleOpenPlanModal(subscription)
													}
													className='action-button change-plan'>
													Change Plan
												</button>
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
											</>
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

			{/* Plan Change Modal */}
			{showPlanModal && (
				<div
					className='modal-overlay'
					onClick={() => setShowPlanModal(false)}>
					<div
						className='modal-content plan-modal'
						onClick={(e) => e.stopPropagation()}>
						<h3>Change Your Plan</h3>
						<p>Select a new plan to upgrade or downgrade your subscription.</p>

						{planError && (
							<div className='plan-error'>
								{planError}
							</div>
						)}

						<div className='plans-grid'>
							{availablePlans
								.filter(plan => plan.id !== 'trial') // Don't show trial for existing subscribers
								.map((plan) => {
									const currentSubscription = subscriptions.find(
										s => s.id === selectedSubscription
									);
									const currentPlanId = currentSubscription 
										? getCurrentPlanId(currentSubscription)
										: null;
									const isCurrentPlan = plan.id === currentPlanId;
									const isSelected = selectedPlan?.id === plan.id;

									return (
										<div
											key={plan.id}
											className={`plan-option ${isSelected ? 'selected' : ''} ${isCurrentPlan ? 'current' : ''} ${plan.popular ? 'popular' : ''}`}
											onClick={() => !isCurrentPlan && plan.stripePriceId && handleSelectPlan(plan)}>
											{plan.popular && (
												<span className='popular-badge'>Best Value</span>
											)}
											{isCurrentPlan && (
												<span className='current-badge'>Current Plan</span>
											)}
											<h4>{plan.name}</h4>
											<div className='plan-price'>
												<span className='amount'>${plan.price}</span>
												<span className='interval'>/{plan.interval}</span>
											</div>
											{plan.pricePerMonth && (
												<p className='price-per-month'>
													${plan.pricePerMonth}/month
												</p>
											)}
											{plan.savings && (
												<span className='savings-badge'>Save {plan.savings}</span>
											)}
											<ul className='plan-features'>
												{plan.features.map((feature, idx) => (
													<li key={idx}>{feature}</li>
												))}
											</ul>
											{!plan.stripePriceId && (
												<p className='plan-unavailable'>Not available</p>
											)}
										</div>
									);
								})}
						</div>

						{/* Proration Preview */}
						{planChangePreview && selectedPlan && (
							<div className='proration-preview'>
								<h4>
									{planChangePreview.changeType === 'upgrade' ? '⬆️ Upgrade' : '⬇️ Downgrade'} Preview
								</h4>
								<div className='preview-details'>
									<div className='preview-row'>
										<span>Current plan:</span>
										<span>${planChangePreview.currentPrice}/month</span>
									</div>
									<div className='preview-row'>
										<span>New plan:</span>
										<span>${planChangePreview.newPrice}/{selectedPlan.interval}</span>
									</div>
									<div className='preview-row highlight'>
										<span>Amount due today:</span>
										<span>${planChangePreview.amountDueNow.toFixed(2)}</span>
									</div>
									{planChangePreview.lineItems.length > 0 && (
										<div className='line-items'>
											<p>Proration details:</p>
											{planChangePreview.lineItems.map((item, idx) => (
												<div key={idx} className='line-item'>
													<span>{item.description}</span>
													<span>${item.amount.toFixed(2)}</span>
												</div>
											))}
										</div>
									)}
								</div>
							</div>
						)}

						<div className='modal-actions'>
							<button
								onClick={handleConfirmPlanChange}
								disabled={!selectedPlan || changingPlan}
								className='confirm-button'>
								{changingPlan ? 'Processing...' : 
									planChangePreview?.changeType === 'upgrade' 
										? 'Confirm Upgrade' 
										: 'Confirm Change'}
							</button>
							<button
								onClick={() => {
									setShowPlanModal(false);
									setSelectedPlan(null);
									setPlanChangePreview(null);
									setPlanError(null);
								}}
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
